define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "PluginDevUtils_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oFileService, oPluginDevelopment, oPreferences, oFakeProjectTypeDAO, oFakeEnvironment,
			oWebIDEWindow;
		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {
					oWebIDEWindow = oWindow;
					oFakeFileDAO = getService("fakeFileDAO");
					oFakeProjectTypeDAO = getService("fakeProjectTypeDAO");
					oFileService = getService("filesystem.documentProvider");
					oPluginDevelopment = getService("plugindevelopment");
					oPreferences = getService("preferences");
					oFakeEnvironment = getService('fakeEnvironment');
			});
		});

		afterEach(function () {
			aStubs.forEach(function(stub){
				stub.restore();
			});
			aStubs = [];

		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		var projectJson1 = "{\"plugindevelopment\": {\"dependencies\": { \"all\" : [\"pluginTest\" ]},\"devUrlParameters\": {\"debugAsync\": \"lite\",\"sap-ide-debug\": \"false\"}}}";
		var projectJson2 = "{\"plugindevelopment\": {\"dependencies\": { \"all\" : [ ]},\"devUrlParameters\": {\"debugAsync\": \"lite\",\"sap-ide-debug\": \"false\"}}}";

		it("Plugin Dev Utils - Is Plugin Project",function () {
			oFakeProjectTypeDAO.getProjectTypes = function() {
				return Q([{"id": "sap.watt.uitools.ide.plugin"}]);
			};
			// Set up the project structure
			return oFakeFileDAO.setContent({
				"project1" : {
					"file1" : "a",
					".project.json" : JSON.stringify({
						"projectType" : ["sap.watt.uitools.ide.plugin"]
					})
				}
			}).then(function () {

				return oPluginDevelopment.isPluginProject("/project1").then(function(bResult){
					assert.ok(bResult, "myProject should be plugin project");
				});
			});
		});

		it("Plugin Dev Utils - Is Plugin Project",function() {
			var oFileStructure = {
				"myProject1" : {
					"aa.js" : "stam"
				}
			};
			oFakeProjectTypeDAO.getProjectTypes = function() {
				return Q([{"id": "sap.watt.uitools.ide.notplugin"}]);
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oPluginDevelopment.isPluginProject("/myProject1").then(function(bResult){
					assert.ok(bResult === false, "myProject1 should not be plugin project");
				});
			});
		});


		it("Plugin Dev Utils - writePluginToOrion",function() {
			var oFileStructure = {
				"myProject3" : {
					"plugin.json" : "{\"name\" : \"Shimon\"}",
					".project.json" : projectJson1
				},
				"pluginTest" : {
					"plugin.json" : "{\"name\" : \"testi\"}",
					".project.json" : projectJson2
				}
			};

			oPreferences.set = function(param1, param2){
				return Q();
			};

			var win = "window";
			var oEnvParameters = {
				"orion_server" : "/orion/"
			};

			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/myProject3/plugin.json").then(function(oSelectionEntity){
						return oFileService.getDocument("/pluginTest").then(function(oDoc){
							oDoc.getEntity()._mBackenData.location = "/pluginTest";
							return oPluginDevelopment.writePluginToOrion(oSelectionEntity.getEntity()).then(function(){
								oPluginDevelopment.closeTargetWindow();
								assert.ok(true, "writePluginToOrion method works well");
							});
						});
					});
				});
			});
		});
	});
});
