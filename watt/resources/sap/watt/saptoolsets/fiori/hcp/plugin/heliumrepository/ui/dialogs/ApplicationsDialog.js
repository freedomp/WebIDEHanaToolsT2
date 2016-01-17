define([], function() {

	/* eslint-disable no-use-before-define */

	var oContext = null;
	var oModel = null;
	var selectedRowIndex = null;
	var selectedApplication = null;
	var aApplications = null;
	var projectValidationResult = null;
	var oTable = null;
	var oSearch = null;
	var oGrid = null;
	var oErrorTextArea = null;
	var dialog = null;
	var account = null;
	var username = null;
	var password = null;
	var folderName;
	var rootContent = [];
	var taskId = null; // for progress bar

	// action - "create" or "import"
	var _open = function(action, parentProjectStepContent) {

		oContext = this.context;
		
		selectedApplication = null;

		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.hcp.heliumrepository/ui/css/Dialog.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/wizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.ideplatform.template/css/templateWizard.css"));
		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.hcp.heliumrepository/ui/css/ApplicationsDialog.css"));

		oModel = new sap.ui.model.json.JSONModel();

		dialog = new sap.ui.commons.Dialog({
			title: oContext.i18n.getText("i18n", "ApplicationsDialog_SelectApplicationHelium"),
			resizable: false,
			width: "700px",
			modal: true,
			keepInWindow: true
		});

		//authenticate() makes all the authentications, and continue if authenticated
		oContext.service.hcpauthentication.authenticate().then(function(oUserCrad) {

			account = oUserCrad.account;
			username = oUserCrad.username;
			password = oUserCrad.password;

			//this function loads all the existing applications
			var loadApplications = function() {

				oTable.setBusy(true); // start the busy indicator of the table

				// init the service again - because the user changed one of the fields

				var promises = [];
				var aValidSubscriptions = [];
				var aSubscriptions = [];
				var appName = (window.location.host).split("-")[0];
				// get the applications
				// provide the username from the authentication service so we would use it in this call to get the applications. 
                // this is in order to support cases where the username comes from a different IDP (i.e. SuccessFactors)
				promises.push(oContext.service.hcpconnectivity.getApps(account, username, password));
				// get the subscriptions
				promises.push(oContext.service.hcpconnectivity.getSubscriptions(account, username, password));

				aApplications = [];
				Q.all(promises).spread(function() {
					aApplications = arguments[0];
					aSubscriptions = arguments[1];
					// insert all subscribed applications except of webide
					for (var i = 0 ; i < aSubscriptions.length ; i++) {
						if (aSubscriptions[i].name !== appName && (aSubscriptions[i].displayName.indexOf("webide") < 0)) {
							aValidSubscriptions.push(aSubscriptions[i]);
						}
					}
					aApplications = aApplications.concat(aValidSubscriptions);
				
					// clear all error messages if exists
					oErrorTextArea.setText("");
					// update the table model with the applications
					oModel.setData({
						modelData: aApplications
					});
					oTable.setModel(oModel);
					oTable.bindRows("/modelData");
					oTable.setBusy(false); // stop the busy indicator

					oSearch.setEnabled(true);
					oSearch.focus();

				}).fail(function(oError) {

					// clear the table by reset its model data
					clearTable();
					oTable.setBusy(false); // stop the busy indicator
					if (oError.status === 401) {
						reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_WrongCredentials"));
					} else if (oError.status === 403) {
						reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_NoAuthorizations"));
					} else {
						reportError(oError.info);
					}
					dialog.getButtons()[0].setEnabled(false); // disable the OK button
				}).done();
			};

			// Search field
			oSearch = new sap.ui.commons.SearchField({
				enableListSuggest: false,
				enableFilterMode: true,
				enableClear: true,
				enabled: false,
				tooltip: oContext.i18n.getText("i18n", "ApplicationsDialog_SearchApplication"),
				width: "100%",
				startSuggestion: 0,
				suggest: function(oEvent) {
					reportInfo("");
					updateTable(oTable, oEvent.getParameter("value"));
				},
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("buttons SearchField");

			// update the table while search
			var updateTable = function(oTable, sPrefix) {
				var filteredApplications = filterApplications(sPrefix); //Find the filtered applications according to the sPrefix
				oModel.setData({
					modelData: filteredApplications
				});
				oTable.setModel(oModel);
				oTable.bindRows("/modelData");
				oTable.removeSelectionInterval(0, selectedRowIndex); // remove last selected row
				selectedApplication = null;
				dialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
				if (action === "import") {
					oFolderTargeText.setValue("");
					reportInfo("");
				}
			};

			// Filter applications according to the sPrefix
			var filterApplications = function(sPrefix) {
				var aResult = [];
				for (var i = 0; i < aApplications.length; i++) {
					var application = aApplications[i].name.toLowerCase();
					if (aApplications[i].status === "") {
						if (!sPrefix || sPrefix.length === 0 || application.indexOf(sPrefix.toLowerCase()) !== -1) {
							aResult.push(aApplications[i]);
						}
					} else {
						var applicationStatus = aApplications[i].status.toLowerCase();
						if (!sPrefix || sPrefix.length === 0 || application.indexOf(sPrefix.toLowerCase()) !== -1 || applicationStatus.indexOf(sPrefix.toLowerCase()) !==
							-1) {
							aResult.push(aApplications[i]);
						}
					}
				}

				return aResult;
			};

			// Create the Table of applications
			oTable = new sap.ui.table.Table({
				visibleRowCount: 7,
				firstVisibleRow: 1,
				selectionMode: sap.ui.table.SelectionMode.Single,
				navigationMode: sap.ui.table.NavigationMode.Scrollbar,
				extension: [oSearch],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				noData: oContext.i18n.getText("i18n", "ApplicationsDialog_NoData")
			});

			// Add application column
			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: oContext.i18n.getText("i18n", "ApplicationsDialog_Name"),
					design: "Bold"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "name"),
				sortProperty: "name",
				width: "300px"
			}));

			// Add status column
			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: oContext.i18n.getText("i18n", "ApplicationsDialog_State"),
					design: "Bold"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "status"),
				sortProperty: "status",
				width: "200px"
			}));

			oTable.attachRowSelectionChange(function(oEvent) {
				reportInfo("");
				oTable.setBusy(true);
				dialog.getButtons()[0].setEnabled(false); // disable OK button
				if (oEvent.getParameter("rowContext") !== null) { // check if there is a selected row 

					selectedRowIndex = oEvent.getParameter("rowIndex");
					oTable.setSelectedIndex(selectedRowIndex);

					var currentRowContext = oEvent.getParameter("rowContext");
					var path = currentRowContext.getPath();
					var arr = path.split("/");
					var realSelectedRowIndex = arr[arr.length - 1];

					selectedApplication = currentRowContext.getModel().oData.modelData[realSelectedRowIndex];

					return onSelect(action).then(function() {
						oTable.setBusy(false);
					}).fail(function(oError) {
						oTable.setBusy(false);
						if (oError && oError.message) {
							reportError(oError.message);
						}
						dialog.getButtons()[0].setEnabled(false); // disable the OK button
					});

				} else {
					oTable.setBusy(false);
				}
			});

			oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowOnly);

			//load the applications
			loadApplications();

			// TextView for an error text
			oErrorTextArea = new sap.ui.commons.TextView({
				width: "100%",
				text: "",
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).addStyleClass("errorTextWithHeight");

			oGrid = new sap.ui.layout.Grid({
				vSpacing: 0
			});

			if (action === "import") {
				// Label for the target folder
				var oFolderTargetLabel = new sap.ui.commons.Label({
					text: oContext.i18n.getText("i18n", "ApplicationsDialog_folder"),
					textAlign: "Left",
					layoutData: new sap.ui.layout.GridData({
						span: "L3 M2 S12"
					})
				});

				// TextField for the target folder
				var oFolderTargeText = new sap.ui.commons.TextField({
					placeholder: "",
					tooltip: oContext.i18n.getText("i18n", "ApplicationsDialog_folder"),
					width: "100%",
					layoutData: new sap.ui.layout.GridData({
						span: "L9 M10 S12"
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
					content: [oFolderTargetLabel, oFolderTargeText]
				}).addStyleClass("buttons SearchField");

				oGrid.addContent(oSearch);
				oGrid.addContent(oTable);
				oGrid.addContent(targetFolderGrid);
				oGrid.addContent(oErrorTextArea);

			} else {
				oGrid.addContent(oSearch);
				oGrid.addContent(oTable);
				oGrid.addContent(oErrorTextArea);
			}

			dialog.addContent(oGrid);

			dialog.addButton(new sap.ui.commons.Button({
				text: oContext.i18n.getText("i18n", "OK"),
				enabled: false,
				press: function() {
					onOk(selectedApplication, action);
				}
			}));

			dialog.addButton(new sap.ui.commons.Button({
				text: oContext.i18n.getText("i18n", "Cancel"),
				press: function() {
					onCancel(action);
				}
			}));

			// Initially sort the table 
			oTable.sort(oTable.getColumns()[0]);

			dialog.open();

			var deleteDocument = function(oDocument) {
				if (oDocument) {
					return oDocument["delete"]();
				}

				return Q();
			};

			var onSelect = function(action) {
				switch (action) {
					case "create":

						if (selectedApplication.status.toLowerCase() === "stopped") {
							// disable the OK button
							dialog.getButtons()[0].setEnabled(false);
							// show error message in the dialog
							reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_StoppedApplication"));

							return Q();
						}

						var system = {};
						system.account = account;
						system.application = selectedApplication.name;
						system.type = "application";
						if (selectedApplication.providerAccount) {
							system.providerAccount = selectedApplication.providerAccount;
							system.providerName = selectedApplication.providerName;
							system.type = "subscription";
						}

						// validate parent application
						return oContext.service.parentproject.validateParentProject(selectedApplication.name, "hcp", system).then(function(result) {
							if (result.isValid === true) {
							    
							    // set parent Component.js folder path as system entry path
                        		var componentJsPath = result.model.extensibility.component.replace("/Component.js", ""); 
                        		if (componentJsPath && componentJsPath.indexOf("/") !== 0) {
                        			componentJsPath = "/" + componentJsPath;
                        		}
                        		if (componentJsPath) {
                        		    system.entryPath = componentJsPath + "/";
                        		}
							    
								// add "system" block to .project.json
								// with the account, application and repository
								result.model.extensibility.system = system;
								result.model.extensibility.type = "hcp";

								projectValidationResult = result;

								// enable the OK button
                                dialog.getButtons()[0].setEnabled(true);
								// clear all error messages if exists
								oErrorTextArea.setText("");
								checkApplicationStatus(selectedApplication);
							} else {
								// disable the OK button
								dialog.getButtons()[0].setEnabled(false);
								// show error message in the dialog
								reportError(result.message);
							}
						});
					case "import":
					    
					    if (!selectedApplication.activeVersion) { // there's no active version in this application
							// disable the OK button
							dialog.getButtons()[0].setEnabled(false);
							// show error message in the dialog
							reportError(oContext.i18n.getText("i18n", "HeliumParentProject_404_error"));

							return Q();
						}

						oFolderTargeText.setValue(selectedApplication.name);

						return validateFolderNotExists(selectedApplication.name).then(function(bValidationResault) {
							if (bValidationResault) {
								// enable the OK button
								dialog.getButtons()[0].setEnabled(true);
								// clear error message in the dialog
								reportInfo("");
							}
						});
					default:
						throw new Error(oContext.i18n.getText("i18n", "ApplicationsDialog_AppSelectionErrorOccurred"));
				}
			};

			var onOk = function(selectedApplication, action) {

				switch (action) {
					case "create":
						// fire event with validation result (including extensibility model + cloned project path. 
						// All parent application parameters like parent local path and name and git repository 
						// should be created in system block) -> close the dialog

						parentProjectStepContent.setProjectValidation(projectValidationResult);
						parentProjectStepContent.setSelectedParentProjectPath(selectedApplication.name, false, "hcp",
							projectValidationResult.model.extensibility.system);
							
						dialog.close();
						break;
					case "import":
						dialog.close();
						rootContent = [];
						// start the progress bar of Web IDE
            			return oContext.service.progress.startTask().then(function(sGeneratedTaskId) {
            				taskId = sGeneratedTaskId; // save the task ID
            				// lite info
    						oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "HeliumParentProject_msg_start", [selectedApplication.name]),
    							false).done();
    
    						var system = {};
    						system.account = account;
    						system.type = "application";
    						if (selectedApplication.providerAccount) {
    							system.type = "subscription";
    						}
    						system.application = selectedApplication.name;
    						folderName = oFolderTargeText.getValue();
    
    						return oContext.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
    							return oRoot.createFolder(folderName).then(function(oProjectFolderDocument) {
    								if (oProjectFolderDocument) {
    									return oContext.service.perspective.getCurrentPerspective().then(function(oPerspective) {
    										if(oPerspective !== "development") {
    											return oContext.service.perspective.renderPerspective("development");
    										} else {
    											return Q();
    										}
    									}).then(function() {
    										return oContext.service.heliumparentproject.import(selectedApplication.name, system, oProjectFolderDocument).then(function() {
    										    // stop the progress bar
    				                            oContext.service.progress.stopTask(taskId).done();
    										});
    									});
    								}
    							}).fail(function(oError) { //failed to create folder
    							    // stop the progress bar
    				                oContext.service.progress.stopTask(taskId).done();
    				                            
    								if (oError && oError.message) {
    									throw new Error(oError.message);
    								} else {
    									throw new Error(oContext.i18n.getText("i18n", "ExProjWizard_FaildToCreateFolder"));
    								}
    							}).fail(function(oError) { //failed to get root
    							    // stop the progress bar
    				                oContext.service.progress.stopTask(taskId).done();
    				                            
    								if (oError && oError.message) {
    									throw new Error(oError.message);
    								} else {
    									throw new Error(oContext.i18n.getText("i18n", "ExProjWizard_FaildToGenerateExProject"));
    								}
    							});
    						}).done();
            			}).done();

					default:
					    // stop the progress bar
    				    oContext.service.progress.stopTask(taskId).done();
    				                            
						// lite info
						oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "ApplicationsDialog_ClickOKErrorOccurred"), true).done();
						throw new Error(oContext.i18n.getText("i18n", "ApplicationsDialog_ClickOKErrorOccurred"));
				}
			};

			var onCancel = function(sAction) {
				switch (sAction) {
					case "create":
					case "import":
						dialog.close();
						rootContent = [];
						break;
					default:
						throw new Error(oContext.i18n.getText("i18n", "ApplicationsDialog_ClickCancelErrorOccurred"));
				}
			};

		}).fail(function(oError) {
			if (oError.message !== "Authentication_Cancel") {
				throw new Error(oError.message);
			}

		}).done();
	};

	/* Note: This method checks against all the name parts (splitted by '.') and not in one regex due to performance reasons */
	var folderNameValidation = function(oEvent) {
		reportError(""); // remove previous error message
		
		//Corresponds to allowed characters for UI5 Repositories (which are also valid UI5 namespaces):
		//Last character must not be a "."
		//First character must be a letter or _
		//After . must come a letter or _
		folderName = oEvent.getParameter("liveValue");
		folderName = folderName.trim();
		// validation for empty folder name
		if (folderName === "") {
			reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_emptyfoldermsg"));
			dialog.getButtons()[0].setEnabled(false); // disable the OK button
		} else if (selectedApplication === null) {
			reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_selectappmsg"));
			dialog.getButtons()[0].setEnabled(false); // disable the OK button
		} else if (!selectedApplication.activeVersion) { // there's no active version in this application
			dialog.getButtons()[0].setEnabled(false); 	// disable the OK button
			reportError(oContext.i18n.getText("i18n", "HeliumParentProject_404_error"));
		} else {
			var sLastChar = folderName.charAt(folderName.length - 1);
			// regex validations
			if (sLastChar === ".") {
				reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_foldervalidationmsg"));
				dialog.getButtons()[0].setEnabled(false); // disable the OK button
			} else {
				var aParts = folderName.split(".");
				var rAllowedPartNames = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
				for (var i = 0; i < aParts.length; i++) {
					if (!rAllowedPartNames.test(aParts[i])) {
						//regex returns null in case of no match
						reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_foldervalidationmsg"));
						dialog.getButtons()[0].setEnabled(false); // disable the OK button
						return Q();
					} else {
						// folder not exists in the worksapce validation
						return validateFolderNotExists(folderName).then(function(bValidationResault) {
							if (bValidationResault) {
								reportInfo("");
								dialog.getButtons()[0].setEnabled(true); // set OK button to be enabled
							}
						});
					}
				}
			}
		}
		return Q();
	};

	var folderValidation = function(folderName) {
		for (var j = 0; j < rootContent.length; j++) {
			if (rootContent[j].name.toLowerCase() === folderName.toLowerCase()) {
				reportError(oContext.i18n.getText("i18n", "ApplicationsDialog_folderexistmsg"));
				dialog.getButtons()[0].setEnabled(false); // disable the OK button
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

	var setRootContent = function() {
		return oContext.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
			return oRoot.getCurrentMetadata().then(function(aRawData) {
				rootContent = aRawData;
			});
		});
	};

	var reportInfo = function(msg) {
		oErrorTextArea.removeStyleClass("errorText");
		oErrorTextArea.addStyleClass("label");
		oErrorTextArea.setText(msg);
	};

	var reportError = function(error) {
		oErrorTextArea.removeStyleClass("label");
		oErrorTextArea.addStyleClass("errorText");
		oErrorTextArea.setText(error);
	};

	var checkApplicationStatus = function(selectedApplication) {
		var message = "";
		switch (selectedApplication.status) {
			case "STARTED":
				break;
			case "STOPPED":
				message = oContext.i18n.getText("i18n", "ApplicationsDialog_StoppedApplication");
				break;
			default:
				return;
		}
		reportInfo(message);
	};

	var clearTable = function() {
		oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: {}
		});
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		// disable and clear the search field
		oSearch.setEnabled(false);
		oSearch.setValue("");
	};

	return {
		open: _open
	};

	/* eslint-enable no-use-before-define */
});