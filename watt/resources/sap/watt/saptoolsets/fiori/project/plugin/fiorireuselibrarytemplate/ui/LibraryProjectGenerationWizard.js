/*
define(function() {

	return {

		_oContext : null,
		_oWizard : null,

		openGenerationWizardUI : function(oContext) {
			var that = this;
			this._oContext = oContext;
			var oBasicStepService = this._oContext.service.projectbasicstep;
			var oSelectTemplateService = this._oContext.service.templateselectstep;
			var oWizardService = this._oContext.service.wizard;

			Q.all([ oBasicStepService.getContent(), oSelectTemplateService.getContent() ]).spread(
					function(oBasicStep, oSelectTemplateStep) {

						var sWizardId = "CreateGenerationWizardUI";
						that._oWizard = sap.ui.getCore().byId(sWizardId);

						if (that._oWizard !== undefined) {
							that._oWizard.destroy();
						}
						
						var sTitle = that._oContext.i18n.getText("libraryProjectGenWizard_wizardTitle");
						var sSummary = that._oContext.i18n.getText("libraryProjectGenWizard_wizardSummary");
						var fnFinishClicked = function() {
							return that._fnGenerateProject(that._oWizard.getModel(), that);
						};
						
						oWizardService.createWizard(sWizardId, sTitle, "", [ oSelectTemplateStep, oBasicStep ], sSummary, fnFinishClicked).then(
								function (oWizard) {						
									that._oWizard = oWizard;
									
									var oBasicStepContent = oBasicStep.getStepContent();
									var oTemplateSelectContent = oSelectTemplateStep.getStepContent();
		
									oBasicStepContent.attachValueChange(that._onSummaryChange, that);
									that._setProjectName(oBasicStepContent);
									that._setApplicationDomains(oBasicStepContent);
									
									that._setAvailableTemplates(oTemplateSelectContent);
									oTemplateSelectContent.setNumberOfWizardSteps(2);
									oTemplateSelectContent.setWizardControl(that._oWizard);
									oTemplateSelectContent.setBasicStepIndex(1);
		
									that._oWizard.open();
								}).done();					
					}).done();
		},

		_onSummaryChange : function(oEvent) {
			if (oEvent.getParameter("id") === "projectName") {
				var sProjName = oEvent.getParameter("value");
				var sSummaryMessage = this._oContext.i18n.getText("libraryProjectGenWizard_wizardSummary", [ sProjName ]);
				this._oWizard.setSummary(sSummaryMessage);
			}
		},

		_fnGenerateProject : function(oModel, that) {
			var packageName = oModel.oData.projectName;
			var services = that._oContext.service;

			return services.filesystem.documentProvider.getDocument("/" + packageName).then(function(oPathResult) {
				if (oPathResult) {
					// The folder exists but still valid --> call just generate without creating a folder
					return that._fnGenerateInFolder(oPathResult, packageName, services, oModel, false);
				} else {
					return services.filesystem.documentProvider.getRoot().then(function(oRoot) {
						return oRoot.createFolder(packageName).then(function(oProjectFolderDocument) {
							if (oProjectFolderDocument) {
								return that._fnGenerateInFolder(oProjectFolderDocument, packageName, services, oModel, true);
							} else {
								throw new Error(that._oContext.i18n.getText("i18n", "libraryProjectGenWizard_createFolderFailedError"));
							}
						});
					});
				}
			});
		},

		_fnGenerateInFolder : function(oProjectFolderDocument, packageName, services, oModel, bFolderCreatedByGeneration) {
			var that = this;
			var sPackagePath = "/" + packageName;
			var selectedTemplate = oModel.oData.selectedTemplate;

			return services.generation.generate(sPackagePath, selectedTemplate, oModel.oData, false, oProjectFolderDocument).fail(
					function(oError) {
						that._fnDeleteGeneratedContent(oProjectFolderDocument, bFolderCreatedByGeneration);
						throw oError;
					});
		},

		_fnDeleteGeneratedContent : function(oProjectFolderDocument, bFolderCreatedByGeneration) {
			if (bFolderCreatedByGeneration) {
				oProjectFolderDocument.delete();
			} else {
				// Project folder should not be deleted - remove all content but .git folder
				oProjectFolderDocument.getFolderContent().then(function(aContent) {
					if (aContent) {
						for ( var i = 0; i < aContent.length; i++) {
							if (aContent[i].getType() !== "folder" || aContent[i].getTitle() !== ".git") {
								// delete all content except for folders named '.git'
								aContent[i].delete();
							}
						}
					}
				}).done();
			}
		},

		/*
		 * Sets the available templates for selection in the mode that the project is opened with.
		 * In this case set all templates that generate a project
		 */
