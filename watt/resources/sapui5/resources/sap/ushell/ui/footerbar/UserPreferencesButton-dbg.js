/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.UserPreferencesButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.UserPreferencesButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/UserPreferencesButton.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/footerbar/UserPreferencesButton
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.UserPreferencesButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.UserPreferencesButton", { metadata : {

	library : "sap.ushell"
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.UserPreferencesButton with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.ui.footerbar.UserPreferencesButton.extend
 * @function
 */

// Start of sap/ushell/ui/footerbar/UserPreferencesButton.js
/*global jQuery, sap*/

(function () {
    "use strict";
    /*global jQuery, sap, window*/
    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.services.Container");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");

    jQuery.sap.declare("sap.ushell.ui.footerbar.UserPreferencesButton");

    /**
     * UserPreferencesButton
     *
     * @name sap.ushell.ui.footerbar.UserPreferencesButton
     * @private
     * @since 1.16.0
     */
    sap.ushell.ui.footerbar.UserPreferencesButton.prototype.init = function () {
        this.setIcon('sap-icon://person-placeholder');
        this.setWidth('100%');
        this.translationBundle = sap.ushell.resources.i18n;
        this.setText(this.translationBundle.getText("userPreferences"));
        this.setTooltip(this.translationBundle.getText("userPreferences_tooltip"));
        this.attachPress(this.showUserPreferencesDialog);
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype.createDialog = function () {
        var saveButton;
        var cancelButton;
        var that = this;

        saveButton = this._createSaveButton();
        cancelButton = this._createCancelButton();

        this.oDialog = new sap.m.Dialog({
            id: "userPreferencesDialog",
            title: "{/userPreferences/dialogTitle}",
            contentWidth: "29.6rem",
            content: null,
            contentHeight: "17rem",
            buttons: [saveButton, cancelButton],
            afterClose: function () {
                that.oDialog.destroy();
                this.oUser.resetChangedProperties();
            }.bind(that),
            stretchOnPhone: true
        }).addStyleClass("sapUshellUserPreferencesDialog");

        this._addDialogBackButton();
        this.oDialog.setModel(this.getModel());
        this.oDialog.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({
            key: "aria-label",
            value: that.translationBundle.getText("UserPreferences_Dialog_Main_label"),
            writeToDom: true
        }));
        this.oDialog.addContent(this._getOriginalDialogContent());
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._getOriginalDialogContent = function () {
        if (!this.oInitialContent) {
            var oUserDetails;
            var oEntryList;

            oUserDetails = this._getUserDetailsControl();
            oEntryList = this._getEntryListControl();

            this.oInitialContent = new sap.ui.layout.VerticalLayout('userPreferencesLayout', {
                content: [oUserDetails, oEntryList],
                width: "100%"
            });
        }

        return this.oInitialContent;
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._getEntryListControl = function () {
        var oEntryTemplate = this._getUserPrefEntriesTemplate();
        var xRayEnabled = this.getModel() && this.getModel().getProperty('/enableHelp');
        var that = this,
            sUserName = this.oUser.getFullName();

        var entryList = new sap.m.List('userPrefEnteryList', {
            items : {
                path     : "/userPreferences/entries",
                template : oEntryTemplate
            }
        });
        entryList.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({
            key: "aria-label",
            value: that.translationBundle.getText("UserPreferences_EntryList_label") + sUserName,
            writeToDom: true
        }));

        var origOnAfterRendering = entryList.onAfterRendering;
        entryList.onAfterRendering = function () {
            var aEntries = this.getItems();
            var entryPath;

            //Execute the genuine onAfterRendering logic of the list.
            origOnAfterRendering.apply(this, arguments);
            //for each item in the list we need to add XRay help id
            //for each item in the list we need to execute the relevant function to get the entry value
            for (var i = 0; i < aEntries.length; i++) {
                entryPath = aEntries[i].getBindingContext().getPath();
                //we would like to set the current entry value in case valueResult property is null
                if (!that.getModel().getProperty(entryPath + "/valueResult")) {
                    that._setEntryValueResult(entryPath);
                }
                if (xRayEnabled) {
                    that._addXRayHelpId(entryPath, aEntries[i]);
                }
            }
        };

        return entryList;
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._addXRayHelpId = function (entryPath, oListItem) {
        var helpID = this.getModel().getProperty(entryPath + "/entryHelpID");

        if (helpID) {
            oListItem.addStyleClass("help-id-" + helpID);
        }
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._setEntryValueResult = function (entryPath) {
        var that = this;
        var isEditable = this.getModel().getProperty(entryPath + "/editable");
        var valueArgument = this.getModel().getProperty(entryPath + "/valueArgument");
        if (typeof valueArgument === "function") {
            //Display "Loading..." and disable the entry until the value result is available
            this.getModel().setProperty(entryPath + "/valueResult", this.translationBundle.getText("genericLoading"));
            this.getModel().setProperty(entryPath + "/editable", false);
            var oValuePromise = valueArgument();

            oValuePromise.done(function(valueResult) {
                that.getModel().setProperty(entryPath + "/editable", isEditable);
                that.getModel().setProperty(entryPath + "/visible", typeof (valueResult) === 'object' ? !!valueResult.value : true);
                that.getModel().setProperty(entryPath + "/valueResult", typeof (valueResult) === 'object' ? valueResult.displayText : valueResult);
            });
            oValuePromise.fail(function() {
                that.getModel().setProperty(entryPath + "/valueResult", that.translationBundle.getText("loadingErrorMessage"));
            });
        } else if (!!valueArgument) {//if valueArgument is not null or undefined, we would like to present it
            this.getModel().setProperty(entryPath + "/valueResult", valueArgument);
            this.getModel().setProperty(entryPath + "/editable", isEditable);
        } else {//in any other case (valueArgument is not function \ String \ Number \ Boolean)
            this.getModel().setProperty(entryPath + "/valueResult", this.translationBundle.getText("loadingErrorMessage"));
        }
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._getUserPrefEntriesTemplate = function () {
        var that = this;
        var pressHandler = function (e) {
            var isContentValid = true;
            var entryLabel = e.getSource().getLabel();
            var entryPath = e.getSource().getBindingContext().getPath();
            that.getModel().setProperty("/userPreferences/activeEntryPath",entryPath);
            that._setDetailedEntryModeMode(true, entryPath, entryLabel, entryPath);
            that.oDialog.removeAllContent();
            var oContent = that.getModel().getProperty(entryPath + "/contentResult");
            if (oContent) {
                that.oDialog.addContent(oContent);
            } else {
                var oBusyIndicator = null;// oBusyIndicator is initialized only when bShowBusyIndicator === true
                var bShowBusyIndicator = true,
                    bIsBusyIndicatorShown = false;
                var contentFunction = that.getModel().getProperty(entryPath + "/contentFunc");
                if (typeof contentFunction === "function") {
                    that.getModel().setProperty(entryPath + "/isDirty", true);//Set isDirty = true to the entry. Relevant for saving flow.
                    var oContentPromise = contentFunction();

                    oContentPromise.done(function(contentResult) {
                        bShowBusyIndicator = false;
                        if (bIsBusyIndicatorShown === true) {
                            that.oDialog.removeAllContent();
                            oBusyIndicator.destroy();//oBusyIndicator is destroyed only when it is actually presented
                        }

                        if (contentResult instanceof sap.ui.core.Control) {

                            that.getModel().setProperty(entryPath + "/contentResult", contentResult);
                            that.oDialog.addContent(contentResult);
                        } else {
                            isContentValid = false;
                        }
                    });
                    oContentPromise.fail(function() {
                        bShowBusyIndicator = false;
                        if (bIsBusyIndicatorShown === true) {
                            that.oDialog.removeAllContent();
                            oBusyIndicator.destroy();//oBusyIndicator is destroyed only when it is actually presented
                        }
                        isContentValid = false;
                    });

                    oContentPromise.always(function() {
                        if (isContentValid === false) {
                            var oErrorContent = new sap.m.FlexBox("userPrefErrorFlexBox", {
                                height: "5rem",
                                alignItems: sap.m.FlexAlignItems.Center,
                                justifyContent: sap.m.FlexJustifyContent.Center,
                                items: [new sap.m.Text("userPrefErrorText", {text: that.translationBundle.getText("loadingErrorMessage")})]
                            });

                            that.getModel().setProperty(entryPath + "/contentResult", oErrorContent);
                            that.oDialog.addContent(oErrorContent);
                        }
                    });

                    if (bShowBusyIndicator === true) {
                        oBusyIndicator = new sap.m.BusyIndicator('userPrefLoadingBusyIndicator', {size: "4rem"});
                        that.oDialog.addContent(oBusyIndicator);
                        bIsBusyIndicatorShown = true;
                    }
                }
            }
        };

        return new sap.m.DisplayListItem({
            label: "{title}",
            value: "{valueResult}",
            tooltip: {
                path: "valueResult",
                formatter: function (valueResult) {
                    return typeof (valueResult) === 'string' ? valueResult : "";
                }
            },
            type: {
                path: "editable",
                formatter: function (editable) {
                    return (editable === true) ? "Navigation" : "Inactive";//Default is Inactive
                }
            },
            visible: {
                path: "visible",
                formatter: function (visible) {
                    return (visible !== undefined) ? visible : true;
                }
            },
            press: pressHandler
        });
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._getUserDetailsControl = function () {
        return new sap.m.ObjectIdentifier({
            title: this.oUser.getFullName(),
            text: this.oUser.getEmail()
        }).addStyleClass("sapUshellUserPrefUserIdentifier");
    };


    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._createCancelButton = function () {
        var that = this;
        return new sap.m.Button({
            id: "cancelButton",
            text: {
                parts: ['/userPreferences/entries'],
                formatter: function (aEntries) {
                    var bEditableExist = aEntries.some(function (oEntry) {
                        return oEntry.editable;
                    });
                    return bEditableExist > 0 ? that.translationBundle.getText("cancelBtn") : that.translationBundle.getText("close");
                }
            },
            press: that._dialogCancelButtonHandler.bind(that),
            visible: true
        });
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._createSaveButton = function () {
        var that = this;
        return new sap.m.Button({
            id: "saveButton",
            text: this.translationBundle.getText("saveBtn"),
            press: that._dialogSaveButtonHandler.bind(that),
            visible: {
                parts: ['/userPreferences/entries'],
                formatter: function (aEntries) {
                    return aEntries.some(function (oEntry) {
                        return oEntry.editable;
                    });
                }
            }
        });
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._setDetailedEntryModeMode = function (isDetailedEntryMode, entryPath, entryLabel, entryValue) {
        this.getModel().setProperty("/userPreferences/isDetailedEntryMode", !!isDetailedEntryMode);
        this.getModel().setProperty("/userPreferences/dialogTitle", entryLabel);
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype.showUserPreferencesDialog = function () {
        //if (oModel.getProperty("/enableHelp")) {
        //    that.themeSelection.addStyleClass('help-id-themesDropdown'); // TODO: xRay help ID
        //}

        this.oUser = sap.ushell.Container.getUser();
        this.createDialog();
        this.oDialog.open();
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._dialogBackButtonHandler = function (e) {
        this.getModel().setProperty("/userPreferences/isDetailedEntryMode", false);
        this.getModel().setProperty("/userPreferences/dialogTitle", this.translationBundle.getText("userPreferences"));
        this.oDialog.removeAllContent();
        this.oDialog.addContent(this._getOriginalDialogContent());
        this._setEntryValueResult(this.getModel().getProperty("/userPreferences/activeEntryPath"));
        this.getModel().setProperty("/userPreferences/activeEntryPath",null);
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._destroyDialog = function () {
        this.oHeadBar.destroy();
        this.oInitialContent.destroy();
        this.oInitialContent = null;
        this._modelCleanUpToInitial();
        this._entriesCleanUp();

        this.oDialog.destroy();
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._entriesCleanUp = function () {
        var entriesArray = this.getModel().getProperty("/userPreferences/entries");
        for (var i = 0; i < entriesArray.length; i++) {
            //destroy entry content if exists
            if (entriesArray[i].contentResult) {
                entriesArray[i].contentResult.destroy();
                entriesArray[i].contentResult = null;
            }
            entriesArray[i].isDirty = false;
            entriesArray[i].valueResult = null;
        }
        //update the entries model with the clean array
        this.getModel().setProperty("/userPreferences/entries", entriesArray);
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._modelCleanUpToInitial = function () {
        this.getModel().setProperty("/userPreferences/isDetailedEntryMode", false);
        this.getModel().setProperty("/userPreferences/dialogTitle", this.translationBundle.getText("userPreferences"));
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._dialogSaveButtonHandler = function () {
        var saveEntriesPromise;
        saveEntriesPromise = this._saveUserPrefEntries();
        var that = this;

        //in case the save button is pressed in the detailed entry mode, there is a need to update value result
        // in the model
        var isDetailedEntryMode = this.getModel().getProperty("/userPreferences/isDetailedEntryMode");
        if (isDetailedEntryMode) {
            this.getModel().setProperty("/userPreferences/activeEntryPath",null);
        }

        saveEntriesPromise.done(function() {
            that._showSaveMessageToast();
        });

        saveEntriesPromise.fail(function(failureMsgArr) {
            jQuery.sap.require("sap.m.MessageBox");
            var errMessageText;
            var errMessageLog = "";
            if (failureMsgArr.length === 1) {
                errMessageText = that.translationBundle.getText("savingEntryError") + " ";
            } else {
                errMessageText = that.translationBundle.getText("savingEntriesError") + "\n";
            }
            failureMsgArr.forEach(function(errObject) {
                errMessageText += errObject.entry + "\n";
                errMessageLog += "Entry: " + errObject.entry + " - Error message: " + errObject.message + "\n";
            });

            sap.m.MessageBox.show(
                errMessageText, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: that.translationBundle.getText("Error"),
                    actions: [sap.m.MessageBox.Action.OK]
                }
            );

            jQuery.sap.log.error(
                "Failed to save the following entries"  ,
                errMessageLog,
                "sap.ushell.ui.footerbar.UserPreferencesButton"
            );
        });

        this.oDialog.close();
        this._destroyDialog();
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._dialogCancelButtonHandler = function () {
        var aEntries = this.getModel().getProperty("/userPreferences/entries");
        //Invoke onCancel function for each userPreferences entry
        for (var i = 0; i < aEntries.length; i++) {
            if (aEntries[i] && aEntries[i].onCancel) {
                aEntries[i].onCancel();
            }
        }
        this.oDialog.close();
        this._destroyDialog();
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._saveUserPrefEntries = function () {
        var aEntries = this.getModel().getProperty("/userPreferences/entries");
        var resultDeferred = jQuery.Deferred();
        var whenPromise;
        var currentPromise;
        var totalPromisesCount = 0;
        var failureCount = 0;
        var successCount = 0;
        var promiseArray = [];
        var failureMsgArr = [];
        var currEntryTitle;
        var saveDoneFunc = function () {
            successCount++;
            resultDeferred.notify();
        };
        var saveFailFunc = function (err) {
            failureMsgArr.push({
                entry: currEntryTitle,
                message: err
            });
            failureCount++;
            resultDeferred.notify();
        };

        for (var i = 0; i < aEntries.length; i++) {
            if (aEntries[i] && aEntries[i].isDirty === true) {//only if the entry is dirty we would like to save it
                currentPromise = aEntries[i].onSave();
                currentPromise.done(saveDoneFunc);
                currEntryTitle = aEntries[i].title;
                currentPromise.fail(saveFailFunc);
                promiseArray.push(currentPromise);//save function return jQuery Promise
                totalPromisesCount++;
            }
        }

        whenPromise = jQuery.when.apply(null, promiseArray);

        whenPromise.done(function() {
            resultDeferred.resolve();
        });

        resultDeferred.progress(function () {
            if (failureCount > 0 && (failureCount + successCount === totalPromisesCount)) {
                resultDeferred.reject(failureMsgArr);
            }
        });

        return resultDeferred.promise();
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._addDialogBackButton = function () {
        var that = this;
        var oBackButton = new sap.m.Button('userPrefBackBtn', {
            visible: "{/userPreferences/isDetailedEntryMode}",
            icon: sap.ui.core.IconPool.getIconURI("nav-back"),
            press: that._dialogBackButtonHandler.bind(that),
            tooltip: this.translationBundle.getText("feedbackGoBackBtn_tooltip")
        });

        var oDialogTitle = new sap.m.Text("userPrefTitle", {
            text: "{/userPreferences/dialogTitle}"
        });

        this.oHeadBar = new sap.m.Bar({
            contentLeft: [oBackButton],
            contentMiddle: [oDialogTitle]
        });

        this.oDialog.setCustomHeader(this.oHeadBar);
    };

    sap.ushell.ui.footerbar.UserPreferencesButton.prototype._showSaveMessageToast = function () {
        jQuery.sap.require("sap.m.MessageToast");
        var message = this.translationBundle.getText("savedChanges");

        sap.m.MessageToast.show(message, {
            duration: 3000,
            width: "15em",
            my: "center bottom",
            at: "center bottom",
            of: window,
            offset: "0 -50",
            collision: "fit fit"
        });
    };
}());