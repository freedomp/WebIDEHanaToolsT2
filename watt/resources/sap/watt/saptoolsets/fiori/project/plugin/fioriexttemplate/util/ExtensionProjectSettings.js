define(["sap/watt/lib/lodash/lodash"], function(_) {
	
	return {

		/**
		 * Event handler subscribed to the generated event of the generation service.
		 * Writes the extensibility settings into the extension project settings.
		 */
		createExtensibilityProjectSettings: function(oGeneratedEvent, oSettingService, oParentProjectService, oFileSystemService,
			oUI5ProjectHandlerService, oMockPreviewService) {
			var that = this;

			if (!oGeneratedEvent.params.model.extensibility) {
				return Q();
			}

			// create the mockpreview block in .project.json
			return this.createMockPreview(oGeneratedEvent, oParentProjectService, oFileSystemService, oUI5ProjectHandlerService,
				oMockPreviewService).then(function() {
				// create the extensibility block in .project.json
				return that.createExtensibility(oGeneratedEvent, oSettingService).then(function() {
					// create the build block in .project.json
					return that.createBuild(oGeneratedEvent, oSettingService);
				});
			});
		},

		createExtensibility: function(oGeneratedEvent, oSettingService) {
			var oExtensibility = oGeneratedEvent.params.model.extensibility;

			// remove the path of the project.json from the extensibility block 
			oExtensibility.projectjson = undefined;

			var oTargetDocument = oGeneratedEvent.params.targetDocument;

			return oSettingService.project.setProjectSettings("extensibility", oExtensibility, oTargetDocument);
		},
		
		createBuild: function(oGeneratedEvent, oSettingService) {
			
			var oTargetDocument = oGeneratedEvent.params.targetDocument;
			
			var oBuildSettings = {
			    "targetFolder": "dist",
			    "sourceFolder": "webapp",
			    "buildRequired": true
			};
			
			return oSettingService.project.setProjectSettings("build", oBuildSettings, oTargetDocument);
		},

		createMockPreview: function(oGeneratedEvent, oParentProjectService, oFileSystemService, oUI5ProjectHandlerService, oMockPreviewService) {
			var model = oGeneratedEvent.params.model;

			if (model.metadataPath && !model.connectionData) {

				var system = model.extensibility.system;
				var that = this;

				// get the "mockPreview" block from the parent application project.json
				return oParentProjectService.getMockPreview(model, system).then(function(mockPreviewJson) {

					var oTargetDocument = oGeneratedEvent.params.targetDocument;

					// if the .project.json was found in the parent application, use its data, else - use our own default values
					if (!mockPreviewJson) {
						mockPreviewJson = {
							"mockUri": "",
							"loadCustomRequests": false,
							"loadJSONFiles": false,
							"metadataFilePath": "",
							"mockRequestsFilePath": ""
						};
					}
					// don't copy parent metadata path as the project structure may be different. Path is resolved when run with mock
					mockPreviewJson.metadataFilePath = "";
					if (mockPreviewJson.mockRequestsFilePath) {
						var index = mockPreviewJson.mockRequestsFilePath.lastIndexOf("/"); // take only the filename from original path
						mockPreviewJson.mockRequestsFilePath = "localService" + mockPreviewJson.mockRequestsFilePath.substring(index);
					}
					if (!mockPreviewJson.mockUri) {
						// if the parent application doesn't have the mockUri (or it is empty string), try to get it from its configuration files
						return that.getParentServiceUrl(oUI5ProjectHandlerService, model).then(function(sRelativeServiceUrl) {
							if (sRelativeServiceUrl && sRelativeServiceUrl.length > 0) {
								// found the service url - update it in the mockPreviewJson
								mockPreviewJson.mockUri = sRelativeServiceUrl;
							}
							// update the .project.json of the extension project
							return oMockPreviewService.updateSettings(oTargetDocument, mockPreviewJson);
						});
					}

					// update the .project.json of the extension project
					return oMockPreviewService.updateSettings(oTargetDocument, mockPreviewJson);
				});
			} else {
				return Q();
			}
		},

		getParentServiceUrl: function(oUI5ProjectHandlerService, model) {
			//get first datasource node of type OData (from app descriptor, Configuration.js or Component.js)
			return oUI5ProjectHandlerService.getDataSourcesByType(model.parentGuidelinesDocument, "OData").then(function(oDataSources) {
				var result;
				if (oDataSources) {
					var aValues = _.values(oDataSources);
					if (aValues[0]) {
						result = aValues[0].uri;
					}
				}
				return result;
			}).fail(function() {
				// failed to read the guidelines document or no data sources defined in the parent application
				return null;
			});
		}
	};
});