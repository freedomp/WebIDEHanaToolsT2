define({
	getContent: function() {

		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.qunit.control.SelectViewsStepContent");

		var oMyStepContent = new sap.watt.saptoolsets.fiori.project.plugin.qunit.control.SelectViewsStepContent({
			context: this.context
		});

		var sTitle = this.context.i18n.getText("Select_Views_Title");
		var sDescription = this.context.i18n.getText("Select_View_Description");

		return this.context.service.wizard.createWizardStep(oMyStepContent, sTitle, sDescription);
	}
});