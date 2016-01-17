sap.ui.jsfragment("sap.watt.ideplatform.plugin.mockdatamodeler.ui.MockDataModeler", {

	createContent: function(oController) {
		var oDialog = new sap.ui.commons.Dialog({
			width: "85%",
			modal: true,
			title: "{i18n>TITLE_MOCKDATA_DIALOG}"
		});

		var oGrid = new sap.ui.layout.Grid().addStyleClass("mockDataTable");

		oDialog.addButton(new sap.ui.commons.Button({
			text: "{i18n>BUTTON_OK}",
			enabled: "{/isInputValid}",
			press: [oController.onSaveMockData, oController]
		}));

		oDialog.addButton(new sap.ui.commons.Button({
			text: "{i18n>BUTTON_CANCEL}",
			press: [oController.close, oController]
		}));

		// entities table control
		var oTable = new sap.ui.table.Table({
			id: this.createId("entitiesTable"),
			visibleRowCount: 11,
			columnHeaderVisible: false,
			title: "{i18n>TITLE_ENTITIES_TABLE}",
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
			toolbar: new sap.ui.commons.Toolbar(),
			rowSelectionChange: [oController.onEntitySetSelection, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S2"
			})
		});
		// columns and the control templates to be used
		oTable.addColumn(new sap.ui.table.Column({
			template: "name",
			sortProperty: "name"
		}));
		oTable.bindRows("/entitySets");
		oGrid.addContent(oTable);

		// button to add a new mock data row
		var oAddMockdataBtn = new sap.ui.commons.Button({
			text: "{i18n>BUTTON_ADD_ROW}",
			tooltip: "{i18n>BUTTON_ADD_ROW_TOOLTIP}",
			press: [oController.onAddMockData, oController]
		});

		// button to delete mock data row(s)
		var oDeleteMockdataBtn = new sap.ui.commons.Button({
			text: "{i18n>BUTTON_DELETE}",
			tooltip: "{i18n>BUTTON_DELETE_TOOLTIP}",
			enabled: "{/isDeleteEnabled}",
			press: [oController.onDeleteMockData, oController]
		});

		// button to generate random mock data row(s)
		var oGenerateMockdataBtn = new sap.ui.commons.Button({
			text: "{i18n>BUTTON_GENERATE_RANDOM}",
			tooltip: "{i18n>BUTTON_GENERATE_RANDOM_TOOLTIP}",
			//lite: true,
			enabled: {
				path: "/selectedEntitySet",
				formatter: function(selectedEntitySet) {
					return !!selectedEntitySet;
				}
			},
			press: [oController.onGenerateMockData, oController]
		});

		var oToolbar = new sap.ui.commons.Toolbar().addStyleClass("globalToolbar");
		oToolbar.addItem(oAddMockdataBtn);
		oToolbar.addItem(oDeleteMockdataBtn);
		oToolbar.addRightItem(oGenerateMockdataBtn);

		// mock data table control
		var oMockDataTable = new sap.ui.table.Table({
			id: this.createId("mockdataTable"),
			title: "{i18n>TITLE_MOCKDATA_TABLE}",
			visibleRowCount: 10,
			enableSelectAll: true,
			rowSelectionChange: [oController.onRowSelection, oController],
			selectionMode: sap.ui.table.SelectionMode.Multi,
			selectionBehavior: sap.ui.table.SelectionBehavior.Row,
			toolbar: oToolbar,
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S10"
			})
		});
		oGrid.addContent(oMockDataTable);

		//Display input validation errors in the dialog
		var oValidationLabel = new sap.ui.commons.Label({
			text: "{/validationText}",
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S10",
				indent: "L2 M2 S2"
			}),
			wrapping: true
		}).addStyleClass("mockEditorUserError");
		oGrid.addContent(oValidationLabel);

		var oCB = new sap.ui.commons.CheckBox({
			text: "{i18n>CHECKBOX_USE_JSON}",
			checked: '{/isUseAsMockDataSource}',
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S10",
				indent: "L2 M2 S2"
			})
		});
		oGrid.addContent(oCB);

		oDialog.addContent(oGrid);

		oDialog.addEventDelegate({
			onAfterRendering: function() {
				oTable.setSelectedIndex(0);
				oTable.fireEvent("rowSelectionChange", {
					rowIndex: 0
				});
			}
		}, oController);

		return oDialog;

	}

});