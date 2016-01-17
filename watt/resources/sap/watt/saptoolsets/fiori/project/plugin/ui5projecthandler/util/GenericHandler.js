define(["sap/watt/lib/lodash/lodash",
		"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
		"sap/watt/lib/orion/ui/esprima/esprima",
		"sap/watt/lib/orion/ui/escodegen/escodegen.browser" ],
	function(_, mVisitor) {
		"use strict";

		var _getHandlerFilePath = function(oHandlerDocument){
			var sFullPath = oHandlerDocument.getEntity().getFullPath();
			var index = sFullPath.lastIndexOf("/");
			return sFullPath.substr(0, index);
		};

		var _getHandlerNamespace = function(oHandlerDocument, sFileName) {
			return oHandlerDocument.getContent().then(function(sHandlerContent){
				return _getNamespace(sHandlerContent, sFileName);
			});
		};

		var _getProject = function(oDocument){
			return oDocument.getProject();
		};

		var _getAppComponent = function(oProjectDocument, aProjMetadataContent, sHandlerName, oContext){
			if (!oProjectDocument) {
				Q.reject(new Error(this.context.i18n.getText("i18n", "projectHandler_noProjectSelected")));//"No project selected");
			}

			// In case the project is buildable - returns the component file which is not in under target build project
			var aHandlerMetadataFiles = _.filter(aProjMetadataContent, function(oElement) {
				return oElement.name === sHandlerName;
			});
			return oContext.service.builder.getTargetFolder(oProjectDocument)
				.then(function (oTargetFolder) {
					// Build issue workaround when src and target are the same
					if (oTargetFolder !== oProjectDocument) {
						var sTextKey = "projectHandler_failFindDescFile";
						var sErrorName = "projectHandler_failFindDescFile";
						aHandlerMetadataFiles = _removeHandlerFilesUnderTargetBuildFolder(oTargetFolder,
							aHandlerMetadataFiles, oContext, sTextKey, sErrorName);
					}
					return _getTopComponentDoc(aHandlerMetadataFiles, oContext);
				})
				// Not buildable project
				.fail(function(){
					return _getTopComponentDoc(aHandlerMetadataFiles, oContext);
				});
		};

		var _getNamespace = function(fileContent, sFileName){
			var sFileNameUntilDot = sFileName.substr(0, sFileName.length - 3);
			var tempNamespace = null;

			// search the namespace in the old fashioned way (old Fiori template)

			// using regex to include cases in which there are spaces
			var regex = /\.declare\s*\(\s*/;

			// search for the ".declare" string and get its index
			var indexOfDeclare = fileContent.search(regex);

			if (indexOfDeclare !== -1) {
				// get the index of " that comes right after the ".declare"
				var indexOfDoubleQuote = fileContent.indexOf("\"", indexOfDeclare);
				var indexOfDot;

				if (indexOfDoubleQuote !== -1) {
					// get the index of the "." that is right after the namespace
					indexOfDot = fileContent.indexOf("." + sFileNameUntilDot, indexOfDoubleQuote);

					if (indexOfDot !== -1) {
						// get the namespace
						tempNamespace = fileContent.substring(indexOfDoubleQuote + 1, indexOfDot);
					}
				} else {
					// Look for single quote in decalre row
					var indexOfQuote = fileContent.indexOf("\'", indexOfDeclare);

					if (indexOfQuote !== -1) {
						// get the index of the "." that is right after the namespace
						indexOfDot = fileContent.indexOf("." + sFileNameUntilDot, indexOfQuote);

						if (indexOfDot !== -1) {
							// get the namespace
							tempNamespace = fileContent.substring(indexOfQuote + 1, indexOfDot);
						}
					}
				}
			}

			// if the namespace wasn't found this way, search for it in the new way (new Fiori template)
			if (tempNamespace === null) {
				var sReg  = '.extend\\(\\"(.*).';
				var oRegex = new RegExp(sReg + sFileNameUntilDot + '\\"');
				var aMatches = oRegex.exec(fileContent);
				if (aMatches) {
					tempNamespace = aMatches[1];
				}
			}
			return tempNamespace ? tempNamespace : "";
		};

		/**
		 *
		 * Generic Esprima methods for working with JSON blocks
		 *
		 * */
		var _getBlockByName = function (oNode, oContext) {
			if (oNode.type === esprima.Syntax.Property && oNode.key && oNode.key.name === oContext.sBlockName) {
				if(oContext.bContent === true) {
					oContext.oBlock = oNode.value;
				} else {
					oContext.oBlock = oNode;
				}

				return false; // found block
			}
			return true; // continue search
		};

		var _replaceBlockContent = function (oNode, oContext) {
			if (oNode.type === esprima.Syntax.Property && oNode.key && oNode.key.name === oContext.sBlockName) {
				oNode.value = oContext.oBlock.value;
				return false;
			}
			return true;
		};

		var _createBlock = function (oNode, oContext) {
			if (oNode.type === esprima.Syntax.Property && oNode.key && oNode.key.name === oContext.sParentBlockName) {
				oNode.value.properties.push(oContext.oBlock);
				return false;
			}
			return true;
		};
		
		/**
		 * Esprima method for locating a UI5 extended object
		 * (as extended Component or extended Configuration)
		 * */
        var _getExtendedObjectBySuffix = function(oNode, oContext) {
            if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
                oNode.callee.property.type === esprima.Syntax.Identifier && oNode.callee.property.name === "extend") {
                //  This is an "something.extend(" call
                // Make sure the ID suffix matches the desired object (as "Component"),
                // and keep the second extend call argument (the content of extended object)
                if (oNode.arguments[0].value && _.endsWith(oNode.arguments[0].value, oContext.sIdSuffix)) {
                    oContext.oExtendedObjectContent = oNode.arguments[1];
                    return false;
                } else {
                    return true;
                }
            }
			return true;
		};

		/**
		 * Returns the target folder document of the UI5 builder
		 * */
		var _getTargetBuildFolder = function(oProjectDocument, oContext) {
			return oContext.service.builder.getTargetFolder(oProjectDocument).then(function (oTargetFolderDocument) {
				return oTargetFolderDocument;
			});
		};

		var _getFileFromFolder = function(aProjMetadataContent, sFileName){
			var oFileMetaData = _.find(aProjMetadataContent, function(oElement) {
				return oElement.name === sFileName;
			});
			return oFileMetaData;
		};


		/**
		 * Returns the given handler file according to its name and location of the given component file
		 * */
		var _getDescriptorFileFromCompLocation = function(oAppComponentFile, sHandlerName){
			return oAppComponentFile.getParent().then(function (oComponentParent) {
				if (oComponentParent) {
					return oComponentParent.getChild(sHandlerName).then(function (oHandlerFile) {
						return oHandlerFile;
					});
				}
			});
		};

		var _removeHandlerFilesUnderTargetBuildFolder = function(oTargetFolder, aHandlerMetadataFiles) {
			var sTargetFolderName = oTargetFolder.getEntity().getName();
			var aFiles = _.filter(aHandlerMetadataFiles, function (oHandlerMetadataFile) {
				var sFullPath = oHandlerMetadataFile.path;
				var index = sFullPath.lastIndexOf("/");
				return !_.includes(sFullPath.substr(0, index), sTargetFolderName);
			});
			return aFiles;
		};

		var _getTopComponentDoc = function(aHandlerMetadataFiles, oContext) {
			var aHandlerMetadataFilesSortedByPath = _.sortBy(aHandlerMetadataFiles, function (oElement) {
				return oElement.path.length;
			});

			var topFileMetadata = _.first(aHandlerMetadataFilesSortedByPath);
			if (topFileMetadata) {
				return oContext.service.filesystem.documentProvider.getDocument(topFileMetadata.path).then(
					function(oDocument) {
						return oDocument;
					});
			} else {
				return null;
			}
		};

		return {
			getHandlerFilePath : _getHandlerFilePath,
			getHandlerNamespace :_getHandlerNamespace,
			getProject : _getProject,
			getBlockByName : _getBlockByName,
			replaceBlockContent : _replaceBlockContent,
			getExtendedObjectBySuffix : _getExtendedObjectBySuffix,
			createBlock : _createBlock,
			getTargetBuildFolder : _getTargetBuildFolder,
			getAppComponent : _getAppComponent,
			getFileFromFolder : _getFileFromFolder,
			getDescriptorFileFromCompLocation: _getDescriptorFileFromCompLocation
		};
	});
