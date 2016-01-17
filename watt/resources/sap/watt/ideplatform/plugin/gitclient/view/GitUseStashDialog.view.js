sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitUseStashDialog", {

	_oContext : undefined,

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf GITUseStashDialog
	*/
	getControllerName : function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitUseStashDialog";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf GITUseStashDialog
	*/
	createContent : function(oController) {
		var that = this;
		this._oContext = this.getViewData().context;
		var oGrid = new sap.ui.layout.Grid({
			width : "100%",
			hSpacing : 0
		});

		var oTextView = new sap.ui.commons.TextView({
			text: "{/useStashMessage}",
			width : "100%",
			wrapping : true,
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12"
			})
		}).addStyleClass("stashDialog");
		oGrid.addContent(oTextView);
				
				
		//Error text area
		this._oErrorTextArea = new sap.ui.commons.TextView({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			})
		}).addStyleClass("gitUserError");
		oGrid.addContent(this._oErrorTextArea);
		
		var _buttonApply = new sap.ui.commons.Button({
				text : "{i18n>button_apply}",
				tooltip : "{i18n>button_apply}",
				press : [ oController._onApply, oController ]
			});
		
		var _buttonPop = new sap.ui.commons.Button({
			text : "{i18n>button_pop}",
			tooltip : "{i18n>button_pop}",
			press : [ oController._onPop, oController ]
		});
		
		var _buttonDrop = new sap.ui.commons.Button({
			text : "{i18n>button_drop}",
			tooltip : "{i18n>button_drop}",
			press : [ oController._onDrop, oController ]
		});
		
		var _buttonCancel = new sap.ui.commons.Button({
			text : "{i18n>button_cancel}",
			tooltip : "{i18n>button_cancel}",
			press : [ oController._onCancel, oController ]
		});


		this._oUseStashDialog = new sap.ui.commons.Dialog({
			modal : true,
			title : "{i18n>gITUseStashDialog_stash}",
			width : "35%",
			content : [ oGrid ],
			buttons : [ _buttonApply, _buttonPop, _buttonDrop, _buttonCancel ],
			defaultButton : _buttonApply
		});
		
		//Add event listener to escape in order to stop progress bar
		this._oUseStashDialog.addEventDelegate({
			onsapescape : oController._onCancel
		}, oController);

		return this._oUseStashDialog;
	}

});