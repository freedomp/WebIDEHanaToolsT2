define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "qunitTemplate";

	describe("Qunit Template", function() {
		var oFakeFileDAO;
		var oTemplateService;
		var oDocumentProvider;
		var Q;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/qunit/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oTemplateService = STF.getService(suiteName, "template");
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

		it("Test template qunitfioritemplate, hook: onBeforeTemplateGenerate - project with src folder",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {
								"qunit": {
									"WEB-INF": {
										"webjetty.xml": "1"
									}
								}
							},
							"main": {
								"view": {

								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
						var oQunitData = {
							aFunctionsList: [{
								aFunctionParams: [{
									defaultValue: "",
									paramerName: "a"
								}],
								functionName: "calc",
								sFunctionParameters: ""
							}],
							aObjectList: [{
								aFunctionsList: [{
									aFunctionParams: [],
									functionName: "getServiceList",
									sFunctionParameters: ""
								}],
								objectName: "projectNamespace.Configuration"
							}]
						};
						var templateZip = new JSZip();
						templateZip.file("test/qunit/WEB-INF/webjetty.xml", "1");
						templateZip.file("test/qunit/test-files/testfile.js", "2");
						templateZip.file("test/qunit/testsuite.qunit.html", "3");
						templateZip.file("test/qunit/testsuite.qunit.js", "4");

						return oTemplateService.getTemplate("qunit.qunitfioritemplate").then(function(oTemplate) {
							return oTemplate.onBeforeTemplateGenerate(templateZip, {
								ovveride: true,
								componentPath: "/myTestProject",
								filePath: "/myTestProject/main/view/",
								fileName: "/S2.controller",
								selectedJSFileName: "/S2.controller",
								testJSFileName: "test/qunit/test-files/ConfigurationTest.js",
								testSuiteHtmlFileName: "test/qunit/Configuration.testsuite.qunit.html",
								testSuiteJSFileName: "test/qunit/Configuration.testsuite.qunit.js",
								oQunitData: oQunitData
							}).then(function(bResult) {
								var aFilePaths = Object.keys(bResult[0].files);
								expect(aFilePaths.length).to.equal(6);
								expect(bResult[1].selectedJSFileName).to.equal("/S2");
								expect(bResult[1].selectedJSFilePath).to.equal("/main/view/");
								expect(bResult[1].testFileNameForTemplate).to.equal("ConfigurationTest");
								expect(bResult[1].oQunitData.aFunctionsList[0].sFunctionParameters).to.equal("a");
							});
						});
					});
				});
			});

		it("Test template qunitfioritemplate, hook: onBeforeTemplateGenerate - project without src folder",
			function() {
				var oFileStructure = {
					"myTestProject2": {
						"test": {
							"qunit": {
								"WEB-INF": {
									"webjetty.xml": "1"
								}
							}
						},
						"view": {

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
						var oQunitData = {
							aFunctionsList: [{
								aFunctionParams: [{
									defaultValue: "",
									paramerName: "a"
								}],
								functionName: "calc",
								sFunctionParameters: ""
							}],
							aObjectList: [{
								aFunctionsList: [{
									aFunctionParams: [{
										defaultValue: "",
										paramerName: "a"
									}, {
										defaultValue: "",
										paramerName: "b"
									}],
									functionName: "getServiceList",
									sFunctionParameters: ""
								}],
								objectName: "projectNamespace.Configuration"
							}]
						};
						var templateZip = new JSZip();
						templateZip.file("test/qunit/WEB-INF/webjetty.xml", "1");
						templateZip.file("test/qunit/test-files/testfile.js", "2");
						templateZip.file("test/qunit/testsuite.qunit.html", "3");
						templateZip.file("test/qunit/testsuite.qunit.js", "4");

						return oTemplateService.getTemplate("qunit.qunitfioritemplate").then(function(oTemplate) {
							return oTemplate.onBeforeTemplateGenerate(templateZip, {
								ovveride: true,
								componentPath: "/myTestProject2",
								fileName: "/S2.controller",
								filePath: "/myTestProject2/view/",
								selectedJSFileName: "S2.controller",
								testJSFileName: "test/qunit/test-files/ConfigurationTest.js",
								testSuiteHtmlFileName: "test/qunit/Configuration.testsuite.qunit.html",
								testSuiteJSFileName: "test/qunit/Configuration.testsuite.qunit.js",
								oQunitData: oQunitData
							}).then(function(bResult) {
								var aFilePaths = Object.keys(bResult[0].files);
								expect(aFilePaths.length).to.equal(6);
							});
						});
					});
				});
			});

		it("Test template qunitfioritemplate, hook: onAfterGenerate - replacing template default files names",
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
					"myTestProject2": {
						"test": {
							"qunit": {
								"WEB-INF": {
									"webjetty.xml": "1"
								}
							}
						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
						var templateZip = new JSZip();
						templateZip.file("test/qunit/WEB-INF/webjetty.xml", "1");
						templateZip.file("test/qunit/test-files/testfile.js", "2");
						templateZip.file("test/qunit/testsuite.qunit.html", "3");
						templateZip.file("test/qunit/testsuite.qunit.js", "4");

						return oTemplateService.getTemplate("qunit.qunitfioritemplate").then(function(oTemplate) {
							return oTemplate.onAfterGenerate(templateZip, {
								ovveride: true,
								componentPath: "/myTestProject2",
								testJSFileName: "test/qunit/test-files/ConfigurationTest.js",
								testSuiteHtmlFileName: "test/qunit/Configuration.testsuite.qunit.html",
								testSuiteJSFileName: "test/qunit/Configuration.testsuite.qunit.js"
							}).then(function(bResult) {
								expect(bResult[0].file("test/qunit/test-files/ConfigurationTest.js").name).to.not.equal(null);
								expect(bResult[0].file("test/qunit/Configuration.testsuite.qunit.html").name).to.not.equal(null);
								expect(bResult[0].file("test/qunit/Configuration.testsuite.qunit.js").name).to.not.equal(null);
							});
						});
					});
				});
			});
	});
});