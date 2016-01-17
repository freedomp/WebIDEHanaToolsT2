define(function() {
	"use strict";
	return {

		execute : function() {
			var that = this;
			var fileService = this.context.service.filesystem.documentProvider;
			that.context.service.selection.assertNotEmpty().then(function(aSelection) {
				var oProjectDoc = aSelection[0].document;
				return that.context.service.neoapp.addDestinations(null, oProjectDoc).then(function() {
					return fileService.getDocument(oProjectDoc.getEntity().getFullPath() + "/neo-app.json").then(function(oDocument) {
						return that.context.service.repositorybrowser.setSelection(oDocument, true);
					});
				});
			}).fail(
					function(oError) {
						that.context.service.usernotification.alert(
								that.context.i18n.getText("i18n", "createConnectivity_Error") + "\n\n" + oError.message).done();
					});
		},

		isAvailable : function() {
			return this._isProject();
		},

		isEnabled : function() {
			return this._isProject();
		},

		_isProject : function() {
			var selectionService = this.context.service.selection;
			return selectionService.assertOwner(this.context.service.repositorybrowser).then(function() {
				return selectionService.assertNotEmpty().then(function(aSelection) {
					return aSelection.length === 1 && !aSelection[0].document.getEntity().isRoot()
						&& aSelection[0].document.getEntity().getParentPath() === "";
				});
			});
		}
	};
});