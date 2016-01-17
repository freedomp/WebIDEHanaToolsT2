define({

	getContent: function() {
		var that = this;

		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/steps/WizardStepContentHelper").then(function(WizardStepContentHelper) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendHookStepContent");
			var oExtendHookStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendHookStepContent({
				context: that.context,
				wizardStepContentHelper: WizardStepContentHelper
			});

			var sTitle = that.context.i18n.getText("command_extendHookConfiguration");
			return that.context.service.wizard.createWizardStep(oExtendHookStepContent, sTitle, "");
		});
	}
});