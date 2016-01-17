define(["sap/watt/platform/plugin/utils/xml/XmlUtil", "../../utils/DeploymentUtility",
		"../../utils/ApplicationSyncUtility"],
	function(xmlUtil, oDeploymentUtility, oApplicationSyncUtility) {

		/* eslint-disable no-use-before-define */

		var that = null;
		var taskId = null; // for the progress bar
		var sEventValue = null; // for the usage analytics reports
		var DEFAULT_NAMESPACE = "sap";

		var _openWizard = function(context, aSelection) {
			that = this;
			this.oContext = context;
			var oWizardService = this.oContext.service.wizard;
			var oSelectedDocument = aSelection[0].document;
			
			// report when the wizard is opened
			that.oContext.service.usagemonitoring.report("deployment", "deploy_to_abap", "open_wizard").done();

			// only the first step of the wizard is created here
			var oSelectDeployABAPSystemStepService = this.oContext.service.selectabapsystemstep;

			return oSelectDeployABAPSystemStepService.getContent().then(function(oSelectABAPSystemStep) {
				var oSelectABAPSystemStepContent = oSelectABAPSystemStep.getStepContent();

				that.deployWizard = sap.ui.getCore().byId("DeployWizard");

				if (that.deployWizard) {
					that.deployWizard.destroy();
				}

				var sTitle = that.oContext.i18n.getText("DeployWizard_DeploySAPUI5ABAPRepository");
				var sSummary = that.oContext.i18n.getText("DeployWizard_ClickFinish");

				/*
				 * OnFinish
				 */
				var _fnFinishClicked = function() {
					// start the progress bar
					return that.oContext.service.progress.startTask().then(function(sGeneratedTaskId) {
						taskId = sGeneratedTaskId; // save the task ID

						var oModel = that.deployWizard.getModel();
						//init the sEventValue value for the usage analytics reports
						if (oModel.getProperty("/selectedPackage").toUpperCase() === "$TMP" && oModel.action === "CreateKey") {
							sEventValue = "new_local";
						} else if (oModel.getProperty("/selectedPackage").toUpperCase() !== "$TMP" && oModel.action === "CreateKey") {
							sEventValue = "new_non_local";
						} else if (oModel.getProperty("/selectedPackage").toUpperCase() === "$TMP" && oModel.action === "UpdateKey") {
							sEventValue = "update_local";
						} else if (oModel.getProperty("/selectedPackage").toUpperCase() !== "$TMP" && oModel.action === "UpdateKey") {
							sEventValue = "update_non_local";
						}
						
						return _doDeploy(oSelectedDocument, oModel);
					});
				};

				return oWizardService.createWizard("DeployWizard", sTitle, "", [oSelectABAPSystemStep], sSummary, _fnFinishClicked).then(function(oWizard) {

					that.deployWizard = oWizard;

					var model = that.deployWizard.getModel();
					return oSelectedDocument.getProject().then(function(oProjectDocument) { // User may select any file/folder belonging to the project
						return that.oContext.service.abaprepository.getDeploymentSettings(oProjectDocument).then(function(settings) {
							if (settings) { //deploy second time. need to update the model
								// model.destination = settings.destination;
								model.name = settings.name;
								model.jsonDestination = settings.destination; // fot detect when user change a system
							}

							oSelectABAPSystemStepContent.setWizardControl(that.deployWizard);

							that.deployWizard.open();

							//in case we change deploy operation (from create to update and vice versa) we need to remove
							//previously added steps. except for the first step.
							that.deployWizard.removeSteps = function(stepIndex) {

								if (!stepIndex) {
									stepIndex = this.currentVisibleStep - 1;
								}

								var stepsQuantity = this.getStepsNumber();
								// remove all steps after the current step.  We must remove before we create a new step (getContent)
								for (var i = stepsQuantity - 1; i > stepIndex - 1; i--) {
									var oWizardStep = this.getStepAtIndex(i);
									that.deployWizard.removeStep(oWizardStep);
								}

								// set the next step index of the last step to be undefined.
								this.getStepAtIndex(this.getStepsNumber() - 1).setNextStepIndex(undefined);
								this.removeFinishStep();
							};

							var onSummaryChange = function(oEvent) {
								if (oEvent.getParameter("id") === "transportStatus" && oEvent.getParameter("status") === "LOCKED") {
									var oModel = this.getModel();
									var sProjectSummaryMessage;
									if (oModel.transport) { // transport defined
										sProjectSummaryMessage = that.oContext.i18n.getText("i18n", "DeployWizard__LockedSummaryMsg", [oModel.getData().name,
											oModel.transport, " "]);
									} else {
										sProjectSummaryMessage = that.oContext.i18n.getText("i18n", "DeployWizard__LockedSummaryMsg", [oModel.getData().name, "",
											" "]);
									}

									var sClickFinishMessage = that.oContext.i18n.getText("DeployWizard_ClickFinish");
									this.setSummary(sProjectSummaryMessage + sClickFinishMessage);
								}
							};

							that.deployWizard.addTransportStep = function() {
								var oSelectTransportStepService = that.oContext.service.selecttransportstepservice;
								oSelectTransportStepService.getContent().then(function(transportStep) {
									var transportStepContent = transportStep.getStepContent();
									transportStepContent.setWizardControl(that.deployWizard); // send the wizard to the step
									that.deployWizard.addStep(transportStep); // adding create application step
								}).done();
							};

							that.deployWizard.addSteps = function(actionKey) {
								var oSelectTransportStepService = that.oContext.service.selecttransportstepservice;
								if (actionKey === "CreateKey") {
									var oCreateApplicationStepService = that.oContext.service.createapplicationstepservice;
									var promises = [];
									promises.push(oCreateApplicationStepService.getContent());
									promises.push(oSelectTransportStepService.getContent());
									return Q.all(promises).spread(function() {
										var createApplicationStep = arguments[0];
										var transportStep = arguments[1];
										var createAppStepContent = createApplicationStep.getStepContent();
										createAppStepContent.attachValueChange(onSummaryChange, that.deployWizard);
										oSelectABAPSystemStepContent.attachValueChange(createAppStepContent.onNoteStatusChange, createAppStepContent);
										createAppStepContent.setWizardControl(that.deployWizard); //send the wizard to the step
										var transportStepContent = transportStep.getStepContent();
										transportStepContent.setWizardControl(that.deployWizard); // send the wizard to the step
										that.deployWizard.addStep(createApplicationStep); // adding create application step
										that.deployWizard.addStep(transportStep); // adding transports step
									});
								} else { //updateKey
									var oSelectapplicationstepservice = that.oContext.service.selectapplicationstepservice;
									return oSelectapplicationstepservice.getContent().then(function(selectAppStepContent) {
										return oSelectTransportStepService.getContent().then(function(transportStep) {
											oSelectABAPSystemStepContent.attachValueChange(oSelectABAPSystemStepContent.onNoteStatusChange,
												oSelectABAPSystemStepContent);
											selectAppStepContent.getStepContent().setWizardControl(that.deployWizard);
											transportStep.getStepContent().setWizardControl(that.deployWizard);
											that.deployWizard.addStep(selectAppStepContent);
											that.deployWizard.addStep(transportStep); // adding transports step
										});
									});
								}
							};

							return that.deployWizard;
						});
					});
				});
			});
		};

		this._setPlatformBlock = function(document, oModel) {
			return that.oContext.service.ui5projecthandler.isManifestProjectGuidelinesType(document).then(function (isManifest) {
				if (isManifest) {
					return Q.all([that.oContext.service.ui5projecthandler.getHandlerFilePath(document),
						that.oContext.service.ui5projecthandler.getAttribute(document, "sap.platform.abap")]).spread(function (pathToManifestJson, oContent) {
						// build the uri
						return that._buildURI(oModel, pathToManifestJson).then(function (sUri) {
							oContent.uri = sUri; // block returned empty if not found - overwrite uri or create a new one
							return that.oContext.service.ui5projecthandler.setABAPPlatformBlock(document, oContent);
						});
					});
				}
			});
		};

		var getABAPExecuteUri = function(destination) {
			return that.oContext.service.destination.getDestinations("ui5_execute_abap").then(function(aDestinations) {
				for (var i = 0; i < aDestinations.length; i++) {
					if (aDestinations[i].systemId === destination.systemId) {
						return aDestinations[i].path;
					}
				}
				
				return "/sap/bc/ui5_ui5"; //default value in case destination of type ui5_execute_abap is not defined
			});
		};

		/*
		 * build URI to sources in abap
		 * e.g. sap/bc/ui5_ui5/<namespace>/<>application name>/<path to manifest e.g.webapp>
		 */
		this._buildURI = function(oModel, pathToManifestJson) {
			var name = oModel.getProperty("/name");

			// get the application's namespace (default is "sap")
			return that.oContext.service.abaprepository.getAppNamespace(name).then(function(sNamespace) {
				
				if (sNamespace === DEFAULT_NAMESPACE) {
					name = "/" + sNamespace + "/" + name;
				} // else the name already contains the namespace
				
				// e.g. "/sap/bc/ui5_ui5/"
				return getABAPExecuteUri(oModel.destination).then(function(ui5ExecuteABAP) {
					var uri = ui5ExecuteABAP + name;
	
					var index = pathToManifestJson.indexOf("/", 1);
					if (index > -1) { // manifest is not directly under root, we need to add the inner structure to the uri (which already has the name of application in abap).
						var pathWithoutFolderName = pathToManifestJson.substring(index,pathToManifestJson.length);
						uri = uri + pathWithoutFolderName;
					}
					
					return (uri.toLowerCase());
				});
			});
		};

		var _doDeploy = function(oSelectedDocument, oModel) {
			//set platform block in manifest
			return that._setPlatformBlock(oSelectedDocument, oModel).then(function(){
				//Trigger build (if required)
				return that.oContext.service.builder.isBuildSupported(oSelectedDocument).then(function (bIsBuildSupported) {
					if (bIsBuildSupported) {
						return that.oContext.service.builder.build(oSelectedDocument).then(function () {
							return that.oContext.service.builder.getTargetFolder(oSelectedDocument).then(function (oTargetFolderDocument) {
								oSelectedDocument = oTargetFolderDocument;
							});
						});
					}
				});
			}).then(function() {
				return that._getApplication(oSelectedDocument, oModel).then(function(application) {
					if (oModel.action === "CreateKey") {
						that._createApplication(application, oModel, oSelectedDocument).fail(function(oError) {
							handleError(oError);
						}).done();
					} else if (oModel.action === "UpdateKey") {
						that._updateApplication(application, oModel, oSelectedDocument).fail(function(oError) {
							handleError(oError);
						}).done();
					}
					return Q();
				}).fail(function(oError) {
					handleError(oError);
				});
			}).fail(function(oError) {
				handleError(oError);
			});
		};

		// creates application object based on selected project document
		this._getApplication = function(oRootDocument, oModel) {
			// create application object
			return that.oContext.service.workspaceapplicationfactory.getApplicationFromWorkspace(oRootDocument).then(function(application) {
				// populate more data from the wizard model to the application object
				if (oModel.getProperty("/s4HanaAppNamePrefix") && oModel.action !== "UpdateKey") { //in update we already have the prefix, no need to add it.
					application.name = oModel.getProperty("/s4HanaAppNamePrefix") + oModel.getProperty("/name");
				} else {
					application.name = oModel.getProperty("/name");
				}
				application.package = oModel.getProperty("/selectedPackage");
				application.description = oModel.getData().description;
				application.transport = oModel.transport;

				return application;
			});
		};

		// creates a new application in ABAP Repository
		this._createApplication = function(application, model, oDocument) {
			// the selected action in the transports step
			var transportAction = model.transportAction;
			var discoveryStatus = model.discoveryStatus;
			// if the user selected to create a new transport
			if (transportAction === "new") {
				// create a new transport request and then create the application
				return that.oContext.service.transport.createTransport(model.getData().selectedPackage, application.name, model.transportDescription,
					model.destination).then(function(transport) {
						// set the new transport in the application object
						application.transport = transport;
						return executeCreateApplication(discoveryStatus, application, oDocument);
					});
			} else {
				return executeCreateApplication(discoveryStatus, application, oDocument);
			}
		};

		var executeCreateApplication = function(discoveryStatus, application, oDocument) {
			// lite info
			that.oContext.service.usernotification.liteInfo(that.oContext.i18n.getText("i18n", "DeployWizard_DeployInProcess"), false).done();

			// console
			that.oContext.service.log.info(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
				that.oContext.i18n.getText("i18n", "DeployWizard_DeployInProcess"), ["user"]).done();

			return that.oContext.service.abaprepository.createApplication(discoveryStatus, application).then(function() {
				var applicationRemoteName = application.name;
				var applicationLocalPath = application.localPath;
				var modelDestination = that.deployWizard.getModel().destination;

				return that.oContext.service.abaprepository.updateProjectJsonWithDeploy(applicationRemoteName, applicationLocalPath,
					modelDestination).then(function() {
						
						// stop the progress bar
						that.oContext.service.progress.stopTask(taskId).done();

						// lite info
						that.oContext.service.usernotification.liteInfo(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogSuccessMsg"), true).done();
						// console
						that.oContext.service.log.info(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
							that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogSuccessMsg"), ["user"]).done();
						// report when the deployment succeeds
						that.oContext.service.usagemonitoring.report("deployment", "deploy_to_abap", sEventValue).done();
					});
			}).fail(function(oError) {
				handleError(oError);
			});
		};

		var getErrorMessage = function(responseText) {
			var responseXml = xmlUtil.stringToXml(responseText);
			var messageTag = xmlUtil.getChildByTagName(responseXml.childNodes[0], "message");
			return messageTag.textContent;
		};

		var handleUpdate = function(application, aSyncActions, oDocument) {
			var discoveryStatus = that.deployWizard.getModel().discoveryStatus;

			// lite info
			that.oContext.service.usernotification.liteInfo(that.oContext.i18n.getText("i18n", "DeployWizard_DeployInProcess"), false).done();
			// console
			that.oContext.service.log.info(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
				that.oContext.i18n.getText("i18n", "DeployWizard_DeployInProcess"), ["user"]).done();

			return that.oContext.service.abaprepository.updateApplication(discoveryStatus, application, aSyncActions).then(function() {
				var applicationRemoteName = application.name;
				var applicationLocalPath = application.localPath;
				var modelDestination = that.deployWizard.getModel().destination;

				return that.oContext.service.abaprepository.updateProjectJsonWithDeploy(applicationRemoteName, applicationLocalPath,
					modelDestination).then(function() {
						
						// stop the progress bar
						that.oContext.service.progress.stopTask(taskId).done();
						// lite info
						that.oContext.service.usernotification.liteInfo(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogSuccessMsg"), true).done();
						// console
						that.oContext.service.log.info(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"),
							that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogSuccessMsg"), ["user"]).done();
						that.oContext.service.usagemonitoring.report("deployment", "deploy_to_abap", sEventValue).done();
					});
			}).fail(function(oError) {
				handleError(oError);
			}).fail(function(oError) {
				handleError(oError);
			});
		};

		var confirmUpdate = function(destination, application, oDocument) {
			//get BSP system project files list as resourcesInfo
			return that.oContext.service.bspparentproject.getFileResourcesInfo(application.name, destination, application.localProjectName).then(function(aResourcesInfo) {
				//sync the files structure by updating the application object
				var aSyncActions = oApplicationSyncUtility.sync(application, aResourcesInfo);
				// get the list of files in the projects in orion workspace
				return that.oContext.service.usernotification.confirm(oDeploymentUtility.buildUpdateMessage(aSyncActions, that.oContext)).then(
					function(oRet) {
						if (oRet.sResult === "NO") {
							// stop the progress bar
							that.oContext.service.progress.stopTask(taskId).done();
							return Q();
						}

						return handleUpdate(application, aSyncActions, oDocument);
					});
			});
		};

		var handleError = function(oError) {
			// stop the progress bar
			that.oContext.service.progress.stopTask(taskId).done();

			// lite info
			that.oContext.service.usernotification.liteInfo(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogFailureMsg"), true).done();
			// report that the deployment failed	
			that.oContext.service.usagemonitoring.report("deployment", "deploy_to_abap", sEventValue + "_failed").done();

			if (oError.responseText) {
				// parse the responseText to get the exact error message
				var errorMessage = getErrorMessage(oError.responseText);
				that.oContext.service.log.error(that.oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogTitle"), errorMessage, ["user"]).done();
				that.oContext.service.usernotification.alert(errorMessage).done();
			} else {
				that.oContext.service.usernotification.alert(decodeURIComponent(oError.message)).done();
			}
		};

		// update an existing application
		this._updateApplication = function(application, oModel, oDocument) {
			var destination = oModel.destination;

			application.package = oModel.getData().selectedPackage;
			application.description = oModel.getData().appDescription;
			application.transport = oModel.transport;
			var transportAction = oModel.transportAction;

			if (transportAction === "new") {
				// create a new transport request and then create the application
				return that.oContext.service.transport.createTransport(oModel.getData().selectedPackage, application.name, oModel.transportDescription,
					destination).then(function(transport) {
						// set the new transport in the application object
						application.transport = transport;
						//execute update application
						return confirmUpdate(destination, application, oDocument);
					});
			} else {
				//execute update application
				return confirmUpdate(destination, application, oDocument);
			}
		};

		/* eslint-enable no-use-before-define */

		return {
			openWizard: _openWizard,
			// Internal functions - returned for tests
			_createApplication: this._createApplication,
			_getApplication: this._getApplication,
			_updateApplication: this._updateApplication,
			_setPlatformBlock:this._setPlatformBlock,
			_buildURI:this._buildURI,
			_doDeploy: _doDeploy
		};
	});