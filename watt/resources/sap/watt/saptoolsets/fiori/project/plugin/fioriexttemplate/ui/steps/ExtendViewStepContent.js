jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendViewStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var extendViewStepContent = function() {

	var oModel = null;
	var viewNameDropdownBox = null;
	var filterDropdownBox;
	var extensionPointDropdownBox = null;
	var wizard = null;
	var parentProjectService = null;
	var context = null;
	var ViewAllitems;

	var _init = function() {

		wizard = this;

		// add select view name label
		var filterLabel = new sap.ui.commons.TextView({
			text : "{i18n>Filter}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		filterDropdownBox = sap.ui.getCore().byId("filterDB");
		if (filterDropdownBox) {
			filterDropdownBox.destroy();
		}
		// add select view name drop-down
		filterDropdownBox = new sap.ui.commons.DropdownBox({
			id : "filterDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		var filterViewNameDropdownBox = function(type) {

			var tmpRes = [];
			viewNameDropdownBox.removeAllItems();
			extensionPointDropdownBox.removeAllItems();

			for ( var i = 0; i < oModel.resources.length; i++) {
				if (oModel.resources[i].type === type || type === "All") {
					tmpRes.push(oModel.resources[i]);
				}
			}
			if (tmpRes.length === 0) {
				var message;
				if (type === "views") {
					message = context.i18n.getText("i18n", "ExtendViewStep_NoViewsAvailable");
				} else {
					message = context.i18n.getText("i18n", "ExtendViewStep_NoFragmentsAvailable");
				}
				var result = {
					isValid : false,
					message : message
				};
				wizard.fireValidation(result);

			} else {
				wizard.getWizardStepContentHelper().fillDropdownBox(tmpRes, viewNameDropdownBox, message);
				viewNameDropdownBox.setSelectedKey();
				_refresh();
			}
		};

		// Event handler for selecting a view
		filterDropdownBox.attachChange(function(oEvent) {
			var filter = oEvent.getParameter("selectedItem").getModel().getData();

			switch (filter.type) {
			case "FilterView":
				filterViewNameDropdownBox("views");
				break;
			case "FilterFragment":
				filterViewNameDropdownBox("fragments");
				break;
			case "FilterEP":
				break;
			case "All":
				filterViewNameDropdownBox("All");
				break;
			}
		});

		// add select view name drop-down
		viewNameDropdownBox = new sap.ui.commons.DropdownBox({
			id : "evDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// add select view name label
		var viewNameLabel = new sap.ui.commons.TextView({
			text : "{i18n>ExtendViewStep_View_Fragment}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		viewNameDropdownBox = sap.ui.getCore().byId("evDDB");
		if (viewNameDropdownBox) {
			viewNameDropdownBox.removeAllItems();
		} else {
			// add select view name drop-down
			viewNameDropdownBox = new sap.ui.commons.DropdownBox({
				id : "evDDB",
				layoutData : new sap.ui.layout.GridData({
					span : "L3 M6 S12"
				}),
				width : "100%",
				accessibleRole : sap.ui.core.AccessibleRole.Combobox
			});
		}

		// Event handler for selecting a view
		viewNameDropdownBox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}
			var selectedView = oEvent.getParameter("selectedItem").getModel().getData();

			var promises = [];
			promises.push(context.service.extensionproject.isExtendable(oModel.extensionProjectPath, "sap.ui.viewModifications",
					selectedView.id));
			promises.push(parentProjectService.getExtensionPoints(selectedView, oModel.extensibility.type, oModel.extensibility.system));
			Q.all(promises).spread(function() {
				var isExtendable = arguments[0];
				var extensionPoints = arguments[1];

				// fill the drop-down of extension points
				var result = wizard.getWizardStepContentHelper().fillDropdownBox(extensionPoints, extensionPointDropdownBox,
					context.i18n.getText("i18n", "ExtendViewStep_NoExtensionPoints"));

				if (result.isValid === true && isExtendable === true) {
					extensionPointDropdownBox.fireChange({
						"selectedItem" : extensionPointDropdownBox.getItems()[0]
					});
					wizard.fireValidation(result);
				} else if (result.isValid === false) {
					wizard.fireValidation(result);
				} else { // isExtendable === false
					result = {
						isValid : false,
						message : context.i18n.getText("i18n", "cannot_extend_view_viewreplaced", [ selectedView.name ])
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
		var viewContent1 = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ filterLabel, filterDropdownBox ]
		});

		// create and add the view content to the step
		var viewContent2 = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ viewNameLabel, viewNameDropdownBox ]
		});

		// add extension point label
		var extensionPointLabel = new sap.ui.commons.TextView({
			text : "{i18n>ExtendViewStep_ExtensionPoint}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		extensionPointDropdownBox = sap.ui.getCore().byId("epDDB");
		if (extensionPointDropdownBox) {
			extensionPointDropdownBox.destroy();
		}

		// add extension point drop-down
		extensionPointDropdownBox = new sap.ui.commons.DropdownBox({
			id : "epDDB",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M6 S12"
			}),
			width : "100%",
			accessibleRole : sap.ui.core.AccessibleRole.Combobox
		});

		// create and add the extension point content to the step
		var viewContent3 = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ extensionPointLabel, extensionPointDropdownBox ]
		});

		// Event handler for selecting extension point
		extensionPointDropdownBox.attachChange(function(oEvent) {
			// get the selected UI Control
			var oSelectedExtensionPoint = oEvent.getParameter("selectedItem").getModel().getData();
			var selectedView;
			// find the selected view
			var selectedViewKey = viewNameDropdownBox.getSelectedKey();
			if (ViewAllitems) {
				selectedView = ViewAllitems[selectedViewKey].getModel();
			} else {
				selectedView = viewNameDropdownBox.getItems()[selectedViewKey].getModel().getData();
			}

			// UPDATE THE MODEL with both selected view and selected extension point!
			wizard.getWizardStepContentHelper().updateModelWithSelectedResource(oModel, selectedView, oSelectedExtensionPoint);
		});

		wizard.addContent(viewContent1);
		wizard.addContent(viewContent2);
		wizard.addContent(viewContent3);

		wizard.setLayoutData(new sap.ui.layout.GridData({
			span : "L12 M12 S12"
		}));
	};

	var buildResourcesFilterDropdownbox = function(dropdownBox) {

		var listItem = new sap.ui.core.ListItem({
			text : "{i18n>FilterAll}",
			key : 0
		});

		var oListModel = new sap.ui.model.json.JSONModel();
		oListModel.setData({
			type : "All"
		});
		listItem.setModel(oListModel);

		dropdownBox.addItem(listItem);

		listItem = new sap.ui.core.ListItem({
			text : "{i18n>FilterView}",
			key : 1
		});

		oListModel = new sap.ui.model.json.JSONModel();
		oListModel.setData({
			type : "FilterView"
		});
		listItem.setModel(oListModel);

		dropdownBox.addItem(listItem);

		listItem = new sap.ui.core.ListItem({
			text : "{i18n>FilterFragment}",
			key : 2
		});

		oListModel = new sap.ui.model.json.JSONModel();
		oListModel.setData({
			type : "FilterFragment"
		});
		listItem.setModel(oListModel);

		dropdownBox.addItem(listItem);
	};

	var _onAfterRendering = function() {
		context = this.getContext();
		oModel = wizard.getModel().oData;

		if (parentProjectService === null) {
			parentProjectService = this.getContext().service.parentproject;
		}

		if (filterDropdownBox.getItems().length === 0) {
			buildResourcesFilterDropdownbox(filterDropdownBox);
		}

		if (viewNameDropdownBox.getItems().length > 0) {
			return;
		}

		this.getWizardStepContentHelper().buildResourcesDropdownbox(this.getContext(), oModel, "views", viewNameDropdownBox, wizard,
				context.i18n.getText("i18n", "ExtendViewStep_NoViewsAvailable"), "fragments");
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
			extensionPointDropdownBox.removeAllItems();
			filterDropdownBox.removeAllItems();
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
		"sap.watt.saptoolsets.fiori.project.plugin.fioriexttemplate.ui.steps.ExtendViewStepContent", extendViewStepContent);