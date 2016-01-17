define(["sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/validationStoreManager",
	"sap/watt/lib/lodash/lodash", "sinon"], function (validationStoreManager, _, sinon) {
	var sandbox;
	describe("validationStoreManagerSpec test", function () {

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
			validationStoreManager.setQueueManager();
			validationStoreManager.setCacheManager();
		});

		it("test for _getProjectIssuesFromServer function", function () {
			var oContext = {
				service: {
					basevalidator: {
						getProjectsValidatorsConfiguration: function () {
							return Q({});
						}
					}
				}
			};
			sandbox.stub(validationStoreManager, "_runNextQuedAction").returns(Q());
			return validationStoreManager._getProjectIssuesFromServer(oContext, ["a"], false).then(function () {
				var queueManager = validationStoreManager.getQueueManager();
				expect(queueManager.getSizeOfQueue()).to.eql(1);
				var applyInQueue = queueManager.dequeueRequest();
				expect(applyInQueue.projects).to.deep.equal(["a"]);
				expect(applyInQueue.workspaceConfig).to.deep.equal({});
				expect(applyInQueue.forceAnalyze).to.deep.equal(false);
			});
		});

		it("test for updateSingleFileValidation function", function () {
			var oContext = {};
			var result;
			var sFilePath = "/a/txt.js";
			var sFileIssues = "txt.js issues";
			var sProjectName = "a";
			var cacheManager = validationStoreManager.getCacheManager();
			var oProjectToUpdate = {
				document: sFilePath,
				result: {
					issues: [sFileIssues],
				}
			};
			cacheManager.addProjects([{
				projectName: sProjectName,
				projectData: {
					issues: {}
				}
			}]);

			// Update file when selecting project a
			sandbox.stub(validationStoreManager, "getSelectedProject").returns("a");
			sandbox.stub(validationStoreManager, "_getProjectIssuesFromCache").returns(Q());
			result = validationStoreManager.updateSingleFileValidation(oContext, oProjectToUpdate);
			var projects = cacheManager.doProjectsExists([sProjectName]);
			var isProjectExists = projects[0].isProjectExists;
			expect(isProjectExists).to.be.true;
			var oProjectA = cacheManager.getProjects([sProjectName]);
			expect(oProjectA[0].projectData.issues["\\a\\txt.js"]).to.exists;
			var aFileIssues = oProjectA[0].projectData.issues["\\a\\txt.js"].issues;
			expect(aFileIssues[0]).to.deep.equal(sFileIssues);
			expect(validationStoreManager._getProjectIssuesFromCache.calledOnce).to.be.true;
			result.done();

			// Update file when selecting LOCAL
			sandbox.restore();
			sandbox.stub(validationStoreManager, "getSelectedProject").returns("LOCAL");
			sandbox.stub(validationStoreManager, "select").returns(Q());
			result = validationStoreManager.updateSingleFileValidation(oContext, oProjectToUpdate);
			var projects = cacheManager.doProjectsExists([sProjectName]);
			var isProjectExists = projects[0].isProjectExists;
			expect(isProjectExists).to.be.true;
			var oProjectA = cacheManager.getProjects([sProjectName]);
			expect(oProjectA[0].projectData.issues["\\a\\txt.js"]).to.exists;
			var aFileIssues = oProjectA[0].projectData.issues["\\a\\txt.js"].issues;
			expect(aFileIssues[0]).to.deep.equal(sFileIssues);
			expect(validationStoreManager.select.calledOnce).to.be.true;
			result.done();

			// Bad input
			sandbox.restore();
			sandbox.stub(validationStoreManager, "getSelectedProject").returns(null);
			sandbox.stub(validationStoreManager, "select").returns(Q());
			sandbox.stub(validationStoreManager, "_getProjectIssuesFromCache").returns(Q());
			result = validationStoreManager.updateSingleFileValidation(oContext, oProjectToUpdate);
			expect(validationStoreManager.select.calledOnce).to.be.false;
			expect(validationStoreManager._getProjectIssuesFromCache.calledOnce).to.be.false;
			result.done();
		});

		it("test for setSelectedProject function", function () {
			sandbox.stub(validationStoreManager, "getSelectedProject").returns(null);
			var oRootDocument = {
				getEntity: function () {
					return {
						isRoot: function () {
							return true;
						}
					};
				},
			};
			var oDocument = {
				getEntity: function () {
					return {
						isRoot: function () {
							return false;
						},
						getName: function () {
							return "a";
						}
					};
				},
			};
			validationStoreManager.setSelectedProject(oRootDocument).then(function (bSelectionChanged) {
				expect(validationStoreManager.getSelectedProject()).to.deep.equal("LOCAL");
				expect(bSelectionChanged).to.be.true;
			}).done();
			sandbox.restore();
			validationStoreManager.setSelectedProject(oDocument).then(function (bSelectionChanged) {
				expect(validationStoreManager.getSelectedProject()).to.deep.equal("a");
				expect(bSelectionChanged).to.be.true;
			}).done();
			sandbox.restore();
			validationStoreManager.setSelectedProject(oDocument).then(function (bSelectionChanged) {
				expect(validationStoreManager.getSelectedProject()).to.deep.equal("a");
				expect(bSelectionChanged).to.be.false;
			}).done();
		});

		it("test for _getMissingProjectsInCache function", function () {
			var aAllWorkspaceProjects = ["a", "b"];
			var projectToAddTheCache = {
				projectName: "a",
				projectData: {
					issues: {}
				}
			};
			var aMissingProjectsInCache = validationStoreManager._getMissingProjectsInCache(aAllWorkspaceProjects);
			expect(aMissingProjectsInCache).to.deep.equal(["a", "b"]);

			var cacheManager = validationStoreManager.getCacheManager();
			cacheManager.addProjects([projectToAddTheCache]);
			var aMissingProjectsInCache = validationStoreManager._getMissingProjectsInCache(aAllWorkspaceProjects);
			expect(aMissingProjectsInCache).to.deep.equal(["b"]);

			projectToAddTheCache.projectName = "b";
			cacheManager.addProjects([projectToAddTheCache]);
			var aMissingProjectsInCache = validationStoreManager._getMissingProjectsInCache(aAllWorkspaceProjects);
			expect(aMissingProjectsInCache).to.deep.equal([]);
		});

		it("test for _addProjectsToQueue function call from analyse function", function () {
			var aProjects = ["a", "b"];
			var oWorkspaceConfig = {};
			var bForceInsert = true;
			validationStoreManager._addProjectsToQueue(aProjects, oWorkspaceConfig, bForceInsert);
			var queueManager = validationStoreManager.getQueueManager();
			expect(queueManager.getSizeOfQueue()).to.eql(1);
			var applyInQueue = queueManager.dequeueRequest();
			expect(applyInQueue.projects).to.deep.equal(aProjects);
			expect(applyInQueue.workspaceConfig).to.deep.equal(oWorkspaceConfig);
			expect(applyInQueue.forceAnalyze).to.deep.equal(true);
			expect(queueManager.getSizeOfQueue()).to.eql(0);
		});

		it("test for _getWorkspaceIssuesFromServer function", function () {
			var oContext = {
				service: {
					basevalidator: {
						getProjectsValidatorsConfiguration: function () {
							return Q({});
						}
					}
				}
			};
			var aProjects = ["a", "b"];
			var bForceAnalyze = false;
			sandbox.stub(validationStoreManager, "_replaceFioriValidatorWithJsValidator").returns({a: {}, b: {}});
			sandbox.stub(validationStoreManager, "_runNextQuedAction").returns(Q());
			sandbox.stub(validationStoreManager, "_getMissingProjectsInCache").returns(["a", "b"]);
			return validationStoreManager._getWorkspaceIssuesFromServer(oContext, bForceAnalyze).then(function () {
				var queueManager = validationStoreManager.getQueueManager();
				expect(queueManager.getSizeOfQueue()).to.eql(1);
				var applyInQueue = queueManager.dequeueRequest();
				expect(applyInQueue.projects).to.deep.equal(aProjects);
				expect(applyInQueue.workspaceConfig).to.deep.equal({a: {}, b: {}});
				expect(applyInQueue.forceAnalyze).to.deep.equal(bForceAnalyze);
			});
		});

		it("test for _isolateSpecificProjectIssues function", function () {
			var testResult;
			var expectedResult;
			var sProjectName = "A";
			var DIR_SEPARATOR = "/";
			var oValidationResultsMock;

			// Positive test - "/"
			oValidationResultsMock = getValidationResultsMockData(DIR_SEPARATOR);
			testResult = validationStoreManager._isolateSpecificProjectIssues(sProjectName, oValidationResultsMock);
			expectedResult = getExpectedProjectIssues(DIR_SEPARATOR);
			expect(testResult).to.deep.equal(expectedResult);

			// Positive test - "\"
			DIR_SEPARATOR = "\\";
			oValidationResultsMock = getValidationResultsMockData(DIR_SEPARATOR);
			testResult = validationStoreManager._isolateSpecificProjectIssues(sProjectName, oValidationResultsMock);
			expectedResult = getExpectedProjectIssues(DIR_SEPARATOR);
			expect(testResult).to.deep.equal(expectedResult);

			// Negative test - bad input oValidationResults
			oValidationResultsMock = getValidationResultsMockData(DIR_SEPARATOR);
			testResult = validationStoreManager._isolateSpecificProjectIssues(null, oValidationResultsMock);
			expect(testResult).to.be.null;

			// Negative test - bad input sProjectName
			testResult = validationStoreManager._isolateSpecificProjectIssues(sProjectName, null);
			expect(testResult).to.be.null;
		});

		function getValidationResultsMockData(DIR_SEPARATOR) {
			var oIssues = {
				issues: [
					{issueName: "someIssue"}
				],
				root: {}
			};

			var oValidationResults;
			if (DIR_SEPARATOR === "/") {
				oValidationResults = {
					"/A/a.js": oIssues,
					"/B/b.js": oIssues,
				};
			}
			else {
				oValidationResults = {
					"\\A\\a.js": oIssues,
					"\\B\\b.js": oIssues,
				};
			}
			return oValidationResults;
		};

		function getExpectedProjectIssues(DIR_SEPARATOR) {
			return {
				projectData: {
					issues: {
						"\\A\\a.js": {
							issues: [
								{issueName: "someIssue"},
							],
							root: {}
						}
					}
				},
				projectName: "A"
			};
		};

		it("test for _mergeIssues function", function () {
			var aAllWorkspaceProjects = ["a", "b"];
			var issues1 = "issues a";
			var issues2 = "issues b";
			var oIssue1 = {"/a/txt1.js": issues1};
			var oIssue2 = {"/a/txt2.js": issues2};
			var oIssuesSet = validationStoreManager._mergeIssues(oIssue1, oIssue2);
			expect(oIssuesSet["/a/txt1.js"]).to.deep.equal(issues1);
			expect(oIssuesSet["/a/txt2.js"]).to.deep.equal(issues2);
		});

		it("test for _getProjectIssuesFromCache function", function () {
			// No need for now
		});

		it("test for _handelIssuesReturns function", function () {
			var oContext = {
				service: {
					usagemonitoring: {
						report: function () {
							return Q();
						}
					}
				}
			};
			var aCurrentRequest = ["a"];
			var issues1 = "issues a";
			var issues2 = "issues b";
			var oProjectIssues = {
				projectName: "a",
				projectData: {
					issues: {
						"//a//txt1.js": issues1,
						"//a//txt2.js": issues2
					}
				}
			};
			var oValidationResults = {};
			sandbox.stub(validationStoreManager, "_isolateSpecificProjectIssues").returns(oProjectIssues);
			sandbox.stub(validationStoreManager, "_fireIssuesUpdate").returns();
			validationStoreManager._handelIssuesReturns(oContext, aCurrentRequest, oValidationResults);
			var cacheManager = validationStoreManager.getCacheManager();
			var projects = cacheManager.doProjectsExists(aCurrentRequest);
			var isProjectExists = projects[0].isProjectExists;
			expect(isProjectExists).to.be.true;
			var oProjectA = cacheManager.getProjects(aCurrentRequest);
			var aFileIssues1 = oProjectA[0].projectData.issues["//a//txt1.js"];
			expect(aFileIssues1).to.deep.equal(issues1);
			var aFileIssues2 = oProjectA[0].projectData.issues["//a//txt2.js"];
			expect(aFileIssues2).to.deep.equal(issues2);
			expect(validationStoreManager._fireIssuesUpdate.calledOnce).to.be.true;
		});

		it("test for _runNextQuedAction function", function () {
			oContext = {};
			var oContext = {};
			var oWorkspaceConfig = {a: "a", b: "b"};
			var aProjects = ["a", "b"];
			var bForceAnalyze = false;
			var queueManager = validationStoreManager.getQueueManager();
			queueManager.addRequest({
				projects: aProjects,
				workspaceConfig: oWorkspaceConfig,
				forceAnalyze: bForceAnalyze
			});
			sandbox.stub(validationStoreManager, "_performApplyToServer").returns(Q());
			//sandbox.stub(_validationStoreManager, "bIsRequestRunning").returns(bForceAnalyze);
			return validationStoreManager._runNextQuedAction(oContext).then(function () {
				expect(queueManager.getSizeOfQueue()).to.eql(0);
			});
		});

		it("test for _hasFiles function", function () {
			var oEntity = {
				isRoot: function () {
					return false;
				},
				getName: function () {
					return "TEST";
				}
			};
			var oProject = {
				getEntity: function () {
					return oEntity;
				},
				getCurrentMetadata: function (bool) {
					return Q([{
						folder: false,
						name: "a.js"
					}]);
				}
			};
			// Test for project with files
			return validationStoreManager._hasFiles(oProject).then(function (oResult) {
				expect(oResult).to.eql("TEST");
				oEntity.isRoot = function () {
					return true;
				};
				// Test for LOCAL folder
				return validationStoreManager._hasFiles(oProject).then(function (oResult) {
					expect(oResult).to.eql("LOCAL");
					oEntity.isRoot = function () {
						return false;
					};
					oProject.getCurrentMetadata = function (bool) {
						return Q([]);
					};
					// Test for project without files or folders
					return validationStoreManager._hasFiles(oProject).then(function (oResult) {
						expect(oResult).to.eql(null);
						oProject.getCurrentMetadata = function (bool) {
							return Q([{
								folder: true,
								name: "a"
							}]);
						};
						// Test for project with just folders
						return validationStoreManager._hasFiles(oProject).then(function (oResult) {
							expect(oResult).to.eql(null);
						});
					});
				});
			});
		});
	});
});