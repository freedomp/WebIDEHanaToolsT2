define([], function() {
    "use strict";
    
    var _sPersistencyNode = "sap.watt.common.service.ui.WelcomeScreen";
    
    var _getPerspectiveSettings = function() {
    	// prevent wattonwatt settings pollution
        if(window.location.host.indexOf("webidetesting") < 0) {
			var that = this;
			return this.context.service.preferences.get(_sPersistencyNode).then(function(prefs) {
	            if(prefs && prefs[window.location.host] !== undefined) {
	                return prefs[window.location.host];
	            } else {
	                return undefined;
	            }
	        }).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionReadFailed", [oError]));
				return undefined;
			});
        } else {
        	return Q({
        		bIsOnline : false
        	});
        }
    };
    
    var _setPerspectiveSettings = function(oSettings) {
    	// prevent wattonwatt settings pollution
        if(window.location.host.indexOf("webidetesting") < 0) {
			var that = this;
			var prefs = null;
			return this.context.service.preferences.get(_sPersistencyNode).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "WelcomeScreen_persistenceReadFailed", [oError]));
			}).then(function(oldPrefs) {
				prefs = oldPrefs;
				if(!prefs) {
					prefs = {};
				}
				if(!prefs[window.location.host]) {
					prefs[window.location.host] = {};
				}
				prefs[window.location.host] = oSettings;
				return that.context.service.preferences.remove(_sPersistencyNode);
			}).then(function() {
				return that.context.service.preferences.set(prefs, _sPersistencyNode);
			}).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "WelcomeScreen_persistenceSaveFailed", [oError]));
			});
        }
    };
    
    return {
        getPerspectiveSettings : _getPerspectiveSettings,
        setPerspectiveSettings : _setPerspectiveSettings
    };
});