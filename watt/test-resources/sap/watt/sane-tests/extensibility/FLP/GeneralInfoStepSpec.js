define(['STF'], function (STF) {

	"use strict";

	var suiteName = "FioriLaunchpad_Service_GeneralInfoStep";
	var iFrameWindow;

	describe("Tests for GeneralInfoStep", function () {
		var oGeneralInfoStep;

		before(function () {
			return STF.startWebIde(suiteName).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;

				iFrameWindow.jQuery.sap.require("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep");
				oGeneralInfoStep = new iFrameWindow.sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.GeneralInfoStep({
					context: {}
				});
			});
		});

		function mockGetCurrentMetadataMethod(bWithFile) {
			var oProjectDocument = {};
			oProjectDocument.getCurrentMetadata = function() {
				var aProjectFolderContentMetadata = [];
				var oResourceMetadata = {
					"name" : "file1.txt",
					"path" : "/project/folder/file.txt",
					"parentPath" : "/project/folder",
					"folder" : false,
					"changedOn" : 1234567890
				};

				aProjectFolderContentMetadata.push(oResourceMetadata);

				oResourceMetadata = {
					"name" : "file2.txt",
					"path" : "/project/folder/file.txt",
					"parentPath" : "/project/folder",
					"folder" : false,
					"changedOn" : 1234567890
				};

				aProjectFolderContentMetadata.push(oResourceMetadata);

				oResourceMetadata = {
					"name" : "folder",
					"path" : "/project",
					"parentPath" : "/project",
					"folder" : true,
					"changedOn" : 1234567890
				};

				aProjectFolderContentMetadata.push(oResourceMetadata);

				if (bWithFile) {
					oResourceMetadata = {
						"name" : "cp.app.descriptor.json",
						"path" : "/project/folder/cp.app.descriptor.json",
						"parentPath" : "/project/folder",
						"folder" : false,
						"changedOn" : 1234567890
					};

					aProjectFolderContentMetadata.push(oResourceMetadata);
				}

				return Q(aProjectFolderContentMetadata);
			};

			return oProjectDocument;
		}

		describe("Tests _isCloudPortalProject method", function () {

			it("cp.app.descriptor.json file exists", function () {
				var oProjectDocument = mockGetCurrentMetadataMethod(true);

				// flow 1 - cp.app.descriptor.json exists
				return oGeneralInfoStep._isCloudPortalProject(oProjectDocument).then(function(oIsCloudPortalProject) {
					expect(oIsCloudPortalProject).to.exist;
					expect(oIsCloudPortalProject.name).to.equal("cp.app.descriptor.json");
				});
			});

			it("cp.app.descriptor.json file doesn't exist", function () {
				var oProjectDocument = mockGetCurrentMetadataMethod(false);

				// flow 2 - cp.app.descriptor.json doesn't exist
				return oGeneralInfoStep._isCloudPortalProject(oProjectDocument).then(function(oIsCloudPortalProject) {
					expect(oIsCloudPortalProject).not.to.exist;
				});
			});
		});

		describe("Tests _executeValidations method", function () {
			var oContext = {};
			oContext.service = {};
			oContext.service.fiorilaunchpad = {};

			var oProjectDocument = mockGetCurrentMetadataMethod(false);

			it("cp.app.descriptor.json doesn't exists and Component.js exists", function () {

				oContext.service.fiorilaunchpad.isComponentJsExist = function() {
					return Q(true);
				};

				// flow 1 - positive - cp.app.descriptor.json doesn't exists and Component.js exists
				return oGeneralInfoStep._executeValidations(oContext, oProjectDocument).then(function(oRes) {
					// no actual validation here, just make sure no error was thrown
					expect(oRes).to.equal(undefined);
				});
			});

			it("both cp.app.descriptor.json and Component.js doesn't exist", function () {
				oContext.service.fiorilaunchpad.isComponentJsExist = function() {
					return Q(false);
				};

				// flow 2 - both cp.app.descriptor.json and Component.js doesn't exist
				return oGeneralInfoStep._executeValidations(oContext, oProjectDocument).then(function() {
					// make sure the test fails if we get here
					expect(true).to.equal(false);
				}).fail(function(oError1) {
					expect(oError1).to.exist;
				});
			});

			it("cp.app.descriptor.json exists", function () {
				oProjectDocument = mockGetCurrentMetadataMethod(true);

				// flow 3 - cp.app.descriptor.json exists
				return oGeneralInfoStep._executeValidations(oContext, oProjectDocument).then(function() {
					// make sure the test fails if we get here
					expect(true).to.equal(false);
				}).fail(function(oError2) {
					expect(oError2).to.exist;
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
