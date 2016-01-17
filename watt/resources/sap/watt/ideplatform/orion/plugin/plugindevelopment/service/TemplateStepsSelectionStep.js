define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateStepsSelectionStep");
		var oTemplateStepsSelectionStep = new sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateStepsSelectionStep({
			context : this.context
		});

		var sStepTitle = this.context.i18n.getText("templateStepsSelectionStep_title");
		var sStepDescription = this.context.i18n.getText("templateStepsSelectionStep_description");

		return this.context.service.wizard.createWizardStep(oTemplateStepsSelectionStep, sStepTitle, sStepDescription);
	}
});
