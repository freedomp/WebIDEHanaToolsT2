define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "mockPreview";

	describe("Mock Preview", function() {
		var oFilesystem;
		var oFakeFileDAO;
		var oMockPreviewService;
		var oProjectSettings;
		var oContentService;
		var oMenuBarService;
		var oFioriodataService;
		var oAppdescriptorutilService;
		var oUI5projecthandlerService;
		var oFile1Doc;
		var oFile2Doc;
		var oFile3Doc;

		var sDOC1 = "any html code";
		var sDOC2 = '{ "other": "some-setting" ,"testConsumer": "important-setting"}';
		var sDOC3 = "third js code";

		var fnCreateFileStructure = function() {
			return oFakeFileDAO.setContent({
				"folder": {
					"file1.html": sDOC1,
					".project.json": sDOC2,
					"file3.js": sDOC3
				}
			}).then(function() {
				return Q.all([oFilesystem.getDocument("/folder/file1.html"),
					oFilesystem.getDocument("/folder/project.json"),
					oFilesystem.getDocument("/folder/file3.js")
				]).spread(function(oDoc1, oDoc2, oDoc3) {
					oFile1Doc = oDoc1;
					oFile2Doc = oDoc2;
					oFile3Doc = oDoc3;
				});
			});
		};

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/mockpreview/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFilesystem = STF.getService(suiteName, "filesystem.documentProvider");
				oMockPreviewService = STF.getService(suiteName, "mockpreview");
				oProjectSettings = STF.getService(suiteName, "setting.project");
				oContentService = STF.getService(suiteName, "content");
				oMenuBarService = STF.getService(suiteName, "menuBar");
				oFioriodataService = STF.getService(suiteName, "fioriodata");
				oAppdescriptorutilService = STF.getService(suiteName, "appdescriptorutil");
				oUI5projecthandlerService = STF.getService(suiteName, "ui5projecthandler");
				return oFakeFileDAO.setContent({
					"folder": {
						"file1.html": sDOC1,
						".project.json": sDOC2,
						"file3.js": sDOC3
					}
				}).then(function() {
					return Q.all([oFilesystem.getDocument("/folder/file1.html"),
						oFilesystem.getDocument("/folder/project.json"),
						oFilesystem.getDocument("/folder/file3.js")
					]).spread(function(oDoc1, oDoc2, oDoc3) {
						oFile1Doc = oDoc1;
						oFile2Doc = oDoc2;
						oFile3Doc = oDoc3;
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("buildRunnableDocument",
			function() {
				oFakeFileDAO.importFile = function() {
					var deffered = Q.defer();
					deffered.resolve(oFile1Doc);
					return deffered.promise;
				};

				oFakeFileDAO.getDocument = function() {
					var deffered = Q.defer();
					deffered.resolve(oFile1Doc);
					return deffered.promise;
				};

				oProjectSettings.set = function() {
					var deffered = Q.defer();
					deffered.resolve();
					return deffered.promise;
				};

				var oSettings = {
					"mockUri": "dummyUri",
					"metadataFilePath": "path",
					"loadJSONFiles": false,
					"loadCustomRequests": false,
					"mockRequestsFilePath": "",
					"aAnnotations": []
				};
				
				sandbox.stub(oUI5projecthandlerService, "getAppNamespace").returns(Q("app.ns"));
				
				return oMockPreviewService.buildRunnableDocument(oSettings, oFile1Doc).then(function(oDoc) {
					expect(oDoc).to.not.equal(undefined);
				});
			});

		it("data comes from manifest.json",
			function() {
				var oFileStructure = {
					"SomeProject1": {
						"index.html": "some content"
					}
				};
				var oSettings = {};

				sandbox.stub(oFioriodataService, "getServiceUrl").returns(Q("SomeServiceUrl"));
				sandbox.stub(oAppdescriptorutilService, "getMetadataPath").returns(Q("model/metadata.xml"));

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFilesystem.getDocument("/SomeProject1").then(function(oDocument) {
						return oMockPreviewService.getRunnableMockSettings(oDocument, oSettings).then(function(oMockSettings) {
							expect(oMockSettings).to.not.equal(undefined);
							expect(oMockSettings.mockUri).to.equal("SomeServiceUrl");
							expect(oMockSettings.metadataFilePath).to.equal("model/metadata.xml");
							expect(oMockSettings.aAnnotations.length).to.equal(0);
						});
					});
				});
			});

		it("data comes from project.json  - no manifest.json",
			function() {
				var oFileStructure = {
					"SomeProject1": {
						"index.html": "some content"
					}
				};

				var oSettings = {
					"loadJSONFiles": true,
					"loadCustomRequests": false,
					"mockRequestsFilePath": "",
					"mockUri": "SomeServiceUrl",
					"metadataFilePath": "model/metadata.xml"
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFilesystem.getDocument("/SomeProject1").then(function(oDocument) {
						return oMockPreviewService.getRunnableMockSettings(oDocument, oSettings).then(function(oMockSettings) {
							expect(oMockSettings).to.not.equal(undefined);
							expect(oMockSettings.mockUri).to.equal("SomeServiceUrl");
							expect(oMockSettings.metadataFilePath).to.equal("model/metadata.xml");
							expect(oMockSettings.aAnnotations.length).to.equal(0);
						});
					});
				});
			});

		it("empty project.json, no manifest.json, data comes from project structure",
			function() {
				var oFileStructure = {
					"SomeProject1": {
						"model": {
							"metadata.xml": "some content"
						},
						"index.html": "some content"
					}
				};

				var oSettings = {
					"loadJSONFiles": true,
					"loadCustomRequests": false,
					"mockRequestsFilePath": "",
					"mockUri": "",
					"metadataFilePath": ""
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFilesystem.getDocument("/SomeProject1/index.html").then(function(oDocument) {
						return oMockPreviewService.getRunnableMockSettings(oDocument, oSettings).then(function(oMockSettings) {

							expect(oMockSettings).to.not.equal(undefined);
							expect(oMockSettings.mockUri).to.equal("");
							expect(oMockSettings.metadataFilePath).to.equal("model/metadata.xml");
							expect(oMockSettings.aAnnotations.length).to.equal(0);
						});
					});
				});
			});
	});
});