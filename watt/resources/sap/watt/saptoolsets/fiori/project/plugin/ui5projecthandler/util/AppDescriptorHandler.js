define(["sap/watt/lib/lodash/lodash"], function(_) {
		"use strict";

		var FILE_NAME = "manifest.json";
		var _oOpenQueue = new Q.sap.Queue();

		var _getContent = function (oDocument, oContext) {
			return oContext.service.filesystem.jsonProvider.getJSONContent(oDocument)
				.then(function(oDescriptorContent) {
					return oDescriptorContent;
				}).fail(function() {
					var oError = new Error(oContext.i18n.getText("i18n",
						"projectHandler_manifestFileIsNotValid"));
					oError.name = "FileIsNotValid";
					throw oError;
				});
		};

		var _getAttribute = function(oDocument, sAttributeName, oContext) {
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				var results = _getKeyInObj(oDescriptorContent, sAttributeName);
				var oAtrJSON = {};
				if (!_.isEmpty(results)) {
					oAtrJSON = _.get(results[0], sAttributeName);
				}
				return oAtrJSON;
			});
		};

		var _getHandlerFileName = function () {
			return FILE_NAME;
		};

		var _getHandlerFilePath = function(oDocument) {
			var sFullPath = oDocument.getEntity().getFullPath();
			var index = sFullPath.lastIndexOf("/");
			return sFullPath.substr(0, index);
		};
		
		var _getAppNamespace = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sap.app", oContext).then(function(oSAPApp) {
				var appNamespace;
				if (!_.isEmpty(oSAPApp)) {
					appNamespace = _.get(oSAPApp, "id");
				}
				return appNamespace ? appNamespace : "";
			});
		};

		var _getDataSources = function(oDocument, oContext) {
			return _getAttribute(oDocument, "dataSources", oContext).then(function(oDataSources) {
				return oDataSources;
			});
		};

		var _getAllDataSourceNames = function (oDocument, oContext) {
			return _getDataSources(oDocument, oContext).then(function (oDataSources) {
				return Object.keys(oDataSources);
			});
		};

		var _getDataSourcesByName = function(oDocument, sDataSourceName, oContext) {
			return _getDataSources(oDocument, oContext).then(function(oDataSources) {
				var oDataSource = {};
				if (!_.isEmpty(oDataSources)) {
					oDataSource = _.get(oDataSources, sDataSourceName);
				}
				return oDataSource ? oDataSource : {};
			});
		};

		var _getDataSourceAnnotationsByName = function(oDocument, sDataSourceName, oContext) {
			return _getDataSources(oDocument, oContext).then(function(oDataSources) {
				var aDataSourceAnnotations = [];
				if (!_.isEmpty(oDataSources)) {
					var oDataSource = _.get(oDataSources, sDataSourceName);
					var results = _getKeyInObj(oDataSource, "annotations");
					var aAnnotations = [];
					if (!_.isEmpty(results)) {
						aAnnotations = _.get(results[0], "annotations");
					}
					var iAnnotationsLength = aAnnotations ? aAnnotations.length : 0;
					for (var i=0; i < iAnnotationsLength; i++) {
						aDataSourceAnnotations[aAnnotations[i]] = _.get(oDataSources, aAnnotations[i]);
					}
				}
				return aDataSourceAnnotations;
			});
		};

		var _getDataSourcesByType = function(oDocument, sDataSourceType, oContext) {
			return _getDataSources(oDocument, oContext).then(function(oDataSources) {
				var aDataSources = [];
				if (!_.isEmpty(oDataSources)) {

					for (var key in oDataSources) {
						var oDataSource = oDataSources[key];
						if (sDataSourceType && oDataSource.type === sDataSourceType) {
							aDataSources[key] = oDataSource;
						}
						// Handles OData type as default
						if (sDataSourceType === "OData" &&  !oDataSource.type) {
							aDataSources[key] = oDataSource;
						}
					}
				}
				return aDataSources;
			});
		};

		var _getSourceTemplate = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sourceTemplate", oContext).then(function(oSourceTemplate) {
				return oSourceTemplate;
			});
		};

		var _getDependencies = function(oDocument, oContext) {
			return _getAttribute(oDocument, "dependencies", oContext).then(function(oDataSources) {
				return oDataSources;
			});
		};

		var _getAllExtensions = function (oDocument, oContext) {
			return _getAttribute(oDocument, "extensions", oContext).then(function (oExtensions) {
				return oExtensions;
			});
		};

		var _isScaffoldingBased = function (oDocument, oContext) {
			return _getAttribute(oDocument, "extends", oContext).then(function (oExtendBlock) {

				if(_.isEmpty(oExtendBlock)) {
					return false;
				}

				var oComponentName = oExtendBlock.component;
				// The only indication in manifest.json of scaffolding is if the application extends it
				return !!(!_.isUndefined(oComponentName) && oComponentName === "sap.ca.scfld.md");
			});
		};

		var _addExtension = function (oDocument, sExtensionType, sViewName, oContent, bOverwrite, oContext) {
			var oError;
			if (_.isUndefined(sExtensionType) || _.isNull(sExtensionType)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionNotDefined"));
				oError.name = "ExtensionNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(sViewName) || _.isNull(sViewName)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_viewNotDefined"));
				oError.name = "ViewNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}

			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getAllExtensions(oDocument, oContext).then(function (oExtensions) {
					var oExtension;
					// Try to locate existing extension
					if (!_.isEmpty(oExtensions)) {
						var oExtensionType = oExtensions[sExtensionType];
						if (!_.isUndefined(oExtensionType)) {
							oExtension = oExtensionType[sViewName];
						}
					}
					// Extension exists
					if (!_.isUndefined(oExtension) && !_.isNull(oExtension)) {
						switch (sExtensionType) {
							// There can be only one replacement for view/controller
							case "sap.ui.viewReplacements":
							case "sap.ui.controllerExtensions":
								if (!bOverwrite) {
									oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionExistInHandler"));
									oError.name = "ExtensionExistInHandler";
									throw oError;
								}

								oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType][sViewName] = oContent;
								break;
							// Several elements in the same view can be extended
							case "sap.ui.viewExtensions":
							case "sap.ui.viewModifications":
								var aKeys = Object.keys(oContent);
								var oViewExtensions = oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType][sViewName];
								var oView = oViewExtensions[aKeys[0]];
								if (!_.isUndefined(oView) && !_.isNull(oView)) {
									if (!bOverwrite) {
										oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionExistInHandler"));
										oError.name = "ExtensionExistInHandler";
										throw oError;
									}
								}
								for (var i = 0; i < aKeys.length; ++i) {
									if (!oViewExtensions[aKeys[i]] || bOverwrite) {
										oViewExtensions[aKeys[i]] = oContent[aKeys[i]];
									}
								}
								oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType][sViewName] = oViewExtensions;
								break;
						}
					} else {
						// build extensions section if doesn't exist
						if(typeof (oDescriptorContent["sap.ui5"]) !== "object" ||
							oDescriptorContent["sap.ui5"] === null) {
							oDescriptorContent["sap.ui5"] = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].extends) !== "object" ||
							oDescriptorContent["sap.ui5"].extends === null) {
							oDescriptorContent["sap.ui5"].extends = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].extends.extensions) !== "object" ||
							oDescriptorContent["sap.ui5"].extends.extensions === null) {
							oDescriptorContent["sap.ui5"].extends.extensions = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType]) !== "object" ||
							oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType] === null) {
							oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType] = {};
						}
						oDescriptorContent["sap.ui5"].extends.extensions[sExtensionType][sViewName] = oContent;
					}

					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _addDataSource = function(oDocument, sDataSourceName, oContent, bOverwrite, oContext) {
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNameNotDefined"));
				oError.name = "DataSourceNameNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getDataSources(oDocument, oContext).then(function (oDataSources) {
					var oDataSource = {};
					if (!_.isEmpty(oDataSources)) {
						oDataSource = _.get(oDataSources, sDataSourceName);
					}
					// Data source already exists
					if (!_.isEmpty(oDataSource)) {
						if (!bOverwrite) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNameExistInManifest"));
							oError.name = "DataSourceNameExistInManifest";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.app"]) !== "object" ||
							oDescriptorContent["sap.app"] === null) {
							oDescriptorContent["sap.app"] = {};
						}
						if(typeof (oDescriptorContent["sap.app"].dataSources) !== "object" ||
							oDescriptorContent["sap.app"].dataSources === null) {
							oDescriptorContent["sap.app"].dataSources = {};
						}
					}
					// If data sources exist use them otherwise use the new one.
					oDataSources = !_.isEmpty(oDataSources) ? oDataSources : oDescriptorContent["sap.app"].dataSources;
					oDataSources[sDataSourceName] = oContent;
					oDescriptorContent["sap.app"].dataSources = oDataSources;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};


		var _addAnnotationToExistingDataSource = function(oDataSource, oDataSources, sGivenAnnotationName, bOverwrite, oContext) {
			var oDataSourceType = _.get(oDataSource, "type");
			// Data source type is not OData - throws an error
			if (!((oDataSourceType === "OData" || _.isUndefined(oDataSourceType) || _.isNull(oDataSourceType)))) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceWrongType"));
				oError.name = "DataSourceWrongType";
				throw oError;
			}

			// Annotation is already exist under data sources and the overwrite flag is false
			if (!_.isEmpty(_.get(oDataSources, sGivenAnnotationName)) && !bOverwrite) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_annotationExistInManifest"));
				oError.name = "AnnotationExistInManifest";
				throw oError;
			}

			var oDataSourceSettings = _.get(oDataSource, "settings");
			if (oDataSourceSettings) {
				var oDataSourceAnnotations = _.get(oDataSourceSettings, "annotations");

				if (!_.isEmpty(oDataSourceAnnotations)) {
					if (!_.contains(oDataSourceAnnotations, sGivenAnnotationName)) {
						oDataSourceAnnotations.push(sGivenAnnotationName);
					}
				} else {
					// "annotations" not found under settings - adding new section
					oDataSourceSettings["annotations"] = [];
					oDataSourceSettings["annotations"].push(sGivenAnnotationName);
				}
			} else {
				// "settings" not found under current data source - adding new section
				oDataSource["settings"] = {};
				oDataSource["settings"]["annotations"] = [];
				oDataSource["settings"]["annotations"].push(sGivenAnnotationName);
			}
		};

		var _addDataSourceAnnotation = function(oDocument, sDataSourceName, oContent, bOverwrite, oContext) {
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNameNotDefined"));
				oError.name = "DataSourceNameNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getDataSources(oDocument, oContext).then(function (oDataSources) {
					var oDataSource = {};
					if (!_.isEmpty(oDataSources)) {
						oDataSource = _.get(oDataSources, sDataSourceName);
					}

					var sGivenAnnotationName = _.keys(oContent)[0];
					var oGivenAnnotationObject = _.get(oContent, sGivenAnnotationName);

					// Data source exists
					if (!_.isEmpty(oDataSource)) {
						_addAnnotationToExistingDataSource(oDataSource, oDataSources, sGivenAnnotationName, bOverwrite, oContext);
					} else {
						// Data source does not exist - throws error
						var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNotExistInManifest"));
						oError.name = "DataSourceNotExistInManifest";
						throw oError;
					}

					oDataSources[sGivenAnnotationName] = oGivenAnnotationObject;
					oDescriptorContent["sap.app"].dataSources = oDataSources;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _addSourceTemplate = function(oDocument, oContent, bOverwrite, oContext) {
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getAttribute(oDocument, "sourceTemplate", oContext).then(function(oSourceTemplate) {
					// Source Template already exists
					if (!_.isEmpty(oSourceTemplate)) {
						if (!bOverwrite) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_sourceTemplateExistInManifest"));
							oError.name = "SourceTemplateExistInManifest";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.app"]) !== "object" ||
							oDescriptorContent["sap.app"] === null) {
							oDescriptorContent["sap.app"] = {};
						}
						if(typeof (oDescriptorContent["sap.app"].sourceTemplate) !== "object" ||
							oDescriptorContent["sap.app"].sourceTemplate === null) {
							oDescriptorContent["sap.app"].sourceTemplate = {};
						}
					}
					oDescriptorContent["sap.app"].sourceTemplate = oContent;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _addDependencies = function(oDocument, oContent, bOverwrite, oContext) {
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getAttribute(oDocument, "dependencies", oContext).then(function(oDependencies) {
					// dependencies already exists
					if (!_.isEmpty(oDependencies)) {
						if (!bOverwrite) {
							oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dependenciesExistInManifest"));
							oError.name = "DependenciesExistInManifest";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.ui5"]) !== "object" ||
							oDescriptorContent["sap.ui5"] === null) {
							oDescriptorContent["sap.ui5"] = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].dependencies) !== "object" ||
							oDescriptorContent["sap.ui5"].dependencies === null) {
							oDescriptorContent["sap.ui5"].dependencies = {};
						}
					}
					oDescriptorContent["sap.ui5"].dependencies = oContent;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _setHCPPlatformBlock = function(oDocument, oContent, oContext) {
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			if (!oContent._version) {
				oContent._version = "1.1.0"; //default version for HCP block unless other version provided with content
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				oDescriptorContent["sap.platform.hcp"] = oContent;
				return _oOpenQueue.next(function() {
					return _setContent(oDocument, oDescriptorContent, oContext);
				});
			});
		};

		var _setABAPPlatformBlock = function(oDocument, oContent, oContext) {
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}
			if (!oContent._version) {
				oContent._version = "1.1.0"; //default version for HCP block unless other version provided with content
			}

			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
					oDescriptorContent["sap.platform.abap"] = oContent;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
			});
		};

		var _removeExtension = function (oDocument, sExtensionType, sViewName, sExtendedElement, oContext) {
			var oError;
			// Check params
			if (_.isUndefined(sExtensionType) || _.isNull(sExtensionType)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionNotDefined"));
				oError.name = "ExtensionNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(sViewName) || _.isNull(sViewName)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_viewNotDefined"));
				oError.name = "ViewNotDefined";
				return Q.reject(oError);
			}

			return _getAllExtensions(oDocument, oContext).then(function (oExtensions) {
				if(!_.isEmpty(oExtensions)) {
					return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
						var oViewExtension = {};
						if(oExtensions[sExtensionType] && oExtensions[sExtensionType][sViewName]) {
							oViewExtension = oExtensions[sExtensionType][sViewName];
						}

						if(!_.isEmpty(oViewExtension)) {
							if (!sExtendedElement || typeof (sExtendedElement) !== "string") {
								// If element not specified delete whole view reference
								delete oExtensions[sExtensionType][sViewName];

							} else {
								// Otherwise remove the current element extension
								var oExtendedElement = oViewExtension[sExtendedElement] ? oViewExtension[sExtendedElement] : {};
								if(!_.isEmpty(oExtendedElement)) {
									delete oExtensions[sExtensionType][sViewName][sExtendedElement];
									if (_.isEmpty(oExtensions[sExtensionType][sViewName])) {
										delete oExtensions[sExtensionType][sViewName];
									}
								} else {
									oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionNotFound"));
									oError.name = "ExtensionNotFound";
									throw oError;
								}
							}

							if (_.isEmpty(oExtensions[sExtensionType])) {
								delete oExtensions[sExtensionType];
							}

							oDescriptorContent["sap.ui5"].extends.extensions = oExtensions;
							return _oOpenQueue.next(function() {
								return _setContent(oDocument, oDescriptorContent, oContext);
							});
						} else {
							oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionNotFound"));
							oError.name = "ExtensionNotFound";
							throw oError;
						}
					});
				} else {
					oError = new Error(oContext.i18n.getText("i18n", "projectHandler_extensionNotFound"));
					oError.name = "ExtensionNotFound";
					throw oError;
				}
			});
		};

		var _removeDataSource = function(oDocument, sDataSourceName, oContext) {
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNameNotDefined"));
				oError.name = "DataSourceNameNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getDataSources(oDocument, oContext).then(function (oDataSources) {
					var oDataSource = {};
					if (!_.isEmpty(oDataSources)) {
						oDataSource = _.get(oDataSources, sDataSourceName);
					}
					// Data source already exists
					if (!_.isEmpty(oDataSource)) {
						delete oDataSources[sDataSourceName];
						oDescriptorContent["sap.app"].dataSources = oDataSources;
					} else {
						var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_removeDataSourceNotExistInManifest"));
						oError.name = "DataSourceNotExistInManifest";
						throw oError;
					}
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _removeDataSourceAnnotation = function(oDocument, sDataSourceName, sAnnotationName, oContext) {
			if (_.isUndefined(sDataSourceName) || _.isNull(sDataSourceName)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNameNotDefined"));
				oError.name = "DataSourceNameNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(sAnnotationName) || _.isNull(sAnnotationName)) {
				var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_annotationNameNotDefined"));
				oError.name = "AnnotationNameNotDefined";
				return Q.reject(oError);
			}
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getDataSources(oDocument, oContext).then(function (oDataSources) {
					var oDataSource = {};
					if (!_.isEmpty(oDataSources)) {
						oDataSource = _.get(oDataSources, sDataSourceName);
					}
					// Data source exist
					if (!_.isEmpty(oDataSource)) {

						var oDataSourceType = _.get(oDataSource, "type");
						// Data source type is not OData - throws an error
						if (!((oDataSourceType === "OData" || _.isUndefined(oDataSourceType) || _.isNull(oDataSourceType)))) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_removeDataSourceWrongType"));
							oError.name = "DataSourceWrongType";
							throw oError;
						}
						var oDataSourceSettings = _.get(oDataSource, "settings");
						if (oDataSourceSettings) {
							var oDataSourceAnnotations = _.get(oDataSourceSettings, "annotations");
							if (!_.isEmpty(oDataSourceAnnotations)) {
								if (_.contains(oDataSourceAnnotations, sAnnotationName)) {
									oDataSourceAnnotations = _.without(oDataSourceAnnotations, sAnnotationName);
									oDataSources[sDataSourceName].settings.annotations = oDataSourceAnnotations;
									oDescriptorContent["sap.app"].dataSources = oDataSources;
								} else {
									var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNotContainGiveAnnotation"));
									oError.name = "DataSourceNotContainGiveAnnotation";
									throw oError;
								}
							} else {
								var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNotContainAnnotations"));
								oError.name = "DataSourceNotContainAnnotations";
								throw oError;
							}
						} else {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_dataSourceNotContainSettings"));
							oError.name = "DataSourceNotContainSettings";
							throw oError;
						}
					} else {
						var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_removeDataSourceNotExistInManifest"));
						oError.name = "DataSourceNotExistInManifest";
						throw oError;
					}
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _setContent = function(oDescriptorDocument, oContent, oContext) {
			return oContext.service.filesystem.jsonProvider.writeJsonByDocument(oDescriptorDocument, oContent).
				then(function(bResults) {
					return bResults;
				});
		};

		var _getKeyInObj = function (obj, key) {
			if (_.has(obj, key)) {
				// or just (key in obj)
				return [obj];
			}
			var res = [];
			_.forEach(obj, function(v) {
				if (typeof v === "object" && (v = _getKeyInObj(v, key)).length) {
					res.push.apply(res, v);
				}
			});
			return res;
		};

		var _getModels = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sap.ui5", oContext).then(function(oSAPUI5) {
				var oModels;
				if (!_.isEmpty(oSAPUI5)) {
					oModels = _.get(oSAPUI5, "models");
				}
				return oModels ? oModels : undefined;
			});
		};

		var _addModel = function (oDocument, sModelName, oContent, bOverwrite, oContext) {
			var oError;
			if (_.isUndefined(sModelName) || _.isNull(sModelName)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_modelNotDefined"));
				oError.name = "ModelNotDefined";
				return Q.reject(oError);
			}
			if (_.isUndefined(oContent) || _.isNull(oContent)) {
				oError = new Error(oContext.i18n.getText("i18n", "projectHandler_contentNotDefined"));
				oError.name = "ContentNotDefined";
				return Q.reject(oError);
			}

			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getModels(oDocument, oContext).then(function (oModels) {
					var oModel = {};
					if (!_.isEmpty(oModels)) {
						oModel = _.get(oModels, sModelName);
					}
					// model already exists
					if (!_.isEmpty(oModel)) {
						if (!bOverwrite) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_modelNameExistInManifest"));
							oError.name = "ModelNameExistInManifest";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.ui5"]) !== "object" ||
							oDescriptorContent["sap.ui5"] === null) {
							oDescriptorContent["sap.ui5"] = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].models) !== "object" ||
							oDescriptorContent["sap.ui5"].models === null) {
							oDescriptorContent["sap.ui5"].models = {};
						}
					}
					// If models exist use them otherwise use the new one.
					oModels = !_.isEmpty(oModels) ? oModels : oDescriptorContent["sap.ui5"].models;
					oModels[sModelName] = oContent;
					oDescriptorContent["sap.ui5"].models = oModels;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _getI18nPath = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sap.app", oContext).then(function(oSAPApp) {
				var sI18nPath;
				if (!_.isEmpty(oSAPApp)) {
					sI18nPath = _.get(oSAPApp, "i18n");
				}
				return sI18nPath ? sI18nPath : undefined;
			});
		};

		var _addI18nPath = function(oDocument, sUri, bOverwrite, oContext) {
			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getI18nPath(oDocument, oContext).then(function (sI18nPath) {
					if (sI18nPath) { // path exists
						if (!bOverwrite) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_i18nPathExistInManifest"));
							oError.name = "i18nPathExistInManifest";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.app"]) !== "object" ||
							oDescriptorContent["sap.app"] === null) {
							oDescriptorContent["sap.app"] = {};
						}
						if(typeof (oDescriptorContent["sap.app"].i18n) !== "string" ||
							oDescriptorContent["sap.app"].i18n === null) {
							oDescriptorContent["sap.app"].i18n = "";
						}
					}
					// If configs exist use them otherwise use the new one.
					sI18nPath = sI18nPath ? sI18nPath : oDescriptorContent["sap.app"].i18n;
					oDescriptorContent["sap.app"].i18n = sUri;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _getConfigs = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sap.ui5", oContext).then(function(oSAPUI5) {
				var oConfig;
				if (!_.isEmpty(oSAPUI5)) {
					oConfig = _.get(oSAPUI5, "config");
				}
				return oConfig ? oConfig : undefined;
			});
		};

		var _addConfig = function (oDocument, sConfigName, oContent, bOverwrite, oContext) {
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

			return _getContent(oDocument, oContext).then(function(oDescriptorContent) {
				return _getConfigs(oDocument, oContext).then(function (oConfigs) {
					var oConfig = {};
					if (!_.isEmpty(oConfigs)) {
						oConfig = _.get(oConfigs, sConfigName);
					}
					// config already exists
					if (!_.isEmpty(oConfig)) {
						if (!bOverwrite) {
							var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_configNameExistInManifest"));
							oError.name = "ConfigNameExist";
							throw oError;
						}
					} else {
						if(typeof (oDescriptorContent["sap.ui5"]) !== "object" ||
							oDescriptorContent["sap.ui5"] === null) {
							oDescriptorContent["sap.ui5"] = {};
						}
						if(typeof (oDescriptorContent["sap.ui5"].config) !== "object" ||
							oDescriptorContent["sap.ui5"].config === null) {
							oDescriptorContent["sap.ui5"].config = {};
						}
					}
					// If configs exist use them otherwise use the new one.
					oConfigs = !_.isEmpty(oConfigs) ? oConfigs : oDescriptorContent["sap.ui5"].config;
					oConfigs[sConfigName] = oContent;
					oDescriptorContent["sap.ui5"].config = oConfigs;
					return _oOpenQueue.next(function() {
						return _setContent(oDocument, oDescriptorContent, oContext);
					});
				});
			});
		};

		var _addExtensionForScaffoldingDataSource = function(oDocument, sDataSourceName, sUri, sLocalUri, bIsDefault, bOverwrite, oContext) {
			var oDataSource = {
				"uri": sUri,
				"settings": {
					"localUri": sLocalUri
				}
			};
			return _addDataSource(oDocument, sDataSourceName, oDataSource, bOverwrite, oContext).then(function(bDataSourceAdded) {
				if (bDataSourceAdded) {
					var oConfig = [{
						"name": sDataSourceName,
						"isDefault": bIsDefault
					}];
					return _addConfig(oDocument, "sap.ca.serviceConfigs", oConfig, bOverwrite, oContext);
				} else {
					return false;
				}
			});
		};

		var _addi18nExtensionModel = function(oDocument, sUri, bOverwrite, oContext) {
			return _getAppNamespace(oDocument, oContext).then(function(sExtnesionAppNamespace) {
				// calculate bundle name out of the uri
				var sBundleName = sUri;
				var index = sBundleName.lastIndexOf(".properties");
				if (index !== -1) {
					sBundleName = sBundleName.substring(0, index); //remove '.properties'
				}
				sBundleName = sExtnesionAppNamespace + "." + sBundleName.split("/").join("."); //add namespace and replace '/' with '.'
				// create the i18n model
				var oContent = {
					type : "sap.ui.model.resource.ResourceModel",
					settings : {
						bundleName : sBundleName
					}
				};
				return _addModel(oDocument, "i18n", oContent, bOverwrite, oContext).then(function() {
					// update the path to the i18n properties in sap.app
					return _addI18nPath(oDocument, sUri, true, oContext);
				});
			});
		};

		var _getAppType = function(oDocument, oContext) {
			return _getAttribute(oDocument, "sap.app", oContext).then(function(oSAPApp) {
				var sAppType;
				if (!_.isEmpty(oSAPApp)) {
					sAppType = _.get(oSAPApp, "type");
				}
				return sAppType ? sAppType : "";
			});
		};

		return {
			getAttribute: _getAttribute,
			getHandlerFileName : _getHandlerFileName,
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
			isScaffoldingBased : _isScaffoldingBased,
			addExtension: _addExtension,
			addDataSource: _addDataSource,
			addDataSourceAnnotation: _addDataSourceAnnotation,
			addSourceTemplate: _addSourceTemplate,
			addDependencies: _addDependencies,
			setHCPPlatformBlock: _setHCPPlatformBlock,
			setABAPPlatformBlock: _setABAPPlatformBlock,
			removeDataSource: _removeDataSource,
			removeDataSourceAnnotation: _removeDataSourceAnnotation,
			removeExtension : _removeExtension,
			addModel : _addModel,
			getModels : _getModels,
			addConfig : _addConfig,
			addExtensionForScaffoldingDataSource: _addExtensionForScaffoldingDataSource,
			getConfigs : _getConfigs,
			addi18nExtensionModel : _addi18nExtensionModel,
			addI18nPath : _addI18nPath,
			getI18nPath : _getI18nPath,
			getAppType : _getAppType
		};

	});
