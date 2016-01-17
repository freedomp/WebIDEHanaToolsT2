define(function() {
	var oModel = null;
	var selectedPackage;

    /* eslint-disable no-use-before-define */

	// This function opens packages dialog and returns it. 
	var _openPackageDialog = function(context, createApplicationStep, discoveryStatus) {

        var oLabel = new sap.ui.commons.TextView({
			width : "100%",
			text : context.i18n.getText("i18n", "PackageDialog_Explanation")
		});

		// create the Search Field
		var oSearch = new sap.ui.commons.SearchField({
			enableListSuggest : false,
			enableFilterMode : true,
			enableClear : true,
			width : "100%",
			startSuggestion : 0,
			tooltip : context.i18n.getText("i18n", "PackageDialog_SearchField"),
			suggest : function(oEvent) {
				oErrorTextArea.setText("");
				getSearchResults(oTable, oEvent.getParameter("value"), discoveryStatus);
			}
		}).addStyleClass("SearchField");

		// Create the Table of packages
		var oTable = new sap.ui.table.Table({
			visibleRowCount : 10,
			firstVisibleRow : 1,
			selectionMode : sap.ui.table.SelectionMode.Single,
			navigationMode : sap.ui.table.NavigationMode.Scrollbar,
			extension : [ oSearch ],
			noData : context.i18n.getText("i18n", "PackageDialog_NoData")
		});

		// Define the columns and the control templates to be used
		oTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : context.i18n.getText("i18n", "PackageDialog__PackageName"),
				design : "Bold"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "name"),
			sortProperty : "name",
			width : "100%"
		}));

		// update the table with search results 
		var getSearchResults = function(table, phrase, oDiscoveryStatus) {
			var packages = [];

			// if nothing is entered in the search field, clear the table
			if (phrase === "") {
				oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					modelData : packages //empty array
				});

				table.setModel(oModel);
				table.bindRows("/modelData");

				packageDialog.getButtons()[0].setEnabled(false); // disable OK button

			} else {
				// get packages from the selected system, according to phrase
				context.service.search.getPackages(oDiscoveryStatus, phrase).then(function(aPackages) {
					oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						modelData : aPackages
					});

					table.setModel(oModel);
					table.bindRows("/modelData");
					table.clearSelection();

					packageDialog.getButtons()[0].setEnabled(false); // disable OK button

				}).fail(function(error) {
					var message = context.i18n.getText("i18n", "PackageDialog_SearchFail");
					oErrorTextArea.setText(message);

					var responseText = error.status + " " + error.responseText;
					context.service.log.error("SAPUI5 ABAP Repository", message + " " + responseText, [ "user" ]).done();

					packageDialog.getButtons()[0].setEnabled(false); // disable OK button
				}).done();
			}
		};

		oTable.attachRowSelectionChange(function(oEvent) {
			if (oEvent.getParameter("rowContext") !== null) { // check if there is a selected row 

				var currentRowContext = oEvent.getParameter("rowContext");
				var selectedRowIndex = oEvent.getParameter("rowIndex");
				oTable.setSelectedIndex(selectedRowIndex); //show selection in table
				selectedPackage = currentRowContext.getProperty("name"); //set selected package
				packageDialog.getButtons()[0].setEnabled(true); // set OK button to be enabled
			}
		});

		oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

		//create error field
		var oErrorTextArea = new sap.ui.commons.TextView({
			width : "100%",
			text : ""
		}).addStyleClass("errorText");

		//create dialog
		var packageDialog = new sap.ui.commons.Dialog({
			title : context.i18n.getText("i18n", "PackageDialog_PackageSelection"),
			resizable : false,
			width : "475px",
			modal : true,
			content : [ oLabel, oSearch, oTable, oErrorTextArea ]
		});

		//create OK button
		var okButton = new sap.ui.commons.Button({
			text : context.i18n.getText("i18n", "PackageDialog_OK"),
			enabled : false,
			press : function() {
				packageDialog.close();
				// fire event which has to be caught (attachEvent) by the one who create this dialog.
				/* eslint-disable no-reserved-keys */
				packageDialog.fireEvent("selectedPackage", {
					package : selectedPackage
				});
				/* eslint-enable no-use-before-define */
			}
		}).addStyleClass("buttons");

		packageDialog.addButton(okButton);

		//create Cancel button
		var cancelButton = new sap.ui.commons.Button({
			text : context.i18n.getText("i18n", "PackageDialog_Cancel"),
			press : function() {
				packageDialog.close();
			}
		}).addStyleClass("buttons");

		packageDialog.addButton(cancelButton);
		packageDialog.setInitialFocus(oSearch);
		packageDialog.open();

		return packageDialog;
	};

    /* eslint-enable no-use-before-define */

	return {
		openPackageDialog : _openPackageDialog
	};

});