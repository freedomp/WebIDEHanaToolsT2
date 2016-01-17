define({

	configWizardSteps : function(oFioriRefAppsTermsFinishStep) {
		return [oFioriRefAppsTermsFinishStep];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {

	},

	validateOnSelection : function(model) {
		return this.context.service.reftemplatevalidator.validate(model.selectedTemplate);
	}
});