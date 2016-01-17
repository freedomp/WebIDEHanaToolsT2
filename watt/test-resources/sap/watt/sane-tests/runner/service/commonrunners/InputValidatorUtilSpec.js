define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "inputValidatorUtil";

	describe("Common Runners - Input Validator Util", function() {
		var oFakeFileDAO;
		var oInputValidatorUtil;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/commonrunners/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oInputValidatorUtil = STF.getService(suiteName, "inputvalidatorutil");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Check path input - valid path",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/index.html", oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(true);
						});

					});
				});
			});

		it("Check path input - valid path for fiori, Component.js",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"Component.js": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/Component.js", oDocument, [{
							"isRegex": false,
							"rule": "Component.js"
						}, {
							"isRegex": true,
							"rule": ".*fiorisandboxconfig.*[.]json"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(true);
						});

					});
				});
			});

		it("Check path input - valid path for fiori, MyFioriSandboxConfig.json",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"MyFioriSandboxConfig.json": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/MyFioriSandboxConfig.json", oDocument, [{
							"isRegex": false,
							"rule": "Component.js"
						}, {
							"isRegex": true,
							"rule": ".*fiorisandboxconfig.*[.]json"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(true);
						});

					});
				});
			});

		it("Check path input - empty path",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("", oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(false);
						});
					});
				});
			});

		it("Check path input - path with unrunnable file type",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/index.html111", oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(false);
						});
					});
				});
			});

		it("Check path input - runnable file name is not exist",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/indexlocal.html", oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(false);
						});
					});

				});
			});

		it("Check path input - runnable file name is not from same project",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject1").then(function(oDocument) {
						return oInputValidatorUtil.validatePath("/myTestProject/src/main/indexlocal.html", oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult.isValid).to.equal(false);
						});
					});
				});
			});

		it("Check application URL parameter input - valid input",
			function() {
				return oInputValidatorUtil.validateUrlParameter("test").then(function(oResult) {
					expect(oResult.isValid).to.equal(true);
				});
			});

		it("Check application URL parameter input - empty input",
			function() {
				return oInputValidatorUtil.validateUrlParameter("").then(function(oResult) {
					expect(oResult.isValid).to.equal(false);
				});
			});

		it("Check isConfigurationValid - check the entire configuration",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						var oConfiguration = {
							"filePath": "/myTestProject/src/main/index.html",
							"urlParameters": [{
								"paramActive": true,
								"paramName": "test name1",
								"paramValue": "test value1"
							}, {
								"paramActive": true,
								"paramName": "test name2",
								"paramValue": "test value2"
							}]
						};
						return oInputValidatorUtil.isConfigurationValid(oConfiguration, oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult).to.equal(true);
						});
					});

				});
			});

		it("isConfigurationValid negative check, path is not valid - check the entire configuration",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						var oConfiguration = {
							"filePath": "/myTestProject/src/main/index1.html",
							"urlParameters": [{
								"paramActive": true,
								"paramName": "test name1",
								"paramValue": "test value1"
							}, {
								"paramActive": true,
								"paramName": "test name2",
								"paramValue": "test value2"
							}]
						};
						return oInputValidatorUtil.isConfigurationValid(oConfiguration, oDocument, [{
							"isRegex": false,
							"rule": ".html"
						}]).then(function(oResult) {
							expect(oResult).to.equal(false);
						});
					});

				});
			});

		it("isConfigurationValid negative check, parameter is not valid  - check the entire configuration",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {},
							"main": {
								"index.html": "1"
							}

						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("myTestProject").then(function(oDocument) {
						var oConfiguration = {
							"filePath": "/myTestProject/src/main/Component.js",
							"urlParameters": [{
								"paramActive": true,
								"paramName": "test name1",
								"paramValue": "test value1"
							}, {
								"paramActive": true,
								"paramName": " ",
								"paramValue": "test value2"
							}]
						};
						return oInputValidatorUtil.isConfigurationValid(oConfiguration, oDocument, [{
							"isRegex": false,
							"rule": "Component.js"
						}]).then(function(oResult) {
							expect(oResult).to.equal(false);
						});
					});

				});
			});

	});
});