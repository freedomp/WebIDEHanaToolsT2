define([], function() {
    "use strict";
    
    var _sPersistencyNode = "sap.watt.common.plugin.welcomescreen.service.Version";
	var _sVersionPrefix = "v_";
    
    var _getCurrentVersion = function() {
		var sUrl = jQuery.sap.getModulePath("sap.watt.uitools.version", ".json");
		var that = this;
		return jQuery.ajax({
			url : sUrl,
			dataType : "json"
		}).then(function(mVersion) {
			var sVersion = "";

			if(mVersion && mVersion.version) {
				sVersion = mVersion.version.replace("-SNAPSHOT", "");
				var aParts = sVersion.split(".");
				// Drop the minor versions
				while (aParts.length > 2) {
					aParts.pop();
				}
				sVersion = aParts.join(".");
			}

			return sVersion;
		}).fail(function(oError) {
			console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionSaveFailed", [oError]));
			return undefined;
		});
    };
    
    var _getLastSeenVersion = function() {
    	// prevent wattonwatt settings pollution
        if(window.location.host.indexOf("webidetesting") < 0) {
			var that = this;
	        return this.context.service.preferences.get(_sPersistencyNode).then(function(prefs) {
	                if(prefs && prefs[window.location.host] !== undefined) {
	                    var sVersion = prefs[window.location.host].toString();
						return sVersion.replace(_sVersionPrefix, "");
	                } else {
	                    return undefined;
	                }
	        }).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionReadFailed", [oError]));
				return undefined;
			});
        } else {
        	return _getCurrentVersion();
        }
    };
    
    var _setLastSeenVersion = function(sVersion) {
    	// prevent wattonwatt settings pollution
        if(window.location.host.indexOf("webidetesting") < 0) {
	        var that = this;
	        return this.context.service.preferences.get(_sPersistencyNode).then(function(prefs) {
				// update existing record or create a new one
				if(!prefs) {
					prefs = {};
				}

				prefs[window.location.host] = _sVersionPrefix + sVersion;
				return that.context.service.preferences.remove(_sPersistencyNode).then(function() {
					return that.context.service.preferences.set(prefs, _sPersistencyNode).fail(function(oError) {
						console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionSaveFailed", [oError]));
					});
	            }).fail(function(oError) {
					console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionSaveFailed", [oError]));
				});
	        }).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "WelcomeScreen_versionReadFailed", [oError]));
			});
        } else {
        	return Q();
        }
    };

	var _compareVersions = function(sVersionA, sVersionB) {
		var regex = /[^\.\d]+/;
		// versions should consist of dots and digits only
		if(regex.test(sVersionA) || regex.test(sVersionB)) {
			throw Error("Illegal version detected!");
		}

		var aASplit = sVersionA.split(".");
		var aBSplit = sVersionB.split(".");
		var minLength = aASplit.length < aBSplit.length ? aASplit.length : aBSplit.length;

		for (var i = 0; i < minLength; i++) {
			var aNum = parseInt(aASplit[i]);
			var bNum = parseInt(aBSplit[i]);

			if (aNum > bNum) {
				return 1;
			} else if (aNum < bNum) {
				return -1;
			}
		}
		if (aASplit.length === aBSplit.length) {
			return 0;
		} else {
			return aASplit.length - aBSplit.length;
		}
	};
    
    return {
        getCurrentVersion : _getCurrentVersion,
        getLastSeenVersion : _getLastSeenVersion,
        setLastSeenVersion : _setLastSeenVersion,
		compareVersions : _compareVersions
    };
});
