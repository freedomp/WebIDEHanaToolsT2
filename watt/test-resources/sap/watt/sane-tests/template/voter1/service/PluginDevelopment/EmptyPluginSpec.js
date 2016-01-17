define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "EmptyPluginTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService, oFakeFileDAO, oFileService, oPluginDevelopment, oProjectSettings, oFakeEnvironment,
			oWebIDEWindow;
		var aStubs = [];

		var oEnvParameters = {
			"internal" : false,
			"server_type" : "hcproxy"
		};

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {
					oWebIDEWindow = oWindow;
					oTemplateService = getService("template");
					oFakeFileDAO = getService("fakeFileDAO");
					oFileService = getService("filesystem.documentProvider");
					oPluginDevelopment = getService("plugindevelopment");
					oFakeEnvironment = getService('fakeEnvironment');
					oProjectSettings = getService('setting.project');
			});
		});

		afterEach(function () {
			aStubs.forEach(function(stub){
				stub.restore();
			});
			aStubs = [];
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Empty Plugin template - isValid", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function(oTemplate) {
					return oTemplate.validateOnSelection({}).then(function(bResult) {
						assert.ok(bResult, "Empty Plugin template should be valid on selection");
					});
				});
			});
		});

		it("Empty Plugin template - configWizardSteps", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function(oTemplate) {
					return oTemplate.configWizardSteps().then(function(aSteps) {
						assert.ok(aSteps.length === 1, "Empty Plugin template should configure one custom step");
					});
				});
			});
		});

		it("Empty Plugin template - onBeforeTemplateGenerate", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function(oTemplate) {
					var oModel = {
						"test" : "test1"
					};
					return oTemplate.onBeforeTemplateGenerate(null, oModel).then(function(aResults) {
						var oNewModel = aResults[1];

						assert.ok(oNewModel.i18nGuid !== undefined, "I18n guid should be added to model");
					});
				});
			});

		});

		it("Empty Plugin template - onAfterGenerate Project Settings", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function(oTemplate) {
					var oModel = {
						"projectName" : "myProject",
						"emptyPlugin" : {
							"parameters" : {
								"includeSample" : {
									"value" : false
								}
							}
						}
					};

					var oFileStructure = {
						"a" : {
							"aa" : "aa",
							"ab" : "ab"
						},
						"myProject" : {
							"model" : "some content"
						}
					};

					var projectZip = new JSZip();
					projectZip.folder("command").file("HelloWorld.js", "Hello World");
					projectZip.folder("css").file("helloWorld.css", "Hello World");
					projectZip.folder("service").file("Sample.js", "Hello World");
					projectZip.folder("service").file("Sample.json", "Hello World");

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/myProject").then(function(oTargetDocument) {
							var oSettings = {};
							oSettings.test = "test";
							return oProjectSettings.set(oPluginDevelopment, oSettings, oTargetDocument).then(function() {
								return oTemplate.onAfterGenerate(projectZip, oModel).then(function(aResult) {
									return oProjectSettings.get(oPluginDevelopment, oTargetDocument).then(function(mSettings) {
										var pNewZip = aResult[0];

										assert.ok(pNewZip.files["command/HelloWorld.js"] === undefined, "command/HelloWorld.js should be removed");
										assert.ok(pNewZip.files["css/helloWorld.css"] === undefined, "css/helloWorld.css should be removed");
										assert.ok(pNewZip.files["service/Sample.js"] === undefined, "service/Sample.js should be removed");
										assert.ok(pNewZip.files["service/Sample.json"] === undefined, "service/Sample.json should be removed");
										assert.ok(mSettings.dependencies.all.length === 0, "dependencies.all array should be empty");
										assert.ok(mSettings.devUrlParameters["sap-ide-debug"] === "false", "sap-ide-debug should be false");
										assert.ok(mSettings.test === "test", "old setting should still exist");
									});
								});
							});
						});
					});
				});
			});
		});

		it("Empty Plugin template - onAfterGenerate no folder", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function(oTemplate) {
					var oModel = {
						"projectName" : "NonExisting",
						"emptyPlugin" : {
							"parameters" : {
								"includeSample" : {
									"value" : true
								}
							}
						}

					};

					return oFakeFileDAO.setContent({
						"a" : {
							"aa" : "aa",
							"ab" : "ab"
						}
					}).then(function() {
						return oTemplate.onAfterGenerate(null, oModel).then(function() {
							assert.ok(false, "Should fail since there is no folder");
						}).fail(function(oError) {
							assert.ok(oError.message !== undefined, "Should fail since there is no folder");
						});
					}).fail(function(oError) {
						assert.ok(false, "Error: " + oError.message);
					});
				});
			});
		});

		it("Empty Plugin template - is not Valid in local_hcproxy", function() {
			oEnvParameters = {
				"server_type" : "local_hcproxy"
			};
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.emptyPlugin").then(function() {
					assert.ok(false, "Empty Plugin template should be hidden on local_hcproxy.");
				}).fail(function(oErr){
					assert.ok(oErr, "Empty Plugin template is hidden on local_hcproxy as expected.");
				});
			});
		});
	});
});
