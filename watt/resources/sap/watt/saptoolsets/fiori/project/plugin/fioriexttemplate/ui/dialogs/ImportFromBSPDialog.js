define(["sap/watt/lib/jszip/jszip-shim", "./GenericRemoteDialog"], function(JSZip,
	GenericRemoteDialog) {

	/* eslint-disable no-use-before-define */

	var _context;
	var oErrorTextArea;
	var oInputProject;
	var folderName;
	var selectedApp = null;
	var rootContent = [];
	var taskId = null; // for progress bar

	var _openRemoteDialog = function(context) {
		_context = context;

		GenericRemoteDialog.createRemoteDialog(context, this, true);

		// Label for the target folder
		var oDetinationFolderText = new sap.ui.commons.Label({
			text: context.i18n.getText("i18n", "dialog_detination_folder1"),
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		});

		// TextField for the target folder
		oInputProject = new sap.ui.commons.TextField({
			placeholder: "",
			tooltip: context.i18n.getText("i18n", "dialog_detination_folder1"),
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L10 M10 S12"
			}),
			liveChange: function(oEvent) {
				folderNameValidation(oEvent).done(); // validation method for target folder field
			}
		});

		// Target Folder Grid
		var targetFolderGrid = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [oDetinationFolderText, oInputProject]
		}).addStyleClass("buttons SearchField");

		// TextView for an error text
		oErrorTextArea = new sap.ui.commons.TextView({
			width: "100%",
			text: "",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("errorText");

		GenericRemoteDialog.getDialog().insertContent(targetFolderGrid, 1);
		GenericRemoteDialog.getDialog().insertContent(oErrorTextArea, 2);

		GenericRemoteDialog.onSelectedApp(function(oEvent) {

			if (oEvent.getParameter("rowContext")) { // check if there is a selected row 

				selectedApp = GenericRemoteDialog.getSelectedTitle();
				folderName = selectedApp.substr(selectedApp.lastIndexOf("/") + 1);
				oInputProject.setValue(folderName);

				validateFolderNotExists(folderName).then(function(bValidationResault) {
					if (bValidationResault) {
						_updateStatus();
						GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(true); // set OK button to be enabled
					}
				}).done();

			}
		});

		GenericRemoteDialog.onSelectedSystem(function() {
			_clear();
		});

		GenericRemoteDialog.onOKPressed(function() {
		    rootContent = [];
			GenericRemoteDialog.getDialog().close();
			
			// start the progress bar of Web IDE
			_context.service.progress.startTask().then(function(sGeneratedTaskId) {
				taskId = sGeneratedTaskId; // save the task ID
				// lite info
    			_context.service.usernotification.liteInfo(_context.i18n.getText("i18n", "importFileDialog_msg_start", [selectedApp]), false).done();
    			// console
    			_context.service.log.info("Import", _context.i18n.getText("i18n", "importFileDialog_msg_start", [selectedApp]), ["user"]).done();
    
    			var destinationModel = GenericRemoteDialog.getSelectedDestination();
    			var destination = destinationModel;
    			folderName = oInputProject.getValue();
    
    			return _context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
    				return oRoot.createFolder(folderName).then(function(oProjectFolderDocument) {
    					if (oProjectFolderDocument) {
    						return _context.service.perspective.getCurrentPerspective().then(function(oPerspective) {
    							if(oPerspective !== "development") {
    								return _context.service.perspective.renderPerspective("development");									
    							} else {
    								return Q();
    							}
    						}).then(function() {
    							return executeImport(context, selectedApp, destination, oProjectFolderDocument).then(function() {
    							    // stop the progress bar
    				                context.service.progress.stopTask(taskId).done();
    							});
    						});
    					}
    				});
    			});
			}).fail(function(oError) { 
			    // stop the progress bar
			    context.service.progress.stopTask(taskId).done();
				if(oError && oError.message){
					_context.service.log.error("Import", oError.message, ["user"]).done();
				}
    		}).done();
		});
		
		GenericRemoteDialog.onCancelPressed(function() {
		     rootContent = [];
		});   

		GenericRemoteDialog.getDialog().open();
		GenericRemoteDialog.onProcessingStarted();

		GenericRemoteDialog.getDialog().attachEvent("reportError", function(oEvent) {
			var errorMsg = oEvent.mParameters.result;
			reportError(errorMsg);
		});
	};

	/** Note: This method checks against all the name parts (splitted by '.') and not in one regex due to performance reasons **/
	var folderNameValidation = function(oEvent) {
		reportInfo(""); // remove previous error message
		//Corresponds to allowed characters for UI5 Repositories (which are also valid UI5 namespaces):
		//Last character must not be a "."
		//First character must be a letter or _
		//After . must come a letter or _
		folderName = oEvent.getParameter("liveValue");
		folderName = folderName.trim();
		// validation for empty folder name
		if (folderName === "") {
			reportError(_context.i18n.getText("i18n", "importFromBSPDialog_emptyfoldermsg"));
			GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(false); // set OK button to be disabled
		} else if (selectedApp === null) {
			reportError(_context.i18n.getText("i18n", "importFromBSPDialog_selectappmsg"));
			GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(false); // disable the OK button
		} else {
			var sLastChar = folderName.charAt(folderName.length - 1);
			// regex validations
			if (sLastChar === ".") {
				reportError(_context.i18n.getText("i18n", "importFromBSPDialog_foldervalidationmsg"));
				GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(false); // set OK button to be disabled
			} else {
				var aParts = folderName.split(".");
				var rAllowedPartNames = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
				for (var i = 0; i < aParts.length; i++) {
					if (!rAllowedPartNames.test(aParts[i])) {
						//regex returns null in case of no match
						reportError(_context.i18n.getText("i18n", "importFromBSPDialog_foldervalidationmsg"));
						GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(false); // set OK button to be disabled
					} else {
						// folder not exists in the worksapce validation
						return validateFolderNotExists(folderName).then(function(bValidationResault) {
							if (bValidationResault) {
								_updateStatus();
								GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(true); // set OK button to be enabled
							}
						});
					}
				}
			}
		}
		return Q();
	};

	var folderValidation = function(folderName) {
		var j = rootContent.length;
		while (j--) {
			if (rootContent[j].name.toLowerCase() === folderName.toLowerCase()) {
				reportError(_context.i18n.getText("i18n", "importFromBSPDialog_folderexistmsg"));
				GenericRemoteDialog.getDialog().getButtons()[0].setEnabled(false); // set OK button to be disabled 
				return false;
			}
		}
		return true;
	};

	var validateFolderNotExists = function(folderName) {
		if (rootContent.length === 0) { // set rootContent parameter
			return setRootContent().then(function() {
				return folderValidation(folderName);
			});
		} else {
			return Q(folderValidation(folderName));
		}
	};

	var executeImport = function(context, selectedTitle, destination, oDestinationDocument) {
		return context.service.bspparentproject.import(selectedTitle, destination, oDestinationDocument);
	};

	var setRootContent = function() {
		return _context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
			return oRoot.getCurrentMetadata().then(function(aContent) {
				rootContent = aContent;
			});
		});
	};

	var reportError = function(error) {
		oErrorTextArea.removeStyleClass("label");
		oErrorTextArea.addStyleClass("errorText");
		oErrorTextArea.setText(error);
	};

	var reportInfo = function(msg) {
		oErrorTextArea.removeStyleClass("errorText");
		oErrorTextArea.addStyleClass("label");
		oErrorTextArea.setText(msg);
	};

	var _updateStatus = function() {
		reportInfo(_context.i18n.getText("i18n", "importFileDialog_msg_status"));
	};

	var _clear = function() {
		reportInfo("");
		oInputProject.setValue("");
		selectedApp = null;
	};

	return {
		updateStatus: _updateStatus,
		openRemoteDialog: _openRemoteDialog,
		clear: _clear
	};

	/* eslint-enable no-use-before-define */
});