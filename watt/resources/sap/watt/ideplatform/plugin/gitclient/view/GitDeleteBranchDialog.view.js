sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitDeleteBranchDialog", {

	/** Specifies the Controller belonging to this View. 
	 * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	 * @memberOf GitDeleteBranchDialog
	 */
	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitDeleteBranchDialog";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	 * Since the Controller is given to this method, its event handlers can be attached right away.
	 * @memberOf GitDeleteBranchDialog
	 */
	createContent: function(oController) {
		var oTextView = new sap.ui.commons.TextView({
			text: "{i18n>gITDeleteBranchDialog_select_branch_for_deletion}"
		});
		
		this._oParentCheckBox = new sap.ui.commons.TriStateCheckBox({
			text: "{i18n>gITDeleteBranchDialog_column_ALL_branches}"
		}).addStyleClass("sapUiTableCell");
		
		this._oTable = new sap.ui.table.Table({
			selectionMode: sap.ui.table.SelectionMode.None,
			showNoData: false,
			columns: [
			    new sap.ui.table.Column({
					hAlign: "Left",
					label: this._oParentCheckBox,
					template: new sap.ui.commons.CheckBox({
						enabled: {
							parts: ["Name", "/oData/sBranchName"],
							formatter: function(sName, sBranchName) {
								return sName !== sBranchName;
							}
						},
						text: "{Name}",
						checked: "{Checked}"
					}),
					width: "100%"
				})
			]
		});
		this._oTable.bindRows("aLocalBranches");
		
		var _buttonDelete = new sap.ui.commons.Button({
				text: "{i18n>button_delete}",
				enabled: {
					parts: ["isBranchSelected", "isInProcess"],
					formatter: function(bSelected, bProcess) {
						return bSelected && !bProcess;
					}
				},
				tooltip: "{i18n>button_delete}",
				press: [oController._deleteBranch, oController]
			});

		this._oDeleteBranchDialog = new sap.ui.commons.Dialog({
			modal: true,
			title: "{i18n>gITDeleteBranchDialog_delete_branch}",
			content: [oTextView, this._oTable],
			buttons: [_buttonDelete, new sap.ui.commons.Button({
				text: "{i18n>button_cancel}",
				tooltip: "{i18n>button_cancel}",
				press: [oController._onCancel, oController]
			})],
			defaultButton : _buttonDelete
		}).addStyleClass("gitClientTable");

		//Add event listener to escape in order to stop button spinning 
		this._oDeleteBranchDialog.addEventDelegate({
			onsapescape: oController._onCancel
		}, oController);

		return undefined;
	}

});