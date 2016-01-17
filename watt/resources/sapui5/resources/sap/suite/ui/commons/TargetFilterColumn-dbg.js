/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.TargetFilterColumn.
jQuery.sap.declare("sap.suite.ui.commons.TargetFilterColumn");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Element");


/**
 * Constructor for a new TargetFilterColumn.
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
 * <li>{@link #getPath path} : string</li>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getLength length} : int (default: 10)</li>
 * <li>{@link #getType type} : any</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.ui.core.Element#constructor sap.ui.core.Element}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The configuration element for the column in the TargetFilter control.
 * @extends sap.ui.core.Element
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Element.extend("sap.suite.ui.commons.TargetFilterColumn", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {
		"path" : {type : "string", group : "Misc", defaultValue : null},
		"title" : {type : "string", group : "Misc", defaultValue : null},
		"length" : {type : "int", group : "Misc", defaultValue : 10},
		"type" : {type : "any", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.TargetFilterColumn with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.TargetFilterColumn.extend
 * @function
 */


/**
 * Getter for property <code>path</code>.
 * The binding path.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>path</code>
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#getPath
 * @function
 */

/**
 * Setter for property <code>path</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sPath  new value for property <code>path</code>
 * @return {sap.suite.ui.commons.TargetFilterColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#setPath
 * @function
 */


/**
 * Getter for property <code>title</code>.
 * The column title.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#getTitle
 * @function
 */

/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.suite.ui.commons.TargetFilterColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#setTitle
 * @function
 */


/**
 * Getter for property <code>length</code>.
 * The number of the retrieved entries for the cloud of the links in the quadrant. The quadrant can display fewer links than retrieved.
 * The font size of the links in the quadrant depends on the measure number. The font size of the links is relative in the retrieved group.
 *
 * Default value is <code>10</code>
 *
 * @return {int} the value of property <code>length</code>
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#getLength
 * @function
 */

/**
 * Setter for property <code>length</code>.
 *
 * Default value is <code>10</code> 
 *
 * @param {int} iLength  new value for property <code>length</code>
 * @return {sap.suite.ui.commons.TargetFilterColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#setLength
 * @function
 */


/**
 * Getter for property <code>type</code>.
 * The type of the displayed data. The type of the property must be sap.ui.model.SimpleType or its descedants. By default, sap.ui.model.type.String.
 * This property is used for formatting the displayed values. If sap.ui.model.type.String, the filter operator in the Search field of the column selection dialog is 'Contains'.
 * In other cases, the filter operator is 'EQ'.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>type</code>
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#getType
 * @function
 */

/**
 * Setter for property <code>type</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oType  new value for property <code>type</code>
 * @return {sap.suite.ui.commons.TargetFilterColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterColumn#setType
 * @function
 */

// Start of sap/suite/ui/commons/TargetFilterColumn.js
///**
// * This file defines behavior for the control,
// */
//sap.suite.ui.commons.TargetFilterColumn.prototype.formatter = function(vVal){
//   return vVal;
//};
sap.suite.ui.commons.TargetFilterColumn.prototype.init = function() {
   this.setType(new sap.ui.model.type.String());
};

sap.suite.ui.commons.TargetFilterColumn.prototype.setType = function(oType, bSuppressInvalidate) {
	if (!(oType instanceof sap.ui.model.SimpleType)) {
		jQuery.sap.log.error(oType + " is not instance of sap.ui.model.SimpleType", this);
	}
	this.setProperty("type", oType, bSuppressInvalidate);
};