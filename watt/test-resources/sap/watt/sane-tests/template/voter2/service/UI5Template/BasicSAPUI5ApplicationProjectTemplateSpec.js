define(["STF", "sap/watt/lib/jszip/jszip-shim", "sane-tests/template/util/basicProjectUtil/BasicProjectUtil"] , function(STF, JSZip, BasicProjectUtil) {

	"use strict";

	var suiteName = "BasicSAPUI5ApplicationProjectTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter2/service/UI5Template/config.json"}).then(function (oWindows) {
				oWindows.jQuery.sap.require("sap.ui.thirdparty.handlebars");
				oTemplateService = getService('template');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("SAPUI5 Application Project template - isValid", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				return oTemplate.validateOnSelection({}).then(function(bResult) {
					assert.ok(bResult, "SAPUI5 Application Project template should be valid on selection");
				});
			});
		});

		it("SAPUI5 Application Project template - configWizardSteps", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.ok(aSteps.length === 1, "SAPUI5 Application Project template should configure one custom step");
				});
			});
		});

		it("SAPUI5 Application Project template with View type : Xml - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
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
								"value" : undefined,
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
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.xml.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");
				templateZip.file("index.html.tmpl","3");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.view.View1", "View namespace should be view.view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationProject.parameters.name.value === "View1", "View should be View1 in model");
					assert.ok(oNewModel.selectedTemplateId === "some id", "selected template id should be some id in model");
					assert.ok(oNewModel.selectedTemplateVersion === "some version", "selected template version should be some version in model");
				});
			});
		});

		it("SAPUI5 Application Project template with View type : Xml - onBeforeTemplateGenerate - sViewNamespace undefined", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
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
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					},
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.xml.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");
				templateZip.file("index.html.tmpl","3");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.View1", "View namespace should be view.view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationProject.parameters.name.value === "View1", "View should be View1 in model");
				});
			});
		});

		it("SAPUI5 Application Project template with View type : Json  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
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
								"value" : undefined,
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
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.json.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");
				templateZip.file("index.html.tmpl","3");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.view.View1", "View namespace should be view.view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationProject.parameters.name.value === "View1", "View should be View1 in model");

				});
			});
		});

		it("SAPUI5 Application Project template with View type : Html  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
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
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					},
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.html.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");
				templateZip.file("index.html.tmpl","3");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.view.View1", "View namespace should be view.view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationProject.parameters.name.value === "View1", "View should be View1 in model");

				});
			});
		});

		it("SAPUI5 Application Project template with View type : JavaScript  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "JavaScript",
									"value": "JS"
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
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					},
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("Mobile.view.js.tmpl","1");
				templateZip.file("View1.controller.js.tmpl","2");
				templateZip.file("index.html.tmpl","3");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.viewNamespace === "view.view.View1", "View namespace should be view.view.View1");
					assert.ok(oNewModel.basicSAPUI5ApplicationProject.parameters.name.value === "View1", "View should be View1 in model");

				});
			});
		});

		it("SAPUI5 Application Project template with View type : None  - onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "None",
									"value": "None"
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
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					},
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				var templateZip = new JSZip();
				templateZip.file("index.html.tmpl","some content");


				return oTemplate.onBeforeTemplateGenerate(templateZip, oModel).then(function(aResults) {
					var oNewModel = aResults[1];

					assert.ok(oNewModel.basicSAPUI5ApplicationProject.hasView === false, "No view should be display");

				});
			});
		});

		it("SAPUI5 Application Project template - onAfterGenerate", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				var projectZip = new JSZip();

				projectZip.folder("Views");
				projectZip.file("webapp/view/temp.view.js.tmpl","1");
				projectZip.file("webapp/controller/temp.controller.js.tmpl","2");
				projectZip.file("webapp/test/index.html.tmpl","3");



				var oModel = {
					"basicSAPUI5ApplicationProject" : {
						"parameters" : {
							"ViewTypesCollection" :
							{
								"type" : "Entity",
								"multiplicity" : "many",
								"isRoot" : true,
								"value" : {
									"name": "JavaScript",
									"value": "JS"
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
								"value" : "Namespace1",
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
									"required" : false,
									"title" : "basicSAPUI5ApplicationProject_view_name_title",
									"regExp" : "^[a-zA-Z_]+[a-zA-Z0-9\\-_]*$",
									"regExpErrMsg" : "viewXML_model_parameters_name_validationError"
								}
							}
						}
					},
					selectedTemplate : {
						getId : function(){
							return "some id";
						},
						getVersion : function(){
							return "some version";
						}
					}
				};

				return oTemplate.onAfterGenerate(projectZip, oModel).then(function(aResults) {


					var sFileContent1 = aResults[0].file("webapp/test/index.html.tmpl").asText();
					var sFileContent2 = aResults[0].file("webapp/controller/myView1.controller.js.tmpl").asText();
					var sFileContent3 = aResults[0].file("webapp/view/myView1.view.js.tmpl").asText();

					assert.ok(sFileContent1 === "3", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
					assert.ok(sFileContent3 === "1", "Third file exist with correct name and content");

				});
			});
		});

		it("SAPUI5 Application Project template - Category", function() {
			return oTemplateService.getTemplate("ui5template.basicSAPUI5ApplicationProject").then(function(oTemplate) {
				assert.equal(oTemplate._mConfig.category[0], "SAP.Fiori.Application", "SAPUI5 Application Project template category is 'SAP.Fiori.Application'");
				assert.equal(oTemplate._mConfig.category[1], "Common", "SAPUI5 Application Project template category is 'Common'");
			});
		});

		//************** Generation Tests ***********************************************************//

		function _initTestProject(sTestId, oOptions) {
			// this context refers to the "environment" of the qUnit test
			// which is the object that also holds the setup() and teardown() functions
			var dTestModuleTimeStamp = Number(new Date());
			this.oBasicUtil = new BasicProjectUtil(sTestId, dTestModuleTimeStamp, getService, oOptions);
			return this.oBasicUtil.initializeTestProject();
		}

		it("Generate basic ui5 project and check files - version 1.28 & none view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "None"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "xmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.28.1";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.28.1",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectOldVersionNoneView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.28 none view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "folderInfo.txt" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "folderInfo.txt created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "folderInfo.txt" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "folderInfo.txt created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						var aFilesFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "manifest.json" && o.getEntity().getType() === "file") {{return o;}}
						});
						aFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "Component.js" && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "Component.js created");
						assert.equal(aFilesFilter.length, 0 , "manifest.json not created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.30 & none view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "None"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "xmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.30.3";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.30.3",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectNewVersionNoneView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.30 none view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "folderInfo.txt" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "folderInfo.txt created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "folderInfo.txt" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "folderInfo.txt created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ((o.getEntity().getName() === "Component.js" || o.getEntity().getName() === "manifest.json") && o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 2 , "Component.js and manifest.json created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.28 & xml view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "XML"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "xmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.28.1";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.28.1",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectOldVersionXmlView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.28 xml view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "xmlView.controller.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "xmlView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "xmlView.view.xml" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "xmlView.view.xml created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						var aFilesFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "manifest.json" && o.getEntity().getType() === "file") {{return o;}}
						});
						aFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "Component.js" && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "Component.js created");
						assert.equal(aFilesFilter.length, 0 , "manifest.json not created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.30 & xml view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "XML"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "xmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.30.3";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.30.3",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectNewVersionXmlView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.30 xml view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "xmlView.controller.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "xmlView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "xmlView.view.xml" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "xmlView.view.xml created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ((o.getEntity().getName() === "Component.js" || o.getEntity().getName() === "manifest.json") && o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 2 , "Component.js and manifest.json created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.28 & json view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "JSON"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "jsonView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.28.1";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.28.1",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectOldVersionJsonView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.28 json view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsonView.controller.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "jsonView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsonView.view.json" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "jsonView.view.json created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						var aFilesFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "manifest.json" && o.getEntity().getType() === "file") {{return o;}}
						});
						aFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "Component.js" && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "Component.js created");
						assert.equal(aFilesFilter.length, 0 , "manifest.json not created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.30 & json view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "JSON"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "jsonView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.30.3";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.30.3",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectNewVersionJsonView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.30 json view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsonView.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsonView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsonView.view.json" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsonView.view.json created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ((o.getEntity().getName() === "Component.js" || o.getEntity().getName() === "manifest.json") && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 2 , "Component.js and manifest.json created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.28 & js view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "JS"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "jsView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.28.1";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.28.1",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectOldVersionJsView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.28 js view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsView.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsView.view.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsView.view.js created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						var aFilesFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "manifest.json" && o.getEntity().getType() === "file") {{return o;}}
						});
						aFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "Component.js" && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "Component.js created");
						assert.equal(aFilesFilter.length, 0 , "manifest.json not created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.30 & js view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "JS"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "jsView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.30.3";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.30.3",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectNewVersionJsView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.30 js view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsView.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "jsView.view.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "jsView.view.js created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ((o.getEntity().getName() === "Component.js" || o.getEntity().getName() === "manifest.json") && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 2 , "Component.js and manifest.json created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.28 & html view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "HTML"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "htmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.28.1";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.28.1",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectOldVersionHtmlView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.28 html view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "htmlView.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "htmlView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "htmlView.view.html" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "htmlView.view.html created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						var aFilesFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "manifest.json" && o.getEntity().getType() === "file") {{return o;}}
						});
						aFilter = _.filter(aFolderContent, function(o){
							if (o.getEntity().getName() === "Component.js" && o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(aFilter.length, 1 , "Component.js created");
						assert.equal(aFilesFilter.length, 0 , "manifest.json not created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		it("Generate basic ui5 project and check files - version 1.30 & html view", function () {
			var that = this;
			var oModel = {
				"basicSAPUI5ApplicationProject" : {
					"parameters" : {
						"ViewTypesCollection" :
						{
							"value" : {
								"value": "HTML"
							}
						},
						"namespace" :
						{
							"value" : "Namespace1"
						},
						"name" :
						{
							"value" : "htmlView"
						}
					}
				},
				selectedTemplate : {
					getId : function(){
						return "ui5template.basicSAPUI5ApplicationProject";
					},
					getVersion : function(){
						return "1.30.3";
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

			var oOptions = {
				templateId: "ui5template.basicSAPUI5ApplicationProject",
				templateVersion:"1.30.3",
				model: oModel
			};

			//Setup
			return _initTestProject.call(this, "basicSAPUI5ApplicationProjectNewVersionHtmlView", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "basicSAPUI5ApplicationProject version 1.30 html view - Project created");

				var aAssertPromises = [];
				var aFilter = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/controller").then(function(oControllerFolderDocument) {
					return oControllerFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "htmlView.controller.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "htmlView.controller.js created");
						assert.equal(aFolderContent.length, 1 , "Only one file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/css").then(function(oCssFolderDocument) {
					return oCssFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "style.css" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "style.css created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "i18n.properties" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "i18n.properties created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/model").then(function(oModelFolderDocument) {
					return oModelFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "models.js" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "models.js created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oTestFolderDocument) {
					return oTestFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "index.html created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp/view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "htmlView.view.html" &&  o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 1 , "htmlView.view.html created");
						assert.equal(aFolderContent.length, 1 , "Only one view file created");
					});
				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("webapp").then(function(oWebappFolderDocument) {
					return oWebappFolderDocument.getFolderContent().then(function(aFolderContent){
						aFilter = _.filter(aFolderContent, function(o){
							if ((o.getEntity().getName() === "Component.js" || o.getEntity().getName() === "manifest.json") && o.getEntity().getType() === "file") {{return o;}}
						});
						assert.equal(aFilter.length, 2 , "Component.js and manifest.json created");
					});
				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		});

		//************ End of Generation Tests ******************************************************//
	});

});