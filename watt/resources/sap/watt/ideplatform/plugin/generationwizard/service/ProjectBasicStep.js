define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep");
		var oProjectNameStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_basicStepTitle");
		return this.context.service.wizard.createWizardStep(oProjectNameStep, sTitle, "");
	}
});