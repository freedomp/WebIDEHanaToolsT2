define(['STF'], function (STF) {

	"use strict";

	var suiteName = "Discovery_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("Service tests for Discovery service", function () {
		var oDiscovery;
		var oMockServer;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oDiscovery = getService('discovery');

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");

				var sDiscoveryXml =   "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
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

				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						// mock the call to get discovery xml
						path: new iFrameWindow.RegExp(".*/discovery"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/octet-stream"
							}, sDiscoveryXml);
						}
					}]
				});

				oMockServer.start();
			});
		});

		// TODO: this test will only pass after destinations are supported in karma (work in progress by DevOps)
		it.skip("Tests getStatusBySystem method", function() {

			var oSystem = {
				"description": "ABAP Backend System - for testing!",
				"entryPath": undefined,
				"name": "abap_backend",
				"path": "/sap/bc/adt",
				"sapClient": "",
				"systemId": "GM6",
				"url": "/destinations/abap_backend",
				"wattUsage": "dev_abap",
				"proxyUrlPrefix": "/destinations/abap_backend"
			};

			return oDiscovery.getStatusBySystem(oSystem).then(function(oResult) {
				expect(oResult.description.indexOf("ABAP Backend System")).to.equal(0);
				expect(oResult.proxyUrlPrefix).to.equal(sap.watt.getEnv("context_root") + "destinations/abap_backend");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});
	});
});
