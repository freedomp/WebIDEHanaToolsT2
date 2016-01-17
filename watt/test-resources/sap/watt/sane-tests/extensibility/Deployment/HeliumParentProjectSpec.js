define(['STF',
	"sap/watt/saptoolsets/fiori/hcp/plugin/heliumrepository/services/HeliumParentProject"], function(STF, HeliumParentProject) {

	"use strict";

	describe("Unit tests for HeliumParentProject internal functions", function() {
		var heliumParentProject;

		beforeEach(function() {
			heliumParentProject = new HeliumParentProject();
		});

		it('Gets resources from array of zip files', function() {
			var aFilePaths = ["pom.xml", "webapp/", "webapp/WEB-INF/web.xml"];

			var aResourcesFromZipFiles = heliumParentProject.getResourcesFromZipFiles(aFilePaths);
			expect(aResourcesFromZipFiles.length).to.equal(aFilePaths.length);
			expect(aResourcesFromZipFiles[0].parentFolderPath).to.equal("");
			expect(aResourcesFromZipFiles[1].parentFolderPath).to.equal("webapp");
			expect(aResourcesFromZipFiles[2].parentFolderPath).to.equal("webapp/WEB-INF");
		});
	});

	var suiteName = "HeliumParentProject_Service";
	var getService = STF.getServicePartial(suiteName);

	describe("Service tests for HeliumParentProject service", function() {
		var oHeliumParentProject;
		var oFakeFileDAO;
		var oFileService;
		var iFrameWindow;

		before(function () {
			return STF.startWebIde(suiteName, { config: "extensibility/config.json" }).then(function (_iFrameWindow) {
				iFrameWindow = _iFrameWindow;
				oHeliumParentProject = getService('heliumparentproject');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileService = getService('filesystem.documentProvider');
			});
		});

		it("Tests import method", function () {

			var applicationName = "MyApp";
			var system = {};
			system.account = "dummyAccount";
			system.type = "dummyType";
			system.application = "dummyApplication";

			var oFileStructure = {
				"FioriMD" : {
					"michal.json" : "dummyInput" // some file that isn't in the app's ZIP
				}
			};

			var heliumParentProject = new HeliumParentProject();

			// mock the getResponseFromHCP method
			// needed to do it for the "required" service because it didn't work for the real service
			heliumParentProject.getResponseFromHCP = function() {
				// get the zip from the file system
				var sPathToZip = "../test-resources/sap/watt/sane-tests/extensibility/AppDescriptor/sap_ui_ui5_template_plugin_2masterdetail.zip";
				var sURL = require.toUrl(sPathToZip);
				return iFrameWindow.Q.sap.ajax(sURL, {
					responseType: "arraybuffer"
				}).then(function(oZip) {
					return Q(oZip[0]);
				});
			};

			// since we're using the "required" service we need to
			// set the context of the "required" service to be as the real service
			heliumParentProject.context = oHeliumParentProject.context;

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oFileService.getDocument("/FioriMD").then(function(destinationDocument) {
					return heliumParentProject.import(applicationName, system, destinationDocument).then(function(oResult) {
						expect(oResult).to.equal(undefined);
					});
				});
			});
		});

		it("Tests getRuntimeDestinations method", function () {

			var system = {};
			system.name = "abap_backend";
			system.account = "dummyAccount";
			system.application = "dummyApplication";

			var parentDestinations = [];

			// positive test
			return oHeliumParentProject.getRuntimeDestinations(system, parentDestinations).then(function (oResult1) {
				expect(oResult1).to.exist;
				expect(oResult1[0].target.name).to.equal("dummyApplication");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
