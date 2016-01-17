define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateInfoStep");
		var oTemplateInfoStep = new sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateInfoStep({
			context : this.context
		});

		var sStepTitle = this.context.i18n.getText("templateInfoStep_title");
		//var sStepDescription = that.context.i18n.getText("templateInfoStep_description");

		return this.context.service.wizard.createWizardStep(oTemplateInfoStep, sStepTitle, "");
	}
});
