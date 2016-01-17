define(["sap/watt/lib/lodash/lodash"],function(_) {
	"use strict";
	return {

		_oCreateFileCommand : null,
		_oInputFileName : null,
		_fileOrFolder : null,
		_aMetadataContent : [],
		_conflictArray : [],
		_resolvedArray : [],
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

			var that = this;

			this._fileOrFolder = new sap.ui.commons.TextView();
			oDialogLayout.addContent(this._fileOrFolder);

			// without this the user will not see all the text in _fileOrFolder
			var oLabel = new sap.ui.commons.Label();
			oDialogLayout.addContent(oLabel);
			var oLabel1 = new sap.ui.commons.Label();
			oDialogLayout.addContent(oLabel1);
			var oLabel2 = new sap.ui.commons.Label();
			oDialogLayout.addContent(oLabel2);

			this._oInputFileName = new sap.ui.commons.TextField("FileDialog_InputName", {
				tooltip : "{i18n>fileDialog_insertName}",
				liveChange : function(oEvent) {
					that._checkValue(oEvent);
				}
			});
			oDialogLayout.addContent(this._oInputFileName);

			this._oDefaultButton = new sap.ui.commons.Button("FileDialog_ActionButton", {
				text : "{i18n>fileDialog_OK}",
				style : sap.ui.commons.ButtonStyle.Emph,
				enabled : false,
				press : [ this.copyObject, this ]
			});

			if (!this._oDialog) {
				this._oDialog = new sap.ui.commons.Dialog("FileDialogUI", {
					initialFocus : this._oInputFileName,
					buttons : [ this._oDefaultButton, new sap.ui.commons.Button({
						text : "{i18n>fileDialog_cancel}",
						press : [ this.cancel, this ]
					}) ],
					title : "{i18n>fileDialog_cancel_naming_conflict}",
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

		openCreateUI : function(conflictArray, aMetadataContent) {
			this._oDeferred = Q.defer();
			this._aMetadataContent = aMetadataContent;
			this._conflictArray = conflictArray;
			this._resolvedArray = [];

			this._oDialog = sap.ui.getCore().byId("FileDialogUI");

			if (this._oDialog === undefined) {
				this._oDialog = this._createDialog();
				this.context.i18n.applyTo(this._oDialog);
			}

			this.changeDialogInfo(conflictArray[0]);

			this._oDialog.open();
			return this._oDeferred.promise;
		},

		changeDialogInfo : function(conflictItem) {
			this._bFolder = conflictItem.doc.getEntity().isFolder();
			this._oDefaultButton.setEnabled(!this._alreadyExists(this._bFolder, conflictItem.filenameProposal));
			this._oInputFileName.setValue(conflictItem.filenameProposal);
			var totalConflict = this._resolvedArray.length + this._conflictArray.length;
			var numOfResolvedConflocts = this._resolvedArray.length+1;
			var alreadyContains = this.context.i18n.getText("i18n", "fileDialog_already_contains", [ conflictItem.type,numOfResolvedConflocts, totalConflict  ]);
			this._fileOrFolder.setText(alreadyContains);
		},

		copyObject : function(oEvent) {
			var conflictArray = this._conflictArray;
			var sFileName = this._oInputFileName.getValue();
			var conflictItem = conflictArray[0];
			conflictItem.filenameProposal = sFileName;
			this._resolvedArray.push(conflictItem);
			// remove the first item
			this._conflictArray = conflictArray =  _.rest(conflictArray);
			if (!_.isEmpty(conflictArray)){
				this.changeDialogInfo(conflictArray[0]);
			}
			else { // no more conflicts
				this._oDeferred.resolve(this._resolvedArray);
				sap.ui.getCore().byId("FileDialogUI").close();
			}
		},

		cancel : function(oEvent) {
			sap.ui.getCore().byId("FileDialogUI").close();
		}
	};
});