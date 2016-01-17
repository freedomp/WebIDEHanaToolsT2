/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare('sap.apf.ui.utils.facetFilterListConverter');
/**
 * @class Facet filter list converter
 * @name sap.apf.ui.utils.FacetFilterListConverter
 * @description Converter for values to facet filter list data
 * @returns {sap.apf.ui.utils.FacetFilterListConverter}
 */
sap.apf.ui.utils.FacetFilterListConverter = function() {
	"use strict";
	/**
	 * @public
	 * @function
	 * @name sap.apf.ui.utils.FacetFilterListConverter#getFFListDataFromFilterValues
	 * @param {Array} Filter values 
	 * Example :
	 * [ {
			"StartDate" : "20000101",
			"formattedValue" : "1/1/2000"
		}, {
			"StartDate" : "20000201",
			"formattedValue" : "2/1/2000"
		} ]
	 * {String} Facet filter property name - Example: "StartDate"
	 * @description Gets filter values and converts the values in the form understandable by facet filter list control.
	 * @returns {Array} facet filter list data
	 * Example:
	 * [ {
			"key" : "20100101",
			"text" : "1/1/2010",
			"selected" : false
		}, {
			"key" : "20100201",
			"text" : "2/1/2010",
			"selected" : false
		} ]
	 * */
	this.getFFListDataFromFilterValues = function(aFilterValues, sPropertyName) {
		var aModifiedFilterValues = [];
		aFilterValues.forEach(function(oFilterValue) {
			var oFFListItemData = {};
			oFFListItemData.key = oFilterValue[sPropertyName];
			oFFListItemData.text = oFilterValue.formattedValue;
			oFFListItemData.selected = false;
			aModifiedFilterValues.push(oFFListItemData);
		});
		return aModifiedFilterValues;
	};
};