define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";

	var suiteName = "MDWithAttachmentsAnnotationTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oTemplateService, iFrameWindow, oMockServer;

		before(function () {
			return STF.startWebIde(suiteName, {config: "template/config.json"})
				.then(function (oWindow) {
					oTemplateService = getService('template');
					iFrameWindow = oWindow;

					// prepare mock server
					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					oMockServer = new iFrameWindow.sap.ui.app.MockServer({
						rootUri: '/model/'
					});
					oMockServer.start();
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			if(oMockServer){
				oMockServer.stop();
				oMockServer.destroy();
			}
		});

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter2/service/UI5Template/" +
				sFileName;
		}

		var model = {
			"annotationsXML" : {"content" : ""},
			"datasource" :
			{
				"type" : "odata",
				"url" : ""
			},
			"claimProcessing":
			{
				"parameters" :
				{
					"AppCollection" :
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"isRoot" : "true",
						"binding" : "@datasource.entities",
						"value" : {
							"entityType": "ZCLAIMSERVICE_SRV.DamageReportType",
							"name" : "DamageReportSet",
							"elements" : [
								{"isKey" : true, "name": "Id"},
								{},
								{}
							]
						},
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "true",
							"title" : "mdWithAttachments_model_parameters_AppCollection_title"
						}
					},
					"AttachmentNav" :
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"isRoot" : "true",
						"binding" : "@claimProcessing.parameters.AppCollection.value.navigations",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentNav_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentNav_tooltip"
						}
					},
					"AttachmentCollection":
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"isRoot" : "true",
						"binding" : "@datasource.entities",
						"value" : "=@claimProcessing.parameters.AttachmentNav.value.elements.parent()",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentCollection_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentCollection_tooltip"
						}
					},
					"MasterTitle" :
					{
						"type" : "string",
						"value" : "@claimProcessing.parameters.AppCollection.value.name",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_MasterTitle_title"
						}
					},
					"ItemTitle" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "true",
							"title" : "mdWithAttachments_model_parameters_ItemTitle_title",
							"tooltip" : "mdWithAttachments_model_parameters_ItemTitle_tooltip"
						}
					},
					"IDAttribute" :
					{
						"type" : "Property.Key",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_IDAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_IDAttribute_tooltip"
						}
					},
					"NumericAttribute" :
					{
						"type" : "Property.Number",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_NumericAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_NumericAttribute_tooltip"
						}
					},
					"UnitsAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_UnitsAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_UnitsAttribute_tooltip"
						}
					},
					"StatusAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_StatusAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_StatusAttribute_tooltip"
						}
					},
					"DateAttribute" :
					{
						"type" : "Property.Date",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_DateAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_DateAttribute_tooltip"
						}
					},
					"Attribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_Attribute1_title",
							"tooltip" : "mdWithAttachments_model_parameters_Attribute1_tooltip"
						}
					},
					"Attribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_Attribute2_title",
							"tooltip" : "mdWithAttachments_model_parameters_Attribute2_tooltip"
						}
					},
					"DetailTitle" :
					{
						"type" : "string",
						"value" : "Details",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_DetailTitle_title"
						}
					},
					"DateFormAttribute" :
					{
						"type" : "Property.Date",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_DateFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_DateFormAttribute_tooltip"
						}
					},
					"NumberFormAttribute" :
					{
						"type" : "Property.Number",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_NumberFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_NumberFormAttribute_tooltip"
						}
					},
					"TextFormAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_TextFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_TextFormAttribute_tooltip"
						}
					},
					"EnableApproveReject" :
					{
						"type" : "boolean",
						"value" : "true",
						"wizard" :
						{
							"control" : "CheckBox",
							"required" : true,
							"title" : "mdWithAttachments_model_parameters_EnableApproveReject_title"
						}
					},
					"AttachmentID" :
					{
						"type" : "Property.Key",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentID_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentID_tooltip"
						}
					},
					"AttachmentFileName" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentFileName_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentFileName_tooltip"
						}
					},
					"AttachmentContent" :
					{
						"type" : "Property.Binary",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentContent_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentContent_tooltip"
						}
					},
					"AttachmentContentType" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentContentType_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentContentType_tooltip"
						}
					},
					"AttachmentMainEntityID" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentMainEntityID_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentMainEntityID_tooltip"
						}
					}
				},
				"forms" : [
					{
						"title" : "",
						"groups" : [
							{
								"title" : "mdWithAttachments_model_form_groups_datasource_title",
								"parameters": ["@claimProcessing.parameters.AppCollection",  "@claimProcessing.parameters.AttachmentNav"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_master_title",
								"parameters": ["@claimProcessing.parameters.MasterTitle"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_detail_title",
								"parameters": ["@claimProcessing.parameters.DetailTitle","@claimProcessing.parameters.EnableApproveReject"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_attachment_title",
								"parameters": ["@claimProcessing.parameters.AttachmentCollection", "@claimProcessing.parameters.AttachmentFileName",
									"@claimProcessing.parameters.AttachmentContent", "@claimProcessing.parameters.AttachmentContentType", "@claimProcessing.parameters.AttachmentMainEntityID"]
							}
						]
					}
				]
			}
		};

		var modelEmpty = {
			"annotationsXML" : "",
			"datasource" :
			{
				"type" : "odata",
				"url" : ""
			},
			"claimProcessing":
			{
				"parameters" :
				{
					"AppCollection" :
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
							"title" : "mdWithAttachments_model_parameters_AppCollection_title"
						}
					},
					"AttachmentNav" :
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"isRoot" : "true",
						"binding" : "@claimProcessing.parameters.AppCollection.value.navigations",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentNav_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentNav_tooltip"
						}
					},
					"AttachmentCollection":
					{
						"type" : "Entity",
						"multiplicity" : "many",
						"isRoot" : "true",
						"binding" : "@datasource.entities",
						"value" : "=@claimProcessing.parameters.AttachmentNav.value.elements.parent()",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentCollection_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentCollection_tooltip"
						}
					},
					"MasterTitle" :
					{
						"type" : "string",
						"value" : "@claimProcessing.parameters.AppCollection.value.name",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_MasterTitle_title"
						}
					},
					"ItemTitle" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "true",
							"title" : "mdWithAttachments_model_parameters_ItemTitle_title",
							"tooltip" : "mdWithAttachments_model_parameters_ItemTitle_tooltip"
						}
					},
					"IDAttribute" :
					{
						"type" : "Property.Key",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_IDAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_IDAttribute_tooltip"
						}
					},
					"NumericAttribute" :
					{
						"type" : "Property.Number",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_NumericAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_NumericAttribute_tooltip"
						}
					},
					"UnitsAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_UnitsAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_UnitsAttribute_tooltip"
						}
					},
					"StatusAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_StatusAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_StatusAttribute_tooltip"
						}
					},
					"DateAttribute" :
					{
						"type" : "Property.Date",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_DateAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_DateAttribute_tooltip"
						}
					},
					"Attribute1" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_Attribute1_title",
							"tooltip" : "mdWithAttachments_model_parameters_Attribute1_tooltip"
						}
					},
					"Attribute2" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_Attribute2_title",
							"tooltip" : "mdWithAttachments_model_parameters_Attribute2_tooltip"
						}
					},
					"DetailTitle" :
					{
						"type" : "string",
						"value" : "Details",
						"wizard" :
						{
							"control" : "TextField",
							"required" : "false",
							"title" : "mdWithAttachments_model_parameters_DetailTitle_title"
						}
					},
					"DateFormAttribute" :
					{
						"type" : "Property.Date",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_DateFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_DateFormAttribute_tooltip"
						}
					},
					"NumberFormAttribute" :
					{
						"type" : "Property.Number",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_NumberFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_NumberFormAttribute_tooltip"
						}
					},
					"TextFormAttribute" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AppCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"required": "false",
							"title" : "mdWithAttachments_model_parameters_TextFormAttribute_title",
							"tooltip" : "mdWithAttachments_model_parameters_TextFormAttribute_tooltip"
						}
					},
					"EnableApproveReject" :
					{
						"type" : "boolean",
						"value" : "true",
						"wizard" :
						{
							"control" : "CheckBox",
							"required" : true,
							"title" : "mdWithAttachments_model_parameters_EnableApproveReject_title"
						}
					},
					"AttachmentID" :
					{
						"type" : "Property.Key",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentID_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentID_tooltip"
						}
					},
					"AttachmentFileName" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentFileName_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentFileName_tooltip"
						}
					},
					"AttachmentContent" :
					{
						"type" : "Property.Binary",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentContent_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentContent_tooltip"
						}
					},
					"AttachmentContentType" :
					{
						"type" : "Property.String",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentContentType_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentContentType_tooltip"
						}
					},
					"AttachmentMainEntityID" :
					{
						"type" : "string",
						"multiplicity" : "one",
						"binding" : "@claimProcessing.parameters.AttachmentCollection.value.elements",
						"value" : "",
						"wizard" :
						{
							"control" : "ComboBox",
							"title" : "mdWithAttachments_model_parameters_AttachmentMainEntityID_title",
							"tooltip" : "mdWithAttachments_model_parameters_AttachmentMainEntityID_tooltip"
						}
					}
				},
				"forms" : [
					{
						"title" : "",
						"groups" : [
							{
								"title" : "mdWithAttachments_model_form_groups_datasource_title",
								"parameters": ["@claimProcessing.parameters.AppCollection",  "@claimProcessing.parameters.AttachmentNav"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_master_title",
								"parameters": ["@claimProcessing.parameters.MasterTitle"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_detail_title",
								"parameters": ["@claimProcessing.parameters.DetailTitle","@claimProcessing.parameters.EnableApproveReject"]
							},
							{
								"title" : "mdWithAttachments_model_form_groups_attachment_title",
								"parameters": ["@claimProcessing.parameters.AttachmentCollection", "@claimProcessing.parameters.AttachmentFileName",
									"@claimProcessing.parameters.AttachmentContent", "@claimProcessing.parameters.AttachmentContentType", "@claimProcessing.parameters.AttachmentMainEntityID"]
							}
						]
					}
				]
			}
		};

		it("Test Master Details with Photos Template onBeforeTemplateGenerate", function() {
			return Q(jQuery.get(fullPath("annotationsXML.xml"))).then(function (data) {
				model.annotations = [];
				model.annotations[0] = {content : data};

				return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation").then(function (oTemplate) {
						var projectZip = new JSZip();
						projectZip.file("Mobile.view.js", "1");
						projectZip.file("View1.controller.js", "2");
						return oTemplate.onBeforeTemplateGenerate(projectZip, model).then(function (aResults) {
							var sFileContent1 = aResults[0].file("Mobile.view.js").asText();
							var sFileContent2 = aResults[0].file("View1.controller.js").asText();
							assert.ok(sFileContent1 === "1", "First file exist with correct name and content");
							assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
							assert.equal(aResults[1].claimProcessing.parameters.AttachmentID.value.name, "",
								"Got the expected AttachmentID value name");
							assert.equal(aResults[1].claimProcessing.parameters.DateAttribute.value.name, "CreatedOn",
								"Got the expected DateAttribute value name");
							assert.equal(aResults[1].claimProcessing.parameters.DateFormAttribute.value.name, "CheckedOn",
								"Got the expected DateFormAttribute value name");
							assert.equal(aResults[1].claimProcessing.parameters.IDAttribute.value.name, "Id",
								"Got the expected IDAttribute value name");
							assert.equal(aResults[1].claimProcessing.parameters.ItemTitle.value.name, "DamageReport",
								"Got the expected ItemTitle value name");
						});
				});
			});
		});

		it("Test Master Details with Photos Template onBeforeTemplateGenerate", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation").then(function (oTemplate) {
				var projectZip = new JSZip();
				projectZip.file("Mobile.view.js", "1");
				projectZip.file("View1.controller.js", "2");

				return oTemplate.onBeforeTemplateGenerate(projectZip, modelEmpty).then(function (aResults) {
					var sFileContent1 = aResults[0].file("Mobile.view.js").asText();
					var sFileContent2 = aResults[0].file("View1.controller.js").asText();
					assert.ok(sFileContent1 === "1", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
					assert.equal(aResults[1], modelEmpty, "Got the expected model");
				});
			});
		});


		it("Test Master Details with Photos Template onBeforeTemplateGenerate with offline", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation").then(function(oTemplate) {
				var projectZip = new JSZip();
				projectZip.file("Mobile.view.js","1");
				projectZip.file("View1.controller.js","2");
				projectZip.file("offline.js.tmpl","2");

				return oTemplate.onBeforeTemplateGenerate(projectZip, model).then(function(aResults) {
					var sFileContent1 = aResults[0].file("Mobile.view.js").asText();
					var sFileContent2 = aResults[0].file("View1.controller.js").asText();
					assert.ok(!(aResults[0].file("offline.js.tmpl")), "Verify the offline file was removed");
					assert.ok(sFileContent1 === "1", "First file exist with correct name and content");
					assert.ok(sFileContent2 === "2", "Second file exist with correct name and content");
					assert.equal(aResults[1], model, "Got the expected model");
				});
			});
		});

		it("Test Master Details with Photos Template - configWizardSteps", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.equal(aSteps.length, 4, "Master Details with Photos Template should configure three custom steps");
					assert.equal(aSteps[3].getOptional(), true, "In Master Details with Photos Template the offline step " +
						"should be optional");
				});
			});
		});

		it("Test Master Details with Photos Template - validateOnSelection", function() {
			return oTemplateService.getTemplate("ui5template.mdWithAttachmentsAnnotation").then(function(oTemplate) {
				oTemplate.validateOnSelection().then(function(result) {
					assert.equal(result, true, "Master Details with Photos Template is validateOnSelection");
				});
			});
		});

	});
});
