define(["sap/watt/lib/lodash/lodash", "sap/watt/lib/jszip/jszip-shim"], function(_) {
	"use strict";

	return {
	
		/*===============================================================================================================
        // Service functions
        ================================================================================================================*/

		_mLibraries: {},
		
		configure: function(mConfig) {
			var bInternal = sap.watt.getEnv("internal");
			mConfig.libraries.forEach(function(oLibrary) {
				this._mLibraries[oLibrary.name] = {};
				if (bInternal) {
					this._mLibraries[oLibrary.name].pathPrefix = oLibrary.internalPathPrefix; 
					this._mLibraries[oLibrary.name].snapshotPathPrefix = oLibrary.snapshotPathPrefix; // Allow snapshot version only for internal
				} else {
					this._mLibraries[oLibrary.name].pathPrefix = oLibrary.nonInternalPathPrefix;  
				}
				this._mLibraries[oLibrary.name].versionsFileName = oLibrary.versionsFileName;
				this._mLibraries[oLibrary.name].minVersion = oLibrary.minVersion;
				this._mLibraries[oLibrary.name].packages = oLibrary.packages;
			}.bind(this));
		},
		
		getVersions: function(sLibraryName) {
			var oLibrary = this._mLibraries[sLibraryName]; 
			if (!oLibrary) {
				return [];
			}
			var sPath = oLibrary.pathPrefix + "/" + oLibrary.versionsFileName; 
			var that = this;
			return this._getDataFromHCP(sPath, "json").then(function(oLibInfo) {
				if (!oLibInfo) {
					return [];
				}
				// Remove current version becuase we already have it in different route 
				var aFilteredRoutes = _.remove(oLibInfo.routes, function(oRoute) {
					return oRoute.path !== "/";
				});
				var aVersions = _.pluck(aFilteredRoutes, "target.version");
				// return only version below minVersion		
				return _.filter(aVersions, function(sVersion) {
		    		return that._versionCompare(sVersion, oLibrary.minVersion) > -1;
				});
				//TODO path is always the same as version? 
			}).fail(function() {
				return [];
			});
		},
		
		getMetadata : function(sLibraryName, sLibraryType, sVersion) {
			var oLibrary = this._mLibraries[sLibraryName]; 
				if (!oLibrary) {
				return null;
			}
			
			var sPathPrefix;
			if (sVersion === "snapshot") {	
				if (!oLibrary.snapshotPathPrefix) {
					return null;
				}
				sPathPrefix = oLibrary.snapshotPathPrefix;
			} else {
				sPathPrefix = oLibrary.pathPrefix + "/" + sVersion;
			}
			
			var oResult = {};
			var aPromises = [];
			oLibrary.packages.forEach(function(sPackage) {
				// Build package path for metadata and templates
				// TODO version path should be taken from versions file
				var sPackagePathPrefix = sPathPrefix + "/test-resources/" + sPackage.replace(/\./g, "\/") + "/" + "designtime/codeassistance/";
				var sPackageMetadataPath = sPackagePathPrefix + "Library." + sLibraryType + "meta.json";
				var sPackageTemplatesPath = sPackagePathPrefix + "Library." + sLibraryType + "templates.json";
				// Get package files from HCP 
				var aPackagePromises = [];
				aPackagePromises.push(this._getDataFromHCP(sPackageMetadataPath, "text"));
				aPackagePromises.push(this._getDataFromHCP(sPackageTemplatesPath, "text"));
				var oPromise = Q.spread(aPackagePromises, function(oMetadataResult, oTemplatesResult) {
					if (oMetadataResult) {
						if (!oResult.metadata) {
							oResult.metadata = new JSZip();
						} 
						oResult.metadata.file(sPackage + ".json", oMetadataResult);
					}
					
					if (oTemplatesResult) {
						if (!oResult.templates) {
							oResult.templates = new JSZip();
						} 
						oResult.templates.file(sPackage + ".json", oTemplatesResult);
					}
				});
				aPromises.push(oPromise);
			}.bind(this));
			return Q.allSettled(aPromises).then(function() {
				return _.isEmpty(oResult) ? null : oResult;
			}).fail(function() {
				return null;
			});
		},
		
		/*===============================================================================================================
        // Private functions
        ================================================================================================================*/
	
		_getDataFromHCP: function(sPath, sRsponseType) {
			//IE10 Support 
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			}
			return this._getResponseFromHCP(window.location.origin + sPath, sRsponseType).fail(function() {
				console.log("Missed " + window.location.origin + sPath);
			});
		},
		
		_getResponseFromHCP: function(sUrl, responseType) {
			var oDeferred = Q.defer();
			//for Blobs, we have to use XMLHttpRequest
			var oXHR = new XMLHttpRequest();
			oXHR.open("GET", sUrl);
			oXHR.setRequestHeader("Accept", "*/*");
			oXHR.responseType = responseType;
			oXHR.onload = function(e) {
				if (this.readyState === 4 && this.status < 300) {
					oDeferred.resolve(this.response);
				} else {
					oDeferred.reject(e);
				}
			};
			oXHR.send();
			return oDeferred.promise;
		},

		_versionCompare: function(sV1, sV2) {
			var sV1Ver = sV1 || "";
			var sV2Ver = sV2 || "";
			var aV1parts = sV1Ver.split(".");
			var aV2parts = sV2Ver.split(".");
			var minLength = Math.min(aV1parts.length, aV2parts.length);
			var sParsedInt1, sParsedInt2;
			for (var i = 0; i < minLength; i++) {
				// Convert to integer if possible, because "8" < "10".
				sParsedInt1 = parseInt(aV1parts[i], 10);
				sParsedInt2 = parseInt(aV2parts[i], 10);
				if (sParsedInt1 === sParsedInt2) {
					continue;
				}
				if (sParsedInt1 > sParsedInt2) {
					return 1;
				}
				if (sParsedInt1 < sParsedInt2) {
					return -1;
				}
				// one operand is NaN
				return NaN;
			}
			if (aV1parts.length === aV2parts.length) {
				return 0;
			}
			return (aV1parts.length < aV2parts.length) ? -1 : 1;
		}
		
	};

});