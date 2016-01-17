// TODO REMOTE Global Error handling and error mapping from orion to IDE error
define(["../dao/File", "../dao/Transfer", "sap.watt.common.filesystem/document/FileFolderEntity", "../util/PathMapping", "sap/watt/lib/lodash/lodash", "sap/watt/ideplatform/backend/util/MetadataManager"], 
	function(oFileDao, TransferDao, FileFolderEntity, mPathMapping, _, oMetadataManager) {
		
	"use strict";
	
	return {

		/**
		 * @memberOf sap.watt.ideplatform.orion.service.OrionFileDAO
		 */
		_bWorkspaceCached : false,
		_oOnLoadRootProjectCached : {},
		
		ERROR_FILE_ALREADY_EXISTS: "ERROR_FILE_ALREADY_EXISTS",
		ERROR_FOLDER_ALREADY_EXISTS: "ERROR_FOLDER_ALREADY_EXISTS",
		ERROR_INVALID_FILE_NAME: "ERROR_INVALID_FILE_NAME",
		ERROR_INVALID_FOLDER_NAME: "ERROR_INVALID_FOLDER_NAME",
		ERROR_INVALID_FILE_OR_FOLDER_NAME: "ERROR_INVALID_FILE_OR_FOLDER_NAME",
		ERROR_INVALID_PATH_NAME: "ERROR_INVALID_PATH_NAME",
		ERROR_NO_EXPORT_LOCATION: "ERROR_NO_EXPORT_LOCATION",
		ERROR_DEST_NOT_ALLOWED: "ERROR_DEST_NOT_ALLOWED",
		ERROR_FILE_ALREADY_MODIFIED: "ERROR_FILE_ALREADY_MODIFIED",

		_mWorkspace: mPathMapping.workspace,

		_oLastSearch: {
			"searchTermLocation": "",
			"result": null,
			"preFetchedFiles": {aFileEntries:[], numFound: 0, start: 0}
		},

		_oDao: oFileDao,

		_oTransfer: TransferDao,

		init: function() {
			this.ERROR_FILE_ALREADY_EXISTS = this.context.i18n.getText("i18n", "orionFileDAO_errorFileAlreadyExists");
			this.ERROR_FOLDER_ALREADY_EXISTS = this.context.i18n.getText("i18n", "orionFileDAO__errorFolderAlreadyExists");
			this.ERROR_INVALID_FILE_NAME = this.context.i18n.getText("i18n", "orionFileDAO_errorInvalidFileOrFolderName");
			this.ERROR_INVALID_FOLDER_NAME = this.context.i18n.getText("i18n", "orionFileDAO_errorInvalidFileOrFolderName");
			this.ERROR_INVALID_FILE_OR_FOLDER_NAME = this.context.i18n.getText("i18n", "orionFileDAO_errorInvalidFileOrFolderName");
			this.ERROR_INVALID_PATH_NAME = this.context.i18n.getText("i18n", "orionFileDAO_errorInvalidPathName");
			this.ERROR_NO_EXPORT_LOCATION = this.context.i18n.getText("i18n", "orionFileDAO_errorNoExportLocation");
			this.ERROR_DEST_NOT_ALLOWED = this.context.i18n.getText("i18n", "orionFileDAO_errorDestinationNotAllowed");
			this.ERROR_FILE_ALREADY_MODIFIED = this.context.i18n.getText("i18n", "orionFileDAO_errorFileAlreadyModified");
			//nothing to do further
		},
		
		convertToProject : function() {
			return Q.reject("convertToProject is not supported in Orion");
		},
		
		updateProject : function() {
			return Q.reject("updateProject is not supported in Orion");
		},
		
		_createEntity: function(sType, mEntityConfig) {
			return new FileFolderEntity(sType, mEntityConfig.sName, mEntityConfig.sPath);
		},

		getRoot: function() {
			var oBackendData = {
				location: this._mWorkspace.location,
				childLocation: this._mWorkspace.childLocation
			};
			var oEntity = this._createEntity("folder", {
				sName: "",
				sPath: ""
			});
			oEntity.setBackendData(oBackendData);
			return this.context.service.document.getDocument(oEntity);
		},

		createFile: function(oParentDocument, sName) {
			sName = sName.trim();
			if (!this._checkFileFolderNameAllowed(sName)) {
				// expected error for not allowed file names
				return Q.reject(new Error(this.ERROR_INVALID_FILE_NAME));
			}

			var sParentLocation = oParentDocument.getEntity().getBackendData().location;
			var that = this;
			
			return this._oDao.createFile(sParentLocation, sName).then(function(oResult) {
				return that._createFileFolderDocument(oParentDocument, oResult);
			}, function(oError) {
				if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError)) {
					// expected error for already existing file names
					throw new Error(that.ERROR_FILE_ALREADY_EXISTS);
				} else {
					// unexpected error
					throw new Error(oError.message);
				}
			});
		},

		createFolder: function(oParentFolderDocument, sFolderName) {
			sFolderName = sFolderName.trim();
			if (!this._checkFileFolderNameAllowed(sFolderName)) {
				// expected error for not allowed folder names
				return Q.reject(new Error(this.ERROR_INVALID_FOLDER_NAME));
			}

			var sTargetFolderLocation = oParentFolderDocument.getEntity().getBackendData().location;

			var bIsProject = oParentFolderDocument.getEntity().isRoot();

			var that = this;
			return this._oDao.createFolder(sTargetFolderLocation, sFolderName).then(function(oResult) {
				var sFolderLocation = (oResult.ContentLocation) ? oResult.ContentLocation : oResult.Location;
				sFolderLocation = sFolderLocation.replace("/workspace", "");
				// Orion currently returns strange ContentLocation with prefix /workspace which is probably wrong
				return that._oDao.read(sFolderLocation, true);
			}).then(function(oFolderResult) {
				return that._createFileFolderDocument(oParentFolderDocument, oFolderResult);
			}, function(oError) {
				if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError, bIsProject)) {
					// expected error for already existing folder names
					throw new Error(that.ERROR_FOLDER_ALREADY_EXISTS);
				} else {
					// unexpected error
					throw new Error(oError.message);
				}
			});
		},

		createProject: function(oParentDocument, oProjectData) {
			var that = this;
			if (oParentDocument.getEntity().isRoot()) {
				return this.createFolder(oParentDocument, oProjectData.name).then(function(oProjectDocument) {
					var aPromises = [];
					
					oProjectData.attributes = oProjectData.attributes || {};
					var aKeys = Object.keys(oProjectData.attributes);
					var length = aKeys.length;
					for (var i = 0; i < length; i++) {
						var sKey = aKeys[i];
						var oValue = oProjectData.attributes[sKey];
						aPromises.push(that.context.service.setting.project.setProjectSettings(sKey, oValue, oProjectDocument));
					}
					
					oProjectData.additionalTypes = oProjectData.additionalTypes || [];
					if (oProjectData.type) {
						oProjectData.additionalTypes.push(oProjectData.type);
					}
					
					if (oProjectData.additionalTypes.length > 0) {
						aPromises.push(that.context.service.projectType.setProjectTypes(oProjectDocument, oProjectData.additionalTypes));
					}
					
					return Q.all(aPromises).then(function() {
						return oProjectDocument;
					});
				});
			} 
			
			throw new Error("Orion does not support nested projects");
		},

		copyObject: function(oSourceDocument, oTargetFolderDocument, sTargetName, bForce) {
			var sSourceName = oSourceDocument.getEntity().getName();
			var sSourceFileLocation = oSourceDocument.getEntity().getBackendData().location;
			var sTargetFolder = oTargetFolderDocument.getEntity().getBackendData().location;
			var that = this;

			if (sTargetFolder.indexOf(sSourceFileLocation) === 0) {
				return Q.reject(new Error(this.ERROR_DEST_NOT_ALLOWED));
			}

			if (!sTargetName) {
				sTargetName = sSourceName;
			}

			sTargetName = sTargetName.trim();

			if (!this._checkFileFolderNameAllowed(sTargetName)) {
				// expected error for not allowed file / folder names
				return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
			}
			
			return this._oDao.copy(sSourceFileLocation, sTargetFolder, sTargetName, bForce).then(function(oResult) {
				return that._createFileFolderDocument(oTargetFolderDocument, oResult);
			}, function(oError) {
				if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError)) {
					// expected error for already existing folder names
					throw new Error(that.ERROR_FOLDER_ALREADY_EXISTS);
				} else {
					// unexpected error
					throw new Error(oError.message);
				}
			});
		},
		
		onLogIn : function() {
			var that = this;
			var sProjectsLocation = this._mWorkspace.childLocation;
		
			this._oDao.fetchChildren(sProjectsLocation).then(function(oWorkspaceInfo) {
				var aProjects = oWorkspaceInfo.Children;
				
				var aPromises = [];
				var length = aProjects.length;
				for (var i = 0; i < length; i++) {
					var oProject = aProjects[i];
					aPromises.push(that._cacheProject(oProject)); 
				}
				
				return Q.all(aPromises).then(function() {
					that._bWorkspaceCached = true;
				});
			}).done();
		},
		
		_cacheProject : function(oProject) {
			var that = this;
			return this._fetchChildren("/" + oProject.Id, oProject.ChildrenLocation.replace("depth=1", "depth=1000"), true, true).then(function() {
				that._oOnLoadRootProjectCached["/" + oProject.Id] = true;	
			});
		},

		/** Loads the passed document by delegating to the file service
		 * @param {object} oDocument
		 * @returns {object} the content and the ETag
		 */
		load: function(oDocument) {
			if (!oDocument.getEntity().isFile()) {
				throw new Error("Unsupported operation. Can't load " + oDocument.getType());
			}
			var that = this;
			return oDocument.isBinary().then(function(bBinary) { //Binary content is not supported in multipart re
				if (bBinary) {
					return Q.all([ //
    				      that.readFileContent(oDocument), //
    				      that.readFileMetadata(oDocument)]) //
						.spread(function(mContent, oMetadata) {
							return {
								mContent: mContent,
								sETag: oMetadata.sETag
							};
						});
				} else {
					return that.readFileMetaAndContent(oDocument).then(function(oResult) {
						return {
							mContent: oResult.content,
							sETag: oResult.metadata.sETag
						};
					});
				}
			});
		},

		/** Save the passed document
		 * @param {object} oDocument
		 * @returns {string} the new ETag
		 */
		save: function(oDocument) {
			if (!oDocument.getEntity().isFile()) {
				throw new Error("Unsupported operation. Can't load " + oDocument.getType());
			}
		
			return this.writeFileContent(oDocument).then(function(oMetadata) {
				return oMetadata.sETag;
			});
		},

		deleteFile: function(oFileDocument) {
			var oFileEntity = oFileDocument.getEntity();
			return this._oDao.deleteFile(oFileEntity.getBackendData().location).then(function() {
				oMetadataManager.deleteMetadata(oFileEntity.getFullPath());
				return null;
			});
		},

		deleteFolder: function(oFolderDocument) {
			var sLocation = this._getLocation(oFolderDocument);
			return this._oDao.deleteFile(sLocation).then(function() {
				oMetadataManager.deleteMetadata(oFolderDocument.getEntity().getFullPath(), true);
				return {};
			});
		},

		exportZip: function(oFolderDocument) {
			var that = this;
			return this._getExportLocation(oFolderDocument).then(function(sExportLocation) {
					if (!sExportLocation) {
						return Q.reject(new Error(that.ERROR_NO_EXPORT_LOCATION));
					}
					
					return that._oTransfer.exportFolder(sExportLocation).then(function(oZipContent) {
						var oZip = that._removeFromZip(oZipContent, [".git", ".gitignore", "mock_preview_sapui5.html",
							"visual_ext_index.html", "preview_hidden.html", "sap-ui-cachebuster-info.json", "UIAdaptation_index.html" ,"changes_preview_index.html"]);
						return oZip;
					});
				});
		},

		_getOrionRawNode : function(sPath) {
			if (this._isMetadataCached(sPath)) {
				return Q(oMetadataManager.getMetadata(sPath));
			}
			
			var sRootFolderLocation = this._mWorkspace.location;
			var sFolderLocation = this._correctLocation(sRootFolderLocation) + sPath;
			return this._oDao.read(sFolderLocation, true);
		},
		
		getDocument: function(sPath, sDAO, sVersion) {
			//No versions supported
			if (sVersion) {
				return null;
			}
			
			if (sPath === "") {
				return this.getRoot();
			}
			if (!this._checkPathNameAllowed(sPath)) {
				// expected error for not allowed path names
				return Q.reject(new Error(this.ERROR_INVALID_PATH_NAME + ": >" + sPath + "<"));
			}
			
			var that = this;
			return this._getOrionRawNode(sPath).then(function(oResult) {
				if (!oResult) {
					return null;
				}
				
				var sTmpPath = _.clone(sPath);
				var iIndex = sTmpPath.lastIndexOf("/");
				if (iIndex === sTmpPath.length - 1) {
					sTmpPath = sTmpPath.substring(0, iIndex);
					iIndex = sTmpPath.lastIndexOf("/");
				}
				sTmpPath = sTmpPath.substring(0, iIndex);
				return that._createFileFolderDocument(sTmpPath, oResult);
			}, function(oError) {
				if (oError.status === 404) {
					return Q(null);
				} else {
					// unexpected error
					throw new Error(oError.message);
				}
			});
		},

		getVersions: function(oDocument, sDAO) {
			return [];
		},

		getVersion: function(oDocument, sVersion, sDAO) {
			return null;
		},

		search: function(oInputObject) {
			var sFolderName = oInputObject.sFolderName;
			var oFolderDocument = oInputObject.oFolderDocument;
			var sFileType = oInputObject.sFileType;
			var bContentSearch = oInputObject.bContentSearch;
			var sSearchTerm = oInputObject.sSearchTerm;
			var nStart = oInputObject.nStart;
			var nRows = oInputObject.nRows;
			var sSearchTermLocation = "";
			// if oInputObject.contentSearch then it is a text based content search else a file name search
			if (bContentSearch) {
				// search in content
				sSearchTerm = encodeURIComponent(this._escapeSpecialCharacters(sSearchTerm));
				if (sFileType) {
					sSearchTerm = sSearchTerm + "+NameLower:" + sFileType;
				}
			} else {
				// search in filename
				sSearchTerm = "NameLower:*" + sSearchTerm;
				if (sFileType) {
					sSearchTerm = sSearchTerm + sFileType;
				} else {
					sSearchTerm = sSearchTerm + "*";
				}
			}
			if (sFolderName) {
				var sRootFolderLocation = this._mWorkspace.location;
				var sFolderLocation = this._correctLocation(sRootFolderLocation) + sFolderName;
				sSearchTerm = sSearchTerm + "+Location:" + sFolderLocation + "*";
			} else if (oFolderDocument) {
				sSearchTerm = sSearchTerm + "+Location:" + oFolderDocument.getEntity().getBackendData().location + "*";
			}

			sSearchTermLocation = sSearchTerm;
			sSearchTerm = sSearchTerm + "&rows=300";

			var that = this;
			//Check if search for same search and location was already performed
			if (that._oLastSearch.searchTermLocation === sSearchTermLocation && nStart > 0) {
				return that._handleSearchResult(that._oLastSearch.result, nStart, nRows);
			} else {
				that._oLastSearch.searchTermLocation = sSearchTermLocation;
				return this._oDao.search(this._mWorkspace.searchLocation, sSearchTerm).then(
					function(oResult) {
						that._oLastSearch.result = oResult;
						return that._handleSearchResult(oResult, nStart, nRows);
					}, function(oError) {
						if (oError.responseText && oError.responseText.indexOf("Unclosed group") !== -1) {
							throw new Error(that.context.i18n.getText("i18n", "searchExpressionError"));
						} else {
							// unexpected error
							throw new Error(oError.errorThrown);
						}
					});
			}
		},

		_handleSearchResult: function(oResult, nStart, nRows) {
			var that = this;

			function _prefetchFiles(aFilesToPrefetch, nNumFound) {
				var me = this;
				if (aFilesToPrefetch.length > 0) {
					Q.all(aFilesToPrefetch).then(function(aList) {
						me._oLastSearch.preFetchedFiles = {aFileEntries:aList, numFound: nNumFound ? nNumFound : me._oLastSearch.preFetchedFiles.numFound, start: nStart + nRows};
					});
				}
			}

			// return paging info
			var oFileEntries = {aFileEntries:[], numFound: oResult.response.numFound, start: oResult.response.start};
			var nServerFetchStart = nStart === 0 ? 0 : (nStart + that._oLastSearch.preFetchedFiles.aFileEntries.length);
			var nServerFetchLeft = oResult.response.docs.length - nServerFetchStart;
			var nServerFetchRows = nStart === 0 ? nRows * 2 : nRows;
			var nServerFetchStop = nServerFetchStart + (nServerFetchLeft < nServerFetchRows ? nServerFetchLeft : nServerFetchRows);
			if (nStart === 0) {
				that._oLastSearch.preFetchedFiles = {aFileEntries:[], numFound: 0, start: 0};
			}

			//Get list of file url's to be retrieved from server
			for (var iInt = nServerFetchStart; iInt < nServerFetchStop; iInt++) {
				var sParentPath = "/" + oResult.response.docs[iInt].Path.substring(0, oResult.response.docs[iInt].Path.lastIndexOf("/"));
				var oFileDocument = this._createFileFolderDocument(sParentPath, oResult.response.docs[iInt]);
				oFileEntries.aFileEntries.push(oFileDocument);
			}

			//On next results request
			if (that._oLastSearch.preFetchedFiles.aFileEntries.length > 0 && that._oLastSearch.preFetchedFiles.start === nStart) {
				_prefetchFiles.call(that, oFileEntries.aFileEntries);
				return that._oLastSearch.preFetchedFiles;
			}
			//On search request
			else {
				//Separate result that should be returned synchroneusly from asynchroneus
				var aAsyncFileEntries = nServerFetchRows > nRows ? oFileEntries.aFileEntries.splice(nRows, nServerFetchRows - nRows) : [];
				_prefetchFiles.call(that, aAsyncFileEntries, oResult.response.numFound);
				return Q.all(oFileEntries.aFileEntries).then(function (results) {
					oFileEntries.aFileEntries = results;
					return Q(oFileEntries);
				});
			}
		},

		_getChildrenLocation : function(oEntity, bRecursive) {
			bRecursive = (bRecursive === true);
			var sChildrenLocation = oEntity.getBackendData().childLocation;
			
			if (oEntity.isRoot() && bRecursive) {
				throw new Error("Cannot get the root folder children recursively");
			} else if (oEntity.isRoot() && !bRecursive) {
				// do not modify the childLocation uri
			} else if (bRecursive && !oEntity.isRoot()) {
				sChildrenLocation = sChildrenLocation.replace("depth=1", "depth=1000");
			} else if (!bRecursive && !oEntity.isRoot()) {
				sChildrenLocation = sChildrenLocation.replace("depth=1", "depth=2");
			}
			
			return sChildrenLocation;
		},
		
		getCurrentMetadata: function(oFolderDocument, bRecursive, bForce, oFilterOptions) {
			var that = this;
			var oEntity = oFolderDocument.getEntity();
			var sChildrenLocation = this._getChildrenLocation(oEntity, bRecursive);
			
			return this._fetchChildren(oEntity.getFullPath(), sChildrenLocation, bRecursive, bForce).then(function(oResult) {
				var aRawData = [];
				var aKeys = _.keys(oResult);
				var length = aKeys.length;
				for (var i = 0; i < length; i++) {
					var sKey = aKeys[i];
					var oRawNode = oResult[sKey];
					aRawData.push({"name" : oRawNode.Name,
								   "path" : sKey,
								   "changedOn" : oRawNode.LocalTimeStamp || oRawNode.LastModified,
								   "folder" : oRawNode.Directory,
								   "parentPath" : sKey.substr(0, sKey.lastIndexOf("/") || 0)
					});	
				}
				
				return that.context.service.filefilter.filterMetadata(aRawData, oFilterOptions);
			});
		},
		
		_getFolderContent : function(oFolderDocument, bForce) {
			bForce = (bForce === true);
			
			var that = this;
			var oEntity = oFolderDocument.getEntity();
			var sChildrenLocation = this._getChildrenLocation(oEntity, false);
			return this._fetchChildren(oEntity.getFullPath(), sChildrenLocation, false, bForce).then(function(oResult) {
				return Q.all(that._mapOrionChildren2DocumentPromisesArray(oResult));
			});
		},
		
		getFolderContent: function(oFolderDocument, bForce) {
			return this._getFolderContent(oFolderDocument, bForce);
		},

		_fetchChildren : function(sFolderPath, sChildLocation, bRecursive, bForce) {
        	if (bForce === true) {
        		return this._fetchAndSaveRawBackendNodes(sFolderPath, sChildLocation, bRecursive);
        	}
        	
		    if (this._isMetadataCached(sFolderPath)) {
		    	return Q(oMetadataManager.getMetadata(sFolderPath, true, !bRecursive));
		    }
		    
        	return this._fetchAndSaveRawBackendNodes(sFolderPath, sChildLocation, bRecursive);
        },
        
        _isMetadataCached : function(sPath) {
        	if (this._bWorkspaceCached) {
        		return true;
        	} else if (sPath !== "") {
		    	var index = sPath.indexOf("/", 1);
		    	var sRootProjectPath = (index === -1 ? sPath : sPath.substr(0, index));
		    	return this._oOnLoadRootProjectCached[sRootProjectPath];
        	}
        	
        	return false;
        },
        
		_fetchAndSaveRawBackendNodes : function(sFolderPath, sChildrenLocation, bRecursive) {
			var that = this;
			return this._oDao.fetchChildren(sChildrenLocation).then(function(aRawNodeTree) {
				// delete folder old children
				if (that._isMetadataCached(sFolderPath) && bRecursive) {
					oMetadataManager.deleteMetadata(sFolderPath, true);
				}
				
				var oFolderMetadata = {};
				oFolderMetadata[sFolderPath] = aRawNodeTree;
				oMetadataManager.setMetadata(oFolderMetadata);
				
				var oRawNodes = that._saveRawBackendNodes(aRawNodeTree.Children, bRecursive);
				oMetadataManager.setMetadata(oRawNodes);

				return oRawNodes;
			});
		},
		
		_saveRawBackendNodes : function(aRawChildrenNodes, bRecursive) {
            var that = this;
            var aRawNodes = {};
            
            var index = this._mWorkspace.location.lastIndexOf("/");
			var orionContent = this._mWorkspace.location.substr(index);
			var length = aRawChildrenNodes.length;
            for (var i = 0; i < length; i++) {
            	var oRawNode = aRawChildrenNodes[i];
	            var orionContentIndex = oRawNode.Location.indexOf(orionContent) + orionContent.length;
	            var sNodePath = oRawNode.Location.substr(orionContentIndex);
	            
	            if (oRawNode.Directory && sNodePath !== "") {
	            	sNodePath = sNodePath.substring(0, sNodePath.length - 1);
	            }
	            
	            aRawNodes[sNodePath] = oRawNode;
	
	            if (oRawNode.Directory && bRecursive) {
                	aRawNodes = $.extend(aRawNodes, that._saveRawBackendNodes((oRawNode.Children || []), bRecursive));
	            }
            }
			
            return aRawNodes;
        },

		//oFile might be a Blob also. In this case, sFileName needs to be provided
		importFile: function(oParentFolderDocument, oFile, bUnzip, bForce, sFileName) {
			var that = this;
			var oEntity = oParentFolderDocument.getEntity();
			var oBackendData = oEntity.getBackendData();
			var sParentFolderPath = oEntity.getFullPath();
			//TODO REMOTE: find a better way to detect whether a file is a zip file
			if (bUnzip && oFile.type && oFile.type.search("zip") !== -1) {
				return this.importZip(oParentFolderDocument, oFile, bForce);
			} 
			
			return this._oTransfer.importFile(oBackendData.importLocation, oFile, sFileName).then(function() {
				// get updated raw node of the parent folder 
				return that._oDao.read(oBackendData.childLocation, false).then(function(oOrionRawTree) {
					// sometimes the result will be string so we need to create json object
					if (jQuery.type(oOrionRawTree) === "string") {
						oOrionRawTree = JSON.parse(oOrionRawTree);
					}
					
					var oRawNodes = that._saveRawBackendNodes(oOrionRawTree.Children, false);
					oRawNodes[sParentFolderPath] = oOrionRawTree;
	
					oMetadataManager.setMetadata(oRawNodes);
					
					var sImportedFileName = oFile.name || sFileName;
					var oImportedRawNode = oMetadataManager.getMetadata(sParentFolderPath + "/" + sImportedFileName);
					return that._createFileFolderDocument(sParentFolderPath, oImportedRawNode);
				});
			});
		},

		// content can be a File object or a Blob object
		importZip: function(oParentFolderDocument, oContent, bForce) {
			var sImportLocation = oParentFolderDocument.getEntity().getBackendData().importLocation;
			return this._oTransfer.importZip(sImportLocation, oContent, bForce);
		},

		objectExists: function(oParentFolderDocument, sRelativePath) {
			//TODO avoid calculating uri if possible
			if (oParentFolderDocument === null) {
				return Q(false);
			}
			var oUri = new URI(sRelativePath);
			if (oUri.directory() !== "") {
				if (!this._checkPathNameAllowed("/" + sRelativePath)) {
					// expected error for not allowed path names
					return Q.reject(new Error(this.ERROR_INVALID_PATH_NAME + ": >" + sRelativePath + "<"));
				}
			} else {
				if (!this._checkFileFolderNameAllowed(sRelativePath)) {
					// expected error for not allowed file or folder names
					return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
				}
			}
			
			var oParentFolderEntity = oParentFolderDocument.getEntity();
			var sParentDocumentPath = oParentFolderEntity.getFullPath();
			if (this._isMetadataCached(sParentDocumentPath)) {
				var aRawNodes = oMetadataManager.getMetadata(sParentDocumentPath, true);
				var aNodePathes = _.keys(aRawNodes);
				var index = _.findIndex(aNodePathes, function(sNodePath) {
					var indexRaltivePath = sNodePath.indexOf(sRelativePath);
					if ( indexRaltivePath !== -1 ){
						var sRelativePathSubStr = sNodePath.substring(indexRaltivePath);
						return ( sRelativePathSubStr === sRelativePath );
					}
					return false;
					//return (sNodePath.indexOf(sRelativePath) !== -1);
				});
				
				return (index === -1 ? Q(false) : Q(true)); 
			}
			
			var sParentLocation = this._correctLocation(oParentFolderEntity.getBackendData().location);
			var sObjectLocation = sParentLocation + "/" + sRelativePath;
			return this._oDao.read(sObjectLocation, true).then(function() {
				return Q(true);
			}, function(oError) {
				if (oError.status === 404) {
					return Q(false);
				} else {
					// unexpected error
					throw new Error(oError.message);
				}
			});
		},

		moveObject: function(oSourceFileDocument, oTargetParentFolderDocument, sTargetName) {
			sTargetName = sTargetName.trim();
			if (!this._checkFileFolderNameAllowed(sTargetName)) {
				// expected error for not allowed file / folder names
				return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
			}
	
			var that = this;
			var sTargetFolderLocation = oTargetParentFolderDocument.getEntity().getBackendData().location;

			var sSourceLocation = this._getLocation(oSourceFileDocument);
			return this._oDao.move(sSourceLocation, sTargetFolderLocation, sTargetName).then(function(oResult) {
				oMetadataManager.deleteMetadata(oSourceFileDocument.getEntity().getFullPath(), true);

				return that._createFileFolderDocument(oTargetParentFolderDocument, oResult);
			});
		},

		readFileContent: function(oDocument) {
			var oEntity = oDocument.getEntity();
			var sDocumentPath = oEntity.getFullPath();
			var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
			if (this._isMetadataCached(sDocumentPath) && !oRawNode) {
	    		return Q(undefined);
			}
			
			var sLocation = oEntity.getBackendData().location;
			var that = this;
			return oDocument.isBinary().then(function(bBinary) {
				return that._oDao.read(sLocation, false, bBinary);
			}).then(function(oContent) {
				return oContent;
			});
		},

		readFileMetadata: function(oDocument) {
			var that = this;
			
			var oEntity = oDocument.getEntity();
			var sDocumentPath = oEntity.getFullPath();
			var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
			if (this._isMetadataCached(sDocumentPath) && !oRawNode) {
	    		return Q(undefined);
			}
			
			var sLocation = oEntity.getBackendData().location;
			return this._oDao.read(sLocation, true).then(function(oOrionResult) {
				return that._createFileFolderDocument(oEntity.getParentPath(), oOrionResult).then(function() {
					var oMetadata = {};
					oMetadata.sETag = oOrionResult.ETag;
					return oMetadata;
				});
			}).fail(function() {
				return null;
			});
		},

		readFileMetaAndContent: function(oDocument) {
			var that = this;
			
			var oEntity = oDocument.getEntity();
			var sDocumentPath = oEntity.getFullPath();
			var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
			if (this._isMetadataCached(sDocumentPath) && !oRawNode) {
	    		return Q(undefined);
			}
			
			var sLocation = oEntity.getBackendData().location;
			return this._oDao.read(sLocation, false, false, true).then(function(aResults) {
				var oOrionResult = aResults[0];
				var sContent = aResults[1];
				return that._createFileFolderDocument(oEntity.getParentPath(), oOrionResult).then(function() {
					var oResult = {
						metadata: {
							sETag: oOrionResult.ETag
						},
						content: sContent
					};
					return oResult;
				});
			});
		},

		writeFileContent: function(oDocument) {
			var that = this;
			var oEntity = oDocument.getEntity();
			return Q.spread([oDocument.getContent(), oDocument.isBinary()], function(mContent, bBinary) {
				if (bBinary) {
					//TODO Enable this
					throw new Error("Unsupported: Orion API does not support writing binary content");
				}

				return that._oDao.write(oEntity.getBackendData().location, mContent, oDocument.getETag(), bBinary).then(function(oOrionResult) {
					//TODO Clarify who is responsible for updating metadata?
					if (jQuery.type(oOrionResult) === "string") {
						oOrionResult = JSON.parse(oOrionResult);
					}
					
					return that._createFileFolderDocument(oEntity.getParentPath(), oOrionResult).then(function(oUpdatedDocument) {
						// Update metadata
						var mMetaddata = oUpdatedDocument.getDocumentMetadata();
						oDocument.setDocumentMetadata(mMetaddata);
	
						return {
							sETag: oOrionResult.ETag,
							mMetadata: mMetaddata
						};
					});
				});
			}).fail(function(oError) {
				if (oError.status === 412) {
					throw new Error(that.ERROR_FILE_ALREADY_MODIFIED);
				}
				// unexpected error
				throw new Error(oError.message);
			});
		},

		// private helper functions
		_correctLocation: function(sLocation) {
			//for root location replace very first occurence if it is "/workspace/" with "/file/"
			var iPosition = sLocation.indexOf("/workspace/");
			if (sLocation == this._mWorkspace.location && iPosition > -1) {
				// in cloud it is /s2s/workspace, locally it is /workspace/ therefore we need to replace the right part
				return sLocation.substring(0, iPosition) + "/file/" + sLocation.substring(iPosition + "/workspace/".length);
			} else {
				return sLocation;
			}
		},

		_checkFileFolderCreationError_FileFolderAlreadyExists: function(oError, bIsProject) {
			if (bIsProject && oError && oError.responseJSON && oError.responseJSON.HttpCode === 400 && oError.responseJSON.Message.indexOf(
				"Duplicate project name:") === 0) { //TODO: check if text is stable
				return true;
			} else if (!bIsProject && oError && oError.responseJSON && oError.responseJSON.HttpCode === 412 && oError.responseJSON.Message ===
				"A file or folder with the same name already exists at this location") { //TODO: check if text is stable
				return true;
			} else {
				return false;
			}

		},

		getProjectTypes: function() {
			throw new Error("Orion does not support project type");
		},

		_checkFileFolderNameAllowed: function(sName) {
			//Corresponds to allowed characters for UI5 Repositories
			//Last character must not be a "."
			var rAllowedFileFolderNames = /^[a-zA-Z0-9\.\-_@]*[a-zA-Z0-9\-_@]+$/;
			var aMatch = rAllowedFileFolderNames.exec(sName); //regex returns null in case of no match
			return !!aMatch;
		},

		_checkPathNameAllowed: function(sPath) {
			//Corresponds to allowed characters for paths
			//which is starting with / then allowed characters for file/folder names as above
			var rAllowedFileFolderNames = /^(\/[a-zA-Z0-9\.\-_@]*[a-zA-Z0-9\-_@]+)*$/;
			var aMatch = rAllowedFileFolderNames.exec(sPath); //regex returns null in case of no match
			return !!aMatch;
		},

		/**
		 * Creates a new document for a file or folder
		 * @param oParentFolderDocument Either the parent document or a parent path
		 * @param oOrionResult
		 * @param aProjects
		 * @returns
		 */
		_createFileFolderDocument: function(sParentFolderPath, oOrionResult) {
			var that = this;
			var oMetadata = this._createMetadataFromOrionResult(sParentFolderPath, oOrionResult);
			var oEntity = oMetadata.entity;
			var oRawMetadataValue = {};
			var sDocumentFullPath = oEntity.getFullPath();
			oRawMetadataValue[sDocumentFullPath] = oOrionResult;
			oMetadataManager.setMetadata(oRawMetadataValue);
					
			return this.context.service.document.getDocument(oEntity).then(function(oDocument) {
				// recalculate hasChildren property of the document
				if (that._isMetadataCached(sDocumentFullPath)) {
					oMetadata.metadata.hasChildren = oMetadataManager.hasChildren(sDocumentFullPath);
				} 
				// gets old metadata
				var oOldMetadata = oDocument.getDocumentMetadata();
				// update new metadata
				var oNewMetadata = $.extend({}, oOldMetadata, oMetadata.metadata);
				oDocument.setDocumentMetadata(oNewMetadata);

				if (oOldMetadata.hasChildren !== oNewMetadata.hasChildren) {
					return oDocument._oEventEmitter.fireChanged({
						document: oDocument,
						changeType: "children"
					}).thenResolve(oDocument);
				}

				return oDocument;
			});
		},

		_createMetadataFromOrionResult: function(oParentFolderDocument, oOrionResult) {
			var oEntity;
			var oBackendData;
			var oMetadata;

			if (oOrionResult.Directory) {

				var sProjectLocation;

				oBackendData = {
					location: oOrionResult.Location,
					childLocation: oOrionResult.ChildrenLocation,
					projectLocation: sProjectLocation,
					exportLocation: oOrionResult.ExportLocation,
					importLocation: oOrionResult.ImportLocation,
					git: oOrionResult.Git
				};

				// set metata for hasChildren
				// this cannot be determined for folder an Root/Project level
				var bHasChildren;
				if (!oOrionResult.Children) { // root level
					bHasChildren = undefined;
				} else if (oOrionResult.Children && oOrionResult.Children.length > 0) {
					bHasChildren = true;
				} else {
					bHasChildren = false;
				}
				
				oMetadata = {
					changedOn: oOrionResult.LocalTimeStamp && oOrionResult.LocalTimeStamp.toString() || oOrionResult.LastModified || "",
					hasChildren: bHasChildren
				};

				oEntity = this._createEntity("folder", {
					sName: oOrionResult.Name,
					sPath: oParentFolderDocument
				});
				
			} else { // file
				oBackendData = {
					location: oOrionResult.Location,
					git: oOrionResult.Git
				};
				
				oMetadata = {
					length: oOrionResult.Length, 
					changedOn: oOrionResult.LocalTimeStamp && oOrionResult.LocalTimeStamp.toString() || oOrionResult.LastModified || ""
				};

				oEntity = this._createEntity("file", {
					sName: oOrionResult.Name,
					sPath: oParentFolderDocument
				});

			}
			oEntity.setBackendData(oBackendData);

			return {
				entity: oEntity,
				metadata: oMetadata
			};
		},

		_getProjectLocation: function(aProjects, oChild) {
			var sProjectLocation;
			if (aProjects) {
				for (var iProj = 0; iProj < aProjects.length; iProj++) {
					if (aProjects[iProj].Id === oChild.Id || aProjects[iProj].Id === oChild.Name) {
						sProjectLocation = aProjects[iProj].Location;
						return sProjectLocation;
					}
				}
			}
			return sProjectLocation;
		},

		_getLocation: function(oDocument) {
			var oEntity = oDocument.getEntity();
			var sLocation = oEntity.getBackendData().location;
			if (oDocument.isProject()) { 
				var sName = "/" + oEntity.getName() + "/";
				sLocation = sLocation.replace(sName, "/project" + sName).replace("/file/", "/workspace/");
			} 
			
			return sLocation;
		},

		_getExportLocation: function(oFolderDocument) {
			var oDocumentBackendData = oFolderDocument.getEntity().getBackendData();
			var sExportLocation = oDocumentBackendData.exportLocation;
			if (sExportLocation) {
				return Q(oDocumentBackendData.exportLocation);
			}
			
			// fallback 
			return this._oDao.read(oDocumentBackendData.location, true).then(function(oResult) {
				return oResult.ExportLocation;
			});
		},

		_mapOrionChildren2DocumentPromisesArray: function(oNodes) {
			var aPromises = [];
			
			var aKeys = _.keys(oNodes);
			for (var i = 0; i < aKeys.length; i++) {
				var sKey = aKeys[i];
				var oChild = oNodes[sKey];
				
				var indexofLastSlash = sKey.lastIndexOf("/");
				var sRawNodeParentPath = sKey.substr(0, indexofLastSlash);
				
				aPromises.push(this._createFileFolderDocument(sRawNodeParentPath, oChild));
			}
			
			return aPromises;
		},

		_removeFromZip: function(oZipContent, aRemoveItems) {
			return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function(JSZip) {
				var oZip = new JSZip();
				oZip.load(oZipContent);
				for (var iInt = 0; iInt < aRemoveItems.length; iInt++) {
					oZip.remove(aRemoveItems[iInt]);
				}
				return oZip;
			});
		},

		_contains: function(oFiles, oExistingDocument, sParentFullPath) {
			var sEntityFullPath = null;
			if (oExistingDocument.getEntity().getType() === "folder") {
				sEntityFullPath = oExistingDocument.getEntity().getFullPath() + "/";
			} else {
				sEntityFullPath = oExistingDocument.getEntity().getFullPath();
			}

			for (var oFile in oFiles) {                         
				if (sParentFullPath + "/" + oFile === sEntityFullPath) {
					return true;
				}
			}
			return false;
		},

		_escapeSpecialCharacters: function(input, omitWildcards) {
			var output = "",
			specialChars = "+-&|!(){}[]^\"~:\\" + (!omitWildcards ? "*?" : ""); //$NON-NLS-1$ //$NON-NLS-0$
			for (var i = 0; i < input.length; i++) {
				var c = input.charAt(i);
				if (specialChars.indexOf(c) >= 0) {
					output += '\\'; //$NON-NLS-0$
				}
				output += c;
			}
			return output;
		}
	};
});