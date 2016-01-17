define(["../dao/Git", "../featuretoggle/FeatureToggle", "sap/watt/lib/lodash/lodash"], function(oGitDao, oFeatureToggle, _) {
	return {

		_sSSHKnownHostKey: "ssh_known_host_",
		_oStorage: undefined,
		_i18n: undefined,
		_repositoryDetailsMap: {},
		_gitLogDetailsMap: {},
		_oIgnoreMap : undefined,
		
		init: function() {
			jQuery.sap.require("jquery.sap.storage");
			this._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			this._i18n = this.context.i18n;
		},
		
		configure: function(mConfig) {
			if(mConfig.ignore && mConfig.ignore.length > 0) {
				var aIgnore = _.uniq(mConfig.ignore);
				this._oIgnoreMap = {};
				for (var i = 0; i < aIgnore.length; i++) {
					this._oIgnoreMap[aIgnore[i]] = null;
				}
			}
		},

		clone: function(sGitUrl, sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation, sDestinationName) {
			var that = this;
			//get username and mail address
			that.context.service.log.info("git", "Clone request sent", ["user"]).done();

			return Q(sGitSshPrivateKey ? that._getKnownHost(sGitUrl, sLocation, sGitSshUsername, sGitPassword,
				sGitSshPrivateKey, sGitSshPassphrase) : "").then(
				function(sGitSshKnownHost) {
					// execute clone request
					return oGitDao.doClone(sGitUrl, sGitSshKnownHost, sGitSshUsername, sGitPassword, sGitSshPrivateKey,
						sGitSshPassphrase, sLocation, {}, sDestinationName).then(function(oTask) {
						// wait for the server to handle the request
						return that._waitForTask(oTask).then(function(oResponse) {
							that.context.service.log.info("git", "Clone request completed successfully", ["user"]).done();
							return oResponse;
						});
					});
				}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCloneRequestFailed"), oError);
			});
		},

		getRepositoryDetailsByLocation: function(oLocation) {
			var that = this;
			return oGitDao.get(oLocation.Location).then(function(oRepositoryDetails) {
				if (!(oRepositoryDetails && oRepositoryDetails.Children && oRepositoryDetails.Children[0])) {
					return [];
				}
				return oRepositoryDetails.Children[0];
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRepositorySelection"), oError);
			});
		},

		getRepositoryDetails: function(oGit) {
			var that = this;
			if (this._repositoryDetailsMap[oGit.CloneLocation]) {
				return Q(this._repositoryDetailsMap[oGit.CloneLocation]);
			}
			return oGitDao.getRepositoryDetails(oGit).then(function(oCloneData) {
				if (oCloneData && oCloneData.Children && oCloneData.Children[0]) {
					return that._repositoryDetailsMap[oGit.CloneLocation] = oCloneData.Children[0];
				} else {
					throw new Error("GET Repository Details request failed");
				}
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetRepositoryDetailsRequestFailed"), oError);
			});
		},

		getFileHead: function(oGit, bStaged) {
			var that = this;
			return oGitDao.getFileDiff(oGit, bStaged).then(function(oDiff) {
				return oGitDao.getFileBase(oDiff);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorDiffRequestFailed"), oError);
			});
		},

		getFileNew: function(oGit, bStaged) {
			var that = this;
			return oGitDao.getFileDiff(oGit, bStaged).then(function(oDiff) {
				return oGitDao.getFileNew(oDiff);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorDiffRequestFailed"), oError);
			});
		},

		pull: function(oGit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName) {
			var that = this;

			var sGitUrl = oRepositoryDetails.GitUrl;
			var sHostName = URI(sGitUrl).host();

			this.context.service.log.info("git", "Pull request sent", ["user"]).done();

			return oGitDao.get(oRepositoryDetails.RemoteLocation).then(
					function(oRemoteData) {
						if (!(oRemoteData && oRemoteData.Children && oRemoteData.Children[0])) {
							return [];
						}
						var fnDoPull = function(oRemoteData, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword) {
							return oGitDao.doPull(oRemoteData, false, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword).then(
								function(oResult) {
									return that._waitForTask(oResult)
										.then(
											function(oResult) {
												if (oResult) {
													//FIX CSN 120061532 1314629 2014 - in case the pull perform without task it returns a message 'Pulling [repository_name] done' and not OK
													if (oResult.Message === "OK" || /^Pulling.*done$/.test(oResult.Message)) {
														that.context.service.log.info("git",
															"Pull request completed successfully", ["user"]).done();
														return true;
													} else {
														that.context.service.log
															.error("git", "Pull request failed", ["user"]).done();
														throw new Error(oResult);
													}
												}
											});
								});
						};
						var sGitSshKnownHost = that._oStorage.get(that._sSSHKnownHostKey + sHostName);
						return fnDoPull(oRemoteData, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword).fail(function(oError) {
							if (sGitSshPrivateKey) {
								var sKnownHost = that._handleKnownHost(oError, sHostName);
								return fnDoPull(oRemoteData, sKnownHost, sUserName, sGitSshPrivateKey, sGitPassword);
							}
							throw oError;
						});
					})
				.fail(function(oError) {
					switch (oError.Message) {
						case "CONFLICTING":
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorPULLRequestFailed"),
								new Error(that._i18n.getText("i18n", "gitService_errorPullRequestFailedDueToConflicts")),
								"Warning", "Conflicts");
							break;
						default:
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorPULLRequestFailed"), oError,
								"Error");
					}
				}).fin(function() {
					return that.context.event.firePullFinished(oGit);
				});

		},

		fetch: function(oGit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName) {
			var that = this;

			var sGitUrl = oRepositoryDetails.GitUrl;
			var sHostName = URI(sGitUrl).host();
			this.context.service.log.info("git", "Fetch request sent", ["user"]).done();

			return oGitDao.get(oRepositoryDetails.RemoteLocation).then(
				function(oRemoteData) {
					if (!(oRemoteData && oRemoteData.Children && oRemoteData.Children[0])) {
						return [];
					}
					var fnDoFetch = function(oRemoteData, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword) {
						return oGitDao.doFetch(oRemoteData, false, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword).then(
							function(oTask) {
								return that._waitForTask(oTask).then(function() {
									return that._getChanges(oGit);
								});
							});
					};
					var sGitSshKnownHost = that._oStorage.get(that._sSSHKnownHostKey + sHostName);
					return fnDoFetch(oRemoteData, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword).fail(function(oError) {
						if (sGitSshPrivateKey) {
							var sKnownHost = that._handleKnownHost(oError, sHostName);
							return fnDoFetch(oRemoteData, sKnownHost, sUserName, sGitSshPrivateKey, sGitPassword);
						}
						throw oError;
					});
				}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorFetchRequestFailed"), oError);
			});
		},

		fetchFromGerrit: function(oGit, oRepositoryDetails, sName, sBranch, sGitSshPrivateKey, sGitPassword, sUserName) {
			//1. edit config file
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(URI('/' + sName + '/.git/config').toString()).then(
				function(oConfigDocument) {
					return oConfigDocument.getContent().then(
						function(sContent) {
							var sRemoteSection = '[remote "origin"]';
							var iRemote = sContent.indexOf(sRemoteSection);
							var sFirstPart = sContent.substring(0, iRemote + sRemoteSection.length);
							var sNewPart = that._getFetchFromGerritString(sBranch);
							var sLastPart = sContent.substring(iRemote + sRemoteSection.length, sContent.length);
							sContent = sFirstPart + sNewPart + sLastPart;
							var oBlob = new Blob([sContent]);
							return oConfigDocument.getParent().then(
								function(oParent) {
									return oParent.importFile(oBlob, false, true, 'config').then(
										function() {
											return that.fetch(oGit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword,
												sUserName).then(function() {
												//2. checkout new branch 
												//There is no need to fire operation completed since it is fired by checkout local branch
												return that.checkoutLocalBranch(oGit, that._getBrnachName(sBranch));
											});
										});
								});
						});
				}).fail(function(oError) {
					//Conflict
					if (oError.status === 409) {
						oError.sBranchName = that._getBrnachName(sBranch);
					}
					return that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorFetchFromGerritRequestFailed"), oError);
				}).fin(function() {
					//Remove configuration for fetch from gerrit
					return that._removeGerritBranchFetchConfiguration([sBranch], sName);
			});
		},

		merge: function(oGit, sMerge, sSquash, bChangeId) {
			var that = this;
			this.context.service.log.info("git", "Merge request sent", ["user"]).done();
			return oGitDao.doMerge(oGit, sMerge, sSquash).then(function(oResponse) {
					if (oResponse.Result === "ALREADY_UP_TO_DATE" || oResponse.Result === "FAST_FORWARD" || oResponse.Result === "MERGED") {
						return Q().then(function(){
							if (bChangeId && oResponse.Result === "MERGED") {
								return that.getLastCommit(oGit).then(function(oLastCommitResponse){
									var bAmend = true;
									return oGitDao.doCommit(oGit, oLastCommitResponse.Message, undefined, bAmend, bChangeId);
								});
							}
						}).then(function(){
							that.context.service.log.info("git", "Merge request completed successfully: " + oResponse.Result, ["user"]).done();
							return true;
						});
					}
					throw new Error(oResponse.Result);
				})
				.fail(function(oError) {
						switch (oError.message) {
							case "CONFLICTING":
								that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorMergeRequestFailed"),
									new Error(that._i18n.getText("i18n", "gitService_errorMergeRequestFailedDueToConflicts")),
									"Warning");
								break;
							default:
								that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorMergeRequestFailed"), oError,
									"Error");
						}
				}).fin(function() {
					return that.context.event.fireMergeFinished(oGit);
				});
		},

		rebase: function(oGit, sRebase) {
			var that = this;
			this.context.service.log.info("git", "Rebase request sent", ["user"]).done();
			return oGitDao.doRebase(oGit, sRebase).then(function(oResponse) {
				if (oResponse.Result === "OK" || oResponse.Result === "UP_TO_DATE" || oResponse.Result === "FAST_FORWARD") {
					return that.context.service.log.info("git", "Rebase request completed successfully", ["user"]);
				}
				throw new Error(oResponse.Result);
			}).fail(
				function(oError) {
					switch (oError.message) {
						case "STOPPED":
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), new Error(
									that._i18n.getText("i18n", "gitService_errorRebaseInteractiveConflictsOccuredContinueSkipAbort")),
								"Warning", "RebaseInteractive");
							break;
						case "FAILED_WRONG_REPOSITORY_STATE":
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), new Error(
									that._i18n.getText("i18n", "gitService_errorRebaseInProgressReferToGItPane")), "Error",
								"RebaseInteractive");
							break;
						case "FAILED_UNMERGED_PATHS":
						case "FAILED_PENDING_CHANGES":
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), new Error(
									that._i18n.getText("i18n", "gitService_errorRebaseInteractiveConflictsOccuredContinueSkipAbort")),
								"Error", "RebaseInteractive");
							break;
						case "CONFLICTS":
							that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), new Error(
									that._i18n.getText("i18n", "gitService_errorRebaseInteractiveConflicts")), "Warning",
								"RebaseInteractive");
							break;
						default:
							that
								._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), oError,
									"Error");
					}

			}).fin(function() {
				return that.context.event.fireRebaseFinished(oGit);
			});
		},

		rebaseInteractive: function(oGit, sRebaseOperation) {
			var that = this;
			this.context.service.log.info("git", sRebaseOperation + " request sent", ["user"]).done();
			return oGitDao.doRebase(oGit, "", sRebaseOperation).then(function(oResponse) {
				return that._handleRebaseInteractiveResponse(oResponse, sRebaseOperation);
			}).fail(function(oError) {
				that._logAndThrowCustomError(oError.name, oError);
			}).fin(function() {
				return that.context.event.fireRebaseInteractiveFinished(oGit);
			});
		},

		deleteRepositoryConfiguration: function(oConfiguration) {
			var that = this;
			this.context.service.log.info("git", "Delete configuration request sent", ["user"]).done();
			return oGitDao.deleteRepositoryConfiguration(oConfiguration.Location).then(function(oResponse) {
				that.context.service.log.info("git", "Delete configuration completed successfully", ["user"]).done();
				return true;
			}).fail(function(oError) {
				that._logAndThrowCustomError(oError.name, oError);
			});
		},

		updateRepositoryConfiguration: function(oConfiguration, oValue) {
			var that = this;
			this.context.service.log.info("git", "Update configuration request sent", ["user"]).done();
			return oGitDao.updateRepositoryConfiguration(oConfiguration.Location, oValue).then(function(oResponse) {
				return that.context.service.log.info("git", "Update configuration completed successfully", ["user"]);
			}).fail(function(oError) {
				that._logAndThrowCustomError(oError.name, oError);
			});
		},

		_handleRebaseInteractiveResponse: function(oResponse, sRebaseOperation) {
			switch (oResponse.Result) {
				case "OK":
				case "ABORTED":
					this.context.service.log.info("git", sRebaseOperation + " request completed successfully", ["user"]).done();
					return true;
				case "FAILED_UNMERGED_PATHS":
					throw {
						name: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveContinueRequestFailed"),
						detailedMessage: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveUnmergedPaths")
					};
				case "NOTHING_TO_COMMIT":
					throw {
						name: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveContinueCannotBeProcessed"),
						detailedMessage: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveNothingToCommit"),
						sType: "Warning"
					};
				case "STOPPED":
					throw {
						name: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveSkipPatchOperationStatusStopped"),
						detailedMessage: this._i18n.getText("i18n", "gitService_errorRebaseInteractiveRepositoryContainesConflicts"),
						sType: "Warning"
					};
			}
		},

		push: function(oGit, bGerrit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName, oBranch, bTag, bBypassCodeReview) {
			var that = this;
			var sGitUrl = oRepositoryDetails.GitUrl;
			var sHostName = URI(sGitUrl).host();
			this.context.service.log.info("git", "Push request sent", ["user"]).done();
			return this.getLocalBranches(oGit).then(
				function(aLocalBranches) {
					var fnDoPush = function(sPushSrcRef, sRemoteBranchLocation, sGitSshKnownHost, sUserName, sGitSshPrivateKey,
						sGitPassword) {
						return oGitDao.doPush(bGerrit, bBypassCodeReview, sPushSrcRef, bTag, sRemoteBranchLocation, false, sGitSshKnownHost, sUserName,
							sGitSshPrivateKey, sGitPassword).then(function(oResult) {
							return that._waitForTask(oResult).then(function(oResponse) {
								return that._verifyPushResponse(oResponse);
							});
						});
					};
					var sRemoteLocation;
					if (oBranch) {
						sRemoteLocation = oBranch.Location;
					} else {
						sRemoteLocation = that.getCurrentBranch(aLocalBranches).RemoteLocation[0].Children[0].Location;
					}
					var sGitSshKnownHost = that._oStorage.get(that._sSSHKnownHostKey + sHostName);
					return fnDoPush("HEAD", sRemoteLocation, sGitSshKnownHost, sUserName, sGitSshPrivateKey, sGitPassword).fail(
						function(oError) {
							if (sGitSshPrivateKey) {
								var sKnownHost = that._handleKnownHost(oError, sHostName);
								return fnDoPush("HEAD", sRemoteLocation, sKnownHost, sUserName, sGitSshPrivateKey, sGitPassword);
							}
							throw oError;
						});
				}).fail(function(oError) {
				if (oError.type === "Warning" || oError.status === "PushFailedWithErrorTag") {
					that._logAndThrowCustomError(oError.name, oError, oError.type);
				}
				if (oError.status === "PushFailed") {
					that.context.service.log.error("git", that._i18n.getText("i18n", "gitService_errorPushRequestFailed"), ["user"]).done();
					throw oError;
				}
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorPushRequestFailed"), oError);
			}).fin(function() {
					return that.context.event.firePushFinished(oGit);
			});
		},

		getLog: function(oGit, iPage, iPageSize) {
			var that = this;
			var aLogCommits = [];
			this.context.service.log.info("git", "Log request sent", ["user"]).done();
			return oGitDao.get(oGit.CommitLocation, iPage, iPageSize).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResponse) {
					//Add "next" entries to existing entries for the same branch and document
					if (that._gitLogDetailsMap[oGit.CommitLocation] && iPage !== 1) {
						aLogCommits = that._gitLogDetailsMap[oGit.CommitLocation] = that._gitLogDetailsMap[oGit.CommitLocation].concat(oResponse.Children);
					} else { // create new entry in the map with the new data
						that._gitLogDetailsMap = {};
						aLogCommits = that._gitLogDetailsMap[oGit.CommitLocation] = oResponse.Children;
					}
					that.context.service.log.info("git", "Log request completed successfully", ["user"]).done();
					var aForamttedLogData = that._getFormattedLogsResponse(aLogCommits);
					return {
						"aFormattedLogData": aForamttedLogData,
						"sNextUrl": oResponse.NextLocation
					};
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLog"), oError);
			});
		},

		getRepositoriesList: function(sRootLocation) {
			var that = this;
			return oGitDao.getRepositoriesList(sRootLocation).then(function(oResult) {
				return oResult.Children;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetRepositoriesListRequestFailed"), oError);
			});
		},

		getStatus: function(oGit) {
			var that = this;
			//			this.context.service.log.info("git", "Status request sent", [ "user" ]).done();
			return oGitDao.getStatus(oGit).then(function(oGitResponse) {
				//				that.context.service.log.info("git", "Status request completed successfully", [ "user" ]).done();
				return that._getFormattedStageResponse(oGitResponse);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorStatusRequestFailed"), oError);
			});
		},

		commit: function(oLocation, sMessage, oGitSettings, bAmend, bChangeId) {
			var that = this;
			this.context.service.log.info("git", "Commit request sent", ["user"]).done();
			return oGitDao.doCommit(oLocation, sMessage, oGitSettings, bAmend, bChangeId).then(function() {
				return that.context.service.log.info("git", "Commit request completed successfully", ["user"]);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCommitRequestFailed"), oError);
			});
		},

		isStashSupported: function(oGit) {
			return this._getStashLocation(oGit).then(function(sStashLocation) {
				if (sStashLocation && sStashLocation !== "") {
					return true;
				}
				return false;
			});
		},

		isRmSupported: function(oGit) {
			if (oGit.RmLocation && oGit.RmLocation !== "") {
				return true;
			}
			return false;
		},

		getStash: function(oGit) {
			var that = this;
			return that._getStashLocation(oGit).then(function(sStashLocation) {
				return oGitDao.doGetStash(sStashLocation).then(function(aStash) {
					return aStash;
				}).fail(function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetStashFailed"), oError);
				});
			});

		},

		stash: function(oGit, sStashMessage) {
			var that = this;
			this.context.service.log.info("git", "Stash request sent", ["user"]).done();
			return that._getStashLocation(oGit).then(function(sStashLocation) {
				return oGitDao.doStash(sStashLocation, sStashMessage).then(function() {
					return that.context.service.log.info("git", "Stash request completed successfully", ["user"]);
				}).fail(function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorStashFailed"), oError);
				}).fin(function() {
					return that.context.event.fireStashFinished(oGit);
				});
			});

		},

		useStash: function(oGit, oStashInfo) {
			var that = this;
			this.context.service.log.info("git", "Use stash request sent", ["user"]).done();
			return that._getStashLocation(oGit).then(function(sStashLocation) {
				return oGitDao.doUseStash(sStashLocation, oStashInfo).then(function() {
					return that.context.service.log.info("git", "Use stash request completed successfully", ["user"]);
				}).fail(function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUseStashFailed"), oError);
				}).fin(function() {
					return that.context.event.fireUseStashFinished(oGit);
				});
			});
		},

		stageFile: function(oGit) {
			var that = this;
			this.context.service.log.info("git", "Stage File request sent", ["user"]).done();
			return oGitDao.stage(oGit).then(function() {
				return that.context.service.log.info("git", "Stage File request completed successfully", ["user"]);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorStageFileFailed"), oError);
			});
		},

		stageMultipleFiles: function(oGit, aPaths) {
			var that = this;
			this.context.service.log.info("git", "Stage Multiple Files request sent", ["user"]).done();
			return oGitDao.stageMultipleFiles(oGit, aPaths).then(function(oResult) {
				that.context.service.log.info("git", "Stage Multiple Files request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorStageMultipleFilesFailed"), oError);
			});
		},

		unStageFile: function(oGit) {
			var that = this;
			this.context.service.log.info("git", "Unstage File request sent", ["user"]).done();
			return oGitDao.unStage(oGit).then(function() {
				return that.context.service.log.info("git", "Unstage File request completed successfully", ["user"]);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnstageFileRequestFailed"), oError);
			});
		},

		unstageAll: function(oGit) {
			var that = this;
			this.context.service.log.info("git", "Unstage All request sent", ["user"]).done();
			return oGitDao.doResetIndex(oGit, "MIXED").then(function(oResult) {
				that.context.service.log.info("git", "Unstage All request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnstageAllRequestFailed"), oError);
			});
		},

		getLocalBranches: function(oGit) {
			var that = this;
			return this.getRepositoryDetails(oGit).then(function(oCloneData) {
				return oGitDao.get(oCloneData.BranchLocation).then(function(oTask) {
					return that._waitForTask(oTask).then(function(aLocalBranches) {
						return aLocalBranches.Children;
					});
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLocalBranchesRequestFailed"), oError);
			});
		},

		getRemoteBranches: function(oGit) {
			var that = this;
			return this.getRepositoryDetails(oGit).then(function(oRepositoryDetails) {
				return oGitDao.get(oRepositoryDetails.RemoteLocation).then(function(oTask) {
					return that._waitForTask(oTask).then(function(oRemoteLocationDetails) {
						if (oRemoteLocationDetails.Children.length === 0) {
							return [];
						}
						return oGitDao.get(oRemoteLocationDetails.Children[0].Location).then(function(oRemoteLocations) {
							return oRemoteLocations.Children;
						});
					});
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetRemoteBranchesRequestFailed"), oError);
			});
		},

		getCommits: function(oGit) {
			var that = this;
			return this._getBranchesData(oGit).then(function(oBranchData) {
				var oCurrentBranch = that.getCurrentBranch(oBranchData.Children);
				if (!oCurrentBranch || !oCurrentBranch.RemoteLocation || oCurrentBranch.RemoteLocation.length === 0) {
					return;
				}
				return oGitDao.getCommitsUri(oCurrentBranch.RemoteLocation[0]).then(function(oCommitsUri) {
					return oGitDao.getCommits(oCommitsUri.Location).then(function(oData) {
						return Q(!oData.Children ? that._waitForTask(oData) : oData).then(function(oResponse) {
							var aCommits = [];

							for (var i = 0; i < oResponse.Children.length; i++) {
								aCommits.push({
									Message: oResponse.Children[i].Message,
									Time: new Date(oResponse.Children[i].Time)
								});
							}
							return aCommits;
						});
					});
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetCommitsRequestFailed"), oError);
			});
		},

		getCommitsCount: function(oGit) {
			var that = this;
			return this.getLocalBranches(oGit).then(
				function(oTask) {
					return that._waitForTask(oTask).then(
						function(aLocalBranches) {
							var oCurrentBranch = that.getCurrentBranch(aLocalBranches);
							if (!oCurrentBranch || !oCurrentBranch.RemoteLocation || !oCurrentBranch.RemoteLocation[0] ||
								!oCurrentBranch.RemoteLocation[0].Children || /^[0-9]+\/[0-9]+$/.test(oCurrentBranch.Name) ||
								oCurrentBranch.RemoteLocation[0].Children.length !== 1 || // Orion5 - size 1 indicates a remote branch
								!oCurrentBranch.RemoteLocation[0].Children[0].Id) // Orion8 - Id parameter is defined only in remote branches
							{
								return {};
							}
							// getchanges
							var oRemoteChildren = oCurrentBranch.RemoteLocation[0].Children;
							return Q.all(
											[
													oGitDao.getChangesUri(oCurrentBranch.CommitLocation, oRemoteChildren[0].Id).then(
										function(sUri) {
											return oGitDao.getChanges(sUri.Location).then(function(oTask) {
												return that._waitForTask(oTask);
											});

										}),
													oGitDao.getCommitsUri(oCurrentBranch.RemoteLocation[0]).then(function(oCommitsUri) {
										return oGitDao.getCommits(oCommitsUri.Location).then(function(oTask) {
											return that._waitForTask(oTask);
										});
									})]).spread(function(oIncoming, oOutgoing) {
								var oResponse = {};
								if (oIncoming && oIncoming.Children) {
									oResponse.Incoming = oIncoming.Children.length;
								}
								if (oOutgoing && oOutgoing.Children) {
									oResponse.Outgoing = oOutgoing.Children.length;
								}
								return oResponse;
							});
						});
				}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetCommitsRequestFailed"), oError);
			});
		},

		getLastCommit: function(oGit) {
			var that = this;
			return oGitDao.getLastCommit(oGit).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResponse) {
					if (oResponse && oResponse.Children && oResponse.Children[0]) {
						return oResponse.Children[0];
					}
					throw new Error(that._i18n.getText("i18n", "gitService_errorGetLastCommitRequestFailed"));
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLastCommitRequestFailed"), oError);
			});
		},

		getRemoteBranchOfCurrent: function(aBranches) {
			return this.getRemoteBranchOfLocalBranch(this.getCurrentBranch(aBranches));
		},
		
		getRemoteBranchOfLocalBranch: function(oBranch) {
			var aChildren;
			if (!jQuery.isEmptyObject(oBranch) && !jQuery.isEmptyObject(oBranch.RemoteLocation) && oBranch.RemoteLocation.length > 0) {
				aChildren = oBranch.RemoteLocation[0].Children;
				if (aChildren.length === 1 // Orion5 - size 1 indicates a remote branch
					&& !/^[0-9]+\/[0-9]+$/.test(oBranch.Name) && aChildren[0].Id) // Orion8 - Id parameter is defined only in remote branches
				{
					return aChildren[0].Name;
				}
			}
			return "";
		},

		getCurrentBranchName: function(aBranches) {
			if (!jQuery.isEmptyObject(this.getCurrentBranch(aBranches))) {
				return this.getCurrentBranch(aBranches).Name;
			}
			return "";
		},

		cherryPick: function(oGit, oLog) {
			var that = this;
			var sCommitName = oLog.Message.split("\n\n")[0];
			this.context.service.log.info("git", "Cherry-Pick request for commit " + sCommitName + " sent", ["user"]).done();
			return oGitDao.doCherryPick(oGit, oLog).then(
				function(oTask) {
					return that._waitForTask(oTask)
						.then(
							function(oResponse) {
								that._handleCherryPickResponse(oResponse);
								that.context.service.log
									.info("git",
										"Cherry-Pick request for commit " + sCommitName + " completed successfully", ["user"]).done();
							});
				}).fail(function(oError) {
				if (oError.status) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCherryPickRequestFailed"), oError);
				}

				//save the commit for the new commit of the resolving of conflicts
				that._repositoryDetailsMap[oGit.CloneLocation].CherryPickCommitDescription = sCommitName;
				that._logAndThrowCustomError(oError.name, oError, oError.sType);
			}).fin(function() {
				return that.context.event.fireCherryPickFinished(oGit);
			});
		},

		_handleCherryPickResponse: function(oResponse) {
			switch (oResponse.Result) {
				case "CONFLICTING":
					throw {
						name: this._i18n.getText("i18n", "gitService_cherryPickRequestConflicts"),
						detailedMessage: this._i18n.getText("i18n", "gitService_cherryPickRequestConflictsDetailedMessage"),
						sType: "Warning"
					};
				case "FAILED":
					throw {
						name: this._i18n.getText("i18n", "gitService_errorCherryPickRequestFailed"),
						detailedMessage: this._i18n.getText("i18n", "gitService_cherryPickRequestFailedStatusDetailedMessage"),
						sType: "Warning"
					};
			}
			if (!oResponse.HeadUpdated) {
				throw {
					name: this._i18n.getText("i18n", "gitService_successCherryPickRequestHasBeenAlreadyPicked"),
					detailedMessage: this._i18n.getText("i18n", "gitService_successCherryPickRequestNothingChangedInfo"),
					sType: "Info"
				};
			}
		},

		_getStashLocation: function(oGit) {
			return this.getRepositoryDetails(oGit).then(function(oRepositoryDetails) {
				return oRepositoryDetails.StashLocation;
			});
		},

		getCurrentBranch: function(aBranches) {
			for (var i = 0; i < aBranches.length; i++) {
				if (aBranches[i].Current) {
					return aBranches[i];
				}
			}
			return {};
		},

		checkoutRemoteBranch: function(oGit, sBranchName) {
			var that = this;
			this.context.service.log.info("git", "Checkout Remote Branch " + sBranchName + " request sent", ["user"]).done();
			return this.getRepositoryDetails(oGit).then(function(oCloneData) {
				return oGitDao.checkoutRemoteBranch(oCloneData, sBranchName).then(function(oResult) {
					that.context.service.log.info("git", "Checkout Remote Branch request completed successfully", ["user"]).done();
					return oResult;
				});
			}).fail(
				function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCheckoutRemoteBranchRequestFailed", [sBranchName]),
						oError);
				});

		},

		checkoutLocalBranch: function(oGit, sBranchName, oLog) {
			var that = this;
			this.context.service.log.info("git", "Checkout Local Branch " + sBranchName + " request sent", ["user"]).done();
			return oGitDao.checkoutLocalBranch(oGit, sBranchName, oLog).then(function(oResult) {
				that.context.service.log.info("git", "Checkout Local request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCheckoutLocalBranchRequestFailed", [sBranchName]), oError);
			}).fin(function() {
				return that.context.event.fireCheckoutBranch(oGit);
			});
		},

		setNewBranchConfiguration: function(oGit, sNewBranchName, sCheckedOutBranch) {
			var that = this;
			this.context.service.log.info("git", "Set New Branch Configurations " + sNewBranchName + " request sent", ["user"]).done();
			return this.getRepositoryConfigurations(oGit).then(
				function(aConfigurations) {
					for (var i = 0; i < aConfigurations.length; i++) {
						if (aConfigurations[i].Key === "branch." + sCheckedOutBranch + ".merge") {
							return that.setRepositoryConfiguration(oGit, {
								Key: "branch." + sNewBranchName + ".merge",
								Value: aConfigurations[i].Value.constructor === Array ? aConfigurations[i].Value[0] : aConfigurations[i].Value
							}).then(
								function() {
									return that.context.service.log.info("git", "Set New Branch Configurations " + sNewBranchName + " completed successfully", [
										"user"]);
								});
						}
					}
				}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorSetNewBranchConfigurationFailed"), oError);
			});
		},

		createLocalBranch: function(oGit, sBranchName, sRemoteBranch) {
			var that = this;
			this.context.service.log.info("git", "Create Local Branch " + sBranchName + " request sent", ["user"]).done();

			return this.getRepositoryDetails(oGit).then(
				function(oCloneData) {
					return oGitDao.createLocalBranch(oCloneData, sBranchName, sRemoteBranch).then(function() {
						var sMessage = sRemoteBranch ? "Create Branch request from " + sRemoteBranch + " completed successfully" : "Create Local Branch request completed successfully";
						that.context.service.log.info("git", sMessage, ["user"]).done();
					}).fail(
						function(oError) {
							that._logAndThrowCustomError(that._i18n.getText("i18n",
								"gitService_errorCreateLocalBranchRequestFailed", [sBranchName]), oError);
						});
				});
		},

		resetBranch: function(oGit, sResetType, sRemoteBranch) {
			var that = this;
			this.context.service.log.info("git", "Reset Index request sent", ["user"]).done();
			return oGitDao.doResetIndex(oGit, sResetType, sRemoteBranch).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResponse) {
					that.context.service.log.info("git", "Reset Index request completed successfully", ["user"]).done();
					return oResponse;
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorResetBranchRequestFailed"), oError);
			}).fin(function() {
				return that.context.event.fireResetFinished(oGit);
			});
		},

		discardFiles: function(oGit, aPaths) {
			var that = this;
			this.context.service.log.info("git", "Revert Files request sent", ["user"]).done();
			return oGitDao.doDiscardChanges(oGit, aPaths, true).then(function(oResult) {
				that.context.service.log.info("git", "Revert Files request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRevertFilesRequestFailed"), oError);
			}).fin(function() {
				return that.context.event.fireDiscardFinished(oGit);
			});
		},

		removeLocalBranches: function(aBranches, sRepositoryName) {
			var that = this;
			var aRemovedBranchesName = [];

			var fnRemoveBranches = function(oBranchData) {
				return function() {
					return oGitDao.removeLocalBranch(oBranchData).then(function() {
						aRemovedBranchesName.push(oBranchData.Name);
						return that.context.service.log.info("git", "Remove Local Branch " + oBranchData.Name + " request completed successfully", [
								"user"]);
					}).fail(function(oError) {
						that._logAndThrowCustomError(that._i18n.getText("i18n",
							"gitService_errorRemoveLocalBranchRequestFailed"), oError);
					});
				};
			};

			var oPromise = Q();
			for (var i = 0; i < aBranches.length; i++) {
				var oBranchData = aBranches[i];
				that.context.service.log.info("git", "Remove Local Branch " + oBranchData.Name + " request sent", ["user"]).done();
				oPromise = oPromise.then(fnRemoveBranches(oBranchData));

			}
			return oPromise.fin(function() {
				if (aRemovedBranchesName.length > 0) {
					return that._removeGerritBranchFetchConfiguration(aRemovedBranchesName, sRepositoryName);
				}
			});
		},

		getRepositoryConfigurations: function(oGit) {
			var that = this;
			return oGitDao.getRepositoryConfigurations(oGit).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResponse) {
					if (oResponse.Children) {
						return oResponse.Children;
					}
					return [];
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetUserSettingsRequestFailed"), oError);
			});
		},

		setRepositoryConfiguration: function(oGit, oConfiguration) {
			var that = this;
			this.context.service.log.info("git", "Set Repository Configurations request sent", ["user"]).done();
			return oGitDao.setRepositoryConfiguration(oGit, oConfiguration).then(function() {
				that.context.service.log.info("git", "Set Repository Configuration updated successfully", ["user"]).done();
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorSetRepositoryConfigurationFailed"), oError);
			});
		},

		setGitSettings: function(sGitEmailAddress, sGitUserName) {
			var that = this;
			that.context.service.log.info("git", "Settings request sent", ["user"]).done();
			return oGitDao.setGitSettings(sGitEmailAddress, sGitUserName).then(function() {
				that.context.service.log.info("git", "Settings updated successfully", ["user"]).done();
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_error_Unable_to_update_Git_settings"), oError);
			});
		},

		getGitSettings: function() {
			var that = this;
			return oGitDao.getGitSettings().then(function(oResponse) {
				that.context.service.log.info("git", "Settings fetched successfully", ["user"]).done();
				if (oResponse.userInfo) {
					return {
						sEmail: oResponse.userInfo.GitMail,
						sName: oResponse.userInfo.GitName
					};
				}
				return {
					sEmail: "",
					sName: ""
				};

			}).fail(function(oError) {
				//the configurations are not created yet
				if (oError.status === 404 && oError.statusText === "Not Found") {
					that.context.service.log.info("git", "Settings fetched successfully", ["user"]).done();
					return {
						sEmail: "",
						sName: ""
					};
				}
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnable_to_get_Git_Configuration_Settings"), oError);
			});
		},

		_setIgnore: function(sProjectRootPath, aFileRelativePath) {

			if(aFileRelativePath===null || aFileRelativePath.length===0){
				return Q();
			}
			
			var that = this;
			//Get folder name
			var oFileService = that.context.service.filesystem.documentProvider;
			var bFileWritten = false;
			return oFileService.getDocument(sProjectRootPath).then(function(oFolderDocument) {
				return oFolderDocument.objectExists(".gitignore").then(function(bObjectExists) {
					return Q(bObjectExists ? oFileService.getDocument(URI(sProjectRootPath + '/.gitignore').toString()).then(function(
							oGitIgnoreDocument) {
							return oGitIgnoreDocument.getContent();
						}) : "")
						.then(function(sContent) {
							var aContent = sContent.split("\n");
							_.forEach(aFileRelativePath, function(fileRelativePath) {
								if (fileRelativePath !== "" && _.indexOf(aContent, fileRelativePath) === -1) {
									sContent += "\n" + fileRelativePath;
									bFileWritten = true;
								}
							});
							if (bFileWritten) {
								var oBlob = new Blob([sContent]);
								return oFolderDocument.importFile(oBlob, false, true, '.gitignore').then(function(oImportedDoc) {
									//TODO this is not neccessary - used to update the gitpane after ignoring when not using the ignore command
									return oImportedDoc.save();
								});
							}
						});
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnable_to_add_git_ignore"), oError, oError.type);
			}).fin(function() {
				if (!bFileWritten) {
					that.context.service.log.info("git", that._i18n.getText("i18n", "gitService_infoGitIgnoreNotUpdated"), ["user"]).done();
				}
			});
		},

		setIgnore: function(oEntity) {
			var that = this;
			return that.context.service.document.getDocument(oEntity).then(function(oDocument){
				return oDocument.getProject(true).then(function(oProject){
					return that._setIgnore(oProject.getEntity().getFullPath(), [oEntity.getProjectRelativePath()]);
				});
			});
		},

		setIgnoreSystemFiles: function(oProjectDoc) {
			if (!oProjectDoc || !oProjectDoc.getEntity()) {
				return Q();
			}

			var that = this;
			var sProjectRootPath = oProjectDoc.getEntity().getFullPath();
			return that._setIgnore(sProjectRootPath, _.keys(that._oIgnoreMap)).then(function(){
				// Is it a git project?
				var bGitStatus = false;
				if(oProjectDoc.getEntity().getBackendData() && oProjectDoc.getEntity().getBackendData().git){
					//  Stage .gitignore (TODO: is it possible to stageAll?).
					return oProjectDoc.getChild('.gitignore').then(function(oDocument){
						if (oDocument) {
							return that.stageFile(oDocument.getEntity().getBackendData().git);
						}
					}).then(function(){
						//  Untrack files.
						return that._untrackSystemFiles(oProjectDoc);
					}).then(function(){
						return that.context.service.git.getStatus(oProjectDoc.getEntity().getBackendData().git).then(function(aResult){
							bGitStatus = aResult.length ? true : false;
							return Q(bGitStatus);
						});
					});
				} else {
					return Q(bGitStatus);
				}
			});
		},

		_untrackSystemFiles: function(oProjectDoc) {
			var that = this;
			var aFileRelativePath = _.keys(that._oIgnoreMap);
			var aPromises = [];
			_.forEach(aFileRelativePath, function(fileRelativePath) {
				// that.context.service.document.getDocumentByPath(fileRelativePath).then(function (oDocument) {
				aPromises.push(oProjectDoc.getChild(fileRelativePath).fail(function(oError){
					return Q();
				}));
			});
			return Q.all(aPromises).then(function(aResult) {
				var aUntrackPromises = [];
				_.forEach(aResult, function(oDocument) {
					//Check that git object is defined since metadata of git is not returned in the call to create a file.
					//But if the file is just created then it should not be untracked.
					//This is handled here until we fix on Orion side to return metadata on the call to create a new file.
					if(oDocument && oDocument.getEntity().getBackendData().git) {
						aUntrackPromises.push(that.untrack(oDocument.getEntity().getBackendData().git));
					}
				});
				return Q.all(aUntrackPromises).then(function(){
					return Q();
				});
			});
		},
			
		initRepository: function(sName, sLocation, sPath) {
			var that = this;
			that.context.service.log.info("git", "Initialize repository request sent", ["user"]).done();
			return that.context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
				return oRoot.getChild(sName).then(function(oProjectDoc){
					return that.setIgnoreSystemFiles(oProjectDoc).then(function(){
						return oGitDao.doInitRepository(sName, sLocation, sPath).then(function(oTask) {
							return that._waitForTask(oTask).then(function(oResponse) {
								that.context.service.log.info("git", "Initialize repository completed successfully", ["user"]).done();
								return oResponse;
							});
						}).fail(function(oError) {
							that._logAndThrowCustomError("Unable to get initialize git repositorys", oError);
						});
					}).fail(function(oError) {
						that._logAndThrowCustomError("Failed to create .gitignore file", oError);
					});
				});
			});
		},

		isFeatureSupported: function(sFeatureId) {
			return oFeatureToggle.isFeatureSupported("git", sFeatureId);
		},

		addRemote: function(oGit, sRemote, sRemoteURI, sFetchRefSpec, sPushURI, sPushRefSpec) {
			return oGitDao.doAddRemote(oGit, sRemote, sRemoteURI, sFetchRefSpec, sPushURI, sPushRefSpec);
		},

		deleteRemote: function(oGit, remoteAlias) {
			return oGitDao.doDeleteRemote(oGit, remoteAlias);
		},

		getRemotes: function(oGit) {
			return oGitDao.getRemotes(oGit);
		},

		mergeChangesFromRemoteToHead: function(oGit, sRefId) {
			return oGitDao.doMergeChangesFromRemoteToHead(oGit, sRefId);
		},

		revert: function(oGit, oLog) {
			var that = this;
			this.context.service.log.info("git", "Revert request sent", ["user"]).done();
			return oGitDao.doRevert(oGit, oLog).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResult) {
					if (oResult.Result === "OK") {
						that.context.service.log.info("git", "Revert request completed successfully", ["user"]).done();
						return oResult;
					}
					throw new Error(oResult.Result);
				});

			}).fail(function(oError) {
				if (oError.message === "FAILURE") {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRevert"), new Error(that._i18n
						.getText("i18n", "gitService_errorRebaseInteractiveConflicts")), "Warning", "Revert");
				}
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRevert"), oError);
			}).fin(function() {
				return that.context.event.fireRevertFinished(oGit);
			});
		},

		tag: function(oLog, sTagName) {
			var that = this;
			this.context.service.log.info("git", "Tag request sent", ["user"]).done();
			return oGitDao.doTag(oLog, sTagName).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResult) {
					//TODO add validations on result??
					that.context.service.log.info("git", "Tag completed successfully", ["user"]).done();
					return oResult;
				});

			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorTag"), oError);
			});
		},

		untrack: function(oGit) {
			var that = this;
			this.context.service.log.info("git", "Untrack File request sent", ["user"]).done();
			return oGitDao.untrack(oGit).then(function() {
				return that.context.service.log.info("git", "Untrack File request completed successfully", ["user"]);
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUntrackFileFailed"), oError);
			});
		},

		_verifyPushResponse: function(oResult) {
			if (oResult && oResult.Updates && oResult.Updates[0]) {
				var oPushResponse = {
					aSuccessTags: [],
					aFailedTags: [],
					oPushedCommit: null,
					sDetailedMessage: oResult.Message
				};
				//go over updates and update tags arrays and comitted object
				for (var i = 0; i < oResult.Updates.length; i++) {
					var oUpdate = oResult.Updates[i];
					if (oUpdate.LocalName === oUpdate.RemoteName) {
						oUpdate.Result === "OK" ? oPushResponse.aSuccessTags.push(oUpdate.LocalName) : oPushResponse.aFailedTags.push(oUpdate.LocalName);
					} else {
						oPushResponse.oPushedCommit = oUpdate;
					}
				}
				var oResultStatus = oPushResponse.oPushedCommit.Result;
				//SUCCESS
				if (oResultStatus === "OK" || /^Pushing .*done$/.test(oResult.Message)) {
					oPushResponse.aFailedTags.length === 0 ? this.context.service.log.info("git", "Push request completed successfully", ["user"]).done() :
						this.context.service.log.info("git", "Push has been completed with tag errors", ["user"]).done();
					return Q(oPushResponse);
				}
				//NO CHANGES
				if (oResultStatus === "UP_TO_DATE" || oPushResponse.oPushedCommit.Message === "no new changes") {
					//one of tags failed
					if (oPushResponse.aFailedTags.length > 0) {
						throw {
							name: this._i18n.getText("i18n", "gitService_errorPushRequestFailed"),
							message: this._i18n.getText("i18n", "gitService_pushFailedTags", [oPushResponse.aFailedTags.join()]),
							status: "PushFailedWithErrorTag"
						};
					}
					//only tags were pushed and success - light notification
					if (oPushResponse.aSuccessTags.length > 0) {
						return Q();
					}
					throw {
						name: this._i18n.getText("i18n", "gitService_warnNonewChangesToPush"),
						message: this._i18n.getText("i18n", "gitService_warnNonewChangesToPush"),
						type: "Warning"
					};
				}
				//ERROR
				throw {
					name: this._i18n.getText("i18n", "gitService_errorPushRequestFailed"),
					oErrorPushResponse: oPushResponse,
					status: "PushFailed",
					source: "git"
				};
			}
		},

		commitAfterContinue: function(oBranch, sId) {
			return oGitDao.getChangesUri(oBranch.CommitLocation, sId);
		},

		_getChanges: function(oGit) {
			var that = this;
			return this.getLocalBranches(oGit).then(function(oLocalBranches) {
				var aPromises = [];
				for (var i = 0; i < oLocalBranches.length; i++) {
					var aRemoteChildren = oLocalBranches[i].RemoteLocation[0].Children;
					//TEMP - checking that the branch name is not in format 451622/12
					if (aRemoteChildren.length === 1 // Orion5 - size 1 indicates a remote branch
						&& !/^[0-9]+\/[0-9]+$/.test(oLocalBranches[i].Name) && aRemoteChildren[0].Id) // Orion8 - Id parameter is defined only in remote branches
					{
						//in case of no remotes or multiple remotes (fetch from gerrit) do not handle fetch changes
						aPromises.push(oGitDao.getChangesUri(oLocalBranches[i].CommitLocation, aRemoteChildren[0].Id).then(function(sUri) {
							return oGitDao.getChanges(sUri.Location).then(function(oTask) {
								return that._waitForTask(oTask);
							});

						}));
					}
				}
				return Q.all(aPromises).then(function(aResult) {
					var aFetchResults = [];
					for (var i = 0; i < aResult.length; i++) {
						if (aResult[i] && aResult[i].Children && aResult[i].Children.length > 0) {
							aFetchResults.push({
								branch: aResult[i].fromRef.Name + "( " + aResult[i].fromRef.RemoteLocation[0].Children[0].Name + " )",
								changes: aResult[i].Children
							});
						}
					}
					that.context.service.log.info("git", "Fetch request completed", ["user"]).done();
					return aFetchResults;
				});
			});
		},

		_getBranchesData: function(oGit) {
			var that = this;
			return this.getRepositoryDetails(oGit).then(function(oCloneData) {
				return oGitDao.get(oCloneData.BranchLocation).then(function(oTask) {
					return that._waitForTask(oTask);
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_erroGetBranchesDataRequestFailed"), oError);
			});
		},

		_getKnownHost: function(sGitUrl, sLocation, sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, oUserInfo) {
			var that = this;
			var sHostName = URI(sGitUrl).host();
			//1. from local storage
			var sKnownHostKey = this._oStorage.get(this._sSSHKnownHostKey + sHostName);
			if (sKnownHostKey) {
				return Q(sKnownHostKey);
			} else {

				//2. execute get request that should fail, from the response extract the known host
				return oGitDao.doClone(sGitUrl, "", sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation).then(
					function(oCloneResponse) {
						// wait for the server to handle the request
						return that._waitForTask(oCloneResponse).then(function(oResponse) {
							if (!oResponse) {
								//TODO better error handling, defer reject ?
								throw new Error("unexpected error");
							}
							var sKnownHost = that._createKnownHost(oResponse);
							that._oStorage.put(sKnownHostKey, sKnownHost);
							return sKnownHost;
						});
					}).fail(function(oError) {
					return that._handleKnownHost(oError, sHostName);
				});
			}
		},

		_handleKnownHost: function(oError, sHostName) {
			var oData;
			//In case of reposne from the request
			if (oError && oError.HttpCode === 400 && oError.JsonData) {
				oData = oError.JsonData;
				//In case of reposne from the task
			} else if (oError && oError.responseJSON && oError.responseJSON.HttpCode === 400 && oError.responseJSON.JsonData) {
				oData = oError.responseJSON.JsonData;
			}
			if (oData && oData.Host && oData.HostKey && oData.KeyType) {
				var sKnownHost = this._createKnownHost(oData);
				this._oStorage.put(this._sSSHKnownHostKey + sHostName, sKnownHost);
				return sKnownHost;
			}
			throw oError;
		},

		_createKnownHost: function(oData) {
			return oData.Host + " " + oData.KeyType + " " + oData.HostKey;
		},

		_waitForTask: function(oTask) {
			if (!oTask || !oTask.type || oTask.type !== "loadstart") {
				return Q(oTask);
			}
			var deferred = Q.defer();
			this._notifyTaskHandled(oTask, deferred);
			return deferred.promise;
		},

		_notifyTaskHandled: function(oTask, deferred) {
			var that = this;
			if (oTask.type === "loadstart") {
				setTimeout(function() {
					return oGitDao.getTask(oTask).then(function(oTaskResponse) {
						if (!oTaskResponse.Location) {
							oTaskResponse.Location = oTask.Location;
						}
						if (oTaskResponse.type && oTaskResponse.type === "error") {
							deferred.reject(oTaskResponse.Result);
						} else {
							return that._notifyTaskHandled(oTaskResponse, deferred);
						}
					}).fail(function(oError) {
						deferred.reject(oError);
					});
				}, 2000);

			} else {
				if (oTask.Result && oTask.Result.JsonData) {
					deferred.resolve(oTask.Result.JsonData);
				} else {
					deferred.resolve(oTask.Result);
				}
			}
		},

		_getFormattedLogsResponse: function(aLogResponse) {
			var oGraphTree = []; //Tree formated with pointers
			var oGraphTreeNode; // internal tree node
			var oGraphMap = {}; // map from commit id to tree node location

			for (var i = aLogResponse.length - 1; i >= 0; i--) {
				var oListLine = aLogResponse[i];

				var aDiffs = [];
				if (oListLine.Diffs) {
					//Orion 5 support
					if (oListLine.Diffs.constructor === Array) {
						aDiffs = oListLine.Diffs;
					}
					//Orion 8 support
					else if (oListLine.Diffs.Children) {
						aDiffs = oListLine.Diffs.Children;
					}
				}

				oGraphTreeNode = {
					Branches: oListLine.Branches,
					CommitterName: oListLine.CommitterName,
					CommitterEmail: oListLine.CommitterEmail,
					AuthorName: oListLine.AuthorName,
					AuthorEmail: oListLine.AuthorEmail,
					Time: oListLine.Time,
					Name: oListLine.Name,
					Message: oListLine.Message,
					Diffs: aDiffs,
					ParentNames: oListLine.Parents,
					Tags: oListLine.Tags,
					Location: oListLine.Location,
					Children: [],
					Parents: []
				};
				oGraphTree[i] = oGraphTreeNode;
				oGraphMap[oListLine.Name] = oGraphTree[i];
				// Run on all the commits from the oldest to the new and if the parent of the commit exist
				//update the parent commit in the current commit, 
				//then go the the parent commit and update the current commit as its
				//child
				for (var j = 0; j < oGraphTreeNode.ParentNames.length; j++) {
					var oParent = oGraphMap[oGraphTreeNode.ParentNames[j].Name];
					if (oParent) {
						oParent.Children.push(oGraphTreeNode);
						oGraphTreeNode.Parents.push(oParent);
					}
				}
				// Mark diff files with the statuses
				for (j = 0; oGraphTree[i].Diffs && j < oGraphTree[i].Diffs.length; j++) {
					switch (oGraphTree[i].Diffs[j].ChangeType) {
						case "MODIFY":
							oGraphTree[i].Diffs[j].Status = "M";
							oGraphTree[i].Diffs[j].FullStatus = "MODIFIED";
							break;
						case "ADD":
							oGraphTree[i].Diffs[j].Status = "A";
							oGraphTree[i].Diffs[j].FullStatus = "ADDED";
							break;
						case "DELETE":
							oGraphTree[i].Diffs[j].Status = "D";
							oGraphTree[i].Diffs[j].FullStatus = "DELETED";
							break;
					}
				}
			}
			return oGraphTree;
		},

		_getFormattedStageResponse: function(oGitResponse) {
			var oResponse = [];
			oGitResponse.Untracked.forEach(function(oTracked) {
				oTracked["Stage"] = false;
				oTracked["Status"] = "U";
				oTracked["FullStatus"] = "UNTRACKED";
				oResponse.push(oTracked);
			});
			oGitResponse.Modified.forEach(function(oTracked) {
				oTracked["Stage"] = false;
				oTracked["Status"] = "M";
				oTracked["FullStatus"] = "MODIFIED";
				oResponse.push(oTracked);
			});
			oGitResponse.Missing.forEach(function(oTracked) {
				oTracked["Stage"] = false;
				oTracked["Status"] = "D";
				oTracked["FullStatus"] = "DELETED";
				oResponse.push(oTracked);
			});
			oGitResponse.Added.forEach(function(oTracked) {
				oTracked["Stage"] = true;
				oTracked["Status"] = "N";
				oTracked["FullStatus"] = "NEW";
				oResponse.push(oTracked);
			});
			oGitResponse.Changed.forEach(function(oTracked) {
				oTracked["Stage"] = true;
				oTracked["Status"] = "M";
				oTracked["FullStatus"] = "MODIFIED";
				oResponse.push(oTracked);
			});
			oGitResponse.Removed.forEach(function(oTracked) {
				oTracked["Stage"] = true;
				oTracked["Status"] = "D";
				oTracked["FullStatus"] = "DELETED";
				oResponse.push(oTracked);
			});
			oGitResponse.Conflicting.forEach(function(oTracked) {
				oTracked["Stage"] = false;
				oTracked["Status"] = "C";
				oTracked["FullStatus"] = "CONFLICT";
				oResponse.push(oTracked);
			});
			var that = this;
			var fnSetCherryPickCommitDescription = function() {
				var oRepositoryDetails = that._repositoryDetailsMap[oGitResponse.CloneLocation];
				if (oRepositoryDetails) {
					oResponse.CherryPickCommitDescription = oRepositoryDetails.CherryPickCommitDescription;
				}
			};

			switch (oGitResponse.RepositoryState) {
				case "REBASING_INTERACTIVE":
					oResponse.repositoryState = "RebaseInProgress";
					break;
				case "CHERRY_PICKING":
					oResponse.repositoryState = "CherryPickInConflict";
					fnSetCherryPickCommitDescription();
					break;
				case "CHERRY_PICKING_RESOLVED":
					oResponse.repositoryState = "CherryPickResolved";
					fnSetCherryPickCommitDescription();
					this.context.event.fireCherryPickResolved(oGitResponse).done();
					break;
				case "MERGING":
					oResponse.repositoryState = "MergeInConflict";
					break;
				case "MERGING_RESOLVED":
					oResponse.repositoryState = "MergeResolved";
					this.context.event.fireMergeResolved(oGitResponse).done();
					break;
			}
			return oResponse;
		},

		_getFetchFromGerritString: function(sbranch) {
			var aBranchParts = sbranch.split('/');
			return '\n\tfetch = +' + sbranch + ':' + aBranchParts[0] + '/heads/' + aBranchParts[3] + '/' + aBranchParts[4];
		},

		_getBrnachName: function(sGerritUri) {
			var sUriParts = sGerritUri.split('/');
			return sUriParts[3] + '/' + sUriParts[4];
		},

		_logAndThrowCustomError: function(sName, oError, sType, sStatus) {
			var sMessage, sDetailedMessage;
			var aFiles = [];
			if (oError.responseJSON) {
				sMessage = oError.responseJSON.Message || oError.responseJSON.message;
				sDetailedMessage = oError.responseJSON.DetailedMessage || oError.responseJSON.detailedMessage;
			} else {
				sMessage = oError.Message || oError.message;
				sDetailedMessage = oError.DetailedMessage || oError.detailedMessage;
			}
			var oNotification = this.context.service.log.error;
			switch (sType) {
				case "Warning":
					oNotification = this.context.service.log.warn;
					break;
				case "Info":
					oNotification = this.context.service.log.info;
					break;
			}

			if (sDetailedMessage) {
				oNotification("git", sName + " " + sDetailedMessage, ["user"]).done();
			} else {
				oNotification("git", sName + " " + sMessage, ["user"]).done();
			}
			if (oError.status === 409 && sDetailedMessage) {
				var aFileNames = sDetailedMessage.split('\n').splice(1);
				for (var i = 0; i < aFileNames.length; i++) {
					aFiles.push({
						fileName: aFileNames[i]
					});
				}
			}
			throw {
				name: sName,
				message: sMessage,
				detailedMessage: sDetailedMessage || sMessage,
				type: sType,
				source: "git",
				status: sStatus ? sStatus : oError.status,
				files: aFiles,
				sBranchName: oError.sBranchName
			};
		},

		_removeGerritBranchFetchConfiguration: function(aBranchesName, sRepositoryName) {
			return this.context.service.filesystem.documentProvider.getDocument(
				URI('/' + sRepositoryName + '/.git/config').toString()).then(function(oConfigDocument) {
				return oConfigDocument.getContent().then(function(sContent) {
					var sRemoteSection = '[remote "origin"]';
					var iRemote = sContent.indexOf(sRemoteSection);
					var sFirstPart = sContent.substring(0, iRemote + sRemoteSection.length);
					var sPart = sContent.substring(iRemote + sRemoteSection.length);
					var iPart = sPart.indexOf('[');
					var sRemoteOriginPart = sPart.substring(0, iPart);
					var sLastPart = sPart.substring(iPart);
					var sRemoteOriginPartLines = sRemoteOriginPart.split('\n');
					var oGerritBranchRegex = new RegExp("fetch = \\+refs/changes");
					for (var i = 0; i < sRemoteOriginPartLines.length; i++) {
						var sRemoteOriginPartLine = sRemoteOriginPartLines[i];
						if (sRemoteOriginPartLine !== "" && oGerritBranchRegex.test(sRemoteOriginPartLine)) {
							for (var j = 0; j < aBranchesName.length; j++) {
								if (sRemoteOriginPartLine.indexOf(aBranchesName[j]) > -1) {
									sRemoteOriginPartLines.splice(i, 1);
									break;
								}
							}
						}
					}
					sRemoteOriginPart = sRemoteOriginPartLines.join('\n');

					sContent = sFirstPart + sRemoteOriginPart + sLastPart;
					var oBlob = new Blob([sContent]);
					return oConfigDocument.getParent().then(function(oParent) {
						return oParent.importFile(oBlob, false, true, 'config');
					});
				});
			});
		}
	};

});
