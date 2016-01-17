define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "destinationsUtil";

	describe("Destinations Utility", function() {
		var oFakeFileDAO;
		var oDestination;
		var oNeoBEs;
		var oDestinationsUtil;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/destinationsutil/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oDestination = STF.getService(suiteName, "destination");
				oNeoBEs = STF.getService(suiteName, "appmetadata");
				oDestinationsUtil = STF.getService(suiteName, "destinationsutil");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test get Neo-App Destinations",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				var oNeoApp = {
					"routes": [{
						"target": {
							"name": "QEK",
							"type": "destination"
						}
					}, {
						"path": "/test-ser",
						"target": {
							"name": "testService",
							"type": "service",
							"entryPath": "/test-ser"
						},
						"description": "Test service"
					}, {
						"path": "/test-ser",
						"target": {
							"name": "testService",
							"type": "service",
							"entryPath": "/test-ser"
						},
						"description": "Test service"
					}, {
						"target": {
							"name": "GM6",
							"type": "destination",
							"entryPath": "/test-ser"
						}
					}, {
						"path": "/test-ser",
						"target": {
							"name": "QEK",
							"type": "destination",
							"entryPath": "/test-ser"
						},
						"description": "Test service"
					}]
				};
				var aDestinations = [{
					name: "GM6"
				}, {
					name: "QEK"
				}, {
					name: "GMO"
				}, {
					name: "UIA"
				}, {
					name: "GIQ"
				}];

				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));
				sandbox.stub(oNeoBEs, "getNeoMetadata").returns(Q(oNeoApp));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oDestinationsUtil.getNeoAppDestinations(oDocument).then(function(aBackends) {
							var aExcpectedBackends = ["GM6", "QEK"];
							assert.deepEqual(aBackends, aExcpectedBackends);
						});
					});
				});
			});

		it("Test get empty Neo-App Destinations",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				var aDestinations = [{
					name: "GM6"
				}, {
					name: "QEK"
				}, {
					name: "GMO"
				}, {
					name: "UIA"
				}, {
					name: "GIQ"
				}];
				// Empty Neo-app file
				var oNeoApp1 = [];

				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));
				sandbox.stub(oNeoBEs, "getNeoMetadata").returns(Q(oNeoApp1));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oDestinationsUtil.getNeoAppDestinations(oDocument).then(function(aBackends) {
							var aExcpectedBackends = [];
							assert.deepEqual(aBackends, aExcpectedBackends);
						});
					});
				});
			});

		it("Test get Hcp Destinations",
			function() {
				var aDestinations = [{
					name: "BBB"
				}, {
					name: "AAA"
				}, {
					name: "BBB"
				}, {
					name: "UUU"
				}, {
					name: "KKK"
				}];

				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));

				return oDestinationsUtil.getHcpDestinations().then(function(aHcpDestinations) {
					var aExcpectedHcpDestinations = ["AAA", "BBB", "KKK", "UUU"];
					assert.deepEqual(aHcpDestinations, aExcpectedHcpDestinations);
				});
			});

		it("Test get empty Hcp Destinations 1",
			function() {
				var aDestinations = [{
					name: ""
				}, {
					name: ""
				}];
				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));
				return oDestinationsUtil.getHcpDestinations().then(function(aHcpDestinations) {
					var aExcpectedHcpDestinations = [""];
					assert.deepEqual(aHcpDestinations, aExcpectedHcpDestinations);
				});
			});

		it("Test get empty Hcp Destinations 2",
			function() {
				var aDestinations = [];
				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));
				return oDestinationsUtil.getHcpDestinations().then(function(aHcpDestinations) {
					var aExcpectedHcpDestinations = [];
					assert.deepEqual(aHcpDestinations, aExcpectedHcpDestinations);
				});
			});
	});
});