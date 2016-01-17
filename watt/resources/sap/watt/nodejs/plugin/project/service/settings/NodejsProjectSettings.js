define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.xs.nodejs.project.service.settings.NodejsProjectSettings", {
		_oProjectView: null,
		_oUserPreferenceView: null,

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Config
		// ====================================================================================
		getProjectSettingContent: function(id, group) {
			// return a view for the project setting UI
		},

		saveProjectSetting: function(id, group) {
			// save your project setting
		},

		getUserPreferenceContent: function(id, group) {
			// return a view for the user preference UI
		},

		saveUserPreference: function(id, group) {
			// save your user preference
		}
	});
});