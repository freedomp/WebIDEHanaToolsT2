define({

	onAfterGeneration : function(oEvent) {
		if (oEvent.params.selectedTemplate.getId() === "ui5template.mdWithAttachmentsKapsel" ||
			oEvent.params.selectedTemplate.getId() === "ui5template.mdWithAttachmentsAnnotation") {
			var that = this;
			var sPath = "/" + oEvent.params.model.projectName;

			return this.context.service.filesystem.documentProvider.getDocument(sPath).then(function(oProjectDocument) {
				var oDeploymentSettings = {
					"appname" : "sample",
					"appid" : "com.sap.sample",
					"appdesc" : "a new mobile application",
					"appversion" : "1.0.0",
					"server" : "",
					"port" : ""
				};

				oDeploymentSettings.platform = {
					"ios" : {
						"selected" : true,
						"preferences" : {
							"Fullscreen" : false,
							"Orientation" : "default",
							"EnableViewportScale" : true
						}

					},
					"android" : {
						"selected" : true,
						"preferences" : {
							"Fullscreen" : false,
							"Orientation" : "default",
							"ShowTitle" : true,
							"LogLevel" : "VERBOSE"
						}
					}
				};

				oDeploymentSettings.plugins = {
					"cordova" : {
						"device" : {
							"selected" : true,
							"registry" : "org.apache.cordova.device"
						},
						"network" : {
							"selected" : true,
							"registry" : "org.apache.cordova.network-information"
						},
						"battery" : {
							"selected" : false,
							"registry" : "org.apache.cordova.battery-status"
						},
						"accelerometer" : {
							"selected" : false,
							"registry" : "org.apache.cordova.device-motion"
						},
						"comprass" : {
							"selected" : false,
							"registry" : "org.apache.cordova.device-orientation"
						},
						"geolocation" : {
							"selected" : false,
							"registry" : "org.apache.cordova.geolocation"
						},
						"camera" : {
							"selected" : true,
							"registry" : "org.apache.cordova.camera"
						},
						"capture" : {
							"selected" : false,
							"registry" : "org.apache.cordova.media-capture"
						},
						"media" : {
							"selected" : false,
							"registry" : "org.apache.cordova.media"
						},
						"file" : {
							"selected" : false,
							"registry" : "org.apache.cordova.file"
						},
						"transfer" : {
							"selected" : false,
							"registry" : "org.apache.cordova.file-transfer"
						},
						"dialogs" : {
							"selected" : false,
							"registry" : "org.apache.cordova.dialogs"
						},
						"vibration" : {
							"selected" : false,
							"registry" : "org.apache.cordova.vibration"
						},
						"contacts" : {
							"selected" : false,
							"registry" : "org.apache.cordova.contacts"
						},
						"globalization" : {
							"selected" : false,
							"registry" : "org.apache.cordova.globalization"
						},
						"splashscreen" : {
							"selected" : false,
							"registry" : "org.apache.cordova.splashscreen"
						},
						"inappbrowser" : {
							"selected" : true,
							"registry" : "org.apache.cordova.inappbrowser"
						},
						"console" : {
							"selected" : false,
							"registry" : "org.apache.cordova.console"
						}
					},
					"kapsel" : {
						"logon" : {
							"selected" : true,
							"registry" : "com.sap.mp.cordova.plugins.logon"
						},
						"appupdate" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.appupdate"
						},
						"logger" : {
							"selected" : true,
							"registry" : "com.sap.mp.cordova.plugins.logger"
						},
						"settings" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.settings"
						},
						"push" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.push"
						},
						"encryptedstorage" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.encryptedstorage"
						},
						"authproxy" : {
							"selected" : true,
							"registry" : "com.sap.mp.cordova.plugins.authproxy"
						},
						"barcode" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.barcodescanner"
						},
						"odata" : {
							"selected" : true,
							"registry" : "com.sap.mp.cordova.plugins.odata"
						},
						"e2etrace" : {
							"selected" : false,
							"registry" : "com.sap.mp.cordova.plugins.e2etrace"
						},
						"corelibs" : {
							"selected" : true,
							"registry" : "com.sap.mp.cordova.plugins.corelibs"
						}
					}
				};

				return that.context.service.setting.project.setProjectSettings("hybrid", oDeploymentSettings, oProjectDocument);
			});

		}
	}

});