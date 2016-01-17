define(["editor/tokyo/saptoolsets/fiori/problemsView/utils/issuesTestData",
	"sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (TestData, _, sinon, STF) {

	var sandbox;
	var suiteName = "service_base_validator_adopter";
	var oBaseValidatorService;
	var oProblemsViewService;
	var oValidationTriggersService;
	var oValidationsDistributorService;
	var _oValidationsDistributorImpl;
	var oProblemsService;
	var oEditorService;
	var oDocumentService;

	describe("Code Validator Adopter Cases", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oProblemsViewService = serviceGetter("problemsView");
					oValidationTriggersService = serviceGetter("validationTriggers");
					oValidationsDistributorService = serviceGetter("problemsViewValidation");
					oProblemsService = serviceGetter("problems");
					oEditorService = serviceGetter("editor");
					oDocumentService = serviceGetter("document");
					return STF.getServicePrivateImpl(oValidationsDistributorService).then(function (oImpl) {
						_oValidationsDistributorImpl = oImpl;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		it("processing event with problems with keys", function (done) {
			var oValidationResult = TestData.getBaseValidatorWithissues();
			var oEvent = {
				params: {
					displayed: "uuu",
					senders: ["uuu"],
					validationsResults: oValidationResult.params.validationsResults
				}
			};
			sandbox.stub(oProblemsService, "setProblems", function (domain, arr) {
				assert.equal(domain, "codeValidation", "domain should be codeValidation");
				assert.equal(arr.length, 3, "should be 3 problems");
				assert.equal(arr[0].line, 1);
				assert.equal(arr[0].file, "file.js(1, 6)");
				assert.equal(arr[0].location, "/uuu");
				done();
			});
			return oValidationsDistributorService.onProblemsUpdate(oEvent);
		});

		it("processing event without problems but with keys", function (done) {
			var oValidationResult = TestData.getBaseValidatorWithoutIssues();
			var oEvent = {
				params: {
					displayed: "uuu",
					senders: ["uuu"],
					validationsResults: oValidationResult.params.validationsResults
				}
			};
			sandbox.stub(oProblemsService, "clearProblems", function (domain, arr) {
				assert.equal(domain, "codeValidation", "domain should be codeValidation");
				expect(arr).to.be.undefined;
				done();
			});
			return oValidationsDistributorService.onProblemsUpdate(oEvent);
		});

		it("all validation results don't have keys - not processing set problems", function () {
			var oValidationResult = TestData.getBaseValidatorResultsWithoutkeys();
			var oEvent = {
				params: {
					displayed: "uuu",
					senders: ["uuu"],
					validationsResults: oValidationResult.params.validationsResults
				}
			};
			var stubClearProblems = sandbox.spy(oProblemsService, "clearProblems");
			var stubSetProblems = sandbox.spy(oProblemsService, "setProblems");
			return oValidationsDistributorService.onProblemsUpdate(oEvent).then(function () {
				expect(stubSetProblems.called).to.be.false;
				expect(stubClearProblems.calledOnce).to.be.true;
			});
		});

		it("some validation results have keys", function (done) {
			var oValidationResult = TestData.getBaseValidatorResultsMixed();
			var oEvent = {
				params: {
					displayed: "uuu",
					senders: ["uuu"],
					validationsResults: oValidationResult.params.validationsResults
				}
			};
			sandbox.stub(oProblemsService, "setProblems", function (domain, arr) {
				assert.equal(domain, "codeValidation", "domain should be codeValidation");
				assert.equal(arr.length, 1, "should be 3 problems");
				assert.equal(arr[0].id, "/dd/abc.js");
				done();
			});
			return oValidationsDistributorService.onProblemsUpdate(oEvent);
		});

		it("Test issue conversion - null", function (done) {
			var problems = _oValidationsDistributorImpl._convertIssuesToProblems.call(_oValidationsDistributorImpl);
			expect(problems).is.not.null;
			expect(problems.length).equals(0);
			done();
		});

		it("Test issue conversion - empty issues", function (done) {
			var problems = _oValidationsDistributorImpl._convertIssuesToProblems.call(_oValidationsDistributorImpl, []);
			expect(problems).is.not.null;
			expect(problems.length).equals(0);
			done();
		});

		it("Test issue conversion - with issues", function (done) {
			var domain = "uuu/file.js";
			var oIssues = [{
				"ruleId": "syntax-parse",
				"path": "uuu/file.js",
				"severity": "error",
				"category": "Syntax Error",
				"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
				"checker": "ESLint",
				"line": 1,
				"column": 6,
				"message": "Syntax Error:ESLint(syntax-parse): Unexpected token {",
				"source": undefined
			}];
			var problems = _oValidationsDistributorImpl._convertIssuesToProblems.call(_oValidationsDistributorImpl, oIssues, domain);
			expect(problems).is.not.null;
			expect(problems.length).equals(1);
			expect(problems[0].category).equals(oIssues[0].category);
			expect(problems[0].severity).equals(oIssues[0].severity);
			expect(problems[0].id).equals(domain);
			expect(problems[0].navigate.arguments.length).equals(5);
			expect(problems[0].navigate.hasOwnProperty("handler")).to.be.true;
			expect(problems[0].description).equals(oIssues[0].message);
			expect(problems[0].location).equals("uuu");
			expect(problems[0].file).equals("file.js(1, 6)");
			done();
		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
