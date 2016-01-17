define(['STF', "sinon"], function (STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "service_basevalidator_rulesManagerCache";
	var rulesManager;
	var jsValidatorProxy;
	var xmlValidatorProxy;
	var projectMock;
	var baseValidator;
	var context;

	describe("test rules manager cache for validators and projects", function () {
		before(function () {
			return STF.startWebIde(suiteName).
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

			var rulesManagerClassMock = function(oValidatorProxy, projectIdentifier) {
				this.getInstanceId = function () {
					var validatorId = oValidatorProxy.getCurentValidatorServiceIdentifier().inspect().value;
					return validatorId + "_" + projectIdentifier;
				};
			};
			sandbox.stub(rulesManager, "_createInstance", function (oContext, oValidatorProxy, projectIdentifier) {
				return Q(new rulesManagerClassMock(oValidatorProxy, projectIdentifier));
			});

			return Q.all([
				baseValidator.getCurrentValidatorServiceProxyById("jsValidator"),
				baseValidator.getCurrentValidatorServiceProxyById("xmlValidator")])
				.spread(function (jsProxy, xmlProxy) {
					jsValidatorProxy = jsProxy;
					xmlValidatorProxy = xmlProxy;

				});
		});

		afterEach(function () {
			sandbox.restore();
		});


		it("get rule manager for same validator and same project", function() {
			return Q.all([rulesManager.get(context, jsValidatorProxy, "dummyProject1"),
				rulesManager.get(context, jsValidatorProxy, "dummyProject1")])
				.spread(function (inst1, inst2) {
					expect(inst1.getInstanceId()).to.equal(inst2.getInstanceId());
				});
		});

		it("get rule manager for same validator different project", function() {
			return Q.all([rulesManager.get(context, jsValidatorProxy, "dummyProject1"),
				rulesManager.get(context, jsValidatorProxy, "dummyProject2")])
				.spread(function (inst1, inst2) {
					expect(inst1.getInstanceId()).to.not.equal(inst2.getInstanceId());
				});
		});

		it("get rule manager for different validator same project", function() {
			return Q.all([rulesManager.get(context, jsValidatorProxy, "dummyProject1"),
				rulesManager.get(context, xmlValidatorProxy, "dummyProject1")])
				.spread(function (inst1, inst2) {
					expect(inst1.getInstanceId()).to.not.equal(inst2.getInstanceId());
				});
		});

		it("get rule manager for different validator different project", function() {
			return Q.all([rulesManager.get(context, jsValidatorProxy, "dummyProject1"),
				rulesManager.get(context, xmlValidatorProxy, "dummyProject2")])
				.spread(function (inst1, inst2) {
					expect(inst1.getInstanceId()).to.not.equal(inst2.getInstanceId());
				});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

	});
});