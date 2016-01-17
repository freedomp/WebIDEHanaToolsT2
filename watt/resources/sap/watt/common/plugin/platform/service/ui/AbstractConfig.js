define([], function() {
	"use strict";
	var AbstractConfig = sap.ui.base.Object.extend("sap.watt.common.plugin.platform.service.ui.AbstractConfig", {

		getProjectSettingContent : function(id, group) {
			return Q();
		},
		
		saveProjectSetting : function(id, group) {
			return Q();
		},
		
		getUserPreferenceContent : function(id, group) {
			return Q();
		},

		saveUserPreference : function(id, group) {
			return Q();
		}
	});

	return AbstractConfig;
});
