define(["STF", "sinon"], function(STF, sinon) {
		"use strict";

		var suiteName = "importTest";
		var iFrameWindow = null;
		var sap;

		var sandbox;
		var spy;

		var oFileSystem;
		var oFakeFileDAO;
		var oImportService;
		var oImportServiceImpl;
		var oUsernotificationService;

		describe("Import Service test", function() {
			var getService = STF.getServicePartial(suiteName);
			before(function() {
				return STF.startWebIde(suiteName, {
					config: "core/core/platform/plugin/importExport/config.json"
				}).then(function(webIdeWindowObj) {
					var mConsumer = {
						"name": "testImport",
						"requires": {
							"services": [
								"import",
								"selection",
								"document",
								"usernotification",
								"progress",
								"fakeFileDAO",
								"repositorybrowser",
								"repositorybrowserUtils",
								"repositoryBrowserFactory",
								"filesystem.documentProvider"
							]
						}
					};
					iFrameWindow = webIdeWindowObj;
					sap = iFrameWindow.sap;

					oFileSystem = getService("filesystem.documentProvider");
					oFakeFileDAO = getService("fakeFileDAO");
					oImportService = getService("import");
					oUsernotificationService = getService("usernotification");

					oImportService.context.i18n = {};
					oImportService.context.i18n.getText = function() {
						return "";
					};

					return STF.getServicePrivateImpl(oImportService).then(function(oImportServiceImplResult) {
						oImportServiceImpl = oImportServiceImplResult;
					}).then(function() {
						return STF.register(suiteName, mConsumer);
					});
				});
			});

			after(function() {
				STF.shutdownWebIde(suiteName);
			});

			describe("Import a single file", function() {
				beforeEach(function() {
					oImportServiceImpl._oModel = new sap.ui.model.json.JSONModel();
					sandbox = sinon.sandbox.create();
				});

				afterEach(function() {
					oImportServiceImpl._oModel.setData({});
					sandbox.restore();
				});

				it("Import a new file", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", false);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir1": {
								"myFile.js": "var a\; "
							}
						}
					};
					//File object to import
					var oFile = {
						name: "myNewFile.js"
					};
					var bImportAndFireEvent = false;

					sandbox.stub(oImportServiceImpl, "_importFileAndFireEvent", function() {
						bImportAndFireEvent = true;
					});

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir1").then(function(oDocument) {
							spy = sandbox.spy(oImportServiceImpl, "_executeFileImport");
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportAndFireEvent);
								// verify that the open flag is true
								assert.equal(spy.args[0][2], true);
							});
						});
					});
				});

				it("Import an existing file and confirm override", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", false);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir2": {
								"myFile.js": "var a\; "
							}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.js"
					};
					var bImportAndFireEvent = false;

					sandbox.stub(oImportServiceImpl, "_importFileAndFireEvent", function() {
						bImportAndFireEvent = true;
					});

					sandbox.stub(oUsernotificationService, "confirm").returns(Q({
						bResult: true
					}));

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir2").then(function(oDocument) {
							spy = sandbox.spy(oImportServiceImpl, "_executeFileImport");
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportAndFireEvent);
								// verify that the open flag is true
								assert.equal(spy.args[0][2], true);
							});
						});
					});
				});

				it("Import an existing file and do not confirm override", function() {

					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", false);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir3": {
								"myFile.js": "var a\; "
							}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.js"
					};
					var bImportDialogOpened = false;
					oImportServiceImpl._oImportDialog = {};
					oImportServiceImpl._oImportDialog.open = function() {
						bImportDialogOpened = true;
					};

					sandbox.stub(oUsernotificationService, "confirm").returns(Q({
						bResult: false
					}));

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir3").then(function(oDocument) {
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportDialogOpened);
							});
						});
					});
				});
			});
			
			describe("Import a zipped file", function() {
				beforeEach(function() {
					oImportServiceImpl._oModel = new sap.ui.model.json.JSONModel();
					sandbox = sinon.sandbox.create();
				});

				afterEach(function() {
					oImportServiceImpl._oModel.setData({});
					sandbox.restore();
				});

				it("Import a new zip file without extract", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", false);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir4": {}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.zip"
					};
					var bImportAndFireEvent = false;

					sandbox.stub(oImportServiceImpl, "_importFileAndFireEvent", function() {
						bImportAndFireEvent = true;
					});

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir4").then(function(oDocument) {
							spy = sandbox.spy(oImportServiceImpl, "_executeFileImport");
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportAndFireEvent);
								// verify that the open flag is false
								assert.equal(spy.args[0][2], false);

							});
						});
					});

				});

				it("Import a new zip file and extract to directory with existing files, confirm override", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", true);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir5": {
								"myFile.js": "var a\; "
							}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.zip"
					};
					var bImportZipAndFireEvent = false;

					sandbox.stub(oImportServiceImpl, "_importZipFileAndFireEvent", function() {
						bImportZipAndFireEvent = true;
					});

					sandbox.stub(oUsernotificationService, "confirm").returns(Q({
						bResult: true
					}));

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir5").then(function(oDocument) {
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportZipAndFireEvent);
							});
						});
					});

				});

				it("Import a new zip file and extract to an empty directory", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", true);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir6": {}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.zip"
					};
					var bImportZipAndFireEvent = false;

					sandbox.stub(oImportServiceImpl, "_importZipFileAndFireEvent", function() {
						bImportZipAndFireEvent = true;
					});

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir6").then(function(oDocument) {
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportZipAndFireEvent);
							});
						});
					});

				});

				it("Import a new zip file and extract to directory with existing files, do not confirm override", function() {
					// Update model - set extract to true
					oImportServiceImpl._oModel.setProperty("/extractArchiveChecked", true);
					// Create a mocked file structure 
					var oFileStructure = {
						"myProject": {
							"myDir7": {
								"myFile.js": "var a\; "
							}
						}
					};
					//File object to import
					var oFile = {
						name: "myFile.zip"
					};
					var bImportDialogOpened = false;
					oImportServiceImpl._oImportDialog = {};
					oImportServiceImpl._oImportDialog.open = function() {
						bImportDialogOpened = true;
					};

					sandbox.stub(oUsernotificationService, "confirm").returns(Q({
						bResult: false
					}));

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileSystem.getDocument("/myProject/myDir7").then(function(oDocument) {
							return oImportServiceImpl._executeImport(oDocument, oFile).then(function() {
								assert.ok(bImportDialogOpened);
							});
						});
					});
				});
			});
		});
});