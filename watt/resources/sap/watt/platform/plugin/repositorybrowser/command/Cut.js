define([], function() {
	"use strict";
	return {

		execute : function() {
			var clipboard = this.context.service.clipboard;
			var selectionService = this.context.service.selection;

			var that = this;
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return clipboard.addEntity(aSelection, that).then(function() {
					jQuery(".sapUiTreeNodeCutted").removeClass("sapUiTreeNodeCutted");
					jQuery(".sapUiTreeNodeSelected").find(".sapUiTreeNodeContent").addClass("sapUiTreeNodeCutted");
				});
			});
		},

		isAvailable : function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		},

		isEnabled : function() {
            // Root and "level 1" documents ("Project") cannot be cut
            // TODO: revise handling of "level 1" / Project documents - Project metadata vs.file metadata
            return this.context.service.repositorybrowserUtils.isRootOrLevelOneFolderIncludedInSelection()
                .then(function(isRootOrLevelOneSelection){
                    return !isRootOrLevelOneSelection;
                });
		}
	};
});