/*		 
		_setAvailableTemplates : function(oTemplateSelectContent) {
			this._oContext.service.template.getTemplatesPerCategories("project").then(function(aTemplatesPerCategory) {
				oTemplateSelectContent.setData(aTemplatesPerCategory);
			}).done();
		},

		/*
		 * Sets the available application domains (as retrieved from the translation service)
		 */
/*		 
		_setApplicationDomains : function(oBasicStepContent) {
			// populate domains
			if (sap.watt.getEnv("internal")) {
				this._oContext.service.translation.getDomains().then(function(oDomains) {
					oBasicStepContent.setDomains(oDomains);
				}).fail(function() {
					oBasicStepContent.setDomains(undefined);
				});
			}
			
		},

		/*
		 * Sets the project name field according to the selection in the repository browser
		 */
/*		 
		_setProjectName : function(oBasicStepContent) {
			// set project name according to selection, if a new project may be generated into it
			this._oContext.service.selection.getSelection().then(
					function(aSelection) {
						if (!aSelection || !aSelection[0]) {
							return;
						}
						var oFirstSelectedDoc = aSelection[0].document;
						if ((oFirstSelectedDoc.getEntity().getFullPath() !== "")
								&& (oFirstSelectedDoc.getEntity().getParentPath() === "")) {
							// the selection is an element directly under root (but not the root itself)
							oFirstSelectedDoc.getFolderContent().then(
									function(aContent) {
										var bValidFolder = false;
										if ((!aContent) || aContent.length === 0) {
											// the selection is an empty folder
											bValidFolder = true;
										} 
										else if (aContent.length <= 3 ) {
											
											// Create a map of the content, from file title to file type
											var mContentTypes = {};
											for (var i=0; i<aContent.length; i++) {	
												mContentTypes[aContent[i].getTitle()] = aContent[i].getType();
											}
											
											/*
											 If non empty folder - Allow the exceptions of empty git repository folders and empty project folders:
											 a. Folder with 1 child: ".git" folder or ".project.json" file
											 b. Folder with 2 children: ".git" folder and "README.md" file, or ".git" folder and ".project.json" file
											 c. Folder with 3 children: ".git" folder, "README.md" file and ".project.json" file
											 */
/*											 
											if (aContent.length === 1) {
												if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") ||
														(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file")) {
													bValidFolder = true;
												}
												else {
													bValidFolder = false;
												}
											}
											
											else if (aContent.length === 2) {
												if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
														((mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") || 
																(mContentTypes["README.md"] && mContentTypes["README.md"] === "file"))) {
													bValidFolder = true;
												}
												else {
													bValidFolder = false;
												}
											}
											
											else if (aContent.length === 3) {
												if ((mContentTypes[".git"] && mContentTypes[".git"] === "folder") &&
														(mContentTypes[".project.json"] && mContentTypes[".project.json"] === "file") &&
																(mContentTypes["README.md"] && mContentTypes["README.md"] === "file")) {
													bValidFolder = true;
												}
												else {
													bValidFolder = false;
												}
											}
										}

										if (bValidFolder) {
											oBasicStepContent.setProjectName(oFirstSelectedDoc.getEntity().getName());
										}
									}).done();
						}
					}).done();
 		}
	};
});
*/