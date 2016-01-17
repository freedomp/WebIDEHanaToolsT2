/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */

sap.ui.define([
	"sap/ui/fl/Utils", "jquery.sap.global"
], function(Utils, $) {
	"use strict";

	/**
	 * Base class for all change handler subclasses which provides some reuse methods
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.Base
	 * @author SAP SE
	 * @version 1.32.7
	 * @experimental Since 1.27.0
	 *
	 */
	var Base = function() {
	};

	/**
	 * @param {sap.ui.core.Control} oControl - the control for which the properties shall be returned
	 * @param {String} sName - name of property
	 * @returns {Object} property object
	 * @private
	 */
	Base.prototype._getProperty = function(oControl, sName) {
		if (oControl) {
			if (oControl.getMetadata) {
				var oMetadata = oControl.getMetadata();
				var oProperties = oMetadata.getProperties();
				if (oProperties) {
					var oProperty = oProperties[sName];
					if (oProperty) {
						return oProperty;
					}
				}
			}
		}
	};

	/**
	 * Changes a property of the control 
	 *
	 * @param {sap.ui.core.Control} oControl - the control for which the changes should be fetched
	 * @param {string} sName - property name
	 * @param {object} oValue - new value of the property
	 *
	 * @public
	 */
	Base.prototype.changeProperty = function(oControl, sName, oValue) {
		var oProperty = this._getProperty(oControl, sName);
		if (oProperty) {
			oControl.setProperty(sName, oValue);
		}
	};

	/**
	 * Sets a property of the control back to its default value
	 *
	 * @param {sap.ui.core.Control} oControl - the control for which the changes should be fetched
	 * @param {string} sName - property name
	 *
	 * @public
	 */
	Base.prototype.clearProperty = function(oControl, sName) {
		var oProperty = this._getProperty(oControl, sName);
		if (oProperty) {
			oControl.setProperty(sName, oProperty.defaultValue);
		}
	};

	/**
	 * Adds an additional item of the aggregation or changes it in case it is not a multiple one
	 *
	 * @param {sap.ui.core.Control} oControl - the control for which the changes should be fetched
	 * @param {string} sName - aggregation name
	 * @param {string} oObject - aggregated object to be set
	 * @param {integer} iIndex <optional> - index to which it should be added/inserted
	 *
	 * @public
	 */
	Base.prototype.addAggregation = function(oControl, sName, oObject, iIndex) {
		if (oControl) {
			if (oControl.getMetadata) {
				var oMetadata = oControl.getMetadata();
				var oAggregations = oMetadata.getAllAggregations();
				if (oAggregations) {
					var oAggregation = oAggregations[sName];
					if (oAggregation) {
						//						if(oAggregation.multiple === false) {
						//							oControl.destroyAggregation(sName);
						//						}
						if (oAggregation.multiple) {
							var iInsertIndex = iIndex || oAggregations.length || 0;
							oControl.insertAggregation(sName, oObject, iInsertIndex);
						} else {
							oControl[oAggregation._sMutator](oObject);
						}
					}
				}
			}
		}
	};

	/**
	 * Sets a text in a change.
	 *
	 * @param {object} oChange - change object
	 * @param {string} sKey - text key
	 * @param {string} sText - text value
	 * @param {string} sType - translation text type e.g. XBUT, XTIT, XTOL, XFLD
	 *
	 * @public
	 */
	Base.prototype.setTextInChange = function(oChange, sKey, sText, sType) {
		if (!oChange.texts) {
			oChange.texts = {};
		}
		if (!oChange.texts[sKey]) {
			oChange.texts[sKey] = {};
		}
		oChange.texts[sKey].value = sText;
		oChange.texts[sKey].type = sType;
	};

	return Base;
}, /* bExport= */true);
