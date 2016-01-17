define(["sap/watt/lib/jszip/jszip-shim"], function() {
	"use strict";

	return {
	
		/*===============================================================================================================
        // Service functions
        ================================================================================================================*/

		_oLibInfo: {},
		_mMetadataByTypeAndVersion: {},
		
		configure: function(mConfig) {
			this._oLibInfo = mConfig.libInfo;
		},
		
		getVersions: function(sLibraryName) {
			if (sLibraryName !== this._oLibInfo.name) {
				return [];
			}
			return this._oLibInfo.versions;
		},
		
		getMetadata: function(sLibraryName, sLibraryType, sVersion) {
			if (sLibraryName !== this._oLibInfo.name || this._oLibInfo.versions.indexOf(sVersion) === -1) {
				return null;
			}
			return this._getMetadata(sLibraryType, sVersion);
		},
		
		/*===============================================================================================================
        // Private functions
        ================================================================================================================*/
	
		_getMetadata: function(sLibraryType, sVersion) {
			if (!this._mMetadataByTypeAndVersion[sLibraryType + ":" + sVersion]) {
				var sMetadataLocation = require.toUrl(this._oLibInfo.metadataLocation.replace("{type}/{version}", sLibraryType + "/" + sVersion));
				var sTemplatesLocation = require.toUrl(this._oLibInfo.templatesLocation.replace("{type}/{version}", sLibraryType + "/" + sVersion));
				var mOptions = {responseType: "arraybuffer"};
				var that = this;
				return Q.spread([Q.sap.ajax(sMetadataLocation, mOptions), Q.sap.ajax(sTemplatesLocation, mOptions)], function(aMetadataResponse, aTemplatesResponse) {
					that._mMetadataByTypeAndVersion[sLibraryType + ":" + sVersion] = {metadata: new JSZip(aMetadataResponse[0]), templates: new JSZip(aTemplatesResponse[0])};
					return that._mMetadataByTypeAndVersion[sLibraryType + ":" + sVersion];
				}, function(oError) {
					// TODO add log
					return null;
				});
			}
			return this._mMetadataByTypeAndVersion[sLibraryType + ":" + sVersion];
		}
	};

});