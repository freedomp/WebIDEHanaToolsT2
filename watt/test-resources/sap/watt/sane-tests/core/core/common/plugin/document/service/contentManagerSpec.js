define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	
	"use strict";
	
	var suiteName = "contentmanager";
	var oContentManagerServiceImpl;
	var oFileSystemDocumentProviderService;
	
	describe("Content Manager test", function() {
		
		before(function() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/common/plugin/document/config.json"
			}).then(function() {
				var mConsumer = {
					"name": "contentmanagerTestConsumer",

					"requires": {
						"services": [
							"filesystem.documentProvider",
							"contentManager",
							"document"
						]
					},
					"configures": {
						"services": {
							"contentManager:maxAllowedSizeOfCachedContent": 200,
							"contentManager:maxAllowedSizeOfCachedFileContent": 50,
							"contentManager:cleanOnTotalCacheExceededLimit": 30,
							"contentManager:aFilesToBeRemovedFirst": ["TestFile1", "TestFile2"],
							"contentManager:aFilesContentAlwaysInCache": [".project.json", "neo-app.json"]
						}
					}
				};
				
				return STF.register(suiteName, mConsumer).then(function(aPlugins) {
					oFileSystemDocumentProviderService = aPlugins[0]._oContext.service.filesystem.documentProvider;
					var oContentManagerService = aPlugins[0]._oContext.service.contentManager;
					return oContentManagerService._getImpl().then(function(contentmanager) {
						return contentmanager._getImpl().then(function(contentmanagerImpl) {
							oContentManagerServiceImpl = contentmanagerImpl;
							return aPlugins;
						});
					});
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
		
		it("configure", function() {
		    assert.equal(oContentManagerServiceImpl._nMaxAllowedSizeOfCachedContent, 200);
		    assert.equal(oContentManagerServiceImpl._nMaxAllowedSizeOfCachedFileContent, 50);
		    assert.equal(oContentManagerServiceImpl._nCacheSizeToRemoveOnCacheLimitExceed, 30);
		    assert.equal(oContentManagerServiceImpl._oSpecialFilesContent["TestFile1"], false);
		    assert.equal(oContentManagerServiceImpl._oSpecialFilesContent["TestFile2"], false);
		    assert.equal(oContentManagerServiceImpl._oSpecialFilesContent[".project.json"], true);
		    assert.equal(oContentManagerServiceImpl._oSpecialFilesContent["neo-app.json"], true);
		    assert.equal(oContentManagerServiceImpl._oSpecialFilesContent["TestFil3"], undefined);
		});

		it("setContent(empty_string)/getContent/checkEvent", function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			var bEventArrived = false;
			
			function eventHandler(oEvent) {
				if (oEvent.params.changeType === "content") {
					bEventArrived = true;
				}
			}

			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return oFolderDocument.createFile("TestFile").then(function(oFileDocument) {
						return oFileDocument.setContent("test content").then(function() {
							return oFileDocument.save().then(function() {
								oFileSystemDocumentProviderService.context.service.document.attachEvent("changed", eventHandler, this);
								return oFileDocument.setContent("").then(function() {
									oFileSystemDocumentProviderService.context.service.document.detachEvent("changed", eventHandler, this);
									return oFileDocument.getContent().then(function(sContent) {
										assert.equal("", sContent);
										assert.equal(true, oFileDocument.isDirty());
										assert.equal(true, bEventArrived);
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
		
		it("create big files and check what was removed",function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return Q.spread([oFolderDocument.createFile("TestFile1"), oFolderDocument.createFile("TestFile2"),
									 oFolderDocument.createFile(".project.json"), oFolderDocument.createFile("neo-app.json"),
									 oFolderDocument.createFile("TestFile3"), oFolderDocument.createFile("TestFile4")], 
							function(oTestFile1Document, oTestFile2Document, oProjectJsonDocument, oNeoAppDocument, oTestFile3Document, oTestFile4Document) {
						return Q.all([oTestFile1Document.setContent("test content 11111111111111111111111"), oTestFile2Document.setContent("test content 22222222222222222222222"),
									  oProjectJsonDocument.setContent("project json content"), oNeoAppDocument.setContent("neo app content"),
									  oTestFile3Document.setContent("test content 333333333333333333333"), oTestFile4Document.setContent("test content 44444444444444444444444")]).then(function() {
							return Q.all([oTestFile3Document.save(), oTestFile4Document.save(),
										  oProjectJsonDocument.save(), oNeoAppDocument.save()]).then(function() {
								return Q.all([oTestFile2Document.save(), oTestFile1Document.save()]).then(function() {
									assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 6);
									assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 177);
									
									return oNeoAppDocument.setContent("neo app content 99999999944444444443333").then(function() {
										return oNeoAppDocument.save().then(function() {
											assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 4);
											assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 129);
											assert.ok(oContentManagerServiceImpl._oContentDataMap[oTestFile3Document.getKeyString()]);
											assert.ok(oContentManagerServiceImpl._oContentDataMap[oTestFile4Document.getKeyString()]);
											assert.ok(oContentManagerServiceImpl._oContentDataMap[oProjectJsonDocument.getKeyString()]);
											assert.ok(oContentManagerServiceImpl._oContentDataMap[oNeoAppDocument.getKeyString()]);
											
											return Q.all([oTestFile3Document.setContent("test content 1111111111111111111111555551wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"), 
														  oTestFile4Document.setContent("test content 2222222222222222222222299999999ffffffffffffffffffffffffffffffffffffffffffff")]).then(function() {
												return Q.all([oTestFile3Document.save(), oTestFile4Document.save()]).then(function() {
													assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 2);
													assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 59);
													assert.	ok(oContentManagerServiceImpl._oContentDataMap[oProjectJsonDocument.getKeyString()]);
													assert.	ok(oContentManagerServiceImpl._oContentDataMap[oNeoAppDocument.getKeyString()]);
												});
											});
										});
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	
		it("setContent/revert/save/getContent", function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return oFolderDocument.createFile("TestFile").then(function(oFileDocument) {
						return oFileDocument.setContent("test content").then(function() {
							return oFileDocument.save().then(function() {
								return oFileDocument.setContent("test content 123").then(function() {
									return oFileDocument.revert().then(function() {
										return oFileDocument.save().then(function() {
											assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 1);
											assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, "test content".length);
											
											return oFileDocument.getContent().then(function(sContent) {
												assert.equal(sContent, "test content");
												assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 1);
												assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, "test content".length);
											});
										});
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	
		it("onContentChanged - getContent/setContent/save/getContent", function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return oFolderDocument.createFile("TestFile").then(function(oFileDocument) {
						return oFileDocument.getContent().then(function() {
							assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
							
							return oFileDocument.setContent("yyyyyyyyyyrrrrrrrrrreeeeeeeeeessssssssssppppppppppjjjjjjjjjjbbbbbbbbbbb").then(function() {
								return oFileDocument.save().then(function() {
									assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
									assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
									
									return oFileDocument.getContent().then(function(sContent) {
										assert.equal(sContent, "yyyyyyyyyyrrrrrrrrrreeeeeeeeeessssssssssppppppppppjjjjjjjjjjbbbbbbbbbbb");
										assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
										assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	
		it("onContentChanged - setContent/save/getContent",function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return oFolderDocument.createFile("TestFile").then(function(oFileDocument) {
						return oFileDocument.setContent("test content").then(function() {
							assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
							
							return oFileDocument.save().then(function() {
								var sDocumentKey = oFileDocument.getEntity().getKeyString();
								assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, oFileDocument._savedContent.length);
								assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 1);
								assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap)[0], sDocumentKey);
								
								return oFileDocument.getContent().then(function() {
									sDocumentKey = oFileDocument.getEntity().getKeyString();
									assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 1);
									assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap)[0], sDocumentKey);
								
									return oFileDocument.setContent("yyyyyyyyyyrrrrrrrrrreeeeeeeeeessssssssssppppppppppjjjjjjjjjjbbbbbbbbbbb").then(function() {
										return oFileDocument.save().then(function() {
											assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
											assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
										
											return oFileDocument.setContent("yyyyyyyyyy").then(function() {
												return oFileDocument.save().then(function() {
													assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 1);
													assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, oFileDocument._savedContent.length);
												});
											});
										});
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	
		it("onContentChanged - deleteContentData", function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return Q.spread([oFolderDocument.createFile("TestFile1"), oFolderDocument.createFolder("TestFolder3"), oFolderDocument.createFile("TestFile2")], 
						function(oFileDocument1, oFolderDocument3, oFileDocument2) {
						
						return oFolderDocument3.createFile("TestFile3").then(function(oFileDocument3) {
							assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
							return Q.all([oFileDocument1.setContent("test content 1"), oFileDocument2.setContent("test content 22"), oFileDocument3.setContent("test content 333")]).then(function() {
								return Q.all([oFileDocument1.save(), oFileDocument2.save(), oFileDocument3.save()]).then(function() {
									assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 3);
									assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, oFileDocument1._savedContent.length + oFileDocument2._savedContent.length + oFileDocument3._savedContent.length);
									
									return oFolderDocument3.delete().then(function() {
										assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 2);
									});
								});
							});
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	
		it("_getDocumentContentLength", function() {
			var sTestFolderName = "TestFolder_" + Date.now();
			var oTestFolderDocument;
			return oFileSystemDocumentProviderService.getRoot().then(function(oRootDocument) {
				return oRootDocument.createFolder(sTestFolderName).then(function(oFolderDocument) {
					oTestFolderDocument = oFolderDocument;
					return oFolderDocument.createFile("TestFile").then(function(oFileDocument) {
						assert.equal(oContentManagerServiceImpl._getDocumentContentLength(oFileDocument), 0);
						
						return oFileDocument.getContent().then(function(oContent) {
							assert.ok(oContent === "");
							assert.equal(oContentManagerServiceImpl._getDocumentContentLength(oFileDocument), 0);
						});
					});
				});
			}).fin(function() {
				return oTestFolderDocument.delete().then(function() {
					assert.equal(Object.keys(oContentManagerServiceImpl._oContentDataMap).length, 0);
					assert.equal(oContentManagerServiceImpl._nTotalCachedContentSize, 0);
				});
			});
		});
	});
});