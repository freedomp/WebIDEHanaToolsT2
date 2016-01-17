define([ ], function() {
	"use strict";
	return {

		_oRunService : null,

		configure : function(mConfig) {
			mConfig.setRun.forEach(function(mEntry){
				this._oRunService = mEntry.service;
			}, this);
			
			//Listen to runProgress event fired by the run service. Then fire an event
			if (this._oRunService) {
				this._oRunService.attachEvent("runProgress", this._fireRunProgress, this);
			}
		},
		
		_fireRunProgress : function(oEvent) {
			//this.context.event.fireRunProgress.apply(this, oEvent.params);
			this.context.event.fireRunProgress(oEvent.params);
		},
		
		/**
		 * @memberOf sap.watt.common.plugin.run.service.RunRegistry
		 */
		run : function (oDocument, oRunBody) {
			var that = this;
			if (this._oRunService) {
				return this._oRunService.run(oDocument, oRunBody);
			} else {
				return oDocument.getProject().then(function(oProject) {
					var sProjectId = oProject.getEntity().getName();
					that.context.service.log.error(sProjectId, that.context.i18n.getText("i18n", "error_runservice"),[ "run" ]).done();
				});
			}
		},
		
		getProcesses: function(oDocument) {
			var that = this;
		    if (this._oRunService) {
				return this._oRunService.getProcesses(oDocument);
			} else {
				return oDocument.getProject().then(function(oProject) {
					var sProjectId = oProject.getEntity().getName();
					that.context.service.log.error(sProjectId,that.context.i18n.getText("i18n","error_getProcessesService"),[ "run" ]).done();
				});
			}
		},
		
		stop: function(sRunId, sProjectId) {
		    if (this._oRunService) {
				return this._oRunService.stop(sRunId, sProjectId);
			} else {
			    this.context.service.log.error(sProjectId, this.context.i18n.getText("i18n","error_stopRunService"),[ "run" ]).done();
			}
		},
		
		/**
		 * @memberOf sap.watt.common.plugin.run.service.RunRegistry
		 */
		refresh : function (oDocument, oRefreshBody) {
			var that = this;
			if (this._oRunService) {
				return this._oRunService.refresh(oDocument, oRefreshBody);
			} else {
				return oDocument.getProject().then(function(oProject) {
					var sProjectId = oProject.getEntity().getName();
					that.context.service.log.error(sProjectId,this.context.i18n.getText("i18n","error_refreshService"),[ "run" ]).done();
				});
			}
		}

	};
});