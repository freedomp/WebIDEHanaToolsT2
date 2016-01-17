define(["../dao/GitDAO", "../util/PathMapping","../featuretoggle/FeatureToggle"], function(oGitDao, mPathMapping, oFeatureToggle) {


    return {

		_sSSHKnownHostKey: "ssh_known_host_",
		_oStorage: undefined,
		_i18n: undefined,
		_repositoryDetailsMap: {},
		_gitLogDetailsMap: {},

		init: function() {
			jQuery.sap.require("jquery.sap.storage");
			this._oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			this._i18n = this.context.i18n;
		},

        _getDocumnet : function(name){
            var self = this;
            return self.context.service.filesystem.documentProvider.getRoot().then(function(oRoot){
                return self.context.service.document.getDocumentByPath(oRoot.getEntity().getFullPath() + "/" + name);
            }).fail(function(oError){
             
            });

        },
 
        
        calcProjectName : function(sGitUrl){
            var self = this;
            // handle case that url ends with "/"
            if (sGitUrl.endsWith("/"))
            {
            	sGitUrl = sGitUrl.substring(0, sGitUrl.length-1);
           	}            
            
            var gitUrl = sGitUrl.substring(sGitUrl.lastIndexOf("/") + 1);
            var gitIndex = gitUrl.lastIndexOf(".git");
            var projectName = gitUrl;
            if ( gitIndex !== -1){
                projectName = gitUrl.substring(0,gitIndex);
            }
            return self.context.service.filesystem.documentProvider.getRoot().then(function(oRoot){
                    return oRoot.getCurrentMetadata().then(function(oRootMetadataContent) {
                        var lastIndex = 0;
                        for (var i = 0; i < oRootMetadataContent.length; i++) {
                            var sName = oRootMetadataContent[i].name;
                            var splitName = sName.split("-");
                            if ( splitName[0] === projectName ){
                                if(splitName.length === 2 ) {
                                    lastIndex = parseInt(splitName[1]);
                                    lastIndex += 1;
                                }else{
                                    lastIndex = 1;
                                }
                            }
                        }
                        if ( lastIndex !== 0){
                            return projectName + "-" + lastIndex;
                        }else {
                            return projectName;
                        }
                    });
            });
        },

		setIgnoreSystemFiles: function(oProjectDoc){
			return Q();
		},

		clone: function(sGitUrl, sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation) {
			var that = this;
			//get username and mail address

			var projectName = sGitUrl.substring(sGitUrl.lastIndexOf("/")+1,sGitUrl.lastIndexOf("."));
			
            return that.calcProjectName(sGitUrl).then(function(projectName){
                that.context.service.log.info("git", "Clone request sent", ["user"]).done();
                var workspaceId = mPathMapping.workspace.id;
                var oUserInfo = null;
                return Q(!!sGitSshPrivateKey ? that._getKnownHost(sGitUrl, sLocation, sGitSshUsername, sGitPassword,
                    sGitSshPrivateKey, sGitSshPassphrase , oUserInfo , workspaceId , projectName) : "").then(
                    function(sGitSshKnownHost) {
                        // execute clone request
                        var sGitSshKnownHost = "";
                        return oGitDao.doClone(sGitUrl, sGitSshKnownHost, sGitSshUsername, sGitPassword, sGitSshPrivateKey,
                            sGitSshPassphrase, sLocation, null, workspaceId, projectName).then(function(oResponse) {
                                that.context.service.log.info("git", "Clone request completed successfully", ["user"]).done();
                                oResponse.Location = oResponse.projectDescriptor.name; // map to orion response
                                return oResponse;
                            });
                    }).fail(function(oError) {
                        that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCloneRequestFailed"), oError);
                    });
            });

		},

		getRepositoryDetailsByLocation: function(oLocation) {
            return { Name : oLocation.projectDescriptor.name } ;
		},

		getRepositoryDetails: function(oGit) {		
			var that = this;
			return oGitDao.getRepositoryConfigurations(oGit).then(function(repConfig) {
				var repDetails = {};
				repDetails.oGit = oGit;
				if (repConfig["remote.origin.url"])
				{
					repDetails.GitUrl = repConfig["remote.origin.url"].trim();
				}
				else
				{
					repDetails.GitUrl = null;
				}
				return repDetails;

			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetRepositoryDetailsRequestFailed"), oError);
			});
		},

		getFileHead: function(oGit, bStaged) {
			//var that = this;
			//return oGitDao.getFileDiff(oGit, bStaged).then(function(oDiff) {
             //   return oDiff;
			//	//return oGitDao.getFileBase(oDiff);
			//}).fail(function(oError) {
			//	that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorDiffRequestFailed"), oError);
			//});
		},

		getFileNew: function(oGit, bStaged) {
            //return "";
			//var that = this;
			//return oGitDao.getFileDiff(oGit, bStaged).then(function(oDiff) {
             //   return oDiff;
			//	//return oGitDao.getFileNew(oDiff);
			//}).fail(function(oError) {
			//	that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorDiffRequestFailed"), oError);
			//});
		},

		pull: function(oGit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName) {
			var that = this;
			this.context.service.log.info("git", "Pull request sent", ["user"]).done();
            return this.getRepositoryConfigurations(oGit).then(function(oRepConfig) {
                var remoteObj = that.getElementObjFromoRepConfig(oRepConfig, "branch.master.remote");

                return oGitDao.doPull(oGit , remoteObj, sGitSshPrivateKey, sUserName, sGitPassword).then(function() {
						return that.context.service.log.info("git",
                        	"Pull request completed successfully", ["user"]);
                }).fail(function(failure){
                    	if (failure && failure.responseText == "{\"message\":\"Already-up-to-date\"}")
                    	{
    						return that.context.service.log.info("git",
    	                        	"Pull request completed, Repository is allready up-to-date", ["user"]);                   		
                    	}
                    	else
                    	{
                    		that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorPULLRequestFailed"), failure);
                    	}
                }).fin(function() {
                    return that.context.event.firePullFinished(oGit);
                });
            });
		},

		fetch: function(oGit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName) {
			var that = this;
			this.context.service.log.info("git", "Fetch request sent", ["user"]).done();
            return this.getRepositoryConfigurations(oGit).then(function(oRepConfig) {
                var remoteObj = that.getElementObjFromoRepConfig(oRepConfig, "branch.master.remote");

                return oGitDao.doFetch(oGit , remoteObj, sGitSshPrivateKey, sUserName, sGitPassword).then(
                    function(result) {
                        //return that._getChanges(oGit);
                    	return [];
                    });
            });
		},

		fetchFromGerrit: function(oGit, oRepositoryDetails, sName, sBranch, sGitSshPrivateKey, sGitPassword, sUserName) {

		},

		merge: function(oGit, sMerge, sSquash) {
			var that = this;
			this.context.service.log.info("git", "Merge request sent", ["user"]).done();
			return oGitDao.doMerge(oGit, sMerge, sSquash).then(function(oResponse) {
					if (oResponse.mergeStatus === "ALREADY_UP_TO_DATE" || oResponse.mergeStatus === "FAST_FORWARD" || oResponse.mergeStatus === "MERGED") {
						return that.context.service.log.info("git", "Merge request completed successfully: " + oResponse.Result, ["user"]);
					}
					throw new Error(oResponse.mergeStatus);
				})
				.fail(
					function(oError) {
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
			return this.getRemoteNameOfBranch(oGit, sRebase).then(function(remote)
			{
				return oGitDao.doRebase(oGit, remote).then(function(oResponse) {
					if (oResponse.status === "OK" || oResponse.status === "ALREADY_UP_TO_DATE" || oResponse.status === "FAST_FORWARD") {
						return that.context.service.log.info("git", "Rebase request completed successfully", ["user"]);
					}
					throw new Error(oResponse.status);
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
							case "CONFLICTING":
								that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), new Error(
										that._i18n.getText("i18n", "gitService_errorRebaseInteractiveConflicts")), "Warning",
									"RebaseInteractive");
								break;
							default:
								that
									._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRebaseRequestFailed"), oError,
										"Error");
						}

					});
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
				that.context.event.fireRebaseInteractiveFinished(oGit);
			});
		},

		deleteRepositoryConfiguration: function(oConfiguration) {
			//var that = this;
			//this.context.service.log.info("git", "Delete configuration request sent", ["user"]).done();
			//return oGitDao.deleteRepositoryConfiguration(oConfiguration.Location).then(function(oResponse) {
			//	return that.context.service.log.info("git", "Delete configuration completed successfully", ["user"]);
			//}).fail(function(oError) {
			//	that._logAndThrowCustomError(oError.name, oError);
			//});
		},

		updateRepositoryConfiguration: function(oConfiguration, oValue) {
			//var that = this;
			//this.context.service.log.info("git", "Update configuration request sent", ["user"]).done();
			//return oGitDao.updateRepositoryConfiguration(oConfiguration.Location, oValue).then(function(oResponse) {
			//	return that.context.service.log.info("git", "Update configuration completed successfully", ["user"]);
			//}).fail(function(oError) {
			//	that._logAndThrowCustomError(oError.name, oError);
			//});
		},

		_handleRebaseInteractiveResponse: function(oResponse, sRebaseOperation) {
			switch (oResponse.status) {
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

        getElementObjFromoRepConfig : function(oRepConfig, key){
            for(var i = 0; i < oRepConfig.length ; i++){
                if ( oRepConfig[i].Key === key){
                    return oRepConfig[i];
                }
            }
            return null;
        },

		push: function(oGit, bGerrit, oRepositoryDetails, sGitSshPrivateKey, sGitPassword, sUserName, oBranch, bTag) {
            var that = this;
            var sGitUrl = oRepositoryDetails.GitUrl;
            this.context.service.log.info("git", "Push request sent", ["user"]).done();

            return this.getRepositoryConfigurations(oGit).then(function(oRepConfig){
                var remoteObj = that.getElementObjFromoRepConfig(oRepConfig, "branch.master.remote");
                return that.getLocalBranches(oGit).then(function(oLocalBranches){
                    var currentBranch = that.getCurrentBranch(oLocalBranches);
                    if (currentBranch || oBranch ) {
                       sRemoteLocation = currentBranch.FullName;
                    } else {
                        sRemoteLocation = "master";
                    }

                    var refSpec = [];
                    refSpec.push("HEAD" + ":" + sRemoteLocation);
                    return oGitDao.doPush(oGit, refSpec, remoteObj.value[0].trim(), sGitSshPrivateKey, sGitPassword, sUserName).then(function (oResult) {
                        //return that._verifyPushResponse(oResponse);
                    }).fail(function (oError) {
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
                });
            });

        },

		getLog: function(oGit, iPage, iPageSize, sNextPageUri) {
			var that = this;
			var aLogCommits = [];
			this.context.service.log.info("git", "Log request sent", ["user"]).done();
			var sGitCommitLocation = !!sNextPageUri ? sNextPageUri : oGit.CommitLocation;
			return oGitDao.get(sGitCommitLocation, iPage, iPageSize).then(function(oTask) {
				return that._waitForTask(oTask).then(function(oResponse) {
					//Add "next" entries to existing entries for the same branch and document
					if (that._gitLogDetailsMap[oGit.CommitLocation] && !!oResponse.NextLocation) {
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
			//var that = this;
			//return oGitDao.getRepositoriesList(sRootLocation).then(function(oResult) {
			//	return oResult.Children;
			//}).fail(function(oError) {
			//	that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetRepositoriesListRequestFailed"), oError);
			//});
		},


        _genericCopyArr : function(oGitResponseStruct, oGit) {
            var self = this;
            var oGitConvertResponse = [];
            for ( var file in oGitResponseStruct){
                var addedFile = {};
                addedFile.Git = jQuery.extend(true, {}, oGit);
                addedFile.Git.file = oGitResponseStruct[file];
                addedFile.Name =  oGitResponseStruct[file];
                addedFile.Path =  oGitResponseStruct[file];
                addedFile.Location =  oGit.sProjectPath + "/" + oGitResponseStruct[file]; 
                oGitConvertResponse.push(addedFile);
            }
            return oGitConvertResponse;

        },

        mapGetStatusResult : function(oGitResponse, oGit){
            var that = this;
            //"untrackedFolders":  ??????????????
            var oGitConvertResponse = {};
            oGitConvertResponse.Added = [];
            oGitConvertResponse.Changed = [];
            oGitConvertResponse.Conflicting = [];
            oGitConvertResponse.Missing = [];
            oGitConvertResponse.Modified = [];
            oGitConvertResponse.Removed = [];
            oGitConvertResponse.RepositoryState  = oGitResponse.repositoryState; // Need to check clean
            oGitConvertResponse.Type = "Status";
            oGitConvertResponse.Untracked = [];

            oGitConvertResponse.Added =  that._genericCopyArr(oGitResponse.added, oGit);
            oGitConvertResponse.Changed =  that._genericCopyArr(oGitResponse.changed, oGit);
            oGitConvertResponse.Conflicting =  that._genericCopyArr(oGitResponse.conflicting, oGit);
            oGitConvertResponse.Missing =  that._genericCopyArr(oGitResponse.missing, oGit);
            oGitConvertResponse.Modified =  that._genericCopyArr(oGitResponse.modified, oGit);
            oGitConvertResponse.Removed =  that._genericCopyArr(oGitResponse.removed, oGit);
            oGitConvertResponse.Untracked =  that._genericCopyArr(oGitResponse.untracked, oGit);
            return oGitConvertResponse;
        },

		getStatus: function(oGit) {
			var that = this;
			//			this.context.service.log.info("git", "Status request sent", [ "user" ]).done();
			return oGitDao.getStatus(oGit).then(function(oGitResponse) {
				that.context.service.log.info("git", "Status request completed successfully", [ "user" ]).done();
                var oGitConvertResponse = that.mapGetStatusResult(oGitResponse, oGit);
				return that._getFormattedStageResponse(oGitConvertResponse);
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
			return oGitDao.unStageAll(oGit).then(function(oResult) {
				that.context.service.log.info("git", "Unstage All request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnstageAllRequestFailed"), oError);
			});
		},

        mapGetLocalBranches : function(oGit, result){
        	
        	return oGitDao.getRepositoryConfigurations(oGit).then(function(config){
        		
                var convertResultArr = [];
                for(var index = 0 ; index < result.length ; index++){
                	if (result[index].remote == false)
                    {
                		var convertRes = {};
                        var oRemote = {};
                        var oChild = {};
    	                convertRes.Current = result[index].active;
    	                convertRes.Type = "Branch";
    	                convertRes.FullName = result[index].name;
    	                convertRes.Name = result[index].displayName;
    	                convertRes.RemoteLocation = [];
                       // convertRes.RemoteLocation.children = [];
    	                //parse corresponding remote branch for this local (From git config)
                        var remoteName = "branch." + result[index].displayName + ".remote";
    	                var remoteKey = "branch." + result[index].displayName + ".merge";
    	                if (config.hasOwnProperty(remoteKey)) {
                            oRemote.Name = config[remoteName].trim();
                            oRemote.Type = "Remote";
                            oRemote.remoteBranchName = config[remoteKey].trim();
                            oRemote.Children = [];
                            oChild.Type = "RemoteTrackingBranch";
                            oChild.Name = oRemote.Name + "/" + convertRes.Name;

                            oRemote.Children.push(oChild);
                            convertRes.RemoteLocation.push(oRemote);
    	                }
    	                    	              
    	                convertResultArr.push(convertRes);
                    }
                }
                return convertResultArr;        		
        		
        	});
        	
        },

        getRemoteBranchOfLocalBranch: function(oBranch) {
            var aChildren;
            if (!jQuery.isEmptyObject(oBranch) && !jQuery.isEmptyObject(oBranch.RemoteLocation) && oBranch.RemoteLocation.length > 0) {
                var aChildren = oBranch.RemoteLocation[0].Children;
                    return aChildren[0].Name;
            }
            return "";
        },

        getRemoteBranchOfCurrent: function(aBranches) {
            return this.getRemoteBranchOfLocalBranch(this.getCurrentBranch(aBranches));
        },

		getRemoteBranchOfCurrentLocalBranch: function(oGit) {
            var that = this;
            return that.getLocalBranches(oGit).then(function(localBranches) {
            	var currLocalBranch  = that.getCurrentBranch(localBranches);
            	var clbName = currLocalBranch.FullName;
            	var currBranchSuffix = clbName.substring(clbName.lastIndexOf("/"), clbName.length);
            		
        		return that.getRemoteBranches(oGit).then(function(remoteBranches) {
        			for (var index = 0 ; index < remoteBranches.length ; index++){
                		var rbName = remoteBranches[index].Name;
                		var remoteBranchSuffix = rbName.substring(rbName.lastIndexOf("/"), rbName.length);
       					
        				if (remoteBranchSuffix === currBranchSuffix)
        				{
        					return remoteBranches[index];
        				}
        			}
        		});
            });
     	},

		getLocalBranches: function(oGit) {
            var that = this;
            return oGitDao.doGetLocalBranches(oGit).then(function(result) {
               return that.mapGetLocalBranches(oGit, result);
            }).fail(function(oError) {
                that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLocalBranchesRequestFailed"), oError);
            });
		},

        mapRemoteBranches : function(result){
            var convertResultArr = [];
            for(var index = 0 ; index < result.length ; index++){
                var convertRes = {};
                convertRes.Current = result[index].active;
                convertRes.Type = "RemoteTrackingBranch";
                convertRes.FullName = result[index].name;
                convertRes.Name = result[index].displayName;
                convertRes.RemoteLocation = [];
                convertResultArr.push(convertRes);
            }
            return convertResultArr;
        },

        getRemoteBranches: function(oGit) {
			var that = this;
            return oGitDao.doGetRemoteBranches(oGit).then(function(result) {
                return that.mapRemoteBranches(result);
             }).fail(function(oError) {
                 that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLocalBranchesRequestFailed"), oError);
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
			
			
			return that.getRemoteBranchOfCurrentLocalBranch(oGit).then(
				function(remoteBranch) {
					if (!remoteBranch )
					{
						response = {};
						response.Outgoing = 0;
						response.Incoming = 0;
						return response;
					}
					else
					{
						var remoteName = remoteBranch.Name;
					    return oGitDao.getOutgoingCommits(oGit, remoteName).then(
							function(OutCommits){

								response = {};
								response.Outgoing = OutCommits.commits.length;

								return oGitDao.getIncomingCommits(oGit, remoteName).then(
									function(InCommits)
										{
											response.Incoming = InCommits.commits.length;
											return response;

								});
							});
					}
				}
			);

		},

		getLastCommit: function(oGit) {
			var that = this;
			return oGitDao.getLog(oGit).then(function(oResponse) {
				if (oResponse && oResponse.commits && oResponse.commits[0]) {
					var lastCommit = oResponse.commits[0];
					lastCommit.Message = lastCommit.message;
					return lastCommit;
				}
				throw new Error(that._i18n.getText("i18n", "gitService_errorGetLastCommitRequestFailed"));
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetLastCommitRequestFailed"), oError);
			});
		},

		getRemoteNameOfBranch: function(oGit, aBranch) {
			
			return oGitDao.doGetLocalBranches(oGit).then(function(result) {
				for(var index = 0 ; index < result.length ; index++)
				{
					if (aBranch == result[index].displayName)
					{
						return result[index].name;
					}
				}
				return "";
			});
		},

		getCurrentBranchName: function(aBranches) {
            var curBranch = this.getCurrentBranch(aBranches);
			if (!jQuery.isEmptyObject(curBranch)) {
				return curBranch.Name;
			}
			return "";
		},

		cherryPick: function(oGit, oLog) {
			//var that = this;
			//var sCommitName = oLog.Message.split("\n\n")[0];
			//this.context.service.log.info("git", "Cherry-Pick request for commit " + sCommitName + " sent", ["user"]).done();
			//return oGitDao.doCherryPick(oGit, oLog).then(
			//	function(oTask) {
			//		return that._waitForTask(oTask)
			//			.then(
			//				function(oResponse) {
			//					that._handleCherryPickResponse(oResponse);
			//					that.context.service.log
			//						.info("git",
			//							"Cherry-Pick request for commit " + sCommitName + " completed successfully", ["user"]).done();
			//				});
			//	}).fail(function(oError) {
			//	if (oError.status) {
			//		that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCherryPickRequestFailed"), oError);
			//	}
			//	that._repositoryDetailsMap[oGit.CloneLocation].CherryPickCommitDescription = sCommitName;
			//	that._logAndThrowCustomError(oError.name, oError, oError.sType);
             //   }).fin(function() {
             //       return that.context.event.fireCherryPickFinished(oGit);
             //   });
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
			return oGitDao.checkoutRemoteBranch(oGit, sBranchName).then(function(oResult) {
				that.context.service.log.info("git", "Checkout Remote Branch request completed successfully", ["user"]).done();
				return oResult;
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
			}).fail(
				function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorCheckoutLocalBranchRequestFailed", [sBranchName]), oError);
                }).fin(function() {
                    return that.context.event.fireCheckoutBranch(oGit);
                });
		},

		setNewBranchConfiguration: function(oGit, sNewBranchName, sCheckedOutBranch) {
//			var that = this;
//			this.context.service.log.info("git", "Set New Branch Configurations " + sNewBranchName + " request sent", ["user"]).done();
//			return this.getRepositoryConfigurations(oGit).then(
//				function(aConfigurations) {
//					for (var i = 0; i < aConfigurations.length; i++) {
//						if (aConfigurations[i].Key === "branch." + sCheckedOutBranch + ".merge") {
//							return that.setRepositoryConfiguration(oGit, {
//								Key: "branch." + sNewBranchName + ".merge",
//								Value: aConfigurations[i].Value
//							}).then(
//								function() {
//									return that.context.service.log.info("git", "Set New Branch Configurations " + sNewBranchName + " completed successfully", [
//										"user"]);
//								});
//						}
//					}
//				}).fail(function(oError) {
//				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorSetNewBranchConfigurationFailed"), oError);
//			});
		},

		createLocalBranch: function(oGit, sBranchName) {
			var that = this;
			this.context.service.log.info("git", "Create Local Branch " + sBranchName + " request sent", ["user"]).done();

			return oGitDao.createLocalBranch(oGit, sBranchName).then(function() {
				that.context.service.log.info("git", "Create Local Branch request completed successfully", ["user"]).done();
			}).fail(
				function(oError) {
					that._logAndThrowCustomError(that._i18n.getText("i18n",
						"gitService_errorCreateLocalBranchRequestFailed", [sBranchName]), oError);
				});

		},

		resetBranch: function(oGit, sResetType, sRemoteBranch) {
			var that = this;
			this.context.service.log.info("git", "Reset Index request sent", ["user"]).done();
			return oGitDao.doResetBranch(oGit, sResetType, sRemoteBranch).then(function(oResponse) {
					that.context.service.log.info("git", "Reset Index request completed successfully", ["user"]).done();
					return oResponse;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorResetBranchRequestFailed"), oError);
            }).fin(function() {
                return that.context.event.fireResetFinished(oGit);
            });
		},

		discardFiles: function(oGit, aPaths) {
			var that = this;
			this.context.service.log.info("git", "Revert Files request sent", ["user"]).done();
			return oGitDao.doDiscardChanges(oGit, aPaths).then(function(oResult) {
				that.context.service.log.info("git", "Revert Files request completed successfully", ["user"]).done();
				return oResult;
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorRevertFilesRequestFailed"), oError);
            }).fin(function() {
                return that.context.event.fireDiscardFinished(oGit);
            });
		},

		removeLocalBranches: function( aBranches, sRepositoryName, oGit) {
			var that = this;
			var aRemovedBranchesName = [];

			var fnRemoveBranches = function(oBranchData) {
				return function() {
					return oGitDao.removeLocalBranch(oBranchData, oBranchData.Name, oGit).then(function() {
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

        mapGetRepositoryConfigurations : function(oResponse){
            var converConfigurationtResult = [];
            for( var configElement in oResponse){
                var configurationRes = {};
                configurationRes.Key = configElement;
                configurationRes.Type = "Config";
                configurationRes.value = [];
                configurationRes.value.push(oResponse[configElement]);
                converConfigurationtResult.push(configurationRes);
            }
            return converConfigurationtResult;
        },

		getRepositoryConfigurations: function(oGit) {
			var that = this;
			return oGitDao.getRepositoryConfigurations(oGit).then(function(oResponse) {
                if (oResponse) {
                    return that.mapGetRepositoryConfigurations(oResponse);
                }
                return {};
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorGetUserSettingsRequestFailed"), oError);
			});
		},

		setRepositoryConfiguration: function(oGit, oConfiguration) {
//			var that = this;
//			this.context.service.log.info("git", "Set Repository Configurations request sent", ["user"]).done();
//			return oGitDao.setRepositoryConfiguration(oGit, oConfiguration).then(function() {
//				that.context.service.log.info("git", "Set Repository Configuration updated successfully", ["user"]).done();
//			}).fail(function(oError) {
//				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorSetRepositoryConfigurationFailed"), oError);
//			});
		},

		setGitSettings: function(sGitEmailAddress, sGitUserName) {
//			var that = this;
//			that.context.service.log.info("git", "Settings request sent", ["user"]).done();
//			return oGitDao.setGitSettings(oGit, sGitEmailAddress, sGitUserName).then(function() {
//				that.context.service.log.info("git", "Settings updated successfully", ["user"]).done();
//			}).fail(function(oError) {
//				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_error_Unable_to_update_Git_settings"), oError);
//			});
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

		setIgnore: function(oEntity) {
			var that = this;
			var sParentPath = oEntity.getParentPath();
			var sFileName = oEntity.getName();
			//Get folder name
			var oFileService = that.context.service.filesystem.documentProvider;

			return oFileService.getDocument(sParentPath).then(function(oFolderDocument) {
				return oFolderDocument.objectExists(".gitignore").then(function(bObjectExists) {
					return Q(bObjectExists ? oFileService.getDocument(URI(sParentPath + '/.gitignore').toString()).then(function(
						oGitIgnoreDocument) {
						return oGitIgnoreDocument.getContent();
					}) : "").then(function(sContent) {
						if (sContent) {
							sContent += "\n";
						}
						sContent += "/" + sFileName;
						var oBlob = new Blob([sContent]);
						return oFolderDocument.importFile(oBlob, false, true, '.gitignore');
					});
				});
			}).fail(function(oError) {
				that._logAndThrowCustomError(that._i18n.getText("i18n", "gitService_errorUnable_to_add_git_ignore"), oError);
			});
		},

        isStashSupported: function(oGit) {
            return false;
        },

		initRepository: function(sName, sLocation, sPath) {
			var that = this;
            var workspaceId = mPathMapping.workspace.id;

            that.context.service.log.info("git", "Initialize repository request sent", ["user"]).done();
			return oGitDao.doInitRepository(sName, sLocation, sPath, workspaceId).then(function(oResponse) {
			//	return that._waitForTask(oTask).then(function(oResponse) {
					that.context.service.log.info("git", "Initialize repository completed successfully", ["user"]).done();
					return oResponse;
			//	});
			}).fail(function(oError) {
				that._logAndThrowCustomError("Unable to get initialize git repositorys", oError);
			});
		},

		addRemote: function(oGit, sRemote, sRemoteURI, sFetchRefSpec, sPushURI, sPushRefSpec) {
			return oGitDao.doAddRemote(oGit, sRemote, sRemoteURI, sFetchRefSpec, sPushURI, sPushRefSpec);
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

			}).fail(
				function(oError) {
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
					if (aRemoteChildren.length === 1 && !/^[0-9]+\/[0-9]+$/.test(oLocalBranches[i].Name)) {
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
								branch: oLocalBranches[i].RemoteLocation[0].Children[0].Name,
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

		_getKnownHost: function(sGitUrl, sLocation, sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, oUserInfo , workspaceId , projectName) {
			var that = this;
			var sHostName = URI(sGitUrl).host();
			//1. from local storage
			var sKnownHostKey = this._oStorage.get(this._sSSHKnownHostKey + sHostName);
			if (sKnownHostKey) {
				return Q(sKnownHostKey);
			} else {

				//2. execute get request that should fail, from the response extract the known host
				return oGitDao.doClone(sGitUrl, "", sGitSshUsername, sGitPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation,"" , workspaceId, projectName).then(
					function(oCloneResponse) {
						// wait for the server to handle the request
					//	return that._waitForTask(oCloneResponse).then(function(oResponse) {
							if (!oCloneResponse) {
								//TODO better error handling, defer reject ?
								throw new Error("unexpected error");
							}
							var sKnownHost = that._createKnownHost(oCloneResponse);
							that._oStorage.put(sKnownHostKey, sKnownHost);
							return sKnownHost;
					//	});
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
			if (!oTask ) {
				return Q(oTask);
			}
			var deferred = Q.defer();
			this._notifyTaskHandled(oTask, deferred, oTask);
			return deferred.promise;
		},

		_notifyTaskHandled: function(oTask, deferred, prevTask) {
			var that = this;
//			if(oTask == prevTask) {
//				setTimeout(function() {
//						return oGitDao.getTask(oTask).then(function(oTaskResponse) {
//							if (oTaskResponse == oTask) {
//								return that._notifyTaskHandled(oTaskResponse, deferred, oTask);
//							}
//							else{
//								deferred.resolve(oTaskResponse);
//							}
//						}).fail(function(oError) {
//							deferred.reject(oError);
//						});
//					}, 2000);
//			}
//			 else {
				deferred.resolve(oTask);
//			}
		},

		_getFormattedLogsResponse: function(aLogResponse) {
			var oGraphTree = []; //Tree formated with pointers
			var oGraphTreeNode; // internal tree node
			var oGraphMap = {}; // map from commit id to tree node location

			for (var i = aLogResponse.length - 1; i >= 0; i--) {
				var oListLine = aLogResponse[i];
				oGraphTreeNode = {
					Branches: oListLine.Branches,
					CommitterName: oListLine.CommitterName,
					CommitterEmail: oListLine.CommitterEmail,
					AuthorName: oListLine.AuthorName,
					AuthorEmail: oListLine.AuthorEmail,
					Time: oListLine.Time,
					Name: oListLine.Name,
					Message: oListLine.Message,
					Diffs: oListLine.Diffs,
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

        isFeatureSupported: function(sFeatureId) {
            return oFeatureToggle.isFeatureSupported("git", sFeatureId);
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