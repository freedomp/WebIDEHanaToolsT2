define({

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.AddFinishStepContent");
		var oFinishStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.AddFinishStepContent({
			context: this.context
		});

		return oFinishStepContent;
	}
});
