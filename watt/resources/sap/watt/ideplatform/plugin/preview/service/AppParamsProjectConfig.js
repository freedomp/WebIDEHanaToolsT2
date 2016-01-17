define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.common.plugin.preview.service.AppParamsProjectConfig", {
	
		getProjectSettingContent: function(id, group) {
             // The implementation of this method is depricated and moved to uitools/commonrunners plugin
		},

		saveProjectSetting: function(id, group) {
             // The implementation of this method is depricated and moved to uitools/commonrunners plugin
		}
	});
});