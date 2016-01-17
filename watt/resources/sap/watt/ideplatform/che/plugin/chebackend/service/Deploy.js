define(["../dao/Deploy", "../util/PathMapping"], function(oDeployDao, mPathMapping) {
	return {

		_i18n: undefined,
                _mWorkspace: mPathMapping.workspace,
		_builderNames: [],
		
		init: function() {
			var that = this;
			this._i18n = this.context.i18n;
			this.getDeployers().then(function(aBuilderNames) {
				that._builderNames = aBuilderNames;
			});
		},
                
		deploy: function(sPayload) {
                        return oDeployDao.doDeploy(this._mWorkspace.id,sPayload);
		},
                
		cancelDeploy: function(sDeployId) {
			var sWorkspaceId = this._mWorkspace.id;
			return oDeployDao.doCancelBuild(sWorkspaceId, sDeployId).done();
		},
		
		getDeployers: function() {
			var sWorkspaceId = this._mWorkspace.id;
			return oDeployDao.doGetBuilders(sWorkspaceId).then(function(aDeployers) {
				var aBuilderNames = _.map(aDeployers, function(oDeployer) {
					return oDeployer.name;
				});
				return aBuilderNames;
			});
		},
		
		_fireDeployProgress: function(oResponse) {
			this.context.event.fireBuildProgress([oResponse.taskId, oResponse.status]);
		},

		_waitForTask: function(oTask) {
			if (!oTask ) {
				return Q(oTask);
			}
			var deferred = Q.defer();
			this._notifyTaskHandled(oTask, deferred, oTask);
			return deferred.promise;
		},

		_notifyTaskHandled: function(oTask, deferred, prevTask) {
			var that = this;
			setTimeout(function() {
				return oDeployDao.getTask(oTask).then(function(oTaskResponse) {
					oTaskResponse.workspaceId = oTask.workspaceId;
					oTaskResponse.projectId = oTask.projectId;
					
					if (oTaskResponse.status === "IN_QUEUE") {
						if (oTaskResponse.status !== oTask.status) {
							that.context.service.log.info("build", that.context.i18n.getText("i18n", "chebuild_pending", [oTaskResponse.projectId]), ["user"]).done();
							that._fireBuildProgress(oTaskResponse);
						}
						return that._notifyTaskHandled(oTaskResponse, deferred, oTask);
					} else if (oTaskResponse.status === "IN_PROGRESS") {
						if (oTaskResponse.status !== oTask.status) {
							that.context.service.log.info("build", that.context.i18n.getText("i18n", "chebuild_inprogress"), ["user"]).done();
							that._fireBuildProgress(oTaskResponse);
						}
						return that._notifyTaskHandled(oTaskResponse, deferred, oTask);
					} else if (oTaskResponse.status === "SUCCESSFUL") {
						that.context.service.log.info("build", that.context.i18n.getText("i18n", "chebuild_succeeded", [oTaskResponse.projectId]), ["user"]).done();
						that._fireBuildProgress(oTaskResponse);
						deferred.resolve(oTaskResponse);
					} else if (oTaskResponse.status === "FAILED") {
						that.context.service.log.info("build", that.context.i18n.getText("i18n", "chebuild_failed", [oTaskResponse.projectId]), ["user"]).done();
						that._fireBuildProgress(oTaskResponse);
						deferred.reject(oTaskResponse);
					} else {
						deferred.resolve(oTaskResponse);
					}
				}).fail(function(oError) {
					//TODO: next line is comment out as it will throw exception because oTaskResponse is null, if require change to a different param (oTask)
					//that.context.service.log.info("build", that.context.i18n.getText("i18n", "chebuild_failed", [oTaskResponse.projectId]), ["user"]).done();
					that._fireBuildProgress(oError);
					deferred.reject(oError);
				});
			}, 2000);
		}
	};

});
