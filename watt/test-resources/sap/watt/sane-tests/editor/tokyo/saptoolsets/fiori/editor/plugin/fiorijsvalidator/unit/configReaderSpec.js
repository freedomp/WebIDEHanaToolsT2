define(["sap/watt/saptoolsets/fiori/editor/plugin/fioriJsValidator/util/configReader", "sinon", "sap/watt/lib/jszip/jszip-shim"], function (configReader, sinon) {
	var configzipPath = "../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/configReaderTestFiles/eslint.distribution-0.5.0-eslint.configuration.assembly.zip";
	var sandbox;

	describe('Read fiori configuration file', function () {
		beforeEach(function () {
			sandbox = sinon.sandbox.create();

			sandbox.stub(configReader, "getZipSourceUrl", function() {
				return require.toUrl(configzipPath);
			});
		});

		it("reads eslintrc configuration files", function () {
			return configReader._loadDefaultConfig().then(function () {
				return configReader.getFioriConfiguration().then(function (eslintrc) {
					expect(eslintrc).to.exist;
					expect(eslintrc.rules).to.exist;
					expect(eslintrc.rules["sap-browser-api-error"]).to.exist;
					expect(eslintrc.globals).to.exist;
					expect(eslintrc.env).to.exist;
					expect(eslintrc.additionalRuleMetadata).to.exist;
					expect(eslintrc.additionalRuleMetadata["sap-browser-api-error"]).to.exist;
				});
			});
		});

		it("reads fiori custom rules", function () {
			return configReader._loadDefaultConfig().then(function () {
				return configReader.getFioriRules().then(function (customRules) {
					expect(customRules).to.exist;
					expect(customRules["sap-browser-api-error"]).to.exist;
					expect(Object.keys(customRules)).to.have.length(24);
				});
			});
		});

		afterEach(function() {
			sandbox.restore();
		});

	});
});