define(["sap/watt/ideplatform/plugin/basevalidator/service/ValidatorUserSettings", "editor/tokyo/ideplatform/plugin/baseValidator/unit/mocks/fakePreferences"], function(oValidatorUserSettings, oPreferences) {

	"use strict";

	var sandbox;
	describe('Set code checks user settings', function () {
		beforeEach(function () {
			oValidatorUserSettings._sLintingSettingNode = "dummyUserSettingsNode";
			sandbox = sinon.sandbox.create();
			sandbox.stub(oValidatorUserSettings, "_getPreferencesService", function () {
				return oPreferences;
			});
		});

		afterEach(function () {
			sandbox.restore();
		});

		it("returns object with default settings if no trigger has been set yet", function () {

			var defaultSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onChange"
			};
			return oValidatorUserSettings.getCurrentLintingSettings().then(function(result) {
				expect(result).to.deep.equal(defaultSettings);
			});
		});

		it("write and reads entered values correctly", function () {
			var newSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onSave"
			};
			return oValidatorUserSettings.setCurrentLintingSettings(newSettings).then(function() {
				return oValidatorUserSettings.getCurrentLintingSettings().then(function(result){
					expect(result).to.deep.equal(newSettings);
				});
			});
		});

		it("write and reads entered values with backward competability to previous settings structure (onSaveESLint)", function () {
			var oldSettings = {"lintingTrigger": "onSaveESLint"};
			var newSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onSave"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

		it("write and reads entered values with backward competability to previous settings structure (onSaveESLintAndJSHint)", function () {
			var oldSettings = {"lintingTrigger": "onSaveESLintAndJSHint"};
			var newSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onSave"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

		it("write and reads entered values with backward competability to previous settings structure (onChangeESLint)", function () {
			var oldSettings = {"lintingTrigger": "onChangeESLint"};
			var newSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onChange"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

		it("write and reads entered values with backward competability to previous settings structure (onChangeESLintAndJSHint)", function () {
			var oldSettings = {"lintingTrigger": "onChangeESLintAndJSHint"};
			var newSettings = {
				"disabledCodeCheck": false,
				"filterLevel": {
					"key": "e_w_i",
					"value": [
						"error",
						"warning",
						"info"
					]
				},
				"trigger": "onChange"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

		it("write and reads entered values with backward competability to previous settings structure (noLinting)", function () {
			var oldSettings = {"lintingTrigger": "noLinting"};
			var newSettings = {
				"disabledCodeCheck": true,
				"filterLevel": {
					"key": "none",
					"value": []
				},
				"trigger": "onChange"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

		it("sets filter to [] when disabledCodeCheck selected", function () {
			var oldSettings = {
				"disabledCodeCheck": true,
				"trigger": "onChange"
			};
			var newSettings = {
				"disabledCodeCheck": true,
				"filterLevel": {
					"key": "none",
					"value": []
				},
				"trigger": "onChange"
			};

			return oValidatorUserSettings.setCurrentLintingSettings(oldSettings)
				.then(function () {
					return oValidatorUserSettings.getCurrentLintingSettings().then(function (result) {
						expect(result).to.deep.equal(newSettings);
					});
				});
		});

	});

});