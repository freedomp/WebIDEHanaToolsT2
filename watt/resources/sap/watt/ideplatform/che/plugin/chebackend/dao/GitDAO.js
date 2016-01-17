define(["../io/Request"], function(oRequest) {

	var Git = {

			_getImportPostData: function(sGitSshKnownHost, sGitSshUsername, sGitSshPrivateKey, sGitUrl, sGitSshPassword, sGitSshPassphrase,
			sLocation, oUserInfo) {
			var oPostData = {
				"project": {
					"type": "blank"
				}, 
				"source": {
					"runners": {}, 
					"project": {
						"location": sGitUrl, 
						"type": "git-ba",
						"parameters": {
                            "userName" : sGitSshUsername === null || sGitSshUsername === undefined ? "" :sGitSshUsername ,
                            "password" : sGitSshPassword === null || sGitSshPassword === undefined ? "" :sGitSshPassword
						}
					}
				}
			};
			return oPostData;
		},

		doInitRepository: function(sName, sLocation, sPath, sWorkspaceId) {

            var oPostData = {};
            oPostData.initCommit = true;
            oPostData.workingDir = "";
            oPostData.bare =  false;

            var sUri = URI("git/" + sWorkspaceId +"/init?projectPath="+sName).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},

		doClone: function(sGitUrl, sGitSshKnownHost, sGitSshUsername, sGitSshPassword, sGitSshPrivateKey, sGitSshPassphrase, sLocation,
				oUserInfo, sWorkspaceId, projectName) {

			var sUri = URI("/project/"+sWorkspaceId+"/import/"+ projectName+"?force=true").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, this._getImportPostData(sGitSshKnownHost, sGitSshUsername, sGitSshPrivateKey, sGitUrl,
				sGitSshPassword, sGitSshPassphrase, sLocation, oUserInfo));
		},

		doFetch: function(oGit, remote, sGitPrivateKey, sUserName, sGitPassword) {

            var oPostData = {};

            //oPostData.refSpec = [];
            oPostData.remote =  remote.value[0].trim();
            oPostData.removeDeletedRefs =  false;
            oPostData.timeout =  0;
            oPostData.attributes = {};
            oPostData.attributes.userName = sUserName;
            oPostData.attributes.password = sGitPassword;

            var sUri = URI("git/" + oGit.sWorkspaceId +"/fetch?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		doPull: function(oGit, remote, sGitSshPrivateKey, sUserName, sGitPassword) { //oRemoteData, bForce, sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, sGitSshPassword) {

            var oPostData = {};

            //oPostData.refSpec = [];
            oPostData.remote =  remote.value[0].trim();
            oPostData.timeout =  0;
            oPostData.attributes = {};
            oPostData.attributes.userName = sUserName;
            oPostData.attributes.password = sGitPassword;            
            

            var sUri = URI("git/" + oGit.sWorkspaceId +"/pull?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		getRepositoryDetails: function(oGit) {
            var oPostData = {};
            oPostData.getAll = true;
 
            var sUri = URI("git/" + oGit.sWorkspaceId +"/config?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);


		},

		getUserInfo: function() {
			var sUrl = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "GET");

		},

		getRepositoryConfigurations: function(oGit) {

            var oPostData = {};
            oPostData.getAll = true;

            var sUri = URI("git/" + oGit.sWorkspaceId +"/config?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},

		setRepositoryConfiguration: function(oGit, oPostData) {
			//var sUrl = URI(oGit.ConfigLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUrl, "POST", {}, oPostData);
		},

		deleteRepositoryConfiguration: function(oEntry) {
			//var sUrl = URI(oEntry).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUrl, "DELETE", {});
		},

		updateRepositoryConfiguration: function(oEntry, oPutData) {
			//var sUrl = URI(oEntry).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUrl, "PUT", {}, oPutData);
		},

		doRebase: function(oGit, branch, operation) {
			var oPostData = {};
			oPostData.branch = branch;
			oPostData.operation = operation ? operation : "BEGIN";

			var sUrl = URI("git/" + oGit.sWorkspaceId +"/rebase?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUrl, "POST", {}, oPostData);
		},

		doMerge: function(oGit, sCommit, sSquash) {
			var postData = {};
			postData.commit = sCommit;
			//postData.Squash = sSquash ? sSquash : false;
			//oPostData.operation = operation ? operation : "BEGIN";

			var sUrl = URI("git/" + oGit.sWorkspaceId +"/merge?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
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

        doGetLocalBranches : function(oGit){
            var oPostData = {};
            oPostData.listMode =  "a";
            var sUri = URI("git/" + oGit.sWorkspaceId +"/branch-list?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
        },

        doGetRemoteBranches : function(oGit){
            var oPostData = {};
            oPostData.listMode =  "r";
            var sUri = URI("git/" + oGit.sWorkspaceId +"/branch-list?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
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

		doPush: function(oGit, refSpec ,remote, sGitSshPrivateKey, sGitPassword, sUserName) {

			//if (bGerrit) {
			//	var iRemoteOriginLocation = sRemoteBranchLocation.indexOf("remote/origin/") + "remote/origin/".length;
			//	sRemoteBranchLocation = sRemoteBranchLocation.substr(0, iRemoteOriginLocation) + "refs%252Ffor%252F" + sRemoteBranchLocation.substr(
			//		iRemoteOriginLocation);
			//}
			//var sUri = URI(sRemoteBranchLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//var oPostData = this._getPostData(sGitSshKnownHost, sGitSshUsername, sGitPrivateKey, undefined, sGitSshPassword);
			//oPostData["PushSrcRef"] = sPushSrcRef;
			//oPostData["PushTags"] = bPushTags;
			//oPostData["Force"] = bForce;
			//return oRequest.send(sUri, "POST", {}, oPostData);


            var postData = {};

            postData.refSpec = refSpec;
            postData.remote  = remote;
            postData.force = false;
            postData.timeout = 0;
            postData.attributes = {};
            postData.attributes.userName = sUserName;
            postData.attributes.password = sGitPassword;

            var sUri = URI("git/" + oGit.sWorkspaceId +"/push?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, postData);

		},

		doCherryPick: function(oGit, oLog) {
			//var postData = {};
			//postData["Cherry-Pick"] = oLog.Name;
			//var sUrl = URI(oGit.HeadLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUrl, "POST", {}, postData);
		},

		getTask: function(oTask) {
			if (oTask) {
				var sUri = URI(URI(oTask).path()).absoluteTo(sap.watt.getEnv("orion_path")).toString();
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
			//var sUri = URI("gitapi/clone/" + sRootLocation).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUri, "GET");
		},

		getStatus: function(oGit) {

            var oPostData = {};
            var sUri = URI("git/" + oGit.sWorkspaceId +"/status?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		doCommit: function(oGit, sMessage, oUserInfo, bAmend, bChangeId) {

            var oPostData = {};
            oPostData.message = sMessage;
            oPostData.amend = bAmend;
          //  oPostData.all = false;

            var sUri = URI("git/" + oGit.sWorkspaceId +"/commit?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);


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


            var oPostData = {};
            var fileFilter = oGit.sProjectPath.substring(oGit.sProjectPath.lastIndexOf("/") + 1);
            var projectPath = oGit.sProjectPath.substring(0,oGit.sProjectPath.lastIndexOf("/"));
           // oPostData.type = "RAW";
            oPostData.cached = false;
            oPostData.fileFilter = [fileFilter];

            if (bStaged) {
                oPostData.cached = true;
            }
            var sUri = URI("git/" + oGit.sWorkspaceId +"/diff?projectPath="+ projectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

			//var sUri = null;

			//	//FIXME this is a workaround as the oGit object does not have the diff between index and HEAD
			//	sUri = URI(oGit.DiffLocation.replace("Default", "Cached") + "?parts=uris").absoluteTo(sap.watt.getEnv("orion_path"))
			//		.toString();
			//} else {
			//	sUri = URI(oGit.DiffLocation + "?parts=uris").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//}
			//return oRequest.send(sUri, "GET");
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

		getOutgoingCommits: function(oGit, since) {
			var oPostData = {};
			oPostData.revisionRangeSince = since;
			oPostData.revisionRangeUntil = "HEAD";
			
			var sUri = URI("git/" + oGit.sWorkspaceId +"/log?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oPostData);


		},

		getIncomingCommits: function(oGit, until) {
			var oPostData = {};
			oPostData.revisionRangeSince = "HEAD";
			oPostData.revisionRangeUntil = until;
			
			var sUri = URI("git/" + oGit.sWorkspaceId +"/log?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST", {}, oPostData);

		},

		
		getLog: function(oGit) {
			var sUri = URI("git/" + oGit.sWorkspaceId +"/log?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "POST");
		},

		getCommitHistory: function(oGit, nPage) {
			var sUri = URI(oGit.CommitLocation + "/?page=" + nPage).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		checkoutLocalBranch: function(oGit, sBranchName, oLog) {
			
            var oPostData = {};
            oPostData.name = sBranchName;
            var sUri = URI("git/" + oGit.sWorkspaceId +"/checkout?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		createLocalBranch: function(oGit, sBranchName) {
			
            var oPostData = {};
            oPostData.name = sBranchName;
            var sUri = URI("git/" + oGit.sWorkspaceId +"/branch-create?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		removeLocalBranch: function(oBranchData, sBranchName, oGit) {
			
            var oPostData = {};
            oPostData.name = sBranchName;
            oPostData.force= true;
            var sUri = URI("git/" + oGit.sWorkspaceId +"/branch-delete?projectPath="+ oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
						
//			var sUri = URI(oBranchData.Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
//			return oRequest.send(sUri, "DELETE");
		},

		checkoutRemoteBranch: function(oGit, sBranchName) {
            var oPostData = {};
            oPostData.name = sBranchName;
            oPostData.startPoint = "";
            oPostData.createNew = true;		
            
            var sUri = URI("git/" + oGit.sWorkspaceId +"/checkout?projectPath="+ oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		stageMultipleFiles: function(oGit, aPaths) {

 			var oPostData = {};
            oPostData.attributes = { all : true};
            oPostData.filepattern = aPaths;
            //oPostData.update =  false;
         //   oPostData.all = true;
            var sUri = URI("git/" + oGit.sWorkspaceId +"/add?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},

		stage: function(oGit) {

            var oPostData = {};
            oPostData.filepattern = [oGit.file];
            oPostData.update =  oGit.update;

            var sUri = URI("git/" + oGit.sWorkspaceId +"/add?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);

		},
		
		doResetBranch: function(oGit, sResetType, sRemoteBranch) {

            var oPostData = {};
            oPostData.type = sResetType;
            if ( sRemoteBranch) {
                oPostData.commit = sRemoteBranch;
            }

            var sUri = URI("git/" + oGit.sWorkspaceId +"/reset?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},


		unStage: function(oGit) {
            var oPostData = {};
            oPostData.commit = "HEAD";

            oPostData.filePattern = [oGit.file];

            var sUri = URI("git/" + oGit.sWorkspaceId +"/reset?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},

		doDiscardChanges: function(oGit, aPaths) {
            var oPostData = {};
            oPostData.files = aPaths;
            
            var sUri = URI("git/" + oGit.sWorkspaceId +"/checkout?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},

		unStageAll: function(oGit) {
            var oPostData = {};
            oPostData.commit = "HEAD";

            var sUri = URI("git/" + oGit.sWorkspaceId +"/reset?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
            return oRequest.send(sUri, "POST", {}, oPostData);
		},

		getGitSettings: function() {


			var sUri = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
			return oRequest.send(sUri, "GET");
		},

		setGitSettings: function(oGit, sGitEmailAddress, sGitUserName) {
			
//			var userName = "user.name";
//			var usereMail = "user.email";
//			
//			var postData = {};
//			postData.configEntriesToSet = {};
//            postData.configEntriesToSet.userName = sGitUserName;
//            postData.configEntriesToSet.usereMail = sGitEmailAddress;
//			
//			
//            var sUri = URI("git/" + oGit.sWorkspaceId +"/config?projectPath="+oGit.sProjectPath).absoluteTo(sap.watt.getEnv("orion_path")).toString();
//            return oRequest.send(sUri, "POST", {}, postData);

            
//			var sUri = URI("prefs/user/git/config").absoluteTo(sap.watt.getEnv("orion_path")).toString();
//			return oRequest.send(sUri, "PUT", {}, {
//				userInfo: {
//					"GitMail": sGitEmailAddress,
//					"GitName": sGitUserName
//				}
//			});
		},

		doTag: function(oLog, sTagName) {
			//var sUri = URI(oLog.Location).absoluteTo(sap.watt.getEnv("orion_path")).toString();
			//return oRequest.send(sUri, "PUT", {}, {
			//	Name: sTagName
			//});
		}

	};

	return Git;

});