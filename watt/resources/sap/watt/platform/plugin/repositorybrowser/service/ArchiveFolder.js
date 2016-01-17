define({

	_maxFileSizeInBytesPromise : undefined, 
	
	configure : function() {
	    this._maxFileSizeInBytesPromise = this.context.service.system.getQuota();
	},
	
	_getMaxFileSizeBytes : function() {
		return this._maxFileSizeInBytesPromise.then(function(quota) {
	        if (quota && quota.defaultMaxEntitySize) {
                return quota.defaultMaxEntitySize; 
    	    }
	    });
	},
	
	createArchive : function(sProjectFolderPath) {
	    var that = this;
		return this.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath).then(function(oFolderDoc) {
			return Q.spread([that._getMaxFileSizeBytes(), oFolderDoc.exportZip(), oFolderDoc.getParent()], function(nMaxFileSizeInBytes, oBlob, oParentDoc) {
			    if (oBlob.size <= nMaxFileSizeInBytes || !nMaxFileSizeInBytes) {
			        var sDestinationZip = oFolderDoc.getEntity().getName() + ".zip";
    				return oParentDoc.importFile(oBlob, false, true, sDestinationZip).then(function(oFileDoc) {
    				    return oFileDoc;
    				});
			    }
			    
	            var oError = new Error();
	            oError.name = "QuotaExceeded";
	            throw oError;
			});			
    	});
	}
});