define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.platform.plugin.pluginmanager.service.AvailablePlugins", {

		getUserPreferenceContent: function() {
			var that = this;
			if(!this._oUI){
			    return this.context.service.pluginmanagement.getAvailablePluginsUI().then(function(oUI){
			    	that._oUI = oUI;
			        return oUI;
		        });
			} else {
				return this._oUI;
			}
		}
	});
});