define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "RelevantModulesProvider_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oSelectService, oRelevantmodulesproviderService, oFakeEnvironment,
			oFakeFileDAO, oFakeProjectTypeDAO, oFileService, oWebIDEWindow;

		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function (oWindow) {
				oSelectService = getService('selection');
				oRelevantmodulesproviderService = getService('relevantmodulesprovider');
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


		it("Test relevant modules on MTA project",function(){
			oSelectService.getSelection = function() {
				return oFakeFileDAO.setContent({
					"project1" : {}
				}).then(function () {
					oFakeProjectTypeDAO.getProjectTypes = function() {
						return Q([{"id": "mta"}]);
					};
					return oFileService.getDocument("/project1");
				}).then(function(doc){
					return Q([
						{"document" : doc}
					]);
				});
			};
			return oRelevantmodulesproviderService.getItems().then(function(aItems){
				oSelectService.getSelection = undefined;
				assert.ok(aItems.length === 3, "succeed  to get 3 modules for a MTA project");
			});
		});

		it("Test relevant modules on a project with no project types",function(){
			oSelectService.getSelection = function() {
				return oFakeFileDAO.setContent({
					"project2" : {}
				}).then(function () {
					oFakeProjectTypeDAO.getProjectTypes = function() {
						return Q([]);
					};
					return oFileService.getDocument("/project2");
				}).then(function(doc){
					return Q([
						{"document" : doc}
					]);
				});
			};
			return oRelevantmodulesproviderService.getItems().then(function(aItems){
				oSelectService.getSelection = undefined;
				assert.ok(aItems.length === 2, "succeed to get 2 modules for a project with no project types");
			});
		});

		it("Test relevant templates contains the more option",function(){
			oSelectService.getSelection = function() {
				return oFakeFileDAO.setContent({
					"project3": {}
				}).then(function () {
					oFakeProjectTypeDAO.getProjectTypes = function() {
						return Q([{"id": "mta"}, {"id": "someType"}]);
					};
					return oFileService.getDocument("/project3");
				}).then(function(doc){
					return Q([
						{"document" : doc}
					]);
				});
			};
			return oRelevantmodulesproviderService.getItems().then(function(aItems){
				assert.ok(aItems.length === 4, "succeed to get 5 modules for multi types");
				assert.ok(aItems[0].getId() === "test1" &&
					aItems[1].getId() === "test0" &&
					aItems[2].getId() === "test3" &&
					aItems[3].getId() === "test2" , "succeed to get sorted modules and the more option");
			});
		});

		it("Test relevant templates in external env",function(){
			var oEnvParameters = {
				"internal" : false,
				"server_type" : "hcproxy"
			};

			return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, oEnvParameters).then(function(stub){
				aStubs.push(stub);
				oSelectService.getSelection = function() {
					return oFakeFileDAO.setContent({
						"project4" : {}
					}).then(function () {
						oFakeProjectTypeDAO.getProjectTypes = function() {
							return Q([{"id": "mta"}, {"id": "someType"}]);
						};
						return oFileService.getDocument("/project4");
					}).then(function(doc){
						return Q([
							{"document" : doc}
						]);
					});
				};
				return oRelevantmodulesproviderService.getItems().then(function(aItems){
					assert.ok(aItems.length === 4, "succeed to hide internal module in external environment");
				});
			});
		});


	});
});
