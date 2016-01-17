define(["sap/watt/lib/jszip/jszip-shim",
		"sap/watt/platform/plugin/utils/xml/XmlUtil"],
	function(JSZip, XmlUtil) {

		var LibraryDiscoveryService = {
			configure: function(mConfig) {
				this._aStyles = mConfig.styles;
				if (this._aStyles) {
					this.context.service.resource.includeStyles(this._aStyles).done();
				}
			},

			/*===============================================================================================================
        // Shared "private" functions
        ================================================================================================================*/

			_asciiReplaceSlash: function(val) {
				return val.replace(/\./g, "%2f");
			},

			_getFile: function(url) {
				// send the request
				return Q.sap.ajax({
					type: "GET",
					url: url,
					dataType: "text"
				}).then(function(response) {
					if (response[1].readyState === 4 && response[1].status < 300) {
						// file found
						return response[0];
					} else {
						if (response[1].status === 404) {
							// file not found
							return null;
						}
					}
				});
			},

			_parseDotLibraryToGetDescription: function(dotLibraryFileContent) {
				var pattern = /documentation\s*\>([\s\S]*?)\</;
				var description = dotLibraryFileContent.match(pattern);
				if (description) {
					return description[1];
				} else {
					return "";
				}
			},

			_buildLibraryJson: function(name, externalName, description, controls, version, entryPath, path, account, isManifest) {
				var lib = {
					"name": name,
					"externalName": externalName,
					"description": description,
					"version": version,
					"controls": controls,
					"entryPath": entryPath,
					"path": path,
					"account": account,
					"isManifest" : isManifest
				};
				return lib;
			},

			_parseToGetControls: function(libraryJSFile) {
				var pattern = /controls\s*:\s*\[([\s\S]*?)\]/;
				var myArray = libraryJSFile.match(pattern);

				var controlsArr = [];
				var controlsObjArr = [];

				if (myArray) {
					if (myArray[1] === "") {
						return controlsObjArr;
					}
					controlsArr = myArray[1].split(",");
					for (var i = 0; i < controlsArr.length; i++) {
						controlsArr[i] = controlsArr[i].trim().replace(/"/g, "");
						var controlsObj = {};
						controlsObj.name = controlsArr[i];
						controlsObjArr.push(controlsObj);
					}

				}

				return controlsObjArr;
			},

			_parseToGetVersion: function(fileContent) {
				var patternLibraryJs = /version\s*:\s*\"([\s\S]*?)\"/;

				var versionStr = "";
				var versionArr = fileContent.match(patternLibraryJs);
				if (versionArr) {
					versionStr = versionArr[1];
				} else {
					var oXMLDocument = jQuery.sap.parseXML(fileContent);
					var projNode = XmlUtil.firstElementChild(oXMLDocument);
					var versionNode = XmlUtil.getChildByTagName(projNode, "version");
					versionStr = versionNode.textContent;
				}

				return versionStr;
			},

			_parseToGetName: function(libraryJSFile) {
				var pattern = /name\s*:\s*\"([\s\S]*?)\"/;
				var version = libraryJSFile.match(pattern);
				return version[1];
			},

			/*===============================================================================================================
        // ABAP "private" functions
        ================================================================================================================*/

			_isABAPLibrary: function(app, discoveryStatus) {
				var libraryJsContentSuffix = "library.js/content";
				var that = this;
				return that._getFile(discoveryStatus.filestore_ui5_bsp + "/" + app.title + "%2fversion.json/content").then(function(versionJSonFile) {
					if (versionJSonFile) {
						var jsonObject = JSON.parse(versionJSonFile);
						var libraryPath = that._asciiReplaceSlash(jsonObject.application);
						var sUrl = require.toUrl(discoveryStatus.filestore_ui5_bsp + "/" + app.title + "%2f" + libraryPath + "%2f" +
							libraryJsContentSuffix);

						// send libraray.js file
						return that._getFile(sUrl).then(function(libraryJSFile) {
							if (libraryJSFile) {
								//console.log("BasicLibraryDiscovery app: " + app.title + " is a library!");
								var name = jsonObject.application;
								var version = that._parseToGetVersion(libraryJSFile);
								var controls = that._parseToGetControls(libraryJSFile);
								var appNameWithSlash = jsonObject.application.replace(/\./g, "/");

								return that._buildLibraryJson(name, app.title, app.summary, controls, version, "/sap/bc/ui5_ui5/sap/" + app.title + "/" +
									appNameWithSlash, "/resources/" + appNameWithSlash, "","");
							} else {
								return null;
							}
						});
					}
				});
			},

			// filter applications for libraries
			_filterABAPLibraries: function(applications, discoveryStatus) {
				var libraries = [];
				var promises = [];
				var self = this;

				for (var i = 0; i < applications.length; i++) {
					self.app = applications[i];

					promises.push(self._isABAPLibrary(self.app, discoveryStatus));
				}

				return Q.allSettled(promises).then(function(results) {
					results.forEach(function(result) {
						if (result.state === "fulfilled") {
							if (result.value) {
								libraries.push(result.value);
							}
						}
					});

					return libraries;
				});
			},

			/*===============================================================================================================
        // HCP "private" functions
        ================================================================================================================*/

			_getResponseFromHCP: function(path, responseType) {
				var oDeferred = Q.defer();
				//for Blobs, we have to use XMLHttpRequest
				var oXHR = new XMLHttpRequest();
				oXHR.open("GET", path);
				oXHR.setRequestHeader("Accept", "*/*");
				oXHR.responseType = responseType;
				oXHR.onload = function(e) {
					if (this.readyState === 4 && this.status < 300) {
						oDeferred.resolve(this.response);
					} else {
						oDeferred.reject(e);
					}
				};
				oXHR.send();
				return oDeferred.promise;
			},

			_getJSZipFromHCP: function(path) {
				return this._getResponseFromHCP(path, "arraybuffer").then(function(response) {
					var jsZip = new JSZip(response);
					return jsZip;
				});
			},

			_getHCPLibrary: function(account, app, version) {
				var that = this;
				var path = "/api/html5api/accounts/" + account + "/applications/" + app.name + (version ? "/versions/" + version : "") +
					"/content?pathSuffixFilter=library.js,.library,manifest.json";
				return this.context.service.libraryDiscovery._getJSZipFromHCP(path).then(function(jsZip) {
					var filePaths = Object.keys(jsZip.files);
					var length = Object.keys(filePaths).length;
					if (length) {
						var jsLibraryPath;
						var dotLibraryPath;
						var isManifestExist = false;
						//loop through all file paths and find the path to the library.js and .library files
						for (var i = 0; i < filePaths.length; i++) {
							var value = filePaths[i];
							if (value.search("library.js") !== -1) {
								jsLibraryPath = value;
							} else if (value.search(".library") !== -1) {
								dotLibraryPath = value;
							} else if (value.search("manifest.json") !== -1) {
								isManifestExist = true;
							}

							if (jsLibraryPath && dotLibraryPath && isManifestExist ) {
								break;
							}
						}
						var externalName = app.name;

						if (jsLibraryPath && dotLibraryPath && jsZip.file(dotLibraryPath)) {
							var dotLibraryFileContent = jsZip.file(dotLibraryPath).asText();
							var description = that._parseDotLibraryToGetDescription(dotLibraryFileContent);
							var jsLibraryFileContent = jsZip.file(jsLibraryPath).asText();
							var controls = that._parseToGetControls(jsLibraryFileContent);
							var name = that._parseToGetName(jsLibraryFileContent);
							var hcpVersion = "Active";
							var entryPath = "";
							path = "";
							var appAccount = app.providerAccount ? app.providerAccount : account;
							return that._buildLibraryJson(name, externalName, description, controls, hcpVersion, entryPath, path, appAccount, isManifestExist);
						} else {
							return null;
						}
					} else {
						return null;
					}
				}).fail(function() {
					return null;
				});
			},

			// filter applications for libraries
			_filterHCPLibraries: function(applications, account, username, password) {
				var heliumService = this.context.service.hcpconnectivity;
				var libraries = [];
				var appPromises = [];
				var self = this;

				for (var i = 0; i < applications.length; i++) {
					self.app = applications[i];

					appPromises.push(self._getHCPLibrary(account, self.app));
				}

				return Q.allSettled(appPromises).then(function(results) {
					var appVersionsPromises = [];

					results.forEach(function(result) {

						if (result.state === "fulfilled") {
							if (result.value) {
								var appName = result.value.externalName;
								appVersionsPromises.push(heliumService.getAppVersions(account, username, password, appName));
								libraries.push(result.value);
							}
						}
					});

					return Q.allSettled(appVersionsPromises).then(function(appVersions) {
						libraries.forEach(function(library) {
							for (var j = 0; j < appVersions.length; j++) {
								if (appVersions[j].value !== undefined) {
									if (appVersions[j].value.appName === library.externalName) {
										library.versions = appVersions[j].value;
										break;
									}
								}
							}
						});
						return libraries;
					});

				});
			},

			/*===============================================================================================================
        // Workspace private functions
        ================================================================================================================*/
			_getHCPName: function(oDocument) {
				return this.context.service.setting.project.getProjectSettings("hcpdeploy", oDocument)
					.then(function(oSettings) {
						return oSettings.name;
					});
			},

			_getWorkspaceLibrary: function(oDocument, documentProviderService) {
				var that = this;
				var sProjectFolderPath = oDocument.getEntity().getFullPath();
				return that.isLibraryProject(sProjectFolderPath, documentProviderService)
					.then(function(isLibrary) {
						if (isLibrary) {
							return that.getWorkspaceLibraryNamespace(sProjectFolderPath)
								.then(function(libraryPath) {
									return documentProviderService.getDocument(oDocument.getEntity().getFullPath() + "/src" + libraryPath + "/library.js")
										.then(function(libraryJsfileDocument) {
											return libraryJsfileDocument.getContent()
												.then(function(jsLibraryFileContent) {
													var controls = that._parseToGetControls(jsLibraryFileContent);
													var name = that._parseToGetName(jsLibraryFileContent);
													return that._getHCPName(oDocument)
														.then(function(externalName) {
															return documentProviderService.getDocument(oDocument.getEntity().getFullPath() + "/src" + libraryPath + "/.library")
																.then(function(dotLibraryfileDocument) {
																	return dotLibraryfileDocument.getContent()
																		.then(function(dotLibraryFileContent) {
																			return documentProviderService.getDocument(oDocument.getEntity().getFullPath() + "/src" + libraryPath + "/manifest.json")
																				.then(function(manifestJsonfileDocument) {
																				var isManifestExist = 	manifestJsonfileDocument !== null ? true : false;
																				var description = that._parseDotLibraryToGetDescription(dotLibraryFileContent);
																				var entryPath = "";
																				var path = "";
																				var account = "";
																				return documentProviderService.getDocument(oDocument.getEntity().getFullPath() + "/pom.xml")
																					.then(function(pomXmlFileDocument) {
																						if (pomXmlFileDocument) {
																							return pomXmlFileDocument.getContent()
																								.then(function(pomXmlFileContent) {
																									var version = that._parseToGetVersion(pomXmlFileContent);
																									return that._buildLibraryJson(name, externalName, description, controls, version, entryPath, path,
																										account, isManifestExist);
																								});
																						} else {
																							return null;
																						}
																					});
																			});
																	});
																});
														});
												});
										});
								}).fail(function() {
									//Do nothing and continue to the next library
								});
						} else {
							return null;
						}
					});
			},

			/*===============================================================================================================
        // Service functions
        ================================================================================================================*/
			getWorkspaceLibraryNamespace: function(sProjectFolderPath) {
				var that = this;
				var pomXmlPath = sProjectFolderPath + "/pom.xml";
				return that.context.service.document.getDocumentByPath(pomXmlPath).then(function(oDocument) {
					return that.context.service.librarydevelopment.getAppNamespace(oDocument).then(function(oNamespace) {
						if ($.isEmptyObject(oNamespace)) {
							return oDocument.getContent().then(function(oContent) {
								//Get library name value from pom.xml
								var oXMLDocument = jQuery.sap.parseXML(oContent);
								var aNodes = oXMLDocument.getElementsByTagName("sap.ui5.library.name");
								if (aNodes.length > 0) {
									var sLibraryName = aNodes[0].textContent;
								}
								//<sap.ui5.library.name> attribute doesn't exist
								if (!sLibraryName) {
									//Fallback: take artifactId
									var projNode = XmlUtil.firstElementChild(oXMLDocument);
									var artifactIdNode = XmlUtil.getChildByTagName(projNode, "artifactId");
									if (!artifactIdNode) {
										var sErrorText = sProjectFolderPath + " - " + that.context.i18n.getText("i18n", "LibraryDiscovery_WSP_NoLibraryNamespace");
										return new Error(sErrorText);
									}
									sLibraryName = artifactIdNode.textContent;
								}
								return "/" + sLibraryName.split(".").join("/");
							});
						}else{
							return oNamespace;
						}
					});
				});
			},

			isLibraryProject: function(sProjectFolderPath) {
				var that = this;

				return that.context.service.document.getDocumentByPath(sProjectFolderPath).then(function(oDocument) {
					return that.context.service.projectType.getProjectTypes(oDocument).then(function(projectTypes) {
						for (var i = 0; i < projectTypes.length; i++) {
							if (projectTypes[i].id === "com.watt.uitools.plugin.reuselibrary") {
								return true;
							}
						}
						return false;
					});
				}).fail(function() {
					return false;
				});
			},

			// getLibrariesFromABAP
			getLibrariesFromABAP: function(destination) {
				var abapRepositoryService = this.context.service.abaprepository;
				var discovery = this.context.service.discovery;
				var that = this;
				return discovery.getStatusBySystem(destination).then(function(status) {
					var discoveryStatus = status;
					if (discoveryStatus) {
						return abapRepositoryService.getApplications(discoveryStatus).then(function(oApplications) {

							// filter applications for libraries
							return that._filterABAPLibraries(oApplications, discoveryStatus).then(function(result) {
								return result;
							});

						});
					}

				});
			},

			//get libraries from sap.m
			getLibrariesFromSAPUI5: function() {
				var sapmLibrary = "sap.m";
				sap.ui.getCore().loadLibrary(sapmLibrary);
				var sapmLibraries = sap.ui.getCore().getLoadedLibraries()[sapmLibrary];
				var sapmControls = sapmLibraries.controls;
				var controlArr = [];

				for (var control in sapmControls) {
					var controlData = {};
					controlData.name = sapmControls[control];
					controlArr.push(controlData);
				}
				return [this._buildLibraryJson(sapmLibrary, sapmLibrary, "", controlArr, sapmLibraries.version, "", "", "")];
			},

			//get libraries from the workspace
			getLibrariesFromWorkspace: function() {
				var libraries = [];
				var that = this;
				var documentProviderService = this.context.service.filesystem.documentProvider;
				return documentProviderService.getRoot()
					.then(function(oRootDocument) {
						return oRootDocument.getFolderContent();

					})
					.then(function(aDocuments) {
						var aPromises = [];
						jQuery.each(aDocuments, function(iIndex, oDocument) {
							aPromises.push(that._getWorkspaceLibrary(oDocument, documentProviderService));
						});

						return Q.allSettled(aPromises).then(function(results) {
							results.forEach(function(result) {
								if (result.state === "fulfilled") {
									if (result.value) {
										libraries.push(result.value);
									}
								}
							});
							return libraries;
						});
					});
			},

			// getLibrariesFromHCP
			getLibrariesFromHCP: function() {
				var that = this;

				return that.context.service.hcpauthentication.authenticate().then(function(oUserCrad) {
					var username = oUserCrad.username;
					var password = oUserCrad.password;

					return that._getLibrariesFromHCP(username, password);
				});

			},

			_getLibrariesFromHCP: function(username, password) {
				var systemService = this.context.service.system;
				var heliumService = this.context.service.hcpconnectivity;
				var that = this;

				return systemService.getSystemInfo()
					.then(function(systemInfo) {
						//get the account from the system service
						var account = systemInfo.sAccount;
						that.account = account;
						var promises = [];
						// get the applications from helium
						promises.push(heliumService.getApps(account, username, password, true));
						// get the subscriptions from helium
						promises.push(heliumService.getSubscriptions(account, username, password, true));

						var applications = [];
						var startedApplications = [];
						return Q.all(promises)
							.spread(function() {
								applications = arguments[0].concat(arguments[1]);
								//filter sunstarted applications
								for (var i = 0; i < applications.length; i++) {
									var value = applications[i].status;
									if (value === "STARTED") {
										startedApplications.push(applications[i]);
									}
								}
								that.startedApplications = startedApplications;
								if (startedApplications.length > 0) {
									return that._filterHCPLibraries(startedApplications, account, username, password);
								} else {
									return [];
								}
							});
					});
			},

			getLibraryFromHCP: function(appName, version) {
				for (var i = 0; i < this.startedApplications.length; i++) {
					if (this.startedApplications[i].name === appName) {
						if (version === "Active") {
							version = this.startedApplications[i].activeVersion;
						}
						return this._getHCPLibrary(this.account, this.startedApplications[i], version);
					}
				}
			},

			getLibraryDiscoveryUI: function(oContentType) {
				var that = this;
				that.context.oContentType = oContentType;
				return that.context.service.pluginmanagement.getPluginPath("sap.watt.saptoolsets.fiori.common.librarydiscovery").
				then(function(isPluginPath) {
					jQuery.sap.registerModulePath("sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery", isPluginPath);
					var oLibraryDiscoveryView = sap.ui.view({
						viewName: "sap.watt.saptoolsets.fiori.common.plugin.librarydiscovery.ui.view.LibraryDiscoveryPane",
						type: sap.ui.core.mvc.ViewType.JS,
						viewData: that.context
					});

					var oLibraryDiscoveryUI = {
						content: oLibraryDiscoveryView,
						getSelectedContent: function() {
							return oLibraryDiscoveryView.oController.getSelectedContent();
						},
						setChangeHandler: function(fChangeHandler) {
							oLibraryDiscoveryView.oController.setSelectionChangeHandler(fChangeHandler);
						},
						getRepositoryType: function() {
							return oLibraryDiscoveryView.oController.getRepositoryType();
						},
						initDataBeforeOpen: function(initDataBeforeOpen) {
							oLibraryDiscoveryView.oController.initDataBeforeOpen(initDataBeforeOpen);
						},
						setValidationHandler: function(fValidationHandler) {
							oLibraryDiscoveryView.oController.setValidationHandler(fValidationHandler);
						},
						setProgressHandler: function(fProgressHandler) {
							oLibraryDiscoveryView.oController.setProgressHandler(fProgressHandler);
						}
					};

					return oLibraryDiscoveryUI;
				});
			}
		};

		return LibraryDiscoveryService;
	});