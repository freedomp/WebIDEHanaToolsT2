define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "ArchiveTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oFileService, oArchiveService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
				oFakeFileDAO = getService("fakeFileDAO");
				oFileService = getService("filesystem.documentProvider");
				oArchiveService = getService("archivetemplateresources");

				oFakeFileDAO.exportZip = function(oFolderDocument){
					var aPromises = [];
					var aFileName = [];

					//var sPath = oFolderDocument.getEntity().getParentPath() + "/" + oFolderDocument.getEntity().getName();
					return oFolderDocument.getCurrentMetadata(true).then(function(oFolderMetadataContent) {
						var oNewZip = new JSZip();
						for ( var i = 0; i < oFolderMetadataContent.length; i++) {
							var sFullPath = oFolderMetadataContent[i].path;
							sFullPath = sFullPath.substring(sFullPath.indexOf("resources/") + 10);
							if (!oFolderMetadataContent[i].folder) {
								oNewZip.folder(sFullPath);
							} else {
								var sFileName = sFullPath;
								aPromises.push(oFileService.getDocument(oFolderMetadataContent[i].path).then(function(oDoc) {
									return oDoc.getContent();	
								}));
								aFileName.push(sFileName);
							}
						}

						return Q.all(aPromises).then(function(oContent) {
							for ( var j = 0; j < oContent.length; j++) {
								oNewZip.file(aFileName[j], oContent[j]);
							}
							return oNewZip;
						});
					});
				};

				oFakeFileDAO.importFile = function(oParentFolderDocument, oFile, bUnzip, bForce, sFileName) {
					// TODO: set the content of the file to the content of oFile
					return oFakeFileDAO.createFile(oParentFolderDocument, sFileName);
				};
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Archive Template Resources - No plugin configures",function() {
			var oFileStructure = {
				"myProject" : {
					"plugin.json" : "{\"name\" : \"Ariel\"}"
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oArchiveService.createArchive("/myProject").then(function(){
					assert.ok(true, "Printed successfully to log");
				});
			});
		});

		it("Archive Template Resources - No plugin.json",function() {
			var oFileStructure = {
				"myProject2" : {
					"a.js" : "bla bla"
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oArchiveService.createArchive("/myProject2").then(function(){
					assert.ok(false, "Should faild since there is no plugin.json");
				}).fail(function(oError){
					assert.ok(oError.message !== undefined, "Should faild since there is no plugin.json");
				});
			});
		});

		it("Archive Template Resources - with correct plugin.json",function() {
			var oFileStructure = {
				"myProject3" : {
					"testtemplate" : {
						"resources" : {
							"a.txt" :  "bla bla"
						}
					},
					"plugin.json" : "{\"name\" : \"Ariel\", \"description\": \"a\",\"configures\": {\"services\": {\"template:templates\": [{\"id\": \"myProject3.testtemplate\",\"path\": \"myProject3/testtemplate\",\"fileName\": \"resourcesA.zip\"}]}}}"
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oArchiveService.createArchive("/myProject3").then(function(){
					assert.ok(true, "Printed successfully to log");
				});
			});
		});

		it("Archive Template Resources - on before zip",function() {

			var oFileStructure = {
				"myProject4" : {
					"testtemplate" : {
						"resources" : {
							"a.txt" :  "bla bla",
							"b" : {
								"c.txt": "cla cla"
							}
						}
					},
					"plugin.json" : "{\"name\" : \"Ariel\", \"description\": \"a\",\"configures\": {\"services\": {\"template:templates\": [{\"id\": \"myProject4.testtemplate\",\"path\": \"myProject4/testtemplate\",\"fileName\": \"resources.zip\"}]}}}"
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				var oNewZip = new JSZip();
				oNewZip.file = function(){
					return new JSZip();
				};
				return oFileService.context.event.fireBeforeExportZip({zip : oNewZip,
					fullPath :  "/myProject4"}).then(function(){
					assert.ok(true, "finish successfully");
				});
			});
		});

		it("Archive Template Resources - template with no resources folder",function() {

			var oFileStructure = {
				"myProject5" : {
					"testtemplate" : {
					},
					"plugin.json" : "{\"name\" : \"Ariel\", \"description\": \"a\",\"configures\": {\"services\": {\"template:templates\": [{\"id\": \"myProject4.testtemplate\",\"path\": \"myProject4/testtemplate\",\"fileName\": \"resources.zip\"}]}}}"
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oArchiveService.createArchive("/myProject5").then(function(){
					assert.ok(true, "Printed successfully no resources were found");
				});
			});
		});
	});
});