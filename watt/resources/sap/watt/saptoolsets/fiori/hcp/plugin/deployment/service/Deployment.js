define(["../util/OrionGit", "sap/watt/lib/lodash/lodash"], function(orionGitServices, _) {
	"use strict";

	var RESULT_INFO_FORBIDDEN = "Forbidden";
	return {
		_appEntity: null,
		_oDocument: null,
		_oAuthView: null,
		_projectDocument: null,
		_sEventValue: null,
		_systemInfo: {
			appname: null,
			deployedappname: null,
			account: null,
			username: null
		},
		NEO_APP_FILE_NAME: "neo-app.json",

		//This method is called only once. 
		init: function() {
			// The user from the Git settings will be set when the dialog is being opened
			orionGitServices._initService(this.context);
		},

		_setStatusView: function() {
			var oContext = this.context;
			if (!this._oStatusView) {
				this._oStatusView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.common.plugin.applicationstatus.view.ApplicationStatusDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: oContext
					}
				});
			}
		},

		_getAuthenticationView: function() {
			var oContext = this.context;
			if (!this._oAuthView) {
				this._oAuthView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.hcp.plugin.deployment.view.DeploymentDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: oContext
					}
				});
			}
		},

		_setErrorMsgInDialog: function(errMsg, disableDeployButton) {
			//build result and update the dialog, dont close it.
			this._oAuthView.getController().reportError(this._getText(errMsg), disableDeployButton);
			this._oAuthView._oDlg.setBusy(false);
		},

		_handleDeployErrors: function(that, result) {
			// lite info - failure
			that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "DeployLogFailureMsg"), true).done();
			// report when the deployment failed	
			that.context.service.usagemonitoring.report("deployment", "deploy_to_hcp", that._sEventValue + "_failed").done();
			if (typeof result.action !== "undefined") {
				if (result.info === "Unauthorized") {
					that._setErrorMsgInDialog("msg_unauthorized");
					return;
				}

				if (result.info === RESULT_INFO_FORBIDDEN && result.status === 403) {
					// handle case of missing permissions:
					that._setErrorMsgInDialog("msg_forbidden");
					return;
				}

				switch (result.action) {
					case "hcp_build":
						that._oAuthView.getController().close();
						that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "deployment_cannotbuild", [result.message])).done();
						break;
					case "hcp_connectivity_getapps":
						that._setErrorMsgInDialog("msg_hcp_connectivity_getapps");
						break;
					case "hcp_connectivity_createapp":
						if (result.status === 409) {
							that._setErrorMsgInDialog("msg_heliumapp_exist");
						} else {
							that._setErrorMsgInDialog("msg_heliumapp_notcreated");
						}
						break;
					case "hcp_connectivity_getappinfo":
						that._setErrorMsgInDialog("msg_hcp_connectivity_getappinfo");
						break;
					case "orion_initrepo":
						that._setErrorMsgInDialog("msg_initrepo");
						break;
					case "orion_getremotes":
						that._setErrorMsgInDialog("msg_getremotes");
						break;
					case "orion_addremote":
						that._setErrorMsgInDialog("msg_addremote");
						break;
					case "orion_deleteremote":
						that._setErrorMsgInDialog("msg_deleteremote");
						break;
					case "orion_fetchfromremote":
						that._setErrorMsgInDialog("msg_fetchfromremote");
						break;
					case "orion_getstatus":
						that._setErrorMsgInDialog("msg_getstatus");
						break;
					case "orion_stage":
						that._setErrorMsgInDialog("msg_stage");
						break;
					case "orion_commit":
						that._setErrorMsgInDialog("msg_commit");
						break;
					case "orion_merge":
						that._setErrorMsgInDialog("msg_merge");
						break;
					case "orion_merge_conflicts":
						that._setErrorMsgInDialog("msg_merge_conflicts", true);
						break;
					case "orion_pushtoremote":
						if (result.oErrorPushResponse && result.oErrorPushResponse.oPushedCommit && result.oErrorPushResponse.oPushedCommit.Message === "invalid committer") {
							that._setErrorMsgInDialog("msg_invalid_committer");
						} else {
							that._setErrorMsgInDialog("msg_heliumapp_created");
						}
						break;
					case "unsupported_deployment":
						that._setErrorMsgInDialog("msg_unsupported_deployment");
						break;
					case "app_version_exists":
						//Here we disable the deploy since if adding the version failed it means that the applciation
						//was created and in order to have the state correct in our flow we need the dialog to be
						//reloaded.
						that._setErrorMsgInDialog("msg_version_exists", true);
						break;
					case "heliumActivateApp":
						that._setErrorMsgInDialog("msg_activate_app");
						break;
					default:
						that._setErrorMsgInDialog("msg_unhandled_error");
						break;
				}
				return;
			}
			var resultObj = {
				title: "dlg_error",
				message: "msg_fail_heliumservices",
				info: "" // Nothing we can say - we don't know the reason of the failure
			};
			that._oAuthView.getController().close(resultObj);
		},

		ApplicationStatus: function(oSelection) {
			var that = this;
			return that.initializeParams(oSelection).then(function() {
				that._setStatusView();
				var action = {
					helium: that._systemInfo,
					projectDocument: that._projectDocument
				};

				// handle missing Git settings
				return that.context.service.gitdispatcher.verifyUserInfo(that._projectDocument.getEntity()).then(function() {
					return that._oStatusView.getController().open(action, oSelection);
				}).fail(function() {
					that.context.service.usernotification.warning(that._getText("msg_gitconfig")).done();
				});
			});
		},

		getDeploymentCase: function(sUsername, sPassword, sAccount) {
			var that = this;
			var oContext = this.context;
			var appGit = that._appEntity.getBackendData().git;
			var deploymentCase = {
				firstDeployment: true,
				gitURL: "",
				isGitUrlAlive: false,
				useHCPForSCAndDeployment: true,
				HCPAppName: ""
			};
			//If there is not git repository on orion then this is the first deployment and HCP is used for both SC and deployment
			if (!appGit) {
				return Q(deploymentCase);
			}
			//We need the git remotes in order to know if HCP is used for both source control and deployment or not
			return orionGitServices._getRemotesOfOrionGit(appGit).then(function(remotes) {
				//From the remotes we need to find if there is an HCP remote
				var remoteURLS = _.map(remotes.Children, "GitUrl");

				//Theoretically remoteURLS.length may be 0 although currently there is no flow in Web-IDE that can create this and in this case the default
				//values of the returned object are valid.
				if (remoteURLS.length > 0) {
					return oContext.service.hcpconnectivity.getHCPRemoteGitURL(remotes).then(function(hcpRemoteGitURL) {
						//Check if this is the first deployment
						if (hcpRemoteGitURL) {
							deploymentCase.firstDeployment = false;
						} else {
							deploymentCase.firstDeployment = true;
						}

						//update the git URL:
						if (!deploymentCase.firstDeployment) {
							deploymentCase.gitURL = hcpRemoteGitURL;
						}

						var numOfHCPRemotes = hcpRemoteGitURL ? 1 : 0;

						//Do we have to use HCP for both SC and deployment?
						if (remoteURLS.length > numOfHCPRemotes) { //remotesURLS contains all hcpRemoteGitURLS
							deploymentCase.useHCPForSCAndDeployment = false;
						}

						//Update the HCP app name in case it exists
						if (numOfHCPRemotes > 0) {
							//We assume that currently the remotes cannot include more than one remote from HCP. 
							//The only flow currently that adds/removes remotes is the deployment flow and it should maintain this assumption
							var hcpGitUrl = hcpRemoteGitURL;
							//Check if this application exists in HCP, it may have been deleted!
							return oContext.service.hcpconnectivity.getHCPAppNameByGitURL(hcpGitUrl, sUsername, sPassword, sAccount).then(function(app) {
								if (app) {
									deploymentCase.HCPAppName = app;
									//If the application exists in HCP we assume that the git repository is alive
									deploymentCase.isGitUrlAlive = true;
									return deploymentCase;
								} else {
									//If the application was deleted we have to check if its git repository on hcp was deleted or not
									return orionGitServices._fetchFromRemoteGit(appGit, sUsername, sPassword).then(function() {
										//If the fetch call succeded then the repository exists although the application was deleted
										deploymentCase.isGitUrlAlive = true;
										return deploymentCase;
									}).fail(function() {
										//If the fetch call fails then the repository doesn't exist and it was deleted with the application
										deploymentCase.isGitUrlAlive = false;
										return deploymentCase;
									});
								}
							});
						} else {
							return deploymentCase;
						}
					});
				}
				return deploymentCase;
			});
		},

		/* eslint-disable max-params */
		//The following 5 helper functions do the prefix of the deployment process. The rest of the deployment process is shared among them and 
		//is handled in the execution of the deployment.
		_handleNewApplicationPrefix: function(sAccount, sUsername, sPassword, deployedAppName, gitURL) {
			/* eslint-enable max-params */
			var appInfo = null;
			var appGit = this._appEntity.getBackendData().git;
			var that = this;
			// Create an empty app
			return this.context.service.hcpconnectivity.createApp(sAccount, sUsername, sPassword, deployedAppName, gitURL).then(function() {
				// Get the app info - the app git URL and the app URL
				return that.context.service.hcpconnectivity.getAppInfo(sAccount, sUsername, sPassword, deployedAppName);
			}).then(function(info) {
				appInfo = info;
			}).then(function() {
				if (!appGit) {
					// Create an Orion git if the project doesn't have one
					return orionGitServices._initOrionGitRepo(that._appEntity.getName(), that._appEntity.getBackendData().location).then(function() {
						return that.context.service.filesystem.documentProvider.getDocument(that._appEntity.getName());
					}).then(function(oUpdatedProjectDocument) {
						that._projectDocument = oUpdatedProjectDocument;
						that._appEntity = that._projectDocument.getEntity();
						appGit = that._appEntity.getBackendData().git;
						return orionGitServices._setRepoConfigurations(appGit);
					});
				} else {
					//If the appGit exists then the project was cloned from a remote that is not HCP therefore we just need to add the new HCP git repo to the remotes
					/*eslint-disable consistent-return*/
					return;
					/*eslint-enable consistent-return */
				}
			}).then(function() {
				// prepare the block that will be written to hcpdeploy block in .project.json
				var oSetting = {
					account: sAccount,
					name: deployedAppName
				};
				// write to .project.json -> doing it here so the updated .project.json will be pushed to Git as well
				return that.context.service.setting.project.setProjectSettings("hcpdeploy", oSetting, that._oDocument).fail(function() {
					// if the write to the project.json has failed, the error will be logged.
					// continue with the deployment
					return;
				});
			}).then(function() {
				// Set the HCP git as a remote repository of the Orion git
				return orionGitServices._addHeliumAsOrionRemoteGit(appGit, appInfo.repository);
			}).then(function() {
				return appInfo;
			});
		},

		_handleFirstDeploymentPrefix: function(sAccount, sUsername, sPassword, deployedAppName) {
			//The application was not deployed to HCP and this is the first deployment from Web-IDE
			return this._handleNewApplicationPrefix(sAccount, sUsername, sPassword, deployedAppName);
		},

		_handleApplicationStillExistsPrefix: function(sAccount, sUsername, sPassword, deployedAppName) {
			//This is the case that the application was already deployed and it still exists on HCP
			return this.context.service.hcpconnectivity.getAppInfo(sAccount, sUsername, sPassword, deployedAppName).fail(function() {
				throw new Error(this.context.i18n.getText("i18n", "msg_error_connecting_hcp"));
			});
		},

		_handleApplicationDeletedGitDeletedPrefix: function(sAccount, sUsername, sPassword, deployedAppName) {
			//This is the same as creating a new application with a minor change that we need to remove the old HCP git repo from the remotes of the orion git repo
			//We assume that we have one remote and it's alias is "origin"
			var that = this;
			return orionGitServices._deleteRemoteOrionGit(this._appEntity.getBackendData().git, "origin").then(function() {
				return that._handleNewApplicationPrefix(sAccount, sUsername, sPassword, deployedAppName);
			});
		},

		/* eslint-disable max-params */
		_handleApplicationDeletedGitExistsPrefix: function(sAccount, sUsername, sPassword, deployedAppName, gitURL) {
			/* eslint-enable max-params */
			//In this case we create an application on HCP with the already existing HCP git repo
			return this._handleNewApplicationPrefix(sAccount, sUsername, sPassword, deployedAppName, gitURL);
		},

		//This method is called each time we deploy or get the deployment status
		// it initializes variables on "this"
		initializeParams: function(oSelection) {
			var that = this;
			var oDocument = oSelection.document;
			that._oDocument = oDocument;
			return oDocument.getProject().then(function(oProjectDoc) {
				that._projectDocument = oProjectDoc;
				that._appEntity = oProjectDoc.getEntity();
				that._systemInfo.appname = that._appEntity.getName();

				var oAction = {
					helium: that._systemInfo,
					projectDocument: that._projectDocument,
					entity: that._projectDocument.getEntity()
				};

				var oGit = oAction.entity.getBackendData().git;
				// if the app has git then the account name will be taken from the Git repository URL
				// otherwise it will be the webide default account
				if (oGit) {
					return that.context.service.hcpconnectivity.getHCPAccountByGitURL(oGit).then(function(sAccount) {
						if (sAccount) {
							oAction.helium.account = sAccount;
							return oAction;
						} else {
							return that._getDefaultAccount().then(function(sAccount) {
								oAction.helium.account = sAccount;
								return oAction;
							});
						}
					});
				} else {
					return that._getDefaultAccount().then(function(sAccount) {
						oAction.helium.account = sAccount;
						return oAction;
					});
				}
			});
		},

		_initDeployedAppName: function(deploymentCase) {
			if (deploymentCase.HCPAppName !== "") {
				this._systemInfo.deployedappname = deploymentCase.HCPAppName;
				return;
			}
			//If we didn't get the name from HCP then we take the project name and make it suitable to be a name for an application on HCP
			var name = this._systemInfo.appname;
			var RegEx = /^[a-z][0-9a-z]*$/;
			if (name.length > 30) {
				// cut the app name to match 30 chars
				name = name.substring(0, 30);
			}
			if (!RegEx.test(name)) {
				// remove all special characters
				name = name.replace(/[^a-z\d\s]+/gi, "");
			}
			this._systemInfo.deployedappname = name.toLowerCase();
			return;
		},

		_getAppInfoAnyCase: function(deploymentCase, sAccount, sUsername, sPassword, deployedAppName) {
			if (deploymentCase.firstDeployment) {
				return this._handleFirstDeploymentPrefix(sAccount, sUsername, sPassword, deployedAppName);
			} else if (!deploymentCase.firstDeployment && deploymentCase.HCPAppName !== "") {
				//In this case we take the name from the deploymentCase since it cannot be changed by the user in the UI
				return this._handleApplicationStillExistsPrefix(sAccount, sUsername, sPassword, deploymentCase.HCPAppName);
			} else if (!deploymentCase.firstDeployment && deploymentCase.HCPAppName === "" && !deploymentCase.isGitUrlAlive) {
				return this._handleApplicationDeletedGitDeletedPrefix(sAccount, sUsername, sPassword, deployedAppName);
			} else if (!deploymentCase.firstDeployment && deploymentCase.HCPAppName === "" && deploymentCase.isGitUrlAlive) {
				return this._handleApplicationDeletedGitExistsPrefix(sAccount, sUsername, sPassword, deployedAppName, deploymentCase.gitURL);
			}
		},

		// Add "cacheControl" block to the neo-app.json of the project.
		// Only add it if a neo-app.json file exists
		_addCacheControls: function(oProjectDocument) {
			var that = this;
			return oProjectDocument.objectExists(this.NEO_APP_FILE_NAME).then(function(bNeoappExists) {
				if (bNeoappExists) {
					var aCacheControls = [];

					var oCacheControl = {
						"path": "*html",
						"directive": "private",
						"maxAge": 0
					};
					aCacheControls.push(oCacheControl);
					
					oCacheControl = {
						"path": "sap-ui-cachebuster-info.json",
						"directive": "private",
						"maxAge": 0
					};
					aCacheControls.push(oCacheControl);

					oCacheControl = {
						"directive": "public",
						"maxAge": 31536000
					};
					aCacheControls.push(oCacheControl);

					return that.context.service.neoapp.addCacheControls(aCacheControls, oProjectDocument, false); // don't override
				}
			});
		},

		_setHCPPlatformBlock: function(oProjectDocument) {
			var that = this;
			return that.context.service.ui5projecthandler.isManifestProjectGuidelinesType(oProjectDocument).then(function(isManifest) {
				if (!isManifest) {
					return Q();
				}
				return Q.all([that.context.service.ui5projecthandler.getHandlerFilePath(oProjectDocument),
						that.context.service.ui5projecthandler.getAttribute(oProjectDocument, "sap.platform.hcp")
					])
					.spread(function(pathToManifestJson, oHCPPlatformBlock) {
						//The path to the manifest is relative to the project and shouldn't start with a slash
						var pathToManifestExcludingProject = _.drop(pathToManifestJson.split("/"), 2).join("/");
						oHCPPlatformBlock.uri = pathToManifestExcludingProject; //block returned empty if not found - overwrite uri or create a new one

						return that.context.service.ui5projecthandler.setHCPPlatformBlock(oProjectDocument, oHCPPlatformBlock);
					});
			});
		},

		deployToHelium: function(oSelection) {
			var that = this;
			var oContext = this.context;
			var appGit = null;
			var appInfo;
			var deploymentCase = null;

			this._getAuthenticationView();
			return that.initializeParams(oSelection).then(function(oDeployAction) {

				oDeployAction.buttonText = "setting_deploy";

				/* eslint-disable max-params */
				oDeployAction.execution = function(appName, deployedAppName, sAccount, sUsername, sPassword, sVersion, bActivate) {
					/* eslint-enable max-params */
					// lite info
					oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "DeployInProcess"), false).done();
					var thatThat = this;

					if (!deploymentCase.useHCPForSCAndDeployment) {
						//If we got here then we are using more than one git remote and HCP is used for deployment only
						//Will be implemented next sprint
						var oError = new Error();
						oError.action = "unsupported_deployment";
						return that._handleDeployErrors(that, oError);
					}

					that._setHCPPlatformBlock(thatThat.projectDocument).fail(function(oSetError) {
						// if for some reason we failed to write to the manifest.json we shouldn't fail the entire deployment.
						// write the error to the log and continue
						oContext.service.log.warn("Deployment", oContext.i18n.getText("i18n", "AddUriToManifestFailed", [oSetError.message]), ["user"]).done();
					}).then(function() {
						// Trigger build (if required)
						return that.context.service.builder.isBuildRequired(thatThat.projectDocument).then(function(bIsBuildRequired) {
							if (bIsBuildRequired) {
								return that.context.service.builder.build(thatThat.projectDocument);
							}
						});
					}).then(function() {
						return that._getAppInfoAnyCase(deploymentCase, sAccount, sUsername, sPassword, deployedAppName).then(function(_appInfo) {
							appGit = that._appEntity.getBackendData().git;
							appInfo = _appInfo;
							return that.context.service.setting.project.getProjectSettings("hcpdeploy", thatThat.projectDocument);
						}).then(function(oSetting) {
							if (!oSetting) {
								oSetting = {
									account: sAccount,
									name: deployedAppName
								};
							}
							oSetting.lastVersionWeTriedToDeploy = sVersion;
							return that.context.service.setting.project.setProjectSettings("hcpdeploy", oSetting, thatThat.projectDocument).fail(function() {
								// if the write to the project.json has failed, the error will be logged.
								// continue with the deployment
								return;
							});
						}).then(function() {
							// Add "cacheControl" block to the neo-app.json of the project.
							// Only add it if a neo-app.json file exists and do not override the current value if such a block already exists.
							// Add it here so it will be added even if the Git commands have failed, becuase the user can perform them manually.
							return that._addCacheControls(thatThat.projectDocument).fail(function(oErrorObj) {
								// if the update of neo-app.json has failed we don't want to fail the deployment
								oContext.service.log.warn("Deployment", oContext.i18n.getText("i18n", "AddCacheControlToNeoappFailed", [oErrorObj.message]), [
									"user"
								]).done();
							});
						}).then(function() {
							// Fetch/get status/stage/commit/merge in order to sync the remote (HCP) into the local (Orion)
							return orionGitServices._fetchFromRemoteGit(appGit, sUsername, sPassword);
						}).then(function() {
							return orionGitServices._getStatusOrionGit(appGit);
						}).then(function(status) {
							var pathsOfFilesToStage = _.map(status, "Path");
							return orionGitServices._stageChangesOrionGit(appGit, pathsOfFilesToStage);
						}).then(function() {
							return orionGitServices._commitChangesOrionGit(appGit, "Commit of version: " + sVersion);
						}).then(function() {
							return orionGitServices._rebaseChangesOrionGit(appGit).fail(function() {
								//Assuming that our project is still selected we reset the git pane to be visible
								oContext.service.gitclient.setVisible(true);
								var _oError = new Error();
								_oError.action = "orion_merge_conflicts";
								throw _oError;
							});
						}).then(function() {
							// Push from Orion to HCP
							return orionGitServices._pushAllToRemoteGit(appGit, sUsername, sPassword);
						}).then(function() {
							return oContext.service.hcpconnectivity.getAppCommits(sAccount, sUsername, sPassword, deployedAppName);
						}).then(function(appCommits) {
							if (sVersion && sVersion !== "") {
								var commitId = appCommits[0].commitId;
								return oContext.service.hcpconnectivity.setAppVersion(sAccount, sUsername, sPassword, deployedAppName, commitId, sVersion).fail(
									function(setAppVersionError) {
										//This may happen if the application was once deployed then deleted but its git repo was not deleted and then we try
										//to deploy with a version that already existed previously. This check doesn't happen in the UI like other checks
										//since in the UI we haven't redeployed the application again yet and therefore we have no idea what were the deployed
										//versions before it was deleted
										var _oError = new Error();
										_oError.action = "app_version_exists";
										// Did we get 403? If so, set the result to forbidden, thus overriding the specific action type 
										if (setAppVersionError && setAppVersionError.status === 403) {
											_oError.info = RESULT_INFO_FORBIDDEN;
											_oError.status = setAppVersionError.status;
										}
										throw _oError;
									});
							}
						}).then(function() {
							if (bActivate && sVersion && sVersion !== "") {
								return oContext.service.hcpconnectivity.activateApp(sAccount, sUsername, sPassword, deployedAppName, sVersion).then(function() {
									if (appInfo.status !== "STARTED") {
										return oContext.service.hcpconnectivity.startApp(sAccount, sUsername, sPassword, deployedAppName);
									}
								});
							}
						}).then(function() {
							// lite info - success
							oContext.service.usernotification.liteInfo(oContext.i18n.getText("i18n", "DeployLogSuccessMsg"), true).done();
							// report when the deployment succeed	
							oContext.service.usagemonitoring.report("deployment", "deploy_to_hcp", that._sEventValue).done();

							var result = {
								title: "dlg_success",
								message: "msg_afterdeployment",
								info: ""
							};

							if (!bActivate) {
								result.info = "msg_heliumapp_version";
							}

							if (bActivate) {
								result.info = "msg_heliumapp_started";
							}

							that._oAuthView.getController().close(result);
						}).finally(function() {
							//Refresh the repository browser. This also refreshes the content of the files.
							oContext.service.repositorybrowser.refresh().then(function() {
								// check if the project is connected to a git repository, because we can reach here even if there was a failure
								return oContext.service.gitclient.isAvailable(thatThat.projectDocument).then(function(bIsAvailable) {
									if (bIsAvailable) {
										//This is done in order to update the status of the files in the git client since the decorations depends on them
										return oContext.service.gitclient.getStatus(thatThat.projectDocument.getEntity(), true).then(function() {
											return oContext.service.decoration.updateDecorations(thatThat.projectDocument, true);
										});
									}
								});
							}).fail(function() {
								//If the refresh or updating the decorations fails we just log that to the console.
								oContext.service.log.error("Deployment", oContext.i18n.getText("i18n", "RepoBrowserRefreshFailed"), ["user"]).done();
							}).done();
						}).fail(function(result) {
							return that._handleDeployErrors(that, result);
						}).done();
					}).fail(function(result) {
						return that._handleDeployErrors(that, result);
					}).done();
				};

				// handle missing Git settings
				return that.context.service.gitdispatcher.verifyUserInfo(oDeployAction.entity).then(function() {
					return oContext.service.hcpauthentication.authenticate().then(function(oUserCrad) {
						// pass down the credentials for further use in the flow
						that.credentials = oUserCrad;
						return that.getDeploymentCase(oUserCrad.username, oUserCrad.password, oDeployAction.helium.account).then(function(
							_deploymentCase) {
							deploymentCase = _deploymentCase;
							that._initDeployedAppName(deploymentCase);
							if (deploymentCase.firstDeployment) {
								that._oAuthView.getController().open(oDeployAction, "deploy", oDeployAction.entity.getBackendData().git,
									oSelection, that.credentials);
								that._sEventValue = "new";
							} else if (!deploymentCase.firstDeployment && deploymentCase.HCPAppName === "" && !deploymentCase.isGitUrlAlive) {
								that._oAuthView.getController().open(oDeployAction, "deletedGitNotExists", oDeployAction.entity.getBackendData().git,
									oSelection, that.credentials);
							} else if (!deploymentCase.firstDeployment && deploymentCase.HCPAppName === "" && deploymentCase.isGitUrlAlive) {
								that._oAuthView.getController().open(oDeployAction, "deletedGitExists", oDeployAction.entity.getBackendData().git,
									oSelection, that.credentials);
							} else {
								that._oAuthView.getController().open(oDeployAction, "redeploy", oDeployAction.entity.getBackendData().git,
									oSelection, that.credentials);
								that._sEventValue = "update";
							}
						}).then(function() {
							// remove the credentials after use
							that.credentials = undefined;
						}).fail(function() {
							that.context.service.usernotification.error(that._getText("msg_unhandled_error")).done();
						});
					}).fail(function() {
						//We don't want to show an error if the authentication was canceled.If there were authentication errors the authentication dialog will show the messages.
						return;
					});
				}).fail(function() {
					that.context.service.usernotification.warning(that._getText("msg_gitconfig")).done();
				});
			});
		},

		/*
		 * run the app on Helium, show in a pop up window
		 * @param {sUrl} the url of the deployed application on Helium
		 * @param {Window} oWindow optional, show preview in this window instead of showing in popup window
		 * @param {boolean} bNoFrame optional, run without preview frame
		 */
		_showDeployedApp: function(sUrl, oWindow, bNoFrame) {
			var oDeferred = Q.defer();
			/* eslint-disable no-undef */
			var sWrapperUrl = require.toUrl("sap/watt/ideplatform/plugin/preview/view/wrapper.html") + "?url=" + window.encodeURIComponent(sUrl);
			var oWin = oWindow ? oWindow : window.open("", "Deployment");
			/* eslint-enable no-undef */
			if (bNoFrame) {
				sWrapperUrl = require.toUrl(sUrl);
			} else {
				addEventListener("message", function(ev) {
					/* eslint-disable no-undef */
					if (!window.location.origin) {
						window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location
							.port : '');
					}
					if (ev.origin === window.location.origin) {
						/* eslint-enable no-undef */
						if (ev.data === "previewReady") {
							if (oWin && oWin.wrapper) {
								oDeferred.resolve(oWin.wrapper);
							} else {
								oDeferred.reject();
							}
						}
					}
				}, false);
			}
			if (oWin) {
				oWin.location.href = sWrapperUrl;
				oWin.focus();
			}
			return oDeferred.promise;
		},

		_getText: function(id) {
			if (this.context) {
				var i18n = this.context.i18n;
				return i18n.getText("i18n", id);
			}
			return id;
		},

		_getDefaultAccount: function() {
			return this.context.service.hcpconnectivity.getHCPDefaultAccount().then(function(sAccount) {
				return sAccount;
			});
		},

		getAppURI: function(sAccount, sUsername, sPassword, deployedAppName) {
			var appInfo;
			var that = this;
			return this.context.service.hcpconnectivity.getAppInfo(sAccount, sUsername, sPassword, deployedAppName).then(function(info) {
				appInfo = info;
				return that.context.service.hcpconnectivity.getAppCommits(sAccount, sUsername, sPassword, deployedAppName);
			}).then(function(r) {
				return {
					"activeURI": appInfo.url,
					"commitURI": appInfo.url + "/?hc_commitid=" + r[0].commitId
				};
			});
		}
	};
});