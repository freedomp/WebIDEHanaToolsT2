define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "runWithSpec";

	describe("Run With Configuration", function() {
		var oRunServiceImpl;
		var oRunService;
		var Q;
		var oConfigurationHelperService;
		var oConfigurationHelperServiceImpl;
		var oService;
		var aConfigurations = [{
				"_metadata": {
					"displayName": "configuration for runTestForBuiltIn1",
					"id": 1,
					"runnerId": "builtintestrunner1"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for ProjType1",
					"id": 2,
					"runnerId": "testrunner1"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for ProjType1",
					"id": 3,
					"runnerId": "testrunner1"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for DefaultProjType1-1",
					"id": 4,
					"runnerId": "defaulttestrunner1-1"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for DefaultProjType1-1",
					"id": 5,
					"runnerId": "defaulttestrunner1-1"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for DefaultProjType1-2",
					"id": 6,
					"runnerId": "defaulttestrunner1-2"
				}
			}, {
				"_metadata": {
					"displayName": "configuration for DefaultProjType2 and ProjType2",
					"id": 7,
					"runnerId": "testrunner2"
				}
			}

		];
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/ideplatform/config.json"
			});
			return loadWebIdePromise.then(function(webIdeWindowObj) {
				return STF.require(suiteName, ["../test-resources/sap/watt/sane-tests/runner/service/ideplatform/FakeRunnerService"]).spread(
					function(service) {
						sandbox = sinon.sandbox.create();
						oService = service;
						Q = webIdeWindowObj.Q;
						oRunService = STF.getService(suiteName, "run");
						oConfigurationHelperService = STF.getService(suiteName, "configurationhelper");
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
						oRunService.context.service.selection = {};
						oRunService.context.service.selection.getSelection = function() {
							return Q();
						};
						oRunService.context.service.selection.isOwner = function() {
							return Q(true);
						};
						oRunService.context.service.runconfigurationhistory = {};
						oConfigurationHelperService.context.i18n = {};
						oConfigurationHelperService.context.service = {};
						oConfigurationHelperService.context.service.runconfigurationhistory = {};
						oConfigurationHelperService.context.service.runconfigurationhistory.getConfigurationNames = function() {
							return Q(["New testRunner for built-in type"]);
						};
						oConfigurationHelperService.context.i18n.getText = function() {
							return "";
						};
						oRunService.context.service.configurationhelper = STF.getService(suiteName, "configurationhelper");
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
							return oConfigurationHelperService.$().then(function(oNonLazyProxy) {
								return oNonLazyProxy._getImpl({});
							}).then(function(oImpl2) {
								oConfigurationHelperServiceImpl = oImpl2;
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

		it("Single runner configured for the project type, no exisitng configurations", function() {
			var aProjectTypes = ["ProjType3"];
			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));
			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(0);
			});
		});

		it("Single runner configured for the project type, 1 exisitng configuration", function() {

			var aProjectTypes = ["BuiltInProjType"];
			var aExpectedRunnersConfigurations = [{
				configurations: [{
					"_metadata": {
						"displayName": "configuration for runTestForBuiltIn1",
						"id": 1,
						"runnerId": "builtintestrunner1"
					}
				}],
				runner: "builtintestrunner1"
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));

			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(aExpectedRunnersConfigurations.length);
				aExpectedRunnersConfigurations.forEach(function(oExpectedConfig) {
					// find the runner in the the result
					var oResultConfig = aResultRunnersConfigurations.filter(function(oResultConfig1) {
						if (oExpectedConfig.runner === oResultConfig1.runner.sId) {
							return oResultConfig1;
						}
					})[0];
					//compare the configuration
					expect(oResultConfig.configurations).to.deep.equal(oExpectedConfig.configurations);
				});
			});
		});

		it("Single runner configured for the project type, 2 exisitng configurations", function() {

			var aProjectTypes = ["ProjType1"];
			var aExpectedRunnersConfigurations = [{
				configurations: [{
					"_metadata": {
						"displayName": "configuration for ProjType1",
						"id": 2,
						"runnerId": "testrunner1"
					}
				}, {
					"_metadata": {
						"displayName": "configuration for ProjType1",
						"id": 3,
						"runnerId": "testrunner1"
					}
				}],
				runner: "testrunner1"
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));

			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(aExpectedRunnersConfigurations.length);
				aExpectedRunnersConfigurations.forEach(function(oExpectedConfig) {
					// find the runner in the the result
					var oResultConfig = aResultRunnersConfigurations.filter(function(oResultConfig1) {
						if (oExpectedConfig.runner === oResultConfig1.runner.sId) {
							return oResultConfig1;
						}
					})[0];
					//compare the configuration
					expect(oResultConfig.configurations).to.deep.equal(oExpectedConfig.configurations);
				});
			});
		});

		it("2 project types, only one of them has runner with 2 exisitng configurations", function() {

			var aProjectTypes = ["ProjType1", "ProjType3"];
			var aExpectedRunnersConfigurations = [{
				configurations: [{
					"_metadata": {
						"displayName": "configuration for ProjType1",
						"id": 2,
						"runnerId": "testrunner1"
					}
				}, {
					"_metadata": {
						"displayName": "configuration for ProjType1",
						"id": 3,
						"runnerId": "testrunner1"
					}
				}],
				runner: "testrunner1"
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));

			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(aExpectedRunnersConfigurations.length);

				aExpectedRunnersConfigurations.forEach(function(oExpectedConfig) {
					// find the runner in the the result
					var oResultConfig = aResultRunnersConfigurations.filter(function(oResultConfig1) {
						if (oExpectedConfig.runner === oResultConfig1.runner.sId) {
							return oResultConfig1;
						}
					})[0];
					//compare the configuration
					expect(oResultConfig.configurations).to.deep.equal(oExpectedConfig.configurations);

				});
			});
		});

		it(" 2 runners for the same project type, each has configurations", function() {

			var aProjectTypes = ["DefaultProjType1"];
			var aExpectedRunnersConfigurations = [{
				configurations: [{
					"_metadata": {
						"displayName": "configuration for DefaultProjType1-1",
						"id": 4,
						"runnerId": "defaulttestrunner1-1"
					}
				}, {
					"_metadata": {
						"displayName": "configuration for DefaultProjType1-1",
						"id": 5,
						"runnerId": "defaulttestrunner1-1"
					}
				}],
				runner: "defaulttestrunner1-1"
			}, {
				configurations: [{
					"_metadata": {
						"displayName": "configuration for DefaultProjType1-2",
						"id": 6,
						"runnerId": "defaulttestrunner1-2"
					}
				}],
				runner: "defaulttestrunner1-2"
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));

			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(aExpectedRunnersConfigurations.length);
				aExpectedRunnersConfigurations.forEach(function(oExpectedConfig) {
					// find the runner in the the result
					var oResultConfig = aResultRunnersConfigurations.filter(function(oResultConfig1) {
						if (oExpectedConfig.runner === oResultConfig1.runner.sId) {
							return oResultConfig1;
						}
					})[0];
					//compare the configuration
					expect(oResultConfig.configurations).to.deep.equal(oExpectedConfig.configurations);
				});
			});
		});

		it("2 Project type with same runner 1 configurations", function() {
			var aProjectTypes = ["ProjType2", "DefaultProjType2"];
			var aExpectedRunnersConfigurations = [{
				configurations: [{
					"_metadata": {
						"displayName": "configuration for DefaultProjType2 and ProjType2",
						"id": 7,
						"runnerId": "testrunner2"
					}
				}],
				runner: "testrunner2"
			}];

			sandbox.stub(oRunServiceImpl, "_getSelectedProjectTypes").returns(Q(aProjectTypes));
			sandbox.stub(oConfigurationHelperService, "getAllPersistedConfigurations").returns(Q(aConfigurations));

			return oRunService.getRunnersWithConfigurations().then(function(aResultRunnersConfigurations) {
				expect(aResultRunnersConfigurations.length).to.equal(aExpectedRunnersConfigurations.length);
				aExpectedRunnersConfigurations.forEach(function(oExpectedConfig) {
					// find the runner in the the result
					var oResultConfig = aResultRunnersConfigurations.filter(function(oResultConfig1) {
						if (oExpectedConfig.runner === oResultConfig1.runner.sId) {
							return oResultConfig1;
						}
					})[0];
					//compare the configuration
					expect(oResultConfig.configurations).to.deep.equal(oExpectedConfig.configurations);
				});
			});
		});
		
 /*   it("createConfiguration with document as second parameter",function(){
        sandbox.stub(oRunServiceImpl,"getSelectedDocument").returns(Q());
        sandbox.stub(oConfigurationHelperServiceImpl,"_getOtherConfigurationNames").returns(Q([]));
        var sRunnerId = "builtintestrunner1";
        var oRunner = oRunServiceImpl._runners[sRunnerId];
        var oDocumentForConfiguration = { fullPath : "/testFolder/testFile.js"};
        oRunner.oService = oService;
        var otherVisibleConfigurationNames = [];
        //oRunner, oDocument, sWindowId, isRunConfigurationFlow, otherConfigurationNames
        return oConfigurationHelperService.createConfiguration(oRunner, oDocumentForConfiguration, undefined, false, otherVisibleConfigurationNames).then(function(oConfiguration){
            var filePath = oConfiguration.filePath;
            var metadata = oConfiguration._metadata;
            expect(oDocumentForConfiguration.fullPath).to.equal(filePath);
            // equal(metadata.displayName, "New testRunner for built-in type", "The default display name given to a new configuration is New+RunnerName+for+typeName");
            expect(metadata.runnerId).to.equal("builtintestrunner1");
            expect(metadata.id).to.not.equal(null);
        });
    });*/
    
    it("_createUniqConfigurationName", function(){
        return oConfigurationHelperServiceImpl._createUniqConfigurationName("New Fiori", ["New Fiori"]).then(function(uniqName){
            expect(uniqName).to.equal("New Fiori 1");
        });
    });

    it("_createUniqConfigurationName", function(){
        return oConfigurationHelperServiceImpl._createUniqConfigurationName("New Fiori", ["New Fiori", "New Fiori 2", "New Fiori 1"]).then(function(uniqName){
            expect(uniqName).to.equal("New Fiori 3");
        });
    });

	});
});