define([], function() {
	"use strict";
	return {

		getDependencies: function(oDocument) {
			var oDependencies = {};
			return this.context.service.appmetadata.getNeoMetadata(oDocument).then(function(oMetadata) {
				if (oMetadata && oMetadata.routes && oMetadata.routes.length > 0) {
					var aRoutes = oMetadata.routes;
					var oRoute = null;
					for (var i = 0; i < aRoutes.length; i++) {
						oRoute = aRoutes[i];
						//filter resources for sapui5 only
						if (oRoute.target && oRoute.target.entryPath === "/resources") {
							if (oRoute.path === "/webapp/resources") { 
								oDependencies = {
									library: oRoute.target.name,
									version: oRoute.target.version
								};
								break;
							}
							if (oRoute.path === "/resources") {
								oDependencies = {
									library: oRoute.target.name,
									version: oRoute.target.version
								};
							}
						}
					}
				}
				if (jQuery.isEmptyObject(oDependencies)) {
					oDependencies = [{
						library: "sapui5",
						version: null
					}];
				}
				return oDependencies;
			});
		}
	};
});