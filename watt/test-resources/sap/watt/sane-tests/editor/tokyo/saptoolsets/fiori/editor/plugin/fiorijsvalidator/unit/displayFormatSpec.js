define(["sap/watt/core/q", "jquery", "sap/watt/saptoolsets/fiori/editor/plugin/fioriJsValidator/service/JSDisplayValidatorConfiguration", "sinon"], function (coreQ, jQuery, JSDisplayValidatorConfiguration, sinon) {

	describe('Converts fiori configuration structure for display in ui', function () {
		it("converts from fiori structure to ui strucutre", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/displayFormatTestFiles/eslintrc.txt"))).then(function (defaultConfig) {
				defaultConfig = JSON.parse(defaultConfig);
				var results = JSDisplayValidatorConfiguration.convertConfigurationToDisplayFormat(defaultConfig);
				expect(results).to.exist;
				expect(results.rules).to.exist;
				expect(Object.keys(results.rules)).to.have.length(3);
				expect(results.rules["no-new"].enable).to.be.true;
				expect(results.rules["no-new"].ruleId).to.equal("no-new");
				expect(results.rules["no-new"].category).to.equal("BestPractice");
				expect(results.rules["no-new"].severity).to.equal("warning");
				expect(results.rules["no-new"].helpUrl).to.equal("http://eslint.org/docs/rules/no-new");

				expect(results.rules["sap-no-sessionstorage"].enable).to.be.true;
				expect(results.rules["sap-no-sessionstorage"].ruleId).to.equal("sap-no-sessionstorage");
				expect(results.rules["sap-no-sessionstorage"].category).to.equal("PossibleError");
				expect(results.rules["sap-no-sessionstorage"].severity).to.equal("error");
				expect(results.rules["sap-no-sessionstorage"].helpUrl).to.equal("https://wiki.wdf.sap.corp/wiki/display/fiorisuite/sap-no-sessionstorage");
				expect(results.rules["sap-no-sessionstorage"].additionalProperties).not.to.exist;

				expect(results.rules["sap-ui5-no-private-prop"].enable).to.be.false;
				expect(results.rules["sap-ui5-no-private-prop"].ruleId).to.equal("sap-ui5-no-private-prop");
				expect(results.rules["sap-ui5-no-private-prop"].category).to.equal("PossibleError");
				expect(results.rules["sap-ui5-no-private-prop"].severity).to.equal("info");
				expect(results.rules["sap-ui5-no-private-prop"].helpUrl).to.equal("https://github.wdf.sap.corp/fiori-code-quality/fiori.eslint.custom.checks/blob/master/eslint.custom.rules/fiori-eslint/fiori-docs/sap-ui5-no-private-prop.md");
				expect(results.rules["sap-ui5-no-private-prop"].additionalProperties).to.exist;
				expect(results.rules["sap-ui5-no-private-prop"].additionalProperties).to.have.length(1);

				expect(results.header).to.exist;
				expect(results.header.globals).to.deep.equal(defaultConfig.globals);
				expect(results.header.env).to.deep.equal(defaultConfig.env);
			});
		});

		it("converts back from ui strucutre to fiori structure", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/displayFormatTestFiles/eslintrc.txt"))).then(function (_defaultConfig) {
				var defaultConfig = JSON.parse(_defaultConfig);
				// **** workaround
				// as converting from ui back to concrete ommits not used properties (consider BaseValidator display logic refactoring)
				_.each(defaultConfig.additionalRuleMetadata, function(metadata)
				{
					metadata.severity = metadata.severity || "w";//default value
					delete metadata.priority;
				});
				// **** end workaround

				var uiresults = JSDisplayValidatorConfiguration.convertConfigurationToDisplayFormat(defaultConfig);
				var fioriresults = JSDisplayValidatorConfiguration.convertConfigurationToConcreteFormat(uiresults);

				expect(fioriresults.rules).to.deep.equal(defaultConfig.rules);
				expect(fioriresults.globals).to.deep.equal(defaultConfig.globals);
				expect(fioriresults.env).to.deep.equal(defaultConfig.env);
				expect(fioriresults.additionalRuleMetadata).to.deep.equal(defaultConfig.additionalRuleMetadata);
			});
		});

		it("calc diffs to store", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/displayFormatTestFiles/eslintrc.txt"))).then(function (_defaultConfig) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/displayFormatTestFiles/eslintrcAfterChange.txt"))).then(function (_newConfig) {
					var defaultConfig = JSON.parse(_defaultConfig);
					var newConfig = JSON.parse(_newConfig);
					var diffResults = JSDisplayValidatorConfiguration.getDiffConfigurationToStore(defaultConfig, {}, newConfig);

					expect(defaultConfig.globals["opaTest"]).to.equal.false;//default value
					expect(diffResults.globals).to.exist;
					expect(diffResults.globals["opaTest"]).to.exist;
					expect(diffResults.globals["opaTest"]).to.equal.true;//property change from default
					expect(diffResults.globals["com"]).to.equal.true;//new property for global
					expect(diffResults.globals["tl"]).not.to.exist;

					expect(diffResults.env["opaTest"]).to.equal.true;//default value
					expect(diffResults.env).to.exist;
					expect(diffResults.env["mocha"]).to.equal.false;//property change from default

					expect(diffResults.rules).to.exist;
					expect(defaultConfig.rules["no-new"]).to.equal(1);
					expect(diffResults.rules["no-new"]).to.equal(0);
					expect(diffResults.rules["sap-no-sessionstorage"]).not.to.exist;

					expect(diffResults.additionalRuleMetadata).to.exist;
					expect(defaultConfig.additionalRuleMetadata["no-new"].severity).to.equal("w");
					expect(diffResults.additionalRuleMetadata["no-new"].severity).to.equal("e");
					expect(defaultConfig.additionalRuleMetadata["no-new"].category).to.equal("BestPractice");
					expect(diffResults.additionalRuleMetadata["no-new"].category).to.equal("BestPractice");

					expect(defaultConfig.additionalRuleMetadata["sap-no-sessionstorage"].severity).to.equal("e");
					expect(diffResults.additionalRuleMetadata["sap-no-sessionstorage"].severity).to.equal("w");
					expect(defaultConfig.additionalRuleMetadata["sap-no-sessionstorage"].category).to.equal("PossibleError");
					expect(diffResults.additionalRuleMetadata["sap-no-sessionstorage"].category).to.equal("BestPractice");

					expect(diffResults.additionalRuleMetadata["sap-ui5-no-private-prop"]).not.to.exist;
				});
			});
		});


	});
});