define(["./FolderDocument", "sap/watt/lib/lodash/lodash"], function(FolderDocument, _) {
    
	"use strict";
	
    var ProjectDocument = FolderDocument.extend("sap.watt.common.plugin.filesystem.document.ProjectDocument",{
        constructor : function(oOwner, oDAO, mEntity, oEventEmitter) {
            FolderDocument.apply(this, arguments);
        }
    });

	ProjectDocument.prototype = jQuery.extend(ProjectDocument.prototype, {
        oAccessPromise: Q(),
		
        "delete" : function() {
        	var that = this;
    		return this.getProject(true).then(function(oRootProjectDocument) {
    			return FolderDocument.prototype["delete"].apply(that, arguments).then(function(oResult) {
        			if (oRootProjectDocument.getEntity().getFullPath() === that.getEntity().getFullPath()) {
        				return oResult;
        			}
        			// no need to refresh if root project is deleted
        			if (oRootProjectDocument.getEntity().getFullPath() === that.getEntity().getFullPath()) {
        				return oResult;
        			}
        			
        			// refreshes the root project in case a nested project is deleted
        			return oRootProjectDocument.refresh().then(function() {
        				return oResult;
        			});
        		}); 
        	});
    	},
      
		getProjectMetadata : function() {
            return _.cloneDeep(this._oProjectMetadata);
        },
        
        updateProject : function(oProjectMetadata) {
        	return this._oDAO.updateProject(this, oProjectMetadata);
        }
	});

    return ProjectDocument;
});