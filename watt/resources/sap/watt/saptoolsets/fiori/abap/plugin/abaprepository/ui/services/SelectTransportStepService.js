define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectTransportStep");
		var oSelectTransportStep = new sap.watt.saptoolsets.fiori.abap.plugin.abaprepository.ui.steps.SelectTransportStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("SelectTransportStep_SelectTransport");
		return this.context.service.wizard.createWizardStep(oSelectTransportStep, sTitle, "");
	}
});
