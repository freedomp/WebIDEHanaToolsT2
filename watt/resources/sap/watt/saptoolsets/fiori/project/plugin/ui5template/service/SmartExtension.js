define({

	onAfterGeneration : function(oEvent) {
		var that = this;
		if ((oEvent.params.selectedTemplate.getId() === "ui5template.objectpageextension" ||
			oEvent.params.selectedTemplate.getId() === "ui5template.listreportextension") && oEvent.params.model.sViewFile) {
			return this.context.service.filesystem.documentProvider.getDocument(oEvent.params.model.sViewFile).then(function(oViewFile){
				return that.context.service.repositorybrowser.setSelection(oViewFile, true);
			});
		}
	}
});