define(["sap/watt/platform/plugin/utils/xml/XmlUtil",
    	"../util/ExtensionHook",
    	"../visualExt/util/ExtendUtil"],
	function(xmlUtil, ExtensionHook, ExtendUtil) {

		var ExtensionProject = function() {

			var that = this;
			var CUSTOM = "Custom";

			// For testing purpose - in order to mock ExtendUtil more easily. [Not in the service public API]
			this.getExtendUtil = function (){
				return ExtendUtil;
			};


			this.createFolderName = function(folderName) {
			    /* eslint-disable no-use-before-define */
				return createName(folderName, 0);
				/* eslint-enable no-use-before-define */
			};

			/*
			 * checks if the folder's name already exist.
			 * folderName - string containing folder's name
			 * rootContent - array containing the names of all root folders
			 */
			this.isFolderExist = function(folderName, rootContent) {
				var j = rootContent.length;
				while (j--) {
					if (rootContent[j].name.toLowerCase() === folderName.toLowerCase()) {
						return true;
					}
				}
				return false;
			};

			var createName = function(folderName, index) {
				var tempFolderName = folderName;
				if (index > 0) {
					tempFolderName = tempFolderName + index;
				}

				return that.context.service.filesystem.documentProvider.getRoot().then(function(rootDocument) {
					return rootDocument.getCurrentMetadata().then(function(oRootContent) {
						var exists = that.isFolderExist(tempFolderName, oRootContent);
						if (exists === true) {
							index = index + 1;
							return createName(folderName, index);
						} else {
							return tempFolderName;
						}
					});
				});
			};

			this.getExtensionNamespace = function(extensionProjectPath) {
				return that.context.service.filesystem.documentProvider.getDocument(extensionProjectPath).then(function(extProjDocument) {
					return that.context.service.ui5projecthandler.getAppNamespace(extProjDocument);
				});
			};

			var openDocumentObj = function(oDocument, documentPath) {
				if (oDocument) {
					that.context.service.repositorybrowser.setSelection(oDocument, true).done();
					return that.context.service.document.open(oDocument);
				} else {
				    throw new Error(that.context.i18n.getText("i18n", "ExtensionProjectSRV_wasNotFound", documentPath));
				}
			};
			
			var openDocumentFile = function(documentPath) {
				return that.context.service.filesystem.documentProvider.getDocument(documentPath).then(function(fileDocument) {
					return openDocumentObj(fileDocument, documentPath);
				});
			};

			/*
			 * open the document in the default text editor according to the customization Id
			 */
			this.openDocument = function(extensionProjectPath, extensionCommon, oResourceId, oExtensionId, resourceLocationPath) {
				// Get the project document
				return that.context.service.filesystem.documentProvider.getDocument(extensionProjectPath).then(function(oProjectDoc) {
					// Need to refresh the project first. Without this the relevant file inside the view folder was null!
					return oProjectDoc.refresh().then(function() {
						// Get the handler document
						return that.context.service.ui5projecthandler.getHandlerDocument(oProjectDoc).then(function(oHandlerDoc) {
							// Open the handler document
							return openDocumentObj(oHandlerDoc, oHandlerDoc.getTitle()).then(function() {
								// Get the extensions
								return that.context.service.ui5projecthandler.getAllExtensions(oProjectDoc).then(function(oAllExtensions) {
									// Get the namespace
									return that.context.service.ui5projecthandler.getAppNamespace(oProjectDoc).then(function(sAppNamespace) {
										var customizationId = extensionCommon.customizationId;
										if (!customizationId || !oResourceId) {
											return Q();
										}
			
										var resourceObject = oAllExtensions[customizationId][oResourceId];
										var extensionName = null;
										if (customizationId === "sap.ui.viewExtensions") {
											var extensionId = resourceObject[oExtensionId];
											extensionName = extensionId[extensionCommon.resourceTypeName];
										} else {
											extensionName = resourceObject[extensionCommon.resourceTypeName];
										}
										if (!extensionName) {
											//No extended file to open
											return Q();
										}
										var documentPath = extensionProjectPath;
										if ((typeof resourceLocationPath === "string" || resourceLocationPath instanceof String) && resourceLocationPath !== "") {
											documentPath = documentPath + "/" + resourceLocationPath.replace("/", "");
										}
			
										documentPath = documentPath + extensionName.replace(sAppNamespace, "").replace(/\./g, "/");
										// Open the extension file
										return openDocumentFile(documentPath + extensionCommon.resourceSuffix);
									});
								});
							});
						});
					});
				}).fail(function(oError) {
					that.context.service.log.error("ExtensionProject", "An error has occured. " + oError, ["user"]).done();
					throw oError;
				});
			};

			/*
			 * Opens the layout editor according to the selected element's XML file - either View (Replaced) or Fragment (Extension Point)
			 */
			this.openLayoutEditor = function(sExtensionProjectPath, oNodeModel, oExtensionCommon, sExtensionResourcesPath) {
				var sResourceId = oNodeModel.resourceInfo.originalId || oNodeModel.resourceInfo.id;
				var sExtensionId = oNodeModel.attributes.name;

				return that.context.service.filesystem.documentProvider.getDocument(sExtensionProjectPath).then(function(oProjectDoc) {
					// Need to refresh the project first. Without this the relevant file inside the view folder was null!
					return oProjectDoc.refresh().then(function() {
						// Get the extensions
						return that.context.service.ui5projecthandler.getAllExtensions(oProjectDoc).then(function(oAllExtensions) {
							// Get the namespace
							return that.context.service.ui5projecthandler.getAppNamespace(oProjectDoc).then(function(sAppNamespace) {
								var sCustomizationId = oExtensionCommon.customizationId;
								if (!sCustomizationId || !sResourceId) {
									return Q();
								}

								var oResourceObject = oAllExtensions[sCustomizationId][sResourceId];
								var sExtensionName = null;
								if (sCustomizationId === "sap.ui.viewExtensions") {
									var oExtensionId = oResourceObject[sExtensionId];
									sExtensionName = oExtensionId[oExtensionCommon.resourceTypeName];
								} else {
									sExtensionName = oResourceObject[oExtensionCommon.resourceTypeName];
								}
								if (!sExtensionName) {
									//No extended file to open
									return Q();
								}
								var sDocumentPath = sExtensionProjectPath;

								if ((typeof sExtensionResourcesPath === "string" || sExtensionResourcesPath instanceof String) && sExtensionResourcesPath !== "") {
									// if the extensionResourcesPath isn't part of the path - add it
									sDocumentPath = sDocumentPath + "/" + sExtensionResourcesPath.replace("/", "");
								}

								sDocumentPath = sDocumentPath + sExtensionName.replace(sAppNamespace, "").replace(/\./g, "/") + oExtensionCommon.resourceSuffix;
								// Open the extension file in Layout Editor
								return that.context.service.filesystem.documentProvider.getDocument(sDocumentPath).then(function (oFileDocument) {
									if (oFileDocument) {
										that.context.service.repositorybrowser.setSelection(oFileDocument, true).done();
										return that.context.service.content.open(oFileDocument, that.context.service.ui5wysiwygeditor);
									} else {
										throw new Error(that.context.i18n.getText("i18n", "ExtensionProjectSRV_wasNotFound", sDocumentPath));
									}
								});
							});
						});
					});
				}).fail(function(oError) {
					that.context.service.log.error("ExtensionProject", "An error has occurred. " + oError, ["user"]).done();
					throw oError;
				});
			};

			// type - "view" or "controller"
			this.getExtendedResourceInfo = function(extensionProjectPath, sResourceLocationPath, originalResourceInfo, resourceType, mAllExtensions, sNamespace) {
				var extendedResourceMetadata = that._getExtendedResourceMetadata(originalResourceInfo, resourceType, extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace);
				if (extendedResourceMetadata.extendedResourcePath) {
					return that.context.service.filesystem.documentProvider.getDocument(extendedResourceMetadata.extendedResourcePath).then(function(resourceDocument) {
						if (resourceDocument) {
							return resourceDocument.getContent().then(function(fileContent) {
                                var resourceName = resourceDocument.getEntity().getName();
                                return that._getExtendedResourceInfo(fileContent, resourceType, resourceName, extendedResourceMetadata.resourceSuffix, 
                                    extendedResourceMetadata.replacedResourceId, extendedResourceMetadata.originalResourceId);
							});
						} else {
                            return {};
						}
					});
				}

				return {};
			};

            this._getExtendedResourceInfo = function(sResourceFileContent, resourceType, resourceName, resourceSuffix, replacedResourceId, originalResourceId) {
				var xmlFile = sResourceFileContent;
				if (resourceType === "view") {
					xmlFile = xmlUtil.stringToXml(sResourceFileContent);
				}

				var resourceInfo = {
					"name": resourceName.replace(resourceSuffix, ""),
					"id": replacedResourceId,
					"resourceContent": xmlFile,
					"originalId": originalResourceId,
					"originalName": originalResourceId
						.substr(originalResourceId.lastIndexOf(".") + 1),
					"isExtended": true,
					"type": resourceType
				};

				return resourceInfo;
            };

            this._getResourceConsts = function(resourceType) {
				var resourceConsts = {
                    customizationId: "sap.ui.viewReplacements",
                    resourceSuffix: ".view.xml",
                    resourceTypeName: "viewName"
				};

				if (resourceType === "controller") {
					resourceConsts.customizationId = "sap.ui.controllerExtensions";
					resourceConsts.resourceSuffix = ".controller.js";
					resourceConsts.resourceTypeName = "controllerName";
				}
				return resourceConsts;
            };

            this._getExtendedResourceMetadata = function(originalResourceInfo, resourceType, extensionProjectPath, sResourceLocationPath, mAllExtensions, sNamespace) {
				var resourceMetadata = that._getResourceConsts(resourceType);
				resourceMetadata.originalResourceId = originalResourceInfo.id;

				var customizationIdJson = mAllExtensions[resourceMetadata.customizationId];
				if (customizationIdJson) {
					var resourceIdJson = customizationIdJson[resourceMetadata.originalResourceId];
					if (resourceIdJson) {
						resourceMetadata.replacedResourceId = resourceIdJson[resourceMetadata.resourceTypeName];
							resourceMetadata.extendedResourcePath = that.getExtendUtil().getCustomResourceFilePath(resourceMetadata.replacedResourceId, sNamespace, extensionProjectPath,
								resourceMetadata.resourceSuffix, sResourceLocationPath);
							return resourceMetadata;
					}
				}
				return resourceMetadata;
            };

			this.getCustomizingJson = function(extensionProjectPath) {
				return that.context.service.filesystem.documentProvider.getDocument(extensionProjectPath).then(function(oProjectDoc) {
					return that.context.service.ui5projecthandler.getAllExtensions(oProjectDoc);
				});
			};

			this.updateFileContent = function(fileDocument, newContent) {
				return fileDocument.setContent(newContent).then(function() {
					return fileDocument.save();
				});
			};
			
			/**
			 * return the relative path within the extension project to the resource folder
			 */
			this.getResourceLocation = function(extensionProjectPath){
				return that.context.service.filesystem.documentProvider.getDocument(extensionProjectPath).then(function(extProjDocument) {
					return extProjDocument.getCurrentMetadata(true).then(function(aRawData) {
						for (var i = 0; i < aRawData.length; i++) {
							var oRawData = aRawData[i];
							if(oRawData.name === "Component.js" && !oRawData.folder){
								var componentFolderPath = oRawData.parentPath;
								componentFolderPath = componentFolderPath.replace(extensionProjectPath, "") + "/";
							if(componentFolderPath.indexOf("/") === 0){
								componentFolderPath = componentFolderPath.substring(1); // remove first "/" if exists
								return componentFolderPath;
								}
							}
						}
					return "";
					});
				});
			};

			// returns .project.json file content
			this.getExtensibilityModel = function(extensionProjectPath) {
				var oDeferred = Q.defer();
				var that2 = this;
				var filePath = extensionProjectPath + "/.project.json";
				this.context.service.filesystem.documentProvider.getDocument(filePath).then(function(projectJsonDocument) {
					if (projectJsonDocument) {
						projectJsonDocument.getContent().then(function(fileContent) {
							if (fileContent.length === 0) {
								oDeferred.reject(that2.context.i18n.getText("i18n", "ExtensionProjectSRV_ProjectJsonEmpty"));
							} else { //file content is not empty
								try {
									var projectJson = jQuery.parseJSON(fileContent);
									oDeferred.resolve(projectJson);
								} catch (e) {
									error = that2.context.i18n.getText("i18n", "ExtensionProjectSRV_ProjectJsonContentInvalid");
									oDeferred.reject(error);
								}
							}
						}).fail(function() {
							oDeferred.reject(that2.context.i18n.getText("i18n", "ExtensionProjectSRV_ProjectJsonNotFound", [extensionProjectPath]));
						});
					} else {
						var error = {};
						error = that2.context.i18n.getText("i18n", "ExtensionProjectSRV_ProjectJsonNotFound", [extensionProjectPath]);

						oDeferred.reject(error);
					}
				}).fail(function(error) {
					error = that2.context.i18n.getText("i18n", "ExtensionProjectSRV_wasNotFound", [extensionProjectPath]);
					oDeferred.reject(error);
				});

				return oDeferred.promise;
			};

			this.isExtendable = function(extensionProjectPath, customizingId, viewId) {
				return this.getCustomizingJson(extensionProjectPath).then(function(customizingJson) {
					var viewReplacements = customizingJson["sap.ui.viewReplacements"];

					if (customizingId === "sap.ui.viewReplacements") {
						if (viewReplacements && (viewId in viewReplacements)) {
							return false;
						}
					} else if (customizingId === "sap.ui.viewExtensions" || customizingId === "sap.ui.viewModifications") {
						if (viewReplacements && (viewId in viewReplacements)) {
							return false;
						}
					}

					return true;
				});
			};

			this.getExtensionRevision = function(model) {
				var index = 0;
				var extensionCommon = model.fiori.extensionCommon;

				if (!extensionCommon.resourceName) {
					return index;
				}

				var filePath = extensionCommon.resourceLocationPath + extensionCommon.resourceName;
				if (extensionCommon.extensionId) {
					filePath = filePath + "_" + extensionCommon.extensionId;
				}
				filePath = filePath.replace(/%2f/gm, "/");
				var isCustomized = extensionCommon.originalId && !jQuery.sap.endsWith(extensionCommon.originalId, extensionCommon.resourceName);
				if (!isCustomized) { // Add the suffix only if we don't already have a customized resource
					filePath = filePath + CUSTOM;
				}

				var fileSuffix = model.fiori.extensionCommon.resourceSuffix;

				var oDeferred = Q.defer();
				/* eslint-disable no-use-before-define */
				that.findExtensionRevision(model, filePath, fileSuffix, index, oDeferred);
				/* eslint-enable no-use-before-define */
				return oDeferred.promise;
			};

			this.findExtensionRevision = function(model, filePath, fileSuffix, index, oDeferred) {
				var tempExtensionName = model.extensionProjectName + "/" + filePath;
				if (index > 0) {
					tempExtensionName = tempExtensionName + index;
				}
				tempExtensionName = tempExtensionName + fileSuffix;

				that.context.service.filesystem.documentProvider.getRoot().then(function(rootDocument) {
					rootDocument.objectExists(tempExtensionName).then(function(exists) {
						if (exists === true) {
							index = index + 1;
							that.findExtensionRevision(model, filePath, fileSuffix, index, oDeferred);
						} else {
							if (index > 0) {
								model.fiori.extensionCommon.extensionFilePath = filePath + index;
							} else {
								model.fiori.extensionCommon.extensionFilePath = filePath;
							}
							oDeferred.resolve(index);
						}
					}).fail(function(sError) {
						oDeferred.reject(sError);
					});
				}).fail(function(sError) {
					oDeferred.reject(sError);
				});
			};

			/*
			 * validate extension project contain .project.json file and content contain extensibility
			 */
			this.validateExtensionProject = function(extensionProjectPath) {
				var result = {};

				if (extensionProjectPath === "/") {
					result = {
						isValid: false,
						message: this.context.i18n.getText("i18n", "ExtensionProjectSRV_ExtensionProjectMustPointToExistingFolder")
					};
					return Q(result);
				}

				return this.getExtensibilityModel(extensionProjectPath).then(function(projectJson) {
					if (projectJson.extensibility && !jQuery.isEmptyObject(projectJson.extensibility.views) && !jQuery.isEmptyObject(projectJson.extensibility.controllers)) {
						result = {
							isValid: true,
							projectJson: projectJson,
							extensibility: projectJson.extensibility
						};
						return result;
					} else { // there is no extensibility parameter
						result = {
							isValid: false,
							message: that.context.i18n.getText("i18n", "ExtensionProjectSRV_ExtensionProjectNotValid")
						};
						return result;
					}
				}).fail(function(error) {
					result = {
						isValid: false,
						message: error
					};
					return result;
				});
			};

			this.isHookExtendedInController = function(hookName, controllerName, model) {
				return that.getExtendUtil().getCustomControllerDocument(controllerName, model, that.context).then(function(oDocument) {
					return oDocument.getContent().then(function(fileContent) {
						try {
							return ExtensionHook.isHookExtended(hookName, fileContent);
						} catch (err) {
							var errMsg = that.context.i18n.getText("i18n", "ExtensionProject_IsHookExtendedWizardErr", [hookName, err]);
							that.context.service.log.error(that.context.i18n.getText("i18n", "Extension_LogTitle"), errMsg, ["system"]).done();
							throw new Error(errMsg);
						}
					});
				});
			};
		};

		return ExtensionProject;
	});