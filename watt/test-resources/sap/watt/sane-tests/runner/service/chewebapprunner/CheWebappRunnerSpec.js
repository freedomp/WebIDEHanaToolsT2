define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "chewebapprunner";

	describe("Che webapp runner", function() {
		var oFakeFileDAO;
		var oCheWebAppRunner;
		var oFileSearchService;
		var oChoosefilepopupService;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/chewebapprunner/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oCheWebAppRunner = STF.getService(suiteName, "CheWebAppRunner");
				oFileSearchService = STF.getService(suiteName, "basefilesearchutil");
				oChoosefilepopupService = STF.getService(suiteName, "basechoosefilepopup");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it(
			"Test chewebbapp runner createDefaultConfiguration method, selected document is runnable file, use case: src/main/webapp/index.html",
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

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1/src/main/webapp/index.html").then(function(oDocument) {
						return oCheWebAppRunner.createDefaultConfiguration(oDocument).then(function(actualResult) {
							expect(actualResult.filePath).to.equal("/myTestProject1/src/main/webapp/index.html");
						});
					});
				});
			});

		it(
			"Test chewebbapp runner createDefaultConfiguration method, selected document is project folder, use case: src/main/webapp/index.html",
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

				sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([{
					fullPath: "/myTestProject1/src/main/webapp/index.html",
					name: "index.html"
				}]));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function(oDocument) {
						return oCheWebAppRunner.createDefaultConfiguration(oDocument).then(function(actualResult) {
							expect(actualResult.filePath).to.equal("/myTestProject1/src/main/webapp/index.html");
						});
					});
				});
			});

		it(
			"Test chewebbapp runner createDefaultConfiguration method, use case: no *.html files in project",
			function() {
				var oFileStructure = {
					"SomeProject1": {
						"index.html1": "some content"
					}
				};

				sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([]));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("SomeProject1").then(function(oDocument) {
						return oCheWebAppRunner.createDefaultConfiguration(oDocument).then(function(actualResult) {
							expect(actualResult.filePath).to.equal(null);
						});
					});
				});
			});

		it(
			"Test chewebbapp runner createDefaultConfiguration method, use case: not valid project",
			function() {
				var oFileStructure = {
					"myTestProject2": {}
				};

				sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q(null));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject2").then(function(oDocument) {
						return oCheWebAppRunner.createDefaultConfiguration(oDocument).then(function(actualResult) {
							expect(actualResult).to.equal(undefined);
						});
					});
				});
			});

		it(
			"Test chewebbapp runner createDefaultConfiguration method, use case: not valid project",
			function() {
				var oFileStructure = {
					"myTestProject2": {}
				};

				sandbox.stub(oFileSearchService, "getRunnableFiles").returns(Q([{
					fullPath: "/myTestProject2/src/main/webapp/index.html",
					name: "Component.js"
				}, {
					fullPath: "/myTestProject2/index1.html",
					name: "Component.js"
				}]));

				sandbox.stub(oChoosefilepopupService, "getContent").returns(Q(true));
				sandbox.stub(oChoosefilepopupService, "getResult").returns(Q("/myTestProject2/index.html"));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject2").then(function(oDocument) {
						return oCheWebAppRunner.createDefaultConfiguration(oDocument, false).then(function(actualResult) {
							expect(actualResult.filePath).to.equal("/myTestProject2/index.html");
						});
					});
				});
			});
	});
});