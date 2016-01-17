define(["STF", "infra/git/gitUtils", "util/orionUtils", "infra/utils/documentUtils"], function (STF, gitUtils, orionUtils, docUtils) {

	"use strict";
	var suiteName = "gitIgnoreTestSpec", getService = STF.getServicePartial(suiteName);

	describe('gitIgnoreSpec - git ignore on init and clone repository', function () {
		var fileName = ".gitignore";
		var contentFileName = "sap-ui-cachebuster-info.json";
		var oPojectDocument = null;

		var mConfig = {
			"name": "gitIgnoreTestConsumer",
			"requires": {
				"services": [
					"git"
				]
			},
			"configures": {
				"services": {
					"git:ignore": [
						"sap-ui-cachebuster-info.json"
					]
				}
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
			return STF.shutdownWebIde(suiteName);
		});

		it("1. Check gitIgnore on init repository", function () {
			var dTestModuleTimeStamp = Number(new Date());
			var sProjectName = "gitIgnoryInit" + dTestModuleTimeStamp;
			return gitUtils.oDocumentProvider.getRoot().then(function(oRoot){
				var sLocation = oRoot.getEntity().getBackendData().location;
				return oRoot.createFolder(sProjectName).then(function(oProjectDoc){
					oPojectDocument = oProjectDoc;
					return gitUtils.oGit_Service.initRepository(sProjectName, sLocation, oPojectDocument.getEntity().getBackendData().location).then(function() {
						return oRoot.refresh();
					}).then(function () {
						return oPojectDocument.getFolderContent();
					}).then(function(docEntries){
						assert.isTrue(docUtils.isFileExist(docEntries, fileName),".gitignore not added into repository");
						return docUtils.getFileContent(oPojectDocument, fileName);
					}).then(function(oContent){
						assert.notEqual("", oContent,".gitignore content is empty");
						assert.isTrue(oContent.indexOf(contentFileName) > -1, ".gitignore contains " + contentFileName + " after init repository" );
						return gitUtils.clearRepositoryOnTestEnd(oPojectDocument);
					});
				});
			});
		});

		it("2. Check gitIgnore on clone repository", function () {
			gitUtils.oOptions = {
				sGitUserName: gitUtils.getSshTestUserName(),
				sGitPassword: "",
				sGitSshPrivateKey: gitUtils.getSshTestUserKey(),
				GitUrl: "ssh://git.wdf.sap.corp:29418/infra_gitignore_test.git",
				bGerrit: true
			};

			return gitUtils.oDocumentProvider.getRoot().then(function (oRoot) {
				gitUtils.oOptions.oRoot = oRoot;
				return gitUtils.cloneRepository().then(function (oResponse) {
					return oRoot.refresh().then(function () {
						var sProjectName = oResponse.Location.split("/").splice(-1)[0];
						return oRoot.getChild(sProjectName);
					}).then(function (oProjectDoc) {
						oPojectDocument = oProjectDoc;
						return gitUtils.oGit_Service.setIgnoreSystemFiles(oPojectDocument);
					}).then(function(){
						return oPojectDocument.getFolderContent();
					}).then(function(docEntries){
						assert.isTrue(docUtils.isFileExist(docEntries, fileName),".gitignore not added into repository");
						return docUtils.getFileContent(oPojectDocument, fileName);
					}).then(function(oContent) {
						assert.notEqual("", oContent, ".gitignore content is empty");
						assert.isTrue(oContent.indexOf(contentFileName) > -1, ".gitignore contains " + contentFileName + " after init repository");
						return gitUtils.getFileStageStatus(oPojectDocument, fileName);
					}).then(function(status){
						assert.isNotNull(status);
						assert.equal(status.Status, 'M', ".gitignore content is modified");
						return gitUtils.getFileStageStatus(oPojectDocument, contentFileName);
					}).then(function(status){
						assert.isNotNull(status);
						assert.equal(status.Status, 'U', contentFileName + " status is not untracked");
					});
				});
			});
		});
	});
});