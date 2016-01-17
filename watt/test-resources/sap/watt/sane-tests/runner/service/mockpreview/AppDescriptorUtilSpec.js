define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "appDescriptorUtil";

	describe("Mock Preview - App Descriptor", function() {
		var oAppDescriptorService;
		var oFakeFileDAO;
		var oFileService;
		var sComponentContent =
			'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';
		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/mockpreview/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oAppDescriptorService = STF.getService(suiteName, "appdescriptorutil");
				oFileService = STF.getService(suiteName, "filesystem.documentProvider");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("With AppDescriptor",
			function() {
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
							"purchase": {
								"uri": "/sap/opu/odata/snce/PO_S_SRV;v=2/",
								"type": "OData",
								"settings": {
									"odataVersion": "2.0",
									"annotations": ["mainAnno"],
									"localUri": "model/metadata.xml"
								}
							},
							"mainAnno": {
								"uri": "/sap/bc/bsp/sap/ais_draft_union/annotation.xml/",
								"type": "ODataAnnotation",
								"settings": {
									"localUri": "model/annotations.xml"
								}
							}
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

				var appDescriptorContent = JSON.stringify(manifestjson);

				var oFileStructure = {
					"SomeProject": {
						"manifest.json": appDescriptorContent,
						"Component.js": sComponentContent
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/SomeProject").then(function(oDocument) {
						return oAppDescriptorService.getMetadataPath(oDocument).then(function(sMetadataUrl) {
							expect(sMetadataUrl).to.equal("model/metadata.xml");
							return oAppDescriptorService.getAnnotations(oDocument).then(function(aAnnotations) {
								expect(aAnnotations.length).to.equal(1);
								expect(aAnnotations[0].annotationUri).to.equal("/sap/bc/bsp/sap/ais_draft_union/annotation.xml/");
								expect(aAnnotations[0].annotationLocalUri).to.equal("model/annotations.xml");
							});
						});
					});

				});
			});

		it("No AppDescriptor file",
			function() {
				var oFileStructure = {
					"SomeProject1": {
						"index.html": "some content"
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/SomeProject1").then(function(oDocument) {
						return oAppDescriptorService.getMetadataPath(oDocument).then(function(sMetadataUrl) {
							expect(sMetadataUrl).to.equal(undefined);
							return oAppDescriptorService.getAnnotations(oDocument).then(function(aAnnotations) {
								expect(aAnnotations.length).to.equal(0);
							});
						});
					});
				});
			});

		it("With AppDescriptor with no type OData and no type ODataAnnotation",
			function() {
				var manifestjson2 = {
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
							"purchase": {
								"uri": "/sap/opu/odata/snce/PO_S_SRV;v=2/",
								"type": "JSON",
								"settings": {
									"odataVersion": "2.0"
								}
							}
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

				var appDescriptorContent2 = JSON.stringify(manifestjson2);

				var oFileStructure = {
					"AnotherProject": {
						"manifest.json": appDescriptorContent2,
						"Component.js": sComponentContent
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/AnotherProject").then(function(oDocument) {
						return oAppDescriptorService.getMetadataPath(oDocument).then(function(sMetadataUrl) {
							expect(sMetadataUrl).to.equal(undefined);
							return oAppDescriptorService.getAnnotations(oDocument).then(function(aAnnotations) {
								expect(aAnnotations.length).to.equal(0);
							});
						});
					});
				});
			});

		it("With AppDescriptor with empty metadataLocalUri and without annotationsLocalUri",
			function() {
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
							"purchase": {
								"uri": "/sap/opu/odata/snce/PO_S_SRV;v=2/",
								"type": "OData",
								"settings": {
									"odataVersion": "2.0",
									"annotations": ["mainAnno"],
									"localUri": ""
								}
							},
							"mainAnno": {
								"uri": "/sap/bc/bsp/sap/ais_draft_union/annotation.xml/",
								"type": "ODataAnnotation"
							}
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

				var appDescriptorContent = JSON.stringify(manifestjson);

				var oFileStructure = {
					"SomeProject4": {
						"manifest.json": appDescriptorContent,
						"Component.js": sComponentContent
					}
				};
				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileService.getDocument("/SomeProject4").then(function(oDocument) {
						return oAppDescriptorService.getMetadataPath(oDocument).then(function(sMetadataUrl) {
							expect(sMetadataUrl).to.equal("");
							return oAppDescriptorService.getAnnotations(oDocument).then(function(aAnnotations) {
								expect(aAnnotations.length).to.equal(1);
								expect(aAnnotations[0].annotationUri).to.equal("/sap/bc/bsp/sap/ais_draft_union/annotation.xml/");
								expect(aAnnotations[0].annotationLocalUri).to.equal(undefined);
							});
						});
					});

				});
			});
	});
});