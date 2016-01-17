define(["STF", "sap/watt/common/plugin/filesystem/document/FileFolderEntity"], function (STF, FileFolderEntity) {
	"use strict";

	var suiteName = "documentTest";
	var oDocumentService, ofilesystem, oFakeFileDAO, oDocumentServiceImpl, ofilesystemImpl;
	describe("Document test", function () {
		var getService = STF.getServicePartial(suiteName);

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "core/core/common/plugin/document/configWithFake.json"
			}).then(function () {
				oDocumentService = getService("document");
				ofilesystem = getService("filesystem.documentProvider");
				oFakeFileDAO = getService("fakeFileDAO");
				return Q.all([STF.getServicePrivateImpl(oDocumentService), STF.getServicePrivateImpl(ofilesystem)]).
					spread(function (oDocumentImpl, oFilesystemImpl) {
						oDocumentServiceImpl = oDocumentImpl;
						ofilesystemImpl = oFilesystemImpl;
					});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		describe("File Service", function () {

			beforeEach(function () {
				//Clean up internal document buffer to ensure clean state and filesystem root
				oDocumentServiceImpl._mDocuments = {};
				ofilesystemImpl._workspaceRoot = undefined;

				return oFakeFileDAO.setContent({
					"a": {
						"aa": "aa",
						"ab": "ab"
					},
					"b": {
						"ba": "ba"
					}
				});
			});

			it("getDocument and getContent", function () {
				//Even if called at the same time the same document has to be found
				return Q.all([ofilesystem.getDocument("/a/aa"), ofilesystem.getDocument("/a/aa")]).spread(function (oDocument1, oDocument2) {
					assert.ok(oDocument1 === oDocument2);
					assert.ok(!oDocument1.isReadOnly(), "Document is not read only");
					assert.ok(oDocument1.getEntity().getFullPath() == "/a/aa");
					assert.ok(oDocument1.getEntity().getType() == "file");
					assert.ok(!oDocument1.isReadOnly(), "File is not readonly");

					return oDocument1.getContent();
				}).then(function (oContent) {
					assert.ok(oContent === "aa");
				});

			});

			it("delete", function () {
				//Even if called at the same time the same document has to be found
				return Q.all([ofilesystem.getDocument("/a/aa"),
					ofilesystem.getDocument("/a/ab"),
					ofilesystem.getDocument("/a"),
					ofilesystem.getDocument("/b/ba")])
					.spread(function (oDocumentAAa, oDocumentAAb, oDocumentA, oDocumentBBa) {
						var sKeyAAa = oDocumentAAa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAa].valueOf() == oDocumentAAa);
						var sKeyAAb = oDocumentAAb.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb].valueOf() == oDocumentAAb);
						var sKeyA = oDocumentA.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyA].valueOf() == oDocumentA);
						var sKeyBBa = oDocumentBBa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa].valueOf() == oDocumentBBa);

						return oDocumentAAa.delete().then(function () {
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

							return oDocumentA.delete();
						}).then(function () {
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);
						});
					});

			});

			it("rename folders are not expanded", function () {
				//Even if called at the same time the same document has to be found
				return Q.all([ofilesystem.getDocument("/a/aa"),
					ofilesystem.getDocument("/a/ab"),
					ofilesystem.getDocument("/a"),
					ofilesystem.getDocument("/b"),
					ofilesystem.getDocument("/b/ba")])
					.spread(function (oDocumentAAa, oDocumentAAb, oDocumentA, oDocumentB, oDocumentBBa) {
						var sKeyAAa = oDocumentAAa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAa].valueOf() == oDocumentAAa);
						var sKeyAAb = oDocumentAAb.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb].valueOf() == oDocumentAAb);
						var sKeyA = oDocumentA.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyA].valueOf() == oDocumentA);
						var sKeyBBa = oDocumentBBa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa].valueOf() == oDocumentBBa);

						return oDocumentAAa.move(oDocumentA, "ac").then(function (oDocumentAAc) {
							assert.ok(oDocumentAAc.getEntity().getFullPath("/a/ac"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentAAc.getKeyString()].valueOf() == oDocumentAAc);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

							return oDocumentAAb.move(oDocumentB, "bc");
						}).then(function (oDocumentBBc) {
							assert.ok(oDocumentBBc.getEntity().getFullPath("/b/bc"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentBBc.getKeyString()].valueOf() == oDocumentBBc);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

							return oDocumentA.move(oDocumentB, "d");
						}).then(function (oDocumentBD) {
							assert.ok(oDocumentBD.getEntity().getFullPath("/b/d"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentBD.getKeyString()].valueOf() == oDocumentBD);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

						});
					});

			});

			it("rename folders are expanded", function () {
				//Even if called at the same time the same document has to be found
				return Q.all([ofilesystem.getDocument("/a/aa"),
					ofilesystem.getDocument("/a/ab"),
					ofilesystem.getDocument("/a"),
					ofilesystem.getDocument("/b"),
					ofilesystem.getDocument("/b/ba")])
					.spread(function (oDocumentAAa, oDocumentAAb, oDocumentA, oDocumentB, oDocumentBBa) {
						var sKeyAAa = oDocumentAAa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAa].valueOf() == oDocumentAAa);
						var sKeyAAb = oDocumentAAb.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb].valueOf() == oDocumentAAb);
						var sKeyA = oDocumentA.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyA].valueOf() == oDocumentA);
						var sKeyBBa = oDocumentBBa.getKeyString();
						assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa].valueOf() == oDocumentBBa);

						return Q.all([oDocumentA.getFolderContent(), oDocumentB.getFolderContent()]).then(function () {
							return oDocumentAAa.move(oDocumentA, "ac");
						}).then(function (oDocumentAAc) {
							assert.ok(oDocumentAAc.getEntity().getFullPath("/a/ac"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentAAc.getKeyString()].valueOf() == oDocumentAAc);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

							return oDocumentAAb.move(oDocumentB, "bc");
						}).then(function (oDocumentBBc) {
							assert.ok(oDocumentBBc.getEntity().getFullPath("/b/bc"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentBBc.getKeyString()].valueOf() == oDocumentBBc);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

							return oDocumentA.move(oDocumentB, "d");
						}).then(function (oDocumentBD) {
							assert.ok(oDocumentBD.getEntity().getFullPath("/b/d"));
							assert.ok(oDocumentServiceImpl._mDocuments[oDocumentBD.getKeyString()].valueOf() == oDocumentBD);

							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAa]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyAAb]);
							assert.ok(!oDocumentServiceImpl._mDocuments[sKeyA]);
							assert.ok(oDocumentServiceImpl._mDocuments[sKeyBBa]);

						});
					});

			});

			it("file: delete and exists", function () {
				return deleteAndExistsTestsOn("/a/aa");
			});

			it("folder: delete and exists", function () {
				return deleteAndExistsTestsOn("/a");
			});

			function deleteAndExistsTestsOn(sFilePath) {
				return ofilesystem.getDocument(sFilePath).then(function (oDoc) {
					return oDoc.delete().then(function () {
						return oDoc.exists();
					}).then(function (bExists) {
						assert.ok(!bExists, "document deleted");
						return oDoc.getParent();
					}).then(function (oFolder) {
						return oFolder.objectExists(oDoc.getTitle());
					}).then(function (bExists) {
						assert.ok(!bExists);
					});
				});
			}

			it("reload", function () {
				return ofilesystem.getDocument("/a/aa").then(function (oDoc) {
					var oChangedEventHandlerCalled = Q.defer();
					return oDoc.setContent("changed").then(function () {
						assert.ok(oDoc.isDirty(), "dirty");
						oDocumentService.attachEventOnce("changed", function () {
							oChangedEventHandlerCalled.resolve();
						});
						return oDoc.reload();
					}).then(function () {
						return oDoc.getContent();
					}).then(function (sContent) {
						assert.equal(sContent, "aa", "Document content reloaded");
						assert.ok(!oDoc.isDirty(), "not dirty anymore");
					}).then(function () {
						return oChangedEventHandlerCalled.promise;
					});
				});
			});

			it("revert", function () {
				return ofilesystem.getDocument("/a/aa").then(function (oDoc) {
					var sOriginContent = "origin";
					return oDoc.setContent(sOriginContent).then(function () {
						return oDoc.save().then(function () {
							return oDoc.setContent("change").then(function () {
								assert.ok(oDoc.isDirty(), "dirty");
								return oDoc.getContent().then(function (sContent) {
									assert.equal(sContent, "change", "Document content changed");
									return oDoc.revert().then(function () {
										assert.ok(!oDoc.isDirty(), "not dirty");
										return oDoc.getContent().then(function (sContent) {
											assert.equal(sContent, sOriginContent, "Document content back to origin");
										});
									});
								});


							});
						});
					});
				});
			});

			it("project", function () {
				return ofilesystem.getDocument("/a/aa").then(function (oDoc) {
					assert.ok(!oDoc.isProject(), "a/aa is not a project");
					return oDoc.getProject();
				}).then(function (oProject) {
					assert.equal(oProject.getEntity().getName(), "a", "a is the project folder of /a/aa");
					return ofilesystem.getDocument("/b");
				}).then(function (oDocB) {
					assert.ok(oDocB.isProject(), "b is a project");
				});
			});

			it("getDocumentByKeyString", function () {
				var oDoc;
				// Get document by its calculated key string, has to return instance from buffer
				return ofilesystem.getDocument("/a/aa").then(function (_oDoc) {
					oDoc = _oDoc;
					return oDocumentService.getDocumentByKeyString(_oDoc.getEntity().getKeyString());
				}).then(function (oDoc2) {
					assert.ok(oDoc == oDoc2);

					// Check when instance not in buffer yet
				}).then(function () {
					return Q.all([oDocumentService.getDocumentByKeyString("file:/a/ab"), //File which exists
						oDocumentService.getDocumentByKeyString("folder:/b"), // Folder which exists
						oDocumentService.getDocumentByKeyString("folder:/doesnotexist"), //Does not exist
						oDocumentService.getDocumentByKeyString("file:/doesnotexist2"), //Does not exist
						oDocumentService.getDocumentByKeyString("folder:/b/ba")]); // Has wrong type
				}).spread(function (oFileWhichExists, oFolderWhichExists, oFolderWhichDoesNotExist, oFileWhichDoesNotExist, oHasWrongType) {
					assert.ok(oFileWhichExists.getEntity().getFullPath() == "/a/ab");
					assert.ok(oFileWhichExists.getEntity().getType() == "file");
					assert.ok(oFileWhichExists.getEntity().getVersionId() == undefined);

					assert.ok(oFolderWhichExists.getEntity().getFullPath() == "/b");
					assert.ok(oFolderWhichExists.getEntity().getType() == "folder");
					assert.ok(oFolderWhichExists.getEntity().getVersionId() == undefined);

					assert.ok(!oFolderWhichDoesNotExist);
					assert.ok(!oFileWhichDoesNotExist);
					assert.ok(!oHasWrongType);
				});
			});

			it("Entity fromKeyString", function () {
				var oEntity;

				// Old syntax without dao fallback to workspace for compatibility
				oEntity = FileFolderEntity.fromKeyString("file:/a/ab");
				assert.equal(oEntity.getType(), "file");
				assert.equal(oEntity.getName(), "ab");
				assert.equal(oEntity.getParentPath(), "/a");
				assert.equal(oEntity.getDAO(), "workspace");
				assert.equal(oEntity.getVersionId(), undefined);
				assert.equal(oEntity.getKeyString(), "file:/a/ab:workspace");

				//DAO is given but no version
				oEntity = FileFolderEntity.fromKeyString("folder:/a/ab:anotherDAO");
				assert.equal(oEntity.getType(), "folder");
				assert.equal(oEntity.getName(), "ab");
				assert.equal(oEntity.getParentPath(), "/a");
				assert.equal(oEntity.getDAO(), "anotherDAO");
				assert.equal(oEntity.getVersionId(), undefined);
				assert.equal(oEntity.getKeyString(), "folder:/a/ab:anotherDAO");

				//DAO + version
				oEntity = FileFolderEntity.fromKeyString("folder:/a/ab:git:1234abcd");
				assert.equal(oEntity.getType(), "folder");
				assert.equal(oEntity.getName(), "ab");
				assert.equal(oEntity.getParentPath(), "/a");
				assert.equal(oEntity.getDAO(), "git");
				assert.equal(oEntity.getVersionId(), "1234abcd");
				assert.equal(oEntity.getKeyString(), "folder:/a/ab:git:1234abcd");
			});

			it("getRoot Multiple DAOs", function () {
				var oRoot1;
				return ofilesystem.getRoot().then(function (oRoot) {
					oRoot1 = oRoot;
					assert.equal(oRoot.getEntity().getDAO(), "workspace");
					return ofilesystem.getRoot("workspace");
				}).then(function (oRoot) {
					assert.equal(oRoot.getEntity().getDAO(), "workspace");
					assert.equal(oRoot1, oRoot);
					return ofilesystem.getRoot("dummy");
				}).then(function (oRoot) {
					assert.ok(oRoot1 != oRoot);
					assert.equal(oRoot.getEntity().getDAO(), "dummy");

					// add the folder to the cache
					return ofilesystemImpl._oDAO.dummy.getDocument("/projectFolder", "dummy");
				}).then(function () {
					// add the file to the cache
					return ofilesystemImpl._oDAO.dummy.getDocument("/projectFolder/aFile", "dummy");
				}).then(function () {
					return ofilesystem.getDocument("/projectFolder/aFile", "dummy");
				}).then(function (oDummyFile) {
					assert.equal(oDummyFile.getEntity().getDAO(), "dummy");
					assert.equal(oDummyFile.getEntity().getType(), "file");
					assert.equal(oDummyFile.getEntity().getName(), "aFile");
					assert.equal(oDummyFile.getEntity().getParentPath(), "/projectFolder");

					return oDummyFile.getParent();
				}).then(function (oDummyParent) {
					assert.equal(oDummyParent.getEntity().getDAO(), "dummy");
					assert.equal(oDummyParent.getEntity().getType(), "folder");

				});
			});

			it("Versions", function () {
				function assertVersions(oVersionDoesNotExist, oVersion, aVersions, bSameDAO) {
					var sDAOText = bSameDAO ? "same " : "other";
					assert.ok(!oVersionDoesNotExist, "Version which does not exist is not returned");
					assert.ok(oVersion, "Version which exists for " + sDAOText + " DAO of document is returned");
					assert.ok(oVersion.isReadOnly(), "Version is read only");
					assert.ok(aVersions.length === 1, "Versions for " + sDAOText + " DAO are found");
					assert.ok(aVersions[0].isReadOnly(), "Version is read only");
				}

				var oDoc = null;
				return ofilesystem.getDocument("/a/aa").then(function (oDocument) {
					oDoc = oDocument;
					return oDocument.getVersions();
				}).then(function (aVersions) {
					assert.ok(aVersions.length === 0, "no versions");
					return oDoc.getVersion("1");
				}).then(function (oVersion) {
					assert.ok(!oVersion, "no version available");

					return ofilesystem.getRoot("dummy").then(function (oRoot) {
						assert.ok(oRoot.isReadOnly(), "Dummy Root is read only");
						return Q.all([oRoot.getVersion("doesnotexist"), oRoot.getVersion("dummyVersion"), oRoot.getVersions(), ofilesystem.getDocument("", "dummy", "dummyVersion")]);
					}).spread(function (oVersionDoesNotExist, oVersion, aVersions, oRootVersion) {
						assert.ok(oVersion === oRootVersion, "Same root version object received");
						assertVersions(oVersionDoesNotExist, oVersion, aVersions, true);
						return ofilesystem.getRoot();
					}).then(function (oRoot) {
						assert.equal(oRoot.getEntity().getDAO(), "workspace");
						assert.ok(!oRoot.isReadOnly(), "Workspace Root is not read only");
						return Q.all([oRoot.getVersion("doesnotexist", "dummy"), oRoot.getVersion("dummyVersion", "dummy"), oRoot.getVersions("dummy")]);
					}).spread(function (oVersionDoesNotExist, oVersion, aVersions) {
						assertVersions(oVersionDoesNotExist, oVersion, aVersions, false);
					});
				});
			});
		});
	});
});