define(["STF", "sinon"], function(STF) {

	"use strict";

	var suiteName = "SmartTemplateHelper_Integration",
		getService = STF.getServicePartial(suiteName);
	describe(suiteName, function() {
		var oSmartTemplateService, oFileSystem, oSettingProjectService, oFakeFileDAO, oUI5ProjectHandler,
			oSelectionService, oMockServer, iFrameWindow;
		var METADATA_FILE_NAME = "metadata.xml";
		var ANNOTATIONS_FILE_NAME = "annotations.xml";

		var metadataXMLContent;
		var annotationXMLContent;
		var spermaXMLContent;
		var aStubs = [];

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "template/config.json"
			})
				.then(function(oWindow) {

					iFrameWindow = oWindow;
					oSmartTemplateService = getService('smartTemplateHelper');
					oFileSystem = getService('filesystem.documentProvider');
					oSettingProjectService = getService("setting.project");
					oFakeFileDAO = getService("fakeFileDAO");
					oSelectionService = getService("selection");
					oUI5ProjectHandler = getService("ui5projecthandler");
					oMockServer = undefined;

					return Q.all([Q(jQuery.ajax({url: require.toUrl(fullPath(METADATA_FILE_NAME)), dataType: "text"})),
						Q(jQuery.ajax({url: require.toUrl(fullPath(ANNOTATIONS_FILE_NAME)), dataType: "text"})),
						Q(jQuery.ajax({url: require.toUrl(fullPath("SEPMRA_PROD_MAN_ANNO_MDL.xml")),dataType: "text"})),
						Q(jQuery.get(require.toUrl(fullPath("Details.view.xml"))))
					]).spread(function(mdData, annoData, sepmraData, oViewXML) {
						metadataXMLContent = mdData;
						annotationXMLContent = annoData;
						spermaXMLContent = sepmraData;
						var sViewContent = new iFrameWindow.XMLSerializer().serializeToString(oViewXML);
						// prepare mock server
						iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
						oMockServer = new iFrameWindow.sap.ui.core.util.MockServer({
							rootUri: "",
							requests: [{
								method: "GET",
								path: new iFrameWindow.RegExp(".*/Details.view.xml.*"),
								response: function(oXhr) {
									oXhr.respond(200, {
										"Content-Type": "application/xml"
									}, "");
								}
							}, {
								method: "GET",
								path: new iFrameWindow.RegExp(".*/ListReport.*"),
								response: function(oXhr) {
									oXhr.respond(200, {
										"Content-Type": "application/xml"
									}, "");
								}
							}]
						});

						oMockServer.start();
						return fnCreateFileStructure();
					});
				});
		});

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/service/" +
				sFileName;
		}

		afterEach(function() {
			aStubs.forEach(function(stub) {
				stub.restore();
			});
			aStubs = [];

		});

		after(function() {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});

		var domainsJSON = {
			"domains": [{
				"name": "ADL",
				"id": "AL"
			}, {
				"name": "AII",
				"id": "AI"
			}, {
				"name": "Accounting - General",
				"id": "AC"
			}, {
				"name": "Advanced Planner and Optimizer - APO",
				"id": "AP"
			}, {
				"name": "Application Platform",
				"id": "AE"
			}]
		};
		var domainsJSONContent = JSON.stringify(domainsJSON);

		var texttypesJSON = {
			"texttypes": [{
				"id": "CRWB",
				"name": "A Version Crystal Report"
			}, {
				"id": "XCLS",
				"name": "A Version Xcelsius Dashboard"
			}, {
				"id": "SD",
				"name": "ABAP Syntax"
			}]
		};
		var texttypesJSONContent = JSON.stringify(texttypesJSON);

		var sComponentDirectsToManifestContent =
			'jQuery.sap.declare("a.Component");\
                                     jQuery.sap.require("sap.ui.generic.app.AppComponent");\
                                     sap.ui.generic.app.AppComponent.extend("a.Component", {\
                                         metadata: {\
                                            "manifest": "json"\
                                         }\
                                     });';


		var oNewControllerExtension = {
			"sap.ui.controllerExtensions": {
				"sap.suite.ui.generic.template.ListReport.view.ListReport": {
					"controllerName": "smart111.ext.controller.customfilter"
				}
			}
		};

		var oExtensionContentExample = {
			"className": "sap.ui.core.mvc.View",
			"sap.ui.generic.app": {
				"type": "XML",
				"viewName": "smart111.ext.view.gaa"
			}
		};

		var manifestContent = JSON.stringify({
			"_version": "1.2.0",
			"sap.app": {
				"_version": "1.2.0",
				"id": "${project.artifactId}",
				"type": "application",
				"i18n": "i18n/i18n.properties",
				"applicationVersion": {
					"version": "${project.version}"
				},
				"title": "{{appTitle}}",
				"description": "{{appDescription}}",
				"tags": {
					"keywords": []
				},
				"ach": "ass",
				"dataSources": {
					"mainService": {
						"uri": "/sap/opu/odata/sap/SEPMRA_PROD_MAN/",
						"type": "OData",
						"settings": {
							"annotations": [
								"SEPMRA_PROD_MAN_ANNO_MDL",
								"localAnnotations"
							],
							"localUri": "localService/metadata.xml"
						}
					},
					"SEPMRA_PROD_MAN_ANNO_MDL": {
						"uri": "/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName='SEPMRA_PROD_MAN_ANNO_MDL',Version='0001')/$value/",
						"type": "ODataAnnotation",
						"settings": {
							"localUri": "localService/SEPMRA_PROD_MAN_ANNO_MDL.xml"
						}
					},
					"localAnnotations": {
						"uri": "annotations/annotations.xml",
						"type": "ODataAnnotation",
						"settings": {
							"localUri": "annotations/annotations.xml"
						}
					}
				},
				"offline": false,
				"resources": "resources.json",
				"sourceTemplate": {
					"id": "ui5template.smarttemplate",
					"version": "1.0.0"
				}
			},
			"sap.ui": {
				"_version": "1.2.0",
				"technology": "UI5",
				"icons": {
					"icon": "",
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
				"resources": {
					"js": [],
					"css": []
				},
				"dependencies": {
					"minUI5Version": "${sap.ui5.dist.version}",
					"libs": {
						"sap.ui.core": {},
						"sap.m": {},
						"sap.ui.comp": {},
						"sap.uxap": {},
						"sap.suite.ui.generic.template": {}
					},
					"components": {}
				},
				"models": {
					"i18n": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/i18n.properties"
					},
					"@i18n": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/i18n.properties"
					},
					"i18n|sap.suite.ui.generic.template.ListReport|SEPMRA_C_PD_Product": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/ListReport/SEPMRA_C_PD_Product/i18n.properties"
					},
					"i18n|sap.suite.ui.generic.template.ObjectPage|SEPMRA_C_PD_Product": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/ObjectPage/SEPMRA_C_PD_Product/i18n.properties"
					},
					"i18n|sap.suite.ui.generic.template.ObjectPage|to_ProductText": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/ObjectPage/SEPMRA_C_PD_ProductText/i18n.properties"
					},
					"": {
						"dataSource": "mainService",
						"settings": {
							"defaultBindingMode": "TwoWay",
							"defaultCountMode": "Inline",
							"refreshAfterChange": false
						}
					}
				},
				"extends": {
					"extensions": {}
				},
				"contentDensities": {
					"compact": true,
					"cozy": true
				}
			},
			"sap.ui.generic.app": {
				"_version": "1.1.0",
				"pages": [{
					"entitySet": "SEPMRA_C_PD_Product",
					"component": {
						"name": "sap.suite.ui.generic.template.ListReport",
						"list": true
					},
					"pages": [{
						"entitySet": "SEPMRA_C_PD_Product",
						"component": {
							"name": "sap.suite.ui.generic.template.ObjectPage"
						},
						"pages": [{
							"navigationProperty": "to_ProductText",
							"entitySet": "SEPMRA_C_PD_ProductText",
							"component": {
								"name": "sap.suite.ui.generic.template.ObjectPage"
							}
						}]
					}]
				}]
			},
			"sap.fiori": {
				"_version": "1.1.0",
				"registrationIds": [],
				"archeType": "transactional"
			},
			"sap.platform.hcp": {
				"_version": "1.2.0",
				"uri": ""
			}
		});

		function fnCreateFileStructure() {
			return oFakeFileDAO.setContent({
				"smartProject": {
					"webapp": {
						"annotations": {
							"annotations.xml": annotationXMLContent
						},
						"localService": {
							"metadata.xml": metadataXMLContent,
							"SEPMRA_PROD_MAN_ANNO_MDL.xml": spermaXMLContent
						},

						"Component.js": sComponentDirectsToManifestContent,
						"manifest.json": manifestContent,
						"i18n": {
							"i18n.properties" : ""
						}
					}
				},
				"smartProjectNoMetadata": {
					"webapp": {
						"annotations": {
							"annotations.xml": annotationXMLContent
						},
						"localService": {
							"metadata.xml": "",
							"SEPMRA_PROD_MAN_ANNO_MDL.xml": spermaXMLContent
						},

						"Component.js": sComponentDirectsToManifestContent,
						"manifest.json": manifestContent
					}
				}
			});
		}

		//############### getFacetsPerEntitySet tests #################
		it("Test getFacetsPerEntitySet", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var aEntitySet = [];
				aEntitySet.push({name: "SEPMRA_C_PD_Product"});
				aEntitySet.push({name: "SEPMRA_C_PD_ProductText"});
				return oSmartTemplateService.getFacetsPerEntitySet(oTargetDocument, aEntitySet)
					.then(function(aFacetsPerEntitySet) {
						assert.equal(aFacetsPerEntitySet.length, 2, "Got right amount of EntitySets");
						assert.equal(aFacetsPerEntitySet[0].facets.length, 3, "Got right amount of Facet for entity1");
						assert.equal(aFacetsPerEntitySet[1].facets.length, 1, "Got right amount of Facet for entity2");

					});
			});
		});

		it("Test getFacetsPerEntitySet - no metadata.xml in project", function() {
			return oFileSystem.getDocument("/smartProjectNoMetadata").then(function(oTargetDocument) {
				var aEntitySet = [];
				aEntitySet.push({name: "SEPMRA_C_PD_Product"});
				aEntitySet.push({name: "SEPMRA_C_PD_ProductText"});
				return oSmartTemplateService.getFacetsPerEntitySet(oTargetDocument, aEntitySet)
					.then(function(aFacetsPerEntitySet) {
						assert.equal(aFacetsPerEntitySet.length, 0, "getFacetsPerEntitySet return empty array as expected");
					});
			});
		});

		it("Test getFacetsPerEntitySet - no oDocument", function() {
			var aEntitySet = [];
			aEntitySet.push({name: "SEPMRA_C_PD_Product"});
			aEntitySet.push({name: "SEPMRA_C_PD_ProductText"});
			return oSmartTemplateService.getFacetsPerEntitySet(null, aEntitySet)
				.then(function(aFacetsPerEntitySet) {
					assert.equal(aFacetsPerEntitySet.length, 0, "getFacetsPerEntitySet return empty array");
				});
		});

		it("Test getFacetsPerEntitySet - aEntitySet is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getFacetsPerEntitySet(oTargetDocument, null)
					.then(function(aFacetsPerEntitySet) {
						assert.equal(aFacetsPerEntitySet.length, 0, "getFacetsPerEntitySet return empty array");
					});
			});
		});

		//############### getAllExtensionPoints tests #################
		//it("Test getAllExtensionPoints - objectPage", function() {
		//	return oSmartTemplateService.getAllExtensionPoints("objectPage").then(function(aExtensionPoints) {
		//		assert.equal(aExtensionPoints.length, 3, "Got right amount of ExtensionPoints");
		//		assert.equal(aExtensionPoints[0].name, "BeforeFacet", "Got the correct extension point");
		//		assert.equal(aExtensionPoints[1].name, "ReplaceFacet", "Got the correct extension point");
		//		assert.equal(aExtensionPoints[2].name, "AfterFacet", "Got the correct extension point");
		//	});
		//});
		//
		//it("Test getAllExtensionPoints - ListReport", function() {
		//	return oSmartTemplateService.getAllExtensionPoints("ListReport").then(function(aExtensionPoints) {
		//		assert.equal(aExtensionPoints.length, 1, "Got right amount of ExtensionPoints");
		//		assert.equal(aExtensionPoints[0].name, "SmartFilterBarControlConfigurationExtension", "Got the correct extension point");
		//	});
		//});

		it("Test getAllExtensionPoints - Smart Template is null", function() {
			return oSmartTemplateService.getAllExtensionPoints(null).then(function(aExtensionPoints) {
				assert.equal(aExtensionPoints.length, 0, "no Extension Points as expected");
			});
		});

		it("Test getAllExtensionPoints - Smart Template is undefined", function() {
			return oSmartTemplateService.getAllExtensionPoints(undefined).then(function(aExtensionPoints) {
				assert.equal(aExtensionPoints.length, 0, "no Extension Points as expected");
			});
		});

		it("Test getAllExtensionPoints - Smart Template is 'blabla'", function() {
			return oSmartTemplateService.getAllExtensionPoints("blabla").then(function(aExtensionPoints) {
				assert.equal(aExtensionPoints.length, 0, "no Extension Points as expected");
			});
		});

		//############### getEntitySets tests #################
		it("Test getEntitySets - smart Template is ListReport", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, "ListReport").then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 1, "got 1 entity set");
					assert.equal(aEntitySet[0].name, "SEPMRA_C_PD_Product", "Got right name for entity set");
				});
			});
		});

		it("Test getEntitySets - smart Template is ObjectPage", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, "ObjectPage").then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 2, "got 2 entity sets");
					assert.equal(aEntitySet[0].name, "SEPMRA_C_PD_Product", "Got right name for entity set1");
					assert.equal(aEntitySet[1].name, "SEPMRA_C_PD_ProductText", "Got right name for entity set2");
				});
			});
		});

		it("Test getEntitySets - smart Template is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, null).then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 0, "no Entity sets as expected");
				});
			});
		});

		it("Test getEntitySets - smart Template is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, null).then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 0, "no Entity sets as expected");
				});
			});
		});

		it("Test getEntitySets - smart Template is undefined", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, undefined).then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 0, "no Entity sets as expected");
				});
			});
		});

		it("Test getEntitySets - smart Template is 'blabla'", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				return oSmartTemplateService.getEntitySets(oTargetDocument, "blabla").then(function(aEntitySet) {
					assert.equal(aEntitySet.length, 0, "no Entity sets for blabla smart template as expected");
				});
			});
		});

		it("Test getEntitySets - oTargetDocument is undefined", function() {
			return oSmartTemplateService.getEntitySets(undefined, "listPage").then(function(aEntitySet) {
				assert.equal(aEntitySet.length, 0, "no Entity sets as expected");
			});
		});

		it("Test getEntitySets - oTargetDocument is null", function() {
			return oSmartTemplateService.getEntitySets(null, "listPage").then(function(aEntitySet) {
				assert.equal(aEntitySet.length, 0, "no Entity sets as expected");
			});
		});

		//############### writeToI18n tests #################
		it("Test writeToI18n", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var aEntry = ["ss"];
				var sTextType = "XMSG";
				return oSmartTemplateService.writeToI18n(oDocument, aEntry, sTextType).then(function(oPropDocument) {
					assert.ok(oPropDocument, "got properties file");
					return oPropDocument.getContent().
						then(function(sContent) {
							assert.ok(sContent, "Success getting properties content");
							assert.ok(sContent.indexOf("ss=ss")>-1, "Found the right content");
							assert.ok(sContent.indexOf("XMSG")>-1, "Found the right string type");
						});
				});
			});
		});

		it("Test writeToI18n - sTextType not defined", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var aEntry = ["aa2"];
				var sTextType = undefined;
				return oSmartTemplateService.writeToI18n(oDocument, aEntry, sTextType).then(function(oPropDocument) {
					assert.ok(oPropDocument, "got properties file");
					return oPropDocument.getContent().
						then(function(sContent) {
							assert.ok(sContent, "Success getting properties content");
							assert.ok(sContent.indexOf("aa2=aa2")>-1, "Found the right content");
							assert.ok(sContent.indexOf("XTIT")>-1, "Found the right string type");
						});
				});
			});
		});

		it("Test writeToI18n - no oDocument", function() {
			var oDocument = null;
			var aEntry = ["ss"];
			var sTextType = undefined;
			return oSmartTemplateService.writeToI18n(oDocument, aEntry, sTextType).fail(function(oError) {
				assert.ok(oError, "oDocument is not defined");
			});
		});

		it("Test writeToI18n - aEntry not defined", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var aEntry = null;
				var sTextType = "XMSG";
				return oSmartTemplateService.writeToI18n(oDocument, aEntry, sTextType).then(function(oPropDocument) {
					assert.ok(!oPropDocument, "did not update the properties file");
				});
			});
		});

		//############### createNewControllerExtensionEntry tests #################
		it("Test createNewControllerExtensionEntry", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ListReport.view.ListReport";
				var sControllerName = "smart111.ext.controller.customfilter";
				var bOverwrite = true;
				return oSmartTemplateService.createNewControllerExtensionEntry(oDocument, sView, sControllerName, bOverwrite)
					.then(function(bResults) {
					assert.ok(bResults, "Successfully add extension");
					return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
						assert.ok(oExtensions, "Got an object");
						assert.ok(oExtensions["sap.ui.controllerExtensions"], "Found controller extension");
						assert.ok(oExtensions["sap.ui.controllerExtensions"]["sap.suite.ui.generic.template.ListReport.view.ListReport"],
							"Right extension exist");
						assert.equal(oExtensions["sap.ui.controllerExtensions"]
								["sap.suite.ui.generic.template.ListReport.view.ListReport"].controllerName, "smart111.ext.controller.customfilter",
							"Got right controller name");
					});
				});
			});
		});

		it("Test createNewControllerExtensionEntry - bOverwrite false and extension is already exist", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ListReport.view.ListReport";
				var sControllerName = "smart111.ext.controller.customfilter";
				var bOverwrite = false;
				return oSmartTemplateService.createNewControllerExtensionEntry(oDocument, sView, sControllerName, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.message, 'The extension you selected already exists. Select the "Overwrite existing component" checkbox to overwrite it.',
							"Got right error message");
					});
			});
		});

		it("Test createNewControllerExtensionEntry - oDocument is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = null;
				var sView = "sap.suite.ui.generic.template.ListReport.view.ListReport";
				var sControllerName = "smart111.ext.controller.customfilter";
				var bOverwrite = true;
				return oSmartTemplateService.createNewControllerExtensionEntry(oDocument, sView, sControllerName, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "NoProjectSelected", "Got right error name");
					});
			});
		});

		it("Test createNewControllerExtensionEntry - sView is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = null;
				var sControllerName = "smart111.ext.controller.customfilter";
				var bOverwrite = true;
				return oSmartTemplateService.createNewControllerExtensionEntry(oDocument, sView, sControllerName, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "ViewNotDefined", "Got right error name");
					});
			});
		});

		it("Test createNewControllerExtensionEntry - sControllerName is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ListReport.view.ListReport";
				var sControllerName = null;
				var bOverwrite = true;
				return oSmartTemplateService.createNewControllerExtensionEntry(oDocument, sView, sControllerName, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "ViewNotDefined", "Got right error name");
					});
			});
		});

		//############### createNewViewExtensionEntry tests #################
		it("Test createNewViewExtensionEntry - SmartFilterBarControlConfigurationExtension", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "SmartFilterBarControlConfigurationExtension";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.then(function(bResults) {
						assert.ok(bResults, "Successfully add extension");
						return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
							assert.ok(oExtensions, "Got an object");
							assert.ok(oExtensions["sap.ui.viewExtensions"], "Found view extensions");
							assert.ok(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"],
								"Right extension exist");
							assert.ok(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
								["SmartFilterBarControlConfigurationExtension|SEPMRA_C_PD_ProductText"],"Right Facet exist");
							assert.equal(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
									["SmartFilterBarControlConfigurationExtension|SEPMRA_C_PD_ProductText"].className, "sap.ui.core.mvc.View"
								,"Got Right class name");
							assert.equal(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
									["SmartFilterBarControlConfigurationExtension|SEPMRA_C_PD_ProductText"]["sap.ui.generic.app"].type, "XML"
								,"Got Right type");
						});
					});
			});
		});

		it("Test createNewViewExtensionEntry", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.then(function(bResults) {
						assert.ok(bResults, "Successfully add extension");
						return oUI5ProjectHandler.getAllExtensions(oTargetDocument).then(function (oExtensions) {
							assert.ok(oExtensions, "Got an object");
							assert.ok(oExtensions["sap.ui.viewExtensions"], "Found view extensions");
							assert.ok(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"],
								"Right extension exist");
							assert.ok(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
								["BeforeFacet|SEPMRA_C_PD_ProductText|GeneralInformation"],"Right Facet exist");
							assert.equal(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
								["BeforeFacet|SEPMRA_C_PD_ProductText|GeneralInformation"].className, "sap.ui.core.mvc.View"
								,"Got Right class name");
							assert.equal(oExtensions["sap.ui.viewExtensions"]["sap.suite.ui.generic.template.ObjectPage.view.Details"]
									["BeforeFacet|SEPMRA_C_PD_ProductText|GeneralInformation"]["sap.ui.generic.app"].type, "XML"
								,"Got Right type");
						});
					});
			});
		});

		it("Test createNewViewExtensionEntry - bOverwrite is false", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = false;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.message, 'The extension you selected already exists. Select the "Overwrite existing component" checkbox to overwrite it.',
							"Got right error message");
					});
			});
		});

		it("Test createNewViewExtensionEntry - oDocument is null", function() {
			var oDocument = null;
			var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
			var sExtensionPoint = "BeforeFacet";
			var sEntitySet = "SEPMRA_C_PD_ProductText";
			var oExtensionContent = oExtensionContentExample;
			var sFacetId = "GeneralInformation";
			var bOverwrite = true;
			return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
				sEntitySet, oExtensionContent, sFacetId, bOverwrite)
				.fail(function(oError) {
					assert.ok(oError, "Successfully got error");
					assert.equal(oError.name, "NoProjectSelected", "Got right error name");
				});
		});

		it("Test createNewViewExtensionEntry - sView is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = null;
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "ViewNotDefined", "Got right error name");
					});
			});
		});

		it("Test createNewViewExtensionEntry - sExtensionPoint is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = null;
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "missingParamForExtensionPointID", "Got right error name");
					});
			});
		});

		it("Test createNewViewExtensionEntry - sEntitySet is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = null;
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "missingParamForExtensionPointID", "Got right error name");
					});
			});
		});

		it("Test createNewViewExtensionEntry - oExtensionContent is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = null;
				var sFacetId = "GeneralInformation";
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.then(function(bResults) {
						assert.ok(bResults, "Successfully add extension");
					})
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "TypeError", "Got right error name");
					});
			});
		});

		it("Test createNewViewExtensionEntry - sFacetId is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sView = "sap.suite.ui.generic.template.ObjectPage.view.Details";
				var sExtensionPoint = "BeforeFacet";
				var sEntitySet = "SEPMRA_C_PD_ProductText";
				var oExtensionContent = oExtensionContentExample;
				var sFacetId = null;
				var bOverwrite = true;
				return oSmartTemplateService.createNewViewExtensionEntry(oDocument, sView, sExtensionPoint,
					sEntitySet, oExtensionContent, sFacetId, bOverwrite)
					.then(function(oResult) {
						assert.ok(!oResult, "Got undefined when facet id is null");
					});
			});
		});


		//############### validateOnSelection tests #################
		it("Test validateOnSelection - sap.suite.ui.generic.template.ObjectPage", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sTemplateName = "sap.suite.ui.generic.template.ObjectPage";
				return oSmartTemplateService.validateOnSelection(oDocument, sTemplateName)
					.then(function(bResult) {
						assert.ok(bResult, "Found ObjectPage template");
					});
			});
		});

		it("Test validateOnSelection - sap.suite.ui.generic.template.ListReport", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sTemplateName = "sap.suite.ui.generic.template.ListReport";
				return oSmartTemplateService.validateOnSelection(oDocument, sTemplateName)
					.then(function(bResult) {
						assert.ok(bResult, "Found ListReport template");
					});
			});
		});

		it("Test validateOnSelection - oDocument is null", function() {
			var oDocument = null;
			var sTemplateName = "sap.suite.ui.generic.template.ListReport";
			return oSmartTemplateService.validateOnSelection(oDocument, sTemplateName)
				.fail(function(oError) {
					assert.ok(oError, "Successfully got error");
					assert.equal(oError.name, "NoProjectSelected", "Got right error name");
				});
		});

		it("Test validateOnSelection - sTemplateName is null", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sTemplateName = null;
				return oSmartTemplateService.validateOnSelection(oDocument, sTemplateName)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "TemplateDoesNotExist", "Got right error name");
					});
			});
		});

		it("Test validateOnSelection - sTemplateName does not exist", function() {
			return oFileSystem.getDocument("/smartProject").then(function(oTargetDocument) {
				var oDocument = oTargetDocument;
				var sTemplateName = "test111";
				return oSmartTemplateService.validateOnSelection(oDocument, sTemplateName)
					.fail(function(oError) {
						assert.ok(oError, "Successfully got error");
						assert.equal(oError.name, "TemplateDoesNotExist", "Got right error name");
					});
			});
		});
	});
});