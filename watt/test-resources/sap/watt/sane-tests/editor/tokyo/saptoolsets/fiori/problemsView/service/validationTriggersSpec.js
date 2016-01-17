define(["sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/validationStoreManager",
	"sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (validationStoreManager, _, sinon, STF) {

	var sandbox;
	var suiteName = "service_validation_triggers";
	var _oImpl;
	var _oValidationsDistributorImpl;
	var oValidationTriggersService;
	var oBaseValidator;
	var oValidationsDistributorService;
	var oCodeValidationDAOService;
	var oDocumentProviderService;
	var MockFileDocument;
	var MockFolderDocument;

	describe("test triggers for validation", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oValidationTriggersService = serviceGetter("validationTriggers");
					oBaseValidator = serviceGetter("basevalidator");
					oValidationsDistributorService = serviceGetter("problemsViewValidation");
					oCodeValidationDAOService = serviceGetter("codeValidationDAO");
					oDocumentProviderService = serviceGetter("filesystem.documentProvider");
					return STF.getServicePrivateImpl(oValidationTriggersService).then(function (oImpl) {
						_oImpl = oImpl;
						return STF.getServicePrivateImpl(oValidationsDistributorService).then(function (oPvImpl) {
							_oValidationsDistributorImpl = oPvImpl;
							return STF.require(suiteName, [
								"sane-tests/util/mockDocument"
							]);
						});
					});
				}).spread(function (oMockDocument) {
					MockFileDocument = oMockDocument.MockFileDocument;
					MockFolderDocument = oMockDocument.MockFolderDocument;
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
			validationStoreManager.setCacheManager();
			var oDoc = new MockFileDocument("/NEW/new.js", ".js", "newDoc");
			oDoc.getEntity().isRoot = function () {
				return false;
			};
			oDoc.getEntity().getName = function () {
				return "NEW";
			};
			validationStoreManager.setSelectedProject(oDoc).done();
		});

		function initCacheData() {
			var cache = validationStoreManager.getCacheManager();
			var oProjectIssues = {
				projectName: "A",
				projectData: {
					issues: {
						"\\A\\a.js": {
							issues: [
								"someIssue"
							],
							root: {}
						},
						"\\A\\B\\b.js": {
							issues: [
								"someIssue"
							],
							root: {}
						},
						"\\A\\B\\c.js": {
							issues: [
								"someIssue"
							],
							root: {}
						}
					}
				}
			};
			cache.addProjects([oProjectIssues]);
			return cache;
		};

		it("trigger update event when single file is deleted", function () {
			var cache = initCacheData();
			var oDoc = new MockFileDocument("/A/a.js", ".js", "aaa");
			oDoc.getEntity().isRoot = function () {
				return false;
			};
			oDoc.getEntity().getName = function () {
				return "A";
			};
			var oEvent = {
				params: {
					document: oDoc
				}
			};
			return validationStoreManager.setSelectedProject(oDoc).then(function () {
				sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
				sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
				sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
				var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
				var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
				return oValidationTriggersService.onDocumentDeleted(oEvent).then(function () {
					var testedProject = cache.getProjects(["A"])[0];
					expect(testedProject.projectData.issues["\\A\\a.js"].issues).to.be.empty;
					expect(issuesUpdateEventSpy.calledOnce).to.be.true;
					var expectedResult = {
						displayed: "A",
						senders: ["A"],
						validationsResults: [
							{
								document: "\\A\\a.js",
								result: {
									issues: []
								}
							}, {
								document: "\\A\\B\\b.js",
								result: {
									issues: ["someIssue"],
									root: {}
								}
							}, {
								document: "\\A\\B\\c.js",
								result: {
									issues: ["someIssue"],
									root: {}
								}
							}
						]
					};
					expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
				});
			});
		});

		it("trigger update event when sub folder is deleted", function () {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/A/B");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return false;
			};
			var oEvent = {
				params: {
					document: oFolder
				}
			};
			return validationStoreManager.setSelectedProject(oFolder).then(function () {
				sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
				sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
				sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
				var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
				var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
				return oValidationTriggersService.onDocumentDeleted(oEvent).then(function () {
					var testedProject = cache.getProjects(["A"])[0];
					expect(testedProject.projectData.issues["\\A\\B\\b.js"]).to.not.exists;
					expect(testedProject.projectData.issues["\\A\\B\\c.js"]).to.not.exists;
					expect(issuesUpdateEventSpy.calledOnce).to.be.true;
					var expectedResult = {
						displayed: "A",
						senders: ["A"],
						validationsResults: [
							{
								document: "\\A\\a.js",
								result: {
									issues: ["someIssue"],
									root: {}
								}
							}
						]
					};
					expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
				});
			});
		});

		it("trigger update event when project is deleted", function () {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/A");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			var oEvent = {
				params: {
					document: oFolder
				}
			};
			return validationStoreManager.setSelectedProject(oFolder).then(function () {
				sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
				sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
				sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
				var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
				var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
				return oValidationTriggersService.onDocumentDeleted(oEvent).then(function () {
					var testedProject = cache.getProjects(["A"]);
					expect(testedProject).to.have.length(0);
					expect(issuesUpdateEventSpy.calledOnce).to.be.true;
					var expectedResult = {
						displayed: "A",
						senders: ["A"],
						validationsResults: []
					};
					expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
				});
			});
		});

		it("trigger analyse event when user clicks on analyse button and a PROJECT is selected", function (done) {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/A");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			validationStoreManager.setSelectedProject(oFolder).then(function () {
				sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
				sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
				sandbox.stub(oCodeValidationDAOService, "codeValidationResponseStatus").returns(Q(
					{
						OK: 0,
						ERROR: 1,
						PARTIAL_ERROR: 2
					}
				));
				sandbox.stub(oCodeValidationDAOService, "validateWorkspaceContent").returns(Q(
					{
						integrity: {
							info: undefined,
							status: 0
						},
						result: {
							"\\A\\a.js": {
								issues: [],
								root: {}
							},
							"\\A\\B\\b.js": {
								issues: [],
								root: {}
							},
							"\\A\\B\\c.js": {
								issues: [],
								root: {}
							}
						}
					}
				));
				sandbox.stub(_oImpl.context.event, "fireIssuesUpdate", function (obj) {
					var expectedResult = {
						displayed: "A",
						senders: ["A"],
						validationsResults: [
							{
								document: "\\A\\a.js",
								result: {
									issues: [],
									root: {}
								}
							}, {
								document: "\\A\\B\\b.js",
								result: {
									issues: [],
									root: {}
								}
							}, {
								document: "\\A\\B\\c.js",
								result: {
									issues: [],
									root: {}
								}
							}
						]
					};
					expect(obj).to.deep.equal(expectedResult);
					done();
				});
				return oValidationTriggersService.analyse().then(function () {
					var testedProject = cache.getProjects(["A"]);
					expect(testedProject).to.have.length(1);
					var projectA = testedProject[0];
					expect(projectA.projectData.issues["\\A\\a.js"].issues).to.be.empty;
					expect(projectA.projectData.issues["\\A\\B\\b.js"].issues).to.be.empty;
					expect(projectA.projectData.issues["\\A\\B\\c.js"].issues).to.be.empty;
				});
			});
		});

		it("trigger analyse event when user clicks on analyse button and LOCAL is selected", function (done) {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/");
			oFolder.getEntity().isRoot = function () {
				return true;
			};
			oFolder.getEntity().getName = function () {
				return "LOCAL";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			validationStoreManager.setSelectedProject(oFolder).then(function () {
				sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
				sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
				sandbox.stub(oBaseValidator, "getProjectsValidatorsConfiguration").returns(Q({
					"A": {},
					"B": {}
				}));
				sandbox.stub(validationStoreManager, "_replaceFioriValidatorWithJsValidator").returns({
					"A": {},
					"B": {}
				});
				sandbox.stub(oCodeValidationDAOService, "codeValidationResponseStatus").returns(Q(
					{
						OK: 0,
						ERROR: 1,
						PARTIAL_ERROR: 2
					}
				));
				sandbox.stub(oCodeValidationDAOService, "validateWorkspaceContent").returns(Q({
					integrity: {
						info: undefined,
						status: 0
					},
					result: {
						"\\A\\a.js": {
							issues: [],
							root: {}
						},
						"\\A\\B\\b.js": {
							issues: [],
							root: {}
						},
						"\\A\\B\\c.js": {
							issues: [],
							root: {}
						},
						"\\B\\d.js": {
							issues: [],
							root: {}
						},
						"\\B\\e.js": {
							issues: ["someIssue1", "someIssue2", "someIssue3"],
							root: {}
						}
					}
				}));
				sandbox.stub(_oImpl.context.event, "fireIssuesUpdate", function (obj) {
					var expectedResult = {
						displayed: "LOCAL",
						senders: ["A", "B"],
						validationsResults: [{
							document: "\\A\\a.js",
							result: {
								issues: [],
								root: {}
							}
						}, {
							document: "\\A\\B\\b.js",
							result: {
								issues: [],
								root: {}
							}
						}, {
							document: "\\A\\B\\c.js",
							result: {
								issues: [],
								root: {}
							}
						}, {
							document: "\\B\\d.js",
							result: {
								issues: [],
								root: {}
							}
						}, {
							document: "\\B\\e.js",
							result: {
								issues: ["someIssue1", "someIssue2", "someIssue3"],
								root: {}
							}
						}
						]
					};
					expect(obj).to.deep.equal(expectedResult);
					done();
				});
				return oValidationTriggersService.analyse().then(function () {
					var testedProjects = cache.getProjects(["A", "B"]);
					expect(testedProjects).to.have.length(2);
					var projectA = testedProjects[0];
					var projectB = testedProjects[1];
					expect(projectA.projectData.issues["\\A\\a.js"].issues).to.be.empty;
					expect(projectA.projectData.issues["\\A\\B\\b.js"].issues).to.be.empty;
					expect(projectA.projectData.issues["\\A\\B\\c.js"].issues).to.be.empty;
					expect(projectB.projectData.issues["\\B\\d.js"].issues).to.be.empty;
					expect(projectB.projectData.issues["\\B\\e.js"].issues).to.have.length(3);
				});
			});
		});

		it("trigger selection event and a PROJECT is selected and nothing in cache", function () {
			var oFolder = new MockFolderDocument([], "/A");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oImpl, "_getSelectedDocument").returns(Q(oFolder));
			sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
			sandbox.stub(validationStoreManager, "_hasFiles").returns(Q({projectName: "A", hasFiles: true}));
			sandbox.stub(oCodeValidationDAOService, "codeValidationResponseStatus").returns(Q({
				OK: 0,
				ERROR: 1,
				PARTIAL_ERROR: 2
			}));
			sandbox.stub(oCodeValidationDAOService, "validateWorkspaceContent").returns(Q({
				integrity: {
					info: undefined,
					status: 0
				},
				result: {
					"\\A\\a.js": {
						issues: ["someIssue in a.js"],
						root: {}
					},
					"\\A\\B\\b.js": {
						issues: ["someIssue in b.js"],
						root: {}
					},
					"\\A\\B\\c.js": {
						issues: ["someIssue in c.js"],
						root: {}
					}
				}
			}));
			var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
			var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
			var serverCallSpy = sandbox.spy(validationStoreManager, "_getProjectIssuesFromServer");
			return oValidationTriggersService.onDocumentSelected().then(function () {
				expect(issuesUpdateEventSpy.calledTwice).to.be.true;
				expect(serverCallSpy.calledOnce).to.be.true;
				var cache = validationStoreManager.getCacheManager();
				var testedProject = cache.getProjects(["A"]);
				expect(testedProject).to.have.length(1);
				var projectA = testedProject[0];
				expect(projectA.projectData.issues["\\A\\a.js"].issues).to.have.length(1);
				expect(projectA.projectData.issues["\\A\\B\\b.js"].issues).to.have.length(1);
				expect(projectA.projectData.issues["\\A\\B\\c.js"].issues).to.have.length(1);
				var expectedResult = {
					displayed: "A",
					senders: ["A"],
					validationsResults: [{
						document: "\\A\\a.js",
						result: {
							issues: ["someIssue in a.js"],
							root: {}
						}
					}, {
						document: "\\A\\B\\b.js",
						result: {
							issues: ["someIssue in b.js"],
							root: {}
						}
					}, {
						document: "\\A\\B\\c.js",
						result: {
							issues: ["someIssue in c.js"],
							root: {}
						}
					}
					]
				};
				expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
			});
		});

		it("trigger selection event and a PROJECT is selected and project in cache", function () {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/A");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oImpl, "_getSelectedDocument").returns(Q(oFolder));
			sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
			sandbox.stub(validationStoreManager, "_hasFiles").returns(Q({projectName: "A", hasFiles: true}));
			sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
			var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
			var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
			var cacheCallSpy = sandbox.spy(validationStoreManager, "_getProjectIssuesFromCache");
			return oValidationTriggersService.onDocumentSelected().then(function () {
				expect(issuesUpdateEventSpy.calledOnce).to.be.true;
				expect(cacheCallSpy.calledOnce).to.be.true;
				var testedProject = cache.getProjects(["A"]);
				expect(testedProject).to.have.length(1);
				var projectA = testedProject[0];
				expect(projectA.projectData.issues["\\A\\a.js"].issues).to.have.length(1);
				expect(projectA.projectData.issues["\\A\\B\\b.js"].issues).to.have.length(1);
				expect(projectA.projectData.issues["\\A\\B\\c.js"].issues).to.have.length(1);
				var expectedResult = {
					displayed: "A",
					senders: ["A"],
					validationsResults: [{
						document: "\\A\\a.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}, {
						document: "\\A\\B\\b.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}, {
						document: "\\A\\B\\c.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}
					]
				};
				expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
			});
		});

		it("trigger selection event and LOCAL is selected and not all projects in cache", function () {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/");
			oFolder.getEntity().isRoot = function () {
				return true;
			};
			oFolder.getEntity().getName = function () {
				return "LOCAL";
			};
			oFolder.getEntity().isProject = function () {
				return false;
			};
			sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oImpl, "_getSelectedDocument").returns(Q(oFolder));
			sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
			sandbox.stub(validationStoreManager, "_hasFiles").returns(Q({projectName: "LOCAL", hasFiles: true}));
			sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
			sandbox.stub(validationStoreManager, "_getWorkspaceProjectNames").returns(Q(["A", "B"]));
			var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
			var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
			return oValidationTriggersService.onDocumentSelected().then(function () {
				expect(issuesUpdateEventSpy.calledOnce).to.be.true;
				var expectedResult = {
					displayed: "LOCAL",
					senders: ["LOCAL"],
					validationsResults: []
				};
				expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
			});
		});

		it("trigger selection event and LOCAL is selected and all projects in cache", function () {
			var cache = initCacheData();
			var oFolder = new MockFolderDocument([], "/");
			oFolder.getEntity().isRoot = function () {
				return true;
			};
			oFolder.getEntity().getName = function () {
				return "LOCAL";
			};
			oFolder.getEntity().isProject = function () {
				return false;
			};
			sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oImpl, "_getSelectedDocument").returns(Q(oFolder));
			sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
			sandbox.stub(validationStoreManager, "_hasFiles").returns(Q({projectName: "LOCAL", hasFiles: true}));
			sandbox.stub(validationStoreManager, "getCacheManager").returns(cache);
			sandbox.stub(validationStoreManager, "_getWorkspaceProjectNames").returns(Q(["A"]));
			var codeValidatorSpy = sandbox.spy(_oValidationsDistributorImpl, "_getIssuesUpdateInfo");
			var issuesUpdateEventSpy = sandbox.spy(_oImpl.context.event, "fireIssuesUpdate");
			var cacheCallSpy = sandbox.spy(validationStoreManager, "_getProjectIssuesFromCache");
			return oValidationTriggersService.onDocumentSelected().then(function () {
				expect(cacheCallSpy.calledOnce).to.be.true;
				expect(issuesUpdateEventSpy.calledOnce).to.be.true;
				var expectedResult = {
					displayed: "LOCAL",
					senders: ["A"],
					validationsResults: [{
						document: "\\A\\a.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}, {
						document: "\\A\\B\\b.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}, {
						document: "\\A\\B\\c.js",
						result: {
							issues: ["someIssue"],
							root: {}
						}
					}
					]
				};
				expect(codeValidatorSpy.returned(expectedResult)).to.be.true;
			});
		});

		it("trigger selection event on EMPTY folder", function () {
			var oFolder = new MockFolderDocument([], "/A");
			oFolder.getEntity().isRoot = function () {
				return false;
			};
			oFolder.getEntity().getName = function () {
				return "A";
			};
			oFolder.getEntity().isProject = function () {
				return true;
			};
			sandbox.stub(_oImpl, "getProblemsViewVisibility").returns(true);
			sandbox.stub(_oImpl, "_getSelectedDocument").returns(Q(oFolder));
			sandbox.stub(validationStoreManager, "_hasFiles").returns(Q(null));
			sandbox.stub(_oImpl, "getValidationStoreManager").returns(validationStoreManager);
			var selectFlowSpy = sandbox.spy(validationStoreManager, "select");
			return oValidationTriggersService.onDocumentSelected().then(function () {
				expect(selectFlowSpy.called).to.be.false;
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
