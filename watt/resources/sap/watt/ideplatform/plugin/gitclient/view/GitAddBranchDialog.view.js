sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitAddBranchDialog", {

	_oContext : undefined,

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf GITBranchesDialog
	*/
	getControllerName : function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitAddBranchDialog";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf GITBranchesDialog
	*/
	createContent : function(oController) {
		var that = this;
		this._oContext = this.getViewData().context;
		var oGrid = new sap.ui.layout.Grid({
			width : "100%",
			hSpacing : 0
		});

		var oBranchLabel = new sap.ui.commons.Label({
			text : "{i18n>gITBranchesDialog_source_branch}",
			required : true,
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3",
				linebreak : true
			})
		});
		oGrid.addContent(oBranchLabel);

		this._oDropdownBranches = new sap.ui.commons.DropdownBox({
			id: "create_branch_dialog_source_branch_dd",
			tooltip : "{i18n>gITBranchesDialog_branch}",
			displaySecondaryValues : true,
			value: "{sBranchValue}",
			width : "100%",
			change : [ oController._onDropBoxChange, oController ],
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S9"
			})
		});
		oGrid.addContent(this._oDropdownBranches);

		var _oListItemTemplate = new sap.ui.core.ListItem({
			text : "{Name}",
			additionalText : {
				path : "Type",
				formatter : function(sType) {
					switch (sType) {
						case "Branch":
							return that._oContext.i18n.getText("i18n", "gITBranchesDialog_local");
						case "RemoteTrackingBranch":
							return that._oContext.i18n.getText("i18n", "gITBranchesDialog_remote");
						default:
							break;
					}
				}
			}
		});

		this._oDropdownBranches.bindItems("results", _oListItemTemplate);

		var oBranchLabel2 = new sap.ui.commons.Label({
			text : "{i18n>gITBranchesDialog_branch_name}",
			required : true,
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3",
				linebreak : true
			})
		});
		oGrid.addContent(oBranchLabel2);

		this._oNewBranchTextField = new sap.ui.commons.TextField({
			id : "create_branch_dialog_branch_name_fld",
			placeholder : "{i18n>gITBranchesDialog_insert_new_branch_name}",
			tooltip : "{i18n>gITBranchesDialog_insert_new_branch_name}",
			value: "{sNewBranchName}",
			editable: "{bCanChangeBranchValue}",
			change : [ oController._isFieldsValid, oController ],
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L9 M9 S9"
			})
		});
		oGrid.addContent(this._oNewBranchTextField);

		//Error text area
		var _oErrorTextArea = new sap.ui.commons.TextView({
			width : "100%",
			text : "{sErrorMessage}",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("gitUserError");
		oGrid.addContent(_oErrorTextArea);
		
		var _buttonOk = new sap.ui.commons.Button({
				id : "create_branch_dialog_ok_btn",
				text : "{i18n>button_ok}",
				tooltip : "{i18n>button_ok}",
				press : [ oController._createNewBranch, oController ]
			});

		this._oBranchDialog = new sap.ui.commons.Dialog({
			modal : true,
			title : "{i18n>gITBranchesDialog_create_new_branch}",
			content : [ oGrid ],
			buttons : [ _buttonOk, new sap.ui.commons.Button({
				text : "{i18n>button_cancel}",
				tooltip : "{i18n>button_cancel}",
				press : [ oController._onCancel, oController ]
			}) ],
			defaultButton : _buttonOk
		});
		
		//Add event listener to escape in order to stop button spinning 
		this._oBranchDialog.addEventDelegate({
			onsapescape : oController._onCancel
		}, oController);

		return this._oBranchDialog;
	}

});