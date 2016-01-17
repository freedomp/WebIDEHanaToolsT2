define({

    configWizardSteps: function(oTemplateCustomizationStep) {
        return [oTemplateCustomizationStep];
    },

    onBeforeTemplateCustomizationLoaded : function(oWizardModel, oTemplateModel){
        oTemplateModel.setProperty("/mtaProject/parameters/application_id/value",oWizardModel.getProperty("/projectName"));
    },

    onBeforeTemplateGenerate: function(templateZip, model) {
        return [templateZip, model];
    },

    onAfterGenerate: function(projectZip, model) {
            return [projectZip, model];
    }

});