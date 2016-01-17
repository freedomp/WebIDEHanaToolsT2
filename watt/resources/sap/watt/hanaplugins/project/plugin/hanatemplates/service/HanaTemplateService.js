define({

    sPlan: "hdi-shared",
    sProvider: "hana",

    onAfterGeneration: function (oEvent) {
        //if (oEvent.params.selectedTemplate.getId() === "hanatemplates.hanadbproject") {
        //    var that = this;
        //    var model = oEvent.params.model;
        //    var oCheBackendXS2ServicesDAO = this.context.service.chebackend.XS2ServicesDAO;
        //    var sDIContainerServiceName = model.DIContainerService;
        //    return oCheBackendXS2ServicesDAO.createService(sDIContainerServiceName, this.sProvider, this.sPlan).then(function() {
        //        var oTargetDocument = oEvent.params.targetDocument;
        //        if (oTargetDocument) {
        //            return oCheBackendXS2ServicesDAO.attachServiceToProject(sDIContainerServiceName ,that.sProvider,oTargetDocument);
        //        } else {
        //            throw new Error(that.context.i18n.getText("i18n", "hana_db_get_document_error"));
        //        }
        //    }).fail(function(oError) {
        //        throw new Error(that.context.i18n.getText("i18n", "hana_db_create_service_error")+ oError.message);
        //    });
        //}
    }
});