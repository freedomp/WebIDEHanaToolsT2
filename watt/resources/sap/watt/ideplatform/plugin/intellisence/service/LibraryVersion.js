define([], function() {
	"use strict";

	return {
		_mLibVersion: {},

		getLibVersion: function(oDocument, aConfiguredLibraries) {
			var that = this;
			var oVersionPerType = {
				"project": "",
				"aLibrary": []
			};
			var mLibrary = {};

			//Map all available libraries
			if (!aConfiguredLibraries) {
				return Q();
			}

			//Map all library types e.g. "sapui5", "cordova". + id.
			for (var i = 0; i < aConfiguredLibraries.length; i++) {
				mLibrary[aConfiguredLibraries[i].name + aConfiguredLibraries[i].id ] = 1;
			}
			return oDocument.getProject().then(function(oProj) {
			    var sFileExtension = oDocument.getEntity().getFileExtension();
				var sProjName = oProj.getEntity() ? oProj.getEntity().getName() : "";
				oVersionPerType.project = sProjName;

				if (that._mLibVersion[sProjName + sFileExtension]) {
					return that._mLibVersion[sProjName + sFileExtension];
				}
				//Go over all configured types and versions and extract the respective routes from the neo-app.json
				return that.context.service.appmetadata.getNeoMetadata(oDocument).then(function(oProjectLibraries) {
					if (oProjectLibraries && oProjectLibraries.routes && oProjectLibraries.routes.length > 0) {
						var aRoutes = oProjectLibraries.routes;
						var oRoute = null;
						for (i = 0; i < aRoutes.length; i++) {
							oRoute = aRoutes[i];
							//filter resources for sapui5 only for webapp and for resources
							if (oRoute.target && mLibrary[oRoute.target.name + sFileExtension ] > 0 && 
								oRoute.target.entryPath === "/resources" && (oRoute.path === "/resources" || oRoute.path === "/webapp/resources")) {
								oVersionPerType.aLibrary.push({
								    id: sFileExtension,
									library: oRoute.target.name,
									version: oRoute.target.version,
									path: oRoute.path,
									entrypath: oRoute.target.entryPath
								});
							}
						}
						//filter everything other then webapp/resources if it exists
						if (oVersionPerType.aLibrary.length > 1) {
							oVersionPerType.aLibrary = oVersionPerType.aLibrary.filter(function(oElement){
								return oElement.path ===  "/webapp/resources";
							});
						}
						
						that._mLibVersion[sProjName + sFileExtension] = oVersionPerType;
						return oVersionPerType;
					}
				}).fail(function( ){
						that.context.service.log.info("code completion", that.context.i18n.getText("i18n", "msg_no_ui5_wrong_version_int"), ["user"]).done();
				});
			});
		}
	};
});