define([], function() {
	"use strict";
	return {

		execute : function() {
			var that = this;
			return that.context.service.selection.assertNotEmptySingleSelection().then(function(aSelection) {
				return aSelection.document.getCurrentMetadata().then(function(aMetadataContent) {
					return that.context.service.repositorybrowser.createfiledialog.openCreateUI(that, aSelection.document, aMetadataContent).then(function() {
						//TODO: move this to a better place
						return that.context.service.focus.attachEvent("$dialogClosed", that._dialogClosed, that);
					});
				});
			});
		},

		isAvailable : function() {
			return true;
		},

		isEnabled : function() {
            return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection();
		},

		createFile : function(sFileName, oSelectedDocument) {
			var that = this;
			return oSelectedDocument.createFile(sFileName).then(
					function(oDocument) {
						return Q.all([ that.context.service.document.open(oDocument),
								that.context.service.repositorybrowser.setSelection(oDocument, true) ]);
					});
		},

		_dialogClosed : function() {
			var that = this;
			// The dialog handling needs a conceptually rework. 
			// For the time being we need the following delay for the IE10 so that the focus will really be set to the
			// content. Otherwise it will end up in the ui5 static area (id=sap_ui-static)
			return Q.delay(100).then(function(){
				return that.context.service.focus.setFocus(that.context.service.content).then(function() {
					return that.context.service.focus.detachEvent("$dialogClosed", that._dialogClosed, that);
				});
			});
		}
	};
});