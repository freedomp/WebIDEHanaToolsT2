define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.platform.plugin.pluginmanager.service.OptionalPlugins", {

		getUserPreferenceContent: function() {
			var that = this;
			if(!this._oUI){
			    return this.context.service.pluginmanagement.getOptionalPluginsUI().then(function(oUI){
			    	that._oUI = oUI;
			        return oUI;
		        });
			} else {
				return this._oUI;
			}
		},

		saveUserPreference: function() {
		    return this.context.service.pluginmanagement.updatePreferences();
    	}
	});
});