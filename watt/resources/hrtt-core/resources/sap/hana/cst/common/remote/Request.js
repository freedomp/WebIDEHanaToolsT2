/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../util/Helper"], function() {

    "use strict";

    var TIME_OUT = 20 * 1000;

    var Request = {
        _csrfToken: null
    };

    Request.DEFAULT_CONTENT_TYPE = "application/json";

    Request.init = function() {
        this._initCsrfToken();
    };

    Request.getContentType = function(sMethod) {
        return sMethod === "GET" ? undefined : this.DEFAULT_CONTENT_TYPE;
    };

    Request.getData = function(sContentType, oData) {
        return sContentType === Request.DEFAULT_CONTENT_TYPE ? JSON.stringify(oData) : oData;
    };

    Request.getUri = function(sUri, oData) {
        if (sUri.indexOf(":") !== -1) {
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

    Request.getDefaultHeader = function() {
        var headers = {
            headers: {
                "Orion-Version": "1.0"
            }
        };
        return headers;
    };

    Request.getDefaultOptions = function(sMethod, sContentType, oData) {
        return jQuery.extend(true, this.getDefaultHeader(), {
            // timeout: TIME_OUT, 
            type: sMethod,
            contentType: sContentType,
            data: this.getData(sContentType, oData),
            headers: {
                "Content-Type": sContentType
            }
        });
    };

    Request.send = function(sUri, sMethod, mOptions, oData) {
        var that = this;
        sMethod = sMethod || "GET";
        sMethod = sMethod.toUpperCase();
        mOptions = mOptions || {};
        sUri = this.getUri(sUri, oData);

        if (mOptions.success || mOptions.error) {
            throw new Error("Success and error handler are not allowed in mOptions");
        }

        var sContentType = (mOptions.headers && mOptions.headers["Content-Type"]) ? 
                            mOptions.headers["Content-Type"] : this.getContentType(sMethod);
        mOptions = jQuery.extend(true, this.getDefaultOptions(sMethod, sContentType, oData), mOptions);

        
        mOptions.error = function(oXHR, textStatus, errorThrown) {
            if (textStatus === "timeout") {
                sap.hana.cst.hideSpinner();
                that._csrfToken = null;
            }
            // Turn the XHR into an exception with a message
            var oError = new Error("Request failed: " + oXHR.statusText + " URI: " + sUri);
            oError.status = oXHR.status;
            oError.statusText = oXHR.statusText;
            oError.responseText = oXHR.responseText;
            try {
                var oResponse = JSON.parse(oXHR.responseText);
                oError.message = oResponse.Message;
            } catch (loError) {
                //do nothing
            }
            oError.responseJSON = oXHR.responseJSON;
            // do not throw error object
            // throw oError;
        };
        

        if (mOptions['headers']) {
            mOptions['headers']['x-sap-dont-debug'] = "1";
        } else {
            mOptions.headers = {};
            mOptions['headers']['x-sap-dont-debug'] = "1";
        }
        if (sMethod === "POST" || sMethod === "PUT" || sMethod === "DELETE") {
            
            // if (!that._csrfToken) {
            //     that._initCsrfToken();
            // }  

            that._initCsrfToken();          

            // $.ajaxSetup({
            //     async: false,
            //     beforeSend: function(xhr, settings) {
            //         if (!that._csrfSafeMethod(settings.type) && that._sameOrigin(settings.url)) {
            //             xhr.setRequestHeader("X-CSRF-Token", that._csrfToken);
            //         }
            //     }
            // });

            // mOptions.beforeSend = function(jqXHR, settings) {
            //     that._csrfToken = that._getCsrfToken();
            //     jqXHR.setRequestHeader('X-CSRF-Token', that._csrfToken);
            // };
            // mOptions.async = false;

            if (mOptions['headers']) {
                mOptions['headers']['X-CSRF-Token'] = that._csrfToken;
            } else {
                mOptions.headers = {};
                mOptions['headers']['X-CSRF-Token'] = that._csrfToken;
            }
        }
        return Q(jQuery.ajax(sUri, mOptions));
    };

    Request._initCsrfToken = function() {
        return this._getCsrfToken();
    };

    Request._getCsrfToken = function() {
        var that = this;
        $.ajax({
            async: false,
            type: "GET",
            url: "/",
            cache: false,
            headers: {
                "X-CSRF-Token": "Fetch"
            },
            success: function(data, status, jqXHR) {
                that._csrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
            }
        });
        return that._csrfToken;
    };

    Request._csrfSafeMethod = function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };

    Request._sameOrigin = function(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') || (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e
            // relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    };

    return Request;
});