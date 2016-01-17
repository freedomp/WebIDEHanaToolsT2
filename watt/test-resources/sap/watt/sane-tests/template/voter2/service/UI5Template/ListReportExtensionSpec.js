define(["STF"] ,
	function(STF) {
		"use strict";

		var suiteName = "ListReportExtension_Integration", getService = STF.getServicePartial(suiteName);
		describe(suiteName, function () {
			var oTemplateService, oFakeFileDAO, oFileSystem;

			var aStubs = [];

			before(function () {
				return STF.startWebIde(suiteName, {config: "template/config.json"})
					.then(function () {
						oTemplateService = getService('template');
						oFakeFileDAO = getService('fakeFileDAO');
						oFileSystem = getService('filesystem.documentProvider');
					}).then(createWorkspaceStructure);
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

			var createWorkspaceStructure = function () {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/manifest.json"))).then(function (oManifestFile) {
					var oManifestWithoutListReport = removeListReportFromManifest(JSON.parse(JSON.stringify(oManifestFile)));
					var oManifestWithExtension = addExtensionPointToManifest(JSON.parse(JSON.stringify(oManifestFile)));
					var sComponent = 'jQuery.sap.declare("smart.Component");\
								sap.ui.getCore().loadLibrary("sap.ui.generic.app");\
								jQuery.sap.require("sap.ui.generic.app.AppComponent");\
																						\
								sap.ui.generic.app.AppComponent.extend("smart.Component", {\
									metadata: {\
										"manifest": "json"\
									}\
								})';

					return oFakeFileDAO.setContent({
						"project1": {
							"webapp": {
								"Component.js": sComponent,
								"manifest.json": JSON.stringify(oManifestFile)
							}
						},
						"project2": {
							"webapp": {
								"Component.js": sComponent,
								"manifest.json": JSON.stringify(oManifestWithExtension)
							}
						},
						"project3": {
							"webapp": {
								"Component.js": sComponent,
								"manifest.json": JSON.stringify(oManifestWithoutListReport)
							}
						}
					});
				});
			};

			var removeListReportFromManifest = function (oManifestFile) {
				oManifestFile["sap.ui.generic.app"].pages[0].component.name = "";
				return oManifestFile;
			};

			var addExtensionPointToManifest = function (oManifestFile) {
				oManifestFile["sap.ui5"]["extends"]["extensions"] = {
					"sap.ui.viewExtensions": {
						"sap.suite.ui.generic.template.ListReport.view.ListReport": {
							"SmartFilterBarControlConfigurationExtension|SEPMRA_I_ProductWithDraft": {}
						}
					}
				};
				return oManifestFile;
			};

			it("Test List Report Extension - onBeforeTemplateGenerate - Extension does not exist, bOverwrite is false", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.listreportextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument": oTargetDocument
						};
						return oTemplate.onBeforeTemplateGenerate({}, oModel).then(function (aResult) {
							var sManifestPath = aResult[1].selectedDocument.getEntity().getFullPath() + "/webapp/manifest.json";
							return oFileSystem.getDocument(sManifestPath).then(function (oManifest) {
								return oManifest.getContent().then(function (sContent) {
									var oContent = JSON.parse(sContent);
									var oViewExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ListReport.view.ListReport"]["SmartFilterBarControlConfigurationExtension|SEPMRA_I_ProductWithDraft"];
									var oViewExpectedResult = {
										"className": "sap.ui.core.Fragment",
										"fragmentName": "smart.ext.fragment.customfilter",
										"type": "XML"
									};
									var oControllerExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.controllerExtensions"]["sap.suite.ui.generic.template.ListReport.view.ListReport"];
									var oControllerExpectedResult = {
										"controllerName": "smart.ext.controller.customfilter"
									};
									assert.equal(aResult[1].namespace, "smart", "The namespace got successfully");
									assert.equal(JSON.stringify(oViewExtensionEntry), JSON.stringify(oViewExpectedResult), "The view extension entry was created successfully");
									assert.equal(JSON.stringify(oControllerExtensionEntry), JSON.stringify(oControllerExpectedResult), "The controller extension entry was created successfully");
								});
							});
						});
					});
				});
			});

			it("Test List Report Extension - onBeforeTemplateGenerate - Extension exists, bOverwrite is false", function () {
				return oFileSystem.getDocument("/project2").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.listreportextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument": oTargetDocument
						};
						return oTemplate.onBeforeTemplateGenerate({}, oModel).fail(function (oError) {
							assert.ok(oError, "The error message got successfully");
						});
					});
				});
			});

			it("Test List Report Extension - onBeforeTemplateGenerate - Extension exists, bOverwrite is true", function () {
				return oFileSystem.getDocument("/project2").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.listreportextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument": oTargetDocument,
							"overwrite" : true
						};
						return oTemplate.onBeforeTemplateGenerate({}, oModel).then(function (aResult) {
							var sManifestPath = aResult[1].selectedDocument.getEntity().getFullPath() + "/webapp/manifest.json";
							return oFileSystem.getDocument(sManifestPath).then(function (oManifest) {
								return oManifest.getContent().then(function (sContent) {
									var oContent = JSON.parse(sContent);
									var oViewExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ListReport.view.ListReport"]["SmartFilterBarControlConfigurationExtension|SEPMRA_I_ProductWithDraft"];
									var oViewExpectedResult = {
										"className": "sap.ui.core.Fragment",
										"fragmentName": "smart.ext.fragment.customfilter",
										"type": "XML"
									};
									var oControllerExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.controllerExtensions"]["sap.suite.ui.generic.template.ListReport.view.ListReport"];
									var oControllerExpectedResult = {
										"controllerName": "smart.ext.controller.customfilter"
									};
									assert.equal(aResult[1].namespace, "smart", "The namespace got successfully");
									assert.equal(JSON.stringify(oViewExtensionEntry), JSON.stringify(oViewExpectedResult), "The view extension entry was created successfully");
									assert.equal(JSON.stringify(oControllerExtensionEntry), JSON.stringify(oControllerExpectedResult), "The controller extension entry was created successfully");
								});
							});
						});
					});
				});
			});

			it("Test List Report Extension - customValidation - expected true", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.listreportextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument" : oTargetDocument
						};
						return oTemplate.customValidation(oModel).then(function () {
							assert.ok(true, "customValidation is true");
						});
					});
				});
			});

			it("Test List Report Extension - customValidation - expected false", function () {
				return oFileSystem.getDocument("/project3").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.listreportextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument" : oTargetDocument
						};
						return oTemplate.customValidation(oModel).fail(function () {
							assert.ok(true, "customValidation is false");
						});
					});
				});
			});
		});
	});