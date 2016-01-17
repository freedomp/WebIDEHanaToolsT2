jQuery.sap.declare("cus.sd.sofulfil.monitor.utils.Commons");

cus.sd.sofulfil.monitor.utils.Commons = {
	// Resolving the proxy issue
	getServiceUrl : function(sServiceUrl) {
		var sUrl;
		if (window.location.hostname != "localhost") {
			sUrl = sServiceUrl;
		} else {
			var sOrigin = window.location.protocol + "//" + window.location.hostname
					+ (window.location.port ? ":" + window.location.port : "");
			if (!jQuery.sap.startsWith(sServiceUrl, sOrigin)) {
				sUrl = "proxy/" + sServiceUrl.replace("://", "/");
			} else {
				sUrl = sServiceUrl.substring(sOrigin.length);
			}
		}

		return sUrl;
	}
};

cus.sd.sofulfil.monitor.utils.Commons.Utils = {};

/**
 * FIXME:BUGinsap.m.Barcontrol.ThecontentRighthasawidtha0.
 */
cus.sd.sofulfil.monitor.utils.Commons.Utils.resetFooterContentRightWidth = function(oController) {
	var oPage = oController.getView().getContent()[0];
	if (oPage.getFooter()) {
		var rightBar = jQuery.sap.byId(oPage.getFooter().getId() + "-BarRight");
		var iRBWidth = rightBar.outerWidth(true);
		if (iRBWidth > 0) {
			oController.iRBWidth = iRBWidth;
		}
		if (rightBar.width() === 0 && oController.iRBWidth) {
			jQuery.sap.log.info('Update footer contentRight Width=' + oController.iRBWidth);
			rightBar.width(oController.iRBWidth);
		}
	}
};

/**
 * Get the encode location URL
 * 
 * @public
 * @return {string} encoded location url
 */
cus.sd.sofulfil.monitor.utils.Commons.Utils.getEncodedLocationUrl = function() {
	return encodeURI($(location).attr("href")).replace("&", "%26");
};

/**
 * Use this method to find a lowest or highest field value in an array. <code>null</code> values will
 * be ignored.
 * 
 * @public
 * @param {object}
 *          singleODataResponse
 * @param {boolean}
 *          bHighest = true to find highest value; false to find lowest value
 * @param {string}
 *          sFieldName which should be used for compare operation
 * @param {string}
 *          sGroupingCriteriaName field which should be used to find value within a certain grouping (can be
 *          <code>null</code>)
 * @param {string}
 *          sGroupingCriteriaValue value of the grouping field (e.g. sales order item id)
 * @return {object} lowest/highest value
 */
cus.sd.sofulfil.monitor.utils.Commons.Utils.findValueInArray = function(singleODataResponse, bHighest, sFieldName,
		sGroupingCriteriaName, sGroupingCriteriaValue) {
	var singleODataResponseLength = singleODataResponse.length;
	var idx = 0;
	var retVal = null;
	for (idx = 0; idx < singleODataResponseLength; idx++) {
		var singleEntry = singleODataResponse[idx];
		if (sGroupingCriteriaName !== null && !singleEntry.hasOwnProperty(sGroupingCriteriaName)) {
			throw Error("Grouping criteria + '" + sGroupingCriteriaName + "' doesn't exist in array");
		}
		if (!singleEntry.hasOwnProperty(sFieldName)) {
			throw Error("Value field + '" + sFieldName + "' doesn't exist in array");
		}
		if (singleEntry[sGroupingCriteriaName] === sGroupingCriteriaValue || sGroupingCriteriaName === null) {
			if (bHighest) {
				// Find Highest Value
				if (retVal < singleEntry[sFieldName]) {
					retVal = singleEntry[sFieldName];
				}
			} else {
				// Find Lowest Value
				if (  singleEntry[sFieldName] !== null &&
						 (retVal > singleEntry[sFieldName] || retVal === null) ) {
					retVal = singleEntry[sFieldName];
				}
			}
		}
	}
	return retVal;
};
