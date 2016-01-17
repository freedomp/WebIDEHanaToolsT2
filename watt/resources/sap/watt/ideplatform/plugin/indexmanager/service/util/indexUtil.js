define([
	"./remoteDocUtil",
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
	"sap/watt/lib/orion/javascript/esprima/esprimaJsContentAssist"
	], function(mRemoteDocUtil, mVisitor, mJSContentAssist) {
	"use strict";

	var _INDEX_ROOT_FOLDER = "/.indexes";
	var _INDEX_FILE_SUPPORTED = "js";
	var _INDEX_FILE_EXTENSION = "index";

	/**
	 * @public
	 */
	function isSupported(fileExt) {
		return fileExt && fileExt.toLowerCase() === _INDEX_FILE_SUPPORTED;
	}

	/**
	 * e.g. '/sample_fiori/view/s1.js' -> '/sample_fiori+[_INDEX_ROOT_FOLDER]/view/s1.index'
	 * @public
	 */
	function getIndexPath(docFullPath) {
		var projectPath = getProjectPath(docFullPath);
		if (docFullPath && projectPath) {
			var docPath = docFullPath.substring(projectPath.length);
			if (docPath) {
				var pos = docPath.lastIndexOf('.');
				if (pos > 0) {
					var docTitle = docPath.substring(0, pos);
					if (docTitle) {
						return projectPath + _INDEX_ROOT_FOLDER + docTitle + "." + _INDEX_FILE_EXTENSION;
					}
				} else { // is a folder
					return projectPath + _INDEX_ROOT_FOLDER + docPath;
				}
			}
		}
	}

	/**
	 * get timestamp of the document
	 * @public
	 */
	function getTimestamp(docFullPath) {
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}

		return this.remoteDocUtil.getDocumentMetadata(docFullPath).then(function(docMetadata) {
			if (!docMetadata) {
				return Q(0);
			} else {
				return Q(docMetadata.changedOn);
			}
		}).fail(function(){
			return Q();
		});
	}

	/**
	 * generate index json using specific js file content
	 * @public
	 */
	function generateIndexJson(docFullPath) {
		var that = this;
		if (!docFullPath) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}
		
		var remoteDocUtil = this.remoteDocUtil;
		return remoteDocUtil.loadDocument(docFullPath).then(function(content) {
			content = content || "";

			var jsCA = new mJSContentAssist.EsprimaJavaScriptContentAssistProvider( /* indexer, lintOptions */);
			return jsCA.computeSummary(content, docFullPath).then(function(indexJson) {
				return remoteDocUtil.getDocumentMetadata(docFullPath).then(function(metadata) {
					if (indexJson && metadata) {
						indexJson.changedOn = metadata.changedOn; // append document changedon timestamp to index file
					}
					return Q(indexJson);
				});
			});
		}).fail(function(error) {
			// Check if external dependency
			return that._summaryFromMetaProvider.getSummaryFromMeta(docFullPath).then(function(indexJson) {
				if (!indexJson) {
					console.log("Document " + docFullPath + " out of scope");
					return {};	
				}
				return indexJson;
			}).fail(function(oError) {
				console.log(oError.message);
				return {};		
			});
		});
	}
	
	/**
	 * search dependencies from ast tree
	 * return the dependencies in project folder, without recursive
	 * @public
	 */
	function searchDependenciesFromAST(dependencyID, docFullPath, astRoot, moduleMapper) {
		var visitInfo = visitSearchFromAST(astRoot, dependencyID);
		if (!visitInfo || !visitInfo.require || visitInfo.require.length === 0) {
			return Q([]);
		}
		return getDependenciesFromRequire.call(this, docFullPath, visitInfo, this.remoteDocUtil, this.i18n, moduleMapper);
	}

	/**
	 * search dependencies of specif js file, identify dependency by 'jQuery.sap.require' or 'sap.ui.define'
	 * 1. return only the dependencies in project folder, e.g. require 'sap.m.MessageBox' should be filtered out
	 * 2. return the dependencies in recursive
	 * @public
	 */
	function searchDependencies(dependencyID, docFullPath, moduleMapper) {
		var remoteDocUtil = this.remoteDocUtil;
		var that = this;
		var i18n = this.i18n;
		return remoteDocUtil.loadDocument(docFullPath).then(function(content) {
			var visitInfo = visitSearch(content, dependencyID);
			if (!visitInfo || !visitInfo.require || visitInfo.require.length === 0) {
				return Q([]);
			}
			return getDependenciesFromRequire.call(that, docFullPath, visitInfo, remoteDocUtil, i18n, moduleMapper);
		});
	}

	function sapDeclareVisitor(node, visitInfo) {

		if (node.type === "CallExpression" && node.callee && node.arguments) {
			var callee = node.callee;
			var calleeProperty = callee.property;
			if (calleeProperty && calleeProperty.type === "Identifier" && calleeProperty.name === "declare") {
				var owner = callee;

				var fullName = "declare";
				while (owner.object) {
					if (owner.object.property) {
						fullName = owner.object.property.name + '.' + fullName;
					} else {
						fullName = owner.object.name + '.' + fullName;
					}
					owner = owner.object;
				}

				if (fullName === visitInfo.id) {
					var args = node.arguments;
					if (args.length > 0) {
						var declarations = [];
						if (args[0].value) {
							declarations.push(args[0]);
						}
						if (declarations && declarations.length > 0) {
							declarations.forEach(function(declarations) {
								visitInfo.declare.push(declarations.value);
							});
						}
						//console.debug(fullName + ": " + dependency);
						return false;
					}
				}

			}

		}

		return true;
	}

	var _visitDeclare = function(module) {
		return module.getContent().then(function(moduleSrc) {
			var astRoot = mVisitor.parse(moduleSrc);
			var declInfo = {
				fullPath: module.getEntity().getFullPath(),
				id: "jQuery.sap.declare",
				declare: []
			};
			mVisitor.visit(astRoot, declInfo, sapDeclareVisitor);
			return declInfo;
		});

	};

	/*function _getDeclared(oDocument) {
		if (oDocument.isProject()) {
			return null;
		}
		
		var aModules = [];
		var aModuleMap = {};
		return oDocument.getProject().then(function(oFolder) {
			return oFolder.getFolderContent().then(function(aFolderContent) {
				aModules = aFolderContent.filter(function(oProjDocument) {
					return oProjDocument.getEntity().getFileExtension() === "js";
				});
				//var aSapDeclare = [];
				var aParsPromises = [];
				for (var jsInd = 0; jsInd < aModules.length; jsInd++) {
					var oModule = aModules[jsInd];
					aParsPromises.push(_visitDeclare(oModule));
				}

				return Q.all(aParsPromises).then(function(aInfo) {
					for (var ii = 0; ii < aInfo.length; ii++) {
						var declInfo = aInfo[ii];
						oModule = aModules[ii];
						for (var dc = 0; dc < declInfo.declare.length; dc++) {
							aModuleMap[declInfo.declare[dc]] = oModule.getEntity().getFullPath();
						}
					}

					return aModuleMap;

				});
			});
		});
	}*/
	
	function getModule(docEntity, regex) {
		if (!docEntity || !docEntity.getFullPath() ) {
			var errMessage = this.i18n.getText("i18n", "log_emptypath");
			return Q.reject(new Error(errMessage));
		}

		var remoteDocUtil = this.remoteDocUtil;
		var declRegex = regex; // /jQuery\.sap\.declare\(".+"\);/i;
		var moduleIdRegex = /".+"/i;
		var modulePath = docEntity.getFullPath();

		return remoteDocUtil.loadDocument(modulePath).then(function(content) {
			content = content || "";
			var aDecl = declRegex.exec(content);
			if ( aDecl && aDecl[0]) {
				var aId = moduleIdRegex.exec(aDecl[0]);
				if ( aId && aId[0]) {
					var entryMap = { id: aId[0].substring(1, aId[0].length - 1), path: modulePath };
					return Q(entryMap);
				} else {
					return Q.reject();
				}
			} else {
				return Q.reject();
			}	
		}).fail(function(error) {
			modulePath = docEntity.getFullPath();
			console.log("Document " + modulePath + " out of scope " + error);
			return Q({ id: "Unknown " + modulePath, path: modulePath });
			//return Q.reject(error);
		});
	}
	
	function mapProjectModules(sProjectPath) {

		function _findDecl(oModule) {
		    var declRegex = /jQuery\.sap\.declare\(".+"\);/i;
		    var moduleIdRegex = /".+"/i;
		    return oModule.getContent().then(function(cont) {
		        var aDecl = declRegex.exec(cont);
		        if ( aDecl && aDecl[0]) {
		            var aId = moduleIdRegex.exec(aDecl[0]);
		            if ( aId && aId[0]) {
		                return aId[0].substring(1, aId[0].length - 1);
		            } else {
		                return Q.reject();
		            }
		        } else {
		            return Q.reject();
		        }
		    }).fail();
		}
	
		var deferProjModules = Q.defer();
		
		var oCriteria = {
			bContentSearch: true,
			nStart: 0,
			nRows: 999,
			sFileType: "*.js",
			sFolderName: sProjectPath + "/",
			sSearchTerm: "jQuery.sap.declare"
		};
		var aModules = [];
		var aModuleContPromise = [];
		var oModuleMap = {};

        this._docProvider.search(oCriteria).then(function(oSearchResults){
			oSearchResults.aFileEntries.forEach(function(oModule) {
				aModules.push(oModule);
            	aModuleContPromise.push(_findDecl(oModule));
			});
            return Q.allSettled(aModuleContPromise).then(function(aModIdRes) {
                for ( var r = 0; r < aModIdRes.length; r++) {
                    var res = aModIdRes[r];
                    if ( res.state === "fulfilled" ) {
                        oModuleMap[aModules[r].getEntity().getFullPath()] = res.value;
                    }
                }
                deferProjModules.resolve(oModuleMap);
            });

        }).fail(function() { 
        	deferProjModules.reject("Search error"); 
        }).done();
        
        return deferProjModules.promise;
	}

	/**
	 * get dependencies from require list
	 * @private
	 */
	function getDependenciesFromRequire(docFullPath, requireInfo, remoteDocUtil, i18n, oModuleMap) {
	    var that = this;
	    if ( !requireInfo || !requireInfo.require || requireInfo.require.length === 0) {
	    	return Q([]);
	    }
	    var requireList = requireInfo.require;
		return getProjectPath.call(this, docFullPath).then(function(projectFolder) {
    		if (!projectFolder) {
    			var errMessage = i18n.getText("i18n", "log_invalidpath", [docFullPath]);
    			return Q.reject(new Error(errMessage));
    		}
    		
    		return that._docProvider.getDocument(docFullPath).then(function(oDoc){
            		var promises = [];
            		for (var i in requireList) {
            			var fileID = requireList[i];
            			if (fileID) {
            				if ( requireInfo.id === "jQuery.sap.require" ) {
            					promises.push(that._getFilePathFromID(projectFolder, fileID, remoteDocUtil, oModuleMap));
            				} else { //requireInfo.id === "sap.ui.define"
            					//promises.push(that._getFilePathRelative(projectFolder, docFullPath, fileID, remoteDocUtil));
        						promises.push(that._getFilePathFromUI5DefineDependency(projectFolder, docFullPath, fileID));
            				}
            			}
            		}
            		
            		return Q.all(promises).then(function(fullPaths) {
            			var dependencies = [];
            			for (var i in fullPaths) {
            				var fullPath = fullPaths[i];
            				if (fullPath && !that._isArrayContains(dependencies, fullPath)) {
            					dependencies.push(fullPath);
            				}
            			}
            			return Q(dependencies);
            		}).fail(function(error) {
            			return Q.reject(error);
            		});
    		        
    		});
		    
		});
		
	}

	/**
	 * e.g. '/sample_fiori/view/s1.js' -> '/sample_fiori'
	 * @private
	 */
	function getProjectPath(sDocumentPath) {
		var docProvider = this._docProvider;
		return docProvider.getDocument(sDocumentPath).then(function(oDocument) {
			if (oDocument) {
				return oDocument.getProject().then(function(oProjDocument){
					return oProjDocument.getEntity().getFullPath();
				});
			}
			
			return Q.reject(sDocumentPath + " - not found");
		}).fail(function(error) {
			console.log("Deleted document " + error);
			var aDocPath = sDocumentPath.split("/");
			return "/" + aDocPath[1];
		});

	}

	/**
	 * return the file path belong to current folder from given file id
	 * e.g.
	 * case 1: /project, view.s1 -> /project/view/s1.js,
	 * case 2: /project, view.s1.controller -> /project/view/s1.controller.js (does exist in project), instead /project/view/s1/controller.js (not exist in project)
	 * @private
	 */
	function getFilePathFromID(projectFolder, fileID, remoteDocUtil, sapDeclMap) {
		if (!fileID) {
			return Q();
		}
		
		if( sapDeclMap ) {
    		var sMapped = sapDeclMap[fileID];
    		if (sMapped) {
    		    return Q(sMapped);
    		}
		}

		if (fileID.charAt(0) === '.' || fileID.split('.').length === 0) {
			return Q();
		} else {
			if ( ("/" + fileID).indexOf(projectFolder + '.') === 0 ) {
				var sRelative = fileID.substring(projectFolder.length - 1);
				sMapped = projectFolder + "/src/main/webapp" + sRelative.replace(/\./g,'/') + ".js";
				return this.remoteDocUtil.docProvider.getDocument(sMapped).then(function(oDocMeta) {
					return oDocMeta ? Q(sMapped) : Q();
				}); 
			}
			return Q();
		}
		return Q();

	}
	
	function ui5ProjectNamespaceVisitor(node, visitInfo) {
		if (node.type === "ReturnStatement" && node.argument && node.argument.callee && node.argument.arguments) {
			var callee = node.argument.callee;
			var args = node.argument.arguments;
			if (callee.property && callee.property.type === "Identifier" && callee.property.name === "extend"
				&& args[0] && args[0].type === "Literal") {
				
				var sValue = args[0].value;
				// Remove ".Component" from the end
				visitInfo.namespace = sValue.substr(0, sValue.lastIndexOf("."));
				return false;
			}
		}
		return true;
	}

