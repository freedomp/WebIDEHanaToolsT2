(function() {

	"use strict";

	jQuery.sap.require("sap.ui.core.format.DateFormat");

	sap.ui.controller("sap.xs.nodejs.project.view.NodejsTestRunner", {

		_MAX_NUMBER_TEST_RESULTS: 15,

		_TEST_RESULTS_FOLDER: ".testresults",
		_TEST_RESULT_PREFIX: "testresult_",

		_runStateInitial: "initial",
		_runStateRunning: "running",
		_runStatePending: "pending",
		_runStateFinished: "finished",
		_runStateFailed: "failed",

		_oDateFormat: sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern: "yyyyMMdd_HHmmss.SSS",
			UTC: true
		}),

		_refreshInterval: 3000, // ms
		_retryCounts: 1000, // 1000 x 3sec = 50min

		_isVisible: true, // is true since controller is instantiated when view
		// becomes visible

		_timeoutStatus: {},
		_oTestRuns: {},
		_oFailureIndex: {},

		_oTestRunDataModel: undefined,
		_oHistoryDataModel: undefined,
		_oCoverageDataModel: undefined,

		_oContext: undefined,

		_oCoverageManager: undefined,

		_logInfo: function _logInfo(message) {
			this._oContext.service.log.info(message, ["system"]).done();
			console.log(message);
		},

		_logError: function _logError(message) {
			this._oContext.service.log.error(message, ["system"]).done();
			console.error(message);
		},

		_setRefreshInterval: function(newInterval) {
			this._refreshInterval = newInterval;
		},

		onAfterRendering: function() {},

		_getTestRunDataModel: function() {
			if (!this._oTestRunDataModel) {
				this._oTestRunDataModel = new sap.ui.model.json.JSONModel();

				// let tree show more than 100 nodes
				this._oTestRunDataModel.setSizeLimit(1000);
			}

			return this._oTestRunDataModel;
		},

		_getHistoryDataModel: function() {
			if (!this._oHistoryDataModel) {
				this._oHistoryDataModel = new sap.ui.model.json.JSONModel();
			}

			return this._oHistoryDataModel;
		},

		_getCoverageDataModel: function() {
			if (!this._oCoverageDataModel) {
				this._oCoverageDataModel = new sap.ui.model.json.JSONModel();

				// let tree show more than 100 nodes
				this._oCoverageDataModel.setSizeLimit(1000);
			}

			return this._oCoverageDataModel;
		},

		onInit: function() {

			var that = this;

			this._oContext = this._getContext();

			var oView = this.getView();
			var oTestRunDataModel = this._getTestRunDataModel();
			var oHistoryDataModel = this._getHistoryDataModel();
			var oCoverageDataModel = this._getCoverageDataModel();
			oView.setModel(oTestRunDataModel, "data");
			oView.setModel(oHistoryDataModel, "history");
			oView.setModel(oCoverageDataModel, "coverage");

			return Q.spread([
					this._oContext.service.preferences.get("sap.xs.nodejs.project.view.NodejsTestRunner"),
					this._cleanTestFiles()
				],

				function(oPreferences, aTestRunsFiles) {

					var sIndex;
					var bCoverageVisible = false;

					if (oPreferences) {
						var oFailureIndex = oPreferences.failureIndex;
						if (oFailureIndex) {
							that._oFailureIndex = oFailureIndex;
						}

						sIndex = oPreferences.historyIndex;
						bCoverageVisible = oPreferences.coverageVisible || false;
					}

					that._fillHistoryModel(aTestRunsFiles);

					that._cleanFailureIndex(that._oTestRuns);

					if (!sIndex) {
						var aHistoryData = that._getHistoryDataModel().getData();
						if (aHistoryData.length > 0) {
							sIndex = aHistoryData[0].indexId;
						}
					}

					that._oCoverageManager.setCoverageVisible(bCoverageVisible);
					that.getView()._oCoverageCheckbox.setChecked(bCoverageVisible);

					// return that._restartLoad().then(function() {
					if (sIndex) {
						var oTestRun = that._getTestRun(sIndex);
						if (oTestRun) {
							that._oCoverageManager.setCoverage(oTestRun.projectPath);
						}
						that.showTestRun(sIndex);
					}
					// });
				}
			);
		},

		_getContext: function() {
			return this.getView()._getContext();
		},

		onPartVisible: function(bVisible) {

			this._isVisible = bVisible;

			if (bVisible) {
				for (var property in this._oTestRuns) {
					if (this._oTestRuns.hasOwnProperty(property)) {
						if (this._oTestRuns[property].status === this._runStateRunning) {
							this._loadStatus(property);
						}
					}
				}
			}
		},

		_startTimeoutRunner: function(sIndexId) {

			var that = this;

			if (this._timeoutStatus[sIndexId]) {
				this._timeoutStatus[sIndexId].retryCounter--;
				if (this._timeoutStatus[sIndexId].retryCounter <= 0) {
					this._logError("Too many retries for id: " + sIndexId);
					return;
				}
			}

			var timeOutHandle = setTimeout(function() {
				that._loadStatus(sIndexId);
			}, this._refreshInterval);

			if (this._timeoutStatus[sIndexId]) {
				this._timeoutStatus[sIndexId].timeOutHandle = timeOutHandle;

			} else {
				this._timeoutStatus[sIndexId] = {
					timeOutHandle: timeOutHandle,
					retryCounter: this._retryCounts
				};
			}
		},

		_stopTimeoutRunner: function(sIndexId) {
			clearTimeout(this._timeoutStatus[sIndexId].timeOutHandle);
		},

		getTestRunIndexId: function(sProjectPath, sCreationTime) {
			return sProjectPath + "/" + sCreationTime;
		},

		getTestRunId: function(sProjectPath, sCreationTime) {
			return sCreationTime;
		},

		initTest: function(sProjectPath, sCreationTime) {

			var sIndexId = this.getTestRunIndexId(sProjectPath, sCreationTime);
			var sId = this.getTestRunId(sProjectPath, sCreationTime);

			var oTestRun = {
				indexId: sIndexId,
				id: sId,
				timestamp: Number(sCreationTime),
				status: this._runStateInitial,
				projectPath: sProjectPath
			};

			this._oTestRuns[sIndexId] = oTestRun;
			this._saveTestRun(oTestRun);

			return this.showTestRun(sIndexId, oTestRun);
		},

		runTest: function(sIndexId, sWebUri) {

			if (!jQuery.sap.validateUrl(sWebUri)) {
				this._logError("invalid uri for running test: " + sWebUri);
				return Q();
			}

			var that = this;
			var oTestRun = this._getTestRun(sIndexId);

			if (oTestRun) {
				oTestRun.status = this._runStateRunning;
				oTestRun.webUri = sWebUri;

				return this._saveTestRun(oTestRun).then(function() {
					return that._startTimeoutRunner(sIndexId);
				});
			}

			return Q();
		},

		stopTest: function(sIndexId, sStatus) {

			var oTestRun = this._getTestRun(sIndexId);

			if (oTestRun) {
				oTestRun.status = sStatus;

				// return this._saveTestRun(oTestRun).then(function() {
				// return that._stopTimeoutRunner(sIndexId);
				// });
			}

			return Q();
		},

		_getTestRunsArray: function(oTestRuns) {
			var aTestRuns = [];

			for (var property in oTestRuns) {
				if (oTestRuns.hasOwnProperty(property)) {
					var oTestRun = oTestRuns[property];
					aTestRuns.push(oTestRun);
				}
			}

			aTestRuns.sort(function(a, b) {
				return b.timestamp - a.timestamp;
			});

			return aTestRuns;
		},

		_getTestRun: function(sIndexId) {
			return this._oTestRuns[sIndexId];
		},

		_saveTestRun: function(oTestRun, oServerTestResult) {

			var that = this;

			if (oServerTestResult) {
				if (this._oFailureIndex[oTestRun.indexId] !== oServerTestResult.report.failures) {
					this._oFailureIndex[oTestRun.indexId] = oServerTestResult.report.failures;
					this._saveFailureIndex(that._oFailureIndex);
				}
			}

			var sFileName = that._getTestRunFileName(oTestRun);

			return this._getTestRunsFolder(oTestRun.projectPath).then(function(oTestRunsFolder) {
				if (oTestRunsFolder) {

					var oResult = jQuery.extend({}, oTestRun, oServerTestResult); // clone

					delete oResult.indexId;
					delete oResult.projectRoot;
					delete oResult.projectPath;

					return that._oContext.service.filesystem.jsonProvider.writeJson(oResult, sFileName).then(function() {
						return that._cleanTestFiles().then(function(aTestRunFiles) {
							var aTestRuns = that._getTestRunsArray(that._oTestRuns);
							that._getHistoryDataModel().setData(aTestRuns);
						});

					}).fail(function(oError) {
						that._logError(oError.stack);
					});
				}
			});
		},

		_fillHistoryModel: function(aTestRunsFiles) {
			this._oTestRuns = this._fillTestRunsHistory(aTestRunsFiles);
			var aTestRuns = this._getTestRunsArray(this._oTestRuns);
			this._getHistoryDataModel().setData(aTestRuns);
		},

		_cleanTestFiles: function() {

			var that = this;

			return this._getTestRunsFiles().then(function(aTestRunsFiles) {
				aTestRunsFiles.sort(function(a, b) {
					var nTimestampA = that._getTimestampFromName(a.getEntity().getName());
					var nTimestampB = that._getTimestampFromName(b.getEntity().getName());

					return nTimestampB - nTimestampA;
				});

				for (var i = that._MAX_NUMBER_TEST_RESULTS; i < aTestRunsFiles.length; i++) {
					aTestRunsFiles[i].delete();
				}
				var aResult = aTestRunsFiles.slice(0, that._MAX_NUMBER_TEST_RESULTS);

				return Q(aResult);
			});
		},

		_cleanFailureIndex: function(oTestRuns) {

			var that = this;

			Object.keys(this._oFailureIndex).forEach(function(sIndexId) {
				if (!oTestRuns[sIndexId]) {
					delete that._oFailureIndex[sIndexId];
				}
			});
		},

		_getTestRunFileName: function(oTestRun) {

			var sTimeStamp = this._oDateFormat.format(new Date(oTestRun.timestamp));
			var sFileName = oTestRun.projectPath + "/" + this._TEST_RESULTS_FOLDER + "/" + this._TEST_RESULT_PREFIX + sTimeStamp + ".json";

			return sFileName;
		},

		_getTestRunsFolder: function(sProjectPath) {

			var that = this;

			return this._oContext.service.filesystem.documentProvider.getDocument(sProjectPath).then(function(oProjectFolder) {
				if (oProjectFolder) {
					return oProjectFolder.getChild(that._TEST_RESULTS_FOLDER).then(function(oTestRunsFolder) {
						if (oTestRunsFolder) {
							return Q(oTestRunsFolder);

						} else {
							return oProjectFolder.createFolder(that._TEST_RESULTS_FOLDER).then(function(oTestRunsFolderNew) {
								return Q(oTestRunsFolderNew);
							});
						}
					});

				} else {
					return Q();
				}
			});

		},

		_fillTestRunsHistory: function(aTestRunsFiles) {

			var that = this;
			var oTestRuns = {};

			aTestRunsFiles.forEach(function(oFile) {
				var oEntity = oFile.getEntity();

				var oTestRun = that._getTestRunFromEntity(oEntity);
				if (oTestRun) {
					oTestRuns[oTestRun.indexId] = oTestRun;
				}
			});

			return oTestRuns;
		},

		_getTestRunFromEntity: function(oEntity) {

			var sProjectPath = oEntity.getParentPath().replace("/" + this._TEST_RESULTS_FOLDER, "");
			var nTimestamp = this._getTimestampFromName(oEntity.getName());
			if (nTimestamp !== -1) {

				var sIndexId = this.getTestRunIndexId(sProjectPath, nTimestamp);
				var nFailures = this._oFailureIndex[sIndexId];

				var oTestRun = {
					indexId: sIndexId,
					timestamp: nTimestamp,
					status: this._runStateInitial,
					projectPath: sProjectPath,
					failures: nFailures
				};

				return oTestRun;
			}

			return null;
		},

		_getTimestampFromName: function(sName) {

			var aMatches = sName.match(/^testresult_(\d{8}_\d{6}\.\d{3})/i);
			if (aMatches && aMatches.length === 2 && aMatches[1]) {
				var oEntityDate = this._oDateFormat.parse(aMatches[1]);
				if (oEntityDate) {
					var nTime = oEntityDate.getTime();
					return nTime;
				}
			}

			return -1;
		},

		_getTestRunsFiles: function(sProjectPath) {

			var that = this;

			var sTestRunsFolderPath;
			if (sProjectPath) {
				sTestRunsFolderPath = sProjectPath + "/" + this._TEST_RESULTS_FOLDER;
			} else {
				sTestRunsFolderPath = "/";
			}

			return this._oContext.service.filesystem.documentProvider.search({
				bContentSearch: false,
				nStart: 0,
				nRows: 1000,
				sFileType: "*.json",
				sFolderName: sTestRunsFolderPath,
				sSearchTerm: that._TEST_RESULT_PREFIX + "*"
			}).then(function(oResult) {
				if (oResult && oResult.aFileEntries) {
					return Q(oResult.aFileEntries);
				} else {
					return Q([]);
				}
			}).fail(function(oError) {
				that._logError(oError.stack);
			});
		},

		_saveHistoryIndex: function(sIndexId) {

			var that = this;

			this._oContext.service.preferences.set({
					"historyIndex": sIndexId
				},
				"sap.xs.nodejs.project.view.NodejsTestRunner").fail(function(oError) {
				that._logError(oError.stack);
			});
		},

		_saveFailureIndex: function(idx) {

			var that = this;

			this._oContext.service.preferences.set({
					"failureIndex": idx
				},
				"sap.xs.nodejs.project.view.NodejsTestRunner").fail(function(oError) {
				that._logError(oError.stack);
			});
		},

		_saveCoverageVisiblePref: function(bVisible) {

			var that = this;

			this._oContext.service.preferences.set({
					"coverageVisible": bVisible
				},
				"sap.xs.nodejs.project.view.NodejsTestRunner").fail(function(oError) {
				that._logError(oError.stack);
			});
		},

		clearHistory: function() {

			var that = this;

			this._oTestRuns = {};
			this._oFailureIndex = {};

			this._oContext.service.preferences.remove("sap.xs.nodejs.project.view.NodejsTestRunner/historyIndex");
			this._oContext.service.preferences.remove("sap.xs.nodejs.project.view.NodejsTestRunner/failureIndex");

			return that._getTestRunsFiles().then(function(aTestRunsFiles) {
				aTestRunsFiles.forEach(function(oFile) {
					var oEntity = oFile.getEntity();
					if (oEntity.getType() === "file" && oEntity.getName().indexOf(that._TEST_RESULT_PREFIX) === 0) {
						oFile.delete();
					} else {
						that._logError({
							message: "Wrong file: " + oEntity.getName() + ", " + oEntity.getType()
						});
					}
				});

				// and trigger databinding
				that._getHistoryDataModel().setData(null);
				that._getTestRunDataModel().setData(null);
				that._oCoverageManager.setCoverage();

				that.getView()._oHistoryBox.setSelectedKey();
			});
		},

		showTestRun: function(sIndexId, oLocalTestRun) {

			var that = this;

			if (oLocalTestRun) {
				this._getTestRunDataModel().setData(oLocalTestRun);

				this.getView()._oHistoryBox.setSelectedKey(sIndexId);
				this._saveHistoryIndex(sIndexId);
				this.getView()._setStackValue();

				this._oCoverageManager.setCoverage(oLocalTestRun.projectPath, oLocalTestRun.coverage);

			} else {
				var oTestRun = this._getTestRun(sIndexId);
				if (oTestRun) {

					var sFullFileName = this._getTestRunFileName(oTestRun);

					var iIndex = sFullFileName.lastIndexOf("/");
					var sParentPath = sFullFileName.substring(0, iIndex);
					var sFileName = sFullFileName.substring(iIndex + 1);

					return this._oContext.service.filesystem.jsonProvider.readJson(sParentPath, sFileName, false).then(function(oTestRunFromFile) {

						if (oTestRunFromFile.report) {
							oTestRun.failures = oTestRunFromFile.report.failures;
							if (that._oFailureIndex[oTestRun.indexId] !== oTestRunFromFile.report.failures) {
								that._oFailureIndex[oTestRun.indexId] = oTestRunFromFile.report.failures;
								that._saveFailureIndex(that._oFailureIndex);
							}
						}

						oTestRunFromFile.projectPath = oTestRun.projectPath;
						oTestRunFromFile.indexId = oTestRun.indexId;
						that._getTestRunDataModel().setData(oTestRunFromFile);

						var aTestRuns = that._getTestRunsArray(that._oTestRuns);
						that._getHistoryDataModel().setData(aTestRuns);

						that.getView()._oHistoryBox.setSelectedKey(sIndexId);
						that._saveHistoryIndex(sIndexId);
						that.getView()._setStackValue();

						that._oCoverageManager.setCoverage(oTestRun.projectPath, oTestRunFromFile.coverage);

					}).fail(function(oError) {
						that._logError(oError.stack);
					});
				}
			}

			return Q();
		},

		_restartLoad: function() {

			var that = this;

			return jQuery.getJSON("/destinations/che/runner/processes").then(function(oResponse) {
				for (var i = 0; i < oResponse.length; i++) {
					if (oResponse[i].status === "RUNNING" &&
						oResponse[i].environmentId.match(/\/sap\.nodejs\.test\//gi)) {

						var sRunId = that.getTestRunIndexId(oResponse[i].project, oResponse[i].creationTime);
						var oTestRun = that._getTestRun(sRunId);

						if (!oTestRun || oTestRun.status !== that._runStateFinished || oTestRun.status !== that._runStateFailed) {

							oResponse[i].links.forEach(function(oLink) {
								if (oLink.rel === "web url") {
									that.initTest(oResponse[i].project, oResponse[i].creationTime);
									that.runTest(sRunId, oLink.href);
								}
							});
						}
					}
				}
			});
		},

		_loadStatus: function(sIndexId) {

			var that = this;

			this._stopTimeoutRunner(sIndexId);

			var oTestRun = that._getTestRun(sIndexId);
			if (oTestRun && this._isVisible) {

				var url = oTestRun.webUri + "/status";

				jQuery.getJSON(url).then(function(oResponse) {

					if (oTestRun.status === that._runStateRunning ||
						oTestRun.status === that._runStatePending) {

						oTestRun.projectRoot = oResponse.projectRoot;

						switch (oResponse.status) {
							case "finished":

								delete that._timeoutStatus[sIndexId];

								// just in case it returns and nobody is listening
								oTestRun.status = that._runStateFinished;

								// merge properties
								oTestRun.failures = oResponse.report.failures;

								that._saveTestRun(oTestRun, oResponse);

								oResponse.projectPath = oTestRun.projectPath;
								that.showTestRun(sIndexId, oResponse);
								break;

							case "pending":
							case "running":
								var oData = that._getTestRunDataModel().getData();
								oData.status = oResponse.status;
								that._getTestRunDataModel().setData(oData);

								that._startTimeoutRunner(sIndexId);

								break;

							default:
								// TODO handle
						}
					}

				}).fail(function(jqXHR, sTextStatus) {
					that._logError("Error fetching status from " + url + ", " + jqXHR.status + ", " + sTextStatus);
					that._startTimeoutRunner(sIndexId);
				});
			}
		},

		_setCoverageManager: function(oCoverageManager) {
			this._oCoverageManager = oCoverageManager;
			this._oCoverageManager._setDataModel(this._getCoverageDataModel());
		},

		_setCoverageVisible: function(bVisible) {
			this._oCoverageManager.setCoverageVisible(bVisible);
			this._saveCoverageVisiblePref(bVisible);
		}
	});
}());
