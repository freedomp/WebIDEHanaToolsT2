define(['STF'], function (STF) {

	"use strict";

	var suiteName = "Search_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("Service tests for Search service", function () {
		var oSearch;
		var oMockServer;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oSearch = getService('search');

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");

				// the response when searching for "TESTV" on UIA
				var contentXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
					"<adtcore:objectReferences xmlns:adtcore=\"http://www.sap.com/adt/core\">" +
					"<adtcore:objectReference adtcore:uri=\"/sap/bc/adt/vit/wb/object_type/devck/object_name/TESTVEVIPACK\" adtcore:type=\"DEVC/K\" adtcore:name=\"TESTVEVIPACK\"/>" +
					"<adtcore:objectReference adtcore:uri=\"/sap/bc/adt/vit/wb/object_type/devck/object_name/TESTVEVPACK\" adtcore:type=\"DEVC/K\" adtcore:name=\"TESTVEVPACK\"/>" +
					"</adtcore:objectReferences>";

				oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
					rootUri: "",
					requests: [{
						method: "GET",
						// mock the call to search for packages
						path: new iFrameWindow.RegExp(".*?operation=quickSearch.*"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/xml;charset=utf-8"
							}, contentXmlString);
						}
					}]
				});

				oMockServer.start();
			});
		});

		it("Tests getPackages method", function() {

			var oDiscoveryStatus = {
				"search" : "/destinations/uia_abap_dev/repository/informationsystem/search",
				"csrfToken" : "dummyToken",
				"description" : "UIA"
			};
			var phrase = "testv";

			// positive flow
			return oSearch.getPackages(oDiscoveryStatus, phrase).then(function(aResult1) {
				expect(aResult1.length).to.equal(2);
				expect(aResult1[0].name).to.equal("TESTVEVIPACK");
				expect(aResult1[1].name).to.equal("TESTVEVPACK");

				oDiscoveryStatus = {
					"search" : null, // no search!
					"csrfToken" : "dummyToken",
					"description" : "UIA"
				};

				// negative flow - expect the promise to fail
				return oSearch.getPackages(oDiscoveryStatus, phrase).fail(function(oError) {
					expect(oError.message).to.equal("search service was not found on UIA");
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});
	});
});
