/*
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

/**
 * Utility class to access OData Types. The implementation operates on OData meta data, so an instance of <code>sap.ui.model.odata.ODataModel</code>.
 * 
 * @private
 * @name sap.ui.comp.smartfield.ODataTypes
 * @author SAP SE
 * @version 1.32.7
 * @since 1.28.0
 * @param {jquery.sap.global} jQuery a reference to the jQuery implementation.
 * @param {sap.ui.core.format.NumberFormat} NumberFormat a reference to the number format implementation.
 * @param {sap.ui.model.odata.type.Boolean} BooleanType a reference to the boolean type implementation.
 * @param {sap.ui.comp.smartfield.type.DateTime} DateTimeType a reference to the date type implementation.
 * @param {sap.ui.comp.smartfield.type.DateTimeOffset} DateTimeOffsetType a reference to the date-time type implementation.
 * @param {sap.ui.comp.smartfield.type.Decimal} DecimalType a reference to the decimal type implementation.
 * @param {sap.ui.comp.smartfield.type.Int16} Int16Type a reference to the 16 bit integer type implementation.
 * @param {sap.ui.comp.smartfield.Int32} Int32Type a reference to the 32 bit integer type implementation.
 * @param {sap.ui.comp.smartfield.Int64} Int64Type a reference to the 32 bit integer type implementation.
 * @param {sap.ui.comp.smartfield.type.SByte} SByteType a reference to the SByte type implementation.
 * @param {sap.ui.comp.smartfield.type.String} StringType a reference to the string type implementation.
 * @param {sap.ui.comp.smartfield.type.AbapBool} AbapBoolean a reference to the simple boolean type implementation.
 * @param {sap.ui.model.type.Currency} CurrencyType a reference to the currency type implementation.
 * @returns {sap.ui.comp.smartfield.ODataTypes} the new instance.
 */
