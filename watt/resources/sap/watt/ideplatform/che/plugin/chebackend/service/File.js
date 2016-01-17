// TODO REMOTE Global Error handling and error mapping from orion to IDE error
define(["../dao/File", "../dao/Project", "../dao/MtaDAO", "../dao/Transfer",
    "sap.watt.common.filesystem/document/FileFolderEntity", "../util/PathMapping", "sap/watt/lib/lodash/lodash", "sap.watt.common.filesystem/document/ProjectDocument", "sap/watt/ideplatform/backend/util/MetadataManager"], function (oFileDao, oProjectDao, oMtaDao, TransferDao, FileFolderEntity, mPathMapping, _, ProjectDocument, oMetadataManager) {
    "use strict";
    var DAO = {

        _bWorkspaceCached: false,
        _oOnLoadRootProjectCached: {},

        /**
         * @memberOf sap.watt.uitools.chebackend.service.File
         */
        ERROR_FILE_ALREADY_EXISTS: "ERROR_FILE_ALREADY_EXISTS",
        ERROR_FOLDER_ALREADY_EXISTS: "ERROR_FOLDER_ALREADY_EXISTS",
        ERROR_PROJECT_ALREADY_EXISTS: "ERROR_PROJECT_ALREADY_EXISTS",
        ERROR_INVALID_FILE_NAME: "ERROR_INVALID_FILE_NAME",
        ERROR_INVALID_FOLDER_NAME: "ERROR_INVALID_FOLDER_NAME",
        ERROR_INVALID_FILE_OR_FOLDER_NAME: "ERROR_INVALID_FILE_OR_FOLDER_NAME",
        ERROR_NO_EXPORT_LOCATION: "ERROR_NO_EXPORT_LOCATION",
        ERROR_DEST_NOT_ALLOWED: "ERROR_DEST_NOT_ALLOWED",
        ERROR_FILE_ALREADY_MODIFIED: "ERROR_FILE_ALREADY_MODIFIED",
        _mWorkspace: mPathMapping.workspace,
        _oDao: oFileDao,
        _oProjectDao: oProjectDao,
        _oMtaDao: oMtaDao,
        _oTransfer: TransferDao,
        _ProjectDocument: ProjectDocument,
        _root: null,
        
        _oLastSearch: {
			"searchTermLocation": "",
			"result": null,
			"preFetchedFiles": {aFileEntries:[], numFound: 0, start: 0}
		},

        init: function () {
            this.ERROR_FILE_ALREADY_EXISTS = this.context.i18n.getText("i18n", "fileDAO_errorFileAlreadyExists");
            this.ERROR_FOLDER_ALREADY_EXISTS = this.context.i18n.getText("i18n", "fileDAO_errorFolderAlreadyExists");
            this.ERROR_PROJECT_ALREADY_EXISTS = this.context.i18n.getText("i18n", "fileDAO_errorProjectAlreadyExists");
            this.ERROR_INVALID_FILE_NAME = this.context.i18n.getText("i18n", "fileDAO_errorInvalidFileName");
            this.ERROR_INVALID_FOLDER_NAME = this.context.i18n.getText("i18n", "fileDAO_errorInvalidFolderName");
            this.ERROR_INVALID_FILE_OR_FOLDER_NAME = this.context.i18n.getText("i18n", "fileDAO_errorInvalidFileOrFolderName");
            this.ERROR_NO_EXPORT_LOCATION = this.context.i18n.getText("i18n", "fileDAO_errorNoExportLocation");
            this.ERROR_DEST_NOT_ALLOWED = this.context.i18n.getText("i18n", "fileDAO_errorDestinationNotAllowed");
            this.ERROR_FILE_ALREADY_MODIFIED = this.context.i18n.getText("i18n", "fileDAO_errorFileAlreadyModified");
            //nothing to do further
        },

        // Contains all valid project types. every project type should be added to this list to be considered as a project by watt
        _createEntity: function (sType, mEntityConfig) {
            return new FileFolderEntity(sType, mEntityConfig.sName, mEntityConfig.sPath);
        },

        getRoot: function () {
            if (!this._root) {
                var oBackendData = DAO._createEmptyMetadata();
                oBackendData.setLocationUrl(this._mWorkspace.location);
                oBackendData.setChildrenUrl(this._mWorkspace.childLocation + "/children/");
                oBackendData.setDeleteUrl("/workspace/" + this._mWorkspace.id);
                oBackendData.setTreeUrl("/project/" + this._mWorkspace.id + "/tree/?depth=1000&includeFiles=true");

                var oEntity = this._createEntity("folder", {
                    sName: "",
                    sPath: ""
                });

                oEntity.setBackendData(oBackendData);
                this._root = this.context.service.document.getDocument(oEntity);
            }
            return this._root;
        },

        createFile: function (oParentDocument, sName) {
            sName = sName.trim();
            if (!this._checkFileFolderNameAllowed(sName)) {
                // expected error for not allowed file names
                return Q.reject(new Error(this.ERROR_INVALID_FILE_NAME));
            }

            var sParentLocation = oParentDocument.getEntity().getBackendData().getLocationUrl();
            var that = this;
            var projectWorkspacePath = "/project/" + this._mWorkspace.id;

            return this._oDao.createFile(projectWorkspacePath + "/file/" + sParentLocation, sName).then(function (oResult) {
                return that._createFileFolderDocument(oParentDocument, oResult);
            }, function (oError) {
                if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError)) {
                    // expected error for already existing file names
                    throw new Error(that.ERROR_FILE_ALREADY_EXISTS);
                } else {
                    // unexpected error
                    throw new Error(oError.message);
                }
            });
        },

        convertToProject: function (oFolderDocument, oProjectData) {
            var that = this;
            oProjectData.type = oProjectData.type || "blank";

            return this.context.service.mtafoldertoprojectconvertor.validation.isConvertable(oFolderDocument).then(function (bConvertible) {
                if (bConvertible) {
                    return oMtaDao.convertFolderToModule(that._mWorkspace.id, oFolderDocument, oProjectData.type).then(function (oProjectMetadata) {
                        oFolderDocument.getEntity()._bProject = true;
                        oFolderDocument._oProjectMetadata = oProjectMetadata;
                        that._addProjectPrototypeFunctions(oFolderDocument);
                        return oFolderDocument;
                    }).fail(function (oError) {
                    	var message = oError.responseJSON ? oError.responseJSON.message : oError.message;
                    	message = "oError.status: " + oError.status + "; " + message;
                    	throw new Error(message);
                    });
                }

                throw new Error(that.context.i18n.getText("i18n", "fileDAO_cannotConvertToProject", [oFolderDocument.getEntity().getFullPath()]));
            });
        },

        _addProjectPrototypeFunctions: function (oDocument) {
            var aProjPrototypeKeys = Object.keys(this._ProjectDocument.prototype);
            for (var i = 0; i < aProjPrototypeKeys.length; i++) {
                var sProjKey = aProjPrototypeKeys[i];
                oDocument[sProjKey] = this._ProjectDocument.prototype[sProjKey];
            }
        },
		
		// help to synchronize parallel update project calls
		_oUpdateProjectPromise : Q(),
		
        updateProject: function (oProjectDocument, oProjectData) {
        	var that = this;
        	
        	this._oUpdateProjectPromise = this._oUpdateProjectPromise.then(function() {
        		var oUpdatedProjectData = _.cloneDeep(oProjectDocument._oProjectMetadata);
	        	if (oProjectData.mixins && oProjectData.mixins.length > 0) {
	        		// preserve only uniq types
	        		oUpdatedProjectData.mixins = _.uniq(oUpdatedProjectData.mixins.concat(oProjectData.mixins));
	        		delete oProjectData.mixins;
	        	} 
	        	
	        	oUpdatedProjectData = $.extend(true, oUpdatedProjectData, oProjectData);
	
	            return oProjectDao.updateProject(that._mWorkspace.id, oProjectDocument.getEntity().getFullPath(), oUpdatedProjectData).then(function (oUpdatedProjectMetadata) {
	                oProjectDocument._oProjectMetadata = oUpdatedProjectMetadata;
	                return oUpdatedProjectMetadata;
	            });
        	});
        	
        	return this._oUpdateProjectPromise;
        },

        _createNestedProject: function (oParentDocument, oProjectData) {
            var that = this;
            return that.createFolder(oParentDocument, oProjectData.name).then(function (oModuleFolder) {
                return that.convertToProject(oModuleFolder, oProjectData).fail(function (oError) {
                    return oModuleFolder.delete().then(function () {
                        return Q.reject(oError);
                    });
                });
            });
        },

        createProject: function (oParentDocument, oProjectData) {
            oProjectData.name = oProjectData.name.trim();
            if (!this._checkFileFolderNameAllowed(oProjectData.name)) {
                // expected error for not allowed project names
                return Q.reject(new Error(this.ERROR_INVALID_FOLDER_NAME));
            }
            var that = this;
            var projectWorkspacePath = "/project/" + this._mWorkspace.id;

            oProjectData.type = oProjectData.type || "blank";
            oProjectData.attributes = oProjectData.attributes || {};
            oProjectData.mixinTypes = oProjectData.additionalTypes || [];
            oProjectData.generatorDescription = oProjectData.generatorDescription || {};
            oProjectData.generatorDescription.options = oProjectData.generatorDescription.options || {};

            if (!oParentDocument.getEntity().isRoot()) {
                return this._createNestedProject(oParentDocument, oProjectData);
            }

            return this._oProjectDao.createProject(projectWorkspacePath, oProjectData).then(function (oProjectMetadata) {
                if (oProjectMetadata === null) {
                    throw new Error(that.context.i18n.getText("i18n", "fileDAO_cannotCreateProject", [oProjectData.name, oProjectData.type]));
                }

                return that._oDao.fetchChildren(projectWorkspacePath + "/tree" + oProjectMetadata.path).then(function (oCheResult) {
                    return that._createFileFolderDocument(oParentDocument, oCheResult).then(function (oProjectDocument) {
                        oProjectDocument._oProjectMetadata = oProjectMetadata;
                        return oProjectDocument;
                    });
                });
            }, function (oError) {
                if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError, true)) {
                    // expected error for already existing project names
                    throw new Error(that.ERROR_PROJECT_ALREADY_EXISTS);
                } else {
                    // unexpected error
                	var message = oError.responseJSON ? oError.responseJSON.message : oError.message;
                	message = "oError.status: " + oError.status + "; " + message;
                	throw new Error(message);
                }
            });
        },

        createFolder: function (oParentFolderDocument, sFolderName) {
            sFolderName = sFolderName.trim();
            if (!this._checkFileFolderNameAllowed(sFolderName)) {
                // expected error for not allowed folder names
                return Q.reject(new Error(this.ERROR_INVALID_FOLDER_NAME));
            }

            var sTargetFolderLocation = oParentFolderDocument.getEntity().getBackendData().getLocationUrl();
            

            var bIsProject = oParentFolderDocument.getEntity().isRoot();

            var that = this;
            var projectWorkspacePath = "/project/" + that._mWorkspace.id;
            
            // create mta project in case folder is created on workspace root
            if (bIsProject) {
                return this.createProject(oParentFolderDocument, {'name': sFolderName, 'type': 'mta'});
            }

            return this._oDao.createFolder(projectWorkspacePath + "/folder/" + sTargetFolderLocation, sFolderName).then(function (oResult) {
                var sFolderLocation = oResult.path;
                return that._oDao.readFileMetadata(projectWorkspacePath + "/tree" + sFolderLocation).then(function (oFolderResult) {
                    var bContainsNode = oFolderResult["node"] !== null; // Che returns results of tree REST call in "node" property for projects with type "blank"
                    var oCheResult = bContainsNode ? oFolderResult["node"] : oFolderResult;
                    return that._createFileFolderDocument(oParentFolderDocument, oCheResult);
                });
            }, function (oError) {
                if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError, bIsProject)) {
                    // expected error for already existing folder names
                    throw new Error(that.ERROR_FOLDER_ALREADY_EXISTS);
                } else {
                    // unexpected error
                	var message = oError.responseJSON ? oError.responseJSON.message : oError.message;
                	message = "oError.status: " + oError.status + "; " + message;
                	throw new Error(message);
                }
            });

        },

        copyObject: function (oSourceDocument, oTargetFolderDocument, sTargetName, bOverwrite) {
            var that = this;
            var oSourceFolderEntity = oSourceDocument.getEntity();
            var sSourceName = oSourceFolderEntity.getName();
            var sSourceFileLocation = oSourceFolderEntity.getBackendData().getCopyUrl();
            var sTargetFolder = oTargetFolderDocument.getEntity().getBackendData().getLocationUrl(); //TODO: refactor after using folder links

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

            return this._oDao.copy(sSourceFileLocation, sTargetFolder, sTargetName, bOverwrite).then(function () {
                var sPath = sTargetFolder + "/" + sTargetName;
                var sRootFolderLocation = that._mWorkspace.childLocation;
                //TODO REMOTE: do that better
                var sFileLocation = "";
                if (sPath.lastIndexOf("/") > 0) { //TODO: ugly hack
                    sFileLocation = that._correctLocation(sRootFolderLocation) + "/item" + sPath;
                } else {
                    sFileLocation = that._correctLocation(sRootFolderLocation) + sPath;
                }

                return that._oDao.readFileMetadata(sFileLocation).then(function (oResult) {
                    return that._createFileFolderDocument(oTargetFolderDocument, oResult);
                });
            }, function (oError) {
                if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError)) {
                    // expected error for already existing folder names
                    throw new Error(that.ERROR_FOLDER_ALREADY_EXISTS);
                }
                // unexpected error
                throw new Error(oError.message);
            });
        },

        onLogIn: function () {
            var that = this;
            var sProjectsLocation = this._mWorkspace.childLocation;
            var aProjectPromises = [];

            this._oDao.fetchChildren(sProjectsLocation).then(function (aCheProjects) {
                var length = aCheProjects.length;
                for (var i = 0; i < length; i++) {
                    var oCheProject = aCheProjects[i];
                    aProjectPromises.push(that._oDao.fetchChildren(sProjectsLocation + oCheProject.path));
                }

                return Q.all(aProjectPromises).then(function (aProjects) {
                    var aPromises = [];
                    var pLength = aProjects.length;
                    for (var p = 0; p < pLength; p++) {
                        var oProject = aProjects[p];
                        aPromises.push(that._cacheProject(oProject));
                    }

                    return Q.all(aPromises).then(function() {
						that._bWorkspaceCached = true;
                    });
                });
            }).done();
        },

        _cacheProject: function (oProject) {
            var that = this;
            return this._fetchChildren(oProject.path, "/project/" + oProject.workspaceId + "/tree" + oProject.path + "?depth=1000&includeFiles=true", true, true).then(function () {
                that._oOnLoadRootProjectCached[oProject.path] = true;
            });
        },

        /** Loads the passed document by delegating to the file service
         * @param {object} oDocument
         * @returns {object} the content and the ETag
         */
        load: function (oDocument) {
            if (oDocument.getType() !== "file") {
                throw new Error(this.context.i18n.getText("i18n", "fileDAO_cannotLoadDocument", [oDocument.getType()]));
            }
            //TODO To be really secure we need to wait with fetching the content till the eTag has been fetched
            return Q.all([//
                this.readFileContent(oDocument), //
                this.readFileMetadata(oDocument)])//
                .spread(function (mContent, oMetadata) {
                    return {
                        mContent: mContent,
                        sETag: oMetadata.sETag
                    };
                });
        },
        /** Save the passed document
         * @param {object} oDocument
         * @returns {string} the new ETag
         */
        save: function (oDocument) {
            if (oDocument.getType() !== "file") {
                throw new Error(this.context.i18n.getText("i18n", "fileDAO_cannotLoadDocument", [oDocument.getType()]));
            }

            //TODO Handle create case?
            return this.writeFileContent(oDocument).then(function (oMetadata) {
                return oMetadata.sETag;
            });
        },
        deleteFile: function (oFileDocument) {
            return this._removeResource(oFileDocument);
        },
        deleteFolder: function (oFolderDocument) {
            return this._removeResource(oFolderDocument);
        },
        exportZip: function (oFolderDocument) { // TODO: fix export location to use method
            var that = this;
            return this._getExportLocation(oFolderDocument).then(
                function (sExportLocation) {
                    if (!sExportLocation) {
                        return Q.reject(new Error(that.ERROR_NO_EXPORT_LOCATION));
                    }
                    return that._oTransfer.exportFolder(sExportLocation).then(
                        function (oZipContent) {
                            var oZip = that._removeFromZip(oZipContent, [".git","mock_preview_sapui5.html",
                                "visual_ext_index.html", "sap-ui-cachebuster-info.json"]);
                            return oZip;
                        }, function (oError) {
                            // unexpected error
                            throw new Error(oError.message);
                        });
                });
        },

        _getCheRawNode: function (sPath) {
            if (this._isMetadataCached(sPath)) {
                return Q(oMetadataManager.getMetadata(sPath));
            }

            var sRootFolderLocation = this._mWorkspace.childLocation;
            //TODO REMOTE: do that better later (can the orion search be used to find a folder?)
            var sFolderLocation = "";
            if (sPath.lastIndexOf("/") > 0) { //TODO: ugly hack
                sFolderLocation = this._correctLocation(sRootFolderLocation) + "/item" + sPath;
            } else {
                sFolderLocation = this._correctLocation(sRootFolderLocation) + sPath;
            }

            return this._oDao.readFileMetadata(sFolderLocation).fail(function(oError) {
				if (oError.status === 404) {
					return Q(null);
				}
				// unexpected error
				throw new Error(oError.message);
            });
        },

        getDocument: function (sPath, sDAO, sVersion) {
            var that = this;
            //No versions supported
            if (sVersion) {
                return null;
            }

            if (sPath === "" || sPath === "/undefined") {
                return this.getRoot();
            }
            if (!this._checkPathNameAllowed(sPath)) {
                // expected error for not allowed path names
                return Q.reject(new Error(this.context.i18n.getText("i18n", "fileDAO_errorInvalidPathName", [sPath])));
            }

            return this._getCheRawNode(sPath).then(function (oResult) {
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
            });
        },

        handleGetDocError: function (oError, sPath, sDAO, sVersion) {
            var sRootFolderLocation = this._mWorkspace.location;
            //TODO REMOTE: do that better later (can the orion search be used to find a folder?)
            var sFolderLocation = this._correctLocation(sRootFolderLocation) + sPath;
            var that = this;
            return this._oDao.readFileMetadata(sFolderLocation).then(function (oResult) {
                var iIndex = sPath.lastIndexOf("/");
                if (iIndex === sPath.length - 1) {
                    sPath = sPath.substring(0, iIndex);
                    iIndex = sPath.lastIndexOf("/");
                }
                sPath = sPath.substring(0, iIndex);
                return that._createFileFolderDocument("/file" + sPath, oResult);
            }, function (oError) {
                if (oError.status == "404") {
                    return null;
                } else {
                    // unexpected error
                    throw new Error(oError.message);
                }
            });
        },
        
        getVersions: function (oDocument, sDAO) {
            return [];
        },
        
        getVersion: function (oDocument, sVersion, sDAO) {
            return null;
        },
        
        search: function (oInputObject) {
        	var nStart = oInputObject.nStart;
			var nRows = oInputObject.nRows;
            var sSearchTerm = "?";
            var bContentSearch = oInputObject.bContentSearch;
            var sFileType = oInputObject.sFileType;
            if (bContentSearch) {
                var str = oInputObject.sSearchTerm;
                str = str.replace(/[.*+!?^${}()|[/"\]\\]/g, "\\$&");
                sSearchTerm += "text=" + "/.*" + encodeURIComponent(str) + ".*/";
                if (sFileType !== "*") {
                    sSearchTerm += "&name=" + sFileType;
                }
            } else {
                sSearchTerm += "name=" + "*" + oInputObject.sSearchTerm + sFileType;
            }
            var that = this;
            var sFolderName = oInputObject.sFolderName || "";
            if (!_.startsWith(sFolderName, "/")) {
                sFolderName = "/" + sFolderName;
            }
            var sSearchLocation = "/project/" + this._mWorkspace.id + "/search" + sFolderName;
            var sSearchTermLocation = sSearchLocation + sSearchTerm;
            sSearchTerm += "&maxItems=300";
         	if (that._oLastSearch.searchTermLocation === sSearchTermLocation && nStart > 0) {
				return that._handleSearchResult(that._oLastSearch.result, nStart, nRows);
			} else {
				that._oLastSearch.searchTermLocation = sSearchTermLocation;
				return this._oDao.search(sSearchLocation, sSearchTerm).then(
					function(oResult) {
						that._oLastSearch.result = oResult;
						return that._handleSearchResult(oResult, nStart, nRows);
					}, function(oError) {
						var message = oError.responseJSON ? oError.responseJSON.message : oError.message;
                    	message = "oError.status: " + oError.status + "; " + message;
                    	throw new Error(message);
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
			var oFileEntries = {aFileEntries:[], numFound: oResult.length > 300 ? 300 : oResult.length , start: 0 /*oResult.response.skipCount*/};
			var nServerFetchStart = nStart === 0 ? 0 : (nStart + that._oLastSearch.preFetchedFiles.aFileEntries.length);
			var nServerFetchLeft = oResult.length - nServerFetchStart;
			var nServerFetchRows = nStart === 0 ? nRows * 2 : nRows;
			var nServerFetchStop = nServerFetchStart + (nServerFetchLeft < nServerFetchRows ? nServerFetchLeft : nServerFetchRows);
			if (nStart === 0) {
				that._oLastSearch.preFetchedFiles = {aFileEntries:[], numFound: 0, start: 0};
			}

			//Get list of file url's to be retrieved from server
			for (var iInt = nServerFetchStart; iInt < nServerFetchStop; iInt++) {
				var sParentPath = oResult[iInt].path.substring(0, oResult[iInt].path.lastIndexOf("/"));
				var oFileDocument = this._createFileFolderDocument(sParentPath, oResult[iInt]);
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
				_prefetchFiles.call(that, aAsyncFileEntries, oResult.length);
				return Q.all(oFileEntries.aFileEntries).then(function (results) {
					oFileEntries.aFileEntries = results;
					return Q(oFileEntries);
				});
			}
		},

        _getChildrenLocation: function (oEntity, bRecursive) {
            bRecursive = (bRecursive === true);
            var sChildrenLocation;

            if (oEntity.isRoot() && bRecursive) {
                throw new Error(this.context.i18n.getText("i18n", "fileDAO_cannotGetRootChildrenRecursive"));
            } else if (oEntity.isRoot() && !bRecursive) {
                sChildrenLocation = oEntity.getBackendData().getTreeUrl().replace("depth=1000", "depth=1");
            } else if (bRecursive && !oEntity.isRoot()) {
                sChildrenLocation = oEntity.getBackendData().getTreeUrl();
            } else if (!bRecursive && !oEntity.isRoot()) {
                sChildrenLocation = oEntity.getBackendData().getChildrenUrl();
            }

            return sChildrenLocation;
        },

       getCurrentMetadata: function (oFolderDocument, bRecursive, bForce, oFilterOptions) {
        	var that = this;
            var oEntity = oFolderDocument.getEntity();
            var sChildrenLocation = this._getChildrenLocation(oEntity, bRecursive);
            
            return this._fetchChildren(oEntity.getFullPath(), sChildrenLocation, bRecursive, bForce).then(function (oResult) {
                var aRawData = [];
                var aKeys = _.keys(oResult);

                var length = aKeys.length;
                for (var i = 0; i < length; i++) {
                    var sKey = aKeys[i];
                    var oNode = oResult[sKey].node || oResult[sKey];
                    aRawData.push({
                        "name": oNode.name,
                        "path": oNode.path,
                        "changedOn": oNode.modified,
                        "folder": oNode.type === "folder" || oNode.type === "project",
                        "parentPath": sKey.substr(0, sKey.lastIndexOf("/") || 0)
                    });
                }

				return that.context.service.filefilter.filterMetadata(aRawData, oFilterOptions);
            });
        },

        _getFolderContent: function (oFolderDocument, bForce) {
            bForce = (bForce === true);
            var that = this;
            var oEntity = oFolderDocument.getEntity();

            var sChildrenLocation = this._getChildrenLocation(oEntity, false);
            return this._fetchChildren(oEntity.getFullPath(), sChildrenLocation, false, bForce).then(function (oResult) {
                return Q.all(that._mapCheChildren2DocumentPromisesArray(oResult));
            });
        },

        getFolderContent: function (oFolderDocument, bForce) {
            return this._getFolderContent(oFolderDocument, bForce);
        },

        _fetchChildren: function (sFolderPath, sChildLocation, bRecursive, bForce) {
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
        
        _fetchAndSaveRawBackendNodes: function (sFolderPath, sChildrenLocation, bRecursive) {
            var that = this;

            return this._oDao.fetchChildren(sChildrenLocation).then(function (aRawNodeTree) {
                // get parent raw data
                var oParentRawData = aRawNodeTree;
                if (Array.isArray(aRawNodeTree)) {
                    oParentRawData = oMetadataManager.getMetadata(sFolderPath);
                }
                // delete folder old children
                if (that._isMetadataCached(sFolderPath) && bRecursive) {
                    oMetadataManager.deleteMetadata(sFolderPath, true);
                }

                // save parent raw data
                var oFolderMetadata = {};
                oFolderMetadata[sFolderPath] = oParentRawData;
                oMetadataManager.setMetadata(oFolderMetadata);

                var oRawNodes = that._saveRawBackendNodes(aRawNodeTree.children || aRawNodeTree, bRecursive);
                oMetadataManager.setMetadata(oRawNodes);

                return oRawNodes;
            });
        },

        _saveRawBackendNodes: function (aRawChildrenNodes, bRecursive) {
            var that = this;
            var aRawNodes = {};
            var length = aRawChildrenNodes.length;
            for (var i = 0; i < length; i++) {
                var oRawNode = aRawChildrenNodes[i];

                var sNodePath;
                var sNodeType;
                if (oRawNode.node) {
                    sNodePath = oRawNode.node.path;
                    sNodeType = oRawNode.node.type;
                } else {
                    sNodePath = oRawNode.path;
                    sNodeType = oRawNode.type;
                }

                aRawNodes[sNodePath] = oRawNode;

                if ((sNodeType === "folder" || sNodeType === "project") && bRecursive) {
                    aRawNodes = $.extend(aRawNodes, that._saveRawBackendNodes((oRawNode.children || []), bRecursive));
                }
            }

            return aRawNodes;
        },

        //oFile might be a Blob also. In this case, sFileName needs to be provided
        importFile: function (oParentFolderDocument, oFile, bUnzip, bForce, sFileName) {
            var that = this;
            var oEntity = oParentFolderDocument.getEntity();
            var oBackendData = oEntity.getBackendData();
            var sImportLocation = oBackendData.getUploadUrl();
            //TODO REMOTE: find a better way to detect whether a file is a zip file
            if (bUnzip && oFile.type && oFile.type.search("zip") !== -1) {
                return this.importZip(oParentFolderDocument, oFile, bForce);
            }

            return this._oTransfer.importFile(sImportLocation, oFile, sFileName).then(function () {
                var sImportedFileName = sFileName || oFile.name;
                return that._oDao.readFileMetadata(oBackendData.getMetadataUrl() + "/" + sImportedFileName).then(function (oOrionRawNode) {
                    return that._createFileFolderDocument(oEntity.getFullPath(), oOrionRawNode);
                });
            }, function (oError) {
                throw new Error(that.context.i18n.getText("i18n", "fileDAO_cannotImportFile"));
            });
        },

        // content can be a File object or a Blob object
        importZip: function (oParentFolderDocument, oContent, bForce) {
            var that = this;
            var sImportLocation = oParentFolderDocument.getEntity().getBackendData().getImportUrl();
            return this._oTransfer.importZip(sImportLocation, oContent, bForce).then(function() {
            	//TODO REMOTE: do that better
            	var sRootFolderLocation = that._mWorkspace.childLocation;
                var sPath = oParentFolderDocument.getEntity().getFullPath();            
                var sFileLocation = that._correctLocation(sRootFolderLocation) + "/item" + sPath;
                
            	return that._oDao.readFileMetadata(sFileLocation).then(function(oParentCheRawNode) {
                    return that._createFileFolderDocument(oParentFolderDocument.getEntity().getParentPath(), oParentCheRawNode);
                });
            }, function (oError) {
            	throw new Error(that.context.i18n.getText("i18n", "fileDAO_cannotImportFile"));
            });
        },

        objectExists: function (oParentFolderDocument, sRelativePath) {
            //return Q(true);
            //TODO avoid calculating uri if possible
            if (oParentFolderDocument === null) {
                return Q(false);
            }

            var oUri = new URI(sRelativePath);
            if (oUri.directory() !== "") {
                if (!this._checkPathNameAllowed("/" + sRelativePath)) {
                    // expected error for not allowed path names
                    return Q.reject(new Error(this.context.i18n.getText("i18n", "fileDAO_errorInvalidPathName", [sRelativePath])));
                }
            } else {
                if (!this._checkFileFolderNameAllowed(sRelativePath)) {
                    // expected error for not allowed file or folder names
                    return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
                }
            }

            var oParentDocumentEntity = oParentFolderDocument.getEntity();
            var sParentDocumentPath = oParentDocumentEntity.getFullPath();
            if (this._isMetadataCached(sParentDocumentPath)) {
                var aRawNodes = oMetadataManager.getMetadata(sParentDocumentPath, true);
                var aNodePathes = _.keys(aRawNodes);
                var index = _.findIndex(aNodePathes, function (sNodePath) {
                    return (sNodePath.indexOf(sRelativePath) !== -1);
                });

                return (index === -1 ? Q(false) : Q(true));
            }

            var sParentLocation = this._correctLocation(oParentDocumentEntity.getBackendData().getLocationUrl());
            var sObjectLocation = sParentLocation + "/" + sRelativePath;
            var that = this;

            var projectWorkspacePath = "/project/" + that._mWorkspace.id;
            if (sParentLocation !== "") {
                projectWorkspacePath = projectWorkspacePath + "/item";
            }

            return this._oDao.readFileMetadata(projectWorkspacePath + sObjectLocation).then(function () {
                return Q(true);
            }, function (oError) {
                if (oError.status === 404) {
                    return Q(false);
                } else {
                    // unexpected error
                	var message = oError.responseJSON ? oError.responseJSON.message : oError.message;
                	message = "oError.status: " + oError.status + "; " + message;
                	throw new Error(message);
                }
            });
        },

        moveObject: function (oSourceFileDocument, oTargetParentFolderDocument, sTargetName, bOverwrite) {
            var that = this;
            sTargetName = sTargetName.trim();
            if (!this._checkFileFolderNameAllowed(sTargetName)) {
                // expected error for not allowed file / folder names
                return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
            }

            var oTargetFolderEntity = oTargetParentFolderDocument.getEntity();
            var sTargetFolderPath = oTargetFolderEntity.getFullPath();
            var oSourceFolderEntity = oSourceFileDocument.getEntity();
            var sTargetFolderLocation = oTargetFolderEntity.getBackendData().location;

            return that._oDao.move(oSourceFolderEntity.getBackendData().getMoveUrl(), sTargetFolderLocation, sTargetName, bOverwrite).then(function () {
                oMetadataManager.deleteMetadata(oSourceFolderEntity.getFullPath(), true);
                var sPath = sTargetFolderPath + "/" + sTargetName;
                var sRootFolderLocation = that._mWorkspace.childLocation;
                //TODO REMOTE: do that better
                var sFileLocation = "";
                if (sPath.lastIndexOf("/") > 0) { //TODO: ugly hack
                    sFileLocation = that._correctLocation(sRootFolderLocation) + "/item" + sPath;
                } else {
                    sFileLocation = that._correctLocation(sRootFolderLocation) + sPath;
                }

                return that._oDao.readFileMetadata(sFileLocation).then(function (oResult) {
                    return that._createFileFolderDocument(sTargetFolderPath, oResult);
                });
            });
        },

        readFileContent: function (oDocument) {
            var oEntity = oDocument.getEntity();
            var sDocumentPath = oEntity.getFullPath();
            var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
            if (this._isMetadataCached(sDocumentPath) && !oRawNode) {
                return Q(undefined);
            }
            var sLocation = oEntity.getBackendData().getContentUrl();
            var that = this;
            return oDocument.isBinary().then(function (bResult) {
                return that._oDao.readFileContent(sLocation, bResult);
            });
        },

        readFileMetadata: function (oDocument) {
            var that = this;
            var oEntity = oDocument.getEntity();
            var sDocumentPath = oEntity.getFullPath();
            var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
            if (this._isMetadataCached(sDocumentPath) && !oRawNode) {
                return Q(undefined);
            }
            var sLocation = oEntity.getBackendData().getMetadataUrl();
            return this._oDao.readFileMetadata(sLocation).then(function (oCheResult) {
                return that._createFileFolderDocument(oEntity.getParentPath(), oCheResult).then(function () {
                    return oCheResult;
                });
            });
        },

        writeFileContent: function (oDocument) {
            var that = this;
            var sLocation = oDocument.getEntity().getBackendData().getUpdateUrl();
            return Q.all([oDocument.getContent(), oDocument.isBinary()]).spread(function (mContent, bBinary) {
                if (bBinary) {
                    //TODO Enable this
                    throw new Error(this.context.i18n.getText("i18n", "fileDAO_cannotWriteBinaryContent"));
                }

                return that._oDao.write(sLocation, mContent, oDocument.getETag(), bBinary).then(function (oCheResult) {
                    //TODO Clarify who is responsible for updating metadata?
                    if (jQuery.type(oCheResult) === "string" && oCheResult.length > 0) {
                        oCheResult = JSON.parse(oCheResult);
                    }

                    //TODO Update backend data in entity?
                    var sDocumentPath = oDocument.getEntity().getFullPath();
                    var oRawNode = oMetadataManager.getMetadata(sDocumentPath);
                    //TODO: oResult returns only LocalTimeStamp - it is a bug
                    if (oRawNode.node) {
                        oRawNode.node.modified = oCheResult.LocalTimeStamp;
                    } else {
                        oRawNode.modified = oCheResult.LocalTimeStamp;
                    }

                    //Update metadata
                    var mMetaddata = oDocument.getDocumentMetadata();
                    mMetaddata = jQuery.extend({}, mMetaddata, {
                        changedOn: oCheResult.LocalTimeStamp
                    });
                    oDocument.setDocumentMetadata(mMetaddata);

                    return {
                        sETag: oCheResult.ETag,
                        mMetadata: mMetaddata
                    };
                });
            }).fail(function (oError) {
                if (oError.status === 409) {
                    throw new Error(that.ERROR_FILE_ALREADY_MODIFIED);
                }
                // unexpected error
                throw new Error(oError.message);
            });
        },

        getProjectTypes: function () {
            return this._oProjectDao.getProjectTypes().then(function (aProjectTypes) {
                var aProjectTypesRes = _.map(aProjectTypes, function (oProjectType) {
                    //adujst the return value with the right params
                    return {
                        "id": oProjectType.id,
                        "name": oProjectType.displayName,
                        "primaryable": oProjectType.primaryable,
                        "mixable": oProjectType.mixable,
                        "attributeDescriptors": oProjectType.attributeDescriptors,
                        "runnerCategories": oProjectType.runnerCategories
                    };
                });
                return aProjectTypesRes;
            });
        },
        // private helper functions
        _correctLocation: function (sLocation) {
            //for root location replace very first occurence if it is "/workspace/" with "/file/"
            var iPosition = sLocation.indexOf("/workspace/");
            if (sLocation == this._mWorkspace.location && iPosition > -1) {
                // in cloud it is /s2s/workspace, locally it is /workspace/ therefore we need to replace the right part
                return sLocation.substring(0, iPosition) + "/file/" + sLocation.substring(iPosition + "/workspace/".length);
            } else {
                return sLocation;
            }
        },
        _checkFileFolderCreationError_FileFolderAlreadyExists: function (oError, bIsProject) {
            if (oError && oError.status === 409) {
                return true;
            } else {
                return false;
            }
        },
        _checkFileFolderNameAllowed: function (sName) {
            //Corresponds to allowed characters for UI5 Repositories
            //Last character must not be a "."
            var rAllowedFileFolderNames = /^[a-zA-Z0-9\.\-_@\+\~]*[a-zA-Z0-9\-_@\+\~]+$/;
            var aMatch = rAllowedFileFolderNames.exec(sName); //regex returns null in case of no match
            return !!aMatch;
        },
        _checkPathNameAllowed: function (sPath) {
            //Corresponds to allowed characters for paths
            //which is starting with / then allowed characters for file/folder names as above
            var rAllowedFileFolderNames = /^(\/[a-zA-Z0-9\.\-_@\+\~]*[a-zA-Z0-9\-_@\+\~]+)*$/;
            var aMatch = rAllowedFileFolderNames.exec(sPath); //regex returns null in case of no match
            return !!aMatch;
        },
        _calcGitUrl: function (oDocument, oProjectMetadata, sLocationUrl) {
            var isGitProject = _.find(oProjectMetadata.mixins,
                function (currentitem) {
                    return currentitem === "git";
                }
            );
            if (isGitProject === "git") {
                return {
                    workspaceID: this._mWorkspace.id,
                    projectPath: sLocationUrl
                };

            } else {
                return null;
            }


        },

        /**
         * Creates a new document for a file or folder
         * @param oParentFolderDocument Either the parent document or a parent path
         * @param oCheResult
         * @returns
         */
        _createFileFolderDocument: function (sParentFolderPath, oCheResult) {
            var that = this;
            var oTheCheResult = oCheResult.hasOwnProperty("node") ? oCheResult.node : oCheResult;
            var oMetadata = this._createMetadataFromCheResult(sParentFolderPath, oCheResult);
            var oEntity = oMetadata.entity;
            var oRawMetadataValue = {};
            var sDocumentFullPath = oEntity.getFullPath();
            oRawMetadataValue[sDocumentFullPath] = oTheCheResult;
            oMetadataManager.setMetadata(oRawMetadataValue);


            return this._isProject(oMetadata.entity, oTheCheResult).then(function(bIsProject) {
	            // updates document metadata _bProject property
	    		oMetadata.entity._bProject = bIsProject;
	    		//set metadata for file and folder documents
	            return that.context.service.document.getDocument(oMetadata.entity, false).then(function(oDocument) {
	                // recalculate hasChildren property of the document
	                if (that._isMetadataCached(sDocumentFullPath)) {
						oMetadata.metadata.hasChildren = oMetadataManager.hasChildren(sDocumentFullPath);
					} 
	                // gets old metadata
					var oOldMetadata = oDocument.getDocumentMetadata();
					// update new metadata
					var oNewMetadata = $.extend({}, oOldMetadata, oMetadata.metadata);
					oDocument.setDocumentMetadata(oNewMetadata);
	
	                if (oMetadata.entity._bProject === true) {
	                    var parentPath = oEntity.getParentPath();
	                    var promise = [];
	                    promise.push(oProjectDao.getProjectMetadata(that._mWorkspace.id, oTheCheResult.path));
	                    if ( parentPath !== "") {
	                        promise.push(oProjectDao.getProjectMetadata(that._mWorkspace.id, parentPath));
	                    }
	
	                    return Q.spread(promise,function (oChildProjectMetadata, oParentProjectMetadata) {
	                        var oProjectMetadataForGit = oChildProjectMetadata;
	                        var pathForGit = oTheCheResult.path;
	                        if ( oParentProjectMetadata ){
	                            oProjectMetadataForGit = oParentProjectMetadata;
	                            pathForGit = parentPath;
	                        }
	                        var oGit = that._calcGitUrl(oDocument, oProjectMetadataForGit, pathForGit);
	                        if (oGit !== null) {
	                            oDocument.getEntity().getBackendData().setGitUrl(oGit);
	                        }
	                        oDocument._oProjectMetadata = oChildProjectMetadata;
	                        return oDocument;
	                    });
	                }
	
	                return oDocument.getProject(true).then(function (oProjectDocument) {
	                    var oProjMetadata = oProjectDocument.getProjectMetadata();
	                    if ( oProjMetadata !== undefined){
	                        var oGit = that._calcGitUrl(oDocument, oProjMetadata, oDocument.getEntity().getBackendData().getLocationUrl());
	                        if (oGit !== null) {
	                            oDocument.getEntity().getBackendData().setGitUrl(oGit);
	                        }
	                        oProjectDocument._oProjectMetadata = oProjMetadata;
	                    }
	                    return oDocument;
	                });
            	});
	    	});
        },
        
        _isProject : function(oEntity, oTheCheResult) {
            if (oTheCheResult.type === "project") {
            	var sDocumentPath = oEntity.getFullPath();
            	var sRootProjectPath = sDocumentPath;
            	var indexOfSlash = sDocumentPath.indexOf("/", 1);
            	if (indexOfSlash !== -1) {
            		sRootProjectPath = sRootProjectPath.substr(0, indexOfSlash);
            	} else { //the document is at root level -> i.e. it is an MTA project
            		return Q(true);
            	}
	           //check if the document is a module
	        	return this.context.service.chebackend.Mta.getProjectModules(sRootProjectPath).then (function(oModules){
					for (var i = 0; i < oModules.length; i++) {	
						if(oModules[i].path === sDocumentPath) {
							return true;
						}
					}
					return false;
	        	});
            }
        
            return Q(false);
        },
        
        _createMetadataFromCheResult: function (oParentFolderDocument, oCheResult) {
            var oEntity;
            var oBackendData;
            var oMetadata;

            // helper function
            function createURL(sRel, oCheResult) {
                var result = oCheResult;
                if (oCheResult !== "") {
                    if (oCheResult.node) {
                        oCheResult = oCheResult.node;
                    }
                    var link = _.find(oCheResult.links, function (item) {
                        return item["rel"] === sRel;
                    });
                    if (link) {
                        var href = link.href;
                        var url = new URL(href);
                        result = url.pathname;
                    }
                }
                return result;
            }

            function createFullPath(sRel, oCheResult) {
                var result = oCheResult;
                if (oCheResult !== "") {
                    var link = _.find(oCheResult.links, function (item) {
                        return item["rel"] === sRel;
                    });
                    if (link) {
                        return link.href;
                    }
                }
                return result;
            }

            var oCheMetadata = _.find(oCheResult,
                function (currentitem) {
                    return currentitem.name && currentitem.name == ".codenvy";
                });
            if (!oCheMetadata) {
                oCheMetadata = oCheResult;
            }

            //var gitMD = _.find(oCheResult,
            //    function (currentitem) {
            //        return currentitem.name && currentitem.name == ".git";
            //    });

            var projectWorkspacePath = "/project/" + this._mWorkspace.id;

            var resourceType;
            var resourceName;
            var sLocation;
            var sLinks;
            if (oCheMetadata) {
                if (oCheMetadata.type) {
                    resourceType = oCheMetadata.type;
                } else if (oCheMetadata.node) {
                    resourceType = oCheMetadata.node.type;
                }

                if (oCheMetadata.name) {
                    resourceName = oCheMetadata.name;
                } else if (oCheMetadata.node) {
                    resourceName = oCheMetadata.node.name;
                }

                if (oCheMetadata.path) {
                    sLocation = URI(oCheMetadata.path).path();
                } else if (oCheMetadata.node) {
                    sLocation = URI(oCheMetadata.node.path).path();
                }

                if (oCheMetadata.links) {
                    sLinks = oCheMetadata.links;
                } else if (oCheMetadata.node) {
                    sLinks = oCheMetadata.node.links;
                }
            }

            if (oCheMetadata && (resourceType !== "file")) {

                var sProjectLocation = undefined;

                // project location should be filled for root folders
                // as this location is needed when deleting a root folder
                // TODO REMOTE in some cases (e.g. when a new root folder is created)
                //      the project location is not returned from the orion response -
                //      clarify what needs to be done then


                var gitMD = _.find(oCheResult,
                    function (currentitem) {
                        return currentitem.name && currentitem.name == ".git";
                    });

                var zipBallURLFull = createFullPath("zipball sources", oCheResult);
                var childrenURLFull = createFullPath("children", oCheResult);
                var treeURLFull = createFullPath("tree", oCheResult) + "?depth=1000&includeFiles=true";

                var modulesURLFull = createFullPath("modules", oCheResult);
                var deleteURLFull = createFullPath("delete", oCheResult);

                //Fallback to HATEAOS not working due to reverse proxy (specifically, approuter)
                zipBallURLFull = projectWorkspacePath + "/export" + sLocation;
                childrenURLFull = projectWorkspacePath + "/children" + sLocation;
                treeURLFull = projectWorkspacePath + "/tree" + sLocation + "?depth=1000&includeFiles=true";
                modulesURLFull = projectWorkspacePath + "/modules" + sLocation;
                deleteURLFull = projectWorkspacePath + sLocation;

                oBackendData = DAO._createEmptyMetadata();
                oBackendData.setLocationUrl(sLocation);
                //oBackendData.setGitUrl(gitMD && gitMD.path);
                oBackendData.setExportUrl(zipBallURLFull);
                oBackendData.setChildrenUrl(childrenURLFull);
                oBackendData.setTreeUrl(treeURLFull);
                oBackendData.setModulesUrl(modulesURLFull);
                oBackendData.setDeleteUrl(deleteURLFull);
                oBackendData.setProjectUrl(projectWorkspacePath + sLocation);
                oBackendData.setMetadataUrl(projectWorkspacePath + "/item" + sLocation);
                oBackendData.setImportUrl("/mta/" + this._mWorkspace.id + "/import" + sLocation);
                oBackendData.setUploadUrl(projectWorkspacePath + "/uploadfile" + sLocation);
                oBackendData.setCopyUrl(projectWorkspacePath + "/copy" + sLocation);
                oBackendData.setMoveUrl(projectWorkspacePath + "/move" + sLocation);
                oBackendData.setRenameUrl(projectWorkspacePath + "/rename" + sLocation);
                oBackendData.setBuildUrl(null);

                // set metata for hasChildren
                // this cannot be determined for folder an Root/Project level

                oMetadata = {
                    hasChildren: true
                };

                oEntity = this._createEntity("folder", {
                    sName: resourceName,
                    sPath: oParentFolderDocument
                });

            } else {
                // this var will hold the full che URL for getting file content
                var getURLFull = createFullPath("get content", oCheResult);
                // this var will hold the full che URL for updating file content
                var updateURLFull = createFullPath("update content", oCheResult);
                // this var will hold the full che URL for deleting a file
                var deleteURLFull = createFullPath("delete", oCheResult);

                //Fallback to HATEAOS not working due to reverse proxy (specifically, approuter)
                getURLFull = projectWorkspacePath + "/file" + sLocation;
                updateURLFull = projectWorkspacePath + "/file" + sLocation;
                deleteURLFull = projectWorkspacePath + sLocation;

                oBackendData = DAO._createEmptyMetadata();
                oBackendData.setLocationUrl(sLocation);
                // oBackendData.setGitUrl(null);
                oBackendData.setContentUrl(getURLFull);
                oBackendData.setUpdateUrl(updateURLFull);
                oBackendData.setDeleteUrl(deleteURLFull);
                oBackendData.setMetadataUrl(projectWorkspacePath + "/item" + sLocation);
                oBackendData.setCopyUrl(projectWorkspacePath + "/copy" + sLocation);
                oBackendData.setMoveUrl(projectWorkspacePath + "/move" + sLocation);
                oBackendData.setRenameUrl(projectWorkspacePath + "/rename" + sLocation);

                oMetadata = {
                	length: oCheMetadata.contentLength,
                    changedOn: oCheMetadata.modified
                };

                oEntity = this._createEntity("file", {
                    sName: resourceName,
                    sPath: oParentFolderDocument
                });
            }
            oEntity.setBackendData(oBackendData);

            return {
                entity: oEntity,
                metadata: oMetadata
            };
        },
        /**
         * This method will construct an empty Metadata for an Entity property used inside Document
         * object which get returned from this service.
         * Best practice of use can be seen in implementation of createMetadataFromCheResult method
         * @returns {Function} an object with the appropriate getters/setters
         */
        _createEmptyMetadata: function () {
            var workspaceId = this._mWorkspace.id;

            return (function () {
                var links = {
                    exportUrl: "",
                    childrenUrl: "",
                    treeUrl: "",
                    modulesUrl: "",
                    deleteUrl: "",
                    projectUrl: "",
                    importUrl: "",
                    buildUrl: "", // TODO: after fetch rebase from Eyal's code init this field
                    getContentUrl: "",
                    metadataUrl: "",
                    updateContentUrl: "",
                    copyUrl: "",
                    moveUrl: "",
                    renameUrl: "",
                    uploadUrl: ""
                };
                return {
                    // workaround to prevent code breaking, some services outside this plugin tend to use location and git directly
                    // since they are not aware of this getters/setters structure
                    location: "",
                    git: "",
                    // getters
                    getExportUrl: function () {
                        var result = links["exportUrl"];
                        return result;
                    },
                    getMetadataUrl: function () {
                        var result = links["metadataUrl"];
                        return result;
                    },
                    getChildrenUrl: function () {
                        var result = links["childrenUrl"];
                        return result;
                    },
                    getTreeUrl: function () {
                        var result = links["treeUrl"];
                        return result;
                    },
                    getModulesUrl: function () {
                        var result = links["modulesUrl"];
                        return result;
                    },
                    getDeleteUrl: function () {
                        var result = links["deleteUrl"];
                        return result;
                    },
                    getProjectUrl: function () {
                        var result = links["projectUrl"];
                        return result;
                    },
                    getImportUrl: function () {
                        var result = links["importUrl"];
                        return result;
                    },
                    getBuildUrl: function () {
                        var result = links["buildUrl"];
                        return result;
                    },
                    getGitUrl: function () {
                        var result = this.git;
                        return result;
                    },
                    getLocationUrl: function () {
                        var result = this.location;
                        return result;
                    },
                    getContentUrl: function () {
                        var result = links["getContentUrl"];
                        return result;
                    },
                    getUpdateUrl: function () {
                        var result = links["updateContentUrl"];
                        return result;
                    },
                    getCopyUrl: function () {
                        var result = links["copyUrl"];
                        return result;
                    },
                    getMoveUrl: function () {
                        var result = links["moveUrl"];
                        return result;
                    },
                    getUploadUrl: function () {
                        var result = links["uploadUrl"];
                        return result;
                    },
                    getRenameUrl: function () {
                        var result = links["renameUrl"];
                        return result;
                    },
                    //setters
                    setExportUrl: function (sUrl) {
                        links["exportUrl"] = sUrl;
                    },
                    setMetadataUrl: function (sUrl) {
                        links["metadataUrl"] = sUrl;
                    },
                    setChildrenUrl: function (sUrl) {
                        links["childrenUrl"] = sUrl;
                    },
                    setTreeUrl: function (sUrl) {
                        links["treeUrl"] = sUrl;
                    },
                    setModulesUrl: function (sUrl) {
                        links["modulesUrl"] = sUrl;
                    },
                    setDeleteUrl: function (sUrl) {
                        links["deleteUrl"] = sUrl;
                    },
                    setProjectUrl: function (sUrl) {
                        links["projectUrl"] = sUrl;
                    },
                    setImportUrl: function (sUrl) {
                        links["importUrl"] = sUrl;
                    },
                    setBuildUrl: function (sUrl) {
                        links["buildUrl"] = sUrl;
                    },
                    setGitUrl: function (oGitMD) {
                        this.git = {
                            "sWorkspaceId": oGitMD.workspaceID,
                            "sProjectPath": oGitMD.projectPath
                        };
                    },
                    setLocationUrl: function (sUrl) {
                        this.location = sUrl;
                    },
                    setContentUrl: function (sUrl) {
                        links["getContentUrl"] = sUrl;
                    },
                    setUpdateUrl: function (sUrl) {
                        links["updateContentUrl"] = sUrl;
                    },
                    setCopyUrl: function (sUrl) {
                        links["copyUrl"] = sUrl;
                    },
                    setMoveUrl: function (sUrl) {
                        links["moveUrl"] = sUrl;
                    },
                    setRenameUrl: function (sUrl) {
                        links["renameUrl"] = sUrl;
                    },
                    setUploadUrl: function (sUrl) {
                        links["uploadUrl"] = sUrl;
                    }
                };
            })();
        },

        _getProjectLocation: function (aProjects, oChild) {
            var sProjectLocation = undefined;
            if (aProjects) {
                for (var iProj = 0; iProj < aProjects.length; iProj++) {
                    if (aProjects[iProj].Id === oChild.Id || aProjects[iProj].name === oChild.name) {
                        sProjectLocation = aProjects[iProj].path;
                        return sProjectLocation;
                    }
                }
            }
            return sProjectLocation;
        },

        _getLocation: function (oFolderDocument) {
            var sLocation = null;
            if (oFolderDocument.getEntity().getParentPath() === "") { // folder is root, i.e. project
                sLocation = oFolderDocument.getEntity().getBackendData().getProjectUrl();
                if (!sLocation) {
                    var that = this;
                    return this._oDao.fetchChildren(this._mWorkspace.childLocation).then(function (oResult) {
                        for (var iChildren = 0; iChildren < oResult.Children.length; iChildren++) {
                            if (oResult.Children[iChildren].name == oFolderDocument.getEntity().getName()) {
                                sLocation = that._getProjectLocation(oResult.Projects, oResult.Children[iChildren]);
                                return sLocation;
                            }
                        }
                    });
                }

                return Q(sLocation);
            }

            return Q(oFolderDocument.getEntity().getBackendData().getLocationUrl());
        },

        _getExportLocation: function (oFolderDocument) {
            if (!oFolderDocument.getEntity().getBackendData().getExportUrl()) {
                // fallback
                return this._oDao.readFileMetadata(oFolderDocument.getEntity().getBackendData().getLocationUrl()).then(function (oResult) {
                    return oResult.ExportLocation;
                });
            } else {
                return Q(oFolderDocument.getEntity().getBackendData().getExportUrl());
            }
        },

        _handleDocumentPromise: function (oDocumentPromise, oChild) {
            var that = this;
            var sType = oChild.type || oChild.node.type;
            var oTheChild = oChild.node ? oChild.node : oChild;

            if (sType === "project") {
                return oDocumentPromise.then(function (oFolderDocument) {
                    return oProjectDao.getProjectMetadata(that._mWorkspace.id, oTheChild.path).then(function (oProjectMetadata) {
                        oFolderDocument._oProjectMetadata = oProjectMetadata;
                        return oFolderDocument;
                    });
                });
            }

            return oDocumentPromise;
        },

        _getAllFolderNodes: function (sParentPath, aChildren) {
            var aFolderNodes = [];
            if (aChildren) {
                var length = aChildren.length;
                for (var i = 0; i < length; i++) {
                    var oChild = aChildren[i];
                    var sType = oChild.type || oChild.node.type;

                    if (sType === "folder" || sType === "project" || sType === "blank") {
                        oChild.sParentPath = sParentPath;
                        var index = oChild.node.path.indexOf(sParentPath);
                        var sPPath = oChild.node.path.substring(index, oChild.node.path.length);
                        aFolderNodes.push(oChild);
                        aFolderNodes = aFolderNodes.concat(this._getAllFolderNodes(sPPath, oChild.children));
                    }
                }
            }

            return aFolderNodes;
        },

        _mapCheChildren2DocumentPromisesArray: function (oNodes) {
            var aPromises = [];
            var aKeys = _.keys(oNodes);
            var that = this;
            var length = aKeys.length;
            for (var i = 0; i < length; i++) {
                var sKey = aKeys[i];
                var oChild = oNodes[sKey];

                var indexofLastSlash = sKey.lastIndexOf("/");
                var sRawNodeParentPath = sKey.substr(0, indexofLastSlash);

                aPromises.push(that._createFileFolderDocument(sRawNodeParentPath, oChild));
            }

            return aPromises;
        },

        _setFolderContentPromise: function (aParentDocumentPromises, oParentDocumentPromise, aChildrenDocumentPromises) {
            aParentDocumentPromises.push(oParentDocumentPromise.then(function (oParentDocument) {
                oParentDocument.setFolderContentPromise(aChildrenDocumentPromises);
                return oParentDocumentPromise;
            }));
        },

        _removeFromZip: function (oZipContent, aRemoveItems) {
            return Q.sap.require("sap/watt/lib/jszip/jszip-shim").then(function (JSZip) {
                var oZip = new JSZip();
                oZip.load(oZipContent);
                for (var iInt = 0; iInt < aRemoveItems.length; iInt++) {
                    oZip.remove(aRemoveItems[iInt]);
                }
                return oZip;
            });
        },

        _contains: function (oFiles, oExistingDocument, sParentFullPath) {
            for (var oFile in oFiles) {
                if ((sParentFullPath + "/" + oFile) === oExistingDocument.getEntity().getFullPath()) {
                    return true;
                }
            }
            return false;
        },
        _renameResource: function (oDocumentSource, oDocumentParent, newName) { // TODO: this should be exposed in API

            var that = this;

            if (!this._checkFileFolderNameAllowed(newName)) {
                // expected error for not allowed file / folder names
                return Q.reject(new Error(this.ERROR_INVALID_FILE_OR_FOLDER_NAME));
            }

            return this._oDao.renameResource(oDocumentSource.getEntity().getBackendData().getRenameUrl(), newName).then(function (oResult) {
                return that._createFileFolderDocument(oDocumentParent, oResult).then(function () {
                    return that.getDocument(oDocumentSource.getEntity().getParentPath() + "/" + newName).then(function (oResult) {
                        return oResult;
                    });
                });
            }, function (oError) {
                if (that._checkFileFolderCreationError_FileFolderAlreadyExists(oError)) {
                    // expected error for already existing folder names
                    throw new Error(that.ERROR_FOLDER_ALREADY_EXISTS);
                } else {
                    // unexpected error
                    throw new Error(oError.message);
                }
            });

        },
        /*
         * Common method to remove both files and folders
         */
        _removeResource: function (oDocument) {
            var oEntity = oDocument.getEntity();
            //TODO: update hasChildren property of parent's metadata
            var sUrl = oEntity.getBackendData().getDeleteUrl();
            return this._oDao.deleteFile(sUrl).then(function () {
                oMetadataManager.deleteMetadata(oEntity.getFullPath(), oEntity.isFolder());
            });
        }
    };
    return DAO;
});