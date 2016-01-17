/**
 * OpenWith
 *
 * This command opens the selected file in a editor chosen by user  		 
 * 
 **/
define([], function() {
	"use strict";

	return {

		execute : function(value) {
			var selectionService = this.context.service.selection;
			var _contentService = this.context.service.content;
			return selectionService.assertNotEmptySingleSelection().then(function(aSelection) {
				return _contentService.setVisible(true).then(function(){
					return _contentService.open(aSelection.document, value.service);
				});
			});
		},

		isEnabled : function() {
            return this.context.service.repositorybrowserUtils.isSingleFileSelection();
		}
	};
});