sap.ui.define([	"jquery.sap.global", "sap/ui/core/format/NumberFormat", "sap/ui/model/odata/type/Boolean", "sap/ui/comp/smartfield/type/DateTime", "sap/ui/comp/smartfield/type/DateTimeOffset", "sap/ui/comp/smartfield/type/Decimal", "sap/ui/comp/smartfield/type/Int16", "sap/ui/comp/smartfield/type/Int32", "sap/ui/comp/smartfield/type/Int64", "sap/ui/comp/smartfield/type/SByte", "sap/ui/comp/smartfield/type/String", "sap/ui/comp/smartfield/type/AbapBool", "sap/ui/model/type/Currency" ], function(jQuery, NumberFormat, BooleanType, DateTimeType, DateTimeOffsetType, DecimalType, Int16Type, Int32Type, Int64Type, SByteType, StringType, AbapBoolean, CurrencyType) { // EXC_JSHINT_002 // EXC_JSHINT_037 // EXC_JSHINT_034
	"use strict";

	/**
	 * @private
	 * @constructor
	 * @param {sap.ui.core.Control} oParent the parent control.
	 */
	var ODataTypes = function(oParent) { // EXC_JSLINT_021
		this._oParent = oParent;
	};

	/**
	 * Returns an instance of a sub-class of <code>sap.ui.model.Type</code> depending on the OData property's EDM type.
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @param {object} oFormatOptions optional format options as defined in e.g. {@link sap.ui.core.format.DateFormat}.
	 * @param {map} mConstraints optional constraints.
	 * @returns {sap.ui.model.Type} an instance of a sub-class of <code>sap.ui.model.Type</code>.
	 * @public
	 */
	ODataTypes.prototype.getType = function(oProperty, oFormatOptions, mConstraints) {
		var oConstraints, oInfo;
		
		// if a type is configured on the smart field, use it.
		oInfo = this._oParent.getBindingInfo("value");
		
		if (oInfo && oInfo.type) {
			return oInfo.type;
		}

		// select the type by EDM type.
		if (oProperty && oProperty.property && oProperty.property.type) {
			switch (oProperty.property.type) {
				case "Edm.Boolean":
					return new BooleanType();
				case "Edm.Decimal":
				case "Edm.Double":
				case "Edm.Float":
				case "Edm.Single":
					oConstraints = this._getDecimalConstraints(oProperty);
					return new DecimalType(oFormatOptions, oConstraints);
				case "Edm.Int16":
					return new Int16Type();
				case "Edm.Int32":
					return new Int32Type();
				case "Edm.Int64":
					return new Int64Type();
				case "Edm.Byte":
				case "Edm.SByte":
					return new SByteType();
				case "Edm.DateTimeOffset":
					return new DateTimeOffsetType(oFormatOptions, oConstraints);
				case "Edm.DateTime":
					oConstraints = this._getDateTimeConstraints(oProperty, mConstraints);
					return new DateTimeType(oFormatOptions, oConstraints);
				case "Edm.String":
					oConstraints = this._getStringConstraints(oProperty);
					return new StringType(oFormatOptions, oConstraints);
				default:
					return null;
			}
		}

		return null;
	};

	/**
	 * Calculates the constraints for <code>Edm.DateTime</code>.
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @param {map} mConstraints optional constraints.
	 * @returns {map} the constraints.
	 * @private
	 */
	ODataTypes.prototype._getDateTimeConstraints = function(oProperty, mConstraints) {
		var oConstraints = {}, n;
		
		// this method is only invoked for Edm.DateTime, 
		// so no need exists to replace it with V4 annotations,
		// as Edm.DateTime is "pruned" in V4.
		if (oProperty.property["sap:display-format"] === "Date") {
			oConstraints = {
				displayFormat: "Date"
			};
		}
		
		//constraints from control have priority.
		for (n in mConstraints) {  //EXC_JSHINT_041
			oConstraints[n] = mConstraints[n];
		}
		
		return oConstraints;
	};
	
	/**
	 * Calculates the value of the control's <code>maxLength</code> property. The value can be configured in the <code>maxLength</code> attribute
	 * of the OData property to which the the control's <code>value</code> property is bound to. Alternatively it can be configured in the the
	 * control's <code>maxLength</code> property. If both are available the minimum value of both is returned.
	 * 
	 * @param {object} oProp the property from which to take the <code>maxLength</code>.
	 * @param {object} oBind the <code>value</code> binding of the parent smart field. 
	 * @returns {integer} maximum number of characters, <code>0</code> means the feature is switched off.
	 * @public
	 */
	ODataTypes.prototype.getMaxLength = function(oProp, oBind) {
		var iProp, aVals = [], len, iVal, iField, iResult = 0;
		
		//is a max length available from binding.
		if (oBind && oBind.constraints) {
			if (oBind.constraints.maxLength && oBind.constraints.maxLength > -1) {
				aVals.push(oBind.constraints.maxLength);
			}
		}
		
		//is a max length available from binding type.
		if (oBind && oBind.type && oBind.type.oConstraints) {
			if (oBind.type.oConstraints.maxLength && oBind.type.oConstraints.maxLength > -1) {
				aVals.push(oBind.type.oConstraints.maxLength);
			}
		}
		
		//is a max length available from oData property.
		if (oProp && oProp.property && oProp.property.maxLength) {
			iProp = parseInt(oProp.property.maxLength, 10);
			
			if (iProp > -1) {
				aVals.push(iProp);
			}
		}
		
		// is a max length available from smart field property.
		iField = this._oParent.getMaxLength();
		
		if (iField > 0) {
			aVals.push(iField);
		}
				
		// now search for the minimum value larger than 0.
		// no value specified, return 0.
		len = aVals.length;
		
		while (len--) {
			iVal = aVals[len];
			
			if (iVal > 0) {
				if (iResult > 0) {
					if  (iVal < iResult) {
						iResult = iVal;
					}
				} else {
					iResult = iVal;
				}
			}
		}
		
		return iResult;
	};
	
	/**
	 * Calculates the constraints for a numeric Edm.Type, with optional <code>scale</code> and <code>precision</code>
	 * attributes of the OData property set.
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @returns {map} the constraints.
	 * @private
	 */
	ODataTypes.prototype._getDecimalConstraints = function(oProperty) {
		var mArgs = null;

		if (oProperty.property.precision) {
			mArgs = {};
			mArgs.precision = parseInt(oProperty.property.precision, 10);
		}

		if (oProperty.property.scale) {
			if (!mArgs) {
				mArgs = {};
			}
			
			mArgs.scale = parseInt(oProperty.property.scale, 10);
		}

		return mArgs;
	};
	
	/**
	 * Calculates the constraints for a property of type <code>Edm.String</code>.
	 * 
	 * @param {object} oProperty the definition of a property of an OData entity.
	 * @returns {map} the constraints.
	 */
	ODataTypes.prototype._getStringConstraints = function(oProperty) {
		var iMaxLength, oEquals, oBind, mConstraints;
		
		//get the binding.
		oBind = this._oParent.getBindingInfo("value");
		
		// get max length.
		iMaxLength = this.getMaxLength(oProperty, oBind);
			
		// get the constrains: equals		
		if (oBind && oBind.type && oBind.type.oConstraints) {
			if (oBind.type.oConstraints.equals) {
				oEquals = oBind.type.oConstraints.equals;
			}
		}
		
		// now create the return value.
		if (iMaxLength > 0 || oEquals) {
			mConstraints = {};
			
			if (iMaxLength > 0) {
				mConstraints.maxLength = iMaxLength;
			}
			
			if (oEquals) {
				mConstraints.equals = oEquals;
			}
		}
		
		return mConstraints;
	};

	/**
	 * Returns formatter function for displaying a currency.
	 * 
	 * @param {boolean} bCurrency Flag indicating whether the formatter actually refers to a currency or just unit-of-measure
	 * @returns {function} Formatter function for displaying a currency
	 * @public
	 */
	ODataTypes.prototype.getCurrencyDisplayFormatter = function(bCurrency) {
		var oFormat = NumberFormat.getCurrencyInstance({
			showMeasure: false
		});

		return function(oAmount, sCurrency) {
			var sValue, iCurrencyDigits, iPadding;

			if (!oAmount || !sCurrency || sCurrency === "*") {
				return "";
			}

			if (!bCurrency) {
				sValue = oAmount += "\u2008";
				return sValue;
			}
			
			iCurrencyDigits = oFormat.oLocaleData.getCurrencyDigits(sCurrency);
			sValue = oFormat.format(oAmount, sCurrency);

			if (iCurrencyDigits === 0) {
				sValue += "\u2008";
			}

			iPadding = 3 - iCurrencyDigits;

			if (iPadding) {
				sValue = jQuery.sap.padRight(sValue, "\u2007", sValue.length + iPadding);
			}

			return sValue;
		};
	};

	/**
	 * Creates a new currency type instance and returns it.
	 * 
	 * @param {object} oProperty the OData property to use for constraint calculation, e.g. precision and scale.
	 * @returns {sap.ui.model.type.Currency} the new currency type instance.
	 * @public
	 */
	ODataTypes.prototype.getCurrencyType = function(oProperty) {
		var oConstraints, oFormat = {
			showMeasure: false,
			parseAsString: true
		};

		if (oProperty) {
			oConstraints = this._getDecimalConstraints(oProperty);
			
			if (oConstraints) {
				if (oConstraints.precision) {
					oFormat.maxIntegerDigits = oConstraints.precision;
				}
				
				if (oConstraints.scale) {
					oFormat.maxFractionDigits = oConstraints.scale;
				}
			}
			
			return new CurrencyType(oFormat);
		}

		return null;
	};
	
	/**
	 * Creates a new ABAP Boolean type instance.
	 * 
	 * @returns {sap.ui.comp.smartfield.type.AbapBool} the new instance.
	 * @public
	 */
	ODataTypes.prototype.getAbapBoolean = function() {		
		return new AbapBoolean();
	};
	
	/**
	 * Frees all resources claimed during the life-time of this instance.
	 * 
	 * @public
	 */
	ODataTypes.prototype.destroy = function() { // EXC_JSLINT_021
		this._oParent = null;
	};

	return ODataTypes;
}, true);
