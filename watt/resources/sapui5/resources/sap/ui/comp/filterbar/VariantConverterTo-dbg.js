/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/comp/smartfilterbar/ControlConfiguration', 'sap/ui/comp/valuehelpdialog/ValueHelpDialog'],
	function(jQuery, ControlConfiguration, ValueHelpDialog) {
	"use strict";


	/**
	 * Constructs a utility class to convert the filter bar variant from/to internal to suite format
	 * 
	 * @constructor
	 * @public
	 * @author Franz Mueller
	 */
	var VariantConverterTo = function() {
	};
	
	/**
	 * the current variant will be transformed to suite format
	 * 
	 * @public
	 * @param {string} sKey of the current variant
	 * @param {array} aFilters containing filter names
	 * @param {string} sData json string representing the filter values
	 * @param {object} oFilterBar instance of the filterbar object
	 * @returns {string} variant in the suite format as json string
	 */
	VariantConverterTo.prototype.convert = function(sKey, aFilters, sData, oFilterBar) {
	
		var aFields, i;
		var oJson, n = null;
	
		var oSuiteContent = {
			SelectionVariantID: sKey
		};
	
		if (sData && aFilters) {
			oJson = JSON.parse(sData);
			if (oJson) {
				aFields = this._getFields(aFilters);
				if (aFields && aFields.length > 0) {
					for (i = 0; i < aFields.length; i++) {
						this._convertField(oSuiteContent, aFields[i], oJson, oFilterBar);
					}
				}
	
				// CUSTOM FIELDS
				if (oJson._CUSTOM) {
					for (n in oJson._CUSTOM) {
						if (n) {
							this._addSingleValue(oSuiteContent, n, this._getValue(oJson._CUSTOM[n]));
						}
					}
				}
			}
		}
	
		return JSON.stringify(oSuiteContent);
	};
	
	/**
	 * retrieve the meta data for a given filter
	 * 
	 * @private
	 * @param {string} sName of the filter
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar instance of the filter bar control
	 * @returns {object} meta data of the filter; null otherwise
	 */
	VariantConverterTo.prototype._getParameterMetaData = function(sName, oFilterBar) {
		var i, j;
		var oGroup;
	
		var aFilterMetaData = oFilterBar.getFilterBarViewMetadata();
		if (aFilterMetaData) {
			for (i = 0; i < aFilterMetaData.length; i++) {
				oGroup = aFilterMetaData[i];
				for (j = 0; j < oGroup.fields.length; j++) {
					if (sName === oGroup.fields[j].fieldName) {
						return oGroup.fields[j];
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * retrieve the array of relevant filters
	 * 
	 * @private
	 * @param {object} oSuiteContent represents the suite format of the variant; will be changed
	 * @param {string} sFilterName name of the filter
	 * @param {object} oContent json representing the values of the variant
	 * @param {object} oFilterBar representing the filterbar instance
	 */
	VariantConverterTo.prototype._convertField = function(oSuiteContent, sFilterName, oContent, oFilterBar) {
		var oObj, sValue, sOp = null;
		var oRanges;
		var oFilterMetaData;
	
		if (oContent && sFilterName && oSuiteContent) {
			oObj = oContent[sFilterName];
			if (oObj) {
	
				oFilterMetaData = this._getParameterMetaData(sFilterName, oFilterBar);
				if (oFilterMetaData) {
					if (oFilterMetaData.isCustomFilterField) {
						return; // custom fields will be handled separately
					}
	
					if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.single) {
						sValue = (oObj.value === undefined) ? oObj : oObj.value;
						this._addSingleValue(oSuiteContent, sFilterName, sValue);
					} else if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.interval) {
						oRanges = this._addRangeEntry(oSuiteContent, sFilterName);
						
						if ((oFilterMetaData.type === "Edm.DateTime") &&  !oObj.high) {
							oObj.high = oObj.low;
						} else if ((oFilterMetaData.type === "Edm.String") &&  !oObj.high) {
							sOp = "EQ";
						}
						this._addRangeLowHigh(oRanges, oObj, sOp);
					} else if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.multiple) {
						oRanges = this._addRangeEntry(oSuiteContent, sFilterName);
						if (oObj.items && oObj.items.length > 0) {
							this._addRangeMultipleSingleValues(oRanges, oObj.items);
						} else if (oObj.ranges && oObj.ranges.length > 0) {
							this._addRangeMultipleRangeValues(oRanges, oObj.ranges);	
						} else {
							this._addRangeSingleValue(oRanges, oObj.value);
						}
					} else {
						this._convertFieldByValue(oSuiteContent, sFilterName, oContent);
					}
				} else {
					this._convertFieldByValue(oSuiteContent, sFilterName, oContent);
				}
	
			}
		}
	};
	
	VariantConverterTo.prototype._convertFieldByValue = function(oSuiteContent, sFilterName, oContent) {
		var oObj;
		var oRanges;
	
		if (oContent && sFilterName && oSuiteContent) {
			oObj = oContent[sFilterName];
			if (oObj) {
	
				if ((oObj.ranges !== undefined) && (oObj.items !== undefined) && (oObj.value !== undefined)) {
	
					oRanges = this._addRangeEntry(oSuiteContent, sFilterName);
	
					if (oObj.ranges && oObj.ranges.length > 0) {
						this._addRanges(oRanges, oObj.ranges);
					}
					if (oObj.items && oObj.items.length > 0) {
						this._addRangeMultipleSingleValues(oRanges, oObj.items);
					}
					if (oObj.value) { // date
						this._addRangeSingleValue(oRanges, oObj.value);
					}
	
				} else if ((oObj.items !== undefined) && oObj.items && (oObj.items.length > 0)) {
					oRanges = this._addRangeEntry(oSuiteContent, sFilterName);
					this._addRangeMultipleSingleValues(oRanges, oObj.items);
				} else if ((oObj.low !== undefined) && oObj.low && (oObj.high !== undefined) && oObj.high) { // date
					oRanges = this._addRangeEntry(oSuiteContent, sFilterName);
					this._addRangeLowHigh(oRanges, oObj);
				} else if ((oObj.value !== undefined) && oObj.value) {
					this._addSingleValue(oSuiteContent, sFilterName, oObj.value);
				} else if (oObj) {
					this._addSingleValue(oSuiteContent, sFilterName, oObj);
				}
			}
		}
	};
	
	/**
	 * create a suite 'Ranges' object
	 * 
	 * @private
	 * @param {object} oSuiteContent represents the suite format of the variant; will be changed
	 * @param {string} sFilterName name of the filter
	 * @returns {object} representing the suite ranges segment
	 */
	VariantConverterTo.prototype._addRangeEntry = function(oSuiteContent, sFilterName) {
		var oObj = {
			PropertyName: sFilterName,
			Ranges: []
		};
		if (!oSuiteContent.SelectOptions) {
			oSuiteContent.SelectOptions = [];
		}
		oSuiteContent.SelectOptions.push(oObj);
	
		return oObj.Ranges;
	};
	
	/**
	 * convert ui5 to suite ranges
	 * 
	 * @private
	 * @param {object} oRanges represents the suite ranges format of the variant; will be changed
	 * @param {array} aRanges containing the ranges
	 */
	VariantConverterTo.prototype._addRanges = function(oRanges, aRanges) {
	
		var sSign, sOption, sLow, sHigh;
		
		for (var i = 0; i < aRanges.length; i++) {
			sSign = aRanges[i].exclude ? "E" : "I";
			sLow = this._getValue(aRanges[i].value1);
			sHigh = this._getValue(aRanges[i].value2);
	
			if (aRanges[i].operation === sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains) {
				sOption = "CP";
				if (sLow) {
					sLow = "*" + sLow + "*";
				}
			} else if (aRanges[i].operation === sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith) {
				sOption = "CP";
				if (sLow) {
					sLow = sLow + "*";
				}
			} else if (aRanges[i].operation === sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EndsWith) {
				sOption = "CP";
				if (sLow) {
					sLow = "*" + sLow;
				}
			} else {
				sOption = aRanges[i].operation;
			}
	
			oRanges.push({
				Sign: sSign,
				Option: sOption,
				Low: sLow,
				High: sHigh
			});
		}
	};
	
	/**
	 * convert ui5 to suite multiple single values
	 * 
	 * @private
	 * @param {object} oRanges represents the suite ranges format of the variant; will be changed
	 * @param {array} aItems containing the ranges
	 */
	VariantConverterTo.prototype._addRangeMultipleSingleValues = function(oRanges, aItems) {
	
		for (var i = 0; i < aItems.length; i++) {
			oRanges.push({
				Sign: "I",
				Option: "EQ",
				Low: this._getValue(aItems[i].key),
				High: null
			});
		}
	};


		VariantConverterTo.prototype._addRangeMultipleRangeValues = function(oRanges, aItems) {

		for (var i = 0; i < aItems.length; i++) {
			oRanges.push({
				Sign: "I",
				Option: "EQ",
				Low: this._getValue(aItems[i].value1),
				High: null
			});
		}
	};	
	
	
	/**
	 * convert ui5 to suite between e.q. Date
	 * 
	 * @private
	 * @param {object} oRanges represents the suite ranges format of the variant; will be changed
	 * @param {string} sValue of the filter
	 */
	VariantConverterTo.prototype._addRangeSingleValue = function(oRanges, sValue) {
	
		oRanges.push({
			Sign: "I",
			Option: "EQ",
			Low: this._getValue(sValue),
			High: null
		});
	};
	
	/**
	 * convert ui5 to suite between e.q. Date
	 * 
	 * @private
	 * @param {object} oRanges represents the suite ranges format of the variant; will be changed
	 * @param {object} oLowHigh containing the ranges
	 * @param {string} sOp override the default operation
	 */
	VariantConverterTo.prototype._addRangeLowHigh = function(oRanges, oLowHigh, sOp) {	
		var sOperation = sOp || "BT";
		
		oRanges.push({
			Sign: "I",
			Option: sOperation,
			Low: this._getValue(oLowHigh.low),
			High: this._getValue(oLowHigh.high)
		});
	};
	
	/**
	 * convert ui5 to suite between e.q. Date
	 * 
	 * @private
	 * @param {object} oSuiteContent represents the suite format of the variant; will be changed
	 * @param {string} sFilterName name of the filter
	 * @param {string} sValue of the filter
	 */
	VariantConverterTo.prototype._addSingleValue = function(oSuiteContent, sFilterName, sValue) {
	
		if (!oSuiteContent.Parameters) {
			oSuiteContent.Parameters = [];
		}
	
		oSuiteContent.Parameters.push({
			PropertyName: sFilterName,
			PropertyValue: sValue
		});
	};
	
	/**
	 * retrieve the array of relevant filters
	 * 
	 * @private
	 * @param {array} aFilters representing the filter items
	 * @returns {array} of strings; array of filter names
	 */
	VariantConverterTo.prototype._getFields = function(aFilters) {
	
		var aRelevantFilters = [];
	
		if (aFilters) {
			for (var i = 0; i < aFilters.length; i++) {
				aRelevantFilters.push(aFilters[i].name);
			}
		}
	
		return aRelevantFilters;
	};
	
	/**
	 * returns either the value
	 * 
	 * @private
	 * @param {object} oValue object
	 * @returns {object} stringified value
	 */
	VariantConverterTo.prototype._getValue = function(oValue) {
		if ((oValue === null) || (oValue === undefined)) {
			return null;
		}
			
		return "" + oValue;
	};
	
	VariantConverterTo.prototype._getControl = function(oFilterBar, sName) {
		var oControl = null;
		var oFilterItem = oFilterBar.determineFilterItemByName(sName);
		if (oFilterItem) {
			oControl = oFilterBar.determineControlByFilterItem(oFilterItem);	
		}
		
		return oControl;
	};

	return VariantConverterTo;

}, /* bExport= */ true);