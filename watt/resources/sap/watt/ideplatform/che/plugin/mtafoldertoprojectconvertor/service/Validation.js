define([],function() {
	
	"use strict";
	
	return {
		
		isParentMTAProject : function(oDocument) {	
			return oDocument.getParent().then(function(oParentDocument) {
				return oParentDocument.getProject().then(function(oProject) {				
					return oProject.getProjectMetadata ? (oProject.getProjectMetadata().type === "mta") : false;
				});
			});
		},
		
		isFolder : function(oDocument) {		
			return oDocument.getEntity().isFolder();
		},
		
		isCodenvyFolder : function(oObject) {	
			var bIsFolder, sName;
			if (oObject.getEntity) { // if oObject is a document
				bIsFolder = this.isFolder(oObject);
				sName = oObject.getEntity().getName();
			} else {
				bIsFolder = oObject.folder;
				sName = oObject.name;
			}	
			return (bIsFolder && ((sName === ".di") || (sName === ".codenvy") || (sName === ".che")));
		},
		
		isRoot : function(oDocument) {
			return oDocument.getEntity().isRoot();
		},
		
		isCheProject : function(oDocument, oModules) {
			var that = this;
			var bIsFolder, sPath;
			if (oDocument.getEntity) {
				bIsFolder = this.isFolder(oDocument);
				sPath = oDocument.getEntity().getFullPath();
			} else {
				bIsFolder = oDocument.folder;
				sPath = oDocument.path;
			}
			if (bIsFolder) {					
					var bIsCheModule = false;
					for (var j = 0; j < oModules.length; j++) {
						if(oModules[j].path === sPath) {
							bIsCheModule = true;
							break;
						}
					}

					return bIsCheModule;
			} else {
				return false;
			}
		},
		
		isParentOfProject : function(oDocument, oModules) {
			var that = this;
			if (this.isFolder(oDocument)) {
				return oDocument.getCurrentMetadata(true).then(function(oAllChildren) {
					if (oAllChildren.length > 0) {
						var bIsParentOfProject = false;
						for (var i = 0; i < oAllChildren.length; i++) {
							if (that.isCheProject(oAllChildren[i], oModules)) { 
								bIsParentOfProject = true;
								break;
							}
						}
						return bIsParentOfProject;
			    	} else {
			    		return false;
			    	}
				});
			} else {
				return Q(false);
			}
		},
		
		isFolderInSubProject : function(oDocument, oModules) {
		
			var that = this;
			if (this.isRoot(oDocument) || !this.isFolder(oDocument)) {
				return Q(false);
			} else {
				return oDocument.getParent().then(function(oParent) {					
					if (that.isCheProject(oParent, oModules)) {
						return oParent.getParent().then(function(oGrandParent) {
							return !that.isRoot(oGrandParent);
						});
					} else {
						return that.isFolderInSubProject(oParent, oModules);
					}
					
				});
			}
		},
		
		getModulesOfMTAParent : function(oDocument) {
			var that = this;
			return oDocument.getProject(true).then(function(oProject) {	
				return that.context.service.chebackend.Mta.getProjectModules(oProject.getEntity().getFullPath());
			});
		},

		isConvertable : function(oDocument) {
			var that = this;
			if ( this.isRoot(oDocument) || !this.isFolder(oDocument) || this.isCodenvyFolder(oDocument) ) {
				return Q(false);
			} else {
				return that.isParentMTAProject(oDocument).then(function(bIsParentMTAProject) {
					if (!bIsParentMTAProject) {
						return false;
					} else {
						return that.getModulesOfMTAParent(oDocument).then (function(oResult){
								if (that.isCheProject(oDocument, oResult)) {
									return false;
								} else {
									return that.isFolderInSubProject(oDocument, oResult).then(function(bIsFolderInSubProject) {
										if (bIsFolderInSubProject) {
											return false;
										} else {
											return that.isParentOfProject(oDocument, oResult).then(function(bIsParentOfProject) {
												return !bIsParentOfProject;
											});
										}
									});
								}
						});
					}
				});
			}
		}
	};
});