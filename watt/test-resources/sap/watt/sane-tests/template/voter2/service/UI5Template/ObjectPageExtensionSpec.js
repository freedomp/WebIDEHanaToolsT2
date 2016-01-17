define(["STF", "sap/watt/saptoolsets/fiori/project/plugin/ui5template/smartExtensions/objectPage/ObjectPageTemplate", "sap/watt/lib/jszip/jszip-shim"] ,
	function(STF, oObjectPageExtension, JSZip) {
		"use strict";

		var suiteName = "ObjectPageExtension_Integration", getService = STF.getServicePartial(suiteName);
		describe(suiteName, function () {
			var oTemplateService, oFakeFileDAO, oFileSystem;

			var aStubs = [];

			before(function () {
				return STF.startWebIde(suiteName, {config: "template/voter2/service/UI5Template/config.json"})
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

			var createWorkspaceStructure = function() {
				return Q(jQuery.get(require.toUrl("../test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/resources/manifest.json"))).then(function (oManifestFile) {
					var oManifestWithoutObjectPage = removeObjectPageFromManifest(JSON.parse(JSON.stringify(oManifestFile)));
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
								"manifest.json": JSON.stringify(oManifestWithoutObjectPage)
							}
						}
					});
				});
			};

			var removeObjectPageFromManifest = function(oManifestFile){
				oManifestFile["sap.ui.generic.app"].pages[0].pages[0].component.name = "";
				oManifestFile["sap.ui.generic.app"].pages[0].pages[0].pages[0].component.name = "";
				return oManifestFile;
			};

			it("Test Object Page Extension - onBeforeTemplateGenerate", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oZip = new JSZip();
						oZip.file("fragment", "fragment content");
						var oUIModel = new sap.ui.model.json.JSONModel();
						var oData = {
							viewTypes : [{
								text : "Fragment"
							},{
								text : "View"
							}],
							viewTypeIndex : 0,
							viewName : "filename"
						};
						oUIModel.setData(oData);
						var oModel = {
							"selectedDocument" : oTargetDocument,
							"UIModel" : oUIModel
						};
						return oTemplate.onBeforeTemplateGenerate(oZip, oModel).then(function (aResult) {
							assert.equal(aResult[1].namespace, "smart", "The namespace got successfully");
							assert.equal(aResult[1].filename, "filename", "The file name got successfully");
						});
					});
				});
			});

			it("Test Object Page Extension - onBeforeTemplateGenerate - filename is empty", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oZip = new JSZip();
						oZip.file("fragment", "fragment content");
						var oUIModel = new sap.ui.model.json.JSONModel();
						var oData = {
							viewTypes : [{
								text : "Fragment"
							},{
								text : "View"
							}],
							viewTypeIndex : 0,
							viewName : ""
						};
						oUIModel.setData(oData);
						var oModel = {
							"selectedDocument" : oTargetDocument,
							"UIModel" : oUIModel
						};
						return oTemplate.onBeforeTemplateGenerate(oZip, oModel).then(function (aResult) {
							assert.equal(aResult[1].namespace, "smart", "The namespace got successfully");
							assert.equal(aResult[1].filename, "newFacet", "The file name got successfully");
						});
					});
				});
			});

			it("Test Object Page Extension - onAfterGenerate - UIControl is Fragment", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oZip = new JSZip();
						var oUIModel = new sap.ui.model.json.JSONModel();
						var oData = {
							entitySet : "entity1",
							facet : "facetid",
							extensionPoints : [{
								text : "Before",
								key : "BeforeFacet"
							},{
								text : "After",
								key : "AfterFacet"
							},{
								text : "Replace",
								key : "ReplaceFacet"
							}],
							extensionPointIndex : 0,
							viewTypes : [{
								text : "Fragment"
							},{
								text : "View"
							}],
							viewTypeIndex : 0,
							facetTitle : "facettitle"
						};
						oUIModel.setData(oData);
						var oModel = {
							"selectedDocument" : oTargetDocument,
							"filename" : "newFacet",
							"namespace" : "smart",
							"UIModel" : oUIModel
							};
						return oTemplate.onAfterGenerate(oZip, oModel).then(function (aResult) {
							var sManifestPath = aResult[1].selectedDocument.getEntity().getFullPath() + "/webapp/manifest.json";
							return oFileSystem.getDocument(sManifestPath).then(function(oManifest){
								return oManifest.getContent().then(function(sContent){
									var oContent = JSON.parse(sContent);
									var oExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]["BeforeFacet|entity1|facetid"];
									var oExpectedResult = {
										"type": "XML",
										"className": "sap.ui.core.Fragment",
										"fragmentName": "smart.ext.fragment.newFacet",
										"sap.ui.generic.app": {
											"title": "{@i18n>facettitle}"
										}};
									assert.equal(JSON.stringify(oExpectedResult), JSON.stringify(oExtensionEntry), "The extension entry was created successfully");
								});
							});
						});
					});
				});
			});

			it("Test Object Page Extension - onAfterGenerate - UIControl is View", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oZip = new JSZip();
						var oUIModel = new sap.ui.model.json.JSONModel();
						var oData = {
							entitySet : "entity1",
							facet : "facetid",
							extensionPoints : [{
								text : "Before",
								key : "BeforeFacet"
							},{
								text : "After",
								key : "AfterFacet"
							},{
								text : "Replace",
								key : "ReplaceFacet"
							}],
							extensionPointIndex : 2,
							viewTypes : [{
								text : "Fragment"
							},{
								text : "View"
							}],
							viewTypeIndex : 1,
							facetTitle : ""
						};
						oUIModel.setData(oData);
						var oModel = {
							"selectedDocument" : oTargetDocument,
							"filename" : "newFacet",
							"namespace" : "smart",
							"UIModel" : oUIModel
						};
						return oTemplate.onAfterGenerate(oZip, oModel).then(function (aResult) {
							var sManifestPath = aResult[1].selectedDocument.getEntity().getFullPath() + "/webapp/manifest.json";
							return oFileSystem.getDocument(sManifestPath).then(function(oManifest){
								return oManifest.getContent().then(function(sContent){
									var oContent = JSON.parse(sContent);
									var oExtensionEntry = oContent["sap.ui5"]["extends"]["extensions"]["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]["ReplaceFacet|entity1|facetid"];
									var oExpectedResult = {
										"type": "XML",
										"className": "sap.ui.core.mvc.View",
										"viewName": "smart.ext.view.newFacet"
									};
									assert.equal(JSON.stringify(oExpectedResult), JSON.stringify(oExtensionEntry), "The extension entry was created successfully");
								});
							});
						});
					});
				});
			});

			it("Test Object Page Extension - customValidation - expected true", function () {
				return oFileSystem.getDocument("/project1").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument" : oTargetDocument
						};
						return oTemplate.customValidation(oModel).then(function () {
							assert.ok(true, "customValidation is true");
						});
					});
				});
			});

			it("Test Object Page Extension - customValidation - expected false", function () {
				return oFileSystem.getDocument("/project2").then(function (oTargetDocument) {
					return oTemplateService.getTemplate("ui5template.objectpageextension").then(function (oTemplate) {
						var oModel = {
							"selectedDocument" : oTargetDocument
						};
						return oTemplate.customValidation(oModel).fail(function () {
							assert.ok(true, "customValidation is false");
						});
					});
				});
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions", function () {
				var oExtensions = {
					"sap.ui.viewExtensions": {
						"sap.suite.ui.generic.template.ListReport.view.ListReport": {
							"SmartFilterBarControlConfigurationExtension|SEPMRA_C_PD_Product": {
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacet4",
								"type": "XML"
							}
						},
						"sap.suite.ui.generic.template.ObjectPage.view.Details": {
							"AfterFacet|SEPMRA_C_PD_Product|GeneralInformation": {
								"type": "XML",
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacet",
								"sap.ui.generic.app": {
									"title": "{@i18n>Untitled}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_Product|GeneralInformation1": {
								"type": "XML",
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacet0",
								"sap.ui.generic.app": {
									"title": "{@i18n>Untitled}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_Product|GeneralInformation2": {
								"type": "XML",
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacetfdsfdsf",
								"sap.ui.generic.app": {
									"title": "{@i18n>Untitled}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_Product|GeneralInformation3": {
								"type": "XML",
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacet-2",
								"sap.ui.generic.app": {
									"title": "{@i18n>Untitled}"
								}
							},
							"BeforeFacet|SEPMRA_C_PD_ProductText|GeneralInformation": {
								"type": "XML",
								"className": "sap.ui.core.mvc.View",
								"viewName": "smart.ext.view.newFacet1",
								"sap.ui.generic.app": {
									"title": "{@i18n>new facet}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_ProductText|GeneralInformation": {
								"type": "XML",
								"className": "sap.ui.core.mvc.View",
								"viewName": "smart.ext.view.newFacet3",
								"sap.ui.generic.app": {
									"title": "{@i18n>hhh}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_ProductText|GeneralInformation1": {
								"type": "XML",
								"className": "sap.ui.core.mvc.View",
								"viewName": "smart.ext.view.newFacet4t",
								"sap.ui.generic.app": {
									"title": "{@i18n>hhh}"
								}
							},
							"AfterFacet|SEPMRA_C_PD_ProductText|GeneralInformation2": {
								"type": "XML",
								"className": "sap.ui.core.mvc.View",
								"viewName": "smart.ext.view.newFacett4",
								"sap.ui.generic.app": {
									"title": "{@i18n>hhh}"
								}
							}
						}
					},
					"sap.ui.controllerExtensions": {
						"sap.suite.ui.generic.template.ListReport.view.ListReport": {
							"controllerName": "smart.ext.controller.newFacet5"
						}
					}
				};
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions(oExtensions);
				assert.equal(sFileName, "newFacet5", "The file name built successfully");
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions - parameter is undefined", function () {
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions();
				assert.equal(sFileName, "newFacet", "The file name built successfully");
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions - parameter doesn't contain sap.ui.viewExtensions", function () {
				var oExtensions = {
					"sap.ui.controllerExtensions" : {
						"sap.suite.ui.generic.template.ObjectPage.view.Details": {
							"AfterFacet|SEPMRA_C_PD_Product|GeneralInformation": {
								"type": "XML",
								"className": "sap.ui.core.Fragment",
								"fragmentName": "smart.ext.fragment.newFacet",
								"sap.ui.generic.app": {
									"title": "{@i18n>Untitled}"
								}
							}
						}
					}
				};
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions(oExtensions);
				assert.equal(sFileName, "newFacet", "The file name built successfully");
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions - parameter doesn't contain sap.suite.ui.generic.template.ObjectPage.view.Details", function () {
				var oExtensions = {
					"sap.ui.viewExtensions": {
						"sap.suite.ui.generic.template.ObjectPage.view.Details1": {
							"type": "XML",
							"className": "sap.ui.core.mvc.View",
							"viewName": "smart.ext.view.newFacet4",
							"sap.ui.generic.app": {
								"title": "{@i18n>hhh}"
							}
						}
					}
				};
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions(oExtensions);
				assert.equal(sFileName, "newFacet", "The file name built successfully");
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions - parameter doesn't contain extension content", function () {
				var oExtensions = {
					"sap.ui.viewExtensions": {
						"sap.suite.ui.generic.template.ObjectPage.view.Details": {
						}
					}
				};
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions(oExtensions);
				assert.equal(sFileName, "newFacet", "The file name built successfully");
			});

			it("Test Object Page Extension - _buildFileNameFromExistingExtensions - parameter doesn't contain viewName or fragmentName", function () {
				var oExtensions = {
					"sap.ui.viewExtensions": {
						"sap.suite.ui.generic.template.ObjectPage.view.Details": {
							"type": "XML",
							"className": "sap.ui.core.mvc.View",
							"Name": "smart.ext.view.newFacet4",
							"sap.ui.generic.app": {
								"title": "{@i18n>hhh}"
							}
						}
					}
				};
				var sFileName = oObjectPageExtension._buildFileNameFromExistingExtensions(oExtensions);
				assert.equal(sFileName, "newFacet", "The file name built successfully");
			});

			it("Test Object Page Extension - _handleResourcesFiles - UIControl is Fragment", function () {
				var oZip = new JSZip();
				oZip.file("fragment", "fragment content");
				oZip.file("view", "view content");
				oZip.file("controller", "controller content");
				var oUIModel = new sap.ui.model.json.JSONModel();
				var oData = {
					viewTypes : [{
						text : "Fragment"
					},{
						text : "View"
					}],
					viewTypeIndex : 0
				};
				oUIModel.setData(oData);
				var oModel = {
					"filename" : "newFacet",
					"UIModel" : oUIModel
				};
				var oNewZip =  oObjectPageExtension._handleResourcesFiles(oZip, oModel);
				assert.equal(oNewZip.file("webapp/ext/fragment/newFacet.fragment.xml")._data, "fragment content", "The fragment name was changed successfully");
				assert.equal(oNewZip.folder("webapp/ext/view")._data, null, "The view file was removed successfully");
				assert.equal(oNewZip.folder("webapp/ext/controller")._data, null, "The controller file was removed successfully");
			});

			it("Test Object Page Extension - _handleResourcesFiles - UIControl is View", function () {
				var oZip = new JSZip();
				oZip.file("fragment", "fragment content");
				oZip.file("view", "view content");
				oZip.file("controller", "controller content");
				var oUIModel = new sap.ui.model.json.JSONModel();
				var oData = {
					viewTypes : [{
						text : "Fragment"
					},{
						text : "View"
					}],
					viewTypeIndex : 1
				};
				oUIModel.setData(oData);
				var oModel = {
					"filename" : "newFacet",
					"UIModel" : oUIModel
				};
				var oNewZip =  oObjectPageExtension._handleResourcesFiles(oZip, oModel);
				assert.equal(oNewZip.file("webapp/ext/view/newFacet.view.xml.tmpl")._data, "view content", "The view name was changed successfully");
				assert.equal(oNewZip.file("webapp/ext/controller/newFacet.controller.js.tmpl")._data, "controller content", "The controller name was changed successfully");
				assert.equal(oNewZip.folder("webapp/ext/fragment")._data, null, "The fragment file was removed successfully");
			});
		});
	});