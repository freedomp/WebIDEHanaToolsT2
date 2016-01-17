define({

	execute : function() {

		var that = this;

		return this.context.service.selection.assertNotEmpty().then(function(aSelection) {
		    
		    var oEntity = aSelection[0].document.getEntity();
			var sFullPath = oEntity.getFullPath();
			var sName = oEntity.getName();
			
            var oLogService = that.context.service.log;
            var oUsernotificationService = that.context.service.usernotification;
            var oI18nService = that.context.i18n;
            
			oLogService.info("Archive", oI18nService.getText("i18n", "archive_started", [sName]), [ "user" ]).done();
			
			return that.context.service.archiveFolder.createArchive(sFullPath)
    			.then(function(oFileDoc){
    				that.context.service.repositorybrowser.setSelection(oFileDoc, false).done();
    				oLogService.info("Archive", oI18nService.getText("i18n", "archive_completed_successfully_with_name", [sName]), [ "user" ]).done();
    				oUsernotificationService.liteInfo(oI18nService.getText("i18n", "archive_completed_successfully")).done();
    			}).fail(function(oError) {
    			    var sErrorMessage;
    			    if(oError.name === "QuotaExceeded"){
        			    sErrorMessage = oI18nService.getText("i18n", "quota_exceeded", [sName]);
    			    } else {
        			    sErrorMessage = oI18nService.getText("i18n", "archive_failed", [sName]);
    			    }
    				oLogService.error("Archive", sErrorMessage, [ "user" ]).done();
    				oUsernotificationService.alert(sErrorMessage).done();
    			});
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		if (sap.watt.getEnv("server_type") === "local_hcproxy") {
			return false;
		}
		return this._isValidPluginProject();
	},

	_isValidPluginProject : function() {
        var that = this;
		var selectionService = this.context.service.selection;

		return selectionService.assertOwner(this.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				var oSelectedDocumentEntity = aSelection[0].document.getEntity();
				if (aSelection.length === 1 && oSelectedDocumentEntity.isFolder() && oSelectedDocumentEntity.getFullPath() && oSelectedDocumentEntity.getParentPath()) {
			        var sFullPath = oSelectedDocumentEntity.getFullPath();
			        return that.context.service.filesystem.documentProvider.getDocument(sFullPath).then(function(folderDocument) {
			            return folderDocument.getCurrentMetadata().then(function(aMetadataContent) {
				            return (aMetadataContent.length > 0);
			            }); 
			        });
				} 
				
				return false;
			});
		});
	}
});