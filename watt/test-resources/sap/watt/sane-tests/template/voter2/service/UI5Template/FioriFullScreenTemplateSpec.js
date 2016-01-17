define(["STF", "sap/watt/lib/jszip/jszip-shim", "sane-tests/template/util/basicProjectUtil/BasicProjectUtil"] , function(STF, JSZip, BasicProjectUtil) {

	"use strict";

	var suiteName = "FioriFullScreenTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;
		var oFullModel = {

			"datasource" :
			{
				"type" : "odata",
				"url" : ""
			},
			"fioriFullScreen":
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
					"Page1Title" :
					{
						"type" : "string",
						"value" : "",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master_title_title",
							"tooltip" : "page1_title_tooltip"
						}
					},
					"FullscreenODataCollection" :
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
					"Page1ItemTitle" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "false",
							"title" : "master_item_title_title",
							"tooltip" : "master_item_title_tooltip"
						}
					},
					"Page1NumericAttribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master_numeric_attribute_title",
							"tooltip" : "master_numeric_attribute_tooltip"
						}
					},
					"Page1UnitsAttribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master_units_attribute_title",
							"tooltip" : "master_units_attribute_tooltip"
						}
					},
					"StatusAttribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master_status_attribute_title",
							"tooltip" : "master_status_attribute_tooltip"
						}
					},
					"Page1Attribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "page1_attribute1_title",
							"tooltip" : "page1_attribute1_tooltip"
						}
					},
					"Page2Title" :
					{
						"type" : "string",
						"value" : "",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "detail_title_title",
							"tooltip" : "page2_title_tooltip"
						}
					},
					"Page2Attribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "page2_attribute1_title",
							"tooltip" : "page2_attribute_tooltip"
						}
					},
					"Page2Attribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "page2_attribute2_title",
							"tooltip" : "page2_attribute_tooltip"
						}
					},
					"NavigateCollection" :
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"binding" : "@fioriFullScreen.parameters.FullscreenODataCollection.value.navigations",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : false,
							"title" : "navigation_collection_title",
							"tooltip" : "fullscreen_navigation_collection_tooltip"
						}
					},
					"NavigateAttribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.NavigateCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "navigation_attribute1_title",
							"tooltip" : "fullscreen_navigation_attribute_tooltip"
						}
					},
					"NavigateAttribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.NavigateCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "navigation_attribute2_title",
							"tooltip" : "fullscreen_navigation_attribute_tooltip"
						}
					},
					"NavigateAttribute3" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriFullScreen.parameters.NavigateCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "navigation_attribute3_title",
							"tooltip" : "fullscreen_navigation_attribute_tooltip"
						}
					}
				},
				"forms" : [
					{
						"title" : "fiori_fullscreen_forms_groups_title",
						"groups" : [
							{
								"title" : "forms_title1",
								"parameters": ["@fioriFullScreen.parameters.ProjectNamespace"]
							},
							{
								"title": "forms_page1_title2",
								"parameters": ["@fioriFullScreen.parameters.Page1Title","@fioriFullScreen.parameters.FullscreenODataCollection","@fioriFullScreen.parameters.Page1ItemTitle", "@fioriFullScreen.parameters.Page1NumericAttribute", "@fioriFullScreen.parameters.Page1UnitsAttribute", "@fioriFullScreen.parameters.StatusAttribute", "@fioriFullScreen.parameters.Page1Attribute1"]
							},
							{
								"title": "forms_page2_title3",
								"parameters": ["@fioriFullScreen.parameters.Page2Title","@fioriFullScreen.parameters.Page2Attribute1","@fioriFullScreen.parameters.Page2Attribute2"]
							},
							{
								"title": "forms_title4",
								"parameters": ["@fioriFullScreen.parameters.NavigateCollection","@fioriFullScreen.parameters.NavigateAttribute1","@fioriFullScreen.parameters.NavigateAttribute2","@fioriFullScreen.parameters.NavigateAttribute3"]
							}
						]
					}
				]
			}
		};

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter2/service/UI5Template/config.json"}).then(function () {
				oTemplateService = getService('template');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Test Full Screen template - Category", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				assert.equal(oTemplate._mConfig.category, "general", "Fiori Full Screen template category is 'SAP.Fiori.Application'");
			});
		});

		it("Test Full Screen template - Template Type", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				assert.equal(oTemplate._mConfig.templateType, "project", "Fiori Full Screen template type is project");
			});
		});

		it("Test Full Screen template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({}, {fioriFullScreen:{parameters:{ProjectNamespace:{}}},projectName:"nameOfProject"})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriFullScreen.parameters.ProjectNamespace.value, "nameOfProject",
							"If the user has not provided a value for the namespace, it should be equal to project name");
					});
			});
		});

		it("Test Full Screen template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({},{fioriFullScreen:{parameters:{ProjectNamespace:{value : "namespace"}}}})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriFullScreen.parameters.ProjectNamespace.value, "namespace",
							"If the user has provided a value for the namespace, it should be equal to the provided value");
					});
			});
		});

		it("Test Full Screen template - configWizardSteps", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.equal(aSteps.length, 2, "Fiori Full Screen template should configure two custom steps");
					assert.equal(aSteps[0].getOptional(), true, "In Fiori Full Screen template the service catalog step should be optional");
				});
			});
		});

		it("Test Full Screen template - Internal only", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				assert.equal(oTemplate.getInternalOnly(), false, "Fiori Full Screen template is not internal only");
			});
		});

		it("Test Full Screen template - validateOnSelection", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.1worklist", "1.0.0").then(function(oTemplate) {
				oTemplate.validateOnSelection().then(function(result) {
					assert.equal(result, true, "Fiori Full Screen template is validateOnSelection ");
				});
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

		it("Generate Full Screen project and check files", function () {
			var that = this;

			var oOptions = {
				templateId: "sap.ui.ui5-template-plugin.1worklist",
				templateVersion : "1.0.0",
				model: oFullModel
			};

			//Setup
			return _initTestProject.call(this, "fioriFullScreen", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "fioriFullScreen - Project created");

				var aAssertPromises = [];

				//Static TMPL checks

				aAssertPromises.push(that.oBasicUtil.getFileFolder("i18n").then(function(oI18NFolderDocument) {
					return oI18NFolderDocument.getFolderContent().then(function(aFolderContent){
						var oMsgBndlProp = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "messageBundle.properties" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMsgBndlProp.length, 1 , "messageBundle.properties created");
					});

				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("util").then(function(oUtilFolderDocument) {
					return oUtilFolderDocument.getFolderContent().then(function(aFolderContent){
						var oMsgsJS = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "messages.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMsgsJS.length, 1 , "messages.js created");
					});

				}));

				aAssertPromises.push(that.oBasicUtil.getFileFolder("view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						var oDetailsControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Details.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oDetailsControllerDoc.length, 1 , "Details.controller.js created");
						var oDetailsViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Details.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oDetailsViewDoc.length, 1 , "Details.view.xml created");
						var oMainControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Main.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMainControllerDoc.length, 1 , "Main.controller.js created");
						var oMainViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Main.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMainViewDoc.length, 1 , "Main.view.xml created");
						var oMasterControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMasterControllerDoc.length, 1 , "Master.controller.js created");
						var oMasterViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMasterViewDoc.length, 1 , "Master.view.xml created");
					});

				}));

				aAssertPromises.push(oProject.getFolderContent().then(function(aFolderContent) {
					var oProjectJSON = _.filter(aFolderContent, function(o){
						if ( o.getEntity().getName() === ".project.json" &&  o.getEntity().getType() === "file") {return o;}
					});
					assert.equal(oProjectJSON.length, 1 , ".project.json created");
					var oComponentJS = _.filter(aFolderContent, function(o){
						if ( o.getEntity().getName() === "Component.js" &&  o.getEntity().getType() === "file") {return o;}
					});
					assert.equal(oComponentJS.length, 1 , "Component.js created");
					var oIndexHTML = _.filter(aFolderContent, function(o){
						if ( o.getEntity().getName() === "index.html" &&  o.getEntity().getType() === "file") {return o;}
					});
					assert.equal(oIndexHTML.length, 1 , "index.html created");
					var oLocalIndexHTML = _.filter(aFolderContent, function(o){
						if ( o.getEntity().getName() === "localIndex.html" &&  o.getEntity().getType() === "file") {return o;}
					});
					assert.equal(oLocalIndexHTML.length, 1 , "localIndex.html created");

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