/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.launchpad.HeaderTile.
jQuery.sap.declare("sap.ushell.ui.launchpad.HeaderTile");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.ushell.ui.launchpad.Tile");


/**
 * Constructor for a new ui/launchpad/HeaderTile.
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
 * <li>{@link #getHeaderLevel headerLevel} : sap.m.HeaderLevel (default: sap.m.HeaderLevel.H3)</li>
 * <li>{@link #getHeaderText headerText} : string</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.ushell.ui.launchpad.Tile#constructor sap.ushell.ui.launchpad.Tile}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A HeaderTile acts as a separator inside a TileContainer.
 * @extends sap.ushell.ui.launchpad.Tile
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.launchpad.HeaderTile
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ushell.ui.launchpad.Tile.extend("sap.ushell.ui.launchpad.HeaderTile", { metadata : {

	library : "sap.ushell",
	properties : {
		"headerLevel" : {type : "sap.m.HeaderLevel", group : "Appearance", defaultValue : sap.m.HeaderLevel.H3},
		"headerText" : {type : "string", group : "Appearance", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.launchpad.HeaderTile with name <code>sClassName</code> 
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
 * @name sap.ushell.ui.launchpad.HeaderTile.extend
 * @function
 */


/**
 * Getter for property <code>headerLevel</code>.
 *
 * Default value is <code>H3</code>
 *
 * @return {sap.m.HeaderLevel} the value of property <code>headerLevel</code>
 * @public
 * @name sap.ushell.ui.launchpad.HeaderTile#getHeaderLevel
 * @function
 */

/**
 * Setter for property <code>headerLevel</code>.
 *
 * Default value is <code>H3</code> 
 *
 * @param {sap.m.HeaderLevel} oHeaderLevel  new value for property <code>headerLevel</code>
 * @return {sap.ushell.ui.launchpad.HeaderTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.HeaderTile#setHeaderLevel
 * @function
 */


/**
 * Getter for property <code>headerText</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>headerText</code>
 * @public
 * @name sap.ushell.ui.launchpad.HeaderTile#getHeaderText
 * @function
 */

/**
 * Setter for property <code>headerText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sHeaderText  new value for property <code>headerText</code>
 * @return {sap.ushell.ui.launchpad.HeaderTile} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.launchpad.HeaderTile#setHeaderText
 * @function
 */

// Start of sap/ushell/ui/launchpad/HeaderTile.js
/**
 * @name sap.ushell.ui.launchpad.HeaderTile
 *
 * @private
 */
//sap.ushell.HeaderTile.prototype.init = function(){
//   // do something for initialization...
//};
