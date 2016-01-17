/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
jQuery.sap.declare('sap.apf.core.utils.filterTerm');
jQuery.sap.require('sap.apf.core.constants');
jQuery.sap.require('sap.apf.utils.utils');
(function() {
	'use strict';
	/**
	 * @private
	 * @class This class implements a simple term in a filter in the form (property,
	 *        operator, value). It is used by sap.apf.core.utils.Filter.
	 * @param {sap.apf.core.MessageHandler} oMsgHandler
	 * @param {string} propertyName This is the property name of the term. Property name here relates
	 *            to oData and corresponds to a field/attribute/column name of an analytical
	 *            view.
	 * @param {string} operatorName Is the operator name. Operator must be a value of
	 *            {sap.apf.core.constants.FilterOperators}.
	 * @param {string|number|boolean|Date} value Some constant value like 1000 or 'Jan'.
	 * @param {string|number|boolean|Date} highvalue required, if operator is BT.
	 * @returns {sap.apf.core.utils.FilterTerm}
	 */
	sap.apf.core.utils.FilterTerm = function(oMsgHandler, propertyName, operatorName, value, highvalue) {
		this.type = "filterTerm";
		var sProperty = propertyName;
		var sOperator = operatorName;
		var val = value; // value can be string or number
		if (sOperator.length == 2) {
			sOperator = sOperator.toUpperCase();
		}
		// do some checks
		oMsgHandler.check(sOperator !== undefined, "sap.apf.utils.FilterTerm.constructor operator undefined");
		oMsgHandler.check(jQuery.inArray(sOperator, sap.apf.core.constants.aSelectOpt) > -1, "sap.apf.core.utils.FilterTerm operator " + sOperator + " not supported");
		oMsgHandler.check(sProperty !== undefined, "sap.apf.utils.core.FilterTerm sProperty undefined");
		oMsgHandler.check(val !== undefined, "sap.apf.utils.FilterTerm value undefined");
		/**
		 * @description The method checks if "property EQ value" is logically consistent with this filter term.
		 * 		This is a helper function of the isConsistentWithFilter method.
		 * @param {string} property The property of the value.
		 * @param {string|number|boolean|Date} valueChecked Value, that shall be checked for consistency.
		 * @returns {boolean} bContained Returns true, if the value is consistent.
		 *          Otherwise false. If the property differs, then true is returned,
		 *          because the filter term holds no restriction on the property.
		 */
		var containsSingleValue = function (property, valueChecked) {
			var prefix;
			var index;
			if (property !== sProperty) {
				return true;
			}
			if (sOperator === sap.apf.core.constants.FilterOperators.EQ) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() === valueChecked.valueOf());
				}
				return (value === valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.LT) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() > valueChecked.valueOf());
				}
				return (value > valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.LE) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() >= valueChecked.valueOf());
				}
				return (value >= valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.GT) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() < valueChecked.valueOf());
				}
				return (value < valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.BT) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() <= valueChecked.valueOf() && valueChecked.valueOf() <= highvalue.valueOf());
				}
				return (value <= valueChecked && valueChecked <= highvalue);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.GE) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return (value.valueOf() <= valueChecked.valueOf());
				}
				return (value <= valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.NE) {
				if (value instanceof Date && valueChecked instanceof Date) {
					return !(value.valueOf() === valueChecked.valueOf());
				}
				return !(value === valueChecked);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.StartsWith) {
				if (value.length > valueChecked.length) {
					return false;
				}
				prefix = valueChecked.slice(0, value.length);
				return (prefix === value);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.EndsWith) {
				if (value.length > valueChecked.length) {
					return false;
				}
				prefix = valueChecked.slice(-value.length);
				return (prefix === value);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.Contains) {
				index = valueChecked.indexOf(value);
				return (index > -1);
			}
		};
		/**
		 * @description The method checks if "property EQ value" is logically consistent with this filter term.
		 * @param {string} property The property for the value.
		 * @param {string|number|boolean|Date} value The value to be checked.
		 */
		this.isConsistentWithFilter = function (property, value) {
			return containsSingleValue(property, value);
		};
		/**
		 * @description Transforms the object into a string, that can be used in the
		 *              filter part of an odata request.
		 * @param {object} conf Configuration for returning the result.
		 * @param {boolean} [conf.asFilterArray] If an array with single lines for each
		 *            property has to be returned.
		 * @param conf.formatValue callback function for correct rendering of the value. The callback function is called with
		 * property and value.
		 */
		this.toUrlParam = function (conf) {
			var strDelimiter = "'";
			var spaceCharacter = " ";
			var param = "";
			var aParam = [];
			var value, hvalue;
			if (conf && conf.formatValue) {
				value = conf.formatValue(sProperty, val);
				if (highvalue) {
					hvalue = conf.formatValue(sProperty, highvalue);
				}
			} else {
				if (typeof val === 'number') {
					value = val;
				} else {
					value = strDelimiter + sap.apf.utils.escapeOdata(val) + strDelimiter;
				}
				if (highvalue) {
					if (typeof val === 'number') {
						hvalue = highvalue;
					} else {
						hvalue = strDelimiter + sap.apf.utils.escapeOdata(highvalue) + strDelimiter;
					}
				}
			}
			if (sOperator === sap.apf.core.constants.FilterOperators.StartsWith) {
				param = 'startswith(' + sap.apf.utils.escapeOdata(sProperty) + ',' + value + ')';
				param = jQuery.sap.encodeURL(param);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.EndsWith) {
				param = 'endswith(' + sap.apf.utils.escapeOdata(sProperty) + ',' + value + ')';
				param = jQuery.sap.encodeURL(param);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.Contains) {
				// substringof is odata 2.0, and isConsistentWithFilter will be odata 4.0
				param = 'substringof(' + value + ',' + sap.apf.utils.escapeOdata(sProperty) + ')';
				param = jQuery.sap.encodeURL(param);
			} else if (sOperator === sap.apf.core.constants.FilterOperators.BT) {
				param = '((' + jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(sProperty) + spaceCharacter + "ge" + spaceCharacter + value) + ')' + jQuery.sap.encodeURL(spaceCharacter + 'and' + spaceCharacter) + '('
					+ jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(sProperty) + spaceCharacter + "le" + spaceCharacter + hvalue) + '))';
			} else {
				param = '(' + jQuery.sap.encodeURL(sap.apf.utils.escapeOdata(sProperty) + spaceCharacter + sOperator.toLowerCase() + spaceCharacter + value) + ')';
			}
			if (conf && conf.asFilterArray === true) {
				aParam.push(param);
				return aParam;
			}
			return param;
		};
		/**
		 * @description Returns the property.
		 * @returns {string} property
		 */
		this.getProperty = function () {
			return sProperty;
		};
		/**
		 * @description Returns the operator.
		 * @returns {string} op
		 */
		this.getOp = function () {
			return sOperator;
		};
		/**
		 * @description Returns the value.
		 * @returns {string|number|boolean} value
		 */
		this.getValue = function () {
			return val;
		};
		/**
		 * @description Returns the high value (.
		 * @returns {string|number|boolean} value
		 */
		this.getHighValue = function () {
			return highvalue;
		};
		/**
		 * @description Returns the hash value of the filter term. The hash value is
		 *              needed for simple comparison. The hash uniquely identifies a
		 *              filter term.
		 * @returns {number} hash value - Hash as int32
		 */
		this.getHash = function () {
			var sString = sProperty + sOperator + val;
			return sap.apf.utils.hashCode(sString);
		};
		/**
		 * @description Copy constructor.
		 * @returns {sap.apf.core.utils.FilterTerm} Fiterterm
		 */
		this.copy = function () {
			return new sap.apf.core.utils.FilterTerm(oMsgHandler, sProperty, sOperator, val, highvalue);
		};
		/**
		 * @description This function either returns undefined, if the filter term
		 *              is defined for the property or a copy of itself, if not.
		 * @param {string|string[]} property This is either a property or an array of properties.
		 *            If it is an array, then the test is done against each of the
		 *            properties.
		 * @returns {undefined|sap.apf.core.utils.FilterTerm} oFilterTerm Returns
		 *          filter term or undefined, if the property equals the property of
		 *          the filter term.
		 */
		this.removeTermsByProperty = function (property) {
			var i = 0;
			var len = 0;
			if (property instanceof Array) {
				len = property.length;
				for (i = 0; i < len; i++) {
					if (sProperty === property[i]) {
						return undefined;
					}
				}
				// not found - return copy
				return this.copy();
			}
			if (sProperty === property) {
				return undefined;
			}
			return this.copy();
		};
		/**
		 * @description This function either returns undefined, if the filter term
		 *              is defined for the property or a copy of itself, if not.
		 * @param {string|string[]} property This is either a property or an array of properties.
		 *            If it is an array, then the test is done against each of the
		 *            properties.
		 * @param {string} option option
		 * @param {boolean|number|string} value Value of the expression.
		 * @returns {sap.apf.core.utils.FilterTerm|undefined} oFilterTerm The filter
		 *          term or undefined is returned, if the property equals the
		 *          property of the filter term.
		 */
		this.removeTerms = function (property, option, value) {
			var i = 0;
			var len = 0;
			if (property instanceof Array) {
				len = property.length;
				for (i = 0; i < len; i++) {
					if (sProperty === property[i] && sOperator === option && val === value) {
						return undefined;
					}
				}
				// not found - return copy
				return this.copy();
			}
			if (sProperty === property && sOperator === option && val === value) {
				return undefined;
			}
			return this.copy();
		};
		/*
		 * returns an object, that is similar to constructor for sap ui5 filter
		 */
		this.mapToSapUI5FilterExpression = function () {
			if (sOperator === sap.apf.core.constants.FilterOperators.BT) {
				return {
					path: sProperty,
					operator: sOperator,
					value1: val,
					value2: highvalue
				};
			}
			return {
				path: sProperty,
				operator: sOperator,
				value1: val
			};
		};
		/**
		 * Structural traversal and application of a visitor, base case for FilterTerm.
		 * @param {*} visitor - A visitor.
		 * 		Shall at lest provide the following method:
		 * 			processTerm({sap.apf.core.utils.FilterTerm}),
		 * @returns {*}
		 */
		this.traverse = function(visitor) {
			return visitor.processTerm(this);
		};
	};
}());
