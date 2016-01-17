define(["sap/watt/platform/plugin/utils/xml/XmlUtil", "../util/ExtensionHook", "sap/watt/lib/lodash/lodash"],
	function(xmlUtil, ExtensionHook, _) {

		var ParentProject = function() {

			var that = this;
			var defaultViewSuffix = ".view.xml";
			var defaultFragmentSuffix = ".fragment.xml";
			var defaultControllerSuffix = ".controller.js";
			var dbgControllerSuffix = "-dbg.controller.js";
			var COMPONENT_JS = "Component.js";
			var PARENT_TYPE_WORKSPACE = "Workspace";
			var PARENT_TYPE_HCP		  = "hcp";
			var PARENT_TYPE_BSP		  = "BSP";
			var PARENT_TYPE_ABAP_REP  = "abaprep";

			var getParentProjectService = function(type) {
				if (type === PARENT_TYPE_WORKSPACE) {
					return that.context.service.workspaceparentproject;
				} else if (type === PARENT_TYPE_BSP || type === PARENT_TYPE_ABAP_REP) {
					return that.context.service.bspparentproject;
				} else if (type === PARENT_TYPE_HCP) {
					return that.context.service.heliumparentproject;
				} else {
					throw new Error(that.context.i18n.getText("i18n", "ParentProjectSRV_UnknownExtensibilityType"));
				}
			};

			var isComponentDirectToManifest = function(sComponentContent) {
				var sRegex = /"?manifest"?\s*:\s*"json"/;
				return sRegex.test(sComponentContent);
			};

			/*
			 * Get the extensibility model and returns the relevant document according to this order:
			 * manifest.json --> Configuration.js --> Component.js
			 */
			this.getGuidelinesDocument = function(extModel, system, type) {
				var manifestPath = extModel.manifest;
				var configurationPath = extModel.configuration;
				var componentPath = extModel.component;
				return this.getDocument(componentPath, "file", system, type).then(function(oComponentDocument) {
					return oComponentDocument.getContent().then(function(sComponentContent) {
						if (manifestPath && isComponentDirectToManifest(sComponentContent)) {
							return that.getDocument(manifestPath, "file", system, type);
						} else if (configurationPath) {
							return that.getDocument(configurationPath, "file", system, type);
						} else {
							return oComponentDocument;
						}
					});
				});
			};

			/*
			 * Import an application to the workspace.
			 */
			this.import = function(applicationName, system, destinationDocument, type) {
				return getParentProjectService(type).import(applicationName, system, destinationDocument);
			};

			this.getDocument = function(resourcePath, resourceType, system, type, bBeautifyContent) {
				return getParentProjectService(type).getDocument(resourcePath, resourceType, system, bBeautifyContent);
			};

			/*
			 * Get the i18n folder of the parent project,
			 * and returns all its files.
			 */
			this.geti18nFolderFiles = function(i18nFolderPath, system, type) {
				return getParentProjectService(type).geti18nFolderFiles(i18nFolderPath, system);
			};

			/*
			 * Get the model folder of the parent project,
			 * and returns all its files.
			 */
			this.getModelFolderFiles = function(metadataPath, system, type) {
				return getParentProjectService(type).getModelFolderFiles(metadataPath, system);
			};

			this.getFileResourcesInfo = function(parentProjectPath, system, type) {
				return getParentProjectService(type).getFileResourcesInfo(parentProjectPath, system);
			};

			this.getRuntimeDestinations = function(system, type, neoAppPath) {
				if (neoAppPath) {
					return this.getDocument(neoAppPath, "file", system, type).then(function(neoAppDocument) {
						return neoAppDocument.getContent().then(function(fileContent) {
							if (fileContent && fileContent !== "") {
								var neoAppJson = JSON.parse(fileContent);
								var parentDestinations = neoAppJson.routes;
								return getParentProjectService(type).getRuntimeDestinations(system, parentDestinations);
							}

							// no content of neo-app.json
							return getParentProjectService(type).getRuntimeDestinations(system, []);
						});
					});
				}

				return getParentProjectService(type).getRuntimeDestinations(system, []);
			};

			this.getResources = function(model, type) {
				var resources = [];

				var modelExtensibility = model.extensibility;
				if (modelExtensibility[type] === undefined) {
					return resources;
				}
				var keys = Object.keys(modelExtensibility[type]);
				for (var i = 0; i < keys.length; i++) {
					var name = keys[i];
					var path = modelExtensibility[type][name];

					var resource = {};
					resource.name = name;
					var parentPath = modelExtensibility.component.replace(COMPONENT_JS, "");
					var location = path.replace(parentPath, "");
					var endIndex = location.indexOf(name);
					location = location.substring(0, endIndex);

					resource.id = (modelExtensibility.namespace + "." + location + name).replace(/\//g, ".").replace(/%2f/g, ".");
					resource.parentNamespace = modelExtensibility.namespace;
					resource.path = path;
					resource.resourceLocationPath = location;
					resource.type = type;

					if (location === "/" || location === "%2f") {
						resources.splice(0, 0, resource);
					} else {
						resources.push(resource);
					}
				}

				return resources;
			};

			var getExtensionIds = function(selectedView, type, element, attribute, system) {
				return that.getDocument(selectedView.path, "file", system, type).then(function(oDocument) {
					if (oDocument) {
						if (oDocument.getEntity().getType() === "file") {
							if (jQuery.sap.endsWith(oDocument.getEntity().getName(), defaultViewSuffix) || jQuery.sap.endsWith(oDocument.getEntity().getName(),
								defaultFragmentSuffix)) {
								return oDocument.getContent().then(function(fileContent) {
									var xmlFile = fileContent;
									if (typeof xmlFile === "string") {
										xmlFile = jQuery.sap.parseXML(fileContent);
									}

									var controlIdsValues = xmlUtil.getXmlParameters(xmlFile, element, attribute);
									return controlIdsValues;
								});
							} else {
								return [];
							}
						} else {
							return [];
						}
					}

					return [];
				});
			};

			/**
			 * Get list of Extension Points from the selected view.xml file.
			 */
			this.getExtensionPoints = function(selectedView, type, system) {
				return getExtensionIds(selectedView, type, "ExtensionPoint", "name", system);
			};

			/**
			 * Get list of Control Ids from the selected view.xml file.
			 */
			this.getControlIds = function(selectedView, type, system) {
				return getExtensionIds(selectedView, type, "*", "id", system);
			};

			// Returns true if the given resource path belongs to one of the given sub components
			this.isSubComponentResource = function(sResourcePath, aSubComponentPaths) {
				for (var i = 0; i < aSubComponentPaths.length; i++) {
					if (_.startsWith(sResourcePath, aSubComponentPaths[i])) {
						return true;
					}
				}
				
				return false;
			};

			// Builds an object with components infomration.
			// The information is:
			// rootComponentPath - the path (without file name) to the root component
			// rootComponentFilePath - the full file name of the root component
			// subComponentPaths - an array of paths of the sub components
			this.getComponentsInfo = function(aResourcesInfo) {
				var sRootComponentPath = null;
				var sRootComponentFullPath;
				var aSubComponentPaths = [];
				for (var i = 0; i < aResourcesInfo.length; i++) {
					var oResourceInfo = aResourcesInfo[i];
					var sResourceParentFolderPath = oResourceInfo.parentFolderPath;
					var sResourcePath = oResourceInfo.path;
					var sResourceName = oResourceInfo.name;
					if (sResourceName === COMPONENT_JS) {
						if (sRootComponentPath === null) {
							// First found
							sRootComponentPath = sResourceParentFolderPath;
							sRootComponentFullPath = sResourcePath;
						} else {
							// We alrady have a component. Is this one higher in hierarchy?
							if (sResourceParentFolderPath.split("/").length < sRootComponentPath.split("/").length 
								|| sResourceParentFolderPath === "") { // In hcp scenario the root path might be empty string, so the split comparison might not be enough
								aSubComponentPaths.push(sRootComponentPath);
								sRootComponentPath = sResourceParentFolderPath;
								sRootComponentFullPath = sResourcePath;
							} else {
								aSubComponentPaths.push(sResourceParentFolderPath);
							}
						}
					}
				}
				return {
					"rootComponentPath" : sRootComponentPath,
					"rootComponentFilePath" : sRootComponentFullPath,
					"subComponentPaths" : aSubComponentPaths
				};
			};

			/* Adjust the array of resources as follows:
				If there is no build folder, or the build folder is the project itself (for flat projects):
					Do nothing
				Else:
					If the original project comes from the workspace: 
						Delete the resources which belongs to the build folder
					Else:
						Delete the resources which are outside the build folder
			*/
			this.adjustBuildResources = function(aResourcesInfo, sBuildFolderPath, sType, sParentProjectPath) {
				if (sType === PARENT_TYPE_WORKSPACE) {
					// Prepare the build path for the comparisons
					sBuildFolderPath = sBuildFolderPath ? "/" + sBuildFolderPath : sBuildFolderPath;
					if (sBuildFolderPath && !_.startsWith(sBuildFolderPath, sParentProjectPath)) {
						sBuildFolderPath = sParentProjectPath + sBuildFolderPath;
					}
				}
				if (!sBuildFolderPath || sBuildFolderPath === sParentProjectPath) {
					return;
				} else {
					for(var i = aResourcesInfo.length -1; i >= 0 ; i--) { // Iterate in reverse since we by removing items we modify the length
						var resourceParentFolderPath = aResourcesInfo[i].parentFolderPath;
						if (sType === PARENT_TYPE_WORKSPACE) {
							if (_.startsWith(resourceParentFolderPath, sBuildFolderPath)) {
								aResourcesInfo.splice(i, 1);
							}
						} else {
							if (!_.startsWith(resourceParentFolderPath, sBuildFolderPath)) {
								aResourcesInfo.splice(i, 1);
							}						
						}
					}
				}
			};

			// Get the build folder path, accoding to the parent project origin
			this.getBuildFolderPath = function(sParentProjectPath, system, sType) {
				switch (sType) {
					case PARENT_TYPE_WORKSPACE:
						return that.context.service.filesystem.documentProvider.getDocument(sParentProjectPath).then(function(oProjectDocument) {
							return that.context.service.builder.getTargetFolder(oProjectDocument).then(function(oTargetFolderDocument) {
								return oTargetFolderDocument.getEntity().getTitle();
							}).fail(function() {
								return null; // No build info
							});	
						});
					case PARENT_TYPE_BSP:
					case PARENT_TYPE_ABAP_REP:
						return Q(null);
				    case PARENT_TYPE_HCP:
						return that.context.service.heliumparentproject.getDocument(".project.json", "file", system, false).then(function(oProjectJsonDocument) {
							return oProjectJsonDocument.getContent().then(function(sContent) {
								var oProjectJson = jQuery.parseJSON(sContent);
								return that.context.service.builder.getTargetFolderByProjectSettings(oProjectJson).then(function(sFolder) {
									return sFolder;
								});
							});
						}).fail(function() {
							return null; // No build info
						});
					default:
						throw new Error(that.context.i18n.getText("i18n", "ParentProjectSRV_UnknownExtensibilityType"));
				}
			};

			// Validate the location of the given metadta folder.
			// It is valid if it is under model or localService ("/" can be encoded to %2f), and it is under the root component path
			this.isValidMetadataLocation = function(sResourcePath, sRootComponentPath, sType, sBuildFolderPath) {
				var sDecodedResourcePath = decodeURIComponent(sResourcePath);
				if (sType === PARENT_TYPE_HCP && sBuildFolderPath) {
					sRootComponentPath = "/" + sRootComponentPath; // Normalize for hcp with build folder
				}
				if (_.startsWith(sDecodedResourcePath, sRootComponentPath + "/" + "model/metadata.xml") || _.startsWith(sDecodedResourcePath, sRootComponentPath + "/" + "localService/metadata.xml")) {
					return true;
				}
				return false;
			};

			this.validateParentProject = function(parentProjectPath, type, system) {
				var result = {};

				var model = {};
				model.extensibility = {};
				model.extensibility.controllers = {};
				model.extensibility.views = {};
				model.extensibility.fragments = {};
				model.extensibility.type = PARENT_TYPE_WORKSPACE;

				if (type) {
					model.extensibility.type = type;
				}

				// First get the resources from the appropriate parent project, then get the build folder path, and then adjust the resources according to the build folder
				return that.getFileResourcesInfo(parentProjectPath, system, model.extensibility.type).then(function(resourcesInfo) {
					return that.getBuildFolderPath(parentProjectPath, system, model.extensibility.type).then(function(sBuildFolderPath) {
						that.adjustBuildResources(resourcesInfo, sBuildFolderPath, model.extensibility.type, parentProjectPath);
						
						var neoAppJsonCount = 0;

						var oComponentsInfo = that.getComponentsInfo(resourcesInfo);
						model.extensibility.component = oComponentsInfo.rootComponentFilePath;

						for (var i = 0; i < resourcesInfo.length; i++) {
							var resourceInfo = resourcesInfo[i];
							var resourcePath = resourceInfo.path;
							var resourceParentFolderPath = resourceInfo.parentFolderPath;
							var resourceName = resourceInfo.name;

							if (_.endsWith(resourcePath, defaultViewSuffix) && !that.isSubComponentResource(resourceParentFolderPath, oComponentsInfo.subComponentPaths)) {
								var key = resourceName.replace(defaultViewSuffix, "");
								model.extensibility.views[key] = resourcePath;
							}

							if (_.endsWith(resourcePath, defaultFragmentSuffix) && !that.isSubComponentResource(resourceParentFolderPath, oComponentsInfo.subComponentPaths)) {
								var key = resourceName.replace(defaultFragmentSuffix, "");
								model.extensibility.fragments[key] = resourcePath;
							}

							if (_.endsWith(resourcePath, defaultControllerSuffix)  && !that.isSubComponentResource(resourceParentFolderPath, oComponentsInfo.subComponentPaths) && !_.endsWith(resourcePath, dbgControllerSuffix) && (
								decodeURIComponent(resourcePath).indexOf(parentProjectPath + "/webapp/test") === -1)) {//we dont want to insert to project.json tests of controllers, we unescape for case of BSP
								var key = resourceName.replace(defaultControllerSuffix, "");
								model.extensibility.controllers[key] = resourcePath;
							}

							if (resourceName === "manifest.json" && !that.isSubComponentResource(resourceParentFolderPath, oComponentsInfo.subComponentPaths)) {
								model.extensibility.manifest = resourcePath;
							}

							if (resourceName === "Configuration.js" && !that.isSubComponentResource(resourceParentFolderPath, oComponentsInfo.subComponentPaths)) {
								model.extensibility.configuration = resourcePath;
							}

							if (resourceName === "neo-app.json") {
								model.neoAppPath = resourcePath;
								neoAppJsonCount++;
							}

							if (resourceName === ".project.json" && resourcePath === parentProjectPath + "/.project.json") {
								model.extensibility.projectjson = resourcePath;
							}

							if (resourceName === "metadata.xml" && that.isValidMetadataLocation(resourcePath, oComponentsInfo.rootComponentPath, type, sBuildFolderPath)) {
								model.metadataPath = resourcePath;
							}							
						}

						var oManifestPromise;

						if (model.extensibility.manifest) {
							oManifestPromise = that.getDocument(model.extensibility.component, "file", system, model.extensibility.type).then(function (oComponent) {
								return oComponent.getContent().then(function (sComponentContent) {
									if (!isComponentDirectToManifest(sComponentContent)) {
										model.extensibility.manifest = undefined;
									}
								});
							});
						} else {
							oManifestPromise = Q();
						}

						return oManifestPromise.then(function () {
							if(model.extensibility.type === PARENT_TYPE_WORKSPACE && parentProjectPath.split("/").length > 2) {
								//If the user selected a subfolder of the project when choosing from workspace
								result.isValid = false;
								result.message = that.context.i18n.getText("i18n", "ParentProjectSRV_SelectSubFolderWorkspaceError");
								return result;
							} else if (!oComponentsInfo.rootComponentFilePath) {
								result.isValid = false;
								result.message = that.context.i18n.getText("i18n", "ParentProjectSRV_Component_jsNotFoundInSpecifiedFolder");
								return result;
							} else if (neoAppJsonCount > 1) {
								result.isValid = false;
								result.message = that.context.i18n.getText("i18n", "ParentProjectSRV_MultipleNeoApp_JSON") + " " + that.context.i18n.getText(
										"i18n", "ParentProjectSRV_OneNeoappFileAllowed");
								return result;
								// verify there are views/controllers in the selected parent application
							} else if (jQuery.isEmptyObject(model.extensibility.views) || jQuery.isEmptyObject(model.extensibility.controllers)) {
								result.isValid = false;
								result.message = that.context.i18n.getText("i18n", "ParentProjectSRV_NoViewsOrControllers");
								return result;
							} else {
								result.extensionProjectName = arguments[0];
								result.isValid = true;

								result.model = model;
								return result;
							}
						});
					});
				});
			};

			this.getMockPreview = function(model, system) {
				if (!model.extensibility.projectjson) {
					return Q();
				}

				// get the .project.json file from the parent
				return that.getDocument(model.extensibility.projectjson, "file", system, model.extensibility.type).then(
					function(oDocument) {
						if (oDocument) {
							return oDocument.getContent().then(function(fileContent) {
								// parse the string to Json object
								var projectJson = jQuery.parseJSON(fileContent);
								// return only the mock preview block
								return projectJson.mockpreview;
							});
						}

						return Q();
					});
			};

			this.getViewInfo = function(selectedView, type, system) {
				return that.getDocument(selectedView.path, "file", system, type).then(function(oDocument) {
					if (oDocument !== null && oDocument.getEntity().getType() === "file") {
						var viewName = oDocument.getEntity().getName();
						if (jQuery.sap.endsWith(viewName, defaultViewSuffix)) {
							return oDocument.getContent().then(function(fileContent) {

								var xmlFile = xmlUtil.stringToXml(fileContent);

								var extensionPoints = xmlUtil.getXmlParameters(xmlFile, "ExtensionPoint", "name");
								var controlIds = xmlUtil.getXmlParameters(xmlFile, "*", "id");

								var viewInfo = {
									"name": viewName.replace(defaultViewSuffix, ""),
									"resourceContent": fileContent,
									"extensionPoints": extensionPoints,
									"controlIds": controlIds,
									"id": selectedView.id,
									"path": selectedView.path,
									"resourceLocationPath": selectedView.resourceLocationPath,
									"type": "view"
								};

								return viewInfo;
							});
						} else {
							return {};
						}
					} else {
						return {};
					}
				});
			};

			this.getFragmentInfo = function(selectedFragment, type, system) {
				return that.getDocument(selectedFragment.path, "file", system, type).then(function(oDocument) {
					if (oDocument !== null && oDocument.getEntity().getType() === "file") {
						var fragmentName = oDocument.getEntity().getName();
						if (jQuery.sap.endsWith(fragmentName, defaultFragmentSuffix)) {
							return oDocument.getContent().then(function(fileContent) {

								var xmlFile = xmlUtil.stringToXml(fileContent);

								var extensionPoints = xmlUtil.getXmlParameters(xmlFile, "ExtensionPoint", "name");
								var controlIds = xmlUtil.getXmlParameters(xmlFile, "*", "id");

								var fragmentInfo = {
									"name": fragmentName.replace(defaultFragmentSuffix, ""),
									"fragmentXml": fileContent,
									"extensionPoints": extensionPoints,
									"controlIds": controlIds,
									"id": selectedFragment.id,
									"path": selectedFragment.path,
									"resourceLocationPath": selectedFragment.resourceLocationPath,
									"type": "fragment"
								};

								return fragmentInfo;
							});
						} else {
							return {};
						}
					} else {
						return {};
					}
				});
			};

			this.getControllerInfo = function(selectedController, type, system) {
				return that.getDocument(selectedController.path, "file", system, type).then(function(oDocument) {
					if (oDocument !== null && oDocument.getEntity().getType() === "file") {
						var controllerName = oDocument.getEntity().getName();
						if (jQuery.sap.endsWith(controllerName, defaultControllerSuffix)) {
							return oDocument.getContent().then(function(controllerJs) {
								var controllerInfo = {
									"name": controllerName.replace(defaultControllerSuffix, ""),
									"controllerJs": controllerJs,
									"id": selectedController.id,
									"path": selectedController.path,
									"resourceLocationPath": selectedController.resourceLocationPath,
									"type": "controller",
									"hooks": ExtensionHook.getHooks(controllerJs)
								};

								return controllerInfo;
							});
						} else {
							return {};
						}
					} else {
						return {};
					}
				});
			};
		};

		return ParentProject;
	});
	