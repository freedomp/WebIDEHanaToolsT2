define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "TemplateComponentTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService, oFakeFileDAO, oFilesystem;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function () {
				oTemplateService = getService('template');
				oFakeFileDAO = getService('fakeFileDAO');
				oFilesystem = getService('filesystem.documentProvider');

				return createFileStructure();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		var sPluginJSONContent = JSON.stringify({
				"name": "p1",
				"description": "",
				"i18n": "p1/i18n/i18n",
				"requires": {
					"services": [

					]
				},
				"provides": {
					"services": {

					},

					"interfaces": {

					}
				},
				"configures": {
					"services": {

					}
				},
				"subscribes": {

				}
			}
		);

		var sPluginLessJSONContent = JSON.stringify({
				"name": "p1",
				"description": "",
				"i18n": "p1/i18n/i18n",
				"provides": {
					"services": {

					},

					"interfaces": {

					}
				},
				"subscribes": {

				}
			}
		);

		var sNewPluginJSONResult = '{\n    "name": "p1",\n    "description": "",\n    "i18n": "p1/i18n/i18n",\n    "requires": {\n        "services": [\n            "template",\n            "catalogstep",\n            "odataAnnotationSelectionStep",\n            "templateCustomizationStep"\n        ]\n    },\n    "provides": {\n        "services": {},\n        "interfaces": {}\n    },\n    "configures": {\n        "services": {\n            "template:templates": [\n                {\n                    "id": "plug123.t3",\n                    "template": "p1/t3/t3",\n                    "name": "{i18n>Config_template_t3_name}",\n                    "description": "{i18n>Config_template_t3_desc}",\n                    "path": "plug123/t3",\n                    "fileName": "resources.zip",\n                    "modelFileName": "model.json",\n                    "modelRoot": "t3",\n                    "icon": "sap-icon://detail-view",\n                    "internalOnly": false,\n                    "category": "SAP.Fiori.Application",\n                    "wizardSteps": [\n                        "catalogstep",\n                        "odataAnnotationSelectionStep",\n                        "templateCustomizationStep"\n                    ],\n                    "templateType": "project",\n                    "version": "1.0.0",\n                    "orderPriority": 1000,\n                    "requiresNeoApp": true\n                }\n            ]\n        }\n    },\n    "subscribes": {}\n}';
		var sNewPluginJSONLessResult ='{\n    "name": "p1",\n    "description": "",\n    "i18n": "p1/i18n/i18n",\n    "provides": {\n        "services": {},\n        "interfaces": {}\n    },\n    "subscribes": {},\n    "requires": {\n        "services": [\n            "template",\n            "catalogstep",\n            "odataAnnotationSelectionStep",\n            "templateCustomizationStep"\n        ]\n    },\n    "configures": {\n        "services": {\n            "template:templates": [\n                {\n                    "id": "plug123.t3",\n                    "template": "p1/t3/t3",\n                    "name": "{i18n>Config_template_t3_name}",\n                    "description": "{i18n>Config_template_t3_desc}",\n                    "path": "plug1234/t3",\n                    "fileName": "resources.zip",\n                    "modelFileName": "model.json",\n                    "modelRoot": "t3",\n                    "icon": "sap-icon://detail-view",\n                    "internalOnly": false,\n                    "category": "SAP.Fiori.Application",\n                    "wizardSteps": [\n                        "catalogstep",\n                        "odataAnnotationSelectionStep",\n                        "templateCustomizationStep"\n                    ],\n                    "templateType": "project",\n                    "version": "1.0.0",\n                    "orderPriority": 1000,\n                    "requiresNeoApp": true\n                }\n            ]\n        }\n    }\n}'

		function createFileStructure() {
			return oFakeFileDAO.setContent({
				"plug123": {
					"plugin.json" : sPluginJSONContent
				},
				"plug1234": {
					"plugin.json" : sPluginLessJSONContent
				}
			});
		}


		it("Template Component template - configWizardSteps", function() {
			return oTemplateService.getTemplate("plugindevelopment.templatecomponent").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.ok(aSteps.length === 3, "Template Component template should configure 3 custom steps");
				});
			});
		});


		it("Template Component template - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("plugindevelopment.templatecomponent").then(function(oTemplate) {
				var oModel = {
					template : {
						templateType: "project",
						id: "plug123.t1",
						technicalname: "t1",
						name: "t1",
						description: "",
						category: "SAP.Fiori.Application",
						wizardSteps:[]
					}
				};

				var templateZip = new JSZip();
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];
					assert.equal(oNewModel.template.wizardStepsParams.length, 0, "Got empty wizardStepsParams");
					assert.equal(oNewModel.template.wizardStepsParamList, "", "Got empty wizardStepsParams");
					assert.ok(!oNewModel.template.hasCatalogAndCustomizations,
						"Does not have Catalog and Customizations steps");
					assert.ok(!oNewModel.template.hasCatalogAndAnnotations,
						"Does not have Catalog and annotations steps");
				});
			});
		});

		it("Template Component template - onBeforeTemplateGenerate with all steps", function() {
			return oTemplateService.getTemplate("plugindevelopment.templatecomponent").then(function(oTemplate) {
				var oModel = {
					template : {
						templateType: "project",
						id: "plug123.t2",
						technicalname: "t2",
						name: "t2",
						description: "",
						category: "SAP.Fiori.Application",
						wizardSteps: ["catalogstep","odataAnnotationSelectionStep","templateCustomizationStep"]
					}
				};

				var templateZip = new JSZip();
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];
					assert.equal(oNewModel.template.wizardStepsParams.length, 3, "Got empty wizardStepsParams");
					assert.equal(oNewModel.template.wizardStepsParamList,
						'oCatalogstep, oOdataAnnotationSelectionStep, oTemplateCustomizationStep',
						"Got empty wizardStepsParams");
					assert.ok(oNewModel.template.hasCatalogAndCustomizations,
						"Does not have Catalog and Customizations steps");
					assert.ok(oNewModel.template.hasCatalogAndAnnotations,
						"Does not have Catalog and annotations steps");
				});
			});
		});

		it("Template Component template - onAfterGenerate with all steps", function() {
			return oTemplateService.getTemplate("plugindevelopment.templatecomponent").then(function(oTemplate) {
				var oModel = {
					template : {
						templateType: "project",
						id: "plug123.t3",
						technicalname: "t3",
						name: "t3",
						description: "",
						category: "SAP.Fiori.Application",
						wizardSteps: ["catalogstep","odataAnnotationSelectionStep","templateCustomizationStep"]
					},
					componentPath: "/plug123",
					overwrite: false,
					ovveride: false
				};

				var templateZip = new JSZip();
				templateZip.file("model.json","1");
				templateZip.file("sample.js","2");
				templateZip.file("templateClass.js","3");

				return oTemplate.onAfterGenerate(templateZip, oModel).then(function(aResults) {
					var oNewZip = aResults[0];
					assert.ok(oNewZip.files["t3/"], "Found t3 folder");
					assert.ok(oNewZip.files["t3/model.json"], "Found t3/model.json file");
					assert.ok(oNewZip.files["t3/resources/"], "Found t3/resources/ folder");
					assert.ok(oNewZip.files["t3/resources/sample.js.tmpl"], "Found t3/resources/sample.js.tmpl file");
					assert.ok(oNewZip.files["t3/t3.js"], "Found t3/t3.js file");

					// validate updated plugin.json file
					return oFilesystem.getDocument("/plug123/plugin.json").then(function(oPluginJSONDocument) {
						return oPluginJSONDocument.getContent().then(function(sContent) {
							assert.equal(sContent, sNewPluginJSONResult, "plugin.json updated correctly");
						});
					});
				});
			});
		});

		it("Template Component template - onAfterGenerate with all steps and plugin.json is less complex", function() {
			return oTemplateService.getTemplate("plugindevelopment.templatecomponent").then(function(oTemplate) {
				var oModel = {
					template : {
						templateType: "project",
						id: "plug123.t3",
						technicalname: "t3",
						name: "t3",
						description: "",
						category: "SAP.Fiori.Application",
						wizardSteps: ["catalogstep","odataAnnotationSelectionStep","templateCustomizationStep"]
					},
					componentPath: "/plug1234",
					overwrite: false,
					ovveride: false
				};

				var templateZip = new JSZip();
				templateZip.file("model.json","1");
				templateZip.file("sample.js","2");
				templateZip.file("templateClass.js","3");

				return oTemplate.onAfterGenerate(templateZip, oModel).then(function(aResults) {
					var oNewZip = aResults[0];
					assert.ok(oNewZip.files["t3/"], "Found t3 folder");
					assert.ok(oNewZip.files["t3/model.json"], "Found t3/model.json file");
					assert.ok(oNewZip.files["t3/resources/"], "Found t3/resources/ folder");
					assert.ok(oNewZip.files["t3/resources/sample.js.tmpl"], "Found t3/resources/sample.js.tmpl file");
					assert.ok(oNewZip.files["t3/t3.js"], "Found t3/t3.js file");

					// validate updated plugin.json file
					return oFilesystem.getDocument("/plug1234/plugin.json").then(function(oPluginJSONDocument) {
						return oPluginJSONDocument.getContent().then(function(sContent) {
							assert.equal(sContent, sNewPluginJSONLessResult, "plugin.json updated correctly");
						});
					});
				});
			});
		});
	});
});
