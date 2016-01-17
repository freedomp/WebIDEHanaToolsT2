define([
	], function () {
	"use strict";

	return {
		_sLintingSettingNode: null,
		configure: function (mConfig) {
			this._sLintingSettingNode = mConfig.lintingSetting.node;
		},

		/*returns object with validator settings information
		 {
		 "disabledCodeCheck": false,
		 "trigger": onSave/onChange
		 }
		 */
		_loadSetting: function () {
			var that = this;
			var _SETTINGS = {
				"disabledCodeCheck": false,
				"trigger": "onChange",
				"filterLevel": {key: "e_w_i", value: ["error", "warning", "info"]}
			};

			var preferences = this._getPreferencesService();
			return preferences.get(that._sLintingSettingNode).then(function (lintingSettings) {
				if (lintingSettings) {
					_SETTINGS.disabledCodeCheck = that._setDisbaleCodeCheck(lintingSettings);
					_SETTINGS.trigger = that._setTriggeringCodeCheck(lintingSettings);
					if (!lintingSettings.filterLevel) {
						if (_SETTINGS.disabledCodeCheck) {
							_SETTINGS.filterLevel = {key: "none", value: []};
						}//else use the default
					} else {
						_SETTINGS.filterLevel = lintingSettings.filterLevel;
					}
				}
				return _SETTINGS;
			});
		},

		/* following code contains backward competability for previous implementation of linter settings.
		 previouse implemenation:
		 it used to store only a trigger information indicating both triggering and enablemnet of different linters.
		 ("onSaveESLint", "onSaveESLintAndJSHint", "onChangeESLint", "onChangeESLintAndJSHint", "noLinting")
		 new implementaion:
		 storing an object containing trigger, enablement of code check, and enablement of each linter
		 */
		_setDisbaleCodeCheck: function (lintingSettings) {
			if (lintingSettings && lintingSettings.disabledCodeCheck !== undefined) {
				return lintingSettings.disabledCodeCheck;
			} else if (lintingSettings.lintingTrigger === "noLinting") {//backward competability
				return true;
			} //else use default
			return false;
		},

		_setTriggeringCodeCheck: function (lintingSettings) {
			if (lintingSettings && lintingSettings.trigger !== undefined) {
				return lintingSettings.trigger;
			} else if (lintingSettings.lintingTrigger === "onSaveESLint" || lintingSettings.lintingTrigger === "onSaveESLintAndJSHint") {//backward competability
				return "onSave";
			} else if (lintingSettings.lintingTrigger === "onChangeESLint" || lintingSettings.lintingTrigger === "onChangeESLintAndJSHint") {
				return "onChange";
			} //else use default
			return "onChange";
		},

		_storeSetting: function (lintingSettings) {
			var that = this;

			var preferences = this._getPreferencesService();
			return preferences.remove(that._sLintingSettingNode).then(function () {
				return preferences.set(lintingSettings, that._sLintingSettingNode);
			});
		},

		_getPreferencesService: function() {
			return this.context.service.preferences;
		},
		// will be called from settings dialog
		getCurrentLintingSettings: function () {
			return this._loadSetting().then(function (loadedLintingSettings) {
				return loadedLintingSettings;
			});
		},

		// will be called from settings dialog
		setCurrentLintingSettings: function (sLintingSettings) {
			if (sLintingSettings.filterLevel) {
				sLintingSettings.disabledCodeCheck = (sLintingSettings.filterLevel.value.length === 0);
			}
			return this._storeSetting(sLintingSettings);
		}
	};

});
