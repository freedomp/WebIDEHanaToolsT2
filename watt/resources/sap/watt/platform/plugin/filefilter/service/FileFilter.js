define(function() {
    
	"use strict";
	
	return {
		_mConfig : {},
		_oReadOnlyRegExp : null,
		_oIgnoreService : null,
		_oSourceControlIgnoreRegExp : null,
		_oProjectTypeService : null,
		
		configure : function(mConfig) {
			if (mConfig) {
				this._mConfig = mConfig;
				
				if (mConfig.ignore) {
			    	this._oIgnoreService = mConfig.ignore.service;
				}
				
				this._oReadOnlyRegExp = this._createRegularExpression(this._mConfig.alwaysReadOnly);
				this._oSourceControlIgnoreRegExp = this._createRegularExpression(this._mConfig.sourceControlIgnore);
				
				this._oProjectTypeService = mConfig.projectTypeHandler.service;
			}
		},
		
		getProjectTypeService : function() {
			return this._oProjectTypeService;
		},
		
		filterMetadata : function(aMetadata, oFilterOptions) {
			var aMetadataPathes = [];
			
			if (!oFilterOptions) {
				return aMetadata;	
			}
			
			for (var mp = 0; mp < aMetadata.length; mp++) {
				var oMetadata = aMetadata[mp];
				aMetadataPathes.push(oMetadata.path);
			}
			
			var bHidden = oFilterOptions.hidden;
			if (bHidden !== undefined) {
				bHidden = (bHidden === true);
				return this._filterHidden(aMetadata, aMetadataPathes, bHidden);
			}

			return aMetadata;
		},
		
		_prepareDocument : function(oDocument, oDAO) {
			// update hidden property
			var oDocumentMetadata = oDocument.getDocumentMetadata();
			
			var oEntity = oDocument.getEntity();
			var sFullPath = oEntity.getFullPath();
			var bReadOnly = (this._oReadOnlyRegExp && sFullPath && this._oReadOnlyRegExp.test(sFullPath));
			bReadOnly = (bReadOnly === true);
			//Set to read-only if the dao is not writable
			if (!oDAO.instanceOf("sap.watt.common.service.remote.FileDAO") || bReadOnly) {
				if (!oDocumentMetadata.readOnly) {
					oDocumentMetadata.readOnly = true;
				}
			}
			
			return this.context.service._filefilter.hide.isHidden([sFullPath]).then(function(oHidden) {
				oDocument.setHidden(oHidden[sFullPath]);
				
				// if (that._oSourceControlIgnoreRegExp && that._oSourceControlIgnoreRegExp.test(sFullPath)) {
				// 	return that._oIgnoreService.setIgnore(oDocument.getEntity());
				// }
			});
		},
		
		_filterHidden : function(aMetadata, aMetadataPathes, bHidden) {
			var aFilteredMetadata = [];
			
			return this.context.service._filefilter.hide.isHidden(aMetadataPathes).then(function(bHiddenResult) {
				for (var m = 0; m < aMetadata.length; m++) {
					var oMetadataElement = aMetadata[m];
					if (bHiddenResult[oMetadataElement.path] === bHidden) {
						aFilteredMetadata.push(oMetadataElement);
					}
				}
				
				return aFilteredMetadata;
			});
		},
		
		getHiddenConfiguration : function() {
			return {"alwaysHidden" : this._mConfig.alwaysHidden, "defaultHidden" : this._mConfig.defaultHidden};
		},
		
		getExportConfiguration : function() {
			return {"neverExport" : this._mConfig.neverExport, "defaultDoNotExport" : this._mConfig.defaultDoNotExport};
		},
		
		_createRegularExpression : function(aRegExps) {
			var aValidPaterns = [];
			for (var e = 0; e < aRegExps.length; e++) {
				var aPatterns = aRegExps[e].regExps;
				for (var p = 0; p < aPatterns.length; p++) {
					var sPattern = aPatterns[p];
					try {
						RegExp(sPattern); // test if valid
						aValidPaterns.push(sPattern);
					} catch (oError) {
						this.context.service.log.warn("hideManager", oError.message, ["user"]).done();
					}
				}
			}
			
			if (aValidPaterns.length > 0) {
				var sPatterns = aValidPaterns[0];
				if (aValidPaterns.length > 1) {
					for (var vp = 1; vp < aValidPaterns.length; vp++) {
						sPatterns = sPatterns.concat("|" + aValidPaterns[vp]);
					}
				}
				
				return (new RegExp(sPatterns));
			}
			
			return null;
		}
	};
});