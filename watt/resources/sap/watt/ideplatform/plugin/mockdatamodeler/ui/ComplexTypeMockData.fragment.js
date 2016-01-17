sap.ui.jsfragment("sap.watt.ideplatform.plugin.mockdatamodeler.ui.ComplexTypeMockData", {

	createContent : function(oController) {
		var oDialog = new sap.ui.commons.Dialog({
			width : "50%",
			modal : true,
			title : {
				path : "/selectedComplexName",
				formatter : function(sName) {
					if (!this.getModel("i18n")) {
						return "";
					}

					return this.getModel("i18n").getResourceBundle().getText("TITLE_COMPLEX_DIALOG", [ sName ]);
				}
			}
		});

		oDialog.addButton(new sap.ui.commons.Button({
			text : "{i18n>BUTTON_OK}",
			enabled : "{/isInputValid}",
			press : [ oController.onSaveComplexMockData, oController ]
		}));
		
		var oGrid = new sap.ui.layout.Grid().addStyleClass("mockDataTable");

		// complex mock data table control
		var oMockDataTable = new sap.ui.table.Table({
			id : this.createId("complexdataTable"),
			visibleRowCount : 1,
			selectionMode : sap.ui.table.SelectionMode.None,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		});
		oMockDataTable.bindRows("/complexMockData");
		oGrid.addContent(oMockDataTable);
		
		//Display input validation errors in the dialog
		var oValidationLabel = new sap.ui.commons.Label({
			text : "{/validationText}",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			wrapping : true
		}).addStyleClass("mockEditorUserError");
        oGrid.addContent(oValidationLabel);
        
		oDialog.addContent(oGrid);
		
		

		return oDialog;

	}

});