define({

    configWizardSteps: function(oTemplateCustomizationStep) {
        return [oTemplateCustomizationStep];
    },

    onBeforeTemplateGenerate: function(templateZip, model) {
        if (!model.SAPHanaDBProject.parameters.namespace.value) {
            model.SAPHanaDBProject.parameters.namespace.value = "";
        }
        return [templateZip, model];
    },

    onBeforeTemplateCustomizationLoaded: function(wizModel, tmplModel) {
        var sModuleName = wizModel.oData.projectName;

        var oSelectedDocument = wizModel.oData.selectedDocument;
        if (oSelectedDocument) {
            var oSelectedDocEntity = oSelectedDocument.getEntity();
            var sSelectedDocParentPath = oSelectedDocEntity.getFullPath();
            var sNamespace = "";
            var aParts = sSelectedDocParentPath.split("/");
            if (aParts.length > 1) {
                sNamespace = aParts[1] + ".";
            }
            sNamespace = sNamespace + sModuleName;

            tmplModel.oData.SAPHanaDBProject.parameters.namespace.value = sNamespace;
        }

    },


    onAfterGenerate: function(projectZip, model) {
            return [projectZip, model];
    }
});
