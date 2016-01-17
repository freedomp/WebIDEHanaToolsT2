sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitUserInfoDialog", {

	createContent: function(oController) {

		var oDescriptionLabel = new sap.ui.commons.Label({
			width: "100%",
			text: "{i18n>gITSettings_dialog_msg}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			wrapping: true
		});

		var oEmailLabel = new sap.ui.commons.Label({
			text: "{i18n>gITSettingsDialog_Git_Email_Address}",
			required: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5",
				linebreak: true
			})
		});

		var oEmailTextField = new sap.ui.commons.TextField({
			width: "100%",
			value: "{email}",
			change: function(oEvent){
			    var sNewValue = oEvent.getParameter("newValue");
			    var oEmailRegex =
					/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    if(oEmailRegex.test(sNewValue)){
			        //valid url
			        this.removeStyleClass("inputError");
			        this.addStyleClass("inputConfirmed");
			        this.getModel().setProperty("/commitData/bButtonEnabled", true);
			        this.getModel().setProperty("/commitData/bError", false);
			    }else{
			        this.removeStyleClass("inputConfirmed");
			        this.addStyleClass("inputError");
			        this.getModel().setProperty("/commitData/bButtonEnabled", false);
			        this.getModel().setProperty("/commitData/bError", true);
			    }
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L7 M7 S7"
			})
		});

		var oNameLabel = new sap.ui.commons.Label({
			text: "{i18n>gITSettingsDialog_Git_User_Name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M5 S5",
				linebreak: true
			})
		});

		var oNameTextField = new sap.ui.commons.TextField({
			width: "100%",
			value: "{user}",
			layoutData: new sap.ui.layout.GridData({
				span: "L7 M7 S7"
			})
		});

		var oErrorTextView = new sap.ui.commons.TextView({
		    text: "{i18n>gITSettings_dialog_error}",
		    visible: "{bError}",
		    layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitUserError");
		
		var oSaveLabel = new sap.ui.commons.Label({
			width: "100%",
			text: "{i18n>gITSettings_save_msg}",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			wrapping: true
		});

		var oGrid = new sap.ui.layout.Grid({
			vSpacing: 1,
			width: "100%",
			content: [oDescriptionLabel, oEmailLabel, oEmailTextField, oNameLabel, oNameTextField, oSaveLabel, oErrorTextView]
		});

		var oDialog = new sap.ui.commons.Dialog({
			modal: true,
			title: "{i18n>gITSettings_dialog_title}",
			content: [oGrid],
			buttons: [new sap.ui.commons.Button({
			    enabled: "{bButtonEnabled}",
				text : "{i18n>button_ok}",
				press: [oController._handleUserInfo, oController]
			}),new sap.ui.commons.Button({
				text : "{i18n>button_cancel}",
				press: [oController._handleUserInfo, oController]
			}).data("close", true)],
			resizable: false,
			keepInWindow: true
		});
		
		oDialog.bindElement("/commitData");

// 		Add event listener to escape in order close the chain
		oDialog.addEventDelegate({
			onsapescape: oController._handleUserInfo,
			onBeforeRendering: function(){
				oEmailTextField.removeStyleClass("inputError");
				oEmailTextField.removeStyleClass("inputConfirmed");
			}
		}, oController);

		return oDialog;

	}

});