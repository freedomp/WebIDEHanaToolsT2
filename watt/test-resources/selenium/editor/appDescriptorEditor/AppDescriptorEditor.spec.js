'use strict';

var driverFactory = require('../../utilities/driverFactory'),
	test = require('selenium-webdriver/testing'),
	webdriver = require('selenium-webdriver'),
	assert = require('selenium-webdriver/testing/assert'),
	remote = require('selenium-webdriver/remote'),
	WebIDE = require('../../pageobjects/WebIDE'),
	configuration = require('../Configuration.js'),
	HcpLoginPage = require('../../pageobjects/HcpLoginPage'),
	RepositoryBrowser = require('../../pageobjects/RepositoryBrowser'),
	AppDescriptorMultiEditor = require('../../pageobjects/AppDescriptorEditor/AppDescriptorMultiEditor'),
	AppDescriptorCodeEditor = require('../../pageobjects/AppDescriptorEditor/AppDescriptorCodeEditor'),
	AppDescriptorGraphicalEditor = require('../../pageobjects/AppDescriptorEditor/AppDescriptorGrpahicalEditor'),
	AppDescriptorGraphicalEditorSettingsTab = require('../../pageobjects/AppDescriptorEditor/AppDescriptorGraphicalEditorSettingsTab'),
	AppDescriptorGraphicalEditorNavigationTab = require('../../pageobjects/AppDescriptorEditor/AppDescriptorGraphicalEditorNavigationTab'),
	Toolbar = require('../../pageobjects/Toolbar'),
	utils = require('../../pageobjects/Utils'),
	path = require('path');

var By = webdriver.By,
	until = webdriver.until,
	promise = webdriver.promise;

var oManifestContent = {
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
						"additionalParameters": "ignored"
					},
					"subtitle": "Tile"
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
			"navigation": "http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/#docs/guide/3d18f20bd2294228acb6910d8e8a5fb5.html"
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
};

describe.skip('App_Descriptor_Editor_Test', function() {
	this.timeout(configuration.startupTimeout);
	var driver;
	var webIDE;
	var hcpLoginPage;
	var repositoryBrowser;
	var appDescriptorMultiEditor;
	var appDescriptorCodeEditor;
	var appDescriptorGraphicalEditor;
	var appDescriptorGraphicalEditorSettingsTab;
	var appDescriptorGraphicalEditorNavigationTab;
	var toolbar;

	beforeEach(function() {
		driver = driverFactory.createDriver();
		driver.setFileDetector(new remote.FileDetector());
		webIDE = new WebIDE(driver, By, until, configuration);

		repositoryBrowser = new RepositoryBrowser(driver, By, until, configuration);
		appDescriptorMultiEditor = new AppDescriptorMultiEditor(driver, By, until, configuration);
		appDescriptorCodeEditor = new AppDescriptorCodeEditor(driver, By, until, configuration);
		appDescriptorGraphicalEditor = new AppDescriptorGraphicalEditor(driver, By, until, configuration);
		appDescriptorGraphicalEditorSettingsTab = new AppDescriptorGraphicalEditorSettingsTab(driver, By, until, configuration);
		appDescriptorGraphicalEditorNavigationTab = new AppDescriptorGraphicalEditorNavigationTab(driver, By, until, configuration);
		toolbar = new Toolbar(driver, By, until, configuration);
	});

	afterEach(function() {
		return utils.deleteProjectFromWorkspace(driver, "abc123").thenFinally(function() {
			return driver.sleep(5000).then(function() {
				return driver.quit();
			});
		});
	});

	it('open appdescriptor', function() {
		var that = this;
		driver.get(configuration.url);

		//TODO uncomment before submit
		hcpLoginPage = new HcpLoginPage(driver);
		hcpLoginPage.setUserName(configuration.getParam(configuration.KEYS.USER_NAME));
		hcpLoginPage.setPassword(configuration.getParam(configuration.KEYS.PASSWORD));
		hcpLoginPage.login();

		console.log("click on Development Perspective");
		return webIDE.clickDevelopmentPerspective().then(function() {
			//TODO import or create project - for now we assume that project with manifest.json exists
			console.log("before import");
			var sPath = path.resolve(__dirname, 'zip/abc123.zip');
			console.log("zip file path: " + sPath);
			return webIDE.importZip(sPath);
		}).then(function() {
			console.log("open manifest.json");
			return repositoryBrowser.openFile("abc123/manifest.json");
		}).then(function() {
			console.log("settings text to code editor");
			var sManifest = JSON.stringify(oManifestContent);
			return appDescriptorCodeEditor.setText(sManifest);
		}).then(function() {
			console.log("manifest.json updated");
			console.log("open Descriptor tab");
			return appDescriptorMultiEditor.clickOnGraphicalEditorTab();
		}).then(function() {
			console.log("Descriptor tab opened");
			return appDescriptorGraphicalEditorSettingsTab.getId();
		}).then(function(sId) {
			assert(sId === "sap.fiori.appName").isTrue();
			return;
		}).then(function() {
			console.log("clear setting tab id field");
			return appDescriptorGraphicalEditorSettingsTab.clearId();
		}).then(function() {
			console.log("update setting tab id field");
			return appDescriptorGraphicalEditorSettingsTab.setId("newValue");
		}).then(function() {
			console.log("press Enter in Id field");
			return appDescriptorGraphicalEditorSettingsTab.pressEnterOnId();
		}).then(function() {
			console.log("open Code editor tab");
			return appDescriptorMultiEditor.clickOnCodeEditorTab();
		}).then(function() {
			console.log("get manifest.json content");
			return appDescriptorCodeEditor.getText();
		}).then(function(sManifestNew) {
			//Get Id field value
			var oManifest = JSON.parse(sManifestNew);
			console.log("id value is " + oManifest["sap.app"].id);
			assert(oManifest["sap.app"].id === "newValue").isTrue();
			console.log("Press save");
			return toolbar.pressButton("Save (Ctrl+S)");
		}).then(function() {
			console.log("Press save success");
		}).thenCatch(function(oError) {
			console.log(oError);
			console.log("Save screenshot");
			return driver.saveScreenshot("open_appdescriptor.png", that).thenFinally(function(){
				return assert(false).isTrue();
			});
		});
	});
});