define(['STF', "util/orionUtils"], function (STF, OrionUtils) {

	"use strict";

	var suiteName = "CreateExtensionProjectForCIFioriexttemplate";
	var iFrameWindow = null;
	var extensionProjectWizardUtil = null;
	var oContext;
	var oExtensionProjectService;
	var oGenerationService;

	describe.skip('Service tests - Create Extension Project - with live Orion and ABAP', function () {

		before(function (done) {
			console.log("TEST: Before startWebIdeWithOrion method");

			OrionUtils.startWebIdeWithOrion(suiteName).then(function (_iFrameWindow) {

				console.log("TEST: After startWebIdeWithOrion method");

				iFrameWindow = _iFrameWindow;
				oGenerationService = STF.getService(suiteName, "generation");
				oExtensionProjectService = STF.getService(suiteName, "extensionproject");
				// get context
				oContext = oExtensionProjectService.context;

				console.log("TEST: Before require of util class");

				// require the utility class from the context running in Web IDE
				STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/extensibility/util/WizardTestUtil"]).spread(function (utilsInstance) {

					console.log("TEST: After require of util class");

					extensionProjectWizardUtil = utilsInstance;
					done();
				});
			});
		});

		it("Create an extension project for an application that resides remotely (on ABAP)", function() {
			var oDeferred = Q.defer();

			oGenerationService.attachEventOnce("generated", function(oEvent) {

				console.log("TEST: Inside attachEventOnce method");

				oDeferred.resolve(oEvent);
			});

			var EXTENDED_APP_NAME = "HCM_LR_CRE";

			console.log("TEST: Before generateAbapExtensionProject method");

			extensionProjectWizardUtil.generateAbapExtensionProject(oContext, EXTENDED_APP_NAME);

			return oDeferred.promise.then(function(oEvent) {
				var oModel = oEvent.params.model;
				var sExtensionProjectName = oModel.projectName;
				expect(sExtensionProjectName).to.equal("HCM_LR_CREExtension");

				var bIsTypeBSP = oModel.extensionProject.isBSP;
				expect(bIsTypeBSP).to.be.true;

				var sComponentJsPath = oModel.componentJsPath;
				expect(sComponentJsPath).to.equal("HCM_LR_CRE");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});