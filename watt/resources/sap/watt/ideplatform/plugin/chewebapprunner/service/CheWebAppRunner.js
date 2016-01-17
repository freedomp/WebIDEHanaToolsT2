define(["sap/watt/lib/lodash/lodash", "sap/watt/ideplatform/plugin/commonrunners/util/configEnum",
	"sap.watt.ideplatform.run/util/DocumentWindowsUtil", "sap.watt.ideplatform.run/error/ConfigurationError"
], function(_, utilEnum,
	DocumentWindowsUtil, ConfigurationError) {

	"use strict";
	var CheWebAppRunner = {

		_oRunnableFiles: {
			include: [".*resources.*[.]html$"],
			exclude: ["mock_preview_sapui5.html", "visual_ext_index.html"]
		},
		
		configure : function() {
			this._prepareServices();
		},
		
		_prepareServices : function() {
			this.context.service.basefilesearchutil.getRunnableFiles().fail(function() {
				// do nothing
			}).done();	
			this.context.service.baserunnerrunutil.runHtmlFile().fail(function() {
				// do nothing
			}).done();
			this.context.service.baseinputvalidatorutil.isConfigurationValid().fail(function() {
				// do nothing
			}).done();
		},
		
		run: function(value, oWindow, aCustomData, oConfiguration, oRunnableDocument) {
			var that = this;
			var sErrorMessage;
			var oRunParameters = this._getRunParameters(oConfiguration);
			if (oRunParameters.sFilePath) {
				if (oRunnableDocument) {
					//set Application relative path (relative to resources folder)
					oRunParameters.oRunConfiguration.sRelativePath = oRunParameters.sFilePath.replace(/.*resources\//g, "/");
					return that.context.service.baserunnerrunutil.runHtmlFile(oWindow, oRunnableDocument, oRunParameters).fail(function() {
						// Runtime flow failed - the error message was already logged. There is nothing to change/fix in the configuration. 
					});
				} else {
					// File <sFilePath> does not exist. Check path in run configuration <config >.
					sErrorMessage = that.context.i18n.getText("i18n", "file_not_found_error_msg", [oRunParameters.sFilePath, oConfiguration._metadata
					.displayName]);
					that._logAndThrowError(sErrorMessage);
				}
			} else {
				sErrorMessage = that.context.i18n.getText("i18n", "file_null_error_msg", [oConfiguration._metadata.displayName]);
				that._logAndThrowError(sErrorMessage);
			}
		},

		_getRunParameters : function(oConfiguration) {
			var oRunConfiguration = {
				oUrlParameters: oConfiguration.urlParameters,
				oHashParameter: oConfiguration.hashParameter
			};
			
			var oRunParameters = {
				bNoFrame: oConfiguration.previewMode === 1,
				sFilePath: oConfiguration.filePath,
				oRunConfiguration: oRunConfiguration
			};
			return oRunParameters;
		},

		_logAndThrowError: function(sErrorMsg) {
			this.context.service.log.error("CheWebAppRunner", sErrorMsg, ["user"]).done();
			throw new ConfigurationError(sErrorMsg);
		},

		createDefaultConfiguration: function(oDocument, isRunConfigurationFlow, sWindowId) {
			var that = this;
			var aAppParameters = [];
			//if the selected file is html file create configuration with it
			var sFilePath = oDocument.getEntity().getFullPath();
			if (that._isHtmlFile(sFilePath)) {
				return {
					filePath: sFilePath,
					previewMode: utilEnum.displayStates.withoutPreview,
					isDefaultVersion: 0,
					urlParameters: aAppParameters,
					urlParametersNotNeeded: false
				};
			}
			sFilePath = null;
			return that.context.service.basefilesearchutil.getRunnableFiles(oDocument, that._oRunnableFiles).then(function(aHtmlFiles) {
				if (aHtmlFiles !== null && aHtmlFiles !== undefined) {
					switch (aHtmlFiles.length) {
						case 0:
							sFilePath = null;
							break;
						case 1:
							sFilePath = aHtmlFiles[0].fullPath;
							break;
						default:
							if (!isRunConfigurationFlow) {
								// show pop-up
								return that.context.service.basechoosefilepopup.getContent(aHtmlFiles, sWindowId).then(function(bSuccess) {
									if (bSuccess) {
										return that.context.service.basechoosefilepopup.getResult().then(function(sFilePath) {
											return {
												filePath: sFilePath,
												previewMode: utilEnum.displayStates.withoutPreview,
												isDefaultVersion: 0,
												urlParameters: aAppParameters
											};
										});
									} else {
										return null;
									}
								});
							}
					}
					return {
						filePath: sFilePath,
						previewMode: utilEnum.displayStates.withoutPreview,
						isDefaultVersion: 0,
						urlParameters: aAppParameters
					};
				}
			});
		},

		getConfigurationUi: function(oDocument) {
			var that = this;
			return {
				model: new sap.ui.model.json.JSONModel({}),
				// Return array of UI controls
				getContent: function() {
					// General tab grid
					var oGeneralTabGrid = new sap.ui.layout.Grid({
						hSpacing: 0,
						layoutData: new sap.ui.layout.GridData({
							span: "L12 M12 S12"
						})
					});
					// Get runnable files
					return that.context.service.basefilesearchutil.getRunnableFiles(oDocument, that._oRunnableFiles).then(
						function(aHtmlFiles) {
							// Collect composite control services as array of promosses 
							var aUiPromises = [that.context.service.runconfig.filepath.getControl(oDocument, aHtmlFiles, [{
									"isRegex": false,
									"rule": ".html"
								}]),
								// Get Preview Control
								that.context.service.runconfig.preview.getControl(),
								// Get URL parameters control
								that.context.service.runconfig.urlparameters.getControl()
							];
							// Execute the collected composite control services
							return Q.all(aUiPromises).spread(function(oFilePath, oPreviewControl, oURLParameters) {
								oGeneralTabGrid.addContent(oFilePath);
								oGeneralTabGrid.addContent(oPreviewControl);
								// Create General tab and attach the composite control content
								var aTabstrips = [{
									name: that.context.i18n.getText("i18n", "lbl_general"),
									content: oGeneralTabGrid
								}];

								// Parameters tab simple form layout form 
								var oParametersGrid = new sap.ui.layout.form.SimpleForm({
									layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
									labelSpanL: 1,
									labelSpanM: 1
								});
								oParametersGrid.addContent(oURLParameters);

								// Create Parameters tab and attach the composite control content
								aTabstrips.push({
									name: that.context.i18n.getText("i18n", "lbl_parameters"),
									content: oParametersGrid
								});

								return aTabstrips;
							});
							
						});
				},

				setConfiguration: function(configuration) {
					if (!configuration.urlParameters || configuration.urlParameters.length === 0) {
						configuration.urlParameters = that._createEmptyModel();
					} else {
						// if parameter name and value are empty and it was marked as selected - unselect this parameter
						var bHasValidPerameterEntry = false;
						for (var i = 0; i < configuration.urlParameters.length; i++) {
							var urlParameterEntry = configuration.urlParameters[i];
							if (/^\s*$/.test(urlParameterEntry.paramName) && (/^\s*$/.test(urlParameterEntry.paramValue)) && urlParameterEntry.paramActive) {
								urlParameterEntry.paramActive = false;
							} else if (/^\s*$/.test(urlParameterEntry.paramName) && !(/^\s*$/.test(urlParameterEntry.paramValue)) && urlParameterEntry.paramActive) {
								bHasValidPerameterEntry = true;
							}
						}
						if (bHasValidPerameterEntry) {
							// if we have at least one valid url parameter - delete rest empty parameters 
							configuration.urlParameters = configuration.urlParameters.filter(function(o) {
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
					// delete empty parameters 
					var aUrlParameters = this.model.getProperty("/urlParameters");
					if (aUrlParameters) {
						var aNewUrlParameters = aUrlParameters.filter(function(o) {
							return o.paramName;
						});
						this.model.setProperty("/urlParameters", aNewUrlParameters);
					}
					return this.model.getData();
				}
			};
		},

		_createEmptyModel: function() {
			// by default 2 empty entries should be proposed and displayed
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

		//check if file is HTML file
		_isHtmlFile: function(sFileName) {
			var aFileParts = sFileName.split(".");
			if (aFileParts[aFileParts.length - 1] === "html") {
				return true;
			} else {
				return false;
			}
		},

		isConfigurationValid: function(oConfiguration, oDocument) {
			return this.context.service.baseinputvalidatorutil.isConfigurationValid(oConfiguration, oDocument, [{
				"isRegex": false,
				"rule": ".html"
			}]);
		},

		//check if file is a valid HTML file
		_isValidHtmlFile: function(sFileName) {
			if (jQuery.sap.endsWith(sFileName, ".html") && sFileName !== "mock_preview_sapui5.html" && sFileName !== "visual_ext_index.html") {
				return true;
			} else {
				return false;
			}
		}
	};

	return CheWebAppRunner;
});