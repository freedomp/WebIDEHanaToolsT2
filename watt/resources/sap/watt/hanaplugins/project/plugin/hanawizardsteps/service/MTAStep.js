define({
	getContent : function() {
		jQuery.sap.require("sap.watt.hana.project.hanawizardsteps.ui.wizard.MTAStepContent");
		var oMTAStepContent = new sap.watt.hana.project.hanawizardsteps.ui.wizard.MTAStepContent({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("projectGenWizard_MTAStep_Title");
		return this.context.service.wizard.createWizardStep(oMTAStepContent, sTitle, "") ;
	}
});