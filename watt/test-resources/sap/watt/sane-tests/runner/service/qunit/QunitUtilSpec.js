define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "qunit";

	describe("Qunit Util", function() {
		var oFakeFileDAO;
		var oDocumentProvider;
		var Q;
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/qunit/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oDocumentProvider = STF.getService(suiteName, "filesystem.documentProvider");
				Q = webIdeWindowObj.Q;
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test QunitUtil, method: figureOutQunitTargetFolderPath - project with src folder",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"main": {
								"application.js": "1"
							},
							"test": {}
						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
						return oQunitUtil.figureOutQunitTargetFolderPath("/myTestProject/src/main", oDocumentProvider).then(function(
							sQunitTargetFolderPath) {
							expect(sQunitTargetFolderPath).to.equal("/myTestProject/src");
						});
					});
				});
			});

		it("Test QunitUtil, method: figureOutQunitTargetFolderPath - project without src folder",
			function() {
				var oFileStructure = {
					"myTestProject2": {
						"main": {
							"application.js": "1"
						},
						"test": {}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
						return oQunitUtil.figureOutQunitTargetFolderPath("/myTestProject2/main", oDocumentProvider).then(function(
							sQunitTargetFolderPath) {
							expect(sQunitTargetFolderPath).to.equal("/myTestProject2");
						});
					});
				});
			});

		it("Test QunitUtil, method: getFileName - file that not yet exist in the project",
			function() {
				var oFileStructure = {
					"myTestProject3": {
						"src": {
							"test": {
								"qunit": {
									"WEB-INF": {
										"webjetty.xml": "1"
									},
									"testsuite.qunit.js": "2"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
						return oQunitUtil.getFileName("/myTestProject3/src/test/qunit", "newTestFile", ".js", oDocumentProvider).then(function(
							sFileName) {
							expect(sFileName).to.equal("newTestFile");
						});
					});
				});
			});

		it("Test QunitUtil, method: getFileName - file that already exist in the project",
			function() {
				var oFileStructure = {
					"myTestProject3": {
						"src": {
							"test": {
								"qunit": {
									"WEB-INF": {
										"webjetty.xml": "1"
									},
									"testsuite.qunit.js": "2"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap.watt.saptoolsets.fiori.project.qunit/util/QunitUtil").then(function(oQunitUtil) {
						return oQunitUtil.getFileName("/myTestProject3/src/test/qunit", "testsuite.qunit", ".js", oDocumentProvider).then(function(
							sFileName) {
							expect(sFileName).to.equal("testsuite.qunit1");
						});
					});
				});
			});
	});
});