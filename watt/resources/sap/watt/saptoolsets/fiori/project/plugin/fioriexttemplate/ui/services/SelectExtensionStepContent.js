define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionStep");
		var oSelectExtensionStep = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("ExtensionWizard_Extension");
		var sDescription = this.context.i18n.getText("ExtensionWizard_SelectExtensionToAdd");
		return this.context.service.wizard.createWizardStep(oSelectExtensionStep, sTitle, sDescription);
	}
});
