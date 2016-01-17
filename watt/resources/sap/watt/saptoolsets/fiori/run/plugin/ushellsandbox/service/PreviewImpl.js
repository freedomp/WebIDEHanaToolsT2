define(function() {
	"use strict";
	return {
		_sServerType: sap.watt.getEnv("server_type"),
		_sPreviewUrl: sap.watt.getEnv("orion_preview"),

		configure : function() {
			this._preloadServices();
		},
		
		_preloadServices : function() {
			this.context.service.preview.showPreview().fail(function() {
				// do nothing
			}).done();
			this.context.service.switchbackends.getChangedBackends().fail(function() {
				// do nothing
			}).done();
		},
		
		_showPreview: function(sUrl, oWindow, bNoFrame, oRunConfiguration) {
			//var bUseWrapper = true; // set to false for launching without device test frame

			return this.context.service.preview.showPreview(sUrl, oWindow, bNoFrame, null, oRunConfiguration);
		},

		_getComponentName: function(sComponentSrc, sComponentPath) {
			//search the component name in the Component.js -- new Fiori template 
			var aMatches = /.extend\(\"(.*).Component\"/.exec(sComponentSrc);
			if (aMatches) {
				return aMatches[1];
			} else {
				//search the component name in the Component.js -- old Fiori template 
				aMatches = /jQuery.sap.declare\(\"(.*).Component\"\)/.exec(sComponentSrc);
				if (aMatches) {
					return aMatches[1];
				} else {
					throw new Error(this.context.i18n.getText("i18n", "previewImpl_undeclaredComponent", [sComponentPath]));
				}
			}
		},

		_getSandboxUrlForComponent: function(sExecuteUrl, sComponentName, oRunConfiguration) {
			var oComponentRootURI;
			var oURI = this._getSandboxUri(sExecuteUrl);
			if (!sComponentName) {
				throw new Error(this.context.i18n.getText("i18n", "previewImpl_undefinedComponent"));
			}

			// get the URL for the component root path
			// we remove the last segment of the execute URL
			oComponentRootURI = URI(sExecuteUrl).relativeTo(oURI).segment(-1, "");
			return this._constructUrlForComponent(oURI, oComponentRootURI.path(), sComponentName, oRunConfiguration);
		},

		_constructUrlForComponent: function(oSandboxURI, sUrl, sComponentName, oRunConfiguration) {
			var oURI = new URI(oSandboxURI.toString());
			// parameter to be passed to the sandbox must be in the URL of the component to be loaded into the sandbox
			var oUrlParams = this._getAppSysUrlParams(oRunConfiguration);
			var oUrl = URI(sUrl);
			oUrl = this._addUrlParams(oUrl, oUrlParams.aAppParams);
			sUrl = oUrl.toString();
			oURI = this._addUrlParams(oURI, oUrlParams.aSysParams);

			oURI.addSearch("sap-ushell-test-url-url", sUrl);
			// add the component name
			oURI.addSearch("sap-ushell-test-url-additionalInformation", "SAPUI5.Component=" + sComponentName);

			if (oRunConfiguration && oRunConfiguration.bIsMock) {
				// Add mockserver setting
				oURI.addSearch("responderOn", "true");
			}
			// finally add the fragment for starting the test app
			oURI.fragment("Test-url");
			return oURI.toString();
		},

		_getSandboxUrlForConfig: function(sExecuteUrl, oRunConfiguration) {
			var oURI = this._getSandboxUri(sExecuteUrl);
			// parameter to be passed to the sandbox must be in the URL of the component to be loaded into the sandbox
			var oUrlParams = this._getAppSysUrlParams(oRunConfiguration);
			oURI = this._addUrlParams(oURI, oUrlParams.aSysParams);
			var oAppUri = new URI(sExecuteUrl).relativeTo(oURI).path();
			//TODO - check if need to add application parameters to the executeUrl or remove from run configuration in this case
			//oAppUri = this._addUrlParams(oAppUri, oUrlParams.aAppParams);
			oURI.addSearch("sap-ushell-sandbox-config", oAppUri);

			if (oRunConfiguration && oRunConfiguration.bIsMock) {
				// Add mockserver setting
				oURI.addSearch("responderOn", "true");
			}
			return oURI.toString();
		},

		_getComponentNameFromApplicationData: function(sApplicationData) {
			"use strict";
			var re = /SAPUI5\.Component=(.*)/;
			if (!re.test(sApplicationData)) {
				throw new Error(this.context.i18n.getText("i18n", "previewImpl_applicationDataMissingString"));
			}
			return re.exec(sApplicationData)[1];
		},

		_getSandboxUri: function(sExecuteUri) {
			"use strict";
			var oURI;
			var sSandboxPagePath = "test-resources/sap/ushell/shells/sandbox/fioriSandbox.html";
			var sServerType = this._sServerType;

			if (!sExecuteUri) {
				throw new Error(this.context.i18n.getText("i18n", "previewImpl_undefinedUrl"));
			}

			if (sServerType == "java") {
				// for local testing, we require a proxy mapping to the ui5-sdk-dist on root
				// alternative would be to include the ushell-lib (default and test-resources) packages into the WATT war
				oURI = new URI("").protocol(window.location.protocol).host(window.location.host).path(
					"/sapui5-sdk-dist/" + sSandboxPagePath);
			} else if (sServerType == "hcproxy" || sServerType == "local_hcproxy") {
				// for hana cloud proxy, we require a proxy mapping to the ui5-sdk-dist
				// as absolute path (relative to the project root); was changed to have a consistent behaviour for all WATT sandbox actions
				// for starting a localIOndex.html, the mapping has to be relative to teh web-app root in addition
				// TODO: implement an existence check for the sandbox page and guide the user to create an appropriate proxy config
				oURI = new URI(sExecuteUri).path(new URI(this._sPreviewUrl).path()).segment(sSandboxPagePath);
			} else {
				// TODO: support other server types; for now, we rather fail fast
				throw new Error(this.context.i18n.getText("i18n", "previewImpl_unsupportedServerType", [sServerType]));
			}
			return oURI;
		},

		/**
		 * Show the preview in a pop up window
		 * @param {object} oDocument Document object of the selected file/folder to be previewed
		 * @param {Window} oWindow optional, show preview in this window instead of showing in popup window
		 */
		showPreview: function(oDocument, oWindow, bNoFrame, oRunConfiguration) {
			var that = this;
			//var sComponentName;
			var sExecuteUrl;
			var sEntityName = oDocument.getEntity().getName();
			var sSandboxUrl = null;
			var sUI5Version = oRunConfiguration ? oRunConfiguration.sUi5Version : null;
			return that.context.service.switchbackends.getChangedBackends(oRunConfiguration).then(function(sChangedBEs) {
				var oAppForwarding = oRunConfiguration ? oRunConfiguration.oAppForwarding : null;
				var sRelativePath = oRunConfiguration ? oRunConfiguration.sRelativePath : null;
				if (sEntityName === "Component.js") {
					return that.context.service.preview.getPreviewUrl(oDocument, null, oAppForwarding, sUI5Version,  null, sRelativePath, sChangedBEs).then(function(
						oUri) {
						sExecuteUrl = oUri.toString();
						return oDocument.getContent();
					}).then(function(sContent) {
						var sComponentName = that._getComponentName(sContent, oDocument.getEntity().getFullPath());
						sSandboxUrl = that._getSandboxUrlForComponent(sExecuteUrl, sComponentName, oRunConfiguration);
						return that._showPreview(sSandboxUrl, oWindow, bNoFrame, oRunConfiguration);
						// 	});
					});
				} else if (new RegExp(".*fiorisandboxconfig.*[.]json", "i").test(sEntityName)) {
					return that.context.service.preview.getPreviewUrl(oDocument, null, oAppForwarding, sUI5Version, null, sRelativePath, sChangedBEs).then(function(
						oUri) {
						sExecuteUrl = oUri.toString();
						sSandboxUrl = that._getSandboxUrlForConfig(sExecuteUrl, oRunConfiguration);
						return that._showPreview(sSandboxUrl, oWindow, bNoFrame, oRunConfiguration);
					});
				} else {
					throw new Error(this.context.i18n.getText("i18n", "previewImpl_unsupportedFile", [sEntityName]));
				}
			});
		},

		/**
		 * Show the preview in a pop up window, giving
		 * URL and ApplicationData ( a.k.a. additionalInformation  )
		 * an arbitrary document of the project must be passed, which is used to extract the
		 * executeURL and the project scope.
		 * the project must have the path  /test-resources configured in neo-app.json,
		 * as the ushell sandbox is located under test-resources/sap/ushell/shells/sandbox/fioriSandbox.html
		 *
		 * @param {string} sUrl a url pointing to the folder where a Comonent.js is found,
		 *		optionally search string, e.g. \"/my/epm/myComponent?P1=value1&P2=Value2\"
		 * @param {string} sApplicationData   a String containing the Component name, e.g.   \"SAPUI5.Component=sap.my.epm.MyComponent\"
		 * @param {object} oDocument Document object of the selected file/folder to be previewed
		 * @param {Window} oWindow optional, show preview in this window instead of showing in popup window
		 */
		showPreviewWithParameters: function(sUrl, sApplicationData, oDocument, oWindow) {
			var that = this;
			var sComponentName = that._getComponentNameFromApplicationData(sApplicationData);

			return that.context.service.preview.getPreviewUrl(oDocument).then(function(oUri) {
				return that._getSandboxUri(oUri.toString());
			}).then(function(oSandboxURI) {
				that._showPreview(that._constructUrlForComponent(oSandboxURI, sUrl, sComponentName, false), oWindow);
			});
		},
		
		// input: Run Configuration object
        // returns: oUrlParams - object with 2 arrays - the application and system Url Parameters
		// Get URL parameters from the run configuration and from the Web IDE url parameters and 
		// seperate them to application and system URL parameters
		_getAppSysUrlParams: function(oRunConfiguration) {
			var aQueryParameters = ["saml2idp"]; // Currently hardcoded
			var oUrlParameters = {};
			var aAppUrlParams = [];
			var aSysUrlParams = [];
			// Add relevant query parameters from the Web IDE url to the running applicaiton url (if exist)
			if (oRunConfiguration) {
				oUrlParameters = oRunConfiguration.oUrlParameters;
				this._addIdeUrlParams(aQueryParameters, oUrlParameters);
			} else {
				oRunConfiguration = {};
			}
			
			// Go Over all parameters and seperate them to application and system URL parameters
			if (oUrlParameters) {
				for (var i = 0; i < oUrlParameters.length; i++) {
					var oParam = oUrlParameters[i];
					if (this._isSystemParameter(oParam.paramName, aQueryParameters)){
						aSysUrlParams.push(oParam);
					} else{
						aAppUrlParams.push(oParam);
					}
				}
			}
			var oUrlParams = {aAppParams: aAppUrlParams, aSysParams: aSysUrlParams};
			return oUrlParams;
		},

		// Is the parameter a system or an app parameter - based on param name
		_isSystemParameter: function(sParamName, aQueryParameters) {
			var aSystemParameters = ["sap-ui-appCacheBuster", "sap-ui-debug"]; // Currently hardcoded
			// System parameters - from the aSystemParameters values or from the Web IDE query array
			for (var i = 0; i < aSystemParameters.length; i++) {
				var sSystemParameter = aSystemParameters[i];
				if (sParamName === sSystemParameter){
					return true;
				}
			}
			for (var i = 0; i < aQueryParameters.length; i++) {
				var sQueryParameter = aQueryParameters[i];
				if (sParamName === sQueryParameter){
					return true;
				}
			}
			return false;
		},

		// Add the appCacheBuster parameter to the query of the oURL object
		_addUrlParams: function(oUri, aUrlParameters) {
			var resultUri = oUri;
			if (aUrlParameters) {
				// Add the parameters from project settings to the Url
				for (var i = 0; i < aUrlParameters.length; i++) {
					resultUri.addSearch(aUrlParameters[i].paramName, aUrlParameters[i].paramValue);
				}
			}
			return resultUri;
		},
		
		// Send relevant query parameters from the Web IDE url to the running applicaiton url
		_addIdeUrlParams: function(aQueryParameters, oUrlParameters) {
			for (var i = 0; i < aQueryParameters.length; i++) {
				var sQueryParameter = aQueryParameters[i];
				var sQueryValue = this._getIdeParameterValue(sQueryParameter);
				// In case the query parameter is already defined and active in the url parameters of the run 
				// configuration - don't add it's value from the IDE url parameter
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

		// Check if the query parameter is already defined and active in the url parameters of the run configuration 
		_isInUrlParameters: function(sQueryParameter, aUrlParameters) {
			for (var i = 0; i < aUrlParameters.length; i++) {
				var oParam = aUrlParameters[i];
				if (oParam.paramName === sQueryParameter){
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
					// Parameter found - return its value
					sParameterValue = aParam[1];
					break;
				}
			}
			return sParameterValue;
		}

	};
});