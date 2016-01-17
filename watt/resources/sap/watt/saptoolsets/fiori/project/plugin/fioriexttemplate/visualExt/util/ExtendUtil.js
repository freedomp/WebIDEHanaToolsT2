/****************************************************************************************************************
 * ExtendUtil - a utility used by the extensibility pane for performing actual operations on the extension project
 * (without UI modifications) - as performing extensions, removing extensions
 * and locating and opening code documents in editor.
 *
 * This utility was created to mitigate the gaps between the extensibility pane and the extension wizard,
 * by converting the UI Model of the extensibility pane into the appropriate model for the extension template
 * and triggering the generation.
 *
 * The utility also holds constants used in the UI model of the extensibility pane to identify different types of elements.
 ****************************************************************************************************************/
define([ "../../manager/ComponentManager",
		"../../constants/ComponentConstants",
		"../../ui/steps/WizardStepContentHelper",
		"../../util/ExtensionHook", "sap/watt/lib/lodash/lodash" ], function(ComponentManager,
		ComponentConstants, WizardStepContentHelper, extensionHook, _) {

		var _EXT_TYPE_CONTROLLER = "controller";
		var _EXT_TYPE_VIEW = "view";
		var _EXT_TYPE_FRAGMENT = "fragment";
		var _EXT_TYPE_HOOK = "hook";
		var _EXT_TYPE_EXT_POINT = "extensionpoint";

		var _mExtensionTypes = {
			REPLACE_VIEW_WITH_EMPTY : "Replace View with Empty",
			REPLACE_VIEW_WITH_COPY : "Replace View with Copy",
			HIDE_CONTROL : "Hide UI Control",
			EXTEND_VIEW : "Extend Extension Point",
			EXTEND_CONTROLLER_WITH_EMPTY : "Extend Controller with Empty",
			EXTEND_CONTROLLER_WITH_COPY : "Extend Controller with Copy",
			EXTEND_CONTROLLER_HOOK : "Extend Controller Hook"
		};

	/************* Private Functions **************/

		// Update Extend Controller model
		var updateExtendControllerModel = function(selectedResource, modelOData, selectedExtOption, context) {
			switch (selectedExtOption.name) {
				case _mExtensionTypes.EXTEND_CONTROLLER_WITH_COPY : {
					selectedExtOption.name = "Copy of the parent controller";
					break;
				}
				case _mExtensionTypes.EXTEND_CONTROLLER_WITH_EMPTY : {
					selectedExtOption.name = "Empty controller";
					break;
				}
			}
			var componentManager = new ComponentManager(context);
			componentManager.initializeComponentModel(modelOData, ComponentConstants.constants.components.initModel.ExtendController);
			WizardStepContentHelper.updateModelWithSelectedResource(modelOData, selectedResource, selectedExtOption);
		};

		// Update Extend Hook model
		var updateExtendHookModel = function(selectedResource, modelOData, selectedExtOption, context) {
			var componentManager = new ComponentManager(context);
			componentManager.initializeComponentModel(modelOData, ComponentConstants.constants.components.initModel.ExtendController);
			WizardStepContentHelper.updateModelWithSelectedResource(modelOData, selectedResource, selectedExtOption);
		};

		// Update Replace View model with empty or with parent according to the selected Extension option from the DDB
		var updateReplaceViewModel = function(selectedResource, modelOData, selectedExtOption, context) {
			switch (selectedExtOption.name) {
				case _mExtensionTypes.REPLACE_VIEW_WITH_COPY : {
					selectedExtOption.name = "Copy of the parent view";
					break;
				}
				case _mExtensionTypes.REPLACE_VIEW_WITH_EMPTY : {
					selectedExtOption.name = "Empty view";
					break;
				}

			}
			var componentManager = new ComponentManager(context);
			componentManager.initializeComponentModel(modelOData, ComponentConstants.constants.components.initModel.ReplaceView);
			WizardStepContentHelper.updateModelWithSelectedResource(modelOData, selectedResource, selectedExtOption);
		};

		// Update Hide Control or Extend View model according to the selected Component
		var updateComponentModel = function(selectedResource, constant, modelOData, selectedExtOption, context) {
			var componentManager = new ComponentManager(context);
			componentManager.initializeComponentModel(modelOData, constant);

			var oResourceData = {
				name : selectedResource.resourceInfo.name,
				path : selectedResource.resourceInfo.path,
				resourceLocationPath : selectedResource.resourceInfo.resourceLocationPath,
				id : selectedResource.resourceInfo.id
			};

			WizardStepContentHelper.updateModelWithSelectedResource(modelOData, oResourceData, selectedExtOption);
		};

		// Execute the generation process
		var generate = function(extensionProjectDocument, selectedComponent, modelOData, context) {
			return context.service.generation.generate(modelOData.extensionProjectPath, selectedComponent, modelOData, true,
					extensionProjectDocument);
		};


	/************* Public API Implementation **************/


		var _isExtended = function(customizingJson, customizationId, resourceId, extensionId) {
			var customizationIdJson = customizingJson[customizationId];
			if (customizationIdJson) {
				var resourceIdJson = customizationIdJson[resourceId];
				if (resourceIdJson) {
					if (customizationId === "sap.ui.viewReplacements" || customizationId === "sap.ui.controllerExtensions") {
						return true;
					}
					var extensionIdJson = resourceIdJson[extensionId];
					// If this is a hidden control, check the "visible" property
					if (customizationId === "sap.ui.viewModifications") {
						return extensionIdJson && extensionIdJson.visible === false;
					}

					if (extensionIdJson) {
						return true;
					}
				}
			}

			return false;         
		};

		var _removeExtension = function(nodeModel, oProjectDoc, context) {

			var extensionId = nodeModel.extensionId;

			var customizationId = nodeModel.customizationId;
			var resourceId = nodeModel.resourceInfo.originalId;
			if (!resourceId) {
				resourceId = nodeModel.resourceInfo.id;
			}

			return context.service.ui5projecthandler.removeExtension(oProjectDoc, customizationId, resourceId, extensionId).then(function () {
				return context.service.ui5projecthandler.getAllExtensions(oProjectDoc);
			});
		};

		// Handle the extend functionality when an extension option is chosen
		var _extendProject = function(nodeModel, extensionProjectDocument, extensibilityModel, selectedTemplate, extensionOption, context) {
			var selectedType = nodeModel.type;
			var that = this;
			var model = new sap.ui.model.json.JSONModel();
			model.setData({});
			model.oData = extensibilityModel;

			model.oData.extensionProjectPath = extensionProjectDocument.getEntity().getFullPath();
			model.oData.extensionProjectName = extensionProjectDocument.getEntity().getName();

			var resourceInfo = nodeModel.resourceInfo;
			var selectedExtOption = {};

			return Q.all([context.service.extensionproject.getResourceLocation(model.oData.extensionProjectPath),
				      context.service.ui5projecthandler.getAppNamespace(extensionProjectDocument)]).spread(
					function(sResourceLocationPath, sExtensionProjectNamespace) {
						model.oData.extensionResourceLocationPath = sResourceLocationPath;
						model.oData.extensionProjectNamespace = sExtensionProjectNamespace;

						// update model according to the selected type
						switch (selectedType) {

						case that.EXT_TYPE_VIEW:
							selectedExtOption.name = extensionOption;
							updateReplaceViewModel(resourceInfo, model.oData, selectedExtOption, context);
							break;

						case that.EXT_TYPE_CONTROLLER:
							selectedExtOption.name = extensionOption;
							updateExtendControllerModel(resourceInfo, model.oData, selectedExtOption, context);
							break;

						case that.EXT_TYPE_HOOK:
							selectedExtOption.name = nodeModel.attributes.id;
							if (!model.oData.fiori) {
								model.oData.fiori = {};
								model.oData.fiori.extensionCommon = {};
							}
							model.oData.fiori.extensionCommon.originalId = resourceInfo.originalId;
							model.oData.fiori.extensionCommon.extensionArgs = nodeModel.extensionHookArgs;
							updateExtendHookModel(resourceInfo, model.oData, selectedExtOption, context);
							break;

						case that.EXT_TYPE_EXT_POINT:
							var constant = ComponentConstants.constants.components.initModel.ExtendView;
							selectedExtOption.name = nodeModel.attributes.name;
							updateComponentModel(nodeModel, constant, model.oData, selectedExtOption, context);
							break;

						default:
							if (nodeModel.isExtendable === true && nodeModel.isVisible === true) {
								var constant = ComponentConstants.constants.components.initModel.HideControl;
								selectedExtOption.name = nodeModel.attributes.id;
								updateComponentModel(nodeModel, constant, model.oData, selectedExtOption, context);
							}
						}

						model.oData.selectedTemplate = selectedTemplate;

						// generate extension
						return generate(extensionProjectDocument, selectedTemplate, model.oData, context);
					});
		};

		//opens Layout Editor 
		var _openLayoutEditor = function(extensionProjectPath, selectedNode, resourceLocationPath, context, sActionOrigin) {
			var nodeModel = selectedNode.getBindingContext().getObject();
			var extensionCommon;
			switch (nodeModel.type) {
				case this.EXT_TYPE_EXT_POINT:
					extensionCommon = ComponentConstants.constants.components.initModel.ExtendView.extensionCommon;
					break;

				case this.EXT_TYPE_VIEW:
					extensionCommon = ComponentConstants.constants.components.initModel.ReplaceView.extensionCommon;
					break;
				default :
					// only views and fragments should make it this far
					return Q.reject(context.i18n.getText("i18n", "VisualExt_WrongNodeForLayoutEditor"));
			}
			return context.service.extensionproject.openLayoutEditor(extensionProjectPath, nodeModel, extensionCommon, resourceLocationPath, context).then(function() {
				context.service.usagemonitoring.report("extensibility", "open_layout_editor", "open_layout_editor" + "_" + sActionOrigin).done();
			}).fail(function(oError) {
				context.service.usernotification.alert(oError.message).done();
				context.service.usagemonitoring.report("extensibility", "open_layout_editor", "error_while_open_layout_editor" + "_" + sActionOrigin).done();
			});
		};

		//open the extended document according to the selected resource type
		var _openExtendedDocument = function(extensionProjectPath, selectedNode, resourceLocationPath, context) {
			var resourceType = selectedNode.getBindingContext().getObject().type;
			var resourceId;
			var extensionId;
			var extensionCommon;
			var originalId;
			var nodeModel = selectedNode.getBindingContext().getObject();

			switch (resourceType) {
			case this.EXT_TYPE_EXT_POINT:
				extensionCommon = ComponentConstants.constants.components.initModel.ExtendView.extensionCommon;
				resourceId = nodeModel.resourceInfo.id;
				extensionId = nodeModel.attributes.name;
				break;

			case this.EXT_TYPE_VIEW:
				extensionCommon = ComponentConstants.constants.components.initModel.ReplaceView.extensionCommon;
				originalId = nodeModel.resourceInfo.originalId;
				resourceId = originalId || nodeModel.resourceInfo.id;
				break;

			case this.EXT_TYPE_CONTROLLER:
			case this.EXT_TYPE_HOOK:
				extensionCommon = ComponentConstants.constants.components.initModel.ExtendController.extensionCommon;
				originalId = nodeModel.resourceInfo.originalId;
				resourceId = originalId || nodeModel.resourceInfo.id;
				break;

			default:
				if (nodeModel.isExtended === true && nodeModel.isVisible === true) {
					extensionCommon = ComponentConstants.constants.components.initModel.HideControl.extensionCommon;
					resourceId = nodeModel.resourceInfo.id;
					extensionId = nodeModel.attributes.id;
				}
			}

			return context.service.extensionproject.openDocument(extensionProjectPath, extensionCommon, resourceId, extensionId,
					resourceLocationPath).fail(function(oError) {
				context.service.usernotification.alert(oError.message).done();
			});
		};

		var _openParentDocument = function(selectedNode, extensibilityModel, context) {
			var nodeModel = selectedNode.getBindingContext().getObject();
			var resourcePath;
			var resourceName = nodeModel.resourceInfo.originalName || nodeModel.resourceInfo.name;
			switch (nodeModel.resourceInfo.type) {
			case this.EXT_TYPE_CONTROLLER:
				resourcePath = extensibilityModel.extensibility.controllers[resourceName];
				break;

			case this.EXT_TYPE_VIEW:
				resourcePath = extensibilityModel.extensibility.views[resourceName];
				break;

			case this.EXT_TYPE_FRAGMENT:
				resourcePath = extensibilityModel.extensibility.fragments[resourceName];
				break;

			default:
				resourcePath = extensibilityModel.extensibility.component;
				break;
			}

			var resourceType = "file";
			var system = extensibilityModel.extensibility.system;
			var type = extensibilityModel.extensibility.type;
			return context.service.parentproject.getDocument(resourcePath, resourceType, system, type, true).then(function(fileDocument) {
				if (fileDocument) {
					if (type === "Workspace") {
						context.service.repositorybrowser.setSelection(fileDocument, true).done();
					}
					return context.service.document.open(fileDocument);
				} else {
					var message = context.i18n.getText("i18n", "ExtUtil_DocNotFound");
					context.service.usernotification.alert(message).done();
				}
			}).fail(function(oError) {
				context.service.usernotification.alert(oError.message).done();
			});
		};

		/**
		 * Returns whether the selected item in the tree is extended or not.
		 * @param oNodeModel The model belonging to the selected node in Ext. Pane
		 */
		var _isExtendedByNode = function(oNodeModel) {
			if (!oNodeModel) {
				return false;
			}
			if (oNodeModel.type !== this.EXT_TYPE_CONTROLLER && oNodeModel.type !== this.EXT_TYPE_VIEW
					&& oNodeModel.type !== this.EXT_TYPE_FRAGMENT && oNodeModel.type !== this.EXT_TYPE_HOOK) {
				return oNodeModel.isExtended === true && !oNodeModel.resourceInfo.newId;
			}
			return oNodeModel.isExtended === true;
		};

		var _getCustomResourceFilePath = function(replacedResourceId, extensionNamespace, extensionProjectPath, resourceSuffix, sResourceLocationPath) {
			var resourcePath = replacedResourceId.replace(extensionNamespace, "");

			if (sResourceLocationPath !== ""){
				sResourceLocationPath = "/" + sResourceLocationPath.replace("/", "");
			}
			resourcePath = extensionProjectPath + sResourceLocationPath + resourcePath.replace(/\./g, "/") + resourceSuffix;
			return resourcePath;
		};

		var _removeHookExtension = function(modelData, extensibilityModel, extensionProjectDocument, context) {
			var projectEntity = extensionProjectDocument.getEntity();
			var that = this;
			return context.service.ui5projecthandler.getAppNamespace(extensionProjectDocument).then(function (sNamespace) {
				var customControllerId = modelData.resourceInfo.newId; // When the custom controller was created AFTER the tree was rendered
				if (!customControllerId) {
					customControllerId = modelData.resourceInfo.id; // When the custom controller was created BEFORE the tree was rendered
				}
				var customControllerPath = that.getCustomResourceFilePath(customControllerId, sNamespace, projectEntity.getFullPath(),
					ComponentConstants.constants.components.initModel.ExtendController.extensionCommon.resourceSuffix, extensibilityModel.extensionResourceLocationPath);

				return context.service.filesystem.documentProvider.getDocument(customControllerPath).then(function(oDocument) {
					return oDocument.getContent().then(function(fileContent) {

						var modifiedFileContent = extensionHook.removeHook(modelData.attributes.id, fileContent);
						var errMsg = context.i18n.getText("i18n", "VisualExt_HookRemovalFailed");
						if (modifiedFileContent === fileContent) {
							// No change - the removal failed
							return Q.reject(errMsg);
						} else {
							// Update the controller
							return context.service.beautifierProcessor.beautify(modifiedFileContent, "js").then(function(beautifiedContent) {
								return oDocument.setContent(beautifiedContent).then(function() {
									return oDocument.save();
								});
							}).fail(function(oError) {
								context.service.log.error("ExtendUtil", errMsg + " Error: " + oError.message, [ "system" ]).done();
								context.service.usernotification.warning(errMsg).done();
							});
						}
					});
				});
			});
		};

		var _getCustomControllerDocument = function(customControllerFullName, model, context) {
			var fullProjectNS = model.extensionProjectNamespace;
			var customControllerPath = this.getCustomResourceFilePath(customControllerFullName, fullProjectNS, model.extensionProjectPath,
					ComponentConstants.constants.components.initModel.ExtendController.extensionCommon.resourceSuffix, model.extensionResourceLocationPath);
			return context.service.filesystem.documentProvider.getDocument(customControllerPath).then(function(oDocument) {
				return oDocument;
			});
		};

		/**
		 * Returns the documentation of a Fiori application.
		 * @function
		 * @param {string} sBSPName - The name of the application in BSP for example: HCM_LR_APV
		 * The return value is wrapped in a promise that is always resolved, in case there was an error the resulved value will be undefined
		 * @returns {object} documentation - The documentation of the extension points/hooks and a link to the documentation
		 * @returns {object} documentation.map - A map between the extension point/hook name to an object that includes the description of it among other properties
		 * @returns {string} documentation.url - The URL for the extensibility documentation of the Fiori application
		 */
		var _getFioriAppExtensionsDocumentation = function(sBSPName) {
			var deferred = Q.defer();
			var documentation = {};
			var contextRoot = sap.watt.getEnv("context_root");
			var documentationOdataModel = new sap.ui.model.odata.ODataModel(contextRoot + "fioriappslibrary", true);
			documentationOdataModel.read("Apps?$filter=BSPName eq " + "'" + sBSPName + "'", null, null, true, function(oData, oResponse) {
				if (oResponse.data.results.length > 0) {
					var appId = oResponse.data.results[0].appId;
					documentation.url = oResponse.data.results[0].ExtensibilityDocumentationLink;
					documentationOdataModel.read("Apps('" + appId + "')/Extensions", null, null, true, function(_oData, _oResponse) {
						documentation.map = {};
						_.forEach(_oResponse.data.results, function(extensionDocumentation) {
							documentation.map[extensionDocumentation.File + "." + extensionDocumentation.Name] = extensionDocumentation;
						});
						deferred.resolve(documentation);
					}, function() {
						deferred.reject();
					});
				} else {
					deferred.reject();
				}
			}, function() {
				deferred.reject();
			});
			return deferred.promise;
		};

	var _getRunConfigurationInfo = function(oContext, oExtProjectDocument) {
		if (!oExtProjectDocument) {
			var errMsg = oContext.i18n.getText("i18n", "ExtendUtil_badInputForGetRunConfiguration");
			oContext.service.log.error(oContext.i18n.getText("i18n", "Extension_LogTitle"), errMsg, ["system"]).done();
			return Q(null);
		}

		// Get the configurations
		return oContext.service.setting.user.get(oContext.service.run, oExtProjectDocument).then(function(aRunConfigurations) {
			if (aRunConfigurations) {
				for (var i = 0; i < aRunConfigurations.length; i++) {
					var oRun = aRunConfigurations[i];
					if (oRun && oRun._metadata && oRun._metadata.runnerId && oRun._metadata.runnerId === "webapprunner") {
						// Found our first webapprunner configuration - use it
						var uri = new URI("");
						if (oRun.urlParameters) {
							for (var j = 0; j < oRun.urlParameters.length; j++) {
								var oUrlParameter = oRun.urlParameters[j];
								if (oUrlParameter.paramActive) {
									uri.addSearch(oUrlParameter.paramName, oUrlParameter.paramValue);
								}
							}
						}
						if (oRun.hashParameter) {
							uri.hash(oRun.hashParameter);
						}
						return uri;
					}
				}
			}

			return null; // Didn't find a webapprunner configuration
		});
	};

	return {
		/**
		 * Constants for the special node types.
		 * The type of the control nodes is the UI5 class of the control.
		 * The type of the aggregation node is the aggregation name.
		 */
		EXT_TYPE_CONTROLLER : _EXT_TYPE_CONTROLLER,
		EXT_TYPE_VIEW : _EXT_TYPE_VIEW,
		EXT_TYPE_FRAGMENT : _EXT_TYPE_FRAGMENT,
	 	EXT_TYPE_HOOK : _EXT_TYPE_HOOK,
		EXT_TYPE_EXT_POINT : _EXT_TYPE_EXT_POINT,
		EXTENSION_TYPES : _mExtensionTypes,

		// Functions
		isExtended : _isExtended,
		removeExtension : _removeExtension,
		extendProject : _extendProject,
		openLayoutEditor : _openLayoutEditor,
		openExtendedDocument : _openExtendedDocument,
		openParentDocument : _openParentDocument,
		isExtendedByNode : _isExtendedByNode,
		removeHookExtension : _removeHookExtension,
		getCustomControllerDocument : _getCustomControllerDocument,
		getCustomResourceFilePath : _getCustomResourceFilePath,
		getFioriAppExtensionsDocumentation : _getFioriAppExtensionsDocumentation,
		getRunConfigurationInfo : _getRunConfigurationInfo
	};
});