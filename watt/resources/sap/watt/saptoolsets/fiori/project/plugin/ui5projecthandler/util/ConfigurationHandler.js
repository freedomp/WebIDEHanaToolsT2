define(["sap/watt/lib/lodash/lodash",
		"sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/GenericHandler",
		"sap/watt/lib/orion/javascript/esprima/esprimaVisitor"],
	function(_, oGenericHandler, mVisitor) {
		"use strict";

		var FILE_NAME = "Configuration.js";

		var _getAttribute = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getHandlerFileName = function() {
			return FILE_NAME;
		};

		var _getHandlerFilePath = function(oDocument) {
			return oGenericHandler.getHandlerFilePath(oDocument);
		};

		var _getAppNamespace = function(oDocument) {
			return oGenericHandler.getHandlerNamespace(oDocument, FILE_NAME);
		};

		var _getDataSources = function(oDocument) {
			return oDocument.getContent().then(function(sConfigurationContent) {
				try {
					var oAstRoot = mVisitor.parse(sConfigurationContent);
					var oVisitContext = {
						oExtendedObjectContent: {},
						sIdSuffix: ".Configuration"
					};
					mVisitor.visit(oAstRoot, oVisitContext, oGenericHandler.getExtendedObjectBySuffix);
					if (oVisitContext.oExtendedObjectContent && oVisitContext.oExtendedObjectContent.properties) {
						// Parse extended Configuration object to locate service configurations:
						var aProperties = oVisitContext.oExtendedObjectContent.properties;
						for (var k = 0; k < aProperties.length && aProperties[k].key; k++) {
							if (aProperties[k].key.name === "oServiceParams" || aProperties[k].key.value === "oServiceParams") {
								var oServiceParamsEntry = aProperties[k].value;
								if (oServiceParamsEntry.type === "ObjectExpression") {
									var aServiceParamsProperties = oServiceParamsEntry.properties;
									for (var l = 0; l < aServiceParamsProperties.length && aServiceParamsProperties[l].key; l++) {
										if (aServiceParamsProperties[l].key.name === "serviceList" || aServiceParamsProperties[l].key.value === "serviceList") {
											var aServiceListArray = aServiceParamsProperties[l].value;
											if (aServiceListArray.type === "ArrayExpression" && aServiceListArray.elements.length > 0) {
												var aServiceListItems = aServiceListArray.elements;
												var aServiceListItemProperties;
												var sServiceName;
												var sServiceUrl;
												var sMockedDataSource;
												var oResult = {};
												for (var m = 0; m < aServiceListItems.length; m++){
													sServiceName = "";
													sServiceUrl = "";
													sMockedDataSource = "";
													aServiceListItemProperties = aServiceListItems[m].properties;
													if (aServiceListItemProperties) {
														for (var n = 0; n < aServiceListItemProperties.length && aServiceListItemProperties[n].key; n++) {
															if ((aServiceListItemProperties[n].key.name === "name" || aServiceListItemProperties[n].key.value === "name") && (
																	aServiceListItemProperties[n].value)) {
																sServiceName = aServiceListItemProperties[n].value.value;
															}
															if ((aServiceListItemProperties[n].key.name === "serviceUrl" || aServiceListItemProperties[n].key.value ===
																"serviceUrl") && (aServiceListItemProperties[n].value)) {
																sServiceUrl = aServiceListItemProperties[n].value.value;
															}
															if ((aServiceListItemProperties[n].key.name === "mockedDataSource" || aServiceListItemProperties[n].key.value ===
																"mockedDataSource") && (aServiceListItemProperties[n].value)) {
																sMockedDataSource = aServiceListItemProperties[n].value.value; //takes only string value (and not an expression)
															}
														}
														if (sServiceName) {
															oResult[sServiceName] = {
																uri: sServiceUrl,
																type: "OData", //Configuration.js serviceList holds only data sources which are OData services
																settings: {
																	localUri: sMockedDataSource
																}
															};
														}
													}
												}
												return oResult;
											}
										}
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

		var _getAllDataSourceNames = function(oDocument, oContext) {
			return _getDataSources(oDocument, oContext).then(function(oDataSources) {
				if (typeof (oDataSources) === "object" && oDataSources !== null) {
					return Object.keys(oDataSources);
				} else {
					return [];
				}
			});
		};

		var _getDataSourcesByName = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDataSourceAnnotationsByName = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDataSourcesByType = function(oDocument, sDataSourceType, oContext) {
			// Configuration.js serviceList holds only data sources which are OData services
			if (sDataSourceType === "OData") {
				return _getDataSources(oDocument, oContext);
			} else {
				var oError = new Error("This method is not implemented");
				oError.name = "UnimplementedMethod";
				throw oError;
			}
		};

		var _getSourceTemplate = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getDependencies = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getAllExtensions = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _isScaffoldingBased = function() {
			return true;
		};

		var _addExtension = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addDataSource = function(oDocument, sDataSourceName, oContent, bOverwrite) {
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				var oError = new Error("The data source name is not defined.");
				oError.name = "DataSourceNameNotDefined";
				throw oError;
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error("The content is not defined.");
				oError.name = "ContentNotDefined";
				throw oError;
			}
			return _getDataSources(oDocument).then(function(oDataSources) {
				if (bOverwrite || _.isNull(oDataSources) || oDataSources[""]) { // overwrite or dataSource doesn't exist or it exists but empty
					return oDocument.getContent().then(function(fileContent) {
						var newContent = _updateConfigurationContent(fileContent, sDataSourceName, oContent);
						return oDocument.setContent(newContent).then(function() {
							return oDocument.save().then(function() {
								return true;
							});
						});
					});
				} else {
					var oError = new Error("Service already exist. Use bOverwrite parameter to overwrite the service data");
					oError.name = "ServiceExist";
					throw oError;
				}

			});
		};

		var _addDataSourceAnnotation = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addSourceTemplate = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addDependencies = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _setHCPPlatformBlock = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		//There is no deployment block in a Configuration.js project
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

		var _removeDataSourceAnnotation = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _removeExtension = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _updateConfigurationContent = function(fileContent, sDataSourceName, oContent) {
			// return the configuration file content with the new service name and url
			var newContent = fileContent;
			var oError;
			var oGetContext = {
				sBlockName: "oServiceParams",
				bContent: true,
				oBlock: {}
			};

			try {
				var oAst = mVisitor.parse(fileContent);
				mVisitor.visit(oAst, oGetContext, oGenericHandler.getBlockByName);
				var iConfigProperty = -1;

				for (var i = 0; i < oGetContext.oBlock.properties.length; i++) {
					if (oGetContext.oBlock.properties[i].key.name == "serviceList") {
						iConfigProperty = i;
						break;
					}
				}
				var bMasterCollectionExist = false;
				for (var i = 0; i < oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties.length; i++) {
					if (oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties[i].key.name === "name") {
						oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties[i].value.value = sDataSourceName;
					} else if (oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties[i].key.name === "serviceUrl") {
						oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties[i].value.value = oContent.uri ? oContent.uri : "";
					} else if (oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties[i].key.name === "masterCollection") {
						bMasterCollectionExist = true;
					}
				}

				var oMasterCollection = {
					"type": "Property",
					"key": {
						"type": "Identifier",
						"name": "masterCollection"
					},
					"value": {
						"type": "Literal",
						"value": ""
					},
					"kind": "init"
				};
				if (!bMasterCollectionExist) {
					oGetContext.oBlock.properties[iConfigProperty].value.elements[0].properties.push(oMasterCollection);
				}

				var oPutContext = {
					sBlockName: "oServiceParams",
					oBlock: oGetContext.oBlock
				};

				mVisitor.visit(oAst, oPutContext, function(oNode, oContext) {
					if (oNode.type === esprima.Syntax.Property && oNode.key && oNode.key.name === oContext.sBlockName) {
						oNode.value = oContext.oBlock;
						return false;
					}
					return true;
				});

				newContent = escodegen.generate(oAst);
			} catch (error) {
				oError = new Error("File parsing failed");
				oError.name = "FileParsingFailed";
				throw oError;
			}

			return newContent;
		};

		var _addModel = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getModels = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addConfig = function () {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addExtensionForScaffoldingDataSource = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};		

		var _getConfigs = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addi18nExtensionModel = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _addI18nPath = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
		};

		var _getI18nPath = function() {
			var oError = new Error("This method is not implemented");
			oError.name = "UnimplementedMethod";
			throw oError;
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
			addSourceTemplate: _addSourceTemplate,
			addDependencies: _addDependencies,
			setHCPPlatformBlock: _setHCPPlatformBlock,
			setABAPPlatformBlock: _setABAPPlatformBlock,
			removeDataSource: _removeDataSource,
			removeDataSourceAnnotation: _removeDataSourceAnnotation,
			removeExtension: _removeExtension,
			addModel : _addModel,
			getModels : _getModels,
			addConfig : _addConfig,
			addExtensionForScaffoldingDataSource: _addExtensionForScaffoldingDataSource,
			getConfigs : _getConfigs,
			addi18nExtensionModel : _addi18nExtensionModel,
			addI18nPath : _addI18nPath,
			getI18nPath : _getI18nPath
		};

	});
