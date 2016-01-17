/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.ui.utils.facetFilterValueFormatter');
jQuery.sap.require("sap.apf.ui.utils.formatter");
/**
 * @class Facet filter list value formatter
 * @name sap.apf.ui.utils.FacetFilterValueFormatter
 * @description Formatter for facet filter list values
 * @returns {sap.apf.ui.utils.FacetFilterValueFormatter}
 */
sap.apf.ui.utils.FacetFilterValueFormatter = function() {
	"use strict";
	/**
	 * @public
	 * @function
	 * @name sap.apf.ui.utils.FacetFilterValueFormatter#getFormattedFFData
	 * @param {object} 
	 * 		  oFormatterArgs : {
	 * 		  		oCoreApi : Core instance,
	 * 				oUiApi : Ui instance,
	 * 				oPropertyMetadata : Property metadata for the particular filter property
	 * 				Example: In case there was no text associated with the filter property
	 * 				{
						"name" : "StartDate",
						"dataType" : {
							"type" : "Edm.String",
							"maxLength" : "8"
						},
						"label" : "Start Date",
						"aggregation-role" : "dimension",
						"isCalendarDate" : "true"
					}
	 * 				Example: In case of text associated with filter property
	 * 				{
						"name" : "CompanyCode",
						"dataType" : {
							"type" : "Edm.String",
							"maxLength" : "4"
						},
						"label" : "Company Code",
						"aggregation-role" : "dimension",
						"text" : "CompanyCodeName"
					}
	 * 				sSelectProperty : Name of the filter property Eg: "StartDate",
	 * 				aFilterValues : Filter values for the filter control 
	 * 				Example: In case there was no text associated with the filter property
	 * 				[ {
						"StartDate" : "20000101"
					}, {
						"StartDate" : "20000201"
					} ]
					Example: In case of text associated with filter property
					[ {
						"CompanyCode" : "0001",
						"CompanyCodeName" : "SAP AG"
					}, {
						"CompanyCode" : "0002",
						"CompanyCodeName" : "SAP SE"
					} ]
	 * @description Formats the filter values based on the filter property
	 * @returns {Array} Formatted filter values 
	 * 		Example: In case there was no text associated with the filter property
	 * 		[ {
				"StartDate" : "20000101",
				"formattedValue" : "1/1/2000"
			}, {
				"StartDate" : "20000201",
				"formattedValue" : "2/1/2000"
			} ]
	 * 		Example: In case of text associated with filter property
	 * 		[ {
				"CompanyCode" : "0001",
				"CompanyCodeName" : "SAP AG",
				"formattedValue" : "0001 - SAP AG"
			}, {
				"CompanyCode" : "0002",
				"CompanyCodeName" : "SAP SE",
				"formattedValue" : "0002 - SAP SE"
			} ]
	 * */
	this.getFormattedFFData = function(oFormatterArgs) {
		var sFormattedKeyPropertyValue, sTextValue, sFormattedTextPropertyValue;
		var oPropertyMetadata = oFormatterArgs.oPropertyMetadata;
		var sSelectProperty = oFormatterArgs.sSelectProperty;
		var aFilterValues = oFormatterArgs.aFilterValues;
		var oFormatter = new sap.apf.ui.utils.formatter({
			getEventCallback : oFormatterArgs.oUiApi.getEventCallback.bind(oFormatterArgs.oUiApi),
			getTextNotHtmlEncoded : oFormatterArgs.oCoreApi.getTextNotHtmlEncoded
		}, oPropertyMetadata, aFilterValues);
		//Checks if the property has a text associated with it
		var sTextProperty = oPropertyMetadata.text;
		aFilterValues.forEach(function(oFilterValue) {
			sFormattedKeyPropertyValue = oFormatter.getFormattedValue(sSelectProperty, oFilterValue[sSelectProperty]);
			sTextValue = sFormattedKeyPropertyValue;
			if (sTextProperty) {//If text is available formatting is done for the text property and appended to the formatted key value
				sFormattedTextPropertyValue = oFormatter.getFormattedValue(sTextProperty, oFilterValue[sTextProperty]);
				if (sFormattedTextPropertyValue) { //override the value if the formatted text is not undefined
					sTextValue = sFormattedKeyPropertyValue + " - " + sFormattedTextPropertyValue;
				}
			}
			oFilterValue.formattedValue = sTextValue;
		});
		return aFilterValues;
	};
};