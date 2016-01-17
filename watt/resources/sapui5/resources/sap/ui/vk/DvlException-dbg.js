/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides an exception class for DVL errors.
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/Exception"
], function(jQuery, Exception) {
	"use strict";

	/**
	 * This exception is thrown, when an error occurs in DVL API.
	 *
	 * @class
	 *
	 * @param {sap.ve.dvl.DVLRESULT} code The error code.
	 * @param {string} message The error message.
	 * @private
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.base.Exception
	 * @alias sap.ui.vk.DvlException
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var DvlException = function(code, message) {
		this.name = "DvlException";
		this.code = code;
		this.message = message;
	};
	DvlException.prototype = jQuery.sap.newObject(Exception.prototype);

	return DvlException;
});
