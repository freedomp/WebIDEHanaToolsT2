define([ "sap/watt/lib/lodash/lodash" ], function(_) {
	return {

		_oContext : null,
		_oWizard : null,

		openComponentWizardUI : function(oContext, oSelectedDocument, sTemplatesType) {
			var that = this;
			this._oContext = oContext;
			var oSelectTemplateService = this._oContext.service.templateselectstep;
			var oWizardService = this._oContext.service.wizard;
			var oUsageMonitoringService = this._oContext.service.usagemonitoring;

			Q.all([ oSelectTemplateService.getContent() ]).spread(
				function(oTemplateStep) {

					var sWizardId = "CreateGenerationWizardUI";
					that._oWizard = sap.ui.getCore().byId(sWizardId);

					if (that._oWizard !== undefined) {
						that._oWizard.destroy();
					}

					var sTitle = that._oContext.i18n.getText("componentGenWizard_wizardTitle");
					var sSummary = that._oContext.i18n.getText("componentGenWizard_wizardSummary");
					var bIsFinished = false;
					var fnFinishClicked = function() {
						return that._fnGenerateComponent(that._oWizard.getModel(), that).then(function() {
							bIsFinished = true;
						});
					};

					var fnOnAfterClose = function () {
						if (bIsFinished) {
							oUsageMonitoringService.report("template", "ComponentCreated", that._oWizard.getModel().getProperty(
								"/selectedTemplate").getId()).done();
						}
					};

					oWizardService.createWizard(sWizardId, sTitle, "", [ oTemplateStep ], sSummary, fnFinishClicked, fnOnAfterClose).then(
						function(oWizard) {
							that._oWizard = oWizard;

							var oTemplateSelectContent = oTemplateStep.getStepContent();

							that._oWizard.getModel().setProperty("/selectedDocument", oSelectedDocument);
							that._setDefaultComponentPath(oSelectedDocument);
							that._setDefaultOverwriteValue();
							that._setAvailableTemplates(oTemplateSelectContent,sTemplatesType);
							oTemplateSelectContent.setNumberOfWizardSteps(1);
							oTemplateSelectContent.setBasicStepIndex(-1); // State there is no basic step at the wizard
							oTemplateSelectContent.setWizardControl(that._oWizard);

							oTemplateSelectContent.attachValueChange(that._onChangeTemplate, that);

							that._oWizard.open();
						}).done();
				}).done();
		},


		openComponentWizardUIFromSecondStep : function(oContext, oSelectedDocument, oTemplate) {
			var that = this;
			this._oContext = oContext;
			var oWizardService = this._oContext.service.wizard;
			var oUsageMonitoringService = this._oContext.service.usagemonitoring;
			oTemplate.configWizardSteps().then(function(steps){
				var sWizardId = "CreateGenerationWizardUI";
				that._oWizard = sap.ui.getCore().byId(sWizardId);

				if (that._oWizard !== undefined) {
					that._oWizard.destroy();
				}

				var sTitle = that._oContext.i18n.getText("genWizard_wizardTitle_new") + " " + oTemplate.getName();
				var sSummary = that._oContext.i18n.getText("componentGenWizard_wizardSummary");
				var bIsFinished = false;

				var fnFinishClicked = function() {
					return that._fnGenerateComponent(that._oWizard.getModel(), that).then(function() {
						bIsFinished = true;
					});
				};

				if (!steps || _.isEmpty(steps))	 {
					that.openComponentWizardUI(oContext, oSelectedDocument);
				} else {
					var fnOnAfterClose = function () {
						if (bIsFinished) {
							oUsageMonitoringService.report("template", "ComponentCreated", that._oWizard.getModel().getProperty(
								"/selectedTemplate").getId()).done();
						}
					};
					oWizardService.createWizard(sWizardId, sTitle,"",[ steps[0] ], sSummary, fnFinishClicked, fnOnAfterClose).then(
						function(oWizard) {
							that._oWizard = oWizard;
							that._oWizard.selectedTemplate = oTemplate;
							that._oWizard.getModel().setProperty("/selectedTemplate", oTemplate);
							that._oWizard.getModel().setProperty("/selectedDocument", oSelectedDocument);
							that._setDefaultComponentPath(oSelectedDocument);
							that._setDefaultOverwriteValue();

							that._oWizard.open();
							that._addWizardStepsToWizard(steps,that._oWizard);
						}).done();
				}
			}).done();
		},

		_addWizardStepsToWizard : function(aWizardSteps, oWizard) {
			// Get and configure all template wizard steps
			if (oWizard.getModel().oData.neoapp) {
				oWizard.getModel().oData.neoapp.destinations = undefined;
			} else {
				oWizard.getModel().oData.destinations = undefined;
			}
			if (aWizardSteps !== undefined) {

				for ( var i = 1; i < aWizardSteps.length; i++) {
					var oStepService = oWizard.selectedTemplate.getWizardStepService(i);
					var oWizardStepContent = aWizardSteps[i].getStepContent();

					if ((i === aWizardSteps.length - 1) && oStepService.instanceOf("sap.watt.common.service.ui.WizardFinishStep")) {
						// Last step which represents finish step
						oWizard.setFinishStepContent(oWizardStepContent);
					}
					else {
						// Any other regular wizard step
						oWizard.addStep(aWizardSteps[i]);
					}
				}
			}
		},


		_onChangeTemplate : function(oEvent) {
			// Restore component path, overwrite and summary text to default values when a new template is selected
			// (in case some template custom step changes this without cleaning its changes before removal)
			var oSelectedDocument = this._oWizard.getModel().getProperty("/selectedDocument");
			this._setDefaultComponentPath(oSelectedDocument);
			this._setDefaultOverwriteValue();
			var sSummaryMessage = this._oContext.i18n.getText("componentGenWizard_wizardSummary");
			this._oWizard.setSummary(sSummaryMessage);
		},

		_fnGenerateComponent : function(oModel, that) {
			var packageName = oModel.oData.componentPath;
			var selectedComponent = oModel.oData.selectedTemplate;
			var oFileSystemService = that._oContext.service.filesystem.documentProvider;
			var oGenerationService = that._oContext.service.generation;
			var bOverwrite = oModel.oData.overwrite;
			// For backwards compatibility: Only if some custom step updated the value of the deprecated 'ovveride'  
			// property to 'true' (initiated by the wizard with 'false'), consider this value.
			if (oModel.oData.ovveride) {
				bOverwrite = oModel.oData.ovveride;
			}

			return oFileSystemService.getDocument(packageName).then(function(oComponentDocument) {
				return oGenerationService.generate(packageName, selectedComponent, oModel.oData, bOverwrite, oComponentDocument);
			});
		},

		/*
		 * Sets the available templates for selection in the mode that the project is opened with.
		 * In this case set all templates that generate a component
		 */
		_setAvailableTemplates : function(oSelectTemplateStep, sTemplatesType) {
			var sTemplatesCategory = sTemplatesType || "component" ;
			this._oContext.service.template.getTemplatesPerCategories(sTemplatesCategory).then(function(aTemplatesPerCategory) {
				oSelectTemplateStep.setData(aTemplatesPerCategory);
			}).done();
		},


		_setDefaultComponentPath : function(oSelectedDocument) {
			// Set default location according to selection. Specific templates may change this in custom steps.
			var sFullPath;
			if (oSelectedDocument.getType() === "file") {
				// File selected: the target location is its parent folder
				sFullPath = oSelectedDocument.getEntity().getParentPath();
			}
			else {
				// Folder selected
				sFullPath = oSelectedDocument.getEntity().getFullPath();
			}

			this._oWizard.getModel().setProperty("/componentPath", sFullPath);
		},


		_setDefaultOverwriteValue : function() {
			// Default value is false (no overwrite). Specific templates may change this in custom steps.
			this._oWizard.getModel().setProperty("/overwrite", false);
			this._oWizard.getModel().setProperty("/ovveride", false); //Deprecated. for backwards compatibility
		}

	};
});