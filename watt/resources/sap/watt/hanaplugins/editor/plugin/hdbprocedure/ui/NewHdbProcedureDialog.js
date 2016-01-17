define([], function() {
	"use strict";
	return {

		_oCreateFileCommand: null,
		_aEntries: [],

		_checkInput: function(oEvent) {
			var sValue = oEvent.getParameter("liveValue");
			var bEnabled = (sValue !== "" && !this._alreadyExists(sValue));
			sap.ui.getCore().byId("CreateHdbProcedureDialog_CreateButton").setEnabled(bEnabled);
		},

		_alreadyExists: function(sName) {
			for (var i = 0; i < this._aEntries.length; i++) {
				if (this._aEntries[i].getEntity().getName() === sName) {
					return true;
				}
			}
			return false;
		},

		_createDialog: function() {
			var that = this;
			var oDialogLayout = new sap.ui.commons.layout.VerticalLayout({
				width: '100%'
			});

			oDialogLayout.addContent(new sap.ui.commons.TextView({
				text: "{i18n>createFileDialog_filename}",
				width: '100%'
			}));

			var oInputFileName = new sap.ui.commons.TextField("CreateHdbProcedureDialog_InputFileName", {
				// placeholder : "{i18n>createFileDialog_filename}",
				width: '100%',
				tooltip: "{i18n>createFileDialog_insertfilename}",
				liveChange: [that._checkInput, that]
			});
			oDialogLayout.addContent(oInputFileName);

			/*
			oDialogLayout.addContent(new sap.ui.commons.TextView({
				text : "{i18n>createFileDialog_schemaname}",
                width: '100%'
			}));
			
			this.oInputSchemaName = new sap.ui.commons.ValueHelpField({
                valueHelpRequest: function(){
                    that.oSearchSchemaDialog.open();
                },
                // placeholder : "{i18n>createFileDialog_schemaname}",
                width: '100%',
                editable: true
            });
            
            oDialogLayout.addContent(this.oInputSchemaName);
			*/

			var oCreateButton = new sap.ui.commons.Button({
				id: "CreateHdbProcedureDialog_CreateButton",
				text: "{i18n>button_create}",
				style: sap.ui.commons.ButtonStyle.Emph,
				enabled: false,
				press: [that.createFile, that]
			});

			var oDialog = new sap.ui.commons.Dialog("CreateHdbProcedureDialogUI", {
				title: "{i18n>createFileDialog_createfile}",
				initialFocus: oInputFileName,
				buttons: [oCreateButton, new sap.ui.commons.Button({
					text: "{i18n>button_cancel}",
					press: [that.cancel, that]
				})],
				defaultButton: oCreateButton,
				resizable: false,
				keepInWindow: true,
				modal: true
			});

			oDialog.addContent(oDialogLayout);
			return oDialog;
		},

		openCreateUI: function(oCreateFileCommand, oSelectedDocument, aFolderEntries) {
			this._oDeferred = Q.defer();
			this._oCreateFileCommand = oCreateFileCommand;
			this._oSelectedDocument = oSelectedDocument;
			this._aEntries = aFolderEntries;

			// var that = this;
			// this.oSearchSchemaDialog = new SearchSchemaDialog(oCreateFileCommand.context, {
			//     multiSelect : false,
			//     bShowIcon: true,
			//     displaySecondaryValues: false,
			//     numberCharInputRequired: 1,
			//     initialSearchValue: "**",
			//     fnCallback: function(obj){
			//         if(that.oInputSchemaName && obj && obj.schemaName){
			//             that.oInputSchemaName.setValue(obj.schemaName);
			//         }
			//     }
			// }); 

			var oDialog = sap.ui.getCore().byId("CreateHdbProcedureDialogUI");

			if (oDialog === undefined) {
				oDialog = this._createDialog();
				oCreateFileCommand.context.i18n.applyTo(oDialog);
			}

			sap.ui.getCore().byId("CreateHdbProcedureDialog_InputFileName").setValue("");
			// needed for initial deactivation of create button for subsequent openings of the dialog
			sap.ui.getCore().byId("CreateHdbProcedureDialog_CreateButton").setEnabled(false);
			oDialog.open();
			return this._oDeferred.promise;
		},

		createFile: function(oEvent) {
			var oButton = sap.ui.getCore().byId("CreateHdbProcedureDialog_CreateButton");
			oButton.setEnabled(false);

			var sFileName = sap.ui.getCore().byId("CreateHdbProcedureDialog_InputFileName").getValue();
			sFileName += ".hdbprocedure";
			// var sSchemaName = this.oInputSchemaName.getValue();
			// var oCreateFile = this._oCreateFileCommand.createFile(sFileName, sSchemaName, this._oSelectedDocument);
			var oCreateFile = this._oCreateFileCommand.createFile(sFileName, this._oSelectedDocument);
			var that = this;
			return oCreateFile.then(function(oDocument) {
				oButton.setEnabled(true);
				sap.ui.getCore().byId("CreateHdbProcedureDialogUI").close();
				that._oDeferred.resolve(oDocument);
			}).fail(
				function(sError) {
					oButton.setEnabled(true);
					that._oCreateFileCommand.context.service.usernotification.alert(that._oCreateFileCommand.context.i18n.getText("i18n", "createFileDialog_errormsg") + "\n" + sError).done();
					// that._oDeferred.reject();
				});
		},

		cancel: function(oEvent) {
			sap.ui.getCore().byId("CreateHdbProcedureDialogUI").close();
		}
	};
});