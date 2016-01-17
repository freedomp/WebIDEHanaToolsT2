define(["sap/watt/saptoolsets/fiori/run/plugin/commonrunners/util/configEnum", "sap.watt.ideplatform.run/error/ConfigurationError"],
	function(utilEnum, ConfigurationError) {

		"use strict";
		var fioriRunner = {
			
			configure : function() {
				this.context.service.ushellsandboxpreview.showPreview().fail(function() {
					// do nothing
				}).done();
				this.context.service.destinationsutil.getNeoAppDestinations().fail(function() {
					// do nothing
				}).done();
				this.context.service.filesearchutil.getRunnableFiles().fail(function() {
        			// do nothing
        		}).done();
			},
			
			run: function(value, oWindow, aCustomData, oConfiguration, oRunnableDocument) {
				var that = this;
				var sErrorMessage;
				var oRunParameters = this._getRunParameters(oConfiguration);
				oRunParameters.oRunConfiguration.sRunnerId = "fiorirunner";
				if (oRunParameters.sFilePath) {
					if (oRunnableDocument) {
						if (that._isFiori(oRunnableDocument)) {
							//usage analytic 
							that._addUsageAnalytics(oRunParameters);
							// In case of Fiori use Fiori Sandbox runner
							return that.context.service.ushellsandboxpreview.showPreview(oRunnableDocument, oWindow, oRunParameters.bNoFrame,
								oRunParameters.oRunConfiguration).then(function() {
									that.context.service.usagemonitoring.report("runner", "preview", "sandboxrunner").done();
								});
						} else { // Not a Fiori runnable file - in case of html file use preview standard runner
							// Selected file is not a Fiori runnable file.
							sErrorMessage = that.context.i18n.getText("i18n", "file_not_fiori_error_msg");
							that._logAndThrowError(sErrorMessage);
						}
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
				var aBackendSystems = [];
				
				/* Get URL parameters - since URL parameters could be maintained under .project.json file,
            		try to get them from there */
				var oService = this.context.service;
				return oService.setting.project.get(oService.appparams, oDocument).then(function(oAppParameters) {
					var aAppParameters;
					if (oAppParameters) {
						aAppParameters = JSON.parse(JSON.stringify(oAppParameters));
					} else {
						aAppParameters = [];
					}
					// check if the selected document is one of the runnable file names
					var aRunnableFileNames = ["Component.js"];
					var sSelectedDocumentName = oDocument.getEntity().getName();
					if (aRunnableFileNames.indexOf(sSelectedDocumentName) > -1 ||
						(new RegExp(".*fiorisandboxconfig.*[.]json", "i").test(sSelectedDocumentName))) {
						// Selected document is runnable file name
						return {
							filePath: oDocument.getEntity().getFullPath(),
							previewMode: utilEnum.displayStates.withoutPreview,
							dataMode: utilEnum.dataStates.withoutMock,
							workspace: "withoutWorkspace",
							ui5ActiveVersion: null,
							ui5VerSource: null,
							isDefaultVersion: 0,
							urlParameters: aAppParameters,
							hashParameter: "",
							backendSystem: aBackendSystems
						};
					} else {
						// Selected document is not runnable file name, find runnable file name
						var oRunnableFiles = {
							include: ["Component.js"],
							exclude: []
						};
						return oService.filesearchutil.getRunnableFiles(oDocument, oRunnableFiles).then(function(aFioriFiles) {
							var sFilePath = null;
							if (aFioriFiles !== null && aFioriFiles !== undefined) {
								switch (aFioriFiles.length) {
									case 0:
										sFilePath = null;
										break;
									case 1:
										sFilePath = aFioriFiles[0].fullPath;
										break;
									default:
										if (!isRunConfigurationFlow) {
											// showpopup
											//TODO:
											if (sWindowId) {
												return oService.choosefilepopup.getContent(aFioriFiles, sWindowId).then(function(bSuccess) {
													if (bSuccess) {
														return oService.choosefilepopup.getResult().then(function(sFilePath) {
															return {
																filePath: sFilePath,
																previewMode: utilEnum.displayStates.withoutPreview,
																dataMode: utilEnum.dataStates.withoutMock,
																workspace: "withoutWorkspace",
																ui5ActiveVersion: null,
																ui5VerSource: null,
																isDefaultVersion: 0,
																urlParameters: aAppParameters,
																hashParameter: "",
																backendSystem: aBackendSystems
															};
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
								
								return {
									filePath: sFilePath,
									previewMode: utilEnum.displayStates.withoutPreview,
									dataMode: utilEnum.dataStates.withoutMock,
									workspace: "withoutWorkspace",
									ui5ActiveVersion: null,
									ui5VerSource: null,
									isDefaultVersion: 0,
									urlParameters: aAppParameters,
									urlParametersNotNeeded: false,
									hashParameter: "",
									backendSystem: aBackendSystems
								};
							}
						});
					}
				});
			},

			getConfigurationUi: function(oDocument) {
				var that = this;
				return {
					model: new sap.ui.model.json.JSONModel({}),
					getContent: function() {
						if (sap.watt.getEnv("server_type") === "local_hcproxy") {
							// Local installation Web IDE: hide all neo-app related sections 
							return that._getContentLocal(oDocument);
						} else if(sap.watt.getEnv("internal")) {
							// Internal Web IDE: Show all sections
							return that._getContentInternal(oDocument);
						} else {
							// External Web IDE: Hide Mock sections
							return that._getContentExternal(oDocument);
						}
					}
				};
			},

			isConfigurationValid: function(oConfiguration, oDocument) {
				return this.context.service.inputvalidatorutil.isConfigurationValid(oConfiguration, oDocument, this._aValidations);
			},

			_oRunnableFiles: {
				include: ["Component.js", ".*fiorisandboxconfig.*[.]json"],
				exclude: []
			},

			_aValidations: [{
				"isRegex": false,
				"rule": "Component.js"
			}, {
				"isRegex": true,
				"rule": ".*fiorisandboxconfig.*[.]json"
			}],
			
			_addUsageAnalytics: function(oRunParameters) {
				//usage analytic
				this.context.service.usagemonitoring.report("runner", "fiori_sandbox", oRunParameters.sFilePath.split("/")[1]).done();
				var sAnalyticsConfiguration = "";
				if (oRunParameters.bNoFrame) {
					sAnalyticsConfiguration += "_NoFrame";
				} else {
					sAnalyticsConfiguration += "_Frame";
				}
				if (oRunParameters.oRunConfiguration.bIsMock) {
					sAnalyticsConfiguration += "_Mock";
				}
				if (oRunParameters.oRunConfiguration.sUi5Version) {
					sAnalyticsConfiguration += "_ui5Version";
				}
				this.context.service.usagemonitoring.report("runner", "fiori_sandbox_config", sAnalyticsConfiguration).done();
			},			
			
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
				this.context.service.log.error("FioriRunner", sErrorMsg, ["user"]).done();
				throw new ConfigurationError(sErrorMsg);
			},

			_isFiori: function(oDocument) {
				var sName = null;
				var sType = null;
				if (oDocument) {
					sName = oDocument.getEntity().getName();
					sType = oDocument.getType();
				}
				return (sType === "file" && (sName === "Component.js" || new RegExp(".*fiorisandboxconfig.*\.json", "i").test(sName)));
			},

			// Get UI content for Local installation Web IDE - don't add the advenced settings tab
			_getContentLocal: function(oDocument) {
				// ======== Get data needed before calling the UI controls  
				var aPreloadServices = [];
				aPreloadServices.push(this.context.service.filesearchutil.getRunnableFiles(oDocument, this._oRunnableFiles));
				var that = this;
				// ======== Get the UI controls 
				return Q.all(aPreloadServices).spread(function(aFioriFiles) {
					var aUiControls = [];
					aUiControls.push(that.context.service.runconfig.filepath.getControl(oDocument, aFioriFiles, that._aValidations));
					// Get preview (with/without frame)  control
					aUiControls.push(that.context.service.runconfig.preview.getControl(oDocument));
					// Get Mock Data control
					aUiControls.push(that.context.service.runconfig.withmock.getControl(oDocument));
					// Get URL parameters control 
					aUiControls.push(that.context.service.runconfig.urlparameters.getControl());
					// ======== Build the run configuration UI
					return Q.all(aUiControls).spread(function(oFilePath, oPreview, oWithMock, oURLParameters) {
						return that._buildRunnerUi({
							oFilePath: oFilePath,
							oPreview: oPreview,
							oWithMock: oWithMock,
							oURLParameters: oURLParameters
						});
					});
				});

			},

			// Get UI content for External Web IDE: Hide mock section
			_getContentExternal: function(oDocument) {
				// ======== Get data needed before calling the UI controls  
				var aPreloadServices = this._getPreloadServices(oDocument);
				var that = this;
				// ======== Get the UI controls  
				return Q.all(aPreloadServices).spread(function(aFioriFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations, aTargetDestinations) {
					var aUiControls = that._getUiControls(false, oDocument, aFioriFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations,
						aTargetDestinations);
					// ======== Build the run configuration UI
					return Q.all(aUiControls).spread(function(oFilePath, oPreview, oURLParameters, oUi5Version, oDestinationMapping, oReuseLibsControl) {
						return that._buildRunnerUi({
							oFilePath: oFilePath,
							oPreview: oPreview,
							oURLParameters: oURLParameters,
							oUi5Version: oUi5Version,
							oDestinationMapping: oDestinationMapping,
							oReuseLibsControl: oReuseLibsControl
						});
					});
				});
			},

			// Get UI content for Internal Web IDE: Show all sections
			_getContentInternal: function(oDocument) {
			// ======== Get data needed before calling the UI controls  
			var aPreloadServices = this._getPreloadServices(oDocument);
				var that = this;
				// ======== Get the UI controls  
				return Q.all(aPreloadServices).spread(function(aFioriFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations, aTargetDestinations) {
					var aUiControls = that._getUiControls(true, oDocument, aFioriFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations,
						aTargetDestinations);
					// ======== Build the run configuration UI
					return Q.all(aUiControls).spread(function(oFilePath, oPreview, oWithMock, oURLParameters, oUi5Version, oDestinationMapping,
						oReuseLibsControl) {
						return that._buildRunnerUi({
							oFilePath: oFilePath,
							oPreview: oPreview,
							oWithMock: oWithMock,
							oURLParameters: oURLParameters,
							oUi5Version: oUi5Version,
							oDestinationMapping: oDestinationMapping,
							oReuseLibsControl: oReuseLibsControl
						});
					});
				});
			},

			// Retrieve data needed for the UI controls - relevant only for the Advenced Settings tab
			_getPreloadServices: function(oDocument) {
				var aPreloadServices = [];
				aPreloadServices.push(this.context.service.filesearchutil.getRunnableFiles(oDocument, this._oRunnableFiles));
				// Get data for UI5 Versions section
				aPreloadServices.push(this.context.service.UI5VersionsUtil.getUi5VersionsList(oDocument));
				aPreloadServices.push(this.context.service.UI5VersionsUtil.getUI5CurrentVersion(oDocument));
				// Get data for Destination Mapping section
				aPreloadServices.push(this.context.service.destinationsutil.getNeoAppDestinations(oDocument));
				aPreloadServices.push(this.context.service.destinationsutil.getHcpDestinations());
				return aPreloadServices;
			},

			// Relevant only for the Advenced Settings tab
			_getUiControls: function(bShowMock, oDocument, aFioriFiles, aUi5VersionsList, sUI5CurrentVersion, aSourceDestinations,
				aTargetDestinations) {
				var aUiControls = [];
				aUiControls.push(this.context.service.runconfig.filepath.getControl(oDocument, aFioriFiles, this._aValidations));
				// Get preview (with/without frame)  control
				aUiControls.push(this.context.service.runconfig.preview.getControl(oDocument));
				if (bShowMock) {
					// Get Mock Data control
					aUiControls.push(this.context.service.runconfig.withmock.getControl(oDocument));
				}
				// Get URL parameters control 
				aUiControls.push(this.context.service.runconfig.urlparameters.getControl());
				// Get UI5 Versions control
				aUiControls.push(this.context.service.runconfig.ui5versions.getControl(oDocument, aUi5VersionsList, sUI5CurrentVersion));
				// Get Destination Mapping control
				aUiControls.push(this.context.service.runconfig.destinationmapping.getControl(oDocument, aSourceDestinations,
					aTargetDestinations));
				// Get resource mapping control
				aUiControls.push(this.context.service.runconfig.resourcemapping.getControl(oDocument));
				return aUiControls;
			},

			_buildRunnerUi: function(oControls) {
				// --------- General grid ---------
				var oGeneralGrid = new sap.ui.layout.Grid({
					hSpacing: 0,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});
				// File Path section
				oGeneralGrid.addContent(oControls.oFilePath);
				// Preview (with/without frame) section
				oGeneralGrid.addContent(oControls.oPreview);
				if (oControls.oWithMock) {
					// Mock Data section
					oGeneralGrid.addContent(oControls.oWithMock);
				}
				var aRunnerUI = [{
					name: this.context.i18n.getText("i18n", "lbl_general"),
					content: oGeneralGrid
				}];
				// --------- Parameters grid ---------
				var oParametersGrid = new sap.ui.layout.form.SimpleForm({
					layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
					labelSpanL: 1,
					labelSpanM: 1
				});
				// URL Parameters section					
				oParametersGrid.addContent(oControls.oURLParameters);
				aRunnerUI.push({
					name: this.context.i18n.getText("i18n", "lbl_parameters"),
					content: oParametersGrid
				});
				// --------- Advenced Settings grid ---------
				if (oControls.oUi5Version && oControls.oDestinationMapping && oControls.oReuseLibsControl) {
					var oAdvencedSettingsGrid = new sap.ui.layout.form.SimpleForm({
						layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
						labelSpanL: 1,
						labelSpanM: 1
					});
					// Ui5 Versions section
					oAdvencedSettingsGrid.addContent(oControls.oUi5Version);
					// Destination Mapping section
					oAdvencedSettingsGrid.addContent(oControls.oDestinationMapping);
					// Reuse Libraries section
					oAdvencedSettingsGrid.addContent(oControls.oReuseLibsControl);
					aRunnerUI.push({
						name: this.context.i18n.getText("i18n", "lbl_advanced_setting"),
						content: oAdvencedSettingsGrid
					});
				}
				return aRunnerUI;
			}
		};
		return fioriRunner;
	});