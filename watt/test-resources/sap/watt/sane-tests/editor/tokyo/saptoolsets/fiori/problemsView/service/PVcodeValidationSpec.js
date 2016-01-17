define(["editor/tokyo/saptoolsets/fiori/problemsView/utils/issuesTestData",
	"sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (TestData, _, sinon, STF) {

	var sandbox;
	var suiteName = "service_pv_validation";
	var oBaseValidatorService;
	var _oBaseValidatorImpl;
	var oProblemsViewService;
	var _oProblemsViewImpl;
	var oValidationTriggersService;
	var _oValidationTriggersImpl;
	var oValidationsDistributorService;
	var oProblemsService;

	describe("PV Code Validation Integration", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oProblemsViewService = serviceGetter("problemsView");
					oValidationTriggersService = serviceGetter("validationTriggers");
					oValidationsDistributorService = serviceGetter("problemsViewValidation");
					oProblemsService = serviceGetter("problems");
					return STF.getServicePrivateImpl(oValidationTriggersService).then(function (oImpl) {
						_oValidationTriggersImpl = oImpl;
						return STF.getServicePrivateImpl(oBaseValidatorService).then(function (oImpl) {
							_oBaseValidatorImpl = oImpl;
							return STF.getServicePrivateImpl(oProblemsViewService).then(function (oImpl) {
								_oProblemsViewImpl = oImpl;
							});
						});
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		it("processing event for set and delete 2 problems", function (done) {
			var aResultsToSend = TestData.getBaseValidatorWithissues().params.validationsResults;

			sandbox.stub(_oValidationTriggersImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oValidationTriggersImpl.getValidationStoreManager(), "getSelectedProject").returns("uuu");

			sandbox.stub(_oProblemsViewImpl._oView.getController(), "setProblems", function (domain, problems) {
				assert.equal(domain, "codeValidation");
				assert.equal(problems.length, 2);
				assert.equal(problems[0].id, "/uuu/file.js");
				assert.equal(problems[1].id, "/uuu/file.js");

				var oResult = {
					"root": {},
					"issues": []
				};
				aResultsToSend = [{
					"document": "/uuu/file.js",
					result: oResult
				}];
				return _oBaseValidatorImpl._fireIssuesOnSingleFileUpdate(aResultsToSend);
			});

			sandbox.stub(_oProblemsViewImpl._oView.getController(), "clearProblems", function (domain, aIDs) {
				assert.equal(domain, "codeValidation");
				expect(aIDs).to.be.null;
				done();
			});
			return _oBaseValidatorImpl._fireIssuesOnSingleFileUpdate(aResultsToSend);
		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
})
;
