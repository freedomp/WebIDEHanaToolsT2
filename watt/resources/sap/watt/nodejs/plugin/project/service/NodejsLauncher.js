define(["./UriUtil"], function(UriUtil) {
	"use strict";
	var _instance = null;

	/**
	 * Constructs new instance.
	 *
	 * @public
	 * @constructor
	 */
	var NodejsLauncher = function() {
		if (!_instance) {
			_instance = this;
			this._oUriUtil = new UriUtil();
		}
		return _instance;
	};

	NodejsLauncher.prototype.configure = function(oConfiguration) {
		// on HCP/Orion dependencies are not fulfilled, be graceful here
		if (this.context.service) {
			this.context.service.chebackend.run.attachEvent("runProgress", this._onRunProgress, this);
		}
	};

	/**
	 * Makes sure this launcher has at least once fetched the runners
	 *
	 * @returns {object} a promise for map of runners
	 */
	NodejsLauncher.prototype._getRunners = function() {
		var deferred = Q.defer();

		var that = this;
		this._oUriUtil.createServiceUri("/runner/processes").then(function(sUri) {
			jQuery.ajax({
			    url: sUri,
			    type: "GET"
			}).done(function(aRunnerStates) {
				var mRunnerStatus;
				var mRunner;
				var mRunnersById = {};
				for (var i = 0; i < aRunnerStates.length; i++) {
					mRunnerStatus = aRunnerStates[i];
					if (mRunnerStatus.status === "NEW" || mRunnerStatus.status === "RUNNING") {
						mRunner = that._createRunner(mRunnerStatus);
						mRunnersById[mRunner.processId] = mRunner;
					}
				}
				deferred.resolve(mRunnersById);
			}).fail(function(jqXHR) {
				var sMessage = "Status: " + jqXHR.status + " - " + jqXHR.statusText + ":\n" + jqXHR.responseText;
				deferred.reject(sMessage);
			});
		}).fail(function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
	};

	NodejsLauncher.prototype._readRunnerStatusById = function(sId) {
		var deferred = Q.defer();
		this._oUriUtil.createServiceUri("/runner/{{workspaceId}}/status/" + sId).then(function(sUri) {
			jQuery.ajax({
			    url: sUri,
			    type: "GET"
			}).done(function(mRunnerStatus) {
				if (mRunnerStatus) {
					deferred.resolve(mRunnerStatus);
				} else {
					deferred.reject("Reading runner status failed: " + sUri);
				}
			}).fail(function(jqXHR) {
				var sMessage = "Status: " + jqXHR.status + " - " + jqXHR.statusText + ":\n" + jqXHR.responseText;
				deferred.reject(sMessage);
			});
		}).fail(function(error) {
			deferred.reject(error);
		}).done();
		return deferred.promise;
	};

	NodejsLauncher.prototype._onRunProgress = function(oRunProgress) {
		var sTaskId = oRunProgress.params.sProcessId;
		if (sTaskId) {
			var sRunStatus = oRunProgress.params.sStatus;
			var mRunner;
			var that = this;
			this._readRunnerStatusById(sTaskId).then(function(mRunnerStatus) {
				mRunner = that._createRunner(mRunnerStatus);
				switch (sRunStatus) {
				case "NEW":
					that.context.event.fireProjectStarted(mRunner).done();
					break;
				case "RUNNING":
					that.context.event.fireApplicationRunning(mRunner).done();
					break;
				case "STOPPED":
				case "CANCELLED":
				case "FAILED":
					that._removeRunner(mRunner);
					break;
				}
			}).done();
		}
	};

	/**
	 * Creates and returns a run configuration with the given parameters.
	 *
	 * @public
	 * @param {String} sProjectPath the project path
	 * @param {String} sFilePath path of main file
	 * @param {String} sArguments additional arguments that will be passed to Node.js application
	 * @returns {Object} a configuration
	 */
	NodejsLauncher.prototype.createConfiguration = function(sProjectPath, sFilePath, sArguments) {
		return {
		    projectPath: sProjectPath,
		    filePath: sFilePath,
		    arguments: sArguments || "",
		    debug: {
		        enabled: false,
		        breakOnFirstStatement: false
		    },
		    build: {
			    skip: false
		    },
		    runAction: "restart"
		};
	};

	/**
	 * Returns map with project paths to an array of runners for this project.
	 *
	 * @public
	 * @returns {object} a map with runners by project paths, maybe empty
	 */
	NodejsLauncher.prototype.getRunnersByProject = function() {
		// sort with descending creation time so that the latest is first
		var sortRunners = function(r1, r2) {
			return r2.creationTime - r1.creationTime;
		};

		var that = this;
		return this._getRunners().then(function(mRunnersById) {
			var mProjectRunners = {};
			for ( var sId in mRunnersById) {
				var mRunner = mRunnersById[sId];
				mProjectRunners[mRunner.projectPath] = mProjectRunners[mRunner.projectPath] || [];
				mProjectRunners[mRunner.projectPath].push(mRunner);
				mProjectRunners[mRunner.projectPath].sort(sortRunners);
			}
			return mProjectRunners;
		});
	};

	/**
	 * Extracts and returns the URI to be used by the debugger to attach
	 *
	 * @param {object} runner the runner object
	 * @returns {String} the debug URI
	 */
	NodejsLauncher.prototype.getDebugUri = function(runner) {
		return this._getDebugUri(runner.status.links);
	};

	NodejsLauncher.prototype._getDirtyItems = function(sProjectPath) {
		var deferred = Q.defer();
		this._oUriUtil.createServiceUri("/nodejs/{{workspaceId}}/dirtyItems?project=" + sProjectPath + "&clear=true").then(function(sUri) {
			jQuery.ajax({
			    url: sUri,
			    type: "GET"
			}).done(function(aDirtyItems) {
				deferred.resolve(aDirtyItems);
			}).fail(function(jqXHR) {
				var sMessage = "Status: " + jqXHR.status + " - " + jqXHR.statusText + ":\n" + jqXHR.responseText;
				deferred.reject(sMessage);
			});
		}).fail(function(error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};

	NodejsLauncher.prototype._isProjectDirty = function(aDirtyItems) {
		for (var i = 0; i < aDirtyItems.length; i++) {
			if (aDirtyItems[i].itemReference.name === "package.json") {
				return true;
			}
		}
		return false;
	};

	/**
	 * Starts a project with the given run configuration.
	 *
	 * @public
	 * @param {object} oConfiguration the run configuration
	 * @returns {Promise<void,string>} a promise
	 */
	NodejsLauncher.prototype.runProject = function(oConfiguration, sRunnerEnvironment) {
		var that = this;

		return Q.all([this.getRunnersByProject(), this._getDirtyItems(oConfiguration.projectPath)]).spread(
		        function(mRunnersByProject, aDirtyItems) {
			        return Q.all([that.context.service.document.getDocumentByPath(oConfiguration.projectPath), //
			        that._createPayload(oConfiguration, sRunnerEnvironment, mRunnersByProject, aDirtyItems), //
			        that._stopRunners(oConfiguration.projectPath, mRunnersByProject)]).spread(function(oDocument, oContent) {
				        if (oContent.doSoftReset) {
					        delete oContent.doSoftReset; // delete property to avoid serialization in HTTP request
					        return that.context.service.runRegistry.refresh(oDocument, oContent);
				        } else {
					        return that.context.service.runRegistry.run(oDocument, oContent);
				        }
			        }).then(function(mRunnerStatus) {
				        var mRunner = that._createRunner(mRunnerStatus);
				        return Q.resolve(mRunner);
			        }).fail(
			                function(oError) {
				                if (oError.links) {
					                var mRunnerStatus = oError;
					                var message = that.context.i18n.getText("run.failed_xmsg", [that._getStatusUri(mRunnerStatus.links),
					                        that._getLogsUri(mRunnerStatus.links)]);
					                that.context.service.log.error(message, ["user"]).done();
					                return Q.reject(message);
				                }
				                if (oError.message) {
					                that.context.service.log.error(oError.message, ["system"]).done();
				                } else {
					                that.context.service.log.error(oError, ["system"]).done();
				                }
				                return Q.reject(oError);
			                });
		        });
	};

	NodejsLauncher.prototype._stopRunners = function(sProjectPath, aRunnersByProject) {
		var that = this;
		var aRunners = aRunnersByProject[sProjectPath];
		if (aRunners) {
			// Q.allSettled executes all promises, even if one fails
			return Q.allSettled(aRunners.map(function(mRunner) {
				return that._removeRunner(mRunner);
			}));
		}
	};

	/**
	 * Creates runner metadata object.
	 *
	 * @private
	 * @param {Object} mRunnerStatus the runner status JSON response as object
	 * @returns {Object} the runner metadata
	 */
	NodejsLauncher.prototype._createRunner = function(mRunnerStatus) {
		var sStopUri = this._getStopUri(mRunnerStatus.links);
		var sStatusUri = this._getStatusUri(mRunnerStatus.links);
		var mRunner = {
		    creationTime: mRunnerStatus.creationTime,
		    processId: "" + mRunnerStatus.processId,
		    projectPath: mRunnerStatus.project,
		    status: mRunnerStatus,
		    statusUri: sStatusUri,
		    stopUri: sStopUri,
		    runnerEnvironment: mRunnerStatus.environmentId
		};

		mRunner.webUri = this._getOpenUri(mRunnerStatus.links);
		mRunner.logsUri = this._getLogsUri(mRunnerStatus.links);
		mRunner.instanceUri = this._getInstanceUri(mRunnerStatus.links);
		mRunner.debugUri = this._getDebugUri(mRunnerStatus.links);

		return mRunner;
	};

	/**
	 * Removes runner metadata from internal list and map.
	 *
	 * @private
	 * @param sProcessId runner's process identifier
	 */
	NodejsLauncher.prototype._removeRunner = function(mRunner) {
		if (mRunner) {
			this.context.event.fireRunnerStopped(mRunner).done();
		}
	};

	/**
	 * Creates the payload for the HTTP post request to run project.
	 *
	 * @private
	 * @param {object} oConfiguration run configuration
	 * @returns {object} a the run options
	 */
	NodejsLauncher.prototype._createPayload = function(oConfiguration, sRunnerEnvironment, mRunnersByProjectPath, aDirtyItems) {
		var oPayload = {
		    inDebugMode: oConfiguration.debug.enabled,
		    environmentId: sRunnerEnvironment || "system:/sap.nodejs/default",
		    skipBuild: false,
		    options: {},
		    shellOptions: {},
		    buildOptions: {
		        options: {},
		        builderName: "sap.nodejs"
		    }
		};
		oPayload.options["sap.nodejs.runner.clientOrigin"] = window.location.origin;
		if (oConfiguration.debug.enabled) {
			oPayload.options["sap.nodejs.runner.breakOnFirstStatement"] = oConfiguration.debug.breakOnFirstStatement;
		}
		if (oConfiguration.testPattern) {
			oPayload.options["sap.nodejs.runner.main"] = oConfiguration.testPattern;
		} else if (oConfiguration.filePath) {
			oPayload.options["sap.nodejs.runner.main"] = oConfiguration.filePath;
		}
		if (oConfiguration.arguments) {
			oPayload.options["sap.nodejs.runner.arguments"] = oConfiguration.arguments;
		}

		// get list of already available runners for current project
		var aRunners = mRunnersByProjectPath[oConfiguration.projectPath];

		var bDirty = this._isProjectDirty(aDirtyItems);

		// check if is runner is still running and is not canceled or stopped ...
		if (!bDirty && aRunners && aRunners.length > 0 && aRunners[0].status.status === "RUNNING"
		// ... and same runner environment is used
		&& aRunners[0].runnerEnvironment === oPayload.environmentId
		// check if runner was switched from debug mode in normal model or vice versa:
		// if it stays in same mode continue with "softReset", otherwise do restart
		&& !!aRunners[0].debugUri === oConfiguration.debug.enabled) {
			// provide softReset indicator to caller of this method
			oPayload.doSoftReset = true;
			oPayload.options["processId"] = aRunners[0].processId;
			// enables soft-reset in runner
			oPayload.options["runOption"] = "softReset";
			oPayload.skipBuild = true;
		}

		return Q.resolve(oPayload);
	};

	/**
	 * Extracts and returns the URI to get runner status from given array.
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} an URI to get runner status
	 */
	NodejsLauncher.prototype._getStatusUri = function(aLinks) {
		return this._fixUri(this._findUriByRelation(aLinks, "get status"));
	};

	/**
	 * Extracts and returns the URI to get runner status from given array.
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} an URI to get runner status
	 */
	NodejsLauncher.prototype._getStopUri = function(aLinks) {
		var sUri = this._findUriByRelation(aLinks, "stop");
		return this._fixUri(sUri);
	};

	/**
	 * Extracts and returns the URI to get runner status from given array.
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} an URI to get runner status
	 */
	NodejsLauncher.prototype._getOpenUri = function(aLinks) {
		return this._findUriByRelation(aLinks, "web url");
	};

	/**
	 * Extracts and returns the URI to the running instance
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} the instance URI
	 */
	NodejsLauncher.prototype._getInstanceUri = function(aLinks) {
		return this._findUriByRelation(aLinks, "instance url");
	};

	/**
	 * Extracts and returns the URI to be used by the debugger to attach
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} the debug URI
	 */
	NodejsLauncher.prototype._getDebugUri = function(aLinks) {
		return this._findUriByRelation(aLinks, "debug url");
	};

	/**
	 * Extracts and returns the URI to get runner console output from given array.
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @returns {String} an URI to get runner console output
	 */
	NodejsLauncher.prototype._getLogsUri = function(aLinks) {
		return this._fixUri(this._findUriByRelation(aLinks, "view logs"));
	};

	/**
	 * Extracts and returns the URI for the given relation
	 *
	 * @private
	 * @param {Array<Object>} aLinks an Array of links
	 * @param {String} sRel the relation to query
	 * @returns {String} the instance URI
	 */
	NodejsLauncher.prototype._findUriByRelation = function(aLinks, sRel) {
		var aWebLink = aLinks.filter(function(item) {
			return item.rel === sRel;
		});
		return (aWebLink && aWebLink.length > 0) ? aWebLink[0].href : null;
	};

	NodejsLauncher.prototype._fixUri = function(sUri) {
		if (sUri) {
			var oOrigURI = new URI(sUri);
			if (oOrigURI.hostname() === "localhost" && oOrigURI.port() === window.location.port) {
				return sUri;
			}
			var oForwardedURI = new URI(sUri);
			oForwardedURI.path('/che' + oOrigURI.path());
			oForwardedURI.port(window.location.port);
			oForwardedURI.hostname(window.location.hostname);
			return oForwardedURI.toString();
		}
		return sUri;
	};

	return NodejsLauncher;
});
