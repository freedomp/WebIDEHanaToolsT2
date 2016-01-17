define(["STF", "sap/watt/lib/lodash/lodash"], function(STF, _) {

	"use strict";

	var suiteName = "AppDescriptorGenericStep_Integration",
		getService = STF.getServicePartial(suiteName);
	describe(suiteName, function() {
		var oAppDescriptorService, oResourceBundle, oModel, oTemplateService;
		var sap;
		var aStubs = [];

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "template/config.json"
			})
				.then(function(oWindow) {
					sap = oWindow.sap;
					sap.watt = sap.watt || {};
					sap.watt.getEnv = sap.watt.getEnv || function() {
						return true;
					};
					oAppDescriptorService = getService("appDescriptorGenericStep");
					oResourceBundle = oAppDescriptorService.context.i18n;
					oTemplateService = getService("template");
					oModel = {
						"datasource": {
							"type": "odata",
							"url": ""
						},
						"smartTemplate": {
							"parameters": {
								"ProjectNamespace": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "Namespace"
									},
									"wizard": {
										"required": false,
										"internalOnly": "false"
									}
								},
								"Title": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "Title"
									},
									"wizard": {
										"required": true,
										"internalOnly": "false"
									}
								},
								"Description": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "Description"
									},
									"wizard": {
										"required": false,
										"internalOnly": "false"
									}
								},
								"ACH": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "ApplicationComponentHierarchy"
									},
									"wizard": {
										"required": true,
										"internalOnly": "true"
									}
								},
								"FioriID": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "SAPFioriID"
									},
									"wizard": {
										"required": "false",
										"internalOnly": "true"
									}
								},
								"ABAPDeployPath": {
									"type": "string",
									"value": "",
									"appDescriptor": {
										"id": "ABAPDeployPath"
									},
									"wizard": {
										"required": "false",
										"internalOnly": "true"
									}
								},
								"Keywords": {
									"type": "string",
									"value": "",
									"wizard": {
										"control": "TextField",
										"required": false,
										"title": "smart_keywords",
										"tooltip": "smart_keywords_tooltip"
									}
								},
								"ODataCollection": {
									"type": "Entity",
									"multiplicity": "many",
									"isRoot": "true",
									"binding": "@datasource.entities",
									"value": "",
									"wizard": {
										"control": "ComboBox",
										"required": "true",
										"title": "smartTemplate_collection_title",
										"tooltip": "smartTemplate_collection_tooltip"
									}
								},
								"NavigationFromOdataCollection": {
									"type": "Entity",
									"multiplicity": "many",
									"binding": "@smartTemplate.parameters.ODataCollection.value.navigations",
									"value": "",
									"wizard": {
										"control": "ComboBox",
										"title": "smartTemplate_navigation_collection_title",
										"tooltip": "smartTemplate_navigation_collection_tooltip"
									}

								},
								"SubODataCollection": {
									"type": "Entity",
									"multiplicity": "many",
									"isRoot": "true",
									"binding": "@datasource.entities",
									"value": "=(@smartTemplate.parameters.NavigationFromOdataCollection.value) ? @smartTemplate.parameters.NavigationFromOdataCollection.value.elements.parent() : null",
									"wizard": {
										"control": "ComboBox",
										"required": "false",
										"title": "smartTemplate_collection_title",
										"tooltip": "smartTemplate_collection_tooltip"
									}
								}
							},
							"forms": [{
								"title": "smartTemplate_model_form_title",
								"type": "templateCustomizationStep",
								"groups": [{
									"title": "smart_section_group_title",
									"parameters": ["@smartTemplate.parameters.ODataCollection", "@smartTemplate.parameters.NavigationFromOdataCollection"]
								}]
							}, {
								"type": "appDescriptorGenericStep",
								"groups": [{
									"parameters": ["@smartTemplate.parameters.Title", "@smartTemplate.parameters.ProjectNamespace",
										"@smartTemplate.parameters.Description", "@smartTemplate.parameters.ACH", "@smartTemplate.parameters.FioriID",
										"@smartTemplate.parameters.ABAPDeployPath"
									]
								}]
							}]
						}
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

		it("Test required fields given values validation", function() {
			return oAppDescriptorService.getContent().then(function(oAppDescriptorStep) {
				var oAppDescriptorStepContent = oAppDescriptorStep.getStepContent();

				var modelParameterConfigurations = {
					id: "Namespace",
					regExp: "(?!(sap|new(\\..*)*)$)^[a-zA-Z_][\\w]*(\\.[a-zA-Z_][\\w]*)*$",
					regExpErrMsg: "nameSpace_model_parameters_name_validationError",
					i18nKey: "AppDescriptorData_Namespace"
				};
				modelParameterConfigurations.required = false;

				var oTextFieldRes1 = oAppDescriptorStepContent
					.validateModelParameter("", modelParameterConfigurations, oResourceBundle);
				assert.ok(oTextFieldRes1.isValid, "empty value should be valid for non-required text field");
				assert.ok(oTextFieldRes1.message === undefined, "no error message should be given for valid value");

				var oTextFieldRes2 = oAppDescriptorStepContent
					.validateModelParameter(undefined, modelParameterConfigurations, oResourceBundle);
				assert.ok(oTextFieldRes2.isValid, "undefined value should be valid for non-required text field");
				assert.ok(oTextFieldRes2.message === undefined, "no error message should be given for valid value");

				modelParameterConfigurations.required = true;

				var oTextFieldRes3 = oAppDescriptorStepContent
					.validateModelParameter("", modelParameterConfigurations, oResourceBundle);
				assert.ok(!oTextFieldRes3.isValid, "empty value should be invalid for required text field");
				assert.ok(oTextFieldRes3.message !== undefined, "error message should be given for an invalid value");

				var oTextFieldRes4 = oAppDescriptorStepContent
					.validateModelParameter(undefined, modelParameterConfigurations, oResourceBundle);
				assert.ok(!oTextFieldRes4.isValid, "undefined value should be invalid for required text field");
				assert.ok(oTextFieldRes4.message !== undefined, "error message should be given for an invalid value");

				var oTextFieldRes5 = oAppDescriptorStepContent
					.validateModelParameter("some inbalid value", modelParameterConfigurations, oResourceBundle);
				assert.ok(!oTextFieldRes5.isValid, "incorrect value should be invalid for required text field");
				assert.ok(oTextFieldRes5.message !== undefined, "error message should be given for an invalid value");

				var oTextFieldRes6 = oAppDescriptorStepContent
					.validateModelParameter("someValue", modelParameterConfigurations, oResourceBundle);
				assert.ok(oTextFieldRes6.isValid, "value is valid and correlated to the regexp");
				assert.ok(oTextFieldRes6.message === undefined, "no error message should be given for valid value");

				oAppDescriptorStepContent.destroyContent();
			});

		});

		it("Test regex for text field validation", function() {
			return oAppDescriptorService.getContent().then(function(oAppDescriptorStep) {
				var oAppDescriptorStepContent = oAppDescriptorStep.getStepContent();

				require(["sap/watt/lib/lodash/lodash"], function(lodash) {
					oAppDescriptorStepContent._ = lodash;
					var modelParameterConfigurations = {
						id: "Namespace",
						regExp: "(?!(sap|new(\\..*)*)$)^[a-zA-Z_][\\w]*(\\.[a-zA-Z_][\\w]*)*$",
						regExpErrMsg: "nameSpace_model_parameters_name_validationError",
						i18nKey: "AppDescriptorData_Namespace"
					};
					modelParameterConfigurations.required = false;

					var oTextFieldRes1 = oAppDescriptorStepContent
						.validateModelParameter("", modelParameterConfigurations, oResourceBundle);
					assert.ok(oTextFieldRes1.isValid, "empty value should be valid for the given regExp");
					assert.ok(oTextFieldRes1.message === undefined, "no error message should be given for valid value");

					var oTextFieldRes2 = oAppDescriptorStepContent
						.validateModelParameter(undefined, modelParameterConfigurations, oResourceBundle);
					assert.ok(oTextFieldRes2.isValid, "undefined value should be valid for non-required text field");
					assert.ok(oTextFieldRes2.message === undefined, "no error message should be given for valid value");

					var oTextFieldRes3 = oAppDescriptorStepContent
						.validateModelParameter("some inbalid value", modelParameterConfigurations, oResourceBundle);
					assert.ok(!oTextFieldRes3.isValid, "white spaces are not allowed for the given regExp");
					assert.ok(oTextFieldRes3.message !== undefined, "error message should be given for an invalid value");

					var oTextFieldRes4 = oAppDescriptorStepContent
						.validateModelParameter("someValue", modelParameterConfigurations, oResourceBundle);
					assert.ok(oTextFieldRes4.isValid, "value is valid for the given regExp");
					assert.ok(oTextFieldRes4.message === undefined, "no error message should be given for valid value");

					oAppDescriptorStepContent.destroyContent();
				});

			});

		});

		it("Test loadAppDescriptorConfiguration method with smart template ", function() {
			return oAppDescriptorService.getContent().then(function(oAppDescriptorStep) {
				var oAppDescriptorStepContent = oAppDescriptorStep.getStepContent();
				oAppDescriptorStepContent._ = _;
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function(oTemplate) {
					if (oTemplate) {
						oModel.oData = {};
						oModel.oData.selectedTemplate = oTemplate;
						return oAppDescriptorStepContent.loadAppDescriptorConfiguration(oModel).then(function(aManifestPropertiesGrids) {
							assert.equal(aManifestPropertiesGrids.length, 7, "In internal environment the model.json should not changed");
							oAppDescriptorStepContent.destroyContent();
						});
					}
				});
			});
		});

		it("Test generalAppDescriptorValidation method", function() {
			return oAppDescriptorService.getContent().then(function(oAppDescriptorStep) {
				var oAppDescriptorStepContent = oAppDescriptorStep.getStepContent();
				oAppDescriptorStepContent._ = _;
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function(oTemplate) {
					if (oTemplate) {
						oModel.oData = {};
						oModel.oData.selectedTemplate = oTemplate;
						return oAppDescriptorStepContent.loadAppDescriptorConfiguration(oModel).then(function(aManifestPropertiesGrids) {
							var bResult = oAppDescriptorStepContent.generalAppDescriptorValidation();
								assert.ok(!bResult, "general step validation should fail");
						});
					}
				});
			});
		});


		it("Test validateStepContent method", function() {
			return oAppDescriptorService.getContent().then(function(oAppDescriptorStep) {
				var oAppDescriptorStepContent = oAppDescriptorStep.getStepContent();
				oAppDescriptorStepContent._ = _;
				return oTemplateService.getTemplate("ui5template.smarttemplate").then(function(oTemplate) {
					if (oTemplate) {
						oModel.oData = {};
						oModel.oData.selectedTemplate = oTemplate;
						return oAppDescriptorStepContent.loadAppDescriptorConfiguration(oModel).then(function(aManifestPropertiesGrids) {
							var oEvent = {
								name: "generated",
								getParameter: function(valueType){
									return "someValue";
								},
								getSource: function(){
									return oAppDescriptorStepContent.aTextFieldControls[0];
								}
							};
							return oAppDescriptorStepContent.validateStepContent(oEvent).then(function(bResult){
								assert.ok(!bResult, "validateStepContent method should fail because the rest of the fields are emprt");
							}).fail(function(bResult){
								assert.ok(!bResult, "validateStepContent method should fail because the rest of the fields are emprt");
							});
						});
					}
				});
			});
		});
	});

});