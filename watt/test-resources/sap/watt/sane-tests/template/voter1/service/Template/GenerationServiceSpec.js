define(["sap/watt/lib/lodash/lodash",
		"STF",
		"sap/watt/ideplatform/plugin/template/service/Generation",
		"sap/watt/ideplatform/plugin/generationwizard/core/ContextDocBuilder", "sane-tests/template/util/basicProjectUtil/BasicProjectUtil"
	],
	function(_, STF, Generation, ContextDocBuilder, BasicProjectUtil) {

		"use strict";

		var suiteName = "Generation_Integration",
			getService = STF.getServicePartial(suiteName);
			
		describe(suiteName, function() {
			var oFakeFileDAO, oFileService, oTemplateService, oGenerationService, oRepoBrowser, oContextDocBuilder;

			before(function() {
				return STF.startWebIde(suiteName, {
					config: "template/config.json"
				}).then(function() {
					oFakeFileDAO = getService('fakeFileDAO');
					oFileService = getService('filesystem.documentProvider');
					oTemplateService = getService('template');
					oGenerationService = getService('generation');
					oRepoBrowser = getService('repositorybrowser');

					// require the metadata handler class from the Web IDE
					oRepoBrowser.setSelection = function() {
						return Q();
					};

					// oFakeFileDAO.importZip = function(){
					// 	return Q([]);
					// };

					oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
				});
			});

			after(function() {
				STF.shutdownWebIde(suiteName);
			});

			it("Test generateProject method - all parameters are undefined", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {

					var oFileStructure = {
						"parent": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oGenerationService.generateProject(null, null, null, null).fail(function() {
							assert.ok(true, "generation should failed");
						});
					});
				});
			});

			it("Test generateProject method - sPath is null", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {

					var model = {
						"basicSAPUI5ApplicationProject": {
							"parameters": {
								"ViewTypesCollection": {
									"value": {
										"value": "Xml"
									}
								},
								"namespace": {
									"value": "view"
								},
								"name": {
									"value": "myView"
								}
							}
						}
					};

					var oFileStructure = {
						"parent": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/parent").then(function(oParentDocument) {
							return oGenerationService.generateProject(null, mTemplates["ui5template.basicSAPUI5ApplicationProject"], model, false,
								oParentDocument).fail(function() {
								assert.ok(true, "generation should failed");
							});
						});
					});

				});
			});

			it("Test generateProject method - oSelectedTemplate is null", function() {
				return oTemplateService.getTemplates().then(function(mTemplatehs) {

					var model = {
						"basicSAPUI5ApplicationProject": {
							"parameters": {
								"ViewTypesCollection": {
									"value": {
										"value": "Xml"
									}
								},
								"namespace": {
									"value": "view"
								},
								"name": {
									"value": "myView"
								}
							}
						}
					};

					var oFileStructure = {
						"parent": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/parent").then(function(oParentDocument) {
							return oGenerationService.generateProject("/test", null, model, false, oParentDocument).fail(function() {
								assert.ok(true, "generation should failed");
							});
						});
					});
				});
			});

			it("Test generateProject method - oModel is null", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {
					var oFileStructure = {
						"parent": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/parent").then(function(oParentDocument) {
							return oGenerationService.generateProject("/test1", mTemplates["ui5template.basicSAPUI5ApplicationProject"], null, false,
								oParentDocument).fail(function() {
								assert.ok(true, "generation should failed");
							});
						});
					});
				});
			});

			it("Test generateProject method - bOverwrite is true", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {

					var model = {
						"basicSAPUI5ApplicationProject": {
							"parameters": {
								"ViewTypesCollection": {
									"value": {
										"value": "Xml"
									}
								},
								"namespace": {
									"value": "view"
								},
								"name": {
									"value": "myView"
								}
							}
						},
						selectedTemplate: {
							getId: function() {
								return "some id";
							},
							getVersion: function() {
								return "some version";
							},
							getRequiredModulePaths: function() {
								return [{
									"moduleName": "{projectName}",
									"path": "./{someValueFromModel}"
								}];
							},
							getRequiredModules: function() {
								return [];
							}
						}
					};

					var oFileStructure = {
						"parent": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/parent").then(function(oParentDocument) {
							return oGenerationService.generateProject("/test2", mTemplates["ui5template.basicSAPUI5ApplicationProject"], model, true,
								oParentDocument).then(function() {
								assert.ok(true, "generation should succeed");
							});
						});
					});
				});
			});

			it("Test generateProject method - bOverwrite is false",function(){
				return oTemplateService.getTemplates().then(function(mTemplates) {

					var model = {
						"basicSAPUI5ApplicationProject" : {
							"parameters" : {
								"ViewTypesCollection" :
								{
									"value" : {
										"value": "Xml"
									}
								},
								"namespace" :
								{
									"value" : "view"
								},
								"name" :
								{
									"value" : "myView"
								}
							}
						},
						selectedTemplate : {
							getId : function(){
								return "some id";
							},
							getVersion : function(){
								return "some version";
							},
							getRequiredModulePaths : function() {
								return [
									{
										"moduleName" : "{projectName}",
										"path" : "./{someValueFromModel}"
									}
								];
							},
							getRequiredModules : function() {
								return [];
							}
						}
					};

					var oFileStructure = {
						"parent" : {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/parent").then(function(oParentDocument){
							return oGenerationService.generateProject("/parent/test3", mTemplates["ui5template.basicSAPUI5ApplicationProject"], model, false,oParentDocument).then(function(){
								return assert.ok(true, "generation should succeed");
							});
						});
					});
				});
			});
			
					it("Test generateProject method - oParentDocument is undefined",function(){
						return oTemplateService.getTemplates().then(function(mTemplates) {

							var model = {
								"basicSAPUI5ApplicationProject" : {
									"parameters" : {
										"ViewTypesCollection" :
										{
											"value" : {
												"value": "Xml"
											}
										},
										"namespace" :
										{
											"value" : "view"
										},
										"name" :
										{
											"value" : "myView"
										}
									}
								},
								selectedTemplate : {
									getId : function(){
										return "some id";
									},
									getVersion : function(){
										return "some version";
									},
									getRequiredModulePaths : function() {
										return [
											{
												"moduleName" : "{projectName}",
												"path" : "./{someValueFromModel}"
											}
										];
									},
									getRequiredModules : function() {
										return [];
									}
								}
							};

							var oFileStructure = {
								"parent" : {}
							};

							return oFakeFileDAO.setContent(oFileStructure).then(function() {
								return oGenerationService.generateProject("/test4", mTemplates["ui5template.basicSAPUI5ApplicationProject"], model, false).then(function(){
									return assert.ok(true, "generation should succeed");
								});
							});
						});
					});

					it("Test generate template", function(){
						return oTemplateService.getTemplates().then(function(mTemplates) {
							assert.ok(mTemplates !== undefined, "success to create the template model.");
							assert.ok(mTemplates["ui5template.basicSAPUI5ApplicationProject"] !== undefined, "ui5template.basicSAPUI5ApplicationProject template was initialized correctly");
							// Mock model for ui5template.emptyDesktopProject template (only view name)

							var model = {
								"basicSAPUI5ApplicationProject" : {
									"parameters" : {
										"ApplicationTypesCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "many",
											"isRoot" : true,
											"value" : {
												"name": "Desktop",
												"value": "Desktop"
											},
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : true,
												"title" : "basicSAPUI5ApplicationProject_application_type_title",
												"tooltip" : "basicSAPUI5ApplicationProject_application_type_title"
											}
										},
										"ViewTypesCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "many",
											"isRoot" : true,
											"value" : {
												"name": "Xml",
												"value": "Xml"
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
												"required" : false,
												"title" : "basicSAPUI5ApplicationProject_view_name_title",
												"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
												"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
											}
										}
									}
								},
								"selectedTemplate" : {
									getId : function(){
										return "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromexistinglibrary";
									},
									getVersion : function(){
										return "some version";
									},
									getRequiredModulePaths : function() {
										return [
											{
												"moduleName" : "{projectName}",
												"path" : "./{someValueFromModel}"
											}
										];
									},
									getRequiredModules : function() {
										return [];
									}
								}
							};

							var oFileStructure = {
								"test5" : {
									"t1.txt": "test"
								}
							};

							return oFakeFileDAO.setContent(oFileStructure).then(function() {
								return oFileService.getDocument("/test5").then(function(oTargetDocument){
									return oGenerationService.generate("/test5", mTemplates["ui5template.basicSAPUI5ApplicationProject"], model, false, oTargetDocument).then(function(){
										return assert.ok(true, "generation should succeed");
									});
								});
							});
						});
					});

					it("Test Fiori master detail template generate with xml templates", function(){
						return oTemplateService.getTemplates().then(function(mTemplates) {
							assert.ok(mTemplates !== undefined, "success to create the template model.");
							assert.ok(mTemplates["sap.ui.ui5-template-plugin.2masterdetail"] !== undefined, "sap.ui.ui5-template-plugin.2masterdetail template was initialized correctly");
							// Mock model for ui5template.emptyDesktopProject template (only view name)

							var model = {
								"datasource" :
								{
									"type" : "odata",
									"url" : ""
								},
								"fioriMasterDetail":
								{
									"parameters" :
									{
										"ServiceDetails" :
										{
											"serviceName" : ""
										},
										"ProjectNamespace" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : false,
												"title" : "project_namespace",
												"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9_]*([\\.]?[a-zA-Z_]+[a-zA-Z0-9_]*)*$",
												"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
											}
										},
										"MasterTitle" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "master_title_title",
												"tooltip" : "master_title_tooltip"
											}
										},
										"MasterODataCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "many",
											"isRoot" : "true",
											"binding" : "@datasource.entities",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : "false",
												"title" : "master_collection_title",
												"tooltip" : "master_collection_tooltip"
											}
										},
										"MasterItemTitle" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : "false",
												"title" : "master_item_title_title",
												"tooltip" : "master_item_title_tooltip"
											}
										},
										"MasterNumericAttribute" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "master_numeric_attribute_title",
												"tooltip" : "master_numeric_attribute_tooltip"
											}
										},
										"MasterUnitsAttribute" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "master_units_attribute_title",
												"tooltip" : "master_units_attribute_tooltip"
											}
										},
										"DetailTitle" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "detail_title_title",
												"tooltip" : "detail_title_tooltip"
											}
										},
										"DetailText" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "detail_text_title",
												"tooltip" : "detail_text_tooltip"
											}
										},
										"DetailStatus" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_status_title",
												"tooltip" : "detail_status_tooltip"
											}
										},
										"DetailAttribute1" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute1_title",
												"tooltip" : "detail_attribute1_tooltip"
											}
										},
										"DetailAttribute2" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute2_title",
												"tooltip" : "detail_attribute2_tooltip"
											}
										},
										"DetailAttribute3" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute3_title",
												"tooltip" : "detail_attribute3_tooltip"
											}
										},
										"NavigateCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.navigations",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : false,
												"title" : "navigation_collection_title",
												"tooltip" : "masterdetail_navigation_collection_tooltip"
											}
										},
										"NavigateAttribute1" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute1_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										},
										"NavigateAttribute2" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute2_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										},
										"NavigateAttribute3" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute3_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										}
									},
									"forms" : [
										{
											"title" : "forms_groups_title",
											"groups" : [
												{
													"title" : "forms_title1",
													"parameters": ["@fioriMasterDetail.parameters.ProjectNamespace"]
												},
												{
													"title": "forms_title2",
													"parameters": ["@fioriMasterDetail.parameters.MasterTitle","@fioriMasterDetail.parameters.MasterODataCollection","@fioriMasterDetail.parameters.MasterItemTitle", "@fioriMasterDetail.parameters.MasterNumericAttribute", "@fioriMasterDetail.parameters.MasterUnitsAttribute"]
												},
												{
													"title": "forms_title3",
													"parameters": ["@fioriMasterDetail.parameters.DetailTitle","@fioriMasterDetail.parameters.DetailText","@fioriMasterDetail.parameters.DetailStatus","@fioriMasterDetail.parameters.DetailAttribute1","@fioriMasterDetail.parameters.DetailAttribute2","@fioriMasterDetail.parameters.DetailAttribute3"]
												},
												{
													"title": "forms_title4",
													"parameters": ["@fioriMasterDetail.parameters.NavigateCollection","@fioriMasterDetail.parameters.NavigateAttribute1","@fioriMasterDetail.parameters.NavigateAttribute2","@fioriMasterDetail.parameters.NavigateAttribute3"]
												}
											]
										}
									]
								},
								"selectedTemplate" : {
									getId : function(){
										return "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromexistinglibrary";
									},
									getRequiredModulePaths : function() {
										return [
											{
												"moduleName" : "{projectName}",
												"path" : "./{someValueFromModel}"
											}
										];
									},
									getRequiredModules : function() {
										return [];
									}
								},
								"xmlViewTemplates": [
									{
										"viewPath": "/views/view1.xml",
										"viewDescription" : "The application main view",
										"preprocess" : true,
										"bindings": [
											{
												"name": "meta1",
												"metadataElementForBindingContext" : "@fioriMasterDetail.parameters.MasterODataCollection.value",
												"bindingContext": "/"
											},
											{
												"name": "meta2",
												"metadataElementForBindingContext" : "@fioriMasterDetail.parameters.MasterODataProperty1.value"
											}
										]
									},
									{
										"viewPath": "/views/view2.xml",
										"viewDescription" : "The application details view",
										"preprocess" : true,
										"bindings": [
											{
												"name": "meta3",
												"metadataElementForBindingContext" : "@fioriMasterDetail.parameters.MasterODataCollection2.value"
											}
										]
									}
								]
							};

							var oFileStructure = {
								"test6" : {
									"t1.txt": "test"
								}
							};

							return oFakeFileDAO.setContent(oFileStructure).then(function() {
								return oFileService.getDocument("/test6").then(function(oTargetDocument){
									return oGenerationService.generate("/test6", mTemplates["sap.ui.ui5-template-plugin.2masterdetail"], model, false, oTargetDocument).then(function(){
										assert.ok(true, "generation should succeed");
									});
								});
							});
						});
					});

					it("Test Fiori master detail template generate with xml templates dataSourceModel", function(){
						return oTemplateService.getTemplates().then(function(mTemplates) {
							assert.ok(mTemplates !== undefined, "success to create the template model.");
							assert.ok(mTemplates["sap.ui.ui5-template-plugin.2masterdetail"] !== undefined, "sap.ui.ui5-template-plugin.2masterdetail template was initialized correctly");
							// Mock model for ui5template.emptyDesktopProject template (only view name)

							var model = {
								"fioriMasterDetail":
								{
									"parameters" :
									{
										"ServiceDetails" :
										{
											"serviceName" : ""
										},
										"ProjectNamespace" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : false,
												"title" : "project_namespace",
												"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9_]*([\\.]?[a-zA-Z_]+[a-zA-Z0-9_]*)*$",
												"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
											}
										},
										"MasterTitle" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "master_title_title",
												"tooltip" : "master_title_tooltip"
											}
										},
										"MasterODataCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "many",
											"isRoot" : "true",
											"binding" : "@datasource.entities",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : "false",
												"title" : "master_collection_title",
												"tooltip" : "master_collection_tooltip"
											}
										},
										"MasterItemTitle" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : "false",
												"title" : "master_item_title_title",
												"tooltip" : "master_item_title_tooltip"
											}
										},
										"MasterNumericAttribute" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "master_numeric_attribute_title",
												"tooltip" : "master_numeric_attribute_tooltip"
											}
										},
										"MasterUnitsAttribute" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "master_units_attribute_title",
												"tooltip" : "master_units_attribute_tooltip"
											}
										},
										"DetailTitle" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "detail_title_title",
												"tooltip" : "detail_title_tooltip"
											}
										},
										"DetailText" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : "false",
												"title" : "detail_text_title",
												"tooltip" : "detail_text_tooltip"
											}
										},
										"DetailStatus" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_status_title",
												"tooltip" : "detail_status_tooltip"
											}
										},
										"DetailAttribute1" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute1_title",
												"tooltip" : "detail_attribute1_tooltip"
											}
										},
										"DetailAttribute2" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute2_title",
												"tooltip" : "detail_attribute2_tooltip"
											}
										},
										"DetailAttribute3" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "detail_attribute3_title",
												"tooltip" : "detail_attribute3_tooltip"
											}
										},
										"NavigateCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.MasterODataCollection.value.navigations",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : false,
												"title" : "navigation_collection_title",
												"tooltip" : "masterdetail_navigation_collection_tooltip"
											}
										},
										"NavigateAttribute1" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute1_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										},
										"NavigateAttribute2" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute2_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										},
										"NavigateAttribute3" :
										{
											"type" : "string",
											"multiplicity" : "one",
											"binding" : "@fioriMasterDetail.parameters.NavigateCollection.value.elements",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required": "false",
												"title" : "navigation_attribute3_title",
												"tooltip" : "masterdetail_navigation_attribute_tooltip"
											}
										}
									},
									"forms" : [
										{
											"title" : "forms_groups_title",
											"groups" : [
												{
													"title" : "forms_title1",
													"parameters": ["@fioriMasterDetail.parameters.ProjectNamespace"]
												},
												{
													"title": "forms_title2",
													"parameters": ["@fioriMasterDetail.parameters.MasterTitle","@fioriMasterDetail.parameters.MasterODataCollection","@fioriMasterDetail.parameters.MasterItemTitle", "@fioriMasterDetail.parameters.MasterNumericAttribute", "@fioriMasterDetail.parameters.MasterUnitsAttribute"]
												},
												{
													"title": "forms_title3",
													"parameters": ["@fioriMasterDetail.parameters.DetailTitle","@fioriMasterDetail.parameters.DetailText","@fioriMasterDetail.parameters.DetailStatus","@fioriMasterDetail.parameters.DetailAttribute1","@fioriMasterDetail.parameters.DetailAttribute2","@fioriMasterDetail.parameters.DetailAttribute3"]
												},
												{
													"title": "forms_title4",
													"parameters": ["@fioriMasterDetail.parameters.NavigateCollection","@fioriMasterDetail.parameters.NavigateAttribute1","@fioriMasterDetail.parameters.NavigateAttribute2","@fioriMasterDetail.parameters.NavigateAttribute3"]
												}
											]
										}
									]
								},
								"selectedTemplate" : {
									getId : function(){
										return "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromexistinglibrary";
									},
									getRequiredModulePaths : function() {
										return [
											{
												"moduleName" : "{projectName}",
												"path" : "./{someValueFromModel}"
											}
										];
									},
									getRequiredModules : function() {
										return [];
									}
								},
								"datasource" :
								{
									"parameterModel" : {
										"entitySet" :  "@reuseLibraryTemplate.parameters.ODataCollection.value.name",
										"entityType" : "@reuseLibraryTemplate.parameters.ODataCollection.value.entityType",
										"analytics" : false,
										"sap-ui-debug" : false,
										"aggregationBinding" : ""
									},
									"type" : "odata",
									"url" : "",
									"myModel" : {
										"obj1" : {
											"name" : "products"
										},
										"obj2" : {
											"name" : "orders"
										}
									}
								},

								"xmlViewTemplates": [
									{
										"viewPath": "sap/ui/generic/template/ObjectList/view/ObjectListST.view.xml",
										"loadFromResourceZip" : false,
										"bindings": [
											{
												"name": "entitySet",
												"bindingContext": "/obj1/name",
												"metadataElementForBindingContext": "@reuseLibraryTemplate.parameters.ODataCollection.value"
											},
											{
												"name": "meta",
												"metadataElementForBindingContext": "@reuseLibraryTemplate.parameters.ODataCollection.value.entityType"
											},
											{
												"name": "parameter",
												"bindingContext": "/",
												"dataSourceModel" : "@datasource.parameterModel"

											}
										]
									},{
										"viewPath": "sap/ui/generic/template/Details/view/DraftDetails.view.xml",
										"loadFromResourceZip" : false,
										"bindings": [
											{
												"name": "entitySet",
												"metadataElementForBindingContext": "@reuseLibraryTemplate.parameters.ODataCollection.value"
											},
											{
												"name": "meta",
												"metadataElementForBindingContext": "@reuseLibraryTemplate.parameters.ODataCollection.value.entityType"
											},
											{
												"name": "parameter",
												"bindingContext": "/",
												"dataSourceModel" : "@datasource.parameterModel"

											}
										]
									}
								],
								"reuseLibraryTemplate":
								{
									"parameters" :
									{
										"ProjectNamespace" :
										{
											"type" : "string",
											"value" : "",
											"wizard" :
											{
												"control" : "TextField",
												"required" : false,
												"title" : "runTime_namespace",
												"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9_]*([\\.]?[a-zA-Z_]+[a-zA-Z0-9_]*)*$",
												"regExpErrMsg" : "nameSpace_model_parameters_name_validationError"
											}
										},
										"ODataCollection" :
										{
											"type" : "Entity",
											"multiplicity" : "many",
											"isRoot" : "true",
											"binding" : "@datasource.entities",
											"value" : "",
											"wizard" :
											{
												"control" : "ComboBox",
												"required" : "true",
												"title" : "runTime_odata_collection_title",
												"tooltip" : "runTime_odata_collection_tooltip"
											}
										}
									},
									"forms" : [
										{
											"title" : "rtXMLTemplate_model_form_title",
											"groups" : [
												{
													"title": "runTime_title",
													"parameters": ["@reuseLibraryTemplate.parameters.ProjectNamespace", "@reuseLibraryTemplate.parameters.ODataCollection"]
												}
											]
										}
									]
								}
							};

							var oFileStructure = {
								"test7" : {
									"t1.txt": "test"
								}
							};

							return oFakeFileDAO.setContent(oFileStructure).then(function() {
								return oFileService.getDocument("/test7").then(function(oTargetDocument){
									return oGenerationService.generate("/test7", mTemplates["sap.ui.ui5-template-plugin.2masterdetail"], model, false, oTargetDocument).then(function(){
										assert.ok(true, "generation should succeed");
									});
								});
							});
						});
					});

			it("Test generate template - path is undefined", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {
					assert.ok(mTemplates !== undefined, "success to create the template model.");
					assert.ok(mTemplates["ui5template.basicSAPUI5ApplicationProject"] !== undefined,
						"ui5template.basicSAPUI5ApplicationProject template was initialized correctly");

					var model = {};

					var oFileStructure = {
						"test8": {}
					};

					// Mock model for ui5template.emptyDesktopProject template (only view name)
					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/test8").then(function(oTargetDocument) {
							return oGenerationService.generate(undefined, mTemplates["ui5template.basicSAPUI5ApplicationProject"],
								model, false, oTargetDocument).then(function() {
								assert.ok(true, "generation should succeed");
							}).fail(function(oError) {
								assert.ok(oError, "Success getting error object");
								assert.equal(oError.message, "Invalid Location path", "Got the right error message");
							});
						});
					});
				});
			});

			it("Test generate template - selectedTemplate is undefined", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {
					assert.ok(mTemplates !== undefined, "success to create the template model.");
					assert.ok(mTemplates["ui5template.basicSAPUI5ApplicationProject"] !== undefined,
						"ui5template.basicSAPUI5ApplicationProject template was initialized correctly");

					var model = {};

					var oFileStructure = {
						"test9": {}
					};

					// Mock model for ui5template.emptyDesktopProject template (only view name)
					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/test9").then(function(oTargetDocument) {
							return oGenerationService.generate("/test9", undefined,
								model, false, oTargetDocument).then(function() {
								assert.ok(true, "generation should succeed");
							}).fail(function(oError) {
								assert.ok(oError, "Success getting error object");
								assert.equal(oError.message, "No template selected", "Got the right error message");
							});
						});
					});
				});
			});

			it("Test generate template - selected template file name is not defined", function() {
				return oTemplateService.getTemplates().then(function(mTemplates) {
					assert.ok(mTemplates !== undefined, "success to create the template model.");
					assert.ok(mTemplates["ui5template.basicSAPUI5ApplicationProject"] !== undefined,
						"ui5template.basicSAPUI5ApplicationProject template was initialized correctly");
					// Mock model for ui5template.emptyDesktopProject template (only view name)

					var model = {
						"basicSAPUI5ApplicationProject": {
							"parameters": {
								"ApplicationTypesCollection": {
									"type": "Entity",
									"multiplicity": "many",
									"isRoot": true,
									"value": {
										"name": "Desktop",
										"value": "Desktop"
									},
									"wizard": {
										"control": "ComboBox",
										"required": true,
										"title": "basicSAPUI5ApplicationProject_application_type_title",
										"tooltip": "basicSAPUI5ApplicationProject_application_type_title"
									}
								},
								"ViewTypesCollection": {
									"type": "Entity",
									"multiplicity": "many",
									"isRoot": true,
									"value": {
										"name": "Xml",
										"value": "Xml"
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
										"required": false,
										"title": "basicSAPUI5ApplicationProject_view_name_title",
										"regExp": "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
										"regExpErrMsg": "viewXML_model_parameters_name_validationError"
									}
								}
							},
							getVersion: function() {
								return "some version";
							}
						}
					};

					var oFileStructure = {
						"test10": {}
					};

					return oFakeFileDAO.setContent(oFileStructure).then(function() {
						return oFileService.getDocument("/test10").then(function(oTargetDocument) {
							var ui5template = mTemplates["ui5template.basicSAPUI5ApplicationProject"];
							ui5template.getFileName = function() {
								return null;
							};
							return oGenerationService.generate("/test10", ui5template, model, false,
								oTargetDocument).then(function() {
								assert.ok(true, "generation should succeed");
							}).fail(function(oError) {
								assert.ok(oError, "Success getting error object");
								assert.equal(oError.message, "Cannot read property 'files' of null", "Got the right error message");
							});
						});
					});
				});
			});

			it('_getProjectOptionsFromModel', function() {
				//Test with good model
				var oModel = {
					"mytemplate": {
						"parameters": {
							"param1": {
								"value": "param1 value"
							},
							"param2": {
								"value": "param2 value"
							}
						}
					}
				};

				var oSmartDoc = oContextDocBuilder.Document(oModel);
				var result = Generation._getProjectOptionsFromModel(oSmartDoc, "mytemplate");

				expect(result).to.deep.equal({
					"param1": "param1 value",
					"param2": "param2 value"
				});

				//Test with no model root
				var result2 = Generation._getProjectOptionsFromModel(oSmartDoc);

				expect(result2).to.deep.equal({});

				//Test with wrong model root
				var result3 = Generation._getProjectOptionsFromModel(oSmartDoc, "wrongroot");

				expect(result3).to.deep.equal({});

				//Test with no model & model root
				var result4 = Generation._getProjectOptionsFromModel();

				expect(result4).to.deep.equal({});

				//Test with empty parameters
				var oModel2 = {
					"mytemplate": {
						"parameters": {

						}
					}
				};

				var result5 = Generation._getProjectOptionsFromModel(oContextDocBuilder.Document(oModel2), "mytemplate");

				expect(result5).to.deep.equal({});

				//Test with parameter with no value
				var oModel3 = {
					"mytemplate": {
						"parameters": {
							"param1": {

							},
							"param2": {
								"value": "param2 value"
							}
						}
					}
				};

				var result6 = Generation._getProjectOptionsFromModel(oContextDocBuilder.Document(oModel3), "mytemplate");

				expect(result6).to.deep.equal({
					"param2": "param2 value"
				});
			});

			function _initTestProject(sTestId, oOptions, oConfig) {
				// this context refers to the "environment" of the qUnit test
				// which is the object that also holds the setup() and teardown() functions
				var dTestModuleTimeStamp = Number(new Date());
				this.oBasicUtil = new BasicProjectUtil(sTestId, dTestModuleTimeStamp, getService, oOptions);
				if (!oConfig) {
					return this.oBasicUtil.initializeTestProject();
				} else {
					return this.oBasicUtil.initializeSpecialTestProject(oConfig);
				}
			}

			function _generateMDTemplate(oConfig) {
				var that = this;
				var oModel = {
					"mytemplate": {
						"parameters": {
							"param1": {
								"value": "param1 value"
							},
							"param2": {
								"value": "param2 value"
							}
						}
					}
				};
				var oOptions = {
					templateId: "ui5template.mdWithAttachmentsAnnotation",
					templateVersion : "1.0.0",
					model: oModel
				};
				//Setup
				return _initTestProject.call(this, "mdWithAttachmentsAnnotation_test", oOptions, oConfig).then(function(oProject) {
					return that.oBasicUtil.getFileFolder("view").then(function(oViewDoc) {
						return oViewDoc.getFolderContent().then(function(aFolderContent) {
							var oAppViewFile = _.filter(aFolderContent, function(o) {
								if (o.getEntity().getName() === "App.view.xml" && o.getEntity().getType() === "file") {
									return o;
								}
							});
							return oAppViewFile[0].getContent().then(function(sContent){
								return sContent;
							});
							//assert.equal(, oAppViewFileBefore, "File was beautified");
						});

					});
				});

			}
			it("Generate with beautification ", function() {
				var oExpectedAppViewFile = '<mvc:View displayBlock="true" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">\n' +
					'\t<SplitApp id="idAppControl"/>\n' + '</mvc:View>';
				return _generateMDTemplate.call(this).then(function(sActualAppViewFile) {
					assert.equal(oExpectedAppViewFile, sActualAppViewFile, "File was beautified");
				});
			});

			it("Generate project with beautification - files do not match", function() {
				var oExpectedAppViewFile = '<mvc:View displayBlock="true" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'\t<SplitApp id="idAppControl"/>' + '</mvc:View>';
				return _generateMDTemplate.call(this).then(function(sActualAppViewFile) {
					assert.notEqual(oExpectedAppViewFile, sActualAppViewFile, "File was beautified");
				});
			});

			it("Generate project without beautification - files do not match ", function() {
				var oExpectedAppViewFile = '<mvc:View displayBlock="true" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">\n' +
					'\t<SplitApp id="idAppControl"/>\n' + '</mvc:View>';
				var oConfig = {
					param: "beautifyFiles",
					value: false
				};
				return _generateMDTemplate.call(this, oConfig).then(function(sActualAppViewFile) {
					assert.notEqual(oExpectedAppViewFile, sActualAppViewFile, "File was beautified");
				});
			});
		});
	});