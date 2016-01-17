jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.HideControlStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var hideControlStepContent = function() {

	var oModel = null;
	var wizard = null;
	var viewNameDropdownBox = null;
//	var filterDropdownBox = null;
	var UIControlDropdownBox = null;
	var parentProjectService = null;
	var context = null;
//	var ViewAllitems = null;

	/*
	 * Initializes the step and creates its UI.
	 * Occurs once when the wizard is opened.
	 */
	var _init = function() {
		wizard = this;

//		var filterLabel = new sap.ui.commons.TextView({
//			text: "{i18n>Filter}",
//			textAlign: "Left",
//			layoutData: new sap.ui.layout.GridData({
//				span: "L2 M2 S12"
//			})
//		}).addStyleClass("wizardBody");
//
//		filterDropdownBox = sap.ui.getCore().byId("filterDB");
//		if (filterDropdownBox) {
//			filterDropdownBox.destroy();
//		}
//
//		// filter drop-down
//		filterDropdownBox = new sap.ui.commons.DropdownBox({
//			id: "filterDB",
//			layoutData: new sap.ui.layout.GridData({
//				span: "L3 M6 S12"
//			}),
//			width: "100%",
//			accessibleRole: sap.ui.core.AccessibleRole.Combobox
//		});
//
//		var filterViewNameDropdownBox = function(type) {
//
//			var tmpRes = [];
//			viewNameDropdownBox.removeAllItems();
//			UIControlDropdownBox.removeAllItems();
//
//			for (var i = 0; i < oModel.resources.length; i++) {
//				if (oModel.resources[i].type === type || type === "All") {
//					tmpRes.push(oModel.resources[i]);
//				}
//			}
//			if (tmpRes.length === 0) {
//				var message;
//				if (type === "views") {
//					message = context.i18n.getText("i18n", "ExtendViewStep_NoViewsAvailable");
//				} else {
//					message = context.i18n.getText("i18n", "ExtendViewStep_NoFragmentsAvailable");
//				}
//				var result = {
//					isValid: false,
//					message: message
//				};
//				wizard.fireValidation(result);
//
//			} else {
//				wizard.getWizardStepContentHelper().fillDropdownBox(tmpRes, viewNameDropdownBox,
//					context.i18n.getText("i18n", "HideControlStep_NoViewsAvailable"));
//
//				viewNameDropdownBox.setSelectedKey();
//				_refresh();
//			}
//		};
//
//		// Event handler for selecting a view
//		filterDropdownBox.attachChange(function(oEvent) {
//			var filter = oEvent.getParameter("selectedItem").getModel().getData();
//
//			switch (filter.type) {
//				case "FilterView":
//					filterViewNameDropdownBox("views");
//					break;
//				case "FilterFragment":
//					filterViewNameDropdownBox("fragments");
//					break;
//				case "FilterEP":
//					break;
//				case "All":
//					filterViewNameDropdownBox("All");
//					break;
//			}
//		});

		// views label
		var viewNameLabel = new sap.ui.commons.TextView({
			text : "{i18n>HideControlStep_View}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		viewNameDropdownBox = sap.ui.getCore().byId("hcDDB");
		if (viewNameDropdownBox) {
			viewNameDropdownBox.destroy();
		}

		// views combo box
		viewNameDropdownBox = new sap.ui.commons.DropdownBox({
			id : "hcDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// Event handler for selecting a view
		viewNameDropdownBox.attachChange(function(oEvent) {
			var selectedView = oEvent.getParameter("selectedItem").getModel().getData();

			var promises = [];
			promises.push(context.service.extensionproject.isExtendable(oModel.extensionProjectPath, "sap.ui.viewModifications",
					selectedView.id));
			promises.push(parentProjectService.getControlIds(selectedView, oModel.extensibility.type, oModel.extensibility.system));
			Q.all(promises).spread(function() {
				var isExtendable = arguments[0];
				var controlIds = arguments[1];

				// fill the drop-down of control ids
				var result = wizard.getWizardStepContentHelper().fillDropdownBox(controlIds, UIControlDropdownBox,
						context.i18n.getText("i18n", "HideControldStep_NoUIControlsAvailable"));

				if (result.isValid === true && isExtendable === true) {
					UIControlDropdownBox.fireChange({
						"selectedItem" : UIControlDropdownBox.getItems()[0]
					});
					wizard.fireValidation(result);
				} else if (result.isValid === false) {
					wizard.fireValidation(result);
				} else { // isExtendable === false) 
					result = {
						isValid : false,
						message : context.i18n.getText("i18n", "cannot_hide_controls_viewreplaced", [ selectedView.name ])
					};
					wizard.fireValidation(result);
				}
			}).fail(function (oError) {
				var oResult = {
					isValid : false,
					message : oError.message || oError
				};
				wizard.fireValidation(oResult);
			}).done();
		});

		// create and add the view content to the step
//		var viewContent1 = new sap.ui.layout.Grid({
//			layoutData: new sap.ui.layout.GridData({
//				span: "L12 M12 S12",
//				linebreak: true
//			}),
//			content: [filterLabel, filterDropdownBox]
//		});

		// add view content
		var viewContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ viewNameLabel, viewNameDropdownBox ]
		});

		// Control IDs label
		var UIControlIdLabel = new sap.ui.commons.TextView({
			text : "{i18n>HideControldStep_UIControlID}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		UIControlDropdownBox = sap.ui.getCore().byId("cidDDB");
		if (UIControlDropdownBox) {
			UIControlDropdownBox.destroy();
		}

		// Control IDs combo box
		UIControlDropdownBox = new sap.ui.commons.DropdownBox({
			id : "cidDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// Event handler for selecting UI Control
		UIControlDropdownBox.attachChange(function(oEvent) {
			// get the selected UI Control
			var oSelectedUIControl = oEvent.getParameter("selectedItem").getModel().getData();
			var selectedView;
			// find the selected view
			var selectedViewKey = viewNameDropdownBox.getSelectedKey();
//			if (ViewAllitems) {
//				selectedView = ViewAllitems[selectedViewKey].getModel();
//			} else {
			selectedView = viewNameDropdownBox.getItems()[selectedViewKey].getModel().getData();
//			}
			// UPDATE THE MODEL with both selected view and selected control ID!
			wizard.getWizardStepContentHelper().updateModelWithSelectedResource(oModel, selectedView, oSelectedUIControl);
		});

		// add control ids content
		var uiControlContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ UIControlIdLabel, UIControlDropdownBox ]
		});

//		wizard.addContent(viewContent1);
		wizard.addContent(viewContent);
		wizard.addContent(uiControlContent);

		wizard.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12"
		}));
	};

