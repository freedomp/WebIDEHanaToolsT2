define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	return {
		
		_mProviders: {},
		
		configure: function(mConfig) {
			var that = this;
			mConfig.providers.forEach(function(oProvider) {
				oProvider.libraries.forEach(function(sLibraryName) {
					if (!that._mProviders[sLibraryName]) {
						that._mProviders[sLibraryName] = [];
					}	
					that._mProviders[sLibraryName].push({service: oProvider.service, isSnapshotSupported: oProvider.isSnapshotSupported});
				});
			});
		},
		
		getVersions: function(sLibraryName) {
			if (!this._mProviders[sLibraryName]) {
				return [];
			}
			var aPromises = [];
			this._mProviders[sLibraryName].forEach(function(oProvider) {
				aPromises.push(oProvider.service.getVersions(sLibraryName));
			});
			return Q.all(aPromises).then(function(aProvidersVersions) {
				//	Merge versions from all providers
				var aMergedVersions = [];
				aProvidersVersions.forEach(function(aProviderVersions) {
					aMergedVersions = aMergedVersions.concat(aProviderVersions);
				});
				return aMergedVersions; //TODO sort versions
			});
		},
		
		getLatestVersion: function(sLibraryName) {
			return this.getVersions(sLibraryName).then(function(aVersions) {
				var sLatestVersion = aVersions[0];
				for (var i = 1; i < aVersions.length; i++) {
					if (this._versionCompare(aVersions[i], sLatestVersion) === 1) {
						sLatestVersion = aVersions[i];
					}
				}
				return sLatestVersion;
			}.bind(this));
		},
		
		getMetadata: function(sLibraryName, sLibraryType, sVersion) {
			if (!this._mProviders[sLibraryName]) {
				return null;
			}
			// If no version is sent - return the metadata of latest version
			if (!sVersion) {
				return this.getLatestVersion(sLibraryName).then(function(sLatestVersion) {
					return this._getMetadata(sLibraryName, sLibraryType, sLatestVersion);		
				}.bind(this));
			}
			return this._getMetadata(sLibraryName, sLibraryType, sVersion);			
		},
		
		hasVersion: function(sLibraryName, sVersion) {
			return this.getVersions(sLibraryName).then(function(aVersions) {
				return aVersions.indexOf(sVersion) > -1;
			});
		},
		
		_getMetadata: function(sLibraryName, sLibraryType, sVersion) {
			return this._findProvider(sLibraryName, sLibraryType, sVersion).then(function(oProvider) {
				if (!oProvider) {
					return null;
				}
				return oProvider.service.getMetadata(sLibraryName, sLibraryType, sVersion).then(function(oMetadata) {
					oMetadata.library = sLibraryName;
					oMetadata.version = sVersion;
					oMetadata.type = sLibraryType;
					return oMetadata;	
				}).fail(function() {
					return null;
				});	
			});
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
		},
		
		_findProvider: function(sLibraryName, sLibraryType, sVersion) {
			var aPromises = [];
			var aProviders = this._mProviders[sLibraryName];
			
			for (var i = 0; i < aProviders.length; i++) {
				var oProvider = aProviders[i];
				
				// Check if version is snapshot
				if (sVersion === "snapshot") {
					if(oProvider.isSnapshotSupported) {
						return Q(oProvider);
					}
					continue;
				}
				// Find which provider holds the requested version
				aPromises.push(this._providerHasVersion(oProvider, sLibraryName, sVersion));
			}
			
			return Q.all(aPromises).then(function(_aProviders) {
				aProviders = _.compact(_aProviders);
				if (aProviders.length) {
					return aProviders[0];
				}
				return Q();
			});
		},
		
		_providerHasVersion: function(oProvider, sLibraryName, sVersion) {
			 return oProvider.service.getVersions(sLibraryName).then(function(aVersions) {
				if (aVersions.indexOf(sVersion) > -1) {
					return oProvider;
				}
			});	
		}
		
	
	
	};

});