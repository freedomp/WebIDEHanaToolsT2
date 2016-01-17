define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "fileSearchUtil";

	describe("File Search Util test", function() {
		var oFakeFileDAO;
		var oFileSearchService;
		var oRunnableJson = {
			include: [".*[.]html$"],
			exclude: ["mock_preview_sapui5.html", "visual_ext_index.html"]
		};

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/commonrunners/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileSearchService = STF.getService(suiteName, "filesearchutil");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test getRunnableFiles method, should find 1 html file",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"src": {
							"main": {
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson).then(function(aFiles) {
							expect(aFiles.length).to.equal(1);
							expect(aFiles[0].fullPath).to.equal("/myTestProject1/src/main/webapp/index.html");
						});
					});
				});
			});

		it("Test getRunnableFiles method, should find 4 html file",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"index.html": "test",
						"src": {
							"index.html": "test",
							"main": {
								"index.html": "test",
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson).then(function(aFiles) {
							expect(aFiles.length).to.equal(4);
						});
					});
				});
			});

		it("Test getRunnableFiles method, should find 3 html file",
			function() {
				var oFileStructure = {
					"myTestProject1": {
						"index.html1": "test",
						"src": {
							"index.html": "test",
							"main": {
								"index.html": "test",
								"webapp": {
									"index.html": "test"
								}
							}

						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson).then(function(aFiles) {
							expect(aFiles.length).to.equal(3);
						});
					});
				});
			});

		it("Test getRunnableFiles method - should find 4 .js files",
			function() {
				var oRunnableJson1 = {
					include: [".*[.]js$"],
					exclude: []
				};

				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(4);
						});
					});
				});
			});

		it("Test getRunnableFiles method - should find 3 .js files",
			function() {
				var oRunnableJson1 = {
					include: [".*[.]js$"],
					exclude: ["test.js"]
				};

				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(3);
						});
					});
				});
			});

		it("Test getRunnableFiles method - empty runnable object",
			function() {
				var oRunnableJson1 = {
					include: [],
					exclude: []
				};

				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(0);
						});
					});
				});
			});

		it("Test getRunnableFiles method - no runnable object",
			function() {
				var oRunnableJson1;
				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(0);
						});
					});
				});
			});

		it("Test getRunnableFiles method - empty runnable object 2",
			function() {
				var oRunnableJson1 = {
					include: [""],
					exclude: [""]
				};
				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(0);
						});
					});
				});
			});

		it("Test getRunnableFiles method - invalid regex",
			function() {
				var oRunnableJson1 = {
					include: ["(?<={index:)\d+(?=})"],
					exclude: []
				};
				var oFileStructure = {
					"myTestProject1": {
						"aaa.js": "test",
						"src": {
							"bbb.js": "test",
							"main": {
								"test.js": "test",
								"webapp": {
									"ccc.js": "test"
								}
							}
						}
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFakeFileDAO.getDocument("/myTestProject1").then(function(oDocument) {
						return oFileSearchService.getRunnableFiles(oDocument, oRunnableJson1).then(function(aFiles) {
							expect(aFiles.length).to.equal(0);
						});
					});
				});
			});
	});
});