define(function() {
	"use strict";
	var Request = {};
	var sCsrfToken = undefined;
	var oCsrfQueue = new Q.sap.Queue();
	
	Request.DEFAULT_CONTENT_TYPE = "application/json";
		
	Request.getContentType = function(sMethod) {
		return sMethod === "GET" ? undefined : this.DEFAULT_CONTENT_TYPE;
	};

	Request.getData = function(sContentType, oData) {
		return sContentType === Request.DEFAULT_CONTENT_TYPE ? JSON.stringify(oData) : oData;
	};

	Request.getUri = function(sUri, oData) {
		if (sUri && sUri.indexOf(":") !== -1) {
			for ( var sParam in oData) {
				var regExp = new RegExp("(:" + sParam + ")", "gi");
				if (regExp.test(sUri)) {
					sUri = sUri.replace(regExp, encodeURIComponent(oData[sParam]));
					delete oData[sParam];
				}
			}
		}
		return sUri;
	};

	Request.getDefaultHeader = function() {
		var headers = {
			headers : {
				"Orion-Version" : "1.0",
				"X-CSRF-Token" : sCsrfToken ? sCsrfToken : "Fetch"
			}
		};
		return headers;
	};

	Request.getDefaultOptions = function(sMethod, sContentType, oData) {
		return jQuery.extend(true, this.getDefaultHeader(), {
			type : sMethod,
			contentType : sContentType,
			data : this.getData(sContentType, oData),
			headers : {
				"Content-Type" : sContentType
			}
		});
	};

	Request.resolveServerUrl = function(sUrl) {
		// we have to remove the leading slash that the URI.js can resolve the URL properly!
		sUrl = jQuery.sap.startsWith(sUrl, "/") ? sUrl.substr(1) : sUrl;
		var oURI = URI(sUrl).absoluteTo(sap.watt.getEnv("orion_server"));
		return oURI.toString();
	};

	Request.send = function(sUri, sMethod, mOptions, oData) {
		var that = this;
		sMethod = sMethod || "GET";
		sMethod = sMethod.toUpperCase();
		mOptions = mOptions || {};

		sUri = this.resolveServerUrl(this.getUri(sUri, oData));

		if (mOptions.success || mOptions.error) {
			throw new Error("Success and error handler are not allowed in mOptions");
		}

		var sContentType = (mOptions.headers && mOptions.headers["Content-Type"]) ? mOptions.headers["Content-Type"] : this
				.getContentType(sMethod);
		mOptions = jQuery.extend(true, this.getDefaultOptions(sMethod, sContentType, oData), mOptions);

		return Q.sap.ajax(sUri, mOptions).spread(function(oData, oXHR) {
			if (!sCsrfToken) {
				sCsrfToken = oXHR.getResponseHeader("X-CSRF-Token");
			}
			that._checkForSessionLoss(oXHR);
			return oData;
		}).fail(function(oError) {
			return that._handleCsrfFail(oError, sUri, that, mOptions, oData);
		});
	};
	
	Request.sendMultipart = function(sUri, sMethod, mOptions, oData) {
		var that = this;
		sMethod = sMethod || "GET";
		sMethod = sMethod.toUpperCase();
		mOptions = mOptions || {};

		sUri = this.resolveServerUrl(this.getUri(sUri, oData));

		if (mOptions.success || mOptions.error) {
			throw new Error("Success and error handler are not allowed in mOptions");
		}

		var sContentType = (mOptions.headers && mOptions.headers["Content-Type"]) ? mOptions.headers["Content-Type"] : this
				.getContentType(sMethod);
		mOptions = jQuery.extend(true, this.getDefaultOptions(sMethod, sContentType, oData), mOptions);

		return Q.sap.ajax(sUri, mOptions).spread(function(oData, oXHR) {
			if (!sCsrfToken) {
				sCsrfToken = oXHR.getResponseHeader("X-CSRF-Token");
			}
			that._checkForSessionLoss(oXHR);
			//Get multipart boundary
			var sContentType = oXHR.getResponseHeader("Content-Type");
			if (sContentType.indexOf("multipart/related") === -1 ){
				throw new Error("Not a valid multipart response");
			}
			
			var sBoundary = "--" + sContentType.substring((sContentType.indexOf("boundary") + 10 ),sContentType.length - 1) ;
			oData = oData.trim();
			var aResponseParts = oData.split(sBoundary);
			aResponseParts.splice(0,1);
			aResponseParts.splice(aResponseParts.length - 1,1);
			aResponseParts[1] = aResponseParts[1].replace(/^[\r\n]+[\r\n]+$/g, "").trim();
	
			return aResponseParts;
			
		}).fail(function(oError) {
			return that._handleCsrfFail(oError, sUri, that, mOptions, oData);
		});
	};
	
	Request._handleCsrfFail = function(oError, sUri, that, mOptions, oData){
		if (oError.status === 403) { //csrf token might not be valid anymore -> get a new token and try once again
			return oCsrfQueue.next(function() {
				sCsrfToken = undefined;
				//get new csrf token
				return Q.sap.ajax(sUri, that.getDefaultOptions("GET")).spread(function(oData, oXHR) {
					if (!sCsrfToken) {
						sCsrfToken = oXHR.getResponseHeader("X-CSRF-Token");
						mOptions.headers["X-CSRF-Token"] = sCsrfToken;
					}
					return Q.sap.ajax(sUri, mOptions).spread(function(oData, oXHR) {
						that._checkForSessionLoss(oXHR);
						return oData;
					});
				}).fail(function(oErrorEx){
					//The "Bad Request" error when the server is not supported by "GET" method
					throw oErrorEx.status === 400 ? oError : oErrorEx;
				});
			});
		} else {
			throw oError;
		}
	};

	Request.createXMLHttpRequest = function(sMethod, sUrl) {
		var oRequest = new XMLHttpRequest();
		var oURI = this.resolveServerUrl(sUrl);
		oRequest.open(sMethod, oURI.toString(), true);
		var mHeader = this.getDefaultHeader();
		for ( var header in mHeader.headers) {
			oRequest.setRequestHeader(header, mHeader.headers[header]);
		}
		return oRequest;
	};

	Request.sendXMLHttpRequest = function(oRequest, oContent) {
		var oDeferred = Q.defer();
		var that = this;
		
		// - actual sinon.js version in sapui5 is not capable of onload.
		oRequest.onreadystatechange = function() {
			if (this.readyState !== 4) {
				return;
			}

			if (this.status < 300 && this.status >= 200) {
				oDeferred.resolve(this.response);
			} else {
				oDeferred.reject(that._getErrorFromOrionErrorResponse(this.response));
			}
		};

		oRequest.send(oContent);
		return oDeferred.promise;
	};

	Request._getErrorFromOrionErrorResponse = function(sErrorResponse) {
		var oError = null;
		try {
			if (sErrorResponse.indexOf("<html") === 0){
				var el = $("<div></div>");
				el.html(sErrorResponse);
				var aElements = $("h1", el); // all the h1 elements
				if (aElements && aElements.length > 0) {
					oError = new Error(aElements[0].innerHTML);
				}
			}
			else{
				var oErrorJson = JSON.parse(sErrorResponse);
				oError = new Error(oErrorJson.Message);
				oError.status = oErrorJson.HttpCode;
			}
			
		} catch (e) { //fallback
			oError = new Error(sErrorResponse);
		}
		return oError;
	};

	Request._checkForSessionLoss = function(oXHR) {
		// raise exception in case of session lost
		if (oXHR.getResponseHeader("com.sap.cloud.security.login") == "login-request") {
			throw new Error("SESSION_GONE");
		}
	};

	return Request;

});