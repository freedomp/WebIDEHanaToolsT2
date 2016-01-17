define(["sap/watt/core/q", "jquery", "sap/watt/saptoolsets/fiori/editor/plugin/fioriJsValidator/util/JSValidatorHelper", "sinon"], function (coreQ, jQuery, JSValidatorHelper, sinon) {

	describe('Execute eslint with predefined configuration', function () {
		it("execute eslint validation with subset of fiori rules (/sap-no-global-variable)", function () {
			//eslintrcSample
			return coreQ.sap.require("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/jsValidatorHelperTestFiles/eslintrcSample").then(function (_eslintrcSample) {
				expect(_eslintrcSample).to.exist;
				expect(_eslintrcSample.additionalRuleMetadata).to.exist;
				expect(_eslintrcSample.rules).to.exist;

				//expect(ruleFullPath).to.equal("sss");
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/jsValidatorHelperTestFiles/sap-no-global-variable.txt"))).then(function (_ruleContent) {
				//return coreQ(jQuery.get(ruleFullPath)).then(function (_ruleContent) {
					var content = _ruleContent.replace(/(\s*(module\.exports)\s*=)/, '\n return ');
					var source = "var a = 5;";
					var results = JSValidatorHelper.getIssues(source, _eslintrcSample, "", {"sap-no-global-variable": content});
					expect(results).to.exist;
					expect(results.issues).to.exist;
					expect(results.issues).to.have.length(1);
					var issue = results.issues[0];
					expect(issue.ruleId).to.equal("sap-no-global-variable");
					expect(issue.severity).to.equal("error");
				});
			});
		});
	});
});