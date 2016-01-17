define(["sap/watt/core/q"], function (coreQ) {

	"use strict";

	describe("Unit tests for ExtensionProjectSettings class", function () {

		var oExtensionProjectSettings;
		var oMockPreviewService = {
			updateSettings: function(oTargetDocument, mockPreviewJson) {
				return Q(mockPreviewJson); //will be used to test the received mockPreviewJson data
			}
		};

		var oUI5ProjectHandlerService = {
			getDataSourcesByType : function() {
				return Q({
					"myService" : {
						"uri" : "/sap/opu/odata/myService",
						"type" : "OData"
					}
				});
			}
		};

		var oGeneratedEvent = {
			params: {
				model : {
					extensibility : {},
					metadataPath : "/webapp/localService/metadata.xml"
				},
				targetDocument : {
					getEntity: function() {
						return {
							getName: function() {
								return "MyApp";
							}
						};
					}
				}
			}
		};
		
		var oSettingService = {};
		oSettingService.project = {};
		oSettingService.project.setProjectSettings = function(sBlockName, oBuildSettings, oTargetDocument) {
			return Q(oBuildSettings);
		};

		var oParentProjectService = {};
		var oFileSystemService = null;

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/util/ExtensionProjectSettings").then(function(ExtensionProjectSettings) {
				oExtensionProjectSettings = ExtensionProjectSettings;
			});
		});
		
		it("Tests createBuild method", function() {
			return oExtensionProjectSettings.createBuild(oGeneratedEvent, oSettingService).then(function(oBuildSettings) {
				expect(oBuildSettings).to.exist;
				expect(oBuildSettings.targetFolder).to.equal("dist");
				expect(oBuildSettings.sourceFolder).to.equal("webapp");
				expect(oBuildSettings.buildRequired).to.equal(true);
			});
		});

		it("Tests createMockPreview method - No mock settings in parent project", function() {
			oParentProjectService.getMockPreview = function() {
				return Q(null);
			};

			return oExtensionProjectSettings.createMockPreview(oGeneratedEvent, oParentProjectService, oFileSystemService,
				oUI5ProjectHandlerService, oMockPreviewService).then(function(mockPreviewJson){
					expect(mockPreviewJson.mockUri).to.equal("/sap/opu/odata/myService"); //mock url should be taken from application code when no mock settings for parent project
					expect(mockPreviewJson.loadCustomRequests).to.equal(false); //loadCustomRequests should be false when no mock settings for parent project
					expect(mockPreviewJson.loadJSONFiles).to.equal(false); //loadJSONFiles should be false when no mock settings for parent project
					expect(mockPreviewJson.metadataFilePath).to.equal(""); //metadataFilePath should be left empty in extension project (path resolved at runtime)
					expect(mockPreviewJson.mockRequestsFilePath).to.equal(""); //mockRequestsFilePath should be left empty when no mock settings for parent project
				});
		});

		it("Tests createMockPreview method - Mock settings from parent project with all the data", function() {
			oParentProjectService.getMockPreview = function() {
				return Q({
					"mockUri": "/sap/opu/odata/myParentService",
					"loadCustomRequests": true,
					"loadJSONFiles": true,
					"metadataFilePath": "/some/file/path/metadata.xml",
					"mockRequestsFilePath": "/some/another/file/path/mockserver.js"
				});
			};

			return oExtensionProjectSettings.createMockPreview(oGeneratedEvent, oParentProjectService, oFileSystemService,
				oUI5ProjectHandlerService, oMockPreviewService).then(function(mockPreviewJson){
					expect(mockPreviewJson.mockUri).to.equal("/sap/opu/odata/myParentService"); //mock url should be taken from parent application mock settings when provided
					expect(mockPreviewJson.loadCustomRequests).to.equal(true); //loadCustomRequests should be taken from parent application mock settings when provided
					expect(mockPreviewJson.loadJSONFiles).to.equal(true); //loadJSONFiles should be taken from parent application mock settings when provided
					expect(mockPreviewJson.metadataFilePath).to.equal(""); //metadataFilePath should be left empty in extension project (path resolved at runtime)
					expect(mockPreviewJson.mockRequestsFilePath).to.equal("localService/mockserver.js"); //mockRequestsFilePath should be extracted from parent application mock settings when provided, but adjusted to extension project structure
				});
		});

		it("Tests createMockPreview method - Mock settings from parent project without mockUri - url from app", function() {
			oParentProjectService.getMockPreview = function() {
				return Q({
					"mockUri": "",
					"loadCustomRequests": true,
					"loadJSONFiles": true,
					"metadataFilePath": "/some/file/path/metadata.xml",
					"mockRequestsFilePath": "/some/another/file/path/mockserver.js"
				});
			};

			return oExtensionProjectSettings.createMockPreview(oGeneratedEvent, oParentProjectService, oFileSystemService,
				oUI5ProjectHandlerService, oMockPreviewService).then(function(mockPreviewJson){
					expect(mockPreviewJson.mockUri).to.equal("/sap/opu/odata/myService"); //mock url should be taken from parent application code when not provided in mock settings
					expect(mockPreviewJson.loadCustomRequests).to.equal(true); //loadCustomRequests should be taken from parent application mock settings when provided
					expect(mockPreviewJson.loadJSONFiles).to.equal(true); //loadJSONFiles should be taken from parent application mock settings when provided
					expect(mockPreviewJson.metadataFilePath).to.equal(""); //metadataFilePath should be left empty in extension project (path resolved at runtime)
					expect(mockPreviewJson.mockRequestsFilePath).to.equal("localService/mockserver.js"); //mockRequestsFilePath should be extracted from parent application mock settings when provided, but adjusted to extension project structure
				});
		});

		it("Tests createMockPreview method - Mock settings from parent project without mockUri - no url from app", function() {
			oParentProjectService.getMockPreview = function() {
				return Q({
					"mockUri": "",
					"loadCustomRequests": true,
					"loadJSONFiles": true,
					"metadataFilePath": "/some/file/path/metadata.xml",
					"mockRequestsFilePath": "/some/another/file/path/mockserver.js"
				});
			};

			oUI5ProjectHandlerService.getDataSourcesByType = function() {
				return Q(null);
			};

			return oExtensionProjectSettings.createMockPreview(oGeneratedEvent, oParentProjectService, oFileSystemService,
				oUI5ProjectHandlerService, oMockPreviewService).then(function(mockPreviewJson){
					expect(mockPreviewJson.mockUri).to.equal(""); //mock url should be empty if not provided in parent application mock settings and code
					expect(mockPreviewJson.loadCustomRequests).to.equal(true); //loadCustomRequests should be taken from parent application mock settings when provided
					expect(mockPreviewJson.loadJSONFiles).to.equal(true); //loadJSONFiles should be taken from parent application mock settings when provided
					expect(mockPreviewJson.metadataFilePath).to.equal(""); //metadataFilePath should be left empty in extension project (path resolved at runtime)
					expect(mockPreviewJson.mockRequestsFilePath).to.equal("localService/mockserver.js"); //mockRequestsFilePath should be extracted from parent application mock settings when provided, but adjusted to extension project structure
				});
		});

		afterEach(function () {
			oExtensionProjectSettings = undefined;
		});
	});
});