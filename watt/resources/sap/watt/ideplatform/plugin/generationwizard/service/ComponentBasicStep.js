define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentPathStep");
		var oComponentPathStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentPathStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("componentGenWizard_basicStepTitle");
		return this.context.service.wizard.createWizardStep(oComponentPathStep, sTitle, "");
	}
});
