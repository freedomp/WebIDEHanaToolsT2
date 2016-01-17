define({
	getContent : function() {
		jQuery.sap.require("sap.watt.hana.project.hanawizardsteps.ui.wizard.XS2ServicesStepContent");
		var oXS2ServicesStepContent = new sap.watt.hana.project.hanawizardsteps.ui.wizard.XS2ServicesStepContent({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_xs2ServiceStep_Title");
		return this.context.service.wizard.createWizardStep(oXS2ServicesStepContent, sTitle, "") ;
	}
});