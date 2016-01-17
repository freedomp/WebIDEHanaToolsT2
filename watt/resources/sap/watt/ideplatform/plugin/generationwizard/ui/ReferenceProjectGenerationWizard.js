define(function() {

	return {

		_oContext : null,
		_oWizard : null,
		_bIsOpen : false,

		openGenerationWizardUI : function(oContext) {
			if (this._bIsOpen) {
				return;
			} else {
				// immediately block other calls to open the wizard
				this._bIsOpen = true;
			}

			var that = this;
			this._oContext = oContext;
			var oSelectReferenceProjectService = this._oContext.service.selectReferenceProjectStep;
			var oWizardService = this._oContext.service.wizard;

			Q.all([ oSelectReferenceProjectService.getContent() ]).spread(function(oSelectReferenceProjectStep) {

				var sWizardId = "CreateGenerationWizardUI";
				that._oWizard = sap.ui.getCore().byId(sWizardId);

				if (that._oWizard !== undefined) {
					that._oWizard.destroy();
				}

				var sTitle = that._oContext.i18n.getText("referenceProjectGenWizard_wizardTitle");
				var sSummary = that._oContext.i18n.getText("referenceProjectGenWizard_wizardSummary");
				var fnFinishClicked = function() {
					return that._fnGenerateProject(that._oWizard.getModel(), that);
				};

				var fnOnAfterClose = function () {
					that._bIsOpen = false;
				};

				var mFinishStepConfig = {
					summaryText : sSummary
				};

				return oWizardService.createWizard(sWizardId, sTitle, "", [ oSelectReferenceProjectStep ], mFinishStepConfig, fnFinishClicked, fnOnAfterClose).then(function (oWizard) {
					that._oWizard = oWizard;

					var oSelectReferenceProjectStepContent = oSelectReferenceProjectStep.getStepContent();

					oSelectReferenceProjectStepContent.attachValueChange(that._onSummaryChange, that);
					that._setDefaultOverwriteValue();
					that._setAvailableTemplates(oSelectReferenceProjectStepContent);
					oSelectReferenceProjectStepContent.setNumberOfWizardSteps(1);
					oSelectReferenceProjectStepContent.setWizardControl(that._oWizard);
					oSelectReferenceProjectStepContent.setBasicStepIndex(-1); // State there is no basic step at the wizard

					that._oWizard.open();
					that._bIsOpen = false;
				});
			}).fail(function (oError) {
				that._bIsOpen = false;
				throw oError;
			}).done();
		},

		_onSummaryChange : function(oEvent) {
			var oSelectedTemplate = oEvent.getParameter("value");
			if (oEvent.getParameter("id") === "templateName" && oSelectedTemplate) {
				var sSummaryMessage = this._oContext.i18n.getText("referenceProjectGenWizard_wizardSummary"); // Default message
				var templateAdditionalData = oSelectedTemplate.getAdditionalData();
    			if (templateAdditionalData && templateAdditionalData.projectName) {
    			    var sProjName = templateAdditionalData.projectName;
    			    sSummaryMessage = this._oContext.i18n.getText("commonGenWizard_projectSummaryMsg", [ sProjName ]);
    			}
    			this._oWizard.setSummary(sSummaryMessage);
				this._setDefaultOverwriteValue();
			}
		},

		_fnGenerateProject : function(oModel, that) {
			var sProjName = "SampleApplication"; // Default value
			var services = that._oContext.service;
			var oFileSystemService = services.filesystem.documentProvider;
			var templateAdditionalData = oModel.oData.selectedTemplate.getAdditionalData();
			if (templateAdditionalData && templateAdditionalData.projectName) {
			    sProjName = templateAdditionalData.projectName;
			}
			var sPackagePath = "/" + sProjName;
			var selectedTemplate = oModel.oData.selectedTemplate;
			var bOverwrite = oModel.oData.overwrite;
			
			return oFileSystemService.getDocument(sPackagePath).then(function(oPathResult) {
				return that._deleteExistingProject(oPathResult).then(function(){
					return oFileSystemService.getRoot().then(function(oRoot) {
						return oRoot.createFolder(sProjName).then(function(oProjectFolderDocument) {
							return services.generation.generate(sPackagePath, selectedTemplate, oModel.oData, bOverwrite, oProjectFolderDocument);
						});
					});
				});
			});

		},
		
		_deleteExistingProject : function(oProjectDocument) {
			if (oProjectDocument) {
				return oProjectDocument.delete();
			}
			return Q();
		},

		/*
		 * Sets the available templates for selection in the mode that the wizard is opened with.
		 * In this case set all templates that generate a reference project
		 */
		_setAvailableTemplates : function(oSelectReferenceProjectStepContent) {
			this._oContext.service.template.getTemplatesPerCategories("referenceProject").then(function(aTemplatesPerCategory) {
				oSelectReferenceProjectStepContent.setData(aTemplatesPerCategory);
			}).done();
		},

		_setDefaultOverwriteValue : function() {
			// Default value is false (no overwrite). Specific templates may change this in custom steps.
			this._oWizard.getModel().setProperty("/overwrite", false);
		}
	};
});