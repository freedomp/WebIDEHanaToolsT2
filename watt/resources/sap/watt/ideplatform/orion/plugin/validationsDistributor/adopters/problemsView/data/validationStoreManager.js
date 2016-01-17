define(["sap/watt/lib/lodash/lodash", "sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/cacheManager", "sap/watt/ideplatform/orion/plugin/validationsDistributor/adopters/problemsView/data/queueManager"], function (_, cache, queue) {
	"use strict";

	var _sSelectedProject = null;
	var _cWORKSPACE_FOLDER = "LOCAL";
	var _cache = new cache();
	var _queue = new queue();

	return {
		bIsRequestRunning: false,

		analyse: function (oContext) {
			if (!_.isNull(this.getSelectedProject())) {
				// Workspace scenario
				if (this.getSelectedProject() === _cWORKSPACE_FOLDER) {
					return this._getWorkspaceIssuesFromServer(oContext, true);
				}
				// Project scenario
				else {
					return this._getProjectIssuesFromServer(oContext, [this.getSelectedProject()], true);
				}
			}
			return Q();
		},

		select: function (oContext) {
			var that = this;
			if (!_.isNull(this.getSelectedProject())) {
				// Workspace flow is now limited only to analyze
				if (this.getSelectedProject() === _cWORKSPACE_FOLDER) {
					return this._getWorkspaceProjectNames(oContext)
						.then(function (aAllProjects) {
							var aAllProjectsInCash = that._getMissingProjectsInCache(aAllProjects);
							if (aAllProjectsInCash.length === 0) {
								return that._getProjectIssuesFromCache(oContext, aAllProjects);
							}
							else {
								return that._fireIssuesUpdate([_cWORKSPACE_FOLDER], {}, oContext);
							}
						});
				}
				// Project flow
				else {
					var aProjectToDisplay = [this.getSelectedProject()];
					var oProjectExists = this.getCacheManager().doProjectsExists(aProjectToDisplay);
					if (oProjectExists) {
						if (oProjectExists[0].isProjectExists) {
							return that._getProjectIssuesFromCache(oContext, aProjectToDisplay);
						} else {
							// Clean the problems view
							that._fireIssuesUpdate([], {}, oContext);
							return that._getProjectIssuesFromServer(oContext, aProjectToDisplay);
						}
					}
				}
			}
			return Q();
		},

		updateSingleFileValidation: function (oContext, oProjectToUpdate) {
			if (!_.isNull(this.getSelectedProject())) {
				var sFilePath = oProjectToUpdate.document;
				var aIssues = oProjectToUpdate.result.issues;
				var aPathToParts = sFilePath.split("/");
				var sProjectName = aPathToParts[1];
				sFilePath = sFilePath.split("/").join("\\");
				this.getCacheManager().updateIssuesForSingleFile(sProjectName, sFilePath, aIssues);
				if (this.getSelectedProject() === _cWORKSPACE_FOLDER) {
					return this.select(oContext);
				}
				else {
					return this._getProjectIssuesFromCache(oContext, [sProjectName]);
				}
			}
			return Q();
		},

		handleFolderDelete: function (oContext, oDoc) {
			var sFilePath = oDoc.getEntity().getFullPath();
			var aPathToParts = sFilePath.split("/");
			var sProjectName = aPathToParts[1];
			sFilePath = sFilePath.split("/").join("\\");
			if (oDoc.getEntity().isProject()) {
				_cache.deleteProjects([sProjectName]);
				return this._fireIssuesUpdate([sProjectName], {}, oContext);
			} else {
				_cache.deleteProjectSubFolder(sProjectName, sFilePath);
				return this._getProjectIssuesFromCache(oContext, [sProjectName]);
			}
			return Q();
		},

		setSelectedProject: function (oCurrSelectedProject) {
			var id;
			if (oCurrSelectedProject.getEntity().isRoot()) {
				id = "LOCAL";
			}
			else {
				id = oCurrSelectedProject.getEntity().getName();
			}
			if (!this.getSelectedProject() || id !== this.getSelectedProject()) {
				_sSelectedProject = id;
				return Q(true);
			}
			return Q(false);
		},

		_getWorkspaceProjectNames: function (oContext) {
			var that = this;
			var aWorkspaceProjects = [];
			return oContext.service.filesystem.documentProvider.getRoot().then(function (oRoot) {
				return oRoot.getFolderContent().then(function (oWorkspaceFolders) {
					var oPromises = [];
					_(oWorkspaceFolders).forEach(function (oProject) {
						oPromises.push(that._hasFiles(oProject));
					}).value();
					return Q.all(oPromises).then(function (aProjects) {
						_(aProjects).forEach(function (sProject) {
							if (sProject) {
								aWorkspaceProjects.push(sProject);
							}
						}).value();
						return aWorkspaceProjects;
					});
				});
			});
		},

		_hasFiles: function (oDoc) {
			if (oDoc.getEntity().isRoot()) {
				return Q(_cWORKSPACE_FOLDER);
			}
			return oDoc.getCurrentMetadata(true).then(function (aContents) {
				var hasFiles = _.findIndex(aContents, {folder: false}) !== -1;
				return (hasFiles === true ? oDoc.getEntity().getName() : null);
			});
		},

		_getMissingProjectsInCache: function (aAllWorkspaceProjects) {
			var aMissingProjectsInCache = [];
			var aCacheResults = this.getCacheManager().doProjectsExists(aAllWorkspaceProjects);
			_(aCacheResults).forEach(function (oCachedProject) {
				if (!oCachedProject.isProjectExists) {
					aMissingProjectsInCache.push(oCachedProject.projectName);
				}
			}).value();
			return aMissingProjectsInCache;
		},

		_addProjectsToQueue: function (aProjects, oWorkspaceConfig, bForceInsert) {
			var that = this;
			if (bForceInsert) {
				this.getQueueManager().addRequest({
					projects: aProjects,
					workspaceConfig: oWorkspaceConfig,
					forceAnalyze: bForceInsert
				});
			} else {
				var aMissingProjectsInCache = that._getMissingProjectsInCache(aProjects);
				var arraySize = aMissingProjectsInCache.length;
				if (arraySize !== 0) {
					this.getQueueManager().addRequest({
						projects: aProjects,
						workspaceConfig: oWorkspaceConfig,
						forceAnalyze: bForceInsert
					});
				}
			}
		},

		_fireIssuesUpdate: function (aProjectNames, oIssues, oContext) {
			var that = this;
			if (oIssues) {
				return oContext.service.basevalidator.getIssuesWrappedForProblems(oIssues).then(function (aWrappedIssues) {
					if (aWrappedIssues) {
						return oContext.service.validationTriggers.context.event.fireIssuesUpdate({
							displayed: that.getSelectedProject(),
							senders: aProjectNames,
							validationsResults: aWrappedIssues
						});
					}
				}).fail(function (oError) {
					oContext.service.log.error(oContext.service.codeValidationDAO.getProxyMetadata().getName(), oError.message, ["system"]).done();
				});
			}
		},

		_runNextQuedAction: function (oContext) {
			var that = this;
			if (!this.bIsRequestRunning) {
				// we can run a process
				var oRequest = this.getQueueManager().dequeueRequest();
				if (oRequest) {
					var aProjectsRequest = oRequest.projects;
					var oWorkspaceConfig = oRequest.workspaceConfig;
					var forceAnalyze = oRequest.forceAnalyze;
					var aCurrentRequest = aProjectsRequest;
					if (!forceAnalyze) {
						aCurrentRequest = that._getMissingProjectsInCache(aProjectsRequest);
					}
					if (aCurrentRequest.length !== 0) {
						return that._performApplyToServer(oContext, aCurrentRequest, oWorkspaceConfig);
					}
				}
			}
			return Q();
		},

		_performApplyToServer: function (oContext, aCurrentRequest, oWorkspaceConfig) {
			var that = this;
			oContext.service.problemsViewValidation.context.event.fireProblemsLongRunningProcessing({
				taskStage: "start"
			}).done();
			that.bIsRequestRunning = true;
			return oContext.service.codeValidationDAO.codeValidationResponseStatus()
				.then(function (oStatus) {
					var oRequestResult;
					return oContext.service.codeValidationDAO.validateWorkspaceContent(oWorkspaceConfig, aCurrentRequest).then(function (oValidationResults) {
						if (oValidationResults) {
							oRequestResult = oValidationResults;
							if (oRequestResult.result && oRequestResult.integrity && oRequestResult.integrity.status !== oStatus.ERROR) {
								that._handelIssuesReturns(oContext, aCurrentRequest, oRequestResult);
							} else {
								// something is wrong with the structure of the response,
								//or the integrity of the response is error - which means no importance to the validation content (if exists)
								oRequestResult.integrity.status = oStatus.ERROR;
							}
						} else {
							//oValidationResults is null or undefined
							oRequestResult.integrity.status = oStatus.ERROR;
						}
					}).fail(function () {
						oRequestResult.integrity.status = oStatus.ERROR;
					}).fin(function () {
						that.bIsRequestRunning = false;
						oContext.service.problemsViewValidation.context.event.fireProblemsLongRunningProcessing({
							taskStage: "end",
							taskIntegrity: {
								status: oRequestResult.integrity.status,
								info: undefined
							}
						}).done();
						return that._runNextQuedAction(oContext);
					});
				});
		},

		_handelIssuesReturns: function (oContext, aCurrentRequest, oRequestResult) {
			var that = this;
			var aProjectsIssues = [];
			var aProjectNames = [];
			var oValidationData = oRequestResult.result;
			_(aCurrentRequest).forEach(function (sProject) {
				var oProjectIssues = that._isolateSpecificProjectIssues(sProject, oValidationData);
				if (oProjectIssues) {
					aProjectsIssues.push(oProjectIssues);
					aProjectNames.push(sProject);
				}
			}).value();
			this.getCacheManager().addProjects(aProjectsIssues);
			this._fireIssuesUpdate(aProjectNames, oValidationData, oContext);
			this._reportIssuesFromServerToUsageMonitoring(oContext, oValidationData);
		},

		_reportIssuesFromServerToUsageMonitoring: function (oContext, oValidationData) {
			var that = this;
			setTimeout(function () {
				var issuesCounter = 0;
				var projectNames = [];
				if (oValidationData) {
					_.each(oValidationData, function (value, filePath) {
						issuesCounter += value.issues.length;
						var standardFilePath = that._getStandardPath(filePath);
						var projectName = standardFilePath.split("\\")[1];
						if (projectNames.indexOf(projectName) === -1) {
							projectNames.push(projectName);
						}
					});
				}
				if (projectNames.length > 1) {
					oContext.service.usagemonitoring.report("ProblemsView", "AnalyseMultipleProjects", issuesCounter).done();
				} else {
					oContext.service.usagemonitoring.report("ProblemsView", "Analyse", issuesCounter).done();
				}
			}, 0);
		},

		_getProjectIssuesFromServer: function (oContext, aProjects, bForceAnalyze) {
			var that = this;
			return oContext.service.basevalidator.getProjectsValidatorsConfiguration()
				.then(function (oWorkspaceConfig) {
					oWorkspaceConfig = that._replaceFioriValidatorWithJsValidator(oWorkspaceConfig);
					that._addProjectsToQueue(aProjects, oWorkspaceConfig, bForceAnalyze);
					if (that.getQueueManager().getSizeOfQueue() > 0) {
						return that._runNextQuedAction(oContext);
					}
				});
		},

		_getWorkspaceIssuesFromServer: function (oContext, bForceAnalyze) {
			var that = this;
			return oContext.service.basevalidator.getProjectsValidatorsConfiguration().then(function (oWorkspaceConfig) {
				oWorkspaceConfig = that._replaceFioriValidatorWithJsValidator(oWorkspaceConfig);
				var aAllProjects = _.keysIn(oWorkspaceConfig);
				that._addProjectsToQueue(aAllProjects, oWorkspaceConfig, bForceAnalyze);
				if (that.getQueueManager().getSizeOfQueue() > 0) {
					return that._runNextQuedAction(oContext);
				}
			});
		},

		_getStandardPath: function (sPath) {
			/* if sProjectName only has "\"s the same will be returned, else- all "\" will be replaced with "\" */
			return sPath.split("/").join("\\");
		},

		_isolateSpecificProjectIssues: function (sProjectName, oValidationResults) {
			if (!sProjectName || !oValidationResults) {
				return null;
			}
			var oProjectIssues = {projectName: sProjectName, projectData: {issues: {}}};
			var that = this;
			_.forEach(oValidationResults, function (value, key) {
				key = that._getStandardPath(key);
				var aKeyToParts = key.split("\\");
				if (aKeyToParts[1] == sProjectName) {
					oProjectIssues.projectData.issues[key] = value;
				}
			});
			return oProjectIssues;
		},

		_getProjectIssuesFromCache: function (oContext, aProjectNames) {
			var that = this;
			var oIssues = {};
			var aProjectsFromCache = this.getCacheManager().getProjects(aProjectNames);
			_(aProjectsFromCache).forEach(function (oProject) {
				oIssues = that._mergeIssues(oIssues, oProject.projectData.issues);
			}).value();
			return this._fireIssuesUpdate(aProjectNames, oIssues, oContext);
		},

		_mergeIssues: function (oIssueSet1, oIssueSet2) {
			var oNewIssueSet = {};
			_.forEach(oIssueSet1, function (value, key) {
				oNewIssueSet[key] = value;
			});
			_.forEach(oIssueSet2, function (value, key) {
				oNewIssueSet[key] = value;
			});
			return oNewIssueSet;
		},

		getIntegrityDictionary: function (oContext) {
			return oContext.service.codeValidationDAO.codeValidationResponseStatus()
				.then(function (oStatus) {
					return oStatus;
				}).fail(function (error) {
					oContext.service.log.error(oContext.service.self.getProxyMetadata().getName(), "failed to get integrity status dictionary from DAO", ["system"]).done();
				});
		},

		// workaround for 1.16 only
		_replaceFioriValidatorWithJsValidator: function (result) {
			var newProjectList = {};
			_.each(result, function (project, projectName) {
				if (project && _.isArray(project.js) && project.js.length > 0 && project.js[0].validator === "fioriJsValidator") {
					var rulesExt = {};
					_.each(project.js[0].validatorConfiguration.additionalRuleMetadata, function (value, key) {
						rulesExt[key] = value;
						var severity = value.severity ? value.severity.toLowerCase() : "warning";
						switch (severity) {
							case 'e':
								rulesExt[key].severity = "error";
								break;
							case 'w':
								rulesExt[key].severity = "warning";
								break;
							case 'i':
								rulesExt[key].severity = "info";
								break;
							default :
								rulesExt[key].severity = "warning";
						}
						rulesExt[key]["helpUrl"] = rulesExt[key]["help"];
					});
					var eslintConfig = {
						rules: project.js[0].validatorConfiguration.rules,
						globals: project.js[0].validatorConfiguration.globals,
						env: project.js[0].validatorConfiguration.env
					};
					project.js[0].validatorConfiguration["eslintConfig"] = eslintConfig;
					project.js[0].validatorConfiguration["rulesExt"] = rulesExt;
				}
				var newProjectName = projectName.substr(1);
				newProjectList[newProjectName] = project;
			});
			return newProjectList;
		},

		getQueueManager: function () {
			return _queue;
		},

		setQueueManager: function () {
			_queue = new queue();
		},

		getCacheManager: function () {
			return _cache;
		},

		setCacheManager: function () {
			_cache = new cache();
		},

		getSelectedProject: function () {
			return _sSelectedProject;
		}
	};
});