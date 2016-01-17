/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2013 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.suite.ui.commons.TargetFilterMeasureColumn.
jQuery.sap.declare("sap.suite.ui.commons.TargetFilterMeasureColumn");
jQuery.sap.require("sap.suite.ui.commons.library");
jQuery.sap.require("sap.ui.core.Element");


/**
 * Constructor for a new TargetFilterMeasureColumn.
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
 * The configuration element for the measure column in the TargetFilter control.
 * @extends sap.ui.core.Element
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.ui.core.Element.extend("sap.suite.ui.commons.TargetFilterMeasureColumn", { metadata : {

	library : "sap.suite.ui.commons",
	properties : {
		"path" : {type : "string", group : "Misc", defaultValue : null},
		"type" : {type : "any", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.suite.ui.commons.TargetFilterMeasureColumn with name <code>sClassName</code> 
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
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn.extend
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
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn#getPath
 * @function
 */

/**
 * Setter for property <code>path</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sPath  new value for property <code>path</code>
 * @return {sap.suite.ui.commons.TargetFilterMeasureColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn#setPath
 * @function
 */


/**
 * Getter for property <code>type</code>.
 * This property is used for formatting the displayed values. The type of the property must be sap.ui.model.SimpleType or its descedants. By default, sap.ui.model.type.Integer with enabled grouping.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>type</code>
 * @public
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn#getType
 * @function
 */

/**
 * Setter for property <code>type</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oType  new value for property <code>type</code>
 * @return {sap.suite.ui.commons.TargetFilterMeasureColumn} <code>this</code> to allow method chaining
 * @public
 * @name sap.suite.ui.commons.TargetFilterMeasureColumn#setType
 * @function
 */

// Start of sap/suite/ui/commons/TargetFilterMeasureColumn.js
///**
// * This file defines behavior for the control,
// */

sap.suite.ui.commons.TargetFilterMeasureColumn.prototype.init = function() {
   this.setType(new sap.ui.model.type.Integer({groupingEnabled: true}));
};

sap.suite.ui.commons.TargetFilterMeasureColumn.prototype.setType = function(oType, bSuppressInvalidate) {
	if (!(oType instanceof sap.ui.model.SimpleType)) {
		jQuery.sap.log.error(oType + " is not instance of sap.ui.model.SimpleType", this);
	}
	this.setProperty("type", oType, bSuppressInvalidate);
};