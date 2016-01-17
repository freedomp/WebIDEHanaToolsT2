/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
jQuery.sap.declare("sap.apf.core.persistence");
jQuery.sap.require("sap.apf.core.constants");

(function() {
	'use strict';
/**
 * @class Persistence storing paths on server side
 * @returns {sap.apf.core.Persistence}
 */
sap.apf.core.Persistence = function(oInject) {
	var that = this;
	var logicalSystem;
	
	/**
	 * @description Creates a data object based on the state of the current path and stores it on the server.
	 * @param {string} sName Name of the path.
	 * @param {function} fnCallback(oResponse, oEntityMetadata, oMessageObject)
	 * @param {object} [oExternalObject] Object containing non-core objects to be serialized
	 * @param {object} [oExternalObject.filterIdHandler] Serializable FilterIdHandler
	 */
	this.createPath = function(sName, fnCallback, oExternalObject) {
		var oRequest;
		var oSerializablePath = oInject.coreApi.serializePath();
		if (oExternalObject) {
			oSerializablePath.filterIdHandler = oExternalObject.filterIdHandler;
			oSerializablePath.startFilterHandler = oExternalObject.startFilterHandler;
		}
		var oStructuredPath = getStructuredAnalysisPath(oSerializablePath);
		getLogicalSystemAsPromise().then(function(logicalSystem) {
			
			oRequest = {
				data : {
					AnalysisPath : "",
					AnalysisPathName : sName,
					LogicalSystem : logicalSystem,
					ApplicationConfigurationURL : oInject.coreApi.getApplicationConfigurationURL(),
					SerializedAnalysisPath : JSON.stringify(oSerializablePath),
					StructuredAnalysisPath : JSON.stringify(oStructuredPath)
				},
				method : "POST"
			};
			if (oInject.coreApi.getStartParameterFacade().getAnalyticalConfigurationId()) {
				oRequest.data.AnalyticalConfiguration = oInject.coreApi.getStartParameterFacade().getAnalyticalConfigurationId().configurationId;	
			}
			sendRequest(oRequest, fnRequestCallback.bind(that));
		}, function(messageObject) {
			fnCallback({
				oResponse : undefined,
				status : "failed"
			}, {}, messageObject);
		});
		function fnRequestCallback(oResponse, oEntityTypeMetadata, messageObject) {
			if (messageObject) {
				fnCallback({
					oResponse : oResponse,
					status : "failed"
				}, oEntityTypeMetadata, messageObject);
			} else {
				oInject.messageHandler.check(oResponse && oResponse.data && oResponse.statusCode === 201 && oResponse.statusText === "Created", "Persistence create Path - proper response");
				fnCallback({
					AnalysisPath : oResponse.data.AnalysisPath,
					status : "successful"
				}, oEntityTypeMetadata, messageObject);
			}
		}
	};
	/**
	 * @description Reads all stored paths from server.
	 * @param {function} fnCallback This callback function is called after function readPaths has been executed.
	 * @param {function} fnCallback(oResponse, oEntitiyMetadata, oMessageObject) 
	 */
	this.readPaths = function(fnCallback) {
		var oRequest = {
			method : "GET"
		};
		sendRequest(oRequest, fnRequestCallback.bind(this));
		function fnRequestCallback(oResponse, oEntityTypeMetadata, oMessageObject) {
			if (!oMessageObject && oResponse && oResponse.data && oResponse.data.results) {
				for( var i in oResponse.data.results) {
					oResponse.data.results[i].StructuredAnalysisPath = JSON.parse(oResponse.data.results[i].StructuredAnalysisPath);
				}
			} else if (!oMessageObject || oResponse.statusCode !== 200 || oResponse.statusText !== "OK") {
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5211'
				});
			}
			if (oMessageObject) {
				fnCallback({
					oResponse : oResponse,
					status : "failed"
				}, oEntityTypeMetadata, oMessageObject);
			} else {
				fnCallback({
					paths : oResponse.data.results,
					status : "successful"
				}, oEntityTypeMetadata, oMessageObject);
			}
		}
	};
	/**
	 * @description Deletes a path. 
	 * @param {String} sAnalysisPathId GUID to identify the path
	 * @param {function} fnCallback(oResponse, oEntitiyMetadata, oMessageObject) 
	 */
	this.deletePath = function(sAnalysisPathId, fnCallback) {
		var oRequest = {
			method : "DELETE"
		};
		sendRequest(oRequest, fnRequestCallback.bind(this), sAnalysisPathId);
		function fnRequestCallback(oResponse, oEntityTypeMetadata, oMessageObject) {
			if ((oResponse.statusCode !== 204 || oResponse.statusText !== "No Content") && (!oMessageObject)) {
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : 5201
				});
				oMessageObject.setPrevious(oInject.messageHandler.createMessageObject({
					code : 5200,
					aParameters : [ oResponse.statusCode, oResponse.statusText ]
				}));
			}
			if (oMessageObject) {
				fnCallback({
					oResponse : oResponse,
					status : "failed"
				}, oEntityTypeMetadata, oMessageObject);
			} else {
				fnCallback({
					status : "successful"
				}, oEntityTypeMetadata, oMessageObject);
			}
		}
	};
	/**
	 * @description Modifies a data object based on the state of the current path and overwrites the old path on the server. 
	 * @param {String} sAnalysisPathId GUID to identify the path
	 * @param {String} sName name of the path
	 * @param {function} fnCallback(oResponse, oEntitiyMetadata, oMessageObject)
	 * @param {object} [oExternalObject] Object containing non-core objects to be serialized
	 * @param {object} [oExternalObject.filterIdHandler] Serializable FilterIdHandler
	 */
	this.modifyPath = function(sAnalysisPathId, sName, fnCallback, oExternalObject) {
		var oSerializablePath = oInject.coreApi.serializePath();
		if (oExternalObject) {
			oSerializablePath.filterIdHandler = oExternalObject.filterIdHandler;
			oSerializablePath.startFilterHandler = oExternalObject.startFilterHandler;
		}
		var oStructuredPath = getStructuredAnalysisPath(oSerializablePath);
		getLogicalSystemAsPromise().then(function(logicalSystem) {
			var oRequest = {
				data : {
					AnalysisPathName : sName,
					LogicalSystem : logicalSystem,
					ApplicationConfigurationURL : oInject.coreApi.getApplicationConfigurationURL(),
					SerializedAnalysisPath : JSON.stringify(oSerializablePath),
					StructuredAnalysisPath : JSON.stringify(oStructuredPath)
				},
				method : "PUT"
			};
			sendRequest(oRequest, fnRequestCallback.bind(this), sAnalysisPathId);
		}, function(messageObject) {
			fnCallback({
				oResponse : undefined,
				status : "failed"
			}, {}, messageObject);
		});
		function fnRequestCallback(oResponse, oEntityTypeMetadata, oMessageObject) {
			if ((oResponse.statusCode !== 204 || oResponse.statusText !== "No Content") && (!oMessageObject)) {
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : 5201
				});
				oMessageObject.setPrevious(oInject.messageHandler.createMessageObject({
					code : 5200,
					aParameters : [ oResponse.statusCode, oResponse.statusText ]
				}));
			}
			if (oMessageObject) {
				fnCallback({
					oResponse : oResponse,
					status : "failed"
				}, oEntityTypeMetadata, oMessageObject);
			} else {
				fnCallback({
					AnalysisPath : sAnalysisPathId,
					status : "successful"
				}, oEntityTypeMetadata, oMessageObject);
			}
		}
	};
	/**
	 * @description Gets the stored path and deserializes it in the runtime environment. As a result, the current path is replaced
	 * by the path, that has been loaded from the server.
	 * @param {String} sAnalysisPathId GUID to identify the path
	 * @param {function} fnCallback(oResponse, oEntitiyMetadata, oMessageObject) 
	 * @param {Number} nActiveStep active step of current path
	 */
	this.openPath = function(sAnalysisPathId, fnCallback, nActiveStep) {
		var oRequest = {
			method : "GET"
		};
		sendRequest(oRequest, fnRequestCallback.bind(this), sAnalysisPathId);
		function fnRequestCallback(oResponse, oEntityTypeMetadata, oMessageObject) {
			var oMessageObjectForUI;
			if (!oMessageObject && oResponse && oResponse.statusCode === 200 && oResponse.data && oResponse.data.SerializedAnalysisPath) {
				oResponse.data.SerializedAnalysisPath = JSON.parse(oResponse.data.SerializedAnalysisPath);
				oMessageObject = createPathFromReceivedData(oResponse.data, nActiveStep);
			}
			if (oMessageObject) {
				oMessageObjectForUI = oInject.messageHandler.createMessageObject({
					code : '5210'
				});
				oMessageObjectForUI.setPrevious(oMessageObject);
				oInject.messageHandler.putMessage(oMessageObjectForUI);
			}
			if (oMessageObjectForUI) {
				fnCallback({
					oResponse : oResponse,
					status : "failed"
				}, oEntityTypeMetadata, oMessageObjectForUI);
			} else {
				fnCallback({
					path : oResponse.data,
					status : "successful"
				}, oEntityTypeMetadata, oMessageObjectForUI);
			}
		}
	};
	function sendRequest(oRequest, fnLocalCallback, sAnalysisPathId) {
		var fnSuccess = function(oData, oResponse) {
			fnLocalCallback(oResponse, getMetadata(), undefined);
		};
		var fnError = function(oError) {
			var oMessageObject;
			if (oError.messageObject && oError.messageObject.getCode && oError.messageObject.getCode() === 5021) { // timeout
				fnLocalCallback(oError, getMetadata(), oError.messageObject);
				return;
			}
			var sServerSideCode = checkForErrorCode(oError.response.body); // server side error code check				
			if (sServerSideCode !== undefined) {
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : sServerSideCode
				});
			}
			if (oError.response.body.match("274")) { // Inserted value too large; probably maximum length of analysis path name exceeded
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5207'
				});
			}
			if (oError.response.statusCode === 400) { // Bad request; data is structured incorrectly
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5203'
				});
			}
			if (oError.response.statusCode === 403) { // Access forbidden; insufficient privileges
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5206'
				});
			}
			if (oError.response.statusCode === 405) { // Method not allowed; probably incorrect URL parameter.
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5202'
				});
			}
			if (oError.response.statusCode === 404) { // Error during path persistence; request to server can not be proceed due to invalid ID
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5208'
				});
			}
			if (!oMessageObject && oError.response.statusCode === 500) { // Server error during processing a path: {0} {1}
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5200',
					aParameters : [ oError.response.statusCode, oError.response.statusText ]
				});
			}
			if (!oMessageObject) { // Unknown server error
				oMessageObject = oInject.messageHandler.createMessageObject({
					code : '5201'
				});
			}
			oInject.messageHandler.putMessage(oMessageObject);
			// signature: oResponse, oEntityTypeMetadata, oMessageObject
			fnLocalCallback(oError, getMetadata(), oMessageObject);
		};
		var sUrl = getPersistenceServiceUrl();
		oRequest.headers = {
			"x-csrf-token" : oInject.coreApi.getXsrfToken(getPersistenceServiceUrl())
		};
		switch (oRequest.method) {
			case "GET":
				if (!oRequest.data && sAnalysisPathId) {
					oRequest.requestUri = sUrl + "('" + sAnalysisPathId + "')";
					oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
				} else if (!oRequest.data && !sAnalysisPathId) {
					getUrlForReadPathsAsPromise().then(function(restUrl) {
						oRequest.requestUri = sUrl + restUrl;
						oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
					}, function(messageObject) {
						fnLocalCallback({}, getMetadata(), messageObject);
					});
				}
				break;
			case "POST":
				if (oRequest.data && !sAnalysisPathId) {
					oRequest.requestUri = sUrl;
				}
				oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
				break;
			case "DELETE":
				if (!oRequest.data && sAnalysisPathId) {
					oRequest.requestUri = sUrl + "('" + sAnalysisPathId + "')";
				}
				oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
				break;
			case "PUT":
				if (oRequest.data && sAnalysisPathId) {
					oRequest.requestUri = sUrl + "('" + sAnalysisPathId + "')";
				}
				oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
				break;
			default:
				oInject.coreApi.odataRequest(oRequest, fnSuccess, fnError);
				break;
		}
	}
	function getUrlForReadPathsAsPromise() {
		var deferred = jQuery.Deferred();
		getLogicalSystemAsPromise().then(
				function(logicalSystem) {
					var analyticalConfigurationInURL = "";
					if (oInject.coreApi.getStartParameterFacade().getAnalyticalConfigurationId()) {
						analyticalConfigurationInURL = "AnalyticalConfiguration%20eq%20'" + oInject.coreApi.getStartParameterFacade().getAnalyticalConfigurationId().configurationId + "'%20and%20";
					}
					var urlForReadPaths = "?$select=AnalysisPath,AnalysisPathName,StructuredAnalysisPath,CreationUTCDateTime,LastChangeUTCDateTime&$filter=(" + analyticalConfigurationInURL + "LogicalSystem%20eq%20'" + logicalSystem + "'%20and%20"
							+ "ApplicationConfigurationURL%20eq%20'" + oInject.coreApi.getApplicationConfigurationURL() + "')" + "&$orderby=LastChangeUTCDateTime%20desc";
					deferred.resolve(urlForReadPaths);
				}, function(messageObject) {
					deferred.fail(messageObject);
				});
		return deferred.promise();
	}
	function checkForErrorCode(oError) {
		var errorCode = oError.match("52[0-9]{2}");
		if (errorCode) {
			return errorCode[0];
		}
		return undefined;
	}
	function createPathFromReceivedData(oReceivedData, nActiveStep) {
		var fnPutMessageOrig;
		var oMessageObject;

		function restorePutMessage() {
			oInject.messageHandler.putMessage = fnPutMessageOrig;
		}
		function redefinePutMessage() {
			fnPutMessageOrig = oInject.messageHandler.putMessage;
			oInject.messageHandler.putMessage = function(oMessageObject) {

				var messageConf = oInject.messageHandler.getConfigurationByCode(oMessageObject.getCode());

				if (messageConf && messageConf.severity && messageConf.severity === "warning") {
					return;
				}
				throw oMessageObject;
			};
		}
		if (nActiveStep !== undefined) {
			oReceivedData.SerializedAnalysisPath.path.indicesOfActiveSteps[0] = nActiveStep;
		}
		oInject.coreApi.resetPath(true);
		redefinePutMessage();
		try {
			oInject.coreApi.deserializePath(oReceivedData.SerializedAnalysisPath);
		} catch (oError) {
			oInject.coreApi.restoreOriginalPath();
			
			oMessageObject = convertErrorToMessageObject(oError);
		} finally {
			restorePutMessage();
		}
		return oMessageObject;
	}
	function convertErrorToMessageObject(oError) {
		var oMessageObject;
		if (oError.type && oError.type === "messageObject") {
			oMessageObject = oError;
		} else {
			oMessageObject = new sap.apf.core.MessageObject({
				code : sap.apf.core.constants.message.code.errorUnknown
			//configure in message definition
			});
			oMessageObject.setSeverity(sap.apf.core.constants.message.severity.error);
			oMessageObject.setMessage("Unknown exception caught " + oError.message);
		}
		return oMessageObject;
	}
	function getPersistenceServiceUrl() {
		var oPersistencePathConfig = oInject.coreApi.getPersistenceConfiguration().path;
		var sService = oPersistencePathConfig.service + "/" + oPersistencePathConfig.entitySet;
		return sService;
	}
	function getStructuredAnalysisPath(oSerializablePath) {
		var aStructuredSteps = [];
		var aSteps = oSerializablePath.path.steps;
		var StructuredAnalysisPath;
		for( var i in aSteps) {
			aStructuredSteps.push({
				stepId : aSteps[i].stepId,
				selectedRepresentationId : aSteps[i].binding.selectedRepresentationId
			});
		}
		StructuredAnalysisPath = {
			steps : aStructuredSteps,
			indexOfActiveStep : oSerializablePath.path.indicesOfActiveSteps[0]
		};
		return StructuredAnalysisPath;
	}
	function getMetadata() {
		var oConfig = oInject.coreApi.getPersistenceConfiguration();
		var oEntityTypeMetadata = oInject.coreApi.getEntityTypeMetadata(oConfig.path.service, oConfig.path.entitySet);
		return oEntityTypeMetadata;
	}
	function getSAPClientFromContextFilter(oContextFilter) {
		var aTerms = oContextFilter && oContextFilter.getFilterTermsForProperty('SAPClient');
		if (aTerms === undefined || aTerms.length !== 1) {
			return undefined;
		}
		return aTerms[0].getValue();
	}
	function resolveLogicalSystemWithSapClient(deferred, sapClient) {
		var messageHandler = oInject.messageHandler;
		var logicalSystemConfiguration = oInject.coreApi.getPersistenceConfiguration().logicalSystem;
		if (!logicalSystemConfiguration) {
			logicalSystem = sapClient;
			deferred.resolve(sapClient);
			return deferred.promise();
		}
		var sServiceRoot = logicalSystemConfiguration.service;
		var sEntityType = logicalSystemConfiguration.entitySet || logicalSystemConfiguration.entityType;
		if (sServiceRoot === null) {
			logicalSystem = sapClient;
			deferred.resolve(sapClient);
			return deferred.promise();
		}
		if (sEntityType === undefined) {
			sEntityType = sap.apf.core.constants.entitySets.logicalSystem;
		}
		var oFilter = new sap.apf.core.utils.Filter(messageHandler, "SAPClient", 'eq', sapClient);
		var sUrl = oInject.coreApi.getUriGenerator().getAbsolutePath(sServiceRoot);
		sUrl = sUrl + oInject.coreApi.getUriGenerator().buildUri(messageHandler, sEntityType, [ 'LogicalSystem' ], oFilter, undefined, undefined, undefined, undefined, undefined, 'Results');
		var oRequest = {
			requestUri : sUrl,
			method : "GET",
			headers : {
				"x-csrf-token" : oInject.coreApi.getXsrfToken(getPersistenceServiceUrl())
			}
		};
		var fnOnSuccess = function(oData) {
			var messageObject;
			if (oData && oData.results && oData.results instanceof Array && oData.results.length === 1 && oData.results[0].LogicalSystem) {
				logicalSystem = oData.results[0].LogicalSystem;
				deferred.resolve(logicalSystem);
			} else {
				messageObject = messageHandler.createMessageObject({
					code : "5026",
					aParameters : [ sapClient ]
				});
				deferred.fail(messageObject);
			}
		};
		var fnError = function(oError) {
			var messageObject = messageHandler.createMessageObject({
				code : "5026",
				aParameters : [ sapClient ]
			});
			if (oError.messageObject !== undefined && oError.messageObject.type === "messageObject") {
				messageObject.setPrevious(oError.messageObject);
			}
			deferred.fail(messageObject);
		};
		oInject.coreApi.odataRequest(oRequest, fnOnSuccess, fnError);
	}
	/**
	 * returns the logical system as promise, that is used on xs engine or otherwise the sap client from start parameters, if persistence config
	 * has no logical system odata service specified.
	 */
	function getLogicalSystemAsPromise() {
		var deferred = jQuery.Deferred();
		if (logicalSystem) {
			deferred.resolve(logicalSystem);
			return deferred.promise();
		}
		var sapClient = oInject.coreApi.getStartParameterFacade().getSapClient();
		if (sapClient) {
			resolveLogicalSystemWithSapClient(deferred, sapClient);
			return deferred.promise();
		}
		oInject.coreApi.getCumulativeFilter().done(function(oContextFilter) {
			sapClient = getSAPClientFromContextFilter(oContextFilter);
			if (!sapClient) {
				deferred.resolve('');
			} else {
				resolveLogicalSystemWithSapClient(deferred, sapClient);
			}
		});
		return deferred.promise();
	}
};
}());