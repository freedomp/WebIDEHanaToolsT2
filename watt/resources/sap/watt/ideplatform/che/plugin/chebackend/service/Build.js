define(["../dao/Build", "../util/PathMapping"], function (oBuildDao, mPathMapping) {
	"use strict";
	return {

		_i18n: undefined,
		_mWorkspace: mPathMapping.workspace,
		_builderNames: [],
		_project: undefined,
		_maxAttempts: 15,


		init: function () {
			var that = this;
			this._i18n = this.context.i18n;
			this.getBuilders().then(function (aBuilderNames) {
				that._builderNames = aBuilderNames;
			});
		},

		setupBuild: function (sProjectName) {
			//TODO: Ugly hack. Remove once setup of build is moved to server side
			//return oBuildDao.doSetupBuild(sProjectName, this._mWorkspace.id);
		},

		build: function (oDocument, oBuildOptions) {
			var that = this;
			var sWorkspaceId = this._mWorkspace.id;
			var bIsProject = oDocument.isProject();
			if (!bIsProject) {
				throw new Error(this.context.i18n.getText("i18n", "chebuild_failed_not_a_project"));
			}
			var sProjectId = oDocument.getEntity().getFullPath();
			that._project = sProjectId;
			return oBuildDao.doBuild(sWorkspaceId, sProjectId, oBuildOptions).then(
				function (oTask) {
					oTask.workspaceId = sWorkspaceId;
					oTask.projectId = sProjectId;
					return that._waitForTask(oTask).then(function (oResponse) {
						return oTask.taskId;
					});

				}).fail(function (oError) {
					if (oError && oError.responseJSON && oError.responseJSON.message) {
						oError = new Error(oError.responseJSON.message);
					} else if (oError && !oError.message) {
						oError = new Error(that.context.i18n.getText("i18n", "chebuild_failed_see_console_logs"));
					}
					throw oError;
				}
			);
		},

		getBuilders: function () {
			var sWorkspaceId = this._mWorkspace.id;
			return oBuildDao.doGetBuilders(sWorkspaceId).then(function (aBuilders) {
				var aBuilderNames = _.map(aBuilders, function (oBuilder) {
					return oBuilder.name;
				});
				return aBuilderNames;
			});
		},

		_fireBuildProgress: function (oResponse) {
			this.context.event.fireBuildProgress([oResponse.taskId, oResponse.status]);
		},

		_waitForTask: function (oTask) {
			if (!oTask) {
				return Q(oTask);
			}
			var deferred = Q.defer();
			this._notifyTaskHandled(oTask, deferred, oTask);
			return deferred.promise;
		},

		_prettyPrintDIBuilderLog: function (sLogContent, projectId) {
			var EOL = "\n"; //end of line
			var sBuildLogBlock = this.context.i18n.getText("i18n", "chebuild_printing_build_log", [projectId]) + EOL + sLogContent + EOL + this.context.i18n.getText("i18n", "chebuild_end_of_build_log", [projectId]);
			return this.context.service.log.info("DIBuild", sBuildLogBlock, ["user"]);
		},

		_notifyTaskHandled: function (oTask, deferred, prevTask) {
			var that = this;
			setTimeout(function () {
				return oBuildDao.getTaskStatus(oTask).then(function (oTaskResponse) {
					oTaskResponse.workspaceId = oTask.workspaceId;
					oTaskResponse.projectId = oTask.projectId;

					if (oTaskResponse.status === "IN_QUEUE") {
						if (oTaskResponse.status !== oTask.status) {
							that.context.service.log.info("DIBuild", that.context.i18n.getText("i18n", "chebuild_pending", [oTaskResponse.projectId]), ["user"]).done();
							that._fireBuildProgress(oTaskResponse);
						}
						return that._notifyTaskHandled(oTaskResponse, deferred, oTask);
					} else if (oTaskResponse.status === "IN_PROGRESS") {
						if (oTaskResponse.status !== oTask.status) {
							that.context.service.log.info("DIBuild", that.context.i18n.getText("i18n", "chebuild_inprogress", [oTaskResponse.projectId]), ["user"]).done();
							that._fireBuildProgress(oTaskResponse);
						}
						return that._notifyTaskHandled(oTaskResponse, deferred, oTask);
					} else if (oTaskResponse.status === "SUCCESSFUL") {
						var projectId = oTaskResponse.projectId;
						var downloadAllLink = oBuildDao._getDownloadAllLink(oTask);
						oBuildDao.getTaskLog(oTask).then(function (oTaskResponse) {
							return that._prettyPrintDIBuilderLog(oTaskResponse.toString(), projectId).then(function () {
								if (downloadAllLink) {
									return that.context.service.log.info("DIBuild", that.context.i18n.getText("i18n", "chebuild_download_all", [downloadAllLink]), ["user"]).done();
								}
							});
						}).done();
						that._fireBuildProgress(oTaskResponse);
						deferred.resolve(oTaskResponse);
					} else if (oTaskResponse.status === "FAILED") {
						projectId = oTaskResponse.projectId;
						oBuildDao.getTaskLog(oTask).then(function (oTaskResponse) {
							return that._prettyPrintDIBuilderLog(oTaskResponse.toString(), projectId);
						}).done();
						that._fireBuildProgress(oTaskResponse);
						deferred.reject(oTaskResponse);
					} else {
						deferred.resolve(oTaskResponse);
					}
				}).fail(function (oError) {
					while (that._maxAttempts > 0) {
						that._maxAttempts--;
						if (oTask && oTask.taskId) {
							return that._notifyTaskHandled(oTask, deferred, oError);
						} else {
							break;
						}
					}
					that._fireBuildProgress(oError);
					deferred.reject(oError);
				});
			}, 2000);
		}
	};

});
