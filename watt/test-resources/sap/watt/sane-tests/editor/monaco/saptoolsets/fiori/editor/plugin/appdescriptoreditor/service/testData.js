define([], function() {
	return {
		"manifest": {
			"_version": "1.2.0",
			"start_url": "index.html",
			"sap.app": {
				"_version": "1.2.0",
				"id": "sap.fiori.appName",
				"type": "application",
				"i18n": "",
				"applicationVersion": {
					"version": "1.2.2"
				},
				"embeds": ["mycomponent1", "subpath/mycomponent2"],
				"embeddedBy": "../../",
				"title": "{{title}}",
				"description": "{{description}}",
				"tags": {
					"keywords": ["{{keyWord1}}", "{{keyWord2}}"]
				},
				"ach": "PA-FIO",
				"dataSources": {
					"equipment": {
						"uri": "/sap/opu/odata/snce/PO_S_SRV;v=2/",
						"type": "OData",
						"settings": {
							"odataVersion": "2.0",
							"annotations": ["equipmentanno"],
							"localUri": "model/metadata.xml"
						}
					},
					"equipment2": {
						"uri": "/sap/opu/odata/snce/PO_S_SRV;v=3/",
						"type": "OData",
						"settings": {
							"odataVersion": "4.0",
							"localUri": "model/newmetadata.xml"
						}
					},
					"equipmentanno": {
						"uri": "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
						"type": "ODataAnnotation",
						"settings": {
							"localUri": "model/annotations.xml"
						}
					}
				},
				"cdsViews": ["VIEW1", "VIEW2"],
				"resources": "resources.json",
				"offline": true,
				"sourceTemplate": {
					"id": "sap.ui.ui5-template-plugin.1worklist",
					"version": "1.0.0"
				},
				"destination": {
					"name": "SAP_ERP_FIN"
				},
				"openSourceComponents": [{
					"name": "D3.js",
					"packagedWithMySelf": false
				}],
				"crossNavigation": {
					"scopes": {
						"sapSite": {
							"value": "123"
						}
					},
					"inbounds": {
						"contactCreate": {
							"semanticObject": "Contact",
							"action": "create",
							"icon": "sap-icon://add-contact",
							"title": "{{title}}",
							"indicatorDataSource": {
								"dataSource": "ppm",
								"path": "TaskListSet/$count",
								"refresh": "58"
							},
							"deviceTypes": {
								"desktop": true,
								"tablet": true,
								"phone": false
							},
							"signature": {
								"parameters": {
									"id": {
										"required": true
									},
									"ContactName": {
										"defaultValue": {
											"value": "anonymous"
										},
										"required": false
									},
									"Gender": {
										"filter": {
											"value": "(male)|(female)",
											"format": "regexp"
										},
										"required": true
									}
								},
								"additionalParameters": "allowed"
							},
							"subTitle": "Tile"
						},
						"contactDisplay": {
							"semanticObject": "Contact",
							"action": "display",
							"signature": {
								"parameters": {
									"id": {
										"required": true
									},
									"Language": {
										"filter": {
											"value": "EN"
										},
										"required": true
									},
									"SomeValue": {
										"filter": {
											"value": "4711"
										}
									},
									"GLAccount": {
										"defaultValue": {
											"value": "1000"
										},
										"filter": {
											"value": "(1000)|(2000)",
											"format": "regexp"
										}
									}
								}
							},
							"indicatorDataSource": {
								"refresh": "9"
							}
						},
						"contactDisplayAlt": {
							"semanticObject": "Contact",
							"action": "display",
							"signature": {
								"parameters": {
									"GLAccount": {
										"defaultValue": {
											"value": "UserDefault.GLAccount",
											"format": "reference"
										},
										"filter": {
											"value": "\\d+",
											"format": "regexp"
										},
										"required": true
									},
									"SomePar": {
										"filter": {
											"value": "UserDefault.CostCenter",
											"format": "reference"
										},
										"required": true
									}
								}
							}
						},
						"intent1": {
							"signature": {
								"parameters": {
									"name1": {
										"defaultValue": {
											"value": "",
											"format": "plain"
										},
										"filter": {
											"value": "",
											"format": "plain"
										}
									},
									"name2": {
										"defaultValue": {
											"value": "",
											"format": "plain"
										},
										"filter": {
											"value": "",
											"format": "plain"
										}
									}
								},
								"additionalParameters": "allowed"
							}
						}
					},
					"outbounds": {
						"addressDisplay": {
							"semanticObject": "Address",
							"action": "display",
							"parameters": {
								"companyName": {}
							}
						},
						"companyDisplay": {
							"semanticObject": "Company",
							"action": "display",
							"parameters": {
								"companyName": {}
							}
						}
					}
				}
			},
			"sap.ui": {
				"_version": "1.2.0",
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://add-contact",
					"favIcon": "icon/F1373_Approve_Purchase_Orders.ico",
					"phone": "icon/launchicon/57_iPhone_Desktop_Launch.png",
					"phone@2": "icon/launchicon/114_iPhone-Retina_Web_Clip.png",
					"tablet": "icon/launchicon/72_iPad_Desktop_Launch.png",
					"tablet@2": "icon/launchicon/144_iPad_Retina_Web_Clip.png"
				},
				"deviceTypes": {
					"desktop": true,
					"tablet": true,
					"phone": false
				},
				"supportedThemes": ["sap_hcb", "sap_bluecrystal"]
			},
			"sap.ui5": {
				"_version": "1.1.0",
				"resources": {
					"js": [{
						"uri": "component.js"
					}],
					"css": [{
						"uri": "component.css",
						"id": "componentcss"
					}]
				},
				"dependencies": {
					"minUI5Version": "1.30.0",
					"libs": {
						"sap.m": {
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
					"equipment": {
						"dataSource": "equipment",
						"settings": {}
					}
				},
				"rootView": "sap.ui.test.view.Main",
				"handleValidation": true,
				"config": {
					"configuration": "http://vesapui5.dhcp.wdf.sap.corp:1080/trac/sapui5/wiki/Documentation/AdvancedTopics/Components/Configuration"
				},
				"routing": {
					"config": {
						"routerClass": "sap.m.routing.Router",
						"viewType": "XML",
						"viewPath": "ns.view",
						"controlId": "app",
						"controlAggregation": "pages",
						"bypassed": {
							"target": ["notFound", "objectNotFound"]
						},
						"viewLevel": "5",
						"transition": "flip",
						"clearAggregation": "True",
						"targetParent": "myTarget",
						"parent": "myParent"
					},
					"routes": [{
						"pattern": "",
						"name": "worklist",
						"target": ["worklist"]
					}, {
						"pattern": "CarrierCollection/{objectId}",
						"name": "object",
						"target": ["object"],
						"greedy": true
					}],
					"targets": {
						"worklist": {
							"viewName": "Worklist",
							"viewId": "worklist",
							"viewLevel": 1,
							"controlAggregation": "sap",
							"controlId": "newApp",
							"viewPath": "ns.view",
							"viewType": "JSON",
							"transition": "fade",
							"parent": "myParent",
							"clearAggregation": "true",
							"targetParent": "myTarget"
						},
						"object": {
							"viewName": "Object",
							"viewId": "object",
							"viewLevel": 2,
							"viewType": "XML",
							"transition": "slide",
							"clearAggregation": "true"
						},
						"objectNotFound": {
							"viewName": "ObjectNotFound",
							"viewId": "objectNotFound",
							"viewType": "XML",
							"transition": "slide",
							"clearAggregation": "true"
						},
						"notFound": {
							"viewName": "NotFound",
							"viewId": "notFound",
							"viewType": "XML",
							"transition": "slide",
							"clearAggregation": "true"
						}
					}
				},
				"extends": {
					"component": "sap.fiori.otherApp",
					"minVersion": "0.8.15",
					"extensions": {}
				},
				"contentDensities": {
					"compact": true,
					"cozy": false
				}
			},
			"sap.platform.abap": {
				"_version": "1.2.0",
				"uri": "/sap/bc/ui5_ui5/sap/appName",
				"uriNwbc": ""
			},
			"sap.platform.hcp": {
				"_version": "1.2.0",
				"uri": "",
				"uriNwbc": ""
			},
			"sap.fiori": {
				"_version": "1.1.0",
				"registrationIds": ["F1234"],
				"archeType": "transactional"
			},
			"sap.mobile": {
				"_version": "1.1.0",
				"definingRequests": {}
			},
			"sap.flp": {
				"_version": "1.1.0",
				"type": "application",
				"config": {}
			},
			"sap.ui.generic.app": {},
			"sap.ovp": {
				"_version": "1.1.0",
				"cards": []
			},
			"sap.ui.smartbusiness.app": {},
			"sap.wda": {
				"_version": "1.1.0",
				"applicationId": ""
			},
			"sap.gui": {
				"_version": "1.1.0",
				"transaction": ""
			},
			"sap.cloud.portal": {},
			"sap.apf": {
				"_version": "1.1.0"
			}
		}
	};
});