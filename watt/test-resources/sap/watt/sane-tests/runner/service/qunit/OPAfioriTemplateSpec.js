define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "opa";

	describe("Qunit OPA fiori template", function() {
		var oFakeFileDAO;
		var oTemplateService;
		var Q;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/qunit/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oTemplateService = STF.getService(suiteName, "template");
				Q = webIdeWindowObj.Q;
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test template OPAfioritemplate, hook: onBeforeTemplateGenerate - add new views to templateZip folder",
			function() {
				var oFileStructure = {
					"myTestProject": {
						"src": {
							"test": {
								"qunit": {
									"test-files": {
										"opa": {
											"arrangements": {
												"Common.js": "abcdef"
											},
											"pageObjects": {
												"Common.js": "abc",
												"S2.js": "abcd"
											},
											"AllOpaTests.js": "12345",
											"readme.txt": "123456",
											"testsuite_opa.qunit.html": "1234567",
											"testsuite_opa.qunit.js": "12345678"
										},
										"ModulePathForTests.js": "1234"
									},
									"WEB-INF": {
										"webjetty.xml": "1"
									},
									"qunit.runner.testsuite.html": "123"
								}

							},
							"main": {
								"view": {}
							}

						},
						"pom.xml": "<artifactId>ca.infra.test.opa.masterdetail</artifactId>"
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
						var oMockData = {
							aViewList: [{
								"name": "S1",
								"selected": true
							}, {
								"name": "S2",
								"selected": false
							}, {
								"name": "S3",
								"selected": true
							}]
						};
						var templateZip = new JSZip();
						templateZip.file("test/qunit/test-files/opa/arrangments/Common.js.tmpl", "1");
						templateZip.file("test/qunit/test-files/opa/pageObjects/Common.js.tmpl", "2");
						templateZip.file("test/qunit/test-files/opa/pageObjects/View.js.tmpl", "3");
						templateZip.file("test/qunit/test-files/opa/AllOpaTests.js.tmpl", "4");
						templateZip.file("test/qunit/test-files/opa/testsuite_opa.qunit.html.tmpl", "5");
						templateZip.file("test/qunit/test-files/opa/testsuite_opa.qunit.js.tmpl", "6");
						templateZip.file("test/qunit/test-files/opa/readme.txt.tmpl", "7");
						templateZip.file("test/qunit/test-files/ModulePathForTests.js.tmpl", "8");
						templateZip.file("test/qunit/WEB-INF/webjetty.xml", "9");
						templateZip.file("test/qunit/qunit.runner.testsuite.html.tmpl", "10");

						return oTemplateService.getTemplate("qunit.OPAfioritemplate").then(function(oTemplate) {
							return oTemplate.onBeforeTemplateGenerate(templateZip, {
								ovveride: true,
								componentPath: "/myTestProject",
								oQunitData: oMockData
							}).then(function(bResult) {
								expect(bResult[1].namespace).to.equal("ca.infra.test.opa.masterdetail");
								expect(bResult[1].namespacePath).to.equal("ca/infra/test/opa/masterdetail");
								expect(bResult[0].files["test/qunit/test-files/opa/pageObjects/S1"]).to.not.equal(null);
								expect(bResult[0].files["test/qunit/test-files/opa/pageObjects/S3"]).to.not.equal(null);
							});
						});
					});
				});
			});
	});
});