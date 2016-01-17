define(["sap/watt/saptoolsets/fiori/run/plugin/commonrunners/util/configEnum"], function(utilEnum) {
	"use strict";
	var runnerRunUtil = {
		configure : function() {
			this.context.service.preview.showPreview().fail(function() {
				// do nothing
			}).done();
			this.context.service.mockpreview.getRunnableMockSettings().fail(function() {
				// do nothng
			}).done();
		},
		
		readConfigurationFile: function(oConfiguration) {
			// Read configuration file:
			// --- Is mock
			var bIsMock = false;
			if (oConfiguration.dataMode === utilEnum.dataStates.withMock) {
				bIsMock = true;
			}

			// --- With / without frame
			var bNoFrame = true;
			if (oConfiguration.previewMode === utilEnum.displayStates.withPreview) {
				bNoFrame = false;
			}

			// --- Prefer Workspace
			var bWithWorkspace = false;
			if (oConfiguration.workspace === "withWorkspace") {
				bWithWorkspace = true;
			}
			var oAppForwarding = {
				bPreferWorkspace: bWithWorkspace
			};

			// --- Path of the file to run
			var sFilePath = oConfiguration.filePath;

			// --- Application URL parameters
			var oUrlParameters = oConfiguration.urlParameters;

			// --- Hash parameter
			var oHashParameter = oConfiguration.hashParameter;

			// --UI5 version
			var sUi5Version = oConfiguration.ui5ActiveVersion;
			var sUi5VerSource = oConfiguration.ui5VerSource;
			
			// --- SwitchBackend parameter
			var oSwitchBackendParameter = oConfiguration.backendSystem;

			// --Apps version
			var oAppsVersion = oConfiguration.appsVersion;

			var oRunConfiguration = {
				oAppsVersion: oAppsVersion,
				oUrlParameters: oUrlParameters,
				oHashParameter: oHashParameter,
				oAppForwarding: oAppForwarding,
				bIsMock: bIsMock,
				sUi5Version: sUi5Version,
				sUi5VerSource: sUi5VerSource,
				oSwitchBackendParameter : oSwitchBackendParameter
			};

			var runParameters = {
				bNoFrame: bNoFrame,
				sFilePath: sFilePath,
				oRunConfiguration: oRunConfiguration
			};
			return runParameters;
		},

		onRunError: function(oWindow, sErrorMessage) {
			if (oWindow) {
				oWindow.close();
			}
			this.context.service.usernotification.alert(sErrorMessage).done();
		},

		runHtmlFile: function(oWindow, oProjectDocument, oRunParameters) {
			var that = this;
			var oDocument = oProjectDocument;

			// In case of mock - get the runnable document from the mock service
			if (oRunParameters.oRunConfiguration.bIsMock) {
				// In case of mock - get the runnable document from the mock service
				var oMockpreviewService = this.context.service.mockpreview;
				return this.context.service.setting.project.get(oMockpreviewService).then(function(oSettings) {
					return oMockpreviewService.getRunnableMockSettings(oDocument, oSettings).then(function(oRunnableMockSettings) {
						return oMockpreviewService.buildRunnableDocument(oRunnableMockSettings, oDocument, oWindow).then(function(oNewDocument) {
							return that.context.service.preview.showPreview(oNewDocument, oWindow, oRunParameters.bNoFrame, null, oRunParameters.oRunConfiguration);
						});
					});
				});
			} else { // Run html without mock
				return that.context.service.preview.showPreview(oDocument, oWindow, oRunParameters.bNoFrame, null, oRunParameters.oRunConfiguration);
			}
		}

	};

	return runnerRunUtil;
});