define(["STF", "sap/watt/lib/jszip/jszip-shim"] , function(STF, JSZip) {

	"use strict";


	var suiteName = "AddSAPUI5SmartTemplatesComponentTemplate_Integration",  getService = STF.getServicePartial(suiteName);
	describe.skip(suiteName, function () {
		var jQuery, oTemplateService;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/voter1/service/Template/config.json"}).then(function (oWindow) {
				oTemplateService = getService('template');
				jQuery = oWindow.jQuery;
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		it("SAPUI5 Smart Templates Component template - isValid",function() {
			return oTemplateService.getTemplate("ui5template.addSAPUI5SmartTemplatesComponent").then(function(oTemplate) {
				return oTemplate.validateOnSelection({}).then(function(bResult) {
					assert.ok(bResult, "SAPUI5 Application Component template should be valid on selection");
				});
			});
		});

		it("SAPUI5 Smart Templates Component template - configWizardSteps",function() {
			return oTemplateService.getTemplate("ui5template.addSAPUI5SmartTemplatesComponent").then(function(oTemplate) {
				return oTemplate.configWizardSteps().then(function(aSteps) {
					assert.ok(aSteps.length === 3, "SAPUI5 Application Component template should configure 2 custom steps");
				});
			});
		});


		it("SAPUI5 Application Component template - onAfterGenerate",function() {

			return oTemplateService.getTemplate("ui5template.addSAPUI5SmartTemplatesComponent").then(function(oTemplate) {

				var oModel = {
					"datasource" : {
						"oModel": [
							{
								"name": "List Report",
								"path": "ListReport"
							}
						]
					},
					"addSAPUI5SmartTemplatesComponent": {
						"parameters": {
							"ProjectNamespace":{
								"type": "string",
								"value": "ns",
								"wizard": {
									"control": "TextField",
									"required": true,
									"title": "project_namespace",
									"regExp": "^[a-zA-Z_]+[a-zA-Z0-9_]*([\\.]?[a-zA-Z_]+[a-zA-Z0-9_]*)*$",
									"regExpErrMsg": "nameSpace_model_parameters_name_validationError"
								}
							},
							"UI5SmartTemplatesCollection": {
								"type": "String",
								"binding": "@datasource.oModel",
								"value": {
									"name": "List Report",
									"path": "ListReport"
								},
								"wizard": {
									"control": "ComboBox",
									"required": true,
									"title": "addSAPUI5SmartTemplates_sapui5SmartTemplate_title",
									"tooltip": "addSAPUI5SmartTemplates_sapui5SmartTemplate_title_tooltip"
								}
							}
						},
						"forms": [
							{
								"title": "SAPUI5 Smart Template",
								"groups": [
									{
										"parameters": [
											"@addSAPUI5SmartTemplatesComponent.parameters.UI5SmartTemplatesCollection"]
									}
								]
							}
						]
					}
				};

				var projectZip = new JSZip();
				projectZip.file("dummy.txt","1");

				return oTemplate._oProxy._getImpl().then(function(proxy) {
					return proxy._getImpl().then(function(oTemplateProxy){

						oTemplateProxy._callAjax = function(sUrl, sType, sDataType, sFileName){
							var oRes = {
								"resources":[
									{
										"name": "ListReportComponent-dbg.js",
										"isDebug":true
									},
									{
										"name": "ListReportComponent1-dbg.js",
										"isDebug":true
									},
									{
										"name": "ObjectPageComponent-dbg.js",
										"isDebug":true
									},
									{
										"name": "css/styles.css"
									}
								]};
							var sFileNameContent = null;
							if (sFileName === "resources.json"){
								sFileNameContent = JSON.stringify(oRes);
							}

							if (sFileName === "ObjectPageComponent-dbg.js"){
								sFileNameContent = "sap.suite.ui.generic.template.ObjectPage";
							}

							if (sFileName === "ListReportComponent-dbg.js"){
								sFileNameContent = "sap.suite.ui.generic.template.ListReport";
							}

							if (sFileName === "ListReportComponent1-dbg.js"){
								sFileNameContent = "sap.suite.ui.generic.ListReport";
							}

							if (sFileName === "css/styles.css"){
								sFileNameContent = "padding: 1rem 2rem";
							}

							return Q(sFileNameContent);

						};

						oModel.componentPath = "/a";

						return oTemplate.onAfterGenerate(projectZip, oModel).then(function(aResults) {

							var aFiles = aResults[0].files;
							var arr = jQuery.map(aFiles, function(el) { return el; });

							assert.equal(arr.length,1, "number of files is correct as expected.");
							assert.ok(aResults[0].file("dummy.txt"), "dummy.txt file is not exists as expected");
						});
					});
				});
			});
		});
	});
});
