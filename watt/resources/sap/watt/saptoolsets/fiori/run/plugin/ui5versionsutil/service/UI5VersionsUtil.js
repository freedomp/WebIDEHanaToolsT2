define(["sap/watt/lib/lodash/lodash"], function(_) {

	"use strict";

	return {
		// UI5 Versions list that loaded from service by demand and kept for a session
		_aUi5Versions: null,
		
		/* Return the ui5 version list. List constructed from internal (/sapui5versionsinternal/neo-app.json) and external (/sapui5versions/neo-app.json) resources*/
		getUi5VersionsList: function(oDocument) {
			var that = this;
			if (that._aUi5Versions === null) { 
				var aUi5Versions = that._getUI5Versions();
				if (aUi5Versions && aUi5Versions.length > 0) {
					that._aUi5Versions = aUi5Versions;
				}
			}
			return that._getUI5VersionFromAppDescriptor(oDocument).then(function(sUI5MinimalVersion) {
				if (sUI5MinimalVersion) {
					return that._sortOutVersionsBelowAppDescriptorVersion(sUI5MinimalVersion, that._aUi5Versions);
				} else {
					return that._aUi5Versions;
				}
			});
		},
		
		/* Get the current UI5 version from the project neo-app.json file */
		getUI5CurrentVersion: function(oDocument) {

			return this.context.service.appmetadata.getNeoMetadata(oDocument).then(function(oNeoApp) {
				if (oNeoApp !== null) {
					if (oNeoApp.routes !== null && oNeoApp.routes !== undefined) {
						for (var i = 0; i < oNeoApp.routes.length; i++) {
							if ((oNeoApp.routes[i].target.version) && (oNeoApp.routes[i].target.type === "service")
							&& (oNeoApp.routes[i].target.name === "sapui5")) {
								return oNeoApp.routes[i].target.version;
							}
						}
					}
				}
				else {
					return undefined;
				}
			}).fail(function() {
				return undefined;
			});
		},		

		/* return the ui5 version from the ui5 service in HCP */
		_getUI5Versions: function() {
			var that = this;
			//get the ui5 data from the neo-app.json
			var oUi5Version = this._getUI5Data("/sapui5versions/neo-app.json");
			if (sap.watt.getEnv("internal")) {
				var oUi5VersionInternal = that._getUI5Data("/sapui5versionsinternal/neo-app.json");
				return that._getUI5AllVersions(oUi5Version, oUi5VersionInternal);
			} else {
				return that._getUI5AllVersions(oUi5Version);
			}
		},

		/* Construct all UI5 versions, internal and external, into one list */
		_getUI5AllVersions: function(oUi5Version, oUi5VersionInternal) {

			var aUi5Version = [];
			//add all external versions
			if (oUi5Version !== null && oUi5Version !== undefined) {
				this._addUi5versions(oUi5Version, aUi5Version, "external");
			}
			//add all internal versions
			if (oUi5VersionInternal !== null && oUi5VersionInternal !== undefined) {
				this._addUi5versions(oUi5VersionInternal, aUi5Version, "internal");
			}

			// sort the ui5 versions list
			aUi5Version.sort(this._sortVersions);

			//add snapshot version only for internal
			if (sap.watt.getEnv("internal")) {
				aUi5Version.splice(0, 0, {
					display: "snapshot",
					value: "snapshot",
					source: "external"
				});
			}
			return aUi5Version;

		},

		_addUi5versions: function(oUi5Version, aUi5Version, sSource) {

			var iIndex;
			if (oUi5Version.routes !== null && oUi5Version.routes !== undefined) {
				for (var i = 0; i < oUi5Version.routes.length; i++) {
					//check for duplicated values
					iIndex = this._findDupRecords(aUi5Version, oUi5Version, i);
					if (iIndex === -1) {
						//add the values to the array
						aUi5Version.push({
							display: oUi5Version.routes[i].target.version,
							value: oUi5Version.routes[i].target.version,
							source: sSource
						});
					}
				}
			}
		},

		// find duplicated records 
		_findDupRecords: function(aUi5Version, oUi5Version, iIndex) {
			return _.findIndex(aUi5Version, function(chr) {
				return chr.display === oUi5Version.routes[iIndex].target.version;
			});
		},

		// execute an ajax call for the UI5 service in HCP
		_getUI5Data: function(sUrl) {
			var sResult;
			if (!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port :
					'');
			}
			jQuery.ajax({
				url: window.location.origin + sUrl,
				dataType: 'json',
				success: function(result) {
					sResult = result;
				},
				async: false
			});
			if (!sResult) {
				this.context.service.log.warn("Run Configuration", "Error while fetching data for SAPUI5 Verions from " + sUrl, ["user"]).done();
			}
			return sResult;
		},

		// sort the versions in descinding order
		_sortVersions: function(first, second) {
			var aFirst = first.value.split(".");
			var aSecond = second.value.split(".");
			var iValue;
			for (var i = 0; i < Math.max(aFirst.length, aSecond.length); i++) {
				if (aSecond[i] === undefined) {
					return -1;
				}
				if (aFirst[i] === undefined) {
					return 1;
				}
				aSecond[i] = parseInt(aSecond[i], 10);
				aFirst[i] = parseInt(aFirst[i], 10);
				iValue = aSecond[i] - aFirst[i];
				if (iValue !== 0) {
					return iValue;
				}
			}
		},

		_sortOutVersionsBelowAppDescriptorVersion: function(sUI5MinimalVersion, aUi5Version) {
			var aSlicedUi5Version = [];

			if ((sUI5MinimalVersion) && (aUi5Version)) {
				aSlicedUi5Version.push(aUi5Version[0]);
				for (var i = 1; i < aUi5Version.length; i++) {
					var iCurrent = 0;
					var iMin = 0;
					var bBiggerVer = false;
					var aCurrentVersion = aUi5Version[i].display.split(".");
					var aMinVersion = sUI5MinimalVersion.split(".");

					for (var j = 0; j < aMinVersion.length; j++) {
						iCurrent = parseInt(aCurrentVersion[j], 10);
						iMin = parseInt(aMinVersion[j], 10);
						if (j === aMinVersion.length - 1) {
							bBiggerVer = true;
						}
						if (iCurrent > iMin) {
							bBiggerVer = true;
							break;
						}
						if (iCurrent === iMin) {
							continue;
						}
						if (iCurrent < iMin) {
							bBiggerVer = false;
							break;
						}
					}
					if (bBiggerVer) {
						aSlicedUi5Version.push(aUi5Version[i]);
					}
				}
				return aSlicedUi5Version;
			} else {
				return aUi5Version;
			}
		},

		_getUI5VersionFromAppDescriptor: function(oDocument) {
			var that = this;
			return that.context.service.ui5projecthandler.getDependencies(oDocument).then(function(oManifestJson) {
				if (oManifestJson) {
					return oManifestJson.minUI5Version;
				} else {
					return undefined;
				}
			}).fail(function() {
				return undefined;
			});
		}
		
	};
});