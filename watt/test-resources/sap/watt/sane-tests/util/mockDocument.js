define([], function() {

	var MockFileDocument = function(sFullPath, sFileExtension, sContent, sKeyString, sTitle) {
		this.sContent = sContent;
		this.extensionSeperator = ".";
		this.sKeyString = sKeyString;
		this.title = sTitle;
		var oEntity = {
			sFileExtension: sFileExtension,
			sFullPath: sFullPath,
			getFullPath: function() {
				return sFullPath;
			},
			getFileExtension: function() {
				return sFileExtension;
			},
			getType: function() {
				return "file";
			},
			getName: function() {
				return sFullPath;
			}
		};
		this.getEntity = function() {
			return oEntity;
		};
		this.getContent = function() {
			return Q(this.sContent);
		};
		var project = {
			getEntity: function() {
				return oEntity;
			}
		};
		this.getProject = function() {
			return Q(project);
		};
		this.isReadOnly = function() {
			return false;
		};
		this.setContent = function(_sContent) {
			this.sContent = _sContent;
			return Q();
		};
		this.getKeyString = function() {
			return this.sKeyString || sFullPath;
		};
		this.getTitle = function() {
			return this.title;
		};
		this.getType = function() {
			return "file";
		};
	};

	var MockFolderDocument = function(aDocuments, sFullPath) {
		var oEntity = {
			getType: function() {
				return "folder";
			},
			getFullPath: function() {
				return sFullPath;
			}
		};
		this.getEntity = function() {
			return oEntity;
		};
		this.getFolderContent = function(bRecursive) {
			return Q(aDocuments);
		};
	};
	return {
		MockFileDocument: MockFileDocument,
		MockFolderDocument: MockFolderDocument
	};

});