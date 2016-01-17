define(["STF", "util/orionUtils"], function (STF, OrionUtils) {

	"use strict";

	var suiteName = "documentIntegration";
	var oGitService, oDocumentService, oDocumentProviderService, oGit, oProject;
	var sProjectName = "documentCacheIntegration_" + Date.now();

	describe("Document integration test", function () {
		var getService = STF.getServicePartial(suiteName);
		before(function () {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/common/plugin/document/config.json"
			}).then(function () {
				var mConsumer = {
					"name": "testConsumer",

					"requires": {
						"services": [
							"git",
							"document",
							"filesystem.documentProvider"
						]
					}
				};
				oGitService = getService("git");
				oDocumentService = getService("document");
				oDocumentProviderService = getService("filesystem.documentProvider");
				return STF.register(suiteName, mConsumer).then(function () {
					return oDocumentProviderService.getRoot().then(function (oRoot) {
						var sLocation = oRoot.getEntity().getBackendData().location;
						return oRoot.createFolder(sProjectName).then(function (oProjectDoc) {
							oProject = oProjectDoc;
							return oGitService.initRepository(sProjectName, sLocation, oProject.getEntity().getBackendData().location).then(function () {
								return oRoot.refresh();//inorder to update the project document with the backend data (git object)
							});
						});
					});
				});
			});
		});

		after(function () {
			return oProject.delete().then(function () {
				STF.shutdownWebIde(suiteName);
			});
		});

		it("cache updated", function () {
			oGit = oProject.getEntity().getBackendData().git;
			var sFileName = "testFile.js";
			return oProject.createFile(sFileName).then(function (oFileDocument) {
				var sOriginContent = "Before Git change";
				return editAndCommit(oFileDocument, sOriginContent, "my commit test").then(function () {
					var sNewBranchName = "testBranch";
					return oGitService.createLocalBranch(oGit, sNewBranchName).then(function () {
						return oGitService.checkoutLocalBranch(oGit, sNewBranchName).then(function () {
							var sNewContent = "after branch check out";
							return editAndCommit(oFileDocument, sNewContent, "my commit test").then(function () {
								return oFileDocument.getContent().then(function (sContent) {
									assert.equal(sNewContent, sContent);
									return oGitService.checkoutLocalBranch(oGit, "master").then(function () {
										return oDocumentProviderService.getDocument("/" + sProjectName + "/" + sFileName).then(function (oDocument) {
											return oDocument.getContent().then(function (sContent) {
												assert.equal(sOriginContent, sContent);
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
		it("file does not exist", function () {
			oGit = oProject.getEntity().getBackendData().git;
			var sFileName = "testFile2.js";
			var sNewBranchName = "testBranch2";
			return oGitService.createLocalBranch(oGit, sNewBranchName).then(function () {
				return oGitService.checkoutLocalBranch(oGit, sNewBranchName).then(function () {
					return oProject.createFile(sFileName).then(function (oFileDocument) {
						var sOriginContent = "some content";
						return editAndCommit(oFileDocument, sOriginContent, "adding new file").then(function () {
							return oGitService.checkoutLocalBranch(oGit, "master").then(function () {
								return oDocumentProviderService.getDocument("/" + sProjectName + "/" + sFileName).then(function (oDocument) {
									assert.ok(!oDocument);//the document should be null after switching branches since it is available only on testBranch2 branch
								});
							});
						});
					});
				});
			});
		});

		it("events when switching branchs", function () {
			oGit = oProject.getEntity().getBackendData().git;
			var sNewBranchName = "testBranch3", sA1Name = "a1.js", sB1Name = "b1.js", sB2Name = "b2.js", bDeletedEventFired = false;
			oDocumentService.attachEvent("deleted", function () {
				bDeletedEventFired = true;
			});

			return Q.all([oProject.createFolder("a"), oProject.createFile(sA1Name)]).spread(function (oFolderA) {
				return oFolderA.createFile(sB1Name).then(function () {
					return stageFilesAndCommit([sA1Name, "a/" + sB1Name], "blabla").then(function () {
						return oGitService.createLocalBranch(oGit, sNewBranchName).then(function () {
							return oGitService.checkoutLocalBranch(oGit, sNewBranchName).then(function () {
								return oFolderA.createFile(sB2Name).then(function () {
									return stageFilesAndCommit(["a/" + sB2Name], "blabla2").then(function () {
										return oGitService.checkoutLocalBranch(oGit, "master").then(function () {
											return oFolderA.getFolderContent().then(function (aFolderAConent) {
												//Make sure that file b2.js does not exist
												assert.equal(aFolderAConent.length, 1, "folder contains more content that it should be");
												//verify that the deleted event was fire for b2.js
												assert.ok(bDeletedEventFired, "deleted event was not fired");
												bDeletedEventFired = false;
												//TODO add test for created event!

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
		it("document exists only on created branch", function () {
			var sNewBranchName = "testBranch4";
			var sFileName = "testFile4.js";
			return oGitService.createLocalBranch(oGit, sNewBranchName).then(function () {
				return oGitService.checkoutLocalBranch(oGit, sNewBranchName).then(function () {
					return oProject.createFile(sFileName).then(function (oFileDocument) {
						var sOriginContent = "some content";
						return editAndCommit(oFileDocument, sOriginContent, "adding new file").then(function () {
							return oGitService.checkoutLocalBranch(oGit, "master").then(function () {
								return oDocumentProviderService.getDocument("/" + sProjectName + "/" + sFileName).then(function (oDocument) {
									assert.ok(!oDocument);//the document should be null after switching branches since it is available only on testBranch2 branch
								});
							});
						});
					});
				});
			});

		});
		//set the content, save the document, stage and commit it
		function editAndCommit(oDocument, sContent, sCommitMessage) {
			return oDocument.setContent(sContent).then(function () {
				return oDocument.save().then(function () {
					return stageFilesAndCommit([oDocument.getEntity().getName()], sCommitMessage);
				});
			});
		}

		function stageFilesAndCommit(aFiles, sCommitMessage) {
			return oGitService.stageMultipleFiles(oGit, aFiles).then(function () {
				return oGitService.commit(oGit, sCommitMessage);
			});
		}
	});
});