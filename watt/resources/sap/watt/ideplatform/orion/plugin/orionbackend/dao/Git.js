define(["../io/Request"], function(oRequest) {

	var Git = {

		_getPostData: function(sGitSshKnownHost, sGitSshUsername, sGitSshPrivateKey, sGitUrl, sGitSshPassword, sGitSshPassphrase,
			sLocation, oUserInfo, sDestinationName) {
			var oPostData = {};
			if (sGitUrl) {
				oPostData.GitUrl = sGitUrl;
			}
			if (sGitSshKnownHost) {
				oPostData.GitSshKnownHost = sGitSshKnownHost;
			}
			if (sGitSshUsername) {
				oPostData.GitSshUsername = sGitSshUsername;
			}
			if (sGitSshPassword) {
				oPostData.GitSshPassword = sGitSshPassword;
			}
			if (sGitSshPrivateKey) {
				oPostData.GitSshPrivateKey = sGitSshPrivateKey;
			}
			if (sGitSshPassphrase) {
				oPostData.GitSshPassphrase = sGitSshPassphrase;
			}
			if (sLocation) {
				oPostData.Location = sLocation;
			}
			if (sDestinationName) {
				oPostData.DestinationName = sDestinationName;
			}
			if (oUserInfo) {
				if (oUserInfo.GitMail) {
					oPostData.GitMail = oUserInfo.GitMail;
				}
				if (oUserInfo.GitName) {
					oPostData.GitName = oUserInfo.GitName;
				}
			}
			return oPostData;
		},

		doInitRepository: function(sName, sLocation, sPath, oUserInfo) {
			var oPostData = {};
			oPostData.Name = sName;
			oPostData.Location = sLocation;
			if (oUserInfo) {
				if (oUserInfo.GitMail) {
					oPostData.GitMail = oUserInfo.GitMail;
				}
				if (oUserInfo.GitName) {
					oPostData.GitName = oUserInfo.GitName;
				}
			}
			if (sPath) {
				oPostData.Path = sPath;
			}
			var sUri = URI("gitapi/clone/").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oPostData);
		},

		doClone: function(sGitUrl, sGitSshKnownHost, sGitSshUsername, sGitSshPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation,
			oUserInfo, sDestinationName) {
			var sUri = URI("gitapi/clone/").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, this._getPostData(sGitSshKnownHost, sGitSshUsername, sGitSshPrivateKey, sGitUrl,
				sGitSshPassword, sGitSshPassphrase, sLocation, oUserInfo, sDestinationName));
		},

		doFetch: function(oRemoteData, bForce, sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, sGitSshPassword) {
			var sUri = URI(oRemoteData.Children[0].Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oPostData = this._getPostData(sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, undefined, sGitSshPassword);
			oPostData["Fetch"] = "true";
			oPostData["Force"] = bForce;
			return oRequest.send(sUri, "POST", {}, oPostData);
		},

		doPull: function(oRemoteData, bForce, sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, sGitSshPassword) {
			var sUri = URI(oRemoteData.Children[0].CloneLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oPostData = this._getPostData(sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, undefined, sGitSshPassword);
			oPostData["Pull"] = "true";
			oPostData["Force"] = bForce;
			return oRequest.send(sUri, "POST", {}, oPostData);
		},

		getRepositoryDetails: function(oGit) {
			var sUri = URI(oGit.CloneLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getUserInfo: function() {
			var sUrl = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "GET");

		},

		getRepositoryConfigurations: function(oGit) {
			var sUrl = URI(oGit.ConfigLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "GET");

		},

		setRepositoryConfiguration: function(oGit, oPostData) {
			var sUrl = URI(oGit.ConfigLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, oPostData);
		},

		deleteRepositoryConfiguration: function(oEntry) {
			var sUrl = URI(oEntry).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "DELETE", {});
		},

		updateRepositoryConfiguration: function(oEntry, oPutData) {
			var sUrl = URI(oEntry).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "PUT", {}, oPutData);
		},

		doRebase: function(oGit, sRebase, operation) {
			var oPostData = {};
			oPostData.Rebase = sRebase;
			oPostData.Operation = operation ? operation : "BEGIN";

			var sUrl = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, oPostData);
		},

		doMerge: function(oGit, sMerge, sSquash) {
			var postData = {};
			postData.Merge = sMerge;
			postData.Squash = sSquash ? sSquash : false;
			var sUrl = URI(oGit.CommitLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, postData);
		},

		doAddRemote: function(oGit, sRemote, sRemoteURI, sFetchRefSpec, sPushURI, sPushRefSpec) {
			var postData = {};
			postData.Remote = sRemote;
			postData.RemoteURI = sRemoteURI;
			if (sFetchRefSpec) {
				postData.FetchRefSpec = sFetchRefSpec;
			}
			if (sPushURI) {
				postData.PushURI = sPushURI;
			}
			if (sPushRefSpec) {
				postData.PushRefSpec = sPushRefSpec;
			}
			var sUrl = URI(oGit.RemoteLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, postData);

		},
		
		doDeleteRemote: function(oGit, remoteAlias) {//The default alias is usually "origin"
            var remoteLocationPartsArray = oGit.RemoteLocation.split("/");
            var indexOfFile = remoteLocationPartsArray.indexOf("file");
            var newRemoteLocationPartsArray = remoteLocationPartsArray.slice(0,indexOfFile);
            newRemoteLocationPartsArray.push(remoteAlias);
            newRemoteLocationPartsArray = newRemoteLocationPartsArray.concat(remoteLocationPartsArray.slice(indexOfFile, remoteLocationPartsArray.length));
            var deleteRemoteLocation = newRemoteLocationPartsArray.join("/");		

			var sUrl = URI(deleteRemoteLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "DELETE", {});

		},

        getRemotes: function(oGit) {
            if (!oGit) {
                return Q();
            }
            var sUri = URI(oGit.RemoteLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "GET");
        },

		doMergeChangesFromRemoteToHead: function(oGit, sRefId) {
			var postData = {};
			postData.Merge = sRefId;
			var sUrl = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, postData);

		},
		doRevert: function(oGit, oLog) {
			var postData = {};
			postData.Revert = oLog.Name;
			var sUrl = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, postData);

		},

		doPush: function(bGerrit, bBypassCodeReview, sPushSrcRef, bPushTags, sRemoteBranchLocation, bForce, sGitSshKnownHost, sGitSshUsername,
			sGitPrivateKey, sGitSshPassword) {
			if (bGerrit && !bBypassCodeReview) {
				var iRemoteOriginLocation = sRemoteBranchLocation.indexOf("remote/origin/") + "remote/origin/".length;
				sRemoteBranchLocation = sRemoteBranchLocation.substr(0, iRemoteOriginLocation) + "refs%252Ffor%252F" + sRemoteBranchLocation.substr(
					iRemoteOriginLocation);
			}
			var sUri = URI(sRemoteBranchLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oPostData = this._getPostData(sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, undefined, sGitSshPassword);
			oPostData["PushSrcRef"] = sPushSrcRef;
			oPostData["PushTags"] = bPushTags;
			oPostData["Force"] = bForce;
			return oRequest.send(sUri, "POST", {}, oPostData);
		},

		doCherryPick: function(oGit, oLog) {
			var postData = {};
			postData["Cherry-Pick"] = oLog.Name;
			var sUrl = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, postData);
		},

		getTask: function(oTask) {
			if (oTask && oTask.Location) {
				var sUri = URI(oTask.Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
				return oRequest.send(sUri, "GET");
			} else {
				throw new Error("Missing params");

			}
		},

		getChangesUri: function(sCommitLocation, sId) {
			var sUri = URI(sCommitLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, {
				New: sId
			});
		},

		getChanges: function(sUri) {
			var uri = URI(sUri).absoluteTo(sap.watt.getEnv("orion_path"));
			uri.setSearch({
				pageSize: 1000
			});
			return oRequest.send(uri.toString(), "GET");
		},

		getRepositoriesList: function(sRootLocation) {
			var sUri = URI("gitapi/clone/" + sRootLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getStatus: function(oGit) {
			if (!oGit) {
				return Q();
			}
			var sUri = URI(oGit.StatusLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		doCommit: function(oGit, sMessage, oUserInfo, bAmend, bChangeId) {
			var oPostData = {};
			oPostData.Amend = bAmend;
			oPostData.ChangeId = bChangeId;
			if (sMessage) {
				oPostData.Message = sMessage;
			}
			if (oUserInfo) {
				if (oUserInfo.sEmail) {
					oPostData.CommitterEmail = oUserInfo.sEmail;
				}
				if (oUserInfo.sName) {
					oPostData.CommitterName = oUserInfo.sName;
				}
			}
			var sUri = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oPostData);

		},
		
		doGetStash: function(sStashLocation) {						
			var sUri = URI(sStashLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET", {});
		},
		
		doStash: function(sStashLocation, sMessage) {
			var oPostData = {};
			oPostData.IncludeUntracked = true;
			if (sMessage) {
				oPostData.WorkingDirectoryMessage = sMessage;
				//or oPostData.IndexMessage
			}
			
			var sUri = URI(sStashLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oPostData);
		},
		
		doUseStash: function(sStashLocation, oStashInfo) {
			sStashLocation = !oStashInfo.applyLocation ? sStashLocation : oStashInfo.applyLocation;
			var oPostData;
			var sRequestType;
			if (oStashInfo.apply === true) {
				oPostData = {};
				oPostData.ApplyIndex = oStashInfo.apply;
				oPostData.ApplyUntracked = true;
				sRequestType = "PUT";
			} else {
				sRequestType = "DELETE";
			}
			var sUri = URI(sStashLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, sRequestType, {}, oPostData);
		},

		get: function(sUri, iPage, iPageSize) {
			var sEndUri = URI(sUri).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			if (iPage) {
				sEndUri = URI(sEndUri).setSearch({
					page: iPage
				}).toString();
			}
			if (iPageSize) {
				sEndUri = URI(sEndUri).setSearch({
					pageSize: iPageSize
				}).toString();
			}
			return oRequest.send(sEndUri, "GET");
		},

		getFileDiff: function(oGit, bStaged) {
			var sUri = null;
			if (bStaged) {
				//FIXME this is a workaround as the oGit object does not have the diff between index and HEAD
				sUri = URI(oGit.DiffLocation.replace("Default", "Cached") + "?parts=uris").absoluteTo(sap.watt.getEnv("orion_path"))
					.toString();
			} else {
				sUri = URI(oGit.DiffLocation + "?parts=uris").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			}
			return oRequest.send(sUri, "GET");
		},

		getFileBase: function(oDiff) {
			var sUri = URI(oDiff.Base).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getFileNew: function(oDiff) {
			var sUri = URI(oDiff.New).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getCommitsUri: function(RemoteLocation) {
			var sUri = URI(RemoteLocation.Children[0].CommitLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, {
				New: "HEAD"
			});
		},

		getCommits: function(sLocation) {
			var sUri = URI(sLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getLastCommit: function(oGit) {
			var sUri = URI(oGit.HeadLocation + "/?page=1&pageSize=1").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		getCommitHistory: function(oGit, nPage) {
			var sUri = URI(oGit.CommitLocation + "/?page=" + nPage).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		checkoutLocalBranch: function(oGit, sBranchName, oLog) {
			var sUri = URI(oGit.CloneLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oPostData = {};
			oPostData.Branch = sBranchName;
			if (oLog) {
				oPostData.Tag = oLog.Name;
			}
			return oRequest.send(sUri, "PUT", {}, oPostData);
		},

		createLocalBranch: function(oCloneData, sBranchName, sRemoteBranch) {
			var sUri = URI(oCloneData.BranchLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oPostData = {};
			oPostData.Name = sBranchName;
			if (sRemoteBranch) {
				oPostData.Branch = sRemoteBranch;
			}
			return oRequest.send(sUri, "POST", {}, oPostData);
		},

		removeLocalBranch: function(oBranchData) {
			var sUri = URI(oBranchData.Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "DELETE");
		},

		checkoutRemoteBranch: function(oCloneData, sBranchName) {
			var sUri = URI(oCloneData.BranchLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, {
				Branch: sBranchName
			});
		},

		stageMultipleFiles: function(oGit, aPaths) {
			var oData = {
				"Path": aPaths
			};
			if (!aPaths || aPaths.length === 0) {
				oData = {};
			}
			var sUri = URI(oGit.IndexLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "PUT", {}, oData);
		},

		stage: function(oGit) {
			var sUri = URI(oGit.IndexLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "PUT");
		},

		unStage: function(oGit) {
			var sUri = URI(oGit.IndexLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST");
		},

		doDiscardChanges: function(oGit, aPaths, bRemoveUntracked) {
			var sUri = URI(oGit.CloneLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var bRemoveUntracked = bRemoveUntracked || "false";
			return oRequest.send(sUri, "PUT", {}, {
				"Path": aPaths,
				"RemoveUntracked": bRemoveUntracked
			});
		},

		doResetIndex: function(oGit, sResetParam, sRemoteBranch) {
			var oData = {
				"Reset": sResetParam
			};
			if (sRemoteBranch) {
				oData["Commit"] = sRemoteBranch;
			}
			var sUri = URI(oGit.IndexLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oData);
		},

		getGitSettings: function() {
			var sUri = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		setGitSettings: function(sGitEmailAddress, sGitUserName) {
			var sUri = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "PUT", {}, {
				userInfo: {
					"GitMail": sGitEmailAddress,
					"GitName": sGitUserName
				}
			});
		},

		doTag: function(oLog, sTagName) {
			var sUri = URI(oLog.Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "PUT", {}, {
				Name: sTagName
			});
		},

		untrack: function(oGit) {
			var sUri = URI(oGit.RmLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			var oData = {
				cached: "true"
			};
			return oRequest.send(sUri, "POST", {}, oData);
		}

	};

	return Git;

});