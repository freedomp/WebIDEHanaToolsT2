define({
	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.AssignToStep");
		var oAssignToStep = new sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.AssignToStep({
			context : this.context
		});

		var sTitle = this.context.i18n.getText("AssignToStep_Title");
		return this.context.service.wizard.createWizardStep(oAssignToStep, sTitle, "");
	}
});