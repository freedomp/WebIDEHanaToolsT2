/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * String data type that supports field-control.
 * 
 * @private
 * @name sap.ui.comp.smartfield.type.String
 * @author SAP SE
 * @version 1.32.7
 * @since 1.28.0
 * @extends sap.ui.model.odata.type.String
 * @param {sap.ui.model.odata.type.String} StringBase a reference to the string implementation.
 * @returns {sap.ui.comp.smartfield.type.String} the string implementation.
 */
sap.ui.define([	"sap/ui/model/odata/type/String" ], function(StringBase) {
	"use strict";

	/**
	 * Constructor for a primitive type <code>Edm.String</code>.
	 * 
	 * @param {object} oFormatOptions format options.
	 * @param {object} oConstraints constraints.
	 * @private
	 */
	var StringType = StringBase.extend("sap.ui.comp.smartfield.type.String", {
		constructor: function(oFormatOptions, oConstraints) {
			StringBase.apply(this, [
				oFormatOptions, oConstraints
			]);
			this.oFieldControl = null;
		}
	});

	/**
	 * Parses the given value to JavaScript <code>string</code>.
	 * 
	 * @param {string} sValue the value to be parsed; the empty string and <code>null</code> will be parsed to <code>null</code>
	 * @param {string} sSourceType the source type (the expected type of <code>sValue</code>); must be "string".
	 * @returns {string} the parsed value
	 * @throws {sap.ui.model.ParseException} if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to a Date
	 * @public
	 */
	StringType.prototype.parseValue = function(sValue, sSourceType) {
		var oReturn = StringBase.prototype.parseValue.apply(this, [ sValue, sSourceType ]);
		this.oFieldControl(sValue, sSourceType);
		return oReturn;
	};
	
	/**
	 * Returns the type's name.
	 * 
	 * @returns {string} the type's name
	 * @public
	 */
	StringType.prototype.getName = function() {
		return "sap.ui.comp.smartfield.type.String";
	};

	return StringType;
});
