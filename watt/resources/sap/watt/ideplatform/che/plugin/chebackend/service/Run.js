define([ "../dao/Run", "../util/PathMapping" ], function(oRunDao, mPathMapping) {
	return {

		_i18n : undefined,
		_mWorkspace : mPathMapping.workspace,
		_cWebUrl : "web url",

		init : function() {
			var that = this;
			that._i18n = this.context.i18n;
		},

		run : function(oDocument, oRunBody) {
			var that = this;
			var sWorkspaceId = this._mWorkspace.id;
			var sProjectId = oDocument.getEntity().getFullPath();

			this.context.service.log.info(sProjectId, that.context.i18n.getText("i18n", "cherun_started"), [ "run" ])
					.done();
			return oRunDao.doRun(sWorkspaceId, sProjectId, oRunBody).then(function(oResponse) {
				//log initial status and fire event 
				if(oResponse){					
					that.context.service.log.info(oResponse.project, that.context.i18n.getText("i18n", "cherun_initialStatus",[oResponse.status]),
							[ "run" ]).done();
					that._fireRunProgress(oResponse);
				}
				//wait for final status of run
				return that._waitForRunStatus(oResponse).then(function(oStatusResponse) {
					return oStatusResponse;
				});
			}).fail(
				function(oError) {
					if (oError && oError.responseText) {
						that.context.service.log.error(sProjectId, oError.responseText, [ "run" ]).done();
					} else if (oError && oError.message) {
						that.context.service.log.error(sProjectId, oError.message, [ "run" ]).done();
					}
					that.context.service.log.info(sProjectId, that.context.i18n.getText("i18n", "cherun_failed", [ sProjectId ]),
							[ "run" ]).done();
					return Q.reject(oError);
				});
		},

		refresh : function(oDocument, oRefreshBody) {
			var that = this;
			var sWorkspaceId = this._mWorkspace.id;
			var sProjectId = oDocument.getEntity().getFullPath();

			this.context.service.log.info(sProjectId, that.context.i18n.getText("i18n", "cherefresh_started"), [ "run" ])
					.done();
			return oRunDao.doRefresh(sWorkspaceId, sProjectId, oRefreshBody).then(function(oResponse) {
				//log initial status and fire event 
				if(oResponse){					
					that.context.service.log.info(oResponse.project, that.context.i18n.getText("i18n", "cherefresh_initialStatus",[oResponse.status]),
							[ "run" ]).done();
					that._fireRunProgress(oResponse);
				}	
				//wait for final status of refresh
				return that._waitForRunStatus(oResponse).then(function(oStatusResponse) {
					return oStatusResponse;
				});
			}).fail(
				function(oError) {
					if (oError && oError.responseText) { 
						that.context.service.log.error(sProjectId, oError.responseText, [ "run" ]).done();
					} else if (oError && oError.message) {
						that.context.service.log.error(sProjectId, oError.message, [ "run" ]).done();
					}
					that.context.service.log.info(sProjectId, that.context.i18n.getText("i18n", "cherefresh_failed"),
							[ "run" ]).done();
					return Q.reject(oError);
				});
		},

		stop : function(sRunId, sProjectId) {
			var that = this;
			var sWorkspaceId = mPathMapping.workspace.id;
			return oRunDao.doStop(sWorkspaceId, sRunId).then(function(oResponse){
				if(oResponse ){
					that.context.service.log.info(sProjectId,
							that.context.i18n.getText("i18n", "cherun_stop"), [ "run" ]).done();
					oResponse.project = sProjectId;
					that._fireRunProgress(oResponse);
					//get server log
					that._getBELog(oResponse);
				}
				return oResponse;
			});			
		},

		getProcesses : function(oDocument) {
			var that = this;
			var sWorkspaceId = this._mWorkspace.id;
			var sProjectId = oDocument.getEntity().getFullPath();
			return oRunDao.getProcesses(sWorkspaceId, sProjectId).then(function(oResponse) {
				if (oResponse && oResponse.length > 1) {
					// sort the array in descending order
					return oResponse.sort(function(obj1, obj2) { 
						return obj2.processId - obj1.processId; });
				} else {
					return oResponse;	
				}
			}).fail(
				function(oError) {
					if (oError && oError.responseText) { 
						that.context.service.log.error(sProjectId, oError.responseText, [ "run" ]).done();
					} else if (oError && oError.message) {
						that.context.service.log.error(sProjectId, oError.message, [ "run" ]).done();
					}
					return Q.reject(oError);
				});
		},

		_fireRunProgress : function(oResponse) {
			if (oResponse){
				var oEventParams = {sProcessId: oResponse.processId, sStatus: oResponse.status, sProject: oResponse.project};
				this.context.event.fireRunProgress(oEventParams);
			}
		},
		
		/**
		 *Get log from sever side.
		 */
		_getBELog: function(oResponse) {
			var that = this;
			var sWorkspaceId = this._mWorkspace.id;
			var sProcessId = oResponse.processId;
			return oRunDao.getLog(sWorkspaceId, sProcessId).then(function(sResult) {
				if (sResult) {
					that.context.service.log.info(oResponse.project, sResult.toString(), ["run"]).done();
				}
			}).fail(function() {
				return null;
			});
		},

		/**
		 * Return a promise that resolves when the given run process terminates.
		 */
		_waitForRunStatus : function(oResponse) {
			if (!oResponse) {
				return Q(oResponse);
			}
			var deferred = Q.defer();
			this._notifyRunStatusHandled(oResponse, deferred, true);
			return deferred.promise;
		},

		_notifyRunStatusHandled : function(oResponse, deferred, bInitial) {
			var that = this;
			setTimeout(function() {
				return oRunDao.getStatus(oResponse).then(
						function(oStatusResponse) {

							if (oStatusResponse.status === "NEW") {
								if (bInitial && oStatusResponse.status !== oResponse.status) {
									that.context.service.log.info(oResponse.project, that.context.i18n.getText("i18n", "cherun_new"),
											[ "run" ]).done();
									that._fireRunProgress(oStatusResponse);
								}
								return that._notifyRunStatusHandled(oStatusResponse, deferred, false);
							} else if (oStatusResponse.status === "RUNNING") {
								that.context.service.log.info(oResponse.project,
										that.context.i18n.getText("i18n", "cherun_running"), [ "run" ]).done();
								that._fireRunProgress(oStatusResponse);
								//get server log
								that._getBELog(oStatusResponse);
								deferred.resolve(oStatusResponse);
							} else if (oStatusResponse.status === "FAILED") {
								that.context.service.log.info(oResponse.project,
										that.context.i18n.getText("i18n", "cherun_failed"), [ "run" ]).done();
								that._fireRunProgress(oStatusResponse);
								//get server log
								that._getBELog(oStatusResponse);
								deferred.reject(oStatusResponse);
							} else if (oStatusResponse.status === "STOPPED") {
								that.context.service.log.info(oResponse.project,
										that.context.i18n.getText("i18n", "cherun_stopped"), [ "run" ]).done();
								that._fireRunProgress(oStatusResponse);
								//get server log
								that._getBELog(oStatusResponse);
								deferred.reject(oStatusResponse);
							} else if (oStatusResponse.status === "CANCELLED") {
								that.context.service.log.info(oResponse.project,
										that.context.i18n.getText("i18n", "cherun_cancelled"), [ "run" ]).done();
								that._fireRunProgress(oStatusResponse);
								//get server log
								that._getBELog(oStatusResponse);
								deferred.reject(oStatusResponse);
							} else {
								deferred.resolve(oStatusResponse);
							}
						}).fail(
						function(oError) {
							that.context.service.log.info(oResponse.project,
									that.context.i18n.getText("i18n", "cherun_failed"), [ "run" ]).done();
							that._fireRunProgress(oError);
							that._getBELog(oResponse);
							deferred.reject(oError);
						});
			}, 2000);
		}

	};

});