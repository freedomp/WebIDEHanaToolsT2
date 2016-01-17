define({
	execute : function() {
		var that = this;
		return that.context.service.projectType.getProjectTypes().then(function (aProjectTypes) {
			if(sap.watt.getEnv("internal")){
				for (var i = 0; i < aProjectTypes.length; i++) {
					if (aProjectTypes[i].id === "sap.watt.saptoolsets.fiori.project.ui5template.smartProject") {
						return that.context.service.selection.getSelection().then(function (aSelection) {
							return aSelection[0].document.getProject().then(function (oSelectedProject) {
								return Q.sap.require("sap.watt.ideplatform.generationwizard/ui/ComponentGenerationWizard").then(function (oComponentWizard) {
									return oComponentWizard.openComponentWizardUI(that.context, oSelectedProject, "smart_extension");
								});
							});
						});
					}
				}
			}
			return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/wizard/ExtensionWizard").then(function (ExtensionWizard) {
				ExtensionWizard.openExtensionWizardUI(that.context);
			});
		});
	},

	isAvailable : function() {
		return this.context.service.selection.assertNotEmpty();
	},

	isEnabled : function() {
		return this.context.service.selection.getSelection().then(function(aSelection) {
			return !aSelection[0].document.getEntity().isRoot();
		});
	}
});