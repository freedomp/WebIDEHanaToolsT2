define({
	getContent: function() {

		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.qunit.control.ChooseFileStepContent");

		var oMyStepContent = new sap.watt.saptoolsets.fiori.project.plugin.qunit.control.ChooseFileStepContent({
			context: this.context
		});

		var sTitle = this.context.i18n.getText("Choose_File");
		var sDescription = this.context.i18n.getText("Select_File");

		return this.context.service.wizard.createWizardStep(oMyStepContent, sTitle, sDescription);
	}
});