define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep");
		var oGeneralInfoStep = new sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("GeneralInfoStep_GeneralInfo");
		return this.context.service.wizard.createWizardStep(oGeneralInfoStep, sTitle, "");
	}
});