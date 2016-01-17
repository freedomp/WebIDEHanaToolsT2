define({

	configWizardSteps : function(oServiceCatalogStep, oTemplateCustomizationStep) {

		var oServiceCatalogStepContent = oServiceCatalogStep.getStepContent();
		var oTemplateCustomizationStepContent = oTemplateCustomizationStep.getStepContent();

		oServiceCatalogStepContent.attachValidation(oTemplateCustomizationStepContent.onSelectedServiceChange,
			oTemplateCustomizationStepContent);
		
		oServiceCatalogStep.setOptional(true);
		return [ oServiceCatalogStep, oTemplateCustomizationStep ];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
	    if(!model.fioriMasterMasterDetail.parameters.ProjectNamespace.value){
            model.fioriMasterMasterDetail.parameters.ProjectNamespace.value = model.projectName;     
	    }
	    var master2NavProp = model.fioriMasterMasterDetail.parameters.Master2ODataCollection.value;
	    if (master2NavProp && master2NavProp.elements && master2NavProp.elements.length > 0) {
	        // Add the target collection of the navigation property to the model
	        master2NavProp.entity = master2NavProp.elements[0].parent();                         
	    }
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {

	}
});