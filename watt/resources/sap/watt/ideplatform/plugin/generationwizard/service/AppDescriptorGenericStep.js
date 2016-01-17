define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent");
		var oAppDescriptorGenericStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.AppDescriptorGenericStepContent({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_AppDescriptorGenericStepTitle");
		return this.context.service.wizard.createWizardStep(oAppDescriptorGenericStep, sTitle, "");
	}
});