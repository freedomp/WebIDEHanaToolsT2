define([
	"STF"
], function (STF) {
	"use strict";

	var suiteName = "Quick Start Generation Service", w5gTestUtils, quickStartUtils, oDocumentProvider, getService = STF.getServicePartial(suiteName), oQuickStartService;
	describe(suiteName, function () {

		var sPrefixProjectName = "QuickStartApplication";
		var sProjectName;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json", html: "w5g/service1/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils", "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/QuickStartProjectGenerationUtils"]).spread(function (_w5gTestUtils, _quickStartUtils) {
					w5gTestUtils = _w5gTestUtils;
					w5gTestUtils.initializeBeforeServiceTest(getService('setting.project'));
					oQuickStartService = getService('quickstart');
					oDocumentProvider = getService('filesystem.documentProvider');

					quickStartUtils = _quickStartUtils;
					quickStartUtils.init(oQuickStartService.context);
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		describe("Test get project name that does not exist in workspace", function () {

			it("Should return the default quick start project name", function () {
				return quickStartUtils.getQuickStartProjectName().then(function (sProjName) {
					assert.equal(sPrefixProjectName, sProjName, "Project names should be equal");
				});
			});

			it("Should generate project name with the right index (missing last index)", function () {
				return oQuickStartService.quickStartWithLayoutEditor().then(function () { //Creating QuickStartApplication
					return oQuickStartService.quickStartWithLayoutEditor().then(function () { //Creating QuickStartApplication2
						return oQuickStartService.quickStartWithLayoutEditor().then(function () { //Creating QuickStartApplication3
							return quickStartUtils.getQuickStartProjectName().then(function (sProjName) {
								assert.equal(sPrefixProjectName + "4", sProjName, "Project names should be equal");
							});
						});
					});
				});
			});

			it("Should generate project name with the right index (missing middle index)", function () {
				return oDocumentProvider.getDocument("/QuickStartApplication2").then(function (oFolderDocument) {
					return oFolderDocument.delete().then(function () {

						//Existing project names are ["QuickStartApplication", "QuickStartApplication3"]
						return quickStartUtils.getQuickStartProjectName().then(function (sProjName) {
							assert.equal(sPrefixProjectName + "2", sProjName, "Project names should be equal");
						});
					});
				});
			});
		});

		describe("Test quick Start project creation", function () {

			it("Should create a project and open it in Layout Editor", function () {

				return oQuickStartService.quickStartWithLayoutEditor().then(function () { //Creating QuickStartApplication2 back...
					sProjectName = sPrefixProjectName + "4";

					return quickStartUtils.getQuickStartProjectName().then(function (sNextProjName) {
						assert.equal(sProjectName, sNextProjName, "Project names should equal");
					});
				});
			});
		});

	});
});
