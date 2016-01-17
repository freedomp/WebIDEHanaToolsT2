define({
	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.ui5template.smartExtensions.ui.wizard.ObjectPageExtensionStep");
		var oObjectPageExtensionStep = new sap.watt.saptoolsets.fiori.project.ui5template.smartExtensions.ui.wizard.ObjectPageExtensionStep({
			context : this.context
		});

		var sStepTitle = this.context.i18n.getText("objectPageExtensionStep_title");

		return this.context.service.wizard.createWizardStep(oObjectPageExtensionStep, sStepTitle, "");
	}
});
