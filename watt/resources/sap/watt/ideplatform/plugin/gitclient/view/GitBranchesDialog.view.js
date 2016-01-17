sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitBranchesDialog", {

	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitBranchesDialog";
	},

	createContent: function(oController) {
		var oBranchTemplate = new sap.ui.layout.Grid({
			vSpacing: 0,
			hSpacing: 0,
			content: [new sap.ui.commons.RadioButton({
				visible: "{visible}",
				text: "{branchName}",
				groupName: "",
				select: [oController._onSelectBranch, oController],
				selected: "{checked}",
				editable: {
					path: "currentBranch",
					formatter: function(bCurrent) {
						return !bCurrent;
					}
				},
				enabled: {
					path: "currentBranch",
					formatter: function(bCurrent) {
						return !bCurrent;
					}
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L8 M8 S8"
				})
			}), new sap.ui.commons.Label({
				text: "{branchName}",
				visible: {
					path: "visible",
					formatter: function(bCurrent) {
						return !bCurrent;
					}
				}
			})]
		});

		var oBranchesTreeTable = new sap.ui.table.TreeTable("BranchesTreeTable", {
			columnHeaderVisible: false,
			expandFirstLevel: true,
			selectionMode: sap.ui.table.SelectionMode.None,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		oBranchesTreeTable.addColumn(new sap.ui.table.Column({
			template: oBranchTemplate
		}));

		oBranchesTreeTable.bindRows("/modelData/branches");

		//reset types section
		this._oResetTypeRBG = new sap.ui.commons.RadioButtonGroup({
			selectedIndex: 0
		});
		//		var oItem = new sap.ui.core.Item({
		//			text : "Soft (HEAD updated)",
		//			key : "SOFT"
		//		});
		//		this._oResetTypeRBG.addItem(oItem);
		var oItem = new sap.ui.core.Item({
			text: "{i18n>gITRebaseDialog_reset_type_mixed}",
			key: "MIXED"
		});
		this._oResetTypeRBG.addItem(oItem);
		oItem = new sap.ui.core.Item({
			text: "{i18n>gITRebaseDialog_reset_type_hard}",
			key: "HARD"
		});
		this._oResetTypeRBG.addItem(oItem);

		var oResetType = new sap.ui.layout.VerticalLayout({
			visible: {
				path: "gitOp",
				formatter: function(sGitOp) {
					return sGitOp === 'RESET';
				}
			},
			content: [new sap.ui.commons.Label({
				text: "{i18n>gITRebaseDialog_reset_type_label}"
			}), this._oResetTypeRBG]
		});
		//END reset types section

		var _oBypassCodeReviewCheckBox = new sap.ui.commons.CheckBox({
			id : "byPassCodeReviewCB",
			text: "{i18n>gitPane_bypass_changes}",
			checked: "{bBypassCodeReview}",
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			}),
			width: "100%"
		}).addStyleClass("gitPaneControllerSpacing");


		var oPushExtensionLayout = new sap.ui.layout.VerticalLayout({
			visible: {
				parts: ["gitOp", "bGerrit"],
				formatter: function(sGitOp, bGerrit) {
					return (sGitOp === 'PUSH') && bGerrit;
				}
			},
			content: [ _oBypassCodeReviewCheckBox]
		});

		this._oBranchesDialog = new sap.ui.commons.Dialog({
			title : "{sDialogTitle}",
			id: this.createId("BranchesDialog"),
			width: "600px",
			modal: true,
			content: [oBranchesTreeTable, oResetType, oPushExtensionLayout]
		});



		this._oOKButton = new sap.ui.commons.Button({
			text: "{i18n>button_ok}",
			tooltip: "{i18n>button_ok}",
			enabled: false,
			press: [oController._execute, oController]
		});
		this._oBranchesDialog.addButton(this._oOKButton);

		this._oCancelButton = new sap.ui.commons.Button({
			text: "{i18n>button_cancel}",
			tooltip: "{i18n>button_cancel}",
			enabled: true,
			press: [oController.cancelRebase, oController]
		});
		this._oBranchesDialog.addButton(this._oCancelButton);
		//Add event listener to escape in order to stop button spinning 
		this._oBranchesDialog.addEventDelegate({
			onsapescape : oController.cancelRebase
		}, oController);
		return undefined;
	}

});