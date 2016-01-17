define({
	_sUI5Id: '#sap-ui-bootstrap',
	_sNewFileName: "mock_preview_sapui5.html",
	_sUI5BootScript: '<script src="/resources/sap-ui-core.js"	id="sap-ui-bootstrap" data-sap-ui-libs="sap.ui.commons"></script>',
	_sMockScript: "\n{{customScript}}<script>\nvar bRunWithMock = true;\nvar sRunWithMock = jQuery.sap.getUriParameters().get('run-with-mock');\nif (sRunWithMock === 'false') {\nbRunWithMock = false;\n}\nif (bRunWithMock) {\njQuery.sap.require('sap.ui.core.util.MockServer');\nvar uri = '{{rootUri}}';\nvar oMock = new sap.ui.core.util.MockServer({rootUri : uri});\n{{simulate}}\n{{customRequestsPart}}{{annotations}}}\n</script>\n",

	configure: function() {
		this._preloadServices();
	},

	_preloadServices: function() {
		this.context.service.appdescriptorutil.getAnnotations().fail(function() {
			// do nothing
		}).done();
		this.context.service.fioriodata.getServiceUrl().fail(function() {
			// do nothing
		}).done();
		this.context.service.metadataHandler.getMetadataDocuments().fail(function() {
			// do nothing
		}).done();
	},

	buildRunnableDocument: function(oRunnableMockSettings, oOrigFileDocument, oWindow) {
		var that = this;
		var fileService = this.context.service.filesystem.documentProvider;
		var sParentPath = oOrigFileDocument.getEntity().getParentPath();

		return fileService.getDocument(sParentPath).then(
			function(oFolderDocument) {
				return that.context.service.appdescriptorutil.getAppNamespace(oFolderDocument).then(function(sAppNamespace) {
					var sGeneratedScript = that._sMockScript.replace("{{rootUri}}", oRunnableMockSettings.mockUri.split("?")[0].replace(/\/?$/, "/"));
					var _sAppModulePath = sAppNamespace.replace(/\/?$/, "/"); // adds a trailing slash
					var sMetadataPath = oRunnableMockSettings.metadataFilePath;

					if (!sMetadataPath) {
						if (oWindow) {
							oWindow.close();
						}
						return that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_mock_model_missing")).then(function() {
							throw new Error(that.context.i18n.getText("i18n", "msg_mock_fail"));
						});
					}
					// update project.json with the metadata file path 
					that.updateSettings(oFolderDocument, {
						"metadataFilePath": sMetadataPath,
						"mockUri": oRunnableMockSettings.mockUri
					}).done();
					// resolve mockRequests.js file path either from project.json or from metadata file path
					var sMockRequestsExtPath = (oRunnableMockSettings.mockRequestsFilePath) ? oRunnableMockSettings.mockRequestsFilePath :
						sMetadataPath.replace(
							/[^\/]+$/, "");
							
					if (sAppNamespace) {
						var sSimulate = "var _sAppModulePath = \"" + _sAppModulePath + "\";\nvar sMetadataPath = \"" + sMetadataPath +
							"\";\nvar sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + sMetadataPath.replace(\".xml\", \"\"), \".xml\");\n";
					} else {
						sSimulate = "var sMetadataUrl = '" + sMetadataPath + "';\n";
					}

					// prepare mockserver simulate fucntion parameters
					if (oRunnableMockSettings.loadJSONFiles) {
						var sMockdataBaseUrlPath;
						if (sMetadataPath.indexOf("localService") > -1) {
							sMockdataBaseUrlPath = sMetadataPath.replace(/[^\/]+$/, "mockdata");
						} else {
							sMockdataBaseUrlPath = sMetadataPath.replace(/[^\/]+$/, "");
						}
						sSimulate += "oMock.simulate(sMetadataUrl, { sMockdataBaseUrl : '" + sMockdataBaseUrlPath +
							"', bGenerateMissingMockData : true });";
					} else {
						sSimulate += "oMock.simulate(sMetadataUrl);";
					}
					sGeneratedScript = sGeneratedScript.replace("{{simulate}}", sSimulate);
					// prepare remaining of mock script. check if mockserver extension file is required
					var sCustomScript = "";
					var sCustom =
						"oMock.start();\n	jQuery(document).ready(function($) {  sap.m.MessageToast.show('Running in demo mode with mock data.', {  duration : 4000 });\n});\n";
					if (oRunnableMockSettings.loadCustomRequests) {
						// include mockRequests.js script and call its getRequests function to concat to the mockserver requests
						sCustomScript = '<script src=\"' + sMockRequestsExtPath.replace(/[^\/]+$/, "") + 'mockRequests.js\"> </script>\n';
						sCustom =
							"try {\n var aMockRequest = webide.mock.ext.mockRequests.getRequests();\nif (aMockRequest && aMockRequest.length > 0) {\n  oMock.setRequests(oMock.getRequests().concat(aMockRequest));\n}\n} catch(oErr) {\njQuery.sap.log.debug(oErr.message);\n}finally {\n oMock.start();\n	jQuery(document).ready(function($) {  sap.m.MessageToast.show('Running in demo mode with mock data.', {  duration : 4000 }); });\n }";
					}
					sGeneratedScript = sGeneratedScript.replace('{{customScript}}', sCustomScript);
					sGeneratedScript = sGeneratedScript.replace('{{customRequestsPart}}', sCustom);
					var sAnnotationsSimulation = "";
					if (oRunnableMockSettings.aAnnotations && oRunnableMockSettings.aAnnotations.length > 0) {
						var aAnnotations = oRunnableMockSettings.aAnnotations;
						for (var i = 0; i < aAnnotations.length; i++) {
							var oAnnotation = aAnnotations[i],
								sUri = oAnnotation.annotationUri,
								sLocalUri = oAnnotation.annotationLocalUri;
							sAnnotationsSimulation += "new sap.ui.core.util.MockServer({rootUri: \"" + sUri +
								"\", requests: [{ method: \"GET\", path: new RegExp(\"\"),\nresponse: function(oXhr) { \n" +
								"jQuery.sap.require(\"jquery.sap.xml\");\nvar oAnnotations = jQuery.sap.sjax({ url: jQuery.sap.getModulePath(_sAppModulePath + \"" + sLocalUri + "\".replace(\".xml\", \"\"), \".xml\"),\n" +
								"dataType: \"xml\"}).data;\noXhr.respondXML(200, {}, jQuery.sap.serializeXML(oAnnotations));\n" +
								"return true;\n}\n}]\n}).start();\n";
						}
						sAnnotationsSimulation +=
							"//Fake LREP\njQuery.sap.require(\"sap.ui.fl.FakeLrepConnector\");\nsap.ui.fl.FakeLrepConnector.enableFakeConnector(\"fakeLRep.json\");\n";
					}
					sGeneratedScript = sGeneratedScript.replace("{{annotations}}", sAnnotationsSimulation);

					// creates a blob with the content of the new file
					return oOrigFileDocument.getContent().then(
						function(sOriginalHtml) {
							var sNewHtmlContent;
							// search for a sap-ui5 loading script
							var iBootstrapScriptTagPos = sOriginalHtml.search('<script[^>]+id(| )*=(| )*"(| )*sap-ui-bootstrap(| )*"');
							if (iBootstrapScriptTagPos === -1) {
								// sapui5 doesn't exist, add both scripts under the head tag
								var iHeadTagPos = sOriginalHtml.search('<head>');
								sNewHtmlContent = sOriginalHtml.substr(0, iHeadTagPos + '<head>'.length) + that._sUI5BootScript + sGeneratedScript +
									sOriginalHtml.substr(iHeadTagPos + '<head>'.length + 1);
							} else {
								// add mock server script after the sapui5 loading script
								var regex = new RegExp("(| )*</(| )*script(| )*>");
								var sBootstrapScriptEndTag = regex.exec(sOriginalHtml.substr(iBootstrapScriptTagPos))[0];
								var iAddScriptPos = sOriginalHtml.indexOf(sBootstrapScriptEndTag, iBootstrapScriptTagPos) + sBootstrapScriptEndTag.length;

								sNewHtmlContent = sOriginalHtml.substr(0, iAddScriptPos) + sGeneratedScript + sOriginalHtml.substr(iAddScriptPos + 1);
							}
							return oFolderDocument.importFile(new Blob([sNewHtmlContent]), false, true, that._sNewFileName).then(function(oNewFileDoc) {
								if (!oNewFileDoc) {
									throw new Error(that.context.i18n.getText("i18n", "msg_mock_fail"));
								}
								return oNewFileDoc;
							});
						}).fail(function() {
						that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_mock_fail")).done();
					});
				}).fail(function(oError) {
					that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_mock_fail")).done();
				});
			});

	},

	runWithMock: function(oSettings, oMetadataFolderDocument, oOrigFileDocument, oWindow) {
		var that = this;
		var fileService = this.context.service.filesystem.documentProvider;
		var oPreviewService = this.context.service.preview;
		var sParentPath = oOrigFileDocument.getEntity().getParentPath();

		return fileService.getDocument(sParentPath).then(
			function(oFolderDocument) {
				// prepare script

				// rootUri parameter for the mockserver constructor
				var sGeneratedScript = that._sMockScript.replace('{{rootUri}}', oSettings.mockUri.split("?")[0].replace(/\/?$/, "/"));
				// resolve metadata file path either from project.json or look in project
				var sMetadataPath = (oSettings.metadataFilePath) ? oSettings.metadataFilePath : that
					._getMetadataRelativeURL(oMetadataFolderDocument, oOrigFileDocument);
				// update project.json with the metadata file path 
				that.updateSettings(oMetadataFolderDocument, {
					mockUri: oSettings.mockUri,
					metadataFilePath: sMetadataPath
				}).done();
				// resolve mockRequests.js file path either from project.json or from metadata file path
				var sMockRequestsExtPath = (oSettings.mockRequestsFilePath) ? oSettings.mockRequestsFilePath : sMetadataPath.replace(/[^\/]+$/, '');
				var sSimulate = "oMock.simulate('" + sMetadataPath + "');";
				// prepare mockserver simulate fucntion parameters
				if (oSettings.loadJSONFiles) {
					sSimulate = "oMock.simulate('" + sMetadataPath + "', { sMockdataBaseUrl : '" + sMetadataPath.replace(/[^\/]+$/, '') +
						"', bGenerateMissingMockData : true });";
				}
				sGeneratedScript = sGeneratedScript.replace('{{simulate}}', sSimulate);
				// prepare remaining of mock script. check if mockserver extension file is required
				var sCustomScript = "";
				var sCustom =
					"oMock.start();\n	jQuery(document).ready(function($) {  sap.m.MessageToast.show('Running in demo mode with mock data.', {  duration : 4000 });\n});\n";
				if (oSettings.loadCustomRequests) {
					// include mockRequests.js script and call its getRequests function to concat to the mockserver requests
					sCustomScript = '<script src=\"' + sMockRequestsExtPath.replace(/[^\/]+$/, "") + 'mockRequests.js\"> </script>\n';
					sCustom =
						"try {\n var aMockRequest = webide.mock.ext.mockRequests.getRequests();\nif (aMockRequest && aMockRequest.length > 0) {\n  oMock.setRequests(oMock.getRequests().concat(aMockRequest));\n}\n} catch(oErr) {\njQuery.sap.log.debug(oErr.message);\n}finally {\n oMock.start();\n	jQuery(document).ready(function($) {  sap.m.MessageToast.show('Running in demo mode with mock data.', {  duration : 4000 }); });\n }";
				}
				sGeneratedScript = sGeneratedScript.replace('{{customScript}}', sCustomScript);
				sGeneratedScript = sGeneratedScript.replace('{{customRequestsPart}}', sCustom);
				// creates a blob with the content of the new file
				return oOrigFileDocument.getContent().then(
					function(sOriginalHtml) {
						var sNewHtmlContent;
						// search for a sap-ui5 loading script
						var iBootstrapScriptTagPos = sOriginalHtml.search('<script[^>]+id(| )*=(| )*"(| )*sap-ui-bootstrap(| )*"');
						if (iBootstrapScriptTagPos === -1) {
							// sapui5 doesn't exist, add both scripts under the head tag
							var iHeadTagPos = sOriginalHtml.search('<head>');
							sNewHtmlContent = sOriginalHtml.substr(0, iHeadTagPos + '<head>'.length) + that._sUI5BootScript + sGeneratedScript +
								sOriginalHtml.substr(iHeadTagPos + '<head>'.length + 1);
						} else {
							// add mock server script after the sapui5 loading script
							var regex = new RegExp("(| )*</(| )*script(| )*>");
							var sBootstrapScriptEndTag = regex.exec(sOriginalHtml.substr(iBootstrapScriptTagPos))[0];
							var iAddScriptPos = sOriginalHtml.indexOf(sBootstrapScriptEndTag, iBootstrapScriptTagPos) + sBootstrapScriptEndTag.length;

							sNewHtmlContent = sOriginalHtml.substr(0, iAddScriptPos) + sGeneratedScript + sOriginalHtml.substr(iAddScriptPos + 1);
						}
						return oFolderDocument.importFile(new Blob([sNewHtmlContent]), false, true, that._sNewFileName).then(function(oNewFileDoc) {
							if (!oNewFileDoc) {
								throw new Error(that.context.i18n.getText("i18n", "msg_mock_fail"));
							}
							return oPreviewService.getPreviewUrl(oNewFileDoc).then(function(oUri) {
								return oPreviewService.showPreview(oUri, oWindow);
							});
						});
					}).fail(function(oEvent) {
					that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_mock_fail")).done();
				});
			});
	},

	updateSettings: function(oDocument, oConfig) {
		var that = this;
		oConfig = oConfig ? oConfig : {};
		return this.context.service.setting.project.get(this.context.self, oDocument).then(function(oSettings) {
			if (oSettings) {
				oSettings.mockUri = oConfig.mockUri ? oConfig.mockUri : oSettings.mockUri || "";
				oSettings.metadataFilePath = oConfig.metadataFilePath ? oConfig.metadataFilePath : oSettings.metadataFilePath || "";
				oSettings.loadJSONFiles = oConfig.loadJSONFiles ? oConfig.loadJSONFiles : oSettings.loadJSONFiles || false;
				oSettings.loadCustomRequests = oConfig.loadCustomRequests ? oConfig.loadCustomRequests : oSettings.loadCustomRequests || false;
				oSettings.mockRequestsFilePath = oConfig.mockRequestsFilePath ? oConfig.mockRequestsFilePath : oSettings.mockRequestsFilePath ||
					"";
			} else {
				oSettings = {
					"mockUri": oConfig.mockUri || "",
					"metadataFilePath": oConfig.metadataFilePath || "",
					"loadJSONFiles": oConfig.loadJSONFiles || false,
					"loadCustomRequests": oConfig.loadCustomRequests || false,
					"mockRequestsFilePath": oConfig.mockRequestsFilePath || ""
				};
			}

			return that.context.service.setting.project.set(that.context.self, oSettings, oDocument);
		});
	},

	// get settings for running with mock
	getRunnableMockSettings: function(oDocument, oSettings) {
		var that = this;
		var oRunnableMockSettings = {};
		//handle settings that can come from manifest.json file
		//handle service uri
		return that._getServiceURI(oDocument, oSettings).then(function(sMockUri) {
			oRunnableMockSettings.mockUri = sMockUri;
			//handle metadata path
			return that._getMetadataFilePath(oDocument, oSettings).then(function(sMetadataPath) {
				oRunnableMockSettings.metadataFilePath = sMetadataPath;
				//handle annotations
				return that.context.service.appdescriptorutil.getAnnotations(oDocument).then(function(aAnnotations) {
					oRunnableMockSettings.aAnnotations = aAnnotations;
					// settings that come only from project settings
					oRunnableMockSettings.loadJSONFiles = oSettings ? oSettings.loadJSONFiles : undefined;
					oRunnableMockSettings.loadCustomRequests = oSettings ? oSettings.loadCustomRequests : undefined;
					oRunnableMockSettings.mockRequestsFilePath = oSettings ? oSettings.mockRequestsFilePath : undefined;
					return oRunnableMockSettings;
				});
			});
		});
	},

	//get serviceURI from appdescrtoptor, if not there, take it from project settings
	_getServiceURI: function(oDocument, oSettings) {
		var that = this;
		return oDocument.getProject().then(function(oProject) {
			var sProjectPath = oProject.getEntity().getFullPath();
			return that.context.service.fioriodata.getServiceUrl(sProjectPath, "OData").then(function(sServiceUrl) {
				//get service uri from manifest.json
				if (typeof(sServiceUrl) !== "undefined") {
					return sServiceUrl;
				} else {
					//get service url from project settings
					oSettings = oSettings ? oSettings : {
						"mockUri": ""
					};
					return oSettings.mockUri ? oSettings.mockUri : "";
				}
			});
		});
	},

	//get metadata.xml path from manifest.json, if not there get it from project settings, if not there get it from model folder.
	_getMetadataFilePath: function(oDocument, oSettings) {
		var that = this;
		return that.context.service.appdescriptorutil.getMetadataPath(oDocument).then(function(sMetadataPath) {
			if (sMetadataPath) {
				return sMetadataPath;
			} else {
				// there is no metadata localUri in manifest.json , take it from project settings
				if (oSettings && oSettings.metadataFilePath) {
					return oSettings.metadataFilePath;
					//look for the metadata.xml under model folder inside project
				} else {
					return oDocument.getProject().then(function(oParentDocumet) {
						return that.context.service.metadataHandler.getMetadataDocuments(oParentDocumet).then(function(aModelDocuments) {
							if (aModelDocuments.length === 0) {
								return "";
							} else {
								return that._getMetadataRelativeURL(aModelDocuments[0], oDocument);
							}
						});
					});
				}
			}
		});
	},

	// calculates relative path from index.html(runnable html file) to the metadata.xml, e.g. model/metadata.xml
	_getMetadataRelativeURL: function(oMetadataFolderDocument, oOrigFileDocument) {
		var aMetadata = oMetadataFolderDocument.getEntity().getFullPath().split("/");
		var aIndex = oOrigFileDocument.getEntity().getFullPath().split("/");
		var sPath = "";
		var i = 0;

		while (aMetadata[i] === aIndex[i]) {
			i++;
		}

		//go up for the reset of the folders in the index.hrml path
		var iNotEqual = aIndex.length - 1 - i;
		for (var j = 0; j < iNotEqual; j++) {
			sPath += "../";
		}

		//add the relevant path from the the metadata's path
		sPath += aMetadata.splice(i, aMetadata.length).join("/");
		return sPath.substring(0, sPath.length);
	},

	onAfterGenerate: function(oEvent) {
		var oConnectionData = oEvent.params.model.connectionData;

		if (!oConnectionData) {
			return;
		}

		var mockUri = oConnectionData.runtimeUrl;
		if (oConnectionData.destination && oConnectionData.destination.wattUsage === "river") {
			mockUri = oConnectionData.url;
		}
		if (mockUri && mockUri.lastIndexOf("/") === mockUri.length - 1) {
			mockUri = mockUri.substring(0, mockUri.length - 1);
		}

		var oConfig = {
			"mockUri": mockUri
		};
		return this.updateSettings(oEvent.params.targetDocument, oConfig);

	}

});