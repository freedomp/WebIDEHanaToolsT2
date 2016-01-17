define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "Config_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oFileService, oConfigService, oPluginDevService, oProjectSettingsService,
			projectJson1, projectJson2;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
					oFakeFileDAO = getService("fakeFileDAO");
					oFileService = getService("filesystem.documentProvider");
					oConfigService = getService("plugindevelopment.config");
					oPluginDevService = getService("plugindevelopment");
					oProjectSettingsService = getService("setting.project");
					projectJson1 = "{\"plugindevelopment\": {\"dependencies\": { \"all\" : [\"pluginTest\"]},\"devUrlParameters\": {\"debugAsync\": \"lite\",\"sap-ide-debug\": \"false\"}}}";
					projectJson2 = "{\"plugindevelopment\": {\"dependencies\": { \"all\" : [ ]},\"devUrlParameters\": {\"debugAsync\": \"lite\",\"sap-ide-debug\": \"false\"}}}";
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("getProjectSettingContent with null - negative", function() {
			var oFileStructure1 = {
				"myProject1" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson1
				}
			};
			return oFakeFileDAO.setContent(oFileStructure1).then(function() {
				return oFileService.getDocument("/myProject1").then(function() {
					return oConfigService.getProjectSettingContent("dummyId", "dummyGroup").then(function (bResult) {
						assert.ok(!bResult, "getProjectSettingContent with null failed as expected");
					});
				});
			});
		});

		it("getProjectSettingContent with non existing project - negative", function() {
			var oFileStructure1 = {
				"myProject1" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson1
				}
			};
			return oFakeFileDAO.setContent(oFileStructure1).then(function() {
				return oFileService.getDocument("/myProject1").then(function() {
					return oConfigService.getProjectSettingContent("dummyId", "dummyGroup", "/myProject111").then(function (bResult) {
						assert.ok(bResult.sId === "emptyForm", "getProjectSettingContent with with non existing project failed as expected");
					});
				});
			});
		});

		it("getProjectSettingContent", function() {
			var oFileStructure1 = {
				"myProject1" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson1
				}
			};
			return oFakeFileDAO.setContent(oFileStructure1).then(function() {
				return oFileService.getDocument("/myProject1").then(function(projectDocument) {
					return oConfigService.getProjectSettingContent("dummyId", "dummyGroup", "/myProject1").then(function (bResult) {
						assert.ok(bResult, "myProject1 plugin development settings retrieved");
						return oProjectSettingsService.get(oPluginDevService, projectDocument).then(function(oSettings) {
							var projectSettings = "{\"plugindevelopment\":" + JSON.stringify(oSettings) + "}";
							assert.ok(projectSettings === projectJson1.replace(/\s/g, ''), "myProject1 plugin development settings are OK");
						});
					});
				});
			});
		});

		it("saveProjectSetting", function() {
			var oFileStructure2 = {
				"myProject2" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson2
				},
				"myProject1" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson1
				}
			};
			return oFakeFileDAO.setContent(oFileStructure2).then(function() {
				return oFileService.getDocument("/myProject2").then(function(projectDocument) {
					return oConfigService.saveProjectSetting("dummyId", "dummyGroup").then(function () {
						assert.ok(true, "myProject1 plugin development settings saved");
						return oConfigService.getProjectSettingContent("dummyId", "dummyGroup", "/myProject2").then(function () {
							return oProjectSettingsService.get(oPluginDevService, projectDocument).then(function(oSettings) {
								var projectSettings = "{\"plugindevelopment\":" + JSON.stringify(oSettings) + "}";
								assert.ok(projectSettings === projectJson2.replace(/\s/g, ''), "myProject2 plugin development settings are OK");
							});
						});
					});
				});
			});
		});
	});
});
