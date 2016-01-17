define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitHubCloneSpec", getService = STF.getServicePartial(suiteName);

	describe('gitHubCloneSpec - git integration gitHub repository', function () {
		var oProjectDocument_1;

		var aNewBranchName = ["testBranch1", "testBranch2"];

		var fileName = "unit.test." + Math.random().toString() + ".file";

		var oOptions = {
			sGitUserName        : "admin",
			sGitPassword        : "admin",
			sGitSshPrivateKey   : "",
			//This is a url for local repository
			GitUrl              : "https://localhost:8443/r/infra_github_dummy.git",
			bGerrit             : false
		};

		before(function () {
			var that = this;
			this.timeout(120000);
			var sMasterBranchName = "origin/master";
			return orionUtils.startWebIdeWithOrion(suiteName, {config: "infra/git/config.json"}).then(function () {
				gitUtils.oDocumentProvider = getService("filesystem.documentProvider");
				gitUtils.oGit_Service = getService("git");
				gitUtils.oDocumentProvider._oDAO = getService("orionFileDAO");
				gitUtils.oOptions = oOptions;

				return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
					gitUtils.oOptions.oRoot = oRoot;
					return gitUtils.cloneRepository().then(function (oResponse) {
						return oRoot.refresh().then(function () {
							var sProjectName = oResponse.Location.split("/").splice(-1)[0];
							return oRoot.getChild(sProjectName).then(function (oProjectDoc) {
								assert.equal(oProjectDoc.getTitle(), sProjectName);
								oProjectDocument_1 = oProjectDoc;
								var oGit = oProjectDocument_1.getEntity().getBackendData().git;
								return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[0], sMasterBranchName).then(function() {
									return gitUtils.oGit_Service.createLocalBranch(oGit, aNewBranchName[1], sMasterBranchName);
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

			return Q.all(aPromises).then(function () {
				assert.ok(true, "moduleDone");
			}).fin(function(){
				return STF.shutdownWebIde(suiteName);
			});
		});

		it("1. Push  (new file)", function() {
			var oUserInfo = undefined;
			var bAmend = false;
			var bChangeId = false;
			var fileContent = Math.random().toString();
			var sMessage = "Commit Message " + fileContent;
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;

			return gitUtils.createEditAndStageFile(oProjectDocument_1, fileName , fileContent).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusBeforeCommit){
				assert.equal(oStatusBeforeCommit.length, 1,"After commit get status should be 1");
				assert.equal(oStatusBeforeCommit[0].FullStatus,"NEW","Status should be NEW");
				assert.equal(oStatusBeforeCommit[0].Name,fileName,"File should be = " + fileName);
				return gitUtils.oGit_Service.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId);
			}).then(function(){
				return gitUtils.oGit_Service.getStatus(oGit);
			}).then(function(oStatusAftereCommit){
				assert.equal(oStatusAftereCommit.length,0,"After commit get status should be empty");
				return gitUtils.oGit_Service.getLog(oGit,1,50);
			}).then(function(oLogList){
				assert.isTrue(oLogList.aFormattedLogData[0].Message.indexOf(sMessage) != -1,"Commit should be " + sMessage);
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].Status, "A","Status should be A");
				assert.equal(oLogList.aFormattedLogData[0].Diffs[0].NewPath, fileName,"New path should be " + fileName);
			}).then(function(){
				return gitUtils.doPullAndPush(oGit,null);
			}).then(function(){
				assert.ok(true, "push succeeds" );
			});
		});

		it("2. Fetch & Rebase", function() {
			var fileContentBefore;
			var fileContentAfter;
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;
			return gitUtils.oGit_Service.checkoutLocalBranch( oGit, aNewBranchName[0]).then(function() {
				return docUtils.getFileContent(oProjectDocument_1, fileName);
			}).then(function(oContent) {
				fileContentBefore = oContent;
				oGit.CommitLocation = oGit.CommitLocation.replace("master", aNewBranchName[0]);
				return gitUtils.fetch(oGit);
			}).then(function(oResponse) {
				assert.notEqual(oResponse.length, 0, "After fetch response should contain data");
				assert.isTrue(oResponse[0].changes.length >= 1, "After fetch response should contain 1 change or more");

				return gitUtils.oGit_Service.rebase(oGit, "origin/master");
			}).then(function(oResponse) {
				return docUtils.getFileContent(oProjectDocument_1, fileName);
			}).then(function(oContent){
				fileContentAfter = oContent;
				assert.notEqual(fileContentBefore,fileContentAfter, "File content should be diffrent" + " before: " + fileContentBefore + " after: " + fileContentAfter);
			});
		});

		it("3. Pull", function() {
			var fileContentBefore;
			var fileContentAfter;
			var oGit = oProjectDocument_1.getEntity().getBackendData().git;
			return gitUtils.oGit_Service.checkoutLocalBranch( oGit, aNewBranchName[1]).then(function() {
				oGit.CommitLocation = oGit.CommitLocation.replace(aNewBranchName[0], aNewBranchName[1]);
				return docUtils.getFileContent(oProjectDocument_1, fileName);
			}).then(function(oContent){
				fileContentBefore = oContent;

				return gitUtils.pull(oGit).then(function(oResponse){
					assert.ok( true, "pull succeeds" );

					return docUtils.getFileContent(oProjectDocument_1, fileName).then(function(oContent){
						fileContentAfter = oContent;
						assert.notEqual(fileContentBefore, fileContentAfter, "File content should be diffrent" + " before: " + fileContentBefore + " after: " + fileContentAfter);
					});
				});
			});
		});

	});
});