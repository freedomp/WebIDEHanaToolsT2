define(["infra/utils/documentUtils" ], function (docUtils) {
	"use strict";

	return {
		cloneRepository : function() {
			var that = this;
			var sGitSshPassphrase;//undefined
			return that._getLocation().then(function(sLocation) {
				return that.oGit_Service.clone(that.oOptions.GitUrl, that.oOptions.sGitUserName, that.oOptions.sGitPassword, that.oOptions.sGitSshPrivateKey, sGitSshPassphrase, sLocation).then(function (oResponse) {
					if (that.oOptions.bBypassCodeReview || that.oOptions.sUserEmail) {
						//return that._oFileSystem.documentProvider.getRoot().then(function (oRootDocument) {
						return that.oOptions.oRoot.refresh().then(function () {
							var sProjectName = oResponse.Location.split("/").splice(-1)[0];
							return that.oOptions.oRoot.getChild(sProjectName);
						}).then(function (oProjectDoc) {
							if (that.oOptions.bBypassCodeReview) {
								return that.oGit_Service.setRepositoryConfiguration(oProjectDoc.getEntity().getBackendData().git, {
									Key: 'gerrit.createchangeid',
									Value: true
								}).then(function () {
									return oProjectDoc;
								});
							}
							return oProjectDoc;
						}).then(function (oProjectDoc) {
							if (that.oOptions.sUserEmail) {
								return that.oGit_Service.setRepositoryConfiguration(oProjectDoc.getEntity().getBackendData().git, {
									Key: 'user.email',
									Value: that.oOptions.sUserEmail
								});
							}
						}).then(function () {
							return Q(oResponse);
						});
						//});
					}
					return Q(oResponse);
				});
			});
		},

		_getLocation : function() {
			var that = this;
			return that.oDocumentProvider.getRoot().then(
				function(oRoot) {
					return oRoot.getEntity().getBackendData().location;
				});
		},

		fetchFromGerrit : function(oGitProj, sBranch){
			var that = this;

			var parts = oGitProj.RemoteLocation.split('/');
			var sName = parts[parts.length - 2];

			var oRepositoryDetails = {
				GitUrl : that.oOptions.GitUrl,
				RemoteLocation : oGitProj.RemoteLocation,
				Name : sName
			};
			return that.oGit_Service.fetchFromGerrit(oGitProj, oRepositoryDetails, oRepositoryDetails.Name, sBranch, that.oOptions.sGitSshPrivateKey, that.oOptions.sGitPassword, that.oOptions.sGitUserName);
		},

		editAndStageFile : function(oPojectDocument, fileName, fileContent) {
			var that = this;
			var oGit = oPojectDocument.getEntity().getBackendData().git;

			return docUtils.editFile(oPojectDocument, fileName, fileContent).then(function () {
				return that.oGit_Service.getStatus(oGit).then(function (aStatus) {
					var status = that.getFileStatus(aStatus, fileName);
					if (status !== null) {
						return that.oGit_Service.stageFile(oGit);
					}
					return Q(false);
				});
			});
		},

		getFileStatus : function(aStatus,sFileName) {
			if(aStatus!==null && aStatus.length>=0){
				return _.find(aStatus, "Name", sFileName);
			}
			return null;
		},

		fetch : function(oGit){
			var that = this;
			var oRepositoryDetails = {
				gitUrl : that.oOptions.gitUrl,
				RemoteLocation : oGit.RemoteLocation
			};
			return that.oGit_Service.fetch(oGit, oRepositoryDetails, that.oOptions.sGitSshPrivateKey, that.oOptions.sGitPassword, that.oOptions.sGitUserName);
		},

		_getApplyLocation : function(oRootDocument) {
			var oGit = oRootDocument.getEntity().getBackendData().git;
			return this.oGit_Service.getStash(oGit).then(function(aStash) {
				return aStash.Children[0].ApplyLocation;
			});
		},

		_useStash : function(oRootDocument, bApply) {
			//keep the stash
			var that = this;
			var oGit = oRootDocument.getEntity().getBackendData().git;
			return that._getApplyLocation(oRootDocument).then(function(oApplyLocation) {
				var oStashInfo = {
					apply: bApply,
					applyLocation: oApplyLocation
				};
				return that.oGit_Service.useStash(oGit, oStashInfo);
			});

		},

		applyStash : function(oRootDocument) {
			var that = this;
			return that._useStash(oRootDocument, true);
		},

		dropStash : function(oRootDocument) {
			var that = this;
			return that._useStash(oRootDocument, false);
		},

		createEditAndStageFile : function(oPojectDocument, fileName, fileContent) {
			var that = this;
			var oGit = oPojectDocument.getEntity().getBackendData().git;
			return docUtils.createAndEditFile(oPojectDocument, fileName, fileContent).then(function() {
				return that.getFileStageStatus(oPojectDocument, fileName).then(function(status){
					if (status !== null) {
						return that.oGit_Service.stageFile(oGit);
					}
					return Q(false);
				});
			});
		},

		pull : function(oGit){
			var that = this;
			var oRepositoryDetails = {
				GitUrl : that.oOptions.GitUrl,
				RemoteLocation : oGit.RemoteLocation
			};
			return that.oGit_Service.pull(oGit, oRepositoryDetails, that.oOptions.sGitSshPrivateKey, that.oOptions.sGitPassword, that.oOptions.sGitUserName);
		},

		doPullAndPush : function(oGit,oBranch) {
			var that = this;
			var oRepositoryDetails = {
				GitUrl : that.oOptions.GitUrl,
				RemoteLocation : oGit.RemoteLocation
			};
			return that.oGit_Service.pull(oGit, oRepositoryDetails, that.oOptions.sGitSshPrivateKey, that.oOptions.sGitPassword, that.oOptions.sGitUserName).then(function() {
				return that.oGit_Service.push(oGit, that.oOptions.bGerrit, oRepositoryDetails, that.oOptions.sGitSshPrivateKey, that.oOptions.sGitPassword, that.oOptions.sGitUserName, oBranch, true, that.oOptions.bBypassCodeReview).fail(function(error) {
					if (error.oErrorPushResponse &&
						(
							error.oErrorPushResponse.oPushedCommit.Result === "REJECTED_NONFASTFORWARD" ||
							error.oErrorPushResponse.oPushedCommit.Message === "failed to lock" /* "Result":"REJECTED_OTHER_REASON" */
						)
					) {
						return that.doPullAndPush(oGit);
					} else {
						throw error;
					}
				});
			});
		},

		merge : function(oGit, sMerge, sSquash, bChangeId){
			var that = this;
			return that.oGit_Service.merge(oGit, sMerge, sSquash, bChangeId);
		},

		deleteAndStageFile : function(oPojectDocument, fileName) {
			var that = this;
			var oGit = oPojectDocument.getEntity().getBackendData().git;

			return docUtils.deleteFile(oPojectDocument, fileName).then(function() {
				return that.getFileStageStatus(oPojectDocument, fileName).then(function(status){
					if (status !== null) {
						return that.oGit_Service.stageFile(oGit);
					}
					return Q(false);
				});
			});
		},

		getFileStageStatus : function(oPojectDocument, fileName){
			var that = this;
			var oGit = oPojectDocument.getEntity().getBackendData().git;
			return that.oGit_Service.getStatus(oGit).then(function(aStatus) {
				return that.getFileStatus(aStatus, fileName);
			});
		},

		popStash : function(oRootDocument) {
			var that = this;
			var oGit = oRootDocument.getEntity().getBackendData().git;
			var oStashInfo = {
				apply: true,
				applyLocation: null
			};
			return that.oGit_Service.useStash(oGit, oStashInfo);
		},

		createAndCheckoutLocalBranch : function(oGit, sNewBranchName, sRemoteBranchName) {
			var that = this;
			return that.oGit_Service.createLocalBranch(oGit, sNewBranchName, sRemoteBranchName).then(function(){
				return that.oGit_Service.checkoutLocalBranch(oGit, sNewBranchName);
			});
		},

		createCommit : function(oProjectDocument, oCommitParams) {
			var that = this;
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var aPromisses = [];

			for (var iIndex in oCommitParams.files) {
				aPromisses.push(docUtils.createAndEditFile(oProjectDocument, oCommitParams.files[iIndex].sFileName, oCommitParams.files[iIndex].sFileContent));
			}

			return Q.all(aPromisses).then(function() {
				var aPath = [];
				var oPromiss = null;
				if (oCommitParams.files.length === 1) {
					oPromiss = that.oGit_Service.stageFile(oGit);
				} else {
					for (var index in oCommitParams.files) {
						aPath.push(oCommitParams.files[index].sFileName);
					}
					oPromiss = that.oGit_Service.stageMultipleFiles(oGit, aPath);
				}
				return oPromiss.then(function() {
					return that.oGit_Service.getStatus(oGit);
				}).then(function(oStatusBeforeCommit){
					assert.equal(oStatusBeforeCommit.length, oCommitParams.files.length , "After commit get status should be " + oCommitParams.files.length );
					for (index in oStatusBeforeCommit) {
						assert.equal(oStatusBeforeCommit[index].FullStatus, "NEW", "Status should ne new");
					}
					return that.oGit_Service.commit(oGit, oCommitParams.sMessage, oCommitParams.oUserInfo, oCommitParams.bAmend, oCommitParams.bChangeId);
				}).then(function() {
					return that.oGit_Service.getStatus(oGit);
				}).then(function(oStatusAftereCommit) {
					assert.equal(oStatusAftereCommit.length, 0, "After commit get status should be zero");
				});
			});
		},

		getCommitLoacation : function(sCommitLocation, aBranches) {
			var aCommitLocation = sCommitLocation.split("/");
			var iCommitIndex = aCommitLocation.indexOf("commit");
			if (iCommitIndex !== -1) {
				var bHasBranches = aCommitLocation[iCommitIndex + 1] !== "file";
				if (aBranches.length === 0) {
					if (bHasBranches) {
						aCommitLocation.splice(iCommitIndex + 1, 1);
					}
				} else {
					if (bHasBranches) {
						aCommitLocation[iCommitIndex + 1] = encodeURIComponent(encodeURIComponent(aBranches.join("|")));

					} else {
						aCommitLocation.splice(iCommitIndex + 1, 0, encodeURIComponent(encodeURIComponent(aBranches.join("|"))));
					}
				}
			}
			return aCommitLocation.join("/");
		},

		clearRepositoryOnTestEnd : function(oProjectDocument){
			var that = this;
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var aBranches;
			var aPromises = [];
			aPromises.push(that.oGit_Service.getLocalBranches(oGit).then(function(aLocalBranches) {
				if (aLocalBranches.length > 1) {
					return that.oGit_Service.getCurrentBranchName(aLocalBranches).then(function(sBranchName) {
						if (sBranchName !== "master" ){
							oGit.CommitLocation = oGit.CommitLocation.replace(sBranchName, "master");
						}
						return Q(sBranchName === "master" ? true : that.oGit_Service.checkoutLocalBranch(oGit, "master")).then(function () {

							var filterBranches = _.filter(aLocalBranches, function (branch) {
								return branch.Name !== "master";
							});
							if (filterBranches.length > 0) {
								return that.oGit_Service.removeLocalBranches(filterBranches, oProjectDocument.getTitle());
							}
						});
					});
				}
			}).fail(function(oError){
				assert.fail(true,true, oError);
			}));

			return Q.all(aPromises).then(function () {
				return that.oGit_Service.resetBranch(oGit,"HARD","master").then(function() {
					return oProjectDocument.refresh().then(function() {
						return that.oGit_Service.getStatus(oGit).then(function (aStatus) {
							if (aStatus.length > 0) {
								var aPromisesEx = [];
								_(aStatus).forEach(function (n) {
									aPromises.push(docUtils.deleteFile(oProjectDocument, n.Name));
								}).value();

								return Q.all(aPromisesEx);
							}
							else{
								return Q(true);
							}
						});
					});
				}).fail(function(oError){
					assert.fail(true,true, oError);
				});
			});
		},


		getSshTestUserName : function(){
			return "webide_git_tester";
		},

		getSshTestUserKey : function(){
		return "\
-----BEGIN RSA PRIVATE KEY-----\n\
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\n\
-----END RSA PRIVATE KEY-----\n\
";
	}
	};

});