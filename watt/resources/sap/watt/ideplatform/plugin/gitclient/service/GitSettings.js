define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function (AbstractConfig) {
    "use strict";
    return AbstractConfig.extend("sap.watt.common.plugin.gitclient.service.GitSettings", {
        _oContent: null,

        getUserPreferenceContent: function () {
            var that = this;
            if (!this._oContent) {
                this._oContent = this._createUI();
            }
            return that.context.service.git.isFeatureSupported("GitUserAndEmail").then(function (isGitUserAndEmailSupported) {
                if (!isGitUserAndEmailSupported) {
                    var oSettings = {
                        "sName": "",
                        "sEmail": "",
                        "isUserAndEmailSupported" : isGitUserAndEmailSupported

                    };
                    that._oContent.getModel().setProperty("/modelData", oSettings);
                    return that._oContent;
                }
                else {
                    return that.context.service.git.getGitSettings().then(function (oSettings) {
                        return Q((!oSettings || !oSettings.sEmail) ? that.context.service.system.getSystemInfo().then(function (oUserInfo) {
                            //if there is no settings, try to get it from the IDP
                            var oEmailRegex =
                                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            if (oUserInfo && oEmailRegex.test(oUserInfo.sEMail)) {

                                //ask the user to save the data
                                var sConfirmMessage = that.context.i18n.getText("gITSettings_auto_fill_IDP");
                                sConfirmMessage += that.context.i18n.getText("gITSettingsDialog_Git_Email_Address") + " " + oUserInfo.sEMail + "\n\n";

                                if (oUserInfo.sLastName || oUserInfo.sFirstName) {
                                    sConfirmMessage += that.context.i18n.getText("gITSettingsDialog_Git_User_Name") + " ";
                                    sConfirmMessage += oUserInfo.sLastName ? oUserInfo.sLastName + " " : "";
                                    sConfirmMessage += oUserInfo.sFirstName;
                                }


                                // return that.context.service.git.isFeatureSupported("GitUserAndEmail").then(function (isGitUserAndEmailSupported) {
                                //   if (isGitUserAndEmailSupported) {
                                return that.context.service.usernotification.confirm(sConfirmMessage).then(function (oResult) {
                                    if (oResult.bResult) {
                                        that.context.service.git.setGitSettings(oUserInfo.sEMail, oUserInfo.sLastName + " " + oUserInfo.sFirstName).fail(function (oError) {
                                            that._callMessageDialog(oError);
                                        }).done();
                                        return {
                                            "sName": oUserInfo.sLastName + " " + oUserInfo.sFirstName,
                                            "sEmail": oUserInfo.sEMail
                                        };
                                    }
                                    return {
                                        "sName": "",
                                        "sEmail": ""
                                    };
                                });

                                //   }
                                //  });


                            }
                            //if there is no data in the IDP
                            return {
                                "sName": "",
                                "sEmail": ""
                            };
                        }) : oSettings).then(function (oSettings) {
                            that._oContent.getModel().setProperty("/modelData", oSettings);
                            return that._oContent;
                        });
                    }).fail(function (oError) {
                        that._callMessageDialog(oError);
                    });
                }
            });

        },

        saveUserPreference: function () {
            var modelData = this._oContent.getModel().getData().modelData;
            var that = this;
            // 	var oEmailRegex =
            // 		/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            // 	if (oEmailRegex.test(modelData.email)) {
            // 		this.context.service.usernotification.alert("Email not valid").done();
            // 	} else {
            return this.context.service.git.setGitSettings(modelData.sEmail, modelData.sName).fail(function (oError) {
                that._callMessageDialog(oError);
            });
            // 	}
        },

        _callMessageDialog: function (oError) {
            if (!oError.source || oError.source !== "git") {
                throw oError;
            }
            var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
            switch (oError.type) {
                case "Warning":
                    this.contextcontextcontext.service.usernotification.warning(oError.name + sDetailedMessage).done();
                    break;
                case "Info":
                    this.contextcontext.service.usernotification.info(oError.name + sDetailedMessage).done();
                    break;
                default:
                    //ERROR
                    this.context.service.usernotification.alert(oError.name + sDetailedMessage).done();
            }
        },

        _createUI: function () {


            var oGitEmailAddressTextField = new sap.ui.commons.TextField({
                width: "100%",
                value: "{sEmail}",
                editable : "{isUserAndEmailSupported}",
                layoutData: new sap.ui.layout.GridData({
                    span: "L7 M7 S7"
                })
                // change: function(oEvent){
                //   var sNewValue = oEvent.getParameter("newValue");
                //   var oEmailRegex =
                // 	/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                //   if(oEmailRegex.test(sNewValue)){
                //       //valid url
                //       this.removeStyleClass("inputError");
                //       this.addStyleClass("inputConfirmed");
                //   }else{
                //       this.removeStyleClass("inputConfirmed");
                //       this.addStyleClass("inputError");
                //   }
                // 		}
            });

            var oGitEmailAddressLabel = new sap.ui.commons.Label({
                labelFor: oGitEmailAddressTextField,
                text: "{i18n>gITSettingsDialog_Git_Email_Address}",
                width: '100%',
                layoutData: new sap.ui.layout.GridData({
                    span: "L3 M3 S5",
                    linebreak: true
                })
            });


            var oGitUserNameTextField = new sap.ui.commons.TextField({
                width: "100%",
                value: "{sName}",
                editable : "{isUserAndEmailSupported}",
                layoutData: new sap.ui.layout.GridData({
                    span: "L7 M7 S7"
                })
            });

            var oGitUserNameLabel = new sap.ui.commons.Label({
                labelFor: oGitUserNameTextField,
                text: "{i18n>gITSettingsDialog_Git_User_Name}",
                width: '100%',
                layoutData: new sap.ui.layout.GridData({
                    span: "L3 M3 S5",
                    linebreak: true
                })
            });


            var oGrid = new sap.ui.layout.Grid({
                vSpacing: 1,
                width: "100%",
                content: [oGitEmailAddressLabel, oGitEmailAddressTextField, oGitUserNameLabel, oGitUserNameTextField]
            });

            oGrid.setModel(new sap.ui.model.json.JSONModel({
                "modelData": {
                    "sName": "",
                    "sEmail": ""
                }
            }));
            oGrid.bindElement("/modelData");

            this.context.i18n.applyTo(oGrid);
            return oGrid;

        }

    });
});