define(['STF',
		"sap/watt/core/q",
		"sap/watt/platform/plugin/utils/common/RemoteDocument"],
	function (STF, coreQ, RemoteDocument) {

	"use strict";

	var suiteName = "ABAPRepository_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("Service test for ABAP Repository service", function () {
		var oABAPRepository;
		var oFakeFileDAO;
		var oFileService;
		var oMockServer;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oABAPRepository = getService('abaprepository');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileService = getService('filesystem.documentProvider');

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");

				var atomFeedResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
					"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http:\/\/www.w3.org/2005/Atom\">" +
					"<atom:author/>" +
					"<atom:id>MM_PO_APV%2fi18n</atom:id><atom:link href=\"./MM_PO_APV%2fi18n/content\" rel=\"self\" type=\"application/atom+xml;type=feed\"/>" +
					"<atom:link href=\"../appindex/MM_PO_APV\" rel=\"appindex\"/>" +
					"<atom:title>MM_PO_APV/i18n</atom:title>" +
					"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
					"<atom:author/>" +
					"<atom:category term=\"file\"/>" +
					"<atom:content afr:etag=\"20150416114327\" type=\"application/octet-stream\" src=\"./MM_PO_APV%2fi18n%2fi18n.properties/content\" xmlns:afr=\"http://www.sap.com/adt/afr\"/>" +
					"<atom:contributor/>" +
					"<atom:id>MM_PO_APV%2fi18n%2fi18n.properties</atom:id>" +
					"<atom:link href=\"../appindex/MM_PO_APV\" rel=\"appindex\"/>" +
					"<atom:link href=\"./MM_PO_APV%2fi18n%2fi18n.properties\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
					"<atom:link href=\"http://ldcigm6.wdf.sap.corp:50033/sap/bc/ui5_ui5/sap/mm_po_apv/i18n/i18n.properties?sap-client=001&amp;sap-ui-language=EN&amp;sap-ui-xx-devmode=true\" rel=\"execute\" type=\"application/http\"/>" +
					"<atom:summary type=\"text\"/>" +
					"<atom:title>MM_PO_APV/i18n/i18n.properties</atom:title>" +
					"</atom:entry>" +
					"</atom:feed>";

				var getApplicationInfoResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\"><asx:values><DATA><PGMID>LIMU</PGMID><OBJECT>WAPP</OBJECT><OBJECTNAME>MM_PO_APV" +
					"UI5REPOSITORYPATHMAPPING.XML</OBJECTNAME><OPERATION/><DEVCLASS>TESTMIKI</DEVCLASS><CTEXT>ttt</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>KEIDAR</AS4USER><PDEVCLASS/><DLVUNIT>LOCAL</DLVUNIT>" +
					"<NAMESPACE>/*/</NAMESPACE><RESULT>S</RESULT><RECORDING/><EXISTING_REQ_ONLY>X</EXISTING_REQ_ONLY><MESSAGES/><REQUESTS/><LOCKS><CTS_OBJECT_LOCK><OBJECT_KEY><PGMID>LIMU</PGMID><OBJECT>WAPP</OBJECT><OBJ_NAME>MM_PO_APV" +
					"UI5REPOSITORYPATHMAPPING.XML</OBJ_NAME></OBJECT_KEY><LOCK_HOLDER><REQ_HEADER><TRKORR>UIAK023495</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-08-11</AS4DATE>" +
					"<AS4TIME>13:08:54</AS4TIME><AS4TEXT>mm_po_apv</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS><CTS_TASK_HEADER><TRKORR>UIAK023496</TRKORR><TRFUNCTION>S</TRFUNCTION><TRSTATUS>D</TRSTATUS><AS4USER>TAGOR</AS4USER>" +
					"<AS4DATE>2014-08-11</AS4DATE><AS4TIME>13:08:56</AS4TIME><AS4TEXT>mm_po_apv</AS4TEXT></CTS_TASK_HEADER></TASK_HEADERS></LOCK_HOLDER></CTS_OBJECT_LOCK></LOCKS><TADIRDEVC>TESTMIKI</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/MM_PO_APV/$new</URI></DATA></asx:values></asx:abap>";

				var discoveryResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
					"<app:service xmlns:app=\"http://www.w3.org/2007/app\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<app:workspace>" +
					"<atom:title>ABAP SAPUI5 Filestore</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/filestore/ui5-bsp/objects\">" +
					"<atom:title>SAPUI5 Filestore based on BSP</atom:title>" +
					"<atom:category term=\"filestore-ui5-bsp\" scheme=\"http://www.sap.com/adt/categories/filestore\"/>" +
					"</app:collection>" +
					"<app:collection href=\"/sap/bc/adt/filestore/ui5-bsp/ui5-rt-version\">" +
					"<atom:title>SAPUI5 Runtime Version</atom:title>" +
					"<atom:category term=\"ui5-rt-version\" scheme=\"http://www.sap.com/adt/categories/filestore\"/>" +
					"</app:collection>" +
					"</app:workspace>" +
					"<app:workspace>" +
					"<atom:title>Change and Transport System</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/cts/transports\">" +
					"<atom:title>Transports</atom:title>" +
					"<atom:category term=\"transports\" scheme=\"http://www.sap.com/adt/categories/cts\"/>" +
					"</app:collection>" +
					"<app:collection href=\"/sap/bc/adt/cts/transportchecks\">" +
					"<atom:title>Transport Checks</atom:title>" +
					"<atom:category term=\"transportchecks\" scheme=\"http://www.sap.com/adt/categories/cts\"/>" +
					"</app:collection>" +
					"</app:workspace>" +
					"<app:workspace>" +
					"<atom:title>Repository Information</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/repository/informationsystem/search\">" +
					"<atom:title>Search</atom:title>" +
					"<atom:category term=\"search\" scheme=\"http://www.sap.com/adt/categories/repository\"/>" +
					"<adtcomp:templateLinks xmlns:adtcomp=\"http://www.sap.com/adt/compatibility\">" +
					"<adtcomp:templateLink rel=\"http://www.sap.com/adt/relations/informationsystem/search/quicksearch\" template=\"/sap/bc/adt/repository/informationsystem/search{?operation,query,useSearchProvider,noDescription,maxResults}{&amp;objectType*}{&amp;packageName*}{&amp;userName*}\"/>" +
					"</adtcomp:templateLinks>" +
					"</app:collection>" +
					"</app:workspace>" +
					"</app:service>";

				var discoveryNoTransportchecksResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
					"<app:service xmlns:app=\"http://www.w3.org/2007/app\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<app:workspace>" +
					"<atom:title>ABAP SAPUI5 Filestore</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/filestore/ui5-bsp/objects\">" +
					"<atom:title>SAPUI5 Filestore based on BSP</atom:title>" +
					"<atom:category term=\"filestore-ui5-bsp\" scheme=\"http://www.sap.com/adt/categories/filestore\"/>" +
					"</app:collection>" +
					"<app:collection href=\"/sap/bc/adt/filestore/ui5-bsp/ui5-rt-version\">" +
					"<atom:title>SAPUI5 Runtime Version</atom:title>" +
					"<atom:category term=\"ui5-rt-version\" scheme=\"http://www.sap.com/adt/categories/filestore\"/>" +
					"</app:collection>" +
					"</app:workspace>" +
					"<app:workspace>" +
					"<atom:title>Change and Transport System</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/cts/transports\">" +
					"<atom:title>Transports</atom:title>" +
					"<atom:category term=\"transports\" scheme=\"http://www.sap.com/adt/categories/cts\"/>" +
					"</app:collection>" +
					"<app:collection href=\"/sap/bc/cts/transportchecks\">" +
					"<atom:title>Transport Checks</atom:title>" +
					"<atom:category term=\"transportchecks\" scheme=\"http://www.sap.com/adt/categories/cts\"/>" +
					"</app:collection>" +
					"</app:workspace>" +
					"<app:workspace>" +
					"<atom:title>Repository Information</atom:title>" +
					"<app:collection href=\"/sap/bc/adt/repository/informationsystem/search\">" +
					"<atom:title>Search</atom:title>" +
					"<atom:category term=\"search\" scheme=\"http://www.sap.com/adt/categories/repository\"/>" +
					"<adtcomp:templateLinks xmlns:adtcomp=\"http://www.sap.com/adt/compatibility\">" +
					"<adtcomp:templateLink rel=\"http://www.sap.com/adt/relations/informationsystem/search/quicksearch\" template=\"/sap/bc/adt/repository/informationsystem/search{?operation,query,useSearchProvider,noDescription,maxResults}{&amp;objectType*}{&amp;packageName*}{&amp;userName*}\"/>" +
					"</adtcomp:templateLinks>" +
					"</app:collection>" +
					"</app:workspace>" +
					"</app:service>";

				var ATOSettingsResponse = "<ato:settings xmlns:ato=\"http://www.sap.com/adt/ato\" developmentPackage=\"developmentPackage\" developmentPrefix=\"YY1_\" isConfigured=\"true\" isNotificationAllowed=\"true\" isExtensibilityDevelopmentSystem=\"true\" isTransportRequestRequired=\"false\" transportationMode=\"COL\" operationsType=\"C\" tenantRole=\"07\" isPrefixNamespace=\"false\" isManagedExtensibilityActive=\"false\"/>";

				var getApplicationsResponse = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>" +
					"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
					"<atom:id>%2fISHMOBIL%2fDSCHP</atom:id>" +
					"<atom:summary type=\"text\">ISH Mobile: Planned Discharge</atom:summary>" +
					"<atom:title>/ISHMOBIL/DSCHP</atom:title>" +
					"</atom:entry>" +
					"</atom:feed>";
				
				// dummy response with one dependency
				var dependenciesResponse1 = {
					"cus.crm.myaccounts":{
						"dependencies":[
							{"id":"cus.crm.myaccounts","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/crm_myaccounts","error":false,"noDescriptor":false},
							{"id":"sap.ca.scfld.md","type":"UI5COMP","url":"","error":false,"noDescriptor":false},
							{"id":"sap.ca.ui","type":"UI5LIB","url":"","error":false,"noDescriptor":false},
							{"id":"sap.m","type":"UI5LIB","url":"","error":false,"noDescriptor":false},
							{"id":"dummyId","type":"UI5COMP","url":"/dummy/url","error":false,"noDescriptor":false}
						],
						"error":false,
						"noDescriptor":false
					}
				};

				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						// mock the call that gets the atom feed of 'MM_PO_APV' resource
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects.*"),
						response: function (oXhr) {
							if (oXhr.url.indexOf("MM_PO_APV") >= 0) {
								oXhr.respond(200, {
									"Content-Type": "application/xml;charset=utf-8"
								}, atomFeedResponse);
							} else if (oXhr.url.indexOf("NotDeployedApp") >= 0) {
								// application is not deployed - return null
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, null);
							} else if (oXhr.url.indexOf("MichalApp") >= 0) {
								// mocking failing request
								oXhr.respond(404, {
									"Content-Type": "application/json"
								}, "{message: \"An error has occurred\"}");
							}
						}
					},{
						method: "POST",
						// mock the call that gets the application info by transportchecks
						path: new iFrameWindow.RegExp(".*/sap/bc/adt/cts/transportchecks.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, getApplicationInfoResponse);
						}
					},{
						method: "POST",
						// mock the call for transportchecks by a destination without the note (i.e. GM6)
						// notice the url doesn't include "adt"
						path: new iFrameWindow.RegExp(".*/sap/bc/cts/transportchecks.*"),
						response: function (oXhr) {
							oXhr.respond(404, {
								"Content-Type": "application/xml;charset=utf-8"
							}, getApplicationInfoResponse);
						}
					},{
						method: "GET",
						// mock the call to get discovery xml
						path: new iFrameWindow.RegExp(".*/discovery"),
						response: function (oXhr) {
							if (oXhr.url.indexOf("GM6") >= 0) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								discoveryNoTransportchecksResponse);
							} else {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								discoveryResponse);
							}
						}
					},{
						method: "GET",
						// mock the call for compatibility - to get the CSRF token
						path: new iFrameWindow.RegExp(".*/compatibility.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
									"x-csrf-token": "IFmD4txbnPtoFyzrITGqgg==",
									"Content-Type": "application/octet-stream"
								},
								discoveryResponse);
						}
					},{
						method: "GET",
						path: new iFrameWindow.RegExp(".*/ato/settings.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, ATOSettingsResponse);
						}
					},{
						method: "GET",
						path: new iFrameWindow.RegExp(".*/getApplications.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, getApplicationsResponse);
						}
					},{
						method: "GET",
						// app index service - call to get dependencies
						path: new iFrameWindow.RegExp(".*/sap/bc/ui2/app_index/ui5_app_info.*"),
						response: function (oXhr) {
							if (oXhr.url.indexOf("cus.crm.myaccounts") >= 0) {
								oXhr.respond(200, {
									"Content-Type": "application/json"
								}, iFrameWindow.JSON.stringify(dependenciesResponse1));
							} else if (oXhr.url.indexOf("someNamespace") >= 0) {
								// respond with "bad request"
								oXhr.respond(400, {
									"Content-Type": "application/json"
								}, "dummy error message");
							}
						}
					}]
				});

				oMockServer.start();
			});
		});

		it("Tests openDeployWizard method", function() {

			var projectJsonDoc = {
				"deploy" : {
					"name" : "testLocal",
					"destination" : "UIA"
				}
			};

			projectJsonDoc = JSON.stringify(projectJsonDoc);

			var oFileStructure = {
				"FioriMD1" : {
					".project.json" : projectJsonDoc
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/FioriMD1").then(function(oDocument) {
					var oSelection = {};
					oSelection.document = oDocument;

					return oABAPRepository.openDeployWizard(oSelection).then(function(oWizard) {
						expect(oWizard).to.exist;
						expect(oWizard.getId()).to.equal("DeployWizard");
					});
				});
			});
		});

		it("Tests getDeploymentSettings method", function() {

			var projectJsonDoc = {
				"deploy" : {
					"name" : "testLocal",
					"destination" : "UIA"
				}
			};

			projectJsonDoc = JSON.stringify(projectJsonDoc);

			var oFileStructure = {
				"FioriMD2" : {
					".project.json" : projectJsonDoc
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/FioriMD2").then(function(oDocument1) {
					// positive flow
					return oABAPRepository.getDeploymentSettings(oDocument1).then(function(oSettings1) {
						expect(oSettings1).to.exist;
						expect(oSettings1.name).to.equal("testLocal");
						expect(oSettings1.destination).to.equal("UIA");

						// negative test - undefined input
						return oABAPRepository.getDeploymentSettings().then(function(oSettings2) {
							expect(oSettings2).to.equal(null);

							projectJsonDoc = JSON.stringify(projectJsonDoc);
							projectJsonDoc = projectJsonDoc + "."; // make the json invalid

							oFileStructure = {
								"FioriMD" : {
									".project.json" : projectJsonDoc
								}
							};

							return oFakeFileDAO.setContent(oFileStructure).then(function() {
								return oFileService.getDocument("/FioriMD").then(function (oDocument2) {
									// negative test - invalid project.json - should fail
									return oABAPRepository.getDeploymentSettings(oDocument2).fail(function(oError) {
										expect(oError).to.exist;
										expect(oError.message).to.equal("The .project.json file is not valid");

										projectJsonDoc = {
											"extensibility" : {},
											"key" : "value"
										};

										projectJsonDoc = JSON.stringify(projectJsonDoc);

										oFileStructure = {
											"FioriMD" : {
												".project.json" : projectJsonDoc
											}
										};

										return oFakeFileDAO.setContent(oFileStructure).then(function() {
											return oFileService.getDocument("/FioriMD").then(function (oDocument3) {
												// negative test - project.json with no "deploy" block
												return oABAPRepository.getDeploymentSettings(oDocument3).then(function(oSettings3) {
													expect(oSettings3).to.equal(null);
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		it("Tests getDeploymentInfo method", function() {

			var projectJsonDoc = {
				"deploy" : {
					"name" : "MM_PO_APV",
					"destination" : "UIA"
				}
			};

			projectJsonDoc = JSON.stringify(projectJsonDoc);

			var oFileStructure = {
				"FioriMD3" : {
					".project.json" : projectJsonDoc
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/FioriMD3").then(function(oDocument1) {

					// positive flow
					return oABAPRepository.getDeploymentInfo(oDocument1).then(function(oDeploymentInfo1) {
						expect(oDeploymentInfo1).to.exist;
						expect(oDeploymentInfo1.destination).to.equal("UIA");
						expect(oDeploymentInfo1.name).to.equal("MM_PO_APV");
						expect(oDeploymentInfo1.package).to.equal("TESTMIKI");


						projectJsonDoc = {
							"deploy" : {
								"name" : "MM_PO_APV",
								"destination" : "MIC" // non-existing destination
							}
						};

						projectJsonDoc = JSON.stringify(projectJsonDoc);

						oFileStructure = {
							"FioriMD4" : {
								".project.json" : projectJsonDoc
							}
						};

						return oFakeFileDAO.setContent(oFileStructure).then(function() {
							return oFileService.getDocument("/FioriMD4").then(function (oDocument2) {
								// negative flow - no such destination
								return oABAPRepository.getDeploymentInfo(oDocument2).then(function(oDeploymentInfo2) {
									expect(oDeploymentInfo2).to.equal(undefined);


									projectJsonDoc = {
										"deploy" : {
											"name" : "NotDeployedApp",
											"destination" : "UIA"
										}
									};

									projectJsonDoc = JSON.stringify(projectJsonDoc);

									oFileStructure = {
										"FioriMD5" : {
											".project.json" : projectJsonDoc
										}
									};

									return oFakeFileDAO.setContent(oFileStructure).then(function() {
										return oFileService.getDocument("/FioriMD5").then(function (oDocument3) {
											// positive flow - application is not deployed
											return oABAPRepository.getDeploymentInfo(oDocument3).then(function(oDeploymentInfo3) {
												expect(oDeploymentInfo3).to.equal(undefined);


												projectJsonDoc = {
													"deploy" : {
														"name" : "MichalApp",
														"destination" : "UIA"
													}
												};

												projectJsonDoc = JSON.stringify(projectJsonDoc);

												oFileStructure = {
													"FioriMD6" : {
														".project.json" : projectJsonDoc
													}
												};

												return oFakeFileDAO.setContent(oFileStructure).then(function() {
													return oFileService.getDocument("/FioriMD6").then(function (oDocument4) {
														// negative flow - an error has occurred in the request for thr atom feed
														return oABAPRepository.getDeploymentInfo(oDocument4).then(function(oDeploymentInfo4) {
															expect(oDeploymentInfo4).to.equal(undefined);
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		it("Tests getDeploymentDetails method", function() {

			var sAppName = "MichalApp";
			var oDestination = {
				description: "UIA",
				entryPath: "/sap/bc/adt",
				name: "UIA",
				path: "/sap/bc/adt",
				proxyUrlPrefix: "/destinations/UIA",
				sapClient: "",
				systemId: "UIA",
				url: "/destinations/UIA/sap/bc/adt",
				wattUsage: "dev_abap"
			};
			
			// mock a document with neo-app.json that has a sap/bc/ui5_ui5 route
			var neoAppJsonDoc = {
			  "welcomeFile": "/webapp/index.html",
			  "routes": [
			    {
			      "path": "/sap/bc/ui5_ui5",
			      "target": {
			        "type": "destination",
			        "name": "UIA",
			        "entryPath": "/sap/bc/ui5_ui5"
			      },
			      "description": "UIA"
			    }]
			};

			neoAppJsonDoc = JSON.stringify(neoAppJsonDoc);

			var oFileStructure = {
				"FioriMD" : {
					"neo-app.json" : neoAppJsonDoc
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/FioriMD").then(function(oDocument) {
					// positive flow
					return oABAPRepository.getDeploymentDetails(sAppName, oDestination, oDocument).then(function(oAppInfo1) {
						expect(oAppInfo1).to.exist;
						expect(oAppInfo1.name).to.equal("MichalApp");
						expect(oAppInfo1.package).to.equal("TESTMIKI");
						expect(oAppInfo1.destination).to.equal("UIA");
		
						// negative test - undefined input
						return oABAPRepository.getDeploymentDetails().then(function(oAppInfo2) {
							expect(oAppInfo2).to.equal(undefined);
		
							oDestination = {
								description: "GM6",
								entryPath: "/sap/bc/adt",
								name: "GM6",
								path: "/sap/bc/adt",
								proxyUrlPrefix: "/destinations/GM6",
								sapClient: "",
								systemId: "GM6",
								url: "/destinations/GM6/sap/bc/adt",
								wattUsage: "dev_abap"
							};
		
							// positive flow - system with no transportchecks url
							return oABAPRepository.getDeploymentDetails(sAppName, oDestination, oDocument).then(function(oAppInfo3) {
								expect(oAppInfo3).to.exist;
								expect(oAppInfo3.package).to.equal("$TMP");
								expect(oAppInfo3.destination).to.equal("GM6");
								
								neoAppJsonDoc = {
								  "welcomeFile": "/webapp/index.html",
								  "routes": [] // empty routes
								};
					
								neoAppJsonDoc = JSON.stringify(neoAppJsonDoc);
					
								oFileStructure = {
									"FioriMD1" : {
										"neo-app.json" : neoAppJsonDoc
									}
								};
					
								return oFakeFileDAO.setContent(oFileStructure).then(function() {
									return oFileService.getDocument("/FioriMD1").then(function(oDocument1) {
										// flow with no sap/bc/ui5_ui5 route in neo-app.json - the url should be undefined
										return oABAPRepository.getDeploymentDetails(sAppName, oDestination, oDocument1).then(function(oAppInfo4) {
											expect(oAppInfo4).to.exist;
										});
									});
								});
							});
						});
					});
				});
			});
		});

		it("Tests getAtoSettings method", function() {

			var sSettings = "/sap/bc/adt/ato/settings";

			return oABAPRepository.getAtoSettings(sSettings).then(function(oSettings) {
				expect(oSettings.packageName).to.equal("developmentPackage");
				expect(oSettings.prefixName).to.equal("YY1_");
				expect(oSettings.isExtensibilityDevSystem).to.equal("true");
				expect(oSettings.operationsType).to.equal("C");
			});
		});

		it("Tests getApplications method", function() {

			var oDiscoveryStatus = {
				"filestore_ui5_bsp" : "/getApplications",
				"description" : "UIA"
			};

			// validation 1 - positive
			return oABAPRepository.getApplications(oDiscoveryStatus).then(function(applications) {
				expect(applications.length).to.equal(1);

				oDiscoveryStatus = {
					"filestore_ui5_bsp" : undefined,
					"description" : "UIA"
				};

				// validation 2 - negative - no filestore_ui5_bsp URL
				return oABAPRepository.getApplications(oDiscoveryStatus).fail(function(oError) {
					expect(oError.message).to.equal("Cannot deploy the application. An entry for the UI5 BSP Repository was not found in the ABAP Development Tools Discovery service. Install the missing software components on your ABAP system and try again. For more information refer to the SAP Web IDE documentation.");
				});
			});
		});
		
		it("Tests getDependenciesAsNeoappRoutes method", function() {
			
			var oSystem = {
				"proxyUrlPrefix" : "/destinations/GM6",
				"sapClient" : "200"
			};
			
			var sAppNamespace = "";

			// invalid input
			return oABAPRepository.getDependenciesAsNeoappRoutes(oSystem, sAppNamespace).then(function(aDependencies1) {
				expect(aDependencies1.length).to.equal(0);

				sAppNamespace = "cus.crm.myaccounts";

				// positive flow with one dependency
				return oABAPRepository.getDependenciesAsNeoappRoutes(oSystem, sAppNamespace).then(function(aDependencies2) {
					expect(aDependencies2.length).to.equal(1);
					expect(aDependencies2[0].path).to.equal("/resources/dummyId");
					
					sAppNamespace = "someNamespace";
					
					// negative flow - mock as if the request for app index has failed
					return oABAPRepository.getDependenciesAsNeoappRoutes(oSystem, sAppNamespace).then(function() {
						expect(false).to.equal(true); // make sure the test fails if it reaches here
					}).fail(function(oError) {
						expect(oError.responseText).to.equal("dummy error message");
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			if (oMockServer) {
				oMockServer.stop();
				oMockServer.destroy();
			}
		});
	});

	describe("Unit tests for ABAP Repository service", function () {

		var oRequiredABAPRepository;

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/service/ABAPRepository").then(function(ABAPRepository) {
				oRequiredABAPRepository = new ABAPRepository();
				/* eslint-disable no-undef */
				//Define Q as a global variable since it's used in ABAPRepository
				Q = coreQ;
				/* eslint-enable no-undef */
			});
		});

		it("Tests getErrorMessage method", function() {

			var sResponseText = "Error message!";

			var sErrorMessage = oRequiredABAPRepository.getErrorMessage(sResponseText);
			expect(sErrorMessage).to.equal("Error message!");

			sResponseText = "<?xml version=\"1.0\" encoding=\"utf-8\"?><exc:exception xmlns:exc=\"http://www.sap.com/abapxml/types/communicationframework\"><namespace id=\"com.sap.adt\"/><type id=\"ExceptionResourceCreationFailure\"/><message lang=\"EN\">Remote creation in customer namespace not possible in SAP systems</message><localizedMessage lang=\"EN\">Remote creation in customer namespace not possible in SAP systems</localizedMessage><properties/></exc:exception>";
			sErrorMessage = oRequiredABAPRepository.getErrorMessage(sResponseText);
			expect(sErrorMessage).to.equal("Remote creation in customer namespace not possible in SAP systems");

			sResponseText = "<html><body><h1>Error from HTML!</h1></body></html>";
			sErrorMessage = oRequiredABAPRepository.getErrorMessage(sResponseText);
			expect(sErrorMessage).to.equal("Error from HTML!");
		});

		it("Tests getAppNamespace method", function() {

			var sAppName = "MyApp";
			var sNamespace = oRequiredABAPRepository.getAppNamespace(sAppName);
			expect(sNamespace).to.equal("sap");

			sAppName = "/MyApp";
			sNamespace = oRequiredABAPRepository.getAppNamespace(sAppName);
			expect(sNamespace).to.equal("sap");

			sAppName = "MyApp/";
			sNamespace = oRequiredABAPRepository.getAppNamespace(sAppName);
			expect(sNamespace).to.equal("sap");

			sAppName = "/MyApp/";
			sNamespace = oRequiredABAPRepository.getAppNamespace(sAppName);
			expect(sNamespace).to.equal("sap");

			sAppName = "/TEST40P/MyApp";
			sNamespace = oRequiredABAPRepository.getAppNamespace(sAppName);
			expect(sNamespace).to.equal("TEST40P");
		});

		it("Tests postFolder method - create a folder inside a folder", function() {

			// content url of "innerfolder" folder in "michalapp" application
			var sContentUrl = "/sap/bc/adt/filestore/ui5-bsp/objects/michalapp%2finnerfolder/content";
			var sName = "innerinnerfolder";
			var oDiscoveryStatus = {
				"filestore_ui5_bsp": "/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects",
				"proxyUrlPrefix": "/destinations/uia",
				"csrfToken": "dummyToken"
			};
			var oApplication = {
				"package": "dummyPackage",
				"transport": "dummyTransport"
			};

			// mock the Q.sap.ajax method, because there's no need to execute actual calls, and for some unknown reason it didn't work
			// when using the mock server.
			// the method returns the request url that was sent
			var fQSapAjax = Q.sap.ajax;
			Q.sap.ajax = function(oSettings) {
				var sRequestUrl = oSettings.url;
				return Q(sRequestUrl);
			};

			// creating "innerinnerfolder" folder in "innerfolder" folder in "michalapp" application
			// michalapp
			//    |
			//    --> innerfolder
			//             |
			//             --> innerinnerfolder
			return oRequiredABAPRepository.postFolder(sContentUrl, sName, oDiscoveryStatus, oApplication).then(function(sRequestUrl) {
				expect(sRequestUrl).to.exist;
				expect(sRequestUrl).to.equal("/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects/michalapp%2finnerfolder/content?type=folder&name=innerinnerfolder&isBinary=false&devclass=dummyPackage&corrNr=dummyTransport");
			}).finally(function() {
				// restore the send method, we want this code to run even if the promise is rejected
				Q.sap.ajax = fQSapAjax;
			});
		});

		it("Tests postFolder method - create the root folder", function() {

			var sContentUrl = " "; // root
			var sName = "michalapp";
			var oDiscoveryStatus = {
				"filestore_ui5_bsp": "/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects",
				"proxyUrlPrefix": "/destinations/uia",
				"csrfToken": "dummyToken"
			};
			var oApplication = {
				"package": "dummyPackage",
				"transport": "dummyTransport",
				"description": "this is my test application"
			};

			// mock the Q.sap.ajax method, because there's no need to execute actual calls, and for some unknown reason it didn't work
			// when using the mock server.
			// the method returns the request url that was sent
			var fQSapAjax = Q.sap.ajax;
			Q.sap.ajax = function(oSettings) {
				var sRequestUrl = oSettings.url;
				return Q(sRequestUrl);
			};

			// creating "michalapp" application
			return oRequiredABAPRepository.postFolder(sContentUrl, sName, oDiscoveryStatus, oApplication).then(function(sRequestUrl) {
				expect(sRequestUrl).to.exist;
				expect(sRequestUrl).to.equal("/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects/ /content?type=folder&name=michalapp&isBinary=false&devclass=dummyPackage&corrNr=dummyTransport&description=this+is+my+test+application");
			}).finally(function() {
				// restore the send method, we want this code to run even if the promise is rejected
				Q.sap.ajax = fQSapAjax;
			});
		});

		it("Tests postFile method - create a file inside a folder", function() {

			// content url of "innerfile" file in "innerfolder" folder in "michalapp" application
			var sContentUrl = "/sap/bc/adt/filestore/ui5-bsp/objects/michalapp%2finnerfolder/content";
			var sName = "innerfile";
			var content = "dummyContent";
			var charset = "UTF-8";
			var isBinary = "true";
			var oDiscoveryStatus = {
				"filestore_ui5_bsp": "/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects",
				"proxyUrlPrefix": "/destinations/uia",
				"csrfToken": "dummyToken"
			};
			var oApplication = {
				"package": "dummyPackage",
				"transport": "dummyTransport"
			};

			// mock the Q.sap.ajax method, because there's no need to execute actual calls, and for some unknown reason it didn't work
			// when using the mock server.
			// the method returns the request url that was sent
			var fQSapAjax = Q.sap.ajax;
			Q.sap.ajax = function(oSettings) {
				var sRequestUrl = oSettings.url;
				return Q(sRequestUrl);
			};

			// creating "innerinnerfolder" folder in "innerfolder" folder in "michalapp" application
			// michalapp
			//    |
			//    --> innerfolder
			//             |
			//             --> innerfile
			return oRequiredABAPRepository.postFile(sContentUrl, sName, content, charset, isBinary, oDiscoveryStatus, oApplication).then(function(sRequestUrl) {
				expect(sRequestUrl).to.exist;
				expect(sRequestUrl).to.equal("/destinations/uia/sap/bc/adt/filestore/ui5-bsp/objects/michalapp%2finnerfolder/content?type=file&name=innerfile&isBinary=true&devclass=dummyPackage&charset=UTF-8&corrNr=dummyTransport");
			}).finally(function() {
				// restore the send method, we want this code to run even if the promise is rejected
				Q.sap.ajax = fQSapAjax;
			});
		});

		it("Tests findParentContentUrl method", function() {
			var application = {};
			// remoteDocument2 is the parent of remoteDocument1
			var remoteDocument1 = new RemoteDocument("dummyName1", "folder", "dummyContent1", "dummyPath1", "dummyName2", "dummyContentUrl1", "dummyParentContentUrl1");
			var remoteDocument2 = new RemoteDocument("dummyName2", "folder", "dummyContent2", "dummyPath2", "dummyParent2", "dummyContentUrl2", "dummyParentContentUrl2");
			var remoteDocument3 = new RemoteDocument("dummyName3", "file", "dummyContent3", "dummyPath3", "dummyParent3", "dummyContentUrl3", "dummyParentContentUrl3");
			application.remoteDocuments = [remoteDocument1, remoteDocument2, remoteDocument3];

			var sParentName = "dummyName2";

			var parentContentUrl = oRequiredABAPRepository.findParentContentUrl(application, sParentName);
			expect(parentContentUrl).to.equal("dummyContentUrl2");

			sParentName = "someOtherDummyParent";
			parentContentUrl = oRequiredABAPRepository.findParentContentUrl(application, sParentName);
			expect(parentContentUrl).to.equal(undefined);
		});
		
		it("Tests parseDependenciesResponse method", function() {

			var oResponse;
			var sAppNamespace;
			
			// undefined input
			var aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);
			
			// empty namespace
			sAppNamespace = "";
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);

			oResponse = {
				"cus.crm.myaccounts":{
					"dependencies":[
						{"id":"cus.crm.myaccounts","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/crm_myaccounts","error":false,"noDescriptor":false}
					],
					"error":false,
					"noDescriptor":false
				}
			};
			
			sAppNamespace = "com.sap";
			
			// given namespace not in the response
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);
			
			oResponse = {
				"cus.crm.myaccounts":{
					"dependencies":[],
					"error":false,
					"noDescriptor":false
				}
			};
			
			sAppNamespace = "cus.crm.myaccounts";
			
			// no dependencies
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);
			
			oResponse = {
				"cus.crm.myaccounts":{
					"dependencies":[
						{"id":"cus.crm.myaccounts","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/crm_myaccounts","error":false,"noDescriptor":false}
					],
					"error":false,
					"noDescriptor":false
				}
			};
			
			sAppNamespace = "cus.crm.myaccounts";
			
			// with no matching dependencies - only self component
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);
			
			oResponse = {
				"cus.crm.myaccounts":{
					"dependencies":[
						{"id":"cus.crm.myaccounts","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/crm_myaccounts","error":false,"noDescriptor":false},
						{"id":"sap.ca.scfld.md","type":"UI5COMP","url":"","error":false,"noDescriptor":false},
						{"id":"sap.ca.ui","type":"UI5LIB","url":"","error":false,"noDescriptor":false},
						{"id":"sap.m","type":"UI5LIB","url":"","error":false,"noDescriptor":false},
						{"id":"sap.ui.core","type":"UI5LIB","url":"","error":false,"noDescriptor":false},
						{"id":"sap.me","type":"UI5LIB","url":"","error":false,"noDescriptor":false}
					],
					"error":false,
					"noDescriptor":false
				}
			};
			
			sAppNamespace = "cus.crm.myaccounts";
			
			// with no matching dependencies
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(0);
			
			oResponse = {
				"sap.test.multicomponent.application1":{
					"dependencies":[
						{"id":"sap.test.multicomponent.application1","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/app1","descriptorUrl":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/app1/~147A74B9AF97373CBB0FEDC2BAF1CE87~5/manifest.json","error":false,"noDescriptor":false},
						{"id":"sap.test.multicomponent.component1","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/comp1","descriptorUrl":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/comp1/~147A74B9AF97373CBB0FEDC2BAF1CE87~5/manifest.json","error":false,"noDescriptor":false},
						{"id":"sap.m","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.ui.core","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.test.multicomponent.library","type":"UI5LIB","url":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl","descriptorUrl":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/~147A74B9AF97373CBB0FEDC2BAF1CE87~5/manifest.json","error":false,"noDescriptor":false},
						{"id":"sap.ui.commons","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.ui.layout","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.ui.unified","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.test.multicomponent.application2","type":"UI5COMP","url":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/app2","descriptorUrl":"/sap/bc/ui5_ui5/sap/ui5_app_testmcl/1_1_0/app2/~147A74B9AF97373CBB0FEDC2BAF1CE87~5/manifest.json","error":false,"noDescriptor":false},
						{"id":"sap.ca.scfld.md","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false},
						{"id":"sap.ca.ui","type":"UI5LIB","url":"","descriptorUrl":"","error":false,"noDescriptor":false}
					],
					"error":false,
					"noDescriptor":false
				}
			};
			
			sAppNamespace = "sap.test.multicomponent.application1";
			
			// with matching dependencies
			aDependencies = oRequiredABAPRepository.parseDependenciesResponse(oResponse, sAppNamespace);
			expect(aDependencies.length).to.equal(3);
			expect(aDependencies[0].id).to.equal("sap.test.multicomponent.component1");
			expect(aDependencies[1].id).to.equal("sap.test.multicomponent.library");
			expect(aDependencies[2].id).to.equal("sap.test.multicomponent.application2");
		});

		afterEach(function () {
			oRequiredABAPRepository = undefined;
			/* eslint-disable no-undef */
			//If we messed up Q in the current window we reset it to be the coreQ
			Q = coreQ;
			/* eslint-enable no-undef */
		});
	});
});