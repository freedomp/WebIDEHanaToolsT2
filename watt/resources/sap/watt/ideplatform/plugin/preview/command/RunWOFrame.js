define({

	execute : function(vValue, oWindow) {
		var selectionService = this.context.service.selection;
		var previewService = this.context.service.preview;

		return selectionService.assertNotEmpty().then(function(aSelection) {
			return previewService.showPreview(aSelection[0].document, oWindow, true);
		});
	},

	isAvailable : function() {
		return true;
	},

	isEnabled : function() {
		var previewService = this.context.service.preview;
		var selectionService = this.context.service.selection;
		return selectionService.assertNotEmpty().then(function(aSelection) {
			return previewService.isExecutable(aSelection[0]);
		});
	}
});
