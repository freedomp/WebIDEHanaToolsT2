define(["sap.watt.ideplatform.run/error/ConfigurationError"], function(ConfigurationError) {
	"use strict";

	var oEmbeddedRunner = {
		// Constants
		_oConstants: {
			EMBEDDED_FOLDER_NAME: ".proxy",
			README_FILE_NAME: "readme.txt",
			NEOAPP_FILE_NAME: "neo-app.json",
			SRC_ENTRY_PATH: "src/main/webapp",
			WEBAPP_ENTRY_PATH: "webapp",
			REUSELIB_PROJECT_TYPE: "com.watt.uitools.plugin.reuselibrary"
		},
		// The routes of the embedded neo-app.json file
		_aRoutes: [],

		run: function(value, oWindow, aCustomData, oConfiguration, oRunnableDocument) {
			var that = this;
			var oPreviewService = that.context.service.ushellpreview;
			var aPromises = [];
			that._aRoutes = [];

			//Making sure FLP app name is in lowercase
			oConfiguration.flpAppName = oConfiguration.flpAppName.toLowerCase();

            //when embeddded mode FLP@HCP
			if (oConfiguration.emdType === "HCP") {
				return oPreviewService.showPreviewEmbeddedFlp(oRunnableDocument, oWindow,oConfiguration);
			}
			/**
			 * Iterate over all additional workspace projects.
			 * */
			jQuery.each(oConfiguration.workspaceApplications, function(i, oApplication) {
				// Making sure that each application has a project.json file with the "hcpdeploy" block
				var pApplication = that._handleProjectJsonFile(oApplication.localPath).then(function(oWorkspaceAppInfo) {
					//Making sure BSP app name is in lowercase
					oWorkspaceAppInfo.sBspName = oApplication.bspName.toLowerCase();
					// Create the routes to be added later to the new neo-app file
					return that._appendWorkspaceAppRoutes(oWorkspaceAppInfo);
				});
				aPromises.push(pApplication);
			});

			/**
			 * Handling the main project and run the preview.
			 * */
			return Q.all(aPromises).then(function() {
				// Making sure that the main application has a project.json file with the "hcpdeploy" block
				return that._handleProjectJsonFile(oConfiguration.filePath).then(function(oOriginAppInfo) {
					// Create the new neo-app file
					return that._handleNeoAppFile(oConfiguration, oOriginAppInfo.sLocalAppName).then(function(oEmbeddedFolder) {
						return that._generateReadMeFile(oEmbeddedFolder).then(function() {
							// Usage analytics
							that.context.service.usagemonitoring.report("runner", "embedded", "true").done();
							return oPreviewService.showPreviewEmbedded(oEmbeddedFolder, oWindow,
								oConfiguration).then(function() {
								that.context.service.usagemonitoring.report("runner", "preview", "embeddedrunner").done();
							});
						});
					});
				});

				// Error handling
			}).fail(function(oError) {
				this.context.service.log.error("EmbeddedModeRunner", oError.message, ["user"]).done();
				var sErrorMessage = that.context.i18n.getText("i18n", "config_error_msg");
				throw new ConfigurationError(sErrorMessage);
			});
		},

		/**
		 * Generates readme file which explain the existence of a ".proxy" folder in the user's workspace.
		 * */
		_generateReadMeFile: function(oEmbeddedFolder) {
			var that = this;
			return oEmbeddedFolder.touch(that._oConstants.README_FILE_NAME).then(function(oFile) {
				var sContent = that.context.i18n.getText("i18n", "embedded_readme_content");
				return oFile.setContent(sContent).then(function() {
					return oFile.save();
				});
			});
		},

		/**
		 * This handling process contains two main stages:
		 * 1. Generating "hcpdeoploy" block if such one dosen't exist.
		 * 2. Checking if the project is of type reuse lib and, in this case, add a library-preload suffix.
		 * */
		_handleProjectJsonFile: function(sPath) {
			var that = this;
			var oDocumentService = that.context.service.filesystem.documentProvider;
			return oDocumentService.getDocument(sPath).then(function(oDocument) {
				if (oDocument) {
					// 1
					return that._generateHcpdeployBlock(oDocument).then(function(oAppInfo) {
						// 2
						return that._handleSuffix(oDocument, oAppInfo);
					});
				}
			});
		},

		/**
		 * Method who checks if .project.json file contains "hcpdeploy" block. if not - it's generating it.
		 * @return - AppInfo object who keeps all the relevant info of the project to continue the embedded process.
		 * */
		_generateHcpdeployBlock: function(oDocument) {
			var that = this;
			var oDocProvider = this.context.service.filesystem.documentProvider;
			var oSystemService = that.context.service.system;
			var oSettingService = that.context.service.setting.project;
			var sHcpDeployBlockName = "hcpdeploy";
			return oSystemService.getSystemInfo().then(function(oResult) {
				return oSettingService.getProjectSettings(sHcpDeployBlockName, oDocument).then(function(oHcpdeploy) {
					if (oHcpdeploy && oHcpdeploy.entryPath) {
						return that._addHcpdeployBlock(oHcpdeploy, oHcpdeploy.entryPath, oDocument, oResult, oResult, oSettingService,
							sHcpDeployBlockName);
					} else {
						return oDocument.getProject().then(function(oProject) {
							var sProjectPath = oProject.getEntity().getFullPath();
							// check if "../src/main/webapp" folder exists
							var sFolderPath = sProjectPath + "/src/main/webapp";
							return oDocProvider.getDocument(sFolderPath).then(function(oSrcFolderPath) {
								if (oSrcFolderPath) {
									return that._addHcpdeployBlock(oHcpdeploy, that._oConstants.SRC_ENTRY_PATH, oDocument, oResult, oSettingService,
										sHcpDeployBlockName);
								} else {
									// check if "../webapp" folder exists
									sFolderPath = sProjectPath + "/webapp";
									return oDocProvider.getDocument(sFolderPath).then(function(oWebappFolderPath) {
										if (oWebappFolderPath) {
											return that._addHcpdeployBlock(oHcpdeploy, that._oConstants.WEBAPP_ENTRY_PATH, oDocument, oResult, oSettingService,
												sHcpDeployBlockName);
										} else {
											return that._addHcpdeployBlock(oHcpdeploy, "", oDocument, oResult, oSettingService, sHcpDeployBlockName);
										}
									});
								}
							});
						});
					}
				});
			});
		},

		/**
		 * this method adds HCP Deploy Block into project settings section
		 * @return - Updated AppInfo object who keeps all the relevant info of the project to continue the embedded process.
		 * */
		_addHcpdeployBlock: function(oHcpdeploy, sEntryPath, oDocument, oResult, oSettingService, sHcpDeployBlockName) {
			var oAppInfo = {};
			oAppInfo.sLocalAppName = oHcpdeploy ? oHcpdeploy.name : oDocument.getEntity().getFullPath().split("/")[1].replace(/\./g, "").toLowerCase();
			oAppInfo.sEntryPath = sEntryPath;
			oAppInfo.sAccount = oHcpdeploy ? oHcpdeploy.account : oResult.sAccount;
			oAppInfo.sSuffix = "";
			if (!oHcpdeploy) {
				var oNewHcpdeploy = {
					"account": oAppInfo.sAccount,
					"name": oAppInfo.sLocalAppName,
					"lastVersionWeTriedToDeploy": "1",
					"entryPath": oAppInfo.sEntryPath
				};
				return oSettingService.setProjectSettings(sHcpDeployBlockName, oNewHcpdeploy, oDocument).then(function() {
					return oAppInfo;
				});
			}
			return oAppInfo;
		},

		/**
		 * Method who checks if .project.json file contains "projectType" block. if it does - it's search for reuse lib type
		 * @return - Updated AppInfo object who keeps all the relevant info of the project to continue the embedded process.
		 * */
		_handleSuffix: function(oDocument, oAppInfo) {
			var that = this;
			var oSettingService = that.context.service.setting.project;
			var sNamespaceBlockName = "projectType";
			return oSettingService.getProjectSettings(sNamespaceBlockName, oDocument).then(function(oProjectType) {
				if (oProjectType) {
					for (var i = 0; i < oProjectType.length; i++) {
						var sProjectType = oProjectType[i];
						if (sProjectType === that._oConstants.REUSELIB_PROJECT_TYPE) {
							oAppInfo.sSuffix = "/library-preload.json";
							break;
						}
					}
				}
				return oAppInfo;
			});
		},

		/**
		 * Method who handling the nep-app.json file of the origin (main) project.
		 * It removes unnecessary routes and adds the origin project routes.
		 * Finally, when the embedded routes are done, it creates the new neo-app.json under the "/.proxy" folder, and call the preview.
		 * @return - Embedded folder with updated neo-app.json file
		 * */
		_handleNeoAppFile: function(oConfiguration, sLocalAppName) {
			var that = this;
			var sPath = oConfiguration.filePath;
			var oNeoappService = that.context.service.neoapp;
			var oDocumentService = that.context.service.filesystem.documentProvider;

			// Get all routes from the app neo-app.json file
			return oDocumentService.getDocument(sPath).then(function(oDocument) {
				return oNeoappService.getNeoappDocumentAndContent(oDocument).spread(function(oNeoappDocument, oNeoappContent) {
					var aRoutes = oNeoappContent.routes;
					that._removeSAProutes(aRoutes);
					// Add the needed routes for the embedded mode
					var oOriginAppData = {
						aDestinations: aRoutes,
						sFlpAppName: oConfiguration.flpAppName,
						sFlpDestName: oConfiguration.flpDestName,
						sLocalAppName: sLocalAppName
					};
					that._appendOriginAppRoutes(oOriginAppData);
					var oNeoapp = {};
					oNeoapp.routes = that._aRoutes.concat(aRoutes);
					// Make sure lrep headers are being forwarded
					oNeoapp.headerWhiteList = ["X-UI5-Component"];

					// Create the new neo-app.json under the "/.proxy" folder
					return that._getEmbeddedFolder().then(function(oEmbeddedFolder) {
						return oEmbeddedFolder.touch(that._oConstants.NEOAPP_FILE_NAME).then(function(oFile) {
							var sContent = JSON.stringify(oNeoapp);
							return that.context.service.beautifier.beautify(sContent).then(function(sOutput) {
								return oFile.setContent(sOutput).then(function() {
									return oFile.save().then(function() {
										return oEmbeddedFolder;
									});
								});
							});
						});
					});
				});
			});
		},

		/**
		 * Remove all routes starting with "/sap"
		 * */
		_removeSAProutes: function(aRoutes) {
			for (var i = 0; i < aRoutes.length; i++) {
				if (aRoutes[i].path.indexOf("/sap") === 0) {
					aRoutes.splice(i, 1);
				}
			}
		},

		/**
		 * Appended to the embedded routes array the necessary routes of the current workspace project.
		 * */
		_appendWorkspaceAppRoutes: function(oWorkspaceAppData) {
			if (oWorkspaceAppData.sSuffix) {
				this._aRoutes.push({
					"path": "/sap/bc/ui5_ui5/sap/" + oWorkspaceAppData.sBspName + oWorkspaceAppData.sSuffix,
					"target": {
						"type": "destination",
						"name": ""
					}
				});
			}
			this._aRoutes.push({
				"path": "/sap/bc/ui5_ui5/sap/" + oWorkspaceAppData.sBspName,
				"target": {
					"type": "application",
					"name": oWorkspaceAppData.sLocalAppName
				},
				"description": "Route to application in local workspace"
			});
		},

		/**
		 * Appended to the embedded routes array the necessary routes of the origin (main) project.
		 * */
		_appendOriginAppRoutes: function(oOriginAppData) {
			oOriginAppData.aDestinations.push({
				"path": "/sap/bc/ui5_ui5/sap/" + oOriginAppData.sFlpAppName,
				"target": {
					"type": "application",
					"name": oOriginAppData.sLocalAppName
				},
				"description": "Route to application in local workspace"
			});
			oOriginAppData.aDestinations.push({
				"path": "/sap",
				"target": {
					"type": "destination",
					"name": oOriginAppData.sFlpDestName,
					"entryPath": "/sap"
				}
			});
		},

		/**
		 * Searches for ".proxy" folder in the user's workspace. In case such folder dosen't exist, we create it.
		 * @return - The ".proxy" folder document
		 * */
		_getEmbeddedFolder: function() {
			var that = this;
			var oDocumentService = this.context.service.filesystem.documentProvider;
			return oDocumentService.getDocument("/" + that._oConstants.EMBEDDED_FOLDER_NAME).then(function(oResult) {
				if (!oResult) {
					return oDocumentService.getDocument("/").then(function(oWorkspaceRoot) {
						return oWorkspaceRoot.createFolder(that._oConstants.EMBEDDED_FOLDER_NAME);
					});
				}
				return oResult;
			});
		},

		_createEmptyUrlParamModel: function() {
			// By default 2 empty entries should be proposed and displayed
			return [{
				"paramName": "",
				"paramValue": "",
				"paramActive": false
			}, {
				"paramName": "",
				"paramValue": "",
				"paramActive": false
			}];
		},

		createDefaultConfiguration: function(oDocument) {
			var that = this;
			var oEmbeddedUtil = this.context.service.embeddedrunnerutil;
			return oEmbeddedUtil.getDefaultAppName(oDocument).then(function(sDefaultAppName) {
				return oEmbeddedUtil.getDefaultDestName(oDocument).then(function(sDefaultDestName) {
					return that.context.service.system.getSystemInfo().then(function(systemInfo) {
						return {
							flpAppName: sDefaultAppName,
							flpDestName: sDefaultDestName,
							hcpAccount: systemInfo.sAccount,
							flpName: "",
							hcpProvider: "",
							emdType: "ABAP",
							filePath: oDocument.getEntity().getFullPath(),
							workspaceApplications: [],
							oUrlParameters: [],
							urlParametersNotNeeded: false,
							oHashParameter: ""
						};
					});
				});
			});
		},

		getConfigurationUi: function(oDocument) {
			var that = this;
			return {
				model: new sap.ui.model.json.JSONModel({}),
				getContent: function() {
					var oConfigurationUiElements;
					oConfigurationUiElements = {
						"sRunnerId": "embeddedrunner",
						"iSAPFioriLaunchpadSection": 1
						// "iAdditionalApplicationsFromWsSection": 2,
						// "iUrlParameters": 3
					};
					return that.context.service.embeddedrunnerconfigui.getContent(oConfigurationUiElements, null, oDocument).then(function(
						oGeneral) {
						var aEmdModeUI = [{
							name: that.context.i18n.getText("i18n", "lbl_general"),
							content: oGeneral
						}];
						return that.context.service.runconfig.urlparameters.getControl().then(function(oURLParameters) {
							// --------- Parameters grid ---------
							var oParametersGrid = new sap.ui.layout.form.SimpleForm({
								layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
								labelSpanL: 1,
								labelSpanM: 1
							});
							oParametersGrid.addContent(oURLParameters);
							aEmdModeUI.push({
								name: that.context.i18n.getText("i18n", "lbl_parameters"),
								content: oParametersGrid
							});
							oConfigurationUiElements = {
								"sRunnerId": "embeddedrunner",
								"iAdditionalApplicationsFromWsSection": 1
								// "iUrlParameters": 2
							};
							return that.context.service.embeddedrunnerconfigui.getContent(oConfigurationUiElements, null, oDocument).then(function(
								oAdvSetting) {
								aEmdModeUI.push({
									name: that.context.i18n.getText("i18n", "lbl_advanced_setting"),
									content: oAdvSetting
								});
								return aEmdModeUI;
							});
						});
					});
				},
				// var that = this;
				// return {
				// 	model: new sap.ui.model.json.JSONModel({}),
				// 	getContent: function() {
				// 		var self = this;
				// 		var oConfigurationUiElements;
				// 		oConfigurationUiElements = {
				// 			"sRunnerId": "embeddedrunner",
				// 			"iSAPFioriLaunchpadSection": 1,
				// 			"iAdditionalApplicationsFromWsSection": 2,
				// 			"iUrlParameters": 3
				// 		};
				// 		return that.context.service.embeddedrunnerconfigui.getContent(oConfigurationUiElements, null, oDocument).then(function(
				// 			oConfigUi) {
				// 			return oConfigUi.setModel(self.model);
				// 		});
				// 	},
				setConfiguration: function(configuration) {
					if (!configuration.workspaceApplications) {
						configuration.workspaceApplications = [];
					}
					if (!configuration.oUrlParameters || configuration.oUrlParameters.length === 0) {
						configuration.oUrlParameters = that._createEmptyUrlParamModel();
					} else {
						// if parameter name and value are empty and it was marked as selected - unselect this parameter
						var bHasValidPerameterEntry = false;
						for (var i = 0; i < configuration.oUrlParameters.length; i++) {
							var urlParameterEntry = configuration.oUrlParameters[i];
							if (/^\s*$/.test(urlParameterEntry.paramName) && (/^\s*$/.test(urlParameterEntry.paramValue)) && urlParameterEntry.paramActive) {
								urlParameterEntry.paramActive = false;
							} else if (/^\s*$/.test(urlParameterEntry.paramName) && !(/^\s*$/.test(urlParameterEntry.paramValue)) && urlParameterEntry.paramActive) {
								bHasValidPerameterEntry = true;
							}
						}
						if (bHasValidPerameterEntry) {
							// If we have at least one valid url parameter - delete rest empty parameters
							configuration.oUrlParameters = configuration.oUrlParameters.filter(function(o) {
								if ((/^\s*$/.test(o.paramName)) && (/^\s*$/.test(o.paramValue))) {
									return false;
								} else {
									return true;
								}
							});
						}
					}
					this.model.setData(configuration);

				},
				getConfiguration: function() {
					// Delete empty parameters
					var aUrlParameters = this.model.getProperty("/oUrlParameters");
					if (aUrlParameters) {
						var aNewUrlParameters = aUrlParameters.filter(function(o) {
							return o.paramName;
						});
						this.model.setProperty("/oUrlParameters", aNewUrlParameters);
					}
					return this.model.getData();
				}
			};
		},

		isConfigurationValid: function(oConfiguration) {
			if (oConfiguration) {
				if (oConfiguration.workspaceApplications) {
					for (var i = 0; i < oConfiguration.workspaceApplications.length; i++) {
						var oApp = oConfiguration.workspaceApplications[i];
						if (oApp.localPath === "" || oApp.bspName === "") {
							return false;
						}
					}
				}
				return (!!oConfiguration.flpDestName && oConfiguration.flpDestName !== "" && oConfiguration.flpAppName !== "");
			} else {
				return false;
			}
		}
	};
	return oEmbeddedRunner;
});