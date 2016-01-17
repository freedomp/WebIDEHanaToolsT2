define(function(){

	var FileFolderTreeUtil = function() {
		this._mTestData = {};
		this._aFolders=[];

		this._oFileService = {}; 

	};

	FileFolderTreeUtil.prototype.create = function(mTestData, oFileService, sProjectFolderDocument) {

		this._mTestData = mTestData;
		this._oFileService = oFileService;

		return this._iterate(this._mTestData, sProjectFolderDocument);
	};
	
	FileFolderTreeUtil.prototype.createFoldersStructure = function(mTestData, oFileService, sProjectFolderDocument) {

		var that = this;
		that._mTestData = mTestData;
		that._oFileService = oFileService;
        that._aFolders = [];
       
		return that._iterateOnFolders(that._mTestData, sProjectFolderDocument).thenResolve(that._aFolders);
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
				return;
		}

	};
	
		FileFolderTreeUtil.prototype._iterateOnFolders = function(mCurrent, oParentFolderDocument) {

		var that = this;

		if (mCurrent.type === "folder") {
			var sFolderName = "";

			sFolderName = mCurrent.name;

			var length = mCurrent.content.length;

			return oParentFolderDocument.createFolder(sFolderName).then(function(oFolderDocument) {

				if (length === 0) {
					return oFolderDocument;

				} else {
                    that._aFolders.push(oFolderDocument);
					var aPromises = [];

					for (var i = 0; i < mCurrent.content.length; i++) {
						var oPromise = that._iterateOnFolders(mCurrent.content[i], oFolderDocument);
						aPromises.push(oPromise);
					}


					return Q.all(aPromises).then(function(aResult) {
					    aResult.forEach(function(oResult){
					        if(oResult){
					           that._aFolders.push(oResult); 
					        } 
					    });
						//that._aFolders=that._aFolders.concat(aResult) ;
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
