define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitClientCloneSpec", getService = STF.getServicePartial(suiteName);

	describe('gitClientCloneSpec - git integration test with clone', function () {
		var sProjectName1;
		var sProjectName2;
		var oProjectDocument_1;
		var oProjectDocument_2;


		var oOptions = {
			sGitUserName: gitUtils.getSshTestUserName(),
			sGitPassword: "",
			sGitSshPrivateKey: gitUtils.getSshTestUserKey(),
			GitUrl: "ssh://git.wdf.sap.corp:29418/infra_integration_test.git",
			bGerrit: true
		};

		before(function () {
			var that = this;
			this.timeout(180000);
			return orionUtils.startWebIdeWithOrion(suiteName, {config: "infra/git/config.json"}).then(function (webIdeWindowObj) {
				gitUtils.oDocumentProvider = getService("filesystem.documentProvider");
				gitUtils.oGit_Service = getService("git");
				var oOrionFileDAO = getService("orionFileDAO");
				gitUtils.oDocumentProvider._oDAO = oOrionFileDAO;
				gitUtils.oOptions = oOptions;

				return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
					//gitUtils.oOptions.sLocation = oRoot.getEntity().getBackendData().location;
					gitUtils.oOptions.oRoot = oRoot;

					return gitUtils.cloneRepository().then(function (oResponse1) {
						return oRoot.refresh().then(function () {
							sProjectName1 = oResponse1.Location.split("/").splice(-1)[0];
							return oRoot.getChild(sProjectName1).then(function (oProjectDoc1) {
								assert.equal(oProjectDoc1.getTitle(), sProjectName1);
								oProjectDocument_1 = oProjectDoc1;
								return gitUtils.cloneRepository().then(function (oResponse2) {
									return oRoot.refresh().then(function () {
										sProjectName2 = oResponse2.Location.split("/").splice(-1)[0];
										return oRoot.getChild(sProjectName2).then(function (oProjectDoc2) {
											assert.equal(oProjectDoc2.getTitle(), sProjectName2);
											oProjectDocument_2 = oProjectDoc2;
										});
									});
								});
							});
						});
					});
				});
			});
		});

		after(function () {
			var aPromises = [];
			if (oProjectDocument_1) {
				aPromises.push(oProjectDocument_1.delete());
			}
			if (oProjectDocument_2) {
				aPromises.push(oProjectDocument_2.delete());
			}

			return Q.all(aPromises).then(function () {
				assert.ok(true, "moduleDone");
			}).fin(function(){
				return STF.shutdownWebIde(suiteName);
			});
		});

		it("1. Fetch From Gerrit", function () {
			var oGitProj = oProjectDocument_1.getEntity().getBackendData().git;
			var fileName = "fetch.from.gerrit.txt";
			var gerrit_EGit = "refs/changes/54/1268954/1";
			var branchName = "1268954/1";

			return docUtils.getFileContent(oProjectDocument_1, fileName).then(function (oContent) {
				assert.equal(oContent, "0", "file content should contain '0'");

				return gitUtils.fetchFromGerrit(oGitProj, gerrit_EGit).then(function (oResponse) {
					assert.ok(true, "fetchFromGerrit succeeds");

					return docUtils.getFileContent(oProjectDocument_1, fileName).then(function (oContent) {
						assert.equal(oContent, "01/11/2015 - Updated", "file content should contain '01/11/2015 - Updated'");
						return gitUtils.oGit_Service.checkoutLocalBranch(oGitProj, "master").then(function () {
							return gitUtils.oGit_Service.getLocalBranches(oGitProj).then(function (oBrnachList) {
								var aKeys = Object.keys(oBrnachList);
								var aBranches = [];
								for (var i = 0; i < aKeys.length; i++) {
									var sKey = aKeys[i];
									if (oBrnachList.hasOwnProperty(sKey) && oBrnachList[sKey].Name !== "master") {
										aBranches.push(oBrnachList[sKey]);
									}
								}
								return gitUtils.oGit_Service.removeLocalBranches(aBranches, sProjectName1);
							});
						});
					});
				});
			});
		});

		it("2. Fetch From Gerrit , Switch Branches , Fetch (Incident ID: 1570750976)", function () {
			var oGit = oProjectDocument_2.getEntity().getBackendData().git;
			var fileName = "fetch.from.gerrit.txt";
			var gerrit_EGit = "refs/changes/54/1268954/1";
			var branchName = "1268954/1";
			var fileContent = Math.random().toString();
			var sMessage = "Commit Message " + fileContent;
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;

			return docUtils.getFileContent(oProjectDocument_2, fileName).then(function (oContent) {
				assert.equal(oContent, "0", "file content should contain '0'");

				return gitUtils.fetchFromGerrit(oGit, gerrit_EGit).then(function (oResponse) {
					assert.ok(true, "fetchFromGerrit succeeds");

					return docUtils.getFileContent(oProjectDocument_2, fileName).then(function (oContent) {
						assert.equal(oContent, "01/11/2015 - Updated", "file content should contain '01/11/2015 - Updated'");

						return gitUtils.editAndStageFile(oProjectDocument_2, fileName, fileContent).then(function () {
							return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
						}).then(function (oCommit) {
							return docUtils.getFile(oProjectDocument_2, fileName);
						}).then(function (oFile) {
							var oGit_file = oFile.getEntity().getBackendData().git;
							return gitUtils.oGit_Service.getLog(oGit_file, 1, 50);
						}).then(function (oLogList) {
							assert.equal(oLogList.aFormattedLogData[0].Message.indexOf(sMessage) != -1, true, "Commit should be " + sMessage);
							assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status, "M", "Status should be M");
							assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, fileName, "New path should be " + fileName);
							return gitUtils.oGit_Service.checkoutLocalBranch(oGit, "master");
						}).then(function (oResult) {
							return docUtils.getFileContent(oProjectDocument_2, fileName);
						}).then(function (oContent) {
							assert.equal(oContent, "0", "file content should contain '0'");
							return gitUtils.fetch(oGit);
						}).then(function (oFetchResponse) {
							assert.ok((oResponse.length >= 0), "fetch succeeds");
							return gitUtils.oGit_Service.checkoutLocalBranch(oGit, branchName);
						}).then(function (oResult) {
							return docUtils.getFileContent(oProjectDocument_2, fileName);
						}).then(function (oContent) {
							assert.equal(oContent, fileContent, "file content should contain " + fileContent);
							return docUtils.getFile(oProjectDocument_2, fileName);
						}).then(function (oFile) {
							var oGit_file = oFile.getEntity().getBackendData().git;
							return gitUtils.oGit_Service.getLog(oGit_file, 1, 50);
						}).then(function (oLogList) {
							assert.equal(oLogList.aFormattedLogData[0].Message.indexOf(sMessage) != -1, true, "Commit should be " + sMessage);
							assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status, "M", "Status should be M");
							assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, fileName, "New path should be " + fileName);
							return gitUtils.oGit_Service.checkoutLocalBranch(oGit, "master");
						}).then(function () {
							return gitUtils.oGit_Service.getLocalBranches(oGit);
						}).then(function (oBrnachList) {
							if (oBrnachList !== null) {
								var aKeys = Object.keys(oBrnachList);
								var aBranches = [];
								for (var i = 0; i < aKeys.length; i++) {
									var sKey = aKeys[i];
									if (oBrnachList.hasOwnProperty(sKey) && oBrnachList[sKey].Name !== "master") {
										//TODO Must be opened after update of Orion
										//equal(aResponse[sKey].RemoteLocation[0] != null && aResponse[sKey].RemoteLocation[0].Children[0] != null && aResponse[sKey].RemoteLocation[0].Children[0].Id != null, true, "This is local branch from remote");
										aBranches.push(oBrnachList[sKey]);
									}
								}
								return gitUtils.oGit_Service.removeLocalBranches(aBranches, sProjectName2).then(function(){
									assert.ok((oResponse.length >= 0), "fetch succeeds");
								}).fail(function (oError) {
									var message = oError.detailedMessage ? oError.message + " " + oError.detailedMessage : oError.message;
									assert.fail(true, true, "removeLocalBranches - " + message);
								});
							}

						});
					});
				});
			});
		});

		it("3. check branch for commit - git history", function() {
			var that = this;
			var oOptions = {};
			var sMasterBranchName = "origin/master";
			var aNewBranchName = ["firstBranch", "secodnBranch"];
			var promiseArr = [];
			var fileName = "file.for.firstbranch";
			var fileContent = Math.random().toString();
			var sMessage = "Commit Message first branch";
			var sMessage2 = "Commit Message second branch";
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			//_initTestGit.call(this, oOptions);
			return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[0], sMasterBranchName).then(function(){
				return gitUtils.oGit_Service.checkoutLocalBranch( oGit, aNewBranchName[0]).then(function(){
						return gitUtils.editAndStageFile(oProjectDocument_1, fileName, fileContent).then(function () {
							return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId).then(function(){
								return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[1], sMasterBranchName).then(function(){
										return gitUtils.oGit_Service.checkoutLocalBranch( oGit, aNewBranchName[1]).then(function(){
											fileName  = "file.for.secondbranch";
											fileContent = Math.random().toString();
											return gitUtils.editAndStageFile(oProjectDocument_1, fileName, fileContent).then(function () {
												return gitUtils.oGit_Service.commit(oGit, sMessage2, oUserInfo, bAmend, bChangeId).then(function(){
														oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, ["refs/heads/" + aNewBranchName[0]]);
														return gitUtils.oGit_Service.getLog(oGit, 1, 50).then(function (oLogList) {
															for(var i = 0 ; i < oLogList.aFormattedLogData.length ; i++){
																if ( oLogList.aFormattedLogData[i].Message ===  sMessage){
																	assert.equal(oLogList.aFormattedLogData[i].Branches[0].FullName, "refs/heads/" + aNewBranchName[0], "Branch should be refs/heads/firstBranch");
																	break;
																}
															}
															oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, ["refs/heads/" + aNewBranchName[1]]);
															return gitUtils.oGit_Service.getLog(oGit, 1, 50).then(function (oLogList) {
																for(var i = 0 ; i < oLogList.aFormattedLogData.length ; i++){
																	if ( oLogList.aFormattedLogData[i].Message ===  sMessage2){
																		assert.equal(oLogList.aFormattedLogData[i].Branches[0].FullName, "refs/heads/" + aNewBranchName[1], "Branch should be refs/heads/firstBranch");
																		break;
																	}
																}
						
						
																oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, ["refs/heads/master"]);
																return gitUtils.oGit_Service.getLocalBranches(oGit).then(function(aResponse){
																	var aBranches = [];
																	var aKeys = Object.keys(aResponse);
																	for (var i = 0; i < aKeys.length; i++) {
																		var sKey = aKeys[i];
																		if (aResponse.hasOwnProperty(sKey) && aResponse[sKey].Name !== "master" ) {
																			//TODO Must be opened after update of Orion
																			//equal(aResponse[sKey].RemoteLocation[0] != null && aResponse[sKey].RemoteLocation[0].Children[0] != null && aResponse[sKey].RemoteLocation[0].Children[0].Id != null, true, "This is local branch from remote");
																			aBranches.push(aResponse[sKey]);
																		}
																	}
								
																return gitUtils.oGit_Service.checkoutLocalBranch( oGit, "master").then(function(){
																	return gitUtils.oGit_Service.removeLocalBranches([aBranches[0]], sProjectName1).then(function() {
																		return gitUtils.oGit_Service.removeLocalBranches([aBranches[1]], sProjectName1).then(function() {
																	});
																});
															});
														});
													});
												});
											});
										});
									});
							});
						});
					});
				});
			});
		});
		
		it("4. Create multi local branches from remote", function() {
			var that = this;
			var oOptions = {};
			var sMasterBranchName = "origin/master";
			var aNewBranchName = ["testBranch1", "testBranch2", "testBranch3", "testBranch4"];
			var promiseArr = [];
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;
			//_initTestGit.call(this, oOptions);

			var iCreatesNumOfBranches = 0;
			return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[0], sMasterBranchName).then(function(){
				return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[1], sMasterBranchName).then(function(){
					return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[2], sMasterBranchName).then(function(){
						return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[3], sMasterBranchName).then(function(){
							return gitUtils.oGit_Service.getLocalBranches(oGit).then(function(aResponse){
								iCreatesNumOfBranches = aResponse.length - 1;

								var aBranches = [];
								var aKeys = Object.keys(aResponse);
								for (var i = 0; i < aKeys.length; i++) {
									var sKey = aKeys[i];
									if (aResponse.hasOwnProperty(sKey) && aResponse[sKey].Name !== "master" ) {
										//TODO Must be opened after update of Orion
										//equal(aResponse[sKey].RemoteLocation[0] != null && aResponse[sKey].RemoteLocation[0].Children[0] != null && aResponse[sKey].RemoteLocation[0].Children[0].Id != null, true, "This is local branch from remote");
										aBranches.push(aResponse[sKey]);
									}
								}
								return gitUtils.oGit_Service.checkoutLocalBranch( oGit, "master").then(function(){
									return gitUtils.oGit_Service.removeLocalBranches([aBranches[0]], sProjectName1).then(function() {
										return gitUtils.oGit_Service.removeLocalBranches([aBranches[1]], sProjectName1).then(function() {
											return gitUtils.oGit_Service.removeLocalBranches([aBranches[2]], sProjectName1).then(function() {
												return gitUtils.oGit_Service.removeLocalBranches([aBranches[3]], sProjectName1).then(function() {
													return gitUtils.oGit_Service.getLocalBranches(oGit).then(function (aResponse) {
														assert.equal(iCreatesNumOfBranches,aNewBranchName.length, "The local branches was created ");
														assert.equal(aResponse.length, 1, "Number of Branches must be 1 after delete a breanch");
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

	});
});