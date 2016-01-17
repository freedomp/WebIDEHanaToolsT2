define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "BasicSAPUI5ApplicationComponentTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter1/service/Template/config.json"}).then(function () {
				oTemplateService = getService('template');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		it("SAPUI5 Application Component template - isValid", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				return oTemplate.validateOnSelection({}).then(function(bResult) {
					assert.ok(bResult, "SAPUI5 Application Component template should be valid on selection");
				});
			});
		});

		it("SAPUI5 Application Component template - configWizardSteps", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.ok(aSteps.length === 2, "SAPUI5 Application Component template should configure 2 custom steps");
				});
			});
		});


		it("SAPUI5 Application Component template with View type : Xml - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationComponent":
					{
						"parameters" :
						{
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "XML",
									"value": "XML"
								},
								"wizard" :
								{
									"control" : "ComboBox",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace" :
							{
								"type" : "string",
								"value" : "view",
								"wizard" :
								{
									"control" : "TextField",
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_namespace_title",
									"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
								}
							},

							"name" :
							{
								"type" : "string",
								"value" : "myView",
								"wizard" :
								{
									"control" : "TextField",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};



				var templateZip = new JSZip();
				templateZip.file("Mobile.view.xml.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");

				oModel.componentPath = "/d_json";
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.myView", "View namespace should be view.myView");
					assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "myView", "View should be myView in model");

				});
			});
		});

		it("SAPUI5 Application Component template with View type : Xml - onBeforeTemplateGenerate - complex component path",
			function() {
				return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
					var oModel = {
						"basicSAPUI5ApplicationComponent":
						{
							"parameters" :
							{
								"ViewTypesCollection" :
								{
									"type" : "Entity",
									"multiplicity" : "many",
									"isRoot" : true,
									"value" : {
										"name": "XML",
										"value": "XML"
									},
									"wizard" :
									{
										"control" : "ComboBox",
										"required" : true,
										"title" : "basicSAPUI5ApplicationProject_view_type_title",
										"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
									}
								},
								"namespace" :
								{
									"type" : "string",
									"value" : "view",
									"wizard" :
									{
										"control" : "TextField",
										"required" : false,
										"title" : "basicSAPUI5ApplicationProject_namespace_title",
										"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
										"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
									}
								},

								"name" :
								{
									"type" : "string",
									"value" : "myView",
									"wizard" :
									{
										"control" : "TextField",
										"required" : true,
										"title" : "basicSAPUI5ApplicationProject_view_name_title",
										"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
										"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
									}
								}
							}
						}
					};



					var templateZip = new JSZip();
					templateZip.file("Mobile.view.xml.tmpl","1");
					templateZip.file("View1.controller.js.tmpl","2");

					oModel.componentPath = "/d_json/service";
					return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
						var oNewModel = aResults[1];

						assert.ok(oNewModel.viewNamespace === "view.service.myView", "View namespace should be view.myView");
						assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "myView", "View should be myView in model");

					});
				});
			});


		it("SAPUI5 Application Component template with View type : Json  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationComponent":
					{
						"parameters" :
						{
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "JSON",
									"value": "JSON"
								},
								"wizard" :
								{
									"control" : "ComboBox",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace" :
							{
								"type" : "string",
								"value" : "view",
								"wizard" :
								{
									"control" : "TextField",
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_namespace_title",
									"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
								}
							},

							"name" :
							{
								"type" : "string",
								"value" : "myView1",
								"wizard" :
								{
									"control" : "TextField",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.json.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");

				oModel.componentPath = "/d_json";
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.myView1", "View namespace should be view.myView1");
					assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "myView1", "View should be myView1 in model");

				});
			});
		});


		it("SAPUI5 Application Component template with View type : Html  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {

				var oModel = {
					"basicSAPUI5ApplicationComponent":
					{
						"parameters" :
						{
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "HTML",
									"value": "HTML"
								},
								"wizard" :
								{
									"control" : "ComboBox",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace" :
							{
								"type" : "string",
								"value" : "view",
								"wizard" :
								{
									"control" : "TextField",
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_namespace_title",
									"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
								}
							},

							"name" :
							{
								"type" : "string",
								"value" : undefined,
								"wizard" :
								{
									"control" : "TextField",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.html.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");

				oModel.componentPath = "/d_json";
				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.View1", "View namespace should be view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "View1", "View should be View1 in model");

				});
			});
		});



		it("SAPUI5 Application Component template with View type : JavaScript  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {

				var oModel = {
					"basicSAPUI5ApplicationComponent":
					{
						"parameters" :
						{
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "JavaScript",
									"value": "JavaScript"
								},
								"wizard" :
								{
									"control" : "ComboBox",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace" :
							{
								"type" : "string",
								"value" : "",
								"wizard" :
								{
									"control" : "TextField",
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_namespace_title",
									"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
								}
							},

							"name" :
							{
								"type" : "string",
								"value" : undefined,
								"wizard" :
								{
									"control" : "TextField",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};
				oModel.componentPath = "/555/service";

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.js.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");

				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "service.View1", "View namespace should be service.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "View1", "View should be View1 in model");

				});
			});
		});

		it("SAPUI5 Application Component template with View type : JavaScript  - onBeforeTemplateGenerate - componentPath missing /",
			function() {
				return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {

					var oModel = {
						"basicSAPUI5ApplicationComponent":
						{
							"parameters" :
							{
								"ViewTypesCollection" :
								{
									"type" : "Entity",
									"multiplicity" : "many",
									"isRoot" : true,
									"value" : {
										"name": "JavaScript",
										"value": "JavaScript"
									},
									"wizard" :
									{
										"control" : "ComboBox",
										"required" : true,
										"title" : "basicSAPUI5ApplicationProject_view_type_title",
										"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
									}
								},
								"namespace" :
								{
									"type" : "string",
									"value" : "",
									"wizard" :
									{
										"control" : "TextField",
										"required" : false,
										"title" : "basicSAPUI5ApplicationProject_namespace_title",
										"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
										"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
									}
								},

								"name" :
								{
									"type" : "string",
									"value" : undefined,
									"wizard" :
									{
										"control" : "TextField",
										"required" : true,
										"title" : "basicSAPUI5ApplicationProject_view_name_title",
										"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
										"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
									}
								}
							}
						}
					};
					oModel.componentPath = "service";

					var templateZip = new JSZip();
					templateZip.file("Mobile.view.js.tmpl","1");
					templateZip.file("View1.controller.js.tmpl","2");

					return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
						var oNewModel = aResults[1];

						assert.ok(oNewModel.viewNamespace === "View1", "View namespace should be View1");
						assert.ok(oNewModel.basicSAPUI5ApplicationComponent.parameters.name.value === "View1", "View should be View1 in model");

					});
				});
			});


		it("SAPUI5 Application Component template - onAfterGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationComponent").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationComponent":
					{
						"parameters" :
						{
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "JavaScript",
									"value": "JavaScript"
								},
								"wizard" :
								{
									"control" : "ComboBox",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_type_title",
									"tooltip" : "basicSAPUI5ApplicationProject_view_type_title"
								}
							},
							"namespace" :
							{
								"type" : "string",
								"value" : "myNameSpace1",
								"wizard" :
								{
									"control" : "TextField",
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_namespace_title",
									"regExp" : "^[a-zA-Z_]+([.]?[a-zA-Z0-9\\-_]+)*?$",
									"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
								}
							},

							"name" :
							{
								"type" : "string",
								"value" : "myView1",
								"wizard" :
								{
									"control" : "TextField",
									"required" : true,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					}
				};

				var projectZip = new JSZip();
				projectZip.file("Mobile.view.js","1");
				projectZip.file("View1.controller.js","2");


				return oTemplate.onAfterGenerate(projectZip, oModel).then(function(aResults) {

					var sFileContent1 = aResults[0].file("myView1.controller.js").asText();
					var sFileContent2 = aResults[0].file("myView1.view.js").asText();

					assert.ok(sFileContent1 === "2", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "1", "Second file exist with correct name and content");

				});
			});
		});
	});
});
