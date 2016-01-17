define(["STF", "sinon", "sap/watt/lib/jszip/jszip-shim"], function(STF, sinon, JSZip) {

	"use strict";

	var suiteName = "Template_Integration",
		getService = STF.getServicePartial(suiteName);
	describe(suiteName, function() {
		var sap, oTemplateService, oPreferencesService;
		var aStubs = [];

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "template/voter1/service/Template/config.json"
			}).then(function(oWindow) {
				oTemplateService = getService('template');
				oPreferencesService = getService('preferences');
				
				sap = oWindow.sap;
				sap.watt = sap.watt || {};
				sap.watt.getEnv = sap.watt.getEnv || function() {
					return true;
				};

			});
		});

		after(function() {
			aStubs.forEach(function(stub) {
				stub.restore();
			});
			aStubs = [];
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			aStubs.forEach(function(stub) {
				stub.restore();
			});
			aStubs = [];
		});
		
		it("Test relevant templates versions in external env", function() {
			aStubs.push(sinon.stub(sap.watt, "getEnv").returns(false));
			var bInternal = true;
			return oTemplateService.getTemplateVersions("ui5template.listListDetails").then(function(aTemplates) {
				assert.ok(aTemplates.length === 4, "success getting 4 templates.");
				assert.ok(aTemplates[0].getVersion() === "1.2.0", "success getting template version - 1.2.0.");
				for (var i = 0; i < aTemplates.length; i++) {
					if (aTemplates[i].getVersion() === "2.2.2") {
						bInternal = false;
					}
				}

				assert.ok(bInternal, "Internal version was not display");
			});
		});

		it("Test get Templates model", function() {
			//var aTemplates = ["ui5template.listListDetails", "ui5template.listList", "fioriexttemplate.starterApplication"];
			//serviceTemplate.configure(services);
			return oTemplateService.getTemplates().then(function(aTemplates) {
				assert.ok(aTemplates !== undefined, "success to create the template model.");
			});
		});

		it("Test get Templates model", function() {
			//var aTemplates = ["ui5template.listListDetails", "ui5template.listList", "fioriexttemplate.starterApplication"];
			//serviceTemplate.configure(services);
			return oTemplateService.getTemplates("component").then(function(mTemplates) {
				var bAllTemplatesFromComponentType = true;
				for (var key in mTemplates) {
					if (mTemplates.hasOwnProperty(key) && mTemplates[key].getType() !== "component") {
						bAllTemplatesFromComponentType = false;
					}
				}
				assert.ok(bAllTemplatesFromComponentType, "success to get all components templates.");
			});
		});

		it("Test get Template", function() {
			return oTemplateService.getTemplate("ui5template.listListDetails").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}
				assert.ok(oTemplate.getId() === "ui5template.listListDetails", "success getting template.");
			});

		});

		it("Test get all requiered Templates", function() {
			var oTemplate = {
				"_mConfig": {
					"id": "test.emptyDesktopProject",
					"template": "sap.watt.saptoolsets.fiori.project.ui5template/emptyDesktopProject/EmptyDesktopProjectTemplate",
					"name": "Config_template_ui5templateEmptyDesktopProject_name",
					"description": "Config_template_ui5templateEmptyDesktopProject_desc",
					"path": "ui5template/emptyDesktopProject",
					"fileName": "EmptyDesktopProjectTemplate.zip",
					"icon": "sap-icon://e-learning",
					"modelFileName": "model.json",
					"modelRoot": "emptyDesktopProject",
					"requiredTemplates": ["ui5template.emptyMobileProject"],
					"category": "Empty.SAPUI5.Project",
					"templateType": "project",
					"version": "1.0.1"
				}
			};
			return oTemplateService.getAllRequiredTemplates(oTemplate).then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getAllRequiredTemplates failed");
				}

				assert.ok(aTemplates.length === 3, "success getting all requiered templates.");
			});

		});

		it("Test Common category exists", function() {

			return oTemplateService.getCategoryById("Common").then(function(oCategory) {
				assert.ok(oCategory !== undefined, "Common category exists as expected");
			});
		});

		it("Test Common category exists with templates", function() {

			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				var bFound = false;
			
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				} else {
					if (aCategories.length > 0 ) {
						for (var i = 0; i < aCategories.length; i++) {
							if (aCategories[i].category.getId() === "Common" && aCategories[i].templates.length > 0) {
								bFound = true;
							}
						}
					}
					assert.ok(bFound, "Common category exists and has some templates");
				}
			});
		});

		it("Test get Templates per category", function() {
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					assert.ok((aCategories[0].category !== undefined && aCategories[0].templates !== undefined),
						"success getting templates per category");
				}
			});

		});

		it("Test priority order for core Templates", function() {
			var oTemplate = {
				"_mConfig": {
					"id": "test.emptyDesktopProject",
					"template": "sap.watt.saptoolsets.fiori.project.ui5template/emptyDesktopProject/EmptyDesktopProjectTemplate",
					"name": "Config_template_ui5templateEmptyDesktopProject_name",
					"description": "Config_template_ui5templateEmptyDesktopProject_desc",
					"path": "ui5template/emptyDesktopProject",
					"fileName": "EmptyDesktopProjectTemplate.zip",
					"icon": "sap-icon://e-learning",
					"modelFileName": "model.json",
					"modelRoot": "emptyDesktopProject",
					"requiredTemplates": ["ui5template.emptyMobileProject"],
					"category": "Empty.SAPUI5.Project",
					"templateType": "project",
					"version": "1.0.1"
				}
			};
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var aTemplates = aCategories[0].templates;
					for (var i = 0; i < aTemplates.length; i++) {
						oTemplate = aTemplates[i];
						var orderPriority = oTemplate.getOrderPriority();
						var min = 0,
							coreRange = 1000;
						if (oTemplate.isCoreTemplate()) {
							assert.ok(orderPriority && orderPriority >= min, "success getting core templates order priority");
						} else {
							if (orderPriority) {
								assert.ok(orderPriority >= coreRange, "success getting templates order priority larger then 1000");
							} else {
								assert.ok(true, "No priority order for this template");
							}
						}
					}
				}
			});
		});

		it("Test internal Templates", function() {
			var oTemplate = {
				"_mConfig": {
					"id": "test.emptyDesktopProject",
					"template": "sap.watt.saptoolsets.fiori.project.ui5template/emptyDesktopProject/EmptyDesktopProjectTemplate",
					"name": "Config_template_ui5templateEmptyDesktopProject_name",
					"description": "Config_template_ui5templateEmptyDesktopProject_desc",
					"path": "ui5template/emptyDesktopProject",
					"fileName": "EmptyDesktopProjectTemplate.zip",
					"icon": "sap-icon://e-learning",
					"modelFileName": "model.json",
					"modelRoot": "emptyDesktopProject",
					"requiredTemplates": ["ui5template.emptyMobileProject"],
					"category": "Empty.SAPUI5.Project",
					"templateType": "project",
					"version": "1.0.1"
				}
			};
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var aTemplates = aCategories[0].templates;
					for (var i = 0; i < aTemplates.length; i++) {
						oTemplate = aTemplates[i];
						var orderPriority = oTemplate.getOrderPriority();
						var min = 0,
							coreRange = 1000;
						if (oTemplate.isCoreTemplate()) {
							assert.ok(orderPriority && orderPriority >= min, "success getting core templates order priority");
						} else {
							if (orderPriority) {
								assert.ok(orderPriority >= coreRange, "success getting templates order priority larger then 1000");
							} else {
								assert.ok(true, "No priority order for this template");
							}
						}
					}
				}
			});
		});

		it("Test get registered Categories", function() {
			return oTemplateService.getRegisteredCategories().then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getRegisteredCategories failed");
				}
				if (aCategories.hasOwnProperty("SAP.Fiori.Application.Empty")) {
					assert.ok(true, "All registered categories retrieved");
				} else {
					assert.ok(false, "Missing category 'SAP.Fiori.Application.Empty'");
				}
			});
		});

		it("Test get registered Non-Empty Categories", function() {
			return oTemplateService.getCategories().then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getNonEmptyCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					for (var i = 0; i < len; i++) {
						var category = aCategories[i];
						if (category === "SAP.Fiori.Application.Empty") {
							assert.ok(false, "There's an empty category - " + category);
						}
					}
				}
				assert.ok(true, "No empty categories");
			});
		});

		it("Test templates per Non-Empty Categories", function() {
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					for (var i = 0; i < len; i++) {
						var aTemplates = aCategories[i].templates;
						if (aTemplates.length <= 0 && aCategories[i].category.getId() !== "Favorite") {
							assert.ok(false, "There's an empty category - " + aCategories[i].category._sId);
						}
					}
				}
				assert.ok(true, "No empty categories");
			});
		});

		it("Test error", function() {
			return oTemplateService.getTemplate("ui5template.listListDetails").then(function(oTemplate) {
				oTemplate._error("XXX");
			}).fail(function(oError) {
				assert.ok(oError.message === "Template: ui5template.listListDetails | Message: XXX", "success test error message");

			});
		});

		it("Test get preview image", function() {
			return oTemplateService.getTemplate("ui5template.fioriMasterDetail_test").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}
				assert.ok(oTemplate.getPreviewImage() === "image/wattpreviewmd.PNG", "success getting preview image.");
			});
		});

		// test template versioning mechanism.

		it("Test get Template Versions", function() {
			return oTemplateService.getTemplateVersions("ui5template.listListDetails").then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getTemplateVersions failed");
				}
				assert.ok(aTemplates.length === 4, "success getting 4 templates.");
				assert.ok(aTemplates[0].getVersion() === "1.2.0", "success getting template version - 1.2.0.");
				assert.ok(aTemplates[1].getVersion() === "1.1.0", "success getting template version - 1.1.0.");
				assert.ok(aTemplates[2].getVersion() === "1.0.0", "success getting template version - 1.0.0.");
				assert.ok(aTemplates[3].getVersion() === "notValidVersion", "success getting template version -notValidVersion.");
			});
		});

		it("Test get Template Versions - illegal version should be in the end", function() {
			return oTemplateService.getTemplateVersions("ui5template.listListDetails").then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getTemplateVersions failed");
				}
				assert.ok(aTemplates[aTemplates.length - 1].getVersion() === "notValidVersion",
					"success getting template version - notValidVersion.");
			});
		});

		it("Test get Template Versions - undefiend version", function() {
			return oTemplateService.getTemplateVersions("ui5template.viewHTML").then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getTemplateVersions failed");
				}
				assert.ok(aTemplates[0].getVersion() === "0.0.0", " undefined version - success getting default template version - 0.0.0.");
			});
		});

		it("Test get Template Versions - undefiend value version", function() {
			return oTemplateService.getTemplateVersions("test.emptyDesktopProject").then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getTemplateVersions failed");
				}
				assert.ok(aTemplates[0].getVersion() === "1.0.1", " success getting default template version - 1.0.1.");
				assert.ok(aTemplates[1].getVersion() === "0.0.0", " undefined version - success getting default template version - 0.0.0.");

			});
		});

		it("Test get Template Versions - null value version", function() {
			return oTemplateService.getTemplateVersions("ui5template.emptyMobileProject").then(function(aTemplates) {
				if (!aTemplates) {
					assert.ok(false, "getTemplateVersions failed");
				}
				assert.ok(aTemplates[0].getVersion() === "1.0.1", " success getting default template version - 1.0.1.");
				assert.ok(aTemplates[1].getVersion() === "0.0.0", " null version - success getting default template version - 0.0.0.");

			});
		});

		it("Test getTemplate - test for receive template with the latest version", function() {
			return oTemplateService.getTemplate("ui5template.listListDetails").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}

				assert.ok(oTemplate.getVersion() === "1.2.0", "success getting template version.");
				assert.ok(oTemplate.getName() === "List/List/Details SAPUI5 Application new version", "success getting template name.");
				assert.ok(oTemplate.getFileName() === "ListListDetailsTemplateNew.zip", "success getting template file name.");
				assert.ok(oTemplate._mConfig.category[0] === "SAPUI5.Mobile.Applications", "success getting template category.");
			});
		});

		it("Test getTemplate by specific version", function() {
			return oTemplateService.getTemplate("ui5template.listListDetails", "1.0.0").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}

				assert.ok(oTemplate.getVersion() === "1.0.0", "success getting template version.");
				assert.ok(oTemplate.getName() === "List/List/Details SAPUI5 Application", "success getting template name.");
				assert.ok(oTemplate.getFileName() === "ListListDetailsTemplate.zip", "success getting template file name.");
				assert.ok(oTemplate._mConfig.category[0] === "SAP.Fiori.Application", "success getting template category.");
			});
		});

		it("Test getTemplatesPerCategories - get latest template version in categoty group", function() {
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				var bFlag = false;
				var sTemplateName = "List/List/Details SAPUI5 Application new version";

				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}

				for (var i in aCategories) {
					if (aCategories[i].category.getId() === "SAPUI5.Mobile.Applications") {
						for (var j in aCategories[i].templates) {
							if (aCategories[i].templates[j].getName() === sTemplateName) {
								bFlag = true;
								var oTemplate = aCategories[i].templates[j];
								assert.ok(oTemplate.getVersion() === "1.2.0", "success getting template version.");
								assert.ok(oTemplate.getDescription() === "Hello world", "success getting template description.");
								assert.ok(oTemplate.getFileName() === "ListListDetailsTemplateNew.zip", "success getting template file name.");
								assert.ok(oTemplate.getIcon() === "new version icon", "success getting template icon.");
								assert.ok(oTemplate.getType() === "project", "success getting template type.");
								break;
							}
						}
						break;
					}
				}
				assert.equal(bFlag, true, "success getting template version.");
			});
		});

		it("Test getTemplate - template with exists version", function() {
			return oTemplateService.getTemplate("ui5template.emptyMobileProject").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}

				assert.ok(oTemplate.getVersion() === "1.0.1", "success getting template version.");
				assert.ok(oTemplate.getName() === "empty Mobile Project", "success getting template name.");
				assert.ok(oTemplate.getFileName() === "EmptyMobileProjectTemplateNew.zip", "success getting template file name.");
				assert.ok(oTemplate.getType() === "project", "success getting template type.");
				assert.ok(oTemplate._mConfig.category[0] === "Empty.SAPUI5.Project", "success getting template category.");
			});
		});

		// end test template versioning mechanism.

		it("Test get all Template prototype functions", function() {
			return oTemplateService.getTemplate("ui5template.fioriMasterDetail_test").then(function(oTemplate) {
				if (!oTemplate) {
					assert.ok(false, "getTemplate failed");
				}
				assert.ok(oTemplate.getTemplateCustomizationImage() === "image/tmplCustImage.jpg", "success getting template customization image.");
				assert.equal(oTemplate.getWizardStepService(0), undefined, "success getting undefined for getWizardStepService(0)");
				assert.ok(oTemplate.getI18nResources(), "success getting empty object for getI18nResources.");
				assert.equal(oTemplate.getWizardSteps().length, 2, "success getting template getWizardSteps length.");
				assert.equal(oTemplate.getWizardSteps()[0], "catalogstep", "success getting template getWizardSteps first.");
				assert.equal(oTemplate.getWizardSteps()[1], "templateCustomizationStep", "success getting template getWizardSteps second.");
				assert.equal(oTemplate.getIcon(), "sap-icon://accelerated", "success getting icon");
				assert.equal(oTemplate.getName(), "Fiori Master Details test", "success getting template name");
				assert.equal(oTemplate.getRequiresNeoApp(), true, "success getting template getRequiresNeoApp.");
				assert.equal(oTemplate.getInternalOnly(), false, "success getting template getInternalOnly.");
				assert.equal(oTemplate.getEnabled(), undefined, "success getting template undefined getEnabled.");
				assert.equal(oTemplate.getDescription(), "Fiori Master Details test", "success getting " +
					"template getDescription.");
				assert.equal(oTemplate.getPath(), "ui5template/fioriMasterDetail", "success getting template getPath.");
				assert.equal(oTemplate.getFileName(), "fioriMasterDetailTemplate.zip", "success getting template getFileName.");
				assert.equal(oTemplate.getModelFileName(), "model.json", "success getting template getModelFileName");
				assert.equal(oTemplate.getModelRoot(), "fioriMasterDetail", "success getting template getModelRoot.");
				assert.equal(oTemplate.getAdditionalData(), undefined, "success getting template getAdditionalData.");
				assert.equal(oTemplate.getVersion(), "1.4.0", "success getting template getVersion.");
				assert.equal(oTemplate.getTemplateClass()._sName,
					"sap.watt.saptoolsets.fiori.project.ui5template/fioriMasterDetail/fioriMasterDetailTemplate",
					"success getting template getTemplateClass name.");
				assert.equal(oTemplate.getRequiredTemplates(), undefined, "success getting template getRequiredTemplates.");
				assert.equal(oTemplate.getRequiredModules(), undefined, "success getting template getRequiredModules.");
				assert.equal(oTemplate.getRequiredModulePaths(), undefined, "success getting template getRequiredModulePaths.");
				assert.equal(oTemplate.getAdditionalData(), undefined, "success getting template getAdditionalData.");

			});
		});

		it("Test getCategoryById", function() {
			return oTemplateService.getCategoryById("SAP.Fiori.Application").then(function(oCategory) {
				assert.ok(oCategory, "success getting oCategory");
				assert.equal(oCategory.getId(), "SAP.Fiori.Application", "Got right category ID");
				assert.equal(oCategory.getName(), "SAP Fiori Application", "Got right category name");
				assert.equal(oCategory.getDescription(), "SAP Fiori starter applications", "Got right category Description");
			});
		});

		it("Fiori Reference Apps - additional data exist", function() {
			return oTemplateService.getTemplatesPerCategories("referenceProject").then(function(aCategories) {
				var bResult = true;
				var bNext = true;
				var referenceTempaltes;
				for (var i = 0; i < aCategories.length && bNext; i++) {
					referenceTempaltes = aCategories[i].templates;
					for (var j = 0; j < referenceTempaltes.length; j++) {
						var AdditionalData = referenceTempaltes[j].getAdditionalData();
						if (!AdditionalData || jQuery.isEmptyObject(AdditionalData) || !AdditionalData.projectName) {
							bResult = false;
							bNext = false;
							break;
						}
					}
				}
				assert.ok(bResult, "Fiori Reference Apps supposed to have additional data with project name attribute");
			});
		});

		it("Template prototype - onAfterGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationComponent": {
						"parameters": {
							"ViewTypesCollection": {
								"type": "Entity",
								"multiplicity": "many",
								"isRoot": true,
								"value": {
									"name": "JavaScript",
									"value": "JavaScript"
								},
								"wizard": {
									"control": "ComboBox",
									"required": true,
									"title": "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip": "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace": {
								"type": "string",
								"value": "myNameSpace1",
								"wizard": {
									"control": "TextField",
									"required": false,
									"title": "basicSAPUI5ApplicationProject_namespace_title",
									"regExp": "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg": "nameSpace_model_parameters_name_validationError"
								}
							},

							"name": {
								"type": "string",
								"value": "myView1",
								"wizard": {
									"control": "TextField",
									"required": true,
									"title": "basicSAPUI5ApplicationProject_view_name_title",
									"regExp": "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg": "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};

				var projectZip = new JSZip();
				projectZip.file("Mobile.view.js", "1");
				projectZip.file("View1.controller.js", "2");

				return oTemplate.onAfterGenerate(projectZip, oModel).then(function(aResults) {

					var sFileContent1 = aResults[0].file("myView1.controller.js").asText();
					var sFileContent2 = aResults[0].file("myView1.view.js").asText();

					assert.ok(sFileContent1 === "2", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "1", "Second file exist with correct name and content");

				});
			});

		});

		it("Template prototype onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationComponent": {
						"parameters": {
							"ViewTypesCollection": {
								"type": "Entity",
								"multiplicity": "many",
								"isRoot": true,
								"value": {
									"name": "XML",
									"value": "XML"
								},
								"wizard": {
									"control": "ComboBox",
									"required": true,
									"title": "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip": "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace": {
								"type": "string",
								"value": "view",
								"wizard": {
									"control": "TextField",
									"required": false,
									"title": "basicSAPUI5ApplicationProject_namespace_title",
									"regExp": "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg": "nameSpace_model_parameters_name_validationError"
								}
							},

							"name": {
								"type": "string",
								"value": "myView",
								"wizard": {
									"control": "TextField",
									"required": true,
									"title": "basicSAPUI5ApplicationProject_view_name_title",
									"regExp": "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg": "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.xml.tmpl", "1");
				templateZip.file("View1.controller.js.tmpl", "2");

				oModel.componentPath = "/d_json";
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.myView", "View namespace should be view.myView");
					assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "myView", "View should be myView in model");

				});
			});
		});

		it("Template prototype configWizardSteps", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.ok(aSteps.length === 2, "SAPUI5 Application Component template should configure 2 custom steps");
				});
			});
		});

		it("Template prototype template - isValid", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				return oTemplate.validateOnSelection({}).then(function(bResult) {
					assert.ok(bResult, "SAPUI5 Application Component template should be valid on selection");
				});
			});
		});

		it("Test templates getTemplatesPerCategories - Checks that Favorite category exists ", function() {
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
						}
					}
				}
				assert.ok(bFound, "Favorite category was not found");
			});
		});
		
		it("Test templates getTemplatesPerCategories - Checks that Favorite category as templates from user Preferences ", function() {
			var oTemplates = {
				templates : [ "fioriexttemplate.extensionProject", "sap.ui.ui5-template-plugin.1worklist", "ui5template.smarttemplate"]
			};
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates[0].getId() === "fioriexttemplate.extensionProject", "template fioriexttemplate.extensionProject is not exists");
							assert.ok(aCategories[i].templates[1].getId() === "sap.ui.ui5-template-plugin.1worklist", "template sap.ui.ui5-template-plugin.1worklist is not exists");
							assert.ok(aCategories[i].templates[2].getId() === "ui5template.smarttemplate", "template ui5template.smarttemplate is not exists");
						}
					}
				}
				
				assert.ok(bFound, "Favorite category was not found");
			});
		});
	
		it("Test templates getTemplatesPerCategories - Getting Favorite template with 1 of them is non exists", function() {
			var oTemplates = {
				templates : [ "fioriexttemplate.extensionProject", "fakeTemplateId", "ui5template.smarttemplate"]
			};
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates[0].getId() === "fioriexttemplate.extensionProject", "template fioriexttemplate.extensionProject is not exists");
							assert.ok(aCategories[i].templates[1].getId() === "ui5template.smarttemplate", "template ui5template.smarttemplate is not exists");
							assert.ok(aCategories[i].templates.length === 2, "number of templates should be 2");
						}
					}
				}
				
				assert.ok(bFound, "Favorite category was not found");
			});			
		});
		
		it("Test templates getTemplatesPerCategories - Getting Favorite template with non exists templates", function() {
			var oTemplates = {
				templates : ["fakeTemplateId"]
			};
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates.length === 0, "no templates should be exists");
						}
					}
				}
				
				assert.ok(bFound, "Favorite category was not found");
			});
		});
		
		it("Test templates getTemplatesPerCategories - Checks that Favorite category doesn't have templates from user Preferences ", function() {
			var oTemplates = {
				templates : []
			};
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates.length === 0, "no templates should be exists");
						}
					}
				}
				
				assert.ok(bFound, "Favorite category was not found");
			});
		});	
		
		it("Test templates getTemplatesPerCategories - Checks that user Preferences empty object", function() {
			var oTemplates = {};
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates.length === 0, "no templates should be exists");
						}
					}
				}

				assert.ok(bFound, "Favorite category was not found");
			});
		});	
		
		it("Test templates getTemplatesPerCategories - Checks that user Preferences returns undefined.", function() {
			var oTemplates = undefined;
			
			aStubs.push(sinon.stub(oPreferencesService, "get").returns(Q(oTemplates)));
			
			return oTemplateService.getTemplatesPerCategories(undefined, undefined).then(function(aCategories) {
				if (!aCategories) {
					assert.ok(false, "getTemplatesPerCategories failed");
				}
				if (aCategories.length > 0) {
					var len = aCategories.length;
					var bFound = false;
					for (var i = 0; i < len; i++) {
					
						if (aCategories[i].category.getId() === "Favorite") {
							bFound = true;
							assert.ok(aCategories[i].templates.length === 0, "no templates should be exists");
						}
					}
				}

				assert.ok(bFound, "Favorite category was not found");
			});
		});	
	});
});