define({

	getContent : function() {
		var that = this;
		var aRequired = [];
		aRequired.push();

		return Q.sap.require("sap.watt.ideplatform.generationwizard/core/DataProviderManager").then(function(DataProviderManager) {
			jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep");
			var oModelBuilderStep = new sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep({
				context : that.context,
				dataProviderManager : DataProviderManager
			});

			var sTitle = that.context.i18n.getText("commonGenWizard_modelBuilderTitle");
			return that.context.service.wizard.createWizardStep(oModelBuilderStep, sTitle, "");
		});
	}
});
