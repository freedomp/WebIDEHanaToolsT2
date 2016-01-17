define(function() {
	"use strict";
	return {
		configure : function() {
			this._preloadServices();
		},
		
		_preloadServices : function() {
			this.context.service.preview.showPreview().fail(function() {
				// do nothing
			}).done();
		},
		
		_sServerType: sap.watt.getEnv("server_type"),
		_sPreviewUrl: sap.watt.getEnv("orion_preview"),

		_showPreview: function(sUrl, oWindow, bNoFrame, oRunConfiguration) {
			return this.context.service.preview.showPreview(sUrl, oWindow, bNoFrame, null, oRunConfiguration);
		},

		//      ----- Embedded mode -----

		_getEmbeddedUri: function(sExecuteUri) {
			var oURI;
			var sEmbeddedPagePath = "sap/bc/ui5_ui5/ui2/ushell/shells/abap/Fiorilaunchpad.html";
			var sServerType = this._sServerType;

			if (sServerType === "java") {
				// for local testing, we require a proxy mapping to the ui5-sdk-dist on root
				// alternative would be to include the ushell-lib (default and test-resources) packages into the WATT war
				oURI = new URI("").protocol(window.location.protocol).host(window.location.host).path(
					"/sapui5-sdk-dist/" + sEmbeddedPagePath);
			} else if (sServerType === "hcproxy" || sServerType === "local_hcproxy") {
				// for hana cloud proxy, we require a proxy mapping to the ui5-sdk-dist
				// as absolute path (relative to the project root); was changed to have a consistent behaviour for all WATT sandbox actions
				// for starting a localIOndex.html, the mapping has to be relative to teh web-app root in addition
				// TODO: implement an existence check for the sandbox page and guide the user to create an appropriate proxy config
				oURI = new URI(sExecuteUri).path(new URI(this._sPreviewUrl).path()).segment(sEmbeddedPagePath);
			} else {
				// TODO: support other server types; for now, we rather fail fast
				throw new Error(this.context.i18n.getText("i18n", "previewImpl_unsupportedServerType", [sServerType]));
			}
			return oURI;
		},

		/**
		 * Preview a Fiori applicaiton embedded in the ABAP launchpad before it is deployed to ABAP.
		 * @param {object} oDocument - The Component.js file to be used to preview in the embedded mode
		 * @param {Window} oWindow - window for displaying the application preview
		 * @param {object} oRunConfiguration - configuration set by user to run the application
		 */
		showPreviewEmbedded: function(oDocument, oWindow, oRunConfiguration) {
			var that = this;
			var sExecuteUrl;
			var sEmbeddedUrl = null;
			return that.context.service.preview.getPreviewUrl(oDocument, null, {
				bPreferWorkspace: true
			}, null, true).then(function(oUri) {
				// disable cache-buster token on FLP
				oUri.addQuery("sap-ushell-nocb", true);
				sExecuteUrl = oUri.toString();
				sEmbeddedUrl = that._getEmbeddedUri(sExecuteUrl);
				return that._showPreview(sEmbeddedUrl, oWindow, true, oRunConfiguration);
			});
		},

		showPreviewEmbeddedFlp: function(oDocument, oWindow, oRunConfiguration) {
			var that = this;
			var sExecuteUrl = window.location.protocol + "//" + oRunConfiguration.flpName + "-" + oRunConfiguration.hcpAccount +
				".dispatcher.neo.ondemand.com" + "/sap/hana/uis/clients/ushell-app/shells/fiori/FioriLaunchpad.html?hc_reset";
			var oEmbeddedUrl = new URI(sExecuteUrl);
			var sSearchUrl = this._getHeliumPath(oDocument);
			oEmbeddedUrl.addSearch("hc_wsmapping." + oRunConfiguration.hcpAppName, sSearchUrl);
			return this._getWorkSpaceApps(oEmbeddedUrl, oRunConfiguration.workspaceApplications).then(function(oEmbeddedUrlWsApps) {
				return that._showPreview(oEmbeddedUrlWsApps, oWindow, true, oRunConfiguration);
			});

		},

		_getHeliumPath: function(oDocument) {
			var sOrionPath = oDocument.getEntity().getBackendData().location;
			if (sOrionPath.indexOf("/s2s/file") > -1) { // orion as service in neo-app.json
				sOrionPath = sOrionPath.replace("/s2s/file", "");
			} else {
				sOrionPath = sOrionPath.replace("/file", ""); // orion as destination in neo-app.json
			}
			return sOrionPath;
		},

		_getWorkSpaceApps: function(oEmbeddedUrl, workspaceApplications) {
			var that = this;
			var aPromises = [];
			var aBspNames = [];
			if (workspaceApplications) {
				for (var i = 0; i < workspaceApplications.length; i++) {
					var oApp = workspaceApplications[i];
					aPromises.push(this.context.service.filesystem.documentProvider.getDocument("/" + oApp.localPath));
					aBspNames.push(oApp.bspName.toLowerCase());
				}
				return Q.all(aPromises).then(function(aDocuments) {
					if (aDocuments) {
						for (var j = 0; j < aDocuments.length; j++) {
							var sSearchUrl = that._getHeliumPath(aDocuments[j]);
							oEmbeddedUrl.addSearch("hc_wsmapping." + aBspNames[j], sSearchUrl);
						}
					}
					return oEmbeddedUrl;
				});
			}
			return Q(oEmbeddedUrl);
		}
	};
});