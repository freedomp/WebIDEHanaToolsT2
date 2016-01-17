define({
	_sLastUrl: null,
	_sLastPath: null,
	_connector: null,
	_oSettings: null,

	configure: function(mConfig) {
		var that = this;

		//determine if the WEB IDE is running with CHE BE or Orion BE
		var sServerType = sap.watt.getEnv("server_type");
		if (sServerType !== "xs2") {
			this._adapter = mConfig.adapter.service;
		} else {
			this._adapter = mConfig.cheadapter.service;
		}
		if (this._adapter) {
			this._adapter.getPreviewUrl().fail(function() {
				// do nothing
			}).done(); 
		}

		this._modes = {};
		mConfig.modes.forEach(function(mEntry) {
			that._modes[mEntry.id] = mEntry.service;
		});
		this._runner = {};
		mConfig.runner.forEach(function(mEntry) {
			that._runner[mEntry.id] = mEntry.service;
			 mEntry.service.showPreview().fail(function() {
			 	// do nothing
			 }).done();

			//Forward button clicked event from runners to listeners
			//TODO Clarify who really needs this (no usage found). 
			//Better users should receive a run instance and listen to it directly
			mEntry.service.attachEvent("buttonClicked", function(oEvent) {
				return that.context.event.fireButtonClicked(oEvent.params);
			}, that);
		});
		this._preProcessors = {};
		mConfig.preprocessors.forEach(function(mEntry) {
			that._preProcessors[mEntry.id] = mEntry.service;
		});
	},

	_showPreview: function(sUrl, oWindow, bNoFrame, oCustomSettings, oRunConfiguration) {
		var that = this;
		if (oRunConfiguration !== undefined) {
			sUrl = this._addUi5Version(sUrl, oRunConfiguration.sUi5Version);
			sUrl = this._addAppsVersion(sUrl, oRunConfiguration.oAppsVersion);
			sUrl = this._addSwitchBackend(sUrl, oRunConfiguration.oSwitchBackendParameter);
			sUrl = this._addHashParam(sUrl, oRunConfiguration.oHashParameter);
		}
		// Save the application Url - in case of run with frame it is different then the url of the preview
		var appUrl = sUrl;
		var oUrlParameters = {};
		if (oRunConfiguration && oRunConfiguration.sRunnerId !== "fiorirunner") {
			// In case of fiorirunner the url parameters will be handled in the PreviewImpl.js under the ushellsandbox plugin
			oUrlParameters = oRunConfiguration.oUrlParameters;
			// Add relevant query parameters from the Web IDE url to the running applicaiton url (if exist)
			this._addIdeUrlParams(["saml2idp"], oUrlParameters);
		}

		var sRunnerType = bNoFrame ? "noFrame" : "frame";
		var oRunner = that._runner[sRunnerType];

		if (!oWindow) {
			// In case of FactSheet for example oWindow is not defined
			oWindow = window.open("", "Preview");
		}
		
		var oUrlWithParams = this._getUrlWithParams(sUrl, oUrlParameters);
		if (oUrlWithParams.then) { // is a promise
			return oUrlWithParams.then(function(sUrlWithParams) {
				if (oWindow) {
					return oRunner.showPreview(oWindow, URI(sUrlWithParams), oCustomSettings, appUrl).then(function(oResult) {
						oWindow.focus();
						return oResult;
					});
				}
			});
		}
		// oUrlWithParams is a string
		if (oWindow) {
			return oRunner.showPreview(oWindow, URI(oUrlWithParams), oCustomSettings, appUrl).then(function(oResult) {
				oWindow.focus();
				return oResult;
			});
		}
	},

	// Send relevant query parameters from the Web IDE url to the running applicaiton url
	_addIdeUrlParams: function(aQueryParameters, oUrlParameters) {
		for (var i = 0; i < aQueryParameters.length; i++) {
			var sQueryParameter = aQueryParameters[i];
			var sQueryValue = this._getIdeParameterValue(sQueryParameter);
			if (sQueryValue && !this._isInUrlParameters(sQueryParameter, oUrlParameters)) {

				// Add IDE parameter to the running applicaiton parameters
				var oParam = {
					paramName: sQueryParameter,
					paramValue: sQueryValue
				};
				oUrlParameters.push(oParam);
			}
		}
	},

	// Check if the query parameter is already defined in the url parameters of the run configuration 
	_isInUrlParameters: function(sQueryParameter, oUrlParameters) {
		for (var i = 0; i < oUrlParameters.length; i++) {
			var oParam = oUrlParameters[i];
			if (oParam.paramName === sQueryParameter) { 
				return true;
			}
		}
		return false;
	},

	// Get the Web IDE query parameter value of the parameter name (if the parameter exists)
	_getIdeParameterValue: function(sParameterName) {
		var sParameterValue;
		var aParams = window.location.search.substr(1).split('&');
		for (var i = 0; i < aParams.length; i++) {
			var aParam = aParams[i].split('=');
			if (aParam[0] === sParameterName) {
				sParameterValue = aParam[1];
				break;
			}
		}
		return sParameterValue;
	},

	//add the ui5 version as URL parameter
	_addUi5Version: function(sUrl, sUi5Version) {

		if (sUi5Version !== undefined && sUi5Version !== null) {
			var oURI = URI(sUrl);

			if (sap.watt.getEnv("internal")) {
				oURI.addSearch("hc_appversion.sapui5preview", sUi5Version);
				oURI.addSearch("hc_serviceversion.sapui5", sUi5Version);
			} else {
				oURI.addSearch("hc_serviceversion.sapui5", sUi5Version);
			}

			return oURI.toString();
		}
		return sUrl;
	},

	//add the applications version as URL parameters
	_addAppsVersion: function(sUrl, oAppsVersion) {

		if (oAppsVersion !== undefined && oAppsVersion !== null) {
			var oURI = URI(sUrl);
			for (var i = 0; i < oAppsVersion.length; i++) {
				var oApp = oAppsVersion[i];
				if (oApp.libraryVersion && oApp.libraryVersion !== "Active") {
					oURI.addSearch("hc_appversion." + oApp.libraryName, oApp.libraryVersion);
				}
			}
			return oURI.toString();
		}
		return sUrl;
	},

	// Add the URL parameters to the URL
	_addUrlParams: function(sUrl, oSettings) {
		var sResult = sUrl;
		if (oSettings) {
			// Add the parameters from project settings to the Url
			var oURI = URI(sUrl);
			for (var i = 0; i < oSettings.length; i++) {
				var oParam = oSettings[i];
				oURI.addSearch(oParam.paramName, oParam.paramValue);
			}
			sResult = oURI.toString();
		}
		return sResult;
	},

	// Add the hash parameter to the URL
	_addHashParam: function(sUrl, oHashParameter) {
		if (oHashParameter) {
			var sResult = sUrl;
			var oURI = new URI(sUrl);
			// Add the hash parameters to the Url
			oURI = oURI.hash(oHashParameter);
			sResult = oURI.toString();
			return sResult;
		} else {
			return sUrl;
		}
	},

	//Add the prameters for switching BE
	_addSwitchBackend: function(sUrl, oSwitchBackendParameter) {
		if (oSwitchBackendParameter) {
			var sResult = sUrl;
			var oURI = new URI(sUrl);
			var sChoosenBackend;
			for (var i = 0; i < oSwitchBackendParameter.length; i++) {
				if (oSwitchBackendParameter[i].destinations !== 0) {
					if (oSwitchBackendParameter[i].source !== oSwitchBackendParameter[i].destinations) {
						sChoosenBackend = "hc_destmapping." + oSwitchBackendParameter[i].source;
						oURI.addSearch(sChoosenBackend, oSwitchBackendParameter[i].destinations);
					}
				}
			}
			// Add the hash parameters to the Url
			sResult = oURI.toString();
			return sResult;
		} else {
			return sUrl;
		}
	},

	/*
	 * Read application URL parameters from the configuration file or from the project settings for older versions of Web IDE
	 */
	_getUrlWithParams: function(sUrl, oUrlParameters) {
		var that = this;
		if (oUrlParameters && oUrlParameters.length > 0) {
			// Read application URL parameters from the configuration file
			var sRes = this._addUrlParams(sUrl, oUrlParameters);
			return sRes;
		} else {
			// In case URL parameters are not in the configuration file, try to read them from the project settings
			var oService = this._oSettings ? this._oSettings : this.context.service;
			return oService.setting.project.get(oService.appparams).then(
				//that._addUrlParams
				function(oSettings) {
					return that._addUrlParams(sUrl, oSettings);
				}
			).fail(function() {
				return sUrl;
			});
		}
	},

	/**
	 * show the preview in a pop up window
	 * @param {object} oDocument Document object of the selected file/folder to be previewed
	 * @param {Window} oWindow optional, show preview in this window instead of showing in popup window
	 * @param {boolean} bNoFrame optional, run without preview frame
	 * @param {object} oCustomSettings optional, custom buttons to be added on the top bar
	 */
	showPreview: function(oDocument, oWindow, bNoFrame, oCustomSettings, oRunConfiguration) {
		var that = this;
		if (oDocument instanceof URI) {
			oDocument = oDocument.toString();
		}
		if (typeof oDocument == "string") {
			return this._showPreview(oDocument, oWindow, bNoFrame, oCustomSettings, oRunConfiguration);
		} else if (jQuery.sap.endsWith(oDocument.getEntity().getName(), ".html")) {
			oRunConfiguration = _.clone(oRunConfiguration, true);
			// inject "origional-url" parameter to UrlParameters object
			if (oRunConfiguration.oUrlParameters) {
				oRunConfiguration.oUrlParameters.splice(0, 0, {
					paramName: "origional-url",
					paramValue: oDocument.getEntity().getName()
				});
			}
			var result = Q(oDocument);
			$.each(this._preProcessors, function(id, oProcess) {
				result = result.then(oProcess.apply);
			});
			return result.then(function(oDocument) {
				var oAppForwarding = oRunConfiguration ? oRunConfiguration.oAppForwarding : null;
				var sUI5Version = oRunConfiguration ? oRunConfiguration.sUi5Version : null;
				var sRelativePath = oRunConfiguration ? oRunConfiguration.sRelativePath : null;
				return that.getPreviewUrl(oDocument, null, oAppForwarding, sUI5Version, null, sRelativePath, "").then(function(oUri) {
					var sUrl = oUri.toString();
					that._sLastUrl = sUrl;
					that._sLastPath = oDocument.getEntity().getParentPath();
					return that._showPreview(sUrl, oWindow, bNoFrame, oCustomSettings, oRunConfiguration);
				});
			});
		} else {
			return this._showPreview(this._sLastUrl, oWindow, bNoFrame, oCustomSettings, oRunConfiguration);
		}
	},

	getPreviewUrl: function(oDocument, sMode, oAppForwarding, sUI5Version, bEmbeddedMode, sRelativePath, sSwitchBE) {
		var that = this;
		return this.getPreviewConfig(oDocument, sRelativePath).then(function(mConfig) {
			//TODO apply modes

			return that.assemblePreviewURI(mConfig, oAppForwarding, sUI5Version, bEmbeddedMode, sSwitchBE);
		});
	},

	getPreviewConfig: function(oDocument, sRelativePath) {
		//TODO Allow other preview roots, than the project
		return oDocument.getProject().then(function(oProject) {
			var path;
			if (sRelativePath) {
				path = sRelativePath;
			} else {
				path = oDocument.getEntity().getProjectRelativePath();
			}
			return {
				root: oProject,
				path: path,
				params: {}
			};
		});
	},

	assemblePreviewURI: function(mConfig, oAppForwarding, sUI5Version, bEmbeddedMode, sSwitchBE) {
		return this._adapter.getPreviewUrl(mConfig.root, oAppForwarding, sUI5Version, sSwitchBE, bEmbeddedMode).then(function(oURI) {
			// we have to remove the leading slash that the URI.js can resolve the URL properly!
			var sPath = mConfig.path;
			sPath = jQuery.sap.startsWith(sPath, "/") ? sPath.substr(1) : sPath;
			oURI = URI(sPath).absoluteTo(oURI);

			for (var param in mConfig.params) {
				oURI.addQuery(param, mConfig.params[param]);
			}
			return oURI;
		});
	},

	isExecutable: function(oSelection) {
		var oDocument = oSelection.document;
		if (!oDocument.getEntity) {
			return false;
		}
		var sName = oDocument.getEntity().getName();
		var sType = oDocument.getType();
		var sPath = oDocument.getEntity().getParentPath();
		if (sType == "folder") {
			sPath = sPath + "/" + sName;
		}
		return !!(jQuery.sap.startsWith(sPath, this._sLastPath) || (sType == "file" && jQuery.sap.endsWith(sName, ".html")));
	}
});