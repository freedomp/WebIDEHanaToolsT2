define([ "sap.watt.common.document/Document" ], function(Document) {
	"use strict";
	var AbstractFileSystemDocument = Document.extend("sap.watt.common.plugin.filesystem.document.AbstractFileSystemDocument");

	AbstractFileSystemDocument.prototype = jQuery.extend(AbstractFileSystemDocument.prototype, {

		getParent : function() {
			return this._oOwner.getDocument(this.getEntity().getParentPath(), this.getEntity().getDAO());
		},

		/** Whether the document is deleted or not.
		 * @return {boolean} the exists state
		 */
		exists : function(){
			var that = this;
			return this.getParent().then(function(oFolder) {
				if (!oFolder) {
					//folder deleted => document within doesn't exist
					return false;
				}
				
				return oFolder.objectExists(that.getTitle());
			});
		},
		
		copy : function(oTargetFolderDocument, sTargetName, bForce) {
			var that = this;
			return this._oDAO.getDocument(oTargetFolderDocument.getEntity().getFullPath() + "/" + sTargetName).then(function(oTargetDocument) {
				return that._oDAO.copyObject(that, oTargetFolderDocument, sTargetName, bForce).then(function(oNewDocument) {
					if (oTargetDocument) {
						return oTargetDocument.refresh().then(function() {
							return oTargetDocument;
						});
					}
					
					return oTargetFolderDocument._newDocumentHandler(oNewDocument).then(function() {
						return oNewDocument.refresh().then(function() {
							return oNewDocument;
						});
					});
				});
			});
		},

		move : function(oTargetParentFolderDocument, sTargetName) {
			var that = this;
		
			return this._oDAO.moveObject(this, oTargetParentFolderDocument, sTargetName).then(function(oRenamedDocument) {
				return that._notifyAboutMove(oRenamedDocument).then(function() {
					return that.getParent().then(function(oParentDocument) {
						return oParentDocument._deleteDocumentHandler(that).then(function() {
							return oTargetParentFolderDocument._newDocumentHandler(oRenamedDocument).then(function() {
								if (that.getEntity().isProject()) {
									return oTargetParentFolderDocument.getProject(true).then(function(oRootProjectDocument) {
										return oRootProjectDocument.refresh().then(function() {
											return oRenamedDocument;
										});
									});
								}
								
								return oRenamedDocument.refresh().then(function() {
									return oRenamedDocument;
								});
							});	
						});
					});
				});
			});
		},

        // TODO: deprecate this
		isProject : function() {
			return this.getEntity().isProject();
		},

        // provided a document "down the tree" of a project, the function will return the project
		getProject : function(bRootProject) {
			bRootProject = (bRootProject === true);
			
			if (this.getEntity().isRoot()) {
				return Q(this);
			}
		
			if (!this.getEntity().isProject()) {
				return this.getParent().then(function(oParent) {
					if (!oParent) {
						return null;
					}
					return oParent.getProject(bRootProject);
				});
			} 
			// if it is a project but parent is not root and bRootProject === true ---> continue
			if (bRootProject && this.getEntity().isProject() && this.getEntity().getParentPath() !== "") {
				return this.getParent().then(function(oParent) {
					return oParent.getProject(bRootProject);
				});
			}
			
			return Q(this);
		},
		
		getVersions : function(sDAO){
			var oDAO = sDAO ? this._oOwner._oDAO[sDAO] : this._oDAO;
			sDAO = sDAO || this.getEntity().getDAO();

			return oDAO.getVersions(this, sDAO);
		},
		
		getVersion : function(sVersion, sDAO){
			var oDAO = sDAO ? this._oOwner._oDAO[sDAO] : this._oDAO;
			sDAO = sDAO || this.getEntity().getDAO();

			return oDAO.getVersion(this, sVersion, sDAO);
		},		
		
		_moveInternally : function(oDocument, sSourcePath, sTargetPath) {
			return this._oDAO._moveInternally(oDocument, sSourcePath, sTargetPath).then(function(oDoc) {
				return oDoc;
			});
		}
	});

	return AbstractFileSystemDocument;
});