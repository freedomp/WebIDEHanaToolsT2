define(["sap/watt/lib/lodash/lodash", "STF"], function(_, STF) {

	"use strict";

	var suiteName = "MetadataHandler_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, oFakeFileDAO, oFilesystem, oMetadataHandlerService;
		var METADATA_FILE_NAME = "metadata.xml";
		var ANNOTATION_FILE_NAME = "annotation.xml";
		var ANNOTATION_CLAIMS_FILE_NAME = "annotation_claims.xml";
		var MODEL_FOLDER_NAME = "model";
		var LOCALSERVICE_FOLDER_NAME = "localService";
		var WEBAPP_LOCALSERVICE_FOLDER_NAME = "webapp/localService";
		var WEBAPP_FOLDER_NAME = "webapp";
		var ANNOTATIONS_FOLDER_NAME = "annotations";
		var sServiceName = "myService";
		var metadataServiceImpl = null;
		var oProj1CompNoManifestROOTMDDocument = null;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function (oWindow) {
				oFakeFileDAO = getService('fakeFileDAO');
				oFilesystem = getService('filesystem.documentProvider');
				oMetadataHandlerService = getService('metadataHandler');
				jQuery = oWindow.jQuery;

				// require the metadata handler class from the Web IDE
				return STF.getServicePrivateImpl(oMetadataHandlerService);
			}).then(function (oServiceImpl) {
				metadataServiceImpl = oServiceImpl;
				return createFileStructure();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		var componentJSContent = "\"manifest\": \"json\"";
		var componentJSNoManifestContent = "           ";

		var sManifestContent = JSON.stringify({
				"_version": "1.1.0",
				"start_url": "start.html",
				"sap.app": {
					"_version": "1.1.0",
					"id": "sap.fiori.appName",
					"type": "application",
					"i18n": "",
					"applicationVersion": {
						"version": "1.2.2"
					},
					"ach": "PA-FIO",
					"dataSources": {
						"sfapi": {
							"uri": "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							"type": "OData",
							"settings": {
								"odataVersion": "2.0",
								"annotations": ["equipmentanno"],
								"localUri": "model/metadata.xml"
							}
						},
						"ppm": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {}
						},
						"posrv": {
							"uri": "/sap/opu/odata/snce/PO_M_SRV/"
						},
						"equipmentanno": {
							"uri": "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							"type": "ODataAnnotation",
							"settings": {
								"localUri": "model/annotations.xml"
							}
						}
					},
					"offline": true,
					"sourceTemplate": {
						"id": "sap.ui.ui5-template-plugin.1worklist",
						"version": "1.0.0"
					}
				}
			}
		);

		function createFileStructure() {
			return oFakeFileDAO.setContent({
				"proj0UnderUserDefined": {
					"Component.js" : componentJSContent
				},
				"proj1NoComponent": {
				},
				"proj1UnderModel": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj1CompNoManifestROOT": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj1CompNoManifestROOTORG": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj1CompNoManifestROOTAndContent": {
					"Component.js" : componentJSNoManifestContent
				},
				"proj2UnderLocalService": {
					"Component.js" : componentJSContent,
					"manifest.json" : sManifestContent
				},
				"proj2CompManifestROOT": {
					"Component.js" : componentJSContent,
					"manifest.json" : sManifestContent
				},
				"proj3CompManifestSRC": {
					"src": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent
					}
				},
				"proj4CompManifest": {
					"src": {
						"Component.js" : componentJSContent
					},
					"manifest.json" : sManifestContent
				},
				"proj5CompManifest": {
					"src": {
						"manifest.json" : sManifestContent
					},
					"Component.js" : componentJSContent
				},
				"proj6CompManifestROOTTestService": {
					"Component.js" : componentJSContent,
					"manifest.json" : sManifestContent,
					"localService" : {
					}
				},
				"proj7CompManifestROOTTestServiceMD": {
					"Component.js" : componentJSContent,
					"manifest.json" : sManifestContent,
					"localService" : {
						"metadata.xml" : ""
					}
				},
				"proj8CompNoManifestROOT": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj9UnderWebAppLocalService": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent
					}
				},
				"proj9CompManifestSRC": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent
					}
				},
				"proj12CompManifestROOT": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent
					}
				},
				"proj13CompManifestROOTTestService": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent,
						"localService" : {
						}
					}
				},
				"proj14CompManifestROOTTestServiceMD": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent,
						"localService" : {
							"metadata.xml" : ""
						}
					}
				},
				"proj15SmartTemplate": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent,
						"localService" : {
							"metadata.xml" : ""
						}
					}
				},
				"proj16MDAnnoTemplate": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj17MDAnnoTemplateNoConnData": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj18OldFioriApp": {
					"Component.js" : componentJSContent,
					"webapp": {
						"model": {
							"metadata.xml": ""
						}
					}
				},
				"proj19ModelComp": {
					"Component.js" : componentJSContent,
					"model" : {
						"metadata.xml" : ""
					}
				},
				"proj20CompSmart": {
					"webapp": {
						"Component.js" : componentJSContent,
						"manifest.json" : sManifestContent,
						"localService" : {
							"metadata.xml" : ""
						}
					}

				}
			});
		}

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter1/service/MetaDataHandler/" +
				sFileName;
		}


		//########################### onAfterGenerate tests #####################################

		var oEventNoCompNoWebApp = {
			name: "generated",
			params: {
				model: {
					connectionData: {
						metadataContent : null,
						serviceName: "WFSERVICE",
						type: "river"
					}
				},
				selectedTemplate : {
					getId : function(){
						return "some id";
					},
					getVersion : function(){
						return "some version";
					}
				},
				targetDocument : null
			}
		};

		it("onAfterGenerate - Generate metadata under model folder", function() {

			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				oEventNoCompNoWebApp.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj1UnderModel").then(function(oTargetDocument) {
					oEventNoCompNoWebApp.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventNoCompNoWebApp)).then(function() {
						return oFilesystem.getDocument("/proj1UnderModel/" + MODEL_FOLDER_NAME + "/metadata.xml").
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});


		it("onAfterGenerate - Generate metadata under localservice", function() {

			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				oEventNoCompNoWebApp.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj2UnderLocalService").then(function(oTargetDocument) {
					oEventNoCompNoWebApp.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventNoCompNoWebApp)).then(function() {
						return oFilesystem.getDocument("/proj2UnderLocalService/" + LOCALSERVICE_FOLDER_NAME + "/metadata.xml").
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});


		it("onAfterGenerate - Generate metadata under webapp/localservice", function() {

			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				oEventNoCompNoWebApp.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj9UnderWebAppLocalService").then(function(oTargetDocument) {
					oEventNoCompNoWebApp.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventNoCompNoWebApp)).then(function() {
						return oFilesystem.getDocument("/proj9UnderWebAppLocalService/" + WEBAPP_LOCALSERVICE_FOLDER_NAME + "/metadata.xml").
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});

		it("onAfterGenerate - Old structure of Fiori applications - model folder under webapp path", function() {

			var oEventModelWebApp = {
				name: "generated",
				params: {
					model: {
						connectionData: {
							metadataContent : null,
							serviceName: "WFSERVICE",
							type: "river"
						},
						webappPath : "webapp/model"
					},
					targetDocument : null
				}
			};

			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				oEventModelWebApp.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj18OldFioriApp").then(function(oTargetDocument) {
					oEventModelWebApp.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventModelWebApp)).then(function() {
						return oFilesystem.getDocument("/proj18OldFioriApp/" + WEBAPP_FOLDER_NAME +
							"/" + MODEL_FOLDER_NAME + "/metadata.xml").
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});

		it("onAfterGenerate - Generate metadata smart template scenario", function() {

			var oEventSmartTemp = {
				name: "generated",
				params: {
					model: {
						connectionData: {
							metadataContent : null,
							serviceName: "WFSERVICE",
							type: "river"
						},
						annotations : [
							{
								name : "SEPMRA_PROD_MAN_ANNO_MDL",
								url : "https://webidetestingcomsapwatt-x80be6fbb.dispatcher.neo.ondemand.com/desti…nnotations(TechnicalName='SEPMRA_PROD_MAN_ANNO_MDL',Version='0001')/$value",
								runtimeUrl : "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='SEPMRA_PROD_MAN_ANNO_MDL',Version='0001')/$value/",
								destination : {
									name : "RefAppsBackendDev",
									description : "RefAppsBackendDev",
									proxyUrlPrefix : "/destinations/RefAppsBackendDev",
									path : "/sap/opu/odata",
									url : "/destinations/RefAppsBackendDev/sap/opu/odata",
									wattUsage : "odata_abap",
									systemId : "RefAppsBackendDev",
									entryPath : "/sap/opu/odata",
									sapClient : "815",
									additionalData : []
								},
								filename : "SEPMRA_PROD_MAN_ANNO_MDL.xml",
								content : "",
								generateInModelFolder : true
							}
						]
					},
					targetDocument : null
				}
			};



			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				return Q(jQuery.ajax({url: require.toUrl(fullPath(ANNOTATION_FILE_NAME)), dataType: "text"})).then(function (annoData) {
					oEventSmartTemp.params.model.connectionData.metadataContent = data;
					oEventSmartTemp.params.model.annotations[0].content = annoData;
					return oFilesystem.getDocument("/proj15SmartTemplate").then(function(oTargetDocument) {
						oEventSmartTemp.params.targetDocument = oTargetDocument;
						return Q(metadataServiceImpl.onAfterGenerate(oEventSmartTemp)).then(function() {
							return oFilesystem.getDocument("/proj15SmartTemplate/" +
								WEBAPP_LOCALSERVICE_FOLDER_NAME +
								"/metadata.xml").
								then(function(oMetaDataDoc) {
									return oFilesystem.getDocument("/proj15SmartTemplate/" +
										WEBAPP_LOCALSERVICE_FOLDER_NAME + "/" +
										oEventSmartTemp.params.model.annotations[0].filename).
										then(function(oAnnoDoc) {
											assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
											assert.ok(oAnnoDoc, "Found annotation XML in right place");
										});

								});
						});
					});
				});
			});
		});

		it("onAfterGenerate - Generate metadata Master Details Annotation scenario", function() {

			var oEventMDAnnoTemp = {
				name: "generated",
				params: {
					model: {
						connectionData: {
							metadataContent : null,
							serviceName: "WFSERVICE",
							type: "river"
						},
						annotations : [
							{
								name : "localAnnotations0",
								url : null,
								runtimeUrl : null,
								destination : null,
								filename : "localAnnotations0.xml",
								content : "",
								generateInModelFolder : true
							}
						]
					},
					targetDocument : null
				}
			};



			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				return Q(jQuery.ajax({url: require.toUrl(fullPath(ANNOTATION_CLAIMS_FILE_NAME)), dataType: "text"})).then(function (annoData) {
					oEventMDAnnoTemp.params.model.connectionData.metadataContent = data;
					oEventMDAnnoTemp.params.model.annotations[0].content = annoData;
					return oFilesystem.getDocument("/proj16MDAnnoTemplate").then(function(oTargetDocument) {
						oEventMDAnnoTemp.params.targetDocument = oTargetDocument;
						return Q(metadataServiceImpl.onAfterGenerate(oEventMDAnnoTemp)).then(function() {
							return oFilesystem.getDocument("/proj16MDAnnoTemplate/" +
								MODEL_FOLDER_NAME +
								"/" + METADATA_FILE_NAME).
								then(function(oMetaDataDoc) {
									return oFilesystem.getDocument("/proj16MDAnnoTemplate/" +
										ANNOTATIONS_FOLDER_NAME + "/" +
										oEventMDAnnoTemp.params.model.annotations[0].filename).
										then(function(oAnnoDoc) {
											assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
											assert.ok(oAnnoDoc, "Found annotation XML in right place");
										});

								});
						});
					});
				});
			});
		});

		it("onAfterGenerate - Add new component scenario model folder exists", function() {

			var oEventModelComponent = {
				name: "generated",
				params: {
					model: {
						connectionData: {
							metadataContent : null,
							serviceName: "WFSERVICE",
							type: "river"
						},
						componentPath : "/proj19ModelComp"
					},
					targetDocument : null
				}
			};

			return Q(jQuery.ajax({url: require.toUrl(fullPath("wf_metadata.xml")), dataType: "text"})).then(function (data) {
				oEventModelComponent.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj19ModelComp").then(function(oTargetDocument) {
					oEventModelComponent.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventModelComponent)).then(function() {
						return oFilesystem.getDocument("/proj19ModelComp" +
							"/" + MODEL_FOLDER_NAME + "/" + METADATA_FILE_NAME).
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});

		it("onAfterGenerate - Add new component smart template scenario", function() {

			var oEventModelComponent = {
				name: "generated",
				params: {
					model: {
						connectionData: {
							metadataContent : null,
							serviceName: "WFSERVICE",
							type: "river"
						},
						componentPath : "/proj20CompSmart"
					},
					targetDocument : null
				}
			};

			return Q(jQuery.ajax({url: require.toUrl(fullPath("wf_metadata.xml")), dataType: "text"})).then(function (data) {
				oEventModelComponent.params.model.connectionData.metadataContent = data;
				return oFilesystem.getDocument("/proj20CompSmart").then(function(oTargetDocument) {
					oEventModelComponent.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventModelComponent)).then(function() {
						return oFilesystem.getDocument("/proj20CompSmart" +
							"/" + WEBAPP_LOCALSERVICE_FOLDER_NAME + "/" + METADATA_FILE_NAME).
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});


		it("onAfterGenerate - No connection data but with annotations", function() {

			var oEventNoConData = {
				name: "generated",
				params: {
					model: {
						annotations : [
							{
								name : "localAnnotations0",
								url : null,
								runtimeUrl : null,
								destination : null,
								filename : "localAnnotations0.xml",
								content : "",
								generateInModelFolder : true
							}
						]
					},
					targetDocument : null
				}
			};

			return Q(jQuery.ajax({url: require.toUrl(fullPath(ANNOTATION_CLAIMS_FILE_NAME)), dataType: "text"})).then(function (annoData) {
				oEventNoConData.params.model.annotations[0].content = annoData;
				return oFilesystem.getDocument("/proj17MDAnnoTemplateNoConnData").then(function(oTargetDocument) {
					oEventNoConData.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventNoConData)).then(function() {
						return oFilesystem.getDocument("/proj17MDAnnoTemplateNoConnData/" +
							ANNOTATIONS_FOLDER_NAME + "/" +
							oEventNoConData.params.model.annotations[0].filename).
							then(function(oAnnoDoc) {
								assert.ok(oAnnoDoc, "Found annotation XML in right place");
							});

					});
				});
			});
		});

		it("onAfterGenerate - Generate metadata under user defined folder", function() {

			return Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})).then(function (data) {
				oEventNoCompNoWebApp.params.model.connectionData.metadataContent = data;
				oEventNoCompNoWebApp.params.model.connectionData.metadataPath = "MD";
				return oFilesystem.getDocument("/proj0UnderUserDefined").then(function(oTargetDocument) {
					oEventNoCompNoWebApp.params.targetDocument = oTargetDocument;
					return Q(metadataServiceImpl.onAfterGenerate(oEventNoCompNoWebApp)).then(function() {
						return oFilesystem.getDocument("/proj0UnderUserDefined/MD/metadata.xml").
							then(function(oMetaDataDoc) {
								assert.ok(oMetaDataDoc, "Found metadata.xml in right place");
							});
					});
				});
			});
		});

		//########################### getMetadataPath tests #####################################

		it("getMetadataPath - Component.js file is missing", function() {
			return oFilesystem.getDocument("/proj1NoComponent").then(function(oTargetDocument) {
				return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
					assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
				});
			});
		});


		it("getMetadataPath - positive flow", function() {
			return oFilesystem.getDocument("/proj1CompNoManifestROOT").then(function(oTargetDocument) {
				return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
					assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
				});
			});
		});

		it("getMetadataPath - params are null", function() {
			return oMetadataHandlerService.getMetadataPath(null, null).then(function(sMetadataPath) {
				assert.equal(sMetadataPath, undefined, "Got Right metadata path");
			});
		});

		it("getMetadataPath - params are undefined", function() {
			return oMetadataHandlerService.getMetadataPath(undefined, undefined).then(function(sMetadataPath) {
				assert.equal(sMetadataPath, undefined, "Got Right metadata path");
			});
		});

		it("getMetadataPath - component exist but with no manifest and not sServiceName", function() {
			return oFilesystem.getDocument("/proj1CompNoManifestROOT").then(function(oTargetDocument) {
				return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
					assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
				});
			});
		});

		it("getMetadataPath - component exist but with no refer to manifest in it", function() {
			return oFilesystem.getDocument("/proj1CompNoManifestROOTAndContent").then(function(oTargetDocument) {
				return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
					assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
				});
			});
		});

		it("getMetadataPath - component exist but with manifest and not sServiceName ", function() {
			return oFilesystem.getDocument("/proj2CompManifestROOT").then(function(oTargetDocument) {
				return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
					assert.equal(sMetadataPath, LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
				});
			});
		});

		it("getMetadataPath - component exist with manifest and not sServiceName (both files under src",
			function() {
				return oFilesystem.getDocument("/proj3CompManifestSRC").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
						assert.equal(sMetadataPath, LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
					});
				});
			});

		it("getMetadataPath - component exist with manifest and not sServiceName (Component under src " +
			"& manifest on root",
			function() {
				return oFilesystem.getDocument("/proj4CompManifest").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).
						then(function(sMetadataPath) {
							assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
						});
				});
			});

		it("getMetadataPath - component exist with manifest and not sServiceName (manifest under src " +
			"& Component on root",
			function() {
				return oFilesystem.getDocument("/proj5CompManifest").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).
						then(function(sMetadataPath) {
							assert.equal(sMetadataPath, MODEL_FOLDER_NAME, "Got Right metadata path");
						});
				});
			});

		it("getMetadataPath - component exist with manifest and sServiceName, no localService exists",
			function() {
				return oFilesystem.getDocument("/proj2CompManifestROOT").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
						then(function(sMetadataPath) {
							assert.equal(sMetadataPath, WEBAPP_LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
						});
				});
			});

		it("getMetadataPath - component exist with manifest and sServiceName, no metadata.xml",
			function() {
				return oFilesystem.getDocument("/proj6CompManifestROOTTestService").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
						then(function(sMetadataPath) {
							assert.equal(sMetadataPath, LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
						});
				});
			});

		it("getMetadataPath - component exist with manifest and sServiceName, with metadata.xml",
			function() {
				return oFilesystem.getDocument("/proj7CompManifestROOTTestServiceMD").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
						then(function(sMetadataPath) {
							assert.equal(sMetadataPath, LOCALSERVICE_FOLDER_NAME + "/" + sServiceName, "Got Right metadata path");
						});
				});
			});

		it("getMetadataPath - component exist with manifest and not sServiceName (both files under webapp",
			function() {
				return oFilesystem.getDocument("/proj9CompManifestSRC").then(function(oTargetDocument) {
					return oMetadataHandlerService.getMetadataPath(oTargetDocument, null).then(function(sMetadataPath) {
						assert.equal(sMetadataPath, WEBAPP_LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
					});
				});
			});


		 it("getMetadataPath - component exist with manifest under webapp and sServiceName, no test/service exists",
		         function() {
		             return oFilesystem.getDocument("/proj12CompManifestROOT").then(function(oTargetDocument) {
		                 return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
		                         then(function(sMetadataPath) {
		                             assert.equal(sMetadataPath, WEBAPP_LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
		                         });
		             });
		         });

		 it("getMetadataPath - component exist with manifest under webapp and sServiceName, no metadata.xml",
		         function() {
		             return oFilesystem.getDocument("/proj13CompManifestROOTTestService").then(function(oTargetDocument) {
		                 return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
		                         then(function(sMetadataPath) {
		                             assert.equal(sMetadataPath, WEBAPP_LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
		                         });
		             });
		         });

		 it("getMetadataPath - component exist with manifest under webapp and sServiceName, with metadata.xml",
		         function() {
		             return oFilesystem.getDocument("/proj14CompManifestROOTTestServiceMD").then(function(oTargetDocument) {
		                 return oMetadataHandlerService.getMetadataPath(oTargetDocument, sServiceName).
		                         then(function(sMetadataPath) {
		                             assert.equal(sMetadataPath, WEBAPP_LOCALSERVICE_FOLDER_NAME, "Got Right metadata path");
		                         });
		             });
		         });


		//########################### getMetadataDocuments tests #####################################

		it("getMetadataDocuments - null param",
			function() {
				return oMetadataHandlerService.getMetadataDocuments(null).
					then(function(aMetadata) {
						assert.ok(aMetadata, "Got metadata array");
						assert.equal(aMetadata.length, 0, "Got metadata array");
					});
			});

		it("getMetadataDocuments - undefined param",
			function() {
				return oMetadataHandlerService.getMetadataDocuments(undefined).
					then(function(aMetadata) {
						assert.ok(aMetadata, "Got metadata array");
						assert.equal(aMetadata.length, 0, "Got metadata array");
					});
			});

		it("getMetadataDocuments - Component.js file is missing",
			function() {
				return oFilesystem.getDocument("/proj1NoComponent").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.getMetadataDocuments(oTargetDocument).
							then(function(aMetadata) {
								assert.ok(aMetadata, "Got metadata array");
								assert.equal(aMetadata.length, 0, "Got metadata array");
							});
					});
			});

		it("getMetadataDocuments - manifest file is missing, MD under model",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.getMetadataDocuments(oTargetDocument).
							then(function(aMetadata) {
								assert.ok(aMetadata, "Got metadata array");
								assert.equal(aMetadata.length, 1, "Got metadata array");
								assert.equal(aMetadata[0].getEntity().getFullPath(),
									"/proj1CompNoManifestROOT/model/metadata.xml",
									"Got right metadata path");
							});
					});
			});

		//########################### updateMetadataXml tests #####################################


		it("updateMetadataXml - null params",
			function() {
				return oMetadataHandlerService.updateMetadataXml(
					null, //oParentDocumet
					null, //sMetadataContent
					null, //sServiceName
					null //sMetadataPath
				).then(function() {
						assert.ok(true, "updateMetadataXml with null did not crashed");
					});
			});


		it("updateMetadataXml - only oTargetDocument not null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateMetadataXml(
							oTargetDocument, //oParentDocumet
							null, //sMetadataContent
							null, //sServiceName
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateMetadataXml with null did not crashed");
							});
					});
			});

		it("updateMetadataXml - only oTargetDocument & sMetadataContent not null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oFilesystem.getDocument("/proj1CompNoManifestROOT/model/metadata.xml").
							then(function(oModelDocument) {
								oProj1CompNoManifestROOTMDDocument = oModelDocument;
								oFakeFileDAO.importFile = function(){
									var deffered = Q.defer();
									deffered.resolve(oProj1CompNoManifestROOTMDDocument);
									return deffered.promise;
								};

								return oMetadataHandlerService.updateMetadataXml(
									oTargetDocument, //oParentDocument
									"test", //sMetadataContent
									null, //sServiceName
									null //sMetadataPath
								).then(function() {
										assert.ok(true, "updateMetadataXml with null did not crashed");
										assert.ok(oProj1CompNoManifestROOTMDDocument,
											"updateMetadataXml with null did not crashed");                                                       });

							});
					});
			});

		it("updateMetadataXml - sServiceName is null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oFilesystem.getDocument("/proj1CompNoManifestROOT/model/metadata.xml").
							then(function(oModelDocument) {
								oProj1CompNoManifestROOTMDDocument = oModelDocument;
								oFakeFileDAO.importFile = function(){
									var deffered = Q.defer();
									deffered.resolve(oProj1CompNoManifestROOTMDDocument);
									return deffered.promise;
								};

								return oMetadataHandlerService.updateMetadataXml(
									oTargetDocument, //oParentDocument
									"test", //sMetadataContent
									null, //sServiceName
									"model" //sMetadataPath
								).then(function() {
										assert.ok(true, "updateMetadataXml with null did not crashed");
										assert.ok(oProj1CompNoManifestROOTMDDocument,
											"updateMetadataXml with null did not crashed");                                                       });

							});
					});
			});


		//########################### updateAnnotationDocument tests #####################################


		it("updateAnnotationDocument - null params",
			function() {
				return oMetadataHandlerService.updateAnnotationDocument(
					null, //oProjectDocument
					null, //sFileName
					null, //bGenerateInModelFolder
					null, //sContent
					null //sMetadataPath
				).then(function() {
						assert.ok(true, "updateAnnotationDocument with null did not crashed");
					});
			});


		it("updateAnnotationDocument - only oTargetDocument not null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							null, //sFileName
							null, //bGenerateInModelFolder
							null, //sContent
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument with only oTargetDocument " +
									"did not crashed");
							});
					});
			});

		it("updateAnnotationDocument - oTargetDocument & sContent not null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							null, //sFileName
							null, //bGenerateInModelFolder
							"asfasgfas", //sContent
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument with only oTargetDocument " +
									"did not crashed");
							});
					});
			});

		it("updateAnnotationDocument - oTargetDocument & sContent & sFileName not null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							"annotation.xml", //sFileName
							false, //bGenerateInModelFolder
							"asdg", //sContent
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument did not crashed");
								return oFilesystem.
									getDocument(
									"/proj1CompNoManifestROOT/annotation.xml").
									then(function(oAnnotationDoc) {
										assert.ok(oAnnotationDoc, "Success getting oAnnotationDoc");
										return oAnnotationDoc.getContent().
											then(function(sContent) {
												assert.ok(sContent, "Success getting its content");
												assert.equal(sContent, "asdg");
											});
									});
							});
					});
			});

		it("updateAnnotationDocument - sMetadataPath is null",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOT").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							"annotation.xml", //sFileName
							true, //bGenerateInModelFolder
							"xxxx", //sContent
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument did not crashed");
								return oFilesystem.
									getDocument(
									"/proj1CompNoManifestROOT/model/annotation.xml").
									then(function(oAnnotationDoc) {
										assert.ok(oAnnotationDoc, "Success getting oAnnotationDoc");
										return oAnnotationDoc.getContent().
											then(function(sContent) {
												assert.ok(sContent, "Success getting its content");
												assert.equal(sContent, "xxxx");
											});
									});
							});
					});
			});


		it("updateAnnotationDocument - sMetadataPath is null, model folder does not exist",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOTAndContent").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							"annotation.xml", //sFileName
							true, //bGenerateInModelFolder
							"xxxx", //sContent
							null //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument did not crashed");
								return oFilesystem.
									getDocument(
									"/proj1CompNoManifestROOTAndContent/model/annotation.xml").
									then(function(oAnnotationDoc) {
										assert.ok(oAnnotationDoc, "Success getting oAnnotationDoc");
										return oAnnotationDoc.getContent().
											then(function(sContent) {
												assert.ok(sContent, "Success getting its content");
												assert.equal(sContent, "xxxx");
											});
									});
							});
					});
			});


		it("updateAnnotationDocument - sMetadataPath exist",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOTORG").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							"annotation.xml", //sFileName
							true, //bGenerateInModelFolder
							"yyy", //sContent
							"model" //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument did not crashed");
								return oFilesystem.
									getDocument(
									"/proj1CompNoManifestROOTORG/model/annotation.xml").
									then(function(oAnnotationDoc) {
										assert.ok(oAnnotationDoc, "Success getting oAnnotationDoc");
										return oAnnotationDoc.getContent().
											then(function(sContent) {
												assert.ok(sContent, "Success getting its content");
												assert.equal(sContent, "yyy");
											});
									});
							});
					});
			});

		it("updateAnnotationDocument - sMetadataPath does not exist",
			function() {
				return oFilesystem.getDocument("/proj1CompNoManifestROOTORG").
					then(function(oTargetDocument) {
						return oMetadataHandlerService.updateAnnotationDocument(
							oTargetDocument, //oProjectDocument
							"annotation.xml", //sFileName
							true, //bGenerateInModelFolder
							"zzz", //sContent
							"model2" //sMetadataPath
						).then(function() {
								assert.ok(true, "updateAnnotationDocument did not crashed");
								return oFilesystem.
									getDocument(
									"/proj1CompNoManifestROOTORG/model2/annotation.xml").
									then(function(oAnnotationDoc) {
										assert.ok(oAnnotationDoc, "Success getting oAnnotationDoc");
										return oAnnotationDoc.getContent().
											then(function(sContent) {
												assert.ok(sContent, "Success getting its content");
												assert.equal(sContent, "zzz");
											});
									});
							});
					});
			});

		//########################### checkAnnotationLocation tests #####################################

		it("Create Annotation under the 'model' folder", function() {

			var oModel = {
				annotationsXML : {
					content : "annotation content",
					generateInModelFolder : true,
					filename : "bscbn_allocationtable_anno.anno",
					url : "/sap/bc/bsp/sap/bscbn_anf_lo/bscbn_allocationtable_anno.xml?with_otr_ref=X"
				}
			};

			var oProject = {
				"project1" : {
					"fpile1" : "a",
					".project.json" : JSON.stringify({
						"projectType" : []
					})
				}
			};

			var sFileName = oModel.annotationsXML.filename;
			var bGenerateInModelFolder = oModel.annotationsXML.generateInModelFolder;
			var sContent = oModel.annotationsXML.content;

			return oFakeFileDAO.setContent(oProject).then(function () {
				return oFilesystem.getDocument("/project1").then(function(oDoc){
					return oMetadataHandlerService.updateAnnotationDocument(oDoc, sFileName, bGenerateInModelFolder, sContent, null).then(function(){
						return oDoc.getCurrentMetadata(true).then(function(aFolderMetadataContent){
							var oMetadataFile = _.find(aFolderMetadataContent, function(oMetadataElement) {
								return oMetadataElement.name === sFileName && !oMetadataElement.folder
									&& oMetadataElement.parentPath === "/project1/model";
							});
							assert.ok(oMetadataFile,"annotation file was created successfully under the correct folder - model");
						});
					});
				});
			});
		});

		it("Create Annotation under the root folder", function() {
			var oModel = {
				annotationsXML : {
					content : "annotation content",
					filename : "bscbn_allocationtable_anno.anno",
					url : "/sap/bc/bsp/sap/bscbn_anf_lo/bscbn_allocationtable_anno.xml?with_otr_ref=X"
				}
			};

			var oProject = {
				"project2" : {
					"fpile1" : "a",
					".project.json" : JSON.stringify({
						"projectType" : []
					})
				}
			};

			var sFileName = oModel.annotationsXML.filename;
			var bGenerateInModelFolder = oModel.annotationsXML.generateInModelFolder;
			var sContent = oModel.annotationsXML.content;

			return oFakeFileDAO.setContent(oProject).then(function () {
				return oFilesystem.getDocument("/project2").then(function(oDoc){
					return oMetadataHandlerService.updateAnnotationDocument(oDoc, sFileName, bGenerateInModelFolder, sContent, null).then(function(){
						return oDoc.getCurrentMetadata(true).then(function(aFolderMetadataContent){
							var oMetadataFile = _.find(aFolderMetadataContent, function(oMetadataElement) {
								return oMetadataElement.name === sFileName && !oMetadataElement.folder
									&& oMetadataElement.parentPath === "/project2";
							});
							assert.ok(oMetadataFile,"annotation file was created successfully under the root folder - project2");
						});
					});
				});
			});
		});

		it("Create Annotation under selected folder", function() {
			var oModel = {
				annotationsXML : {
					content : "annotation content",
					generateInModelFolder : true,
					filename : "bscbn_allocationtable_anno.anno",
					url : "/sap/bc/bsp/sap/bscbn_anf_lo/bscbn_allocationtable_anno.xml?with_otr_ref=X"
				}
			};

			var oProject = {
				"project3" : {
					"fpile1" : "a",
					".project.json" : JSON.stringify({
						"projectType" : []
					})
				}
			};

			var sFileName = oModel.annotationsXML.filename;
			var bGenerateInModelFolder = oModel.annotationsXML.generateInModelFolder;
			var sContent = oModel.annotationsXML.content;
			var sPath = "test";

			return oFakeFileDAO.setContent(oProject).then(function () {
				return oFilesystem.getDocument("/project3").then(function(oDoc){
					return oMetadataHandlerService.updateAnnotationDocument(oDoc, sFileName, bGenerateInModelFolder, sContent, sPath).then(function(){
						return oDoc.getCurrentMetadata(true).then(function(aFolderMetadataContent){
							var oMetadataFile = _.find(aFolderMetadataContent, function(oMetadataElement) {
								return oMetadataElement.name === sFileName && !oMetadataElement.folder
									&& oMetadataElement.parentPath === "/project3/test";
							});
							assert.ok(oMetadataFile,"annotation file was created successfully under the root folder - /project3/test");
						});
					});
				});
			});
		});



	});
});