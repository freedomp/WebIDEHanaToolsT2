/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.TileState.
jQuery.sap.declare("sap.ushell.ui.launchpad.TileState");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ui.core.Control");


/**
 * Constructor for a new ui/launchpad/TileState.
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
 * <li>{@link #getState state} : string (default: 'Loaded')</li></ul>
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
 * The tile state control that displays loading indicator, while tile view is loading and failed status in case tile view is not available.
 * @extends sap.ui.core.Control
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.TileState
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Control.extend("sap.ushell.ui.launchpad.TileState", { metadata : {

	library : "sap.ushell",
	properties : {
		"state" : {type : "string", group : "Misc", defaultValue : 'Loaded'}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.TileState with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.TileState.extend
 * @function
 */


/**
 * Getter for property <code>state</code>.
 * The load status.
 *
 * Default value is <code>Loaded</code>
 *
 * @return {string} the value of property <code>state</code>
 * @public
 * @name sap.ushell.ui.launchpad.TileState#getState
 * @function
 */

/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>Loaded</code> 
 *
 * @param {string} sState  new value for property <code>state</code>
 * @return {sap.ushell.ui.launchpad.TileState} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.TileState#setState
 * @function
 */

// Start of sap/ushell/ui/launchpad/TileState.js
/*global jQuery, sap */
jQuery.sap.require("sap.m.Text");
jQuery.sap.require("sap.ui.core.IconPool");

/**
 * @name sap.ushell.ui.launchpad.TileState
 *
 * @private
 */

sap.ushell.ui.launchpad.TileState.prototype.init = function () {
    this._rb = sap.ushell.resources.i18n;

    this._sFailedToLoad = this._rb.getText("cannotLoadTile");

    this._oWarningIcon = new sap.ui.core.Icon(this.getId() + "-warn-icon", {
        src : "sap-icon://notification",
        size : "1.37rem"
    });

    this._oWarningIcon.addStyleClass("sapSuiteGTFtrFldIcnMrk");
};

sap.ushell.ui.launchpad.TileState.prototype.exit = function () {
    this._oWarningIcon.destroy();
};

sap.ushell.ui.launchpad.TileState.prototype.setState = function(oState, isSuppressed) {
    this.setProperty("state", oState, isSuppressed);
    return this;
};
