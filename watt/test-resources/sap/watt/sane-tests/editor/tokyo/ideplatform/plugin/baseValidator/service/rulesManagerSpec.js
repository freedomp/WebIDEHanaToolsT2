define(['STF', "sinon"], function (STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "service_basevalidator_rulesManager";
	var rulesManager;
	var dummyValidatorProxy;
	var jsValidatorProxy;
	var xmlValidatorProxy;
	var projectMock;
	var baseValidator;
	var context;

	describe("test rules manager for validation", function () {
		before(function () {
			return STF.startWebIde(suiteName, {config: "editor/tokyo/ideplatform/plugin/baseValidator/service/rulesManagerTestFiles/config.json" }).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					baseValidator = serviceGetter("basevalidator");
					context = baseValidator.context;
					return STF.require(suiteName, ["sap/watt/ideplatform/plugin/basevalidator/util/RulesManager", "sane-tests/editor/tokyo/ideplatform/plugin/baseValidator/mocks/mockProject"])
						.spread(function (_rulesManager, _projectMock) {
							rulesManager = _rulesManager;
							projectMock = _projectMock;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();

			return Q.all([baseValidator.getCurrentValidatorServiceProxyById("dummyValidator"),
				baseValidator.getCurrentValidatorServiceProxyById("jsValidator"),
				baseValidator.getCurrentValidatorServiceProxyById("xmlValidator")])
				.spread(function (dummyProxy, jsProxy, xmlProxy) {
					dummyValidatorProxy = dummyProxy;
					jsValidatorProxy = jsProxy;
					xmlValidatorProxy = xmlProxy;

				});
		});

		afterEach(function () {
			sandbox.restore();
		});

		var projConfig = {
			//project configuration
			"validators": [{
				"validatorID": "dummyValidator",
				"configuration": {
					"concreteDefConfig": {
						"rules" : {
							"camelcase" : 0
						}
					}
				}
			}],
			"services": {"any": "dummyValidator"}
		};

		it("get configuration for display no custom rules path", function () {
			var oProj = new projectMock("basevalidator", projConfig);
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);
			var expectedDisplay = {
				"rules" : {
					"camelcase" : {"enable": false},
					"brace-style" : {"enable": false}
				}
			};
			var projName = "dummyProject1";
			return rulesManager.get(context, dummyValidatorProxy, projName)
				.then(function(rulesManagerInst) {
					return rulesManagerInst.getValidatorConfigurationForDisplay()
						.then(function(value) {
							var projValidatorConfig = projConfig.validators[0].configuration;
							expect(value.configuration).to.be.exist;
							expect(value.configuration).to.deep.equal(expectedDisplay);
							expect(value.customRulesPath).to.not.be.exist;
							expect(value.services).to.deep.equal(projConfig.services);
						});
				});
		});

		it("get rules for annotation no custom rules path", function () {
			var oProj = new projectMock("basevalidator", projConfig);
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);
			var projName = "dummyProject2";
			return rulesManager.get(context, dummyValidatorProxy, projName)
				.then(function(rulesManagerInst) {
				return rulesManagerInst.getRulesForAnnotations(0)
					.then(function (configFilter1) {
						return rulesManagerInst.getRulesForAnnotations(1)
							.then(function (configFilter2) {
								expect(configFilter1).to.be.exist;
								expect(Object.keys(configFilter1)).to.have.length(2);

								expect(configFilter2).to.be.exist;
								expect(Object.keys(configFilter2)).to.have.length(0);
							});
					});
			});
		});

		it("get updated rules custom rules path update", function () {
			var oProj = new projectMock("basevalidator", projConfig);
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);
			var modifiedDisplay = {
				"header" : {
					"env" : {"browser" : false}
				},
				"rules" : {
					"camelcase" : {"enable": false},
					"brace-style" : {"enable": false},
					"prevCustomRule" : {"enable": true}
				}
			};
			var projName = "dummyProject3";
			return rulesManager.get(context, dummyValidatorProxy, projName)
				.then(function(rulesManagerInst) {
				return rulesManagerInst.getUpdatedRules("dummyPath", modifiedDisplay.rules)
					.then(function(value) {
						expect(value["camelcase"]).to.exist;
						expect(value["camelcase"].enable).to.be.false;
						expect(value["brace-style"]).to.exist;
						expect(value["brace-style"].enable).to.be.false;
						expect(value["customRule"]).to.exist;
						expect(value["customRule"].enable).to.be.true;
					});
			});
		});

		it("save updated rules with custom rules path", function () {
			var oProj = new projectMock("basevalidator", projConfig);
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);
			var modifiedDisplay = {
				"customRulesPath": "dummyPath",
				"configuration" : {
					"header" : {
						"env" : {"browser" : false}
					},
					"rules" : {
						"camelcase" : {"enable": false},
						"brace-style" : {"enable": false},
						"customRule" : {"enable": false}
					}
				}
			};
			var projName = "dummyProject4";
			return rulesManager.get(context, dummyValidatorProxy, projName)
				.then(function(rulesManagerInst) {
				return rulesManagerInst.saveValidatorConfiguration(modifiedDisplay)
					.then(function(value) {

						var config = value.validators[0].configuration;
						expect(config).to.exist;
						expect(config.concreteDefConfig).to.exist;
						expect(config.concreteDefConfig.rules).to.exist;
						var rules = config.concreteDefConfig.rules;

						expect(rules["camelcase"]).to.exist;
						expect(rules["camelcase"]).to.equal(0);
						expect(rules["brace-style"]).to.exist;
						expect(rules["brace-style"]).to.equal(0);
						expect(rules["customRule"]).to.exist;
						expect(rules["customRule"]).to.equal(0);

					});
			});
		});

		it("get rules for annotation - with custom rules path", function () {
			var projConfigWithCustomPath = {
				//project configuration
				"validators": [{
					"validatorID": "dummyValidator",
					"configuration": {
						"concreteDefConfig": {
							"rules" : {
								"camelcase" : 0
							}
						}
					},
					customRulesPath: "dummyPath"
				}],
				"services": {"any": "dummyValidator"}
			};

			var oProj = new projectMock("basevalidator", projConfigWithCustomPath);
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);
			var projName = "dummyProject5";
			return rulesManager.get(context, dummyValidatorProxy, projName)
				.then(function(rulesManagerInst) {
				return Q.all([rulesManagerInst.getRulesForAnnotations(0),
					rulesManagerInst.getRulesForAnnotations(1)])
					.spread(function(configFilter1, configFilter2) {
						expect(configFilter1).to.be.exist;
						expect(Object.keys(configFilter1)).to.have.length(2);

						expect(configFilter2).to.be.exist;
						expect(Object.keys(configFilter2)).to.have.length(0);
					});
			});
		});

		it("save display validator settings - merge services", function () {
			var oProj = new projectMock("basevalidator", {});
			sandbox.stub(rulesManager, "_getProjectService").returns(oProj);

			var modifiedJsDisplay = {
				"customRulesPath": "dummyPath",
				"configuration" : {
					"header" : {
						"env" : {"browser" : false}
					},
					"rules" : {
					}
				},
				"services": {"js": "jsValidator"}
			};
			var modifiedxmlDisplay = {
				"services": {"xml": "xmlValidator"}
			};
			var projName = "dummyProject6";
			return Q.all([rulesManager.get(context, jsValidatorProxy, projName),
				rulesManager.get(context, xmlValidatorProxy, projName)])
				.spread(function(rulesManagerJsInst, rulesManagerXmlInst) {
					return rulesManagerJsInst.saveValidatorConfiguration(modifiedJsDisplay)
						.then(function(value1) {
							expect(value1.services).to.deep.equal({"js": "jsValidator"});
							return rulesManagerXmlInst.saveValidatorConfiguration(modifiedxmlDisplay)
								.then(function(value2) {
									expect(value2.services).to.deep.equal({"js": "jsValidator", "xml": "xmlValidator"});
									return rulesManagerJsInst.saveValidatorConfiguration(modifiedJsDisplay)
										.then(function(value3) {
											expect(value3.services).to.deep.equal({"js": "jsValidator", "xml": "xmlValidator"});
										});
								});
						});
				});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

	});
});