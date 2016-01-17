/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global sap, jQuery */
/**
 * internally used filter object
 */
jQuery.sap.declare('sap.apf.core.utils.filter');
jQuery.sap.require('sap.apf.core.utils.filterTerm');
jQuery.sap.require('sap.apf.core.constants');
(function() {
	'use strict';
	/**
	 * @private
	 * @class Expression on properties for the filter of an odata request. Filters
	 *        represent an expression on properties for the filter of an odata
	 *        request. Allowed constructor calls are:
	 *        sap.apf.core.utils.Filter(oMsgHandler, property, op, value) or
	 *        sap.apf.core.utils.Filter(oMsgHandler, new sap.apf.core.utils.FilterTerm(...)) or
	 *        sap.apf.core.utils.Filter(oMsgHandler,new sap.apf.core.utils.Filter(...)).
	 * @param {sap.apf.core.MessageHandler} oMsgHandler
	 * @param {string|sap.apf.core.utils.Filter|sap.apf.core.utils.FilterTerm} arg1 - First argument is either a Filter or a FilterTerm or a property of a filter term
	 * @param {string} arg2 - if param arg2 is supplied, then an operator is expected , a property for arg1 and a value for arg3. Example: 'Country' 'EQ' 'BRA'
	 * @param {string} arg3 - value
	 * @param {string} arg4 - high-value
	 */
	sap.apf.core.utils.Filter = function(oMsgHandler, arg1, arg2, arg3, arg4) {
		var cLogicalAndText = "%20and%20";
		var cLogicalOrText = "%20or%20";
		this.type = "internalFilter"; //sap.utils.filter has type filter
		/**
		 * @description either a Filter Term or Filter. This is the first
		 *              part (term) of the filter.
		 */
		var oLeftExpr;
		if (arg1 && (arg1 instanceof sap.apf.core.utils.FilterTerm || arg1 instanceof sap.apf.core.utils.Filter)) {
			oLeftExpr = arg1;
		} else if (arg1 !== undefined && arg2 !== undefined && arg3 !== undefined) {
			oLeftExpr = new sap.apf.core.utils.FilterTerm(oMsgHandler, arg1, arg2, arg3, arg4);
		} else if (arg1 !== undefined || arg2 !== undefined || arg3 !== undefined) {
			oMsgHandler.check(false, "wrong arguments in construction of sap.apf.core.utils.Filter");
		}
		/**
		 * @description this array holds the further parts of the filter
		 *              expression
		 */
		var aRestExpr = [];
		/**
		 * @description is either AND or OR and defines, how the sub expressions are
		 *              connected.
		 */
		var levelOp;
		/**
		 * @description Returns the properties of the sub filters
		 * @returns {string[]} aProperties Array with property (names), that are used in the filter.
		 */
		this.getProperties = function() {
			var i;
			var aProperty = [];
			var aProperty2 = [];
			var property = "";
			if (oLeftExpr === undefined) {
				return aProperty;
			}
			if (oLeftExpr instanceof sap.apf.core.utils.FilterTerm) {
				property = oLeftExpr.getProperty();
				aProperty.push(property);
			} else if (oLeftExpr instanceof sap.apf.core.utils.Filter) {
				aProperty = oLeftExpr.getProperties();
			}
			for(i = 0; i < aRestExpr.length; i++) {
				if (aRestExpr[i] instanceof sap.apf.core.utils.FilterTerm) {
					aProperty.push(aRestExpr[i].getProperty());
				} else {
					aProperty2 = aRestExpr[i].getProperties();
					aProperty = aProperty.concat(aProperty2);
				}
			}
			return sap.apf.utils.eliminateDuplicatesInArray(oMsgHandler, aProperty);
		};
		/**
		 * @description Copy constructor
		 * @returns {sap.apf.core.utils.Filter} Filter New object as deep copy
		 */
		this.copy = function() {
			var oFilter;
			var i;
			if (oLeftExpr === undefined) {
				return new sap.apf.core.utils.Filter(oMsgHandler);
			}
			oFilter = new sap.apf.core.utils.Filter(oMsgHandler, oLeftExpr);
			if (levelOp === undefined) {
				return oFilter;
			}
			for(i = 0; i < aRestExpr.length; i++) {
				if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
					oFilter.addAnd(aRestExpr[i].copy());
				} else {
					oFilter.addOr(aRestExpr[i].copy());
				}
			}
			return oFilter;
		};
		/**
		 * @description Returns true if the filter is empty, meaning it is not AND or OR and it does not contain any logical constraint.
		 * Technically it is a tree not containing any FilterTerm.
		 * @returns {boolean}
		 */
		this.isEmpty = function() {
			if (oLeftExpr === undefined) {
				return true;
			}
			if ( oLeftExpr instanceof sap.apf.core.utils.FilterTerm) {
				return false;
			}
			if ( !oLeftExpr.isEmpty() ) {
				return false;
			}
			if ( aRestExpr.length === 0) {
				return true;
			}
			// AND or OR node
			var i;
			for (i=0; i< aRestExpr.length; ++i ) {
				if ( !aRestExpr[i].isEmpty() ) { // this is the most probable case, important for efficiency
					return false;
				}
			}
			return true; // no match of FilterTerm
		};
		/**
		 * Returns true only if the Filter is an OR-Node and therefore non-empty, too.
		 * @returns {boolean}
		 */
		this.isOr = function() {
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.OR) {
				return true;
			} else if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND ) {
				return false;
			}
			if (oLeftExpr) {
				if (oLeftExpr instanceof sap.apf.core.utils.Filter) {
					return oLeftExpr.isOr();
				}
			}
			return false;
		};
		/**
		 * @description Test on equality of two filters. Two filters are identical, if they have the same filter terms connected with the same operators.
		 * Commutative and associative law are considered.
		 * @param {sap.apf.core.utils.Filter} oFilter to compare with
		 * @returns {boolean} true  if filters are identical.
		 */
		this.isEqual = function(oFilter) {
			if (this === oFilter) {
				return true;
			}
			if (oFilter === undefined) {
				return false; // never equal to a undefined
			}
			return this.getHash() === oFilter.getHash();
		};
		/**
		 * @description Compute hash for the filter object. Needed for compare with
		 *              other filter
		 * @param {number} iLevelOfExpression level in the expression structure.
		 * @returns {number} hashvalue Hash as number.
		 */
		this.getHash = function(iLevelOfExpression) {
			var nCurrentLevel = iLevelOfExpression || 1;
			var nNextLevel = 0;
			if (aRestExpr.length === 0) {
				nNextLevel = nCurrentLevel;
			} else {
				nNextLevel = nCurrentLevel + 1;
			}
			if (oLeftExpr === undefined) {
				return 0;
			}
			var iHash = oLeftExpr.getHash(nNextLevel);
			var i;
			if (levelOp === undefined) {
				return iHash;
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
				iHash = iHash + Math.pow(2, nCurrentLevel); // hash for and on this level = 2,4,8
			} else if (levelOp === sap.apf.core.constants.BooleFilterOperators.OR) {
				iHash = iHash + Math.pow(3, nCurrentLevel); // = hash + 3,9,27,,...
			}
			for(i = 0; i < aRestExpr.length; i++) {
				iHash = iHash + aRestExpr[i].getHash(nNextLevel);
			}
			return iHash;
		};
		/* FIXME no productive usage HL 24.09.2015, used in tests only*/
		/**
		 * @description Filters the array aData according to the filter condition. It is expected, that aData is array in
		 * json format.
		 * @param {object[]} aData Array in json format (value : prop).
		 * @returns {object[]} aFilteredData Array in json format with filtered values.
		 */
		this.filterArray = function(aData) {
			var aFilteredData = [];
			var i;
			var j = 0;
			var len = aData.length;
			if (len === 0) {
				return aFilteredData;
			}
			var oProp;
			var bContained = false;
			// determine which properties have to be filtered
			var aFilterProperties = this.getProperties();
			var aDataPropertiesToTest = [];
			for(oProp in aData[0]) {
				if (jQuery.inArray(oProp, aFilterProperties) > -1) {
					aDataPropertiesToTest.push(oProp);
				}
			}
			// nothing to be filtered
			if (aDataPropertiesToTest.length === 0) {
				return aData;
			}
			// filter against the relevant properties
			for(i = 0; i < len; i++) {
				bContained = true;
				for(j = 0; j < aDataPropertiesToTest.length; ++j) {
					oProp = aDataPropertiesToTest[j];
					if (this.isConsistentWithFilter(oProp, aData[i][oProp]) === false) {
						bContained = false;
						break;
					}
				}
				if (bContained) {
					aFilteredData.push(aData[i]);
				}
			}
			return aFilteredData;
		};
		/**
		 * @description Get all terms for a filter per property.
		 * @param {string} property
		 *            This is the property, for which the terms are requested
		 * @returns {sap.apf.core.utils.FilterTerm[]} filterTerms An array with filter terms.
		 */
		this.getFilterTermsForProperty = function(property) {
			var aTerm = [];
			var i;
			if (oLeftExpr === undefined) {
				return aTerm;
			}
			if (oLeftExpr instanceof sap.apf.core.utils.Filter) {
				aTerm = oLeftExpr.getFilterTermsForProperty(property);
			} else if (property === oLeftExpr.getProperty()) {
				aTerm.push(oLeftExpr);
			}
			for(i = 0; i < aRestExpr.length; i++) {
				if (aRestExpr[i] instanceof sap.apf.core.utils.FilterTerm) {
					if (property === aRestExpr[i].getProperty()) {
						aTerm.push(aRestExpr[i]);
					}
				} else {
					aTerm = aTerm.concat(aRestExpr[i].getFilterTermsForProperty(property));
				}
			}
			return aTerm;
		};
		/**
		 * Returns all filter terms recursively contained in the filter tree.
		 * Empty filters (filter w/o a filterTerm) are eliminated.
		 * @returns {{sap.apf.core.utils.Filter|sap.apf.core.utils.FilterTerm}[]} note 2 types are in array
		 */
		this.getFilterTerms = function() {
			var aTerm = [];
			var i;
			if (oLeftExpr === undefined) {
				return aTerm;
			}
			if (oLeftExpr instanceof sap.apf.core.utils.Filter) {
				aTerm = oLeftExpr.getFilterTerms();
			} else {
				aTerm.push(oLeftExpr); // assumed to be a FilterTerm
			}
			for(i = 0; i < aRestExpr.length; i++) {
				if (aRestExpr[i] instanceof sap.apf.core.utils.FilterTerm) {
					aTerm.push(aRestExpr[i]);
				} else {
					aTerm = aTerm.concat(aRestExpr[i].getFilterTerms());
				}
			}
			return aTerm;
		};

		/*
		 * Returns true if the property is not disjoint from the filter's properties. Abstracts the filter type.
		 */
		function isPropertyMatch(filter, property) {
			if (filter instanceof sap.apf.core.utils.FilterTerm) {
				return filter.getProperty() === property ;
			}
			return filter.getProperties().indexOf(property) >= 0;
		}

		/**
		 * @description This is a test whether the given value of the given property satisfies the filter.
		 * 		Logically, the method implements a test if: Filter(this) AND (property EQ value) is consistent.
		 * 		Thereby, the empty filter is a neutral element (can be eliminated without changing the result).
		 * 		Furthermore, teh method returns true when the given property is disjoint with all properties in the filter (this).
		 * @param {string} property
		 *            This is either a single property or an array of properties.
		 * @param {boolean|string|number} value
		 *            This is either a value, if property is a single property or a
		 *            json object with pairs (property, value), if parameter property is of type array.
		 * @returns {boolean}
		 */
		this.isConsistentWithFilter = function(property, value) {
			var i;
			var isConstrained = false;
			if (oLeftExpr === undefined) {
				return true; // no restriction
			}
			if (levelOp === undefined) { // is wrapper around Filter
				return oLeftExpr.isConsistentWithFilter(property, value);
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
				if (!oLeftExpr.isConsistentWithFilter(property, value)) {
					return false;
				}
				for(i = 0; i < aRestExpr.length; i++) {
					if (!aRestExpr[i].isConsistentWithFilter(property, value)) {
						return false;
					}
				}
				return true;
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.OR) {
				// when the property if not in the left branch then isConsistentWithFilter would return true.
				// but the other branches may still put a constraint.
				if (isPropertyMatch(oLeftExpr, property)) {  // note: creates O(n**2) complexity. to be optimized when performance is bad.
					isConstrained = true;
					if(oLeftExpr.isConsistentWithFilter(property, value)) {
						return true;
					}
				}
				for(i = 0; i < aRestExpr.length; i++) {
					if (isPropertyMatch(aRestExpr[i], property)) {
						isConstrained = true;
						if(aRestExpr[i].isConsistentWithFilter(property, value)) {
							return true;
						}
					}
				}
				// all subtrees processed, isConstrained===true then matched property, by no value match. Thus return false.
				// isConstrained===false means value is valid since not contrained, thus return true.
				return !isConstrained;
			}
		};
		/**
		 * @description Eliminates terms of the expression, that are defined for the
		 *              property
		 * @param {string} property
		 *           This  is the property, for which the terms are. If property is an
		 *            array, then the terms are removed for all properties.
		 * @returns {sap.apf.core.utils.Filter} oFilterExpression This is the filter without
		 *          filter terms on property
		 */
		this.removeTermsByProperty = function(property) {
			var i, oResultFilter, oReducedRestFilter;
			if (oLeftExpr === undefined) {
				return this.copy();
			}
			oResultFilter = oLeftExpr.removeTermsByProperty(property);
			if (oResultFilter instanceof sap.apf.core.utils.FilterTerm) {
				oResultFilter = new sap.apf.core.utils.Filter(oMsgHandler, oResultFilter.getProperty(), oResultFilter.getOp(), oResultFilter.getValue(), oResultFilter.getHighValue());
			}
			if (levelOp === undefined) {
				return oResultFilter;
			}
			for(i = 0; i < aRestExpr.length; i++) {
				oReducedRestFilter = aRestExpr[i].removeTermsByProperty(property);
				if (oResultFilter === undefined) {
					if (oReducedRestFilter instanceof sap.apf.core.utils.FilterTerm) {
						oResultFilter = new sap.apf.core.utils.Filter(oMsgHandler, oReducedRestFilter);
					} else {
						oResultFilter = oReducedRestFilter;
					}
				} else if (oReducedRestFilter !== undefined) {
					if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
						oResultFilter.addAnd(oReducedRestFilter);
					} else {
						oResultFilter.addOr(oReducedRestFilter);
					}
				}
			}
			if (oResultFilter) {
				return new sap.apf.core.utils.Filter(oMsgHandler, oResultFilter);
			}
		};
		/**
		 * @description Eliminates terms of the expression, that are defined for the
		 *              property
		 * @param {string} property
		 *            This is the property, for which the terms are. If property is an
		 *            array, then the terms are removed for all properties.
		 * @param {string} option
		 * @param {string|boolean|value} value
		 * @returns {sap.apf.core.utils.Filter} oFilterExpression This is the filter expression without
		 *          filter terms on property.
		 */
		this.removeTerms = function(property, option, value) {
			var i;
			if (oLeftExpr === undefined) {
				return this.copy();
			}
			var oFilter = oLeftExpr.removeTerms(property, option, value);
			var oFilter2;
			if (oFilter instanceof sap.apf.core.utils.FilterTerm) {
				oFilter = new sap.apf.core.utils.Filter(oMsgHandler, oFilter.getProperty(), oFilter.getOp(), oFilter.getValue(), oFilter.getHighValue());
			}
			if (levelOp === undefined) {
				return oFilter;
			}
			for(i = 0; i < aRestExpr.length; i++) {
				oFilter2 = aRestExpr[i].removeTerms(property, option, value);
				if (oFilter === undefined) {
					if (oFilter2 instanceof sap.apf.core.utils.FilterTerm) {
						oFilter = new sap.apf.core.utils.Filter(oMsgHandler, oFilter2);
					} else {
						oFilter = oFilter2;
					}
				} else if (oFilter2 !== undefined) {
					if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
						oFilter.addAnd(oFilter2);
					} else {
						oFilter.addOr(oFilter2);
					}
				}
			}
			return oFilter;
		};
		/**
		 * @description add a new filter connected with OR
		 * @param {string|sap.apf.core.utils.Filter|sap.apf.core.utils.FilterTerm} arg1 -
		 *            Filter or filter term or property.
		 * @param {string} [arg2] operator, This makes only sense, if first argument is a property
		 * @param {boolean|string|number} [arg3] Value, if first argument is property and second argument is operator
		 * @param {string} arg4 high-value
		 * @returns {sap.apf.core.utils.Filter} this for method chaining.
		 */
		this.addOr = function(arg1, arg2, arg3, arg4) {
			var oFilter;
			if (arg1 instanceof sap.apf.core.utils.Filter || arg1 instanceof sap.apf.core.utils.FilterTerm) {
				oFilter = arg1;
			} else if (arg1 !== undefined && arg2 !== undefined && arg3 !== undefined) {
				oFilter = new sap.apf.core.utils.FilterTerm(oMsgHandler, arg1, arg2, arg3, arg4);
			} else {
				oMsgHandler.check(false, "sap.apf.core.utils.Filter.addOr: wrong arguments in construction of  Filter");
			}
			if (oLeftExpr === undefined) {
				oLeftExpr = oFilter;
				return this;
			}
			if (levelOp === undefined) {
				levelOp = sap.apf.core.constants.BooleFilterOperators.OR;
			}
			aRestExpr.push(oFilter);
			oMsgHandler.check(levelOp === sap.apf.core.constants.BooleFilterOperators.OR, "sap.apf.core.utils.Filter - addOr wrong operation");
			return this;
		};
		/**
		 * @description Add a new filter expression connected with AND
		 * @param {string|sap.apf.core.utils.Filter|sap.apf.core.utils.FilterTerm} arg1 - Filter or filter term or property.
		 * @param {string} [arg2] operator, This makes only sense, if first argument is a property
		 * @param {boolean|string|number} [arg3] Value, if first argument is property and second argument is operator
		 * @param {string} arg4 high-value
		 * @returns {sap.apf.core.utils.Filter} this For method chaining.
		 */
		this.addAnd = function(arg1, arg2, arg3, arg4) {
			var oFilter;
			if (arg1 instanceof sap.apf.core.utils.Filter || arg1 instanceof sap.apf.core.utils.FilterTerm) {
				oFilter = arg1;
			} else if (arg1 !== undefined && arg2 !== undefined && arg3 !== undefined) {
				oFilter = new sap.apf.core.utils.FilterTerm(oMsgHandler, arg1, arg2, arg3, arg4);
			} else {
				oMsgHandler.check(false, "sap.apf.core.utils.Filter.addAnd: wrong arguments in construction of  Filter");
			}
			if (oLeftExpr === undefined) {
				oLeftExpr = oFilter;
				return this;
			}
			if (levelOp === undefined) {
				levelOp = sap.apf.core.constants.BooleFilterOperators.AND;
			}
			oMsgHandler.check(levelOp === sap.apf.core.constants.BooleFilterOperators.AND, "sap.apf.core.utils.Filter - addAnd wrong operation");
			aRestExpr.push(oFilter);
			return this;
		};
		/**
		 * @description Transforms the filter into parameters for the URL in
		 *              odata format suitable for xs engine
		 * @param conf configuration object.
		 * @param conf.asFilterArray then all properties are returned in a single line per property
		 * @param conf.formatValue callback function for correct rendering of the value. The callback function is called with
		 * property and value.
		 * @returns {string|string[]} string or array - dependence on conf
		 *
		 */
		this.toUrlParam = function(conf) {
			var bAsArray = false;
			var aParam = [];
			var sExpr = "";
			if (conf !== undefined && conf.asFilterArray === true) {
				bAsArray = true;
			}
			if (oLeftExpr === undefined) {
				if (bAsArray === true) {
					return [];
				}
				return "";
			}
			if (bAsArray === true) {
				aParam = oLeftExpr.toUrlParam(conf);
			} else {
				sExpr = oLeftExpr.toUrlParam(conf);
			}
			var i = 0;
			var len = aRestExpr.length;
			var sConnector = "";
			if (len === 0) {
				if (bAsArray === true) {
					return aParam;
				}
				return sExpr;
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
				sConnector = cLogicalAndText;
			} else {
				sConnector = cLogicalOrText;
			}
			var sRest = "";
			if (bAsArray === true) {
				for(i = 0; i < len; i++) {
					aParam = aParam.concat(aRestExpr[i].toUrlParam(conf));
				}
				return aParam;
			}
			for(i = 0; i < len; i++) {
				sRest = aRestExpr[i].toUrlParam(conf);
				if (sExpr === "") {
					sExpr = sRest;
				} else if (sRest !== "") {
					sExpr = sExpr + sConnector + sRest;
				}
			}
			return '(' + sExpr + ')';
		};
		/**
		 * creates an object, that is similar to the sap.ui5.model.Filter
		 */
		this.mapToSapUI5FilterExpression = function() {
			var i, expression, aFilters = [];
			if (oLeftExpr === undefined) {
				return {};
			}
			if (aRestExpr.length === 0) {
				return oLeftExpr.mapToSapUI5FilterExpression();
			}
			aFilters.push(oLeftExpr.mapToSapUI5FilterExpression());
			for(i = 0; i < aRestExpr.length; i++) {
				aFilters.push(aRestExpr[i].mapToSapUI5FilterExpression());
			}
			expression = {
				filters : aFilters,
				and : levelOp === sap.apf.core.constants.BooleFilterOperators.AND
			};
			return expression;
		};
		/**
		 * @description Overwrites properties and adds new properties if they are not already existing
		 *  with new properties or/and properties, which overwrite the current ones.
		 * @param {sap.apf.core.utils.Filter} oFilter Filter, that holds the properties for the overwriting.
		 * @returns {sap.apf.core.utils.Filter} merged filter object
		 */
		this.overwriteWith = function(oFilter) {
			var aPropertyNames = oFilter.getProperties();
			var oResultFilter;
			if (aPropertyNames.length !== 0) {
				oResultFilter = this.removeTermsByProperty(aPropertyNames);
				if (oResultFilter === undefined) {
					return oFilter.copy();
				}
				oResultFilter.addAnd(oFilter);
				return oResultFilter;
			}
			return this.copy();
		};
		/**
		 * @description removes all properties from the filter, that have not been requested
		 * @param {} requested properties: Can be a single string for a single property, a list of parameters for single properties or an array of property strings
		 * @returns new filter object which has only the requested properties
		 */
		this.reduceToProperty = function(/* sProperty | sProperty1, sProperty2, ... | aProperty */) {
			var aProperty = [];
			var oProperty;
			switch (arguments.length) {
				case 1:
					//noinspection JSLint
					oProperty = arguments[0];
					if (oProperty instanceof Array) {
						aProperty = oProperty;
					} else {
						aProperty.push(oProperty);
					}
					break;
				default:
					aProperty = Array.prototype.slice.call(arguments, 0);
			}
			//noinspection JSLint
			var aFilterPropertiesToBeRemoved = setAminusSetB(this.getProperties(), aProperty);
			//in case all terms are removed method 'removeTermsByProperty()' returns 'undefined', so we will need the OR part:
			return this.copy().removeTermsByProperty(aFilterPropertiesToBeRemoved) || new sap.apf.core.utils.Filter(oMsgHandler);
			//noinspection JSLint
			function setAminusSetB(aSetA, aSetB) {
				var i;
				var result = [];
				var hashB = {};
				var lengthA = aSetA ? aSetA.length : 0;
				var lengthB = aSetB ? aSetB.length : 0;
				for(i = 0; i < lengthB; i++) {
					hashB[aSetB[i]] = undefined;
				}
				for(i = 0; i < lengthA; i++) {
					if (!(aSetA[i] in hashB)) {
						result.push(aSetA[i]);
					}
				}
				return result;
			}
		};
		/**
		 * Returns true if and only if this Filter instance represents a single FilterTerm only.
		 * Note that if it returns true oLeftExpr not necessarily points to a FilterTerm, but may point to a Filter.
		 * @returns {boolean}
		 */
		this.isFilterTerm = function() {
			if (aRestExpr.length>0) {
				return false;
			}
			if (!oLeftExpr) {
				return false;
			}
			if (oLeftExpr instanceof sap.apf.core.utils.FilterTerm ) {
				return true;
			}
			return oLeftExpr.isFilterTerm();
		};
		/**
		 * Structural traversal and application of a visitor to each node.
		 * @param {*} visitor - A visitor.
		 * 		Shall provide the following methods:
		 * 			process({*}),
		 * 			processEmptyFilter(),
		 * 			processTerm({sap.apf.core.utils.FilterTerm}),
		 * 			processAnd({sap.apf.core.utils.Filter}, {sap.apf.core.utils.Filter}[]),
		 * 			processOr({sap.apf.core.utils.Filter}, {sap.apf.core.utils.Filter}[]),
		 * @returns {*}
		 */
		this.traverse = function(visitor) {
			if ( !oLeftExpr) {
				return visitor.processEmptyFilter(); // undefined encodes an empty filter
			}
			if (oLeftExpr && aRestExpr.length === 0) {
				if ( oLeftExpr instanceof sap.apf.core.utils.FilterTerm) {
					return visitor.processTerm(oLeftExpr); // FilterTerm
				}
				return oLeftExpr.traverse(visitor); // Filter. This recursion shall unwrap Filter chains on oLeftExpr
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.AND) {
				return visitor.processAnd(oLeftExpr, aRestExpr, this);
			}
			if (levelOp === sap.apf.core.constants.BooleFilterOperators.OR) {
				return visitor.processOr(oLeftExpr, aRestExpr, this);
			}
			oMsgHandler.check(false, 'undefined case in traverse()');
			return false;
		};
		this.isDisjunctionOverEqualities = function(){
			var isDisjunctionOverEqualities = true;

			if(levelOp === sap.apf.core.constants.BooleFilterOperators.AND){
				return false;
			}
			if(this.getProperties().length > 1){
				return false;
			}			
			if (oLeftExpr instanceof sap.apf.core.utils.Filter) {
				if(oLeftExpr.getFilterTerms().length > 1){
					return false;
				}
			}
			this.getFilterTerms().forEach(function(filterTerm){
				if(filterTerm.getOp() !== sap.apf.core.constants.FilterOperators.EQ){
					isDisjunctionOverEqualities = false;
				}
			});
			aRestExpr.forEach(function(restExpr){
				if (restExpr instanceof sap.apf.core.utils.Filter) {
					if(restExpr.getFilterTerms().length > 1){
						isDisjunctionOverEqualities = false;
					}
				}
			});

			return isDisjunctionOverEqualities;
		};
	};// Filter class
	/**
	 * @private
	 * @description Static function to create a filter object from array with
	 *              objects (in json notation) with given properties. Example:
	 *              aProperties = [country, city], data = [ { country: 'a', city:
	 *              'a1' }, { country: 'b', city: 'b1' }]. This gives: (country =
	 *              'a' and city = 'a1') or (country = 'b' and city = 'b1')
	 * @param {sap.apf.core.MessageHandler} oMsgHandler
	 * @param {string[]} aProperties
	 *            Array with properties
	 * @param {object[]} aData
	 *            Array with data in json format fieldname : value.
	 * @param {number[]} aIndices indices that indicate, which data line is selected
	 * @static
	 */
	sap.apf.core.utils.Filter.createFromArray = function(oMsgHandler, aProperties, aData, aIndices) {
		var fLen = aProperties.length;
		var i;
		var nLine;
		var j;
		var oFilterData;
		var oFilterLine;
		var oFilter;
		oMsgHandler.check(aProperties instanceof Array && aProperties.length > 0, "sap.apf.core.utils.Filter.createFromArray incorrect argument aProperties");
		oMsgHandler.check(aData instanceof Array, "sap.apf.core.utils.Filter.createFromArray incorrect argument aData");
		if (aIndices.length > 0) {
			for(i = 0; i < aIndices.length; ++i) {
				oFilterLine = undefined;
				nLine = aIndices[i];
				if (!aData[nLine]) {
					continue;
				}
				for(j = 0; j < fLen; j++) {
					oFilter = new sap.apf.core.utils.Filter(oMsgHandler, aProperties[j], sap.apf.core.constants.FilterOperators.EQ, aData[nLine][aProperties[j]]);
					if (oFilterLine === undefined) {
						oFilterLine = new sap.apf.core.utils.Filter(oMsgHandler, oFilter);
					} else {
						oFilterLine.addAnd(oFilter);
					}
				}
				if (oFilterData === undefined) {
					oFilterData = new sap.apf.core.utils.Filter(oMsgHandler, oFilterLine);
				} else {
					oFilterData.addOr(oFilterLine);
				}
			}
			return oFilterData;
		}
		// return an empty filter in case of empty selection
		return new sap.apf.core.utils.Filter(oMsgHandler);
	};
	/**
	 * @private
	 * @description Static function to create a filter object that shall express a contradiction
	 *   and lead to an empty data response.
	 * @param {sap.apf.core.MessageHandler} oMsgHandler
	 * @param {string[]} aProperties  property names for the filter.
	 * @returns {sap.apf.core.utils.Filter}
	 * @static
	 */
	sap.apf.core.utils.Filter.createEmptyFilter = function(oMsgHandler, aProperties) {
		oMsgHandler.check(jQuery.isArray(aProperties) && aProperties.length > 0, "sap.apf.core.utils.Filter.createEmptyFilter - array with property names expected");
		return new sap.apf.core.utils.Filter(oMsgHandler, aProperties[0], sap.apf.core.constants.FilterOperators.EQ, '').addAnd(aProperties[0], sap.apf.core.constants.FilterOperators.NE, '');
	};
	/**
	 * @private
	 * @description Static function to transform a UI5 filter object into an internal filter 
	 * @param {sap.apf.core.MessageHandler} oMsgHandler
	 * @param {sap.ui.model.Filter} oUI5Filter UI5 filter 
	 * @returns {sap.apf.core.utils.Filter} APF Core internal filter
	 * @static
	 */
	sap.apf.core.utils.Filter.transformUI5FilterToInternal = function(oMsgHandler, oUI5Filter) {
		return transform(oUI5Filter, oUI5Filter.and);
		function transform(oUI5Filter, bAnd) {
			var result = new sap.apf.core.utils.Filter(oMsgHandler);
			var subTree;
			if (oUI5Filter.filters) {
				oUI5Filter.filters.forEach(function(filter) {
					if (filter.filters) {
						subTree = transform(filter, filter.and);
						if (bAnd) {
							result.addAnd(subTree);
						} else {
							result.addOr(subTree);
						}
					} else if (filter.path) { //TODO: sap.apf.core.utils.Filter.mapToSapUI5FilterExpression() creates an empty filter object, therefore an additional check for filter.path is required
						if (bAnd) {
							result.addAnd(filter.path, filter.operator, filter.value1, filter.value2);
						} else {
							result.addOr(filter.path, filter.operator, filter.value1, filter.value2);
						}
					}
				});
			} else {
				result = new sap.apf.core.utils.Filter(oMsgHandler, oUI5Filter.path, oUI5Filter.operator, oUI5Filter.value1, oUI5Filter.value2);
			}
			return result;
		}
	};
}());
