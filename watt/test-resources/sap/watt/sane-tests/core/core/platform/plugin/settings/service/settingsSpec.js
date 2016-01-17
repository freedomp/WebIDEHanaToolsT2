define(["STF"], function(STF) {
	"use strict";

	var suiteName = "settingsTest";
	var oDocumentService, oFilesystem, oFakeFileDAO, oProjectSettings, oTestConsumer, oDocumentServiceImpl, oFilesystemImpl, oProjectSettingsImpl;
	describe("settings test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/settings/config.json"
			}).then(function() {
				oDocumentService = getService("document");
				oFilesystem = getService("filesystem.documentProvider");
				oFakeFileDAO = getService("fakeFileDAO");
				oProjectSettings = getService("setting.project");
				
				oTestConsumer = getService("testConsumer");
				return Q.all([oDocumentService.$(), oFilesystem.$(), oProjectSettings.$()]).spread(function(oImpl1, oImpl2, oImpl3) {
					oDocumentServiceImpl = oImpl1._getImplSync();
					oFilesystemImpl = oImpl2._getImplSync();
					oProjectSettingsImpl = oImpl3._getImplSync();
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Project Settings", function() {
			before(function() {
				//Clean up internal document buffer to ensure clean state and filesystem root
				oDocumentServiceImpl._mDocuments = {};
				oFilesystemImpl._workspaceRoot = undefined;

				return oFakeFileDAO.setContent({
					"a": {
						"aa": "aa",
						"ab": "ab",
						"afolder": {
							"afa": "foo"
						}
					},
					"b": {
						"ba": "ba",
						".project.json": '{ "other": "some-setting" ,"testConsumer": "important-setting"}'
					}
				});
			});

			it(".project.json file is not created in the correct folder, when it doesn't exist and a file in the project is selected", function() {
				return givenAFileIsSelectedAndSettingsFileIsNotExistingExpectingSettingsFileNotToBeCreated("/a/aa", "/a/.project.json")
			});
			it(
				".project.json file is not created in the correct folder, when it doesn't exist and a file deep in the project structure is selected",
				function() {
					return givenAFileIsSelectedAndSettingsFileIsNotExistingExpectingSettingsFileNotToBeCreated("/a/afolder/afa", "/a/.project.json")
				});

			it(".project.json file is not created in the correct folder, when it doesn't exist and project folder is selected",
				function() {
					return givenAFileIsSelectedAndSettingsFileIsNotExistingExpectingSettingsFileNotToBeCreated("/a", "/a/.project.json")
				});

			it("existing settings are read and filtered for the given service",function() {
				return givenFileIsSelected("/b/ba").then(function() {
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, "important-setting");
				});

			});

			it("new settings are written for the given service object",function() {
				var NEW_SETTING = "new-setting"

				return givenFileIsSelected("/b/ba").then(function() {
					return oProjectSettings.set(oTestConsumer._oContext.self, NEW_SETTING);
				}).then(function() {
					return expectDocumentExists("/b/.project.json");
				}).then(function(oProjectSettingDocument) {
					return oProjectSettingDocument.getContent();
				}).then(function(sContent) {
					assert.strictEqual(sContent, '{\n  "other": "some-setting",\n  "testConsumer": "new-setting"\n}',
						"other service settings are not overwritten");
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, NEW_SETTING);
				});

			});

			it("new settings are written for the given service name", function() {
				var NEW_SETTING = "new-setting"
				var serviceName = "MyServiceName"
				return givenFileIsSelected("/a/aa").then(function() {
					return oProjectSettings.setProjectSettings(serviceName, NEW_SETTING);
				}).then(function() {
					return expectDocumentExists("/a/.project.json");
				}).then(function(oProjectSettingDocument) {
					return oProjectSettingDocument.getContent();
				}).then(function(sContent) {
					assert.strictEqual(sContent, '{\n  "MyServiceName": "new-setting"\n}', "other service settings are not overwritten");
					return oProjectSettings.getProjectSettings(serviceName);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, NEW_SETTING);
				});

			});

			it("new settings are written for the given service object when the file does not exist yet", function() {
				var NEW_SETTING = "new-setting"

				return givenFileIsSelected("/b/ba").then(function() {
					return oProjectSettings.set(oTestConsumer._oContext.self, NEW_SETTING);
				}).then(function() {
					return expectDocumentExists("/b/.project.json");
				}).then(function(oProjectSettingDocument) {
					return oProjectSettingDocument.getContent();
				}).then(function(sContent) {
					assert.strictEqual(sContent, '{\n  "other": "some-setting",\n  "testConsumer": "new-setting"\n}',
						"other service settings are not overwritten");
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, NEW_SETTING);
				});

			});

			it("new settings are written for the given service name 2", function() {
				var NEW_SETTING = "new-setting"
				var serviceName = "testConsumer"
				return givenFileIsSelected("/b/ba").then(function() {
					return oProjectSettings.setProjectSettings(serviceName, NEW_SETTING);
				}).then(function() {
					return expectDocumentExists("/b/.project.json");
				}).then(function(oProjectSettingDocument) {
					return oProjectSettingDocument.getContent();
				}).then(function(sContent) {
					assert.strictEqual(sContent, '{\n  "other": "some-setting",\n  "testConsumer": "new-setting"\n}',
						"other service settings are not overwritten");
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, NEW_SETTING);
				});

			});
			it("new settings are written for the given service and saved in the right order", function() {
				var NEW_SETTING = "new-setting"

				return givenFileIsSelected("/b/ba").then(function() {
					return Q.all([
						oProjectSettings.set(oTestConsumer._oContext.self, "new-setting 1"),
						oProjectSettings.set(oTestConsumer._oContext.self, "new-setting 2"),
						oProjectSettings.set(oTestConsumer._oContext.self, "new-setting 3"),
						oProjectSettings.set(oTestConsumer._oContext.self, NEW_SETTING)
					]);
				}).then(function() {
					return expectDocumentExists("/b/.project.json");
				}).then(function(oProjectSettingDocument) {
					return oProjectSettingDocument.getContent();
				}).then(function(sContent) {
					assert.strictEqual(sContent, '{\n  "other": "some-setting",\n  "testConsumer": "new-setting"\n}',
						"other service settings are not overwritten");
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					assert.strictEqual(mSettings, NEW_SETTING);
				});

			});

			function givenFileIsSelected(sPath) {
				return oFilesystem.getDocument(sPath).then(function(oDocument) {
					return oProjectSettingsImpl.onSelectionChanged({
						params: {
							selection: [{
								document: oDocument
							}]
						}
					});
				});
			}

			function expectDocumentExists(sPath) {
				return oFilesystem.getDocument(sPath).then(function(oDocument) {
					assert.ok(oDocument, "expecting " + sPath + " to exists");
					return oDocument;
				});
			}

			function expectDocumentNotExists(sPath) {
				return oFilesystem.getDocument(sPath).then(function(oDocument) {
					assert.ok(!oDocument, "expecting " + sPath + " not to exists");
					return oDocument;
				});
			}

			function givenAFileIsSelectedAndSettingsFileIsNotExistingExpectingSettingsFileNotToBeCreated(sSelectedFilePath,
				sExpectingSettingsPath) {
				return givenFileIsSelected(sSelectedFilePath).then(function() {
					return oProjectSettings.get(oTestConsumer._oContext.self);
				}).then(function(mSettings) {
					return expectDocumentNotExists(sExpectingSettingsPath);
				});
			}
		});
	});
});