define([
	"sap/watt/lib/orion/javascript/esprima/esprimaJsContentAssist",
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
	"sap/watt/core/PluginRegistry",
	"sap/watt/core/Service"
	], function(mJSContentAssist, mVisitor, mPluginRegistry, mService) {
	"use strict";
	
	var _WATT_PLUGIN_PREFIXS = [ "/sap/watt/common/plugin/", "/sap/watt/uitools/plugin/" ];
	
	var _wattServiceDependencies = {};
	
	return {
		/**
		 * get plugin name from file name
		 * e.g. in:
		 * sap/watt/common/plugin/intellisence/command/Intellisence.js
		 * out:
		 * intellisence
		 *
		 * @public
		 */
		getPluginName : function(fileName) {
			if (fileName) {
			    
				for (var i in _WATT_PLUGIN_PREFIXS) {
					var pluginPrefix = _WATT_PLUGIN_PREFIXS[i];

					var pos = fileName.indexOf(pluginPrefix);
					if (pos >= 0) {
					    var pluginNamePrefix  = pluginPrefix.split("/",3).join(".")+"."; 
					    var fnElem = fileName.split("/");
					    var pluginName = "";
					    for ( var elInd = 0; elInd < fnElem.length; elInd++ ) {
					        if ( fnElem[elInd] === "plugin") {
					            pluginName = fnElem[elInd+1];
					            break;
					        }
					    }
					    pluginName = pluginNamePrefix + pluginName;
					    
/*						var pluginName = fileName.substring(pos + pluginPrefix.length);
						pos = pluginName.indexOf('/');
						if (pos > 0) {
							return pluginPrefix + pluginName.substring(0, pos);
						}
*/					}
				}
			}
		},
		
		/**
		 * get plugin metadata from Document
		 * 
		 * @function
		 * 
		 * @name getPlugin
		 * @param oJSContext
		 * @return Promise(plugin.json)
		 * @public
		 */

		getPlugin :	function (oJSContext) {
		var oContentService = oJSContext.service.content;
		var oFileSystemService = oJSContext.service.filesystem;
		return oContentService.getCurrentDocument().then(function(oDocument) {
		    var sDocumentPath = oDocument.getEntity().getFullPath();
		    if (_wattServiceDependencies.hasOwnProperty(sDocumentPath)) {
		        return _wattServiceDependencies[sDocumentPath];
		    }
		    return oDocument.getProject().then(function(oProject){
		        var sProjectPath = oProject.getEntity().getFullPath();
		        var sPluginPath = sProjectPath + "/plugin.json";
		        return oFileSystemService.documentProvider.getDocument(sPluginPath).then(function(document) {
		            if (document) {
            		    return document.getContent().then(function(sPluginJson) {
            		        var oPluginJson = {};
            		        try {
            			    	oPluginJson = JSON.parse(sPluginJson);
            			    	_wattServiceDependencies[sDocumentPath] = oPluginJson;
            		        } catch (xJsonFormat) {
            		            console.warn("plugin.json :"+xJsonFormat) ;
            		        } 
            		        return oPluginJson;
        			    });
		            } else {
		                var iPluginsPos = sDocumentPath.search("/plugin/") + 8;
		                if (iPluginsPos >= 0 ) {
		                    iPluginsPos += sDocumentPath.substring(iPluginsPos).indexOf("/");
		                    // console.log("Plugin root = " + sDocumentPath.substring(0,iPluginsPos));
		                    sPluginPath = sDocumentPath.substring(0,iPluginsPos) + "/plugin.json";
            		        return oFileSystemService.documentProvider.getDocument(sPluginPath).then(function(document) {
            		            if (document) {
                        		    return document.getContent().then(function(sPluginJson) {
                        		        var oPluginJson = {};
                        		        try {
                        			    	oPluginJson = JSON.parse(sPluginJson);
                        			    	_wattServiceDependencies[sDocumentPath] = oPluginJson;
                        		        } catch (xJsonFormat) {
                        		            console.warn("plugin.json :"+xJsonFormat) ;
                        		        } 
                        		        return oPluginJson;
                    			    });
            		            } else {
            		                console.warn("plugin.json is missed - not a plugin project");
            		                _wattServiceDependencies[sDocumentPath] = null;
            		                return Q();
            		            }
		                    });
		                } else {
    		                console.warn("plugin.json is missed - search in " + sDocumentPath.substring(sProjectPath.length,sDocumentPath.length)) ;
    		                return Q();
		                }
		             }
			       });
                }).fail(function(){
                    _wattServiceDependencies[sDocumentPath] = null;
            		return Q();
                });
		    });
	    },


		/**
		 * get WATT context proposals of specific plugin
		 * @public
		 */
		getProposals : function(astRoot, oContentStatus, oPluginJson) {
			var context = {
				offset: oContentStatus.offset - oContentStatus.prefix.length - 1,
				thisName: "",
				setVarNames: {}
			};
			try {
				mVisitor.visit(astRoot, context, _findThisVar, _findThisSetVar);
			} catch(error) {
				console.warn(error);
			}
			if (context.thisName) {
				return _prepareProposals(context.thisName, 
						oPluginJson, 
						oContentStatus.prefix, 
						oContentStatus.offset - oContentStatus.prefix.length, 
						oContentStatus.caseSensitive);
			} else {
				return [];
			}
		},
		
		/**
		 * clear cach for Document
		 * 
		 * @function
		 * 
		 * @name clearCach
		 * @param oJSContext
		 * @return Promise(plugin.json)
		 * @public
		 */

		clearCach :	function (oEvent) {
		    var sName = oEvent.params.document.getEntity().getName();
		    if ( sName === "plugin.json") {
		        var pluginProjPath = oEvent.params.document.getEntity().getFullPath();
		        pluginProjPath =  pluginProjPath.slice(0,pluginProjPath.search("plugin.json")); 
		        for ( var cachEntry in _wattServiceDependencies) {
		            if ( _wattServiceDependencies.hasOwnProperty(cachEntry) && cachEntry.search(pluginProjPath) === 0) {
		                delete _wattServiceDependencies[cachEntry];
		            }
		        }
		    } else {
		      if( ( oEvent.name === "deleted" || oEvent.name === "tabClosed") && sName.indexOf('.') >= 0 && sName.split('.')[1] === 'js' ) {
		          delete _wattServiceDependencies[oEvent.params.document.getEntity().getFullPath()];
		      }
		    }
		    return Q();
		}		
	};
	
	/**
	 * find 'this' from top(ast root) to bottom(ast leaf)
	 * case[1.1] this.
	 * case[1.2] this.context.
	 * case[1.3] this.context.service.
	 * case[1.4] this.context.service.focus.
	 * @private
	 */
	function _findThisVar(node, context) {
		if (node.range[1] === context.offset) {
			if (node.type === "ThisExpression") {
				context.thisName = "this";
			} else {
				var thisName = _parseThisFromMemberExpression(node, context);
				if (thisName) {
					context.thisName = thisName;
				}
			}
		}
		return !(context.thisName);
	}

	/**
	 * find var name of 'this' from bottom(ast leaf) to top(ast root)
	 * case[2.1] var that = this; that.
	 * case[2.2] var context = this.context; context.
	 * case[2.3] var service = this.context.service; service.
	 * case[2.4] var focus = this.context.service.focus; focus.
	 *
	 * case[3.1] that.context.
	 * case[3.2] that.context.service.
	 * case[3.3] that.context.service.focus.
	 *
	 * case[4.1] var context = that.context; context.
	 * case[4.2] var service = that.context.service; service.
	 * case[4.3] var focus = that.context.service.focus; focus.
	 *
	 * case[5.1] var service = context.service; service.
	 * case[5.2] var focus = service.focus; focus.
	 * @private
	 */
	function _findThisSetVar (node, context) {
		if (node.range[0] <= context.offset) {
			// collect all var from 'this'
			if (node.type === "VariableDeclarator") {
				if (node.id.type === "Identifier") {
					if (node.init && node.init.type === "ThisExpression") {
						context.setVarNames[node.id.name] = "this";
					} else {
						var thisName = _parseThisFromMemberExpression(node.init, context);
						if (thisName) {
							context.setVarNames[node.id.name] = thisName;
						}
					}
				}
			}
			// match the current var to the corresponding this var
			if (node.range[1] === context.offset) {
				if (node.type === "Identifier" && context.setVarNames[node.name]) {
					context.thisName = context.setVarNames[node.name];
				}
			}
		}
		return !(context.thisName);
	}

	function _prepareProposals(varName, oPluginJson, prefix, offset, caseSensitive) {
		var proposals = [];

		if (varName == 'this') {
			if (_isProposalMatched('context', prefix, caseSensitive)) {
				proposals.push(_getObjectProposal('context'));
			}
		} else if (varName == 'this.context') {
			if (_isProposalMatched('service', prefix, caseSensitive)) {
				proposals.push(_getObjectProposal('service'));
			}
		} else if (varName == 'this.context.service') {
			var services = _getPluginServices(oPluginJson);
			for (var i in services) {
				var serviceName = services[i];
				if (_isProposalMatched(serviceName, prefix, caseSensitive)) {
					proposals.push(_getObjectProposal(serviceName));
				}
			}
		} else {
			var parent = "this.context.service.";
			var pos = varName.indexOf(parent);
			if (pos === 0) {
				var sServiceName = varName.substring(pos + parent.length);
				if (  _getPluginServices(oPluginJson).indexOf(sServiceName) !== -1 ) {
    				var methods = _getServiceMethods(sServiceName);
    				for (var name in methods) {
    					if (_isProposalMatched(name, prefix, caseSensitive)) {
    						proposals.push(_getMethodProposal(name, methods[name], offset));
    					}
    				}
				}
			}
		}

		if (proposals.length > 0) {
			proposals.push(_getDummyProposal());
		}
		return proposals;
	}

	function _isProposalMatched(proposal, prefix, caseSensitive) {
		if (caseSensitive) {
			return proposal.indexOf(prefix) == 0;
		} else {
			return proposal.toLowerCase().indexOf(prefix.toLowerCase()) == 0;
		}
	}

	function _getDummyProposal() {
		return {
			proposal : '',
			description : '---------------------------------',
			style : 'hr',
			unselectable : true
		};
	}

	function _getObjectProposal(name) {
		return {
			proposal : name,
			description : name + " : Object",
			category : "object",
			style : 'emphasis',
			overwrite : true
		};
	}

	function _getMethodProposal(name, typeObj, offset) {
		var returnType;
		if (typeObj.returns) {
			if (!typeObj.returns.type) {
				returnType = typeObj.returns;
			} else if (typeObj.returns.type instanceof Array) {
				returnType = "Array";
			} else if (typeObj.returns.type instanceof Object) {
				returnType = "Object";
			} else {
				returnType = "undefined";
			}
		}
		var jsCA = new mJSContentAssist.EsprimaJavaScriptContentAssistProvider(/* oIndexer */);
		var res = jsCA.calculateFunctionProposal(name, typeObj, offset - 1);
		return {
			proposal : res.completion,//name + "(" + paramSyntax + ")",
			description : res.completion + " : " + returnType,
			//helpDescription: tooltip,
			category : "function",
			positions : res.positions,
			escapePosition : offset + res.completion.length,
			style : 'emphasis',
			overwrite : true
		};
	}

	function _getPluginServices(oPluginJson) {
	    if (oPluginJson.requires && oPluginJson.requires.services ) {
	        return oPluginJson.requires.services;
	    } else {
	        return [];
	    }
	}

	function _getServiceMethods(serviceName) {
		try {
			// have to use method 'sap.watt.core.Service.get' here
			var service = mService.get(serviceName);
			if (service) {
				return service.$getInterface().getMethods();
			}
		} catch (error) {
			console.log(error);
			return [];
		}
	}

	function _parseThisFromMemberExpression(node, context) {
		var name = "";
		while (node && node.type === "MemberExpression") {
			if (node.property && node.property.type === "Identifier") {
				if (name) {
					name = node.property.name + '.' + name;
				} else {
					name = node.property.name + name;
				}
			}
			if (node.object.type === "ThisExpression") {
				name = "this." + name;
				break;
			} else if (node.object.type === "Identifier") {
				if (context.setVarNames[node.object.name]) {
					name = context.setVarNames[node.object.name] + '.' + name;
					break;
				}
			}
			node = node.object;
		}
		return name;
	}
});