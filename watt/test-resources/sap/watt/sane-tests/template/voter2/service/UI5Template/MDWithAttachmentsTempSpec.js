define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "MDWithAttachmentsTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/config.json"})
				.then(function () {
					oTemplateService = getService('template');
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		var model = {
			projectName: "proj1"
		};

		it("Test Master Details with Photos Template onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation", "1.0.0").then(function(oTemplate) {
				var projectZip = new JSZip();
				projectZip.file("Mobile.view.js","1");
				projectZip.file("View1.controller.js","2");

				return oTemplate.onBeforeTemplateGenerate(projectZip, model).then(function(aResults) {
					var sFileContent1 = aResults[0].file("Mobile.view.js").asText();
					var sFileContent2 = aResults[0].file("View1.controller.js").asText();
					assert.ok(sFileContent1 === "1", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
					assert.equal(aResults[1], model, "Got the expected model");
				});
			});
		});

		it("Test Master Details with Photos Template onBeforeTemplateGenerate with offline", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation", "1.0.0").then(function(oTemplate) {
					var projectZip = new JSZip();
				projectZip.file("Mobile.view.js","1");
				projectZip.file("View1.controller.js","2");
				projectZip.file("offline.js.tmpl","2");

				return oTemplate.onBeforeTemplateGenerate(projectZip, model).then(function(aResults) {
					var sFileContent1 = aResults[0].file("Mobile.view.js").asText();
					var sFileContent2 = aResults[0].file("View1.controller.js").asText();
					assert.ok(!(aResults[0].file("offline.js.tmpl")), "Verify the offline file was removed");
					assert.ok(sFileContent1 === "1", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
					assert.equal(aResults[1], model, "Got the expected model");
				});
			});
		});

		it("Test Master Details with Photos Template - configWizardSteps", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation", "1.0.0").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.equal(aSteps.length, 3, "Master Details with Photos Template should configure three custom steps");
					assert.equal(aSteps[2].getOptional(), true, "In Master Details with Photos Template the offline step " +
						"should be optional");
				});
			});
		});

		it("Test Master Details with Photos Template - validateOnSelection", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation", "1.0.0").then(function(oTemplate) {
				oTemplate.validateOnSelection().then(function(result) {
					assert.equal(result, true, "Master Details with Photos Template is validateOnSelection");
				});
			});
		});
	});
});
