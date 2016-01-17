define(["sap/watt/lib/lodash/lodash",
		"sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/GenericHandler",
		"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
		"sap/watt/lib/orion/ui/esprima/esprima",
		"sap/watt/lib/orion/ui/escodegen/escodegen.browser"],
	function (_, oGenericHandler, mVisitor) {
		"use strict";

		var FILE_NAME = "Component.js";

		var _getAttribute = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getHandlerFileName = function () {
			return FILE_NAME;
		};

		var _getHandlerFilePath = function (oDocument) {
			return oGenericHandler.getHandlerFilePath(oDocument);
		};

		var _getAppNamespace = function (oDocument) {
			return oGenericHandler.getHandlerNamespace(oDocument, FILE_NAME);
		};

		var _getConfigBlock = function(oDocument) {
			return oDocument.getContent().then(function(sComponentContent) {
				try {
					var oAstRoot = mVisitor.parse(sComponentContent);
					var oVisitContext = {
						oExtendedObjectContent: {},
						sIdSuffix: ".Component"
					};
					mVisitor.visit(oAstRoot, oVisitContext, oGenericHandler.getExtendedObjectBySuffix);
					if (oVisitContext.oExtendedObjectContent && oVisitContext.oExtendedObjectContent.properties) {
						// Parse extended Component object to locate service configurations:
						var aProperties = oVisitContext.oExtendedObjectContent.properties;
						for (var k = 0; k < aProperties.length && aProperties[k].key; k++) {
							if (aProperties[k].key.name === "metadata" || aProperties[k].key.value === "metadata") {
								var oMetadataEntry = aProperties[k].value;
								var aMetadataProperties = [];
								if (oMetadataEntry.type === "ObjectExpression") { //'metadata' is an object holding 'config' (regular component)
									aMetadataProperties = oMetadataEntry.properties;
								} else if(oMetadataEntry.type === "CallExpression" && oMetadataEntry.arguments &&
									oMetadataEntry.arguments[1] && oMetadataEntry.arguments[1].type === "ObjectExpression") {
									// 'metadata' is a function call which the second argument is the actual object holding the 'config' (Scaffolding based component)
										aMetadataProperties = oMetadataEntry.arguments[1].properties;
								}
								for (var l = 0; l < aMetadataProperties.length && aMetadataProperties[l].key; l++) {
									if (aMetadataProperties[l].key.name === "config" || aMetadataProperties[l].key.value === "config") {
										var oConfigsBlock = aMetadataProperties[l].value;
										return oConfigsBlock;
									}
								}
							}
						}
					}
				} catch (error) {
					var oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}
				return null;
			});
		};

		var _getConfigs = function(oDocument, oContext) {
			return _getConfigBlock(oDocument, oContext).then(function(oConfigsBlock) {
				var oConfigs = {};
				if (!_.isEmpty(oConfigsBlock)) {
					mVisitor.visit(oConfigsBlock, {}, _addQuotesToKeys);
					oConfigs = escodegen.generate(oConfigsBlock, {
						format: {
							json: true
						}
					});
					oConfigs = JSON.parse(oConfigs);
				}
				return oConfigs;
			});
		};

		var _getDataSources = function(oDocument, oContext) {
			return _getConfigs(oDocument, oContext).then(function(oConfigsBlock) {
					if (oConfigsBlock && oConfigsBlock.serviceConfig) {
						var sServiceName = oConfigsBlock.serviceConfig.name;
						var sServiceUrl = oConfigsBlock.serviceConfig.serviceUrl;

						if (sServiceName !== undefined) {
							var oResult = {};
							oResult[sServiceName] = {
								uri: sServiceUrl,
								type: "OData"
							};
							return oResult;
						}
					}
				return null;
			});
		};

		var _getAllDataSourceNames = function(oDocument, oContext) {
			return _getDataSources(oDocument, oContext).then(function(oDataSources) {
				if (typeof (oDataSources) === "object" && oDataSources !== null) {
					return Object.keys(oDataSources);
				} else {
					return [];
				}
			});
		};

		var _getDataSourcesByName = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDataSourceAnnotationsByName = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDataSourcesByType = function (oDocument, sDataSourceType, oContext) {
			// Configuration.js serviceList holds only data sources which are OData services
			if (sDataSourceType === "OData") {
				return _getDataSources(oDocument, oContext);
			} else {
				var oError = new Error("This method is not implemented");
				oError.name = "UnimplementedMethod";
				return Q.reject(oError);
			}
		};

		var _getSourceTemplate = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDependencies = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addQuotesToKeys = function(oNode) {
			if (oNode.key && oNode.key.type === esprima.Syntax.Identifier) {
				var oKey = {
					type: esprima.Syntax.Literal,
					value: oNode.key.name,
					range: oNode.key.range

				};
				oNode.key = oKey;
			}
			return true;
		};

		var _getAllExtensions = function(oDocument) {
			return oDocument.getContent().then(function(sComponentContent) {
				try {
					var oAst = mVisitor.parse(sComponentContent);
					var oVisitContext = {
						oBlock: {},
						bContent: true,
						sBlockName: "customizing"
					};
					mVisitor.visit(oAst, oVisitContext, oGenericHandler.getBlockByName);

					var oCustomizing = {};
					if (!_.isEmpty(oVisitContext.oBlock)) {
						var oBlock = oVisitContext.oBlock;
						mVisitor.visit(oBlock, oVisitContext, _addQuotesToKeys);

						oCustomizing = escodegen.generate(oVisitContext.oBlock, {
							format: {
								json: true
							}
						});
						oCustomizing = JSON.parse(oCustomizing);
					}
					return oCustomizing;
				} catch (error) {
					var oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}
			});
		};

		var _isScaffoldingBased = function (oDocument) {
			return oDocument.getContent().then(function (sComponentContent) {
				var regex = /(?:\s*)sap\.ca\.scfld\.md[\.\w]*\.extend/m;
				return regex.test(sComponentContent);
			});
		};


		/**
		 * Replace and store a property value of the "metadata" block (as "customizing" or "config").
		 * The property value is expected to be itself a JSON block.
		 * @param oDocument The Component.js handler document
		 * @param sMetadataPropertyName The name of the property directly under the "metadata" block to replace its value
		 * @param oMetadataPropertyContent The content itself to save (the block should be JSON object - not esprima AST node)
		 * @param oContext Web IDE Plugin context
		 * @returns {Q-Promise} with 'true' for success
		 * @private
		 */
		var _storeMetadataPropertyContent = function(oDocument, sMetadataPropertyName, oMetadataPropertyContent, oContext) {
			var oError;
			return oDocument.getContent().then(function (sComponentContent) {
				var oGetContext = {
					sBlockName: "metadata",
					bContent: true,
					oBlock: {}
				};

				try {
					var oAst = mVisitor.parse(sComponentContent, {
						range: true,
						tokens: true,
						comment: true
					});
					oAst = escodegen.attachComments(oAst, oAst.comments, oAst.tokens);
					mVisitor.visit(oAst, oGetContext, oGenericHandler.getBlockByName);

				} catch (error) {
					oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}

				var oMetadataExsitingAst = oGetContext.oBlock;
				if (_.isEmpty(oMetadataExsitingAst)) {
					oError = new Error("No metadata section in file");
					oError.name = "MetadataBlockMissing";
					throw oError;
				}

				var oMetadataPropertyExistingBlock = _.find(oMetadataExsitingAst.properties, function(obj) {
					if (obj.key && (obj.key.value === sMetadataPropertyName || obj.key.name === sMetadataPropertyName)) {
						return true;
					}
				});

				try {
					// esprima can't parse pure JSON, so we wrap it in dummy code and extract only the relevant part
					var sMetadataPropertyContentJson = JSON.stringify(oMetadataPropertyContent);
					var oMetadataPropertyUpdatedAst = mVisitor.parse("var tmp = {" + sMetadataPropertyName + ":" + sMetadataPropertyContentJson + "};");
					oGetContext = {
						sBlockName: sMetadataPropertyName,
						bContent: false,
						oBlock: {}
					};
					mVisitor.visit(oMetadataPropertyUpdatedAst, oGetContext, oGenericHandler.getBlockByName);
					oMetadataPropertyUpdatedAst = oGetContext.oBlock;

				} catch (error) {
					oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}

				if (typeof (oMetadataPropertyExistingBlock) === "object" && oMetadataPropertyExistingBlock !== null) {
					// replace existing property value
					oMetadataPropertyExistingBlock.value = oMetadataPropertyUpdatedAst.value;
				} else {
					// property not exist - create it
					oMetadataExsitingAst.properties.push(oMetadataPropertyUpdatedAst);
				}

				var newContent = escodegen.generate(oAst, {
					format: {
						quotes: "double"
					},
					comment: true
				});
				return oContext.service.beautifierProcessor.beautify(newContent, "js", null).then(function (beautifiedNewContent) {
					return oDocument.setContent(beautifiedNewContent).then(function () {
						return oDocument.save().then(function () {
							return true;
						});
					});
				});
			});
		};

		var _addConfig = function(oDocument, sConfigName, oContent, bOverwrite, oContext) {
			var oError;
			if (_.isUndefined(sConfigName) || _.isNull(sConfigName)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_configNotDefined"));
				oError.name = "ConfigNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getConfigs(oDocument, oContext).then(function(oConfigsContent) {
				if (!oConfigsContent) {
					oConfigsContent = {};
				}
				if (!oConfigsContent[sConfigName] || bOverwrite) {
					//set content only if not exists or asked to overwrite
					oConfigsContent[sConfigName] = oContent;
					return _storeMetadataPropertyContent(oDocument, "config", oConfigsContent, oContext);
				}
				else {
					oError = new Error("Configuration with this name already exist. Use bOverwrite parameter to overwrite the configuration data");
					oError.name = "ConfigNameExist";
					throw oError;
				}
			});
		};

		var _addExtension = function(oDocument, sExtensionType, sViewName, oContent, bOverwrite, oContext) {
			var oError;
			if (_.isUndefined(sExtensionType) || _.isNull(sExtensionType)) {
				oError = new Error("The extension type is not defined.");
				oError.name = "ExtensionNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(sViewName) || _.isNull(sViewName)) {
				oError = new Error("The view name is not defined.");
				oError.name = "ViewNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				oError = new Error("The content is not defined.");
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}

			return _getAllExtensions(oDocument, oContext).then(function(oCustomizing) {
				var oExtension = {};
				if (!_.isEmpty(oCustomizing)) {
					var oExtensionType = oCustomizing[sExtensionType];
					if (oExtensionType && oExtensionType[sViewName]) {
						oExtension = oExtensionType[sViewName];
					}
				}

				if (!_.isEmpty(oExtension)) {

					switch (sExtensionType) {
						// There can be only one replacement for view/controller
						case "sap.ui.viewReplacements":
						case "sap.ui.controllerExtensions":
							if (!bOverwrite) {
								oError = new Error("The extension already exists, " +
									"use \"bOverwrite\" parameter to overwrite it");
								oError.name = "ExtensionExistInHandler";
								throw oError;
							}

							oCustomizing[sExtensionType][sViewName] = oContent;
							break;
							// Several elements in the same view can be extended
						case "sap.ui.viewExtensions":
						case "sap.ui.viewModifications":
							var aKeys = Object.keys(oContent);
							var oViewExtensions = oCustomizing[sExtensionType][sViewName];
							for (var i = 0; i < aKeys.length; ++i) {
								if (!oViewExtensions[aKeys[i]] || bOverwrite) {
									oViewExtensions[aKeys[i]] = oContent[aKeys[i]];
								}
							}
							oCustomizing[sExtensionType][sViewName] = oViewExtensions;
							break;
					}
				} else {
					// build extensions section if doesn't exist
					if (typeof (oCustomizing[sExtensionType]) !== "object" || oCustomizing[sExtensionType] === null) {
						oCustomizing[sExtensionType] = {};
					}
					oCustomizing[sExtensionType][sViewName] = oContent;
				}

				return _storeMetadataPropertyContent(oDocument, "customizing", oCustomizing, oContext);
			});
		};

		var _addDataSource = function(oDocument, sDataSourceName, oContent, bOverwrite, oContext) {
			var oError;
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				oError = new Error("The data source name is not defined.");
				oError.name = "DataSourceNameNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				oError = new Error("The content is not defined.");
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getDataSources(oDocument).then(function (oDataSources) {
				if (bOverwrite || _.isNull(oDataSources) || oDataSources[""]) { // overwrite or dataSource doesn't exist or it exists but empty
					// Update the config content with the added data source values (addConfig is not used directly to not overwrite the whole 'serviceConfig' block)
					return _getConfigs(oDocument, oContext).then(function(oConfigsContent) {
						if (!oConfigsContent) {
							oConfigsContent = {};
						}
						if (!oConfigsContent.serviceConfig) {
							oConfigsContent.serviceConfig = {};
						}
						oConfigsContent.serviceConfig.name = sDataSourceName;
						oConfigsContent.serviceConfig.serviceUrl = oContent.uri ? oContent.uri : "";

						return _storeMetadataPropertyContent(oDocument, "config", oConfigsContent, oContext);
					});
				} else {
					oError = new Error("Service already exist. Use bOverwrite parameter to overwrite the service data");
					oError.name = "ServiceExist";
					throw oError;
				}
			});
		};

		var _addDataSourceAnnotation = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addSourceTemplate = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addDependencies = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _setHCPPlatformBlock = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		//There is no deployment block in a Component.js project
		var _setABAPPlatformBlock = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _removeDataSource = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _removeDataSourceAnnotation = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _removeExtension = function (oDocument, sExtensionType, sViewName, sExtendedElement, oContext) {
			var oError;
			if (_.isUndefined(sExtensionType) || _.isNull(sExtensionType)) {
				oError = new Error("The extension type is not defined.");
				oError.name = "ExtensionNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(sViewName) || _.isNull(sViewName)) {
				oError = new Error("The view name is not defined.");
				oError.name = "ViewNotDefined";
				return Q.reject(oError);
			}

			return _getAllExtensions(oDocument, oContext).then(function (oCustomizing) {
				var oViewExtension = {};
				if (!_.isEmpty(oCustomizing)) {
					var oExtensionType = oCustomizing[sExtensionType];
					if (oExtensionType && oExtensionType[sViewName]) {
						oViewExtension = oExtensionType[sViewName];
					}
				}

				//var oViewExtension = _.get(oExtensions, sViewName, {});
				if (!_.isEmpty(oViewExtension)) {
					if (!sExtendedElement) {
						// If element not specified delete whole view reference
						delete oCustomizing[sExtensionType][sViewName];

					} else {
						// Otherwise remove the current element extension
						var oExtendedElement = oViewExtension[sExtendedElement] ? oViewExtension[sExtendedElement] : {};
						if (!_.isEmpty(oExtendedElement)) {
							delete oCustomizing[sExtensionType][sViewName][sExtendedElement];

							if (_.isEmpty(oCustomizing[sExtensionType][sViewName])) {
								delete oCustomizing[sExtensionType][sViewName];
							}
						} else {
							oError = new Error("The extension does not exist");
							oError.name = "ExtensionNotFound";
							throw oError;
						}
					}

					if (_.isEmpty(oCustomizing[sExtensionType])) {
						delete oCustomizing[sExtensionType];
					}

					return _storeMetadataPropertyContent(oDocument, "customizing", oCustomizing, oContext);

				} else {
					oError = new Error("The extension does not exist");
					oError.name = "ExtensionNotFound";
					throw oError;
				}
			});
		};

		var _addModel = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getModels = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addExtensionForScaffoldingDataSource = function(oDocument, sDataSourceName, sUri, sLocalUri, bIsDefault,
															 bOverwrite, oContext) {
			var oConfig = [{
				name: sDataSourceName,
				serviceUrl: sUri,
				isDefault: bIsDefault,
				mockedDataSource: sLocalUri
			}];
			return _addConfig(oDocument, "sap.ca.serviceConfigs", oConfig, bOverwrite, oContext);
		};

		// A visitor method for getting the full name of the component object which this Component.js code extending.
		// For example, in the call to: a.extends("b.Component", {....}); - 'a' will be returned.
		// In case of extension project, the returned value will be of the name of the component from the original application.
		var _getOriginalComponentName = function (oNode, oVisitorContext) {
			if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
				oNode.callee.property.type === esprima.Syntax.Identifier && oNode.callee.property.name === "extend") {
				// This is a call to "something.extend("  - extract the callee name
				var sCalleeObjectName = "";
				if (oNode.callee.object) {
					sCalleeObjectName = escodegen.generate(oNode.callee.object);
					if (sCalleeObjectName && sCalleeObjectName.indexOf("this.") === 0) {
						sCalleeObjectName = sCalleeObjectName.substring(5); // remove "this." from callee name
					}
				}
				oVisitorContext.sOriginalComponentName = sCalleeObjectName;
				return false;
			}
			return true;
		};

		// Get the content of the 'init' function code of the extended component for applying i18n extension,
		// in form of an AST node.
		var _getI18nExtensionInitFunctionAST = function (sUri, sOriginalComponentName) {
			var sInitFuncContent = 'init : function() {' +
				'if (' + sOriginalComponentName + '.prototype.init !== undefined) {' +
				sOriginalComponentName + '.prototype.init.apply(this, arguments);' +
				'}' +
				'var i18nModel = new sap.ui.model.resource.ResourceModel({' +
				'bundleUrl : "./' + sUri + '"' +
				'});' +
				'\n// set new i18n model' +
				'\nthis.setModel(i18nModel, "i18n");' +
				'}';

			sInitFuncContent = 'var x={' + sInitFuncContent + '};'; //wrap with dummy assignment and object context, to enable esprima parsing
			var oAst = mVisitor.parse(sInitFuncContent, {tokens: true, comment: true});
			oAst = escodegen.attachComments(oAst, oAst.comments, oAst.tokens);
			// extract the init property from the dummy object
			return oAst.body[0].declarations[0].init.properties[0];
		};

		// A visitor method for adding the 'init' function code (as AST) in the appropriate location of the extended component code,
		// in order to apply the i18n extension.
		var _addI18nExtensionInitFunction = function (oNode, oVisitorContext) {
			if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
				oNode.callee.property.type === esprima.Syntax.Identifier && oNode.callee.property.name === "extend") {
				// This is a call to "something.extend("  - put the init function code in the extension component object properties
				if (oNode.arguments[1] && oNode.arguments[1].properties) {
					var aProperties = oNode.arguments[1].properties;
					var bInitExists = false;
					// overwrite existing init implementation (if exists)
					for (var i = 0; i < aProperties.length; i++) {
						if (aProperties[i].key.name === "init") {
							bInitExists = true;
							if (oVisitorContext.bOverwrite) {
								aProperties[i] = oVisitorContext.oInitFuncAst;
							}
							else {
								oVisitorContext.oError = new Error("Init method with possible i18n model already exists in the application Component. Use bOverwrite parameter to overwrite the i18n model data");
								oVisitorContext.oError.name = "InitMethodExistInComponent";
							}
							break;
						}
					}
					// or add the init method as the last property
					if (!bInitExists) {
						aProperties.push(oVisitorContext.oInitFuncAst);
					}
				}
				else {
					oVisitorContext.oError = new Error("File parsing failed");
					oVisitorContext.oError.name = "FileParsingFailed";
				}

				return false;
			}
			return true;
		};

		var _addi18nExtensionModel = function (oDocument, sUri, bOverwrite, oContext) {
			var oError, oAst;
			return oDocument.getContent().then(function (sComponentContent) {
				try {
					oAst = mVisitor.parse(sComponentContent, {range: true, tokens: true, comment: true});
					oAst = escodegen.attachComments(oAst, oAst.comments, oAst.tokens);
				} catch (error) {
					oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}
				var oGetComponentNameVisitContext = {
					sOriginalComponentName: ""
				};
				mVisitor.visit(oAst, oGetComponentNameVisitContext, _getOriginalComponentName);

				if (oGetComponentNameVisitContext.sOriginalComponentName) {
					var oInitFuncAst = _getI18nExtensionInitFunctionAST(sUri, oGetComponentNameVisitContext.sOriginalComponentName);
					var oAddInitVisitContext = {
						oInitFuncAst: oInitFuncAst,
						bOverwrite: bOverwrite
					};
					mVisitor.visit(oAst, oAddInitVisitContext, _addI18nExtensionInitFunction);

					if (oAddInitVisitContext.oError) {
						throw oAddInitVisitContext.oError;
					}

					var newContent = escodegen.generate(oAst, {
						format: {
							quotes: "double"
						},
						comment: true
					});
					return oContext.service.beautifierProcessor.beautify(newContent, "js", null).then(function (beautifiedNewContent) {
						return oDocument.setContent(beautifiedNewContent).then(function () {
							return oDocument.save().then(function () {
								return true;
							});
						});
					});

				} else {
					oError = new Error("File parsing failed");
					oError.name = "FileParsingFailed";
					throw oError;
				}

			});
		};

		var _addI18nPath = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		// Adjust the path to the i18n file set in the 'i18nBundle' configuration property of the component,
		// to be a proper file path (instead of by using namespaces as ui5 resource path).
		var _adjustI18nBundlePath = function(sNamespace, i18nBundlePath) {
			if(i18nBundlePath && i18nBundlePath.indexOf("/")=== -1){
				var newStr = i18nBundlePath.replace(sNamespace + ".",""); // remove namespace
				var fileExtensionIndex = newStr.lastIndexOf(".properties");
				var tempStr = newStr;
				if (fileExtensionIndex !== -1) {
					tempStr = newStr.substr(0, fileExtensionIndex); // remove .properties extension if exists
				}
				var filenameIndex = tempStr.lastIndexOf(".");
				tempStr = tempStr.substr(0,filenameIndex); // the path without filename. save last "."

				i18nBundlePath = tempStr.split(".").join("/") + "/" + newStr.substr(filenameIndex+1,newStr.length); // replace '.' with '/' and add original filename (with extension)

				if (fileExtensionIndex === -1) {
					i18nBundlePath = i18nBundlePath + ".properties"; // add .properties extension if was not originally exists
				}
			}
			return i18nBundlePath;
		};

		var _getI18nPath = function (oDocument, oContext) {
			return _getConfigs(oDocument, oContext).then(function(oConfigs) {
				var i18nPath = oConfigs.resourceBundle;
				if(!i18nPath) {
					i18nPath = oConfigs.i18nBundle;
					return _getAppNamespace(oDocument, oContext).then(function(sNamespace) {
						i18nPath = _adjustI18nBundlePath(sNamespace, i18nPath);
						return i18nPath;
					});
				}
				return i18nPath;
			});
		};


		return {
			getAttribute: _getAttribute,
			getHandlerFileName: _getHandlerFileName,
			getHandlerFilePath: _getHandlerFilePath,
			getAppNamespace: _getAppNamespace,
			getDataSources: _getDataSources,
			getAllDataSourceNames: _getAllDataSourceNames,
			getDataSourcesByName: _getDataSourcesByName,
			getDataSourceAnnotationsByName: _getDataSourceAnnotationsByName,
			getDataSourcesByType: _getDataSourcesByType,
			getSourceTemplate: _getSourceTemplate,
			getDependencies: _getDependencies,
			getAllExtensions: _getAllExtensions,
			isScaffoldingBased: _isScaffoldingBased,
			addExtension: _addExtension,
			addDataSource: _addDataSource,
			addDataSourceAnnotation: _addDataSourceAnnotation,
			addExtensionForScaffoldingDataSource: _addExtensionForScaffoldingDataSource,
			addSourceTemplate: _addSourceTemplate,
			addDependencies: _addDependencies,
			setHCPPlatformBlock: _setHCPPlatformBlock,
			setABAPPlatformBlock: _setABAPPlatformBlock,
			removeDataSource: _removeDataSource,
			removeDataSourceAnnotation: _removeDataSourceAnnotation,
			removeExtension: _removeExtension,
			addModel: _addModel,
			getModels: _getModels,
			addConfig: _addConfig,
			getConfigs: _getConfigs,
			addi18nExtensionModel: _addi18nExtensionModel,
			addI18nPath: _addI18nPath,
			getI18nPath: _getI18nPath
		};
	});
