define(["STF"] , function(STF) {

	"use strict";
	
	var suiteName = "TemplateCustomizationStep_unit";

	describe(suiteName, function () {
		
		var oTemplateCustomizationStep;
		
		before(function () {
			return STF.startWebIde(suiteName, {config : "template/unit/GenerationWizard/config-light.json"}).then(function(oWindow){
				oWindow.jQuery.sap.require("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep");
				oTemplateCustomizationStep = new oWindow.sap.watt.ideplatform.plugin.generationwizard.ui.wizard.TemplateCustomizationStep();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("_getIndexOfTemplateCustomizationForm", function() {
			var oModel = {
				"root" : {
					"forms" : [
						{
							"groups" : [
								{
									"parameters": ["@fioriMasterDetail.parameters.ProjectNamespace"]
								},
								{
									"parameters": ["@fioriMasterDetail.parameters.MasterTitle","@fioriMasterDetail.parameters.MasterODataCollection","@fioriMasterDetail.parameters.MasterItemTitle", "@fioriMasterDetail.parameters.MasterNumericAttribute", "@fioriMasterDetail.parameters.MasterUnitsAttribute"]
								},
								{
									"parameters": ["@fioriMasterDetail.parameters.DetailTitle","@fioriMasterDetail.parameters.DetailText","@fioriMasterDetail.parameters.DetailStatus","@fioriMasterDetail.parameters.DetailAttribute1","@fioriMasterDetail.parameters.DetailAttribute2","@fioriMasterDetail.parameters.DetailAttribute3"]
								},
								{
									"parameters": ["@fioriMasterDetail.parameters.NavigateCollection","@fioriMasterDetail.parameters.NavigateAttribute1","@fioriMasterDetail.parameters.NavigateAttribute2","@fioriMasterDetail.parameters.NavigateAttribute3"]
								}
							]
						}
					]
				}
			};
			var res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root", oModel);
			assert.equal(res, 0 , "test with no type");
			
			oModel.root.forms[0].type = "templateCustomizationStep";
			res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root", oModel);
			assert.equal(res, 0 , "test with correct type");
			
			oModel.root.forms[0].type = "appDescriptorStep";
			res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root", oModel);
			assert.equal(res, -1 , "test with wrong type");
			
			res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root1", oModel);
			assert.equal(res, -1 , "test with wrong root name");
			
			oModel = {
				"root" : {
					"forms" : [
						{
							"type" : "appDescriptorStep",
							"groups" : [
								{
									"parameters": ["@fioriMasterDetail.parameters.ProjectNamespace"]
								},
								{
									"parameters": ["@fioriMasterDetail.parameters.MasterTitle","@fioriMasterDetail.parameters.MasterODataCollection","@fioriMasterDetail.parameters.MasterItemTitle", "@fioriMasterDetail.parameters.MasterNumericAttribute", "@fioriMasterDetail.parameters.MasterUnitsAttribute"]
								}
							]
						},
						{
							
							"groups" : [
								{
									"parameters": ["@fioriMasterDetail.parameters.ProjectNamespace"]
								},
								{
									"parameters": ["@fioriMasterDetail.parameters.MasterTitle","@fioriMasterDetail.parameters.MasterODataCollection","@fioriMasterDetail.parameters.MasterItemTitle", "@fioriMasterDetail.parameters.MasterNumericAttribute", "@fioriMasterDetail.parameters.MasterUnitsAttribute"]
								}
							]
						}
					]
				}
			};
			
			res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root", oModel);
			assert.equal(res, 1 , "test with no type + multiple forms");
			
			oModel.root.forms[1].type = "templateCustomizationStep";
			res = oTemplateCustomizationStep._getIndexOfTemplateCustomizationForm("root", oModel);
			assert.equal(res, 1 , "test with correct type + multiple forms");
		});

	});
});