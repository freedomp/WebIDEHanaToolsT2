/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/comp/smartfilterbar/ControlConfiguration', 'sap/ui/comp/valuehelpdialog/ValueHelpDialog', 'sap/m/MultiComboBox', 'sap/m/MultiInput', 'sap/m/DatePicker', 'sap/m/DateRangeSelection'],
		function(jQuery, ControlConfiguration, ValueHelpDialog, MultiComboBox, MultiInput, DatePicker, DateRangeSelection) {
	"use strict";


	/**
	 * Constructs a utility class to convert the filter bar variant from/to internal to suite format
	 * 
	 * @constructor
	 * @public
	 * @author Franz Mueller
	 */
	var VariantConverterFrom = function() {
	};

	/**
	 * the variant in suite format will be transformed to the internal format
	 * 
	 * @public
	 * @param {string} sSuiteContent object representing the variant data
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar instance of the filter bar control
	 * @returns {object} variant in the internal format
	 */
	VariantConverterFrom.prototype.convert = function(sSuiteContent, oFilterBar) {
		var oContent = null, oRetContent = null;
		var oSuiteContent;

		if (sSuiteContent) {

			oSuiteContent = JSON.parse(sSuiteContent);

			if (oFilterBar && oFilterBar.getFilterBarViewMetadata && oSuiteContent && (oSuiteContent.Parameters || oSuiteContent.SelectOptions)) {

				oContent = {};
				if (oSuiteContent.Parameters) {
					this._addParameters(oSuiteContent.Parameters, oFilterBar, oContent);
				}

				if (oSuiteContent.SelectOptions) {
					this._addSelectOptions(oSuiteContent.SelectOptions, oFilterBar, oContent);
				}

				oRetContent = { payload:null, variantId: null };
				oRetContent.payload = JSON.stringify(oContent);

				if (oSuiteContent.SelectionVariantID) {
					oRetContent.variantId = oSuiteContent.SelectionVariantID;
				}				

			}
		}

		return oRetContent;
	};

	VariantConverterFrom.prototype.retrieveVariantId = function(sSuiteContent) {
		var sVariantId = null;
		var oSuiteContent;

		if (sSuiteContent) {

			oSuiteContent = JSON.parse(sSuiteContent);

			if (oSuiteContent && oSuiteContent.SelectionVariantID) {
				sVariantId = oSuiteContent.SelectionVariantID;
			}
		}

		return sVariantId;
	};

	/**
	 * retrievee the meta data for a givven filter
	 * 
	 * @private
	 * @param {string} sName of the filter
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar instance of the filter bar control
	 * @returns {object} meta data of the filter; null otherwise
	 */
	VariantConverterFrom.prototype._getParameterMetaData = function(sName, oFilterBar) {
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
	 * convert a simple parameter
	 * 
	 * @private
	 * @param {object} oSuiteParameters object representing the suite single value parameters
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar instance of the filter bar control
	 * @param {object} oContent representing the resulting internal format
	 */
	VariantConverterFrom.prototype._addParameters = function(oSuiteParameters, oFilterBar, oContent) {
		var i;
		var sName, sValue;
		var oFilterMetaData;

		for (i = 0; i < oSuiteParameters.length; i++) {
			sValue = oSuiteParameters[i].PropertyValue;
			sName = oSuiteParameters[i].PropertyName;

			var oFilterItem = oFilterBar.determineFilterItemByName(sName);
			if (oFilterItem) {
				oFilterMetaData = this._getParameterMetaData(sName, oFilterBar);
				if (oFilterMetaData) {

					this._addAccordingMetaData(oContent, oFilterMetaData, sValue);

				} else {
					jQuery.sap.log.error("neither metadata nor custom information for filter '" + sName + "'");
				}
			} else {
				jQuery.sap.log.warning("unknown filter '" + sName + "'");
			}
		}
	};

	/**
	 * convert a simple parameter
	 * 
	 * @private
	 * @param {object} oSuiteSelectOptions object representing the suite SelectOptions entity
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterBar instance of the filter bar control
	 * @param {object} oContent representing the resulting internal format
	 */
	VariantConverterFrom.prototype._addSelectOptions = function(oSuiteSelectOptions, oFilterBar, oContent) {
		var i;
		var sName, aRanges;
		var oFilterMetaData, oControl;

		for (i = 0; i < oSuiteSelectOptions.length; i++) {
			sName = oSuiteSelectOptions[i].PropertyName;
			aRanges = oSuiteSelectOptions[i].Ranges;

			var oFilterItem = oFilterBar.determineFilterItemByName(sName);
			if (oFilterItem) {
				oFilterMetaData = this._getParameterMetaData(sName, oFilterBar);
				if (oFilterMetaData) {
					oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
					this._addRangesAccordingMetaData(oContent, oFilterMetaData, aRanges, oControl);					

				} else {
					jQuery.sap.log.error("neither metadata nor custom information for filter '" + name + "'");
				}
			} else {
				jQuery.sap.log.warning("unknown filter '" + name + "'");
			}
		}
	};

	VariantConverterFrom.prototype._addRangesAccordingMetaData = function(oContent, oFilterMetaData, aRanges, oControl, sName) {
		var i, oItem, oObj;

		var fConvertOption = function(sSuiteOption, sValue) {
			var sInternalOperation = sSuiteOption;
			if (sSuiteOption === "CP") {
				sInternalOperation = sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains;

				if (sValue) {
					var nIndexOf = sValue.indexOf('*');
					var nLastIndex = sValue.lastIndexOf('*');

					if ((nIndexOf === 0) && (nLastIndex !== (sValue.length - 1))) {
						sInternalOperation = sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EndsWith;
						sValue = sValue.substring(1, sValue.length);
					} else if ((nIndexOf !== 0) && (nLastIndex === (sValue.length - 1))) {
						sInternalOperation = sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith;
						sValue = sValue.substring(0, sValue.length - 1);
					} else {
						sValue = sValue.substring(1, sValue.length - 1);
					}
				}
			}

			return {
				op: sInternalOperation,
				v: sValue
			};
		};

		if (aRanges && aRanges.length > 0) {
			if (oFilterMetaData.isCustomFilterField) {
				if (!oContent._CUSTOM) {
					oContent._CUSTOM = {};
				}
				oContent._CUSTOM[oFilterMetaData.fieldName] = aRanges[0].Low;
				return;
			}

			if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.single) {
				if (!aRanges[0].Low && oControl && (oControl instanceof DatePicker)) {
					oContent[oFilterMetaData.fieldName] = null;					
				} else {
					oContent[oFilterMetaData.fieldName] = aRanges[0].Low;
				}

			} else if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.interval) {

				/* eslint-disable no-lonely-if */
				if (oControl && (oControl instanceof DateRangeSelection)) {
					
					if (aRanges[0].Low && aRanges[0].High) {
						oContent[oFilterMetaData.fieldName] = {
						         low: aRanges[0].Low, 					                                       
						         high: aRanges[0].High
						}; 
					} else if (aRanges[0].Low && !aRanges[0].High) {
						oContent[oFilterMetaData.fieldName] = {				                                      
						         low: aRanges[0].Low,
						         high: aRanges[0].Low
						};					
						
					} else if (!aRanges[0].Low && aRanges[0].High) {
						oContent[oFilterMetaData.fieldName] = {				                                      
						         low: aRanges[0].High,
						         high: aRanges[0].High
						};											
					} else {
							oContent[oFilterMetaData.fieldName] = {				                                   
									low: null,
									high: null
							};
					}
					
				} else {
					oContent[oFilterMetaData.fieldName] = {				                                      
							low:  aRanges[0].Low  === undefined ? null : aRanges[0].Low, 
							high: aRanges[0].High === undefined ? null : aRanges[0].High
					};
				}
				/* eslint-enable no-lonely-if */					



			} else if (oFilterMetaData.filterRestriction === ControlConfiguration.FILTERTYPE.multiple) {

				oContent[oFilterMetaData.fieldName] = {
						ranges: [],
						items: [],
						value: null
				};

				if (oControl && ((oControl instanceof MultiComboBox) || (oControl instanceof MultiInput))) {
					for (i = 0; i < aRanges.length; i++) {
						oObj = fConvertOption(aRanges[i].Option, aRanges[i].Low);

						if (oObj.op === sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ) {
							
							if (oFilterMetaData.type === "Edm.DateTime") {
								oContent[oFilterMetaData.fieldName].ranges.push({
									value1: oObj.v
								});								
							} else {
								oContent[oFilterMetaData.fieldName].items.push({
									key: oObj.v
								});
							}
						}
					}
				} else {
					for (i = 0; i < aRanges.length; i++) {
						oObj = fConvertOption(aRanges[i].Option, aRanges[i].Low);
						oItem = {
								"exclude": (aRanges[i].Sign === "E"),
								"operation": oObj.op,
								"keyField": oFilterMetaData.fieldName,
								"value1": oObj.v,
								"value2": aRanges[i].High
						};

						oContent[oFilterMetaData.fieldName].ranges.push(oItem);
					}
				}

			} else {

				oContent[oFilterMetaData.fieldName] = {
						ranges: [],
						items: [],
						value: null
				};
				for (i = 0; i < aRanges.length; i++) {
					oObj = fConvertOption(aRanges[i].Option, aRanges[i].Low);
					oItem = {
							"exclude": (aRanges[i].Sign === "E"),
							"operation": oObj.op,
							"keyField": oFilterMetaData.fieldName,
							"value1": oObj.v,
							"value2": aRanges[i].High
					};

					oContent[oFilterMetaData.fieldName].ranges.push(oItem);
				}
			}
			jQuery.sap.log.warning("potential reduced information for filter '" + oFilterMetaData.fieldName + "'");

		} else {
			jQuery.sap.log.warning("no Ranges-section found for filter '" + oFilterMetaData.fieldName + "'");
		}
	};

	VariantConverterFrom.prototype._addAccordingMetaData = function(oContent, oFilterMetaData, sValue) {

		var sHigh = oFilterMetaData.type === "Edm.DateTime" ? "" : sValue;

		var aRanges = [{ Sign: "I", Low: sValue, High: sHigh, Option: "EQ"}];
		
		this._addRangesAccordingMetaData(oContent, oFilterMetaData, aRanges);

	};


	return VariantConverterFrom;

}, /* bExport= */ true);