define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "FileSystemJSONProvider_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oJsonProviderService, oFakeFileDAO, oFileService, oWebIDEWindow;

		var oOriginJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.fiori.appName",
				"type": "application",
				"applicationVersion": {
					"version": "1.2"
				}
			}
		};

		var fileContent = JSON.stringify(oOriginJson);

		before(function () {
			return STF.startWebIde(suiteName).then(function (oWindow) {
				oJsonProviderService = getService('filesystem.jsonProvider');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileService = getService('filesystem.documentProvider');
				oWebIDEWindow = oWindow;
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		// test#1 - Valid json file under the root project - bRecursive = false/undefined
		it("Valid json file under the root project", function () {


			var oFileStructure = {
				"folder" : {
					"test.json" : fileContent
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.readJson("/folder", "test.json").then(function(oJsonObject) {
					assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
				});
			});
		});

		// test#2 -  Nested valid json file - bRecursive = true
		it("Nested valid json file with recursive searching", function () {

			var oFileStructure = {
				"folder" : {
					"subfolfer" : {
						"test.json" : fileContent
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.readJson("/folder", "test.json", true).then(function(oJsonObject) {
					assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
				});
			});
		});

		// test#3 -  Nested valid json file - bRecursive = false/undefined
		it("Nested valid json file with unrecursive searching", function () {

			var oFileStructure = {
				"folder1" : {
					"subfolder" : {
						"test.json" : fileContent
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.readJson("/folder1", "test.json").fail(function(oError) {
					assert.ok(oError.name === "FileDoesNotExist");
				});
			});
		});

		// test#4 -  Invalid json file
		it("Invalid json file", function () {

			var fileContentTemp = fileContent;
			fileContentTemp += "someString";

			var oFileStructure = {
				"folder2" : {
					"test.json" : fileContentTemp
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.readJson("/folder2", "test.json").fail(function(oError) {
					assert.ok(oError.name === "ParseError");
				});
			});
		});

// ============== END => the tests for the "readJson" method ==========


// ============== START => the tests for the "findAndWriteJson" method ==========
		// test#5 - Writing json to file under the root project - bRecursive = false/undefined
		it("Writing json to file under the root project", function () {

			var oFileStructure = {
				"folder3" : {
					"test.json" : ""
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.findAndWriteJson(oOriginJson, "/folder3", "test.json").then(function() {
					return oJsonProviderService.readJson("/folder3/test.json").then(function(oJsonObject){
						assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
					});
				});
			});
		});

		// test#6 - Writing json to nested file - bRecursive = true
		it("Writing json to nested file with recursive searching", function () {

			var oFileStructure = {
				"folder4" : {
					"subfolder" : {
						"test.json" : ""
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.findAndWriteJson(oOriginJson, "/folder4", "test.json", true).then(function() {
					return oJsonProviderService.readJson("/folder4/subfolder/test.json").then(function(oJsonObject){
						assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
					});
				});
			});
		});

		// test#7 - Writing json to nested file - bRecursive = false/undefined
		it("Writing json to nested file with unrecursive searching", function () {

			var oFileStructure = {
				"folder4" : {
					"subfolder" : {
						"test.json" : ""
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.findAndWriteJson(oOriginJson, "/folder4", "test.json").fail(function(oError) {
					assert.ok(oError.name === "FileDoesNotExist");
				});
			});
		});

// ============== END => the tests for the "findAndWriteJson" method ==========


// ============== START => the tests for the "writeJson" method ==========

		// test#8 - Writing json to existing file
		it("Writing json to existing file", function () {

			var oFileStructure = {
				"folder5" : {
					"test.json" : ""
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.writeJson(oOriginJson, "/folder5/test.json").then(function() {
					return oJsonProviderService.readJson("/folder5/test.json").then(function(oJsonObject){
						assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
					});
				});
			});
		});

		// test#9 - Writing json to unexisting file
		it("Writing json to unexisting file", function () {

			var oFileStructure = {
				"folder6" : {}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.writeJson(oOriginJson, "/folder6/test.json").then(function() {
					return oJsonProviderService.readJson("/folder6/test.json").then(function(oJsonObject){
						assert.ok(JSON.stringify(oJsonObject) === JSON.stringify(oOriginJson));
					});
				});
			});
		});

		// test#10 - Writing big json to unexisting file
		it("Content length validation", function () {

			var oFileStructure = {
				"folder6" : {}
			};

			var aBigArray = new Array(500000000);
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oJsonProviderService.writeJson(aBigArray, "/folder6/test.json").then(function() {
					assert.ok(false);
				}).fail(function(oError){
					assert.ok(oError.name === "RangeError");
				});
			});
		});
	});
});
