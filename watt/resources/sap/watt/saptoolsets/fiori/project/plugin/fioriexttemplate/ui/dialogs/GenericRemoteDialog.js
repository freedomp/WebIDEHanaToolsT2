define(["sap/watt/ideplatform/plugin/template/ui/wizard/ProgressIndicator"], function() {

    var remoteDialogId = "fioriexttemplate_remoteDialog";
	/* eslint-disable no-use-before-define */

	var destinations = null;
	var abapRepositoryService = null;
	var applications = null;
	var oModel = null;
	var parentProjectService = null;
	var selectedRowIndex = null;
	var selectedTitle = null;
	var dialog = null;
	var oTable = null;
	var systemDropdownBox = null;
	var oHtmlTextArea = null;
	var oDivider = null;
	var discoveryStatus = null;
	var extModel = null;
	var projectValidation = null;
	var _childDialog = null;
	var linkToDoc = "https://help.hana.ondemand.com/webide/frameset.htm?5c3debce758a470e8342161457fd6f70.html";

	var _createRemoteDialog = function(context, childDialog, isImport) {

		_childDialog = childDialog;

		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/css/Dialog.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/templateWizard.css"));

        dialog = sap.ui.getCore().byId(remoteDialogId);
        if (dialog) {
            dialog.destroy();
        }

		dialog = new sap.ui.commons.Dialog(remoteDialogId, {
			title: context.i18n.getText("i18n", "RemoteDialog_SelectApplicationABAPRepository"),
			resizable: false,
			width: "700px",
			modal: true
		});

		parentProjectService = context.service.parentproject;

		// progress indicator for the systems loading
		oDivider = new sap.watt.ideplatform.plugin.template.ui.wizard.ProgressIndicator({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		// System label
		var systemLabel = new sap.ui.commons.Label({
			required: true,
			text: context.i18n.getText("i18n", "RemoteDialog_System"),
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("label");

		// DropdownBox for the systems
		systemDropdownBox = new sap.ui.commons.DropdownBox({
			width: "100%",
			editable: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S12"
			})
		});

		// systems Grid
		var systemContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [systemLabel, systemDropdownBox]
		});

		// Create the SearchField
		var oSearch = new sap.ui.commons.SearchField({
			enableListSuggest: false,
			enableFilterMode: true,
			enableClear: true,
			enabled: false,
			tooltip: context.i18n.getText("i18n", "RemoteDialog_SearchApplicationIDorDescription"),
			width: "100%",
			startSuggestion: 0,
			suggest: function(oEvent) {
				updateTable(oTable, oEvent.getParameter("value"));
				fireInfoMessage(""); // clear any error messages if exist
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("buttons SearchField");

		// Create the Table of applications
		oTable = new sap.ui.table.Table({
			visibleRowCount: 7,
			firstVisibleRow: 1,
			selectionMode: sap.ui.table.SelectionMode.Single,
			navigationMode: sap.ui.table.NavigationMode.Scrollbar,
			extension: [oSearch],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			noData: context.i18n.getText("i18n", "RemoteDialog_NoData")
		});

		// Define the columns and the control templates to be used
		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: context.i18n.getText("i18n", "RemoteDialog_Name"),
				design: "Bold"
			}),
			template: new sap.ui.commons.TextView().bindProperty("text", "title"),
			sortProperty: "title",
			width: "200px"
		}));

		oTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: context.i18n.getText("i18n", "RemoteDialog_Description"),
				design: "Bold"
			}),
			template: new sap.ui.commons.TextView().bindProperty("text", "summary"),
			sortProperty: "summary",
			width: "300px"
		}));

		// create the text area for case there is no system defined
		oHtmlTextArea = new sap.ui.commons.FormattedTextView({}).addStyleClass("errorText");

		// create link for documentation
		var docLink = new sap.ui.commons.Link({
			text: context.i18n.getText("i18n", "GenericRemoteDialog_linktext"),
			href: linkToDoc,
			target: "_blank"
		});
		// set the text with placeholders inside
		oHtmlTextArea.setHtmlText(context.i18n.getText("i18n", "GenericRemoteDialog_nosystemmsg"));
		// add the desired control to the oHtmlTextArea 
		oHtmlTextArea.addControl(docLink);

		var oGrid = new sap.ui.layout.Grid({
			content: [oDivider, systemContent, oSearch, oTable],
			vSpacing: 0
		});

		dialog.addContent(oGrid);

		var fireErrorMessage = function(message) {
			dialog.fireEvent("reportError", {
				result: message
			});
		};
		
		var fireInfoMessage = function(message) {
			dialog.fireEvent("reportInfo", {
				result: message
			});
		};

		var that = this;

		// get the applications from the selected system
		abapRepositoryService = context.service.abaprepository;
		context.service.destination.getDestinations("dev_abap", true, "description").then(function(foundDestinations) {
			destinations = foundDestinations;
			// if there is no ABAP back-end system available add message with link to documentation 
			if (destinations === null) {
				dialog.addContent(oHtmlTextArea);
				_onProcessingEnded();
				return;
			}

			// add first empty item
			if (destinations.length > 0) {
				var firstListItem = new sap.ui.core.ListItem({
					text: ""
				});
				firstListItem.setKey("");

				systemDropdownBox.addItem(firstListItem);
			}

			var oItem = null;
			for (var i = 0; i < destinations.length; i++) {
				var destination = destinations[i];

				oItem = new sap.ui.core.ListItem();
				oItem.setText(destination.description);
				var oDestinationJSON = new sap.ui.model.json.JSONModel(destination);
				oItem.setModel(oDestinationJSON);
				oItem.setKey(i);
				systemDropdownBox.addItem(oItem);
			}

			// if only one destination exists - select it
			if ((destinations.length === 1) && (oItem !== null)) {
				systemDropdownBox.setSelectedKey(oItem.getKey());

				systemDropdownBox.fireChange({
					"selectedItem": oItem
				});
			}

			that.onProcessingEnded(); // end the progress indicator

		}).done();

		// Filter applications according to the sPrefix
		var filterApplications = function(sPrefix) {
			var aResult = [];
			var applicationTitle;
			var applicationDescription;
			for (var i = 0; i < applications.length; i++) {
				applicationTitle = applications[i].title.toLowerCase();
				if (applications[i].summary === "") {
					if (!sPrefix || sPrefix.length === 0 || applicationTitle.indexOf(sPrefix.toLowerCase()) !== -1) {
						aResult.push(applications[i]);
					}
				} else {
					applicationDescription = applications[i].summary.toLowerCase();
					if (!sPrefix || sPrefix.length === 0 || applicationTitle.indexOf(sPrefix.toLowerCase()) !== -1 || applicationDescription.indexOf(
						sPrefix.toLowerCase()) !== -1) {
						aResult.push(applications[i]);
					}
				}
			}

			return aResult;
		};

		// update the table while search
		var updateTable = function(oTable, sPrefix) {
			var filteredApplications = filterApplications(sPrefix); //Find the filtered applications according to the sPrefix
			oModel.setData({
				modelData: filteredApplications
			});
			oTable.setModel(oModel);
			oTable.bindRows("/modelData");
			oTable.removeSelectionInterval(0, selectedRowIndex); // remove last selected row
			dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled

			if (isImport) {
				_childDialog.clear();
			}
		};

		systemDropdownBox.attachChange(function() {
			oSearch.setValue("");
			oTable.setBusy(true);
			dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
			oTable.removeSelectionInterval(0, selectedRowIndex); // remove last selected row
			var key = systemDropdownBox.getSelectedKey();

			if (key === "") { // the empty item is selected
				// clear the table
				systemDropdownBox.setTooltip(null);
				fireErrorMessage(""); // remove previous error message
				oModel = new sap.ui.model.json.JSONModel(); // reset model data
				oModel.setData({
					modelData: {}
				});
				oTable.setModel(oModel);
				oTable.bindRows("/modelData");

				oTable.setBusy(false); // stop the busy indicator
				return;
			}

			key++;

			var destinationModel = systemDropdownBox.getItems()[key].getModel();
			var destination = destinationModel.getData();
			systemDropdownBox.setTooltip(destination.description);
			fireErrorMessage(""); // remove previous error message
			oModel = new sap.ui.model.json.JSONModel(); // reset model data
			oModel.setData({
				modelData: {}
			});
			oTable.setModel(oModel);
			oTable.bindRows("/modelData");

			return context.service.discovery.getStatus(destination).then(function(status) {
				discoveryStatus = status;
				if (discoveryStatus) {
					return abapRepositoryService.getApplications(discoveryStatus).then(function(oApplications) {
						applications = oApplications;
						oModel.setData({
							modelData: applications
						});
						oTable.setBusy(false);
						oSearch.setEnabled(true);
						oTable.setBusy(false);

					}).fail(function(error) {
						fireErrorMessage(error.message);
						dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
						oTable.setBusy(false);
						return;
					});
				} else {
					var message = context.i18n.getText("i18n", "SystemSelection_DiscoveryError");
					fireErrorMessage(message);
					dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
					oTable.setBusy(false);
					return;
				}
			}).fail(function(error) {
				var message;

				if (error.message === "Unauthorized") {
					message = context.i18n.getText("i18n", "SystemSelection_WrongCredentials");
				} else {
					message = context.i18n.getText("i18n", "SystemSelection_DiscoveryError");
				}

				fireErrorMessage(message);
				dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
				oTable.setBusy(false);
				return;
			}).done();
		});

		// Initially sort the table 
		oTable.sort(oTable.getColumns()[0]);

		oTable.attachRowSelectionChange(function(oEvent) {
			oTable.setBusy(true);
			dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
			if (oEvent.getParameter("rowContext") !== null) { // check if there is a selected row 
				var currentRowContext = oEvent.getParameter("rowContext");
				selectedRowIndex = oEvent.getParameter("rowIndex");
				oTable.setSelectedIndex(selectedRowIndex);
				selectedTitle = currentRowContext.getProperty("title");

				var destination = _getSelectedDestination();

				if (isImport) {
					dialog.getButtons()[0].setEnabled(true); // set OK button to be enabled
					oTable.setBusy(false);
				} else {
					//validate the selected application
					parentProjectService.validateParentProject(selectedTitle, "abaprep", destination).then(
						function(result) {
							extModel = result.model;
							projectValidation = result;
							if (result.isValid === true) {
							    fireInfoMessage(""); // clear any error messages if exist
								dialog.getButtons()[0].setEnabled(true); // set OK button to be enabled
								oTable.setBusy(false);
							} else {
								fireErrorMessage(result.message);
								dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
								oTable.setBusy(false);
							}
						}).fail(function(error) {
						if (!error.message) {
							fireErrorMessage(error.responseText);
						} else {
							fireErrorMessage(error.message);
						}
						dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
						oTable.setBusy(false);
					});
				}

			} else {
				oTable.setBusy(false);
			}
		});

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

		dialog.addButton(new sap.ui.commons.Button({
			text: context.i18n.getText("i18n", "OK"),
			enabled: false
		}));

		dialog.addButton(new sap.ui.commons.Button({
			text: context.i18n.getText("i18n", "Cancel"),
			press: function() {
				dialog.close();
			}
		}));

		dialog.setInitialFocus(systemDropdownBox.getId());
	};

	var _onSelectedSystem = function(oEvent) {
		systemDropdownBox.attachChange(oEvent);
	};

	var _onSelectedApp = function(fn) {
		oTable.attachRowSelectionChange(fn);
	};

	var _onOKPressed = function(fn) {
		dialog.getButtons()[0].attachPress(fn);
	};
	
	var _onCancelPressed = function(fn) {
		dialog.getButtons()[1].attachPress(fn);
	};

	var _getDialog = function() {
		return dialog;
	};

	var _getSelectedTitle = function() {
		return selectedTitle;
	};

	var _onProcessingStarted = function(/*oEvent*/) {
		oDivider.startAnimation();
	};

	var _onProcessingEnded = function(/*oEvent*/) {
		oDivider.stopAnimation();
	};

	var _getSelectedDestination = function() {
		var destination;

		var selectedItemId = systemDropdownBox.getSelectedItemId();
		var items = systemDropdownBox.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = systemDropdownBox.getItems()[i];

			if (item.sId === selectedItemId) {
				destination = item.getModel().getData();
			}
		}

		return destination;
	};

	return {
		createRemoteDialog: _createRemoteDialog,
		extensibilityModel: function() {
			return extModel;
		},
		projectValidation: function() {
			return projectValidation;
		},
		getDialog: _getDialog,
		onOKPressed: _onOKPressed,
		onCancelPressed : _onCancelPressed,
		onSelectedApp: _onSelectedApp,
		onSelectedSystem: _onSelectedSystem,
		getSelectedDiscoveryStatus: function() {
			return discoveryStatus;
		},
		getSelectedDestination: _getSelectedDestination,
		getSelectedTitle: _getSelectedTitle,
		onProcessingStarted: _onProcessingStarted,
		onProcessingEnded: _onProcessingEnded
	};

	/* eslint-enable no-use-before-define */
});