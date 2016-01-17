define({
	getContent : function() {
		jQuery.sap.require("sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateFinishStep");
		var oTemplateFinishStep = new sap.watt.ideplatform.orion.plugin.plugindevelopment.ui.TemplateFinishStep({
			context : this.context
		});

		return this.context.service.wizard.createWizardStep(oTemplateFinishStep, "",  "");
	}
});
