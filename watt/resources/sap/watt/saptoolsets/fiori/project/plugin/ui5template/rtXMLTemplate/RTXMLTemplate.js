define({

	/**
	 * Applies template logic before generating the template resources in the provided zip file.
	 * 
	 * This method is executed before passing the model into the template resources, 
	 * and is therefore ideal for model manipulations.
	 * 
	 * Note that this method is not called for templates that do not include resources.
	 * 
	 * @param templateZip The zip bundle containing the template resources that are about to be generated, 
	 * as provided by the template.
	 *  
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onBeforeTemplateGenerate : function(templateZip, model) {
	    
        if(!model.rtXMLTemplate.parameters.ProjectNamespace.value){
            model.rtXMLTemplate.parameters.ProjectNamespace.value = model.projectName;     
	    }
		return [ templateZip, model ];
	},

	/**
	 * Applies template logic after generating the template resources according to the template model 
	 * and bundling the generated resources into the provided zip file.
	 * 
	 * This method is executed after passing the model into the template resources 
	 * but before extracting the generated project zip file to the SAP RDE workspace. 
	 * Therefore, this method is ideal for manipulating the generated project files 
	 * (for example, renaming files according to the template model). 
	 * 
	 * @param projectZip The zip bundle containing all the generated project resources, 
	 * after applying the model parameters on the template resources.
	 * 
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onAfterGenerate : function(projectZip, model) {
	    
        var ui5Snapshot = {
            "path": "/resources",
            "target": {
                "type": "service",
                "name": "sapui5",
                "version": "snapshot",
                "preferLocal": true,
                "entryPath": "/resources"
            },
            "description": "SAPUI5 Resources"
        };
        
        var testResourcesUi5Snapshot = {
            "path": "/test-resources",
            "target": {
                "type": "service",
                "name": "sapui5",
                "version": "snapshot",
                "entryPath": "/test-resources"
            },
            "description": "SAPUI5 Test Resources"
        };

        model.neoapp.destinations.push(ui5Snapshot);
        model.neoapp.destinations.push(testResourcesUi5Snapshot);
		
		return [ projectZip, model ];
	},
	
	/**
	 * Configures the wizard steps that appear after the template is selected in the wizard.
	 * 
	 * The method arguments are the wizard step objects that appear after selecting the template.
	 * These steps are defined in the 'wizardSteps' property of the template configuration entry 
	 * (located in the plugin.json file of the plugin containing the template).
	 * 
	 * The method is used for setting step parameters and event handlers  
	 * that define the appropriate relations between the steps.
	 * 
	 * For example, to define how 'step2' handles changes that occur in 'step1':
	 * 
	 * var oStep1Content = oStep1.getStepContent();
	 * var oStep2Content = oStep2.getStepContent();
	 * 
	   // To handle validation status changes in oStep1Content:
	 * oStep1Content.attachValidation(oStep2Content.someHandlerMethod, oStep2Content);
	 * 
	   // To handle value changes in oStep1Content:
	 * oStep1Content.attachValueChange(oStep2Content.anotherHandlerMethod, oStep2Content);
	 *  
	 */
	configWizardSteps : function(oCatalogstep, oOdataAnnotationSelectionStep, oTemplateCustomizationStep) {
		return [oCatalogstep, oOdataAnnotationSelectionStep, oTemplateCustomizationStep];
	}

});