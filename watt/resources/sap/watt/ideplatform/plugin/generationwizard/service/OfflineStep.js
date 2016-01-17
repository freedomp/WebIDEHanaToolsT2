define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.OfflineStepContent");
		var oOfflineStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.OfflineStepContent({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_offlineStepTitle");
		return this.context.service.wizard.createWizardStep(oOfflineStep, sTitle, "");
	}
});
