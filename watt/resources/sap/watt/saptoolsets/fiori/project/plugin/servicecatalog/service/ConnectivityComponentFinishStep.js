define({
	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ConnectivityComponentFinishStep");
		var oConnectivityFinishStep = new sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ConnectivityComponentFinishStep({
			context : this.context
		});

		return this.context.service.wizard.createWizardStep(oConnectivityFinishStep, "",  "");
	}
});
