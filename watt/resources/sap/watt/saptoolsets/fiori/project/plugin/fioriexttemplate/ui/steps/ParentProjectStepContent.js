jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ParentProjectStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep");

var stepContent = function() {

	var wizard;
	var parentProjectPathTextField;
	var projectNameTextField;
	var parentProjectService = null;
	var context = null;
	var projectValidation = null;
	var importParentProjectCheckBox;
	var oSelectAppMenuButton;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		var localAppText = "{i18n>ParentProjectStep_ParentApplicationMandatory}";
		var appLocationPlaceholder = "{i18n>ParentProjectStep_SelectParentApplication}";

		// select parent project label
		var parentProjectLabel = new sap.ui.commons.TextView({
			text: localAppText,
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12"
			})
		}).addStyleClass("wizardBody");

		parentProjectPathTextField = new sap.ui.commons.TextField({
			value: "{/parentPath}",
			width: "100%",
			placeholder: appLocationPlaceholder,
			tooltip: "",
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});
		
		 oSelectAppMenuButton = new sap.ui.commons.MenuButton("ExtensionProjectWizard_SelectAppMenuButton", {
			text: "{i18n>ParentProjectStep_SelectAppButton}",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S4"
			}),
			width: "100%"
		});

		// create the menu for the Select Application button
		var oMenu = new sap.ui.unified.Menu();

		oMenu.addEventDelegate({
			onAfterRendering: function() {
				oMenu.$().css({
					"min-width": oSelectAppMenuButton.$().outerWidth() + "px",
					"box-sizing": "border-box"
				});
			}
		});

		// add menu options
		var oABAPRepositoryItem = new sap.ui.unified.MenuItem({
			text: "{i18n>ParentProjectStep_ABAPRepository}",
			select: function() {
				wizard.getRemoteDialog().openRemoteDialog(context, wizard);
			},
			width: "100%"
		});

		oMenu.addItem(oABAPRepositoryItem);

		var oHanaCloudItem = new sap.ui.unified.MenuItem({
			text: "{i18n>ParentProjectStep_HanaCloud}",
			select: function() {
				var action = "create";
				var applicationsDialog = wizard.getApplicationsDialog();
				applicationsDialog.open(action, wizard).done();
			},
			width: "100%"
		});

		if (sap.watt.getEnv("server_type") === "java" || sap.watt.getEnv("server_type") === "local_hcproxy") {
			oHanaCloudItem.setEnabled(false);
		}

		oMenu.addItem(oHanaCloudItem);
		
		var oWorkspaceItem = new sap.ui.unified.MenuItem({
			text: "{i18n>ParentProjectStep_Workspace}",
			select: function() {
				wizard.getLocalDialog().openLocalDialog(context, wizard);
			},
			width: "100%"
		});
		
		oMenu.addItem(oWorkspaceItem);
		oSelectAppMenuButton.setMenu(oMenu);

		parentProjectPathTextField.attachChange(function() {
			var parentProjectPath = parentProjectPathTextField.getValue().trim();
			wizard.setSelectedParentProjectPath(parentProjectPath, false);
		});

		importParentProjectCheckBox = new sap.ui.commons.CheckBox({
			text: "{i18n>ParentProjectStep_ImportParentCheckbox}",
			checked: "{/importParent}",
			enabled: false
		});

		var parentProjectContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M12 S12",
				linebreak: true
			}),
			content: [parentProjectLabel, parentProjectPathTextField, oSelectAppMenuButton]
		});

		wizard.addContent(parentProjectContent);

		// call super.init()
		if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep.prototype.init) {
			sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep.prototype.init.apply(this, arguments);
		}

		// update extension project name label
		var projectNameContent = this.getContent()[1];
		this.projectNameLabel = projectNameContent.getContent()[0];

		// update extension project text field
		projectNameTextField = projectNameContent.getContent()[1];

		projectNameTextField.setEnabled(false);
		projectNameTextField.attachChange(function() {
			projectNameTextField.setValue(projectNameTextField.getValue());
		});
		
		wizard.addContent(importParentProjectCheckBox);
	};

	var _onAfterRendering = function() {

		// super() 
		if (sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep.prototype.onAfterRendering) {
			sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep.prototype.onAfterRendering.apply(this);
		}

		context = this.getContext();

		if (parentProjectService === null) {
			parentProjectService = this.getContext().service.parentproject;
			//happens only once (it's here and not in init method since we need the context for string externalization)
			this.projectNameLabel.setText(context.i18n.getText("i18n", "SelectExtensionProjectStep_ExtensionProjectLocation"));
		}
	};

	var _setProjectValidation = function(projModel) {
		projectValidation = projModel;
	};

	var _cleanStep = function() {
		projectValidation = null;
	};

	var setImportParentCheckboxStatus = function(type) {

		if (type === "Workspace") {
			importParentProjectCheckBox.setChecked(false);
			importParentProjectCheckBox.setEnabled(false);

		} else { // hcp and (BSP || abaprep)
			importParentProjectCheckBox.setChecked(false);
			importParentProjectCheckBox.setEnabled(true);
		} 
	};

	var _setSelectedParentProjectPath = function(parentProjectPath, onOpen, type, system) {
		var oModel = wizard.getModel().oData;

		setImportParentCheckboxStatus(type);
		
		parentProjectPathTextField.setValue(parentProjectPath);
		
		oModel.parentProjectName = parentProjectPath;
		if (parentProjectPath && parentProjectPath.indexOf("/") === 0) {
		    oModel.parentProjectName = parentProjectPath.substring(1);
		}

		if ((parentProjectPath === "") || (!parentProjectPath)) {

			// clear the project name text field
			projectNameTextField.setValue("");

			wizard.fireValidation({
				isValid: false,
				message: ""
			});

		} else { // perform validation only if the parentProjectPath has value
            
			// remove "/" from the parent project name if exist any - for the extension project name
            var parentProjectNameNoSlashes = oModel.parentProjectName.replace(/\//g, '');
			
			var promises = [];
            promises.push(context.service.extensionproject.createFolderName(parentProjectNameNoSlashes + "Extension"));
            // If the parent project was validated earlier, the validation result is saved in projectValidation, otherwise call the service and validate
            promises.push(Q(projectValidation === null ? parentProjectService.validateParentProject(parentProjectPath, type, system) : projectValidation));
			Q.all(promises).spread(function() {
                var result = arguments[1];
				projectNameTextField.setEnabled(result.isValid);
                var extensionProjectName = arguments[0];
				if (result.isValid === true) {
					result.model.extensibility.system = system;
					oModel.extensibility = result.model.extensibility;
					oModel.neoAppPath = result.model.neoAppPath;
					oModel.metadataPath = result.model.metadataPath;

					projectNameTextField.setValue(extensionProjectName);
				}

				if (onOpen && result.isValid === false) {
					parentProjectPathTextField.setValue(parentProjectPath);
					wizard.fireValidation(result);
				} else {
				    if (type.toLowerCase() === "workspace") {
				        result.message = context.i18n.getText("i18n", "ExProjWizard_ExtProjWorkspaceInfo");
				        result.severity = "info";
				    }
				    
					wizard.fireValidation(result);
					
					wizard.fireValueChange({
						id: "projectName",
						value: extensionProjectName
					});
				}

				// end the progress bar
				wizard.fireProcessingEnded();
			}).fail(function(error) {
				// end the progress bar
				wizard.fireProcessingEnded();
				projectNameTextField.setEnabled(false);

				if (onOpen && arguments[1].isValid === false) {
					parentProjectPathTextField.setValue("");
				} else {
					if (error.status === 404) {
						wizard.fireValidation({
							isValid: false,
							message: context.i18n.getText("i18n", "ParentProjectStep_ApplicationInvalidOrNotExistOnBSP", [parentProjectPath])
						});
					} else {
						var errorMessage = "";
						if (error.message) {
							errorMessage = error.message;
						} else if (error.statusText) {
							errorMessage = error.statusText;
						} else {
							errorMessage = error;
						}

						wizard.fireValidation({
							isValid: false,
							message: errorMessage
						});
					}
				}
			});
		}
	};

	return {
		metadata: {
			properties: {
				"localDialog": "object",
				"remoteDialog": "object",
				"applicationsDialog": "object"
			}
		},
		init: _init,
		onAfterRendering: _onAfterRendering,
		setSelectedParentProjectPath: _setSelectedParentProjectPath,
		setProjectValidation: _setProjectValidation,
		renderer: {},
		cleanStep: _cleanStep,
		setFocusOnFirstItem: function() {
			oSelectAppMenuButton.focus();
		}
	};
}();

sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ProjectNameStep.extend(
	"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ParentProjectStepContent", stepContent);