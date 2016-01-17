jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendControllerStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var extendControllerStepContent = function() {
	var wizard = undefined;
	var oModel = undefined;
	var controllerNameDropdownBox = undefined;
	var replaceWithDropdownBox = undefined;

	sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/css/Dialog.css"));

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		// controllers label
		var controllerToReplaceLabel = new sap.ui.commons.TextView({
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
		controllerNameDropdownBox.attachChange(function(oEvent) {
			replaceWithDropdownBox.fireChange({
				"selectedItem" : replaceWithDropdownBox.getItems()[0]
			});
		});

		// controllers content
		var controllerContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ controllerToReplaceLabel, controllerNameDropdownBox ]
		});

		// "Replace With" label
		var replaceWithLabel = new sap.ui.commons.TextView({
			text : "{i18n>ReplaceStep_ReplaceWith}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		replaceWithDropdownBox = sap.ui.getCore().byId("rcwDDB");
		if (replaceWithDropdownBox) {
			replaceWithDropdownBox.destroy();
		}

		// "Replace With" dropdown box
		replaceWithDropdownBox = new sap.ui.commons.DropdownBox({
			id : "rcwDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		replaceWithDropdownBox.attachChange(function(oEvent) {
			// get the selected option of replacement
			var selectedReplaceWithOption = null;
			// using the key instead of oEvent.getParameter("selectedItem").getModel()
			// because these strings are translated and are equal to {i18n<...}
			var selectedReplaceWithOptionKey = replaceWithDropdownBox.getSelectedKey();

			// currently there are only 2 options:
			// - Replace with empty (key = "0")
			// - Replace with parent (key = "1")
			if (selectedReplaceWithOptionKey === "1") {
				selectedReplaceWithOption = {
					name : "Copy of the parent controller" // DO NOT TRANSLATE
				};
			} else { // default
				selectedReplaceWithOption = {
					name : "Empty controller" // DO NOT TRANSLATE
				};
			}

			// find the selected controller
			var selectedControllerKey = controllerNameDropdownBox.getSelectedKey();
			var selectedController = controllerNameDropdownBox.getItems()[selectedControllerKey].getModel().getData();

			// update the model only here
			wizard.getWizardStepContentHelper().updateModelWithSelectedResource(oModel, selectedController, selectedReplaceWithOption);
		});

		// "replace with" content
		var replaceWithContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ replaceWithLabel, replaceWithDropdownBox ]
		});

		wizard.addContent(controllerContent);
		wizard.addContent(replaceWithContent);

		wizard.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12"
		}));
	};

	/*
	 * Fills the "Replace With" dropdown box.
	 */
	var _addOptionsToReplaceWithCombo = function() {
		var options = [ {
			"name" : "{i18n>ReplaceControllerStep_EmptyController}"
		}, {
			"name" : "{i18n>ReplaceControllerStep_CopyOfParent}"
		} ];

		wizard.getWizardStepContentHelper().fillDropdownBox(options, replaceWithDropdownBox, "");
	};

	var _onAfterRendering = function() {

		oModel = wizard.getModel().oData;

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
		addOptionsToReplaceWithCombo : _addOptionsToReplaceWithCombo,
		setFocusOnFirstItem : function() {
			controllerNameDropdownBox.focus();
		}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendControllerStepContent", extendControllerStepContent);
