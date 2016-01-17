define(["../dao/File", "sap/watt/lib/lodash/lodash"], function(oFileDao, _) {
	"use strict";
	return {
		isFeatureSupported: function(sService, sFeatureId) {
			return this.getUnSupportedFeatures().then(function(oUnSupportedFeatures) {
				//1. Check local installation
				if (sap.watt.getEnv("server_type") === "local_hcproxy" &&
				    oUnSupportedFeatures[sService][sFeatureId] &&
				     oUnSupportedFeatures[sService][sFeatureId].localInstallation ){
				     	return false;
				     }
				//2. Check Orion versions
				return oFileDao.doGetOrionVersion().then(function(oVersion) {
					if (oUnSupportedFeatures[sService][sFeatureId] &&
						(_.includes(oUnSupportedFeatures[sService][sFeatureId].versions, oVersion.version) ||
                         _.includes(oUnSupportedFeatures[sService][sFeatureId].versions, "all"))) {
						return false;
					} else {
						return true;
					}
				});
			});
		},

		getUnSupportedFeatures: function() {
			var sUrl = jQuery.sap.getModulePath("sap.watt.ideplatform.orion.plugin.orionbackend.featuretoggle.UnSupportedFeatures", ".json");
			return Q(jQuery.ajax({
				url: sUrl,
				dataType: "json"
			}));
		}
	};
});