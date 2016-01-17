define(function () {
    "use strict";
    var Request = {};
    var CSRF_TOKEN_HEADER_NAME = "X-Csrf-Token";
    var sCsrfToken = undefined;
    var oCsrfQueue = new Q.sap.Queue();
    var oFetchCsrfTokenRequestPromise;

    // Add the last known good csrf token to the headers of a request (which is not GET).
    // If there is no known csrf token (or we are forced to send a different token),
    // send a GET request to fetch a new csrf token.
    // Note: all non-GET requests must be synchronized so we don't send more
    // than 1 csrf-fetch request at the same time.
    function addCsrfToken(method, headers, force) {
        var oDeferred = Q.defer();
        if (method === "GET" && !force) {
            oDeferred.resolve();
        } else if (sCsrfToken && !force) {
            headers[CSRF_TOKEN_HEADER_NAME] = sCsrfToken;
            oDeferred.resolve();
        } else {
            if (!oFetchCsrfTokenRequestPromise) {
                var options = {
                    type: "GET",
                    headers : {
                    }
                };
                options.headers[CSRF_TOKEN_HEADER_NAME] = "Fetch";
                oFetchCsrfTokenRequestPromise = Q.sap.ajax(sap.watt.getEnv("che_server"), options).spread(function (oData, oXHR) {
                    sCsrfToken = oXHR.getResponseHeader(CSRF_TOKEN_HEADER_NAME);
                    oFetchCsrfTokenRequestPromise = undefined;
                });
            }
            oFetchCsrfTokenRequestPromise.then(function () {
                headers[CSRF_TOKEN_HEADER_NAME] = sCsrfToken;
                oDeferred.resolve();
            }, function (oError) {
                oDeferred.reject(oError);
            });
        }
        return oDeferred.promise;
    }

    // Add csrf token to the request headers. The token must be different from the one already in the headers.
    function addNewCsrfToken(method, headers) {
        var oldToken = headers[CSRF_TOKEN_HEADER_NAME];
        // If the old and current token are the same, force getting a new token
        return addCsrfToken(method, headers, (oldToken && sCsrfToken && oldToken === sCsrfToken));
    }

    Request.DEFAULT_CONTENT_TYPE = "application/json";

    Request.getContentType = function (sMethod) {
        return sMethod === "GET" ? undefined : this.DEFAULT_CONTENT_TYPE;
    };

    Request.getData = function (sContentType, oData) {
        return sContentType === Request.DEFAULT_CONTENT_TYPE ? JSON.stringify(oData) : oData;
    };

    Request.getUri = function (sUri, oData) {
        if (sUri && (typeof sUri === "string") && sUri.indexOf(":") !== -1) {
            for (var sParam in oData) {
                var regExp = new RegExp("(:" + sParam + ")", "gi");
                if (regExp.test(sUri)) {
                    sUri = sUri.replace(regExp, encodeURIComponent(oData[sParam]));
                    delete oData[sParam];
                }
            }
        }
        return sUri;
    };

    Request.getDefaultHeader = function () {
        var headers = {
            headers: {
                //"Orion-Version" : "1.0",
                //"X-CSRF-Token" : sCsrfToken ? sCsrfToken : "Fetch"
            }
        };
        return headers;
    };

    Request.getDefaultOptions = function (sMethod, sContentType, oData) {
        return jQuery.extend(true, this.getDefaultHeader(), {
            type: sMethod,
            contentType: sContentType,
            data: this.getData(sContentType, oData),
            headers: {
                "Content-Type": sContentType
            }
        });
    };

    Request.resolveServerUrl = function (sUrl) {
        
        // helper function
            function replaceAll(str, find, replace) {
                function escapeRegExp(str) {
                    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                }
                return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
            }
            
        // we have to remove the leading slash that the URI.js can resolve the URL properly!
        sUrl = jQuery.sap.startsWith(sUrl, "/") ? sUrl.substr(1) : sUrl;
        var oURI = URI(sUrl).absoluteTo(sap.watt.getEnv("che_server"));
        // workaround to enable using '+' sign in outbound requests (such as file/folder names in the form of [something]+[something])
        return replaceAll(oURI.toString(),'+',encodeURIComponent('+'));
    };

    Request.send = function (sUri, sMethod, mOptions, oData) {
        var that = this;
        sMethod = sMethod || "GET";
        sMethod = sMethod.toUpperCase();
        mOptions = mOptions || {};
        
        //Fix to BCP bug: 1580186507 When opening js file the Javascript code in it runs
        //we "override" the default value of options.converter before sending the request, in order to prevent jQuery to use the default one (which causes evaluation/run of js files)
        mOptions.converters = mOptions.convertes || {};
    	mOptions.converters['text script'] = function (text) {
	        return text;
	    };

		//TODO: Is getUri() necessary?
        if (mOptions.headers && mOptions.headers["Content-Type"] === "application/json") {
            sUri = this.getUri(sUri, oData);
        }

        sUri = this.resolveServerUrl(sUri);

        if (mOptions.success || mOptions.error) {
            throw new Error("Success and error handler are not allowed in mOptions");
        }

        var sContentType = (mOptions.headers && mOptions.headers["Content-Type"]) ? mOptions.headers["Content-Type"] : this.getContentType(sMethod);
        mOptions = jQuery.extend(true, this.getDefaultOptions(sMethod, sContentType, oData), mOptions);

        /*
         * Workaround:
         * 
         * jQuery does not support HTML5 XMLHttpRequest Level 2 binary data type requests.
         * Link to BUG in jQuery bug tracker: http://bugs.jquery.com/ticket/11461
         * 
         * This is a workaround to enable binary file requests to be sent correctly
         * by modifying XMLHttpRequest itself.
         * 
         */
        // =======-workaround start-=======
        if (mOptions['blob']) {
             var oDeferred = Q.defer();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', sUri, true);
            xhr.responseType = 'blob';

            xhr.onload = function (e) {
                if (this.status >= 200 && this.status < 300) {
                    // get binary data as a response
                    var blob = this.response;
                    oDeferred.resolve(blob);
                }else{
                    oDeferred.reject(e); // how to return error here
                }
            };

            xhr.send();
            return oDeferred.promise;
        }
        // =======-workaround end-=======
        return addCsrfToken(sMethod, mOptions.headers).then(function () {
            return Q.sap.ajax(sUri, mOptions).spread(function (oData, oXHR) {
                that._checkForSessionLoss(oXHR);
                return that._fetchDateIfNeeded(oData, oXHR, mOptions);
            }).fail(function (oError) {
                if (oError.status == "403") { //csrf token might not be valid anymore -> get a new token and try once again
                    return addNewCsrfToken(sMethod, mOptions.headers).then(function () {
                        return Q.sap.ajax(sUri, mOptions).spread(function (oData, oXHR) {
                            that._checkForSessionLoss(oXHR);
                            return that._fetchDateIfNeeded(oData, oXHR, mOptions);
                        });
                    });
                } else if (oError.status == "200") { // TODO: this is a workaround - normal 200 OK response is interpreted due to parse error as an error so we extract
                    return oError.responseText;      //        responseText and return it
                } else {
                    throw oError;
                }
            });
        });
    };

    Request.createXMLHttpRequest = function (sMethod, sUrl) {
        var oRequest = new XMLHttpRequest();
        var oURI = this.resolveServerUrl(sUrl);
        oRequest.open(sMethod, oURI.toString(), true);
        var mHeader = this.getDefaultHeader();
        return addCsrfToken(sMethod, mHeader.headers).then(function () {
            for (var header in mHeader.headers) {
                oRequest.setRequestHeader(header, mHeader.headers[header]);
            }
            return oRequest;
        });
    };

    Request.sendXMLHttpRequest = function (oRequest, oContent) {
        var oDeferred = Q.defer();
        var that = this;

        // - actual sinon.js version in sapui5 is not capable of onload.
        oRequest.onreadystatechange = function () {
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

    Request._getErrorFromOrionErrorResponse = function (sErrorResponse) {
        var oError = null;
        try {
            var oErrorJson = JSON.parse(sErrorResponse);
            oError = new Error(oErrorJson.Message);
            oError.status = oErrorJson.HttpCode;
        } catch (e) { //fallback
            oError = new Error(sErrorResponse);
        }
        return oError;
    };

    Request._checkForSessionLoss = function (oXHR) {
        // raise exception in case of session lost
        if (oXHR.getResponseHeader("com.sap.cloud.security.login") == "login-request") {
            throw new Error("SESSION_GONE");
        }
    };
    
    Request._fetchDateIfNeeded = function (oData, oXHR, mOptions) {
    	if ( mOptions["Fetch-Date"] ) {
	    	var oDataWithDate = oData || {};
	        var sDate = oXHR.getResponseHeader("Date");
	        var oDate = new Date(sDate);
	        oDataWithDate.LocalTimeStamp = oDate.getTime(); 
	        return oDataWithDate;
    	} 
    	return oData;
    };

    return Request;

});
