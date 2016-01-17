"use strict";
define(['STF', "sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/service/BSPParentProject", "sap/watt/lib/jszip/jszip-shim"], function(
	STF, BSPParentProject, JSZip) {
	var suiteName = "BSPParentProject_Service";

	describe('BSPParentProject Service', function() {

		var oBSPParentProjectService;
		var oMockServer;
		var iFrameWindow;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "extensibility/config.json"
			});
			return loadWebIdePromise.then(function(_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				// get services
				oBSPParentProjectService = STF.getService(suiteName, "bspparentproject");

				var response1 = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
					"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<atom:author/>" +
					"<atom:category term=\"file\"/>" +
					"<atom:content type=\"application/atom+xml;type=feed\" src=\"./michalapp%2finnerfolder%2finnerfile.js/content\"/>" +
					"<atom:contributor/>" +
					"<atom:id>ZMICHAL%2fmichalapp%2finnerfolder%2finnerfile.js</atom:id>" +
					"<atom:link href=\"../appindex/michalapp\" rel=\"appindex\"/>" +
					"<atom:link href=\"./michalapp%2finnerfolder%2finnerfile.js\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
					"<atom:summary type=\"text\"/>" +
					"<atom:title>michalapp/innerfolder/innerfile.js</atom:title>" +
					"</atom:entry>" +
					"</atom:feed>";

				//var response2 = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>" +
				//	"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
				//	"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
				//	"<atom:id>HCM_LR_CRE%2fi18n%2fi18n.properties</atom:id>" +
				//	"</atom:entry>" +
				//	"</atom:feed>";

				var response2 = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
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

				var response3 = "#<Describe your application/i18n file here; required for translation>" +
					"# __ldi.translation.uuid=f1cc3a20-25d2-11e3-8224-0800200c9a66" +
					"#XTIT: this is the title for the master section" +
					"MASTER_TITLE=Purchase Orders ({0})" +
					"#XTIT: this is the title for the detail section" +
					"DETAIL_TITLE=Purchase Order";

				var response4 = "sap.ui.controller(\"MM_PO_APV.view.S3\", {});";

				var response5 = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>" +
					"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
					"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
					"<atom:category term=\"folder\" />" +
					"<atom:id>MM_PO_APV%2fmodel</atom:id>" +
					"</atom:entry>" +
					"</atom:feed>";

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						// mock the call that gets the content of ZMICHAL resource
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects/ZMICHAL/content.*"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, response1);
						}
					}, {
						method: "GET",
						// mock the call that gets the content of an i18n folder
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects/MM_PO_APV%2Fi18n/content.*"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, response2);
						}
					}, {
						method: "GET",
						// mock the call that gets the content of an i18n properties file
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects/MM_PO_APV%2Fi18n%2Fi18n.properties/content.*"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, response3);
						}
					}, {
						method: "GET",
						// mock the call that gets the content of S3.controller.js file
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects/MM_PO_APV%2Fview%2FS3.controller.js/content.*"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, response4);
						}
					}, {
						method: "GET",
						// mock the call that gets the content of model folder
						path: new iFrameWindow.RegExp(".*/filestore/ui5-bsp/objects/MM_PO_APV%2Fmodel/content.*"),
						response: function(oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, response5);
						}
					}]
				});

				oMockServer.start();
			});
		});

		it("Tests getFileResourcesInfo method", function() {

			var applicationPath = "ZMICHAL";
			var system = {
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
			var applicationLocalName = "/Flights";

			// mock the getStatusBySystem method
			oBSPParentProjectService.context.service.discovery.getStatusBySystem = function() {
				var oMockStatus = {
					ato_settings: "/destinations/UIA/sap/bc/adt/ato/settings",
					csrfToken: "FENV__zACyLIPiz64F4XZw==",
					description: "UIA",
					proxyUrlPrefix: "/destinations/UIA",
					search: "/destinations/UIA/sap/bc/adt/repository/informationsystem/search",
					transports: "/destinations/UIA/sap/bc/adt/cts/transports",
					transportchecks: "/destinations/UIA/sap/bc/adt/cts/transportchecks",
					filestore_ui5_bsp: "/destinations/UIA/sap/bc/adt/filestore/ui5-bsp/objects"
				};
				return Q(oMockStatus);
			};

			return oBSPParentProjectService.getFileResourcesInfo(applicationPath, system, applicationLocalName).then(function(aResourcesInfo) {
				expect(aResourcesInfo).to.exist;
				expect(aResourcesInfo.length).to.equal(1);
				expect(aResourcesInfo[0].localFullName).to.equal(applicationLocalName + "/michalapp/innerfolder/innerfile.js");
				expect(aResourcesInfo[0].parentFolderPath).to.equal("ZMICHAL/michalapp/innerfolder");
				expect(aResourcesInfo[0].name).to.equal("innerfile.js");
			});
		});

		it("Tests getRuntimeDestinations method", function() {

			var system = {
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

			// mock the getDestinations method
			oBSPParentProjectService.context.service.destination.getDestinations = function() {
				var aMockDestinations = []; // no destinations
				return Q(aMockDestinations);
			};

			return oBSPParentProjectService.getRuntimeDestinations(system).then(function(aRuntimeDestinations1) {
				expect(aRuntimeDestinations1.length).to.equal(0);

				// mock the getDestinations method
				oBSPParentProjectService.context.service.destination.getDestinations = function() {
					var oMockDestination1 = {
						description: "UIA",
						entryPath: "/sap/bc/adt",
						name: "UIA",
						path: "/sap/bc/adt",
						proxyUrlPrefix: "/destinations/UIA",
						sapClient: "",
						systemId: "UIA",
						url: "/destinations/UIA/sap/bc/adt",
						wattUsage: "odata_abap"
					};

					var oMockDestination2 = {
						description: "GM6",
						entryPath: "/sap/bc/adt",
						name: "GM6",
						path: "/sap/bc/adt",
						proxyUrlPrefix: "/destinations/GM6",
						sapClient: "",
						systemId: "GM6",
						url: "/destinations/UIA/sap/bc/adt",
						wattUsage: "dev_abap"
					};

					var aMockDestinations = [oMockDestination1, oMockDestination2];
					return Q(aMockDestinations);
				};

				return oBSPParentProjectService.getRuntimeDestinations(system).then(function(aRuntimeDestinations2) {
					expect(aRuntimeDestinations2.length).to.equal(1);

					// mock the getDestinations method
					oBSPParentProjectService.context.service.destination.getDestinations = function() {

						var oMockDestination1 = {
							description: "GM6",
							entryPath: "/sap/bc/adt",
							name: "GM6",
							path: "/sap/bc/adt",
							proxyUrlPrefix: "/destinations/GM6",
							sapClient: "",
							systemId: "GM6",
							url: "/destinations/UIA/sap/bc/adt",
							wattUsage: "odata_abap"
						};

						var aMockDestinations = [oMockDestination1];
						return Q(aMockDestinations);
					};

					return oBSPParentProjectService.getRuntimeDestinations(system).then(function(aRuntimeDestinations3) {
						expect(aRuntimeDestinations3.length).to.equal(0);

						// undefined input
						return oBSPParentProjectService.getRuntimeDestinations(undefined).then(function(aRuntimeDestinations4) {
							expect(aRuntimeDestinations4.length).to.equal(0);

							// mock the getDestinations method
							oBSPParentProjectService.context.service.destination.getDestinations = function() {

								var oMockDestination1 = {
									description: "GM6",
									entryPath: "/sap/bc/adt",
									name: "GM6",
									path: "/sap/bc/adt",
									proxyUrlPrefix: "/destinations/GM6",
									sapClient: "",
									systemId: "GM6",
									url: "/destinations/UIA/sap/bc/adt",
									wattUsage: "bsp_execute_abap"
								};

								var aMockDestinations = [oMockDestination1];
								return Q(aMockDestinations);
							};

							// with no proper usage
							return oBSPParentProjectService.getRuntimeDestinations(system).then(function(aRuntimeDestinations5) {
								expect(aRuntimeDestinations5.length).to.equal(0);
							});
						});
					});
				});
			});
		});

		it("Tests geti18nFolderFiles method", function() {

			var system = {
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

			// mock the getDestinations method
			oBSPParentProjectService.context.service.destination.getDestinations = function() {

				var oMockDestination1 = {
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

				var aMockDestinations = [oMockDestination1];
				return Q(aMockDestinations);
			};

			var i18nFolderPath = "MM_PO_APV%2fi18n";

			return oBSPParentProjectService.geti18nFolderFiles(i18nFolderPath, system).then(function(ai18nFolderFiles) {
				expect(ai18nFolderFiles).to.exist;
				expect(ai18nFolderFiles.length).to.equal(1);
				expect(ai18nFolderFiles[0].getEntity().getName()).to.equal("i18n.properties");
			});
		});

		it("Tests getDocument method", function() {

			var system = {
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

			// test getDocument of mock S3.controller.js from MM_PO_APV on UIA
			var resourcePath = "MM_PO_APV%2fview%2fS3.controller.js";
			var resourceType = "file";

			return oBSPParentProjectService.getDocument(resourcePath, resourceType, system).then(function(oDocument) {
				expect(oDocument).to.exist;
				expect(oDocument.getEntity().getName()).to.equal("S3.controller.js");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});
	});

	describe('BSPParentProject Unit', function() {
		var _BSPParentProject;
		beforeEach(function() {
			_BSPParentProject = new BSPParentProject();
		});

		it("Updates neoapp", function() {
			// Preparations
			var SYSTEM_ID = "GM6";
			var NAME = "abap_backend";
			var SAP_CLIENT = "001";
			var DESCRIPTION = "ABAP Backend System - for testing!";
			var WATT_USAGE = "odata_abap";
			var selectedDestination = {
				systemId: SYSTEM_ID,
				name: NAME,
				sapClient: SAP_CLIENT,
				description: DESCRIPTION,
				wattUsage: WATT_USAGE
			};
			var ANOTHER_NAME = "another_name";
			var ANOTHER_DESCRIPTION = "Another description";
			var similarDestination = {
				systemId: SYSTEM_ID,
				name: ANOTHER_NAME,
				sapClient: SAP_CLIENT,
				description: ANOTHER_DESCRIPTION,
				wattUsage: WATT_USAGE
			};
			var DEPENDENCY_DESCRIPTION = "dummy.dependency.id Reuse Library";
			var DEPENDENCY_PATH = "/resources/dummy.dependency.id";
			var DEPENDENCY_ENTRY_PATH = "dummy/dependency/url";

			var aDestinations = [similarDestination, selectedDestination];
			var aRoutes = [];
			_BSPParentProject.context = {
				service: {
					destination: {
						getDestinations: function() {
							return Q(aDestinations);
						}
					},
					neoapp: {
						addDestinations: function(routes) {
							aRoutes = aRoutes.concat(routes);
							return Q(aRoutes);
						}
					},
					ui5projecthandler: {
						isManifestProjectGuidelinesType: function() {
							return Q(true);
						},
						getAppNamespace: function() {
							return Q("dummyNamespace");
						}
					},
					abaprepository: {
						getDependenciesAsNeoappRoutes: function() {
							var oDependency = {
								"path" : DEPENDENCY_PATH,
								"target" :{
									"type" : "destination",
									"name" : "GM6",
									"entryPath" : DEPENDENCY_ENTRY_PATH,
									"preferLocal": true
								},
								"description": DEPENDENCY_DESCRIPTION
							};
							
							return Q([oDependency]);
						}
					}
				}
			};
			
			var oComponentResourceInfo = {
				"path" : "MyApp%2fComponent.js"	
			};
			
			// The test
			expect(aRoutes.length).to.equal(0);
			return _BSPParentProject._updateNeoAppJson(selectedDestination, undefined, oComponentResourceInfo).then(function() {
				expect(aRoutes.length).to.equal(3);
				expect(aRoutes[0].target.name).to.equal(NAME);
				expect(aRoutes[0].description).to.equal(DESCRIPTION);
				expect(aRoutes[1].target.name).to.equal(NAME);
				expect(aRoutes[1].description).to.equal(DESCRIPTION);
				expect(aRoutes[2].description).to.equal(DEPENDENCY_DESCRIPTION);
				expect(aRoutes[2].path).to.equal(DEPENDENCY_PATH);
				expect(aRoutes[2].target.entryPath).to.equal(DEPENDENCY_ENTRY_PATH);
				expect(aRoutes[2].target.type).to.equal("destination");
			});
		});

		it("Get local full name", function() {
			var remoteName = "abapName";
			var workspaceName = "/workspaceName";
			var resourcePath = "/real/path/of/file.js";
			var encodedPath = (remoteName + resourcePath).replace(/\//g, "%2f");
			var localFullName = _BSPParentProject._getLocalFullName(encodedPath, remoteName, workspaceName);
			expect(localFullName).to.equal(workspaceName + resourcePath);
		});

		it("Return empty string for missing arguments in _getLocalFullName", function() {
			// Empty arguments
			var localFullName = _BSPParentProject._getLocalFullName();
			expect(localFullName).to.equal("");
		});

		it("handleSingleFileFromBsp during import of app with namespace", function() {
			// Mock file content response
			var sFileContent = "sap.ui.controller(\"my.app.view.S3\", {});";
			_BSPParentProject.getResponse = function(path) {
				return Q(sFileContent);
			};

			// Test handle file from app /UI2/MYAPP (with namespace)
			var resourceInfo = {
				path: "%2fUI2%2fMYAPP%2fview%2fS3.controller.js",
				type: "file"
			};
			var applicationName = "/UI2/MYAPP";
			var path = "/destinations/UIA/sap/bc/adt" + "/filestore/ui5-bsp/objects/" + resourceInfo.path + "/content";
			var oImportProjectZip = new JSZip();
			var system = {};

			return _BSPParentProject.handleSingleFileFromBsp(path, resourceInfo, applicationName, system, oImportProjectZip).then(function() {
				var oFile = oImportProjectZip.file("view/S3.controller.js");
				expect(oFile).to.exist;
				expect(oFile.asText()).to.equal(sFileContent);
				expect(oFile.options.dir).to.equal(false);
			});

		});
	});
});