define(["../util/Helper"],

    function(Helper) {

        return {
            
            init: function() {
                Helper.init({
                    context: this.context
                });
            },

            execute: function() {
                var that = this;
                var oContentService = this.context.service.content;
                return oContentService.getCurrentDocument().then(function(oDocument) {
                    if (oDocument) {
                        var oEntity = oDocument.getEntity();
                        return Helper.getProcedureMetadata(oEntity).then(function(oResponse) {
                            if (oResponse) {
                                if (oResponse.errorCode) {
                                    that.context.service.log.error("Invoke Procedure", oResponse.message, ["sql"]);
                                    return false;
                                }
                                var sSchemaName = oResponse.schemaName;
                                var sProcedureName = oResponse.objectName;

                                return that.context.service.sqlGenerator.generateInvokeProcedureWithPlaceholder({
                                    "schemaName": sSchemaName,
                                    "procedureName": sProcedureName
                                }).then(
                                    function(oResult) {
                                        if (oResult) {
                                            if (oResult.errorCode) {
                                                return that.context.service.log.error("Invoke Procedure", oResult.message, ["sql"]);
                                            }
                                            var sGeneratedStmt = oResult.statement;
                                            return that.context.service.sqleditor.navigator.openPrepareEditor(sSchemaName, sGeneratedStmt);
                                        }
                                        return false;
                                    });
                            } else {
                                var sFileName = oDocument.getEntity().getName();
                                that.context.service.log.error("Invoke Procedure", "The hdbprocedure '" + sFileName + "' not ready to invoke", ["sql"]).done();
                                return false;
                            }
                        });
                    }
                    return false;
                });
            },

            isAvailable: function() {
                var oContentService = this.context.service.content;
                return oContentService.getCurrentDocument().then(function(oDocument) {
                    if (oDocument) {
                        var oEntity = oDocument.getEntity();
                        if (oEntity.getFileExtension() === "hdbprocedure") {
                            return true;
                        }
                    }
                    return false;
                });
            },

            isEnabled: function() {
                return true;
            }
        };
    });