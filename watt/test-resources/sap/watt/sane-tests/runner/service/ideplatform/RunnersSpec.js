define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "runnersSpec";

	describe("Runners", function() {
		var oRunServiceImpl;
		var oRunService;
		var Q;
		
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				return STF.require(suiteName, []).spread(
					function() {
						sandbox = sinon.sandbox.create();
						Q = webIdeWindowObj.Q;
						oRunService = STF.getService(suiteName, "run");
						oRunService.context.service = {};
						oRunService.context.service.resource = {};
						oRunService.context.service.resource.includeStyles = function() {
							return Q();
						};
						oRunService.context.service.menuBar = {};
						oRunService.init = function() {
							return Q();
						};
						oRunService.context.service.menuBar.configure = function() {
							return Q();
						};
						oRunService.context.service.menuBar.getContent = function() {
							return Q();
						};
						oRunService.context.service.command = {};
						oRunService.context.service.command.getCommand = function() {
							return Q();
						};
						return oRunService.$().then(function(oNonLazyProxy) {
							return oNonLazyProxy._getImpl({});
						}).then(function(oImpl) {
							oRunServiceImpl = oImpl;
							oRunServiceImpl.configure({
								types: [{
									"id": "ProjType1",
									"displayName": "Project Type 1",
									"description": "Project Type 1"
								}, {
									"id": "ProjType2",
									"displayName": "Project Type 2",
									"description": "Project Type 2"
								}, {
									"id": "ProjType3",
									"displayName": "Project Type 3",
									"description": "Project Type 3"
								}, {
									"id": "BuiltInProjType",
									"displayName": "Built In Project Type",
									"description": "Built In Project Type test"
								}, {
									"id": "DefaultProjType1",
									"displayName": "Default Project Type 1",
									"description": "Default Project Type 1 for test"
								}, {
									"id": "DefaultProjType2",
									"displayName": "Default Project Type 2",
									"description": "Default Project Type 2 for test"
								}],
								builtInTypes: ["BuiltInProjType"],
								defaultTypes: ["DefaultProjType1", "DefaultProjType2"],

								runners: [{
										"id": "builtintestrunner1",
										"service": "@fakeRunnerService",
										"displayName": "testRunner for built-in type",
										"projectTypesIds": ["BuiltInProjType"],
										"fileTypes": ["*.html"]
									}, {
										"id": "defaulttestrunner1-1",
										"service": "@fakeRunnerService",
										"displayName": "testRunner for default 1 type",
										"projectTypesIds": ["DefaultProjType1"],
										"fileTypes": ["*.html"]
									}, {
										"id": "defaulttestrunner1-2",
										"service": "@fakeRunnerService",
										"displayName": "testRunner for default 1 type",
										"projectTypesIds": ["DefaultProjType1"],
										"fileTypes": ["*.html"]
									}, {
										"id": "testrunner1",
										"service": "@fakeRunnerService",
										"displayName": "testRunner for project type 1",
										"projectTypesIds": ["ProjType1"],
										"fileTypes": ["*.html"]
									}, {
										"id": "testrunner2",
										"service": "@fakeRunnerService",
										"displayName": "testRunner for multiple project types",
										"projectTypesIds": ["ProjType2", "DefaultProjType2"],
										"fileTypes": ["*.html"]
									}

								]
							});
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

		it("getRunnersForSelectedProject - Single runner for selected project",
			function() {
				var aProjectTypes = ["BuiltInProjType"];

				var expecterdRunners = [{
					"sId": "builtintestrunner1",
					"oService": "@fakeRunnerService",
					"displayName": "testRunner for built-in type",
					"aProjectTypesIds": ["BuiltInProjType"],
					"fileTypes": ["*.html"]
				}];

				sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));

				return oRunService.getRunnersForSelectedProject().then(function(aResultRunners) {
					expect(aResultRunners.length).to.equal(expecterdRunners.length);
					for (var ii = 0; ii < aResultRunners.length; ii++) {
						expect(aResultRunners[ii].aProjectTypesIds[0]).to.equal(expecterdRunners[ii].aProjectTypesIds[0]);
						expect(aResultRunners[ii].sId[0]).to.equal(expecterdRunners[ii].sId[0]);
						expect(aResultRunners[ii].fileTypes[0]).to.equal(expecterdRunners[ii].fileTypes[0]);
						expect(aResultRunners[ii].displayName[0]).to.equal(expecterdRunners[ii].displayName[0]);
						expect(aResultRunners[ii].oService).to.equal(expecterdRunners[ii].oService);

					}
				});
			});

		it("getRunnersForSelectedProject - multiple runner for selected project", function() {

			var aProjectTypes = ["DefaultProjType1"];

			var expecterdRunners = [{
				"sId": "defaulttestrunner1-1",
				"oService": "@fakeRunnerService",
				"displayName": "testRunner for default 1 type",
				"aProjectTypesIds": ["DefaultProjType1"],
				"fileTypes": ["*.html"]
			}, {
				"sId": "defaulttestrunner1-2",
				"oService": "@fakeRunnerService",
				"displayName": "testRunner for default 1 type",
				"aProjectTypesIds": ["DefaultProjType1"],
				"fileTypes": ["*.html"]
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));

			return oRunService.getRunnersForSelectedProject().then(function(aResultRunners) {
				expect(aResultRunners.length).to.equal(expecterdRunners.length);
				for (var ii = 0; ii < aResultRunners.length; ii++) {
					expect(aResultRunners[ii].aProjectTypesIds[0]).to.equal(expecterdRunners[ii].aProjectTypesIds[0]);
					expect(aResultRunners[ii].sId[0]).to.equal(expecterdRunners[ii].sId[0]);
					expect(aResultRunners[ii].fileTypes[0]).to.equal(expecterdRunners[ii].fileTypes[0]);
					expect(aResultRunners[ii].displayName[0]).to.equal(expecterdRunners[ii].displayName[0]);
					expect(aResultRunners[ii].oService).to.equal(expecterdRunners[ii].oService);

				}
			});
		});

		it("getRunnersForSelectedProject - single runner for selected project with 2 project Types which related to the selected runner",
			function() {

				var aProjectTypes = ["ProjType2", "DefaultProjType2"];

				var expecterdRunners = [{
					"sId": "testrunner2",
					"oService": "@fakeRunnerService",
					"displayName": "testRunner for multiple project types",
					"aProjectTypesIds": ["ProjType2", "DefaultProjType2"],
					"fileTypes": ["*.html"]
				}];

				sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));

				return oRunService.getRunnersForSelectedProject().then(function(aResultRunners) {
					expect(aResultRunners.length).to.equal(expecterdRunners.length);
					for (var ii = 0; ii < aResultRunners.length; ii++) {
						expect(aResultRunners[ii].aProjectTypesIds[0]).to.equal(expecterdRunners[ii].aProjectTypesIds[0]);
						expect(aResultRunners[ii].sId[0]).to.equal(expecterdRunners[ii].sId[0]);
						expect(aResultRunners[ii].fileTypes[0]).to.equal(expecterdRunners[ii].fileTypes[0]);
						expect(aResultRunners[ii].displayName[0]).to.equal(expecterdRunners[ii].displayName[0]);
						expect(aResultRunners[ii].oService).to.equal(expecterdRunners[ii].oService);

					}
				});
			});
			
    it("getRunnersForSelectedProject - no runners for selected project",function(){

        var aProjectTypes=["nonExistsRunner"];

        sandbox.stub(oRunServiceImpl,"_getSelectedProjectTypes").returns(Q(aProjectTypes));

        return oRunService.getRunnersForSelectedProject().then(function(aResultRunners){
            expect(aResultRunners.length).to.equal(0);
        });
    });

	});
});