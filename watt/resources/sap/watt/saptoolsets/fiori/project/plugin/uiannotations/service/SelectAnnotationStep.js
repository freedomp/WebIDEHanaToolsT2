define({

	_step : null,
	_aExtensionFilters : [],

	configure : function(mConfig) {
		if (mConfig.styles) {
			this.context.service.resource.includeStyles(mConfig.styles).done();
		}

		if (mConfig.repositoryBrowserExtensionFilters.length > 0) {
			this._aExtensionFilters = mConfig.repositoryBrowserExtensionFilters;
		}
	},

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.wizard.AnnotationSelectionWizardStep");
		this._step = new sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.wizard.AnnotationSelectionWizardStep({
			context : this.context,
			extensionFilters : this._aExtensionFilters
		});

		var sStepTitle = this.context.i18n.getText("annotationSelectionWizardStep_title_label");
		return this.context.service.wizard.createWizardStep(this._step, sStepTitle,"");
	}

});
