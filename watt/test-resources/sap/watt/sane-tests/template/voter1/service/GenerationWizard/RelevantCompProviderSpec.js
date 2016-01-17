define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "RelevantComponentsProvider_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oSelectService, oRelevantcomponentsproviderService, oFakeEnvironment,
			oFakeFileDAO, oFakeProjectTypeDAO, oFileService, oWebIDEWindow;

		var aStubs = [];

		var oEnvParameters = {
			"internal" : true,
			"server_type" : "hcproxy"
		};

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function (oWindow) {
				oSelectService = getService('selection');
				oRelevantcomponentsproviderService = getService('relevantcomponentsprovider');
				oFakeEnvironment = getService('fakeEnvironment');
				oFakeFileDAO = getService('fakeFileDAO');
				oFakeProjectTypeDAO = getService('fakeProjectTypeDAO');
				oFileService = getService('filesystem.documentProvider');
				oWebIDEWindow = oWindow;
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


		it("Test relevant templates on plugin project",function(){
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project1" : {
							"fpile1" : "a",
							".project.json" : JSON.stringify({
								"projectType" : ["sap.watt.uitools.ide.plugin"]
							})
						}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function(oTargetDocument) {
							return Q([{"id": "sap.watt.uitools.ide.plugin"}]);
						};
						return oFileService.getDocument("/project1");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantcomponentsproviderService.getItems().then(function(aItems){
					oSelectService.getSelection = undefined;
					assert.ok(aItems.length === 4, "succeed  to get 4 components for a plugin project");
				});
			});
		});

		it("Test relevant templates on a project with no project types",function(){
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project2" : {
							"fpile1" : "a",
							".project.json" : JSON.stringify({
								"projectType" : []
							})
						}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function(oTargetDocument) {
							return Q([]);
						};
						return oFileService.getDocument("/project2");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantcomponentsproviderService.getItems().then(function(aItems){
					oSelectService.getSelection = undefined;
					assert.ok(aItems.length === 2, "succeed  to get 2 components for a  project with no project types");
				});
			});
		});

		it("Test relevant templates on reuse library project",function(){
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project3" : {
							"file3" : "c",
							".project.json" : JSON.stringify({
								"projectType" : ["com.watt.uitools.plugin.reuselibrary"]
							})
						}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function(oTargetDocument) {
							return Q([{"id": "com.watt.uitools.plugin.reuselibrary"}]);
						};
						return oFileService.getDocument("/project3");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantcomponentsproviderService.getItems().then(function(aItems){
					oSelectService.getSelection = undefined;
					assert.ok(aItems.length === 4, "succeed  to get 4 components for a reuse library project");
				});
			});
		});

		it("Test relevant templates contains the more option",function(){
			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project4" : {
							"file4" : "d",
							".project.json" : JSON.stringify({
								"projectType" : ["sap.watt.uitools.ide.plugin", "com.watt.uitools.plugin.reuselibrary"]
							})
						}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function(oTargetDocument) {
							return Q([{"id": "sap.watt.uitools.ide.plugin"}, {"id": "com.watt.uitools.plugin.reuselibrary"}]);
						};
						return oFileService.getDocument("/project4");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantcomponentsproviderService.getItems().then(function(aItems){
					assert.ok(aItems.length > 4, "succeed  to get the more option");
				});
			});
		});

		it("Test relevant templates in external env",function(){
			oEnvParameters = {
				"internal" : false,
				"server_type" : "hcproxy"
			};

			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project4" : {
							"file4" : "d",
							".project.json" : JSON.stringify({
								"projectType" : ["sap.watt.uitools.ide.plugin", "com.watt.uitools.plugin.reuselibrary"],
								"pom.xml" : ""
							})
						}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function(oTargetDocument) {
							return Q([{"id": "sap.watt.uitools.ide.plugin"}, {"id": "com.watt.uitools.plugin.reuselibrary"}]);
						};
						return oFileService.getDocument("/project4");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantcomponentsproviderService.getItems().then(function(aItems){
					assert.ok(aItems.length === 4, "succeed  to get the more option");
				});
			});
		});
	});
});
