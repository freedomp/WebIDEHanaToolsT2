sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitAuthentication", {

	getControllerName : function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitAuthentication";
	},

	createContent : function(oController) {

		if (!this._oAuthenticationDialog) {

			//Auth grid
			this.oAuthDialogGrid = new sap.ui.layout.Grid({
				vSpacing : 0,
				width : '100%'
			});

			var oBranchLabel = new sap.ui.commons.Label({
				text : "{i18n>fetchAuthentication_change}",
				width : '100%',
				visible : "{isGerrit}",
				required : true,
				layoutData : new sap.ui.layout.GridData({
					span : "L4 M4 S4",
					linebreak : true
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");

			this.oAuthDialogGrid.addContent(oBranchLabel);

			this._oBranchTextField = new sap.ui.commons.TextField({
				width : "100%",
				change : [ oController._handleChangeName, oController ],
				visible : "{isGerrit}",
				layoutData : new sap.ui.layout.GridData({
					span : "L8 M8 S8"
				}),
				placeholder: "{i18n>fetchAuthentication_insert_change_here}"
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");

			this.oAuthDialogGrid.addContent(this._oBranchTextField);
			
			//Handle pressing enter
		    this._oBranchTextField.addEventDelegate({
			    onsapenter : oController.handleAuthentication
		    }, oController);

			//UserName grid fields
			var oUserLabel = new sap.ui.commons.Label({
				width : "100%",
				required : true,
				text : "{i18n>fetchAuthentication_user}",
				visible : "{isUser}",
				layoutData : new sap.ui.layout.GridData({
					span : "L4 M4 S4",
					linebreak : true
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(oUserLabel);

			this._oUserNameTextField = new sap.ui.commons.TextField({
				width : "100%",
				value : "{user}",
				visible : "{isUser}",
				placeholder :  "{i18n>fetchAuthentication_insert_user_name_here}",
				tooltip : "{i18n>fetchAuthentication_insert_user_name_here}",
				layoutData : new sap.ui.layout.GridData({
					span : "L8 M8 S8"
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(this._oUserNameTextField);

			//SSH grid fields
			var oSSHLabel = new sap.ui.commons.Label({
				width : "100%",
				required : true,
				text : "{i18n>fetchAuthentication_ssh_private_key}",
				visible : {
					parts : [ "isSSH", "isCachedInService" ],
					formatter : function(isSSH, isCachedInService) {
						return isSSH && !isCachedInService;
					}
				},
				layoutData : new sap.ui.layout.GridData({
					span : "L4 M4 S4",
					linebreak : true
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(oSSHLabel);

			this._oFileUploader = new sap.ui.commons.FileUploader({
				width : "100%",
				visible : {
					parts : [ "isSSH", "isCachedInService" ],
					formatter : function(isSSH, isCachedInService) {
						return isSSH && !isCachedInService;
					}
				},
				change : [ oController._handleFileUploader, oController ],
				layoutData : new sap.ui.layout.GridData({
					span : "L8 M8 S8"
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(this._oFileUploader);

			//HTTPS grid fields
			var oLabel = new sap.ui.commons.Label({
				text : "{i18n>fetchAuthentication_password}",
				required : true,
				visible : {
					parts : [ "isSSH", "isCachedInService" ],
					formatter : function(isSSH, isCachedInService) {
						return !isSSH && !isCachedInService;
					}
				},
				layoutData : new sap.ui.layout.GridData({
					span : "L4 M4 S4",
					linebreak : true
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(oLabel);

			this._oPasswordField = new sap.ui.commons.PasswordField({
				width : "100%",
				visible : {
					parts : [ "isSSH", "isCachedInService" ],
					formatter : function(isSSH, isCachedInService) {
						return !isSSH && !isCachedInService;
					}
				},
				placeholder : "{i18n>fetchAuthentication_insert_password_here}",
				tooltip : "{i18n>fetchAuthentication_insert_password_here}",
				layoutData : new sap.ui.layout.GridData({
					span : "L8 M8 S8"
				})
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(this._oPasswordField);

			//On Enter press for password field execute ok button.
			this._oPasswordField.onsapenter = jQuery.proxy(oController.onPasswordSapenter, oController);

			//Save ssh private key check box
			this._oCheckBoxSaveData = new sap.ui.commons.CheckBox({
				text : '{i18n>gITAuthentication_save_ssh_cache}',
				tooltip : '{i18n>gITAuthentication_save_ssh_cache}',
				checked : "{isSaveCash}",
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12",
					linebreak : true
				}),
				visible : {
					path : "isCachedInService",
					formatter : function(isCachedInService) {
						return !isCachedInService;
					}
				}
			}).addStyleClass("gitMarginBottonWithGrid0Spacing");
			this.oAuthDialogGrid.addContent(this._oCheckBoxSaveData);

			//Error text area
			this._oErrorTextArea = new sap.ui.commons.TextView({
				width : "100%",
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12",
					linebreak : true
				})
			}).addStyleClass("gitUserError gitMarginBottonWithGrid0Spacing");

			this.oAuthDialogGrid.addContent(this._oErrorTextArea);
			
            var _buttonOk = new sap.ui.commons.Button({
					text : "{i18n>button_ok}",
					press : [ oController.handleAuthentication, oController ]
				});

			//Authentication Dialog
			this._oAuthenticationDialog = new sap.ui.commons.Dialog("FetchAuthenticationDialog", {
				title : "{sDialogTitle}",
				content : [ this.oAuthDialogGrid ],
				buttons : [ _buttonOk, new sap.ui.commons.Button({
					text : "{i18n>button_cancel}",
					press : [ oController.cancel, oController ]
				}) ],
				resizable : false,
				keepInWindow : true,
				modal : true,
				defaultButton : _buttonOk
			});
			//Add event listener to escape in order to stop button spinning 
			this._oAuthenticationDialog.addEventDelegate({
				onsapescape : oController.cancel
			}, oController);
		}
		return undefined;

	}

});