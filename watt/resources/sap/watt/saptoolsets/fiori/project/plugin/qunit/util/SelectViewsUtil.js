define({

	// searches for all views of the project
	getViewFiles: function(oDocument) {
		var that = this;
		// get the project 
		return oDocument.getProject().then(function(oProject) {
			if (oProject !== null) {
				//get the project entity
				var oProjectEntity = oProject.getEntity();
				if (!oProjectEntity.isRoot()) {
					var sProjectPath = oProjectEntity.getFullPath();
					//get the project content
					return oProject.getCurrentMetadata(true).then(function(aProjectMetadataContent) {
					    var aViewFiles = [];
					    that._searchViewFiles(aProjectMetadataContent, sProjectPath, aViewFiles);
					    return aViewFiles;
					});
				} else {
					return null;
				}
			} else {
				return null;
			}
		});
	},
	
	_searchViewFiles: function(aProjectMetadataContent, sProjectPath, aViewFiles) {
		for (var i = 0; i < aProjectMetadataContent.length; i++) {
			var oMetadataElement = aProjectMetadataContent[i];
			
			if (this._isValidViewFile(oMetadataElement.name)) {
				aViewFiles.push({
					name: oMetadataElement.name,
					fullPath: oMetadataElement.path,
					testNotExist: true
				});

			}
		}
	},
	
	//check if file is a valid view file
	_isValidViewFile: function(sFileName) {
		var rView = new RegExp(".*view.*");
		if (rView.test(sFileName) && sFileName !== "mock_preview_sapui5.html") {
			return true;
		} 
			return false;
		
	}
});