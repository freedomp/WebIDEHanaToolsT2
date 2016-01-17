define({

	getContent : function() {
		var that = this;
		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/steps/WizardStepContentHelper").then(function(WizardStepContentHelper) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.HideControlStepContent");
			var oHideControlStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.HideControlStepContent({
				context : that.context,
				wizardStepContentHelper : WizardStepContentHelper
			});

			var sTitle = that.context.i18n.getText("command_hideControlConfiguration");
			return that.context.service.wizard.createWizardStep(oHideControlStepContent, sTitle, "");
		});
	}
});
