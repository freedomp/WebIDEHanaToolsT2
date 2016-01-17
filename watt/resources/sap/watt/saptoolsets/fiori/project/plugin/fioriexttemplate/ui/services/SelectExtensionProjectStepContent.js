define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionProjectStep");
		var oSelectExtensionProjectStep = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionProjectStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("ExtensionWizard_SelectExtensionProject");
		return this.context.service.wizard.createWizardStep(oSelectExtensionProjectStep, sTitle, "");
	}
});
