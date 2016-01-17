define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "switchBackends";

	describe("Common Runners - SwitchBackends", function() {
		var oFakeFileDAO;
		var oDestination;
		var oNeoBEs;
		var oSwitchBackends;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/commonrunners/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oDestination = STF.getService(suiteName, "destination");
				oNeoBEs = STF.getService(suiteName, "appmetadata");
				oSwitchBackends = STF.getService(suiteName, "switchbackends");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test relevant backends",
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
							"name": "GM6",
							"type": "destination"
						}
					}, {
						"target": {
							"name": "QEK",
							"type": "destination"
						}
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
						return oSwitchBackends.getBackendsInfo(oDocument).then(function(oBackends) {
							expect(oBackends.aBackendSystems.length).to.equal(2);
							expect(oBackends.aBackendSystems[1].source).to.equal("QEK");
						});
					});
				});
			});

		it("Test empty backends",
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

				var oNeoApp1 = [];

				sandbox.stub(oDestination, "getDestinations").returns(Q(aDestinations));
				sandbox.stub(oNeoBEs, "getNeoMetadata").returns(Q(oNeoApp1));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oSwitchBackends.getBackendsInfo(oDocument).then(function(oBackends) {
							expect(oBackends.aBackendSystems.length).to.equal(0);
						});
					});
				});
			});

		it("Test update of existing runners",
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

				var oBackends = {
					"aBackendSystems": [{
						"source": "GM6",
						"destnations": "gm0_client_200"
					}, {
						"source": "UIA",
						"destnations": "uia"
					}]
				};

				var oConfiguration = {
					"backendSystem": [{
						"source": "GM6",
						"destinations": "gm0_client_200"
					}, {
						"source": "UIA",
						"destinations": "uia"
					}],
					"destBackendSystem": ["GM6", "uia", "QEK"]
				};

				sandbox.stub(oSwitchBackends, "getBackendsInfo").returns(Q(oBackends));
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oSwitchBackends.getExistingRunnersBackendsInfo(oDocument, oConfiguration).then(function(oNewConfiguration) {
							expect(oNewConfiguration.backendSystem.length).to.equal(2);
							expect(oNewConfiguration.destBackendSystem.length).to.equal(3);
						});
					});
				});
			});

		it("Test update of existing runners - empty neo-app file",
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

				var oConfiguration = {
					"backendSystem": [{
						"source": "GM6",
						"destinations": "gm0_client_200"
					}, {
						"source": "UIA",
						"destinations": "uia"
					}],
					"destBackendSystem": ["GM6", "uia", "QEK"]
				};

				var oBackends = {
					"aBackendSystems": []
				};

				sandbox.stub(oSwitchBackends, "getBackendsInfo").returns(Q(oBackends));
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oSwitchBackends.getExistingRunnersBackendsInfo(oDocument, oConfiguration).then(function(oNewConfiguration) {
							expect(oNewConfiguration.backendSystem.length).to.equal(0);
							expect(oNewConfiguration.destBackendSystem.length).to.equal(3);
						});
					});
				});
			});

		it("Test update of existing runners - change in the neo-app file",
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

				var oConfiguration = {
					"backendSystem": [{
						"source": "GM6",
						"destinations": "gm0_client_200"
					}, {
						"source": "UIA",
						"destinations": "uia"
					}],
					"destBackendSystem": ["GM6", "uia", "QEK"]
				};

				var oBackends = {
					"aBackendSystems": [{
						"source": "UIA",
						"destnations": "uia"
					}]

				};

				sandbox.stub(oSwitchBackends, "getBackendsInfo").returns(Q(oBackends));
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oSwitchBackends.getExistingRunnersBackendsInfo(oDocument, oConfiguration).then(function(oNewConfiguration) {
							expect(oNewConfiguration.backendSystem.length).to.equal(1);
							expect(oNewConfiguration.destBackendSystem.length).to.equal(3);
						});
					});
				});
			});

		it("Test getting of the changed Backends",
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

				var oConfiguration = {
					"oSwitchBackendParameter": [{
						"source": "GM6",
						"destinations": "gm0_client_200"
					}, {
						"source": "UIA",
						"destinations": "uia"
					}]
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function() {
						return oSwitchBackends.getChangedBackends(oConfiguration).then(function(sNewBE) {
							expect(sNewBE).to.equal("gm0_client_200uia");
						});
					});
				});
			});

		it("Test with duplicate BE in NEo-app",
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
							"name": "GM6",
							"type": "destination"
						}
					}, {
						"target": {
							"name": "QEK",
							"type": "destination"
						}
					}, {
						"target": {
							"name": "GM6",
							"type": "destination"
						}
					}, {
						"target": {
							"name": "GM6",
							"type": "destination"
						}
					}]
				};

				sandbox.stub(oNeoBEs, "getNeoMetadata").returns(Q(oNeoApp));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oSwitchBackends.getBackendsInfo(oDocument).then(function(oNewConfiguration) {
							expect(oNewConfiguration.aBackendSystems.length).to.equal(2);
						});
					});
				});
			});
	});
});