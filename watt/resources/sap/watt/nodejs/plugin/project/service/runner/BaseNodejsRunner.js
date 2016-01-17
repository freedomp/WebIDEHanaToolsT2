define(["../NodejsLauncher"], function(NodejsLauncher) {
	"use strict";

	var _runnableFiles = {
		include: [".*\.js$", ".*\.xsjs$"],
		exclude: [".*\/node_modules\/.*"] // contains extremely deep hierarchy
	};
	var _fileValidationRules = [{
		isRegex: false,
		rule: ".js"
	}, {
		isRegex: false,
		rule: ".xsjs"
	}];

	/**
	 * Constructs new instance.
	 *
	 * @public
	 * @constructor
	 */
	var BaseNodejsRunner = function(sRunnerId, sRunnerTypeId) {
		this._sRunnerId = sRunnerId;
		this._sRunnerTypeId = sRunnerTypeId;
		return this;
	};

	BaseNodejsRunner.prototype.run = function(value, oWindow, aCustomData, oConfiguration) {
		// workaround for starting project without configuration, this doesn't work for node.js runner at the moment
		if (oConfiguration) {
			return this._runProject(oConfiguration, oWindow);
		}
	};

	BaseNodejsRunner.prototype.createDefaultConfiguration = function(oDocument, isRunConfigurationFlow, sWindowId) {
		var that = this;
		return Q.all([oDocument.getProject(), that.context.service.basefilesearchutil.getRunnableFiles(oDocument, _runnableFiles)]) //
		.spread(
				function(project, aFiles) {
					var sProjectPath = project.getEntity().getFullPath();
					switch (aFiles.length) {
						case 1:
							return that.context.service.nodejsLauncher.createConfiguration(sProjectPath, aFiles[0].fullPath);
						default:
							var selectedFilePath = oDocument.getEntity().getFullPath();
							// check if selected file (if any) is among the runnable files
							var validSelectedFiles = aFiles.filter(function(file) {
								return file.fullPath === selectedFilePath;
							});
							if (validSelectedFiles.length === 1) {
								return that.context.service.nodejsLauncher
										.createConfiguration(sProjectPath, validSelectedFiles[0].fullPath);
							}
							if (isRunConfigurationFlow) {
								return project.getChild("package.json").then(
										function(oPackageJson) {
											return oPackageJson.getContent().then(
													function(sContent) {
														var packageJson = JSON.parse(sContent);
														return that.context.service.nodejsLauncher.createConfiguration(sProjectPath,
																sProjectPath + "/" + packageJson.main);
													});
										}).catch(function() {
											return that.context.service.nodejsLauncher.createConfiguration(sProjectPath, sProjectPath + "/");
										});
							}

							// not in run config screen: show pop-up to select files
							return that.context.service.basechoosefilepopup.getContent(aFiles, sWindowId).then(function(bSuccess) {
								if (bSuccess) {
									return that.context.service.basechoosefilepopup.getResult().then(function(sFilePath) {
										return that.context.service.nodejsLauncher.createConfiguration(sProjectPath, sFilePath);
									});
								}
							});
					}
					return null;
				});
	};

	BaseNodejsRunner.prototype.getConfigurationUi = function(oDocument) {
		var that = this;
		return {
			model: new sap.ui.model.json.JSONModel({}),

			_getUnitTestFiles: function(oDocument1) {
				return that.context.service.basefilesearchutil.getRunnableFiles(oDocument1, _runnableFiles).then(function(aJsFiles) {
					aJsFiles.sort(function(a, b) {
						var lenA = a.fullPath.split("/").length;
						var lenB = b.fullPath.split("/").length;
						return lenA - lenB;
					});
					return aJsFiles;
				});
			},

			// Get UI content for Local installation Web IDE - don't add the advenced settings tab
			_getContentLocal: function (oDocument2) {
				// ======== Set Pre Promises - Get data needed before calling the controls
				var aPrePromises = [];
				aPrePromises.push(this._getUnitTestFiles(oDocument2));
				// ======== Set Post Promises - Get the UI controls
				return Q.all(aPrePromises).spread(function (aJsFiles) {
					var aPostPromises = [];
					aPostPromises.push(that.context.service.runconfig.filepath.getControl(oDocument2, aJsFiles, _fileValidationRules));

					// ======== Build the run configuration UI
					return Q.all(aPostPromises).spread(function (oFilePath) {
						// --------- General grid ---------
						var oGeneralGrid = new sap.ui.layout.Grid({
							hSpacing: 0,
							layoutData: new sap.ui.layout.GridData({
								span: "L12 M12 S12"
							})
						});
						// File Path section
						oGeneralGrid.addContent(oFilePath);

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
						return aRunnerUI;
					});
				});
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

	BaseNodejsRunner.prototype.isConfigurationValid = function(oConfiguration, oDocument) {
		return this.context.service.baseinputvalidatorutil.isConfigurationValid(oConfiguration, oDocument, _fileValidationRules);
	};

	BaseNodejsRunner.prototype._onApplicationRunning = function(oEvent) {
		// detach event, otherwise we get events from other application starts
		this.that.context.service.nodejsLauncher.detachEvent("applicationRunning", this.that._onApplicationRunning, this);

		if (this.window) {
			this.window.location.href = oEvent.params.webUri;
		}
	};

	/**
	 * Starts a project that is identified by the given path.
	 *
	 * @private
	 * @param {object} oConfiguration run configuration
	 * @param {window} oWindow a window instance
	 * @returns {Promise<void,string>} a promise
	 */
	BaseNodejsRunner.prototype._runProject = function(oConfiguration, oWindow) {
		var that = this;

		var mContext = {
			that: this,
			window: oWindow
		};
		this.context.service.nodejsLauncher.attachEvent("applicationRunning", this._onApplicationRunning, mContext);

		return this.context.service.nodejsLauncher.runProject(oConfiguration, this._sRunnerTypeId).then(function(mRunner) {
			// return Q.resolve(mRunner);
		}).fail(function(oError) {
			// detach event, otherwise we get events from other application starts
			that.context.service.nodejsLauncher.detachEvent("applicationRunning", that._onApplicationRunning, mContext);

			if (oWindow) {
				oWindow.close();
			}
			// that.context.service.usernotification.alert(oError.message ? oError.message : oError).done(); // don't show error message in
			// modal dialog, it's already visible in console
			// return Q.reject(oError); // don't raise error otherwise run configuration is marked as broken
		});
	};

	return BaseNodejsRunner;
});
