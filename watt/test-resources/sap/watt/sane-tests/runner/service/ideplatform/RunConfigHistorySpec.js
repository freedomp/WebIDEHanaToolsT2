define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "runConfigHistory";

	describe("Run Configuration History", function() {
		var storedRunConfigurations;
		var Q;
		var oRunConfiguration1 = {};
		oRunConfiguration1._metadata = {};
		oRunConfiguration1._metadata.id = 1;
		oRunConfiguration1._metadata.displayName = "1";
		oRunConfiguration1._metadata.projectPath = "/proj1";
		var oRunConfiguration2 = {};
		oRunConfiguration2._metadata = {};
		oRunConfiguration2._metadata.id = 2;
		oRunConfiguration2._metadata.displayName = "2";
		oRunConfiguration2._metadata.projectPath = "/proj2";
		var oRunConfiguration3 = {};
		oRunConfiguration3._metadata = {};
		oRunConfiguration3._metadata.id = 3;
		oRunConfiguration3._metadata.displayName = "3";
		oRunConfiguration3._metadata.projectPath = "/proj3";

		var oRunConfigurationHistoryService;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				Q = webIdeWindowObj.Q;
				oRunConfigurationHistoryService = STF.getService(suiteName, "runconfigurationhistory");
				oRunConfigurationHistoryService.context.service = {};
				oRunConfigurationHistoryService.context.service.preferences = {};
				oRunConfigurationHistoryService.context.service.preferences.get = function() {
					return Q(storedRunConfigurations);
				};
				oRunConfigurationHistoryService.context.service.preferences.set = function(aRunConfigurationsToStore) {
					storedRunConfigurations = aRunConfigurationsToStore;
					return Q();
				};

				oRunConfigurationHistoryService.context.service.preferences.remove = function(aRunConfigurationsToStore) {
					return Q();
				};
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("isDisplayNameExists - positive",
			function() {
				storedRunConfigurations = undefined;
				var oRunConfiguration31 = {};
				oRunConfiguration31._metadata = {};
				oRunConfiguration31._metadata.id = 3;
				oRunConfiguration31._metadata.displayName = "1";
				oRunConfiguration31._metadata.projectPath = "/proj31";

				oRunConfigurationHistoryService.store(oRunConfiguration31).then(function() {
					oRunConfigurationHistoryService.isDisplayNameExists("1", 2).then(function(exists) {
						start();
						expect(exists).to.equal(true);
					});
				});
			});

		it("isDisplayNameExists - negative",
			function() {
				storedRunConfigurations = undefined;
				oRunConfigurationHistoryService.store(oRunConfiguration2).then(function() {
					oRunConfigurationHistoryService.store(oRunConfiguration1).then(function() {
						oRunConfigurationHistoryService.isDisplayNameExists("1", 1).then(function(exists) {
							start();
							expect(exists).to.equal(false);
						});
					});
				});
			});

		it("removeByProjectPath - positive",
			function() {
				storedRunConfigurations = undefined;
				oRunConfigurationHistoryService.store(oRunConfiguration2, "/proj2").then(function() {
					oRunConfigurationHistoryService.store(oRunConfiguration1, "/proj1").then(function() {
						oRunConfigurationHistoryService.removeByProjectPath("/proj2").then(function() {
							start();
							expect(storedRunConfigurations.runConfigurations.length).to.equal(1);
							expect(storedRunConfigurations.configurationNames["1"]).to.not.equal(undefined);
						});
					});
				});
			});

		it("get empty array of run configurations",
			function() {
				storedRunConfigurations = undefined;
				oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
					start();
					expect(aStoredRunConfigurations.length).to.equal(0);
				});
			});

		it("store run configuration",
			function() {
				storedRunConfigurations = undefined;
				oRunConfigurationHistoryService.store(oRunConfiguration1).then(function() {
					oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
						start();
						expect(aStoredRunConfigurations.length).to.equal(1);
						expect(aStoredRunConfigurations[0]._metadata.id).to.equal(1);

						oRunConfigurationHistoryService.getConfigurationNames().then(function(aStoredConfigurationNames) {
							start();
							expect(aStoredConfigurationNames.length).to.equal(1);
							expect(aStoredConfigurationNames[0]).to.equal("1");
						});
					});
				});
			});

		it("store 6 run configurations",
			function() {
				storedRunConfigurations = undefined;

				var oRunConfiguration4 = {};
				oRunConfiguration4._metadata = {};
				oRunConfiguration4._metadata.id = 4;
				oRunConfiguration4._metadata.displayName = "4";
				oRunConfiguration4._metadata.projectPath = "/proj4";
				var oRunConfiguration5 = {};
				oRunConfiguration5._metadata = {};
				oRunConfiguration5._metadata.id = 5;
				oRunConfiguration5._metadata.displayName = "5";
				oRunConfiguration5._metadata.projectPath = "/proj5";
				var oRunConfiguration6 = {};
				oRunConfiguration6._metadata = {};
				oRunConfiguration6._metadata.id = 6;
				oRunConfiguration6._metadata.displayName = "6";
				oRunConfiguration6._metadata.projectPath = "/proj6";

				oRunConfigurationHistoryService.store(oRunConfiguration1).then(function() {
					oRunConfigurationHistoryService.store(oRunConfiguration2).then(function() {
						oRunConfigurationHistoryService.store(oRunConfiguration3).then(function() {
							oRunConfigurationHistoryService.store(oRunConfiguration4).then(function() {
								oRunConfigurationHistoryService.store(oRunConfiguration5).then(function() {
									oRunConfigurationHistoryService.store(oRunConfiguration6).then(function() {
										oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
											oRunConfigurationHistoryService.update(aStoredRunConfigurations).then(function() {
												oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
													start();
													expect(aStoredRunConfigurations.length).to.equal(5);
													expect(aStoredRunConfigurations[0]._metadata.id).to.equal(6);
													expect(aStoredRunConfigurations[1]._metadata.id).to.equal(5);
													expect(aStoredRunConfigurations[2]._metadata.id).to.equal(4);
													expect(aStoredRunConfigurations[3]._metadata.id).to.equal(3);
													expect(aStoredRunConfigurations[4]._metadata.id).to.equal(2);

													oRunConfigurationHistoryService.getConfigurationNames().then(function(aStoredConfigurationNames) {
														start();
														expect(aStoredConfigurationNames.length).to.equal(6);
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

		it("remove run configurations",
			function() {
				storedRunConfigurations = undefined;
				oRunConfigurationHistoryService.store(oRunConfiguration1).then(function() {
					oRunConfigurationHistoryService.store(oRunConfiguration2).then(function() {
						oRunConfigurationHistoryService.store(oRunConfiguration3).then(function() {
							oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
								start();
								expect(aStoredRunConfigurations.length).to.equal(3);
								expect(aStoredRunConfigurations[0]._metadata.id).to.equal(3);
								expect(aStoredRunConfigurations[1]._metadata.id).to.equal(2);
								expect(aStoredRunConfigurations[2]._metadata.id).to.equal(1);

								oRunConfigurationHistoryService.remove([oRunConfiguration1._metadata.id, oRunConfiguration2._metadata.id]).then(function() {
									oRunConfigurationHistoryService.getLatestConfigurations().then(function(aStoredRunConfigurations) {
										start();
										expect(aStoredRunConfigurations.length).to.equal(1);

										oRunConfigurationHistoryService.getConfigurationNames().then(function(aStoredConfigurationNames) {
											start();
											expect(aStoredConfigurationNames.length).to.equal(1);
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