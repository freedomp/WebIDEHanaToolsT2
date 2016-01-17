define(["./BaseNodejsRunner"], function(BaseNodejsRunner) {
	"use strict";

	var sRunnerTypeId = "system:/sap.nodejs.test/default";
	var sRunnerId = "sap.xs.nodejs.project.nodejsTestRunner";

	/**
	 * Constructs new instance.
	 *
	 * @public
	 * @constructor
	 */
	var NodejsRunnerTest = function() {
		BaseNodejsRunner.call(this, sRunnerId, sRunnerTypeId);
		return this;
	};

	NodejsRunnerTest.prototype = Object.create(BaseNodejsRunner.prototype);

	NodejsRunnerTest.prototype.isConfigurationValid = function(oConfiguration, oDocument) {
		return Q(!!oConfiguration.filePath && !!oConfiguration.projectPath);
	};

	NodejsRunnerTest.prototype.createDefaultConfiguration = function(oDocument, isRunConfigurationFlow, sWindowId) {
		// call super method
		return BaseNodejsRunner.prototype.createDefaultConfiguration.apply(this, arguments).then(function(oConfig) {
			oConfig.testPattern = "*Test";
			return oConfig;
		});
	};

	NodejsRunnerTest.prototype.getConfigurationUi = function(oDocument) {
		var that = this;

		return {
			model: new sap.ui.model.json.JSONModel({}),
			// Get UI content for Local installation Web IDE - don't add the advenced settings tab
			_getContentLocal: function(oDocument1) {
				// --------- General grid ---------
				var oGeneralGrid = new sap.ui.layout.Grid({
					hSpacing: 0,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});

				var testPatternUI = sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsTestRunPatternConfiguration", that);
				that.context.i18n.applyTo(testPatternUI);
				testPatternUI.forEach(function(ui) {
					oGeneralGrid.addContent(ui);
				});

				var argumentsUI = sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsRunConfigurationArguments");
				that.context.i18n.applyTo(argumentsUI);
				argumentsUI.forEach(function(ui) {
					oGeneralGrid.addContent(ui);
				});

				var debugUI = sap.ui.jsfragment("sap.xs.nodejs.project.view.NodejsRunConfigurationDebug");
				that.context.i18n.applyTo(debugUI);
				debugUI.forEach(function(ui) {
					oGeneralGrid.addContent(ui);
				});

				// --------- Add grids to the main tabs UI ---------
				var aRunnerUI = [{
					name: that.context.i18n.getText("i18n", "BaseNodejsRunner.general_xtit"),
					content: oGeneralGrid
				}];
				return Q.resolve(aRunnerUI);
			},

			getContent: function() {
				return this._getContentLocal(oDocument);
			},

			setConfiguration: function(configuration) {
				this.model.setData(configuration);
			},

			getConfiguration: function() {
				return this.model.getData();
			}
		};
	};

	NodejsRunnerTest.ID = sRunnerTypeId;

	return NodejsRunnerTest;
});
