define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitoProjectDocumentTestSpec", getService = STF.getServicePartial(suiteName);

	describe('gitMergeTestSpec - git merge branches', function () {
		var oProjectDocument = null;
		var oProjectDocument_2 = null;

		var mConfig = {
			"name": "gitMergeTestConsumer",
			"requires": {
				"services": [
					"git"
				]
			}
		};

		before(function () {
			this.timeout(180000);
			return orionUtils.startWebIdeWithOrion(suiteName, {config: "infra/git/config.json"}).then(function(webIdeWindowObj) {
				return STF.register(suiteName, mConfig).then(function(aPlugins) {
					gitUtils.oDocumentProvider = getService("filesystem.documentProvider");
					gitUtils.oGit_Service = getService("git");
					gitUtils.oDocumentProvider._oDAO = getService("orionFileDAO");
				});
			});
		});

		after(function () {
			var aPromises = [];
			if (oProjectDocument) {
				aPromises.push(oProjectDocument.delete());
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

		it("1. Merge from remote branch (gerrit = true)", function () {
			gitUtils.oOptions = {
				sGitUserName: gitUtils.getSshTestUserName(),
				sGitPassword: "",
				sGitSshPrivateKey: gitUtils.getSshTestUserKey(),
				GitUrl: "ssh://git.wdf.sap.corp:29418/infra_git_merge_test.git",
				bGerrit: true
			};

			var oGit = null;
			var fileName = "mergeTest.txt";
			var sMasterRemoteBranchName = "origin/master";
			var sTempRemoteBranchName = "origin/temp";
			var sTempLocalBranchName = "temp";

			return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
				gitUtils.oOptions.oRoot = oRoot;
				return gitUtils.cloneRepository().then(function (oResponse) {
					return oRoot.refresh().then(function () {
						var sProjectName = oResponse.Location.split("/").splice(-1)[0];
						return oRoot.getChild(sProjectName);
					}).then(function (oProjectDoc) {
						oProjectDocument = oProjectDoc;
						oGit = oProjectDocument.getEntity().getBackendData().git;
						return oProjectDocument.getFolderContent();
					}).then(function(docEntries){
						assert.isTrue(docUtils.isFileExist(docEntries, fileName),"mergeTest.txt file not exist in the repository");
						return docUtils.getFileContent(oProjectDocument, fileName);
					}).then(function(oContent) {
					 	assert.equal("00\n11", oContent, "content should be 00\n11");
						return gitUtils.createAndCheckoutLocalBranch(oGit, sTempLocalBranchName, sTempRemoteBranchName);
					}).then(function(){
						return oRoot.refresh();
					}).then(function () {
						var sProjectName = oResponse.Location.split("/").splice(-1)[0];
						return oRoot.getChild(sProjectName);
					}).then(function (oProjectDoc) {
						oProjectDocument = oProjectDoc;
						oGit = oProjectDocument.getEntity().getBackendData().git;
						return oProjectDocument.getFolderContent();
					}).then(function(docEntries){
						return docUtils.getFileContent(oProjectDocument, fileName);
					}).then(function(oContent) {
					 	assert.equal("00", oContent, "content should be 00");
						return gitUtils.merge(oGit, sMasterRemoteBranchName, undefined, true); // bGerrit = false
					}).then(function(oMergeResult) {
					 	assert.equal(true, oMergeResult, "Merge Failed");
						return gitUtils.oGit_Service.getLog(oGit,1,50);
					}).then(function(oLogList){
						var sCommitDescription = oLogList.aFormattedLogData[0].Message;
						assert.isTrue((sCommitDescription.indexOf("Change-Id:") > -1),"commit description should contain Change-Id:");
					});
				});
			});
		});

		it("2. Merge from remote branch (gerrit = false)", function () {
			gitUtils.oOptions = {
				sGitUserName: gitUtils.getSshTestUserName(),
				sGitPassword: "",
				sGitSshPrivateKey: gitUtils.getSshTestUserKey(),
				GitUrl: "ssh://git.wdf.sap.corp:29418/infra_git_merge_test.git",
				bGerrit: true
			};

			var oGit = null;
			var fileName = "mergeTest.txt";
			var sMasterRemoteBranchName = "origin/master";
			var sTempRemoteBranchName = "origin/temp";
			var sTempLocalBranchName = "temp";

			return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
				gitUtils.oOptions.oRoot = oRoot;
				return gitUtils.cloneRepository().then(function (oResponse) {
					return oRoot.refresh().then(function () {
						var sProjectName = oResponse.Location.split("/").splice(-1)[0];
						return oRoot.getChild(sProjectName);
					}).then(function (oProjectDoc) {
						oProjectDocument_2 = oProjectDoc;
						oGit = oProjectDocument_2.getEntity().getBackendData().git;
						return oProjectDocument_2.getFolderContent();
					}).then(function(docEntries){
						assert.isTrue(docUtils.isFileExist(docEntries, fileName),"mergeTest.txt file not exist in the repository");
						return docUtils.getFileContent(oProjectDocument_2, fileName);
					}).then(function(oContent) {
					 	assert.equal("00\n11", oContent, "content should be 00\n11");
						return gitUtils.createAndCheckoutLocalBranch(oGit, sTempLocalBranchName, sTempRemoteBranchName);
					}).then(function(){
						return oRoot.refresh();
					}).then(function () {
						var sProjectName = oResponse.Location.split("/").splice(-1)[0];
						return oRoot.getChild(sProjectName);
					}).then(function (oProjectDoc) {
						oProjectDocument_2 = oProjectDoc;
						oGit = oProjectDocument_2.getEntity().getBackendData().git;
						return oProjectDocument_2.getFolderContent();
					}).then(function(docEntries){
						return docUtils.getFileContent(oProjectDocument_2, fileName);
					}).then(function(oContent) {
					 	assert.equal("00", oContent, "content should be 00");
						return gitUtils.merge(oGit, sMasterRemoteBranchName, undefined, false); // bGerrit = false
					}).then(function(oMergeResult) {
					 	assert.equal(true, oMergeResult, "Merge Failed");
						return gitUtils.oGit_Service.getLog(oGit,1,50);
					}).then(function(oLogList){
						var sCommitDescription = oLogList.aFormattedLogData[0].Message;
						assert.isTrue((sCommitDescription.indexOf("Change-Id:") === -1),"commit description should not contain Change-Id:");
					});
				});
			});
		});

	});
});