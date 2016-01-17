jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ReplaceViewStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var replaceViewStepContent = function() {
	var wizard = undefined;
	var oModel = undefined;
	var viewNameDropdownBox = undefined;
	var replaceWithDropdownBox = undefined;
	var context = undefined;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {

		wizard = this;

		// views label
		var viewToReplaceLabel = new sap.ui.commons.TextView({
			text : "{i18n>ExtendViewStep_View}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		// views dropdown box
		viewNameDropdownBox = sap.ui.getCore().byId("rvDDB");
		if (viewNameDropdownBox) {
			viewNameDropdownBox.destroy();
		}

		viewNameDropdownBox = new sap.ui.commons.DropdownBox({
			id : "rvDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// Event handler for selecting a view
		viewNameDropdownBox.attachChange(function(oEvent) {
			replaceWithDropdownBox.fireChange({
				"selectedItem" : replaceWithDropdownBox.getItems()[0]
			});
		});

		// views content
		var viewContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ viewToReplaceLabel, viewNameDropdownBox ]
		});

		// "Replace With" label
		var replaceWithLabel = new sap.ui.commons.TextView({
			text : "{i18n>ReplaceStep_ReplaceWith}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		replaceWithDropdownBox = sap.ui.getCore().byId("rvwDDB");
		if (replaceWithDropdownBox) {
			replaceWithDropdownBox.destroy();
		}

		// "Replace With" dropdown box
		replaceWithDropdownBox = new sap.ui.commons.DropdownBox({
			id : "rvwDDB",
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
					name : "Copy of the parent view" // DO NOT TRANSLATE
				};
			} else { // default
				selectedReplaceWithOption = {
					name : "Empty view" // DO NOT TRANSLATE
				};
			}

			// find the selected view
			var selectedViewKey = viewNameDropdownBox.getSelectedKey();
			var selectedView = viewNameDropdownBox.getItems()[selectedViewKey].getModel().getData();

			wizard.getWizardStepContentHelper().updateModelWithSelectedResource(oModel, selectedView, selectedReplaceWithOption);
		});

		// "replace with" content
		var replaceWithContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ replaceWithLabel, replaceWithDropdownBox ]
		});

		wizard.addContent(viewContent);
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
			"name" : "{i18n>ReplaceViewStep_EmptyView}"
		}, {
			"name" : "{i18n>ReplaceViewStep_CopyOfParent}"
		} ];

		wizard.getWizardStepContentHelper().fillDropdownBox(options, replaceWithDropdownBox, "");
	};

	var _onAfterRendering = function() {

		context = this.getContext();
		oModel = wizard.getModel().oData;

		if (viewNameDropdownBox.getItems().length > 0) {
			this.fireValidation({
				isValid : true
			});
			return;
		}

		this.getWizardStepContentHelper().buildResourcesDropdownbox(this.getContext(), oModel, "views", viewNameDropdownBox, wizard,
				this.getContext().i18n.getText("i18n", "ExtendViewStep_NoViewsAvailable"));
	};

	var _refresh = function() {
		var selectedKey = viewNameDropdownBox.getSelectedKey();

		if (selectedKey !== "") {
			viewNameDropdownBox.fireChange({
				"selectedItem" : viewNameDropdownBox.getItems()[selectedKey]
			});
		}
	};

	var _cleanStep = function(projectChanged) {
		if (projectChanged !== undefined && projectChanged === true) {
			viewNameDropdownBox.removeAllItems();
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
			viewNameDropdownBox.focus();
		}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ReplaceViewStepContent", replaceViewStepContent);
