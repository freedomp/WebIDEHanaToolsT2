define(["sap/watt/core/q" ], function (Q) {
	"use strict";

	return {

		getFile: function (oPojectDocument, fileName) {
			return oPojectDocument.getFolderContent().then(function (aContent) {
				var oFile = _.find(aContent, function (oElement) {
					return oElement.getEntity().getName() === fileName;
				});
				if (oFile !== undefined) {
					return oFile;
				}
			});
		},

		getFileContent: function (oPojectDocument, fileName) {
			var that = this;
			return that.getFile(oPojectDocument, fileName).then(function (oDocument) {
				if (oDocument) {
					return oDocument.getContent();
				}
			});
		},

		editFile : function(oPojectDocument, fileName, fileContent) {
			var that = this;
			return that.getFile(oPojectDocument, fileName).then(function(oDocument) {
				if (oDocument) {
					return that.addContentToFile(oDocument, fileContent);
				}
			});
		},

		addContentToFile : function(oDocument, fileContent) {
			return oDocument.setContent(fileContent).then(function() {
				return oDocument.save();
			});
		},

		createAndEditFile : function(oPojectDocument, fileName, fileContent) {
			var that = this;
			return oPojectDocument.createFile(fileName).then(function(oDocument) {
				return that.addContentToFile(oDocument, fileContent);
			});
		},

		isFileExist : function(docEntries, newFileName) {
			var isFileExist = false;
			for (var i in docEntries) {
				var docEntity = docEntries[i].getEntity();
				if (docEntity.getName() === newFileName) {
					isFileExist = true;
				}
			}
			return isFileExist;
		},

		deleteFile : function(oPojectDocument, fileName) {
			var that = this;
			return that.getFile(oPojectDocument, fileName).then(function(oDocument) {
				if (oDocument) {
					return oDocument.delete();
				}
				return Q(false);
			});
		}
	};



});