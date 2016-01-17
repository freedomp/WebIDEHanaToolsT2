define([], function() {
	
	/* eslint-disable no-use-before-define */

	var oContext = null;
	var parentProjectStepContent = null;
	var oSelectedTemplate = null;
	var taskId = null;
	var bIsOpen = false;

	var _openGenerationWizardUI = function(context) {
		oContext = context;

		if (bIsOpen) {
			return;
		} else {
			// immediately block other calls to open the wizard
			bIsOpen = true;
		}

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({});
		oModel.oData.openExtPane = true; //initialize open extensibility pane to be checked 

		var oParentProjectStepContentService = oContext.service.parentprojectstepcontent;
		var oFinishStepContentService = oContext.service.extensionprojectfinishstepcontent;

		Q.all([oParentProjectStepContentService.getContent(), oFinishStepContentService.getContent()]).spread(function(oParentProjectWizardStep, oFinishStepContent) {

			var wizard = sap.ui.getCore().byId("CreateExtensionProjectWizardUI");

			if (wizard !== undefined) {
				wizard.destroy();
			}
			var sTitle = oContext.i18n.getText("ExProjWizard_NewExtensionProject");
			var sSummary = oContext.i18n.getText("ExProjWizard_ClickFinish");

			var mFinishStepConfig = {
				summaryText: sSummary,
				finishStepContent: oFinishStepContent
			};

			oContext.service.wizard.createWizard("CreateExtensionProjectWizardUI", sTitle, "", [oParentProjectWizardStep], mFinishStepConfig,
				onFinishClicked, onAfterClose).then(function(oWizard) {

				wizard = oWizard;
				wizard.setModel(oModel);

				parentProjectStepContent = oParentProjectWizardStep.getStepContent();

				var onSummaryChange = function(oEvent) {
					var sId = oEvent.getParameter("id");

					if (sId === "projectName") {
						var sProjName = oEvent.getParameter("value");
						wizard.setSummary(oContext.i18n.getText("i18n", "ExProjWizard_Summary", [sProjName + " "]));
					}
				};

				parentProjectStepContent.attachValueChange(onSummaryChange, wizard);

				oContext.service.selection.getSelection().then(function(aSelection) {
					var oSelection = aSelection[0];
					if (oSelection && oSelection.document.getEntity().getFullPath()) {
						return oSelection.document.getProject().then(function(oProject) {
							// User may select any file/folder belonging to the project
							return oProject.getEntity().getFullPath();
						});
					} else {
						return "";
					}
				}).then(function(sFullPath) {
					parentProjectStepContent.setSelectedParentProjectPath(sFullPath, true, "Workspace");
				}).done();

				wizard.open();
				bIsOpen = false;
			}).fail(function (oError) {
				bIsOpen = false;
				throw oError;
			}).done();
		}).fail(function (oError) {
			bIsOpen = false;
			throw oError;
		}).done();

		// select fiori extension project template
		oContext.service.template.getTemplatesPerCategories("Fiori_project").then(function(mTemplatesByCategory) {
			oSelectedTemplate = mTemplatesByCategory[0].templates[0];
			oModel.getData().selectedTemplate = oSelectedTemplate;
		}).done();
	};

	var onAfterClose = function() {
		bIsOpen = false;
	};

	var _generateExtensionProject = function(oModel) {
		var oModelData = oModel.getData();
		var sExtensionProjectName = oModelData.projectName;
		
		return oContext.service.generation.generateProject(sExtensionProjectName, oSelectedTemplate, oModelData, true).then(function(oGeneratedExtensionProject) {
			oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "ExProjWizard_ExtensionProjectCreated")).done();
			oContext.service.log.info("Extension Project Wizard", oContext.i18n.getText("i18n", "ExProjWizard_ExtensionProjectCreated"), ["user"]).done();
			oContext.service.usagemonitoring.report("extensibility", "create_extension_project", oModelData.extensibility.type).done();

			if (oGeneratedExtensionProject && oModelData && oModelData.openExtPane === true) {
				// open Extensibility Pane
				oContext.service.uicontent.openVisualExt(oContext, oGeneratedExtensionProject, oModelData).done();
			}

			if (oModelData.importParent === true) {
				oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "importOriginalApplicationInProcess")).done();
				importOriginalApplication(oModel).fail(function() {
					// errors are already being written to the log by the parent project service
					// no need to do anything additional here
					// this empty block was added so there wouldn't be any unhandled error
					// see incident #1580097066
				}).done();
			} else {
				// stop the progress bar only if the user didn't choose to import the original app as well
				// if he did choose to import, stop the progress bar after import is finished
				oContext.service.progress.stopTask(taskId).done();
			}
		}).fail(function(mError) {
			return oContext.service.progress.stopTask(taskId).then(function() {
				throwError(mError);
			});
		});
	};
	
	var throwError = function(mError) {
		if (mError instanceof Error) {
			throw mError;
		} else {
			throw new Error(mError);
		}
	};

	var importOriginalApplication = function(oModel) {
		var sOriginalAppPath = oModel.oData.parentPath;
		var oModelData = oModel.getData();

		return oContext.service.extensionproject.createFolderName(sOriginalAppPath).then(function(projectName) {
			return oContext.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
				return oRoot.createFolder(projectName).then(function(destinationDocument) {
					var system = oModelData.extensibility.system;
					var parentPath = oModelData.parentPath;
					var type = oModelData.extensibility.type;

					return oContext.service.parentproject.import(parentPath, system, destinationDocument, type).finally(function() {
						// stop the progress bar incase of success or fail						
						return oContext.service.progress.stopTask(taskId);
					});
				});
			});
		});
	};

	var onFinishClicked = function() {
		var oModel = this.getModel();

		return oContext.service.progress.startTask().then(function(sGeneratedTaskId) {
			taskId = sGeneratedTaskId;
			oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "ExProjWizard_CreatingExtensionProject"), false).done();

			return _generateExtensionProject(oModel);
		});
	};
	
	var _setContext = function(oNewContext) {
		oContext = oNewContext;	
	};
	
	var _setSelectedTemplate = function(oTemplate) {
		oSelectedTemplate = oTemplate;	
	};
	
	/* eslint-enable no-use-before-define */

	return {
		openGenerationWizardUI: _openGenerationWizardUI,
		// methods exposed for testing purposes:
		generateExtensionProject: _generateExtensionProject,
		setContext: _setContext,
		setSelectedTemplate: _setSelectedTemplate
	};
});