define([], function() {
	"use strict";
	return {

		execute : function() {
			var selectionService = this.context.service.selection;
			var that = this;
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return that.context.service.export.exportDocument(aSelection[0].document);
			});
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
			return this.context.service.repositorybrowserUtils.isSingleNoRootSelection();
		}
	};
});
