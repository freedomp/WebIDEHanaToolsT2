define(["../manager/ComponentManager",
		"../constants/ComponentConstants",
		"../visualExt/util/ExtendUtil",
		"../util/ExtensionHook"],
		/* eslint-disable max-params */
		function(ComponentManager, ComponentConstants, ExtendUtil, ExtensionHook) {
		/* eslint-enable max-params */

	var oComponentManager = null;

	var oContext = null;
    var EMPTY_CONTROLLER_JS = "EmptyController.js";

	var _buildHookFunction = function(hookName, hookArgs) {
        var parameters = "";
        if (hookArgs) {
            for (var i = 0; i < hookArgs.length; i++) {
                if (i > 0) {
                    parameters += ", ";
                }
                parameters += hookArgs[i];
            }
        }

        var hookFunction = hookName + ": function(" + parameters + ") {" +
            "\n// Place your hook implementation code here \n" +
			"}";
		return hookFunction;
	};

    // When a custom controller already exist, we need to:
    // 1. Clear the zip content
    // 2. Add the new hook impl to the existing custom controller manually (at the end of the file)
	var _handleExistingCustomController = function(customController, zipAndModel) {
		/* eslint-disable dot-notation */
		var customControllerFullName = customController["controllerName"];
		/* eslint-enable dot-notation */
		var zip = zipAndModel[0];
		var model = zipAndModel[1];

		// Remove the files from the zip - we don't need them when adding additional hooks
		zip.remove(EMPTY_CONTROLLER_JS + ".tmpl");
		zip.remove("ComponentCustomizing.json.tmpl");

		// Get the content of the current custom controller
		return ExtendUtil.getCustomControllerDocument(customControllerFullName, model, oContext).then(function(oDocument) {
			return oDocument.getContent().then(function(fileContent) {
				fileContent = ExtensionHook.addHook(model.fiori.extendHook, fileContent);
				return oContext.service.beautifierProcessor.beautify(fileContent, "js").then(function(beautifiedContent) {
                    return oDocument.setContent(beautifiedContent).then(function() {
                        return oDocument.save().then(function() {
                            return [zip, model];
                        });
                    });
				});
			});
		});
	};

	var onBeforeHookGenerate = function(model) {
		model.fiori.extendHook = _buildHookFunction(model.fiori.extensionCommon.extensionId, model.fiori.extensionCommon.extensionArgs);
		// Clear second drop down box selection
		model.fiori.extensionCommon.extensionId = undefined;
	};

	var _onBeforeTemplateGenerate = function(templateZip, model) {
		oContext = this.context;
		oComponentManager = new ComponentManager(this.context);

		oComponentManager.initializeComponentModel(model, ComponentConstants.constants.components.initModel.ExtendController);

		onBeforeHookGenerate(model);
		return oComponentManager.onBeforeTemplateGenerate(templateZip, model).then(function(zipAndModel) {
			var originalControllerName = model.fiori.extensionCommon.originalId; // Ext' pane scenario
			if (!originalControllerName) {
				originalControllerName = model.fiori.extensionCommon.resourceId; // Ext' wizard scenario
			}
			var customController = _getExtendingController(oComponentManager.customizingJson, originalControllerName);
			if (customController) {
				// The controller was already extended. We need to patch the zip and model accordingly, to update the existing controller
				return _handleExistingCustomController(customController, zipAndModel);
			} else {
				return zipAndModel;
			}
		}).fail(function(oError) {
			oContext.service.log.error("ExtendControllerHook", oContext.i18n.getText("i18n", "ExtendHook_HookGenerationFailedConsole", oError.message), ["system"]).done();
			oContext.service.usernotification.warning(oContext.i18n.getText("i18n", "ExtendHook_HookGenerationFailed")).done();
		});
	};

	var _getExtendingController = function(oCustomizingJson, sControllerName) {
		if (!oCustomizingJson) {
			return null;
		}
		var aControllerExtensions = oCustomizingJson["sap.ui.controllerExtensions"];
		if (!aControllerExtensions) {
			return null;
		}
		return aControllerExtensions[sControllerName];
	};

	var _onAfterGenerate = function(projectZip, model) {
		var initialCustomController = projectZip.files[EMPTY_CONTROLLER_JS];

		if (initialCustomController) {
			// If We've just created a first hook in a new custom controller - beautify the file, do some updates,
			// and add the controller to the handler file
			return oContext.service.beautifierProcessor.beautify(initialCustomController.asText(), "js").then(function(beautifiedContent) {
			    projectZip.file(EMPTY_CONTROLLER_JS, beautifiedContent);
			    return oComponentManager.onAfterGenerate(projectZip, model);
			});
		} else {
			// For non-first hook, simply do the required updates
			return Q(oComponentManager.onAfterGenerateUpdates(projectZip, model));
		}
	};

	var _configWizardSteps = function(oExtendControllerStep) {
		return [oExtendControllerStep];
	};

	return {
		onBeforeTemplateGenerate: _onBeforeTemplateGenerate,
		onAfterGenerate: _onAfterGenerate,
		configWizardSteps: _configWizardSteps,
		// Internal functions exposed only for unit test
		_buildHookFunction : _buildHookFunction,
		onBeforeHookGenerate : onBeforeHookGenerate,
		_handleExistingCustomController : _handleExistingCustomController,
		_getExtendingController : _getExtendingController
	};
});