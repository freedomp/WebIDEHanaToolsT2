/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.AddBookmarkButton.
jQuery.sap.declare("sap.ushell.ui.footerbar.AddBookmarkButton");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/AddBookmarkButton.
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
 * <ul>
 * <li>{@link #getBeforePressHandler beforePressHandler} : any</li>
 * <li>{@link #getAfterPressHandler afterPressHandler} : any</li>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getSubtitle subtitle} : string</li>
 * <li>{@link #getInfo info} : string</li>
 * <li>{@link #getTileIcon tileIcon} : string</li>
 * <li>{@link #getNumberUnit numberUnit} : string</li>
 * <li>{@link #getKeywords keywords} : string</li>
 * <li>{@link #getCustomUrl customUrl} : any</li>
 * <li>{@link #getServiceUrl serviceUrl} : any</li>
 * <li>{@link #getServiceRefreshInterval serviceRefreshInterval} : string</li>
 * <li>{@link #getShowGroupSelection showGroupSelection} : boolean (default: true)</li>
 * <li>{@link #getAppData appData} : object</li></ul>
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
 * A button to be displayed in the application footer. Clicking the button opens a dialog box allowing the user to save the app state, so that the app can be launched in this state directly from the launchpad.
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.AddBookmarkButton", { metadata : {

	library : "sap.ushell",
	properties : {
		"beforePressHandler" : {type : "any", group : "Misc", defaultValue : null},
		"afterPressHandler" : {type : "any", group : "Misc", defaultValue : null},
		"title" : {type : "string", group : "Misc", defaultValue : null},
		"subtitle" : {type : "string", group : "Misc", defaultValue : null},
		"info" : {type : "string", group : "Misc", defaultValue : null},
		"tileIcon" : {type : "string", group : "Misc", defaultValue : null},
		"numberUnit" : {type : "string", group : "Misc", defaultValue : null},
		"keywords" : {type : "string", group : "Misc", defaultValue : null},
		"customUrl" : {type : "any", group : "Misc", defaultValue : null},
		"serviceUrl" : {type : "any", group : "Misc", defaultValue : null},
		"serviceRefreshInterval" : {type : "string", group : "Misc", defaultValue : null},
		"showGroupSelection" : {type : "boolean", group : "Misc", defaultValue : true},
		"appData" : {type : "object", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.AddBookmarkButton with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.footerbar.AddBookmarkButton.extend
 * @function
 */


/**
 * Getter for property <code>beforePressHandler</code>.
 * A callback function to be called prior to the press handler upon clicking the button.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>beforePressHandler</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getBeforePressHandler
 * @function
 */

/**
 * Setter for property <code>beforePressHandler</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oBeforePressHandler  new value for property <code>beforePressHandler</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setBeforePressHandler
 * @function
 */


/**
 * Getter for property <code>afterPressHandler</code>.
 * A callback function to be called after the press handler called upon clicking the button.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>afterPressHandler</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getAfterPressHandler
 * @function
 */

/**
 * Setter for property <code>afterPressHandler</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oAfterPressHandler  new value for property <code>afterPressHandler</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setAfterPressHandler
 * @function
 */


/**
 * Getter for property <code>title</code>.
 * Title to be displayed on the tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setTitle
 * @function
 */


/**
 * Getter for property <code>subtitle</code>.
 * Subtitle to be displayed below the tile title.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>subtitle</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getSubtitle
 * @function
 */

/**
 * Setter for property <code>subtitle</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sSubtitle  new value for property <code>subtitle</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setSubtitle
 * @function
 */


/**
 * Getter for property <code>info</code>.
 * Text to be displayed at the bottom of the tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>info</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getInfo
 * @function
 */

/**
 * Setter for property <code>info</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sInfo  new value for property <code>info</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setInfo
 * @function
 */


/**
 * Getter for property <code>tileIcon</code>.
 * Icon to be desplied in the Tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>tileIcon</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getTileIcon
 * @function
 */

/**
 * Setter for property <code>tileIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTileIcon  new value for property <code>tileIcon</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setTileIcon
 * @function
 */


/**
 * Getter for property <code>numberUnit</code>.
 * For dynamic tile, the unit to be displayed below the number, for example, USD.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>numberUnit</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getNumberUnit
 * @function
 */

/**
 * Setter for property <code>numberUnit</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sNumberUnit  new value for property <code>numberUnit</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setNumberUnit
 * @function
 */


/**
 * Getter for property <code>keywords</code>.
 * The keywords based on which the future tile should be indexed and filtered.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>keywords</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getKeywords
 * @function
 */

/**
 * Setter for property <code>keywords</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sKeywords  new value for property <code>keywords</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setKeywords
 * @function
 */


/**
 * Getter for property <code>customUrl</code>.
 * A customized target URL for the tile.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>customUrl</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getCustomUrl
 * @function
 */

/**
 * Setter for property <code>customUrl</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oCustomUrl  new value for property <code>customUrl</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setCustomUrl
 * @function
 */


/**
 * Getter for property <code>serviceUrl</code>.
 * URL of an OData service from which data should be read.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>serviceUrl</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getServiceUrl
 * @function
 */

/**
 * Setter for property <code>serviceUrl</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oServiceUrl  new value for property <code>serviceUrl</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setServiceUrl
 * @function
 */


/**
 * Getter for property <code>serviceRefreshInterval</code>.
 * Number of seconds after which dynamic content is read from the data source and the display is refreshed.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>serviceRefreshInterval</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getServiceRefreshInterval
 * @function
 */

/**
 * Setter for property <code>serviceRefreshInterval</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sServiceRefreshInterval  new value for property <code>serviceRefreshInterval</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setServiceRefreshInterval
 * @function
 */


/**
 * Getter for property <code>showGroupSelection</code>.
 * Defines whether to display the group selection control within the Save as Tile dialog box.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showGroupSelection</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getShowGroupSelection
 * @function
 */

/**
 * Setter for property <code>showGroupSelection</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowGroupSelection  new value for property <code>showGroupSelection</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setShowGroupSelection
 * @function
 */


/**
 * Getter for property <code>appData</code>.
 * Deprecated – an object containing application information properties.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>appData</code>
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#getAppData
 * @function
 */

/**
 * Setter for property <code>appData</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oAppData  new value for property <code>appData</code>
 * @return {sap.ushell.ui.footerbar.AddBookmarkButton} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.AddBookmarkButton#setAppData
 * @function
 */

// Start of sap/ushell/ui/footerbar/AddBookmarkButton.js
/*global jQuery, sap*/

(function () {
    "use strict";
    /*global sap, window, location */

    jQuery.sap.require("sap.ui.layout.form.SimpleForm");
    jQuery.sap.require("sap.m.Label");
    jQuery.sap.require("sap.m.Input");
    jQuery.sap.require("sap.m.Dialog");
    jQuery.sap.require("sap.m.Button");
    jQuery.sap.require("sap.ushell.resources");

    jQuery.sap.declare("sap.ushell.ui.footerbar.AddBookmarkButton");

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.init = function () {

        this.setIcon('sap-icon://add-favorite');
        this.setText(sap.ushell.resources.i18n.getText("addToHomePageBtn"));
        this.setTooltip(sap.ushell.resources.i18n.getText("addToHomePageBtn_tooltip"));
        this.setEnabled();  // disables button if shell not initialized
        this.oModel = new sap.ui.model.json.JSONModel({
            showGroupSelection: true,
            title : '',
            subtitle: '',
            numberValue : '',
            info: '',
            icon: '',
            numberUnit: '',
            keywords: ''
        });

        var that = this;

        this.attachPress(function () {
            if (that.getBeforePressHandler()) {
                that.getBeforePressHandler()();
            }

            that.showAddBookmarkDialog(function () {
                if (that.getAfterPressHandler()) {
                    that.getAfterPressHandler()();
                }
            });
        });
        //call the parent sap.m.Button init method
        if (sap.m.Button.prototype.init) {
            sap.m.Button.prototype.init.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.exit = function () {
        if (this.oDialog) {
            this.oDialog.destroy();
        }
        //call the parent sap.m.Button exit method
        if (sap.m.Button.prototype.exit) {
            sap.m.Button.prototype.exit.apply(this, arguments);
        }
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setBookmarkTileView = function (oView) {
        this.bookmarkTileView = oView;
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.getBookmarkTileView = function () {
        return this.bookmarkTileView;
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.showAddBookmarkDialog = function (cb) {
        this.oResourceBundle = sap.ushell.resources.i18n;
        this.appData = this.getAppData() || {};
        var that = this;
        this.cb = cb;

        var bIsAppDataEmpty = jQuery.isEmptyObject(this.appData),
            bookmarkTileView = sap.ui.view({
                type: sap.ui.core.mvc.ViewType.JS,
                viewName: "sap.ushell.ui.footerbar.SaveAsTile",
                viewData: {
                    appData: this.appData,
                    serviceUrl: bIsAppDataEmpty ? this.getServiceUrl() : this.appData.serviceUrl,
                    customUrl: bIsAppDataEmpty ? this.getCustomUrl() : this.appData.customUrl,
                    numberUnit: bIsAppDataEmpty ? this.getNumberUnit() : this.appData.numberUnit,
                    serviceRefreshInterval: bIsAppDataEmpty ? this.getServiceRefreshInterval() : this.appData.serviceRefreshInterval,
                    keywords: bIsAppDataEmpty ? this.getKeywords() : this.appData.keywords
                }
            });
        if (jQuery.isEmptyObject(this.appData)) {
            bookmarkTileView.setModel(this.oModel);
        }
        that.setBookmarkTileView(bookmarkTileView);

        this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
            id: 'bookmarkFormId',
            layout: sap.ui.layout.form.SimpleFormLayout.GridLayout,
            content: [bookmarkTileView]
        }).addStyleClass("sapUshellAddBookmarkForm");

        var oDialog = that._openDialog(this.oSimpleForm);

        //on every change in the input verify if there is a text in the input - if so enable ok, otherwise disable
        bookmarkTileView.getTitleInput().attachLiveChange(function () {
            that._toggleOkButton(this.getValue().trim(), oDialog.getBeginButton());
        });
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._toggleOkButton = function (sValue, oOkButton) {
        oOkButton.setEnabled(sValue ? true : false);
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._openDialog = function (oContent) {
        var bEnabled = this.bookmarkTileView.getTitleInput().getValue().length ? true : false,
            okButton = new sap.m.Button('bookmarkOkBtn', {
                text: this.oResourceBundle.getText('okBtn'),
                press: this._handleOkButtonPress.bind(this),
                enabled : bEnabled
            }),
            cancelButton = new sap.m.Button('bookmarkCancelBtn', {
                text: this.oResourceBundle.getText('cancelBtn'),
                press: function () {
                    this.oDialog.close();
                    this.cb();
                }.bind(this)
            });
        this.oDialog = new sap.m.Dialog({
            id: 'bookmarkDialog',
            title: this.oResourceBundle.getText('addToHomePageBtn'),
            contentWidth: '25rem',
            content: oContent,
            beginButton : okButton,
            endButton: cancelButton,
            stretchOnPhone: true,
            horizontalScrolling: false,
            afterClose : function () {
                this.oDialog.destroy();
                delete (this.oDialog);
            }.bind(this)
        });
        this.oDialog.open();
        return this.oDialog;
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle, true);
        this.oModel.setProperty("/title", sTitle);
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setSubtitle = function (sSubtitle) {
        this.setProperty("subtitle", sSubtitle, true);
        this.oModel.setProperty("/subtitle", sSubtitle);
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setInfo = function (sInfo) {
        this.setProperty("info", sInfo, true);
        this.oModel.setProperty("/info", sInfo);
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setTileIcon = function (sIcon) {
        this.setProperty("tileIcon", sIcon, true);
        this.oModel.setProperty("/icon", sIcon);
    };


    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setShowGroupSelection = function (bShowGroupSelection) {
        this.setProperty("showGroupSelection", bShowGroupSelection, true);
        this.oModel.setProperty("/showGroupSelection", bShowGroupSelection);
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setNumberUnit = function (sNumberUnit) {
        this.setProperty("numberUnit", sNumberUnit, true);
        this.oModel.setProperty("/numberUnit", sNumberUnit);
    };
    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setKeywords = function (sKeywords) {
        this.setProperty("keywords", sKeywords, true);
        this.oModel.setProperty("/keywords", sKeywords);
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype._handleOkButtonPress = function () {
        var bookmarkTileView = this.getBookmarkTileView(),
            oData = bookmarkTileView.getBookmarkTileData(),
            tileGroup = oData.group ? oData.group.object : "";
        //remove the group object before sending the data to the service
        delete oData.group;

        var oResultPromise = sap.ushell.Container.getService("Bookmark").addBookmark(oData, tileGroup),
            oResourceBundle = sap.ushell.resources.i18n;
        oResultPromise.done(function () {
            //the tile is added to our model in "_addBookmarkToModel" here we just show the
            //success toast.
            if (sap.ushell.Container) {
                sap.ushell.Container.getService('Message').info(oResourceBundle.getText('tile_created_msg'));
            }
        });
        oResultPromise.fail(function (sMsg) {
            jQuery.sap.log.error(
                "Failed to add bookmark",
                sMsg,
                "sap.ushell.ui.footerbar.AddBookmarkButton"
            );
            if (sap.ushell.Container) {
                sap.ushell.Container.getService('Message').error(oResourceBundle.getText('fail_to_add_tile_msg'));
            }
        });

        this.oDialog.close();
        this.cb();
    };

    sap.ushell.ui.footerbar.AddBookmarkButton.prototype.setEnabled = function (bEnabled) {
        var sState = "",
            bPersonalization = true,
            oShellConfiguration;
        if (sap.ushell.renderers && sap.ushell.renderers.fiori2) {
            oShellConfiguration = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration();
            if (oShellConfiguration.appState) {
                sState = oShellConfiguration.appState;
            }
            if (oShellConfiguration.enablePersonalization !== undefined) {
                bPersonalization = oShellConfiguration.enablePersonalization;
            }
        }
        if (sState === 'headerless' || sState === 'standalone' || sState === 'embedded' || !bPersonalization) {
            bEnabled = false;
        }
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                jQuery.sap.log.warning(
                    "Disabling 'Save as Tile' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.AddBookmarkButton"
                );
            }
            bEnabled = false;
        }
        sap.m.Button.prototype.setEnabled.call(this, bEnabled);
        if (!bEnabled) {
            this.addStyleClass("sapUshellAddBookmarkButton");
        }
    };
}());
