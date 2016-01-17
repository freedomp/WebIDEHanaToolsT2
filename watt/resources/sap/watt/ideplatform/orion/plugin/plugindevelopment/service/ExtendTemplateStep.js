define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.ExtendTemplateStep");
		var oExtendTemplateStep = new sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.ExtendTemplateStep({
			context : this.context
		});

		var sStepTitle = this.context.i18n.getText("ExtendTemplateStep_title");

		return this.context.service.wizard.createWizardStep(oExtendTemplateStep, sStepTitle, "");
	}
});
