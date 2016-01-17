define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "ConnectivityComponent_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFakeFileDAO, oFioriODataService, oTemplateService, oDocProvider;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
					oFakeFileDAO = getService('fakeFileDAO');
					oFioriODataService = getService('fioriodata');
					oTemplateService = getService('template');
					oDocProvider = getService('filesystem.documentProvider');
			});
		});

		var sComponentContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';
		var manifestjson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.fiori.appName",
				"type": "application",
				"applicationVersion": {
					"version": "1.2"
				},
				"ach": "PA-FIO",
				"dataSources": {
				},
				"resources": "resources.json"
			},

			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},

			"sap.ui5": {
				"_version": "1.0.0",

				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						},
						"sap.ui.commons": {
							"minVersion": "1.28.0"
						}
					},

					"components": {
						"sap.ui.app.other": {
							"minVersion": "1.1.0"
						}
					}
				}
			}
		};

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		// test#1 - with AppDescriptor, new service
		it("With AppDescriptor - new service", function () {


			var appDescriptorContent = JSON.stringify(manifestjson);

			var oFileStructure = {
				"SomeProject" : {
					"manifest.json" : appDescriptorContent,
					"Component.js" : sComponentContent
				}
			};
			var oModel = {
				componentPath : "/SomeProject",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).then(function() {
						return oFioriODataService.getServiceUrl("/SomeProject", "OData").then(function(sServiceUrl) {
							assert.ok(sServiceUrl === "test/test/test");
						});
					});
				});
			});
		});

		// test#2 - with AppDescriptor, existing service with bOverwrite = false/undefined
		it("With AppDescriptor - existing service - do not overwrite", function () {

			manifestjson["sap.app"].dataSources.test = {a:"ds"};
			var appDescriptorContent = JSON.stringify(manifestjson);

			var oFileStructure = {
				"SomeProject" : {
					"manifest.json" : appDescriptorContent,
					"Component.js" : sComponentContent
				}
			};
			var oModel = {
				componentPath : "/SomeProject",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).fail(function(oError) {
						var message = "This service already exists in the selected project's manifest.json file.\n Select \"Overwrite existing OData service connection\" to continue.";
						assert.ok(oError.message === message);
					});
				});
			});
		});

		// test#3 - with AppDescriptor, existing service with bOverwrite = true
		it("With AppDescriptor - existing service - overwrite", function () {

			manifestjson["sap.app"].dataSources.test = {};
			var appDescriptorContent = JSON.stringify(manifestjson);

			var oFileStructure = {
				"SomeProject" : {
					"manifest.json" : appDescriptorContent,
					"Component.js" : sComponentContent
				}
			};
			var oModel = {
				componentPath : "/SomeProject",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				},
				overwrite : true
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).then(function() {
						return oFioriODataService.getServiceUrl("/SomeProject", "OData").then(function(sServiceUrl) {
							assert.ok(sServiceUrl === "test/test/test");
						});
					});
				});
			});
		});

		// test#4 - with invalid AppDescriptor
		it("With AppDescriptor - invalid JSON", function () {

			var appDescriptorContent = JSON.stringify(manifestjson);
			appDescriptorContent += "test";

			var oFileStructure = {
				"SomeProject1" : {
					"manifest.json" : appDescriptorContent,
					"Component.js" : sComponentContent
				}
			};
			var oModel = {
				componentPath : "/SomeProject1",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).then(function() {
						return oDocProvider.getDocument("/SomeProject/index.html").then(function(oFileDocument) {
							assert.ok(!oFileDocument);
						});
					});
				});
			});
		});

		// test#5 - with configuration.js, existing service with bOverwrite = false/undefined
		it("With configuration.js - existing service - do not overwrite", function () {

			var sConfigurationContent = 'jQuery.sap.declare("a.Configuration");\
				jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");\
				jQuery.sap.require("sap.ca.scfld.md.app.Application");\
\
				sap.ca.scfld.md.ConfigurationBase.extend("a.Configuration", {\
\
					oServiceParams: {\
						"serviceList": [\
							{\
								"name": "ZCLAIMSERVICE_SRV",\
								"serviceUrl": "",\
								"isDefault": true,\
								"masterCollection": ""\
							}\
						]\
					},\
\
					getServiceParams: function() {\
						return this.oServiceParams;\
					},\
\
					getAppConfig: function() {\
						return this.oAppConfig;\
					},\
\
					/**\
					 * @inherit\
					 */\
					getServiceList: function() {\
						return this.oServiceParams.serviceList;\
					}\
\
				});';

			var sComponentWithoutDirectionContent = 'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                         }\
                                     });';

			var oFileStructure = {
				"SomeProject" : {
					"Configuration.js" : sConfigurationContent,
					"Component.js" : sComponentWithoutDirectionContent
				}
			};
			var oModel = {
				componentPath : "/SomeProject",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).fail(function(oError) {
						var message = "A service is already connected to the selected project.\n Select \"Overwrite existing OData service connection\" to continue.";
						assert.ok(oError.message === message);
					});
				});
			});
		});

		// test#6 - with index.html
		it("With index.html", function () {

			var oFileStructure = {
				"SomeProject" : {
					"index.html" : ""
				}
			};
			var oModel = {
				componentPath : "/SomeProject",
				connectionData : {
					serviceName : "test",
					runtimeUrl : "test/test/test"
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function() {
				return oTemplateService.getTemplate("servicecatalog.connectivityComponent").then(function(oTemplate) {
					return oTemplate.onAfterGenerate({}, oModel).then(function() {
						return oDocProvider.getDocument("/SomeProject/index.html").then(function(oFileDocument){
							return oFileDocument.getContent().then(function(oContent){
								assert.ok(oContent);
							});
						});
					});
				});
			});
		});
	});
});
