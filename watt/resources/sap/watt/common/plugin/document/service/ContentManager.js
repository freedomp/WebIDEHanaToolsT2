define(["sap/watt/lib/lodash/lodash"], function(_) {
    
	"use strict";
	
	return {
		// content data map
		_oContentDataMap : {},
		
		// default values for content cached sizes
		_nMaxAllowedSizeOfCachedContent : 209715200, // bytes === 200 MB
		_nMaxAllowedSizeOfCachedFileContent : 1048576, // bytes === 1 MB
		_nCacheSizeToRemoveOnCacheLimitExceed : 20, // 20%
		_oSpecialFilesContent : {},
		_nTotalCachedContentSize : 0,
		
		configure : function(mConfig) {
			if (mConfig) {
				// get max cached content size if configured
				this._nMaxAllowedSizeOfCachedContent = mConfig.maxAllowedSizeOfCachedContent || this._nMaxAllowedSizeOfCachedContent;
				// get max cached content file size if configured
				this._nMaxAllowedSizeOfCachedFileContent = mConfig.maxAllowedSizeOfCachedFileContent || this._nMaxAllowedSizeOfCachedFileContent;
				// get amount of cached content to remove when limit is exceeded
				this._nCacheSizeToRemoveOnCacheLimitExceed = mConfig.cleanOnTotalCacheExceededLimit || this._nCacheSizeToRemoveOnCacheLimitExceed;
				// prepare file names that should never be in cache
				if (mConfig.aFilesToBeRemovedFirst) {
					var aFilesToBeRemovedFirst = mConfig.aFilesToBeRemovedFirst;
					for (var i = 0; i < aFilesToBeRemovedFirst.length; i++) {
						var sFileNameToBeRemovedFirst = aFilesToBeRemovedFirst[i];
						this._oSpecialFilesContent[sFileNameToBeRemovedFirst] = false;
					}
				}
				// prepare file names that should always be in cache
				if (mConfig.aFilesContentAlwaysInCache) {
					var aFilesContentAlwaysInCache = mConfig.aFilesContentAlwaysInCache;
					for (var j = 0; j < aFilesContentAlwaysInCache.length; j++) {
						var sFileNameAlwaysInCache = aFilesContentAlwaysInCache[j];
						this._oSpecialFilesContent[sFileNameAlwaysInCache] = true;
					}
				}
			}
		},
		
		// deleted document content data
		// this method must be called only by document service on "deleted" event 
		deleteContentData : function(oDocument) {
			var oDocumentEntity = oDocument.getEntity();
			if (oDocumentEntity.isFile()) {
				this._removeContentData(oDocumentEntity.getKeyString());
			}
		},
		
		// removes content data from the content data map
		// sKey is a document string key got by using oDocument.getKeyString() method
		_removeContentData : function(sKey) {
			// get cached content data
			var oContentData = this._oContentDataMap[sKey];
			if (oContentData) {
				// decrease content length from total size
				this._nTotalCachedContentSize = this._nTotalCachedContentSize - oContentData.length;
				// remove deleted content data from map
				delete this._oContentDataMap[sKey];
			}
		},
		
		// adds content data object to the content data map
		// updates total cached content size if it is exceeded the defined limit
		// this method must return promise
		_updateTotalContentSize : function(oContentData) {
			// update total content size with new content data length
			this._handleContentData(oContentData);
			
			// total cached content size is bigger than the defined upper limit
			if (this._nTotalCachedContentSize > this._nMaxAllowedSizeOfCachedContent) {
				var sTotalSizeInfo = this.context.i18n.getText("i18n", "contentManager_total_cached_size_exceeded", [this._nTotalCachedContentSize, this._nMaxAllowedSizeOfCachedContent]);
				this.context.service.usagemonitoring.report("contentManager", "total_cache_limit", this._nTotalCachedContentSize).done();
				this.context.service.log.warn("contentManager", sTotalSizeInfo, ["user"]).done();
				return this._handleTotalCacheLimitExceeded();
			}
			
			return Q();
		},
		
		// remove specific files first fromm cache whem total size is bigger than the maximum limit
		_removeFilesFromCacheThatShouldBeRemovedFirst : function() {
			var aPromises = [];
			var aContentData = _.values(this._oContentDataMap);
			for (var i = 0; i < aContentData.length; i++) {
				var oContentData = aContentData[i];
				if (oContentData.bRetainInCache === false) {
					var sKey = oContentData.key;
					this._removeContentData(sKey);
					aPromises.push(this.context.service.document.getDocumentByKeyString(sKey));
				}
			}
			
			return this._invalidateFilesContent(aPromises);
		},
		
		_invalidateFilesContent : function(aFilePromises) {
			return Q.all(aFilePromises).then(function(aDocuments) {
				for (var d = 0; d < aDocuments.length; d++) {
					// remove content from document
					aDocuments[d].invalidate();
				}
			});
		},
		
		// decreases cached content size when it is exceeded the defined limit
		_handleTotalCacheLimitExceeded : function() {
			var that = this;
			// calculate total cache size to achive
			var nUpdatedCacheSizeToAchive = this._nMaxAllowedSizeOfCachedContent * (100 - this._nCacheSizeToRemoveOnCacheLimitExceed) / 100;
			
			// firstremove files that should be first removed from cache
			return this._removeFilesFromCacheThatShouldBeRemovedFirst().then(function() {
				if (that._nTotalCachedContentSize <= nUpdatedCacheSizeToAchive) {
					return Q();
				}
				
				var aPromises = [];
				// sort content data array by timestamp
				var aSortedContentData = _.sortBy(_.values(that._oContentDataMap), function(oContentData) {
					return oContentData.timestamp;	
				});
				
				var i = 0;
				while (that._nTotalCachedContentSize > nUpdatedCacheSizeToAchive) {
					// get content data object to remove
					var oContentDataToRemove = aSortedContentData[i];
					// update totatl cache size
					that._nTotalCachedContentSize = that._nTotalCachedContentSize - oContentDataToRemove.length;
					// get document which content must be removed
					var sKey = oContentDataToRemove.key;
					aPromises.push(that.context.service.document.getDocumentByKeyString(sKey));
					// remove the content data from array
					if (that._oSpecialFilesContent[oContentDataToRemove.name] !== true) {
						aSortedContentData.shift();
					}
					// delete file content data from map
					delete that._oContentDataMap[sKey];
					i++;
				}
			
				return that._invalidateFilesContent(aPromises);
			});
		},
		
		// removes an old content data (search is done by key) if it exist and adds the new object to the content map
		_handleContentData : function(oContentData) {
			// get content data key
			var sKey = oContentData.key;
			// removes old content data
			this._removeContentData(sKey);
			// saved content data
			this._oContentDataMap[sKey] = oContentData;
			// set if a file should be removed or retained in a cache in case that total size is bigger than the limit
			oContentData.bRetainInCache = this._oSpecialFilesContent[oContentData.name];
			// update total cached content size
			this._nTotalCachedContentSize = this._nTotalCachedContentSize + oContentData.length;
		},
		
		// method called on document "loaded" and "saved" events
		onContentChanged : function(oEvent) {
			var oDocument = oEvent.params.document;
			var oDocumentEntity = oDocument.getEntity();
			// document must be a file and contain content
			if (oDocumentEntity.isFile() && oDocument._savedContent && !oDocument.isDirty()) { 
				var nLength = this._getDocumentContentLength(oDocument);
				var sKey = oDocumentEntity.getKeyString();
				var sDocumentName = oDocumentEntity.getName();
				// if file contentsize is bigger that the maximum file content limit or file should never stay in cache
				var bInvalidateFile = (nLength > this._nMaxAllowedSizeOfCachedFileContent);
				if (bInvalidateFile) {
					this._invalidateFile(sKey, nLength, oDocument);
				} else {
					this._updateTotalContentSize({"key" : sKey, "length" : nLength, "timestamp" : Date.now(), "name" : sDocumentName}).done();
				}
			}
		},
		
		// removes cached file content from document
		_invalidateFile : function(sKey, nLength, oDocument) {
			// only for usage analitycs
			if (nLength > this._nMaxAllowedSizeOfCachedFileContent) {
				var sFileInfo = this.context.i18n.getText("i18n", "contentManager_file_content_size_exceeded", [sKey, nLength, this._nMaxAllowedSizeOfCachedFileContent]); 
				this.context.service.log.warn("contentManager", sFileInfo, ["user"]).done();
				this.context.service.usagemonitoring.report("contentManager", "file_cache_limit", nLength).done();
			}
			// remove document content data if it exists
			this._removeContentData(sKey);
			// remove document content from document cache
			oDocument.invalidate();
		},
		
		// returns file document content lengt (size) in bytes 
		_getDocumentContentLength : function(oDocument) {
			var nLength = oDocument.getDocumentMetadata().length;
			if (nLength) {
				return nLength;
			}
			// in case length is not defined (may happen in tests)
			if (oDocument._savedContent) {
				// var sFileInfo = this.context.i18n.getText("i18n", "no_file_length", [oDocument.getKeyString()]); 
				// this.context.service.log.warn("contentManager", sFileInfo, ["user"]).done();
				return oDocument._savedContent.length;
			}
			
			return 0;
		}
	};
});