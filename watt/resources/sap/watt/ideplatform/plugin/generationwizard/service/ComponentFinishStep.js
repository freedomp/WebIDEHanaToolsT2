define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentFinishStep");
		var oComponentFinishStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentFinishStep({
			context : this.context
		});

		return this.context.service.wizard.createWizardStep(oComponentFinishStep, "",  "");
	}
});
