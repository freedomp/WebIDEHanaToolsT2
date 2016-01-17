define([], function() {

	return {
		getPreviewUrl: function(oRootFolder, oAppForwarding, sUI5Version,sSwitchBE, bEmbeddedMode) {
			// Get preview url token
			var sPreviewRoot = this._getPreviewRoot(oRootFolder, sUI5Version, sSwitchBE, bEmbeddedMode);

			var sUrl;
			var oURI;

			if (sap.watt.getEnv("server_type") === "hcproxy" || sap.watt.getEnv("server_type") === "local_hcproxy") {
				//Helium Server mode, the location will end up as hc_orionpath parameter
				var sOrionPath = this._getHeliumPath(oRootFolder);
				//A trailing / has to be removed
				if (sOrionPath.lastIndexOf("/") === sOrionPath.length - 1) {
					sOrionPath = sOrionPath.substring(0, sOrionPath.length - 1);
				}
				oURI = URI(sPreviewRoot);
				oURI.addSearch("hc_orionpath", sOrionPath);
				//Avoid using preload in web ide preview
				oURI.addSearch("sap-ui-xx-componentPreload", "off");
				//if (oAppForwarding && oAppForwarding.bPreferWorkspace) {
				return this._addParamsWithLocalProjects(oRootFolder, oURI, oAppForwarding).thenResolve(oURI);
				// //} else {
				// return Q(oURI);
				// //}
			} else {
				//Primitive preview environment: Just add the path to the preview root url
				sUrl = oRootFolder.getEntity().getBackendData().location;
				// we have to remove the leading slash that the URI.js can resolve the URL properly!
				sUrl = jQuery.sap.startsWith(sUrl, "/") ? sUrl.substr(1) : sUrl;
				oURI = URI(sUrl).absoluteTo(sPreviewRoot);
				return Q(oURI);
			}
		},
		
		/*
		 * The token for the preview Url is generated from the project name plus the UI5 version, Switch backend and 
		 * embedded mode (if exists). The token is then sent to a hash function to reduce the length since the length 
		 * of the host of the preview Url is limited to 63 characters.
		 */
		_getPreviewRoot: function(oRootFolder, sUI5Version,sSwitchBE, bEmbeddedMode) {
			var sProjName = oRootFolder.getEntity().getName();

			var sPreviewToken = sProjName;
			if (sSwitchBE) {
				sPreviewToken += sSwitchBE;
			}
			if (sUI5Version) {
				sPreviewToken += sUI5Version;
			}
			if (bEmbeddedMode) {
				// In case of embedded mode - generate a new hash on every run 
				var iRandom = parseInt(Math.random() * 9999999);
				sPreviewToken += iRandom.toString(); 
			}
			// Create a hash string of length 7
			var sHashedPreviewToken = this._getHashedString(sPreviewToken, 7);
			
			// Get preview root URL
			var sPreviewRoot = sap.watt.getEnv("orion_preview");
			if (sap.watt.getEnv("server_type") === "local_hcproxy" && window && window.location && window.location.origin) {
				sPreviewRoot = window.location.origin + sPreviewRoot;
			}

			// Add the hashed token to the preview root URL
			sPreviewRoot = sPreviewRoot.replace("{{uniqueToken}}", sHashedPreviewToken);

			return sPreviewRoot;
		},

		/*
		 * Convert a string to a hash value of the specified length (iLength)
		 */
		_getHashedString: function(sOrig, iLength) {
	        var iHash = 0;
	        if (sOrig.length > 0) {
		        for (var i = 0; i < sOrig.length; i++) {
		            var char = sOrig.charCodeAt(i);
		            iHash = ((iHash<<5)-iHash)+char;
		            iHash = iHash & iHash; // Convert to 32bit integer
		        }
		        iHash = Math.abs(iHash);
	        }
	        
	        // Convert int to string of length iLength
	        var sZeros = new Array(iLength + 1).join( '0' ); //Leading zeros string
			var sHash = sZeros + iHash; // Add leading zeros 
    		return sHash.substr(sHash.length-iLength); // take only the last iLength characters
		},
		
		/*
		 * Calculate the Helium path from orion location
		 */
		_getHeliumPath: function(oDocument) {
			var sOrionPath = oDocument.getEntity().getBackendData().location;
			if (sOrionPath.indexOf("/s2s/file") > -1) { // orion as service in neo-app.json
				sOrionPath = sOrionPath.replace("/s2s/file", "");
			} else {
				sOrionPath = sOrionPath.replace("/file", ""); // orion as destination in neo-app.json
			}
			return sOrionPath;
		},

		_addParamsWithLocalProjects: function(oRootFolder, oURI, oAppForwarding) {
			var that = this;
			var oCurrentProjHCPDeploy;
			return this.context.service.setting.project.getProjectSettings("hcpdeploy", oRootFolder).then(function(oSettings) {
					oCurrentProjHCPDeploy = oSettings;

					// Read application parameters from the neo-app.json
					return oRootFolder.getCurrentMetadata().then(function(aMetadataContent) {
						var oNeoAppJsonMetadataElement;
						for (var i = 0; i < aMetadataContent.length; i++) {
							var oMetadataElement = aMetadataContent[i];
							if (oMetadataElement.name === "neo-app.json") {
								oNeoAppJsonMetadataElement = oMetadataElement;
							}
						}

						if (oNeoAppJsonMetadataElement) {
							return that.context.service.filesystem.documentProvider.getDocument(oNeoAppJsonMetadataElement.path).then(function(oNeoAppJsonDocument) {
								return oNeoAppJsonDocument.getContent().then(function(sContent) {
									var sContentJson = JSON.parse(sContent);
									var aAppArrayPromises = [];
									var searchUrl;
									var neoApplicationRoutes = that._getNeoAppApplicationRoutes(sContentJson);
									if ((neoApplicationRoutes.length > 0) && (oAppForwarding && oAppForwarding.bPreferWorkspace)) {
										return that._getApplicationMapping().then(function(oApplicationMapping) {
											jQuery.each(neoApplicationRoutes, function(i, route) {
												var sName = route.target.name;
												var sAccount = route.target.account ? "-" + route.target.account : "";
												aAppArrayPromises.push(that._getWorkspaceAppRootInWorkspace(sName, oApplicationMapping).then(function(oAppRoot) {
													if (oAppRoot) {
														//the parameter is only added if project exists in workspace
														searchUrl = that._getHeliumPath(oAppRoot.document);
														that.context.service.usagemonitoring.report("heliumpreview", "found_in_workspace", "found_in_workspace").done();
														if (oAppRoot.entryPath && oAppRoot.entryPath !== "") {
															searchUrl = searchUrl + oAppRoot.entryPath;
														}
														oURI.addSearch("hc_wsmapping." + sName + sAccount, searchUrl);
													}
												}));
											});
											
											return Q.all(aAppArrayPromises).then(function() {
												return oURI.toString();
											});
										});
									} else {
										var sHCPDeployName = that._getProjectForwardingToItSelf(sContentJson, oCurrentProjHCPDeploy);
										if (sHCPDeployName) { //Applications forwarding to itself
											searchUrl = that._getHeliumPath(oRootFolder);
											if (oCurrentProjHCPDeploy.entryPath && oCurrentProjHCPDeploy.entryPath !== "") {
												searchUrl = searchUrl + oCurrentProjHCPDeploy.entryPath;
											}
											oURI.addSearch("hc_wsmapping." + sHCPDeployName, searchUrl);
										}
									}
								}).fail(function() { //e.g. no valid json, ignore it
									return;
								});
							});
						}
					});
				});
		},

		_getNeoAppApplicationRoutes: function(sContentJson) {
			var applicationRoutes = [];
			if (sContentJson.routes) {
				jQuery.each(sContentJson.routes, function(i, route) {
					if (route.target && route.target.type && route.target.type === "application") {
						applicationRoutes.push(route);
					}
				});
			}
			return applicationRoutes;
		},

		_getProjectForwardingToItSelf: function(sContentJson, oCurrentProjHCPDeploy) {
			if (sContentJson.routes) {
				for (var i = 0; i < sContentJson.routes.length; i++) {
					var sNeoAppJsonAppName = sContentJson.routes[i].target.name;
					if (oCurrentProjHCPDeploy.name === sNeoAppJsonAppName) {
						return sNeoAppJsonAppName;
					}
				}
			}
			return null;
		},

		_getWorkspaceAppRootInWorkspace: function(sName, oApplicationMapping) {
			return Q(oApplicationMapping[sName]);
		},

		_getApplicationMapping: function() {
			var that = this;
			var oApplicationMapping = {};
			return this.context.service.filesystem.documentProvider.getRoot().then(function(oRootDocument) {
				return oRootDocument.getCurrentMetadata();
			}).then(function(aMetadataContent) {
				var aPromises = [];
				for (var i = 0; i < aMetadataContent.length; i++) {
					var oMetadataElement = aMetadataContent[i];
					if (oMetadataElement.folder) {
						aPromises.push(that._getHCPDeployDetails(oMetadataElement));
					}
				}
				return Q.all(aPromises).then(function(aApplicationSettings) {
					aApplicationSettings.forEach(function(oApplicationSettings) {
						if (oApplicationSettings) {
							oApplicationMapping[oApplicationSettings.name] = {
								document: oApplicationSettings.document,
								entryPath: oApplicationSettings.entryPath,
								account: oApplicationSettings.account
							};
						}
					});
					return oApplicationMapping;
				});
			});
		},

		_getHCPDeployDetails: function(oMetadataElement) {
			var that = this;
			return this.context.service.filesystem.documentProvider.getDocument(oMetadataElement.path).then(function(oDocument) {
				return that.context.service.setting.project.getProjectSettings("hcpdeploy", oDocument).then(function(oSettings) {
					var oApplicationSettings = {};
					if (oSettings && oSettings.name) {
						oApplicationSettings = {
							name: oSettings.name,
							document: oDocument,
							entryPath: oSettings.entryPath,
							account: oSettings.account
						};
						return oApplicationSettings;
					} else {
						return null;
					}
				});
			});
		}
	};
});