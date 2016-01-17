define(["sap.watt.platform.commandgroup/module/ActionItem", "sap/watt/lib/lodash/lodash",
	"sap.watt.ideplatform.run/util/DocumentWindowsUtil", "sap.watt.ideplatform.run/command/RunCommand",
	"sap.watt.ideplatform.run/command/RunAsCommand",
	"sap.watt.ideplatform.run/error/ConfigurationError"
], function(ActionItem, _, DocumentWindowsUtil, RunCommand, NewRunAsCommand, ConfigurationError) {

	"use strict";

	var RunAsCommand = function(oOptions) {
		this.isFree = true;
		this.oCommand = oOptions.command;
		this.oCommand.setValue(oOptions.index, "runAsCommandId");
	};
	RunAsCommand.prototype.assign = function(oOptions) {
		this.isFree = false;
		this.sRunnerId = oOptions.sRunnerId;
	};
	RunAsCommand.prototype.free = function() {
		this.isFree = true;
		this.sRunnerId = null;
	};

	var Runner = function(oOptions) {
		this.sId = oOptions.id;
		this.oService = oOptions.service;
		this.displayName = oOptions.displayName;
		this.aProjectTypesIds = oOptions.projectTypesIds;
		this.fileTypes = oOptions.fileTypes;
		this.appCacheBuster = false;
		if (oOptions.internalOnly) {
			this.internalOnly = oOptions.internalOnly;
		}
		if (oOptions.appCacheBuster === undefined || oOptions.appCacheBuster === true) {
			this.appCacheBuster = true;
			this.appCacheBusterOffset = (oOptions.appCacheBusterOffset ? oOptions.appCacheBusterOffset : undefined);
		}
		this.registerRunConsole = oOptions.registerRunConsole;
	};

	var run = {
		_runAsCommands: [],
		_runners: {},
		_oMainDialogfragment: null,

		configure: function(mConfig) {
			if (mConfig) {
				var mRunners = this._sortRunners(mConfig.runners);
				for (var i = 0; i < mRunners.length; i++) {
					var oRunner = new Runner(mRunners[i]);
					this._setRunner(oRunner);
				}
				var aStyles = mConfig.styles;
				this.context.service.resource.includeStyles(aStyles).done();
			}

			this._preloadServices();
		},

		_setRunner: function(oRunner) {
			if (oRunner.internalOnly === true) {
				if (sap.watt.getEnv("internal") === true) {
					this._runners[oRunner.sId] = oRunner;
				}
			} else {
				this._runners[oRunner.sId] = oRunner;
			}

			if (oRunner.oService && oRunner.oService.run && _.isFunction(oRunner.oService.run)) {
				oRunner.oService.run().fail(function() {
					// do nothing;
				}).done();
			}
		},

		_preloadServices: function() {
			var oHistoryService = this.context.service.runconfigurationhistory;
			if (oHistoryService && _.isFunction(oHistoryService.store)) {
				oHistoryService.store().fail(function() {
					// do nothing 
				}).done();
			}

			var oHelperService = this.context.service.configurationhelper;
			if (oHelperService && _.isFunction(oHelperService.getAllPersistedConfigurations)) {
				oHelperService.getAllPersistedConfigurations().fail(function() {
					// do nothing
				}).done();
			}
		},

		init: function() {
			this._oMainDialogfragment = sap.ui.jsfragment(
				"sap.watt.ideplatform.plugin.run.view.RunConfigurations", this);

			this.context.i18n.applyTo([this._oMainDialogfragment]);

			var aPromises = [
				this.context.service.command.getCommand("multiPurposeCommand1"),
				this.context.service.command.getCommand("multiPurposeCommand2"),
				this.context.service.command.getCommand("multiPurposeCommand3"),
				this.context.service.command.getCommand("multiPurposeCommand4"),
				this.context.service.command.getCommand("multiPurposeCommand5"),
				this.context.service.command.getCommand("multiPurposeCommand6"),
				this.context.service.command.getCommand("multiPurposeCommand7"),
				this.context.service.command.getCommand("multiPurposeCommand8"),
				this.context.service.command.getCommand("multiPurposeCommand9"),
				this.context.service.command.getCommand("multiPurposeCommand10"),
				this.context.service.command.getCommand("multiPurposeCommand11"),
				this.context.service.command.getCommand("multiPurposeCommand12")
			];
			var that = this;
			return Q.all(aPromises).then(function(oCommands) {
				for (var i = 0; i < oCommands.length; i++) {
					var oCommand = oCommands[i];
					if (oCommand) {
						that._extendCommand(oCommand);
						var runAsCommand = new RunAsCommand({
							command: oCommand,
							index: i //so it will start from 0
						});
						that._runAsCommands.push(runAsCommand);
					}
				}
			}).then(function() {
				NewRunAsCommand.setContext(that.context);

				var aCommandPromises = [];
				aCommandPromises.push(that.context.service.command.getCommand("preview.run"));
				aCommandPromises.push(that.context.service.command.getCommand("run.recentlyUsedCommand"));
				aCommandPromises.push(that.context.service.command.getCommand("run.projectRecentlyUsedCommand"));

				return Q.all(aCommandPromises).then(function(aCommands) {
					_.forEach(aCommands, function(oCommand) {
						if (oCommand) {
							that._extendCommand(oCommand);
						}
					});
				});
			});
		},

		getContent: function() {
			return this._oMainDialogfragment;
		},

		close: function() {
			this.context.service.usagemonitoring.report("runConfiguration", "DialogCancel").done();
			this._oMainDialogfragment.destroyContent();
			this._oMainDialogfragment.close();
		},

		runAction: function() {
			this._runConfigurationsController.run();
			this._oMainDialogfragment.close();
		},

		open: function(oView, sProjectName) {
			this.context.service.usagemonitoring.report("runConfiguration", "DialogOpen").done();
			this._oMainDialogfragment.destroyContent();
			this._oMainDialogfragment.addContent(oView);
			this._sProject = sProjectName;
			var sTitle = this.context.i18n.getText("i18n", "run_RunConfigurations", [sProjectName]);
			this._oMainDialogfragment.setTitle(sTitle);
			this._oMainDialogfragment.open();
		},

		save: function() {
			this.context.service.usagemonitoring.report("runConfiguration", "DialogOK").done();
			this.saveProjectSetting(null, null, this._sProject).done();
			this._oMainDialogfragment.close();
		},

		_oConfigurationIdWithIssues: undefined,

		_extendCommand: function(oCommand) {
			var that = this;
			oCommand.execute = function(oValue) {
				that.context.service.usagemonitoring.startPerf("runner", "preview").done();
				that.context.service.usagemonitoring.startPerf("runner", "previewETE").done();
				var aCustomData = this._mValues;
				var sWindowId = null;
				//if the More command of the context menu was pressed the Window should not be opened
				if (oValue) {
					if (oValue.type !== "moreRunConfiguration") {
						sWindowId = DocumentWindowsUtil.openWindow();
					}
				} else {
					sWindowId = DocumentWindowsUtil.openWindow();
				}
				console.debug("start - " + Date.now());
				that.context.service.usagemonitoring.report("runner", "preview").done();
				return that.execute(oValue, sWindowId, aCustomData).fail(function() {
					DocumentWindowsUtil.closeWindow(sWindowId);
				});
			};
		},

		_freeAllRunAsCommands: function() {
			for (var i = 0; i < this._runAsCommands.length; i++) {
				var oRunAsCommand = this._runAsCommands[i];
				oRunAsCommand.free();
			}
		},
		//TODO: find better solution
		_getSelection: function() {
			//	var that = this;

			// return this.context.service.selection.isOwner(this.context.service.repositorybrowser).then(function(bResult) {
			// 	if (bResult) {
			// 	return that.context.service.selection.getSelection();
			// }

			return this.context.service.selection.getSelection();
			// 	debugger;
			// 	return oResult;
			// });
			//return null;
			// });
		},

		getSelectedDocument: function() {
			var that = this;
			var oSelectionService = this.context.service.selection;
			var oRepoBrowserService = this.context.service.repositorybrowser;
			return oSelectionService.isOwner(oRepoBrowserService).then(function(bOwner) {
				return oSelectionService.getSelection().then(function(aSelectedDocuments) {
					if (bOwner && aSelectedDocuments && _.isArray(aSelectedDocuments) && aSelectedDocuments.length > 0) {
						//persist selected document
						if (aSelectedDocuments.length === 1) {
							that._aSelectedDocuments = aSelectedDocuments;
						} else {
							that._aSelectedDocuments = null;
						}
					}
					if (that._aSelectedDocuments) {
						//assuming single selection
						var oDocument = that._aSelectedDocuments[0].document;
						if (!oDocument.getEntity().isRoot()) {
							return oDocument;
						}
					}
					return null;
				});
			});
		},

		_getSelectedProjectTypes: function() {
			var that = this;
			var aPrioritisedProjectTypes = [];

			return this.getSelectedDocument().then(function(oSelectedDocument) {
				if (oSelectedDocument) {
					return that.context.service.projectType.getProjectTypes(oSelectedDocument).then(function(aProjectTypes) {
						//arrange built-in types at the beginning
						_.forEach(aProjectTypes, function(oProjectType) {
							if (oProjectType.isBuiltIn) {
								aPrioritisedProjectTypes.unshift(oProjectType.id);
							} else {
								aPrioritisedProjectTypes.push(oProjectType.id);
							}
						});

						return aPrioritisedProjectTypes;
					});
				}

				return Q(aPrioritisedProjectTypes);
			});
		},

		getRunnersForSelectedProject: function() {
			var that = this;

			return this._getSelectedProjectTypes().then(function(aProjectTypes) {
				var aRunners = [];

				_.forEach(aProjectTypes, function(sProjectTypeId) {
					_.forEach(_.values(that._runners), function(oRunner) {
						if (oRunner.aProjectTypesIds.indexOf(sProjectTypeId) !== -1) {
							aRunners.push(oRunner);
						}
					});
				});

				aRunners = _.uniq(aRunners, "sId");
				return aRunners;
			});
		},

		getItems: function(sGroupId) {
			var that = this;
			if (sGroupId === "run.runAsGroup") {
				this._freeAllRunAsCommands();
				// go through all registered runners, ask if they are available
				return this.getRunnersForSelectedProject().then(function(aRunners) {
					var aActionItems = [];
					for (var i = 0; i < aRunners.length; i++) {
						var oActionItem = that._getActionItemForRunAs(aRunners[i]);
						if (oActionItem) {
							aActionItems.push(oActionItem);
						}
					}
					return aActionItems;
				});
			}

			return [];
		},

		_getActionItemForRunAs: function(oRunner) {
			var oRunAsCommand = this._assignCommand(oRunner);
			if (oRunAsCommand) {
				return new ActionItem({
					"id": oRunner.sId,
					"label": oRunner.displayName
				}, oRunAsCommand.oCommand);
			}
			return null;
		},

		_assignCommand: function(oRunner) {
			var freeCommand = this._getFreeCommand();
			if (freeCommand) {
				freeCommand.assign({
					sRunnerId: oRunner.sId
				});
				return freeCommand;
			}
			return null;
		},

		_getFreeCommand: function() {
			for (var ii = 0; ii < this._runAsCommands.length; ii++) {
				var oRunAsCommand = this._runAsCommands[ii];
				if (oRunAsCommand.isFree) {
					return oRunAsCommand;
				}
			}
			return null;
		},

		_setConfigurationAsRecentlyUsed: function(oConfiguration, oProjectDocument) {
			if (oProjectDocument) {
				var sProjectPath = oProjectDocument.getEntity().getFullPath();
				return this.context.service.runconfigurationhistory.store(oConfiguration, sProjectPath);
			}
		},

		_saveConfigurationAsFirstInFile: function(oConfiguration, oProjectDocument) {
			var that = this;
			var sConfigurationId = oConfiguration._metadata.id;
			return this.context.service.configurationhelper.getAllPersistedConfigurations(oProjectDocument).then(function(aConfigurations) {
				for (var i = 0; i < aConfigurations.length; i++) {
					var oCurrentConfiguration = aConfigurations[i];
					var sCurrentConfigurationId = oCurrentConfiguration._metadata.id;
					if (sConfigurationId === sCurrentConfigurationId) {
						// found the index
						aConfigurations.splice(i, 1);
					}
				}
				aConfigurations.unshift(oConfiguration);
				return that.context.service.configurationhelper.writeConfigurationsToFile(aConfigurations, oProjectDocument);
			});
		},

		_prepareCommand: function(oCommandData) {
			var that = this;

			return this.getSelectedDocument().then(function(oSelectedDocument) {
				if (oSelectedDocument) {
					return oSelectedDocument.getProject().then(function(oProjectDocument) {
						oCommandData.oProjectDocument = oProjectDocument;
						oCommandData.oSelectedDocument = oSelectedDocument;
						return that.context.service.run.appcachebuster.createAppCacheBusterFile(oProjectDocument).then(function() {
							return that._getRunAsCommandConfiguration(oCommandData, oSelectedDocument).then(function(oConfiguration) {
								oCommandData.oConfiguration = oConfiguration;
								oCommandData.oRunnableDocument = null;
								if (oConfiguration && !oConfiguration._metadata.hasIssues && oConfiguration.filePath) {
									return that.context.service.filesystem.documentProvider.getDocument(oConfiguration.filePath).then(function(
										oRunnableDocument) {
										oCommandData.oRunnableDocument = oRunnableDocument;
									}).fail(function() {
										oCommandData.oRunnableDocument = null;
									});
								}
							});
						});
					});
				}
			});
		},

		//commands
		isAvailable: function(oCommandData) {
			return this._prepareCommand(oCommandData).then(function() {
				return true;
			});
		},

		isEnabled: function(oCommandData) {
			var oSelectedDocument = oCommandData.oSelectedDocument;
			return this.context.service.perspective.getCurrentPerspective().then(function(sPerspectiveName) {
				var bDevPerspective = (sPerspectiveName === "development" ? true : false);
				if (!bDevPerspective || !oSelectedDocument || oSelectedDocument.getEntity().isRoot()) {
					return false;
				}

				return true;
			});
		},

		_getRunAsCommandConfiguration: function(oValue, oSelectedDocument) {
			if (oValue && oValue.runAsCommandId !== undefined) {
				// Run As configuration 
				var oCommand = this._runAsCommands[oValue.runAsCommandId];
				var sRunnerId = oCommand.sRunnerId;
				var oRunner = this._runners[sRunnerId];
				oValue.oRunner = oRunner;

				var oVisibleDisplayNames = [];
				if (this.isRunConfigurationViewActive()) {
					oVisibleDisplayNames = this._runConfigurationsController.getConfigurationDisplaNames();
				}

				return NewRunAsCommand.getConfiguration(oSelectedDocument, undefined, oRunner, oVisibleDisplayNames);
			}
		},

		execute: function(oValue, sWindowId, aCustomData) {
			if (aCustomData && aCustomData.runAsCommandId !== undefined) {
				// Run As command
				return this._executeRunAsCommand(sWindowId, aCustomData);
			} else if (oValue && oValue.type === "recentlyUsed") {
				// Recently Used command
				return this._executeRecentlyUsedCommand(sWindowId, oValue);
			} else if (oValue && oValue.type === "projectRecentlyUsed") {
				// Project Recently Used command
				return this._executeRecentlyUsedCommand(sWindowId, oValue);
			} else if (oValue && oValue.type === "moreRunConfiguration") {
				// Project Recently Used command - More
				return this._executeProjectRecentlyUsedCommandMore(sWindowId, oValue);
			} else {
				// Run button
				return this._executeRunCommand(sWindowId, aCustomData);
			}
		},

		//Opens the Run Configuration per project for the More Command
		_executeProjectRecentlyUsedCommandMore: function() {
			var that = this;
			return that.getSelectedDocument().then(function(oDoc) {
				return oDoc.getProject().then(function(oProject) {
					return that.getProjectSettingContent().then(function(oView) {
						return that.open(oView, oProject.getTitle());
					});
				});
			});
		},

		_executeRunAsCommand: function(sWindowId, aCustomData) {
			return this._executeCommand(sWindowId, aCustomData, NewRunAsCommand, "runAsClicked");
		},

		_executeRunCommand: function(sWindowId, aCustomData) {
			return this._executeCommand(sWindowId, aCustomData, RunCommand, "runClicked");
		},

		_executeCommand: function(sWindowId, aCustomData, oCommandType, sMessageType) {
			var that = this;

			if (aCustomData.oRunnableDocument) {
				that.context.service.usagemonitoring.report("runConfiguration", sMessageType, aCustomData.oConfiguration._metadata.runnerId).done();
				return that.run(sWindowId, aCustomData.oConfiguration, false, aCustomData.oProjectDocument, aCustomData.oRunnableDocument);
			}

			return oCommandType.getConfiguration(aCustomData.oSelectedDocument, sWindowId, aCustomData.oRunner).then(function(oConfiguration) {
				return that.context.service.filesystem.documentProvider.getDocument(oConfiguration.filePath).then(function(oRunnableDocument) {
					that.context.service.usagemonitoring.report("runConfiguration", sMessageType, oConfiguration._metadata.runnerId).done();
					return that.run(sWindowId, oConfiguration, false, aCustomData.oProjectDocument, oRunnableDocument);
				});
			});
		},

		_executeRecentlyUsedCommand: function(sWindowId, oValue) {
			var that = this;
			var oSelectedConfiguration = oValue.value;

			if (oValue.type === "recentlyUsed") {
				return that.run(sWindowId, oSelectedConfiguration, false, oValue.oProjectDocument, oValue.oRunnableDocument).then(function() {
					that.context.service.usagemonitoring.report("runConfiguration", "recentlyUsedClicked", oSelectedConfiguration._metadata.runnerId).done();
				});
			}
			// project recently used command
			return that.run(sWindowId, oSelectedConfiguration, false, oValue.oProjectDocument, oValue.oRunnableDocument).then(function() {
				that.context.service.usagemonitoring.report("runConfiguration", "projectRecentlyUsedClick", oSelectedConfiguration._metadata.runnerId)
					.done();
			});
		},

		run: function(sWindowId, oConfiguration, isRunConfigurationFlow, oProjectDocument, oRunnableDocument) {
			var that = this;

			if (oConfiguration && oConfiguration._metadata) {
				if (oConfiguration._metadata.hasIssues === true) {
					return that._handleHasIssues(oConfiguration, sWindowId);
				}

				var oRunner = this._runners[oConfiguration._metadata.runnerId];
				var oWindow = this._getWindowForRunner(sWindowId, oConfiguration);

				// check that oRunnableDocument is of same project as oProjectDocument
				var sProject = oProjectDocument.getEntity().getName();
				oRunnableDocument.getProject().then(function(oDocument) {
					var sDocProject = oDocument.getEntity().getName();
					if (sProject !== sDocProject) {
						return that._handleHasIssues(oConfiguration, oWindow.name);
					}
				}).done();

				//open runconsole if runner is registered to it
				if (oRunner.registerRunConsole) {
					that.context.service.runconsole.setVisible(true).done();
				}

				var oConfigWithCacheParameter = oConfiguration;
				if (oRunner.appCacheBuster) {
					oConfigWithCacheParameter = this._addAppCacheBusterUrlParameter(oConfiguration, oRunner.appCacheBusterOffset);
				}
				var oRunPromise = oRunner.oService.run(undefined, oWindow, undefined, oConfigWithCacheParameter, oRunnableDocument);
				oRunPromise.then(function() {
					Q.all([that._setConfigurationAsRecentlyUsed(oConfiguration, oProjectDocument), that._saveConfigurationAsFirstInFile(oConfiguration,
						oProjectDocument)]).then(function() {
						// update run configuration view if it is active
						if (!isRunConfigurationFlow && that.isRunConfigurationViewActive()) {
							that._runConfigurationsController.addNewConfigurationToTreeAndSelectIt(oConfiguration);
						}
					}).done();
				}).fail(function(oError) {
					oConfiguration._metadata.hasIssues = true;
					return that._saveConfigurationAsFirstInFile(oConfiguration, oProjectDocument).then(function() {
						if (oError instanceof ConfigurationError) {
							return that._handleHasIssues(oConfiguration, oWindow.name);
						}
					});
				});

				return oRunPromise;
			}

			DocumentWindowsUtil.closeWindow(sWindowId);
			return Q();
		},

		_addAppCacheBusterUrlParameter: function(oConfiguration, sOffset) {
			if (oConfiguration && oConfiguration.filePath && oConfiguration.urlParameters) {
				oConfiguration = _.cloneDeep(oConfiguration, true);
				// remove first slash from a runnable file full path to avoid empty values
				var parts = oConfiguration.filePath.split("/");
				// remove first empty part and a runnable file part
				// /project/folder/index.html --> [project, folder]
				var nPartsQuantity = parts.length - 2;

				var sPathToAppRoot = "";
				var i = nPartsQuantity;
				while (i--) {
					sPathToAppRoot = sPathToAppRoot + "../";
				}

				// offset used only for fiori runnable files
				if (sOffset) {
					sPathToAppRoot = sOffset + sPathToAppRoot;
				}

				oConfiguration.urlParameters.push({
					"paramName": "sap-ui-appCacheBuster",
					"paramValue": sPathToAppRoot,
					"paramActive": true
				});
			}

			return oConfiguration;
		},

		_getWindowForRunner: function(sTmpWindowId, oConfiguration) {
			var sConfigWindowId = "config_" + oConfiguration._metadata.id;
			var oWindow = DocumentWindowsUtil.getWindow(sConfigWindowId);
			if (oWindow) {
				// close a configuration window if it already opened
				DocumentWindowsUtil.closeWindow(sConfigWindowId);
			}

			DocumentWindowsUtil.renameWindow(sTmpWindowId, sConfigWindowId);
			oWindow = DocumentWindowsUtil.getWindow(sConfigWindowId);
			DocumentWindowsUtil.closeWindow(sTmpWindowId);

			return oWindow;
		},

		_handleHasIssues: function(oConfiguration, sWindowId) {
			var that = this;
			// close application window if it is opened
			DocumentWindowsUtil.closeWindow(sWindowId);
			// do not open again run configuration pane if it is already opened
			if (this.isRunConfigurationViewActive()) {
				// try to select the problematic configuration
				this._runConfigurationsController.selectConfiguration(oConfiguration);
				return Q();
			}

			this._oConfigurationIdWithIssues = oConfiguration._metadata.id;
			var sConfigurationName = oConfiguration._metadata.displayName;

			// report the user error to the usage analytics
			that.context.service.usagemonitoring.report("runConfiguration", "configurationError", oConfiguration._metadata.runnerId).done();

			// open error dialog
			var sErrorMessage = this.context.i18n.getText("i18n", "error_notification", [sConfigurationName]);
			return this._openDialog(sErrorMessage).then(function(oResult) {
				if (oResult) {
					// open run configuration pane
					return that.context.service.command.getCommand("run.runConfigurations").then(function(oCommand) {
						return oCommand.execute(oConfiguration);
					});
				}
			});
		},

		_openDialog: function(sErrorMessage) {
			var oDeferred = Q.defer();
			var oDialog = new sap.ui.commons.Dialog().addStyleClass("runConfigurationExceptionDialog");
			oDialog.setTitle(this.context.i18n.getText("i18n", "run_Error"));
			var oText = new sap.ui.commons.TextView();
			oText.setText(sErrorMessage);
			oDialog.addContent(oText);
			oDialog.setModal(true);
			oDialog.setMinWidth("600px");

			var that = this;

			oDialog.addButton(new sap.ui.commons.Button({
				text: that.context.i18n.getText("i18n", "run_OpenRunConfigurations"),
				press: function() {
					oDialog.close();
					oDeferred.resolve(true);
				}
			}));
			oDialog.addButton(new sap.ui.commons.Button({
				text: that.context.i18n.getText("i18n", "run_Cancel"),
				press: function() {
					oDialog.close();
					oDeferred.resolve(false);
				}
			}));
			oDialog.open();
			return oDeferred.promise;
		},

		// returns a map with configurations for each relevant runner
		getRunnersWithConfigurations: function() {
			var that = this;

			var aPromises = [
				this.getRunnersForSelectedProject(),
				this.getSelectedDocument()
			];
			return Q.spread(aPromises, function(aRunners, oSelectedDocument) {
				return that.context.service.configurationhelper.getAllPersistedConfigurations(oSelectedDocument).then(function(
					aPersistedConfigurations) {
					var aConfigurationsPerRunner = [];
					var aHasIssuesPromises = [];

					_.forEach(aRunners, function(oRunner) {
						var oConfigurationsPerRunner = {};
						oConfigurationsPerRunner.runner = oRunner;
						oConfigurationsPerRunner.configurations = [];
						var sRunnerId = oRunner.sId;

						_.forEach(aPersistedConfigurations, function(oPersistedConfiguration) {
							if (oPersistedConfiguration._metadata.runnerId === sRunnerId) {
								oConfigurationsPerRunner.configurations.push(oPersistedConfiguration);
							}
						});

						aConfigurationsPerRunner.push(oConfigurationsPerRunner);
						aHasIssuesPromises.push(that._updateConfigurationsHasIssuesState(oRunner, oConfigurationsPerRunner.configurations));
					});

					return Q.all(aHasIssuesPromises).then(function() {
						return aConfigurationsPerRunner;
					});
				});
			});
		},

		_updateConfigurationsHasIssuesState: function(oRunner, aConfigurations) {
			var aPromises = [];
			return this.getSelectedDocument().then(function(oSelectedDocument) {
				if (!oSelectedDocument || _.isEmpty(aConfigurations)) {
					return Q();
				}

				_.forEach(aConfigurations, function(oConfiguration) {
					aPromises.push(oRunner.oService.isConfigurationValid(_.clone(oConfiguration, true), oSelectedDocument));
				});

				return Q.all(aPromises).then(function() {
					for (var i = 0; i < arguments.length; i++) {
						var oConfiguration = aConfigurations[i];
						var bConfigurationValid = arguments[0][i];
						if ((oConfiguration._metadata.hasIssues !== true) && (bConfigurationValid === false)) {
							oConfiguration._metadata.hasIssues = true;
						}
					}
				});
			});
		},

		isRunConfigurationViewActive: function() {
			if (this._runConfigurationsView) {
				return this._runConfigurationsView.isActive();
			}

			return false;
		},

		// project settings
		getProjectSettingContent: function() {
			var that = this;
			if (this.isRunConfigurationViewActive()) {
				return this._runConfigurationsView;
			}

			return this.getRunnersWithConfigurations().then(function(aConfigurationsPerRunner) {
				that._runConfigurationsView = sap.ui.view({
					viewName: "sap.watt.ideplatform.plugin.run.view.RunConfigurations",
					type: sap.ui.core.mvc.ViewType.JS,
					height: "100%",
					viewData: {
						context: that.context,
						documentWindowsUtil: DocumentWindowsUtil,
						configurationIdWithIssues: that._oConfigurationIdWithIssues,
						aConfigurationsPerRunner: aConfigurationsPerRunner
					}
				});
				that._runConfigurationsController = that._runConfigurationsView.getController();
				return that._runConfigurationsView;
			});
		},

		saveProjectSetting: function(id, group, sProjectPath) {
			if (this._runConfigurationsController) {
				var aPromises = [];
				aPromises.push(this._removeConfigurationsFromHistory());
				var aConfigurations = this._runConfigurationsController.getConfigurations();
				aPromises.push(this.context.service.runconfigurationhistory.update(aConfigurations, sProjectPath));
				aPromises.push(this.context.service.configurationhelper.writeConfigurationsToFile(aConfigurations));

				return Q.all(aPromises);
			}
		},

		_removeConfigurationsFromHistory: function() {
			// get deleted configuration ids
			var configurationIdsToDeleteFromHistory = this._runConfigurationsController._deletedConfigurationIds;
			if (configurationIdsToDeleteFromHistory.length > 0) {
				// remove the ids from user preferences storage
				return this.context.service.runconfigurationhistory.remove(configurationIdsToDeleteFromHistory);
			}

			return Q();
		},

		onDocumentDeleted: function(oEvent) {
			var oDocument = oEvent.params.document;
			if (oDocument.isProject() || oDocument.getEntity().getName() === ".user.project.json") {
				var that = this;
				return oDocument.getProject().then(function(oProjectDocument) {
					var sProjectPath = oProjectDocument.getEntity().getFullPath();
					return that.context.service.runconfigurationhistory.removeByProjectPath(sProjectPath);
				});
			}
		},

		// empty method , no need to implement
		getUserPreferenceContent: function() {},
		// empty method , no need to implement
		saveUserPreference: function() {},

		// Sorts the order of the plugins based on their priority. 
		// Currently sorted in the following order: [fiorirunner, webapprunner, qunitrunner, embeddedrunner, others...]
		// TODO - get the sort order from the runners, or think of a better solution...
		_sortRunners: function(aRunners) {
			var iFioriIndex = -1;
			var iWebIndex = -1;
			var iQunitIndex = -1;
			var iEmbeddedIndex = -1;
			var aIndexes = [];
			var aResultRunners = [];

			for (var i = 0; i < aRunners.length; i++) {
				if (aRunners[i].id === "fiorirunner") {
					iFioriIndex = i;
				} else if (aRunners[i].id === "webapprunner") {
					iWebIndex = i;
				} else if (aRunners[i].id === "qunitrunner") {
					iQunitIndex = i;
				} else if (aRunners[i].id === "embeddedrunner") {
					iEmbeddedIndex = i;
				}
			}
			if (iFioriIndex !== -1) {
				aIndexes.push(iFioriIndex);
			}
			if (iWebIndex !== -1) {
				aIndexes.push(iWebIndex);
			}
			if (iQunitIndex !== -1) {
				aIndexes.push(iQunitIndex);
			}
			if (iEmbeddedIndex !== -1) {
				aIndexes.push(iEmbeddedIndex);
			}
			for (var i = 0; i < aRunners.length; i++) {
				if (i !== iFioriIndex && i !== iWebIndex && i !== iQunitIndex && i !== iEmbeddedIndex) {
					aIndexes.push(i);
				}
			}
			for (var i = 0; i < aIndexes.length; i++) {
				aResultRunners.push(aRunners[aIndexes[i]]);
			}
			return aResultRunners;
		}
	};

	return run;
});