define({

	_oService : null,
	_oFileSystemService : null,
	_oSelectedTemplate : null,

	_createDialog : function() {
		var that = this;
		var oDialogLayout = new sap.ui.commons.layout.VerticalLayout({
			width : '100%'
		});

		oDialogLayout.addContent(new sap.ui.commons.TextView({
			text : "Project Name: "
		}));

		that.oInputProject = new sap.ui.commons.TextField({
			placeholder : "Project name",
			tooltip : "Insert Project name"
		});

		oDialogLayout.addContent(that.oInputProject);

		oDialogLayout.addContent(new sap.ui.commons.TextView({
			text : "Mockup File: "
		}));

		oDialogLayout.addContent(new sap.ui.commons.FileUploader("MockupUploaderFile", {
			buttonText : "Browse..."
		}));

		var oDialog = new sap.ui.commons.Dialog("ImportMockupUIDialog", {
			title : "Import Mockup",
			buttons : [ new sap.ui.commons.Button({
				text : "Finish",
				style : sap.ui.commons.ButtonStyle.Emph,
				press : [ that.onFinishClicked, that ]
			}), new sap.ui.commons.Button({
				text : "Cancel",
				press : [ that.cancel, that ]
			}) ],
			resizable : false,
			keepInWindow : true,
			modal : true
		});
		oDialog.addContent(oDialogLayout);
		return oDialog;
	},
	
	_isLegalFileType : function(oFile) {
		var fileExtensions = oFile.name.split(".");
		var fileType = fileExtensions[fileExtensions.length - 1];
		switch(fileType.toLowerCase()) {
		case "json":
		case "txt":
		case "xml":
			return true;
		}
		return false;
	},

	/**
	 * Create a Dialog with 2 fields: <br>
	 * Project <br>
	 * File Uploader 
	 */
	openImportUI : function(oService) {

		this._oService = oService;
		this._oFileSystemService = oService.filesystem;

		var oDialog = sap.ui.getCore().byId("ImportMockupUIDialog");

		if (oDialog === undefined) {
			oDialog = this._createDialog();
		}

		this.oInputProject.setValue("");
		sap.ui.getCore().byId("MockupUploaderFile").setValue(undefined);
		
		var that = this;
		
		// select fiori extension project template
		oService.template.getTemplatesPerCategories("Fiori_mockup").then(function(mTemplatesByCategory) {
			that._oSelectedTemplate = mTemplatesByCategory[0].templates[0];
		}).done();

		oDialog.open();
	},

	onFinishClicked : function(oEvent) {

		var oDeferred = Q.defer();
		var oModel = {};
		oModel.oData = {};
		var that = this;
		var allowedFileTypes = {};

		// Check for the various File API support
		if (!!(window.File) && !!(window.FileReader)) {

			// get the selected file
			var oFile = sap.ui.getCore().byId("MockupUploaderFile").oFileUpload.files[0];
			
			// validate the file
			if (!oFile) {
				sap.ui.commons.MessageBox.show("Missing import mockup file", "ERROR", "Error");
				return;
			}
			// validate file type
			if(!this._isLegalFileType(oFile)) {
				sap.ui.commons.MessageBox.show("Unsupported file type", "ERROR", "Error");
				return;
			}
			// get the project name
			var sProjectName = this.oInputProject.getValue().trim();
			// TODO: add here validation on the project name
			
			// update the model with the project name
			oModel.oData.mockupProjectName = sProjectName;
			
			// set the provided file type in the model
			var fileExtensions = oFile.name.split(".");
			oModel.oData.fileType = fileExtensions[fileExtensions.length - 1].toLowerCase();
			
			// get the content of the selected file as string
			var reader = new FileReader();
			reader.onload = function(oEvent) {
				// update the model with the mockup model
				oModel.oData.mockupModel = reader.result;
				
				// oModel.oData.fileType = "JSON" ?
				that._oFileSystemService.documentProvider.getDocument("/" + sProjectName).then(function(oPathResult) {

					if (oPathResult) {
						// The folder exists but still valid --> call just generate without creating a folder
						var sPackagePath = oPathResult.getEntity().getFullPath();
						fnGenerateInFolder(oPathResult, sPackagePath, that._oService, oModel, oDeferred);
					} else {
						that._oFileSystemService.documentProvider.getRoot().then(function(oRoot) {
							oRoot.createFolder(sProjectName).then(function(oProjectFolderDocument) {
								if (oProjectFolderDocument) {
									var sPackagePath = oProjectFolderDocument.getEntity().getFullPath();
									fnGenerateInFolder(oProjectFolderDocument, sPackagePath, that._oService, oModel, oDeferred);
								}
							}).fail(function(sError) { //failed to create folder
								if (oError && oError.Message) {
									oDeferred.reject(oError.Message);
								} else {
									oDeferred.reject("Failed to generate an application from a mockup");
								}
							}).fail(function(sError) { //failed to get root
								if (oError && oError.Message) {
									oDeferred.reject(oError.Message);
								} else {
									oDeferred.reject("Failed to generate extension project");
								}
							});
						}).done();
					}
				}).fail(function(sError) { //failed to get existing folder
					if (oError && oError.Message) {
						oDeferred.reject(oError.Message);
					} else {
						oDeferred.reject("Failed to generate an application from a mockup");
					}
				});
			};
			reader.readAsText(oFile); // asynchronous, the result will be ready in the onload method
			
			var fnGenerateInFolder = function(oProjectFolderDocument, sPackagePath, oService, oModel, oDeferred) {
				oService.generation.generate(sPackagePath, that._oSelectedTemplate, oModel.oData, true, oProjectFolderDocument).then(function() {
					sap.ui.getCore().byId("ImportMockupUIDialog").close();
					oDeferred.resolve();
				}).fail(function(sError) {
					oProjectFolderDocument.delete();
					sap.ui.getCore().byId("ImportMockupUIDialog").close();
					oDeferred.reject(extractError(sError, "Failed to generate an application from a mockup"));
				});
			};
			
			return oDeferred.promise;
		}
	},
	
	cancel : function(oEvent) {
		sap.ui.getCore().byId("ImportMockupUIDialog").close();
	}
});
