define(["../utils/WizardUtils"],function(oWizardUtils) {

	return {

		_oContext: null,
		_oWizard: null,
		_bIsOpen: false,

		openGenerationWizardUI: function(oContext, oSelectedDocument, sType) {
			if (this._bIsOpen) {
				return;
			} else {
				// immediately block other calls to open the wizard
				this._bIsOpen = true;
			}

			var that = this;
			this._oContext = oContext;
			var oBasicStepService = this._oContext.service.projectbasicstep;
			var oSelectTemplateService = this._oContext.service.templateselectstep;
			var oWizardService = this._oContext.service.wizard;
			var oUsageMonitoringService = this._oContext.service.usagemonitoring;
			oUsageMonitoringService.startPerf("template", "create").done();

			Q.all([oBasicStepService.getContent(), oSelectTemplateService.getContent()]).spread(
				function(oBasicStep, oSelectTemplateStep) {

					var sWizardId = "CreateGenerationWizardUI";
					that._oWizard = sap.ui.getCore().byId(sWizardId);

					if (that._oWizard !== undefined) {
						that._oWizard.destroy();
					}

					var sSummary = that._oContext.i18n.getText("projectGenWizard_wizardSummary");
					var bIsFinished = false;
					var fnFinishClicked = function() {
						oUsageMonitoringService.startPerf("template", "finish").done();
						return that._fnGenerateProject(that._oWizard.getModel(), that).then(function() {
							bIsFinished = true;
						});
					};

					var fnOnAfterClose = function () {
						that._bIsOpen = false;
						if (bIsFinished) {
							oUsageMonitoringService.report("template", "finish", that._oWizard.getModel().getProperty(
								"/selectedTemplate").getId()).done();
						}
					};

					return oWizardService.createWizard(sWizardId, "", "", [oSelectTemplateStep, oBasicStep], sSummary, fnFinishClicked, fnOnAfterClose).then(
						function(oWizard) {
							that._oWizard = oWizard;

							var oBasicStepContent = oBasicStep.getStepContent();
							var oTemplateSelectContent = oSelectTemplateStep.getStepContent();

							that._oWizard.getModel().setProperty("/selectedDocument", oSelectedDocument);
							oTemplateSelectContent.attachValueChange(oBasicStepContent.onSelectedTemplateChange,
									oBasicStepContent);
							oBasicStepContent.attachValueChange(that._onSummaryChange, that);
							that._setProjectName(oBasicStepContent);
							that._setProjectNameLabel(oBasicStepContent, sType);
							if(sType === "module"){
								that._setAvailableTemplates(oTemplateSelectContent, "module");
							} else {
								that._setAvailableTemplates(oTemplateSelectContent, "project");
							}
							oTemplateSelectContent.setNumberOfWizardSteps(2);
							oTemplateSelectContent.setWizardControl(that._oWizard);
							oTemplateSelectContent.setBasicStepIndex(1);

							that._oWizard.open();
							that._bIsOpen = false;
						});
				}).fail(function (oError) {
					that._bIsOpen = false;
					throw oError;
				}).done();
		},

		openGenerationWizardUIFromSecondStep : function(oContext, oSelectedDocument, oTemplate) {
			if (this._bIsOpen) {
				return;
			} else {
				// immediately block other calls to open the wizard
				this._bIsOpen = true;
			}

			var that = this;
			this._oContext = oContext;
			var oBasicStepService = this._oContext.service.projectbasicstep;
			var oWizardService = this._oContext.service.wizard;
			var oUsageMonitoringService = this._oContext.service.usagemonitoring;
			oUsageMonitoringService.startPerf("template", "create").done();

			Q.all([oBasicStepService.getContent(), oTemplate.configWizardSteps()]).spread(
				function(oBasicStep, steps) {
					var sWizardId = "CreateGenerationWizardUI";
					that._oWizard = sap.ui.getCore().byId(sWizardId);

					if (that._oWizard !== undefined) {
						that._oWizard.destroy();
					}

					var sTitle = that._oContext.i18n.getText("genWizard_wizardTitle_new") + " " + oTemplate.getName();
					var sSummary = that._oContext.i18n.getText("projectGenWizard_wizardSummary");
					var bIsFinished = false;
					var fnFinishClicked = function() {
						oUsageMonitoringService.startPerf("template", "finish").done();
						return that._fnGenerateProject(that._oWizard.getModel(), that).then(function() {
							bIsFinished = true;
						});
					};

					var fnOnAfterClose = function () {
						that._bIsOpen = false;
						if (bIsFinished) {
							oUsageMonitoringService.report("template", "finish", that._oWizard.getModel().getProperty(
								"/selectedTemplate").getId()).done();
						}
					};

					return oWizardService.createWizard(sWizardId, sTitle,"",[ oBasicStep ], sSummary, fnFinishClicked, fnOnAfterClose).then(function(oWizard) {
						that._oWizard = oWizard;
						that._oWizard.selectedTemplate = oTemplate;

						var oBasicStepContent = oBasicStep.getStepContent();
						oBasicStepContent.attachValueChange(that._onSummaryChange, that);
						that._setProjectName(oBasicStepContent);
						that._setProjectNameLabel(oBasicStepContent, oTemplate.getType());

						that._oWizard.getModel().setProperty("/selectedTemplate", oTemplate);
						that._oWizard.getModel().setProperty("/selectedDocument", oSelectedDocument);

						that._oWizard.open();
						that._bIsOpen = false;
						that._addWizardStepsToWizard(steps,that._oWizard);
					});
				}).fail(function (oError) {
					that._bIsOpen = false;
					throw oError;
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

				for ( var i = 0; i < aWizardSteps.length; i++) {
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

		_onSummaryChange: function(oEvent) {
			if (oEvent.getParameter("id") === "projectName") {
				var sProjName = oEvent.getParameter("value");
				var sCurrentProjectTemplateType = oEvent.getSource().getModel().oData.selectedTemplate.getType();
				var sSummaryMessage = this._oContext.i18n.getText("commonGenWizard_project_and_module_SummaryMsg", [sCurrentProjectTemplateType, sProjName]);
				this._oWizard.setSummary(sSummaryMessage);
			}
		},

		_fnGenerateProject: function(oModel, that) {
			var packageName = oModel.oData.projectName;
			var services = that._oContext.service;
			var oSelectedTemplate = oModel.oData.selectedTemplate;
			var sPackagePath;
			var sTemplateType;
			if(oModel.oData.selectedTemplate){
				sTemplateType = oModel.oData.selectedTemplate.getType();
			}
			if(sTemplateType === "module") {
				var oSelectedDocument = oModel.oData.selectedDocument;
				var oSelectedDocEntity = oSelectedDocument.getEntity();
				var sSelectedDocParentPath = oSelectedDocEntity.getParentPath();
				var sSelectedDocName = oSelectedDocEntity.getName();
				if(oSelectedDocEntity.getType() === "file"){
					sPackagePath = sSelectedDocParentPath + "/" + packageName;
					return oSelectedDocument.getParent().then(function (oParentDoc) {
						return services.generation.generateProject(sPackagePath, oSelectedTemplate, oModel.oData, true, oParentDoc);
					});
				} else {
					sPackagePath = sSelectedDocParentPath + "/" + sSelectedDocName + "/" + packageName;
					return services.generation.generateProject(sPackagePath, oSelectedTemplate, oModel.oData, true, oSelectedDocument);
				}
			} else { // sTemplateType === "project" or undefined
				sPackagePath = "/" + packageName;
				return services.generation.generateProject(sPackagePath, oSelectedTemplate, oModel.oData, true);
			}
		},

		/*
		 * Sets the available templates for selection in the mode that the project is opened with.
		 * In this case set all templates that generate a project
		 */
		_setAvailableTemplates: function(oTemplateSelectContent, sType) {
			this._oContext.service.template.getTemplatesPerCategories(sType).then(function(aTemplatesPerCategory) {
				oTemplateSelectContent.setData(aTemplatesPerCategory);
			}).done();
		},

		/*
		 * Sets the project name field according to the selection in the repository browser
		 */
		_setProjectName: function(oBasicStepContent) {
			// set project name according to selection, if a new project may be generated into it
			this._oContext.service.selection.getSelection().then(
				function(aSelection) {
					if (!aSelection || !aSelection[0]) {
						return;
					}
					var oFirstSelectedDoc = aSelection[0].document;
					if ((oFirstSelectedDoc.getEntity().getFullPath() !== "") && (oFirstSelectedDoc.getEntity().getParentPath() === "")) {
						// the selection is an element directly under root (but not the root itself)
						oFirstSelectedDoc.getFolderContent().then(
							function(aContent) {
								if (oWizardUtils.isFolderEmpty(aContent)) {
									oBasicStepContent.setProjectName(oFirstSelectedDoc.getEntity().getName());
								}
							}).done();
					}
				}).done();
		},

		/*
		 * Sets the project name label according to the template's type
		 */
		_setProjectNameLabel: function(oBasicStepContent, sTemplateType) {
			oBasicStepContent.setProjectNameLabel(sTemplateType);
		}
	};
});