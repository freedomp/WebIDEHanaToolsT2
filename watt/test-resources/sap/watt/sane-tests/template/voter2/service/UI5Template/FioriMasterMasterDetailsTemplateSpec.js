define(["STF", "sap/watt/lib/jszip/jszip-shim", "sane-tests/template/util/basicProjectUtil/BasicProjectUtil"] , function(STF, JSZip, BasicProjectUtil) {

	"use strict";

	var suiteName = "FioriMasterMasterDetailsTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;
		var oMasterMasterModel = {
			"datasource" :
			{
				"type" : "odata",
				"url" : ""
			},
			"fioriMasterMasterDetail":
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
					"Master1Title" :
					{
						"type" : "string",
						"value" : "",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master1_title_title",
							"tooltip" : "master1_title_tooltip"
						}
					},
					"Master1ODataCollection" :
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
							"title" : "master1_collection_title",
							"tooltip" : "master1_collection_tooltip"
						}
					},
					"Master1SearchPlaceholder" :
					{
						"type" : "string",
						"value" : "Search",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master1_search_placeholder_title"
						}
					},
					"Master1SearchTooltip" :
					{
						"type" : "string",
						"value" : "Search for items in the list",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master1_search_tooltip_title"
						}
					},
					"Master1SearchField" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master1ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master1_search_field_title",
							"tooltip" : "master1_search_field_tooltip"
						}
					},
					"Master1ItemTitle" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master1ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "false",
							"title" : "master1_item_title_title",
							"tooltip" : "master1_item_title_tooltip"
						}
					},
					"Master1Attribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master1ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master1_attribute1_title",
							"tooltip" : "master1_attribute1_tooltip"
						}
					},
					"Master1Attribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master1ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master1_attribute2_title",
							"tooltip" : "master1_attribute2_tooltip"
						}
					},
					"Master2Title" :
					{
						"type" : "string",
						"value" : "",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master2_title_title",
							"tooltip" : "master2_title_tooltip"
						}
					},
					"Master2ODataCollection" :
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"binding" : "@fioriMasterMasterDetail.parameters.Master1ODataCollection.value.navigations",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : false,
							"title" : "master2_collection_title",
							"tooltip" : "master2_collection_tooltip"
						}
					},
					"Master2SearchPlaceholder" :
					{
						"type" : "string",
						"value" : "Search",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master2_search_placeholder_title"
						}
					},
					"Master2SearchTooltip" :
					{
						"type" : "string",
						"value" : "Search for items in the list",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "master2_search_tooltip_title"
						}
					},
					"Master2SearchField" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master2_search_field_title",
							"tooltip" : "master2_search_field_tooltip"
						}
					},
					"Master2ItemTitle" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "false",
							"title" : "master2_item_title_title",
							"tooltip" : "master2_item_title_tooltip"
						}
					},
					"Master2NumericAttribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master2_numeric_attribute_title",
							"tooltip" : "master2_numeric_attribute_tooltip"
						}
					},
					"Master2UnitsAttribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master2_units_attribute_title",
							"tooltip" : "master2_units_attribute_tooltip"
						}
					},
					"Master2Attribute" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master2_attribute_title",
							"tooltip" : "master2_attribute_tooltip"
						}
					},
					"Master2Status" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "master2_status_title",
							"tooltip" : "master2_status_tooltip"
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
					"DetailAttribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "detail_attribute1_title",
							"tooltip" : "master2_detail_attribute1_tooltip"
						}
					},
					"DetailAttribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "detail_attribute2_title",
							"tooltip" : "master2_detail_attribute2_tooltip"
						}
					},
					"DetailAttribute3" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@fioriMasterMasterDetail.parameters.Master2ODataCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "detail_attribute3_title",
							"tooltip" : "master2_detail_attribute3_tooltip"
						}
					}
				},
				"forms" : [
					{
						"title" : "Fiori Master Master Detail Application",
						"groups" : [
							{
								"title" : "project_settings_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.ProjectNamespace"]
							},
							{
								"title": "master1_section_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.Master1Title","@fioriMasterMasterDetail.parameters.Master1ODataCollection","@fioriMasterMasterDetail.parameters.Master1SearchPlaceholder","@fioriMasterMasterDetail.parameters.Master1SearchTooltip", "@fioriMasterMasterDetail.parameters.Master1SearchField"]
							},
							{
								"title": "master1_data_fields_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.Master1ItemTitle", "@fioriMasterMasterDetail.parameters.Master1Attribute1", "@fioriMasterMasterDetail.parameters.Master1Attribute2"]
							},
							{
								"title": "master2_section_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.Master2Title","@fioriMasterMasterDetail.parameters.Master2ODataCollection","@fioriMasterMasterDetail.parameters.Master2SearchPlaceholder","@fioriMasterMasterDetail.parameters.Master2SearchTooltip", "@fioriMasterMasterDetail.parameters.Master2SearchField"]
							},
							{
								"title": "master2_data_fields_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.Master2ItemTitle", "@fioriMasterMasterDetail.parameters.Master2NumericAttribute", "@fioriMasterMasterDetail.parameters.Master2UnitsAttribute", "@fioriMasterMasterDetail.parameters.Master2Status", "@fioriMasterMasterDetail.parameters.Master2Attribute"]
							},
							{
								"title": "detail_section_group_title",
								"parameters": ["@fioriMasterMasterDetail.parameters.DetailTitle","@fioriMasterMasterDetail.parameters.DetailAttribute1","@fioriMasterMasterDetail.parameters.DetailAttribute2","@fioriMasterMasterDetail.parameters.DetailAttribute3"]
							}
						]
					}
				]
			}
		};

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/voter2/service/UI5Template/config.json"}).then(function () {
				oTemplateService = getService('template');
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Test Master Master Detail template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.0").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({},{fioriMasterMasterDetail:{parameters:{ProjectNamespace:{}, Master2ODataCollection:{}}}, projectName:"nameOfProject"})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriMasterMasterDetail.parameters.ProjectNamespace.value, "nameOfProject",
							"If the user has not provided a value for the namespace, it should be equal to project name");
					});
			});
		});

		it("Test Master Master Detail template - project namespace", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.0").then(function(oTemplate) {
				return oTemplate.onBeforeTemplateGenerate({},{fioriMasterMasterDetail:{parameters:{ProjectNamespace:{value : "namespace"}, Master2ODataCollection:{}}}})
					.then(function(aResult) {
						assert.equal(aResult[1].fioriMasterMasterDetail.parameters.ProjectNamespace.value, "namespace",
							"If the user has provided a value for the namespace, it should be equal to the provided value");
					});
			});
		});

		it("Test Master Master Detail template - configWizardSteps", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.0").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.equal(aSteps.length, 2, "Fiori Master Master Detail template should configure two custom steps");
					assert.equal(aSteps[0].getOptional(), true, "In Fiori Master Master Detail template the service catalog step should be optional");
				});
			});
		});

		it("Test Master Master Detail template - validateOnSelection", function() {
			return oTemplateService.getTemplate("sap.ui.ui5-template-plugin.2masterdetail", "1.0.0").then(function(oTemplate) {
				oTemplate.validateOnSelection().then(function(result) {
					assert.equal(result, true, "Fiori Master Master Detail is validateOnSelection ");
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

		it("Generate Fiori Master Master Detail project and check files", function () {
			var that = this;

			var oOptions = {
				templateId: "sap.ui.ui5-template-plugin.2masterdetail",
				templateVersion : "1.0.0",
				model: oMasterMasterModel
			};

			//Setup
			return _initTestProject.call(this, "fioriMasterMasterDetail", oOptions).then(function (oProject) {

				//Check Project created
				assert.ok(oProject != null, "fioriMasterMasterDetail - Project created");

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

				aAssertPromises.push(that.oBasicUtil.getFileFolder("view").then(function(oViewFolderDocument) {
					return oViewFolderDocument.getFolderContent().then(function(aFolderContent){
						var oDetailControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Detail.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oDetailControllerDoc.length, 1 , "Detail.controller.js created");
						var oDetailViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Detail.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oDetailViewDoc.length, 1 , "Detail.view.xml created");
						var oMaster2ControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master2.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMaster2ControllerDoc.length, 1 , "Master2.controller.js created");
						var oMaster2ViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master2.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMaster2ViewDoc.length, 1 , "Master2.view.xml created");
						var oMasterControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMasterControllerDoc.length, 1 , "Master.controller.js created");
						var oMasterViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Master.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oMasterViewDoc.length, 1 , "Master.view.xml created");
						var oAppControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "App.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oAppControllerDoc.length, 1 , "App.controller.js created");
						var oAppViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "App.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oAppViewDoc.length, 1 , "App.view.xml created");
						var oNotFoundControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "NotFound.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oNotFoundControllerDoc.length, 1 , "NotFound.controller.js created");
						var oNotFoundViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "NotFound.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oNotFoundViewDoc.length, 1 , "Welcome.view.xml created");
						var oWelcomeControllerDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Welcome.controller.js" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oWelcomeControllerDoc.length, 1 , "Welcome.controller.js created");
						var oWelcomeViewDoc = _.filter(aFolderContent, function(o){
							if ( o.getEntity().getName() === "Welcome.view.xml" &&  o.getEntity().getType() === "file") {return o;}
						});
						assert.equal(oWelcomeViewDoc.length, 1 , "Welcome.view.xml created");
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
					var oMyRouterJS = _.filter(aFolderContent, function(o){
						if ( o.getEntity().getName() === "MyRouter.js" &&  o.getEntity().getType() === "file") {return o;}
					});
					assert.equal(oMyRouterJS.length, 1 , "MyRouter.js created");

				}));

				return Q.all(aAssertPromises).fin(function () {
					//Teardown
					//that.oBasicUtil.deleteTestProject();
				});
			});

		}) ;

		//************ End of Generation Tests ******************************************************//

	});
});