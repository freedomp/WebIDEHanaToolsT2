define(['STF', 'sap/watt/lib/lodash/lodash'], function (STF, _) {
	"use strict";

	var suiteName = "UI5ProjectHandler_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {

		var oUI5ProjectHandler, oFakeFileDAO, oFileSystem;

		before(function () {
			return STF.startWebIde(suiteName).then(function() {
				oUI5ProjectHandler = getService('ui5projecthandler');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileSystem = getService('filesystem.documentProvider');
			}).then(createWorkspaceStructure);
		});

		var sComponentDirectsToManifestContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';

		var manifestContent = JSON.stringify({
				"_version": "1.1.0",
				"start_url": "start.html",
				"sap.app": {
					"_version": "1.1.0",
					"id": "sap.fiori.appName",
					"type": "application",
					"i18n": "i18n/i18n.properties",
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
								"annotations": ["equipmentanno" ,"koko"],
								"localUri": "model/metadata.xml"
							}
						},
						"ppm": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
							}
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
						},
						"koko": {
							"uri": "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							"type": "ODataAnnotation",
							"settings": {
								"localUri": "model/annotations.xml"
							}
						},
						"": {
							"uri": "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							"type": "OData",
							"settings": {
								"localUri": "model/annotations.xml"
							}
						},
						"equipment": {
							"uri": "/sap/opu/odata/sap/CB_EQUIPMENT_SRV",
							"type": "OData"
						}
					},
					"offline": true,
					"sourceTemplate": {
						"id": "sap.ui.ui5-template-plugin.1worklist",
						"version": "1.0.0"
					}
				},
				"sap.ui5": {
					"_version": "1.1.0",
					"resources":{
						"js": [
							{
								"uri": "component.js"
							}
						],
						"css": [
							{
								"uri": "component.css",
								"id": "componentcss"
							}
						]
					},
					"dependencies": {
						"minUI5Version": "1.30.0",
						"libs": {
							"sap.ui.core": {
								"minVersion": "1.30.0"
							},
							"sap.ui.commons": {
								"minVersion": "1.30.0"
							}
						},
						"components": {
							"sap.ui.app.other": {
								"minVersion": "1.1.0"
							}
						}
					},
					"models": {
						"i18n": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "i18n/i18n.properties"
						},
						"sfapi": {
							"dataSource": "sfapi",
							"settings": {
							}
						},
						"": {
							"dataSource": "ppm"
						}
					},
					"resourceRoots": {
						".myname": "./myname"
					},
					"rootView": "sap.ui.test.view.Main",
					"handleValidation": true,
					"config": {
					},
					"routing": {

					},
					"extends": {
						"component": "sap.fiori.otherApp",
						"minVersion": "0.8.15"
					},
					"contentDensities": {
						"compact": true,
						"cozy": false
					}
				}
			}
		);

		var sComponentWithoutDirectionContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                         }\
                                     });';

		var sConfigurationContent = 'jQuery.sap.declare("saaap.Configuration");\
            jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");\
            jQuery.sap.require("sap.ca.scfld.md.app.Application");\
            sap.ca.scfld.md.ConfigurationBase.extend("s.Configuration", {\
                oServiceParams: {\
                    serviceList: [\
                        {\
                            name: "RMTSAMPLEFLIGHT",\
                            serviceUrl: "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/",\
                            isDefault: true,\
                            mockedDataSource: jQuery.sap.getModulePath("s") + "/model/metadata.xml"\
                        }\
                    ]\
                },\
                getServiceParams: function () {\
                    return this.oServiceParams;\
                },\
                getAppConfig: function() {\
                    return this.oAppConfig;\
                },\
                getServiceList: function () {\
                    return this.oServiceParams.serviceList;\
                }\
            });';


		var sComponentWithExtensionPoints = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            customizing : {\
                                                "sap.ui.viewReplacements": {\
                                                    "hcm.approve.timesheet.Main": {\
                                                        "viewName": "hcm.approve.timesheet.HcpAppDescExtension.MainCustom",\
                                                                "type": "XML"\
                                                    }\
                                                },\
                                                "sap.ui.controllerExtensions": {\
                                                    "hcm.approve.timesheet.view.S2": {\
                                                        "controllerName": "hcm.approve.timesheet.HcpAppDescExtension.view.S2Custom"\
                                                    }\
                                                },\
                                                "sap.ui.viewExtensions": {\
                                                    "hcm.approve.timesheet.view.S3": {\
                                                        "extS3Header": {\
                                                            "className": "sap.ui.core.Fragment",\
                                                                    "fragmentName": "hcm.approve.timesheet.HcpAppDescExtension.view.S3_extS3HeaderCustom",\
                                                                    "type": "XML"\
                                                        }\
                                                    }\
                                                },\
                                                "sap.ui.viewModifications": {\
                                                    "hcm.approve.timesheet.view.S2": {\
                                                        "list": {\
                                                            "visible": false\
                                                        }\
                                                    }\
                                                }\
                                            }\
                                         }\
                                     });';

		var oAllExtensions = {
			"sap.ui.viewReplacements": {
				"hcm.approve.timesheet.Main": {
					"viewName": "hcm.approve.timesheet.HcpAppDescExtension.MainCustom",
					"type": "XML"
				}
			},
			"sap.ui.controllerExtensions": {
				"hcm.approve.timesheet.view.S2": {
					"controllerName": "hcm.approve.timesheet.HcpAppDescExtension.view.S2Custom"
				}
			},
			"sap.ui.viewExtensions": {
				"hcm.approve.timesheet.view.S3": {
					"extS3Header": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "hcm.approve.timesheet.HcpAppDescExtension.view.S3_extS3HeaderCustom",
						"type": "XML"
					}
				}
			},
			"sap.ui.viewModifications": {
				"hcm.approve.timesheet.view.S2": {
					"list": {
						"visible": false
					}
				}
			}
		};

		var createWorkspaceStructure = function() {
			return oFakeFileDAO.setContent({
				"proj2Manifest": {
					"src" : {
						"manifest.json" : manifestContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj3CompRootManifestSub": {
					"sub": {
						"manifest.json" : manifestContent,
						"Component.js" : sComponentDirectsToManifestContent
					},
					"Component.js" : sComponentWithoutDirectionContent
				},
				"extProject1Component" : {
					"src" : {
						"Component.js" : sComponentWithoutDirectionContent
					}
				},
				"proj9Configuration" : {
					"root" : {
						"Configuration.js" : sConfigurationContent,
						"Component.js" : sComponentWithoutDirectionContent
					}
				},
				"hybridExtProject" : {
					"src" : {
						"Component.js" : sComponentWithExtensionPoints
					},
					"hybrid" : {
						"sap-mobile-hybrid.js" : ''
					},
					"parentapp" : {
						"Configuration.js" : sConfigurationContent
					}
				}
			});
		};

		after(function () {
			return STF.shutdownWebIde(suiteName);
		});

		it("oDocument is null", function() {
			return oUI5ProjectHandler.getAttribute(null, "dataSources").then(function() {
			}).fail(function(oError) {
				assert.ok(oError, "Success getting error object");
				assert.equal(oError.message, "No project selected",
					"Got the right error message");
			});
		});


		it("isManifestProjectGuidelinesType - Manifest Project", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isManifestProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "Project isManifestProjectGuidelinesType");
				});
			});
		});

		it("isManifestProjectGuidelinesType - Component in root. Manifest in sub-component", function() {
			return oFileSystem.getDocument("/proj3CompRootManifestSub").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isManifestProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not from type isManifestProjectGuidelinesType");
				});
			});
		});

		it("isConfigProjectGuidelinesType - Manifest Project", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isConfigProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isScaffoldingConfigProjectGuidelinesType");
				});
			});
		});

		it("isComponentProjectGuidelinesType - Manifest Project", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isComponentProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isScaffoldingCompProjectGuidelinesType");
				});
			});
		});

		it("isManifestProjectGuidelinesType - Component Project", function() {
			return oFileSystem.getDocument("/extProject1Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isManifestProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isManifestProjectGuidelinesType");
				});
			});
		});

		it("isConfigProjectGuidelinesType - Component Project", function() {
			return oFileSystem.getDocument("/extProject1Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isConfigProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isScaffoldingConfigProjectGuidelinesType");
				});
			});
		});

		it("isComponentProjectGuidelinesType - Component Project", function() {
			return oFileSystem.getDocument("/extProject1Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isComponentProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "Project is isScaffoldingCompProjectGuidelinesType");
				});
			});
		});

		it("isManifestProjectGuidelinesType - Configuration Project", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isManifestProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isManifestProjectGuidelinesType");
				});
			});
		});

		it("isConfigProjectGuidelinesType - Configuration Project", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isConfigProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "Project is isScaffoldingConfigProjectGuidelinesType");
				});
			});
		});

		it("isComponentProjectGuidelinesType - Configuration Project", function() {
			return oFileSystem.getDocument("/proj9Configuration").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isComponentProjectGuidelinesType(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "Project is not isScaffoldingCompProjectGuidelinesType");
				});
			});
		});

		//########################### getAllExtensions tests ###########################

		it("getAllExtensions - hybrid extension", function() {
			return oFileSystem.getDocument("/hybridExtProject").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function(oExtensions) {
					assert.ok(_.isEqual(oAllExtensions, oExtensions), "found all extensions");
				});
			});
		});
	});
});

