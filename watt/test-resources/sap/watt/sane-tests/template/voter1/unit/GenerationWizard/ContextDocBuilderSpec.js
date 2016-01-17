define(["STF", "sap/watt/ideplatform/plugin/generationwizard/core/ContextDocBuilder"] , function(STF, ContextDocBuilder) {

	"use strict";

	var suiteName = "ContextDocBuilder_Unit";
	var oContextDocBuilder;

	describe(suiteName, function () {

		it("initContextDocBuilder and load document", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			assert.ok(oContextDocBuilder, "test initContextDocBuilder success");
			assert.ok(oSmartDoc, "test Document success");
		});

		it("Test smartDoc reference feature", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				},
				"root3.root4" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			if (oSmartDoc) {
				assert.equal(oSmartDoc.root2.p1, "james cockburn" , "test absulote ref");
				assert.equal(oSmartDoc.root2.p2, "james cockburn" , "test relative ref");
				assert.equal(oSmartDoc['#attributes'].root3.root4.p1, "@root1.parameters.0.name", "Got right inner attrs");
				oSmartDoc.remove("root2");
				assert.ok(!oSmartDoc.root2, "Deletion of root2 successed");
				var result = oSmartDoc.find("p1");
				assert.equal(result.length, 0 , "test relative ref");
			}
		});

		it("test load complex model in document", function() {

			var oComplexModel = {
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
				}
			};

			var oSmartDoc = oContextDocBuilder.Document(oComplexModel);
			assert.ok(oSmartDoc, "test Document success");
			var aSmartDocModelElements = oSmartDoc.modelElements();
			assert.ok(aSmartDocModelElements, "Success getting smart doc model elements");
			assert.equal(aSmartDocModelElements.length, 4, "Got right number for modelElements");
			$.each(aSmartDocModelElements, function(key, item) {
				if (oSmartDoc.resolve(item === "datasource")) {
					assert.ok(item, "Success resolving a datasource item");
				}
			});

		});

		it("test undefined definition", function() {
			var oSmartDoc = oContextDocBuilder.Document(undefined);
			assert.ok(oSmartDoc, "test Document success");
		});

		it("test append function", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				},
				"root3.root4" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			assert.ok(oSmartDoc, "test Document success");
			oSmartDoc.append("root5", {
				"p1" : "@root1.parameters.0.name",
				"p2" : "@.p1"
			});
			assert.ok(oSmartDoc, "test Document success");
			assert.equal(oSmartDoc.root5.p1, "james cockburn" , "got append root");
		});

		it("test toJSONRec function", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				},
				"root3.root4" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			assert.ok(oSmartDoc, "test Document success");
			var JSONRec = oSmartDoc.toJSONRec();
			assert.ok(JSONRec, "Success getting JSON records");
			assert.equal(JSONRec.root1.parameters[0].type, "string" , "got right root1 parameter 1 type");
			assert.equal(JSONRec.root2.p1, "james cockburn" , "got right root 2 p1 value");
			assert.equal(JSONRec.classID, "doc.Object" , "got right classID value");
		});

		it("test dependents function", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				},
				"root3.root4" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			assert.ok(oSmartDoc, "test Document success");
			var isDepends = oSmartDoc.dependents(true);
			assert.ok(isDepends, "test dependents");
			assert.equal(isDepends.length, 1, "got self doc");
			isDepends = oSmartDoc.dependents(false);
			assert.ok(isDepends, "test dependents");
			assert.equal(isDepends.length, 1, "got self doc");
		});

		it("test notify function", function() {
			oContextDocBuilder = ContextDocBuilder.initContextDocBuilder();
			var oModel = {
				"root1" : {
					"parameters" :
						[ {
							"name" : "james cockburn",
							"type" : "string"
						}, {
							"name" : "john mcbugerballs",
							"type" : "int"
						}],
					"value" : "val1"
				},
				"root2" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				},
				"root3.root4" : {
					"p1" : "@root1.parameters.0.name",
					"p2" : "@.p1"
				}
			};
			var oSmartDoc = oContextDocBuilder.Document(oModel);
			assert.ok(oSmartDoc, "test Document success");
			var event = {"name" : "my event", "what" : "...", "who" : {"classID": "", "id": 1} ,"newValue" :""
				,"oldValue" :""};
			oSmartDoc.notify(event, {});
		});
	});
});