//	var buildResourcesFilterDropdownbox = function(dropdownBox) {
//
//		var listItem = new sap.ui.core.ListItem({
//			text: "{i18n>FilterAll}",
//			key: 0
//		});
//
//		var oListModel = new sap.ui.model.json.JSONModel();
//        oListModel.setData({
//			type: "All"
//		});
//		listItem.setModel(oListModel);
//
//		dropdownBox.addItem(listItem);
//
//		listItem = new sap.ui.core.ListItem({
//			text: "{i18n>FilterView}",
//			key: 1
//		});
//		
//		oListModel = new sap.ui.model.json.JSONModel();
//		
//		oListModel.setData({
//			type: "FilterView"
//		});
//		listItem.setModel(oListModel);
//
//		dropdownBox.addItem(listItem);
//
//		listItem = new sap.ui.core.ListItem({
//			text: "{i18n>FilterFragment}",
//			key: 2
//		});
//		
//		oListModel = new sap.ui.model.json.JSONModel();
//		
//		oListModel.setData({
//			type: "FilterFragment"
//		});
//		listItem.setModel(oListModel);
//
//		dropdownBox.addItem(listItem);
//	};

	var _onAfterRendering = function() {

		context = this.getContext();
		if (wizard.getModel()) {
			oModel = wizard.getModel().getData();
		} else {
			oModel = this.getModel().getData();
		}


		if (parentProjectService === null) {
			parentProjectService = this.getContext().service.parentproject;
		}

//		if (filterDropdownBox.getItems().length === 0) {
//			buildResourcesFilterDropdownbox(filterDropdownBox);
//		}

		if (viewNameDropdownBox.getItems().length > 0) {
			return;
		}

		this.getWizardStepContentHelper().buildResourcesDropdownbox(this.getContext(), oModel, "views", viewNameDropdownBox, wizard,
				this.getContext().i18n.getText("i18n", "ExtendViewStep_NoViewsAvailable")/*, "fragments"*/);
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
			UIControlDropdownBox.removeAllItems();
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
			viewNameDropdownBox.focus();
		}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.HideControlStepContent", hideControlStepContent);