/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2014-2015 SAP SE. All rights reserved
 */
/* global Promise */
sap.ui.define([], function() {
	"use strict";

	/**
	 * @namespace
	 * @alias sap.ui.fl.fieldExt.Access
	 * @experimental Since 1.25.0
	 * @author SAP SE
	 * @version 1.32.7
	 */
	var Access = function() {
	};

	/**
	 * Returns all Business Contexts for given service and EntityTypeName/EntitySetName. Not that only EntityTypeName or EntitySetName can be
	 * supplied. Providing both results in an exception
	 * 
	 * @param {string} sServiceUri
	 * @param {string} sEntityTypeName
	 * @param {string} sEntitySetName
	 * @returns {array} aBusinessContexts
	 * @public
	 */
	Access.getBusinessContexts = function(sServiceUri, sEntityTypeName, sEntitySetName) {
		// Determine ServiceName and ServiceVersion from Service URI
		var sServiceName = this._parseServiceName(sServiceUri);
		var sServiceVersion = this._parseServiceVersion(sServiceUri, sServiceName);

		// Build URL for BusinessContextRetrievalService based on ServiceName, ServiceVersion, EntityName
		var sBusinessContextRetrievalUri = this._buildBusinessContextRetrievalUri(sServiceName, sServiceVersion, sEntityTypeName, sEntitySetName);

		// Execute Ajax call
		var mAjaxSettings = this._getAjaxSettings();
		var promise = this._executeAjaxCall(sBusinessContextRetrievalUri, mAjaxSettings, sServiceName, sServiceVersion, sEntityTypeName, sEntitySetName);

		return promise;
	};

	/**
	 * Extracts ServiceName out of Service URI
	 * 
	 * @private
	 * @param {string} sServiceUri
	 * @returns {string} sVersionName
	 */
	Access._parseServiceName = function(sServiceUri) {
		// Remove all stuff before and including the first slash
		var iStartPositionOfServiceName = sServiceUri.lastIndexOf("/") + 1;
		var sServiceNameWithVersion = sServiceUri.substring(iStartPositionOfServiceName);
		var sServiceName;
		if (sServiceNameWithVersion.indexOf(";v=") != -1) {
			// Cut away all URI stuff that comes before the serviceName
			sServiceName = sServiceNameWithVersion.substring(0, sServiceNameWithVersion.indexOf(";v="));
		} else {
			sServiceName = sServiceNameWithVersion;
		}
		return sServiceName;
	};

	/**
	 * Extracts ServiceVersion out of Service URI
	 * 
	 * @private
	 * @param {string} sServiceUri
	 * @param {string} sServiceName
	 * @returns {string} sVersionNumber
	 */
	Access._parseServiceVersion = function(sServiceUri, sServiceName) {
		if (sServiceUri.indexOf(sServiceName + ";v=") != -1) {
			// Cut away all URI stuff that comes before the serviceName
			var iPositionOfServiceWithVersionFragment = sServiceUri.indexOf(sServiceName + ";v=");
			var sRemainingUri = sServiceUri.substring(iPositionOfServiceWithVersionFragment);

			// Get String from ";v=" up to the next "/" --> this is the version
			// number
			var iPositionAfterVersionPrefix = sServiceName.length + 3;
			var sVersionNumber = sRemainingUri.slice(iPositionAfterVersionPrefix, sRemainingUri.indexOf("/"));

			return sVersionNumber;
		} else {// In this case there is no version information and so it is
			// version 1
			return "0001";
		}
	};

	/**
	 * Builds URI for BusinessContext Retrieval
	 * 
	 * @private
	 * @param {string} sServiceUri
	 * @param {string} sServiceName
	 * @param {string} sEntityName
	 * @param {string} sEntitySetName
	 * @returns {string} sBusinessContextRetrievalUri
	 */
	Access._buildBusinessContextRetrievalUri = function(sServiceName, sServiceVersion, sEntityName, sEntitySetName) {
		if (sEntityName == null) {
			sEntityName = '';
		}
		if (sEntitySetName == null) {
			sEntitySetName = '';
		}

		if (((sEntitySetName.length == 0) && (sEntityName.length == 0)) || (!(sEntitySetName.length == 0) && !(sEntityName.length == 0))) {
			throw new Error("sap.ui.fl.fieldExt.Access._buildBusinessContextRetrievalUri()" + "Inconsistent input parameters EntityName: " + sEntityName + " EntitySet: " + sEntitySetName);
		}

		// Example call:
		// sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType?EntitySetName=''&EntityTypeName='BusinessPartner'&ServiceName='CFD_TSM_BUPA_MAINT_SRV'&ServiceVersion='0001'&$format=json
		var sBusinessContextRetrievalUri = "/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType?" + "EntitySetName=\'" + sEntitySetName + "\'" + "&EntityTypeName=\'" + sEntityName + "\'" + "&ServiceName=\'" + sServiceName + "\'" + "&ServiceVersion=\'" + sServiceVersion + "\'" + "&$format=json";
		return sBusinessContextRetrievalUri;
	};

	/**
	 * Executes Ajax Call for BusinessContext Retrieval
	 * 
	 * @private
	 * @param {string} sBusinessContextRetrievalUri
	 * @param {map} mRequestSettings
	 * @param {string} sServiceName
	 * @param {string} sServiceVersion
	 * @param {string} sEntityName
	 * @returns {Object} oPromise
	 */
	Access._executeAjaxCall = function(sBusinessContextRetrievalUri, mRequestSettings, sServiceName, sServiceVersion, sEntityType, sEntitySetName) {
		var that = this;
		var oDeferred = jQuery.Deferred();

		jQuery.ajax(sBusinessContextRetrievalUri, mRequestSettings).done(function(data, textStatus, jqXHR) {
			var aBusinessContexts = [];
			if (data) {
				var aBusinessContexts = that._extractBusinessContexts(data);
			}

			var oResult = {
				BusinessContexts: aBusinessContexts,
				ServiceName: sServiceName,
				ServiceVersion: sServiceVersion
			};
			oDeferred.resolve(oResult);

		}).fail(function(jqXHR, textStatus, errorThrown) {
			var aErrorMessages = that._getMessagesFromXHR(jqXHR);
			var oError = {
				errorOccured: true,
				errorMessages: aErrorMessages,
				serviceName: sServiceName,
				serviceVersion: sServiceVersion,
				entityType: sEntityType,
				entitySet: sEntitySetName
			};
			oDeferred.reject(oError);
		});

		return oDeferred.promise();
	};

	/**
	 * @private
	 * @returns {map} mSettings
	 */
	Access._getAjaxSettings = function() {
		var mSettings = {
			type: "GET",
			async: true,
			dataType: 'json'
		};
		return mSettings;
	};

	/**
	 * Extracts BusinessContext out of Request response data
	 * 
	 * @private
	 * @param {object} oData
	 * @returns {array} BusinessContexts
	 */
	Access._extractBusinessContexts = function(data) {
		var aResults = null;
		var aBusinessContexts = [];
		if (data && data.d) {
			aResults = data.d.results;
		}

		if (aResults !== null && aResults.length > 0) {
			for (var i = 0; i < aResults.length; i++) {
				if (aResults[i].BusinessContext !== null) {
					aBusinessContexts.push(aResults[i].BusinessContext);
				}
			}
		}

		return aBusinessContexts;
	};

	/**
	 * Extracts error messages from request failure response
	 * 
	 * @private
	 * @param {object} oXHR
	 * @returns {array} errorMessages
	 */
	Access._getMessagesFromXHR = function(oXHR) {
		var aMessages = [];
		try {
			var oErrorResponse = JSON.parse(oXHR.responseText);
			if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value && oErrorResponse.error.message.value !== '') {
				aMessages.push({
					severity: "error",
					text: oErrorResponse.error.message.value
				});
			} else {
				aMessages.push({
					severity: "error",
					text: oXHR.responseText
				});
			}

		} catch (e) {
			// ignore
		}
		return aMessages;
	};

	return Access;
}, /* bExport= */true);
