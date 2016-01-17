define({

    build: function (oProjectDocument) {
    	var that = this;
    	
        return this.context.service.buildRegistry.build(oProjectDocument, null).then(function() {
        	return that.context.service.filesystem.documentProvider.getDocument("/mta_archives").then(function(oMtaArchivesDocument) {
        		if (oMtaArchivesDocument) {
        			return oMtaArchivesDocument.refresh();
        		}
        		
        		return that.context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
            		return oRootDocument.refresh();
            	});
        	});
        });
    },

    getTargetFolder: function (oProjectDocument) {
        return null;
    },

    isBuildRequired: function (oProjectDocument) {
        return true;
    },

    setIsBuildRequired: function (oEvent, oProjectDocument) {
        return;
    },

    setLastBuildDateTime: function (oProjectDocument) {
        return;
    }


});