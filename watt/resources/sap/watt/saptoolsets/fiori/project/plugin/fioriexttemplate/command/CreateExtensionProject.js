define({

	execute : function() {
		var that = this;
		return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/wizard/ExtensionProjectWizard").then(
				function(ExtensionProjectWizard) {
					ExtensionProjectWizard.openGenerationWizardUI(that.context);
				});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		return true;
	}

});