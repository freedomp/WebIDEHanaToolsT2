define(function() {
	"use strict";
	return {

		_oCreateFileCommand : null,
		_aMetadataContent : [],

		_checkInput : function(oEvent) {
			var sValue = oEvent.getParameter("liveValue").trim();
			var bEnabled = (sValue !== "" && !this._alreadyExists(sValue));
			sap.ui.getCore().byId("CreateFileDialog_CreateButton").setEnabled(bEnabled);
		},

		_alreadyExists : function(sName) {
			for ( var i = 0; i < this._aMetadataContent.length; i++) {
				if (this._aMetadataContent[i].name === sName) {
					return true;
				}
			}
			return false;
		},

		_createDialog : function() {
			var that = this;
			var oDialogLayout = new sap.ui.commons.layout.VerticalLayout({
				width : '100%'
			});

			oDialogLayout.addContent(new sap.ui.commons.TextView({
				text : "{i18n>createFileDialog_filename}"
			}));

			var oInputFileName = new sap.ui.commons.TextField("CreateFileDialog_InputFileName", {
				placeholder : "{i18n>createFileDialog_filename2}",
				tooltip : "{i18n>createFileDialog_insertfilename}",
				liveChange : [ that._checkInput, that ]
			});

			oDialogLayout.addContent(oInputFileName);

			var oCreateButton = new sap.ui.commons.Button({
				id : "CreateFileDialog_CreateButton",
				text : "{i18n>button_create}",
				style : sap.ui.commons.ButtonStyle.Emph,
				enabled : false,
				press : [ that.createFile, that ]
			});

			var oDialog = new sap.ui.commons.Dialog("CreateFileDialogUI", {
				title : "{i18n>createFileDialog_createfile}",
				initialFocus : oInputFileName,
				buttons : [ oCreateButton, new sap.ui.commons.Button({
					text : "{i18n>button_cancel}",
					press : [ that.cancel, that ]
				}) ],
				defaultButton : oCreateButton,
				resizable : false,
				keepInWindow : true,
				modal : true
			});

			oDialog.addContent(oDialogLayout);
			return oDialog;
		},

		openCreateUI : function(oCreateFileCommand, oSelectedDocument, aMetadataContent) {
			this._oDeferred = Q.defer();
			this._oCreateFileCommand = oCreateFileCommand;
			this._oSelectedDocument = oSelectedDocument;
			this._aMetadataContent = aMetadataContent;

			var oDialog = sap.ui.getCore().byId("CreateFileDialogUI");

			if (oDialog === undefined) {
				oDialog = this._createDialog();
				oCreateFileCommand.context.i18n.applyTo(oDialog);
			}

			sap.ui.getCore().byId("CreateFileDialog_InputFileName").setValue("");
			// needed for initial deactivation of create button for subsequent openings of the dialog
			sap.ui.getCore().byId("CreateFileDialog_CreateButton").setEnabled(false);
			oDialog.open();
			return this._oDeferred.promise;
		},

		createFile : function(oEvent) {
			var oButton = sap.ui.getCore().byId("CreateFileDialog_CreateButton");
			oButton.setEnabled(false);

			var sFileName = sap.ui.getCore().byId("CreateFileDialog_InputFileName").getValue().trim();
			var oCreateFile = this._oCreateFileCommand.createFile(sFileName, this._oSelectedDocument);
			var that = this;
			return oCreateFile.then(function() {
				oButton.setEnabled(true);
				sap.ui.getCore().byId("CreateFileDialogUI").close();
				that._oDeferred.resolve();
			}).fail(
					function(sError) {
						oButton.setEnabled(true);
						that.context.service.usernotification.alert(
								that.context.i18n.getText("i18n", "createFileDialog_errormsg") + "\n" + sError).done();
					});
		},

		cancel : function(oEvent) {
			sap.ui.getCore().byId("CreateFileDialogUI").close();
		}
	};
});