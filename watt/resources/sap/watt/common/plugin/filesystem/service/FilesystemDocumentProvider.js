define([ "../document/ProjectDocument","../document/FolderDocument", "../document/FileDocument", "../document/FileFolderEntity" ], 
	function(ProjectDocument, FolderDocument, FileDocument, FileFolderEntity) {
	
	"use strict";

    return {
		_oDAO : null,
		_workspaceRoot : null,
		_oFileFilterHandlerService : null,

		configure : function(mConfig) {
			var that = this;
			
			this._oDAO = {};
			mConfig.dao.forEach(function(mEntry){
				that._oDAO[mEntry.id] = mEntry.service;
				mEntry.service.attachEvent("externalChanged", that._onExternalChanged, that);
			});
			if (mConfig.fileFilterHandler){
				this._oFileFilterHandlerService = mConfig.fileFilterHandler.service;
			}
		},
		
		_onExternalChanged : function(oEvt) {
			var oProm;
			if (oEvt.params.oDocument) {
				oProm = oEvt.params.oDocument.refresh();
			} else {
				//TODO Currently we just fetch the workspace root
				//Maybe the DAO has its own filesystem structure which has to be refreshed
				oProm = this.getRoot().then(function(oRoot) {
					return oRoot.refresh();
				});
			}
			
			return Q.all([this.context.service.document.notifyExternalChange(oEvt.params.oDocument), oProm]);
		},
		
		/**
		 * @memberOf sap.watt.common.plugin.filesystem.service.FilesystemDocumentProvider
		 */
		createDocumentInternally : function(oEntity, oEventEmitter) {
			var oDAO = this._oDAO[oEntity.getDAO()];
			var oDocument;

			switch (oEntity.getType()) {
				case "file":
					oDocument =  new FileDocument(this, oDAO, oEntity, oEventEmitter);
					break;
				case "folder": 
					if (oEntity.isProject()) {
	                    oDocument = new ProjectDocument(this, oDAO, oEntity, oEventEmitter);
	                } else {
	                    oDocument =  new FolderDocument(this, oDAO, oEntity, oEventEmitter);
	                }
					break;
				default:
					throw new Error("Not supported entity type " + oEntity.getType());
			}
			if(this._oFileFilterHandlerService){
				this._oFileFilterHandlerService._prepareDocument(oDocument, oDAO).done();
			}
			return oDocument;
		},

		createExtDocumentInternally : function(oExtDocument, oEventEmitter) {
			var dType = oExtDocument.type;
			var dName = oExtDocument.name;
			var dPath = oExtDocument.path;
			var dContent = oExtDocument.content;
			var oEntity = new FileFolderEntity(dType, dName, dPath);
			var oFileDocument = new FileDocument(this, null, oEntity, oEventEmitter);
			//TODO: replace to setContent()
			oFileDocument._savedContent = dContent;
			return oFileDocument;
		},

		_workspaceRoots : {},
		
        getRoot : function(sDAO) {
            var that = this;
            var sWorkspaceDao = "workspace";
            sDAO = sDAO || sWorkspaceDao;

            if (this._workspaceRoots[sDAO]) {
                //to not adjust tests
                return Q(this._workspaceRoots[sDAO]);
            }

            if(sDAO === sWorkspaceDao) {
                return this.getDocument("")// get root from cache, if not in the cache -> get it from orion
                    .then(function (oRootDocument) {
                        that._workspaceRoots[sDAO] = oRootDocument;
                        return oRootDocument;
                    });
            }
            else {
                return this._oDAO[sDAO].getRoot(sDAO)
                    .then(function(oDocument) {
                        that._workspaceRoots[sDAO] = oDocument;
                        return oDocument;
                    });
            }
        },

		getDocumentByKeyString : function(sKeyString) {
			var oEntity = FileFolderEntity.fromKeyString(sKeyString);
			var sPath = oEntity.getFullPath();
			var sDAO = oEntity.getDAO();
			var sVersion = oEntity.getVersionId();
			return this.getDocument(sPath, sDAO, sVersion).then(function(oDocument){
				//Verify the type
				if (oDocument && oDocument.getType() === oEntity.getType()){
					return oDocument;
				}
				
				return null;
			});
		},
		
		getDocument : function(sPath, sDAO, sVersion) {
			sDAO = sDAO || "workspace";
			sVersion = sVersion || "";
			
			var that = this;
			var oDoc = that.context.service.document;

            //First try to find existing document, otherwise fetch it
            return Q.spread(
                [oDoc.getDocument(new FileFolderEntity("file", sPath, undefined, sDAO, sVersion), true), // due to the "true" flag, the entity is not cached
                    oDoc.getDocument(new FileFolderEntity("folder", sPath, undefined, sDAO, sVersion), true)], (function (oDocument1, oDocument2) {
                    return oDocument1 || oDocument2 || that._oDAO && that._oDAO[sDAO] && that._oDAO[sDAO].getDocument(sPath, sDAO, sVersion);
                }));
		},

		search : function(oInputObject, sDAO) {
			sDAO = sDAO || "workspace";
			return this._oDAO[sDAO].search(oInputObject, sDAO);
		},
        
        _getParentDocument : function(oFolderDocument, sDAO) {
        	if (oFolderDocument && oFolderDocument.getEntity().isFolder()) {
        		return Q(oFolderDocument);
        	}
        	
        	return this.getRoot(sDAO);
        },
        
        createProject : function(oProjectData, oFolderDocument, sDAO) {
			sDAO = sDAO || "workspace";
			return this._getParentDocument(oFolderDocument, sDAO).then(function(oParentDocument) {
				return oParentDocument.createProject(oProjectData);
			});
		}
	};
});