define([], function() {
	"use strict";
	return {
		_oDialog: null,

		execute: function() {
			var selectionService = this.context.service.selection;
			var that = this;
			this.context.service.usagemonitoring.report("repositoryBrowser", "commandExecuted", this.context.self._sName).done();
			return selectionService.assertNotEmptySingleSelection().then(function(aSelection) {
				var oDocument = aSelection.document;
				that._copyToClipboard(oDocument.getEntity().getFullPath());
			});
		},

		_copyToClipboard: function(sText) {
			// TODO - check use of document.execCommand('copy') to copy the current selection to the 
			//        clipboard so the the user will not need to do Ctrl+a and then Ctrl+c.
			var that = this;
			if (!this._oDialog) {
				that._oDialog = new sap.ui.commons.Dialog();
				that._oDialog.addButton(new sap.ui.commons.Button({
					text: "OK",
					press: function() {
						that._oDialog.close();
					}
				}));
				var sDialogTitle = this.context.i18n.getText("command_copy_full_path");
				that._oDialog.setTitle(sDialogTitle);
			} else {
				that._oDialog.removeAllContent();
			}

			// TODO - Set input field as selected (to save the user from pressing 'Ctrl+a')
			var oTextField = new sap.ui.commons.TextField({
				value: sText,
				editable: false
			});
			that._oDialog.addContent(oTextField);
			that._oDialog.setInitialFocus(oTextField);
			that._oDialog.open();
		},

		isAvailable: function() {
			// Available only for internal Web IDE
			if (this._isInternal()){
				return this.context.service.selection.isOwner(this.context.service.repositorybrowser);
			}else{
				return Q(false);
			}
		},

		isEnabled: function() {
			// Multiple selection, root and "level 1" documents ("Project") do not need the Copy Full Path option
			return this.context.service.repositorybrowserUtils.isSingleSelectionWithNoRootOrLevelOneFolderSelection();
		},

		_isInternal: function() {
			var bIsInternal = false;
			if (sap.watt.getEnv("server_type") !== "local_hcproxy" &&
				sap.watt.getEnv("internal") === true) {
				// Internal application
				bIsInternal = true;
			}
			return bIsInternal;
		}

	};
});