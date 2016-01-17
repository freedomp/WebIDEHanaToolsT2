/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * Utility class to access data types, if the SmartField uses a JSON model.
 * 
 * @private
 * @name sap.ui.comp.smartfield.JSONTypes
 * @author SAP SE
 * @version 1.32.7
 * @since 1.28.0
 * @param {jquery.sap.global} jQuery a reference to the jQuery implementation.
 * @param {sap.ui.model.type.Boolean} BooleanType a reference to the boolean type implementation.
 * @param {sap.ui.model.type.Date} DateType a reference to the date type implementation.
 * @param {sap.ui.model.type.Float} FloatType a reference to the float type implementation.
 * @param {sap.ui.model.type.Integer} IntegerType a reference to the integer type implementation.
 * @param {sap.ui.model.type.String} StringType a reference to the string type implementation.
 * @returns {sap.ui.comp.smartfield.JSONTypes} the new instance.
 */
sap.ui.define([	"jquery.sap.global", "sap/ui/model/type/Boolean", "sap/ui/model/type/Date", "sap/ui/model/type/Float", "sap/ui/model/type/Integer", "sap/ui/model/type/String" ], function(jQuery, BooleanType, DateType, FloatType, IntegerType, StringType) { // EXC_JSHINT_002 //EXC_JSHINT_034 //EXC_JSHINT_037
	"use strict";

	/**
	 * @private
	 * @constructor
	 */
	var JSONTypes = function() { // EXC_JSLINT_021
		//nothing to do here.
	};

	/**
	 * Returns an instance of a sub-class of <code>sap.ui.model.Type</code> depending on the OData property's EDM type.
	 * 
	 * @param {sType} sType the name of the type to be created.
	 * @returns {sap.ui.model.Type} an instance of a sub-class of <code>sap.ui.model.Type</code>.
	 * @public
	 */
	JSONTypes.prototype.getType = function(sType) {
		if (sType) {
			switch (sType) {
				case "Boolean":
					return new BooleanType();
				case "Date":
					return new DateType();
				case "Float":
					return new FloatType();
				case "Integer":
					return new IntegerType();
				default:
					return new StringType();
			}
		}

		return null;
	};

	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	JSONTypes.prototype.destroy = function() { // EXC_JSLINT_021
		//nothing to do here.
	};

	return JSONTypes;
}, true);
