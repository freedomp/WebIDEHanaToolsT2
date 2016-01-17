define([], function() {

	var GitDispatcher = {

		_DEFAULT_LOG_LOCATION: "from_pane",

		_oAuthenticationView: null,
		_oFetchView: null,
		_oBranchesView: null,
		_oUserInfoDialog: null,
		_oStashDialogView: null,
		_oUseStashDialogView: null,
		_oIgnoreSystemFilesDialogView: null,

		configure: function(mConfig) {
			this._aStyles = mConfig.styles;
			if (this._aStyles) {
				this.context.service.resource.includeStyles(this._aStyles).done();
			}
		},

		initRepository: function(oDocument, sActivator) {
			var that = this;
			var oEntity = oDocument.getEntity();
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			return that.context.service.git.initRepository(oEntity.getName(), oEntity.getBackendData().location, oEntity.getFullPath()).then(
				function() {
					that.context.service.usagemonitoring.report("git", "init", sActivator).done();
					//                                return that.context.service.git.setRepositoryConfiguration(oRefreshedEntity.getBackendData().git, {
					//                                       Key: "branch.master.merge",
					//                                       Value: "refs/heads/master" }).then(function() {
					//                                              return that.context.service.git.setRepositoryConfiguration(oEntity.getBackendData().git, {
					//                                                     Key: "branch.master.remote",
					//                                                     Value: "origin"
					//                                       });
					//
					//                         }).fail(function(oError) {
					//                                that._callMessageDialog(oError);
					//                         });

			}).fail(function(oError) {
				that._callMessageDialog(oError);
			});
		},

		fetchFromUpstream: function(oEntity, sActivator) {
			var that = this;
			var bIsAuthorized = true;
			var oUsageMonitoringService = this.context.service.usagemonitoring;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			return this._getRepositoryDetails(oEntity, false, "FETCH").then(
				function(oResult) {
					if (!oResult) {
						return Q();
					}
					oUsageMonitoringService.startPerf("git", "fetch").done();
					that.context.event.fireOperationStarted({
						entity: oEntity,
						name: "FETCH"
					}).done();
					return that.context.service.git.fetch(oResult.oGit, oResult.oDetails, oResult.sshPrivateKey, oResult.httpsPass,
						oResult.gitUsername).then(function(aFetchResults) {
						that.context.event.fireFetchCompleted().done();
						that.context.service.git.isFeatureSupported("DisplayFetchResults").then(function(isDisplayFetchResultsSupported) {
							if (isDisplayFetchResultsSupported)
							{
								that._getFetchChangesDialog().getController().open(aFetchResults);
							}
							else
							{
								that.context.service.usernotification.liteInfo(
										that.context.i18n.getText("i18n", "gitDispatcher_FetchCompletedSuccessfully", true)).done();
							}
						}).then(function () {
								oUsageMonitoringService.report("git", "fetch", sActivator).done();
						});
					}).fail(function(oError) {
						bIsAuthorized = !that._isNotAuthorized(oError);
						return Q.reject(oError);
					}).fin(function(){
						if (bIsAuthorized) {
							that._saveToStorage(oResult);
						}
					});
				}).fail(function(oEvent) {
					that._callMessageDialog(oEvent);
			}).fin(function() {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: "FETCH"
				}).done();
			});
		},

		stash: function(oEntity, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oGit = oEntity.getBackendData().git;
			that.context.event.fireOperationStarted({
				entity: oEntity,
				name: "STASH"
			}).done();
			return that.context.service.git.getLocalBranches(oGit).then(function(oLocalBranches) {
				return that.context.service.git.getCurrentBranchName(oLocalBranches).then(function(sLocalBranchName) {
					return that._getStashDialog().getController().open(sLocalBranchName).then(function(oResult) {
						if (oResult !== "CANCEL") {
							return that.context.service.git.stash(oGit, oResult).then(function() {
								that.context.service.usagemonitoring.report("git", "stash", sActivator).done();
								that.context.event.fireStashCompleted({
									message: "gitDispatcher_StashCompletedSuccessfully"
								}).done();
							}).fail(function(oError) {
								that._callMessageDialog(oError);
							}).fin(function() {
								that.context.service.usernotification.liteInfo(
									that.context.i18n.getText("i18n", "gitDispatcher_StashCompletedSuccessfully", true)).done();
								that.context.event.fireOperationStopped({
									entity: oEntity,
									name: "STASH"
								}).done();
							});
						} else { //Cancel
							that.context.event.fireOperationStopped({
								entity: oEntity,
								name: "STASH"
							}).done();
						}
					});
				});
			});
		},

		isStashAvailable: function(oEntity) {
			var oGit = oEntity.getBackendData().git;
			return this.context.service.git.getStash(oGit).then(function(aStash) {
				var bStashAvailable = aStash.Children && aStash.Children.length > 0 ? true : false;
				return bStashAvailable;
			});
		},

		useStash: function(oEntity, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oGit = oEntity.getBackendData().git;
			that.context.event.fireOperationStarted({
				entity: oEntity,
				name: "USESTASH"
			}).done();
			return that.context.service.git.getStash(oGit).then(function(aStash) {
				if (aStash.Children && aStash.Children.length > 0) {
					return that._getUseStashDialog().getController().open(aStash).then(function(oResult) {
						if (oResult !== "CANCEL") {
							return that.context.service.git.useStash(oGit, oResult).then(function() {
								that.context.event.fireUseStashCompleted({
									message: "gitDispatcher_UseStashCompletedSuccessfully"
								}).done();
							}).fail(function(oError) {
								if (oError.status === 409) {
									that.context.service.gitclient.getStatus(oEntity, false).then(function(oResponse) {
										that.context.service.usagemonitoring.report("git", "show stash", sActivator).done();
										if (oResponse.length > 0) {
											oError.detailedMessage = that.context.i18n.getText("i18n", "gitDispatcher_UseStashConflictWithoutCommit", true);
											for (var i = 0; i < oResponse.length; i++) {
												if (oResponse[i].Status === "C") {
													oError.detailedMessage = that.context.i18n.getText("i18n", "gitDispatcher_UseStashConflictWithCommit", true);
													break;
												}
											}
										} else {
											oError.type = "Warning";
											oError.detailedMessage = that.context.i18n.getText("i18n", "gitDispatcher_UseStashConflictWithCommit", true);
										}
										that.context.event.fireStashConflict().done();
										that._callMessageDialog(oError);
									});
								}
							}).fin(function() {
								that.context.service.usernotification.liteInfo(
									that.context.i18n.getText("i18n", "gitDispatcher_UseStashCompletedSuccessfully", true)).done();
								that.context.event.fireOperationStopped({
									entity: oEntity,
									name: "USESTASH"
								}).done();
							});
						} else { //Cancel
							that.context.event.fireOperationStopped({
								entity: oEntity,
								name: "USESTASH"
							}).done();
						}
					});
				} else { //Nothing stashed
					that.context.event.fireOperationStopped({
						entity: oEntity,
						name: "USESTASH"
					}).done();
					that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "gITUseStashDialog_no_stash_error")).done();
				}
			});
		},

		fetchFromGerrit: function(oEntity, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oCurrentResult = null;
			return this._getRepositoryDetails(oEntity, true, "FETCHGERRIT").then(function(oResult) {
				if (!oResult) {
					return Q();
				}
				that.context.event.fireOperationStarted({
					entity: oEntity,
					name: "FETCHGERRIT"
				}).done();
				oCurrentResult = oResult;
				return that._fetchFromGerrit(oResult);
			}).fail(function(oError) {
				if (oError.status === 409) {
					var oData = {
						files: oError.files,
						checkoutBranch: oError.sBranchName
					};
					return that.context.service.gitconflicts.openDialog(oEntity, oData).then(function(bSuccess) {
						if (bSuccess) {
							return that._fetchFromGerrit(oCurrentResult);
						}
					});
				} else {
					that._callMessageDialog(oError);
				}
			}).fin(function() {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: "FETCHGERRIT"
				}).done();
			});
		},

		_fetchFromGerrit: function(oResult, sActivator) {
			var that = this;
			var bIsAuthorized = true;
			var oService = this.context.service;
			return oService.git.fetchFromGerrit(oResult.oGit, oResult.oDetails, oResult.oEntity.getName(), oResult.change,
				oResult.sshPrivateKey, oResult.httpsPass, oResult.gitUsername).then(function() {
				that.context.service.usagemonitoring.report("git", "fetch from gerrit", sActivator).done();
				that.context.event.fireFetchFromGerritCompleted({
					message: "gitDispatcher_FetchfromGerritCompletedSuccessfully"
				}).done();
			}).fail(function(oError) {
				bIsAuthorized = !that._isNotAuthorized(oError);
				return Q.reject(oError);
			}).fin(function(){
				if (bIsAuthorized) {
					that._saveToStorage(oResult);
				}
			});
		},

		pull: function(oEntity, sActivator) {
			var that = this;
			var bIsAuthorized = true;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oService = this.context.service;
			return this._getRepositoryDetails(oEntity, false, "PULL").then(
				function(oResult) {
					if (!oResult) {
						return Q();
					}
					that.context.event.fireOperationStarted({
						entity: oEntity,
						name: "PULL"
					}).done();
					return oService.git.pull(oResult.oGit, oResult.oDetails, oResult.sshPrivateKey, oResult.httpsPass,
						oResult.gitUsername).then(function() {
						that.context.event.firePullCompleted().done();
						oService.usernotification.liteInfo(
							that.context.i18n.getText("i18n", "gitDispatcher_PullCompletedSuccessfully", true)).done();
						that.context.service.usagemonitoring.report("git", "pull", sActivator).done();
					}).fail(function(oError) {
						bIsAuthorized = !that._isNotAuthorized(oError);
						return Q.reject(oError);
					}).fin(function(){
						if (bIsAuthorized) {
							that._saveToStorage(oResult);
						}
					});
				}).fail(function(oError) {
				if (oError.status === "Conflicts") {
					that.context.event.firePullCompletedWithConflict().done();
				}
				that._callMessageDialog(oError);
			}).fin(function() {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: "PULL"
				}).done();
			});
		},

		pushTo: function(oEntity, bGerrit, bTag, sActivator) {
			var that = this;
			var oGit = oEntity.getBackendData().git;
			return this.context.service.git.getRemoteBranches(oGit).then(function(aRemoteBranches) {
				if (aRemoteBranches) {
					return that._getBranchesDialog().getController().open({
						remoteBranches: aRemoteBranches
					}, oEntity, 'PUSH', bGerrit).then(function(arguments){
						var oSelectedRemoteBranch = arguments[0];
						var bBypassCodeReview = arguments[1];
						if (oSelectedRemoteBranch) {
							return that._pushInternal(oEntity, bGerrit, bBypassCodeReview, oSelectedRemoteBranch, bTag, sActivator);
						}
					});
				}
			});
		},

		push: function(oEntity, bGerrit, oSelectedBranch, bTag, sActivator) {
			this._pushInternal(oEntity, bGerrit, false, oSelectedBranch, bTag, sActivator);
		},

		_pushInternal: function(oEntity, bGerrit, bBypassCodeReview, oSelectedBranch, bTag, sActivator) {
			var that = this;
			var bIsAuthorized = true;
			var oService = this.context.service;
			var oI18n = this.context.i18n;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			return this._getRepositoryDetails(oEntity, false, true).then(
				function(oResult) {
					if (!oResult) {
						return Q();
					}
					return that.context.service.git.push(oResult.oGit, bGerrit, oResult.oDetails, oResult.sshPrivateKey, oResult.httpsPass,
						oResult.gitUsername, oSelectedBranch, bTag, bBypassCodeReview).then(
						function(oPushResponse) {
							if (oPushResponse && oPushResponse.sDetailedMessage && (oPushResponse.sDetailedMessage.indexOf("New Changes:") !== -1 ||
								oPushResponse.sDetailedMessage.indexOf("Updated Changes:") !== -1)) {
								var sDetailedMessage = oPushResponse.sDetailedMessage;
								var oPushNotificationfragment = that._getPushNotificationfragment();
								var oPushNotificationModel = oPushNotificationfragment.getModel();
								oPushNotificationModel.setProperty("/sChanges", sDetailedMessage.indexOf("New Changes:") !== -1 ? oI18n.getText("i18n",
									"gitDispatcher_pushNewChanges") : oI18n.getText("i18n", "gitDispatcher_pushUpdatedChanges"));
								oPushNotificationModel.setProperty("/aNotificationLinks", that._getPushNotificationUrls(
									sDetailedMessage));
								oPushNotificationModel.setProperty("/sPushCompletedMessage", oI18n.getText("i18n", "gitDispatcher_pushCompletedSuccessfully"));
								//Failed tags
								if (oPushResponse.aFailedTags.length > 0) {
									oPushNotificationModel.setProperty("/sPushCompletedMessage", oI18n.getText("i18n", "gitDispatcher_pushCompletedWithTagErrors"));
									oPushNotificationModel.setProperty("/sFailedPushedTags", oI18n.getText("i18n", "gitDispatcher_pushFailedTags", [oPushResponse
										.aFailedTags.join()
									]));
									oPushNotificationModel.setProperty("/isFailedPushedTags", true);
								}
								//Successfully pushed tags
								if (oPushResponse.aSuccessTags.length > 0) {
									oPushNotificationModel.setProperty("/sSuccessfullyPushedTags", oI18n.getText("i18n", "gitDispatcher_SuccessTags", [
										oPushResponse
											.aSuccessTags.join()]));
									oPushNotificationModel.setProperty("/isSuccessfullyPushedTags", true);
								}
								oPushNotificationfragment.open();
								//if there are no commited changes, only light notification
							} else {
								oService.usernotification.liteInfo(
									oI18n.getText("i18n", "gitDispatcher_pushCompletedSuccessfully", true)).done();
							}
							that.context.event.firePushCompleted().done();
							that.context.service.usagemonitoring.report("git", "push", sActivator).done();
					}).fail(function(oError) {
						bIsAuthorized = !that._isNotAuthorized(oError);
						return Q.reject(oError);
					}).fin(function(){
						if (bIsAuthorized) {
							that._saveToStorage(oResult);
						}
					});
				}).fail(function(oError) {
				//no chnages
				if (oError.type === "Warning") {
					oService.usernotification.warning(oError.name).done();
					//push failed
				} else if (oError.status === "PushFailed") {
					var oPushResponse = oError.oErrorPushResponse;
					var oUpdate = oPushResponse.oPushedCommit;
					var oResultStatus = oUpdate.Result;
					var sMessage = (oUpdate.Message ? oI18n.getText("i18n", "gitDispatcher_pushErrorMessage", [oI18n.getText("i18n",
							"gitDispatcher_pushFailureReason") + " " + oUpdate.Message.charAt(0).toUpperCase() +
						oUpdate.Message.substring(1) + "\n\n", " " + oResultStatus]) : oI18n.getText("i18n", "gitDispatcher_pushErrorMessage", ["", " " +
						oResultStatus
						]));
					if (oPushResponse.sDetailedMessage) {
						sMessage += oI18n.getText("i18n", "gitDispatcher_pushDetailedFailureReason", ["\n\n ", "\n " + oPushResponse.sDetailedMessage]);
					}
					if (oPushResponse.aFailedTags.length > 0) {
						sMessage += "\n\n " + oI18n.getText("i18n", "gitDispatcher_pushFailedTags", [oPushResponse.aFailedTags.join()]);
					}
					if (oPushResponse.aSuccessTags.length > 0) {
						sMessage += "\n\n " + oI18n.getText("i18n", "gitDispatcher_SuccessTags", [oPushResponse.aSuccessTags.join()]);
					}
					that._callMessageDialog({
						source: "git",
						name: oError.name,
						detailedMessage: sMessage
					});
				} else {
					that._callMessageDialog(oError);
				}
			});
		},

		merge: function(oEntity, bGerrit, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oService = this.context.service;
			var oGit = oEntity.getBackendData().git;
			this.context.event.fireOperationStarted({
				entity: oEntity,
				name: "MERGE"
			}).done();
			return Q.all([oService.git.getLocalBranches(oGit), oService.git.getRemoteBranches(oGit)]).spread(
				function(oLocalBranches, oRemoteBranches) {
					return that._getBranchesDialog().getController().open({
						localBranches: oLocalBranches,
						remoteBranches: oRemoteBranches
					}, oEntity, 'MERGE', bGerrit);
				}).then(function(bSuccess) {
				if (bSuccess) {
					oService.usernotification.liteInfo(
						that.context.i18n.getText("i18n", "gitDispatcher_MergeCompletedSuccessfully", true)).done();
					that.context.event.fireMergeCompleted().done();
					that.context.service.usagemonitoring.report("git", "merge", sActivator).done();

				}
			}).fail(function(oError) {
				that.context.event.fireMergeCompleted().done();
				if (oError) {
					that._callMessageDialog(oError);
				}
			}).fin(function() {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: "MERGE"
				}).done();
			});
		},

		rebase: function(oEntity, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			var oService = this.context.service;
			var oGit = oEntity.getBackendData().git;
			this.context.event.fireOperationStarted({
				entity: oEntity,
				name: "REBASE"
			}).done();
			return Q.all([oService.git.getLocalBranches(oGit), oService.git.getRemoteBranches(oGit)]).spread(
				function(oLocalBranches, oRemoteBranches) {
					return that._getBranchesDialog().getController().open({
						localBranches: oLocalBranches,
						remoteBranches: oRemoteBranches
					}, oEntity, 'REBASE');
				}).then(function(bSuccess) {
				if (bSuccess) {
					that.context.event.fireRebaseCompleted({
						message: "gitDispatcher_RebaseCompletedSuccessfully"
					}).done();
					that.context.service.usagemonitoring.report("git", "rebase", sActivator).done();
				} else {
					//handle rebase interactive
					that.context.event.fireRebaseInteractive().done();
				}
			}).fail(function(oError) {
				if (oError && oError.message) {
					oService.usernotification.alert(oError.message).done();
				}
			}).fin(function() {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: "REBASE"
				}).done();
			});
		},

		reset: function(oEntity, bConflict, sActivator) {
			var that = this;
			var oService = this.context.service;
			var oGit = oEntity.getBackendData().git;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;

			//check if reset came from rebase interactive state 
			if (bConflict) {
				return oService.usernotification.confirm(
					that.context.i18n.getText("i18n", "gitDispatcher_resetInRebaseInteractiveConfirmation", ["\n\n"])).then(
					function(oResponse) {
						if (oResponse.bResult) {
							that.context.event.fireOperationStarted({
								entity: oEntity,
								name: "RESET"
							}).done();
							return oService.git.resetBranch(oGit, "HARD").then(function() {
								that.context.event.fireResetCompleted().done();
								oService.usernotification.liteInfo(
									that.context.i18n.getText("i18n", "gitDispatcher_ResetCompletedSuccessfully", true)).done();
								that.context.service.usagemonitoring.report("git", "reset", sActivator).done();
							});
						}
					}).fin(function() {
					that.context.event.fireOperationStopped({
						entity: oEntity,
						name: "RESET"
					}).done();
				});
			} else {
				this.context.event.fireOperationStarted({
					entity: oEntity,
					name: "RESET"
				}).done();
				return Q.all([oService.git.getLocalBranches(oGit), oService.git.getRemoteBranches(oGit)]).spread(
					function(oLocalBranches, oRemoteBranches) {
						return that._getBranchesDialog().getController().open({
							localBranches: oLocalBranches,
							remoteBranches: oRemoteBranches
						}, oEntity, 'RESET');
					}).then(function(bSuccess) {
					if (bSuccess) {
						that.context.event.fireResetCompleted().done();
						oService.usernotification.liteInfo(
							that.context.i18n.getText("i18n", "gitDispatcher_ResetCompletedSuccessfully", true)).done();
						that.context.service.usagemonitoring.report("git", "reset", sActivator).done();
					}
				}).fin(function() {
					that.context.event.fireOperationStopped({
						entity: oEntity,
						name: "RESET"
					}).done();
				});
			}
		},

		ignore: function(oEntity, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			return this.context.service.git.setIgnore(oEntity).then(function() {
				that.context.service.usagemonitoring.report("git", "ignore", sActivator).done();
				return that.context.event.fireIgnoreCompleted();
			});
		},

		untrackAndIgnore: function(oEntity) {
			var that = this;
			var oGit = oEntity.getBackendData().git;
			return that.context.service.git.untrack(oGit).then(function() {
				return that.context.service.git.setIgnore(oEntity).then(function() {
					return that.context.event.fireIgnoreCompleted();
				});
			}).fail(function(oError) {
				if (oError) {
					that._callMessageDialog(oError);
				}
			});
		},

		ignoreSystemFiles: function(oProjectDocument, sActivator) {
			var that = this;
			sActivator = !sActivator ? that._DEFAULT_LOG_LOCATION : sActivator;
			return this.context.service.git.setIgnoreSystemFiles(oProjectDocument).then(function(bGitStatus) {
				if (bGitStatus && oProjectDocument.getEntity().getBackendData() && oProjectDocument.getEntity().getBackendData().git) {
					return that._getIgnoreSystemFilesDialog().getController().open().then(function(oResult) {
						if (oResult !== "CANCEL") {
							var sCommitDescription = oResult;
							var oGit = oProjectDocument.getEntity().getBackendData().git;
							return that.verifyUserInfo(oProjectDocument.getEntity()).then(function(oUserInfo){
								// TODO: stage all
								return that.verifyIsGerrit(oProjectDocument.getEntity()).then(function(bIsGerrit){
									return that.context.service.git.commit(oGit, sCommitDescription, oUserInfo, false, bIsGerrit).then(function() {
										return that.context.service.git.getLocalBranches(oGit).then(function(oLocalBranches) {
											return that.context.service.git.getCurrentBranchName(oLocalBranches).then(function(sLocalBranchName) {
												return that.push(oProjectDocument.getEntity(), bIsGerrit, /*sLocalBranchName*/undefined, true, /*sActivator*/undefined);
											});
										});
									});
								});
							});
						}
					});
				}
			}).fin(function(){
				that.context.service.usagemonitoring.report("git", "ignoreSystemFiles", sActivator).done();
				return that.context.event.fireIgnoreSystemFilesCompleted({document: oProjectDocument});
			});
		},
		
		openCompareEditor: function(oNewFileDocument, bStaged, bConflict, sActivator) {
			var that = this;
			sActivator = !sActivator ? "from_pane" : sActivator;
			return that._openCompareEditor(oNewFileDocument, bStaged, bConflict).then(function() {
				that.context.service.usagemonitoring.report("git", "compare", sActivator).done();
			});
		},

		_openCompareEditor: function(oNewFileDocument, bStaged, bConflict) {
			var that = this;
			if (oNewFileDocument) {
				if (bConflict) {
					var aPromises = [oNewFileDocument.getVersion("CONFLICT_NEW", "gitFileDao"), oNewFileDocument.getVersion("CONFLICT_OLD", "gitFileDao")];
					return Q.all(aPromises).spread(function(oNewDoc, oOldDoc) {
						return that.context.service.compare.compare(oNewDoc, oOldDoc);
					});
				} else if (!bStaged) {
					return this.context.service.git.getFileHead(oNewFileDocument.getEntity().getBackendData().git, bStaged).then(
						function(sBaseFileFromHead) {
							return that.context.service.compare.compare(oNewFileDocument, sBaseFileFromHead);
						});
				}
				return Q.all(
					[that.context.service.git.getFileHead(oNewFileDocument.getEntity().getBackendData().git, bStaged),
						that.context.service.git.getFileNew(oNewFileDocument.getEntity().getBackendData().git, bStaged)]).spread(
					function(sBaseFileFromHead, sNewFileFromHead) {
						return that.context.service.compare.compare(oNewFileDocument, sBaseFileFromHead, sNewFileFromHead);
					});

			}
		},

		//Save the user credentials from the auth/clone dialog to the keystorage service
		_saveToStorage: function(oResult) {
			if (oResult.saveToCache) {
				var sHost = URI(oResult.oDetails.GitUrl).host();
				var sProtocol = URI(oResult.oDetails.GitUrl).protocol();
				if (sProtocol === "ssh") {
					this.context.service.keystorage.setSsh(sHost, oResult.gitUsername, oResult.sshPrivateKey).done();
				} else if (sProtocol === "https") {
					this.context.service.keystorage.setHttps(sHost, oResult.gitUsername, oResult.httpsPass).done();
				}
			}
		},

		//Get the required details for authentication to all operations from the auth dialog 
		_getRepositoryDetails: function(oEntity, bGerrit, sOperation) {
			var that = this;
			var oGit = oEntity.getBackendData().git;
			this.context.event.fireOperationStarted({
				entity: oEntity,
				name: sOperation
			}).done();
			return this.context.service.git.getRepositoryDetails(oGit).then(function(oDetails) {
				that.context.event.fireOperationStopped({
					entity: oEntity,
					name: sOperation
				}).done();
				return that._getAuthenticationView().getController().open(oDetails.GitUrl, bGerrit).then(function(oResult) {
					if (!oResult) {
						return Q();
					}
					return Q({
						oEntity: oEntity,
						oGit: oGit,
						oDetails: oDetails,
						gitUsername: oResult.userName,
						sshPrivateKey: oResult.sshPrivateKey,
						httpsPass: oResult.httpsPassword,
						change: oResult.change,
						saveToCache: oResult.saveToCache
					});
				});
			});
		},

		verifyIsGerrit: function(oEntity) {
			var that = this;
			var oGit = oEntity.getBackendData().git;
			
			return Q(oGit ? that.context.service.git.getRepositoryConfigurations(oGit) : []).then(function(oConfigurations) {
				var bIsGerrit = false;
				
				for (var i = 0; i < oConfigurations.length; i++) {
					if (oConfigurations[i].Key === "gerrit.createchangeid") {
						if ( typeof oConfigurations[i].Value === "string"){
							bIsGerrit = oConfigurations[i].Value === "true";
						}else if (oConfigurations[i].Value.constructor === Array)  {
							bIsGerrit = oConfigurations[i].Value[0] === "true";
						}
						break;
					}
				}
				
				return bIsGerrit;
			});
		},

		verifyUserInfo: function(oEntity) {
			var that = this;
			var oGit = oEntity.getBackendData().git;

			return Q(oGit ? this.context.service.git.getRepositoryConfigurations(oGit) : []).then(
				function(oConfigurations) {
					//check if the repository has email

					var oUserInfo = {};

					for (var i = 0; i < oConfigurations.length; i++) {
						var oConfiguration = oConfigurations[i];
						if (oConfiguration.Key === "user.email" && oConfiguration.Value) {
							oUserInfo.sEmail = oConfiguration.Value;
						} else if (oConfiguration.Key === "user.name" && oConfiguration.Value) {
							oUserInfo.sName = oConfiguration.Value;
						}
					}

					//the git configurations are updated
					if (oUserInfo.sEmail) {
						return;
					}

					//check if we have the user information in the git settings
					return that.context.service.git.getGitSettings().then(function(oSettings) {
						if (!oSettings || !oSettings.sEmail) {
							//try to get the user information from IDP
							return that.context.service.system.getSystemInfo().then(function(oUserInfo) {
								var oEmailRegex =
									/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
								var oDialog = that._getUserInfoDialog();

                                    var oModelDialog = oDialog.getModel();
                                    if (oUserInfo && oEmailRegex.test(oUserInfo.sEMail)) {
                                        oModelDialog.setProperty("/commitData/email", oUserInfo.sEMail);
                                        oModelDialog.setProperty("/commitData/user", oUserInfo.sFirstName + " " + oUserInfo.sLastName);
                                        oModelDialog.setProperty("/commitData/bButtonEnabled", true);
                                    } else {
                                        oModelDialog.setProperty("/commitData/bButtonEnabled", false);
                                    }
                                    oModelDialog.setProperty("/commitData/bError", false);
                                    oModelDialog.setProperty("/entity", oEntity);
                                    oDialog.open();
                                    that._oUserInfoPromis = Q.defer();
                                    return that._oUserInfoPromis.promise;




							});
						}

						//update the current repository
						if (oGit) {
							that.context.service.git.setRepositoryConfiguration(oGit, {
								Key: "user.email",
								Value: oSettings.sEmail
							}).then(function() {
								return that.context.service.git.setRepositoryConfiguration(oGit, {
									Key: "user.name",
									Value: oSettings.sName
								});
							}).done();
						}
						return;
					});
				});

		},

		_handleUserInfo: function(oEvent) {
			var that = this;
			var oDialog = this._getUserInfoDialog();
			var oCommitModel = oDialog.getModel();
			var oGit = oCommitModel.getProperty('/entity').getBackendData().git;
			var oUserInfo = {
				sEmail: oCommitModel.getProperty("/commitData/email"),
				sName: oCommitModel.getProperty("/commitData/user")
			};

			oDialog.close();
			if (oEvent.type === "sapescape" || oEvent.getSource().data("close")) {
				//escape or cancel were pressed
				that._oUserInfoPromis.reject();
				return;
			}

			//update git settings
			Q(oGit ? this.context.service.git.setRepositoryConfiguration(oGit, {
				Key: "user.email",
				Value: oUserInfo.sEmail
			}).then(function() {
				return that.context.service.git.setRepositoryConfiguration(oGit, {
					Key: "user.name",
					Value: oUserInfo.sName
				});
			}) : "").then(function() {
				return that.context.service.git.setGitSettings(oUserInfo.sEmail, oUserInfo.sName).then(function() {
					that._oUserInfoPromis.resolve();
				});
			}).fail(function(oEvent) {
				that._oUserInfoPromis.reject();
				that._callMessageDialog(oEvent);
			}).done();
		},

		_callMessageDialog: function(oError) {
			if (!oError.source || oError.source !== "git") {
				throw oError;
			}
			var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
			switch (oError.type) {
				case "Warning":
					this.context.service.usernotification.warning(oError.name + sDetailedMessage).done();
					break;
				case "Info":
					this.context.service.usernotification.info(oError.name + sDetailedMessage).done();
					break;
				default:
					//ERROR
					this.context.service.usernotification.alert(oError.name + sDetailedMessage).done();
			}
		},

		_getUserInfoDialog: function() {
            var self = this;
			if (!this._oUserInfoDialog) {
				var oData = {
					commitData: {
						email: "",
						user: "",
						bSaved: true,
						bButtonEnabled: false,
						bError: false
					},
					entity: {}
				};


				this._oUserInfoDialog = sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitUserInfoDialog", this);
				this._oUserInfoDialog.setModel(new sap.ui.model.json.JSONModel(oData));

				this.context.i18n.applyTo(this._oUserInfoDialog);
			}
			return this._oUserInfoDialog;
		},

		_getAuthenticationView: function() {
			if (!this._oAuthenticationView) {
				this._oAuthenticationView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitAuthentication",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oAuthenticationView;
		},

		_getFetchChangesDialog: function() {
			if (!this._oFetchView) {
				this._oFetchView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitFetchDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oFetchView;
		},

		_getBranchesDialog: function() {
			if (!this._oBranchesView) {
				this._oBranchesView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitBranchesDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oBranchesView;
		},

		_getIgnoreSystemFilesDialog: function() {
			if (!this._oIgnoreSystemFilesDialogView) {
				this._oIgnoreSystemFilesDialogView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitIgnoreSystemFilesDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oIgnoreSystemFilesDialogView;
		},

		_getStashDialog: function() {
			if (!this._oStashDialogView) {
				this._oStashDialogView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitStashDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oStashDialogView;
		},

		_getUseStashDialog: function() {
			if (!this._oUseStashDialogView) {
				this._oUseStashDialogView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitUseStashDialog",
					type: sap.ui.core.mvc.ViewType.JS,
					viewData: {
						context: this.context
					}
				});
			}
			return this._oUseStashDialogView;
		},

		_getPushNotificationfragment: function() {
			if (!this._oPushNotificationfragment) {
				var oDialogModel = new sap.ui.model.json.JSONModel();
				oDialogModel.setData({
					aNotificationLinks: [],
					sChanges: "",
					sSuccessfullyPushedTags: "",
					sFailedPushedTags: "",
					isSuccessfullyPushedTags: false,
					isFailedPushedTags: false,
					sPushCompletedMessage: ""
				});
				this._oPushNotificationfragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitPushNotification", this);
				this._oPushNotificationfragment.setModel(oDialogModel);

				this.context.i18n.applyTo(this._oPushNotificationfragment);
			} else {
				var oModel = this._oPushNotificationfragment.getModel();
				oModel.setProperty("/sSuccessfullyPushedTags", "");
				oModel.setProperty("/sFailedPushedTags", "");
				oModel.setProperty("/aNotificationLinks", []);
			}
			return this._oPushNotificationfragment;
		},

		_getPushNotificationUrls: function(oDetailedMessage) {
			var sChanges = oDetailedMessage.indexOf("New Changes:") > -1 ? oDetailedMessage.substring(oDetailedMessage.indexOf("New Changes:")).trim() :
				oDetailedMessage.substring(oDetailedMessage.indexOf("Updated Changes:")).trim();
			var aUrls = sChanges.split("\n");
			var aUrlLinks = [];
			for (var i = 1; i < aUrls.length; i++) {
				var aUrisChange = aUrls[i].trim().split(" ");
				aUrlLinks.push({
					link: aUrisChange[0]
				});
			}
			return aUrlLinks;
		},

		_isNotAuthorized: function(oError) {
			if (oError.detailedMessage && oError.detailedMessage.indexOf("not authorized") > -1) {
				return true;
			}
			return false;
		}

	};

	return GitDispatcher;
});