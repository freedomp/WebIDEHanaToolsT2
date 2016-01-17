define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "MDWithAttachmentsSettings_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var mdWithAttachmentsSettingsService, oFakeFileDAO;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter1/service/Template/config.json"}).then(function () {
				mdWithAttachmentsSettingsService = getService('mdWithAttachmentsSettings');
				oFakeFileDAO = getService('fakeFileDAO');
			});
		});

		var oDeploymentSettings = {
			"hybrid": {
				"appname": "sample",
				"appid": "com.sap.sample",
				"appdesc": "a new mobile application",
				"appversion": "1.0.0",
				"server": "",
				"port": "",
				"platform": {
					"ios": {
						"selected": true,
						"preferences": {
							"Fullscreen": false,
							"Orientation": "default",
							"EnableViewportScale": true
						}
					},
					"android": {
						"selected": true,
						"preferences": {
							"Fullscreen": false,
							"Orientation": "default",
							"ShowTitle": true,
							"LogLevel": "VERBOSE"
						}
					}
				},
				"plugins": {
					"cordova": {
						"device": {
							"selected": true,
							"registry": "org.apache.cordova.device"
						},
						"network": {
							"selected": true,
							"registry": "org.apache.cordova.network-information"
						},
						"battery": {
							"selected": false,
							"registry": "org.apache.cordova.battery-status"
						},
						"accelerometer": {
							"selected": false,
							"registry": "org.apache.cordova.device-motion"
						},
						"comprass": {
							"selected": false,
							"registry": "org.apache.cordova.device-orientation"
						},
						"geolocation": {
							"selected": false,
							"registry": "org.apache.cordova.geolocation"
						},
						"camera": {
							"selected": true,
							"registry": "org.apache.cordova.camera"
						},
						"capture": {
							"selected": false,
							"registry": "org.apache.cordova.media-capture"
						},
						"media": {
							"selected": false,
							"registry": "org.apache.cordova.media"
						},
						"file": {
							"selected": false,
							"registry": "org.apache.cordova.file"
						},
						"transfer": {
							"selected": false,
							"registry": "org.apache.cordova.file-transfer"
						},
						"dialogs": {
							"selected": false,
							"registry": "org.apache.cordova.dialogs"
						},
						"vibration": {
							"selected": false,
							"registry": "org.apache.cordova.vibration"
						},
						"contacts": {
							"selected": false,
							"registry": "org.apache.cordova.contacts"
						},
						"globalization": {
							"selected": false,
							"registry": "org.apache.cordova.globalization"
						},
						"splashscreen": {
							"selected": false,
							"registry": "org.apache.cordova.splashscreen"
						},
						"inappbrowser": {
							"selected": true,
							"registry": "org.apache.cordova.inappbrowser"
						},
						"console": {
							"selected": false,
							"registry": "org.apache.cordova.console"
						}
					},
					"kapsel": {
						"logon": {
							"selected": true,
							"registry": "com.sap.mp.cordova.plugins.logon"
						},
						"appupdate": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.appupdate"
						},
						"logger": {
							"selected": true,
							"registry": "com.sap.mp.cordova.plugins.logger"
						},
						"settings": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.settings"
						},
						"push": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.push"
						},
						"encryptedstorage": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.encryptedstorage"
						},
						"authproxy": {
							"selected": true,
							"registry": "com.sap.mp.cordova.plugins.authproxy"
						},
						"barcode": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.barcodescanner"
						},
						"odata": {
							"selected": true,
							"registry": "com.sap.mp.cordova.plugins.odata"
						},
						"e2etrace": {
							"selected": false,
							"registry": "com.sap.mp.cordova.plugins.e2etrace"
						},
						"corelibs": {
							"selected": true,
							"registry": "com.sap.mp.cordova.plugins.corelibs"
						}
					}
				}
			}
		};

		var oFileStructure = {
			"SomeProject" : {}
		};

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		// test#1 - with id === ui5template.mdWithAttachmentsKapsel
		it("expected id", function() {

			var oEvent = {
				params : {
					selectedTemplate : {
						getId : function(){
							return "ui5template.mdWithAttachmentsKapsel";
						}
					},
					model : {
						projectName : "SomeProject"
					}
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return mdWithAttachmentsSettingsService.onAfterGeneration(oEvent).then(function(oResult){
					return oResult.getContent().then(function(sContent){
						assert.ok(JSON.stringify(oDeploymentSettings, null, 2) === sContent);
					});
				});
			});
		});

		// test#2 - with id !== ui5template.mdWithAttachmentsKapsel
		it("unexpected id", function() {

			oFileStructure = {
				"SomeProject" : {}
			};

			var oEvent = {
				params : {
					selectedTemplate : {
						getId : function(){
							return "ui5template.mdWithAttachmentsKapsel1";
						}
					},
					model : {
						projectName : "SomeProject"
					}
				}
			};

			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return mdWithAttachmentsSettingsService.onAfterGeneration(oEvent).then(function(oResult){
					assert.ok(!oResult);
				});
			});
		});

	});
});
