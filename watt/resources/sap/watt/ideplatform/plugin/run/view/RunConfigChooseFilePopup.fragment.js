sap.ui.jsfragment("sap.watt.ideplatform.plugin.run.view.RunConfigChooseFilePopup", {
	createContent: function(oController) {
		//create the table
		var oFilesTable = new sap.ui.table.Table("oFilesTable",{
			allowColumnReordering: false,
			width: "100%",
			selectionMode: sap.ui.table.SelectionMode.Single,
			selectedIndex: 0,
			visibleRowCount: 5,
			selectionBehavior: sap.ui.table.SelectionBehavior.Row,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		oFilesTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>lbl_file_name}",
				design: "Bold"
			}),
			template: new sap.ui.commons.Label({
				text: "{name}",
				tooltip: "{fullPath}"
			})
		}));

		oFilesTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({
				text: "{i18n>lbl_file_path_choosepopup}",
				design: "Bold"
			}),
			template: new sap.ui.commons.Label({
				text: "{fullPath}",
				tooltip: "{fullPath}"
			})
		}));

		var oGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			content: [oFilesTable]
		});

		var oDialog = new sap.ui.commons.Dialog("oRunConfigChooseFilePopup", {
			width: "600px",
			modal: true,
			title: "{i18n>run_config_choose_file_popup_title}",
			content: [oGrid],
			buttons: [new sap.ui.commons.Button({
				text: "{i18n>lbl_file_ok}",
				press: [oController.ok, oController]
			}), new sap.ui.commons.Button({
				text: "{i18n>lbl_file_cancel}",
				press: [oController.cancel, oController]
			})]
		});

		oFilesTable.attachEvent("rowSelectionChange", function() {
			oController.enableOK();
		});
			
		oFilesTable.attachBrowserEvent("dblclick", oController.dbClicked, oController);
		return oDialog;

	}

});