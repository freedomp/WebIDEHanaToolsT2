define(["../dao/File", "sap/watt/lib/lodash/lodash"], function(oFileDao, _) {
	"use strict";
	return {
		isFeatureSupported: function(sService, sFeatureId) {
			return this.getUnSupportedFeatures().then(function(oUnSupportedFeatures) {
				if (oUnSupportedFeatures[sService][sFeatureId] &&
					( _.includes(oUnSupportedFeatures[sService][sFeatureId].versions, "all"))) 
				    {
						return false;
					} else {
						return true;
					}
			});
		},

		getUnSupportedFeatures: function() {
			var sUrl = jQuery.sap.getModulePath("sap.watt.ideplatform.che.plugin.chebackend.featuretoggle.UnSupportedFeatures", ".json");
			return Q(jQuery.ajax({
				url: sUrl,
				dataType: "json"
			}));
		}
	};
});