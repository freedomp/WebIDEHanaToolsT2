define([], function() {
	"use strict";
	
	return {

		execute : function() {
			var that = this;
			
			return this._getSelectedDocument().then(function(oDocument) {
				return that.context.service.import.openImportUI(oDocument);
			});
		},

		isAvailable : function() { 
			return true;
		},

		isEnabled : function() {
			return true;
		},
		
        _getSelectedDocument : function() {
        	return this.context.service.repositorybrowser.getSelection().then(function(aSelectedDocuments) {
        		if(Array.isArray(aSelectedDocuments) && aSelectedDocuments.length === 1) {
        			// assuming single selection
        			return aSelectedDocuments[0].document;
        		} 
        	});
        }
	};
});