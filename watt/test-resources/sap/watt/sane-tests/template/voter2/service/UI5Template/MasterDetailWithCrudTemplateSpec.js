define(["STF", "sap/watt/lib/jszip/jszip-shim", "sane-tests/template/util/basicProjectUtil/BasicProjectUtil"] , function(STF, JSZip, BasicProjectUtil) {

	"use strict";

	var suiteName = "MasterDetailWithCrudTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService;
		var oMDWithCrudModel = {
	"datasource": {
		"type": "odata",
		"url": ""
	},
	"2masterdetail": {
		"environment": {
			"internal": "false",
			"resourcePath": ""
		},
		"parameters": {
			"ApplicationNamespace": {
				"type": "string",
				"value": "ns1",
				"appDescriptor": {
					"id": "Namespace"
				},
				"wizard": {
					"required": true,
					"internalOnly": "false",
					"control": "TextField",
					"title": "Namespace"
				}
			},
			"ApplicationTitle": {
				"type": "string",
				"value": "mdWithCrudTitle",
				"appDescriptor": {
					"id": "sap.app.title"
				},
				"wizard": {
					"required": true,
					"internalOnly": "false",
					"control": "TextField",
					"title": "Title"
				}
			},
			"ApplicationDescription": {
				"type": "string",
				"value": "some description",
				"appDescriptor": {
					"id": "sap.app.description"
				},
				"wizard": {
					"control": "TextField",
					"required": false,
					"internalOnly": "false",
					"title": "Description"
				}
			},
			"ApplicationComponentHierarchy": {
				"type": "string",
				"value": "ach",
				"appDescriptor": {
					"id": "sap.app.ach"
				},
				"wizard": {
					"control": "TextField",
					"required": true,
					"internalOnly": "true",
					"title": "Application Component Hierarchy"
				}
			},
			"FioriID": {
				"type": "string",
				"value": "",
				"appDescriptor": {
					"id": "sap.fiori.registrationIds"
				},
				"wizard": {
					"control": "TextField",
					"required": "false",
					"internalOnly": "true",
					"title": "SAP Fiori ID"
				}
			},
			"ABAPDeployPath": {
				"type": "string",
				"value": "",
				"appDescriptor": {
					"id": "sap.platform.abap.uri"
				},
				"wizard": {
					"control": "TextField",
					"required": "false",
					"internalOnly": "true",
					"title": "Path for ABAP Deployment"
				}
			},
			"ObjectCollection": {
				"type": "Entity",
				"multiplicity": "many",
				"isRoot": true,
				"binding": "@datasource.entities",
				"value": "FlightCollection",
				"wizard": {
					"control": "ComboBox",
					"required": "true",
					"title": "Object Collection",
					"tooltip": ""
				}
			},
			"Object_Identifier": {
				"type": "string",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.ObjectCollection.value.elements",
				"value": "carrid",
				"wizard": {
					"control": "ComboBox",
					"required": "true",
					"title": "Object Title",
					"tooltip": ""
				}
			},
			"ObjectCollection_Key": {
				"type": "Property.Key",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.ObjectCollection.value.elements",
				"value": "connid",
				"wizard": {
					"control": "ComboBox",
					"required": "true",
					"title": "Object Collection ID",
					"tooltip": ""
				}
			},
			"Object_Number": {
				"type": "Property.Number",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.ObjectCollection.value.elements",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Object Numeric Attribute",
					"tooltip": ""
				}
			},
			"Object_UnitOfMeasure": {
				"type": "string",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.ObjectCollection.value.elements",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Object Unit of Measure",
					"tooltip": ""
				}
			},
			"DefineReplacement": {
				"type": "string",
				"value": ""
			},
			"LineItemCollection": {
				"type": "Entity",
				"multiplicity": "many",
				"isRoot": true,
				"binding": "@2masterdetail.parameters.ObjectCollection.value.navigations",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Line Item Collection",
					"tooltip": ""
				}
			},
			"LineItemCollection_Key": {
				"type": "Property.Key",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.LineItemCollection.value.elements",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Line Item Collection ID",
					"tooltip": ""
				}
			},
			"LineItem_Identifier": {
				"type": "string",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.LineItemCollection.value.elements",
				"value": "",
				"required": "false",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Line Item Title",
					"tooltip": ""
				}
			},
			"LineItem_Number": {
				"type": "Property.Number",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.LineItemCollection.value.elements",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Line Item Numeric Attribute",
					"tooltip": ""
				}
			},
			"LineItem_UnitOfMeasure": {
				"type": "string",
				"multiplicity": "one",
				"binding": "@2masterdetail.parameters.LineItemCollection.value.elements",
				"value": "",
				"wizard": {
					"control": "ComboBox",
					"required": "false",
					"title": "Line Item Unit of Measure",
					"tooltip": ""
				}
			}
		},
		"forms": [
			{
				"title": "Master-Detail Customizing",
				"groups": [
					{
						"title": "Data Binding - Object",
						"parameters": [
							"@2masterdetail.parameters.ObjectCollection",
							"@2masterdetail.parameters.ObjectCollection_Key",
							"@2masterdetail.parameters.Object_Identifier",
							"@2masterdetail.parameters.Object_Number",
							"@2masterdetail.parameters.Object_UnitOfMeasure"
						]
					},
					{
						"title": "Data Binding - Line Item",
						"parameters": [
							"@2masterdetail.parameters.LineItemCollection",
							"@2masterdetail.parameters.LineItemCollection_Key",
							"@2masterdetail.parameters.LineItem_Identifier",
							"@2masterdetail.parameters.LineItem_Number",
							"@2masterdetail.parameters.LineItem_UnitOfMeasure"
						]
					}
				]
			}, {
			"type": "appDescriptorGenericStep",
			"groups": [{
				"parameters": ["@2masterdetail.parameters.ApplicationTitle",
							"@2masterdetail.parameters.ApplicationNamespace",
							"@2masterdetail.parameters.ApplicationDescription",
							"@2masterdetail.parameters.ApplicationComponentHierarchy",
							"@2masterdetail.parameters.FioriID",
							"@2masterdetail.parameters.ABAPDeployPath"	
				]
			}]
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

		it("Test Master Detail With CRUD template - Category", function() {
			return oTemplateService.getTemplate("ui5template.2masterdetailcrud", "1.34.3").then(function(oTemplate) {
				assert.equal(oTemplate._mConfig.category, "SAP.Fiori.Application", "Master Detail With CRUD template category is 'SAP.Fiori.Application'");
			});
		});

		it("Test Master Detail With CRUD template - Template Type", function() {
			return oTemplateService.getTemplate("ui5template.2masterdetailcrud", "1.34.3").then(function(oTemplate) {
				assert.equal(oTemplate._mConfig.templateType, "project", "Master Detail With CRUD template  type is project");
			});
		});

		it("Test Master Detail With CRUD template - customValidation", function() {
			return oTemplateService.getTemplate("ui5template.2masterdetailcrud", "1.34.3").then(function(oTemplate) {
				oTemplate.customValidation().then(function(result) {
					assert.equal(result, true, "Master Detail With CRUD  template is validate on selection ");
				});
			});
		});

		

	});

});