define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "FioriMasterDetailTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter1/service/Template/config.json"}).then(function () {
				oTemplateService = getService('template');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		it("Test Master Detail template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.1").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({},{fioriMasterDetail:{parameters:{ProjectNamespace:{}}},projectName:"nameOfProject"})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriMasterDetail.parameters.ProjectNamespace.value, "nameOfProject",
							"If the user has not provided a value for the namespace, it should be equal to project name");
					});
			});
		});

		it("Test Master Detail template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.1").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({},{fioriMasterDetail:{parameters:{ProjectNamespace:{value : "namespace"}}}})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriMasterDetail.parameters.ProjectNamespace.value, "namespace",
							"If the user has provided a value for the namespace, it should be equal to the provided value");
					});
			});
		});

		it("Test Master Detail template - configWizardSteps", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.1").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.equal(aSteps.length, 2, "Fiori Master Detail template should configure two custom steps");
					assert.equal(aSteps[0].getOptional(), true, "In Fiori Master Detail template the service catalog step should be optional");
				});
			});
		});

		it("Test Master Detail template - validateOnSelection", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.1").then(function(oTemplate) {
				oTemplate.validateOnSelection().then(function(result) {
					assert.equal(result, true, "Fiori Master Detail is validateOnSelection ");
				});
			});
		});
	});
});
