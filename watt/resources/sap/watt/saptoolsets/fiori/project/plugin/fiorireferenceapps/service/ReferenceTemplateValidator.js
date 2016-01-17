define({

    /**
     * Validates a given template for selection according to given model, or throws an error with the appropriate message if validation fails
     * @param {object}      oTemplate       The object of the reference app template to validate
     * @returns {boolean}                   returns true if the template is valid for selection according to given model, or throws an error with the appropriate message if validation fails
     */
    validate : function(oTemplate) {
        var that = this;
        var oTemplateAdditionalData = oTemplate.getAdditionalData();
        if (oTemplateAdditionalData && oTemplateAdditionalData.projectName) {
            var sProjName = oTemplateAdditionalData.projectName;
        	return this.context.service.filesystem.documentProvider.getDocument("/" + sProjName).then(function(oPathResult) {
    			if (oPathResult) {
    				throw new Error(that.context.i18n.getText("referenceTemplateValidator_projectExistsError", [sProjName])); 
    			}
    			else {
    			    return true;
    			}
        	});
        }
        else {
            return true; // If no specific name is defined - validation should pass, default project name shell be decided by wizard
        }
    }
});