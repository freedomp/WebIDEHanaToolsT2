define(['STF', 'sap/watt/lib/lodash/lodash',
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
	"sap/watt/lib/orion/ui/esprima/esprima",
	"sap/watt/lib/orion/ui/escodegen/escodegen.browser"], function (STF, _, mVisitor) {
	"use strict";

	var suiteName = "ComponentHandler_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {

		var oUI5ProjectHandler, oFakeFileDAO, oFileSystem, oBuildService;
		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName).then(function() {
				oUI5ProjectHandler = getService('ui5projecthandler');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileSystem = getService('filesystem.documentProvider');
				oBuildService = getService('builder');
			}).then(createWorkspaceStructure);
		});

		var sComponentJsContent = "sap.ui.define([\
			\"sap/ui/core/UIComponent\",\
			\"sap/ui/Device\",\
			\"sasasasa/model/models\",\
			\"sasasasa/controller/ListSelector\",\
			\"sasasasa/controller/ErrorHandler\"\
					], function(UIComponent, Device, models, ListSelector, ErrorHandler) {\
					\"use strict\";\
						return UIComponent.extend(\"sasasasa.Component\", {\
						metadata: {\
							manifest: \"json\"\
						},\
						/**\
						 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.\
						 * In this method, the FLP and device models are set and the router is initialized.\
						 * @public\
						 * @override\
						 */\
						init: function() {\
							this.oListSelector = new ListSelector();\
							this._oErrorHandler = new ErrorHandler(this);\
						\
							// set the device model\
							this.setModel(models.createDeviceModel(), \"device\");\
							// set the FLP model\
							this.setModel(models.createFLPModel(), \"FLP\");\
						\
							// call the base component's init function and create the App view\
							UIComponent.prototype.init.apply(this, arguments);\
						\
							// create the views based on the url/hash\
							this.getRouter().initialize();\
						},\
						\
						/**\
						 * The component is destroyed by UI5 automatically.\
						 * In this method, the ListSelector and ErrorHandler are destroyed.\
						 * @public\
						 * @override\
						 */\
						destroy: function() {\
							this.oListSelector.destroy();\
							this._oErrorHandler.destroy();\
							// call the base component's destroy function\
							UIComponent.prototype.destroy.apply(this, arguments);\
						},\
						\
						/**\
						 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy\
						 * design mode class should be set, which influences the size appearance of some controls.\
						 * @public\
						 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set\
						 */\
						getContentDensityClass: function() {\
							if (this._sContentDensityClass === undefined) {\
								// check whether FLP has already set the content density class; do nothing in this case\
								if (jQuery(document.body).hasClass(\"sapUiSizeCozy\") || jQuery(document.body).hasClass(\"sapUiSizeCompact\")) {\
								this._sContentDensityClass = \"\";\
							} else if (!Device.support.touch) { // apply \"compact\" mode if touch is not supported\
								this._sContentDensityClass = \"sapUiSizeCompact\";\
							} else {\
								// \"cozy\" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table\
								this._sContentDensityClass = \"sapUiSizeCozy\";\
							}\
						}\
						return this._sContentDensityClass;\
					}\
						\
				});\
						\
			});";

		var oManifestJsonContent = {
			"_version": "1.1.0",
			"sap.app": {
				"_version": "1.1.0",
				"id": "${project.artifactId}",
				"type": "application",
				"resources": "resources.json",
				"i18n": "i18n/i18n.properties",
				"title": "{{appTitle}}",
				"description": "{{appDescription}}",
				"applicationVersion": {
					"version": "${project.version}"
				},
				"ach": "",
				"dataSources": {
					"mainService": {
						"uri": "/here/goes/your/serviceurl/",
						"type": "OData",
						"settings": {
							"odataVersion": "2.0",
							"localUri": "localService/metadata.xml"
						}
					}
				},
				"sourceTemplate": {
					"id": "sap.ui.ui5-template-plugin.2masterdetail",
					"version": "1.32.1"
				}
			},
			"sap.fiori": {
				"_version": "1.1.0",
				"registrationIds": [],
				"archeType": "transactional"
			},
			"sap.ui": {
				"_version": "1.1.0",
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://detail-view",
					"favIcon": "",
					"phone": "",
					"phone@2": "",
					"tablet": "",
					"tablet@2": ""
				},
				"deviceTypes": {
					"desktop": true,
					"tablet": true,
					"phone": true
				},
				"supportedThemes": [
					"sap_hcb",
					"sap_bluecrystal"
				]
			},
			"sap.ui5": {
				"_version": "1.1.0",
				"rootView": "sasasasa.view.App",
				"dependencies": {
					"minUI5Version": "${sap.ui5.dist.version}",
					"libs": {
						"sap.ui.core": {},
						"sap.m": {},
						"sap.ui.layout": {}
					}
				},
				"contentDensities": {
					"compact": true,
					"cozy": true
				},
				"models": {
					"i18n": {
						"type": "sap.ui.model.resource.ResourceModel",
						"settings": {
							"bundleName": "sasasasa.i18n.i18n"
						}
					},
					"": {
						"dataSource": "mainService",
						"settings": {
							"metadataUrlParams": {
								"sap-documentation": "heading"
							}
						}
					}
				},
				"routing": {
					"config": {
						"routerClass": "sap.m.routing.Router",
						"viewType": "XML",
						"viewPath": "sasasasa.view",
						"controlId": "idAppControl",
						"controlAggregation": "detailPages",
						"bypassed": {
							"target": [
								"master",
								"notFound"
							]
						}
					},
					"routes": [
						{
							"pattern": "",
							"name": "master",
							"target": [
								"object",
								"master"
							]
						},
						{
							"pattern": "Countries/{objectId}",
							"name": "object",
							"target": [
								"master",
								"object"
							]
						}
					],
					"targets": {
						"master": {
							"viewName": "Master",
							"viewLevel": 1,
							"viewId": "master",
							"controlAggregation": "masterPages"
						},
						"object": {
							"viewName": "Detail",
							"viewId": "detail",
							"viewLevel": 2
						},
						"detailObjectNotFound": {
							"viewName": "DetailObjectNotFound",
							"viewId": "detailObjectNotFound"
						},
						"detailNoObjectsAvailable": {
							"viewName": "DetailNoObjectsAvailable",
							"viewId": "detailNoObjectsAvailable"
						},
						"notFound": {
							"viewName": "NotFound",
							"viewId": "notFound"
						}
					}
				}
			}
		};

		var sComponentDirectsToManifestContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';

		var sCorruptedComponent = 'jQuery.sap.הכדdeclare("a.Component");dfgvd\
                                     jQuery.sap.require("sap.ui.generic.ap\
                                     p.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         meta\
                                         data: {\
                                         }\
                                     });';

		var sCorruptedComponentKeys = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.ap\
                                     p.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                         version: "1.0",\
                                         config: {},\
                                         customizing: {\
											"sap.ui.viewReplacements": {\
												"ui.s2p.mm.purchorder.approve.view.S3": {\
													viewName: "ui.s2p.mm.purchorder.approve.MM_PO_APVExt.view.S3Custom",\
													type: "XML"\
												}\
											},\
											"sap.ui.controllerExtensions": {\
												"ui.s2p.mm.purchorder.approve.Main": {\
													controllerName: "ui.s2p.mm.purchorder.approve.MM_PO_APVExt.MainCustom"\
												}\
											}\
										}\
                                        }\
                                     });';

		var sOldFioriComponent = 'jQuery.sap.declare("a.b.c.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("abc.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';

		var sNewFioriComponent = 'jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("abc.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
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

		var sComponentWithComments = 'jQuery.sap.declare("myns.md4Extension1.Component");\n\
											// use the load function for getting the optimized preload file if present\n\
											sap.ui.component.load({\n\
												name: "myns",\n\
												// Use the below URL to run the extended application when SAP-delivered application located in a local cloud environment:\n\
												//url: jQuery.sap.getModulePath("myns.md4Extension1") + "/../../md4"\n\
												// Use the below url to run the extended application when SAP-delivered application located in a cloud environment:\n\
												url: jQuery.sap.getModulePath("myns.md4Extension1") + "/../orion/file/x2a4336b4$I060640-OrionContent/md4"\n\
												// we use a URL relative to our own component\n\
												// extension application is deployed with customer namespace\n\
											});\n\
											this.myns.Component.extend("myns.md4Extension1.Component", {\n\
												metadata: {\n\
													version: "1.0",\n\
													config: {},\n\
													customizing: {}\n\
												}\n\
											});';

		var sExtensionComponentWithInit = 'jQuery.sap.declare("myns.md4Extension1.Component");\n\
											// use the load function for getting the optimized preload file if present\n\
											sap.ui.component.load({\n\
												name: "myns",\n\
												// Use the below URL to run the extended application when SAP-delivered application located in a local cloud environment:\n\
												//url: jQuery.sap.getModulePath("myns.md4Extension1") + "/../../md4"\n\
												// Use the below url to run the extended application when SAP-delivered application located in a cloud environment:\n\
												url: jQuery.sap.getModulePath("myns.md4Extension1") + "/../orion/file/x2a4336b4$I060640-OrionContent/md4"\n\
												// we use a URL relative to our own component\n\
												// extension application is deployed with customer namespace\n\
											});\n\
											this.myns.Component.extend("myns.md4Extension1.Component", {\n\
												metadata: {\n\
													version: "1.0",\n\
													config: {},\n\
													customizing: {}\n\
												},\n\
												init: function() {}\n\
											});';

		var sUI5128Component = 'sap.ui.define([\
                        		"sap/ui/core/UIComponent"\
                        	], function(UIComponent) {\
                        	"use strict";\
                        	return UIComponent.extend("nw.epm.refapps.ext.po.apv.Component", {\
                        		metadata: {\
                        			name: "xtit.shellTitle",\
                        			version: "${project.version}",\
                        			dependencies: {\
                        				libs: ["sap.m", "sap.me", "sap.ushell"],\
                        				components: []\
                        			},\
                        			rootView: "nw.epm.refapps.ext.po.apv.view.App",\
                        			config: {\
                        				resourceBundle: "i18n/i18n.properties",\
                        				titleResource: "xtit.shellTitle",\
                        				icon: "sap-icon://Fiori7/F1373",\
                        				favIcon: "icon/F1373_Approve_Purchase_Orders.ico",\
                        				phone: "icon/launchicon/57_iPhone_Desktop_Launch.png",\
                        				"phone@2": "icon/launchicon/114_iPhone-Retina_Web_Clip.png",\
                        				tablet: "icon/launchicon/72_iPad_Desktop_Launch.png",\
                        				"tablet@2": "icon/launchicon/144_iPad_Retina_Web_Clip.png",\
                        				serviceConfig: {\
                        					name: "EPM_REF_APPS_PO_APV_SRV",\
                        					serviceUrl: "/sap/opu/odata/sap/EPM_REF_APPS_PO_APV_SRV/"\
                        				}\
                        			}\
                        		},\
                        		init: function() {\
                        		}\
                        	});\
                        });';

		var sUI5128NewI18nPropertyComponent = 'sap.ui.define([\
                        		"sap/ui/core/UIComponent"\
                        	], function(UIComponent) {\
                        	"use strict";\
                        	return UIComponent.extend("nw.epm.refapps.ext.po.apv.Component", {\
                        		metadata: {\
                        			name: "xtit.shellTitle",\
                        			version: "${project.version}",\
                        			dependencies: {\
                        				libs: ["sap.m", "sap.me", "sap.ushell"],\
                        				components: []\
                        			},\
                        			rootView: "nw.epm.refapps.ext.po.apv.view.App",\
                        			config: {\
                        				i18nBundle: "nw.epm.refapps.ext.po.apv.i18n.i18n",\
                        				titleResource: "xtit.shellTitle",\
                        				icon: "sap-icon://Fiori7/F1373",\
                        				favIcon: "icon/F1373_Approve_Purchase_Orders.ico",\
                        				phone: "icon/launchicon/57_iPhone_Desktop_Launch.png",\
                        				"phone@2": "icon/launchicon/114_iPhone-Retina_Web_Clip.png",\
                        				tablet: "icon/launchicon/72_iPad_Desktop_Launch.png",\
                        				"tablet@2": "icon/launchicon/144_iPad_Retina_Web_Clip.png",\
                        				serviceConfig: {\
                        					name: "EPM_REF_APPS_PO_APV_SRV",\
                        					serviceUrl: "/sap/opu/odata/sap/EPM_REF_APPS_PO_APV_SRV/"\
                        				}\
                        			}\
                        		},\
                        		init: function() {\
                        		}\
                        	});\
                        });';

		var sUI5128NewI18nPropertyComponent2 = 'sap.ui.define([\
                        		"sap/ui/core/UIComponent"\
                        	], function(UIComponent) {\
                        	"use strict";\
                        	return UIComponent.extend("nw.epm.refapps.ext.po.apv.Component", {\
                        		metadata: {\
                        			name: "xtit.shellTitle",\
                        			version: "${project.version}",\
                        			dependencies: {\
                        				libs: ["sap.m", "sap.me", "sap.ushell"],\
                        				components: []\
                        			},\
                        			rootView: "nw.epm.refapps.ext.po.apv.view.App",\
                        			config: {\
                        				i18nBundle: "nw.epm.refapps.ext.po.apv.i18n.i18n.properties",\
                        				titleResource: "xtit.shellTitle",\
                        				icon: "sap-icon://Fiori7/F1373",\
                        				favIcon: "icon/F1373_Approve_Purchase_Orders.ico",\
                        				phone: "icon/launchicon/57_iPhone_Desktop_Launch.png",\
                        				"phone@2": "icon/launchicon/114_iPhone-Retina_Web_Clip.png",\
                        				tablet: "icon/launchicon/72_iPad_Desktop_Launch.png",\
                        				"tablet@2": "icon/launchicon/144_iPad_Retina_Web_Clip.png",\
                        				serviceConfig: {\
                        					name: "EPM_REF_APPS_PO_APV_SRV",\
                        					serviceUrl: "/sap/opu/odata/sap/EPM_REF_APPS_PO_APV_SRV/"\
                        				}\
                        			}\
                        		},\
                        		init: function() {\
                        		}\
                        	});\
                        });';

		var sComponentWithLiteralConfig = 'sap.ui.define([\
                    		"sap/ui/core/UIComponent"\
                    	], function(UIComponent) {\
                    	"use strict";\
                    	return UIComponent.extend("nw.epm.refapps.ext.po.apv.Component", {\
                    		metadata: {\
                    			name: "xtit.shellTitle",\
                    			version: "${project.version}",\
                    			dependencies: {\
                    				libs: ["sap.m", "sap.me", "sap.ushell"],\
                    				components: []\
                    			},\
                    			rootView: "nw.epm.refapps.ext.po.apv.view.App",\
                    			config: {\
                    				"serviceConfig": {\
                    					name: "EPM_REF_APPS_PO_APV_SRV",\
                    					serviceUrl: "/sap/opu/odata/sap/EPM_REF_APPS_PO_APV_SRV/"\
                    				}\
                    			}\
                    		},\
                    		init: function() {\
                    		}\
                    	});\
                    });';

		var sComponentWithoutDirectionContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                         }\
                                     });';

		var sComponentWithScaffolding = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     jQuery.sap.require("sap.ca.scfld.md.ComponentBase");\
                                     sap.ca.scfld.md.ComponentBase.extend("a.Component", {\
                                         metadata: {\
                                         }\
                                     });';


		var sComponentWithConfigs = 'jQuery.sap.declare("ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.Component");\n\
										// use the load function for getting the optimized preload file if present\n\
										sap.ui.component.load({\n\
										name: "ui.s2p.mm.purchorder.approve",\n\
										// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository\n\
										url: "/sap/bc/ui5_ui5/sap/MM_PO_APV" // we use a URL relative to our own component\n\
										// extension application is deployed with customer namespace\n\
										});\n\
										this.ui.s2p.mm.purchorder.approve.Component.extend("ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.Component", {\n\
										metadata: {\n\
											version: "1.0",\n\
											config: {\n\
    											"sap.ca.i18Nconfigs": {\n\
    											"bundleName": "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.i18n.i18n"\n\
												},\n\
												"titleResource": "app.Identity"\n\
											},\n\
											customizing: {}\n\
											}\n\
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

		var oNewDataSource = {
			"uri" : "/sap/opu/odata/snce/PO_S_SRV;v=2/",
			"type" : "OData",
			"settings" : {
				"odataVersion" : "2.0",
				"localUri" : "model/metadata.xml"
			}
		};

		var oNewViewExtension = {
			"sExtensionType" : "sap.ui.viewReplacements",
			"oContent" : {
				"viewName": "hcm.approve.timesheet.HcpAppDescExtension.S2Custom",
				"type": "XML"
			},
			"sViewName" : "S2"
		};

		var oExistingViewExtension = {
			"sExtensionType" : "sap.ui.viewReplacements",
			"oContent" : {
				"viewName": "hcm.approve.timesheet.HcpAppDescExtension.MainCustom1",
				"type": "XML"
			},
			"sViewName" : "hcm.approve.timesheet.Main"
		};

		var oExistingElementExtension = {
			"sExtensionType" : "sap.ui.viewModifications",
			"oContent" : {
				"list": {
					"visible": false
				}
			},
			"sViewName" : "hcm.approve.timesheet.view.S2"
		};

		var oNewElementExtension = {
			"sExtensionType" : "sap.ui.viewModifications",
			"oContent" : {
				"header": {
					"visible": false
				}
			},
			"sViewName" : "Main"
		};

		var oProjectJSONContent = JSON.stringify({
			"build": {
				"sourceFolder": "webapp",
				"targetFolder": "dist222",
				"buildRequired": true,
				"lastBuildDateTime": "Thu, 08 Oct 2015 06:11:36 GMT"
			},
			"projectType": [
				"com.watt.common.builder.sapui5clientbuild"
			]
		});

		var oProjectJSONContent2 = JSON.stringify({
			"build": {
				"sourceFolder": "webapp",
				"targetFolder": "dist222",
				"buildRequired": true,
				"lastBuildDateTime": "Thu, 08 Oct 2015 06:11:36 GMT"
			},
			"projectType": [
				"com.watt.common.builder.sapui5clientbuild"
			]
		});

		var createWorkspaceStructure = function() {
			return oFakeFileDAO.setContent({
				"projectWithManifestUnderSrc": {
					"src" : {
						"manifest.json" : JSON.stringify(oManifestJsonContent),
						"Component.js" : sComponentJsContent
					}
				},
				"proj7Component" : {
					"root" : {
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj8Component" : {
					"root" : {
						"Component.js" : ""
					}
				},
				"proj10Component" : {
					"root" : {
						"Component.js" : sCorruptedComponent
					}
				},
				"proj11Component" : {
					"root" : {
						"Component.js" : sCorruptedComponentKeys
					}
				},
				"projOldFiori" : {
					"root" : {
						"Component.js" : sOldFioriComponent
					}
				},
				"projOldFiori1Quote" : {
				},
				"projNewFiori" : {
					"root" : {
						"Component.js" : sNewFioriComponent
					}
				},
				"projUI5128Fiori" : {
					"root" : {
						"Component.js" : sUI5128Component
					}
				},
				"projUI5128FioriNewI18nProperty" : {
					"root" : {
						"Component.js" : sUI5128NewI18nPropertyComponent
					}
				},
				"projUI5128FioriNewI18nProperty2" : {
					"root" : {
						"Component.js" : sUI5128NewI18nPropertyComponent2
					}
				},
                "projLiteralConfigFiori" : {
                    "root" : {
                      "Component.js" : sComponentWithLiteralConfig 
                    }
                },
				"proj12ScaffoldingComponent" : {
					"root" : {
						"Component.js" : sComponentWithScaffolding
					}
				},
				"proj13ComponentAlsoInDist" : {
					"dist222" : {
						"Component.js": sComponentDirectsToManifestContent
					},
					"webapp" : {
						"Component.js" : sComponentDirectsToManifestContent
					},
					".project.json" : oProjectJSONContent
				},
				"proj13ComponentAlsoInDist2" : {
					"dist222" : {
						"subFolder" : {
							"Component.js": sComponentDirectsToManifestContent
						},
						"Component.js": sComponentDirectsToManifestContent
					},
					"webapp" : {
						"Component.js" : sComponentDirectsToManifestContent
					},
					".project.json" : oProjectJSONContent2
				},
				"extProject1Component" : {
					"src" : {
						"Component.js" : sComponentWithoutDirectionContent
					}
				},
				"extProject2Component" : {
					"src" : {
						"Component.js" : sComponentWithExtensionPoints
					}
				},
				"extProject3Component" : {
					"src" : {
						"Component.js" : sComponentWithExtensionPoints
					}
				},
				"extProject4Component" : {
					"src" : {
						"Component.js" : sComponentWithoutDirectionContent
					}
				},
				"extProject5Component" : {
					"src" : {
						"Component.js" : sComponentWithComments
					}
				},
				"extProject6Component" : {
					"src" : {
						"Component.js" : sComponentWithConfigs
					}
				},
				"extProject7Component" : {
					"src" : {
						"Component.js" : sComponentWithComments
					}
				},
				"extProject8Component" : {
					"src" : {
						"Component.js" : sExtensionComponentWithInit
					}
				},
				"emptyProject0": {
				},
				"emptyProject1": {
				},
				"emptyProject2": {
				},
				"emptyProject3": {
				},
				"emptyProject7": {
				},
				"emptyProject8": {
				},
				"projectWithComponentOnlyUnderSrc": {
					"src" : {
						"Component.js" : sComponentJsContent
					}
				}

			});
		};

		afterEach(function () {
			aStubs.forEach(function(stub){
				stub.restore();
			});
			aStubs = [];

		});

		after(function () {
			return STF.shutdownWebIde(suiteName);
		});

		//########################### getAttribute test #####################################
		it("getAttribute", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, null).fail(function(oError){
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDataSourcesByName test #####################################
		it("getDataSourcesByName", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDataSourceAnnotationsByName test #####################################
		it("getDataSourceAnnotationsByName", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getSourceTemplate test #####################################
		it("getSourceTemplate", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getSourceTemplate(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getDependencies test #####################################
		it("getDependencies", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDependencies(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addDataSourceAnnotation test #####################################
		it("addDataSourceAnnotation", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(oTargetDocument, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addDependencies test #####################################
		it("addDependencies", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### removeDataSource test #####################################
		it("removeDataSource", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(oTargetDocument, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### removeDataSourceAnnotation test #####################################
		it("removeDataSourceAnnotation", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addModel test #####################################
		it("addModel", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addModel(oTargetDocument, null, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getModels test #####################################
		it("getModels", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getModels(oTargetDocument).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### addI18nPath test #####################################
		it("addI18nPath", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addI18nPath(oTargetDocument, null, null).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getHandlerFilePath tests #####################################
		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/proj7Component/root", "Got right handler file path");
				});
			});
		});

		it("getHandlerFilePath - after build process (ignore target folder)", function() {
			return oFileSystem.getDocument("/proj13ComponentAlsoInDist").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oBuildService, "getTargetFolder").returns(oFileSystem.getDocument("/proj13ComponentAlsoInDist/dist222")));
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/proj13ComponentAlsoInDist/webapp", "Got right handler file path");
				});
			});
		});

		it("getHandlerFilePath - after build process (ignore target folder also sub folders) ", function() {
			return oFileSystem.getDocument("/proj13ComponentAlsoInDist2").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oBuildService, "getTargetFolder").returns(oFileSystem.getDocument("/proj13ComponentAlsoInDist2/dist222")));
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/proj13ComponentAlsoInDist2/webapp", "Got right handler file path");
				});
			});
		});

		//########################### getHandlerDocument tests #####################################
		it("getHandlerDocument", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
					assert.equal(oHandlerDoc.getEntity().getFullPath(), "/proj7Component/root/Component.js", "Got right handler doc");
				});
			});
		});

		//########################### getAppNamespace tests #####################################
		it("getAppNamespace - old Fiori", function() {
			return oFileSystem.getDocument("/projOldFiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sNamespace) {
					assert.equal(sNamespace, "a.b.c", "Got right app namespace");
				});
			});

		});

		it("getAppNamespace - old Fiori declare with 1 Quote", function() {
			return oFileSystem.getDocument("/projOldFiori1Quote").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/ComponentWith1Quote.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sNamespace) {
									assert.equal(sNamespace, "com.varian", "Got right app namespace");
								});
							});
						});
					});
				});
			});

		});

		it("getAppNamespace - new Fiori", function() {
			return oFileSystem.getDocument("/projNewFiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sNamespace) {
					assert.equal(sNamespace, "abc", "Got right app namespace");
				});
			});

		});

		it("getAppNamespace - empty Component.js" , function() {
			return oFileSystem.getDocument("/proj8Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sNamespace) {
					assert.equal(sNamespace, "", "Got right app namespace");
				});
			});
		});

		it("getAppNamespace - corrupted Component.js" , function() {
			return oFileSystem.getDocument("/proj10Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sNamespace) {
					assert.equal(sNamespace, "a", "Got right app namespace");
				});
			});
		});

		//########################### getDataSources tests #####################################
		it("getDataSources", function() {
			return oFileSystem.getDocument("/emptyProject1").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Component.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function (oDataSources) {
									assert.equal(_.keys(oDataSources)[0], "RMTSAMPLEFLIGHT1", "Got right service name");
									assert.equal(_.values(oDataSources)[0].uri, "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT1/", "Got right service URL");
									assert.equal(_.values(oDataSources)[0].type, "OData", "Got right data source type");
								});
							});
						});
					});
				});
			});
		});

		it("getDataSources - with UI5 1.28 Component", function() {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function (oDataSources) {
					assert.equal(_.keys(oDataSources)[0], "EPM_REF_APPS_PO_APV_SRV", "Got right service name");
					assert.equal(_.values(oDataSources)[0].uri, "/sap/opu/odata/sap/EPM_REF_APPS_PO_APV_SRV/", "Got right service URL");
					assert.equal(_.values(oDataSources)[0].type, "OData", "Got right data source type");
				});
			});
		});

		it("getDataSources - empty Component.js" , function() {
			return oFileSystem.getDocument("/proj8Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
					assert.equal(oDataSources, null, "Got right data source");
				});
			});
		});

		it("getDataSources - corrupted Component.js" , function() {
			return oFileSystem.getDocument("/proj10Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
					assert.equal(oDataSources, null, "Got right data source");
				});
			});
		});

		//########################### getDataSources tests #####################################
		it("getDataSourcesByType", function() {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "OData").then(function(aDataSources) {
					assert.equal(Object.keys(aDataSources).length, 1, "Found 1 keys in result");
					assert.ok(_.has(aDataSources, "EPM_REF_APPS_PO_APV_SRV"), "Found 1 dataSource");
				});
			});
		});


		it("getDataSourcesByType - non OData Type", function() {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "blabla").then(function() {
					assert.ok(false, "Only OData data sources can be parsed from Component.js");
				}).fail(function(oError){
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "UnimplementedMethod", "Got the right error message");
				});
			});
		});

		//########################### getAllDataSourceNames tests ###########################
		it("getAllDataSourceNames", function() {
			return oFileSystem.getDocument("/emptyProject7").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Component.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getAllDataSourceNames(oTargetDocument).then(function (oDataSourceNames) {
									assert.equal(oDataSourceNames[0], "RMTSAMPLEFLIGHT1", "Got right service name");
									assert.equal(oDataSourceNames.length, 1, "Got right number of services");
								});
							});
						});
					});
				});
			});

		});

		it("getAllDataSourceNames - empty Component.js", function() {
			return oFileSystem.getDocument("/proj8Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllDataSourceNames(oTargetDocument).then(function(aNames) {
					assert.equal(aNames.length, 0, "No manifest exists - got empty array");
				});
			});
		});


		//########################### getAllExtensions tests ###########################
		it("getAllExtensions - Component.js exists", function() {
			return oFileSystem.getDocument("/extProject2Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function(oExtensions) {
					assert.ok(_.isEqual(oAllExtensions, oExtensions), "found all extensions");
				});
			});

		});

		it("getAllExtensions - empty Component.js", function() {
			return oFileSystem.getDocument("/proj8Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function(oExtensions) {
					assert.equal(Object.keys(oExtensions).length, 0, "Given entry not found in Component.js");
				});
			});

		});

		//########################### isScaffoldingBased tests ###########################
		it("isScaffoldingBased - with scaffolding", function() {
			return oFileSystem.getDocument("/proj12ScaffoldingComponent").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "scaffolding found");
				});
			});
		});

		it("isScaffoldingBased - without scaffolding", function() {
			return oFileSystem.getDocument("/projOldFiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "scaffolding found");
				});
			});
		});

		//########################### addDataSource tests #####################################
		it("addDataSource - adding new service", function() {
			return oFileSystem.getDocument("/emptyProject0").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/ComponentWithoutService.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.addDataSource(
									oTargetDocument, //oDocument
									"k2",//sDataSourceName
									oNewDataSource,//oContent
									false //bOverWrite
								).then(function (bSuccess) {
										assert.ok(bSuccess, "Success adding new service");
										return oFileSystem.getDocument("/emptyProject0").then(function(oTargetDocument) {
											return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
												assert.equal(oDataSources["k2"].uri, oNewDataSource.uri, "Found correct data sources");
											});
										});
									});
							});
						});
					});
				});
			});
		});

		it("addDataSource - data source already exist - bOverWrite is true", function() {
			return oFileSystem.getDocument("/emptyProject2").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Component.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.addDataSource(
									oTargetDocument, //oDocument
									"k2",//sDataSourceName
									oNewDataSource,//oContent
									true //bOverWrite
								).then(function (bSuccess) {
										assert.ok(bSuccess, "Success adding new service");
										return oFileSystem.getDocument("/emptyProject2").then(function(oTargetDocument) {
											return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
												assert.equal(oDataSources["k2"].uri, oNewDataSource.uri, "Found correct data sources");
											});
										});
									});
							});
						});
					});
				});
			});
		});

        it("addDataSource - data source already exist as literal - bOverWrite is true", function() {
            return oFileSystem.getDocument("/projLiteralConfigFiori").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(oTargetDocument, "EPM_REF_APPS_PO_APV_SRV", oNewDataSource, true).then(function () {
					return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
						return oHandlerDoc.getContent().then(function(sContent) {
							var aParts = sContent.split("serviceConfig");
							assert.equal(aParts.length, 2, "Found a single serviceConfig block");
						});
					});
                });
            });
        });


		it("addDataSource - data source already exist - bOverWrite is false", function() {
			return oFileSystem.getDocument("/emptyProject3").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Component.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.addDataSource(
									oTargetDocument, //oDocument
									"k2",//sDataSourceName
									oNewDataSource,//oContent
									false //bOverWrite
								).then(function () {
									}).fail(function(oError) {
										assert.ok(oError, "Success getting error object");
										assert.equal(oError.name, "ServiceExist");
									});
							});
						});
					});
				});
			});
		});


		it("addDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oNewDataSource,//oContent
					true //bOverWrite
				).then(function () {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "DataSourceNameNotDefined");
					});
			});
		});

		it("addDataSource - oContent is null", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"k2",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function () {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "ContentNotDefined");
					});
			});
		});

		//########################### addExtension tests ###########################
		it("addExtension - No customizing block in Component.js", function () {
			return oFileSystem.getDocument("/extProject1Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oNewElementExtension.sExtensionType, oNewElementExtension.sViewName, oNewElementExtension.oContent, true).then(function (bResult) {
					assert.ok(bResult,"Extension Added");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(!_.isEmpty(oExtensions), "An extension was created");
						assert.ok(oExtensions && oExtensions[oNewElementExtension.sExtensionType], "Correct extension type");
						var oExtensionType = oExtensions[oNewElementExtension.sExtensionType];
						assert.ok(oExtensionType[oNewElementExtension.sViewName], "Correct View extended");
						assert.ok(_.isEqual(oExtensionType[oNewElementExtension.sViewName], oNewElementExtension.oContent), "Correct extension added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js : " + oError);
				});
			});
		});

		it("addExtension - Existing customizing block in Component.js", function () {
			return oFileSystem.getDocument("/extProject2Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oNewElementExtension.sExtensionType, oNewElementExtension.sViewName, oNewElementExtension.oContent, true).then(function (bResult) {
					assert.ok(bResult,"Extension added");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(!_.isEmpty(oExtensions), "An extension was created");
						assert.ok(oExtensions && oExtensions[oNewElementExtension.sExtensionType], "Correct extension type");
						var oExtensionType = oExtensions[oNewElementExtension.sExtensionType];
						assert.ok(oExtensionType[oNewElementExtension.sViewName], "Correct View extended");
						assert.ok(_.isEqual(oExtensionType[oNewElementExtension.sViewName], oNewElementExtension.oContent), "Correct extension added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js" + oError);
				});
			});
		});

		it("addExtension - Existing Extension in customizing block, bOverWrite is true", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, true).then(function (bResult) {
					assert.ok(bResult,"Extension added");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(!_.isEmpty(oExtensions), "An extension was created");
						assert.ok(oExtensions && oExtensions[oExistingViewExtension.sExtensionType], "Correct extension type");
						var oExtensionType = oExtensions[oExistingViewExtension.sExtensionType];
						assert.ok(oExtensionType[oExistingViewExtension.sViewName], "Correct View extended");
						assert.ok(_.isEqual(oExtensionType[oExistingViewExtension.sViewName], oExistingViewExtension.oContent), "Correct extension added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js: " + oError);
				});
			});
		});

		it("addExtension - Existing Extension in customizing block, bOverWrite is false", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, false).then(function () {
					assert.ok(false,"Should not be able to add overwrite extension when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error when overwriting extension");
					assert.equal(oError.name, "ExtensionExistInHandler", "Got right type of error");
				});
			});
		});

		it("addExtension - sExtensionType is null", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, null, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, false).then(function () {
					assert.ok(false,"Should not be able to add overwrite extension when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error");
					assert.equal(oError.name, "ExtensionNotDefined", "Got right type of error");
				});
			});
		});

		it("addExtension - sViewName is null", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, null,
					oExistingViewExtension.oContent, false).then(function () {
					assert.ok(false,"Should not be able to add overwrite extension when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error ");
					assert.equal(oError.name, "ViewNotDefined", "Got right type of error");
				});
			});
		});

		it("addExtension - oContent is null", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType,
					oExistingViewExtension.sViewName, null, false).then(function () {
					assert.ok(false,"Should not be able to add overwrite extension when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error");
					assert.equal(oError.name, "ContentNotDefined", "Got right type of error");
				});
			});
		});

		it("addExtension - handle illegal component.js", function () {
			return oFileSystem.getDocument("/proj11Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, true).then(function (bResult) {
					assert.ok(bResult,"Extension added");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(!_.isEmpty(oExtensions), "An extension was created");
						assert.ok(oExtensions && oExtensions[oExistingViewExtension.sExtensionType], "Correct extension type");
						var oExtensionType = oExtensions[oExistingViewExtension.sExtensionType];
						assert.ok(oExtensionType[oExistingViewExtension.sViewName], "Correct View extended");
						assert.ok(_.isEqual(oExtensionType[oExistingViewExtension.sViewName], oExistingViewExtension.oContent), "Correct extension added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js: " + oError);
				});
			});
		});

		// Generation of component.js must use double quotes for string and not single quotes
		it("addExtension - Making sure generated file doesn't contain single quote", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, true).then(function () {
					// getAppNamespace for example expects double quotes in it's implementation - so we use it to validate
					// If single quote is used, an empty namespace is returned
					return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function (sAppNamespace) {
						assert.equal(sAppNamespace, "a", "Got the right namesapce");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js: " + oError);
				});
			});
		});

		// Generation of component.js must not remove the original comments
		it("addExtension - Making sure generated file contains the original comments", function () {
			return oFileSystem.getDocument("/extProject5Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, true).then(function () {
					return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
						return oHandlerDoc.getContent().then(function(sContent) {
							// Validate by checking that the following comment exist: "// extension application is deployed with customer namespace"
							var indexOfComment = sContent.indexOf("// extension application is deployed with customer namespace");
							assert.notEqual(indexOfComment, -1, "Got the right comment");
						});
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding extension to Component.js: " + oError);
				});
			});
		});

		//########################### removeExtension tests ###########################
		it("removeExtension - No customizing block in Component.js", function () {
			return oFileSystem.getDocument("/extProject4Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingElementExtension.sExtensionType, oExistingElementExtension.sViewName).then(function () {
					assert.ok(false,"Should not be able to remove extension from Component.js");
				}).fail(function (oError) {
					assert.ok(oError, "Error removing extension from Component.js");
					assert.equal(oError.name, "ExtensionNotFound", "Got correct error message");
				});
			});
		});

		it("removeExtension - Existing View Extension in customizing block", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName).then(function (bResult) {
					assert.ok(bResult,"Extension removed");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions && !_.isEmpty(oExtensions), "Got extensions object");
						assert.ok(!oExtensions[oExistingViewExtension.sExtensionType], "Empty Extension Block removed");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error removing extension from Component.js: " + oError);
				});
			});
		});

		it("removeExtension - Existing Control Extension in customizing block", function () {
			return oFileSystem.getDocument("/extProject3Component").then(function (oTargetDocument) {
				var sExtendedElement = Object.keys(oExistingElementExtension.oContent)[0];
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingElementExtension.sExtensionType, oExistingElementExtension.sViewName, sExtendedElement).then(function (bResult) {
					assert.ok(bResult,"Extension removed");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions && !_.isEmpty(oExtensions), "Got extensions object");
						assert.ok(!oExtensions[oExistingViewExtension.sExtensionType], "Empty Extension Block removed");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error removing extension from Component.js: " + oError);
				});
			});
		});

		it("removeExtension - Non Existing Extension in customizing block", function () {
			return oFileSystem.getDocument("/extProject2Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oNewViewExtension.sExtensionType, oNewViewExtension.sViewName).then(function () {
					assert.ok(false,"Should not be able to remove extension from Component.js");
				}).fail(function (oError) {
					assert.ok(oError, "Error removing extension from Component.js");
					assert.equal(oError.name, "ExtensionNotFound", "Got correct error message");
				});
			});
		});

		it("removeExtension - sExtensionType is null", function () {
			return oFileSystem.getDocument("/extProject2Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, null, oNewViewExtension.sViewName).then(function () {
					assert.ok(false,"Should not be able to remove extension from Component.js");
				}).fail(function (oError) {
					assert.ok(oError, "Error");
					assert.equal(oError.name, "ExtensionNotDefined", "Got correct error message");
				});
			});
		});

		it("removeExtension - sViewName is null", function () {
			return oFileSystem.getDocument("/extProject2Component").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oNewViewExtension.sExtensionType, null).then(function () {
					assert.ok(false,"Should not be able to remove extension from Component.js");
				}).fail(function (oError) {
					assert.ok(oError, "Error");
					assert.equal(oError.name, "ViewNotDefined", "Got correct error message");
				});
			});
		});



		//########################### getHandlerFileName tests #####################################
		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj7Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFileName(oTargetDocument).then(function(sName) {
					assert.equal(sName, "Component.js");
				});
			});
		});

		//########################### addExtensionForScaffoldingDataSource tests ###########################
		it("addExtensionForScaffoldingDataSource - with component.js", function () {
			return oFileSystem.getDocument("/extProject5Component").then(function (oTargetDocument) {
				var sDataSourceName = "ppm";
				var sUri = "/my/uri/";
				var sLocalUri = "./local/metadata.xml";
				var bIsDefault = false;
				return oUI5ProjectHandler.addExtensionForScaffoldingDataSource(oTargetDocument, sDataSourceName, sUri, sLocalUri, bIsDefault, true).then(function (bResult) {
					assert.ok(bResult,"Scaffolding data source added");
					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						var oConfigContent = oConfigs["sap.ca.serviceConfigs"];
						assert.ok(_.isEqual(oConfigContent, [{serviceUrl: sUri, isDefault: false, name: sDataSourceName, mockedDataSource: sLocalUri}]), "Correct content added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding a scaffolding data source to component.js: " + oError);
				});
			});
		});


		//########################### getConfigs tests ###########################
		it("getConfigs - with config", function() {
			return oFileSystem.getDocument("/extProject6Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
					assert.ok(oConfigs["sap.ca.i18Nconfigs"], "Got right configs property");
					assert.equal(oConfigs["sap.ca.i18Nconfigs"].bundleName, "ui.s2p.mm.purchorder.approve.MM_PO_APVExtension.i18n.i18n", "Got right configs property value");
					assert.ok(oConfigs["titleResource"], "Got right configs property");
					assert.equal(oConfigs["titleResource"], "app.Identity", "Got right configs property value");
				});
			});
		});

		it("getConfigs - empty Component.js" , function() {
			return oFileSystem.getDocument("/proj8Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function(oConfigs) {
					assert.ok(_.isEqual(oConfigs, {}), "Got right configs");
				});
			});
		});

		it("getConfigs - corrupted Component.js" , function() {
			return oFileSystem.getDocument("/proj10Component").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function(oConfigs) {
					assert.ok(_.isEqual(oConfigs, {}), "Got right configs");
				});
			});
		});

		//########################### addConfig tests ###########################
		it("addConfig - No config block in Component.js", function () {
			return oFileSystem.getDocument("/extProject2Component").then(function (oTargetDocument) {
				var oPropContent = {
					x : "hi",
					"blabla" : true
				};
				return oUI5ProjectHandler.addConfig(oTargetDocument, "abcName", oPropContent, true).then(function (bResult) {
					assert.ok(bResult,"Config Added");
					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got an object");
						assert.ok(!_.isEmpty(oConfigs), "A config block was created");
						assert.ok(oConfigs && oConfigs.abcName, "Correct config name was added");
						assert.ok(_.isEqual(oConfigs.abcName, oPropContent), "Correct config value was added");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding config to Component.js : " + oError);
				});
			});
		});

		it("addConfig - Existing config block in Component.js", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				var oPropContent = {
					x : "hi",
					"blabla" : true
				};
				return oUI5ProjectHandler.addConfig(oTargetDocument, "abcName", oPropContent, true).then(function (bResult) {
					assert.ok(bResult,"Config Added");
					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got an object");
						assert.ok(!_.isEmpty(oConfigs), "A config block was created");
						assert.ok(oConfigs && oConfigs.abcName, "Correct config name was added");
						assert.ok(_.isEqual(oConfigs.abcName, oPropContent), "Correct config value was added");
						assert.equal(oConfigs.resourceBundle, "i18n/i18n.properties", "Existing config was not replaced or deleted");
						assert.ok(oConfigs.serviceConfig, "Existing config was not deleted");
						assert.equal(oConfigs.serviceConfig.name, "EPM_REF_APPS_PO_APV_SRV", "Existing config was not replaced or deleted");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding config to Component.js : " + oError);
				});
			});
		});

		it("addConfig - Existing property in config block, bOverWrite is true - simple value", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addConfig(oTargetDocument, "titleResource", "blabla", true).then(function (bResult) {
					assert.ok(bResult,"Config Added");
					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got an object");
						assert.ok(!_.isEmpty(oConfigs), "A config block was created");
						assert.ok(oConfigs && oConfigs.titleResource, "Correct config name was added");
						assert.equal(oConfigs.titleResource, "blabla", "Correct config value was added"); //previous value: "xtit.shellTitle"
						assert.equal(oConfigs.resourceBundle, "i18n/i18n.properties", "Existing config was not replaced or deleted");
						assert.ok(oConfigs.serviceConfig, "Existing config was not deleted");
						assert.equal(oConfigs.serviceConfig.name, "EPM_REF_APPS_PO_APV_SRV", "Existing config was not replaced or deleted");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding config to Component.js : " + oError);
				});
			});
		});

		it("addConfig - Existing property in config block, bOverWrite is true - object value", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				var oPropNewContent = {
					x : "blablabla",
					"blabla" : false
				};
				return oUI5ProjectHandler.addConfig(oTargetDocument, "abcName", oPropNewContent, true).then(function (bResult) {
					assert.ok(bResult,"Config Added");
					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got an object");
						assert.ok(!_.isEmpty(oConfigs), "A config block was created");
						assert.ok(oConfigs && oConfigs.abcName, "Correct config name was added");
						assert.ok(_.isEqual(oConfigs.abcName, oPropNewContent), "Correct config value was added");
						assert.equal(oConfigs.resourceBundle, "i18n/i18n.properties", "Existing config was not replaced or deleted");
						assert.ok(oConfigs.serviceConfig, "Existing config was not deleted");
						assert.equal(oConfigs.serviceConfig.name, "EPM_REF_APPS_PO_APV_SRV", "Existing config was not replaced or deleted");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding config to Component.js : " + oError);
				});
			});
		});

		it("addConfig - Existing property in config block, bOverWrite is false", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addConfig(oTargetDocument, "abcName", "blablablabla", false).then(function (bResult) {
					assert.ok(false,"Should not be able to add overwrite config when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error when overwriting config");
					assert.equal(oError.name, "ConfigNameExist", "Got right type of error");
				});
			});
		});

		it("addConfig - sConfigName in null", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addConfig(oTargetDocument, null, "blablablabla", false).then(function (bResult) {
					assert.ok(false,"Should not be able to add overwrite config when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error");
					assert.equal(oError.name, "ConfigNotDefined", "Got right type of error");
				});
			});
		});

		it("addConfig - oContent is null", function () {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addConfig(oTargetDocument, "abcName", null, false).then(function (bResult) {
					assert.ok(false,"Should not be able to add overwrite config when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error");
					assert.equal(oError.name, "ContentNotDefined", "Got right type of error");
				});
			});
		});

		//########################### setHCPPlatformBlock / setABAPPlatformBlock tests ###########################
		it("setHCPPlatformBlock - doesn't do anything if this in a Component.js project", function () {
			return assert.isRejected(oFileSystem.getDocument("/projectWithComponentOnlyUnderSrc").then(function (oManifestProject) {
				return oUI5ProjectHandler.setHCPPlatformBlock(oManifestProject, {uri:"batata"});
			}), "setHCPPlatformBlock should throw an error in a Component.js project");
		});

		it("setABAPPlatformBlock - doesn't do anything if this in a Component.js project", function () {
			return assert.isRejected(oFileSystem.getDocument("/projectWithComponentOnlyUnderSrc").then(function (oManifestProject) {
				return oUI5ProjectHandler.setABAPPlatformBlock(oManifestProject, {uri:"batata"});
			}), "setABAPPlatformBlock should throw an error in a Component.js project");
		});

		//########################### getI18nPath tests #####################################
		it("getI18nPath - old ui5 Component.js ('resourceBundle' property)", function() {
			return oFileSystem.getDocument("/emptyProject8").then(function(oTargetDocument) {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5ProjectHandler/resources/Component.js"))).then(function (oFile) {
					return oTargetDocument.createFile("Component.js").then(function(oNewFile){
						return oNewFile.setContent(oFile).then(function(){
							return oNewFile.save().then(function(){
								return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
									assert.equal(sI18nPath, "i18n/messageBundle.properties", "Got right i18n path");
								});
							});
						});
					});
				});
			});
		});

		it("getI18nPath - ui5 1.28 new Component.js - old property name ('resourceBundle' property)", function() {
			return oFileSystem.getDocument("/projUI5128Fiori").then(function (oTargetDocument) {
				return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
					assert.equal(sI18nPath, "i18n/i18n.properties", "Got right i18n path");
				});
			});
		});

		it("getI18nPath - ui5 1.28 new Component.js - new property name ('i18nBundle' property) - without '.properties' extension", function() {
			return oFileSystem.getDocument("/projUI5128FioriNewI18nProperty").then(function (oTargetDocument) {
				return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
					assert.equal(sI18nPath, "i18n/i18n.properties", "Got right i18n path");
				});
			});
		});

		it("getI18nPath - ui5 1.28 new Component.js - new property name ('i18nBundle' property) - with '.properties' extension", function() {
			return oFileSystem.getDocument("/projUI5128FioriNewI18nProperty2").then(function (oTargetDocument) {
				return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
					assert.equal(sI18nPath, "i18n/i18n.properties", "Got right i18n path");
				});
			});
		});

		//########################### addi18nExtensionModel tests #####################################
		it("addi18nExtensionModel - extension project without init", function() {
			return oFileSystem.getDocument("/extProject7Component").then(function (oTargetDocument) {
				var sUri = "test/i18n/i18n.properties";
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, sUri, true).then(function (bResult) {
					assert.ok(bResult, "i18n extension model was added to Component.js");
					return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function (oUpdatedComponentDocument) {
						return oUpdatedComponentDocument.getContent().then(function(sComponentContent) {
							var oAst = mVisitor.parse(sComponentContent, {
								range: true,
								tokens: true,
								comment: true
							});
							assert.equal(oAst.body[2].expression.arguments[1].properties[1].key.name, "init", "init method created");
							var oInitAST = oAst.body[2].expression.arguments[1].properties[1].value;
							var sInitContent = escodegen.generate(oInitAST, {
								format: {
									quotes: "double"
								},
								comment: true
							});
							var sExpectedInitResult = 'function () {\n    if (myns.Component.prototype.init !== undefined) {\n        myns.Component.prototype.init.apply(this, arguments);\n    }\n    var i18nModel = new sap.ui.model.resource.ResourceModel({ bundleUrl: "./test/i18n/i18n.properties" });\n    this.setModel(i18nModel, "i18n");\n}';
							assert.equal(sInitContent, sExpectedInitResult, "init method content with i18n model correctly added");
						});

					});
				}).fail(function(oError){
					assert.ok(false, "Error adding i18n extension to Component.js : " + oError);
				});
			});
		});

		it("addi18nExtensionModel - extension project with init - overwrite false", function() {
			return oFileSystem.getDocument("/extProject8Component").then(function (oTargetDocument) {
				var sUri = "test/i18n/i18n.properties";
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, sUri, false).then(function (bResult) {
					assert.ok(false, "i18n extension model must not be added when init already exists and overwrite is false");
				}).fail(function(oError){
					assert.ok(true, "i18n extension model cannot be added when init already exists and overwrite is false");
					assert.ok(oError, "InitMethodExistInComponent", "got error as expected");
					assert.equal(oError.name, "InitMethodExistInComponent", "Correct error name");

					return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function (oComponentDocument) {
						return oComponentDocument.getContent().then(function(sComponentContent) {
							var oAst = mVisitor.parse(sComponentContent, {
								range: true,
								tokens: true,
								comment: true
							});
							assert.equal(oAst.body[2].expression.arguments[1].properties[1].key.name, "init", "init method still exists");
							var oInitAST = oAst.body[2].expression.arguments[1].properties[1].value;
							var sInitContent = escodegen.generate(oInitAST, {
								format: {
									quotes: "double"
								},
								comment: true
							});
							var sExpectedInitResult = 'function () {\n}';
							assert.equal(sInitContent, sExpectedInitResult, "init method content was unchanged");
						});
					});
				});
			});
		});

		it("addi18nExtensionModel - extension project with init - overwrite true", function() {
			return oFileSystem.getDocument("/extProject8Component").then(function (oTargetDocument) {
				var sUri = "test/i18n/i18n.properties";
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, sUri, true).then(function (bResult) {
					assert.ok(bResult, "i18n extension model was added to Component.js");
					return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function (oUpdatedComponentDocument) {
						return oUpdatedComponentDocument.getContent().then(function(sComponentContent) {
							var oAst = mVisitor.parse(sComponentContent, {
								range: true,
								tokens: true,
								comment: true
							});
							assert.equal(oAst.body[2].expression.arguments[1].properties[1].key.name, "init", "init method created");
							var oInitAST = oAst.body[2].expression.arguments[1].properties[1].value;
							var sInitContent = escodegen.generate(oInitAST, {
								format: {
									quotes: "double"
								},
								comment: true
							});
							var sExpectedInitResult = 'function () {\n    if (myns.Component.prototype.init !== undefined) {\n        myns.Component.prototype.init.apply(this, arguments);\n    }\n    var i18nModel = new sap.ui.model.resource.ResourceModel({ bundleUrl: "./test/i18n/i18n.properties" });\n    this.setModel(i18nModel, "i18n");\n}';
							assert.equal(sInitContent, sExpectedInitResult, "init method content with i18n model correctly added");
						});
					});
				}).fail(function(oError){
					assert.ok(false, "Error adding i18n extension to Component.js : " + oError);
				});
			});
		});

	});
});
