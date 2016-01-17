define({

	_getFileFromFolder : function(sFile, aFolderMetadataContent) {
		for (var i = 0; i < aFolderMetadataContent.length; i++) {
			var oMetadataElement = aFolderMetadataContent[i];
			if (oMetadataElement.name === sFile) {
				return this.context.service.filesystem.documentProvider.getDocument(oMetadataElement.path);
			}
		}
		
		return Q();
	},

	/**
	 * Event handler subscribed to the generated event of the generation service.
	 */
	onAfterGeneration : function(oEvent) {
		if (oEvent.params.selectedTemplate.getId() === "servicecatalog.connectivityComponent") {
			var that = this;
			var sBindingFileName = "serviceBinding.js";
			var sHtmlName = "index.html";
			var aParts = oEvent.params.model.componentPath.split("/");
			var sProjectFolderPath = "/" + aParts[1];
			return that.context.service.filesystem.documentProvider.getDocument(sProjectFolderPath).then(function(oPluginDocument) {
				return Q.spread([oPluginDocument.getCurrentMetadata(true), oEvent.params.targetDocument.getCurrentMetadata(true)], function(aPluginMetadataContent, aTargetMetadataContent) {
					return that._getFileFromFolder(sBindingFileName, aTargetMetadataContent).then(function(oBindingFile) {
						if (oEvent.params.model.needBindingFile) {
							return that._getFileFromFolder(sHtmlName, aPluginMetadataContent).then(function(htmlFile) {
								return Q.spread([oBindingFile.getParent(), htmlFile.getParent()], function(oBindingParent, oHtmlParent) {
									if (oBindingParent !== oHtmlParent) {
										return Q.spread([oBindingFile.getContent(), oHtmlParent.touch(sBindingFileName)], function(oBindingContent, oNewBindingFile) {
											return oNewBindingFile.setContent(oBindingContent).then(function() {
											    oNewBindingFile.save();
		     									return oBindingFile.delete();
											});
										});
									}
			    				});
							});
						} 
						
						return oBindingFile.delete();
					});
				});
			});
		}
	}
});