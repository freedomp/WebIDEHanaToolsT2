define(["sap/watt/lib/lodash/lodash"], function(_) {
	
	"use strict";

	function _showError(err) {
		return this.context.service.usernotification.alert(err.message).done();
	}

	function _alreadyExists(aMetadataContent, bFolder, sName) {
		for (var i = 0; i < aMetadataContent.length; i++) {
			var oMetadataElement = aMetadataContent[i];
			if (oMetadataElement.folder === bFolder && oMetadataElement.name === sName) {
				return true;
			}
		}
		
		return false;
	}

	// public methods
	return {

		execute: function() {
			var sCopyOf = this.context.i18n.getText("i18n", "pasteCommand_copyOf");

			this._sCut = this.context.i18n.getText("i18n", "pasteCommand_cut");
			this._sPaste = this.context.i18n.getText("i18n", "pasteCommand_paste");
			this._sCopy = this.context.i18n.getText("i18n", "pasteCommand_copy");

			var clipboardService = this.context.service.clipboard;
			var fileService = this.context.service.filesystem.documentProvider;
			var selectionService = this.context.service.selection;
			var repositoryBrowser = this.context.service.repositorybrowser;

			this._sTitle = this._sCopy;
			this._sButtonText = this._sCopy;

			var that = this;

			return Q.spread([selectionService.assertNotEmpty(), clipboardService.getEntity(), clipboardService.getSource()], 
				function(aUserSelectionToPaste, oClipboardEntities, oClipboardSource) {

				if (aUserSelectionToPaste.length !== 1) {
					var sMsg = that.context.i18n.getText("i18n", "pasteCommand_cannot_paste_multi_Selection");
					that.context.service.usernotification.alert(sMsg).done();
					return Q();
				}

				// for editor paste ?
				// if one of the ClipboardEntities is String -> than alert
				if (_.any(oClipboardEntities, function(oItem) {
					return oItem instanceof String;
				})) {
					var sMessage = that.context.i18n.getText("i18n", "pasteCommand_cannot_paste");
					that.context.service.usernotification.alert(sMessage).done();
					return Q();
				}

				var oUserSelectionToPasteDocEntity = aUserSelectionToPaste[0].document.getEntity();
				var bIsCut = (oClipboardSource && (oClipboardSource.context.self._sName.indexOf(that._sCut) !== -1));

				// if a folder is selected -> paste to the folder
				// if a file   is selected -> paste to the parent folder of the file
				var sPathToPaste = ((oUserSelectionToPasteDocEntity.getType() === "folder") ?
					oUserSelectionToPasteDocEntity.getFullPath() : oUserSelectionToPasteDocEntity.getParentPath());

				return that.context.service.repositorybrowserUtils.removeSelectedFilesUnderSelectedFolders(oClipboardEntities).then(function(oClipboardEntitiesNoRepeats) {
					return fileService.getDocument(sPathToPaste).then(function(oParentFolderDocumentToPaste) {
						return oParentFolderDocumentToPaste.getCurrentMetadata().then(function(aMetadataContent) {
							// aEntries - in case of selected folder - the folder content. in case of selected file - the parent folder content
							var noConflictArray = [];
							var conflictArray = _.map(oClipboardEntitiesNoRepeats, function(oClipboardItem) {
								var oClipboardItemDoc = oClipboardItem.document;
								var oClipboardItemName = oClipboardItemDoc.getEntity().getName();
								var bExists = _alreadyExists(aMetadataContent, oClipboardItemDoc.getEntity().isFolder(), oClipboardItemName.trim());
								if (bExists) {
									var sFilenameProposal = ((oClipboardItemDoc !== null) ? sCopyOf : "") + oClipboardItemName;
									bExists = _alreadyExists(aMetadataContent, oClipboardItemDoc.getEntity().isFolder(), sFilenameProposal);
									var index = 2;
									var sOriginalProposal = sFilenameProposal;
									while (bExists) {
										sFilenameProposal = sOriginalProposal + index;
										bExists = _alreadyExists(aMetadataContent, oClipboardItemDoc.getEntity().isFolder(), sFilenameProposal);
										index++;
									}
									var type = that.context.i18n.getText("i18n", "common_folder");
									if (oClipboardItemDoc.getEntity().isFile()) {
										type = that.context.i18n.getText("i18n", "common_file");
									}
									return {
										doc: oClipboardItemDoc,
										filenameProposal: sFilenameProposal,
										type: type
									};
								} else {
									noConflictArray.push({
										doc: oClipboardItemDoc
									});
								}
							});
							conflictArray = _.compact(conflictArray);
							
							function copyOrMove(oDocsToMoveOrCopy) {
								return _.map(oDocsToMoveOrCopy, function(oClipboardItem) {
									var oClipboardItemDoc = oClipboardItem.doc;
									var oClipboardItemName = oClipboardItem.filenameProposal ? oClipboardItem.filenameProposal : oClipboardItemDoc.getEntity().getName();

									function moveOrCopy() {
										return bIsCut ?
											oClipboardItemDoc.move(oParentFolderDocumentToPaste, oClipboardItemName) :
											oClipboardItemDoc.copy(oParentFolderDocumentToPaste, oClipboardItemName);
									}

									return moveOrCopy().then(function(oDocument) {
										// Select and expand the new pasted document in case that only one document was moved
										if (oDocsToMoveOrCopy.length === 1) {
											return repositoryBrowser.setSelection(oDocument, true);
										}
									}).fail(function(err) {
										return _showError.call(that, err);
									});
								});
							}
							
							function waitUntilFinishedAndSelect(aDocsToCopyOrMove) {
								return Q.all(copyOrMove(aDocsToCopyOrMove)).then(function() {
									if (aDocsToCopyOrMove.length > 1) {
										return repositoryBrowser.setSelection(oParentFolderDocumentToPaste, true, true);
									}
								});
							}

							// there are conflicts
							if (!_.isEmpty(conflictArray)) {
								return that.context.service.clipboard.filedialog.openCreateUI(conflictArray, aMetadataContent).then(function(sResolvedConflictsArray) {
									var aDocsToCopyOrMove = _.union(noConflictArray, sResolvedConflictsArray);
									return waitUntilFinishedAndSelect(aDocsToCopyOrMove);
								});
							} 
							
							return waitUntilFinishedAndSelect(noConflictArray);
						});
					});
				});
			});
		},

		isAvailable: function() {
			return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
		},

		isEnabled: function() {
			var that = this;
			var clipboardService = this.context.service.clipboard;

			return clipboardService.assertEntityNotEmpty().then(function() {
				return that.context.service.repositorybrowserUtils.isSingleNoRootSelection();
			});
		}
	};
});