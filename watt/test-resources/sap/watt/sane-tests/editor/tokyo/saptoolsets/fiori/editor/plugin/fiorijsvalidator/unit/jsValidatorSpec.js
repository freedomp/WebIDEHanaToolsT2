define(["sap/watt/core/q", "jquery", "sap/watt/saptoolsets/fiori/editor/plugin/fioriJsValidator/service/JSValidator"], function (coreQ, jQuery, JSValidator) {

	describe('Prepare validation configuration for eslint execution', function () {
		it("Have no Filters for severity level", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/jsValidatotTestFiles/eslintrc.txt"))).then(function (_Config) {
				config = JSON.parse(_Config);
				var results = JSValidator._getFilteredConfiguration(config);
				expect(results).to.exist;
				expect(Object.keys(results.rules).length).to.equal(3);

				var filtered = _.filter(results.rules, function(value, key) {
					return (value <= 2 || value[0] <= 2);
				});
				expect(filtered.length).to.equal(3);
			});
		});

		it("Filters only errors", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/jsValidatotTestFiles/eslintrc.txt"))).then(function (_Config) {
				config = JSON.parse(_Config);
				var results = JSValidator._getFilteredConfiguration(config, ["error"]);
				expect(results).to.exist;
				expect(Object.keys(results.rules).length).to.equal(3);

				var filtered = _.filter(results.rules, function(value, key) {
					return (value === 2 || value[0] === 2);
				});
				expect(filtered.length).to.equal(1);

			});
		});

		it("Filters (disable all rules)", function () {
			return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/editor/tokyo/saptoolsets/fiori/editor/plugin/fiorijsvalidator/unit/jsValidatotTestFiles/eslintrc.txt"))).then(function (_Config) {
				config = JSON.parse(_Config);
				var results = JSValidator._getFilteredConfiguration(config, []);
				expect(results).to.exist;
				expect(Object.keys(results.rules).length).to.equal(3);
				var filtered = _.filter(results.rules, function(value, key) {
					return (value === 0 || value[0] === 0);
				});
				expect(filtered.length).to.equal(3);
			});
		});
	});
});