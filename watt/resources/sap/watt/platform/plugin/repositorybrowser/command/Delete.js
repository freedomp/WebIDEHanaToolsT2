define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";

	// private methods

	function _deleteSelection(selectionArr) {
		// In case the user selects a folder and a file within the folder, clicks delete -> exception because the file was deleted with the folder
		// To avid exception first we will delete all the selected files which are under a selected folder

		var that = this;
		var sText1 = this.context.i18n.getText("i18n", "deleteDoc_deleting");
		var sText2 = this.context.i18n.getText("i18n", "deleteDoc_deleteProgress");
		
		return this.context.service.progress.startTask(sText1, sText2).then(function(iProgressId) {
			return that._removeSelectedFilesUnderSelectedFolders(selectionArr, that.context).fin(function() {
				that.context.service.progress.stopTask(iProgressId).done();
            });
		});
	}

	function _checkContainedDocumentsForDirty(aDirtyDocuments, oDocumentMetadata, oContext) {
		if (!aDirtyDocuments || aDirtyDocuments.length === 0) {
			// if there are no dirty elements the check is negative
			return Q(false);
		} else if (oDocumentMetadata.folder) { // folder
			return oContext.service.filesystem.documentProvider.getDocument(oDocumentMetadata.path).then(function(oDocument) {
				return oDocument.getCurrentMetadata().then(function(aMetadataContent) {
					if (aMetadataContent.length > 0) {
						var aPromises = [];
						for (var j = 0; j < aMetadataContent.length; j++) {
							var oDocMetadata = aMetadataContent[j];
							aPromises.push(_checkContainedDocumentsForDirty(aDirtyDocuments, oDocMetadata, oContext));
						}
	
						return Q.spread(aPromises, function() {
							for (var v = 0; v < arguments.length; v++) {
								if (arguments[v]) {
									return true; // break loop
								}
							}
							
							return false;
						});
					} 
					
					return false;
				});
			});
		} else { // file
			for (var i = 0; i < aDirtyDocuments.length; i++) {
				var bCheckResult = (oDocumentMetadata.path === aDirtyDocuments[i].getEntity().getFullPath());
				if (bCheckResult) {
					return Q(true); // break loop
				}
			}
			
			return Q(false);
		}
	}
	
	function _checkContainedArrayForDirty(aDirtyDocuments, oSelectionArr, oContext) {
		var promiseArr = _.map(oSelectionArr, function(oSelection) {
			var oDocumentMetadata = {};
			var oSelectedDocumentEntity = oSelection.document.getEntity();
			oDocumentMetadata.path = oSelectedDocumentEntity.getFullPath();
			oDocumentMetadata.folder = oSelectedDocumentEntity.isFolder();
			return _checkContainedDocumentsForDirty(aDirtyDocuments, oDocumentMetadata, oContext);
		});
		
		return Q.all(promiseArr).then(function(isDocDirtyArray) {
			return _.any(isDocDirtyArray, function(isDirty) {
				return isDirty;
			});
		});
	}

	// public methods
	return {
		execute: function() {
			var that = this;
			var selectionService = this.context.service.selection;
			var contentService = this.context.service.content;
			var userNotificationService = this.context.service.usernotification;

			return Q.spread([selectionService.assertNotEmpty(), contentService.getDocuments(true)], function(aSelection, aDirtyDocuments) {
				var warningMessage;
				// singleSelection
				if (aSelection.length === 1) {
					var oSingleSelectionDoc = aSelection[0].document;
					warningMessage = that.context.i18n.getText("i18n", "deleteCommand_delete_confirm", [oSingleSelectionDoc.getType(), oSingleSelectionDoc.getEntity().getName()]);
				} else {
					warningMessage = that.context.i18n.getText("i18n", "deleteCommand_delete_all_selected_confirm", aSelection.length);
				}

				return userNotificationService.confirm(warningMessage).then(function(oRet) {
					if (oRet.bResult) {
						return _checkContainedArrayForDirty(aDirtyDocuments, aSelection, that.context).then(function(bHasDirtyContent) {
							// there are dirty files within the selection
							if (bHasDirtyContent) {
								// warn user about unsaved documents in folder to be deleted
								var confirmMessage = that.context.i18n.getText("i18n", "deleteSelectionWithDirtyContent_delete_confirm", []);
								return userNotificationService.confirm(confirmMessage).then(function(oRes) {
									if (oRes.bResult) {
										return _deleteSelection.call(that, aSelection);
									}
								});
							} 
							// no dirty files in the selection
							return _deleteSelection.call(that, aSelection);
						});
					}
				});
			});
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			return this.context.service.repositorybrowserUtils.isRootIncludedInSelection().then(function(isRootIncludedInSelection) {
				return !isRootIncludedInSelection;
			});
		},
		
		_removeSelectedFilesUnderSelectedFolders: function(selectionArr) {
			return this.context.service.repositorybrowserUtils.removeSelectedFilesUnderSelectedFolders(selectionArr).then(function(oSelectionArrNoRepeats) {
				return _.map(oSelectionArrNoRepeats, function(oSelectedItem) {
					return oSelectedItem.document.delete();
				});
			}).then(function(promiseArr) {
				return Q.all(promiseArr);
			});
		}
	};
});