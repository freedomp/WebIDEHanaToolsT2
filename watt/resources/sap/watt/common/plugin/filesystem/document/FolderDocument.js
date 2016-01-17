define([ "./AbstractFileSystemDocument", "sap/watt/lib/lodash/lodash" ], function(AbstractFileSystemDocument, _) {
	"use strict";
	var FolderDocument = AbstractFileSystemDocument.extend("sap.watt.common.plugin.filesystem.document.FolderDocument");

	FolderDocument.prototype = jQuery.extend(FolderDocument.prototype, {
		// synchronizes folder refresh operation
		_oRefreshPromise : Q(),
		
		/**
		 * Creates a project
		 * param oProjectData
		 */
		createProject : function(oProjectData) {
			var that = this;
			// creates a new project in a backend and returns the project document
			return this._oDAO.createProject(this, oProjectData).then(function(oNewProjectDocument) {
				// 1. notifies listeners about the project and updates the parent document metadata
				// 2. get a root project of the project 
				return Q.spread([that._newDocumentHandler(oNewProjectDocument), oNewProjectDocument.getProject(true)], function(oNDHResult, oRootProjectDocument) {
					// refreshes the root project (in case te created project has new files they should be visible in the repository browser)
					return oRootProjectDocument.refresh().then(function() {
						return oNewProjectDocument;
					});
				});
			});
		},
		
		/**
		 * Converts a folder to a project
		 * param oProjectData
		 */ 
		convertToProject : function(oProjectData) {
			if (this.getEntity().isRoot()) {
				throw new Error("Root cannot be converted to a project");
			}
			
			if (this.getEntity().isProject()) {
				throw new Error("The folder is already a project");
			}
			// converts folder to a project in a backend
			return this._oDAO.convertToProject(this, oProjectData).then(function(oProjectDocument) {
				// get a root project of the project 
				return oProjectDocument.getProject(true).then(function(oRootProjectDocument) {
					// refreshes the root project (in case it has new files they should be visible in the repository browser)
					return oRootProjectDocument.refresh().then(function() {
						return oProjectDocument;
					});
				});
			});
		},
		
		/**
		 * Create a file
		 * param sFileName
		 */ 
		createFile : function(sFileName) {
			var that = this;
			// creates a new file in a backend and returns the file document
			return this._oDAO.createFile(this, sFileName).then(function(oNewDocument) {
				// notifies listeners about the new file and updates the file parent metadata
				return that._newDocumentHandler(oNewDocument);
			});
		},
		
		// notifies listeners about a new document and updates the parent document metadata
		_newDocumentHandler : function(oNewDocument) {
			var that = this;
			// notifies listeners about a new document
			return this._notifyAboutNewDocument(this, oNewDocument).then(function() {
				// updates the parent document metadata
				return that._updateMetaData().then(function() {
					return oNewDocument;
				});
			});
		},
        
        /**
         * Create a folder
         * param sFolderName
         */ 
		createFolder : function(sFolderName) {
			var that = this;
			// creates a new folder in a backend and returns the folder document
			return this._oDAO.createFolder(this, sFolderName).then(function(oNewDocument) {
				// notifies listeners about the new folder and updates the parent document metadata
				return that._newDocumentHandler(oNewDocument);
			});
		},
		
		/**
		 * ???
		 * param sName
		 */ 
		touch : function(sName) {
			var that = this;
			return this.getChild(sName).then(function(oDocument) {
				if (oDocument) {
					return oDocument;
				} 
				
				return that.createFile(sName);
			});
		},
		
		// notifies listeners about a deleted document and updates the parent document metadata
		_deleteDocumentHandler : function(oDeletedDocument) {
			var that = this;
			// notifies listeners about a deleted document
			return this._notifyAboutDeletion(this, oDeletedDocument).then(function() {
				// updates the parent document metadata
				return that._updateMetaData();
			});
		},
		
		/**
		 * Deletes a folder
		 */ 
		"delete" : function() {
			var that = this;
			// deletes a folder from a backend
			return this._oDAO.deleteFolder(this).then(function() {
				// get the folder parent
				return that.getParent().then(function(oParentDocument) {
					// notifies listeners about the deleted folder and updates the parent document metadata
					return oParentDocument._deleteDocumentHandler(that);
				});
			});
		},
		
		// creates a change object and notifies the provided document about the change
		_notifyAndUpdate : function(oDocumentToUpdate, aNewChildren, aDeletedChildren) {
			// creates change object 
		    var oChange = this._getChange(aNewChildren, aDeletedChildren);
		    // notify the provided document about the change
            return oDocumentToUpdate._notifyChange(oChange).then(function() {
            	return oDocumentToUpdate._updateMetaData();
            });
        },
		
		/**
		 * Exports a folder content asa zip file
		 */ 
		exportZip : function() {
			var that = this;
			return Q.spread([this._oDAO.exportZip(this), Q.sap.require("sap/watt/lib/jszip/jszip-shim")], function(oZip) {
				return that._oOwner.context.event.fireBeforeExportZip({
					zip : oZip,
					fullPath : that.getEntity().getFullPath()
				}, that).then(function() {
					return oZip.generate({
						type : "blob"
					});
				});
			});
		},

		/**
		* Returns a folder children metadata array
		* Each element of the array looks like this: {name : "file.txt", path : "/project/folder/file.txt", parentPath : "/project/folder", changedOn: 123456789, folder : false}
		* param bRecursive folder children metadata is read recursively
		* param _bForce folder children metadata is read from backend, only for internal usage
		*/ 
		getCurrentMetadata : function(bRecursive, oFilterOptions) {
			bRecursive = (bRecursive === true);
                  
          	if (this.getEntity().isRoot() && bRecursive) {
            	throw new Error("getCurrentMetadata is not supported for root folder and recursive mode");
            }
			// get a folder children metadata
			return this._oDAO.getCurrentMetadata(this, bRecursive, false, oFilterOptions).then(function(oResult) {
				return oResult || [];
			});
		},
		
		/**
		 * Retrieves a folder content as a document array
		 * param _bForce folder content is read from backend, only for internal usage
		 */ 
		getFolderContent : function() {
			// returns direct children documents
			return this._oDAO.getFolderContent(this, false);
		},
		
		/**
		 * Returns direct child document by name
		 * param sName child document name
		 */ 
		getChild : function(sName) {
			// get child document full path
			var sPath = this.getEntity().getFullPath() + "/" + sName;
			// get the child document
			return this._oDAO.getDocument(sPath);
		},
		
		// refreshes the root folder - deletes removed root projects, adds new root projects and refreshes each added project. It does not refreshes existing projects.
		_rootRefresh : function() {
			var that = this;
			// get direct cached project documents of the root 
			return this.getFolderContent().then(function(aExistingProjectDocuments) {
				// get direct project documents of the root from a backend
				// true - for force
				return that._oDAO.getFolderContent(that, true).then(function(aCurrentProjectDocuments) {
					// get added projects
					var aAddedProjects = $(aCurrentProjectDocuments).not(aExistingProjectDocuments).get();
					// get deleted projects
					var aDeletedProjects = $(aExistingProjectDocuments).not(aCurrentProjectDocuments).get();
					// notify listeners about projects change
					return that._notifyAndUpdate(that, aAddedProjects, aDeletedProjects).then(function() {
						var aPromises = [];
						for (var i = 0; i < aAddedProjects.length; i++) {
							var oAddedProject = aAddedProjects[i];
							// refreshes each added project to make its children cached and visible in a repository browser
							aPromises.push(oAddedProject.refresh());
						}
						
						return Q.all(aPromises);
					});
				});
			});
		},
		
		/**
		 * Refreshes a folder
		 */ 
		refresh : function() {
			var that = this;
			// synchronization promise for a folder. It does not allow to refresh the folder in parallel. 
			this._oRefreshPromise = this._oRefreshPromise.then(function() {
		       if (that.getEntity().isRoot()) {
		       		// refreshes the root folder
					return that._rootRefresh();
				}
				// refreshes a folder
				return that._refresh();
		    });
		    
		    return this._oRefreshPromise;
		},
		
		// refreshes a folder
		_refresh : function() {
			var that = this;
			// get folder existing documents and old metadata
			return Q.spread([this._oOwner.context.service.document.getContainedDocuments(this), this.getCurrentMetadata(true)], function(aExistingDocuments, aOldMetadata) {
				// get new metadata
				return that._oDAO.getCurrentMetadata(that, true, true).then(function(aCurrentMetadata) {
					// get deleted metadata nodes
					var aDeletedMetadata = that._metadataDifference(aOldMetadata, aCurrentMetadata);
					// find deleted documents which parents should be notified
					var aDeletedDocuments = that._getDeletedDocuments(aExistingDocuments, aDeletedMetadata);
					// find documents to refresh 
					var aRemainedDocuments = $(aExistingDocuments).not(aDeletedDocuments).get();
					return Q.all([that._notifyDeletedDocuments(aDeletedMetadata, aDeletedDocuments, aExistingDocuments), // notify existing parent documents about deleted children
								  that._notifyAddedDocuments(aOldMetadata, aCurrentMetadata, aExistingDocuments), // notify existing parent documents about added children
								  that._refreshExistingFileDocuments(aRemainedDocuments)]); // refresh existing file documents
				});
			});	
		},
		
		// refreshes file documents - reloads each file documen content if it is exist
		_refreshExistingFileDocuments : function(aDocumentsToRefresh) {
			var aPromises = [];
			
			for (var i = 0; i < aDocumentsToRefresh.length; i++) {
				var oDocumentToRefresh = aDocumentsToRefresh[i];
				// refresh only if a document is a file and its content already retrieved
				if (oDocumentToRefresh.getEntity().isFile() && oDocumentToRefresh._savedContent && !oDocumentToRefresh.isDirty()) {
					aPromises.push(oDocumentToRefresh.refresh());
				}
			}
			
			return Q.all(aPromises);
		},
		
		_notifyAddedDocuments : function(aOldMetadata, aCurrentMetadata, aExistingDocuments) {
			var that = this;
			// get added metadata nodes
			var aAddedMetadata = this._metadataDifference(aCurrentMetadata, aOldMetadata);
			var aAddedDocumentPromises = [];
			// notify parent documents about added children
			for (var i = 0; i < aAddedMetadata.length; i++) {
				var oAddedMetadata = aAddedMetadata[i];
				var oParentDocument = that._getDocumentParent(oAddedMetadata.parentPath, aExistingDocuments);
				this._notifyAddedDocument(oAddedMetadata, oParentDocument, aAddedDocumentPromises);
			}
			
			return Q.all(aAddedDocumentPromises);
		},
		
		_notifyAddedDocument : function(oAddedMetadata, oParentDocument, aAddedDocumentPromises) {
			if (oParentDocument) {
				aAddedDocumentPromises.push(this._oDAO.getDocument(oAddedMetadata.path).then(function(oAddedDocument) {
					return oParentDocument._newDocumentHandler(oAddedDocument);
				}));
			}
		},
		
		_getDeletedDocuments : function(aExistingDocuments, aDeletedMetadata) {
			var objectMap = {};
			for (var i = 0; i < aExistingDocuments.length; i++) {
				var oExistingDocument = aExistingDocuments[i];
				objectMap[oExistingDocument.getEntity().getFullPath()] = oExistingDocument;
			}
			
			for (var j = 0; j < aDeletedMetadata.length; j++) {
				var oDeleteRawNode = aDeletedMetadata[j];
				delete objectMap[oDeleteRawNode.path];
			}
			
			var aDeletedDocuments = $(aExistingDocuments).not(_.values(objectMap)).get();
			return aDeletedDocuments;
		},
		
		_getDocumentParent : function(sParentPath, aExistingDocuments) {
			var objectMap = {};
			objectMap[this.getEntity().getFullPath()] = this;
			
			for (var i = 0; i < aExistingDocuments.length; i++) {
				var oExistingDocument = aExistingDocuments[i];
				objectMap[oExistingDocument.getEntity().getFullPath()] = oExistingDocument;
			}
			
			var oParentDocument = objectMap[sParentPath];
			
			return oParentDocument;
		},
		
		_notifyDeletedDocuments : function(aDeletedMetadata, aDeletedDocuments, aExistingDocuments) {
			var aDeletedDocumentPromises = [];
			// notify parent documents about deleted children
			for (var i = 0; i < aDeletedDocuments.length; i++) {
				var oDeletedDocument = aDeletedDocuments[i];
				var oParentDocument = this._getDocumentParent(oDeletedDocument.getEntity().getParentPath(), aExistingDocuments);
				this._notifyDeletedDocument(oDeletedDocument, oParentDocument, aDeletedDocumentPromises);
			}
			
			return Q.all(aDeletedDocumentPromises);
		},
		
		_notifyDeletedDocument : function(oDeletedDocument, oParentDocument, aDeletedDocumentPromises) {
			if (oParentDocument) {
				aDeletedDocumentPromises.push(oParentDocument._deleteDocumentHandler(oDeletedDocument));
			} else {
				aDeletedDocumentPromises.push(oDeletedDocument.getParent().then(function(oParentDoc) {
					if (oParentDoc) {
						return oParentDoc._deleteDocumentHandler(oDeletedDocument);
					}
				}));
			}
		},
		
		_metadataDifference : function(aMetadata1, aMetadata2) {
			var mapObject = {};
			for (var i = 0; i < aMetadata1.length; i++) {
				var oMetadata1 = aMetadata1[i];
				mapObject[oMetadata1.path] = oMetadata1;
			}
			
			for (var j = 0; j < aMetadata2.length; j++) {
				var oMetadata2 = aMetadata2[j];
				delete mapObject[oMetadata2.path];
			}
			
			return _.values(mapObject);
		},
		
		/**
		 * Import a file to a workspace
		 * oFile might be a Blob also. In this case, sFileName needs to be provided 
		 */ 
		importFile : function(oFile, bUnzip, bForce, sFileName) {
			var that = this;
			// gets cached metadata before import
			return this.getCurrentMetadata().then(function(aExistingMetadata) {
				// imports a file to a backend
				return that._oDAO.importFile(that, oFile, bUnzip, bForce, sFileName).then(function(oImportedFileDocument) {
					// imported file name
					var sImportedFileName = (sFileName || oFile.name);
					for (var i = 0; i < aExistingMetadata.length; i++) { 
						if (aExistingMetadata[i].name === sImportedFileName) {
							// refresh an existing file to get new content
							return oImportedFileDocument.refresh().then(function() { 
								// return the imported file
								return oImportedFileDocument; 
							});
						}
					}
					// notifies listeners about the new folder and updates the parent document metadata
					return that._newDocumentHandler(oImportedFileDocument);
				});
			});
		},

		/**
		 * Importsa zip file to a workspace
		 * Content can be a File object or a Blob object
		 */ 
		importZip : function(oContent, bForce) {
			var that = this;
			// imports a zip file to a backend
			return this._oDAO.importZip(this, oContent, bForce).then(function() {
				return that.refresh();
			});
		},
		
		/**
		 * Returns true if an object exists
		 * param sRelativePath
		 */ 
		objectExists : function(sRelativePath) {
			return this._oDAO.objectExists(this, sRelativePath);
		},

		/**
		 * Creates a map describing the changes of the folder:
		 * 'aNewContent' an array of newly added objects
		 * 'aDeletedContent' an array of deleted objects
		 *
		 * To apply these changes to the environment (e.g the repository tree) use @see _notifyChange.
		 *
		 * @return {map} A change object
		 */
		_getChange : function(oNewChild, oDeletedChild) {
			return {
				aNewContent : (oNewChild instanceof Array) ? oNewChild : oNewChild ? [ oNewChild ] : [],
				aDeletedContent : (oDeletedChild instanceof Array) ? oDeletedChild : oDeletedChild ? [ oDeletedChild ] : []
			};
		},

		/**
		 * Notifies the environment about added and deleted children
		 * change object (see this._getChange)
		 *
		 * @param {map} oChange A map of arrays that lists the added and deleted children
		 * @return {Function} A promise
		 */
		_notifyChange : function(oChange) {
			var _queue = new Q.sap.Queue();

			for (var n = 0; n < oChange.aNewContent.length; n++) {
				this._notifyNew(_queue, oChange.aNewContent[n]);
			}
			
			for (var d = 0; d < oChange.aDeletedContent.length; d++) {
				this._notifyDeleted(_queue, oChange.aDeletedContent[d]);
			}

			return _queue._oPromise;
		},
		
		_notifyNew : function(oQueue, oNewContent) {
			var that = this;
			oQueue.next(function() {
				return that._notifyAboutNewDocument(that, oNewContent);
			});
		},
		
		_notifyDeleted : function(oQueue, oDeletedContent) {
			var that = this;
			oQueue.next(function() {
				return that._notifyAboutDeletion(that, oDeletedContent);
			});
		},

		/**
		 * Checks the content of the actual folder and adapts the meta data accordingly
		 */
		_updateMetaData : function() {
			var that = this;
			
			return this.getFolderContent().then(function(aFolderDocuments) {
				var oMeta = that.getDocumentMetadata();
				var bHasChildren = (aFolderDocuments && aFolderDocuments.length > 0);
				if (oMeta.hasChildren !== bHasChildren) {
					oMeta.hasChildren = bHasChildren;
					that.setDocumentMetadata(oMeta);
					return that._oEventEmitter.fireChanged({
						document : that,
						changeType : "children"
					}).then(function() {
						return aFolderDocuments;
					});
				} 
				
				return aFolderDocuments;
			});
		}
	});

	return FolderDocument;
});