define(['STF', 'sap/watt/lib/lodash/lodash', "sinon"], function (STF, _, sinon) {
	"use strict";

	var suiteName = "AppDescriptorHandler_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {

		var oUI5ProjectHandler, oFakeFileDAO, oFileSystem, oSelectionService, oBuildService;
		var aStubs = [];

		before(function () {
			return STF.startWebIde(suiteName).then(function() {
				oUI5ProjectHandler = getService('ui5projecthandler');
				oFakeFileDAO = getService('fakeFileDAO');
				oFileSystem = getService('filesystem.documentProvider');
				oSelectionService = getService('selection');
				oBuildService = getService('builder');
			}).then(createWorkspaceStructure);
		});

		var sComponentDirectsToManifestContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';

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


		var sComponentWithoutDirectionContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
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


		var sManifestWithExtensionsContent = JSON.stringify({
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
						"minVersion": "0.8.15",
						"extensions": oAllExtensions
					},
					"contentDensities": {
						"compact": true,
						"cozy": false
					}
				}
			}
		);

		var sScaffoldingManifest = JSON.stringify({
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
						"sap.ca.i18Nconfigs" : {
							"bundleName": "nw.epm.refapps.shop.nw.epm.refapps.shopExtension.i18n.i18n"
						}
					},
					"routing": {

					},
					"extends": {
						"component": "sap.ca.scfld.md",
						"minVersion": "0.8.15",
						"extensions": {
						}
					},
					"contentDensities": {
						"compact": true,
						"cozy": false
					}
				}
			}
		);

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

		var manifestContentNoExtends = JSON.stringify({
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
						"ppm": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
							}
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
					"contentDensities": {
						"compact": true,
						"cozy": false
					}
				}
			}
		);

		var manifestAnnotContent = JSON.stringify({
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
						"p0": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/"
						},
						"p1": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/"
						},
						"p2": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
								"annotations" : ["aaaa"]
							}
						},
						"ppm": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
							}
						},
						"posrv": {
							"uri": "/sap/opu/odata/snce/PO_M_SRV/",
							"settings": {
								"annotations" : []
							}
						}
					}
				}
			}
		);

		var manifestNotAppType = JSON.stringify({
				"_version": "1.1.0",
				"start_url": "start.html",
				"sap.app": {
					"_version": "1.1.0",
					"id": "sap.fiori.appName",
					"type": "component",
					"i18n": "",
					"applicationVersion": {
						"version": "1.2.2"
					},
					"ach": "PA-FIO",
					"dataSources": {
						"p0": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/"
						},
						"p1": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/"
						},
						"p2": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
								"annotations" : ["aaaa"]
							}
						},
						"ppm": {
							"uri": "/sap/opu/odata/sap/PPM_PROTSK_CNF/",
							"settings": {
							}
						},
						"posrv": {
							"uri": "/sap/opu/odata/snce/PO_M_SRV/",
							"settings": {
								"annotations" : []
							}
						}
					}
				}
			}
		);

		var oNewDataSource = {
			"uri" : "/sap/opu/odata/snce/PO_S_SRV;v=2/",
			"type" : "OData",
			"settings" : {
				"odataVersion" : "2.0",
				"localUri" : "model/metadata.xml"
			}
		};

		var oOverwriteDataSource = {
			"uri" : "newURI",
			"type" : "OData",
			"settings" : {
				"odataVersion" : "2.0",
				"localUri" : "model/metadata.xml"
			}
		};

		var oNewDataSourceAnnotation = {
			"anno1" : {
				"uri" : "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
				"type" : "ODataAnnotation",
				"settings" : {
					"localUri" : "model/annotations.xml"
				}
			}
		};

		var oOverwriteDataSourceAnnotation = {
			"anno1" : {
				"uri" : "ewURI",
				"type" : "ODataAnnotation",
				"settings" : {
					"localUri" : "model/annotations.xml"
				}
			}
		};

		var oSourceTemplateNewVer = {
			"id": "sap.ui.ui5-template-plugin.1worklist",
			"version": "2.0.0"
		};

		var oDependenciesNew = {
			"minUI5Version": "1.40.0",
			"libs": {
				"sap.ui.core": {
					"minVersion": "1.30.0"
				}
			},
			"components": {
				"sap.ui.app.other": {
					"minVersion": "1.1.0"
				}
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
				"targetFolder": "webBuildTarget",
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
				"targetFolder": "buildTarget",
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
				"proj0ManifestNoComponent": {
					"src" : {
						"manifest.json" : manifestContent
					}
				},
				"proj1NoManifest": {
				},
				"proj1.1Component&ManifestWithoutDirection": {
					"manifest.json" : manifestContent,
					"Component.js" :sComponentWithoutDirectionContent
				},
				"proj2Manifest": {
					"src" : {
						"manifest.json" : manifestContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj2ManifestNoExtends": {
					"src" : {
						"manifest.json" : manifestContentNoExtends,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj3ManifestEmpty": {
					"src" : {
						"manifest.json" : "",
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj4ManifestEmptyTMP": {
					"src" : {
						"manifest.json" : "",
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj5ManifestEmptyTMP": {
					"src" : {
						"manifest.json" : "",
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj6Manifest": {
					"src" : {
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj7DoubleManifest": {
					"src" : {
						"manifest.json" : manifestNotAppType,
						"Component.js" : sComponentDirectsToManifestContent
					},
					"test" : {
						"temp": {
							"manifest.json" : manifestAnnotContent
						}
					}
				},
				"smart": {
					"webapp" : {
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"smartAfterBuild": {
					"webapp" : {
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					},
					"webBuildTarget" : {
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					},
					".project.json" : oProjectJSONContent
				},
				"smartAfterBuild2": {
					"buildTarget" : {
						"subfolder" : {
							"manifest.json" : manifestAnnotContent,
							"Component.js" : sComponentDirectsToManifestContent
						},
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					},
					"webapp" : {
						"subfolder" : {
							"manifest.json" : manifestAnnotContent,
							"Component.js" : sComponentDirectsToManifestContent
						},
						"manifest.json" : manifestAnnotContent,
						"Component.js" : sComponentDirectsToManifestContent
					},

					".project.json" : oProjectJSONContent2
				},
				"emptyProject0": {
				},
				"extProject1ManifestScaffolding" : {
					"src" : {
						"manifest.json" : sScaffoldingManifest,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"extProject1Manifest" : {
					"src" : {
						"manifest.json" : manifestContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"extProject2Manifest" : {
					"src" : {
						"manifest.json" : sManifestWithExtensionsContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"extProject3Manifest" : {
					"src" : {
						"manifest.json" : sManifestWithExtensionsContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"extProject4Manifest" : {
					"src" : {
						"manifest.json" : manifestContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"extProject5Manifest" : {
					"src" : {
						"manifest.json" : sManifestWithExtensionsContent,
						"Component.js" : sComponentDirectsToManifestContent
					}
				},
				"proj11ScaffoldingManifest" : {
					"src" : {
						"manifest.json" : sScaffoldingManifest,
						"Component.js" : sComponentDirectsToManifestContent
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


		it("empty project", function() {
			return oFileSystem.getDocument("/proj1NoManifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, "dataSources").then(function() {
				}).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "Unknown project guidelines",
						"Got the right error message");
				});
			});
		});

		it("manifest exists however component does not", function() {
			return oFileSystem.getDocument("/proj0ManifestNoComponent").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, "dataSources").then(function() {
				}).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "Unknown project guidelines",
						"Got the right error message");
				});
			});
		});


		it("manifest & component exist however component does not direct to manifest", function() {
			return oFileSystem.getDocument("/proj1.1Component&ManifestWithoutDirection").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, "dataSources").then(function() {
				}).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "directionError",
						"Got the right error message");
				});
			});
		});

		it("oDocument is null however there is a selection", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oSelectionService, "getSelection").returns(Q([{document : oTargetDocument}])));
				return oUI5ProjectHandler.getAttribute(null, "dataSources").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 7, "Found 7 keys in result");
					assert.ok(_.has(oContent, "sfapi"), "Found 1 dataSource");
					assert.ok(_.has(oContent, "ppm"), "Found 2 dataSource");
					assert.ok(_.has(oContent, "posrv"), "Found 3 dataSource");
					assert.ok(_.has(oContent, "equipmentanno"), "Found 4 dataSource");
					assert.ok(_.has(oContent, "koko"), "Found 5 dataSource");
					assert.ok(_.has(oContent, ""), "Found 6 dataSource");
				});

			});
		});

		//########################### getAttribute tests #####################################

		it("getAttribute", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oSelectionService, "getSelection").returns(Q([{document : oTargetDocument}])));
				return oUI5ProjectHandler.getAttribute(oTargetDocument, "dataSources").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 7, "Found 7 keys in result");
					assert.ok(_.has(oContent, "sfapi"), "Found 1 dataSource");
					assert.ok(_.has(oContent, "ppm"), "Found 2 dataSource");
					assert.ok(_.has(oContent, "posrv"), "Found 3 dataSource");
					assert.ok(_.has(oContent, "equipmentanno"), "Found 4 dataSource");
					assert.ok(_.has(oContent, "koko"), "Found 5 dataSource");
					assert.ok(_.has(oContent, ""), "Found 6 dataSource");
					assert.ok(_.has(oContent, "equipment"), "Found 7 dataSource");
				});
			});
		});

		it("getAttribute - entry not found", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, "temp").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		it("getAttribute - sAttributeName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAttribute(oTargetDocument, null).then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		//########################### getHandlerFilePath tests #####################################

		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/proj2Manifest/src", "Got right app name");
				});
			});
		});

		it("getHandlerFilePath - smart manifest", function() {
			return oFileSystem.getDocument("/smart").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/smart/webapp", "Got right app name");
				});
			});
		});

		it("getHandlerFilePath - smart manifest after build process (ignore target folder)", function() {
			return oFileSystem.getDocument("/smartAfterBuild").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oBuildService, "getTargetFolder").returns(oFileSystem.getDocument("/smartAfterBuild/webBuildTarget")));
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/smartAfterBuild/webapp", "Got right app name");
				});
			});
		});

		it("getHandlerFilePath - smart manifest after build process (ignore target folder inner manifests)", function() {
			return oFileSystem.getDocument("/smartAfterBuild2").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oBuildService, "getTargetFolder").returns(oFileSystem.getDocument("/smartAfterBuild2/buildTarget")));
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/smartAfterBuild2/webapp", "Got right app name");
				});
			});
		});

		it("getHandlerFilePath - smart manifest after build process (ignore target folder), multiple manifest", function() {
			return oFileSystem.getDocument("/smartAfterBuild").then(function(oTargetDocument) {
				aStubs.push(sinon.stub(oBuildService, "getTargetFolder").returns(oFileSystem.getDocument("/smartAfterBuild/webBuildTarget")));
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).then(function(sPath) {
					assert.equal(sPath, "/smartAfterBuild/webapp", "Got right app name");
				});
			});
		});

		it("getHandlerFilePath - more than one manifest", function() {
			return oFileSystem.getDocument("/proj7DoubleManifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFilePath(oTargetDocument).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "The manifest.json content is invalid.",
						"Got the right error message");
				});
			});
		});

		//########################### getHandlerDocument tests #####################################

		it("getHandlerDocument", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
					assert.equal(oHandlerDoc.getEntity().getFullPath(), "/proj2Manifest/src/manifest.json", "Got right handler doc");
				});
			});
		});

		it("getHandlerDocument - smart manifest", function() {
			return oFileSystem.getDocument("/smart").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).then(function(oHandlerDoc) {
					assert.equal(oHandlerDoc.getEntity().getFullPath(), "/smart/webapp/manifest.json", "Got right handler doc");
				});
			});
		});

		it("getHandlerDocument - more than one manifest", function() {
			return oFileSystem.getDocument("/proj7DoubleManifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerDocument(oTargetDocument).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "The manifest.json content is invalid.",
						"Got the right error message");
				});
			});
		});

		it("getHandlerDocument - negative", function() {
			return oUI5ProjectHandler.getHandlerDocument(null).then(function(oHandlerDoc) {
				assert.equal(oHandlerDoc.getEntity().getFullPath(), "/proj2Manifest/src/manifest.json", "Got right handler doc");
				assert.ok(false, "Should not get here, no project document was sent");
			}).fail(function (oError) {
				assert.ok(oError, "Got thrown error");
				assert.equal(oError.name, "NoProjectSelected", "Proper exception thrown");
			});
		});

		//########################### getAppNamespace tests #####################################

		it("getAppNamespace", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).then(function(sAppName) {
					assert.equal(sAppName, "a", "Got right app name");
				});
			});
		});

		it("getAppNamespace - negative no file found in project", function() {
			return oFileSystem.getDocument("/emptyProject0").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAppNamespace(oTargetDocument).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "Unknown project guidelines",
						"Got the right error message");
				});
			});
		});

		//########################### getDataSources tests #####################################

		it("getDataSources", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
					assert.equal(Object.keys(oDataSources).length, 7, "Found 7 keys in result");
					assert.ok(_.has(oDataSources, "sfapi"), "Found 1 dataSource");
					assert.ok(_.has(oDataSources, "ppm"), "Found 2 dataSource");
					assert.ok(_.has(oDataSources, "posrv"), "Found 3 dataSource");
					assert.ok(_.has(oDataSources, "equipmentanno"), "Found 4 dataSource");
					assert.ok(_.has(oDataSources, "koko"), "Found 5 dataSource");
					assert.ok(_.has(oDataSources, ""), "Found 6 dataSource");
				});
			});
		});

		//########################### getAllDataSourceNames tests ###########################

		it("getAllDataSourceNames", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllDataSourceNames(oTargetDocument).then(function(aDataSourceNames) {
					assert.equal(Object.keys(aDataSourceNames).length, 7, "Found 7 keys in result");
					assert.ok(_.includes(aDataSourceNames, "sfapi"), "Found 1 dataSource");
					assert.ok(_.includes(aDataSourceNames, "ppm"), "Found 2 dataSource");
					assert.ok(_.includes(aDataSourceNames, "posrv"), "Found 3 dataSource");
					assert.ok(_.includes(aDataSourceNames, "equipmentanno"), "Found 4 dataSource");
					assert.ok(_.includes(aDataSourceNames, "koko"), "Found 5 dataSource");
					assert.ok(_.includes(aDataSourceNames, ""), "Found 6 dataSource");
				});
			});
		});

		//########################### getDataSourcesByName tests #####################################

		it("getDataSourcesByName", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, "sfapi").then(function(oDataSource) {
					assert.equal(Object.keys(oDataSource).length, 3, "Found 3 keys in result");
					assert.ok(_.has(oDataSource, "uri"), "Found property 1");
					assert.ok(_.has(oDataSource, "type"), "Found property 2");
					assert.ok(_.has(oDataSource, "settings"), "Found property 3");
					var oSettings = _.get(oDataSource, "settings");
					assert.ok(_.has(oSettings, "odataVersion"), "Found settings property 1");
					assert.ok(_.has(oSettings, "annotations"), "Found settings property 2");
					assert.ok(_.has(oSettings, "localUri"), "Found settings property 3");
				});
			});
		});

		it("getDataSourcesByName - entry not found", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, "xxxx").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		it("getDataSourcesByName - sAttributeName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, null).then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		//########################### getDataSourceAnnotationsByName tests #####################################

		it("getDataSourceAnnotationsByName", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, "sfapi").then(function(oDataSourceAnnotations) {
					assert.equal(Object.keys(oDataSourceAnnotations).length, 2, "Found 2 keys in result");
					assert.ok(_.has(oDataSourceAnnotations, "equipmentanno"), "Found property 1");
					assert.ok(_.has(oDataSourceAnnotations, "koko"), "Found property 2");
					var oEquipmentAnnotation = _.get(oDataSourceAnnotations, "equipmentanno");
					assert.ok(_.has(oEquipmentAnnotation, "settings"), "Found anno property 1");
					assert.equal(_.get(oEquipmentAnnotation, "type"), "ODataAnnotation", "Got anno property 2");
					assert.equal(_.get(oEquipmentAnnotation, "uri"), "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML", "Got anno property 3");
				});
			});
		});

		it("getDataSourceAnnotationsByName - entry not found", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, "xxxx").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		it("getDataSourceAnnotationsByName - sAttributeName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, null).then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});


		//########################### getDataSourcesByType tests #####################################

		it("getDataSourcesByType", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "OData").then(function(aDataSources) {
					assert.equal(Object.keys(aDataSources).length, 5, "Found 5 keys in result");
					assert.ok(_.has(aDataSources, "sfapi"), "Found 1 dataSource");
					assert.ok(_.has(aDataSources, "ppm"), "Found 2 dataSource");
					assert.ok(_.has(aDataSources, "posrv"), "Found 3 dataSource");
					assert.ok(_.has(aDataSources, "equipment"), "Found 4 dataSource");
					assert.ok(_.has(aDataSources, ""), "Found 5 dataSource");
				});
			});

		});

		it("getDataSourcesByType - entry not found", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, "xxxx").then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		it("getDataSourcesByType - sDataSourceType is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDataSourcesByType(oTargetDocument, null).then(function(oContent) {
					assert.equal(Object.keys(oContent).length, 0, "Given entry not found in manifest");
				});
			});
		});

		//########################### getSourceTemplate tests #####################################

		it("getSourceTemplate - manifest exists", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getSourceTemplate(oTargetDocument).then(function(oSourceTemplate) {
					assert.equal(Object.keys(oSourceTemplate).length, 2, "Found 2 keys in result");
					assert.ok(_.has(oSourceTemplate, "id"), "Found id property");
					assert.ok(_.has(oSourceTemplate, "version"), "Found version property");
					var sSourceTemplateID = _.get(oSourceTemplate, "id");
					assert.equal(sSourceTemplateID, "sap.ui.ui5-template-plugin.1worklist",
						"Got right sourceTemplate id");
					var sSourceTemplateVer = _.get(oSourceTemplate, "version");
					assert.equal(sSourceTemplateVer, "1.0.0", "Got right sourceTemplate version");
				});
			});
		});

		//########################### getDependencies tests #####################################

		it("getDependencies - manifest exists", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getDependencies(oTargetDocument).then(function(oDependencies) {
					assert.equal(Object.keys(oDependencies).length, 3, "Found 3 keys in result");
					assert.ok(_.has(oDependencies, "components"), "Found components property");
					assert.ok(_.has(oDependencies, "libs"), "Found libs property");
					assert.ok(_.has(oDependencies, "minUI5Version"), "Found minUI5Version property");
					var oComponents = _.get(oDependencies, "components");
					assert.ok(_.has(oComponents, "sap.ui.app.other"), "Found sap.ui.app.other property");
					var oOther = _.get(oComponents, "sap.ui.app.other");
					assert.equal(oOther.minVersion, "1.1.0", "Got right min version of other component");
				});
			});
		});

		//########################### getAllExtensions tests ###########################

		it("getAllExtensions - manifest exists", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function(oExtensions) {
					assert.ok(_.isEqual(oAllExtensions, oExtensions), "found all extensions");
				});
			});
		});

		it("getAllExtensions - manifest exists - give specific file", function() {
			return oFileSystem.getDocument("/extProject2Manifest/src/manifest.json").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function(oExtensions) {
					assert.ok(_.isEqual(oAllExtensions, oExtensions), "found all extensions");
				});
			});
		});

		it("getAllExtensions - manifest not app type - give specific file", function() {
			return oFileSystem.getDocument("/proj7DoubleManifest/src/manifest.json").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getAllExtensions(oTargetDocument).fail(function(oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.message, "The manifest.json content is invalid.",
						"Got the right error message");
				});
			});
		});

		//########################### isScaffoldingBased tests ###########################

		it("isScaffoldingBased - with scaffolding", function() {
			return oFileSystem.getDocument("/proj11ScaffoldingManifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(bResult, "scaffolding found");
				});
			});
		});

		it("isScaffoldingBased - without scaffolding", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "no scaffolding found");
				});
			});
		});

		it("isScaffoldingBased - manifest no extends", function() {
			return oFileSystem.getDocument("/proj2ManifestNoExtends").then(function(oTargetDocument) {
				return oUI5ProjectHandler.isScaffoldingBased(oTargetDocument).then(function(bResult) {
					assert.ok(!bResult, "no scaffolding found");
				});
			});
		});


		//########################### addExtension tests ###########################

		it("addExtension - No extensions block in manifest.json", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
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
				}).fail(function () {
					assert.ok(false, "Error adding extension to manifest.json");
				});
			});
		});

		it("addExtension - Existing extensions block in manifest.json", function () {
			return oFileSystem.getDocument("/extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oNewElementExtension.sExtensionType, oNewElementExtension.sViewName, oNewElementExtension.oContent, false).then(function (bResult) {
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
					assert.ok(oError, "Error adding extension to manifest.json");
				});
			});
		});

		it("addExtension - Existing Extension in extensions block, bOverWrite is true", function () {
			return oFileSystem.getDocument("extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, true).then(function (bResult) {
					assert.ok(bResult,"Extension added");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(!_.isEmpty(oExtensions), "An extension was created");
						assert.ok(oExtensions && oExtensions[oExistingViewExtension.sExtensionType], "Correct extension type");
						var oExtensionType = oExtensions[oExistingViewExtension.sExtensionType];
						assert.ok(oExtensionType[oExistingViewExtension.sViewName], "Correct View extended");
						//assert.ok(!_.isEqual(oExtensionType[oExistingViewExtension.sViewName], oExistingViewExtension.oContent), "Correct extension added");
						assert.ok(_.isEqual(oExtensionType[oExistingViewExtension.sViewName], oExistingViewExtension.oContent), "Correct extension added");
					});
				}).fail(function (oError) {
					assert.ok(oError, "Error adding extension to manifest.json");
				});
			});
		});

		it("addExtension - Existing Extension in extensions block, bOverWrite is false", function () {
			return oFileSystem.getDocument("extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName, oExistingViewExtension.oContent, false).then(function () {
					assert.ok(false,"Should not be able to add overwrite extension when flag is false");
				}).fail(function (oError) {
					assert.ok(oError, "Got error when overwriting extension");
					assert.equal(oError.name, "ExtensionExistInHandler", "Got right type of error");
				});
			});
		});

		it("addExtension - sExtensionType undefined", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, undefined, oNewElementExtension.sViewName,
					oNewElementExtension.oContent, true).then(function () {
					}).fail(function (oError) {
						assert.ok(oError, "Got error when sExtensionType undefined");
						assert.equal(oError.name, "ExtensionNotDefined", "Got right type of error");
					});
			});
		});

		it("addExtension - sViewName undefined", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, undefined,
					oNewElementExtension.oContent, true).then(function () {
					}).fail(function (oError) {
						assert.ok(oError, "Got error when sViewName undefined");
						assert.equal(oError.name, "ViewNotDefined", "Got right type of error");
					});
			});
		});

		it("addExtension - oContent undefined", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.addExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oNewElementExtension.sViewName,
					undefined, true).then(function () {
					}).fail(function (oError) {
						assert.ok(oError, "Got error when oContent undefined");
						assert.equal(oError.name, "ContentNotDefined", "Got right type of error");
					});
			});
		});

		//########################### addDataSource tests #####################################

		it("addDataSource - adding new service", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"k2",//sDataSourceName
					oNewDataSource,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new service");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 8, "Found 8 keys in result");
								assert.ok(_.has(oDataSources, "k2"), "Found k2 dataSource");
							});
						});
					});
			});
		});

		it("addDataSource - data source already exist - bOverWrite is true", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"k2",//sDataSourceName
					oOverwriteDataSource,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new service");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 8, "Found 1 keys in result");
								assert.ok(_.has(oDataSources, "k2"), "Found k2 dataSource");
								var oK2DataSource = _.get(oDataSources, "k2");
								var k2URI = _.get(oK2DataSource, "uri");
								assert.equal(k2URI, "newURI", "Success overwriting URI key of datasource");

							});
						});
					});
			});
		});

		it("addDataSource - data source already exist - bOverWrite is false", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"k2",//sDataSourceName
					oOverwriteDataSource,//oContent
					false //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The data source name already exist. " +
							"Use bOverwrite parameter to overwrite this service data",
							"Got the right error message");
					});
			});
		});

		it("addDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oOverwriteDataSource,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oOverwriteDataSource,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The data source name is not defined",
							"Got the right error message");
					});
			});
		});

		it("addDataSource - oContent is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"asfasf",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addDataSource - oContent is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSource(
					oTargetDocument, //oDocument
					"asfasf",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The content is not defined",
							"Got the right error message");
					});
			});
		});


		//########################### addDataSourceAnnotation tests #####################################

		it("addDataSourceAnnotation - data source not found", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"k3",//sDataSourceName
					oNewDataSourceAnnotation,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message,
							"The given data source does not exist. Cannot add annotation under it",
							"Got right Error message");
					});
			});
		});

		it("addDataSourceAnnotation - data source not from type OData", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"equipmentanno",//sDataSourceName
					oNewDataSourceAnnotation,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message,
							"The given data source is not from OData type. Cannot add annotation under it",
							"Got right Error message");
					});
			});
		});

		it("addDataSourceAnnotation - data source does not have settings", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"p0",//sDataSourceName
					oNewDataSourceAnnotation,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new annotation");
						return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 6, "Found 6 keys in result");
								assert.ok(_.has(oDataSources, "anno1"), "Found the new 'anno1' dataSource");
								var oP0DataSource = _.get(oDataSources, "p0");
								var oP0DataSourceSettings = _.get(oP0DataSource, "settings");
								var oP0DataSourceAnnotations = _.get(oP0DataSourceSettings, "annotations");
								assert.equal(oP0DataSourceAnnotations.length, 1, "Found 1 annotations");
								assert.ok(_.contains(oP0DataSourceAnnotations, "anno1"), "Found the new annotations");
							});
						});
					});
			});
		});

		it("addDataSourceAnnotation - annotation section exist under given DS", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi",//sDataSourceName
					oNewDataSourceAnnotation,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new annotation");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 9, "Found 9 keys in result");
								assert.ok(_.has(oDataSources, "anno1"), "Found the new 'anno1' dataSource");
								var oSfapiDataSource = _.get(oDataSources, "sfapi");
								var oSfapiDataSourceSettings = _.get(oSfapiDataSource, "settings");
								var oSfapiDataSourceAnnotations = _.get(oSfapiDataSourceSettings, "annotations");
								assert.equal(oSfapiDataSourceAnnotations.length, 3, "Found 3 annotations");
								assert.ok(_.contains(oSfapiDataSourceAnnotations, "anno1"), "Found the new annotations");
							});
						});
					});
			});
		});

		it("addDataSourceAnnotation - annotation already exist and bOverWrite is false", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi",//sDataSourceName
					oOverwriteDataSourceAnnotation,//oContent
					false //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message,
							"The annotation already exist under data sources. " +
							"Use bOverwrite parameter to overwrite this annotation",
							"Got right Error message");
					});
			});
		});

		it("addDataSourceAnnotation - annotation already exist and bOverWrite is true", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi",//sDataSourceName
					oOverwriteDataSourceAnnotation,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new annotation");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 9, "Found 9 keys in result");
								assert.ok(_.has(oDataSources, "anno1"), "Found the new 'anno1' dataSource");
								var oSfapiDataSource = _.get(oDataSources, "sfapi");
								var oSfapiDataSourceSettings = _.get(oSfapiDataSource, "settings");
								var oSfapiDataSourceAnnotations = _.get(oSfapiDataSourceSettings, "annotations");
								assert.equal(oSfapiDataSourceAnnotations.length, 3, "Found 3 annotations");
								assert.ok(_.contains(oSfapiDataSourceAnnotations, "anno1"), "Found the new annotations");
								var oAnno1DataSource = _.get(oDataSources, "anno1");
								var sAnno1DataSourceURI = _.get(oAnno1DataSource, "uri");
								assert.equal(sAnno1DataSourceURI, "ewURI", "got new overwritten uri");
							});
						});
					});
			});
		});

		it("addDataSourceAnnotation - annotation section not " +
			"exist under given DS, but annotation exits under data sources and bOverWrite is false",
			function() {
				return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

					return oUI5ProjectHandler.addDataSourceAnnotation(
						oTargetDocument, //oDocument
						"",//sDataSourceName
						oNewDataSourceAnnotation,//oContent
						false //bOverWrite
					).then(function() {
						}).fail(function(oError) {
							assert.ok(oError, "Success getting error object");
							assert.equal(oError.message,
								"The annotation already exist under data sources. " +
								"Use bOverwrite parameter to overwrite this annotation",
								"Got right Error message");
						});
				});
			});

		it("addDataSourceAnnotation - annotation section not " +
			"exist under given DS, but annotation exits under data sources and bOverWrite is true",
			function() {
				return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

					return oUI5ProjectHandler.addDataSourceAnnotation(
						oTargetDocument, //oDocument
						"",//sDataSourceName
						oNewDataSourceAnnotation,//oContent
						true //bOverWrite
					).then(function(bSuccess) {
							assert.ok(bSuccess, "Success adding new annotation");
							return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
								return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
									assert.equal(Object.keys(oDataSources).length, 9, "Found 9 keys in result");
									assert.ok(_.has(oDataSources, "anno1"), "Found the new 'anno1' dataSource");
									var oSfapiDataSource = _.get(oDataSources, "");
									var oSfapiDataSourceSettings = _.get(oSfapiDataSource, "settings");
									var oSfapiDataSourceAnnotations = _.get(oSfapiDataSourceSettings, "annotations");
									assert.equal(oSfapiDataSourceAnnotations.length, 1, "Found 1 annotations");
									assert.ok(_.contains(oSfapiDataSourceAnnotations, "anno1"), "Found the new annotations");
								});
							});
						});
				});
			});


		it("addDataSourceAnnotation - settings section not " +
			"exist under given DS, but annotation exits under data sources and bOverWrite is true",
			function() {
				return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

					return oUI5ProjectHandler.addDataSourceAnnotation(
						oTargetDocument, //oDocument
						"ppm",//sDataSourceName
						oNewDataSourceAnnotation,//oContent
						true //bOverWrite
					).then(function(bSuccess) {
							assert.ok(bSuccess, "Success adding new annotation");
							return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
								return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
									assert.equal(Object.keys(oDataSources).length, 9, "Found 9 keys in result");
									assert.ok(_.has(oDataSources, "anno1"), "Found the new 'anno1' dataSource");
									var oSfapiDataSource = _.get(oDataSources, "ppm");
									var oSfapiDataSourceSettings = _.get(oSfapiDataSource, "settings");
									var oSfapiDataSourceAnnotations = _.get(oSfapiDataSourceSettings, "annotations");
									assert.equal(oSfapiDataSourceAnnotations.length, 1, "Found 1 annotations");
									assert.ok(_.contains(oSfapiDataSourceAnnotations, "anno1"), "Found the new annotations");
								});
							});
						});
				});
			});

		it("addDataSourceAnnotation - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oOverwriteDataSource,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addDataSourceAnnotation - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					null,//sDataSourceName
					oOverwriteDataSource,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The data source name is not defined",
							"Got the right error message");
					});
			});
		});

		it("addDataSourceAnnotation - oContent is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"asfasf",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addDataSourceAnnotation - oContent is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDataSourceAnnotation(
					oTargetDocument, //oDocument
					"asfasf",//sDataSourceName
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The content is not defined",
							"Got the right error message");
					});
			});
		});

		//########################### addSourceTemplate tests #####################################

		it("addSourceTemplate - already exist, overwrite false", function() {

			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addSourceTemplate(
					oTargetDocument, //oDocument
					oSourceTemplateNewVer,//oContent
					false //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The source template already exist. Use bOverwrite " +
							"parameter to overwrite the data",
							"Got the right error message");
					});
			});
		});

		it("addSourceTemplate - already exist, overwrite true", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addSourceTemplate(
					oTargetDocument, //oDocument
					oSourceTemplateNewVer,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding source template");
						return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getAttribute(oTargetDocument, "sourceTemplate").
								then(function(oSourceTemplate) {
									assert.ok(oSourceTemplate, "Got sourceTemlpate object");
									assert.equal(_.get(oSourceTemplate, "version"), "2.0.0", "Got right version");
								});
						});
					});
			});

		});

		it("addSourceTemplate - oContent is null", function() {
			return oFileSystem.getDocument("/proj5ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addSourceTemplate(
					oTargetDocument, //oDocument
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addSourceTemplate - oContent is null", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addSourceTemplate(
					oTargetDocument, //oDocument
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The content is not defined",
							"Got the right error message");
					});
			});
		});

		//########################### addDependencies tests #####################################

		it("addDependencies - already exist, overwrite false", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(
					oTargetDocument, //oDocument
					oDependenciesNew,//oContent
					false //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "Dependencies already exist. Use bOverwrite parameter " +
							"to overwrite the data",
							"Got the right error message");
					});
			});
		});

		it("addDependencies - already exist, overwrite true", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(
					oTargetDocument, //oDocument
					oDependenciesNew,//oContent
					true //bOverWrite
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding source template");
						return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getAttribute(oTargetDocument, "dependencies").
								then(function(oDependencies) {
									assert.ok(oDependencies, "Got dependencies object");
									assert.equal(Object.keys(oDependencies).length, 3, "Found 3 keys in result");
									assert.equal(_.get(oDependencies, "minUI5Version"), "1.40.0", "Got right version");
								});
						});
					});
			});

		});

		it("addDependencies - oContent is null", function() {
			return oFileSystem.getDocument("/proj5ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(
					oTargetDocument, //oDocument
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("addDependencies - oContent is null", function() {
			return oFileSystem.getDocument("/extProject2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.addDependencies(
					oTargetDocument, //oDocument
					null,//oContent
					true //bOverWrite
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The content is not defined",
							"Got the right error message");
					});
			});
		});


		//########################### removeDataSource tests #####################################

		it("removeDataSource - manifest exists", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					"k2"//sDataSourceName
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new service");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSources(oTargetDocument).then(function(oDataSources) {
								assert.equal(Object.keys(oDataSources).length, 8, "Found 8 keys in result");
								assert.ok(!_.has(oDataSources, "k2"), "K2 removed successfully");
							});
						});
					});
			});
		});

		it("removeDataSource - empty manifest", function() {
			return oFileSystem.getDocument("/proj3ManifestEmpty").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					"k2"//sDataSourceName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});

		});

		it("removeDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					null//sDataSourceName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("removeDataSource - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					null//sDataSourceName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The data source name is not defined",
							"Got the right error message");
					});
			});
		});

		it("removeDataSource - data source not exist", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					"kk222"//sDataSourceName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "DataSourceNotExistInManifest",
							"Got the right error message");
					});
			});
		});


		//########################### removeDataSourceAnnotation tests #####################################

		it("removeDataSourceAnnotation - manifest exists", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi", //sDataSourceName
					"koko" //sAnnotationName
				).then(function(bSuccess) {
						assert.ok(bSuccess, "Success adding new service");
						return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
							return oUI5ProjectHandler.getDataSourceAnnotationsByName(oTargetDocument, "sfapi").then(function(oDataSourceAnnotations) {
								assert.equal(Object.keys(oDataSourceAnnotations).length, 2, "Found 2 key in result");
								assert.ok(_.has(oDataSourceAnnotations, "equipmentanno"), "Found existing annotation");
								assert.ok(!_.has(oDataSourceAnnotations, "koko"), "koko does not exist property 2");
							});
						});
					});
			});
		});

		it("removeDataSourceAnnotation - service is not OData one", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"equipmentanno", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The given data source is not from OData type. Cannot remove annotation " +
							"under it",
							"Got the right error message");
					});
			});

		});

		it("removeDataSourceAnnotation - service without settings", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"p1", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The given service name does not contain settings",
							"Got the right error message");
					});
			});

		});


		it("removeDataSourceAnnotation - service without annotations under settings", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"ppm", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The given service name does not contain any annotations",
							"Got the right error message");
					});
			});

		});

		it("removeDataSourceAnnotation - service with empty annotations", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"posrv", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The given service name does not contain any annotations",
							"Got the right error message");
					});
			});

		});

		it("removeDataSourceAnnotation - service does not contain the specific annotation", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"p2", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The given service name does not contain the given annotation",
							"Got the right error message");
					});
			});

		});


		it("removeDataSourceAnnotation - empty manifest", function() {
			return oFileSystem.getDocument("/proj3ManifestEmpty").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi", //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});

		});

		it("removeDataSourceAnnotation - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					null, //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("removeDataSourceAnnotation - sDataSourceName is null", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					null, //sDataSourceName
					"koko" //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The data source name is not defined",
							"Got the right error message");
					});
			});
		});

		it("removeDataSourceAnnotation - sAnnotationName is null", function() {
			return oFileSystem.getDocument("/proj4ManifestEmptyTMP").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi", //sDataSourceName
					null //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The manifest.json content is invalid.");
					});
			});
		});

		it("removeDataSourceAnnotation - sAnnotationName is null", function() {
			return oFileSystem.getDocument("/proj6Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.removeDataSourceAnnotation(
					oTargetDocument, //oDocument
					"sfapi", //sDataSourceName
					null //sAnnotationName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.message, "The annotation name is not defined",
							"Got the right error message");
					});
			});
		});

		it("removeDataSource - data source does not exist", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {

				return oUI5ProjectHandler.removeDataSource(
					oTargetDocument, //oDocument
					"khgfhsdfh2"//sDataSourceName
				).then(function() {
					}).fail(function(oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "DataSourceNotExistInManifest",
							"Got the right error message");
					});
			});
		});

		//########################### removeExtension tests ###########################

		it("removeExtension - No extensions block in manifest.json", function () {
			return oFileSystem.getDocument("/extProject4Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingElementExtension.sExtensionType, oExistingElementExtension.sViewName).then(function () {
					assert.ok(false, "Should not be able to remove extension");
				}).fail(function (oError) {
					assert.ok(oError, "Error removing extension from manifest.json");
					assert.equal(oError.name, "ExtensionNotFound", "Got correct error message");
				});
			});
		});

		it("removeExtension - Existing View Extension in extensions block", function () {
			return oFileSystem.getDocument("/extProject5Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingViewExtension.sExtensionType, oExistingViewExtension.sViewName).then(function (bResult) {
					assert.ok(bResult,"Extension removed");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions && !_.isEmpty(oExtensions), "Got extensions object");
						assert.ok(!oExtensions[oExistingViewExtension.sExtensionType], "Empty extension block removed");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error removing extension from manifest: " + oError);
				});
			});
		});

		it("removeExtension - Existing Control Extension in extensions block", function () {
			return oFileSystem.getDocument("/extProject5Manifest").then(function (oTargetDocument) {
				var sExtendedElement = Object.keys(oExistingElementExtension.oContent)[0];
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oExistingElementExtension.sExtensionType, oExistingElementExtension.sViewName, sExtendedElement).then(function (bResult) {
					assert.ok(bResult,"Extension removed");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions && !_.isEmpty(oExtensions), "Got extensions object");
						assert.ok(!oExtensions[oExistingViewExtension.sExtensionType], "Empty extension block removed");
					});
				}).fail(function (oError) {
					assert.ok(false, "Error removing extension from manifest: " + oError);
				});
			});
		});

		it("removeExtension - Non-existing Extension in extensions block", function () {
			return oFileSystem.getDocument("/extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oNewViewExtension.sExtensionType, oNewViewExtension.sViewName).then(function () {
					assert.ok(false, "Should not be able to remove extension");
				}).fail(function (oError) {
					assert.ok(oError, "Error removing extension from manifest.json");
					assert.equal(oError.name, "ExtensionNotFound", "Got correct error message");
				});
			});
		});

		it("removeExtension - sExtensionType not defined", function () {
			return oFileSystem.getDocument("/extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, undefined, oNewViewExtension.sViewName).then(function () {
					assert.ok(false, "Should not be able to remove extension");
				}).fail(function (oError) {
					assert.ok(oError, "Error removing extension from manifest.json");
					assert.equal(oError.name, "ExtensionNotDefined", "Got correct error message");
				});
			});
		});

		it("removeExtension - sViewName not defined", function () {
			return oFileSystem.getDocument("/extProject2Manifest").then(function (oTargetDocument) {
				return oUI5ProjectHandler.removeExtension(oTargetDocument, oNewViewExtension.sExtensionType, undefined)
				.fail(function (oError) {
					assert.ok(oError, "Error removing extension from manifest.json");
					assert.equal(oError.name, "ViewNotDefined", "Got correct error message");
				});
			});
		});



		//########################### addModel tests ###########################

		it("addModel - with manifest.json and overwrite, empty content", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "i18n";
				var oContent = {};
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, oContent, true).then(function (bResult) {
					assert.ok(bResult,"Model added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function (oModels) {
						assert.ok(oModels, "Got models");
						assert.ok(!_.isEmpty(oModels), "A model was created");
						assert.ok(oModels && oModels[sModelName], "Correct model name");
						var oModelContent = oModels[sModelName];
						assert.ok(_.isEqual(oModelContent, {}), "Correct content added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding a model to the manifest.json");
				});
			});
		});

		it("addModel - sModelName not defiend", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var oContent = {};
				return oUI5ProjectHandler.addModel(oTargetDocument, null, oContent, true).fail(function (oError) {
						assert.ok(oError, "Error adding a model to the manifest.json");
						assert.equal(oError.name, "ModelNotDefined", "Got correct error message");
					});
			});
		});

		it("addModel - sModelName not defiend", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "i18n";
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, null, true).fail(function (oError) {
						assert.ok(oError, "Error adding a model to the manifest.json");
						assert.equal(oError.name, "ContentNotDefined", "Got correct error message");
					});
				});
		});

		it("addModel - with manifest.json and overwrite, not empty content", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "i18n";
				var oContent = {
					"type": "sap.ui.model.resource.ResourceModel",
					"url": "i18n/michal.properties"
				};
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, oContent, true).then(function (bResult) {
					assert.ok(bResult,"Model added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function (oModels) {
						assert.ok(oModels, "Got models");
						assert.ok(!_.isEmpty(oModels), "A model was created");
						assert.ok(oModels && oModels[sModelName], "Correct model name");
						var oModelContent = oModels[sModelName];
						assert.ok(_.isEqual(oModelContent.url, "i18n/michal.properties"), "Correct url added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding a model to the manifest.json");
				});
			});
		});

		it("addModel - with manifest.json, don't overwrite, same model name, same content - should fail", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "i18n";
				var oContent = {
					"type": "sap.ui.model.resource.ResourceModel",
					"uri": "i18n/i18n.properties"
				};
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, oContent, false).then(function (bResult) {
					assert.ok(bResult,"Model added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function () {
					});
				}).fail(function (oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "ModelNameExistInManifest");
				});
			});
		});

		it("addModel - with manifest.json, don't overwrite, same model name, different content - should fail", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "i18n";
				var oContent = {
					"type": "sap.ui.model.resource.ResourceModel",
					"uri": "i18n/michal.properties"
				};
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, oContent, false).then(function (bResult) {
					assert.ok(bResult,"Model added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function () {
					});
				}).fail(function (oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "ModelNameExistInManifest");
				});
			});
		});

		it("addModel - with manifest.json, don't overwrite, different model name, different content", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sModelName = "michal_model";
				var oContent = {
					"type": "sap.ui.model.resource.ResourceModel",
					"uri": "i18n/michal.properties"
				};
				return oUI5ProjectHandler.addModel(oTargetDocument, sModelName, oContent, false).then(function (bResult) {
					assert.ok(bResult, "Model added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function (oModels) {
						assert.ok(oModels, "Got models");
						assert.ok(oModels[sModelName], "Correct model name");
						var oModelContent = oModels[sModelName];
						assert.ok(_.isEqual(oModelContent.uri, "i18n/michal.properties"), "Correct url added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding a model to the manifest.json");
				});
			});
		});

		//########################### addConfig tests ###########################

		it("addConfig - with manifest.json and overwrite, empty content", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var sConfigName = "sap.ca.i18Nconfigs";
				var oContent = {};
				return oUI5ProjectHandler.addConfig(oTargetDocument, sConfigName, oContent, true).then(function (bResult) {
					assert.ok(bResult,"Config added");

					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got configs");
						assert.ok(!_.isEmpty(oConfigs), "A config was created");
						assert.ok(oConfigs && oConfigs[sConfigName], "Correct config name");
						var oConfigContent = oConfigs[sConfigName];
						assert.ok(_.isEqual(oConfigContent, {}), "Correct content added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding a config to the manifest.json");
				});
			});
		});

		it("addConfig - with manifest.json and not overwrite, empty content", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var sConfigName = "sap.ca.i18Nconfigs";
				var oContent = {};
				return oUI5ProjectHandler.addConfig(oTargetDocument, sConfigName, oContent, false)
					.fail(function (oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "ConfigNameExist");
				});
			});
		});

		it("addConfig - with manifest.json and overwrite, not empty content", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var sConfigName = "sap.ca.i18Nconfigs";
				var oContent = {
					"bundleName" : "blablamichal"
				};
				return oUI5ProjectHandler.addConfig(oTargetDocument, sConfigName, oContent, true).then(function (bResult) {
					assert.ok(bResult,"Config added");

					return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
						assert.ok(oConfigs, "Got configs");
						assert.ok(!_.isEmpty(oConfigs), "A config was created");
						assert.ok(oConfigs && oConfigs[sConfigName], "Correct config name");
						var oConfigContent = oConfigs[sConfigName];
						assert.ok(_.isEqual(oConfigContent.bundleName, "blablamichal"), "Correct content added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding a config to the manifest.json");
				});
			});
		});


		it("addConfig - sConfigName null", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var oContent = {};
				return oUI5ProjectHandler.addConfig(oTargetDocument, null, oContent, true)
					.fail(function (oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "ConfigNotDefined");
				});
			});
		});

		it("addConfig - oContent null", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var sConfigName = "sap.ca.i18Nconfigs";
				return oUI5ProjectHandler.addConfig(oTargetDocument, sConfigName, null, true)
					.fail(function (oError) {
						assert.ok(oError, "Success getting error object");
						assert.equal(oError.name, "ContentNotDefined");
				});
			});
		});

		//########################### addi18nExtensionModel tests ###########################

		it("addi18nExtensionModel - without scaffolding", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sUri = "test/me/i18n.properties";
				return oUI5ProjectHandler.addi18nExtensionModel(oTargetDocument, sUri, true).then(function (bResult) {
					assert.ok(bResult, "i18n extension added");

					return oUI5ProjectHandler.getModels(oTargetDocument).then(function (oModels) {
						assert.ok(oModels, "Got models");
						assert.ok(!_.isEmpty(oModels), "A model was created");
						assert.ok(oModels && oModels["i18n"], "Correct model name");
						var oModelContent = oModels["i18n"];
						assert.ok(_.isEqual(oModelContent.settings.bundleName, "sap.fiori.appName.test.me.i18n"), "Correct content added");
						return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
							assert.ok(_.isEqual(sI18nPath, "test/me/i18n.properties"), "Correct i18n uri added");
						});
					});
				}).fail(function () {
					assert.ok(false, "Error adding an i18n extension to the manifest.json");
				});
			});
		});

		//########################### addI18nPath tests ###########################

		it("addI18nPath - with overwrite", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sUri = "some other uri";
				return oUI5ProjectHandler.addI18nPath(oTargetDocument, sUri, true).then(function (bResult) {
					assert.ok(bResult, "i18n path added");

					return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function (sI18nPath) {
						assert.ok(sI18nPath, "Got i18n path");
						assert.ok(_.isEqual(sI18nPath, "some other uri"), "Correct path added");
					});
				}).fail(function () {
					assert.ok(false, "Error adding an i18n path to the manifest.json");
				});
			});
		});

		it("addI18nPath - without overwrite", function () {
			return oFileSystem.getDocument("/extProject1Manifest").then(function (oTargetDocument) {
				var sUri = "some other uri";
				return oUI5ProjectHandler.addI18nPath(oTargetDocument, sUri, false).then(function (bResult) {
					assert.ok(bResult, "i18n path added");

					return oUI5ProjectHandler.getI18nPath(oTargetDocument).then(function () {
					});
				}).fail(function (oError) {
					assert.ok(oError, "Success getting error object");
					assert.equal(oError.name, "i18nPathExistInManifest");
				});
			});
		});

		//########################### addExtensionForScaffoldingDataSource tests ###########################
		it("addExtensionForScaffoldingDataSource - with manifest.json", function () {
			return oFileSystem.getDocument("/extProject1ManifestScaffolding").then(function (oTargetDocument) {
				var sDataSourceName = "ppm";
				var sUri = "/my/uri/";
				var sLocalUri = "./local/metadata.xml";
				var bIsDefault = true;
				return oUI5ProjectHandler.addExtensionForScaffoldingDataSource(oTargetDocument, sDataSourceName, sUri, sLocalUri, bIsDefault, true).then(function (bResult) {
					assert.ok(bResult,"Scaffolding data source added");
					return oUI5ProjectHandler.getDataSourcesByName(oTargetDocument, sDataSourceName).then(function(oDataSource) {
						assert.equal(oDataSource.uri, sUri, "Found the correct URI");
						assert.equal(oDataSource.settings.localUri, sLocalUri, "Found the correct local URI");
						return oUI5ProjectHandler.getConfigs(oTargetDocument).then(function (oConfigs) {
							var oConfigContent = oConfigs["sap.ca.serviceConfigs"];
							assert.ok(_.isEqual(oConfigContent, [{isDefault: true, name: sDataSourceName}]), "Correct content added");
						});
					});
				}).fail(function (oError) {
					assert.ok(false, "Error adding a scaffolding data source to the manifest.json: " + oError);
				});
			});
		});


		//########################### setHCPPlatformBlock / setABAPPlatformBlock tests ###########################
		it("setHCPPlatformBlock - writes the deployment to HCP block to the app descriptor correctly", function () {
			return oFileSystem.getDocument("/projectWithManifestUnderSrc").then(function (oManifestProject) {
				var oContent = {
					uri: "src"
				};
				return oUI5ProjectHandler.setHCPPlatformBlock(oManifestProject, oContent);
			}).then(function() {
				return oFileSystem.getDocument("/projectWithManifestUnderSrc/src/manifest.json");
			}).then(function(oManifestDoc) {
				return oManifestDoc.getContent();
			}).then(function(sManifestContent) {
				var oManifestContent = JSON.parse(sManifestContent);
				expect(oManifestContent).to.have.property("sap.platform.hcp");
				expect(oManifestContent["sap.platform.hcp"]).to.have.property("uri");
				expect(oManifestContent["sap.platform.hcp"].uri).to.equal("src");
				expect(oManifestContent["sap.platform.hcp"]).to.have.property("_version");
				expect(oManifestContent["sap.platform.hcp"]._version).to.equal("1.1.0");
			});
		});

		it("setHCPPlatformBlock - oContent not defined", function () {
			return oFileSystem.getDocument("/projectWithManifestUnderSrc").then(function (oManifestProject) {
				return oUI5ProjectHandler.setHCPPlatformBlock(oManifestProject, undefined);
			}).fail(function (oError) {
				assert.ok(oError, "Success getting error object");
				assert.equal(oError.name, "ContentNotDefined");
			});
		});

		it("setABAPPlatformBlock - writes the deployment to ABAP block to the app descriptor correctly", function() {
			return oFileSystem.getDocument("/projectWithManifestUnderSrc").then(function(oManifestProject) {
				return oUI5ProjectHandler.setABAPPlatformBlock(oManifestProject, {
					uri : "/sap/bc/ui5_ui5/sap/zvevb6/webapp"
				});
			}).then(function() {
				return oFileSystem.getDocument("/projectWithManifestUnderSrc/src/manifest.json");
			}).then(function(oManifestDoc) {
				return oManifestDoc.getContent();
			}).then(function(sManifestContent) {
				var oManifestContent = JSON.parse(sManifestContent);
				expect(oManifestContent).to.have.property("sap.platform.abap");
				expect(oManifestContent["sap.platform.abap"]).to.have.property("uri");
				expect(oManifestContent["sap.platform.abap"].uri).to.equal("/sap/bc/ui5_ui5/sap/zvevb6/webapp");
				expect(oManifestContent["sap.platform.hcp"]).to.have.property("_version");
				expect(oManifestContent["sap.platform.hcp"]._version).to.equal("1.1.0");
			});
		});

		it("setABAPPlatformBlock - oContent not defined", function() {
			return oFileSystem.getDocument("/projectWithManifestUnderSrc").then(function(oManifestProject) {
				return oUI5ProjectHandler.setABAPPlatformBlock(oManifestProject, undefined);
			}).fail(function (oError) {
				assert.ok(oError, "Success getting error object");
				assert.equal(oError.name, "ContentNotDefined");
			});
		});


		//########################### getHandlerFileName tests #####################################

		it("getHandlerFilePath", function() {
			return oFileSystem.getDocument("/proj2Manifest").then(function(oTargetDocument) {
				return oUI5ProjectHandler.getHandlerFileName(oTargetDocument).then(function(sName) {
					assert.equal(sName, "manifest.json");
				});
			});
		});
	});
});