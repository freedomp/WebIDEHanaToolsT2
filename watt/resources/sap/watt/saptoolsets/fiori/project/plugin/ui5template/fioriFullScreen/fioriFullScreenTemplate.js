define({

	configWizardSteps : function(oServiceCatalogStep, oTemplateCustomizationStep) {

		var oServiceCatalogStepContent = oServiceCatalogStep.getStepContent();
		var oTemplateCustomizationStepContent = oTemplateCustomizationStep.getStepContent();

		oServiceCatalogStepContent.attachValidation(oTemplateCustomizationStepContent.onSelectedServiceChange,
				oTemplateCustomizationStepContent);

		oServiceCatalogStep.setOptional(true);
		return [ oServiceCatalogStep, oTemplateCustomizationStep ];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		if (!model.fioriFullScreen.parameters.ProjectNamespace.value) {
			model.fioriFullScreen.parameters.ProjectNamespace.value = model.projectName;
		}
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {

	}
});