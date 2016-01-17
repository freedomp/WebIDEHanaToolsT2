define(["sap/watt/common/plugin/platform/service/ui/AbstractPart", "sap/watt/lib/lodash/lodash"], function(AbstractPart, _) {
	"use strict";

	var ProblemsView = AbstractPart.extend("sap.watt.common.plugin.problemsView.service.ProblemsView", {

		_longRunningTask : {
			problemStage: undefined,
			progressBarID: undefined,
			integrityStatus: undefined,
			integrityInfo : undefined
		},

		_pvVisible: false, // needed because of bug 1580096327

		configure: function(mConfig) {},

		init: function() {
			var aStyles = [{
				uri: "sap/watt/saptoolsets/fiori/problemsView/css/problemsView.css"
			}];
			this._oView = sap.ui.view("ProblemsView", {
				viewName: "sap.watt.saptoolsets.fiori.problemsView.view.ProblemsView",
				type: sap.ui.core.mvc.ViewType.XML
			});
			this.context.i18n.applyTo(this._oView);
			this.context.self.attachEvent('visibilityChanged', this._onVisibilityChanged, this);
			this._oView.getController().setWebIdeContext(this.context);
			return this.context.service.resource.includeStyles(aStyles);
		},

		isLongRunningTaskExecuting : function(){
			return this._longRunningTaskID;
		},

		activateProblemsViewEffectOnOthers: function(enable){
			var that = this;
			if (enable){
				//start a new progress bar ONLY if: no progress already running, problems processing task started, the problems view is visible in the UI
				if (this._longRunningTask.progressBarID===undefined && this._longRunningTask.problemStage==="start"){
					var oPerspectiveService = this.context.service.perspective;
					oPerspectiveService.getCurrentPerspective()
						.then(function(sPerspectiveName){
							if (sPerspectiveName === "development" && that._pvVisible) {
								that.context.service.progress.startTask("Code-validation processing", "Validating code in the background")
									.then(function(sGeneratedTaskId){
										that._longRunningTask.progressBarID=sGeneratedTaskId;
										that.context.service.usernotification.liteInfo( that.context.i18n.getText("problemView_longTask_start",["user"])).done();
									}).done();
							}
						}).done();
				}
			} else {
				//stop a running progress bar
				if (this._longRunningTask.progressBarID) {
					this.context.service.progress.stopTask(this._longRunningTask.progressBarID)
						.then(function(){
							that._longRunningTask.progressBarID = undefined;
						}).done();
					if (that._longRunningTask.problemStage ==="end"){
						this._liteInfoToEndUser(that._longRunningTask.integrityStatus);
						//that.context.service.usernotification.liteInfo( that.context.i18n.getText("problemView_longTask_good_end",["user"])).done();
					}
				}

			}
		},

		onWaitingForLongRunningProblemsCalc: function(oEvent){
			var stage= oEvent.params.taskStage;
			if (stage ==="end"){
				//task ended
				this._longRunningTask.problemStage="end";
				this._longRunningTask.integrityStatus = oEvent.params.taskIntegrity.status;
				this._longRunningTask.integrityInfo = oEvent.params.taskIntegrity.info;
				this.activateProblemsViewEffectOnOthers(false);
			} else if (stage ==="start"){
				//new task started
				this._longRunningTask.problemStage="start";
				this.activateProblemsViewEffectOnOthers(true);
			}
		},

		getContent: function() {
			return this._oView;
		},

		getFocusElement: function() {
			return this.getContent();
		},

		onProblemsUpdate: function(oEvent) {
			var domain = oEvent.params.domain;
			var problems = oEvent.params.problems;
			this._oView.getController().setProblems(domain,problems);
		},

		onProblemsDelete: function(oEvent) {
			var aIDs = oEvent.params.IDs;
			var domain = oEvent.params.domain;
			this._oView.getController().clearProblems(domain, aIDs);
		},

		onTitleUpdate: function(oEvent) {
			var sTitle = oEvent.params.title;
			this._oView.getController().setTitle(sTitle);
		},

		onTitleDelete: function(oEvent) {
			this._oView.getController().clearTitle();
		},

		onTabClosed: function(oEvent) {
			//TODO: handle according to provider\document
			//could the event be fired after new tabs results already set (which may lead to unwanted behavior)?
			this._oView.getController().setProblems([]);
		},

		_onVisibilityChanged: function (oEvent) {
			if (oEvent.source.getProxyMetadata().getName() === this.context.service.problemsView.getProxyMetadata().getName()){
				this._pvVisible = oEvent.params.visible;
				this.activateProblemsViewEffectOnOthers(this._pvVisible);
				this.context.event.fireProblemsViewVisibilityChanged({
					visible: this._pvVisible
				}).done();
			}
		},

		_liteInfoToEndUser: function(sStatus) {
		 	var that = this;
			this.context.service.problemsViewValidation.problemsProcessingIntegrityStatus()
				.then(function(oIntegrityStatus){
					var values = {};
					values[oIntegrityStatus.OK] = function(){
						return that.context.i18n.getText("problemView_longTask_good_end",["user"]);
					};
					values[oIntegrityStatus.ERROR] = function(){
						return that.context.i18n.getText("problemView_longTask_error_end",["user"]);
					};
					values[oIntegrityStatus.PARTIAL_ERROR] = function(){
						return that.context.i18n.getText("problemView_longTask_partial_error_end",["user"]);
					};
					if (typeof values[sStatus]!= 'function' ) {
						that.context.service.log.error(that.context.service.problemsView.getProxyMetadata().getName(), "wrong integrity value sent by long running Task event", ["system"]).done();
					} else {
						that.context.service.usernotification.liteInfo( values[sStatus].call(that)).done();
					}
				}).fail(function(o){
					var x =3;
				});

		}
	});

	return ProblemsView;
});