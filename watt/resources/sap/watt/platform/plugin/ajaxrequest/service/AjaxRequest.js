define(function() {
	"use strict";

	var sCsrfToken;

	var _resetCsrfToken = function() {
		sCsrfToken = undefined;
		return Q();
	};

	var _addNewCsrfToken = function(oRequest) {
		var mOptions = {
			type : "GET",
			contentType : oRequest.headers["Content-Type"],
			data : null,
			headers : {
				"Content-Type" : oRequest.headers["Content-Type"],
				"X-CSRF-Token": "Fetch"
			}
		};
		return Q.sap.ajax(oRequest.url, mOptions).spread(function(oData, oXHR) {
			sCsrfToken = oXHR.getResponseHeader("X-CSRF-Token");
			var oNewRequest = jQuery.extend(true, oRequest, {});
			oNewRequest.headers["X-CSRF-Token"] = sCsrfToken;
			return oNewRequest;
		});
	};
	
	var _returnError = function(action, jqXHR, textStatus, oDeferred) {
		var sResponseText = jqXHR.responseText;
		if ((sResponseText === undefined) || (sResponseText === "")) {
			sResponseText = jqXHR.statusText;
		} else if (sResponseText.indexOf("<html") === 0) { // check if the response text is a string that represents an html
			var el = $("<div></div>");
			el.html(sResponseText);
			var aElements = $("h1", el); // all the h1 elements
			if (aElements && aElements.length > 0) {
				sResponseText = aElements[0].innerHTML;
			}
		}
		
		oDeferred.reject({
			"action": action,
			"status": jqXHR.status,
			"info": sResponseText
		});
	};

	var _serviceCall = function(action, sUrl, sType, sData, username, password, resetBackEndSession, resetHeaders) {
		var oDeferred = Q.defer();
		var authorization = null;
		if (username && password) {
			authorization = "Basic " + Base64.encode(username + ":" + password);
		}

		var reqHeaders = {
			'Accept': '*/*',
			'Content-Type': 'application/json',
			'Authorization': authorization,
			'Suppress-Authentication-Popup': true,
			'X-CSRF-Token': sCsrfToken ? sCsrfToken : "Fetch"
		};

		if (resetHeaders) {
			reqHeaders = {
				'Content-Type': 'application/json',
				'X-CSRF-Token': sCsrfToken ? sCsrfToken : "Fetch"
			};
		}

		// reset the credentials in the session
		if (resetBackEndSession === true) {
			reqHeaders['X-ResetBackEndSession'] = "dummyValue";
			reqHeaders['X-CSRF-Token'] = "Fetch";
			sCsrfToken = undefined;
		}

		var ajaxRequest = {
			type: sType,
			url: sUrl,
			data: JSON.stringify(sData),
			headers: reqHeaders,
			cache: false // In IE we need to force avoiding cache
		};

		var oXHR;
		var that = this;
		that.request = ajaxRequest;
		Q(oXHR = $.ajax(that.request)).then(function(response) {
			console.log("success:" + JSON.stringify(response));
			if (!sCsrfToken) {
				sCsrfToken = oXHR.getResponseHeader("X-CSRF-Token");
			}
			oDeferred.resolve(response);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status === 403 && jqXHR.responseText && jqXHR.responseText.indexOf("CSRF") >= 0) {
				_addNewCsrfToken(that.request).then(function(oAjaxRequest) {
					Q(oXHR = $.ajax(oAjaxRequest)).then(function(oResponse) {
						oDeferred.resolve(oResponse);
					}).fail(function(oRequest, sTextStatus, oErrorThrown) {
						_returnError(action, oRequest, sTextStatus, oErrorThrown, oDeferred);
					}).done();
				});
			} else {
				_returnError(action, jqXHR, textStatus, oDeferred);
			}
		}).done();
		return oDeferred.promise;
	};

	/**
	 *
	 *  Base64 encode / decode
	 *  http://www.webtoolkit.info/
	 *  This Base64 function is licensed under CC BY 2.0 UK
	 *  http://creativecommons.org/licenses/by/2.0/uk/legalcode
	 *
	 **/

	var Base64 = {
		// private property
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode: function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;

			input = this._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

			}

			return output;
		},

		// private method for UTF-8 encoding
		_utf8_encode: function(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}

			return utftext;
		}
	};
	
	/**
	 * returns true if the CSRF token  is valid. The meaning of valid here is that
	 * it's not falsy. It may contain a string of the CSRF token that may be correct
	 * for a specific service call on HCP and not for another one. If this method 
	 * returns true it means that the CSRF token is valid for the last HCP sercive
	 * that was called.
	 * This means if the last CSRF token was fetched for a backend ABAP system for 
	 * example and then the method will return true. This doesn't mean that post calls 
	 * for Orion will work since the CSRF token is valid for the ABAP and not Orion
	 */ 
    var _isCSRFTokenValidForLastService = function() {
        return sCsrfToken ? true : false;
    };

	return {
		serviceCall: _serviceCall,
		resetCsrfToken: _resetCsrfToken,
		isCSRFTokenValidForLastService: _isCSRFTokenValidForLastService
	};
});