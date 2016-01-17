sap.ui.controller("sap.watt.ideplatform.plugin.run.view.RunConfigurations", {
	_oTreeModel: new sap.ui.model.json.JSONModel(),
	_oRunService: null,
	_oConfigurationHelperService: null,
	_deletedConfigurationIds: [],
	_oContext: null,
	_documentWindowsUtil: null,
	_runnerServices: {},
	_usageMonitoringService: null,

	onInit: function() {
		this._oContext = this.getView().getViewData().context;
		this._documentWindowsUtil = this.getView().getViewData().documentWindowsUtil;
		this._oRunService = this._oContext.service.run;
		this.aConfigurationsPerRunner = this.getView().getViewData().aConfigurationsPerRunner;
		this._oConfigurationHelperService = this._oContext.service.configurationhelper;
		this._oI18nService = this._oContext.i18n;
		this._vConfigurationIdWithIssues = this.getView().getViewData().configurationIdWithIssues;
		this._oRunConfigurationHistoryService = this._oContext.service.runconfigurationhistory;
		this._usageMonitoringService = this._oContext.service.usagemonitoring;
		this._init();
		this._oI18nService.applyTo(this.getView().oSplitterV);

		// splitter secondPane model
		var oData = {
			displayName: "",
			visible: true,
			issuesLabel: ""
		};
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);
		this.getView().setModel(oModel, "secondPane");
	},

	// initializes _oTreeModel
	// runs on controller initialization (onInit) 
	initModelData: function(aConfigurationsPerRunner) {
		var oTreeModel = {};
		oTreeModel.oRunners = [];
		this._oTreeModel.setData(oTreeModel);
		var that = this;
		_.forEach(aConfigurationsPerRunner, function(oConfigurationPerRunner) {
			var oRunner = oConfigurationPerRunner.runner;
			var oTreeModelRunner = that._createTreeModelRunner(oRunner);
			oTreeModel.oRunners.push(oTreeModelRunner);
			_.forEach(oConfigurationPerRunner.configurations, function(oConfiguration) {
				var oTreeModelConfiguration = that._createTreeModelConfiguration(oConfiguration);
				oTreeModelRunner.configs.push(oTreeModelConfiguration);
			});
		});
	},

	deleteConfiguration: function() {
		var that = this;
		var oSelectedConfiguration = this.getSelectedConfiguration();
		if (oSelectedConfiguration) {
			var configurationId = oSelectedConfiguration.id;
			var oTreeModelRunner = this.getSelectedRunner();
			_.remove(oTreeModelRunner.configs, function(config) {
				return config.id === configurationId;
			});
			this._deletedConfigurationIds.push(configurationId);
			this._oPreviouslySelectedConfigurationModel = null;
			this.getView().oRunConfigurationTree.updateNodes();
			this._selectRunnerNode();
			return this._oRunService.getSelectedDocument().then(function(oSelectedDocument) {
				if (oSelectedDocument) {
					return oSelectedDocument.getProject().then(function(oProjectDocument) {

						//write to usage monitoring
						that._usageMonitoringService.report("runConfiguration", "deleteConfiguration", oSelectedConfiguration.runnerId).done();
						that._hideEmptyRunnerNodes();
						var sProjectPath = oProjectDocument.getEntity().getFullPath();
						return that._oRunService.saveProjectSetting(null, null, sProjectPath);
					});
				}
			});
		}
		return Q();
	},

	addNewConfigurationToTreeAndSelectIt: function(oNewConfiguration) {
		this.addConfigurationToTree(oNewConfiguration);
		this.getView().oRunConfigurationTree.updateNodes();
		this.selectConfiguration(oNewConfiguration);
	},

	selectConfiguration: function(oConfiguration) {
		var oTreeConfigurationNode = this._getConfigurationNodeById(oConfiguration._metadata.id);
		oTreeConfigurationNode.select();
	},

	addConfigurationToTree: function(oConfiguration) {
		var oTreeModelRunner = this._getTreeModelRunnerById(oConfiguration._metadata.runnerId);
		var oTreeModelConfiguration = this._createTreeModelConfiguration(oConfiguration);
		_.remove(oTreeModelRunner.configs, function(oRunnerConfiguration) {
			return oRunnerConfiguration.id === oTreeModelConfiguration.id;
		});
		oTreeModelRunner.configs.push(oTreeModelConfiguration);
		return oTreeModelRunner.configs.length - 1;
	},

	getSelectedConfiguration: function() {
		var sPath = this._oContext.sPath;
		return this._oContext.getObject(sPath);
	},

	getSelectedRunner: function() {
		var sPath = this._oContext.sPath;
		var sRunnerPath = sPath.split("/configs")[0];
		return this._oContext.getObject(sRunnerPath);
	},

	selectNode: function(oEvent) {
		var that = this;
		var oTreeNode = oEvent.getParameter("node");
		this._oContext = oTreeNode.getBindingContext();
		var oSelectedTreeNodeModel = this._oContext.getProperty(this._oContext.sPath);
		var oRunButton = sap.ui.getCore().byId("runbtn_dialog");

		// this.getView().oTabStrip.setBusy(true);

		// a selected configuration node should not be colored red
		this._updateTreeNodesStyle();

		// a runner node is selected
		if (!oSelectedTreeNodeModel.runnerId) {
			this._oPreviouslySelectedConfigurationModel = undefined;
			// this.getView().oTabStrip.setBusy(false);
			oRunButton.setEnabled(false);
			that.getView().getModel("secondPane").setProperty("/visible", false);
		} else { // a configuration node is selected
			oTreeNode.removeStyleClass("runConfigurationNode");
			that.getView().getModel("secondPane").setProperty("/displayName", oSelectedTreeNodeModel.displayName);
			that.getView().getModel("secondPane").setProperty("/visible", true);
			// same configuration node should not be rendered twice on selection
			if (this._oPreviouslySelectedConfigurationModel && (oSelectedTreeNodeModel.id === this._oPreviouslySelectedConfigurationModel.id)) {
				// this.getView().oTabStrip.setBusy(false);
				return;
			}
			this._oPreviouslySelectedConfigurationModel = oSelectedTreeNodeModel;

			this.getView().oTabStrip.destroyTabs();
			this.getView().oTabStrip.removeAllTabs();
			var oTabStripModel = new sap.ui.model.json.JSONModel({});
			this.getView().oTabStrip.setModel(oTabStripModel);

			this._oRunService.getSelectedDocument().then(function(oSelectedDocument) {
				return that._getRunnerService(oSelectedTreeNodeModel.runnerId).getConfigurationUi(oSelectedDocument).then(function(oConfigurationUi) {
					return oConfigurationUi.getContent().then(function(aConfigurationUi) {
						oTabStripModel.setData(oSelectedTreeNodeModel.settings);
						for (var i = 0; i < aConfigurationUi.length; i++) {
							var oTab = aConfigurationUi[i];
							var oNewTab = new sap.ui.commons.Tab({
								tooltip: oTab.name,
								title: new sap.ui.core.Title({
									text: oTab.name
								}),
								content: oTab.content
							});
							that.getView().oTabStrip.addTab(oNewTab);
							oTab.content.attachEvent("ConfigurationValidationEvent", that._validateConfiguration, that);
						}
						// validate the selected configuration node
						that._validateConfiguration();
						// that.getView().oTabStrip.setBusy(false);
						oRunButton.setEnabled(true);
					});
				});
			}).done();
		}
	},

	/*
	 * add configuration button pressed - open a list with available runners
	 */
	addConfiguration: function(oEvent) {
		var that = this;
		var $source = oEvent.getSource().$();
		// Get available runners
		var aItems = [];
		var aRunners = this._oTreeModel.getData().oRunners;
		for (var i = 0; i < aRunners.length; i++) {
			var oRunner = aRunners[i];
			var item = new sap.ui.core.ListItem({
				text: oRunner.displayName,
				key: oRunner.sId
			});
			aItems.push(item);
		}

		// create list
		var oListBox = new sap.ui.commons.ListBox({
			width: "100%",
			items: aItems,
			select: function(oControlEvent) {
				oDialog.close();
				// Get selected runner and create a new configuration for the runner
				var sRunnerId = oControlEvent.getParameters().selectedItem.getKey();
				that._addConfiguration(sRunnerId);
			}
		});

		// display the list in a dialog under the create button
		var oDialog = new sap.ui.commons.Dialog({
			autoClose: true,
			resizable: false,
			width: "300px",
			content: [oListBox]
		});

		oDialog.addStyleClass("runConfigurationsTreeAddDialog");
		oDialog.open();
		oDialog.$().offset({
			top: $source.offset().top + $source.height() + 1,
			left: $source.offset().left
		});
	},

	// Create a new configuration for runner of type sRunnerId
	_addConfiguration: function(sRunnerId) {
		var that = this;
		// Get the runner object
		var aRunners = this._oTreeModel.getData().oRunners;
		for (var i = 0; i < aRunners.length; i++) {
			var oRunner = aRunners[i];
			var sCurrRunnerId = oRunner.sId;
			if (sCurrRunnerId === sRunnerId) {
				that._createNewConfiguration(oRunner);
				break;
			}
		}
	},

	_createNewConfiguration: function(oSelectedRunner) {
		var that = this;
		if (oSelectedRunner) {
			var otherVisibleRunnerNames = this._getOtherVisibleRunnerNames(true);
			// set New Configuration button disabled
			this._setControlEnabled(this.getView().oNewConfigurationButton, false);
			var tmpRunner = {};
			tmpRunner.oService = this._getRunnerService(oSelectedRunner.sId);
			tmpRunner.displayName = oSelectedRunner.displayName;
			tmpRunner.sId = oSelectedRunner.sId;

			this._oRunService.getSelectedDocument().then(function(oSelectedDocument) {
				return that._oConfigurationHelperService.createConfiguration(tmpRunner, oSelectedDocument, undefined, true, otherVisibleRunnerNames).then(
					function(oNewConfiguration) {
						that.addNewConfigurationToTreeAndSelectIt(oNewConfiguration);

						//write to usage monitoring
						that._usageMonitoringService.report("runConfiguration", "addConfiguration", oSelectedRunner.sId).done();
						that._hideEmptyRunnerNodes();
						// set New Configuration button enabled
						that._setControlEnabled(that.getView().oNewConfigurationButton, true);
						that.getView().oDisplayNameTextField.focus();
					});
			}).fail(function(_oError) {
				// set New Configuration button enabled
				that._setControlEnabled(that.getView().oNewConfigurationButton, true);
				that._selectRunnerNode();
			}).done();
		}
	},

	_setControlEnabled: function(oControl, isEnabled) {
		if (oControl && oControl.setEnabled) {
			oControl.setEnabled(isEnabled);
		}
	},

	_init: function() {
		this._deletedConfigurations = [];
		this.initModelData(this.aConfigurationsPerRunner);
		this.getView().oSplitterV.setModel(this._oTreeModel);
		this._hideEmptyRunnerNodes();
	},

	_getConfigurationNodeById: function(vConfigurationId) {
		var aRunnersTreeNodes = this.getView().oRunConfigurationTree.getNodes();
		if (_.isEmpty(aRunnersTreeNodes)) {
			return null;
		}
		for (var r = 0; r < aRunnersTreeNodes.length; r++) {
			var oRunnerTreeNode = aRunnersTreeNodes[r];
			var aConfigurationTreeNodes = oRunnerTreeNode.getNodes();
			for (var c = 0; c < aConfigurationTreeNodes.length; c++) {
				var oConfigurationTreeNode = aConfigurationTreeNodes[c];
				var sPath = oConfigurationTreeNode.getBindingContext().sPath;
				var oConfiguration = oConfigurationTreeNode.getBindingContext().getObject(sPath);
				if (oConfiguration.id === vConfigurationId) {
					return oConfigurationTreeNode;
				}
			}
		}
		return null;
	},

	_selectRunnerNode: function() {
		var sPath = this._oContext.sPath;
		var sRunnerPath = sPath.split("/configs")[0];
		var index = sRunnerPath.replace("/oRunners/", "");
		this.getView().oRunConfigurationTree.getNodes()[index].select();
	},

	_getTreeModelRunnerById: function(runnerId) {
		var aRunnersTreeNodes = this.getView().oRunConfigurationTree.getNodes();
		if (_.isEmpty(aRunnersTreeNodes)) {
			return null;
		}
		for (var r = 0; r < aRunnersTreeNodes.length; r++) {
			var oRunnerTreeNode = aRunnersTreeNodes[r];
			var oContext = oRunnerTreeNode.getBindingContext();
			var oTreeModelRunner = oContext.getObject(oContext.sPath);
			if (oTreeModelRunner.sId === runnerId) {
				return oTreeModelRunner;
			}
		}
		return null;
	},

	_updateTreeNodesStyle: function() {
		var aRunnerNodes = this.getView().oRunConfigurationTree.getNodes();
		for (var r = 0; r < aRunnerNodes.length; r++) {
			var oRunnerNode = aRunnerNodes[r];
			var aConfigurationNodes = oRunnerNode.getNodes();
			for (var c = 0; c < aConfigurationNodes.length; c++) {
				var oConfigurationNode = aConfigurationNodes[c];
				var oContext = oConfigurationNode.getBindingContext();
				var oTreeModelObject = oContext.getObject(oContext.sPath);
				oConfigurationNode.toggleStyleClass("runConfigurationNode", oTreeModelObject.hasIssues);
			}
		}
	},

	_hideEmptyRunnerNodes: function() {
		var aRunnerNodes = this.getView().oRunConfigurationTree.getNodes();
		for (var r = 0; r < aRunnerNodes.length; r++) {
			var oRunnerNode = aRunnerNodes[r];
			var aConfigurationNodes = oRunnerNode.getNodes();
			aConfigurationNodes.length === 0 ? oRunnerNode.toggleStyleClass("runRunnerNode", true) : oRunnerNode.toggleStyleClass("runRunnerNode",
				false);
		}
	},

	_getRunnerService: function(runnerId) {
		return this._runnerServices[runnerId];
	},

	_getOtherVisibleRunnerNames: function(bIgnoreSelected) {
		var aVisibleDisplayNames = [];
		// In case of creating a new configuration the selected configuration can be ignored
		var sConfigIdToExclude;
		if (!bIgnoreSelected) {
			sConfigIdToExclude = this.getSelectedConfiguration().id;
		}
		var aRunners = this._oTreeModel.getData().oRunners;
		_.forEach(aRunners, function(oRunner) {
			var aConfigurations = oRunner.configs;
			_.forEach(aConfigurations, function(configuration) {
				if (configuration.id !== sConfigIdToExclude) {
					aVisibleDisplayNames.push(configuration.displayName);
				}
			});
		});
		return aVisibleDisplayNames;
	},

	_validateConfiguration: function(oEvent) {
		var that = this;
		var isConfigurationValid;
		var oTab;
		var oStrip = this.getView().oTabStrip;
		if (oEvent) {
			isConfigurationValid = oEvent.mParameters.isValid;
			oTab = oStrip.getTabs()[oStrip.getSelectedIndex()];
			if (oTab && oTab.getTitle) {
				isConfigurationValid ? oTab.getTitle().setIcon("") : oTab.getTitle().setIcon(
					"resources/sap/watt/ideplatform/plugin/aceeditor/css/problemsViewIcons/error.png");
			}
		}

		this._isDisplayNameHasIssues(this.getSelectedConfiguration().displayName).then(function(bDisplayNameHasIssues) {
			return that._applyValidationResult(bDisplayNameHasIssues, isConfigurationValid);
		}).done();
	},

	_validateDisplayName: function(sDisplayName) {
		if (sDisplayName === "") {
			return Q(true);
		}
		return this.isDisplayNameExists(sDisplayName);
	},

	_isConfigurationValid: function(bConfigurationvalid, oRunnerService, settings, oSelectedDocument) {
		if (bConfigurationvalid === undefined) {
			return oRunnerService.isConfigurationValid(settings, oSelectedDocument);
		}

		return Q(bConfigurationvalid);
	},

	_applyValidationResult: function(bDisplayNameHasIssues, isConfigurationValid) {
		var that = this;

		// set configuration state
		var oSelectedTreeModelConfiguration = this.getSelectedConfiguration();
		var oSelectedTreeModelRunner = this.getSelectedRunner();

		// var oIssuesLabel = sap.ui.getCore().byId("configuration_error");

		return this._oRunService.getSelectedDocument().then(function(oSelectedDocument) {
			var oRunnerService = that._getRunnerService(oSelectedTreeModelRunner.sId);
			return that._isConfigurationValid(isConfigurationValid, oRunnerService, oSelectedTreeModelConfiguration.settings, oSelectedDocument)
				.then(
					function(bConfigurationValid) {
						bConfigurationValid = !bDisplayNameHasIssues && bConfigurationValid;
						oSelectedTreeModelConfiguration.hasIssues = !bConfigurationValid;
						// set enablement of the Run button 
						var oRunButton = sap.ui.getCore().byId("runbtn_dialog");
						oRunButton.setEnabled(bConfigurationValid);
						if (oSelectedTreeModelConfiguration.hasIssues) { // add general error message
							// TODO tab error
							// that.getView().getModel("secondPane").setProperty("/issuesLabel", "sap-icon://error"); //that._oI18nService.getText("i18n", "Issues_In_Configuration"));
						} else { // remove general error message
							// that.getView().getModel("secondPane").setProperty("/issuesLabel", "");

						}
						var oTreeConfigNode = that._getConfigurationNodeById(oSelectedTreeModelConfiguration.id);
						if (oTreeConfigNode) {
							oTreeConfigNode.select();
						}
					});
		});
	},

	onDisplayChange: function(oEvent) {
		var sDisplayName = oEvent.mParameters.newValue.trim();
		var oDisplayNameTextField = this.byId("displayNameTextField");
		if (sDisplayName === "") {
			var oSelectedTreeModelConfiguration = this.getSelectedConfiguration();
			oDisplayNameTextField.setValue(oSelectedTreeModelConfiguration.lastNotEmptyDisplayName);
			oDisplayNameTextField.fireLiveChange({
				"liveValue": oSelectedTreeModelConfiguration.lastNotEmptyDisplayName
			});
		}
	},

	onDisplayNameLiveChange: function(oEvent) {
		var that = this;
		var sDisplayName = oEvent.mParameters.liveValue.trim();
		this._isDisplayNameHasIssues(sDisplayName).then(function(hasIssues) {
			return that._applyValidationResult(hasIssues);
		}).done();
	},

	_isDisplayNameHasIssues: function(sDisplayName) {
		var that = this;

		return this._validateDisplayName(sDisplayName).then(function(hasIssues) {
			var oSelectedTreeModelConfiguration = that.getSelectedConfiguration();
			var oTreeConfigNode = that._getConfigurationNodeById(oSelectedTreeModelConfiguration.id);
			that._updateDisplayNameUiState(sDisplayName, hasIssues);

			if (sDisplayName !== "" && oTreeConfigNode) {
				oSelectedTreeModelConfiguration.lastNotEmptyDisplayName = sDisplayName;
				oTreeConfigNode.setText(sDisplayName);
			}

			return hasIssues;
		});
	},

	_updateDisplayNameUiState: function(sDisplayName, hasIssues) {
		var oDisplayNameTextField = this.byId("displayNameTextField");
		var oRichTooltip = new sap.ui.commons.RichTooltip({
			title: "{i18n>run_Error}",
			myPosition: "begin bottom",
			atPosition: "begin top"
		}).addStyleClass("runConfigRtt");
		
		if (sDisplayName === "") {
			oDisplayNameTextField.removeStyleClass("inputConfirmed");
			oDisplayNameTextField.addStyleClass("inputError");

			oRichTooltip.setText(this._oI18nService.getText("i18n", "empty_name"));
			oDisplayNameTextField.setTooltip(oRichTooltip);

			return;
		}

		if (hasIssues) {
			oDisplayNameTextField.removeStyleClass("inputConfirmed");
			oDisplayNameTextField.addStyleClass("inputError");

			oRichTooltip.setText(this._oI18nService.getText("i18n", "duplicate_name"));
			oDisplayNameTextField.setTooltip(oRichTooltip);

		} else {
			oDisplayNameTextField.setTooltip(sDisplayName);
			if (oDisplayNameTextField.hasStyleClass("inputError")) {
				oDisplayNameTextField.removeStyleClass("inputError");
				oDisplayNameTextField.addStyleClass("inputConfirmed");

				setTimeout(function() {
					oDisplayNameTextField.removeStyleClass("inputConfirmed");
				}, 3000);
			}
		}
	},

	isDisplayNameExists: function(displayName) {
		var aOtherVisibleDisplayNames = this._getOtherVisibleRunnerNames(false);

		var index = _.findIndex(aOtherVisibleDisplayNames, function(sVisibleDisplayName) {
			return sVisibleDisplayName === displayName;
		});

		// the name exists in the 
		if (index !== -1) {
			return Q(true);
		} else {
			return Q(false);
		}
	},

	_createTreeModelRunner: function(oRunner) {
		var oTreeModelRunner = _.omit(oRunner, _.keys(_.pick(oRunner, _.isObject)));
		this._runnerServices[oRunner.sId] = oRunner.oService;
		oTreeModelRunner.configs = [];
		return oTreeModelRunner;
	},

	_createTreeModelConfiguration: function(oConfiguration) {
		var oTempTreeModelConfiguration = _.clone(oConfiguration, true);
		var oTreeModelConfiguration = oTempTreeModelConfiguration._metadata;
		oTreeModelConfiguration.lastNotEmptyDisplayName = oTreeModelConfiguration.displayName;
		oTreeModelConfiguration.hasIssues = (oTempTreeModelConfiguration._metadata.hasIssues === true ? true : false);
		delete oTempTreeModelConfiguration._metadata;
		oTreeModelConfiguration.settings = oTempTreeModelConfiguration;
		return oTreeModelConfiguration;
	},

	_createConfigurationFromTreeModel: function(oTreeModelConfiguration) {
		var oClonedTreeModelConfig = _.clone(oTreeModelConfiguration, true);
		delete oClonedTreeModelConfig.lastNotEmptyDisplayName;
		var oConfiguration = oClonedTreeModelConfig.settings;
		oConfiguration._metadata = {};
		oConfiguration._metadata.id = oClonedTreeModelConfig.id;
		oConfiguration._metadata.runnerId = oClonedTreeModelConfig.runnerId;
		oConfiguration._metadata.displayName = oClonedTreeModelConfig.displayName;
		if (oClonedTreeModelConfig.hasIssues === true) {
			oConfiguration._metadata.hasIssues = true;
		}

		return oConfiguration;
	},

	getConfigurations: function() {
		var aConfigurations = [];
		var that = this;
		var aRunners = this._oTreeModel.getData().oRunners;
		_.forEach(aRunners, function(oRunner) {
			_.forEach(oRunner.configs, function(oTreeModelConfiguration) {
				aConfigurations.push(that._createConfigurationFromTreeModel(oTreeModelConfiguration));
			});
		});

		return aConfigurations;
	},

	getConfigurationDisplaNames: function() {
		var aConfigurations = this.getConfigurations();
		var aDisplayNames = [];
		_.forEach(aConfigurations, function(oConfiguration) {
			aDisplayNames.push(oConfiguration._metadata.displayName);
		});

		return _.uniq(_.compact(aDisplayNames));
	},

	run: function() {
		var that = this;
		that.getView().getViewData().context.service.usagemonitoring.startPerf("runner", "preview").done();
    	var oSelectedTreeModelConfiguration = this.getSelectedConfiguration();
        var oConfiguration = this._createConfigurationFromTreeModel(oSelectedTreeModelConfiguration);
        var sWindowId = this._documentWindowsUtil.openWindow();
        this._oRunService.getSelectedDocument().then(function(oSelectedDocument) {
            if (oSelectedDocument) {
                return oSelectedDocument.getProject().then(function(oProjectDocument) {
                	return that.getView().getViewData().context.service.filesystem.documentProvider.getDocument(oConfiguration.filePath).then(function(oRunnableDocument) {
                		that.getView().getViewData().context.service.usagemonitoring.report("runConfiguration", "DialogSave&Run", oConfiguration._metadata.runnerId).done();
                		return that._oRunService.run(sWindowId, oConfiguration, true, oProjectDocument, oRunnableDocument);
                	});
                });
            }
        }).done();
    }
});