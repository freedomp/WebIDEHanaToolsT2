define({
	getContent : function() {
		var that = this;
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep");
		var oSelectTemplateStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectTemplateStep({
			context : that.context
		});

		var sTitle = that.context.i18n.getText("referenceProjectGenWizard_availableTemplatesTitle");
		//var sDescription = that.context.i18n.getText("commonGenWizard_availableTemplatesDesc");
		return that.context.service.wizard.createWizardStep(oSelectTemplateStep, sTitle, "");
	}
});
