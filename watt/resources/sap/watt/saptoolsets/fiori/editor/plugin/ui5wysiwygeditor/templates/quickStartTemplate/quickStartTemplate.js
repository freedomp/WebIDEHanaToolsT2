define({

	configWizardSteps : function() {
		return [];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {

	},

	customValidation : function() {
		return true;
	}
});