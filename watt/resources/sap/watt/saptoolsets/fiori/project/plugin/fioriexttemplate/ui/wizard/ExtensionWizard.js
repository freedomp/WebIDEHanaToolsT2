define(function() {

	var wizard = null;
	var oContext = null;
	var oExtensionProjectDocument = null;

	var _openExtensionWizardUI = function(context) {

		oContext = context;

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({});

		var oSelectExtensionProjectService = context.service.selectextensionprojectstepcontent;
		var oSelectExtensionStepService = context.service.selectextensionstepcontent;

		Q.all([ oSelectExtensionProjectService.getContent(), oSelectExtensionStepService.getContent() ]).spread(
			function(oSelectExtensionProjectServiceStep, oSelectExtensionStepServiceStep) {

			wizard = sap.ui.getCore().byId("CreateExtensionWizardUI");

			if (wizard !== undefined) {
				wizard.destroy();
			}

			// Create wizard control
			var sTitle = oContext.i18n.getText("ExtensionWizard_NewExtension");
			var sSummary = oContext.i18n.getText("ExtensionWizard_ClickFinish");
			var sDescription = oContext.i18n.getText("i18n", "ExtensionWizard_AddExtensionToExistingExtensionProject");

			oContext.service.wizard.createWizard("CreateExtensionWizardUI", sTitle, sDescription,
					[ oSelectExtensionProjectServiceStep, oSelectExtensionStepServiceStep ], sSummary, onFinishClicked).then(
				function(oWizard) {

					wizard = oWizard;
					wizard.setModel(oModel);

					var oExtensionProjectStepContent = oSelectExtensionProjectServiceStep.getStepContent();
					var oSelectExtensionStepContent = oSelectExtensionStepServiceStep.getStepContent();

					setExtensionProjectName(oExtensionProjectStepContent);
					setAvailableTemplates(oSelectExtensionStepContent);

					oSelectExtensionStepContent.setNumberOfWizardSteps(2);
					oSelectExtensionStepContent.setWizardControl(wizard);
					oSelectExtensionStepContent.attachValueChange(updateSummary, wizard);

					wizard.open();
				}).done();
		}).done();
	};

	/*
	 * Sets the available templates for selection in the mode that the project is opened with.
	 * In this case set all templates that generate a project
	 */
	var setAvailableTemplates = function(oSelectTemplateStep) {
		oContext.service.template.getTemplatesPerCategories("Fiori_component").then(function(aTemplatesPerCategory) {
			oSelectTemplateStep.setData(aTemplatesPerCategory);
		}).done();
	};

	var setExtensionProjectName = function(oExtensionProjectStepContent) {
		oContext.service.selection.getSelection().then(function(aSelection) {
			oSelection = aSelection[0];
			var extensionProjectPath = "/";
			if (oSelection) {
				return oSelection.document.getProject().then(function (oProject) {
					// User may select any folder belonging to the project
					extensionProjectPath = oProject.getEntity().getFullPath();
					oExtensionProjectDocument = oProject;
					return oExtensionProjectStepContent.setExtensionProject(extensionProjectPath);
				});
			} else {
				return oExtensionProjectStepContent.setExtensionProject(extensionProjectPath);
			}
		}).done();
	};

	var report = function(extension, emptyOrCopy) {
        switch (extension) {
            case "fioriexttemplate.replaceviewcomponent": // 'replace view'
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_" + emptyOrCopy + "_view" + "_" + "from_wizard").done();
                break;

            case "fioriexttemplate.extendviewcomponent":
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "extend_extension_point" + "_" + "from_wizard").done();
                break;

            case "fioriexttemplate.extendcontrollercomponent":
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_with_" + emptyOrCopy + "_controller" + "_" + "from_wizard").done();
                break;

            case "fioriexttemplate.extendcontrollerhook":
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "implement_controller_hook" + "_" + "from_wizard").done();
                break;

            case "fioriexttemplate.i18ncomponent":
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "i18n_customization" + "_" + "from_wizard").done();
                break;

            case "fioriexttemplate.replaceservicecomponent":
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "replace_service" + "_" + "from_wizard").done();
                break;

            default: // an extendible element we can hide
                oContext.service.usagemonitoring.report("extensibility", "add_extension", "hide_control" + "_" + "from_wizard").done();
        }
	};
	
	var onFinishClicked = function() {
		var oModel = this.getModel();
		// get the finish button
		var extensionProjectPath = oModel.oData.extensionProjectPath;
		var selectedComponent = oModel.oData.selectedTemplate;
		var extension = oModel.oData.selectedTemplate.getId();
		var emptyOrCopy = null;

		if (extension === "fioriexttemplate.replaceviewcomponent" || extension === "fioriexttemplate.extendcontrollercomponent") {
			var id = oModel.oData.fiori.extensionCommon.extensionId;
			if (id.toLowerCase().indexOf("empty") > -1) {
				emptyOrCopy = "empty";
			} else {
				emptyOrCopy = "copy_of_original";
            }
		}

		return oContext.service.generation.generate(extensionProjectPath, selectedComponent, oModel.oData, true, oExtensionProjectDocument).then(function() {
            report(extension, emptyOrCopy);
        }).fail(function (mError) {
			if (mError instanceof Error) {
				throw mError;
			} else {
				throw new Error(mError);
			}
		});
	};
	
	var updateSummary = function(oEvent) {
		var template = oEvent.getParameter("value");
		var summary = wizard.getSummary();

		oExtensionProjectDocument.objectExists("i18n").then(function(exists) {
			if ((template !== "") && (template.getId() === "fioriexttemplate.i18ncomponent") && exists) {
				summary = oContext.i18n.getText("i18n", "ExtensionWizard_ClickFinish") + ". "
						+ oContext.i18n.getText("i18n", "ExtensionWizard_OverwriteWarning");

			} else if (template.getId() === "fioriexttemplate.replaceviewcomponent") {
				summary = oContext.i18n.getText("i18n", "ExtensionWizard_ClickFinish") + "\n"
					+ oContext.i18n.getText("i18n", "AddExtensionMessage_Important") + " "
					+ oContext.i18n.getText("i18n", "ExtensionWizard_ReplaceView_Implication");

			} else if (template.getId() === "fioriexttemplate.extendcontrollercomponent") {
				summary = oContext.i18n.getText("i18n", "ExtensionWizard_ClickFinish") + "\n"
					+ oContext.i18n.getText("i18n", "AddExtensionMessage_Important") + " "
					+ oContext.i18n.getText("i18n", "ExtensionWizard_ExtendController_Implication");
			} else {
				summary = oContext.i18n.getText("i18n", "ExtensionWizard_ClickFinish");
			}

			wizard.setSummary(summary);
		}).done();
	};

	return {
		openExtensionWizardUI : _openExtensionWizardUI
	};
});