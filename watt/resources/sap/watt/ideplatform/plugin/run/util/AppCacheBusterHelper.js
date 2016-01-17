//TODO consider the location of this service, since it does not access the orion BE
define([], function() {
	"use strict";

	return {
		SETTINGS_FILE_NAME : "sap-ui-cachebuster-info.json",

		_oCreatePromise: Q(),

		_getSettingsDocument: function(oProjectDocument, bCreate, oContext, oIgnoreService) {
			var that = this;
			//Guard reentrance (we can only create the file once)
			this._oCreatePromise = this._oCreatePromise.then(function() {
				return oContext.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
					var sProjectPath = oProjectDocument.getEntity().getFullPath();
					return oRootDocument.getCurrentMetadata().then(function(aProjectsMetadata) {
						for (var i = 0; i < aProjectsMetadata.length; i++) {
							if (aProjectsMetadata[i].path === sProjectPath) {
								return oContext.service.document.getDocumentByPath(sProjectPath + "/" + that.SETTINGS_FILE_NAME).then(function(oIndexDocument) {
									if (oIndexDocument) {
										return oIndexDocument;
									}
									
									return that._createIndexFile(oProjectDocument, that.SETTINGS_FILE_NAME, oContext, oIgnoreService);
								});
							}
						}
					});
				});
			
			});
			
			return this._oCreatePromise;
		},

		_createIndexFile: function(oProjectDocument, sName, oContext, oIgnoreService) {
			return oProjectDocument.createFile(sName);
		},
		
		// the method should never fail
		// even if it fails creation of setting document must continue 
		_setGitIgnore : function(oParent, oSettingsDocument, oContext, oIgnoreService) {
		    if (oParent && oParent.getEntity().getBackendData().git) {
		        return oIgnoreService.setIgnore(oSettingsDocument.getEntity()).fail(function(oError) {
		            oContext.service.log.warn("appCacheBuster - _setGitIgnore failed", oError, [ "user" ]).done();
		        });
		    }
		    
		    return Q();
		},

		_saveSettings: function(oSettingsDocument, mSettings) {
			if (oSettingsDocument) {
				return oSettingsDocument.setContent(JSON.stringify(mSettings, undefined, 2)).then(function() {
					return oSettingsDocument.save(false).thenResolve(oSettingsDocument);
				});
			}
		}
	};
});