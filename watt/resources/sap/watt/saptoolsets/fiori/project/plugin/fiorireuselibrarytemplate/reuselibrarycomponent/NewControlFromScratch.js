define([ "./ReuseLibraryComponent" ], function(reuselibrarycomponent) {
    return{
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
		return reuselibrarycomponent.onBeforeTemplateGenerate(templateZip, model, this.context);
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
		return reuselibrarycomponent.onAfterGenerate(projectZip, model, this.context);
	},

	/**
	 * Checks that the template can be selected in the wizard with the context of the given model.
	 * 
	 * This method can be used for preventing the user from selecting the template when it is not appropriate 
	 * according to previous selections in the generation wizard.
	 * For example, you are prevented from generating a Component template in an inappropriate project.
	 * 
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 * @returns 'true' if the template can be selected according to a given model, 
	 * or throws an error with the appropriate message if the validation fails.
	 */
	customValidation : function(model) {
		return reuselibrarycomponent.customValidation(model, this.context);
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
	configWizardSteps : function(oTemplateCustomizationStep) {
		// Return an array that contains all the template wizard steps
		return reuselibrarycomponent.configWizardSteps(oTemplateCustomizationStep, this.context);
	}
};
});