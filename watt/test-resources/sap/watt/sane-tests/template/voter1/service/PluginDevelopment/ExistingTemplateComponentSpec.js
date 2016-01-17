define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "ExistingTemplateComponent_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService, oFakeFileDAO, oFileService, oFakeEnvironment, oSelectService,
			oWebIDEWindow;
		var aStubs = [];

		var oEnvParameters = {
			"server_type" : "hcproxy"
		};

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {
					oWebIDEWindow = oWindow;
					oTemplateService = getService("template");
					oFakeFileDAO = getService("fakeFileDAO");
					oFileService = getService("filesystem.documentProvider");
					oFakeEnvironment = getService('fakeEnvironment');
					oSelectService = getService('fakeEnvironment');
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


		it("Existing Template Component - isValid plugin project", function() {
			var oFileStructure = {
				"myProject" : {
					"a.js" : "some content"
				}
			};

			var oModel = {"componentPath" : "/myProject"};

			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oTemplateService.getTemplate("plugindevelopment.existingtemplatecomponent").then(function(oTemplate) {
						return oTemplate.validateOnSelection(oModel).then(function(bResult) {
							assert.ok(bResult, "The default implementation of the validateOnSelection method  always reurns true");
						});
					});
				});
			});
		});

		it("Existing Template Component - configWizardSteps", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.existingtemplatecomponent").then(function(oTemplate) {
					return oTemplate.configWizardSteps().then(function(aSteps) {
						assert.ok(aSteps.length === 3, "Existing Template Component should configure 3 custom steps");
					});
				});
			});
		});

		it("Existing Template Component - onBeforeTemplateGenerate", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.existingtemplatecomponent").then(function(oTemplate) {
					var oModel = {
						"test" : "test1"
					};
					var oZipMock = {
						"mock" : "mock"
					};
					return oTemplate.onBeforeTemplateGenerate(oZipMock, oModel).then(function(aResults) {
						var oNewZip = aResults[0];
						var oNewModel = aResults[1];

						assert.ok(oNewZip === oZipMock, "Zip shouldn't be changed");
						assert.ok(oNewModel === oModel, "Model shouldn't be changed");
					});
				});
			});
		});

		it("Existing Template Component - onAfterGenerate Project Settings", function() {
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.existingtemplatecomponent").then(function(oTemplate) {
					return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oSelectedTemplate){
						var oModel = {
							"template": {
								"technicalname" : "testtechnicalname",
								"selectedTemplateToExtend" : oSelectedTemplate
							},
							"componentPath" : "/myProject3"
						};

						var oFileStructure = {
							"myProject3" : {
								"plugin.json" : "{\"name\" : \"testConsumer\"}",
								"i18n" : {}
							}
						};

						return oFakeFileDAO.setContent(oFileStructure).then(function() {
							return oFileService.getDocument("/myProject3").then(function(oDocuement){
								oSelectService.getSelection = function(){
									var aSelection = [{document:oDocuement}];
									return Q(aSelection);
								};
								return oTemplate.onAfterGenerate(null, oModel).then(function(){
									assert.ok(true,"on After should succeed");
								});
							});
						});
					});
				});
			});
		});

		it("Existing Template Component  - is not Valid in local_hcproxy", function() {
			oEnvParameters = {
				"server_type" : "local_hcproxy"
			};
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub) {
				aStubs.push(stub);
				return oTemplateService.getTemplate("plugindevelopment.existingtemplatecomponent").then(function() {
					assert.ok(false, "Existing Template Component should be hidden on local_hcproxy.");
				}).fail(function(oErr){
					assert.ok(oErr, "Existing Template Component is hidden on local_hcproxy as expected.");
				});
			});
		});

	});
});
