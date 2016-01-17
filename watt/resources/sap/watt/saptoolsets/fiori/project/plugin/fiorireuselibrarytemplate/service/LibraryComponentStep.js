define({
    getContent : function() {
        var that = this;
        jQuery.sap.require("sap.watt.saptoolsets.fiori.project.plugin.fiorireuselibrarytemplate.ui.SelectLibraryComponentStep");
        var oSelectLibraryComponentStep = new sap.watt.saptoolsets.fiori.project.plugin.fiorireuselibrarytemplate.ui.SelectLibraryComponentStep({
            context : that.context
        });
        
        var sTitle = that.context.i18n.getText("libraryComponentSelectLibraryComponentStep_title");
        var sDescription = that.context.i18n.getText("libraryComponentSelectLibraryComponentStep_description");
        return that.context.service.wizard.createWizardStep(oSelectLibraryComponentStep, sTitle, sDescription);
    }
});
