define({
	decorate: function(oDocument) {
		var that = this;
		return oDocument.getProject().then(function(oProjectDocument) {
			var sProjectPath = oProjectDocument.getEntity().getFullPath();
			return that.context.service.builder.isBuildSupported(oProjectDocument).then(function(bIsBuildSupported) {
				if (bIsBuildSupported) {
					return that.context.service.builder.getTargetFolder(oProjectDocument).then(function(oTargetFolder) {
						if (oTargetFolder) {
							var sTargetFolderPath = oTargetFolder.getEntity().getFullPath();
							var sDocumentPath = oDocument.getEntity().getFullPath();
							var sDocumentName = oDocument.getEntity().getName();
							//Flat projects --> only component preload is generated or documents/folders in generated target folder
							if (sTargetFolderPath === sProjectPath && sDocumentName === "Component-preload.js" ||
								sTargetFolderPath === sProjectPath && sDocumentName === "resources.json" ||
								sDocumentPath.indexOf(sTargetFolderPath) > -1 && sTargetFolderPath !== sProjectPath) {
								return {
									styleClass: ["sapUiTreeNodeGeneratedNode"]
								};
							}
						}
					});
				}
			});
		});
	},

	init: function() {
		//this.context.service.document.attachEvent("saved", this.onDocumentSaved, this);
	}

});