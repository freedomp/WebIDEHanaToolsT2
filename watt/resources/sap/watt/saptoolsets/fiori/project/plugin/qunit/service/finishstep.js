define({
	getContent: function() {

		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.qunit.control.FinishStepControl");

		var oMyStepContent = new sap.watt.saptoolsets.fiori.project.plugin.qunit.control.FinishStepControl({
			context: this.context
		});

		

		return this.context.service.wizard.createWizardStep(oMyStepContent, "", "");
	}
	

});