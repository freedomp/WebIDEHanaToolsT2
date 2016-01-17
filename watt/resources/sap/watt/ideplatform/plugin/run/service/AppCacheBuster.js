define([ "sap/watt/lib/lodash/lodash", "sap.watt.ideplatform.run/util/AppCacheBusterHelper" ], function(_, appCBHelper) {
	
	"use strict";
	
	return {
	    
		_aFoldersToIgnore : [],
		_aFilesToInore : [],
		_aFolderPathsToInore : [],
		_updateContentPromise : Q(),
		_appCBHelper : appCBHelper,
		_oIgnoreService : null,
		
		configure : function(mConfig) {
			if (mConfig.filesToIgnore) { // set ignored files
				this._aFilesToInore = mConfig.filesToIgnore; 
			} // set "sap-ui-cachebuster-info.json" as ignored file
			this._aFilesToInore.push(this._appCBHelper.SETTINGS_FILE_NAME);
			
			if (mConfig.foldersToIgnore) { // set ignored folders
				this._aFoldersToIgnore = mConfig.foldersToIgnore; 
				for (var i = 0; i < this._aFoldersToIgnore.length; i++) {
					var sFolderNameToIgnore = this._aFoldersToIgnore[i];
				    this._aFolderPathsToInore.push("/" + sFolderNameToIgnore + "/");
				}
			}

			if (mConfig.ignore) {
			    this._oIgnoreService = mConfig.ignore.service;
			}
		},
		
		// returns document path without parent name
		// "/project/folder/file.txt --> folder/file.txt"
		_getDocumentPathWithoutProject : function(sDocumentFullPath) {
		    var index = sDocumentFullPath.indexOf("/", 1);
		    return sDocumentFullPath.substr(index + 1);
		},
		
		_isValidFile : function(oRawData) {
	        if (!oRawData.folder) {  // should be a file
		        // a document must not be in a list of ignored files
		        var sFileName = oRawData.name;
		        var nFileToIgnoreIndex = _.findIndex(this._aFilesToInore, function(sFileToIgnore) {
		            return sFileToIgnore === sFileName;
		        }); 
		        
		        if (nFileToIgnoreIndex === -1) { // check folders only if file name is ok
		            // a document must not belong to an ignored folder
		            var sFileFullPath = oRawData.path;
		            var nFolderToIgnoreIndex = _.findIndex(this._aFolderPathsToInore, function(sFolderPathToIgnore) {
		                return sFileFullPath.indexOf(sFolderPathToIgnore)  !== -1;
		            }); 
		        
		            return nFolderToIgnoreIndex === -1;
		        }
		    }
		    
		    return false;
		},
		
		_isValidFolder : function(oDocument, action) {
	        // do nothing if folder is document and it was deleted or created
	        if (oDocument.isProject() && (action === "created" || action === "deleted")) {
	            return false;
	        }
	        
            var nFolderToIgnoreInd = _.findIndex(this._aFoldersToIgnore, function(sFolderToIgnore) {
                return sFolderToIgnore === oDocument.getEntity().getName();
            });
            
            return nFolderToIgnoreInd === -1;
		},
		
		// checks if a document is a file that can be stored in an index file
		_shoudUpdateIndexFile : function(oEvent) {
		    var oDocument = oEvent.params.document;
		    var oEntity = oDocument.getEntity();
		    if (oEntity.isFolder()) { // the document is a folder
		        return this._isValidFolder(oDocument, oEvent.name);
		    }
		    // the document is a file
		    var oRawData = {};
		    oRawData.name = oEntity.getName();
		    oRawData.path = oEntity.getFullPath();
		    oRawData.folder = false;
		    
		    return this._isValidFile(oRawData);
		},
		
		// called when a document was saved, created, deleted or externally changed 
		onFileDocumentChange : function(oEvent) {
		    // check if index file must be updated
		    if (this._shoudUpdateIndexFile(oEvent)) {
		        // process events
		        this._processUpdateEvents(oEvent).done();
		    }
		},
		
		// get events one by one and update relevant index files
		_processUpdateEvents : function(oEvent) {
		    var that = this;
		    
		    this._updateContentPromise = this._updateContentPromise.then(function() {
		        return that._processUpdateEvent(oEvent);
		    });
		    
		    return this._updateContentPromise;
		},
		
		_isExist : function(oProjectDocument) {
			return this._getIndexFilePath(oProjectDocument).then(function(sIndexFilePath) {
				return (sIndexFilePath === undefined ? false : true);
			});
		},
		
		_getIndexFilePath : function(oProjectDocument) {
			var that = this;
			return oProjectDocument.getCurrentMetadata().then(function(aProjectMetadata) {
	    		// find index file path
	    		for (var i = 0; i < aProjectMetadata.length; i++) {
	    			var oMetadataElement = aProjectMetadata[i];
	    			if (oMetadataElement.name === that._appCBHelper.SETTINGS_FILE_NAME) {
	    				return oMetadataElement.path;
	    			}
	    		}
			});
		},
		
		_processUpdateEvent : function(oEvent) {
		    var that = this;
		    var oDocument = oEvent.params.document;
		    var _iProgressId = null;
		    
		    // get current index file content
		    return oDocument.getProject(true).then(function(oProjectDocument) {
	    		return that._getIndexFilePath(oProjectDocument).then(function(sIndexFilePath) {
	    			// if an index file was found
		    		if (sIndexFilePath) {
		    			return that.context.service.progress.startTask("UpdateIndexFile", "Update index file").then(function(iProgressId) {
		                    _iProgressId = iProgressId;
		                    // set updated index file content
			                return that._updateAppCacheBusterFile(oProjectDocument);
		            	});
		    		}
	    		});
		    }).fail(function(oError) { // this method should never fail
                return that.context.service.log.error("appCacheBuster - update", oError.message, ["user"]);		        
		    }).fin(function() {
		        if (_iProgressId) { // stop task
		            that.context.service.progress.stopTask(_iProgressId).done();
		        }
		    }); 
		},
		
		// creates index file content for document's project
        _createIndexFileContent : function(oProjectDocument) {
            var that = this;
            return oProjectDocument.getCurrentMetadata(true).then(function(aMetadataContent) {
            	var oIndexFileContent = {};
            	
                for (var i = 0; i < aMetadataContent.length; i++) {
                	var oMetadataElement = aMetadataContent[i];
                    if (that._isValidFile(oMetadataElement)) {
                        var sKey = that._getDocumentPathWithoutProject(oMetadataElement.path);
                        oIndexFileContent[sKey] = '' + oMetadataElement.changedOn; // add entry 
                    }
                }
                
                return oIndexFileContent;
            });
        },
        
        _updateAppCacheBusterFile : function(oProjectDocument) {
        	var that = this; 
    		// 1. create index file updated content
            // 2. get or create an index file document
            return Q.spread([that._createIndexFileContent(oProjectDocument), that._getIndexFileDocument(oProjectDocument)], function(oIndexFileContent, oIndexFileDocument) {
        		// save index file content 
        		return that._appCBHelper._saveSettings(oIndexFileDocument, oIndexFileContent);
        	}).fail(function(oError) {  // this method should never fail
	            return that.context.service.log.error("appCacheBuster - create app cachebuster content", oError.message, ["user"]);
	        });
        },
        
        createAppCacheBusterFile : function(oProjectDocument) {
        	var that = this; 
        	return this._isExist(oProjectDocument).then(function(bExist) {
        		if (bExist === false) {
        			return that._updateAppCacheBusterFile(oProjectDocument);
        		}
	        });
        },
        
	    _getIndexFileDocument : function(oProjectDocument) {
	    	var that = this;
	    	return this._getIndexFilePath(oProjectDocument).then(function(sIndexFilePath) {
	            if (sIndexFilePath) {
	            	return that.context.service.filesystem.documentProvider.getDocument(sIndexFilePath);	
	            }
	            
	            return that._appCBHelper._getSettingsDocument(oProjectDocument, true, that.context, that._oIgnoreService);
	    	});
	    }
	};
});