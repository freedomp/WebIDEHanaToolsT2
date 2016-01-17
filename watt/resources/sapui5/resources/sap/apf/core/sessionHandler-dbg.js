/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.apf.core.sessionHandler");
jQuery.sap.require("sap.apf.core.ajax");
jQuery.sap.require("sap.apf.utils.filter");
jQuery.sap.require("sap.apf.core.constants");
/**
 * @class Handles the session of an APF based application. e.g. the XSRF token handling
 */
/*global setTimeout*/
sap.apf.core.SessionHandler = function(oInject) {
	// private vars
	var that = this;
	var sXsrfToken = "";
	var sServiceRootPath = "";
	var oHashTableXsrfToken = new sap.apf.utils.Hashtable(oInject.messageHandler);
	var nFetchTryCounter = 0;
	var sLogicalSystem = "";
	var oCoreApi = oInject.coreApi;
	var oMessageHandler = oInject.messageHandler;
	var oContextFilter = new sap.apf.utils.Filter(oMessageHandler);
	var sSapClient = "";
	// public vars
	/**
	 * @description Returns the type
	 * @returns {String}
	 */
	this.type = "sessionHandler";
	// public function
	/**
	 * @see sap.apf.core.ajax
	 */
	this.ajax = function(oSettings){
		sap.apf.core.ajax(oSettings);
	};
	/**
	 * @see sap.apf.core.odataRequestWrapper
	 */
	this.odata = function(oRequest, fnOnSuccess, fnError){
		oCoreApi.odataRequest(oRequest, fnOnSuccess, fnError);
	};
	
	/**
	 * @description Returns the XSRF token as string for a given OData service root path
	 * @param {String} serviceRootPath OData service root path
	 * @returns {String}
	 */
	this.getXsrfToken = function(serviceRootPath) {
		sServiceRootPath = serviceRootPath;
		if(oHashTableXsrfToken.hasItem(sServiceRootPath)){
			return oHashTableXsrfToken.getItem(sServiceRootPath);
		} else {
			that.fetchXcsrfToken();
			oHashTableXsrfToken.setItem(sServiceRootPath, sXsrfToken);
			return sXsrfToken;
		}
	};

	/**
	 * returns the rfc destination of the r3 system, that is exposed by the odata services.
	 * This corresponds to t000-logsys. The logical system is the identifier for the system/server, on which the application runs.
	 * @returns {string} logical system destination
	 */
	this.getLogicalSystem = function() {
		return sLogicalSystem;
	};

	/**
	 * @description sets the Context
	 * @param {sap.apf.utils.Filter} oFilter filter, that stores all context information
	 */
	this.setContext = function(oFilter) {
		oContextFilter = oFilter;
        var aTerms = oContextFilter.getInternalFilter().getFilterTermsForProperty('SAPClient');
        if (aTerms && aTerms.length === 1) {
            initLogicalSystem();
        }
		oCoreApi.updatePath(function() {
		}, true);
	};
	/**
	 * @description gets the Context
	 */
	this.getContext = function() {
		return oContextFilter;
	};
	/**
	 * @description fetches XSRF token from XSE
	 */
	this.fetchXcsrfToken = function() {
		that.ajax({
			url : oCoreApi.getUriGenerator().getAbsolutePath(sServiceRootPath),
			type : "GET",
			beforeSend : function(xhr) {
				xhr.setRequestHeader("x-csrf-token", "Fetch");
			},
			success : onFetchXsrfTokenResponse,
			error : onError,
			async : false
		});
		nFetchTryCounter = nFetchTryCounter + 1;
	};
	// private functions
	var onError = function(oJqXHR, sStatus, sErrorThrown) {
		if ((sXsrfToken.length === 0 || sXsrfToken === "unsafe") && nFetchTryCounter < 2) {
			setTimeout(that.fetchXcsrfToken, 500 + Math.random() * 1500);
		} else {
			oMessageHandler.check(false, "No XSRF Token available!", 5101);
		}
	};
    var onFetchXsrfTokenResponse = function(oData, sStatus, oXMLHttpRequest) {
        sXsrfToken = oXMLHttpRequest.getResponseHeader("x-csrf-token");
        /*
        * In case XSRF prevention flag is not set in .xsaccess file for the service, then no "x-csrf-token" field is returned in response header. 
         * For robustness, XSRF token is set to empty string. Every request triggered by APF contains then a "x-csrf-token" request header field containing an empty string. 
         */
        if(sXsrfToken === null){
               sXsrfToken = "";
        }else if ((sXsrfToken.length === 0 || sXsrfToken === "unsafe") && nFetchTryCounter < 2) {
               setTimeout(that.fetchXcsrfToken, 500 + Math.random() * 1500);
        }
    };
	var getSAPClientFromContextFilter = function() {
		var aTerms = oContextFilter.getInternalFilter().getFilterTermsForProperty('SAPClient');
		if (aTerms === undefined || aTerms.length !== 1) {
			oMessageHandler.putMessage(oMessageHandler.createMessageObject({
				code : "5025"
			}));
		}
		return aTerms[0].getValue();
	};

	var initLogicalSystem = function() {
		var logicalSystemConfiguration = oCoreApi.getPersistenceConfiguration().logicalSystem;
		
		
		if (!logicalSystemConfiguration) {
			sLogicalSystem = sSapClientFromFilter;
			return;
		}
		var sServiceRoot = logicalSystemConfiguration.service;
		var sEntityType = logicalSystemConfiguration.entityType;
		var sSapClientFromFilter = getSAPClientFromContextFilter();

		if(sServiceRoot === null){
			sLogicalSystem = sSapClientFromFilter;
			return;
		}		
		
		if(sEntityType === undefined) {
			sEntityType = sap.apf.core.constants.entitySets.logicalSystem;
		}
		
		if (sSapClient === sSapClientFromFilter) {
			return;
		}
		
		sSapClient = sSapClientFromFilter;
		var oFilter = new sap.apf.core.utils.Filter(oMessageHandler, "SAPClient", 'eq', sSapClient);
		var sUrl = oCoreApi.getUriGenerator().getAbsolutePath(sServiceRoot);
		sUrl = sUrl + oCoreApi.getUriGenerator().buildUri(oMessageHandler, sEntityType, [ 'LogicalSystem' ], oFilter, undefined, undefined, undefined, undefined, undefined, 'Results');
		var oRequest = {
			requestUri : sUrl,
			method : "GET",
			headers : {
				"x-csrf-token" : sXsrfToken
			},
			async : false
		};
		var fnOnSuccess = function(oData) {
			if (oData && oData.results && oData.results instanceof Array && oData.results.length === 1 && oData.results[0].LogicalSystem) {
				sLogicalSystem = oData.results[0].LogicalSystem;
			} else {
				oMessageHandler.putMessage(oMessageHandler.createMessageObject({
					code : "5026",
					aParameters : [ sSapClient ]
				}));
			}
		};
		var fnError = function(oError) {
			var oMessageObject = oMessageHandler.createMessageObject({
				code : "5026",
				aParameters : [ sSapClient ]
			});
			if (oError.messageObject !== undefined && oError.messageObject.type === "messageObject" ) {
				oMessageObject.setPrevious(oError.messageObject);
			}
			
			oMessageHandler.putMessage(oMessageObject);
		};
		that.odata(oRequest, fnOnSuccess, fnError);
	};
};