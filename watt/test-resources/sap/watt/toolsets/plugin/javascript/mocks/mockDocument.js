var MockFileDocument = function(sFullPath, sFileExtension, sContent, sProject) {
	this.sContent = sContent;
	this.extensionSeperator = '.';
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