define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";
	var mPreload = {plugins : {}, interfaces : {}};

	var documentbaseUri = new URI(document.location.href);
	var requireBaseUri = new URI(require.toUrl("a")).absoluteTo(new URI(document.location.href));

	/**
	 * Core of the IDE Framework - starts the services
	 */
	var ConfigPreload = {

		loadPreload : function(sLocation) {
			if (sap.watt.getEnv("debugMode")) {
				return Q();
			}

			return Q(jQuery.ajax({
				url : sLocation,
				dataType : "json"
			})).then(function(oResult) {
				// for each config-preload.json file this AJAX is called and mPreload is assigned with new interfaces and plugins
				_.forEach(mPreload, function(value, key) {
					_.assign(value, oResult[key]);
				});
			}, function(oXhr) {
				console.log("Could not load configuration preload from " + sLocation + ", Reason: " + oXhr.statusText);
				return null;
			});
		},

		loadJSPreload : function(sModule) {
			if (sap.watt.getEnv("debugMode")) {
				return Q();
			}

			var oDeferred = Q.defer();
			require([ sModule ], function() {
				oDeferred.resolve();
			}, function(oError) {
				console.log("Could not load JS preload for "+ sModule + ", Reason: " + oError);
				oDeferred.resolve();
			});
			return oDeferred.promise;
		},

		getPreload : function(sSection, sKey) {
			var sContent = mPreload && mPreload[sSection] && mPreload[sSection][sKey];
			if (sContent) {
				return Q(sContent);
			} else {
				return Q.reject(new Error());
			}
		},

		toInternalPath : function(sPath) {
			//Make the path absolute
			var pathUri = new URI(sPath).absoluteTo(documentbaseUri);

			//Compare it to require base URI
			var path = pathUri.relativeTo(requireBaseUri).path();

			//Remove closing /
			path = path.replace(/\/$/g, "");
			return path;
		},

		pathToName : function(sPath) {
			//Get path and convert to package notation
			var path = this.toInternalPath(sPath);
			return path.replace(/\//g, ".");
		}
	};

	return ConfigPreload;

});
