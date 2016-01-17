define({

	figureOutQunitTargetFolderPath: function(sComponentPath, oDocProvider) {
		var sQunitTargetFolderPath;
		var aPath = sComponentPath.split("/");
		var sProjectPath = "/" + aPath[1];

		// Check if the src folder is exist
		var sSrcFolderPath = sProjectPath + "/src";
		return oDocProvider.getDocument(sSrcFolderPath).then(function(oSrcFolderDocument) {
			if (oSrcFolderDocument === null) {
				// not exist - set the target folder path for the qunit generation as a project path
				sQunitTargetFolderPath = sProjectPath;
			} else {
				// src folder exists - set the target folder path for the qunit generation as /src/test path
				sQunitTargetFolderPath = sProjectPath + "/src";
			}
			return sQunitTargetFolderPath;
		});
	},

	getFileName: function(sFolderPath, sProposedFileName, sFileExtension, oDocProvider) {
		var that = this;
		// Get folder document
		return oDocProvider.getDocument(sFolderPath).then(function(oFolderDocument) {
			if (oFolderDocument !== null) {
				// Get folder content
				return oFolderDocument.getFolderContent().then(function(aFolderContent) {
					var counter = 1;
					var sFileName = sProposedFileName;
					// Search file in folder
					while (that._findFileInFolder(aFolderContent, sFileName, sFileExtension) !== false) {
						// If exist, propose a new name
						sFileName = sProposedFileName + counter;
						counter++;
					}
					return sFileName;
				});
			} else {
				return sProposedFileName;
			}
		});
	},

	_findFileInFolder: function(aFolderContent, sProposedFileName, sFileExtension) {
		var oFolderEntry;
		var fileName = sProposedFileName + sFileExtension;
		for (var i = 0; i < aFolderContent.length; i++) {
			oFolderEntry = aFolderContent[i];
			if ((oFolderEntry.getType() === "file") && (oFolderEntry.getTitle() === fileName)) {
				return true;
			}
		}
		return false;
	}

});