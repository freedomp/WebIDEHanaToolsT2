/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

/*global OData */

jQuery.sap.declare("sap.apf.core.odataRequest");
jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require("sap.apf.core.utils.checkForTimeout");

/**
 * @memberOf sap.apf.core
 * @description Wraps a OData request in order to handle a server time-out. It uses a POST $batch operation wrapping the GET.
 * @param {sap.apf.core.MessageHandler} oMessageHandler for error handling
 * @param {object} oRequest An Object that represents the HTTP request to be sent.
 * @param {function} fnSuccess A callback function called after the response was successfully received and parsed.
 * @param {function} fnError A callback function that is executed if the request fails. In case of time out the error object has property messageObject, that holds sap.apf.core.MessageObject.
 * @param {object} oBatchHandler A handler object for the request data.
 */
sap.apf.core.odataRequestWrapper = function(oMessageHandler, oRequest, fnSuccess, fnError, oBatchHandler) {
	function success(data, response) {
		var oMessage = sap.apf.core.utils.checkForTimeout(response);
		var oError = {};
		
		if(oMessage) {
			oError.messageObject = oMessage;
			fnError(oError);
		} else {
			fnSuccess(data, response);
		}
	}
	function error(oError) {
		var oMessage = sap.apf.core.utils.checkForTimeout(oError);

		if (oMessage) {
			oError.messageObject = oMessage;
		}
		fnError(oError);
	}
	OData.request(oRequest, success, error, oBatchHandler);
};
