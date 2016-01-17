define([ "../constants/ComponentConstants",
		"../manager/ComponentManager" ], function(ComponentConstants, ComponentManager) {
	var oComponentManager = null;

	var _onBeforeTemplateGenerate = function(templateZip, model) {
		oComponentManager = new ComponentManager(this.context);


		oComponentManager.initializeComponentModel(model, ComponentConstants.constants.components.initModel.HideControl);

		return oComponentManager.onBeforeTemplateGenerate(templateZip, model);
	};

	var _onAfterGenerate = function(projectZip, model) {
		return oComponentManager.onAfterGenerate(projectZip, model);
	};

	var _configWizardSteps = function(oHideControllComponentStep) {

		return [ oHideControllComponentStep ];
	};

	return {
		onBeforeTemplateGenerate : _onBeforeTemplateGenerate,
		onAfterGenerate : _onAfterGenerate,
		configWizardSteps : _configWizardSteps
	};
});
