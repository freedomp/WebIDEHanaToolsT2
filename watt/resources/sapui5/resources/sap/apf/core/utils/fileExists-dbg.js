/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/*global jQuery, sap */

jQuery.sap.declare('sap.apf.core.utils.fileExists');
jQuery.sap.require('sap.apf.core.utils.checkForTimeout');
/**
 * @description Checks, whether a file with given fully specified path exists on server. Address must be valid URL.
 * @param {string} sUrl path to file on server 
 * @returns {boole}
 */
sap.apf.core.utils.fileExists = function(sUrl) {
	'use strict';
	var bFileExists = false;
	jQuery.ajax({
		url : sUrl,
		type : "HEAD",
		success : function(oData, sStatus, oJqXHR) {
			var oMessage = sap.apf.core.utils.checkForTimeout(oJqXHR);
			bFileExists = !oMessage;
		},
		error : function() {
			bFileExists = false;
		},
		async : false
	});
	return bFileExists;
};
