define({

	configWizardSteps : function(oServiceCatalogStep, oTemplateCustomizationStep, oOfflineStep) {
		oOfflineStep.setOptional(true);
		return [ oServiceCatalogStep, oTemplateCustomizationStep, oOfflineStep ];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		if (!model.smpOffline) {
			templateZip.remove("offline.js.tmpl");
		}
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {
	}
});