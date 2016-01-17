define(function(){

	var FileFolderTreeUtil = function() {
		this._mTestData = {};

		this._oFileService = {};

	};

	FileFolderTreeUtil.prototype.create = function(mTestData, oFileService, sProjectFolderDocument) {

		this._mTestData = mTestData;
		this._oFileService = oFileService;

		return this._iterate(this._mTestData, sProjectFolderDocument);
	};

	FileFolderTreeUtil.prototype._iterate = function(mCurrent, oParentFolderDocument) {

		var that = this;

		if (mCurrent.type === "folder") {
			var sFolderName = "";

			sFolderName = mCurrent.name;

			var length = mCurrent.content.length;

			return oParentFolderDocument.createFolder(sFolderName).then(function(oFolderDocument) {

				if (length === 0) {
					return oFolderDocument;

				} else {

					var aPromises = [];

					for (var i = 0; i < mCurrent.content.length; i++) {
						var oPromise = that._iterate(mCurrent.content[i], oFolderDocument);
						aPromises.push(oPromise);
					}

					//that._aPromises.push(aPromises);

					return Q.all(aPromises).spread(function(oResult) {
						return oFolderDocument;
					});

				}

			});
		} else {
			var sFileName = sFolderName = mCurrent.name;
			return oParentFolderDocument.createFile(sFileName).then(function(oFileDocument) {
				return oFileDocument.setContent(mCurrent.content).then(function() {
					return oFileDocument.save();
				});
			}).then(function(oResult) {
				return;
			});
		}

	};
	
	return FileFolderTreeUtil;

});