/*	var _visitDeclare = function(module) {
		return module.getContent().then(function(moduleSrc) {
			var astRoot = mVisitor.parse(moduleSrc);
			var declInfo = {
				fullPath: module.getEntity().getFullPath(),
				id: "jQuery.sap.declare",
				declare: []
			};
			mVisitor.visit(astRoot, declInfo, sapDeclareVisitor);
			return declInfo;
		});

	};*/
	
	function getUI5ProjectInfo(projectFolder) {
		if (!projectFolder) {
			return Q();
		}
		// Check if we have namespace in cache
		if (!this._projectInfo[projectFolder]) {
			// Search component.js in project, if not found return Q() (there could be multiple component.js, for now with are not handling this case)
			var oSearchCriteria = {
				nRows: 1,
				nStart: 0,
				sFileType: "*.js",
				sFolderName: projectFolder + "/",
				sSearchTerm: "Component"
			};
			this._projectInfo[projectFolder] = this.remoteDocUtil.docProvider.search(oSearchCriteria).then(function(oSearchResults) {
				if (oSearchResults && oSearchResults.numFound > 0) {
					var oComponentDoc = oSearchResults.aFileEntries[0];
					return oComponentDoc.getContent().then(function(oComponentContent) {
						try {
							var oComponentAST = mVisitor.parse(oComponentContent);
							var oNamespaceInfo = {namespace: ""};
							mVisitor.visit(oComponentAST, oNamespaceInfo, ui5ProjectNamespaceVisitor);
							if (!oNamespaceInfo.namespace) {
								return null;
							}
							var sNamespace = oNamespaceInfo.namespace.replace(/\./g, "/");
							//var sNamespace = oComponentAST.body[0].expression.arguments[1].body.body[1].argument.arguments[0].value.replace(".Component", "");
							//sNamespace = sNamespace.replace(/\./g, "/");
							var sComponentPath = oComponentDoc.getEntity().getFullPath();
							var sRootPath = sComponentPath.slice(0, sComponentPath.lastIndexOf("/"));
							return { 
								namespace: sNamespace, 
								rootPath: sRootPath
							};
						} catch(err) {
							return null;
						}
					}); 
				}
			}).fail(function() {
				return Q();
			});
		}
		return this._projectInfo[projectFolder];
	}

	/**
	 * return the file path belong to current folder from given file id
	 * e.g.
	 * case 1: /project, view.s1 -> /project/view/s1.js,
	 * case 2: /project, view.s1.controller -> /project/view/s1.controller.js (does exist in project), instead /project/view/s1/controller.js (not exist in project)
	 * @private
	 */
	function getFilePathFromUI5DefineDependency(projectFolder, docFullPath, filePath) {
		if (!filePath) {
			return Q();
		}
		
		if (filePath.charAt(0) === '.' ) {
			var relUri = new URI(filePath);
			return Q(relUri.absoluteTo(docFullPath).toString() + ".js");
		} else { //Absolute path
			return this.getUI5ProjectInfo(projectFolder).then(function(oProjectInfo) {
				if (!oProjectInfo) {
					return;
				}	
				// Replace each '.' in namespace with '/'
				var sProjectNamespace = oProjectInfo.namespace;
				// Check if the dependency starts with the project namespace - if not it is out of scope
				if (filePath.slice(0, sProjectNamespace.length) === sProjectNamespace) {
					return oProjectInfo.rootPath + filePath.slice(oProjectInfo.namespace.length) + ".js";
				}
				return filePath; // external dependency(ui5 library or reuse library)
			});
		}
	}
	
	function relPathToAbs(base, relative) {
		var stack = base.split("/"),
			parts = relative.split("/");
		stack.pop(); // remove current file name (or empty string)
		// (omit if "base" is the current folder without trailing slash)
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] === ".") {
				continue;
			}
			if (parts[i] === "..") {
				stack.pop();
			} else {
				stack.push(parts[i]);
			}
		}
		return stack.join("/");
	}

	/**
	 * check if the file exists in given folder
	 * @private
	 */
	function checkFileExists(docFullPath, requireId, fileID) {
		var that = this;
		if (requireId === "jQuery.sap.require") {
			return getProjectPath(docFullPath).then(function(folderPath) {
    			var sSearchTerm = "jQuery.sap.declare(" + "\"" + fileID + "\")";
    			var oSearchCriteria = {
    				bContentSearch: true,
    				nRows: 10,
    				nStart: 0,
    				sFileType: "*.js",
    				sFolderName: folderPath + "/",
    				sSearchTerm: sSearchTerm
    			};
    
    			return that.remoteDocUtil.docProvider.search(oSearchCriteria).then(function(oSearchResults) {
					if (oSearchResults && oSearchResults.numFound > 0) {
    					var promises = [];
    					oSearchResults.aFileEntries.forEach(function(oDocument) {
    						promises.push(_visitDeclare(oDocument));
    					});
    					return Q.all(promises).then(function(aDeclInfo) {
    						var sFullPath = null;
    						aDeclInfo.forEach(function(oDeclInfo) {
    							sFullPath = oDeclInfo.fullPath ? oDeclInfo.fullPath : sFullPath;
    						});
    						return sFullPath;
    					});
    				} 
					return false; 
    			});
			});
		} else if (requireId === "require") {
			var fullPath = relPathToAbs(docFullPath, fileID) + ".js";
			return this.remoteDocUtil.docProvider.getDocument(fullPath).then(function(oDocument) {
				if (oDocument) {
					return Q(fullPath);
				} else {
					return Q(false);
				}
			});
		}
	}

	/**
	 * e.g. '/sample_fiori' & '/sample_fiori/view/s1.view.js' -> 'view.s1.view'
	 * @private
	 */
	function getFileIDFromPath(projectPath, filePath) {
		if (projectPath && filePath) {
			projectPath += '/';
			var pos = filePath.indexOf(projectPath);
			if (pos === 0) {
				var shortPath = filePath.substring(projectPath.length);
				if (shortPath) {
					pos = shortPath.lastIndexOf(".js");
					if (pos > 0) {
						shortPath = shortPath.substring(0, pos);
						if (shortPath) {
							return shortPath.replace(/\//g, '.');
						}
					}
				}
			}
		}
	}

	/**
	 * @private
	 */
	function getFileExt(fullPath) {
		if (fullPath) {
			var pos = fullPath.lastIndexOf('.');
			if (pos >= 0) {
				return fullPath.substring(pos + 1);
			}
		}
	}

	/**
	 * search content using ast tree
	 * @private
	 */
	function visitSearch(content, id) {
		try {
			var ast = mVisitor.parse(content);
			return visitSearchFromAST(ast, id);

		} catch (error) {
			console.warn(error);
		}
	}

	/**
	 * search content using ast tree
	 * @private
	 */
	function visitSearchFromAST(ast, id) {
		try {
			var visitInfo = {
				id: id,
				require: []
			};
			mVisitor.visit(ast, visitInfo, requireVisitor);
			return visitInfo;
		} catch (error) {
			console.warn(error);
		}
	}

	/**
	 * customized visitor for the 'require' identifier, such as: jQuery.sap.require
	 * @private
	 */
	function requireVisitor(node, visitInfo) {
		if (node.type === "CallExpression" && node.callee && node.arguments) {
			var callee = node.callee;


			var calleeProperty = callee.property;
			var calleeName = callee.name;

			var fullName = null;
			if ( calleeName === "define" || ( calleeProperty && calleeProperty.name === "define" ) ) {
				fullName = "define";
			} else if ( calleeName === "require" || ( calleeProperty && calleeProperty.name === "require" ) ) {
				fullName = "require";
			} else {
				return true;
			}

			var owner = callee;
			while (owner.object) {
				if (owner.object.property) {
					fullName = owner.object.property.name + '.' + fullName;
				} else {
					fullName = owner.object.name + '.' + fullName;
				}
				owner = owner.object;
			}

			if (fullName === visitInfo.id) {
				var args = node.arguments;
				if (args.length > 0) {
					var dependencies = [];
					if (args[0].type === "ArrayExpression" && args[0].elements) {
						// define's 1st arg
						dependencies = args[0].elements;
					} else {
						for ( var iArg = 0; iArg < args.length; iArg++) {
							var sArg = args[iArg];
							if ( sArg.type === "Literal" && sArg.value ) {
								dependencies.push(sArg);
							}
						}

					}
					if (dependencies && dependencies.length > 0) {
						dependencies.forEach(function(dependency) {
							visitInfo.require.push(dependency.value);
						});
					}
					//console.debug(fullName + ": " + dependency);
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * @private
	 */
	function isArrayContains(array, element) {
		for (var i in array) {
			if (array[i] === element) {
				return true;
			}
		}
		return false;
	}

	function IndexUtil(docProvider, i18n, summaryFromMetaProvider) {
		if (!docProvider || !i18n) {
			throw new Error();
		}

		this._docProvider = docProvider;
		//this._getDeclared = _getDeclared;
		this._visitDeclare = _visitDeclare;
		this._getFilePathFromID = getFilePathFromID;
		this._getFilePathFromUI5DefineDependency = getFilePathFromUI5DefineDependency;
		this._isArrayContains = isArrayContains;
		this._mapProjectModules = mapProjectModules;
		this.remoteDocUtil = new mRemoteDocUtil.RemoteDocUtil(docProvider, i18n);
		this.i18n = i18n;
		this._projectInfo = {};
		this._summaryFromMetaProvider = summaryFromMetaProvider;
	}

	IndexUtil.prototype = {
		isSupported: isSupported,
		getModule: getModule,
		getIndexPath: getIndexPath,
		getTimestamp: getTimestamp,
		searchDependencies: searchDependencies,
		searchDependenciesFromAST: searchDependenciesFromAST,
		generateIndexJson: generateIndexJson,
		mapProjectModules: mapProjectModules,
		getProjectPath: getProjectPath,
		getUI5ProjectInfo: getUI5ProjectInfo
	};

	return {
		IndexUtil: IndexUtil
	};
});