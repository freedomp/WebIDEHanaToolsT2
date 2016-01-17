define(['STF'], function (STF) {

	"use strict";

	var suiteName = "Transport_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("Service tests for Transport service", function () {
		var oTransport;
		var oMockServer;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oTransport = getService('transport');

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");

				var discoveryResponse =   "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
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
						method: "POST",
						// mock the call for transports
						path: new iFrameWindow.RegExp(".*/cts/transports"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/octet-stream"
							}, "/com.sap.cts/object_record/dummyTransportRequest");
						}
					},{
						method: "GET",
						// mock the call to get discovery xml
						path: new iFrameWindow.RegExp(".*/discovery"),
						response: function (oXhr) {
							oXhr.respond(200, {
								"Content-Type": "application/octet-stream"
							},
							discoveryResponse);
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
						method: "POST",
						path: new iFrameWindow.RegExp(".*adt/cts/transportchecks"),
						response: function (oXhr) {
							if (oXhr.url.indexOf("gm6") >= 0) {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								"<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">" +
								"<asx:values><DATA><PGMID>R3TR</PGMID><OBJECT>WAPA</OBJECT><OBJECTNAME>HSDFHFDH</OBJECTNAME><OPERATION>I</OPERATION>" +
								"<DEVCLASS>TESTVEVPACK</DEVCLASS><CTEXT>testpackveve</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>TAGOR</AS4USER><PDEVCLASS/>" +
								"<DLVUNIT>LOCAL</DLVUNIT><NAMESPACE>/*/</NAMESPACE><RESULT>S</RESULT><RECORDING>X</RECORDING><EXISTING_REQ_ONLY/><MESSAGES/>" +
								"<REQUESTS><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022439</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/>" +
								"<AS4USER>KEIDAR</AS4USER><AS4DATE>2014-07-22</AS4DATE><AS4TIME>13:05:11</AS4TIME><AS4TEXT>reqdesc</AS4TEXT><CLIENT>000</CLIENT>" +
								"</REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022874</TRKORR><TRFUNCTION>K</TRFUNCTION>" +
								"<TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-07-30</AS4DATE><AS4TIME>11:32:15</AS4TIME>" +
								"<AS4TEXT>hello tagor11</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST></REQUESTS><LOCKS/>" +
								"<TADIRDEVC>TESTVEVPACK</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/hsdfhfdh/$create</URI></DATA></asx:values></asx:abap>");
							} else {
								oXhr.respond(200, {
									"Content-Type": "application/octet-stream"
								},
								"<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\"><asx:values><DATA><PGMID>LIMU</PGMID><OBJECT>WAPP</OBJECT><OBJECTNAME>MICHAL4" +
								"UI5REPOSITORYPATHMAPPING.XML</OBJECTNAME><OPERATION/><DEVCLASS>TESTMIKI</DEVCLASS><CTEXT>ttt</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>KEIDAR</AS4USER><PDEVCLASS/><DLVUNIT>LOCAL</DLVUNIT>" +
								"<NAMESPACE>/*/</NAMESPACE><RESULT>S</RESULT><RECORDING/><EXISTING_REQ_ONLY>X</EXISTING_REQ_ONLY><MESSAGES/><REQUESTS/><LOCKS><CTS_OBJECT_LOCK><OBJECT_KEY><PGMID>LIMU</PGMID><OBJECT>WAPP</OBJECT><OBJ_NAME>MICHAL4" +
								"UI5REPOSITORYPATHMAPPING.XML</OBJ_NAME></OBJECT_KEY><LOCK_HOLDER><REQ_HEADER><TRKORR>UIAK023495</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-08-11</AS4DATE>" +
								"<AS4TIME>13:08:54</AS4TIME><AS4TEXT>michal4</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS><CTS_TASK_HEADER><TRKORR>UIAK023496</TRKORR><TRFUNCTION>S</TRFUNCTION><TRSTATUS>D</TRSTATUS><AS4USER>TAGOR</AS4USER>" +
								"<AS4DATE>2014-08-11</AS4DATE><AS4TIME>13:08:56</AS4TIME><AS4TEXT>michal4</AS4TEXT></CTS_TASK_HEADER></TASK_HEADERS></LOCK_HOLDER></CTS_OBJECT_LOCK></LOCKS><TADIRDEVC>TESTMIKI</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/MICHAL4/$new</URI></DATA></asx:values></asx:abap>");
							}
						}
					}]
				});

				oMockServer.start();
			});
		});

		it("Tests createTransport method", function() {

			var packageName = "TestPackage";
			var applicationName = "My Deployed Application";
			var description = "My test application";
			var destination = {};
			destination.proxyUrlPrefix = "/destinations/uia";
			destination.wattUsage = "dev_abap";

			return oTransport.createTransport(packageName, applicationName, description, destination).then(function (oResult) {
				expect(oResult).to.equal("dummyTransportRequest");
			});
		});

		it("Tests getApplicationInfo method", function() {

			var applicationName = "My Deployed Application";
			var destination = {};
			destination.proxyUrlPrefix = "/destinations/uia";
			destination.wattUsage = "dev_abap";

			return oTransport.getApplicationInfo(applicationName, destination).then(function(oResult) {
				var transport = oResult.transportValue;
				var packageName = oResult.packageValue;
				expect(transport).to.equal("UIAK023495");
				expect(packageName).to.equal("TESTMIKI");
			});
		});

		it("Tests getTransports method", function() {

			var applicationName = "My Deployed Application";
			var packageName = "dummyPackage";
			var destination = {};
			destination.proxyUrlPrefix = "/destinations/gm6";
			destination.wattUsage = "dev_abap";

			return oTransport.getTransports(packageName, applicationName, destination).then(function(oResult) {
				var $xml = $(iFrameWindow.jQuery.sap.parseXML(oResult));
				var result = $xml.find("RESULT").text();
				var recording = $xml.find("RECORDING").text();
				var $requests = $xml.find("REQ_HEADER");
				var locked = $xml.find("LOCKS").text();

				expect(result).to.equal("S");
				expect(recording).to.equal("X");
				expect($requests).to.exist;
				expect(locked).to.equal("");
			});
		});

		it("Tests analyseTransportsResponse method", function() {

			var sTransportsResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">" +
				"<asx:values><DATA><PGMID>R3TR</PGMID><OBJECT>WAPA</OBJECT><OBJECTNAME>HSDFHFDH</OBJECTNAME><OPERATION>I</OPERATION>" +
				"<DEVCLASS>TESTVEVPACK</DEVCLASS><CTEXT>testpackveve</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>TAGOR</AS4USER><PDEVCLASS/>" +
				"<DLVUNIT>LOCAL</DLVUNIT><NAMESPACE>/*/</NAMESPACE><RESULT>S</RESULT><RECORDING></RECORDING><EXISTING_REQ_ONLY/><MESSAGES/>" +
				"<REQUESTS><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022439</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/>" +
				"<AS4USER>KEIDAR</AS4USER><AS4DATE>2014-07-22</AS4DATE><AS4TIME>13:05:11</AS4TIME><AS4TEXT>reqdesc</AS4TEXT><CLIENT>000</CLIENT>" +
				"</REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022874</TRKORR><TRFUNCTION>K</TRFUNCTION>" +
				"<TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-07-30</AS4DATE><AS4TIME>11:32:15</AS4TIME>" +
				"<AS4TEXT>hello tagor11</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST></REQUESTS><LOCKS/>" +
				"<TADIRDEVC>TESTVEVPACK</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/hsdfhfdh/$create</URI></DATA></asx:values></asx:abap>";

			var transportsResponse = $(iFrameWindow.jQuery.sap.parseXML(sTransportsResponse))[0];

			// positive flow - local package
			return oTransport.analyseTransportsResponse(transportsResponse).then(function(oResult1) {
				expect(oResult1.status).to.equal(8); // TRANSPORT_STATUS_LOCAL_PACKAGE

				sTransportsResponse = "";

				// negative flow - empty response
				return oTransport.analyseTransportsResponse(sTransportsResponse).then(function(oResult2) {
					expect(oResult2.status).to.equal(5); // TRANSPORT_STATUS_E

					sTransportsResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">" +
						"<asx:values><DATA><PGMID>R3TR</PGMID><OBJECT>WAPA</OBJECT><OBJECTNAME>HSDFHFDH</OBJECTNAME><OPERATION>I</OPERATION>" +
						"<DEVCLASS>TESTVEVPACK</DEVCLASS><CTEXT>testpackveve</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>TAGOR</AS4USER><PDEVCLASS/>" +
						"<DLVUNIT>LOCAL</DLVUNIT><NAMESPACE>/*/</NAMESPACE><RESULT>S</RESULT><RECORDING>X</RECORDING><EXISTING_REQ_ONLY/><MESSAGES/>" +
						"<REQUESTS><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022439</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/>" +
						"<AS4USER>KEIDAR</AS4USER><AS4DATE>2014-07-22</AS4DATE><AS4TIME>13:05:11</AS4TIME><AS4TEXT>reqdesc</AS4TEXT><CLIENT>000</CLIENT>" +
						"</REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022874</TRKORR><TRFUNCTION>K</TRFUNCTION>" +
						"<TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-07-30</AS4DATE><AS4TIME>11:32:15</AS4TIME>" +
						"<AS4TEXT>hello tagor11</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST></REQUESTS><LOCKS/>" +
						"<TADIRDEVC>TESTVEVPACK</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/hsdfhfdh/$create</URI></DATA></asx:values></asx:abap>";

					transportsResponse = $(iFrameWindow.jQuery.sap.parseXML(sTransportsResponse))[0];

					// positive flow - non local package
					return oTransport.analyseTransportsResponse(transportsResponse).then(function(oResult3) {
						expect(oResult3.data.transports.length).to.equal(2);
						expect(oResult3.status).to.equal(4); // TRANSPORT_STATUS_S

						sTransportsResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?><asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">" +
							"<asx:values><DATA><PGMID>R3TR</PGMID><OBJECT>WAPA</OBJECT><OBJECTNAME>HSDFHFDH</OBJECTNAME><OPERATION>I</OPERATION>" +
							"<DEVCLASS>TESTVEVPACK</DEVCLASS><CTEXT>testpackveve</CTEXT><KORRFLAG>X</KORRFLAG><AS4USER>TAGOR</AS4USER><PDEVCLASS/>" +
							"<DLVUNIT>LOCAL</DLVUNIT><NAMESPACE>/*/</NAMESPACE><RESULT>E</RESULT><RECORDING>X</RECORDING><EXISTING_REQ_ONLY/><MESSAGES/>" +
							"<REQUESTS><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022439</TRKORR><TRFUNCTION>K</TRFUNCTION><TRSTATUS>D</TRSTATUS><TARSYSTEM/>" +
							"<AS4USER>KEIDAR</AS4USER><AS4DATE>2014-07-22</AS4DATE><AS4TIME>13:05:11</AS4TIME><AS4TEXT>reqdesc</AS4TEXT><CLIENT>000</CLIENT>" +
							"</REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST><CTS_REQUEST><REQ_HEADER><TRKORR>UIAK022874</TRKORR><TRFUNCTION>K</TRFUNCTION>" +
							"<TRSTATUS>D</TRSTATUS><TARSYSTEM/><AS4USER>TAGOR</AS4USER><AS4DATE>2014-07-30</AS4DATE><AS4TIME>11:32:15</AS4TIME>" +
							"<AS4TEXT>hello tagor11</AS4TEXT><CLIENT>000</CLIENT></REQ_HEADER><REQ_ATTRS/><TASK_HEADERS/></CTS_REQUEST></REQUESTS><LOCKS/>" +
							"<TADIRDEVC>TESTVEVPACK</TADIRDEVC><URI>/sap/bc/adt/filestore/ui5-bsp/objects/hsdfhfdh/$create</URI></DATA></asx:values></asx:abap>";

						transportsResponse = $(iFrameWindow.jQuery.sap.parseXML(sTransportsResponse))[0];

						// negative flow - error in response
						return oTransport.analyseTransportsResponse(transportsResponse).then(function(oResult4) {
							expect(oResult4.status).to.equal(5); // TRANSPORT_STATUS_E
						});
					});
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
