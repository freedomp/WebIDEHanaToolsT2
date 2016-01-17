define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitClientInitSpec", getService = STF.getServicePartial(suiteName);

	describe('gitClientInitSpec - git integration test with init', function () {
		var sProjectName;

		var oProjectDocument;

		var oRoot;

		before(function () {
			var that = this;
			this.timeout(180000);
			return orionUtils.startWebIdeWithOrion(suiteName, {config: "infra/git/config.json"}).then(function (webIdeWindowObj) {
				gitUtils.oDocumentProvider = getService("filesystem.documentProvider");
				gitUtils.oGit_Service = getService("git");
				var oOrionFileDAO = getService("orionFileDAO");
				gitUtils.oDocumentProvider._oDAO = oOrionFileDAO;
				gitUtils.oOptions = {};

				var dTestModuleTimeStamp = Number(new Date());
				sProjectName = "gitIntegration" + dTestModuleTimeStamp;
				return gitUtils.oDocumentProvider.getRoot().then(function(oRootDocument){
					oRoot = oRootDocument;
					var sLocation = oRootDocument.getEntity().getBackendData().location;
					return oRootDocument.createFolder(sProjectName).then(function(oProjectDoc){
						oProjectDocument = oProjectDoc;
						return gitUtils.oGit_Service.initRepository(sProjectName, sLocation, oProjectDocument.getEntity().getBackendData().location).then(function(){
							return oRootDocument.refresh().then(function () {
								return gitUtils.oGit_Service.setRepositoryConfiguration(oProjectDocument.getEntity().getBackendData().git, {
									Key: "remote.origin.fetch",
									Value: "+refs/heads/*:refs/remotes/origin/*"
								});
							});
						});
					});
				});
			});
		});

		after(function () {
			var aPromises = [];
			if (oProjectDocument) {
				aPromises.push(oProjectDocument.delete());
			}
			return Q.all(aPromises).then(function () {
				assert.ok(true, "moduleDone");
			}).fin(function(){
				return STF.shutdownWebIde(suiteName);
			});
		});

		it("1. Stash and pop", function() {
			var that = this;
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var oOptions = {
				stashMessage : "stash file pop"
			};
			gitUtils.oOptions = oOptions;
			assert.ok(oProjectDocument.getTitle(),sProjectName);

			var newFileName = "newFile1";
			var newFileContent = "This is new file";
			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should not exist in project");
				var oStashInfo = {
					apply: true,
					applyLocation: null
				};
				return gitUtils.oGit_Service.useStash(oGit, oStashInfo);
			}).then(function(popStashResult){
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),true,"new file should exist in project");
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length, 0,"Stash list should be 0");
				return docUtils.deleteFile(oProjectDocument, newFileName);
			});
		});

		it("2. Stash and drop", function() {
			var that = this;
			var oOptions = {
				stashMessage    : "stash file drop"
			};

			gitUtils.oOptions = oOptions;
			assert.ok(oProjectDocument.getTitle(),sProjectName);
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			var newFileName = "newFile2";
			var newFileContent = "This is new file";
			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should not exist in project");
				return gitUtils.dropStash(oProjectDocument);
			}).then(function(popStashResult){
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should exist in project");
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,0,"Stash list should be 1");
			});
		});

		it("3. Stash and apply", function() {
			var that = this;
			var oOptions = {
				stashMessage    : "stash file apply",
			};

			gitUtils.oOptions = oOptions;
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			assert.ok(oProjectDocument.getTitle(),sProjectName);

			var newFileName = "newFile3";
			var newFileContent = "This is new file";
			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should not exist in project");
				return gitUtils.applyStash(oProjectDocument);
			}).then(function(popStashResult){
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),true,"new file should exist in project");
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				assert.equal(stashList.Children[0].Message,oOptions.stashMessage,"Stash message should be stash file apply");
				return gitUtils.dropStash(oProjectDocument);
			}).then(function(popStashResult){
				docUtils.deleteFile(oProjectDocument, newFileName);
			});
		});

		it("4. mass Stash", function() {
			var that = this;
			var oOptions = {
				stashMessage    : "stash mass Stash"
			};

			var newFileName = "newFile4";
			var newFileContent = "This is new file";
			var newFileName2 = "newFile5";
			var newFileContent2 = "This is new file2";
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return docUtils.createAndEditFile(oProjectDocument, newFileName2 , newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,2,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should not exist in project");
				assert.equal(docUtils.isFileExist(docEntries,newFileName2),false,"new file should not exist in project");
				return gitUtils.popStash(oProjectDocument);
			}).then(function(){
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName2),true,"new file should exist in project");
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return gitUtils.applyStash(oProjectDocument);
			}).then(function(popStashResult){
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),true,"new file should exist in project");
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return gitUtils.dropStash(oProjectDocument);
			}).then(function(){
				return docUtils.deleteFile(oProjectDocument, newFileName);
			}).then(function(){
				return docUtils.deleteFile(oProjectDocument, newFileName2);
			});
		});

		it("5. Stash and conflict without commit", function() {
			var that = this;
			var oOptions = {
				stashMessage    : "Stash and conflict without commit"
			};
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var newFileName = "newFile6.js";
			var newFileContent = "var nreFile = /\"This is new file/\"";
			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(docEntries){
				assert.equal(docUtils.isFileExist(docEntries,newFileName),false,"new file should not exist in project");
				var updateFileContent = "This is update of the file";
				return docUtils.createAndEditFile(oProjectDocument, newFileName, updateFileContent);
			}).then(function(){
				return gitUtils.popStash(oProjectDocument);
			}).fail(function(oError){
				assert.equal(oError.detailedMessage,"Applying stashed changes resulted in a conflict");
			}).fin(function(){
				return gitUtils.dropStash(oProjectDocument).then(function(){
					return docUtils.deleteFile(oProjectDocument, newFileName);
				});
			});
		});

		it("6. commit test ", function() {
			var that = this;
			var newFileName = "newFile7.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var oOptions = {};
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return gitUtils.createEditAndStageFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatus){
				assert.isArray(aStatus, "The oStatus is not array");
				assert.equal(aStatus.length, 1,"The status must have one status");
				return gitUtils.getFileStageStatus(oProjectDocument, newFileName);
			}).then(function(oStatus){
				assert.notEqual(oStatus,null,"File " + newFileName + " should be available");
				assert.equal(oStatus.Name, newFileName, "File should be = " + newFileName);
				assert.equal(oStatus.FullStatus, "NEW", "Status should be new");
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(oCommit){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatus){
				assert.equal(aStatus.length,0,"After commit get status should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessage, "Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status, "A", "Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, newFileName, "New path should be" + newFileName);
			});
		});

		it("7. commit with local branch test ", function() {
			var that = this;
			var newFileName = "newFile8.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 2";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var oOptions = {};

			var sNewBranchName = "testBranch";
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return gitUtils.createAndCheckoutLocalBranch(oGit, sNewBranchName).then(function(){
				oGit.CommitLocation = oGit.CommitLocation.replace("master", sNewBranchName);
				return gitUtils.createEditAndStageFile(oProjectDocument, newFileName , newFileContent);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusBeforeCommit){
				assert.equal(aStatusBeforeCommit.length,1,"Before  commit get status should be 1");
				var status = gitUtils.getFileStatus(aStatusBeforeCommit,newFileName);
				assert.isNotNull(status,"File should be = " + newFileName);
				assert.equal(status.FullStatus, "NEW", "Status should be new");
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(oCommit){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusAftereCommit){
				assert.equal(aStatusAftereCommit.length, 0, "After commit get status should be empty");
				return gitUtils.oGit_Service.getLocalBranches(oGit);
			}).then(function(aLocalBranch){
				assert.equal(aLocalBranch[0].Name,sNewBranchName,"Test branch");
				assert.equal(aLocalBranch[1].Name,"master","Master branch");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessage,"Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath,newFileName,"New path should be" + newFileName);
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("8. commit amend test ", function() {
			var that = this;
			var newFileName = "newFile9.js";
			var newFileName2 = "newFile10.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oOptions = {};
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return gitUtils.createEditAndStageFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusBeforeCommit){
				assert.equal(aStatusBeforeCommit.length,1,"Before commit get status should be 1");
				var status = gitUtils.getFileStatus(aStatusBeforeCommit,newFileName);
				assert.notEqual(status,null,"File should be = " + newFileName);
				assert.equal(status.FullStatus,"NEW","Status should be new");
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusAftereCommit){
				assert.equal(aStatusAftereCommit.length, 0, "After commit get status should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessage,"Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath,newFileName,"New path should be" + newFileName);
				return gitUtils.createEditAndStageFile(oProjectDocument, newFileName2 , newFileContent2);
			}).then(function(){
				bAmend = true;
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList) {
				assert.equal(oLogList.aFormattedLogData[0].Message, sMessage, "Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs.length, 2, "Should be 1 commit with 2 diffs");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status, "A", "Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, newFileName2, "New path should be" + newFileName);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].Status, "A", "Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].NewPath, newFileName, "New path should be" + newFileName2);
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("9. stage Multiple Files + commit test ", function() {
			var that = this;
			var newFileName = "newFile11.js";
			var newFileName2 = "newFile12.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oOptions = {};
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var aPaths = [];

			return oProjectDocument.createFile(newFileName).then(function(oFileDocument){
				aPaths.push(oFileDocument.getEntity().getName());
				return docUtils.addContentToFile(oFileDocument,newFileContent);
			}).then(function(){
				return oProjectDocument.createFile(newFileName2);
			}).then(function(oFileDoc){
				aPaths.push(oFileDoc.getEntity().getName());
				return docUtils.addContentToFile(oFileDoc,newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.stageMultipleFiles(oGit, aPaths);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusBeforeCommit){
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusAftereCommit){
				assert.equal(aStatusAftereCommit.length, 0, "After commit get status should be empty");
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("10. commit reset HARD test ", function() {
			var that = this;
			var newFileName = "newFile13.js";
			var newFileName2 = "newFile14.js";
			var newFileName3 = "newFile15.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message testBranch";
			var sMessageMasterBranch = "commit message master branch";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var newFileContent3 = "var newFile = /\"This is new file3/\"";
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var aPaths = [];
			var sNewBranchName = "testBranch1";

			return gitUtils.createEditAndStageFile(oProjectDocument, newFileName3, newFileContent3).then(function(){
				return gitUtils.oGit_Service.commit(oGit, sMessageMasterBranch, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.createAndCheckoutLocalBranch(oGit, sNewBranchName);
			}).then(function(){
				oGit.CommitLocation = oGit.CommitLocation.replace("master",sNewBranchName);
				return oProjectDocument.createFile(newFileName);
			}).then(function(oFileDocument){
				aPaths.push(oFileDocument.getEntity().getName());
				return docUtils.addContentToFile(oFileDocument,newFileContent);
			}).then(function(){
				return oProjectDocument.createFile(newFileName2);
			}).then(function(oFileDoc){
				aPaths.push(oFileDoc.getEntity().getName());
				return docUtils.addContentToFile(oFileDoc,newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.stageMultipleFiles(oGit, aPaths);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusBeforeCommit){
				var status = gitUtils.getFileStatus(aStatusBeforeCommit,newFileName);
				assert.isNotNull(status, "File should be = " + newFileName);
				assert.equal(status.FullStatus, "NEW","Status should be new");

				status = gitUtils.getFileStatus(aStatusBeforeCommit,newFileName2);
				assert.isNotNull(status, "File should be = " + newFileName2);
				assert.equal(status.FullStatus,"NEW","Status should be new");

				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusAftereCommit){
				assert.equal(aStatusAftereCommit.length, 0, "After commit get status should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessage,"Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs.length,2,"Should be 1 commit with 2 diffs");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath,newFileName,"New path should be" + newFileName);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].NewPath,newFileName2,"New path should be" + newFileName2);
				assert.equal(oLogList.aFormattedLogData[1].Diffs.length,1,"Should be 1 commit with 1 diff");
				assert.equal(oLogList.aFormattedLogData[1].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[1].Diffs[0].NewPath,newFileName3,"New path should be" + newFileName3);

				return gitUtils.oGit_Service.resetBranch(oGit, "HARD", "master");
			}).then(function(){
				//oGit.CommitLocation = oGit.CommitLocation.replace(sNewBranchName, "master");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData.length, 5, "Should be 5 commit default");
				assert.equal(oLogList.aFormattedLogData[1].Message,"commit message 1","Default commit");
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessageMasterBranch,"Commit of master branch");
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusAfterResert){
				assert.equal(aStatusAfterResert.length, 0,"After resr hard must be empty");
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("11. Git create and delete branch ", function() {
			var that = this;
			var oOptions = {};
			var iBranchesCountBefore = 0;
			var iNewBranchesCount = 0;
			var aResponseEx;

			var oGit = oProjectDocument.getEntity().getBackendData().git;
			return gitUtils.oGit_Service.getLocalBranches(oGit).then(function(aResponse) {
				iBranchesCountBefore = aResponse.length;
				return gitUtils.createAndCheckoutLocalBranch(oGit, "newbranch");
			}).then(function() {
				return gitUtils.oGit_Service.getLocalBranches(oGit);
			}).then(function(aResponse) {
				iNewBranchesCount = iBranchesCountBefore + 1;
				assert.equal(aResponse.length, iNewBranchesCount, "Number of Branches must be " + iNewBranchesCount + " after create a new branch");
				aResponseEx = aResponse;
				return gitUtils.oGit_Service.checkoutLocalBranch(oGit, "master");
			}).then(function() {
				var aBranches = [];
				var sName = "newbranch";
				var aKeys = Object.keys(aResponseEx);
				for (var i = 0; i < aKeys.length; i++) {
					var sKey = aKeys[i];
					if (aResponseEx.hasOwnProperty(sKey) && aResponseEx[sKey].Name === sName) {
						aBranches.push(aResponseEx[sKey]);
					}
				}
				return gitUtils.oGit_Service.removeLocalBranches(aBranches, sProjectName);
			}).then(function() {
				return gitUtils.oGit_Service.getLocalBranches(oGit);
			}).then(function (aResponse) {
				iNewBranchesCount = iNewBranchesCount - 1;
				assert.equal(aResponse.length, iNewBranchesCount, "Number of Branches must be " + iNewBranchesCount + "after delete a branch");
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("12. Git History - History of multi selection branches", function() {
			var that = this;
			var oOptions = {};

			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var oCommitParams;
			// Create a new Branch and commit
			return gitUtils.createAndCheckoutLocalBranch(oGit, "test1").then(function(){
				oCommitParams = {
					files : [
						{
							sFileName: "fileTestFirst1.js",
							sFileContent: "var newFile = /\"This is new file/\""
						},
						{
							sFileName: "fileTestFirst2.js",
							sFileContent: "var newFile = /\"This is new file/\""
						}
					],
					oUserInfo: undefined,
					branches: ["refs/heads/test1"],
					bAmend: false,
					bChangeId: false,
					sMessage: "commit Test 1"
				};
				return gitUtils.createCommit(oProjectDocument, oCommitParams);
			}).then(function(){
				return gitUtils.createAndCheckoutLocalBranch(oGit,"test2");
			}).then(function(){
				oCommitParams = {
					files : [
						{
							sFileName: "fileTest2.js",
							sFileContent: "var newFile = /\"The file in branch test 2 /\""
						}
					],
					oUserInfo: undefined,
					branches: ["refs/heads/test2"],
					bAmend: false,
					bChangeId: false,
					sMessage: "commit Test 2"
				};
				return gitUtils.createCommit(oProjectDocument, oCommitParams);
			}).then(function(){
				oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, ["refs/heads/test1"]);
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,"commit Test 1","Commit should be" +  "commit Test 1");
				oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, ["refs/heads/test2"]);
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,"commit Test 2","Commit should be" +  "commit Test 2");
				oGit.CommitLocation = gitUtils.getCommitLoacation(oGit.CommitLocation, []);
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[1].Message,"commit Test 1","Commit should be" +  "commit Test 1");
				assert.equal(oLogList.aFormattedLogData[0].Message,"commit Test 2","Commit should be" +  "commit Test 2");
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("13. commit reset MIX test ", function() {
			var that = this;
			var newFileName = "newFile16.js";
			var newFileName2 = "newFile17.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oOptions = {};
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var aPaths = [];
			var sNewBranchName = "branchTest_13";

			return gitUtils.createAndCheckoutLocalBranch(oGit, sNewBranchName).then(function(){
				oGit.CommitLocation = oGit.CommitLocation.replace("master",sNewBranchName);
				return oProjectDocument.createFile(newFileName);
			}).then(function(oFileDocument){
				aPaths.push(oFileDocument.getEntity().getName());
				return docUtils.addContentToFile(oFileDocument,newFileContent);
			}).then(function(){
				return oProjectDocument.createFile(newFileName2);
			}).then(function(oFileDoc){
				aPaths.push(oFileDoc.getEntity().getName());
				return docUtils.addContentToFile(oFileDoc,newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.stageMultipleFiles(oGit, aPaths);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatusBeforeCommit){
				var status = gitUtils.getFileStatus(aStatusBeforeCommit,newFileName);
				assert.isNotNull(status, "File should be = " + newFileName);
				assert.equal(status.FullStatus, "NEW", "Status should be new");
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusAftereCommit){
				assert.equal(oStatusAftereCommit.length, 0, "After commit get status should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Message,sMessage,"Commit should be" + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs.length,2,"Should be 1 commit with 2 diffs");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath,newFileName,"New path should be" + newFileName);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].Status,"A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[1].NewPath,newFileName2,"New path should be" + newFileName2);
				return gitUtils.oGit_Service.resetBranch(oGit,"MIXED","master");
			}).then(function(){
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData.length, 5,"Should be 5 commit default");
				assert.equal(oLogList.aFormattedLogData[0].Message,"commit message master branch","commit message master branch");
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusAfterRebase){
				var status = gitUtils.getFileStatus(oStatusAfterRebase,newFileName);
				assert.isNotNull(status,"File should be = " + newFileName);
				assert.equal(status.FullStatus,"UNTRACKED","Status should ne untracked");

				status = gitUtils.getFileStatus(oStatusAfterRebase,newFileName2);
				assert.isNotNull(status,"File should be = " + newFileName2);
				assert.equal(status.FullStatus,"UNTRACKED","Status should ne untracked");
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("14. unStageFile", function(){
			var that = this;
			var newFileName = "newFile18.js";
			var newFileName2 = "newFile19.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oOptions = {};// repositoryName  : "gitIntegration"};
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return gitUtils.createEditAndStageFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.createEditAndStageFile(oProjectDocument, newFileName2 , newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusList){
				assert.equal(oStatusList.length,2,"Should be two files");
				var status = gitUtils.getFileStatus(oStatusList,newFileName);
				assert.isNotNull(status, "File should be = " + newFileName);
				assert.isTrue(status.Stage,"Stage shuld be true");

				status = gitUtils.getFileStatus(oStatusList,newFileName2);
				assert.isNotNull(status,"File should be = " + newFileName2);
				assert.isTrue(status.Stage, "Stage shuld be true");

				return gitUtils.oGit_Service.unStageFile(status.Git);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusList){
				var status = gitUtils.getFileStatus(oStatusList,newFileName);
				assert.isTrue(status.Stage, "Stage shuld be false");

				status = gitUtils.getFileStatus(oStatusList,newFileName2);
				assert.isFalse(status.Stage,"Stage should be true");
				return docUtils.deleteFile(oProjectDocument, newFileName2);
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("15. unstageAll", function() {
			var that = this;
			var newFileName = "newFile20.js";
			var newFileName2 = "newFile21.js";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message 1";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			return gitUtils.oGit_Service.resetBranch(oGit,"HARD","master").then(function() {
				return gitUtils.createEditAndStageFile(oProjectDocument, newFileName, newFileContent);
			}).then(function(){
				return gitUtils.createEditAndStageFile(oProjectDocument, newFileName2 , newFileContent2);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusList){
				assert.equal(oStatusList.length,2,"Should be two files");

				var status = gitUtils.getFileStatus(oStatusList,newFileName);
				assert.isTrue(status.Stage,"Stage shuld be true");

				status = gitUtils.getFileStatus(oStatusList,newFileName2);
				assert.isTrue(status.Stage, "Stage shuld be true");
				return gitUtils.oGit_Service.unstageAll(status.Git);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusList){
				var status = gitUtils.getFileStatus(oStatusList, newFileName);
				assert.isFalse(status.Stage,"Stage shuld be true");

				status = gitUtils.getFileStatus(oStatusList,newFileName2);
				assert.isFalse(status.Stage,"Stage shuld be true");
				return docUtils.deleteFile(oProjectDocument, newFileName);
			}).then(function(){
				return docUtils.deleteFile(oProjectDocument, newFileName2);
			});
		});

		it("16. discardFiles", function() {
			var newFileName = "newFile22.js";
			var newFileName2 = "newFile23.js";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var newFileContent2 = "var newFile = /\"This is new file2/\"";
			var oOptions = {};// repositoryName  : "gitIntegration"};
			var promiseArr = [];
			var that = this;
			var oGit = oProjectDocument.getEntity().getBackendData().git;

			return gitUtils.oGit_Service.resetBranch(oGit,"HARD","master").then(function() {
				promiseArr.push(docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent));
				promiseArr.push(docUtils.createAndEditFile(oProjectDocument, newFileName2 , newFileContent2));
				return Q.all(promiseArr).then(function(){
					return gitUtils.oGit_Service.getStatus(oGit).then(function(oStatusList){
						assert.equal(oStatusList.length, 2, "Should be two files");
						var status = gitUtils.getFileStatus(oStatusList,newFileName);
						assert.isNotNull(status, "File should be = " + newFileName);

						status = gitUtils.getFileStatus(oStatusList,newFileName2);
						assert.isNotNull(status, "File should be = " + newFileName2);

						var files = [];
						files.push(newFileName);
						return gitUtils.oGit_Service.discardFiles(oGit,files).then(function(){
							return gitUtils.oGit_Service.getStatus(oGit).then(function(oStatusList){
								assert.equal(oStatusList.length, 1, "Should be one file");
								var status = gitUtils.getFileStatus(oStatusList, newFileName2);
								assert.isNotNull(status,"No file found with name = " + newFileName2);
								return docUtils.deleteFile(oProjectDocument, newFileName2);
							});
						});
					});
				});
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});
		});

		it("17. tag", function() {
			var that = this;
			var oOptions ={};// { repositoryName  : "gitIntegration"};
			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var sTageName = "myTag";
			var oCommitParams = {
				files : [
					{
						sFileName: "fileTestFirst1.js",
						sFileContent: "var newFile = /\"This is new file/\""
					}
				],
				oUserInfo: undefined,
				branches: ["refs/heads/master"],
				bAmend: false,
				bChangeId: false,
				sMessage: "commit Test 1"
			};
			return gitUtils.createCommit(oProjectDocument, oCommitParams).then(function(){
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				return  gitUtils.oGit_Service.tag(oLogList.aFormattedLogData[0],sTageName);
			}).then(function(){
				return  gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.equal(oLogList.aFormattedLogData[0].Tags[0].Name,sTageName,"Tag name was created with name" + sTageName);
			}).fin(function(){
				return gitUtils.clearRepositoryOnTestEnd(oProjectDocument);
			});

		});

		it("18. Stash and conflict with commit", function() {
			var that = this;
			var oOptions = {
				stashMessage    : "Stash and conflict with commit"
			};

			var oGit = oProjectDocument.getEntity().getBackendData().git;
			var newFileName = "newFile24.js";
			var newFileContent = "var newFile = /\"This is new file/\"";
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var sMessage = "commit message";

			return docUtils.createAndEditFile(oProjectDocument, newFileName , newFileContent).then(function(){
				return gitUtils.oGit_Service.stash(oGit, oOptions.stashMessage);
			}).then(function(stashResult){
				return gitUtils.oGit_Service.getStash(oGit);
			}).then(function(stashList){
				assert.equal(stashList.Children.length,1,"Stash list should be 1");
				return oProjectDocument.getFolderContent();
			}).then(function(){
				var updateFileContent = "This is update of the file";
				return docUtils.createAndEditFile(oProjectDocument, newFileName , updateFileContent);
			}).then(function(oFile){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(aStatus){
				assert.isArray(aStatus, "The oStatus is not array");
				assert.isTrue(aStatus.length > 0 , "The oStatus is empty");
				return gitUtils.oGit_Service.stageFile(aStatus[0].Git);
			}).then(function(oStatusBeforeCommit){
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			});
		});
	});

});