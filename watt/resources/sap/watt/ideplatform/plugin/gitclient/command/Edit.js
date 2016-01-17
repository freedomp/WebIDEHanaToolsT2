define(function() {
	"use strict";
	return {
		execute : function() {
			var oSelectionService = this.context.service.selection;
			var that = this;
			return oSelectionService.assertNotEmpty().then(
					function(aSelection) {
						if (aSelection[0] && aSelection[0].document
								&& aSelection[0].document.getType() === "file") {
							return that.context.service.document.open(aSelection[0].document);
						}
					});
		},

		isAvailable : function() {
			return this.context.service.selection.assertOwner(this.context.service.repositorybrowser);
		},

		isEnabled : function() {
			var oSelectionService = this.context.service.selection;
			return oSelectionService.assertNotEmpty().then(function(aSelection) {
				return aSelection[0].document && aSelection[0].stageTableRow.Status !== "D";
			});
		}
	};
});