// Copyright (c) 2009-2014 SAP SE, All Rights Reserved
/*global jQuery, sap, document */
(function () {
    "use strict";
    jQuery.sap.declare("sap.ushell.renderers.fiori2.AccessKeysHandler");

    var accessKeysHandler = function () {
    };

    accessKeysHandler.prototype = {

        keyCodes: jQuery.sap.KeyCodes,
        bFocusOnShell: true,
        bFocusPassedToExternalHandlerFirstTime: true,
        isFocusHandledByAnotherHandler: false,
        fnExternalKeysHandler: null,
        fnExternalShortcuts: null,

        handleSearchKey: function () {
            var searchField = sap.ui.getCore().byId('sf');
            var jqSearchField = jQuery(searchField.getDomRef());
            jqSearchField.click();
        },

        handleUserMenuKey: function () {
            var userPrefButton = sap.ui.getCore().byId('userPreferencesButton'),
                oShellController = sap.ui.getCore().byId("mainShell").oController;
            if (!userPrefButton) {
                userPrefButton = new sap.ushell.ui.footerbar.UserPreferencesButton("userPreferencesButton");
                userPrefButton.setModel(oShellController.getModel());
                oShellController._setUserPrefModel();
            }
            userPrefButton.showUserPreferencesDialog();
        },

        handleAccessOverviewKey: function () {
            var translationBundle = sap.ushell.resources.i18n,
                isSearchAvailable = this.oModel.getProperty("/searchAvailable"),
                contentList = []; //contains the content of the form depends on the launchpad configuration

            this.aShortcutsDescriptions.forEach(function (sViewName) {
                contentList.push(new sap.m.Label({text: sViewName.text}));
                contentList.push(new sap.m.Text({text: sViewName.description}));
            });

            if (isSearchAvailable) {
                contentList.push(new sap.m.Label({text: "Alt+S"}));
                contentList.push(new sap.m.Text({text: translationBundle.getText("actionSearch") }));
            }

            contentList.push(new sap.m.Label({text: "Alt+U"}));
            contentList.push(new sap.m.Text({text: translationBundle.getText("actionLoginDetails") }));

            var oSimpleForm = new sap.ui.layout.form.SimpleForm({
                editable: false,
                content: contentList
            }),

                oDialog,
                okButton = new sap.m.Button({
                    text: translationBundle.getText("okBtn"),
                    press: function () {
                        oDialog.close();
                    }
                });

            oDialog = new sap.m.Dialog({
                id: "hotKeysGlossary",
                title: translationBundle.getText("hotKeysGlossary"),
                contentWidth: "29.6rem",
                leftButton: okButton,
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oDialog.addContent(oSimpleForm);
            oDialog.open();
        },

        handleShortcuts: function (keyUpEvent) {
            if (keyUpEvent.altKey) {
                switch (String.fromCharCode(keyUpEvent.keyCode)) {
                case 'S':
                    this.handleSearchKey();
                    break;
                case 'U':
                    this.handleUserMenuKey();
                    break;

                //TODO : If we have time, register additional keys from the component (catalog + dashboard)
                case '0':
                    this.handleAccessOverviewKey();
                    break;
                } // End of switch
            } // End of if altKey
        },

        registerAppKeysHandler: function (fnHandler) {
            this.fnExternalKeysHandler = fnHandler;
        },

        resetAppKeysHandler: function () {
            this.fnExternalKeysHandler = null;
        },

        getAppKeysHandler: function () {
            return this.fnExternalKeysHandler;
        },

        registerAppShortcuts: function (fnHandler, aShortcutsDescriptions) {
            this.fnExternalShortcuts = fnHandler;
            this.aShortcutsDescriptions = aShortcutsDescriptions;
        },

        handleFocusBackToMe: function (keyUpEvent) {
            keyUpEvent.preventDefault();
            var handler = sap.ushell.renderers.fiori2.AccessKeysHandler;
            this.bFocusOnShell = true;

            if (keyUpEvent.shiftKey) {
                if (keyUpEvent.keyCode === handler.keyCodes.TAB) {
                    jQuery("#actionsBtn").focus();
                }
                if (keyUpEvent.keyCode === handler.keyCodes.F6) {
                    jQuery("#configBtn").focus();
                }
            } else {
                jQuery("#floatingActionBtn").focus();
            }

            //reset flag
            this.bFocusPassedToExternalHandlerFirstTime = true;
        },

        setIsFocusHandledByAnotherHandler: function (bHandled) {
            this.isFocusHandledByAnotherHandler = bHandled;
        },

        sendFocusBackToShell: function (oEvent) {
            this.handleFocusBackToMe(oEvent);
        },

        init: function (oModel) {
            this.oModel = oModel;
            jQuery(document).on('keydown', function (oEvent) {
                if (!this.bFocusOnShell && !this.isFocusHandledByAnotherHandler) {
                    if (this.fnExternalKeysHandler && jQuery.isFunction(this.fnExternalKeysHandler)) {
                        this.fnExternalKeysHandler(oEvent, this.bFocusPassedToExternalHandlerFirstTime);
                        this.bFocusPassedToExternalHandlerFirstTime = false;
                    }
                }

                this.handleShortcuts(oEvent);
                if (this.fnExternalShortcuts) {
                    this.fnExternalShortcuts(oEvent);
                }
                //reset flag
                this.setIsFocusHandledByAnotherHandler(false);
            }.bind(this)); // End of event handler
        }
    };

    sap.ushell.renderers.fiori2.AccessKeysHandler = new accessKeysHandler();
}());