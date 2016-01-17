define(
	[ "../utils/ABAPRepositoryConstants" ],
	function (Constants) {
		
		/* eslint-disable no-use-before-define */

		var DISCOVERY_URL = "sap/bc/adt/discovery",
			TRANSPORT_SCHEME = "http://www.sap.com/adt/categories/cts",
			TRANSPORT_TERM = "transports",
			TRANSPORT_CHECKS_TERM = "transportchecks";

		var Transport = function () {

			var that = this;

			function _getTransportUrlFromDiscovery(term, destination) {
				// The discovery is already cached by the AdtDiscoveryFactory.
				return that.context.service.adtDiscoveryFactory.getDiscovery(DISCOVERY_URL, {urlPrefix: destination.proxyUrlPrefix}).then(
					function (discovery) {
						return discovery.getCollectionMember(TRANSPORT_SCHEME, term).then(function (collectionMember) {
							return collectionMember.getUri();
						}, function(error) {
						// consider the content of the error object: one object {jqXHR, textStatus, errorThrown, adtErrorData} (adtErrorData only if available in the response)
						});
					}
				);
			}

			function _getTransportsUrl(destination) {
				return _getTransportUrlFromDiscovery(TRANSPORT_TERM, destination);
			}

			function _getTransportChecksUrl(destination) {
				return _getTransportUrlFromDiscovery(TRANSPORT_CHECKS_TERM, destination);
			}

			this.createTransport = function(packageName, applicationName, description, destination) {
				return _getTransportsUrl(destination).then(
					function (transportsUrl) {
						if (transportsUrl && transportsUrl !== null) {
							var payload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
								+ "<asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">" + "<asx:values>" + "<DATA>"
								+ "<OPERATION>I</OPERATION>" + "<DEVCLASS>" + packageName + "</DEVCLASS>" + "<REQUEST_TEXT>" + description
								+ "</REQUEST_TEXT>" + "<REF>/sap/bc/adt/filestore/ui5-bsp/objects/" + applicationName + "/$create</REF>"
								+ "</DATA>" + "</asx:values>" + "</asx:abap>";

							return that.context.service.abapdestination.getRestResource(destination).then(
								function (restResource) {
									return restResource.post({
										url: transportsUrl,
										data: payload,
										headers: {
											'Accept': 'text/plain', // accepted content type for the response body
											'X-sap-adt-profiling': 'server-time',
											'Content-Type': 'application/vnd.sap.as+xml; charset=utf-8; dataname=com.sap.adt.CreateCorrectionRequest'
										}
									}).then(function (response) {
										var transport = response.data.replace("/com.sap.cts/object_record/", "");
										return transport;
									}, function(errorObj) {
										// consider the content of the error object: one object {jqXHR, textStatus, errorThrown, adtErrorData} (adtErrorData only if available in the response)
										// TODO: the error should be returned as an Error object, give more information in the error message. The exact error from the backend
										var errorMessage;
										if (errorObj.adtErrorData) {
											errorMessage = errorObj.adtErrorData;
											if (errorMessage.message && errorMessage.message.text) {
												errorMessage = errorMessage.message.text;
											}
										} else {
											errorMessage = errorObj.textStatus;
										}
										throw new Error(that.context.i18n.getText("i18n", "Transport_CreateRequestFailed", [errorMessage]));
									});
								});
						} else {
							throw new Error(that.context.i18n.getText("i18n", "Transport_CreateFailed_transportsNotFound"));
						}
					}
				);
			};

			this.getApplicationInfo = function (applicationName, destination) {
				return _getTransportChecksUrl(destination).then(
					function (transportchecksUrl) {
						if (transportchecksUrl && transportchecksUrl !== null) {
							return sendRequestForTransports("", applicationName, "", "$new", destination, transportchecksUrl).then(
								function (response) {
									var xmlText;
									if (typeof response === "string") {
										xmlText = response;
									} else {
										xmlText = new XMLSerializer().serializeToString(response);
									}
									var $xml = $(jQuery.sap.parseXML(xmlText));
									// create application API based on undefined value. do not change.
									// parse response xml in order to get the package name and transport.
									packge = $xml.find("DEVCLASS").text();
									transport = $xml.find("LOCKS>CTS_OBJECT_LOCK>LOCK_HOLDER>REQ_HEADER>TRKORR").text();

									if (transport === "") {// create application API based on undefined value. do not change.
										transport = undefined;
									}

									return {
										transportValue: transport,
										packageValue: packge
									};
								});
						} else { //transportchecks service was not found
							// create application API based on undefined value. do not change.
							return {
								transportValue: undefined,
								packageValue: "$TMP"
							};
						}
					}
					//, function(error) {
					// consider the content of the error object: one object {jqXHR, textStatus, errorThrown, adtErrorData} (adtErrorData only if available in the response)
					// }
				);
			};

			this.getTransports = function (packageName, applicationName, destination) {
				return _getTransportChecksUrl(destination).then(
					function (transportchecksUrl) {
						if (transportchecksUrl && transportchecksUrl !== null) {
							var operation = "I";
							var URI = "$create";

							return sendRequestForTransports(packageName, applicationName, operation, URI, destination, transportchecksUrl);
						}
						throw new Error(that.context.i18n.getText("i18n", "Transport_GetTransportsFailed_transportchecksNotFound"));
					}
					, function(error) {
					    //error is: {jqXHR, message, textStatus, errorThrown, adtErrorData} - (adtErrorData only if available in the response)
					    throw error;
					}
				);
			};

			// send POST to transportchecks
			var sendRequestForTransports = function (selectedPackage, application, operation, URI, destination, transportChecksUrl) {
				var path = transportChecksUrl;
				var payload = buildTransportCheckPayload(application, selectedPackage, operation, URI);

				return that.context.service.abapdestination.getRestResource(destination).then(
					function (restResource) {
						return restResource.post({
							url: path,
							data: payload,
							headers: {                 
								'Accept': 'application/vnd.sap.as+xml; dataname=com.sap.adt.transport.service.checkData', // use accept-charset to specific the charset, but this is normally not needed
								'Content-Type': 'application/vnd.sap.as+xml; charset=UTF-8; dataname=com.sap.adt.transport.service.checkData',
								'X-sap-adt-profiling': 'server-time'
							}
						}).then(
							function (response) {
								if(response.jqXHR.status === 200 && response.data ===""){
									//this is added due to lack of error handling in abap system - in case of note 2046730 is not implemented(we get response 200 with empty data)
									throw new Error(that.context.i18n.getText("i18n", "TransportChecks_Note_Not_Implemented"));
								}
								return response.data;
							}
							, function(error) {
							    // consider the content of the error object: one object {jqXHR, message, textStatus, errorThrown, adtErrorData} (adtErrorData only if available in the response)
							    throw error;
							});
					});
			};

			//encode the path so that we replace all "/" to "%2F"
			var encodeToBspResourcePath = function (resourcePath) {
				return encodeURIComponent(resourcePath);
			};
			var buildTransportCheckPayload = function (application, selectedPackage, operation, URI) {
				var args = [];
				args.push(selectedPackage);
				args.push(operation);

				application = encodeToBspResourcePath(application);//in case we have namespace we change / to %sF

				args.push(application);
				args.push(URI);
				var payload = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><asx:abap version=\"1.0\" xmlns:asx=\"http://www.sap.com/abapxml\"><asx:values><DATA><PGMID></PGMID><OBJECT></OBJECT><OBJECTNAME></OBJECTNAME><DEVCLASS>{0}</DEVCLASS><OPERATION>{1}</OPERATION><URI>/sap/bc/adt/filestore/ui5-bsp/objects/{2}/{3}</URI></DATA></asx:values></asx:abap>";
				payload = stringFormat(payload, args);

				return payload;
			};

			var stringFormat = function (xmlPayload, args) {
				for (var i = 0; i < args.length; i++) {
					var reg = new RegExp("\\{" + i + "\\}", "gm");
					xmlPayload = xmlPayload.replace(reg, args[i]);
				}

				return xmlPayload;
			};

			var checkForLocalPackage = function ($xml, res) {
				var dlvunit = $xml.find("DLVUNIT").text();

				if (dlvunit === "LOCAL") {
					var oPackage = $xml.find("DEVCLASS").text();
					res.status = Constants.TRANSPORT_STATUS_LOCAL_PACKAGE;
					res.data.package = oPackage;
					return res;
				} else {
					return undefined;
				}
			};

			var checkForLock = function ($xml, res) {
				var locked = $xml.find("LOCKS").text();

				if (locked) {
					var lockHolders = $xml.find("TRKORR");
					var lockHolder = $(lockHolders[0]).text();

					var oPackage = $xml.find("DEVCLASS").text();
					//update model
					res.status = Constants.TRANSPORT_STATUS_LOCKED;
					res.data.transport = lockHolder;
					res.data.package = oPackage;
					return res;
				} else {
					return undefined;
				}
			};

			/**
			 * This method will analyse Transports Response
			 *
			 *
			 * @returns an object of the following structure:
			 *  { status : "S" / "E" / "LOCKED" / "NOT_ASSAIGNED"
                 *      data :    if status is "S" then data will hold the transports arrays.
                 *                if status is "E" then data will hold the error message .
                 *                if status is "LOCKED" then data will hold the locking transport.
                 *                if status is "NOT_ASSAIGNED" then data will be empty.
                 *                if status is "LOCAL_PACKAGE" then data will hold the package.
                 * }
			 * */
			this.analyseTransportsResponse = function (transportsResponse) {
				var res = {status: "",
					data: {}
				};
				var msg;
				var updatedRes;

				if (transportsResponse === "") {
					res.status = Constants.TRANSPORT_STATUS_E;
					res.data.message = "";
					return res;
				}

				var xmlText = new XMLSerializer().serializeToString(transportsResponse);
				var $xml = $(jQuery.sap.parseXML(xmlText));
				var result = $xml.find("RESULT").text();

				if (result === "S") { // success
					res.status = Constants.TRANSPORT_STATUS_S;
					var recording = $xml.find("RECORDING").text();
					if (recording === "") { // posibly not trasportable (i.e. Local Package or need to create a new transport)

						//check if locked
						updatedRes = checkForLock($xml, res);
						if (updatedRes) {
							return updatedRes; //locked
						}

						//check for lockal package //LOCAL_PACKAGE
						updatedRes = checkForLocalPackage($xml, res);
						if (updatedRes) {
							return updatedRes; //local package
						}

						res.status = Constants.TRANSPORT_STATUS_NOT_ASSAIGNED;
						return res;
					}

					res.data.transports = [];
					var $requests = $xml.find("REQ_HEADER");
					if ($requests) {
						//check if locked
						updatedRes = checkForLock($xml, res);

						if (updatedRes) {
							return updatedRes;
						}

						$requests.each(function () {
							var transport = {};
							transport.transportRequest = $(this).find("TRKORR").text();
							transport.user = $(this).find("AS4USER").text();
							transport.target = $(this).find("TARSYSTEM").text();
							transport.text = $(this).find("AS4TEXT").text();
							//add this transport to the array of users transports
							res.data.transports.push(transport);
						});
					}

					return res;
				} else if (result === "E") { //there is an error in respose.
					msg = $xml.find("TEXT").text();
					res.status = Constants.TRANSPORT_STATUS_E;
					res.data.message = msg;
					return res;
				}

			};
		};
		
		/* eslint-enable no-use-before-define */

		return Transport;
	});