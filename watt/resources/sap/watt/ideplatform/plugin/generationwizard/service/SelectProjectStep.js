define({
	getContent : function() {
		var that = this;
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectProjectStepContent");
		var oSelectProjectStepContent = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.SelectProjectStepContent({
			context : that.context
		});

		var sTitle = that.context.i18n.getText("ProjectGenWizard_selectProjectTitle");
		return that.context.service.wizard.createWizardStep(oSelectProjectStepContent, sTitle, "");
	}
});
