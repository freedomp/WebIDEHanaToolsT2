define({

	_step : null,
	_aExtensionFilters : [],

	configure : function(mConfig) {
		var that = this;

		if (mConfig.styles) {
			this.context.service.resource.includeStyles(mConfig.styles).done();
		}

		if (mConfig.repositoryBrowserExtensionFilters.length > 0) {
			this._aExtensionFilters = mConfig.repositoryBrowserExtensionFilters;
		}

		if (mConfig.contextMenu) {
			return this.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
				that._oContextMenuGroup = oGroup;
			});
		}
	},

	getContent : function() {
		jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ServiceCatalogWizardStep");
		this._step = new sap.watt.saptoolsets.fiori.project.plugin.servicecatalog.ui.wizard.ServiceCatalogWizardStep({
			context : this.context,
			extensionFilters : this._aExtensionFilters
		});

		var sStepTitle = this.context.i18n.getText("serviceCatalogWizardStep_title_label");
		var sStepDesription = this.context.i18n.getText("dataConnectionWizardStep_oInstructionLabel_choose_service");
		return this.context.service.wizard.createWizardStep(this._step, sStepTitle, sStepDesription);
	},

	setProgressBarOn : function() {
		this._step.fireProcessingStarted();
	},

	setProgressBarOff : function() {
		this._step.fireProcessingEnded();
	},

	createDetailsContent : function() {
		this._step.createDetailsContent();
	},

	onCatalogServiceSelectionSuccess : function(oEvent) {
		this._step.onCatalogServiceSelectionSuccess(oEvent.params.connectionData);
	},

	onServiceCatalogStepNext : function(oEvent) {
		this._step.onServiceCatalogStepNext(oEvent.params.bNextEnabled, oEvent.params.sMessage,oEvent.params.severity);
	}

});