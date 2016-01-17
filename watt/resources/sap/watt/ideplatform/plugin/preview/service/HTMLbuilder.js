define({
	build : function(oOrigFileDocument, sScript, sNewFileName) {
		var that = this;
		
		return this.context.service.filesystem.documentProvider.getDocument(oOrigFileDocument.getEntity().getParentPath()).then(function(oFolderDocument) {
			return oOrigFileDocument.getContent().then(function(sOriginalHtml) {
				var iHeadEndTagPos = sOriginalHtml.search("(| )*</(| )*head(| )*>");
				var sNewHtmlContent = sOriginalHtml.substr(0, iHeadEndTagPos) + sScript + sOriginalHtml.substr(iHeadEndTagPos);
				return oFolderDocument.importFile(new Blob([ sNewHtmlContent ]), false, true, sNewFileName).then(function(oNewFileDoc) {
					return that.context.service.preview.getPreviewUrl(oNewFileDoc).then(function(oUri) {
						return oUri.toString();
					});
				});
			});
		});
	}
});
