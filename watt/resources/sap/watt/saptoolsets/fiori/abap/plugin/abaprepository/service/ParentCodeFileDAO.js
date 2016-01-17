define([], function() {
	return {
		getDocument: function(sPath, sDAO, sVersion) {
		    
		},

		getVersion: function(oDocument, sVersion, sDAO) {
		},

		load: function(oDocument) {
            return {
				mContent: "",
				sETag: ""
			};
		},

		objectExists: function(oParentFolderDocument, sRelativePath) {
			return true;
		},

		save: function(oDocument) {
			return "";
		},

		readFileMetadata: function(oDocument) {
			return {
				readOnly: true
			};
		},

		refresh: function(oEvent) {
		},

		updateWorkspace: function(oEvent) {
		}

	};
});