/*
define(function() {

	return {

		_oContext : null,
		_oWizard : null,

		openGenerationWizardUI : function(oContext) {
			var that = this;
			this._oContext = oContext;
			var oBasicStepService = this._oContext.service.componentbasicstep;
			var oSelectTemplateService = this._oContext.service.templateselectstep;
			var oWizardService = this._oContext.service.wizard;

			Q.all([ oBasicStepService.getContent(), oSelectTemplateService.getContent() ]).spread(
					function(oBasicStep, oSelectTemplateStep) {

						var sWizardId = "CreateGenerationWizardUI";
						that._oWizard = sap.ui.getCore().byId(sWizardId);

						if (that._oWizard !== undefined) {
							that._oWizard.destroy();
						}
						
						var sTitle = that._oContext.i18n.getText("libraryComponentGenWizard_wizardTitle");
						var sSummary = that._oContext.i18n.getText("libraryComponentGenWizard_wizardSummary");
						var fnFinishClicked = function() {
							return that._fnGenerateProject(that._oWizard.getModel(), that);
						};
					
						oWizardService.createWizard(sWizardId, sTitle, "", [ oBasicStep, oSelectTemplateStep ], sSummary, fnFinishClicked).then(
								function (oWizard) {						
									that._oWizard = oWizard;
									
									var oBasicStepContent = oBasicStep.getStepContent();
									var oSelectTemplateStepContent = oSelectTemplateStep.getStepContent();
		
									oBasicStepContent.attachValueChange(that._onSummaryChange, that);
									that._setComponentName(oBasicStepContent);
									that._setAvailableTemplates(oSelectTemplateStepContent);
									oSelectTemplateStepContent.setNumberOfWizardSteps(2);
									oSelectTemplateStepContent.setWizardControl(that._oWizard);
									oBasicStepContent.attachValueChange(oSelectTemplateStepContent.onBasicInformationChange,
											oSelectTemplateStepContent);

									that._oWizard.open();
								}).done();					
					}).done();
		},

		_onSummaryChange : function(oEvent) {
			if (oEvent.getParameter("id") === "componentPath") {
				 var sCompPath = oEvent.getParameter("value");
				 var sSummaryMessage = this._oContext.i18n.getText("libraryComponentGenWizard_wizardSummary", [ sCompPath ]);
				this._oWizard.setSummary(sSummaryMessage);
			}
			
		},

		_fnGenerateProject : function(oModel, that) {
			var packageName = oModel.oData.componentPath;
			var selectedComponent = oModel.oData.selectedTemplate;
			var oFileSystemService = that._oContext.service.filesystem.documentProvider;
			var oGenerationService = that._oContext.service.generation;
			var bOverwrite = oModel.oData.ovveride;

			return oFileSystemService.getDocument(packageName).then(function(oComponentDocument) {
				return oGenerationService.generate(packageName, selectedComponent, oModel.oData, bOverwrite, oComponentDocument);
			});
			
		},


		/*
		 * Sets the available templates for selection in the mode that the wizard is opened with.
		 * In this case set all templates that generate a reference project
		 */
/*		 
		_setAvailableTemplates : function(oSelectTemplateStepContent) {
			this._oContext.service.template.getTemplatesPerCategories("component").then(function(aTemplatesPerCategory) {
				oSelectTemplateStepContent.setData(aTemplatesPerCategory);
			}).done();
		},
		
		_setComponentName : function(oBasicStepContent) {
			// set location according to selection, if a new component may be generated into it
			// or use '/' as default value
			this._oContext.service.selection.getSelection().then(function(aSelection) {
				var sFullPath = "/";
				if (aSelection && aSelection[0]) {
					if (aSelection[0].document.getType() === "folder" && aSelection[0].document.getEntity().getFullPath() !== "") {
						sFullPath = aSelection[0].document.getEntity().getFullPath();
					}
				}
				oBasicStepContent.setSelectedLocation(sFullPath);
			}).done();

		}

	};
});

*/