jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendHookStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var extendHookStepContent = (function() {
	var wizard;
	var oModel;
	var controllerNameDropdownBox;
	var hooksDropdownBox;
	var context;
	var customizingJson;

	var _populateHooks = function() {
		// find the selected controller
		var selectedControllerKey = controllerNameDropdownBox.getSelectedKey();
		var selectedController = controllerNameDropdownBox.getItems()[selectedControllerKey].getModel().getData();
		return context.service.parentproject.getDocument(selectedController.path, "file", oModel.extensibility.system,
			oModel.extensibility.type).then(function(oDocument) {
				return oDocument.getContent().then(function(fileContent) {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.fioriexttemplate/util/ExtensionHook").then(function(ExtensionHook) {
						var hooks = ExtensionHook.getHooks(fileContent);
						var options = [];
						for ( var i = 0; i < hooks.length; i++) {
							var option = {
								"name" : hooks[i].name,
								"args" : hooks[i].args
							};
							options[options.length] = option;
						}

						var result = wizard.getWizardStepContentHelper().fillDropdownBox(options, hooksDropdownBox,
								context.i18n.getText("i18n", "ExtendViewStep_NoHooks"));

						wizard.fireValidation(result);
					});
				});
			});
	};

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		// controllers label
		var controllerLabel = new sap.ui.commons.TextView({
			text : "{i18n>ExtendControllerStep_Controller}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// controllers dropdown box
		controllerNameDropdownBox = sap.ui.getCore().byId("ecDDB");
		if (controllerNameDropdownBox) {
			controllerNameDropdownBox.destroy();
		}

		controllerNameDropdownBox = new sap.ui.commons.DropdownBox({
			id : "ecDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// Event handler for selecting a controller
		controllerNameDropdownBox.attachChange(function() {
			_populateHooks().then(function() {
				hooksDropdownBox.fireChange({
					"selectedItem" : hooksDropdownBox.getItems()[0]
				});
			}).fail(function (oError) {
				var oResult = {
					isValid : false,
					message : oError.message || oError
				};
				wizard.fireValidation(oResult);
			}).done();
		});

		// controllers content
		var controllerContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ controllerLabel, controllerNameDropdownBox ]
		});

		// "Hooks" label
		var hooksLabel = new sap.ui.commons.TextView({
			text : "{i18n>HookStep_Hooks}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		hooksDropdownBox = sap.ui.getCore().byId("chDDB");
		if (hooksDropdownBox) {
			hooksDropdownBox.destroy();
		}

		// Hooks dropdown box
		hooksDropdownBox = new sap.ui.commons.DropdownBox({
			id : "chDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		hooksDropdownBox.attachChange(function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			if (selectedItem) {
				// Get the selected hook
				var selectedHook = selectedItem.getModel().getData();

				// find the selected controller
				var selectedControllerKey = controllerNameDropdownBox.getSelectedKey();
				var selectedController = controllerNameDropdownBox.getItems()[selectedControllerKey].getModel().getData();

				// Don't allow re-extend of the same hook
				var customController = _getExtendingController(selectedController.id);
				if (customController) {
					/* eslint-disable dot-notation */
					var customControllerName = customController["controllerName"];
					/* eslint-enable dot-notation */
					context.service.extensionproject.isHookExtendedInController(selectedHook.name, customControllerName,
							oModel).then(function(isHookExtended) {
						var result = {
							isValid : !isHookExtended,
							message : isHookExtended ? context.i18n.getText("i18n", "ExtendHookStep_HookAlreadyExtended") : ""
						};
						wizard.fireValidation(result);
					}).fail(function(oError) {
						context.service.usernotification.warning(oError.message).done();
						var result = {
							isValid : false,
							message : context.i18n.getText("i18n", "ExtendHookStep_CustomControllerCannotBeParsed")
						};
						wizard.fireValidation(result);
					}).done();
				}

				// update the model only here
				wizard.getWizardStepContentHelper().updateModelWithSelectedResource(oModel, selectedController, selectedHook);
			}
		});

		var hooksContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ hooksLabel, hooksDropdownBox ]
		});

		wizard.addContent(controllerContent);
		wizard.addContent(hooksContent);

		wizard.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12"
		}));
	};

	var _getExtendingController = function(sControllerName) {
		if (!customizingJson) {
			return null;
		}
		var aControllerExtensions = customizingJson["sap.ui.controllerExtensions"];
		if (!aControllerExtensions) {
			return null;
		}
		return aControllerExtensions[sControllerName];
	};

	var _onAfterRendering = function() {

		oModel = wizard.getModel().oData;
		context = this.getContext();
		/* eslint-disable no-unused-expressions */
		context.service.extensionproject.getCustomizingJson(oModel.extensionProjectPath).then(function(_customizingJson) {
			/* eslint-enable no-unused-expressions */
			customizingJson = _customizingJson;
		}).done();

		if (controllerNameDropdownBox.getItems().length > 0) {
			this.fireValidation({
				isValid : true
			});
			return;
		}

		this.getWizardStepContentHelper().buildResourcesDropdownbox(this.getContext(), oModel, "controllers", controllerNameDropdownBox,
				wizard, this.getContext().i18n.getText("i18n", "ExtendControllerStep_NoControllersAvailable"));
	};

	var _refresh = function() {
		var selectedKey = controllerNameDropdownBox.getSelectedKey();

		if (selectedKey !== "") {
			controllerNameDropdownBox.fireChange({
				"selectedItem" : controllerNameDropdownBox.getItems()[selectedKey]
			});
		}
	};

	var _cleanStep = function(projectChanged) {
		if (projectChanged !== undefined && projectChanged === true) {
			controllerNameDropdownBox.removeAllItems();
		}

		if (wizard.getModel() && wizard.getModel().oData && wizard.getModel().oData.fiori) {
			wizard.getModel().oData.fiori = undefined;
		}
	};

	return {
		metadata : {
			properties : {
				"wizardStepContentHelper" : "object"
			}
		},
		init : _init,
		onAfterRendering : _onAfterRendering,
		renderer : {},
		refresh : _refresh,
		cleanStep : _cleanStep,
		setFocusOnFirstItem : function() {
			controllerNameDropdownBox.focus();
		}
	};
}());

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendHookStepContent", extendHookStepContent);