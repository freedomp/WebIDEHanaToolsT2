define(function() {
	"use strict";
	return {

		_oCreateFileCommand : null,
		_oInputFileName : null,
		_aMetadataContent : [],
		_oDialog : null,
		_oDefaultButton : null,
		_bFolder : false, // default

		getFocusElement : function() {
			return this._oInputFileName;
		},

		_createDialog : function() {
			var oDialogLayout = new sap.ui.commons.layout.VerticalLayout({
				width : '100%'
			});

			oDialogLayout.addContent(new sap.ui.commons.TextView({
				text : "{i18n>fileDialog_name}"
			}));
			var that = this;
			this._oInputFileName = new sap.ui.commons.TextField("FileDialog_InputNameRename", {
				tooltip : "{i18n>fileDialog_insertName}",
				liveChange : function(oEvent) {
					that._checkValue(oEvent);
				}
			});
			oDialogLayout.addContent(this._oInputFileName);

			this._oDefaultButton = new sap.ui.commons.Button("FileDialog_ActionButtonRename", {
				text : "{i18n>fileDialog_copy}",
				style : sap.ui.commons.ButtonStyle.Emph,
				enabled : false,
				press : [ this.copyObject, this ]
			});

			if (!this._oDialog) {
				this._oDialog = new sap.ui.commons.Dialog("FileDialogUIRename", {
					initialFocus : this._oInputFileName,
					buttons : [ this._oDefaultButton, new sap.ui.commons.Button({
						text : "{i18n>fileDialog_cancel}",
						press : [ this.cancel, this ]
					}) ],
					defaultButton : this._oDefaultButton,
					resizable : false,
					keepInWindow : true,
					modal : true
				});
			} else {
				this._oDialog.removeAllContent();
			}

			this._oDialog.addContent(oDialogLayout);
			return this._oDialog;
		},

		_checkValue : function(oEvent) {
			var sValue = oEvent.getParameter("liveValue");
			var bEnabled = (sValue === "" || this._alreadyExists(this._bFolder, sValue.trim())) ? false : true;
			this._oDefaultButton.setEnabled(bEnabled);
		},

		_alreadyExists : function(bFolder, sName) {
			for ( var i = 0; i < this._aMetadataContent.length; i++) {
				var oMetadataElement = this._aMetadataContent[i];
				if (oMetadataElement.folder === bFolder && oMetadataElement.name === sName) {
					return true;
				}
			}
			return false;
		},

		openCreateUI : function(bFolder, sTitle, sButtonText, sFilenameProposal, aMetadataContent) {
			this._oDeferred = Q.defer();
			this._aMetadataContent = aMetadataContent;
			this._bFolder = bFolder;

			this._oDialog = sap.ui.getCore().byId("FileDialogUIRename");

			if (this._oDialog === undefined) {
				this._oDialog = this._createDialog();
				this.context.i18n.applyTo(this._oDialog);
			}
			this._oDialog.setTitle(sTitle);
			this._oDefaultButton.setText(sButtonText);
			this._oDefaultButton.setEnabled(!this._alreadyExists(this._bFolder, sFilenameProposal));
			this._oInputFileName.setValue(sFilenameProposal);

			this._oDialog.open();
			return this._oDeferred.promise;
		},

		copyObject : function(oEvent) {
			var sFileName = this._oInputFileName.getValue();
			this._oDeferred.resolve(sFileName);
			sap.ui.getCore().byId("FileDialogUIRename").close();
		},

		cancel : function(oEvent) {
			sap.ui.getCore().byId("FileDialogUIRename").close();
		}
	};
});