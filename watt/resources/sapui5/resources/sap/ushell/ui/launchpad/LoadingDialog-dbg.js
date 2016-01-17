/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.LoadingDialog.
jQuery.sap.declare("sap.ushell.ui.launchpad.LoadingDialog");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui/launchpad/LoadingDialog.
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
 * <li>{@link #getIconUri iconUri} : sap.ui.core.URI</li>
 * <li>{@link #getText text} : sap.ui.core.URI</li></ul>
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
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Displays a loading dialog with an indicator that an app is loading
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.LoadingDialog
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.ui.launchpad.LoadingDialog", { metadata : {

	library : "sap.ushell",
	properties : {
		"iconUri" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
		"text" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.LoadingDialog with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.LoadingDialog.extend
 * @function
 */


/**
 * Getter for property <code>iconUri</code>.
 * the sap-icon://-style URI of an icon
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>iconUri</code>
 * @public
 * @name sap.ushell.ui.launchpad.LoadingDialog#getIconUri
 * @function
 */

/**
 * Setter for property <code>iconUri</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sIconUri  new value for property <code>iconUri</code>
 * @return {sap.ushell.ui.launchpad.LoadingDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LoadingDialog#setIconUri
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * the text to be displayed
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>text</code>
 * @public
 * @name sap.ushell.ui.launchpad.LoadingDialog#getText
 * @function
 */

/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sText  new value for property <code>text</code>
 * @return {sap.ushell.ui.launchpad.LoadingDialog} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.LoadingDialog#setText
 * @function
 */

// Start of sap/ushell/ui/launchpad/LoadingDialog.js
(function () {
    "use strict";
    /*global jQuery, sap, window */
    /*jslint nomen: true*/
    jQuery.sap.require("sap.ui.core.Icon");
    jQuery.sap.require("sap.ui.core.Popup");
    jQuery.sap.require("sap.m.Label");

    sap.ushell.ui.launchpad.LoadingDialog.prototype.init = function () {
        this._oPopup = new sap.ui.core.Popup();
        this._oPopup.setShadow(false);
        //adds the class "sapUshellLoadingDialog" to UI5 block layer
        this._oPopup.setModal(true, "sapUshellLoadingDialog");
        this.oIcon = new sap.ui.core.Icon();
        this._oLabel = new sap.m.Label(this.getId() + 'loadingLabel');
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.exit = function () {
        this._oPopup.close();
        this._oPopup.destroy();
        this.oIcon.destroy();
        this._oLabel.destroy();
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.isOpen = function () {
        return this._oPopup.isOpen();
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.openLoadingScreen = function () {
        if (!this.getVisible()) {
            this.setProperty('visible', true, true);
            this.$().show();
        }
        if (!this.isOpen()) {
            this._oPopup.setContent(this);
            this._oPopup.setPosition("center center", "center center", document, "0 0", "fit");
            this._oPopup.open();
        }
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.showAppInfo = function (sAppTitle, sIconUri) {
        this.setProperty('text', sAppTitle, true);
        this.setProperty('iconUri', sIconUri, true);
        this.oIcon.setSrc(sIconUri);
        this._oLabel.setText(sAppTitle);
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.closeLoadingScreen = function () {
        if (this.getVisible()) {
            this.setProperty('visible', false, true);
            this.$().hide();
            this._oPopup.close();
        }
    };

    sap.ushell.ui.launchpad.LoadingDialog.prototype.onAfterRendering = function () {
        //set the width of the control for proper alignment
        this.$().css("width", "20rem");
    };
}());
