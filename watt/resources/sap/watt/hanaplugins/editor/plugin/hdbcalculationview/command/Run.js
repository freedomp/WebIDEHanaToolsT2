/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    
    "use strict";

    var defaultSchema = "_SYS_BIC";

    return {

        execute: function() {
            var that = this;

            /* // detect if content is changed in sqleditor.navigator.openSqlConsole and sqleditor.navigator.openSqlConsoleWithFileName
            function updateDocument(document, content) {
                return document.getContent().then(function(oldContent) {
                    if (content === oldContent) {
                        document.setIsOpenContent(true);
                        return that.context.service.document.open(document);
                    } else {
                        var q = Q.defer();
                        sap.ui.commons.MessageBox.show(that.context.i18n.getText("msg_overwerite_document", [document.getTitle()]),
                            sap.ui.commons.MessageBox.Icon.NONE,
                            that.context.i18n.getText("tit_generated_statement_changed"), [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
                            function(action) {
                                if (action === sap.ui.commons.MessageBox.Action.YES) {
                                    document.setContent(content).then(function() {
                                        document.setIsOpenContent(true);
                                        return that.context.service.document.open(document);
                                    })
                                        .fail(function(e) {
                                            q.reject(e);
                                        }).done(q.resolve);
                                } else {
                                    q.resolve();
                                }
                            },
                            sap.ui.commons.MessageBox.Action.NO);
                        return q.promise;
                    }
                });
            }
            */

            return this.context.service.content.getCurrentDocument()
                .then(function(document) {
                    if (document) {
                        var entity = document.getEntity();
                        var fullName = "" + entity.getParentPath();
                        if (fullName.charAt(0) === "/") {
                            fullName = fullName.substr(1);
                        }
                        fullName = fullName.replace(/\//g, ".");
                        if (fullName) {
                            fullName += "/";
                        }
                        var fileName = entity.getName().replace(/[.]calculationview$/, "");
                        fullName = fullName + fileName;
                        // that.context.service.catalogDAO.getProcedureParameters(defaultSchema, fullName + "/proc").then(function(result) {
                        //     var params = [];
                        //     for (var i = 0; i < result.procedureParameters.length; i++) {
                        //         var param = result.procedureParameters[i];
                        //         if (param.type === "IN") {
                        //             params.push("'PLACEHOLDER' = ('$$" + param.name.toLowerCase() + "$$', '')");
                        //         }
                        //     }
                        //     var paramsString = params.join();
                        //     paramsString = paramsString ? " (" + paramsString + ")" : "";

                        return {
                            category: "calculated_view",
                            content: {
                                isColumnView: "TRUE",
                                schemaName: defaultSchema,
                                viewName: fullName,
                                viewType: "CALC"
                            },
                            currentSchema: defaultSchema,
                            displayMode: "metadataview",
                            name: fullName,
                            type: "column_view"
                        };
                    } else {
                        var error = new Error();
                        error.emptySelection = true;
                        throw error;
                    }
                })
                .then(function(viewDocumentInfo) {
                    return that.context.service.catalogsystem.documentProvider.getDocument(viewDocumentInfo);
                })
                .then(function(viewDocument) {
                    // return [
                    //     that.context.service.sqleditorsetting.getSettings(),
                    //     viewDocument.generateSelectStatement(),
                    //     viewDocument.getEntity().getOriginalName()
                    // ];
                    var oEntity = viewDocument.getEntity();
                    var sSourceCategory = oEntity.getCategory();
                    var sSourceSchemaName = oEntity.getCurrentSchema();
                    var sSourceObjectName = oEntity.getOriginalName();
                    sap.hana.ide.showSpinner();
                    return that.context.service.sqleditor.navigator.openDataPreview(sSourceCategory, sSourceSchemaName, sSourceObjectName).then(function(oResult) {
                        if (oResult && oResult.errorCode) {
                          //  ConsoleLogger.writeErrorMessage(oResult.message);
                        }
                        return oResult;
                    });
                })
            // .spread(function(settings, oResult, originalName) {
            //     var generatedStmt;
            //     if (oResult.errorCode) {
            //         generatedStmt = "/* " + oResult.message + " */";
            //     } else {
            //         generatedStmt = oResult.statement;
            //         generatedStmt = generatedStmt.replace("${MAX_RESULT_SIZE}$", settings.maxResultSize);
            //     }
            //     return {
            //         category: "sql_console",
            //         name: originalName + ".sql",
            //         type: "sql",
            //         parentPath: defaultSchema,
            //         currentSchema: defaultSchema,
            //         content: generatedStmt
            //     };
            // })
            // .then(function(sqlDocumentInfo) {
            //     return that.context.service.catalogsystem.documentProvider.getDocument(sqlDocumentInfo)
            //         .then(function(sqlDocument) {
            //             return updateDocument(sqlDocument, sqlDocumentInfo.content);
            //         });
            // })
            .fail(function(e) {
                sap.hana.ide.hideSpinner();
                if (!e.emptySelection) {
                    throw e;
                }
            }).done(function() {
                sap.hana.ide.hideSpinner();
            });
        },

        isAvailable: function() {
            var contentService = this.context.service.content;
            return contentService.getCurrentDocument().then(function(document) {
                if (!document || document.getType() !== "file") {
                    return false;
                }
                var extension = document.getEntity().getFileExtension();
                return extension === "calculationview";
            });
        },

        isEnabled: function() {
            return true;
        }
    };
});
