define(["STF"], function (STF) {
	"use strict";

	var suiteName = "destinationTest";
	var oDestinationService, sap, jQuery, _oMockServer;
	describe("Destination test", function () {
		var getService = STF.getServicePartial(suiteName);

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/hcp/plugin/destination/config.json"
			}).then(function (webIdeWindowObj) {
				sap = webIdeWindowObj.sap;
				jQuery = webIdeWindowObj.jQuery;
				// mock the Helium /api/listDestinations
				jQuery.sap.require("sap.ui.core.util.MockServer");
				_oMockServer = new sap.ui.core.util.MockServer();
				var mockResponse = [{
					"Description": "GM6 ABAP OData",
					"Name": "gm6_abap_odata",
					"Path": "/sap/opu/odata",
					"RDEEnabled": "true",
					"RDESystem": "GM6",
					"RDEUsage": "odata_abap"
				}, {
					"Description": "GM0 ABAP OData",
					"Name": "gm0_abap_odata",
					"Path": "/sap/opu/odata",
					"RDEEnabled": "true",
					"RDESystem": "GM0",
					"RDEUsage": "odata_abap"
				}, {
					"Description": "GM1 ABAP OData",
					"Name": "gm1_abap_odata",
					"Path": "/sap/opu/odata",
					"RDEEnabled": "true",
					"RDESystem": "GM1",
					"RDEUsage": "odata_abap"
				}, {
					"Description": "GM2 ABAP OData",
					"Name": "gm2_abap_odata",
					"Path": "/sap/opu/odata",
					"RDEEnabled": "true",
					"RDESystem": "GM2",
					"RDEUsage": "odata_abap"
				}, {
					"Description": "GMX new ABAP multiple",
					"Name": "gmx_abap",
					"Path": "",
					"RDEEnabled": "true",
					"RDESystem": "GMX",
					"RDEUsage": "odata_abap,ui5_execute_abap,dev_abap"
				}, {
					"Description": "GMN new ABAP multiple",
					"Name": "gmn_abap",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMN",
					"WebIDEUsage": " odata_abap, ui5_execute_abap ,dev_abap "
				}, {
					"Description": "GMZ single custom data",
					"Name": "gmz1_abap",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMZ1",
					"WebIDEUsage": "odata_abap",
					"WebIDEAdditionalData": "data_1"
				}, {
					"Description": "BBBB",
					"Name": "zzzz",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMZ2",
					"WebIDEUsage": "odata_abap",
					"WebIDEAdditionalData": "data_1,data_2,data_3"
				}, {
					"Description": "YYYY",
					"Name": "aaaa",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMZ2",
					"WebIDEUsage": "odata_abap",
					"WebIDEAdditionalData": "data_1,data_2,data_3"
				}, {
					"Description": "GMZ multiple custom data",
					"Name": "gmz2_abap",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMZ2",
					"WebIDEUsage": "odata_abap",
					"WebIDEAdditionalData": "data_1,data_2,data_3"
				}, {
					"Description": "GMZ invalid custom data",
					"Name": "gmz3_abap",
					"Path": "",
					"WebIDEEnabled": "true",
					"WebIDESystem": "GMZ3",
					"WebIDEUsage": "odata_abap",
					"WebIDEAdditionalData": ""
				}];
				_oMockServer.setRequests([{
					method: "GET",
					path: sap.watt.getEnv("context_root") + "api/listDestinations",
					response: function (xhr) {
						xhr.respond(200, {
							"Content-Type": "application/json"
						}, JSON.stringify(mockResponse));
					}
				}]);
				_oMockServer.start();
				oDestinationService = getService("destination");
				return STF.getServicePrivateImpl(oDestinationService).then(function (oImpl) {
					//clear all destination that were loaded during stratup, in order to use only the destination from the mock response
					oImpl._mDestinations = [];
					return oDestinationService.loadDestinations();
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			_oMockServer.stop();
			_oMockServer.destroy();
		});

		describe("Test Destination API", function () {
			it("Destination API Check", function () {
				var mExpectedDestination = {
					name: "gm6_abap_odata",
					description: "GM6 ABAP OData",
					url: sap.watt.getEnv("context_root") + "destinations/gm6_abap_odata",
					path: "/sap/opu/odata",
					wattUsage: "odata_abap",
					systemId: "GM6"
				};
				return oDestinationService.getDestinations().then(function (aDestinations) {
					assert.ok(aDestinations.length > 3, "All destinations from listDestinations registered");
					return oDestinationService.getDestinations("odata_abap").then(function (aOdataDestinations) {
						assert.ok(aOdataDestinations.length > 1, "All odata destinations from listDestinations registered");
					});

					var aDestName = oDestinationService.getDestination("gm6_abap_odata");
					assert.ok(aDestName[0], "gm6_abap_odata destination exists");
					assert.equal(aDestName[0].wattUsage, mExpectedDestination.wattUsage, "The wattUsage of the destination is correct!");
					assert.equal(aDestName[0].systemId, mExpectedDestination.systemId, "The systemId of the destination is correct!");
					assert.equal(aDestName[0].url, mExpectedDestination.url, "The url of the destination is correct!");
					assert.equal(aDestName[0].path, mExpectedDestination.path, "The path of the destination is correct!");
					assert.equal(aDestName[0].description, mExpectedDestination.description, "The description of the destination is correct!");
				});

			});

			it("Destination API Check for multiple destinations - old property names", function () {
				var aExpectedDestination = [{
					name: "gmx_abap",
					description: "GMX new ABAP multiple",
					url: sap.watt.getEnv("context_root") + "destinations/gmx_abap/sap/opu/odata",
					path: "/sap/opu/odata",
					wattUsage: "odata_abap",
					systemId: "GMX",
					entryPath: "/sap/opu/odata"
				},
					{
						name: "gmx_abap",
						description: "GMX new ABAP multiple",
						url: sap.watt.getEnv("context_root") + "destinations/gmx_abap/sap/bc/ui5_ui5",
						path: "/sap/bc/ui5_ui5",
						wattUsage: "ui5_execute_abap",
						systemId: "GMX",
						entryPath: "/sap/bc/ui5_ui5"
					},
					{
						name: "gmx_abap",
						description: "GMX new ABAP multiple",
						url: sap.watt.getEnv("context_root") + "destinations/gmx_abap/sap/bc/adt",
						path: "/sap/bc/adt",
						wattUsage: "dev_abap",
						systemId: "GMX",
						entryPath: "/sap/bc/adt"
					}];
				return Q.all([oDestinationService.getDestinations(), oDestinationService.getDestinations("odata_abap"), oDestinationService.getDestination("gmx_abap")]).
					spread(function (aDestination, odata_abapDestination, gmx_abapDestination) {
						assert.ok(aDestination.length > 3, "All destinations from listDestinations registered");
						assert.ok(odata_abapDestination.length > 1, "All odata destinations from listDestinations registered");
						assert.ok(gmx_abapDestination[0], "gmx_abap destination exists");
						assert.ok(gmx_abapDestination.length == 3, "3 gmx_abap destinations exists");


						for (var i in aDestination) {
							if (aDestination[i].systemId == "GMX") {
								for (var j in aExpectedDestination) {
									if (aDestination[i].wattUsage == aExpectedDestination[j].wattUsage) {
										assert.equal(aDestination[i].name, aExpectedDestination[j].name, "The name of the destination is correct!");
										assert.equal(aDestination[i].systemId, aExpectedDestination[j].systemId, "The systemId of the destination is correct!");
										assert.equal(aDestination[i].url, aExpectedDestination[j].url, "The url of the destination is correct!");
										assert.equal(aDestination[i].path, aExpectedDestination[j].path, "The path of the destination is correct!");
										assert.equal(aDestination[i].description, aExpectedDestination[j].description, "The description of the destination is correct!");
										break;
									}
								}
							}
						}
					});

			});

			it("Destination API Check for sorted destinations", function () {
				return Q.all([oDestinationService.getDestinations(), oDestinationService.getDestinations(null, true), oDestinationService.getDestinations(null, true, "description")]).
					spread(function (aDestinations, destinationsSortedByName, destinationsSortedByDescription) {
						assert.equal(aDestinations[0].name, "gm6_abap_odata", "Unsorted - we got the first name in the list");

						function compareDestinationProperty(destinations, index, expectedValue, prop) {
							assert.equal(destinations[index][prop], expectedValue, "Sorted - we got the expected name in position " + index);
						}

						assert.equal(destinationsSortedByName.length, 15);
						function compareDestinationName(index, expectedName) {
							compareDestinationProperty(destinationsSortedByName, index, expectedName, "name");
						}

						compareDestinationName(0, "aaaa");
						compareDestinationName(1, "gm0_abap_odata");
						compareDestinationName(2, "gm1_abap_odata");
						compareDestinationName(3, "gm2_abap_odata");
						compareDestinationName(4, "gm6_abap_odata");
						compareDestinationName(5, "gmn_abap");
						compareDestinationName(6, "gmn_abap");
						compareDestinationName(7, "gmn_abap");
						compareDestinationName(8, "gmx_abap");
						compareDestinationName(9, "gmx_abap");
						compareDestinationName(10, "gmx_abap");
						compareDestinationName(11, "gmz1_abap");
						compareDestinationName(12, "gmz2_abap");
						compareDestinationName(13, "gmz3_abap");
						compareDestinationName(14, "zzzz");

						assert.equal(destinationsSortedByDescription.length, 15);
						function compareDestinationDescription(index, expectedDescription) {
							compareDestinationProperty(destinationsSortedByDescription, index, expectedDescription, "description");
						}

						compareDestinationDescription(0, "BBBB");
						compareDestinationDescription(1, "GM0 ABAP OData");
						compareDestinationDescription(2, "GM1 ABAP OData");
						compareDestinationDescription(3, "GM2 ABAP OData");
						compareDestinationDescription(4, "GM6 ABAP OData");
						compareDestinationDescription(5, "GMN new ABAP multiple");
						compareDestinationDescription(6, "GMN new ABAP multiple");
						compareDestinationDescription(7, "GMN new ABAP multiple");
						compareDestinationDescription(8, "GMX new ABAP multiple");
						compareDestinationDescription(9, "GMX new ABAP multiple");
						compareDestinationDescription(10, "GMX new ABAP multiple");
						compareDestinationDescription(11, "GMZ invalid custom data");
						compareDestinationDescription(12, "GMZ multiple custom data");
						compareDestinationDescription(13, "GMZ single custom data");
						compareDestinationDescription(14, "YYYY");
					});

			});

			it("Destination additional data Check", function () {
				return Q.all([oDestinationService.getDestination("gmz1_abap"), oDestinationService.getDestination("gmz2_abap"), oDestinationService.getDestination("gmz3_abap")])
					.spread(function (gmz1_abap, gmz2_abap, gmz3_abap) {
						assert.ok(gmz1_abap[0], "gmz1_abap destination exists");
						assert.equal(gmz1_abap[0].additionalData.length, 1, "The number of custom data is correct!");
						assert.equal(gmz1_abap[0].additionalData[0], "data_1", "The additional data of the destination is correct!");
						assert.ok(gmz2_abap[0], "gmz2_abap destination exists");
						assert.equal(gmz2_abap[0].additionalData.length, 3, "The number of custom data is correct!");
						assert.equal(gmz2_abap[0].additionalData[0], "data_1", "The additional data of the destination is correct!");
						assert.equal(gmz2_abap[0].additionalData[1], "data_2", "The additional data of the destination is correct!");
						assert.equal(gmz2_abap[0].additionalData[2], "data_3", "The additional data of the destination is correct!");
						assert.ok(gmz3_abap[0], "gmz3_abap destination exists");
						assert.equal(gmz3_abap[0].additionalData.length, 0, "The number of custom data is correct!");
					});
			});
		});
	});
});