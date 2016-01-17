define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "embeddedRunner";

	describe("Embedded Runner", function() {
		var oFakeFileDAO;
		var oEmbeddedRunner;
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/embeddedrunner/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oEmbeddedRunner = STF.getService(suiteName, "EmbeddedRunner");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test embedded runner isConfigurationValid method - negative",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"neo-app.json": "{}"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function() {
						return oEmbeddedRunner.isConfigurationValid({
							flpAppName: "",
							flpDestName: null,
							workspaceApplications: [{
								localPath: "",
								bspName: "BSP1"
							}]
						}).then(function(actualResult) {
							expect(!actualResult).to.equal(true);
							//assert.ok(!actualResult);
						});
					});
				});
			});

		it("Test embedded runner isConfigurationValid method - negative, oConfiguration is undefined",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"neo-app.json": "{}"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function() {
						return oEmbeddedRunner.isConfigurationValid({}).then(function(actualResult) {
							expect(!actualResult).to.equal(true);
							//assert.ok(!actualResult);
						});
					});
				});
			});

		it("Test embedded runner isConfigurationValid method - negative, workspaceApplications is undefined",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"neo-app.json": "{}"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function() {
						return oEmbeddedRunner.isConfigurationValid({
							flpAppName: "",
							flpDestName: null
						}).then(function(actualResult) {
							expect(!actualResult).to.equal(true);
							//assert.ok(!actualResult);
						});
					});
				});
			});

		it("Test embedded runner isConfigurationValid method - positive",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"neo-app.json": "{}"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function() {
						return oEmbeddedRunner.isConfigurationValid({
							flpAppName: "fin",
							flpDestName: "SYSTEM",
							workspaceApplications: []
						}).then(function(actualResult) {
							expect(actualResult).to.equal(true);
							//assert.ok(actualResult);
						});
					});
				});
			});

		it("Test embedded runner isConfigurationValid method - positive without workspaceApplications",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"neo-app.json": "{}"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function() {
						return oEmbeddedRunner.isConfigurationValid({
							flpAppName: "fin",
							flpDestName: "SYSTEM"
						}).then(function(actualResult) {
							expect(actualResult).to.equal(true);
							//assert.ok(actualResult);
						});
					});
				});
			});
	});
});