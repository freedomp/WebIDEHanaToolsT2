sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitStashDialog", {

	_oContext : undefined,

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf GITBranchesDialog
	*/
	getControllerName : function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitStashDialog";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf GITStashDialog
	*/
	createContent : function(oController) {
		var that = this;
		this._oContext = this.getViewData().context;
		var oGrid = new sap.ui.layout.Grid({
			width : "100%",
			hSpacing : 0
		});

		var oTextView = new sap.ui.commons.TextView({
			text: "{i18n>gITStashDialog_text}",
			width : "100%",
			wrapping : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		}).addStyleClass("stashDialog");
		oGrid.addContent(oTextView);
				
		var oMessageLabel = new sap.ui.commons.Label({
			text : "{/messageLabel}",
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L5 M5 S5",
				linebreak : true
			})
		});
		oGrid.addContent(oMessageLabel);


		this._oMessageTextField = new sap.ui.commons.TextField({
			value : "{/stashMessage}",
			tooltip : "{i18n>gITStashDialog_insert_message}",
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L7 M7 S7"
			})
		});
		oGrid.addContent(this._oMessageTextField);

		
		//Error text area
		this._oErrorTextArea = new sap.ui.commons.TextView({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("gitUserError");
		oGrid.addContent(this._oErrorTextArea);
		
		var _buttonOk = new sap.ui.commons.Button({
				text : "{i18n>button_ok}",
				tooltip : "{i18n>button_ok}",
				press : [ oController._onOk, oController ]
			});
		
		var _buttonCancel = new sap.ui.commons.Button({
			text : "{i18n>button_cancel}",
			tooltip : "{i18n>button_cancel}",
			press : [ oController._onCancel, oController ]
		});


		this._oStashDialog = new sap.ui.commons.Dialog({
			modal : true,
			title : "{i18n>gITStashDialog_stash}",
			width : "30%",
			content : [ oGrid ],
			buttons : [ _buttonOk, _buttonCancel ],
			defaultButton : _buttonOk
		});
		
		//Add event listener to escape in order to stop progress bar
		this._oStashDialog.addEventDelegate({
			onsapescape : oController._onCancel
		}, oController);

		return this._oStashDialog;
	}

});