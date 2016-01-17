define([], function() {
	"use strict";
	return {

		execute : function() {
			var clipboard = this.context.service.clipboard;
			var selectionService = this.context.service.selection;
			jQuery(".sapUiTreeNodeCutted").removeClass("sapUiTreeNodeCutted");
			var that = this;
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return clipboard.addEntity(aSelection, that);
			});
		},

		isAvailable : function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		},

		isEnabled : function() {
            return this.context.service.repositorybrowserUtils.isRootIncludedInSelection()
                .then(function(isRootIncludedInSelection){
                    return !isRootIncludedInSelection;
                });
		}
	};
});
