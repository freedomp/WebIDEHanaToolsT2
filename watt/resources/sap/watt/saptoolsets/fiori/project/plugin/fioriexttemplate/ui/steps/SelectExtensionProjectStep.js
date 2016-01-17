jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionProjectStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var selectExtensionProjectStep = function() {

	/* eslint-disable no-use-before-define */

	var wizard;
	var extensionProjectTextField;
	var extensionProjectPath;
	var extensionProject = null;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		// extension project label
		var extensionProjectLabel = new sap.ui.commons.TextView({
			text : "{i18n>SelectExtensionProjectStep_ExtensionProjectLocation}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S12"
			})
		});

		// extension project Text Field
		extensionProjectTextField = new sap.ui.commons.TextField({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			liveChange : function(oEvent) {
				extensionProjectTextFieldChanged(oEvent);
			},
			accessibleRole : sap.ui.core.AccessibleRole.Textbox
		});

		var extensionProjectTextFieldChanged = function(oEvent) {

			extensionProjectPath = oEvent.getParameter("liveValue");
			extensionProjectPath = extensionProjectPath.trim();

			if (extensionProjectPath.indexOf("/") !== 0) {
				// the path needs to start with a "/" for the validation to pass
				extensionProjectPath = "/" + extensionProjectPath;
			}

			wizard.setExtensionProject(extensionProjectPath);
		};

		var extensionProjectContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ extensionProjectLabel, extensionProjectTextField ]
		});

		wizard.addContent(extensionProjectContent);
	};

	var _onAfterRendering = function() {

		if (extensionProject === null) {
			extensionProject = this.getContext().service.extensionproject;
		}
	};

	/*
	 * set the Extension Project
	 */
	var _setExtensionProject = function(oExtensionProjectPath) {
		extensionProjectPath = oExtensionProjectPath;
		extensionProjectTextField.setValue(extensionProjectPath);

		validateExtensionProject(extensionProjectPath);
	};

	/*
	 * validate Extension Project
	 */
	var validateExtensionProject = function(sExtensionProjectPath) {
		wizard.fireProcessingStarted();
		var oResult;
		var oModel = wizard.getModel().oData;
		extensionProject.validateExtensionProject(sExtensionProjectPath).then(function(result) {
			oResult = result;
			if (result.isValid === true) {
				oModel.extensibility = result.extensibility;
				oModel.extensionProjectPath = sExtensionProjectPath;
				oModel.extensionProjectName = sExtensionProjectPath.substr(sExtensionProjectPath.lastIndexOf('/') + 1);
				return extensionProject.getResourceLocation(sExtensionProjectPath).then(function(ResourceLocationPath) {
					oModel.extensionResourceLocationPath = ResourceLocationPath;
					return wizard.getContext().service.filesystem.documentProvider.getDocument(sExtensionProjectPath).then(function(oExtensionProjectDocument){
						return wizard.getContext().service.ui5projecthandler.getAppNamespace(oExtensionProjectDocument).then(function(sExtensionProjectNamespace) {
							oModel.extensionProjectNamespace = sExtensionProjectNamespace;
						});
					});
				});
			}

		}).fail(function (oError) {
			var sMessage;
			if (typeof oError === "string") {
				sMessage = oError;
			}
			if (oError && oError.message) {
				sMessage = oError.message;
			}

			oResult = {
				isValid : false,
				message : sMessage
			};
		}).finally(function() {
			wizard.fireValueChange({
				value : oResult.isValid,
				message : oResult.message
			});

			wizard.fireValidation(oResult);
			wizard.fireProcessingEnded();
		}).done();
	};

	return {
		init : _init,
		onAfterRendering : _onAfterRendering,
		setExtensionProject : _setExtensionProject,
		renderer : {},
		setFocusOnFirstItem : function() {
			extensionProjectTextField.focus();
		}
	};

	/* eslint-enable no-use-before-define */

}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.SelectExtensionProjectStep", selectExtensionProjectStep);