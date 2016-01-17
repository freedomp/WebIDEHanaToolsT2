define({

	getRunnableFiles: function(oDocument, oRunnableJson) {
		var that = this;
		// get the project 
		return oDocument.getProject().then(function(oProject) {
			if (oProject !== null) {
				//get the project entity
				var oProjectEntity = oProject.getEntity();
				if (!oProjectEntity.isRoot()) {
					//get the project content
					return oProject.getCurrentMetadata(true, {hidden : false}).then(function(aProjectContent) {
						var aFiles = [];
						//get validation function
						var fnIsValid = that._getValidationFunc(oRunnableJson);
						that._searchRunnableFiles(aProjectContent, aFiles, fnIsValid);
						return aFiles;
					});
				} else {
					return null;
				}
			} else {
				return null;
			}
		});
	},

	//get validation function
	_getValidationFunc: function(oRunnableJson) {
		var that = this;
		if (!oRunnableJson) {
			oRunnableJson = {
				include: [],
				exclude: []
			};
		}

		var aInclude = oRunnableJson.include;
		var aExclude = oRunnableJson.exclude;

		return that._createValidationFunc(aInclude, aExclude);
	},

	//create and return validation function for runnable files
	_createValidationFunc: function(aInclude, aExclude) {

		var fnIsValid = function(sFileName) {
			try {
				var bPosExp = false;
				var bNegExp = true;

				for (var i = 0; i < aInclude.length; i++) {
					aInclude[i] = aInclude[i].trim();
					if (aInclude[i]) {
						var bResult = (new RegExp(aInclude[i], "i").test(sFileName));
						if (bResult === true) {
							bPosExp = true;
							break;
						}
					}
				}

				for (var i = 0; i < aExclude.length; i++) {
					aExclude[i] = aExclude[i].trim();
					if (aExclude[i]) {
						var bResult = (!new RegExp(aExclude[i], "i").test(sFileName));
						if (bResult === false) {
							bNegExp = false;
							break;
						}
					}
				}

				return bPosExp && bNegExp;

			} catch (err) {
				return false;
			}
		};

		return fnIsValid;
	},

	_searchRunnableFiles: function(aRawData, aRunnableFiles, fnIsValid) {
		for (var i = 0; i < aRawData.length; i++) {
			var oRawData = aRawData[i];
			if (!oRawData.folder) {
				var sFileName = oRawData.name;
				var sFilePath = oRawData.path;
				if (fnIsValid(sFilePath)) {
					aRunnableFiles.push({
						name: sFileName,
						fullPath: sFilePath
					});
				}
			}
		}
	}

});