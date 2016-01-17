/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global sap, jQuery, OData*/

jQuery.sap.declare("sap.apf.core.odataProxy");
jQuery.sap.require('sap.apf.utils.utils');
jQuery.sap.require("sap.ui.thirdparty.datajs");
jQuery.sap.require('sap.apf.core.constants');

(function() {
	'use strict';

	/**
	 * simplified interface to odata
	 * @private
	 * @constructor
	 * @param {object} serviceConfiguration Describes the service root  
	 * @param {object} inject Injected constructors, instances and functions
	 * @param {object} inject.instance Instances
	 * @param {object} inject.instance.messageHandler Message handler instance
	 * @param {object} inject.instance.coreApi CoreAPI instance
	 */
	sap.apf.core.OdataProxy = function(serviceConfiguration, inject) {
		/** @type sap.apf.core.Instance */
		var coreApi = inject.instance.coreApi;
		var messageHandler = inject.instance.messageHandler;
		var serviceRoot = serviceConfiguration.serviceRoot;
		var entitySetForFormatValue = "";

		function determineAsyncMode(async) {
			if (async === undefined) {
				return  true;
			} 
			return async;
		}
		
		function getMetadata(serviceRoot, entitySet) {
			return coreApi.getEntityTypeMetadata(serviceRoot, entitySet);
		}

		function addInputParametersToUrl(inputParameters) {
			var i, len, str;
			if (!inputParameters) {
				return "";
			}
			len = inputParameters.length;
			if (len === 1) {
				return "('" + inputParameters[0].value + "')";
			}
			str = "(";
			for(i = 0; i < len; i++) {
				if (i > 0) {
					str = str + ",";
				}
				str = str + inputParameters[i].name + "='" + inputParameters[i].value + "'";
			}
			return str + ")";
		}

		function createMessageObjectFromErrorResponse(oError) {
			var messageObject;

			if (oError.messageObject && oError.messageObject.getCode) {
				messageObject = oError.messageObject;
			} else if (oError.response && oError.response.statusCode && oError.response.statusCode >= 400) { //Bad HTTP request returned status code {0} with status text {1}
				messageObject = messageHandler.createMessageObject({
					code : '11005',
					aParameters : [ oError.response.statusCode.toString(), oError.response.statusText ]
				});
			} else {
				messageObject = messageHandler.createMessageObject({ //Unknown server error.
					code : '5201'
				});
			}
			messageHandler.putMessage(messageObject);
			return messageObject;
		}

		function errorOnRead(oError, callback) {
			var messageObject = createMessageObjectFromErrorResponse(oError);
			callback(undefined, undefined, messageObject);
		}

		function successOnRead(oData, serviceRoot, entitySet, callback) {
			var result;
			var messageObject;

			if (oData && oData.results) {
				result = oData.results;
			} else if (oData) {
				result = oData;
			} else {
				messageObject = messageHandler.createMessageObject({
					code : '5201'
				});
			}
			callback(result, getMetadata(serviceRoot, entitySet), messageObject);
		}

	
		/**
		 * odata get operation for specific single entity (application or configuration)
		 * @param {string} entitySet value from sap.apf.core.constants.entitySets
		 * @param {function} callback function of form fn(entityData, metadata, messageObject)
		 * @param {object[]} [inputParameters]
		 * @param {string[]} [selectList] holds all properties, that shall be in the select list
		 * @param {boolean} [async] Boolean value has to be set to false, if request should be send synchronously. Default value is true. 
		 * @param {string} application guid of the Application
		 */
		this.readEntity = function(entitySetName, callback, inputParameters, selectList, async, application) {
			var bAsync = determineAsyncMode(async);
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];

			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var url = serviceRoot + '/' + entitySet;

			url = url + addInputParametersToUrl(inputParameters);

			if (selectList && selectList.length > 0) {
				url = url + "?$select=" + selectList.join();
			}

			

			var request = {
				requestUri : url,
				async : bAsync,
				method : "GET",
				headers : {
					"x-csrf-token" : xsrfToken
				}
			};

			coreApi.odataRequest(request, function(oData) {
				successOnRead(oData, serviceRoot, entitySet, callback);
			}, function(oError) {
				errorOnRead(oError, callback);
			});
		};

		function formatValue(sProperty, value) {
			var strDelimiter = "'";

			var oEntityMetadata = getMetadata(serviceRoot, entitySetForFormatValue).getPropertyMetadata(sProperty);
			if (oEntityMetadata && oEntityMetadata.dataType) {
				return sap.apf.utils.formatValue(value, oEntityMetadata.dataType.type);
			}
			if (typeof value === 'number') {
				return value;
			}
			return strDelimiter + sap.apf.utils.escapeOdata(value) + strDelimiter;
		}

		function buildBatchRequests(requestConfigurations) {

			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var batchRequests = [];
			var i, len = requestConfigurations.length;
			var url, entitySet, bSelectListSet, method, request;

			for(i = 0; i < len; i++) {
				bSelectListSet = false;
				entitySet = sap.apf.core.constants.entitySets[requestConfigurations[i].entitySetName];
				url = entitySet;
				url = url + addInputParametersToUrl(requestConfigurations[i].inputParameters);

				if (requestConfigurations[i].selectList && requestConfigurations[i].selectList.length > 0) {
					url = url + "?$select=" + requestConfigurations[i].selectList.join();
					bSelectListSet = true;
				}
				if (requestConfigurations[i].filter) {
					if (bSelectListSet) {
						url = url + '&';
					} else {
						url = url + '?';
					}
					entitySetForFormatValue = entitySet;
					url = url + '$filter=' + requestConfigurations[i].filter.toUrlParam({
						formatValue : formatValue
					});
				}

				method = requestConfigurations[i].method || 'GET';
				request = {
					requestUri : url,
					method : method,
					headers : {
						"Accept-Language" : sap.ui.getCore().getConfiguration().getLanguage(),
						"x-csrf-token" : xsrfToken
					}
				};
				if (method !== "GET") {
					request.data = requestConfigurations[i].data;
				}
				batchRequests.push(request);
			}
			return batchRequests;
		}
		
		function buildUrlForReadCollection(entitySet, inputParameters, selectList, filter) {
			var sQueryString = '';
			
			var url = entitySet + addInputParametersToUrl(inputParameters);

			if (selectList && selectList.length > 0) {
				sQueryString = "$select=" + selectList.join();
			}
			if (filter) {
			    if(sQueryString) {
			        sQueryString = sQueryString + '&';
			    }
			    entitySetForFormatValue = entitySet;
			    sQueryString = sQueryString + '$filter=' + filter.toUrlParam({
					formatValue : formatValue
				});
			}
			if(entitySet === sap.apf.core.constants.entitySets.application) {
	             if(sQueryString) {
	                    sQueryString = sQueryString + '&';
                 }
	             sQueryString = sQueryString + '$orderby=ApplicationName';
			}
			if(sQueryString) {
			    url = url + '?' + sQueryString;
			}
			
			return url;
		}
		
		function handleErrorInBatch(error, callback) {
			var message = "unknown error";
			var errorDetails = "unknown error";
			var url = "";

			if (error.message !== undefined) {
				message = error.message;
			}
			var httpStatusCode = "unknown";
			if (error.response && error.response.statusCode) {
				httpStatusCode = error.response.statusCode;
				errorDetails = error.response.statusText || "";
				url = error.response.requestUri;
			}

			if (error.messageObject && error.messageObject.type === "messageObject") {
				callback([], error.messageObject);
			} else {
				callback([], messageHandler.createMessageObject({
					code : "5001",
					aParameters : [ httpStatusCode, message, errorDetails, url ]
				}));
			}
		}
		/**
		 * multiple change operations in batch
		 * @param {object[]} requestConfigurations with properties entitySetName, filter, selectList, inputParameters, method
		 * @param {function} callback with parameters undefined or messageObject in case of Error
		 */
		this.doChangeOperationsInBatch = function(requestConfigurations, callback) {
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var batchRequests = buildBatchRequests(requestConfigurations);

			var batchRequest = {
				requestUri : serviceRoot + '/' + '$batch',
				method : "POST",
				headers : {
					"x-csrf-token" : xsrfToken
				},
				data : {
					__batchRequests : [ {
						__changeRequests : batchRequests
					} ]
				}
			};
			var fnSuccess = function(data, response) {

				var messageObject;
				var changeResponse;
				var url = "";
				var i, j;
				if (data && data.__batchResponses) {

					for(i = 0; i < data.__batchResponses.length; i++) {
						
						if (data.__batchResponses[i].message) {

							var message = data.__batchResponses[i].message;
							
							var httpStatusCode = "";
							url = response.requestUri;
							messageObject = messageHandler.createMessageObject({
								code : "5001",
								aParameters : [ httpStatusCode, message, "", url ]
							});
							break;
						}
						
						for(j = 0; j < data.__batchResponses[i].__changeResponses.length; j++) {

							changeResponse = data.__batchResponses[i].__changeResponses[j];

							if (changeResponse.message) {

								var message = changeResponse.message;
								var errorDetails = changeResponse.data;
								var httpStatusCode = changeResponse.statusCode;
								url = response.requestUri;
								messageObject = messageHandler.createMessageObject({
									code : "5001",
									aParameters : [ httpStatusCode, message, errorDetails, url ]
								});
								break;
							}

						}
					}
					callback(messageObject);
				}
			};
			var fnError = function(error) {
				handleErrorInBatch(error, callback);
			};
			coreApi.odataRequest(batchRequest, fnSuccess, fnError, OData.batchHandler);
		};
		/**
		 * multiple reads in a batch operation
		 * @param {object[]} requestConfigurations with properties entitySetName, filter, selectList, inputParameters, method
		 * @param {function} callback with parameters data - array with results and messageObject
		 * @param {boolean} [async] Boolean value has to be set to false, if request should be send synchronously. Default value is true. 
		 */
		this.readCollectionsInBatch = function(requestConfigurations, callback, async) {
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var batchRequests = buildBatchRequests(requestConfigurations);
			var bAsync = determineAsyncMode(async);

			var batchRequest = {
				requestUri : serviceRoot + '/' + '$batch',
				async : bAsync,
				method : "POST",
				headers : {
					"x-csrf-token" : xsrfToken
				},
				data : {
					__batchRequests : batchRequests
				}
			};

			var fnSuccess = function(data) {
				var response = [];
				var messageObject;
				var url = "";
				var i;
				if (data && data.__batchResponses) {

					for(i = 0; i < data.__batchResponses.length; i++) {
						if (data.__batchResponses[i].data && data.__batchResponses[i].data.results) {
							response.push(data.__batchResponses[i].data.results);
						} else if (data.__batchResponses[i].message) {
							var message = data.__batchResponses[i].message;
							var errorDetails = data.__batchResponses[i].response.body;
							var httpStatusCode = data.__batchResponses[i].response.statusCode;
							url = response.requestUri;
							messageObject = messageHandler.createMessageObject({
								code : "5001",
								aParameters : [ httpStatusCode, message, errorDetails, url ]
							});
							break;
						} else {
							url = response.requestUri;
							messageObject = messageHandler.createMessageObject({
								code : "5001",
								aParameters : [ "unknown", "unknown error", "unknown error", url ]
							});
							break;
						}
					}
					callback(response, messageObject);
				}
			};
			var fnError = function(error) {
				handleErrorInBatch(error, callback);
			};
			coreApi.odataRequest(batchRequest, fnSuccess, fnError, OData.batchHandler);

		};
		/**
		 * odata get operation for specific type (application or configuration)
		 * @param {string} entitySetName value from sap.apf.core.constants.entitySets
		 * @param {function} callback function of form fn(result, metadata, messageObject)
		 * @param {object[]|undefined} [inputParameters]
		 * @param {string[]|undefined} [selectList] holds all properties, that shall be in the select list
		 * @param {sap.apf.core.utils.Filter} [filter] additional filter expressions
		 * @param {boolean} [async] Boolean value has to be set to false, if request should be send synchronously. Default value is true. 
		 */
		this.readCollection = function(entitySetName, callback, inputParameters, selectList, filter, async) {
			var bAsync = determineAsyncMode(async);
			
			if (bAsync) {
				readSingleCollectionInBatch(entitySetName, callback, inputParameters, selectList, filter);
			} else {
				readCollectionSynchronously(entitySetName, callback, inputParameters, selectList, filter);
			}
		};
		
		function readCollectionSynchronously(entitySetName, callback, inputParameters, selectList, filter) {
			
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var url = serviceRoot + '/' + buildUrlForReadCollection( entitySet, inputParameters, selectList, filter);
	
			var request = {
				requestUri : url,
				async : false,
				method : "GET",
				headers : {
					"x-csrf-token" : xsrfToken
				}
			};
			coreApi.odataRequest(request, function(oData) {
				successOnRead(oData, serviceRoot, entitySet, callback);
			}, function(oError) {
				errorOnRead(oError, callback);
			});
		}
		
		function readSingleCollectionInBatch(entitySetName, callback, inputParameters, selectList, filter) {
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];
			var success = function(data, response) {
				var response;
				var messageObject;
				var url = "";
				
				if (data && data.__batchResponses) {

					
						if (data.__batchResponses[0].data && data.__batchResponses[0].data.results) {
							response = data.__batchResponses[0].data.results;
						} else if (data.__batchResponses[0].message) {
							var message = data.__batchResponses[0].message;
							var errorDetails = data.__batchResponses[0].response.body;
							var httpStatusCode = data.__batchResponses[0].response.statusCode;
							url = response.requestUri;
							messageObject = messageHandler.createMessageObject({
								code : "5001",
								aParameters : [ httpStatusCode, message, errorDetails, url ]
							});
						
						} else {
							url = response.requestUri;
							messageObject = messageHandler.createMessageObject({
								code : "5001",
								aParameters : [ "unknown", "unknown error", "unknown error", url ]
							});
							
						}
		
					callback(response, getMetadata(serviceRoot, entitySet), messageObject);
				}
			};
				

			var xsrfToken = coreApi.getXsrfToken(serviceRoot);

			var batchRequest = {
					requestUri : serviceRoot + '/' + '$batch',
					async : true,
					method : "POST",
					headers : {
						"x-csrf-token" : xsrfToken
					},
					data : {
						__batchRequests : [{
							requestUri : buildUrlForReadCollection(entitySet, inputParameters, selectList, filter),
							method : "GET",
							headers : {
								"x-csrf-token" : xsrfToken,
								"Accept-Language": sap.ui.getCore().getConfiguration().getLanguage()
							}
						}]
					}
				};
			
			coreApi.odataRequest(batchRequest, success, function(oError) {
				errorOnRead(oError, callback);
			}, OData.batchHandler);

		}
		/**
		 * odata post operation for specific type (application or configuration)
		 * @param {string} entitySetName value from sap.apf.core.constants.entitySets
		 * @param {object} applicationData object with properties of object, that shall be posted
		 * @param {function} callback function of form fn(result, metadata, messageObject)
		 */
		this.create = function(entitySetName, applicationData, callback, async) {
			var bAsync = determineAsyncMode(async);
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var url = serviceRoot + '/' + entitySet;

			var request = {
				requestUri : url,
				async : bAsync,
				method : "POST",
				headers : {
					"x-csrf-token" : xsrfToken
				},
				data : applicationData
			};

			function successOnCreate(oData, oResponse) {
				var result;
				var messageObject;

				if (oData && oResponse.statusText === "Created") {
					result = oData;
				} else {
					messageObject = messageHandler.createMessageObject({
						code : '5201'
					});
				}
				callback(result, getMetadata(serviceRoot, entitySet), messageObject);
			}

			function errorOnCreate(oError) {
				var messageObject = createMessageObjectFromErrorResponse(oError);
				callback(undefined, undefined, messageObject);
			}

			coreApi.odataRequest(request, successOnCreate, errorOnCreate);

		};

		/**
		 * odata put operation for specific type (application or configuration)
		 * @param {string} entitySetName value from sap.apf.core.constants.entitySets
		 * @param {object} applicationData object with properties of object, that shall be posted
		 * @param {function} callback function of form fn( metadata, messageObject)
		 * @param {object[]} [inputParameters]
		 */
		this.update = function(entitySetName, applicationData, callback, inputParameters) {
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var url = serviceRoot + '/' + entitySet + addInputParametersToUrl(inputParameters);
			var request = {
				requestUri : url,
				method : "PUT",
				headers : {
					"x-csrf-token" : xsrfToken
				},
				data : applicationData
			};

			//noinspection JSUnusedLocalSymbols
			function successOnUpdate(oData, oResponse) {
				var messageObject;

				if (oResponse.statusCode !== 204) {
					messageObject = messageHandler.createMessageObject({
						code : '5201'
					});
				}
				callback(getMetadata(serviceRoot, entitySet), messageObject);
			}

			function errorOnUpdate(oError) {
				var messageObject = createMessageObjectFromErrorResponse(oError);
				callback(undefined, messageObject);
			}

			coreApi.odataRequest(request, successOnUpdate, errorOnUpdate);

		};

		/**
		 * odata delete operation for specific type (application or configuration)
		 * @param {string} entitySetName value from sap.apf.core.constants.entitySets
		 * @param {object[]} [inputParameters]
		 * @param {function} callback function of form fn(metadata, messageObject)
		 * @param {sap.apf.core.utils.Filter} [filter] 
		 */
		this.remove = function(entitySetName, inputParameters, callback, filter) {
			var entitySet = sap.apf.core.constants.entitySets[entitySetName];
			var xsrfToken = coreApi.getXsrfToken(serviceRoot);
			var url = serviceRoot + '/' + entitySet + addInputParametersToUrl(inputParameters);

			if (filter) {
				entitySetForFormatValue = entitySet;
				url = url + '$filter=' + filter.toUrlParam({
					formatValue : formatValue
				});
			}
			var request = {
				requestUri : url,
				method : "DELETE",
				headers : {
					"x-csrf-token" : xsrfToken
				}
			};

			//noinspection JSUnusedLocalSymbols
			function successOnDelete(oData, oResponse) {
				var messageObject;
				var metadata;

				if (oResponse.statusText === "No Content") {
					metadata = getMetadata(serviceRoot, entitySet);
				} else {
					messageObject = messageHandler.createMessageObject({
						code : '5201'
					});
				}
				callback(metadata, messageObject);
			}

			function errorOnDelete(oError) {
				var messageObject = createMessageObjectFromErrorResponse(oError);
				callback(undefined, messageObject);
			}

			coreApi.odataRequest(request, successOnDelete, errorOnDelete);

		};

	};
}());
