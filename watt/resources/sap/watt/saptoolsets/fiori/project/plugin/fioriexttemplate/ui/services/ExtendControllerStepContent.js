define({

	getContent : function() {
		var that = this;

		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/steps/WizardStepContentHelper").then(function(WizardStepContentHelper) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendControllerStepContent");
			var oExtendControllerStepContent = new sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendControllerStepContent({
				context : that.context,
				wizardStepContentHelper : WizardStepContentHelper
			});

			// fill the "Replace With" combo box
			oExtendControllerStepContent.addOptionsToReplaceWithCombo();

			var sTitle = that.context.i18n.getText("command_extendController");
			return that.context.service.wizard.createWizardStep(oExtendControllerStepContent, sTitle, "");
		});
	}
});
