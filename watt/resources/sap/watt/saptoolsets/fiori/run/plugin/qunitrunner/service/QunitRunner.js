define(["sap/watt/lib/lodash/lodash", "sap/watt/saptoolsets/fiori/run/plugin/commonrunners/util/configEnum",
	"sap.watt.ideplatform.run/error/ConfigurationError"
], function(_, utilEnum, ConfigurationError) {
	"use strict";
	var testRunner = {
		run: function(value, oWindow, aCustomData, oConfiguration, oRunnableDocument) {
			var that = this;
			var sErrorMessage;
			 
			var oRunParameters = this._getRunParameters(oConfiguration);
			if (oRunParameters.sFilePath) {
				if (oRunnableDocument) {
					//usage analytics 
					that.context.service.usagemonitoring.report("runner", "unit_test", oRunParameters.sFilePath.split("/")[1]).done();
					that.context.service.usagemonitoring.report("runner", "preview", "qunitrunner").done();
					return that.context.service.preview.showPreview(oRunnableDocument, oWindow, oRunParameters.bNoFrame, null, oRunParameters.oRunConfiguration).then(function() {
						that.context.service.usagemonitoring.report("runner", "preview", "qunitrunner").done();
					});
				} else {
					// File <sFilePath> does not exist. Check path in run configuration <config >.
					sErrorMessage = that.context.i18n.getText("i18n", "file_not_found_error_msg", [oRunParameters.sFilePath, oConfiguration._metadata
						.displayName
					]);
					that._logAndThrowError(sErrorMessage);
				}
			} else {
				sErrorMessage = that.context.i18n.getText("i18n", "file_null_error_msg", [oConfiguration._metadata.displayName]);
				that._logAndThrowError(sErrorMessage);
			}
		},

		createDefaultConfiguration: function(oDocument, isRunConfigurationFlow, sWindowId) {
			var that = this;
			//if the selected file is testsuite.qunit.html or qunit.html file create configuration with it
			if (oDocument != null) {
				var aBackendSystems = [];
				var sFilePath = oDocument.getEntity().getFullPath();
				if (that._isHtmlFile(oDocument)) {
					return that._buildDefaultConfigObj(sFilePath, aBackendSystems);
				}
				sFilePath = null;
				return that._getUnitTestFiles(oDocument).then(function(aTestFiles) {
					switch (aTestFiles.length) {
						case 0:
							sFilePath = null;
							break;
						case 1:
							sFilePath = aTestFiles[0].fullPath;
							break;
						default:
							if (!isRunConfigurationFlow) {
								//Show pop-up
								//TODO:
								if (sWindowId) {
									return that.context.service.choosefilepopup.getContent(aTestFiles, sWindowId).then(function(bSuccess) {
										if (bSuccess) {
											return that.context.service.choosefilepopup.getResult().then(function(sChosenPath) {
												return that._buildDefaultConfigObj(sChosenPath, aBackendSystems);
											});
										} else {
											return null;
										}
									});
								}
								//TODO:
								return null;
							}
					}
					return that._buildDefaultConfigObj(sFilePath, aBackendSystems);
				});
				
			}
			return null;
		},

		getConfigurationUi: function(oDocument) {
			var that = this;
			return {
				getContent: function () {				
					if (sap.watt.getEnv("server_type") === "local_hcproxy") {
						// Local installation Web IDE: hide all neo-app related sections 
						return that._getContentLocal(oDocument);
					 } else {
					 	// Internal or External Web IDE: Show all sections
						return that._getContentExternalInternal(oDocument);
					 }
				}
			};
		},

		_oRunnableFiles: {
			include: [".*[.]html$"],
			exclude: ["mock_preview_sapui5.html", "visual_ext_index.html"]
		},
		
		_aValidations: [{
			"isRegex": false,
			"rule": ".html"
		}],

		_getRunParameters : function(oConfiguration) {
			var oAppForwarding = {
				bPreferWorkspace: oConfiguration.workspace === "withWorkspace"
			};
			var oRunConfiguration = {
				oAppsVersion: oConfiguration.appsVersion,
				oUrlParameters: oConfiguration.urlParameters,
				oHashParameter: oConfiguration.hashParameter,
				oAppForwarding: oAppForwarding,
				bIsMock: oConfiguration.dataMode === 0,
				sUi5Version: oConfiguration.ui5ActiveVersion,
				sUi5VerSource: oConfiguration.ui5VerSource,
				oSwitchBackendParameter : oConfiguration.backendSystem
			};

			var oRunParameters = {
				bNoFrame: oConfiguration.previewMode === 1,
				sFilePath: oConfiguration.filePath,
				oRunConfiguration: oRunConfiguration
			};
			
			return oRunParameters;
		},
		
		_logAndThrowError: function(sErrorMsg) {
			this.context.service.log.error("QunitRunner", sErrorMsg, ["user"]).done();
			throw new ConfigurationError(sErrorMsg);
		},

		_getUnitTestFiles: function(oDocument) {
			var that = this;
			return that.context.service.filesearchutil.getRunnableFiles(oDocument, that._oRunnableFiles).then(function(aHtmlFiles) {
				return that._getRelevantTestFiles(aHtmlFiles);
			});
		},

		_buildDefaultConfigObj: function(sFilePath, aBackendSystems) {
			return {
				filePath: sFilePath,
				previewMode: utilEnum.displayStates.withoutPreview,
				dataMode: utilEnum.dataStates.withoutMock,
				ui5ActiveVersion: null,
				ui5VerSource: null,
				workspace: "withoutWorkspace",
				urlParameters: null,
				backendSystem: aBackendSystems
			};
		},

		_getRelevantTestFiles: function(aHtmlFiles) {
			var that = this;
			var aTestFiles = [];
			if (aHtmlFiles != null && aHtmlFiles.length > 0) {
				_.each(aHtmlFiles, function(oHtmlFile) {
					var sFileName = oHtmlFile.name;
					if (that._isTestFile(sFileName) === true) {
						aTestFiles.push(oHtmlFile);
					}
				});
			}
			return aTestFiles;
		},

		_isHtmlFile: function(oDocument) {
			if (oDocument.getType() === "file" && oDocument.getEntity().getFileExtension() === "html") {
				return true;
			}
			return false;
		},

		_aSearchSubstrings: ["qunit", "testsuite"],

		_isTestFile: function(sFileName) {
			var that = this;
			var iLength = that._aSearchSubstrings.length;
			for (var i = 0; i < iLength; i++) {
				var sWantedSubstring = that._aSearchSubstrings[i];
				var res = sFileName.search(sWantedSubstring);
				if (res !== -1) {
					return true;
				}
			}
			return false;
		},
		
		isConfigurationValid: function(oConfiguration) {
			var bValid = false;
			if (oConfiguration && oConfiguration.filePath) {
				var sPath = oConfiguration.filePath;
				if (!sPath || /^\s*$/.test(sPath)) {
					bValid = false;
				} else {
					bValid = true;
				}
			}
			return bValid;
		},

		_isInternal: function() {
			var isInternal = false;
			if (sap.watt.getEnv("server_type") !== "local_hcproxy" &&
				sap.watt.getEnv("internal") === true) {
				// internal application
				isInternal = true;
			}
			return isInternal;
		},

		// Get UI content for Local installation Web IDE - don't add the advenced settings tab
		_getContentLocal: function (oDocument) {
			// ======== Get data needed before calling the UI controls  
			var aPreloadServices = [];
			aPreloadServices.push(this._getUnitTestFiles(oDocument));
			var that = this;
			// ======== Get the UI controls  
			return Q.all(aPreloadServices).spread(function (aHtmlFiles) {
				var aUiControls = [];
				aUiControls.push(that.context.service.runconfig.filepath.getControl(oDocument, aHtmlFiles,that._aValidations)); // PostIndex = 0

				// ======== Build the run configuration UI
				return Q.all(aUiControls).spread(function (oFilePath) {
					// --------- General grid ---------
					var oGeneralGrid = new sap.ui.layout.Grid({
						hSpacing: 0,
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						})
					});
					// File Path section
					oGeneralGrid.addContent(oFilePath);
					// --------- Add grids to the main tabs UI ---------
					var aRunnerUI = [{
						name: that.context.i18n.getText("i18n", "lbl_general"),
						content: oGeneralGrid
					}];
					return aRunnerUI;
				});
			});
		},

		// Get UI content for Internal or External Web IDE: Show all sections
		_getContentExternalInternal: function (oDocument) {
			// ======== Get data needed before calling the UI controls  
			var aPreloadServices = [];
			aPreloadServices.push(this._getUnitTestFiles(oDocument));
			// Get data for UI5 Versions section
			aPreloadServices.push(this.context.service.UI5VersionsUtil.getUi5VersionsList(oDocument));
			aPreloadServices.push(this.context.service.UI5VersionsUtil.getUI5CurrentVersion(oDocument));
			// Get data for Destination Mapping section
			aPreloadServices.push(this.context.service.destinationsutil.getNeoAppDestinations(oDocument));
			aPreloadServices.push(this.context.service.destinationsutil.getHcpDestinations());

			var that = this;
			// ======== Get the UI controls
			return Q.all(aPreloadServices).spread(function (aHtmlFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations, aTargetDestinations) {
				var aUiControls = [];
				aUiControls.push(that.context.service.runconfig.filepath.getControl(oDocument, aHtmlFiles, that._aValidations));
				// Get UI5 Versions control
				aUiControls.push(that.context.service.runconfig.ui5versions.getControl(oDocument, aUi5VersionsList, sUI5CurrentVersion));
				// Get Destination Mapping control
				aUiControls.push(that.context.service.runconfig.destinationmapping.getControl(oDocument, aSourceDestinations,
					aTargetDestinations));
				// Get resource mapping control
				aUiControls.push(that.context.service.runconfig.resourcemapping.getControl(oDocument));

				// ======== Build the run configuration UI
				return Q.all(aUiControls).spread(function (oFilePath, oUi5Version, oDestinationMapping, ReuseLibsControl) {
					// --------- General grid ---------
					var oGeneralGrid = new sap.ui.layout.Grid({
						hSpacing: 0,
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						})
					});

					// File Path section
					oGeneralGrid.addContent(oFilePath);
					// --------- Advenced Settings grid ---------
					var oAdvencedSettingsGrid = new sap.ui.layout.form.SimpleForm({
						layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
						labelSpanL: 1,
						labelSpanM: 1
					});
					// Ui5 Versions section
					oAdvencedSettingsGrid.addContent(oUi5Version);
					// Destination Mapping section
					oAdvencedSettingsGrid.addContent(oDestinationMapping);
					// Reuse Libraries section
					oAdvencedSettingsGrid.addContent(ReuseLibsControl);
					// --------- Add grids to the main tabs UI ---------
					var aRunnerUI = [{
						name: that.context.i18n.getText("i18n", "lbl_general"),
						content: oGeneralGrid
					}];
					aRunnerUI.push({
						name: that.context.i18n.getText("i18n", "lbl_advanced_setting"),
						content: oAdvencedSettingsGrid
					});
					return aRunnerUI;
				});
			});
		}
	};

	return testRunner;

});