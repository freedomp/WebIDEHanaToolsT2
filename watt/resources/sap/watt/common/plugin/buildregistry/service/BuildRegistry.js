define([ ], function() {
	"use strict";
	return {

		_oBuildService : null,

		configure : function(mConfig) {
			mConfig.setBuild.forEach(function(mEntry){
				this._oBuildService = mEntry.service;
			}, this);
			
			//Listen to buildProgress event fired by the builder service. Then fire an event
			if (this._oBuildService) {
				this._oBuildService.attachEvent("buildProgress", this._fireBuildProgress, this);
			}
		},
		
		_fireBuildProgress : function(oEvent) {
			this.context.event.fireBuildProgress.apply(this, oEvent.params);
		},
		
		/**
		 * @memberOf sap.watt.common.plugin.build.service.BuildRegistry
		 */
		build : function(oDocument, oBuildOptions) {
			if (this._oBuildService) {
				return this._oBuildService.build(oDocument, oBuildOptions);
			} else {
			    this.context.service.log.error("BuildProvider","No build services are registered",[ "user" ]).done();
			}
		},

		/**
		 * @memberOf sap.watt.common.plugin.build.service.BuildRegistry
		 */
		setupBuild : function(sProjectName) {
			//TODO: Ugly hack. Remove once setup of build is moved to server side
			//if (this._oBuildService) {
			//	return this._oBuildService.setupBuild(sProjectName);
			//} else {
			//    this.context.service.log.error("BuildProvider","No build services are registered",[ "user" ]).done();
			//}
		}

	};
});
