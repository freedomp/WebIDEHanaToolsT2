define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.XmlTemplateViewsStepContent");
		var oXmlTemplateViewsStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.XmlTemplateViewsStepContent({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_xmlTemplateViewsTitle");
		return this.context.service.wizard.createWizardStep(oXmlTemplateViewsStep, sTitle, "") ;
	}
});
