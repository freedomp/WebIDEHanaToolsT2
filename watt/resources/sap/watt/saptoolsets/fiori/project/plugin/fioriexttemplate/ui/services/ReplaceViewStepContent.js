define({

	getContent : function() {
		var that = this;
		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/steps/WizardStepContentHelper").then(function(WizardStepContentHelper) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ReplaceViewStepContent");
			var oReplaceViewStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ReplaceViewStepContent({
				context : that.context,
				wizardStepContentHelper : WizardStepContentHelper
			});

			// fill the "Replace With" combo box
			oReplaceViewStepContent.addOptionsToReplaceWithCombo();

			var sTitle = that.context.i18n.getText("command_replaceView");
			return that.context.service.wizard.createWizardStep(oReplaceViewStepContent, sTitle, "");
		});
	}
});
