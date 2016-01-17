define([], function() {
	"use strict";
	return {
		_mLibraries: {},

		configure: function(mConfig) {
			if (sap.watt.getEnv("server_type") !== "local_hcproxy") {
				this.sdkVersionProvider = mConfig.sdkVersionProvider;
			}
		},

		getCalculatedLibraryVersion: function(oDocument, aConfiguredLibraries) {
			var that = this;
			var hcpLibraries = [];
			this.sFileExtension = oDocument.getEntity().getFileExtension();

			if (jQuery.isEmptyObject(aConfiguredLibraries)) {
				return Q();
			}

			//Sort the configuration array by name(type) and version (use proxy to pass the context-"this")
			var localLibraries = aConfiguredLibraries.filter(jQuery.proxy(this._filterByFileExtenstion, this)).sort(
				jQuery.proxy(this._versionCompareSorting, this));

			if (this._useUI5Snapshot) {
				return [{
					name: "sapui5",
					version: "snapshot",
					remPath: "/sapui5nightly"
                }];
			} else if (this.sdkVersionProvider) {

				return this.context.service.intellisence.libversion.getLibVersion(oDocument, aConfiguredLibraries).then(function(oNeoAppLibVersions) {

					//allow snapshot only to internal
					if (oNeoAppLibVersions && oNeoAppLibVersions.aLibrary && oNeoAppLibVersions.aLibrary.length > 0 && sap.watt.getEnv("internal")) {
						for (var h = 0; h < oNeoAppLibVersions.aLibrary.length; h++) {
							if (oNeoAppLibVersions.aLibrary[h].library === "sapui5") {
								if (oNeoAppLibVersions.aLibrary[h].version === "snapshot") {
									return [{
										name: "sapui5",
										version: "snapshot",
										remPath: "/sapui5nightly"
                                    }];
								}
							}
						}
					}

					return that.sdkVersionProvider.service.getLibraryVersionsFromHCP(oNeoAppLibVersions).then(function(aAvailLibraries) {

						that.topLocalLibrary = localLibraries[localLibraries.length - 2];//we are supporting the new metadata concept- with convertion tool since 1.29.1 and (localLibraries.length - 2) = 1.29.1
						if(aAvailLibraries && aAvailLibraries.length > 0){
    						hcpLibraries = aAvailLibraries.filter(jQuery.proxy(that._filterByFileExtenstionVer, that)).sort(
    							jQuery.proxy(that._versionCompareSorting, that));
                        }
						var allLibraries = localLibraries.concat(hcpLibraries);
						allLibraries = allLibraries.sort(jQuery.proxy(that._versionCompareSorting, that));
						//Do the calculation of the returned version to run
						return that._calculateLibraryVersion(oNeoAppLibVersions, allLibraries, that.sFileExtension);

					});
				});

			} else {
				return this.context.service.intellisence.libversion.getLibVersion(oDocument, localLibraries).then(function(oNeoAppLibVersions) {
					//Do the calculation of the returned version to run
					return that._calculateLibraryVersion(oNeoAppLibVersions, localLibraries);
				});

			}
		},

		useUI5Snapshot: function(bUseUI5Snapshot) {
			this._useUI5Snapshot = bUseUI5Snapshot;
		},

		_filterByFileExtenstion: function(obj) {
			return obj.id === this.sFileExtension;
		},

		_filterByFileExtenstionVer: function(obj) {
			return obj.id === this.sFileExtension && this._versionCompare(obj, this.topLocalLibrary) === 1;
		},

		_calculateLibraryVersion: function(oNeoAppLibVersions, aConfiguredLibraries) {
			var aLibVersionResponse = [];
			var bVersionFound = false;
			var that = this;
			var oCurrentClosestVersion = {};
			var iCompareResult = 0;
			var i;
			var sCurrName;
			//Handle case of no neo-app file
			if ((!oNeoAppLibVersions || (oNeoAppLibVersions && oNeoAppLibVersions.aLibrary && oNeoAppLibVersions.aLibrary.length === 0)) &&
				aConfiguredLibraries && aConfiguredLibraries.length > 0) {
				for (i = 0; i < aConfiguredLibraries.length; i++) {
					if (!sCurrName && sCurrName !== aConfiguredLibraries[i].name) {
						sCurrName = aConfiguredLibraries[i].name;
						aLibVersionResponse.push(this._getLatestVersionForType(aConfiguredLibraries, aConfiguredLibraries[i].name));
					}
				}
				return aLibVersionResponse;
			}

			for (i = 0; oNeoAppLibVersions && oNeoAppLibVersions.aLibrary && i < oNeoAppLibVersions.aLibrary.length; i++) {
				for (var j = 0; j < aConfiguredLibraries.length; j++) {
					//sapui5 was configured and exist in neo-app
					if (oNeoAppLibVersions.aLibrary[i].library !== aConfiguredLibraries[j].name) { //Add libraries that are not defined on neo-app.json
						//TODO find a better way to add this add the latest version
						aLibVersionResponse.push(aConfiguredLibraries[j]);
					}

					if (oNeoAppLibVersions.aLibrary[i].library === aConfiguredLibraries[j].name && !bVersionFound) {
						//no neo app version exist
						if (!(oNeoAppLibVersions.aLibrary[i].version)) {
							var oLatestVersion = this._getLatestVersionForType(aConfiguredLibraries, aConfiguredLibraries[j].name);
							aLibVersionResponse.push(oLatestVersion);
							bVersionFound = true;
						} else {
							//Version exist in configuration and neo-app
							iCompareResult = that._versionCompare(oNeoAppLibVersions.aLibrary[i], aConfiguredLibraries[j]);
							//No version was defined in NeoApp : take greatest version
							if (isNaN(iCompareResult)) {
								that.context.service.log.info("code completion", this.context.i18n.getText("i18n", "msg_no_ui5_wrong_version_int"), ["user"]).done();
							}
							//neo-app version is smaller or equal then take the first available version in the configuration - oldest configued version
							if (iCompareResult === 0) {
								aLibVersionResponse.push(aConfiguredLibraries[j]);
								bVersionFound = true;
								//break;
							}
							if (iCompareResult < 0) {
								aLibVersionResponse.push(jQuery.isEmptyObject(oCurrentClosestVersion) ? aConfiguredLibraries[j] : oCurrentClosestVersion);
								bVersionFound = true;
								//break;
							}

							//Neo app version is bigger save it to current find so we can find if there is another closer version
							oCurrentClosestVersion = aConfiguredLibraries[j];
						}
					}
				}

				if (!bVersionFound) {
					if (jQuery.isEmptyObject(oCurrentClosestVersion)) {
						var oLatestVersionWhenNoMatch = this._getLatestVersionForType(aConfiguredLibraries, oNeoAppLibVersions.aLibrary[i].library);
						if (!jQuery.isEmptyObject(oLatestVersion)) {
							aLibVersionResponse.push(oLatestVersionWhenNoMatch);
						}
						oCurrentClosestVersion = {};
					} else {
						aLibVersionResponse.push(oCurrentClosestVersion);
					}
				}
				bVersionFound = false;
				// else Return empty version to run the latest available version
			}
			return aLibVersionResponse;
		},

		_getLatestVersionForType: function(aCongfiguration, sType) {
			var oLatestVersion = {};
			for (var i = 0; i < aCongfiguration.length; i++) {
				if (aCongfiguration[i].name === sType) {
					oLatestVersion = aCongfiguration[i];
				}

			}
			return oLatestVersion;
		},

		_versionCompare: function(sV1, sV2) {
			var sV1Ver = sV1.version || "";
			var sV2Ver = sV2.version || "";
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

		/*
            Sort the configuration in 2 dimentions: name and version
        */
		_versionCompareSorting: function(sV1, sV2) {
			//compare first level : library names
			if (sV1.name === sV2.name) {
				//compare second level : versions
				return this._versionCompare(sV1, sV2);
			}
			return (sV1.name < sV2.name) ? -1 : 1;
		}
	};
});