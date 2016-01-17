define(["STF", "util/orionUtils"], function (STF, OrionUtils) {

	"use strict";
	var suiteName = "FileSearchSpec",
	getService = STF.getServicePartial(suiteName);

	describe('file search spec', function () {

		var oOrionFileDAO = null;
		var oDocumentProvider = null;
		var oFileSearch = null;


		var sFolderBaseName = "Test_search_folder_"+ Number(new Date());
		var sFileName = "tempFile.js";
		var content = "var  = \"tempValue\";";
		var rootFolder;

		before(function () {
			this.timeout(180000);
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "infra/search/config.json"
			}).then(function (webIdeWindowObj) {


				// login => needed for correct setting of the backend data of the worksapce root in OrionFileDAO !!!
				var oParameters = webIdeWindowObj.jQuery.sap.getUriParameters();
				var sUsername = oParameters.get("username");
				var sPassword = oParameters.get("password");


				oOrionFileDAO = getService("orionFileDAO");
				oDocumentProvider = getService("filesystem.documentProvider");
				oDocumentProvider._oDAO = oOrionFileDAO;
				
				oFileSearch = getService("filesearch");



				return oDocumentProvider.getRoot().then(function (oRoot) {
					return oRoot.createProject({"name": sFolderBaseName}).then(function (folder) {
						rootFolder = folder;
						return folder.createFile(sFileName).then(function (file) {
							return file.setContent(content).then(function () {
								return file.save().then(function () {
									return oRoot.refresh();
								});
							});
						});
					});
				});
			});
		});

		after(function () {
			return oDocumentProvider.getRoot().then(function(oRoot) {
				return oRoot.getFolderContent().then(function(aResult) {
					for (var i = 0; i< aResult.length; i++) {
						var oFolder = aResult[i];
						if (sFolderBaseName === oFolder.getEntity().getName()) {
							return oFolder.delete();
						}
					}
				});
			}).fin(function(){
				return STF.shutdownWebIde(suiteName);
			});

		});

		it("searches full term", function () {
			var oCriteria = {
				"bContentSearch" : true,
				"nStart" : 0,
				"sFileType" : "*",
				"sFolderName" : "/"+sFolderBaseName+"/",
				"sSearchTerm" : "tempValue"
			};
			//Search
			return oFileSearch.search(oCriteria).then(function (result) {
				assert.equal(result.aList.length,1);
			});
		});

		it("searches 'starts with'",  function() {
			var oCriteria = {
				"bContentSearch" : true,
				"nStart" : 0,
				"sFileType" : "*",
				"sFolderName" : "/"+sFolderBaseName+"/",
				"sSearchTerm" : "temp"
			};
			//Search
			return oFileSearch.search(oCriteria).then(function (result) {
				assert.equal(result.aList.length,1);
			});

		});

		it("searches 'contains'",  function() {
			var oCriteria = {
				"bContentSearch" : true,
				"nStart" : 0,
				"sFileType" : "*",
				"sFolderName" : "/"+sFolderBaseName+"/",
				"sSearchTerm" : "emp"
			};
			//Search
			return oFileSearch.search(oCriteria).then(function (result) {
				assert.equal(result.aList.length,1);
			});

		});

		it("searches 'ends with'",  function() {
			var oCriteria = {
				"bContentSearch" : true,
				"nStart" : 0,
				"sFileType" : "*",
				"sFolderName" : "/"+sFolderBaseName+"/",
				"sSearchTerm" : "Value"
			};
			//Search
			return oFileSearch.search(oCriteria).then(function (result) {
				assert.equal(result.aList.length,1);
			});

		});

	});
});