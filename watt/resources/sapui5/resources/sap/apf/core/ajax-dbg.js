/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.ajax");

jQuery.sap.require("sap.apf.core.utils.checkForTimeout");

/**
 * @memberOf sap.apf.core
 * @description Wraps a jQuery (jQuery.ajax) request in order to handle a server time-out.
 * @param {object} oSettings Configuration of the jQuery.ajax request.
 * @returns {object} jqXHR
 */
sap.apf.core.ajax = function(oSettings) {
	var oAjaxSettings = jQuery.extend(true, {}, oSettings);
	var fnBeforeSend = oAjaxSettings.beforeSend;
	var fnSuccess = oAjaxSettings.success;
	var fnError = oAjaxSettings.error;

	oAjaxSettings.beforeSend = function(jqXHR, settings) {
		if (fnBeforeSend) {
			fnBeforeSend(jqXHR, settings);
		}
	};
	oAjaxSettings.success = function(data, textStatus, jqXHR) {
		var oMessage = sap.apf.core.utils.checkForTimeout(jqXHR);
		
		if(oMessage) {
			fnError(data, "error", undefined, oMessage);
		} else {
			fnSuccess(data, textStatus, jqXHR);
		}
		
	};
	oAjaxSettings.error = function(jqXHR, textStatus, errorThrown) {
		var oMessage = sap.apf.core.utils.checkForTimeout(jqXHR);
		if (oMessage) {
			fnError(jqXHR, textStatus, errorThrown, oMessage);
		} else {
			fnError(jqXHR, textStatus, errorThrown);
		}
		
	};
	return jQuery.ajax(oAjaxSettings);
};