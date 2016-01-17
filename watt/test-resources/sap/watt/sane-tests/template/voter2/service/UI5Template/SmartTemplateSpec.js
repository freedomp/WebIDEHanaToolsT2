define(["STF", "sap/watt/saptoolsets/fiori/project/plugin/ui5template/smartTemplate/SmartTemplate", "sap/watt/lib/jszip/jszip-shim"] ,
	function(STF, oSmartTemplate, JSZip) {
		"use strict";

		var suiteName = "SmartTemplate_Integration", getService = STF.getServicePartial(suiteName);
		describe(suiteName, function () {
			var oTemplateService, oFakeEnvironment, oWebIDEWindow, smartDocProvider;

			var aStubs = [];

			before(function () {
				return STF.startWebIde(suiteName, {config: "template/config.json"})
					.then(function (oWindows) {
						oWebIDEWindow = oWindows;
						oTemplateService = getService('template');
						oWebIDEWindow.jQuery.sap.require("sap.ui.thirdparty.handlebars");
						oFakeEnvironment = getService('fakeEnvironment');
						smartDocProvider = getService('smartDocProvider');
					});
			});

			afterEach(function () {
				aStubs.forEach(function (stub) {
					stub.restore();
				});
				aStubs = [];

			});

			after(function () {
				STF.shutdownWebIde(suiteName);
			});

			it("Test Smart Template - project namespace", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					var oZip = new JSZip();
					return oTemplate.onBeforeTemplateGenerate(oZip, {
						smartTemplate: {parameters: {ProjectNamespace: {}}}, projectName: "nameOfProject"
					})
						.then(function (aResult) {
							assert.equal(aResult[1].smartTemplate.parameters.ProjectNamespace.value, "nameOfProject",
								"If the user has not provided a value for the namespace, it should be equal to project name");
						});
				});
			});

			it("Test Smart Template - project namespace", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					var oZip = new JSZip();
					return oTemplate.onBeforeTemplateGenerate(oZip, {smartTemplate: {parameters: {ProjectNamespace: {value: "namespace"}}}})
						.then(function (aResult) {
							assert.equal(aResult[1].smartTemplate.parameters.ProjectNamespace.value, "namespace",
								"If the user has provided a value for the namespace, it should be equal to the provided value");
						});
				});
			});

			it("Test Smart Template - removing files if model.generate is undefined", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					var sContent = '{"test": true}';
					var oZip = new JSZip();
					oZip.file('webapp/annotations/annotations.xml.tmpl', sContent);
					return oTemplate.onBeforeTemplateGenerate(oZip, {smartTemplate: {parameters: {ProjectNamespace: {value: "namespace"}}}})
						.then(function (aResult) {
							assert.equal(aResult[0].file('webapp/annotations/annotations.xml.tmpl'), null,
								"If the model.generate is undefined the webapp/annotations/annotations.xml.tmpl file should removed");
							assert.equal(aResult[0].file('webapp/annotations'), null,
								"If the model.generate is undefined the webapp/annotations folder should removed");
						});
				});
			});

			it("Test Smart Template - removing files if model.generate is true", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					var sContent = '{"test": true}';
					var oZip = new JSZip();
					oZip.file('webapp/annotations/annotations.xml.tmpl', sContent);
					return oTemplate.onBeforeTemplateGenerate(oZip, {
						smartTemplate: {parameters: {ProjectNamespace: {value: "namespace"}}}, generate: true
					})
						.then(function (aResult) {
							assert.equal(aResult[0].file('webapp/annotations/annotations.xml.tmpl').asText(), '{"test": true}',
								"If the model.generate is true the webapp/annotations/annotations.xml.tmpl file should not removed");
						});
				});
			});

			it("Test Smart Template - configWizardSteps", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					return oTemplate.configWizardSteps().then(function (aSteps) {
						assert.equal(aSteps.length, 3, "Smart Template  Template should configure three custom steps");
						assert.equal(aSteps[0].getOptional(), undefined, "In Smart Template  the service catalog step is mandatory");
					});
				});
			});

			it("Test Smart Template - onBeforeTemplateCustomizationLoaded - internal environment", function () {
				return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, {"internal": true}).then(function (stub) {
					aStubs.push(stub);
					return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
						return smartDocProvider.getSmartDocByTemplate(oTemplate).then(function (oSmartDoc) {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oSmartDoc);
							return oTemplate.onBeforeTemplateCustomizationLoaded({}, oModel).then(function (aResult) {
								assert.equal(aResult[1].oData.smartTemplate.forms[0].groups.length, 1, "In internal environment the model.json should not changed");
								assert.equal(aResult[1].oData.smartTemplate.forms[0].groups[0].parameters.length, 2, "In internal environment the model.json should not changed");
							});
						});
					});
				});
			});

			it("Test Smart Template - onBeforeTemplateCustomizationLoaded - external environment", function () {
				return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, {"internal": false}).then(function (stub) {
					aStubs.push(stub);
					return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
						return smartDocProvider.getSmartDocByTemplate(oTemplate).then(function (oSmartDoc) {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oSmartDoc);
							return oTemplate.onBeforeTemplateCustomizationLoaded({}, oModel).then(function (aResult) {
								assert.equal(aResult[1].oData.smartTemplate.forms[0].groups.length, 1, "In external environment the model.json should changed");
								assert.equal(aResult[1].oData.smartTemplate.forms[0].groups[0].parameters.length, 2, "In external environment the model.json should changed");
							});
						});
					});
				});
			});

			it("Test Smart Template - onAfterGenerate - internal environment", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					return smartDocProvider.getSmartDocByTemplate(oTemplate).then(function (oSmartDoc) {
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oSmartDoc);
						oModel.connectionData = {};
						oModel.neoapp = {};
						oModel.neoapp.destinations = [];
						oModel.mode = {
							internal: oWebIDEWindow.sap.watt.getEnv("internal")
						};
						var aPromises = [];
						aPromises[0] = Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/manifest.json")));
						aPromises[1] = Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/pages_i18n.properties")));
						return Q.all(aPromises).spread(function (oManifestFile, sPropertiesFile) {
							var sManifestContent = JSON.stringify(oManifestFile);
							var oZip = new JSZip();
							oZip.file("webapp/manifest.json", sManifestContent);
							oZip.file("webapp/i18n/pages_i18n.properties", sPropertiesFile);
							oZip.file("webapp/pom.xml", "");
							oZip.folder("webapp/WEB-INF");
							return oTemplate.onAfterGenerate(oZip, oModel).then(function (aResult) {
								assert.ok(aResult[0].folder('webapp/i18n/ListReport'), "ListReport folder should created in the i18n folder");
								assert.ok(aResult[0].folder('webapp/i18n/ObjectPage'), "ObjectPage folder should created in the i18n folder");
								assert.ok(aResult[0].folder('webapp/i18n/ObjectPage1'), "ObjectPage folder should created in the i18n folder");
								assert.equal(aResult[0].file("webapp/i18n/pages_i18n.properties"), null, "webapp/i18n/pages_i18n.properties file should removed");
								assert.ok(aResult[0].file('webapp/pom.xml'), "pom.xml should exists in internal environment");
								assert.ok(aResult[0].folder('webapp/WEB-INF'), "WEB-INF should exists in internal environment");
								assert.equal(aResult[1].neoapp.destinations.length, 5, "5 destinations should added to the neoapp");
							});
						});
					});
				});
			});

			it("Test Smart Template - onAfterGenerate - external environment", function () {
				return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, {"internal": false}).then(function (stub) {
					aStubs.push(stub);
					return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
						return smartDocProvider.getSmartDocByTemplate(oTemplate).then(function (oSmartDoc) {
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oSmartDoc);
							oModel.connectionData = {};
							oModel.neoapp = {};
							oModel.neoapp.destinations = [];
							oModel.mode = {
								internal: oWebIDEWindow.sap.watt.getEnv("internal")
							};
							var aPromises = [];
							aPromises[0] = Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/manifest.json")));
							aPromises[1] = Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/pages_i18n.properties")));
							return Q.all(aPromises).spread(function (oManifestFile, sPropertiesFile) {
								var sManifestContent = JSON.stringify(oManifestFile);
								var oZip = new JSZip();
								oZip.file("webapp/manifest.json", sManifestContent);
								oZip.file("webapp/i18n/pages_i18n.properties", sPropertiesFile);
								oZip.file("pom.xml", "");
								oZip.file("webapp/WEB-INF/web.xml");
								return oTemplate.onAfterGenerate(oZip, oModel).then(function (aResult) {
									assert.ok(aResult[0].folder('webapp/i18n/ListReport'), "ListReport folder should created in the i18n folder");
									assert.ok(aResult[0].folder('webapp/i18n/ObjectPage'), "ObjectPage folder should created in the i18n folder");
									assert.ok(aResult[0].folder('webapp/i18n/ObjectPage1'), "ObjectPage folder should created in the i18n folder");
									assert.equal(aResult[0].file("webapp/i18n/pages_i18n.properties"), null, "webapp/i18n/pages_i18n.properties file should removed");
									assert.equal(aResult[0].file('pom.xml'), null, "pom.xml should removed in external environment");
									assert.equal(aResult[0].file('webapp/WEB-INF/web.xml'), null, "WEB-INF should removed in external environment");
									assert.equal(aResult[1].neoapp.destinations.length, 5, "5 destinations should added to the neoapp");
								});
							});
						});
					});
				});
			});

			it("Test Smart Template - validateOnSelection", function () {
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function (oTemplate) {
					oTemplate.validateOnSelection().then(function (result) {
						assert.equal(result, true, "Smart Template is validateOnSelection ");
					});
				});
			});

			it("Test Smart Template - addNeoDestinations with connection data destination ", function () {

				var model = {
					"neoapp": {
						"destinations": []
					},
					"connectionData": {
						"destination": {
							"name": "test1"
						}
					}
				};

				model.mode = {
					internal: oWebIDEWindow.sap.watt.getEnv("internal")
				};

				oSmartTemplate.addNeoDestinations(model);
				assert.equal(model.neoapp.destinations.length, 6, "Smart Template neo app desitnation added successfully");
			});

			it("Test Smart Template - addNeoDestinations without connection data destination ", function () {

				var model = {
					"neoapp": {
						"destinations": []
					},
					"connectionData": {}
				};

				model.mode = {
					internal: oWebIDEWindow.sap.watt.getEnv("internal")
				};

				oSmartTemplate.addNeoDestinations(model);
				assert.equal(model.neoapp.destinations.length, 5, "Smart Template neo app desitnation added successfully");
			});

			it("Test Smart Template - addNeoDestinations internal environment", function () {
				return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, {"internal": true}).then(function (stub) {
					aStubs.push(stub);

					var model = {
						"neoapp": {
							"destinations": []
						},
						"connectionData": {}
					};

					model.mode = {
						internal: oWebIDEWindow.sap.watt.getEnv("internal")
					};

					oSmartTemplate.addNeoDestinations(model);
					assert.equal(model.neoapp.destinations[0].target.version, "snapshot", "In internal environment UI5 version should be snapshot");
					assert.equal(model.neoapp.destinations[1].target.version, "snapshot", "In internal environment UI5 version should be snapshot");
					assert.equal(model.neoapp.destinations[3].target.version, "snapshot", "In internal environment UI5 version should be snapshot");
				});
			});

			it("Test Smart Template - addNeoDestinations external environment", function () {
				return oFakeEnvironment.fakeEnv(oWebIDEWindow.sap.watt, {"internal": false}).then(function (stub) {
					aStubs.push(stub);

					var model = {
						"neoapp": {
							"destinations": []
						},
						"connectionData": {}
					};

					model.mode = {
						internal: oWebIDEWindow.sap.watt.getEnv("internal")
					};

					oSmartTemplate.addNeoDestinations(model);
					assert.equal(model.neoapp.destinations[0].target.version, "1.32.4", "In external environment UI5 version should be the latest");
					assert.equal(model.neoapp.destinations[1].target.version, "1.32.4", "In external environment UI5 version should be the latest");
					assert.equal(model.neoapp.destinations[3].target.version, "1.32.4", "In external environment UI5 version should be the latest");
				});
			});
		});
	});