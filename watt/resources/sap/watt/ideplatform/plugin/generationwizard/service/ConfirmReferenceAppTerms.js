define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ConfirmTermsStepContent");
		var oConfirTermsStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ConfirmTermsStepContent({
			context : this.context
		});

		return this.context.service.wizard.createWizardStep(oConfirTermsStep, "", "");
	}
});