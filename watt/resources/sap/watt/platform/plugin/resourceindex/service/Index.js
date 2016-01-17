define(["sap/watt/lib/lodash/lodash"], function(_) {
	
	"use strict";
	
	return {
		_mFiles: {
			"filesIndex": []
		},
		_bFinished: false,
		_oMetadataFilterOptions : {hidden : false},

		getMetadata: function() {
			var that = this;
			
			if (this._bFinished) {
				return this._mFiles;
			}
			
			return that.context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
				return that._startIndexing(oRootDocument).then(function() {
					that._bFinished = true;
					return that._mFiles;
				});
			});
		},

		_startIndexing: function(oRootDocument) {
			var that = this;
			
			var aCompleteContent = {};
			return oRootDocument.getFolderContent().then(function(aProjects) {
				var aPromises = [];
				for (var i = 0; i < aProjects.length; i++) {
					var oProject = aProjects[i];
					aPromises.push(that._getProjectMetadata(oProject, aCompleteContent));
				}
				return Q.all(aPromises);
			}).then(function() {
				that._mFiles.filesIndex = _.values(aCompleteContent);
			});
		},
		
		_getProjectMetadata : function(oProject, aCompleteContent) {
			
			return oProject.getCurrentMetadata(true, this._oMetadataFilterOptions).then(function(aRawContent) {
				for (var m = 0; m < aRawContent.length; m++) {
					var oRawMetadata = aRawContent[m];
					if (!oRawMetadata.folder) {
						aCompleteContent[oRawMetadata.path] = oRawMetadata;
					}
				}
			});
		},

		resort: function(oDocument) {
			var sName = oDocument.getEntity().getName();
			var sPath = oDocument.getEntity().getParentPath();
			for (var i = 0; i < this._mFiles.filesIndex.length; i++) {
				var file = this._mFiles.filesIndex[i];
				if (file.name === sName && file.parentPath === sPath) {
					var oItem = this._mFiles.filesIndex[i];
					oItem.lastOpened = new Date().getTime();
					this._mFiles.filesIndex.splice(i, 1);
					this._mFiles.filesIndex.splice(0, 0, oItem);
					break;
				}
			}
		},

		onDocumentDeleted : function(oEvent) {
			var oDeletedDocumentEntity = oEvent.params.document.getEntity();
			var sDeletedDocumentPath = oDeletedDocumentEntity.getFullPath();
			var sDeletedDocumentPathWithSlash = sDeletedDocumentPath + "/";
			var oMapObject = {};
			for (var i = 0; i < this._mFiles.filesIndex.length; i++) {
				var file = this._mFiles.filesIndex[i];
				oMapObject[file.path] = file;
			}
			
			for (var j = 0; j < this._mFiles.filesIndex.length; j++) {
				var sPath = this._mFiles.filesIndex[j].path;
				if (sPath === sDeletedDocumentPath || sPath.indexOf(sDeletedDocumentPathWithSlash) === 0) {
					delete oMapObject[sPath];
				}
			}
			
			this._mFiles.filesIndex = _.values(oMapObject);
		},
		
		onDocumentCreated: function(oEvent) {
			var oCreatedDocument = oEvent.params.document;
			var oDocumentEntity = oCreatedDocument.getEntity();
			if (oDocumentEntity.isFile()) {
				this._mFiles.filesIndex.push({
					name: oDocumentEntity.getName(),
					parentPath: oDocumentEntity.getParentPath(),
					path: oDocumentEntity.getFullPath()
				});
			} else {
				var that = this;
				oCreatedDocument.getCurrentMetadata(true, this._oMetadataFilterOptions).then(function(aMetadataContent) {
					that._mFiles.filesIndex = that._mFiles.filesIndex.concat(aMetadataContent);
				}).done();
			}
		},
		
		onHiddenChanged : function() {
			this._mFiles.filesIndex = [];
			this._bFinished = false;
		}
	};
});