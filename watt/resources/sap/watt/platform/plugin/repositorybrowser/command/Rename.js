define([], function() {
	"use strict";
	return {

		execute : function() {
			var fileService = this.context.service.filesystem.documentProvider;
			var selectionService = this.context.service.selection;

			var sRename = this.context.i18n.getText("i18n", "renameCommand_rename");
			var sWarning = this.context.i18n.getText("i18n", "renameCommand_warning_msg");
			var sFolder = this.context.i18n.getText("i18n", "common_folder");
			var sFile = this.context.i18n.getText("i18n", "common_file");

			this._sTitle = sRename + " ";
			this._sOperation = sRename;
			var that = this;

			return selectionService.assertNotEmptySingleSelection().then(
					function(aSelection) {
						var oDocument = aSelection.document;
						var oSelectionDocEntity = oDocument.getEntity();
						var sFilenameProposal = oSelectionDocEntity.getName();
						var sPath = oSelectionDocEntity.getParentPath();

						if (oDocument.isDirty()) {
                            that.context.service.usernotification.alert(sFilenameProposal + "' " + sWarning).done();
							return;
						}

						if (oSelectionDocEntity.getType() === "folder") {
							that._sTitle += sFolder;
						} else {
							that._sTitle += sFile;
						}

						var _oParentFolderDocument;
						return fileService.getDocument(sPath).then(function(oParentFolderDocument) {
							_oParentFolderDocument = oParentFolderDocument;
							return oParentFolderDocument.getCurrentMetadata();
						}).then(
								function(aMetadataContent) {
									return that.context.service.clipboard.filedialog.rename.openCreateUI(oSelectionDocEntity.getType(),
											that._sTitle, that._sOperation, sFilenameProposal, aMetadataContent);
								}).then(function(sObjectName) {
							return oDocument.move(_oParentFolderDocument, sObjectName);
						}).then(function(oRenamedDocument) {
							// set selection and scroll to renamed document
							return that.context.service.repositorybrowser.setSelection(oRenamedDocument, true);
						}).fail(function(oError) {
							var sMessage = that.context.i18n.getText("i18n", "renameCommand_msg_failure") + " " + oError.message;
							console.error(sMessage);
							that.context.service.usernotification.alert(sMessage);
						});
					});
		},

		isAvailable : function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		},

		isEnabled : function() {
			// Root and "level 1" documents ("Project") cannot be cut
			// TODO: revise handling of "level 1" / Project documents - Project metadata vs.file metadata
			return this.context.service.repositorybrowserUtils.isSingleSelectionWithNoRootOrLevelOneFolderSelection();
		}
	};
});