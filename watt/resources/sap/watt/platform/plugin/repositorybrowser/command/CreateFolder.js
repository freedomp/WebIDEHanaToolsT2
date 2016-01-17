define([], function() {
	"use strict";
	return {

		execute : function() {
			var that = this;

			return this.context.service.selection.assertNotEmptySingleSelection().then(function(aSelection) {
				return aSelection.document.getCurrentMetadata().then(function(aMetadataContent) {
					return that.context.service.repositorybrowser.createfolderdialog.openCreateUI(that, aSelection.document, aMetadataContent);
				});
			});

		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
		    if (sap.watt.getEnv("server_type") === "xs2"){
                return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection();
		    }
		    return this.context.service.repositorybrowserUtils.isSingleFolderSelection();
		},

		createFolder : function(sFolderName, oSelectedDocument) {
			var that = this;
			return oSelectedDocument.createFolder(sFolderName).then(function(oDocument) {
				return that.context.service.repositorybrowser.setSelection(oDocument, true);
			});
		}
	};
});