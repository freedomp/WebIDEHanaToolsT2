/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./ModelingSettingUI"], function(settingUIProvider) {

	return {
		_goUserSettings: {},

		getSettings: function() {
			var deferred = Q.defer();
			var that = this;
			this.context.service.preferences.get("sap.hana.ide.editor.analytics").then(function(ioSettings) {
				that._goUserSettings = ioSettings || {};
				deferred.resolve(that._goUserSettings);
			});
			return deferred.promise;
		},

		getContent: function(context, setting, width) {
			return settingUIProvider.getContent(context, setting, width);
		},

		_setPreferenceValue: function(key, value) {
			var json = {};
			json[key] = value;
			this.context.service.preferences.set(json, "sap.hana.ide.editor.analytics");
		},

		setSettings: function() {
			var settings = settingUIProvider.getModifiedSettings();
			for (var i = 0; i < settings.length; i++) {
				var val = settings[i];
				this._setPreferenceValue(val.key, val.value);
			}
		}
	};
});
