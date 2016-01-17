define(["sap/watt/common/plugin/platform/service/ui/AbstractPart",
        "./NodejsRunnerTest", "./NodejsCoverageManager"
        ], function(AbstractPart, NodejsRunnerTest, NodejsCoverageManager) {

	"use strict";

	var oNodejsTestRunnerPart = AbstractPart.extend("sap.xs.nodejs.project.service.runner.NodejsTestRunnerPart", {

		_oView: undefined,
		_sUri: undefined,
		_oCoverageManager : undefined,

		configure: function configure(config) {

			var that = this;

			this.context.service.nodejsLauncher.attachEvent("projectStarted", function(oRunner) {
				if (oRunner.params.runnerEnvironment === NodejsRunnerTest.ID) {
					that._initTest(oRunner.params);
				}
			}, this);

			// test results are available
			this.context.service.nodejsLauncher.attachEvent("applicationRunning", function(oRunner) {
				if (oRunner.params.runnerEnvironment === NodejsRunnerTest.ID && oRunner.params.webUri) {
					that._runTest(oRunner.params);
				}
			}, this);

			this.context.service.nodejsLauncher.attachEvent("runnerStopped", function(oRunner) {
				if (oRunner.params.runnerEnvironment === NodejsRunnerTest.ID) {
					that._stopTest(oRunner.params);
				}
			}, this);

			return AbstractPart.prototype.configure.apply(this, arguments).done();
		},

		_initTest: function(params) {

			var that = this;

			// show part
			this.setVisible(true).then(function() {
				var oController = that._oView.getController();
				oController.initTest(params.projectPath, params.creationTime);
			});
		},

		_runTest: function(params) {

			var oController = this._oView.getController();
			var sId = oController.getTestRunIndexId(params.projectPath, params.creationTime);

			oController.runTest(sId, params.webUri);
		},

		_stopTest: function(params) {

			var oController = this._oView.getController();
			var sId = oController.getTestRunIndexId(params.projectPath, params.creationTime);

			oController.stopTest(sId, params.status.status);
		},

		_createView: function(oPart) {
			var oView = sap.ui.view({
				viewName: "sap.xs.nodejs.project.view.NodejsTestRunner",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: oPart
			});

			this.context.i18n.applyTo(oView); // set i18n model to view

			return oView;
		},

		getContent: function getContent() {
			var that = this;
			var aStyles = [{
				"uri": "sap.xs.nodejs.project/css/nodejsProject.css"
			}];
			this.context.service.resource.includeStyles(aStyles).done();

			if (!this._oView) {
				this._oView = this._createView(this);

				return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
					return that._oView;
				});
			}

			return this._oView;
		},

		setVisible: function(bVisible) {

			var that = this;

			if(!this._oCoverageManager ) {
				this._oCoverageManager = new NodejsCoverageManager(this.context);
			}

			return AbstractPart.prototype.setVisible.apply(this, arguments).then(function() {
				if( bVisible ) { // TODO do only once
					that._oView.getController()._setCoverageManager(that._oCoverageManager);
				}
				that._oView.getController().onPartVisible(bVisible);
			});
		}
	});

	return oNodejsTestRunnerPart;
});
