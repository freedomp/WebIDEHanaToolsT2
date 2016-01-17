define(function(){

	var BasicUtil = function(sTestId, dTestModuleTimeStamp, oFileService) {
		this._sTestId = sTestId;
		this._oFileService = oFileService;
		this._sTestProjectName = "";
		this._dTestModuleTimeStamp = dTestModuleTimeStamp;
	};

	BasicUtil.prototype.getTestProjectName = function() {

		return this._sTestProjectName;

	};

	BasicUtil.prototype.initializeTestProject = function(sProjectType) {
		this._sTestProjectName = this._buildProjectName(this._sTestId);

		return this._createProject(this._sTestProjectName, sProjectType);

	};

	//TODO adjust to document, but currently not used
//	testutils.BasicUtil.prototype.checkEntry = function(oActualDocument, mExpectedDocument) {
//		equal(oActualDocument.sName, mExpectedDocument.sName);
//		equal(oActualDocument.sType, mExpectedDocument.sType);
//		equal(oActualDocument.sParentPath, mExpectedDocument.sParentPath);
//		ok(oActualDocument.oMetadata != null);
//		ok(oActualDocument.oBackendData != null);
//	};

	BasicUtil.prototype.findDocumentInArray = function(aDocuments, sName) {
		for (var i = 0; i < aDocuments.length; i++) {
			if (aDocuments[i].getEntity().getName() === sName) {
				return aDocuments[i];
			}
		}
	};

	BasicUtil.prototype.getExpectedDocument = function(sNewFolderName) {

		var mExpectedDocument = {
			sName : sNewFolderName,
			sType : "folder",
			sParentPath : ""
		};

		return mExpectedDocument;

	},

	BasicUtil.prototype.getProjectName = function() {

		return this._sTestProjectName;

	},

    BasicUtil.prototype.deleteTestProjectFolder = function() {

        var that = this;
        var sTestProjectName = this._sTestProjectName;

        return this._oFileService.getRoot().then(function(oRootDocument) {
            return oRootDocument.getFolderContent().then(function(aResult) {
                if (aResult) {
                    var oFileDocument = that.findDocumentInArray(aResult, sTestProjectName);
                    if (oFileDocument) {
                        return oFileDocument.refresh()
                            .then(function(){
                                return Q.all([oFileDocument["delete"]()]);
                            });
                    }
                }
            });
        });

    },

	BasicUtil.prototype._buildProjectName = function() {
		// To reproduce issue when one project name for all tests is used
		// return "TestProject_" + this._dTimeStamp;

		// Use different names for each test
		return "TestProject_" + this._dTestModuleTimeStamp + "_" + this._sTestId;

	};

	BasicUtil.prototype._createProject = function(sProjectName, sProjectType) {
		var oData = {};
		oData.name = sProjectName;
		if (sProjectType) {
			oData.type = sProjectType;
		}
		return this._oFileService.createProject(oData);
	};

	return BasicUtil;
});