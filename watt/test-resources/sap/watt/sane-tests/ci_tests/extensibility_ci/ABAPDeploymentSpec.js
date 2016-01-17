define(['STF', "util/orionUtils" , "sane-tests/util/RepositoryBrowserUtil"], function (STF, OrionUtils , repositoryUtil) {

	"use strict";

	var suiteName = "CreateExtensionProjectForCIFioriexttemplate";
	var oABAPRepositoryService = null;
	var abapDeploymentWizardUtil = null;
	var repositoryBrowserUtil = repositoryUtil;
	var oABAPRepositoryContext = null;
	var iFrameWindow = null;
	
	var appForAbapDeployName = "ZAppForAbapDeploy";
	var sZipZAppForAbapDeploy = "../test-resources/sap/watt/sane-tests/ci_tests/extensibility_ci/ZAppForAbapDeploy.zip";

	describe('Service tests - Deploy Application To ABAP - with live Orion and ABAP', function () {

		before(function (done) {
			console.log("TEST: Before startWebIdeWithOrion method");
			OrionUtils.startWebIdeWithOrion(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				console.log("TEST: After startWebIdeWithOrion method");

				// iFrameWindow = _iFrameWindow;
				oABAPRepositoryService = STF.getService(suiteName, "abaprepository");
				oABAPRepositoryContext = oABAPRepositoryService.context;

				console.log("TEST: Before require of util class");

				// require the utility class from the context running in Web IDE
				STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/extensibility/Deployment/ABAPDeploymentUtil"]).spread(function (abapUtil) {

					console.log("TEST: After require of util class");

					abapDeploymentWizardUtil = abapUtil;
					
					done();
				});
			});
		});

		/*
		* the following function imports "sProjectName" application to local workspace, and sets the selection on it
		* it returns an array with the selected document, and the selection itself.
		*/
		var _importApplicationAndSetSelection = function (sProjectName, sZipPath) {
			return repositoryBrowserUtil.importZipIntoCleanFolder(suiteName, sProjectName, iFrameWindow, sZipPath).then(function (oCreatedFolder) {
				expect(oCreatedFolder).to.exist;
				return oABAPRepositoryContext.service.repositorybrowser.setSelection(oCreatedFolder,false,true).then(function () {
					return oABAPRepositoryContext.service.repositorybrowser.getSelection().then(function(oSelection) {
						return [oCreatedFolder, oSelection];
					});
				});
			});
		};
		
		/*
		* the following function checks if the given document exists in ABAP. if exist and should be, it performs some validations on it
		* the "oAppInfoValidations" parameter should be sent to this function in case the application should exist on ABAP
		*/
		var _assertExistenceInAbap = function (oSelectedFolderDocument, bShouldExist, oAppInfoValidations) {
			return oABAPRepositoryService.getDeploymentInfo(oSelectedFolderDocument).then(function(oDeployedAppInfo) {
				if (bShouldExist) { // found the app in abap
					expect(oDeployedAppInfo).to.exist;
					//validate deployedAppInfo content
					expect(oAppInfoValidations.destination).to.equal(oAppInfoValidations.destination);
					expect(oAppInfoValidations.name).to.equal(oAppInfoValidations.name);
					expect(oAppInfoValidations.package).to.equal(oAppInfoValidations.package);
				}
				else{	// didn't find the app in abap
					expect(oDeployedAppInfo).to.not.exist;
				}
			});
		};
		
		it("deploy application to abap- deploy first time (to abap_backend, to $TMP package) - successful", function() {
			//build parameters for app to be deployed
			var oParams = {};
			oParams.destination = "abap_backend";
			oParams.name = "zAbapAppCiTest";
			oParams.package = "$TMP";
			return _importApplicationAndSetSelection(appForAbapDeployName, sZipZAppForAbapDeploy).then(function (aSelectionAndFolder) {
				var oSelectedFolderDocument = aSelectionAndFolder[0];
				return abapDeploymentWizardUtil.deployApplicationToABAP(oABAPRepositoryContext,aSelectionAndFolder[1], oParams).then(function(oResult){
					var wizardModel = oResult.oWizardModel;
					//assert that the application is indeed deployed to abap
					return _assertExistenceInAbap(oSelectedFolderDocument, true, oParams).then(function () {
						//hard coded , only for the test
						var appUrl = "/destinations/abap_backend/sap/bc/adt/filestore/ui5-bsp/objects/zAbapAppCiTest/content";
						//delete application from abap
						return oABAPRepositoryService.deleteResource(appUrl, wizardModel.discoveryStatus, {}, true).then(function(){
							//now the app removed from abap. assert it
							return _assertExistenceInAbap(oSelectedFolderDocument, false).then(function () {
								//now delete the project from my workspace
								return repositoryBrowserUtil.deleteProjectIfExists(suiteName, appForAbapDeployName);
							});
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});