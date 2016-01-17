define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep");
		var oSelectDeployABAPSystemStep = new sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectDeployABAPSystemStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("DeployWizard_DeploymentOptions");
		return this.context.service.wizard.createWizardStep(oSelectDeployABAPSystemStep, sTitle, "");
	}
});
