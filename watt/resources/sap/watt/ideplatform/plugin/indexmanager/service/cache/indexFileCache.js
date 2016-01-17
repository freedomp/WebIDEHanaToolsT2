define([
	"../util/remoteDocUtil"
	], function (mRemoteDocUtil) {
	"use strict";
	
	/**
	 * load index json from index file in one time
	 * @public
	 */
	function loadIndex(docFullPath) {
		var indexFullPath = this.indexUtil.getIndexPath(docFullPath);
		return this.remoteDocUtil.loadDocument(indexFullPath).then(function(indexContent) {
			//console.log("succeed to load index file: " + indexFullPath);
			try {
				return Q({
					source: docFullPath,
					index: JSON.parse(indexContent)
				});
			} catch (error) {
				//console.log(error);
				return Q({});
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * refresh index file on demand
	 * @public
	 */
	function refreshIndex(docFullPath) {
		var remoteDocUtil = this.remoteDocUtil;
		var indexUtil = this.indexUtil;
		return isIndexExpired(docFullPath, remoteDocUtil, indexUtil).then(function(isExpired) {
			if (isExpired) {
				return upsertIndex(docFullPath, remoteDocUtil, indexUtil);
			} else {
				return Q();
			}
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * delete the index file of specific js file, support folder path as well
	 * @public
	 */
	function deleteIndex(docFullPath) {
		var indexFullPath = this.indexUtil.getIndexPath(docFullPath);
		return this.remoteDocUtil.deleteDocument(indexFullPath).then(function() {
			//console.log("succeed to delete index file: " + indexFullPath);
			return Q(docFullPath);
		}).fail(function(error) {
			return Q.reject(error);
		});
	}
	
	/**
	 * @private
	 */
	function isIndexExpired(docFullPath, remoteDocUtil, indexUtil) {
		var indexFullPath = indexUtil.getIndexPath(docFullPath);
		return remoteDocUtil.loadDocument(indexFullPath).then(function(indexContent) {
			if (!indexContent) {
				return Q(true);
			}
			
			var indexChangedOn = 0;
			try {
				var indexJson = JSON.parse(indexContent);
				indexChangedOn = indexJson.changedOn || 0;
			} catch (error) {
				return Q(true);
			}
			
			return indexUtil.getTimestamp(docFullPath).then(function(timestamp) {
				docChangedOn = timestamp || 0;
				return Q(indexChangedOn < docChangedOn);
			});
		}).fail(function() {
			return Q(true);// index file not found will be treated as expired
		});
	}
	
	/**
	 * @private
	 */
	function upsertIndex(docFullPath, remoteDocUtil, indexUtil) {
		return indexUtil.generateIndexJson(docFullPath).then(function(indexJson) {
			if (indexJson) {
				var indexFullPath = indexUtil.getIndexPath(docFullPath);
				var indexContent = JSON.stringify(indexJson, null, '\t');
				return remoteDocUtil.saveDocument(indexFullPath, indexContent).then(function(result) {
					//console.log("succeed to upsert index file: " + indexFullPath);
					return Q(docFullPath);
				});
			} else {
				return Q();
			}
		});
	}
	
	function IndexFileCache(docProvider, indexUtil, i18n) {
		if (!docProvider || !indexUtil || !i18n) {
			throw new Error();
		}
		
		this.remoteDocUtil = new mRemoteDocUtil.RemoteDocUtil(docProvider, i18n);
		this.indexUtil = indexUtil;
	}
	
	IndexFileCache.prototype = {
		loadIndex: loadIndex,
		refreshIndex: refreshIndex,
		deleteIndex: deleteIndex
	};
	
	return {
		IndexFileCache: IndexFileCache
	};
});