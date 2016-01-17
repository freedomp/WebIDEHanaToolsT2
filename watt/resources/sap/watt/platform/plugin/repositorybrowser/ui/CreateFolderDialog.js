define(function() {
	"use strict";
	return {

		_oCreateFolderCommand : null,
		_aMetadataContent : [],

		_checkInput : function(oEvent) {
			var sValue = oEvent.getParameter("liveValue").trim();
			var bEnabled = (sValue !== "" && !this._alreadyExists(sValue));
			sap.ui.getCore().byId("CreateFolderDialog_CreateButton").setEnabled(bEnabled);
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
				text : "{i18n>dialog_foldername}"
			}));

			var oInputFileName = new sap.ui.commons.TextField("CreateFolderDialog_InputFolderName", {
				placeholder : "{i18n>dialog_foldername2}",
				tooltip : "{i18n>dialog_insertfoldername}",
				liveChange : [ that._checkInput, that ]
			});

			oDialogLayout.addContent(oInputFileName);

			var oCreateButton = new sap.ui.commons.Button({
				id : "CreateFolderDialog_CreateButton",
				text : "{i18n>button_create}",
				style : sap.ui.commons.ButtonStyle.Emph,
				enabled : false,
				press : [ that.createFolder, that ]
			});

			var oDialog = new sap.ui.commons.Dialog("CreateFolderDialogUI", {
				title : "{i18n>createFolderDialog_createfolder}",
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

		openCreateUI : function(oCreateFolderCommand, oSelectedDocument, aMetadataContent) {

			this._oCreateFolderCommand = oCreateFolderCommand;
			this._oSelectedDocument = oSelectedDocument;
			this._aMetadataContent = aMetadataContent;

			var oDialog = sap.ui.getCore().byId("CreateFolderDialogUI");

			if (oDialog === undefined) {
				oDialog = this._createDialog();
				oCreateFolderCommand.context.i18n.applyTo(oDialog);
			}

			sap.ui.getCore().byId("CreateFolderDialog_InputFolderName").setValue("");
			// needed for initial deactivation of create button for subsequent openings of the dialog
			sap.ui.getCore().byId("CreateFolderDialog_CreateButton").setEnabled(false);

			oDialog.open();
		},

		createFolder : function() {
			var oButton = sap.ui.getCore().byId("CreateFolderDialog_CreateButton");
			oButton.setEnabled(false);

			var sFolderName = sap.ui.getCore().byId("CreateFolderDialog_InputFolderName").getValue().trim();
			var oCreateFolder = this._oCreateFolderCommand.createFolder(sFolderName, this._oSelectedDocument);
			var that = this;
			oCreateFolder.then(function() {
				oButton.setEnabled(true);
				sap.ui.getCore().byId("CreateFolderDialogUI").close();
			}).fail(
					function(sError) {
						oButton.setEnabled(true);
						that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "createFolderDialog_errormsg") + "\n"
								+ sError);
					});

		},

		cancel : function() {
			sap.ui.getCore().byId("CreateFolderDialogUI").close(); // Close
		}
	};
});