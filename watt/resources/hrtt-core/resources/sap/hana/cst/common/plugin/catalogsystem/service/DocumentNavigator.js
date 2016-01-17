/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../../../remote/Request",
        "../util/DocumentInfoHelper"
    ],

    function(Request, DocumentInfoHelper) {

        "use strict";

        var DEFAULT_DISPLAY_MODE = sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW;

        return {

            configure: function(mConfig) {},

            init: function() {

            },
           
            //================================
            // Open Function Editor (Metadata)
            //================================
            openFunction: function(sServiceName, schemaName, functionName, displayMode) {
                return this._getAndOpenDocument(sap.hana.cst.CATALOG_CATEGORY.FUNCTION, sServiceName, schemaName, 
                        functionName, displayMode, null, true);
            },

            //================================
            // Open Procedure Editor (Metadata, Content)
            //================================
            openProcedure: function(sServiceName, schemaName, procedureName, displayMode) {
                if (displayMode === null || displayMode === undefined) {
                    displayMode = sap.hana.cst.CATALOG_DISPLAY_MODE.CONTENTVIEW;
                }
                return this._getAndOpenDocument(sap.hana.cst.CATALOG_CATEGORY.PROCEDURE, sServiceName, schemaName, 
                        procedureName, displayMode, null, true);
            },

            //================================
            // Open new Editor (new synonym, new remotesource, new sequence)
            //================================
            openNewSequence: function(sServiceName, sSchemaName) {
                var that = this;
                var oDocumentInfo = {
                    name: sap.hana.cst.CATALOG_NAME.NEW_SEQUENCE,
                    type: sap.hana.cst.CATALOG_TYPE.SEQUENCE,
                    category: sap.hana.cst.CATALOG_CATEGORY.SEQUENCE,
                    displayMode: sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW,
                    currentSchema: sSchemaName,
                    serviceName: sServiceName,
                    content: null
                };
                return that.context.service.catalogsystem.documentProvider.getDocument(oDocumentInfo).then(function(oDocument) {
                    return that._openDocument(oDocument).then(function() {
                        var result = {};
                        result.document = oDocument;
                        return result;
                    });
                });
            },
            
            openSequence: function(sServiceName, sSchemaName, sObjectName) {
                return this.navigateWithCategory(sap.hana.cst.CATALOG_CATEGORY.SEQUENCE, sServiceName, sSchemaName, sObjectName, sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW);
            },

            openNewSynonym: function(oSrcDocument, sServiceName, sCurrentSchema) {
                var that = this;
                var oDocumentInfo = that._buildDocumentInfoForNewSynonym(oSrcDocument, sServiceName, sCurrentSchema);

                return that.context.service.catalogsystem.documentProvider.getDocument(oDocumentInfo).then(function(oDocument) {
                    return that._openDocument(oDocument).then(function() {
                        var result = {};
                        result.document = oDocument;
                        return result;
                    });
                });
            },
            
            _buildDocumentInfoForNewSynonym: function(oSrcDocument, sServiceName, sCurrentSchema) {
                var oMetadata = oSrcDocument.getDocumentMetadata();
                sCurrentSchema = sCurrentSchema || oSrcDocument.getCurrentSchema();
                sServiceName = sServiceName || oSrcDocument.getServiceName();

                var oDocumentInfo = {
                    name: sap.hana.cst.CATALOG_NAME.NEW_SYNONYM,
                    type: sap.hana.cst.CATALOG_TYPE.SYNONYM,
                    category: null,
                    displayMode: sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW,
                    currentSchema: sCurrentSchema,
                    serviceName: sServiceName,
                    content: null
                };
                if (oMetadata.isRowTable()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.ROW_TABLE_SYNONYM;
                } else if (oMetadata.isColumnTable()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.COLUMN_TABLE_SYNONYM;
                } else if (oMetadata.isFunction()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.FUNCTION_SYNONYM;
                } else if (oMetadata.isProcedure()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.PROCEDURE_SYNONYM;
                } else if (oMetadata.isIndex()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.INDEX_SYNONYM;
                } else if (oMetadata.isSequence()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.SEQUENCE_SYNONYM;
                } else if (oMetadata.isTrigger()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.TRIGGER_SYNONYM;
                } else if (oMetadata.isRowView()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.ROW_VIEW_SYNONYM;
                } else if (oMetadata.isColumnView()) {
                    oDocumentInfo.category = sap.hana.cst.CATALOG_CATEGORY.COLUMN_VIEW_SYNONYM;
                }
                
                return oDocumentInfo;
            },
          

            openMetadata: function(category, sServiceName, schemaName, objectName, supplement) {
                return this.navigateWithCategory(category, sServiceName, schemaName, objectName, sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW, supplement);
            },

            //================================
            // Navigate to general editor (default is metadata)
            //================================
            navigate: function(sServiceName, schemaName, objectName, displayMode) {
                var that = this;

                // identify category by using catalogDAO
                var service = {};
                service.name = sServiceName;
                service.schemaName = schemaName;
                return that.context.service.catalogDAO.getSqlObjects([service], objectName).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }

                    if (!result.objects || result.objects.length == 0) {
                        result.errorCode = "404";
                        result.message = 'The catalog object "' + schemaName + '"."' + objectName + '" not available.\nYou may have insufficient privilege on this artifact.';
                        return result;
                    }

                    var oCatalogObject = result.objects[0];
                    schemaName = oCatalogObject.schemaName;
                    objectName = oCatalogObject.objectName;
                    var category = oCatalogObject.type.toUpperCase();

                    return that._getAndOpenDocument(category, sServiceName, schemaName, 
                            objectName, displayMode, null, true);
                });
            },

            navigateWithCategory: function(category, sServiceName, schemaName, objectName, displayMode, supplement) {
                return this._getAndOpenDocument(category, sServiceName, schemaName, 
                        objectName, displayMode, supplement, true);
            },
            
            //==========================================================
            // Get metadata of artifacts based on category, schema name, and object name
            //==========================================================
            getMetadataDocument: function(sCategory, sServiceName, sSchemaName, sObjectName) {
                return this._getAndOpenDocument(sCategory, sServiceName, sSchemaName, 
                        sObjectName, null, null, false);
            },

            // @NS >>>
            _getAndOpenDocument: function(category, sServiceName, schemaName, objectName, displayMode, supplement, bOpenDocument) {
                if (displayMode === null || displayMode === undefined) {
                    displayMode = DEFAULT_DISPLAY_MODE;
                }
                if (bOpenDocument === null || bOpenDocument === undefined) {
                    bOpenDocument = true;
                }

                var that = this;
                var result = null;
                var bRunSql = false;

                try {

                    // build documentInfo and extraInfo
                    // @NS >>>
                    var oResult = that._buildObjectInfo(category, sServiceName, schemaName, objectName, displayMode, supplement);
                    var oDocumentInfo = oResult.documentInfo;
                    var extraInfo = oResult.extraInfo;

                    // get and open document instance
                    return that.context.service.catalogsystem.documentProvider.getDocument(oDocumentInfo).then(function(oDocument) {
                        var oDAOService = that.context.service.catalogDAO;
                        var oCatalogObject = oDocument.getEntity().getObject();
                        var oMetadata = oDocument.getDocumentMetadata();
                        var sCurrentSchema = oDocument.getEntity().getCurrentSchema();
                        var sServiceName = oDocument.getEntity().getServiceName();
                        if (extraInfo) {
                            oDocument.setExtInfo(extraInfo);
                        }

                        if (oCatalogObject) {
                            if (bOpenDocument) {
                                return that._openDocument(oDocument).then(function() {
                                    result = {};
                                    result.document = oDocument;
                                    return result;
                                });
                            } else {
                                result = {};
                                result.document = oDocument;
                                return result;
                            }

                        } else {
                            var oPromise = null;
                            switch (oMetadata.getType()) {
                                case sap.hana.cst.CATALOG_TYPE.SYNONYM:
                                    if (objectName === sap.hana.cst.CATALOG_NAME.NEW_SYNONYM) {
                                        oPromise = that._openDocument(oDocument);
                                    } else {
                                        oPromise = oDAOService.getSynonyms(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    }
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.FUNCTION:
                                    oPromise = oDAOService.getFunctions(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.INDEX:
                                    oPromise = oDAOService.getIndexes(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.PROCEDURE:
                                    oPromise = oDAOService.getProcedures(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.TABLE:
                                case sap.hana.cst.CATALOG_TYPE.TABLE_TYPE:
                                    var bIsUserDefinedType = oMetadata.isTableType() ? "TRUE" : "FALSE";
                                    oPromise = oDAOService.getTables(sServiceName, sCurrentSchema, objectName, bIsUserDefinedType).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.SEQUENCE:
                                    if (objectName === sap.hana.cst.CATALOG_NAME.NEW_SEQUENCE) {
                                        oPromise = that.openNewSequence(schemaName);
                                    } else {
                                        oPromise = oDAOService.getSequences(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    }
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.TRIGGER:
                                    oPromise = oDAOService.getTriggers(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.VIEW:
                                    oPromise = oDAOService.getViews(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                case sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW:
                                    oPromise = oDAOService.getColumnViews(sServiceName, sCurrentSchema, objectName).then(that._onResultHandler.bind(that, oDocument, bOpenDocument));
                                    break;

                                // TODO
                                // case sap.hana.cst.CATALOG_TYPE.SQL:
                                //     var sContent = "";
                                //     oPromise = that.openSqlConsole(sServiceName, schemaName, sContent, bRunSql);
                                //     break;

                                default:
                            }
                            if (oPromise) {
                                return oPromise.then(function() {
                                    var sSchemaName = oDocument.getEntity().getCurrentSchema();
                                    var sObjectName = oDocument.getEntity().getOriginalName();

                                    result = {};
                                    if (!oDocument.getEntity().getObject()) {
                                        result.errorCode = "404";
                                        result.message = 'The input object "' + sSchemaName + '"."' + sObjectName + '" not available.\nYou may have insufficient privilege on this artifact';
                                        return result;
                                    } else {
                                        result.document = oDocument;
                                        return result;
                                    }
                                });
                            }
                        }
                    });

                } catch (e) {
                    var oError = {
                        errorCode: "202",
                        message: e.toString()
                    };
                    return oError;
                }
            },

            _buildObjectInfo: function(category, sServiceName, schemaName, objectName, displayMode, supplement) {
                var sDisplayMode = displayMode,
                    type = "",
                    sCategory = "";
                var extraInfo;

                if (!category) {
                    throw new Error("Category not available");
                }

                switch (category.toUpperCase()) {

                    case "SQL_CONSOLE":
                        type = sap.hana.cst.CATALOG_TYPE.SQL;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.SQL_CONSOLE;
                        break;

                    case "SQL_FILE":
                        type = sap.hana.cst.CATALOG_TYPE.SQL;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.SQL_FILE;
                        break;

                    case "MONITORVIEW":
                        type = sap.hana.cst.CATALOG_TYPE.VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.MONITORVIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "VIEW":
                    case "ROW_VIEW":
                        type = sap.hana.cst.CATALOG_TYPE.VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.ROW_VIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "JOIN_VIEW":
                        type = sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.JOIN_VIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "OLAP_VIEW":
                        type = sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.OLAP_VIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "CALCULATED_VIEW":
                        type = sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.CALCULATED_VIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "HIERARCHY_VIEW":
                        type = sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.HIERARCHY_VIEW;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "ROW_TABLE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.ROW_TABLE;
                        break;

                    case "COLUMN_TABLE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.COLUMN_TABLE;
                        break;

                    case "VIRTUAL_TABLE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.VIRTUAL_TABLE;
                        break;

                    case "EXTENDED_TABLE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.EXTENDED_TABLE;
                        break;

                    case "TABLE_TYPE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE_TYPE;
                        sCategory = sap.hana.cst.CATALOG_TYPE.TABLE_TYPE; // the type and category of table type are the same
                        break;

                    case "TABLE":
                        type = sap.hana.cst.CATALOG_TYPE.TABLE;
                        sCategory = sap.hana.cst.CATALOG_TYPE.TABLE;
                        break;

                    case "PROCEDURE":
                        type = sap.hana.cst.CATALOG_TYPE.PROCEDURE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.PROCEDURE;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "SEQUENCE":
                        type = sap.hana.cst.CATALOG_TYPE.SEQUENCE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.SEQUENCE;
                        break;

                    case "FUNCTION":
                        type = sap.hana.cst.CATALOG_TYPE.FUNCTION;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.FUNCTION;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "TRIGGER":
                        type = sap.hana.cst.CATALOG_TYPE.TRIGGER;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.TRIGGER;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "FULLTEXT_INDEX":
                        type = sap.hana.cst.CATALOG_TYPE.INDEX;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.FULLTEXT_INDEX;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "B_INDEX":
                        type = sap.hana.cst.CATALOG_TYPE.INDEX;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.B_INDEX;
                        extraInfo = {
                            readOnly: true
                        };
                        break;

                    case "FUNCTION_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.FUNCTION_SYNONYM;
                        break;

                    case "PROCEDURE_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.PROCEDURE_SYNONYM;
                        break;

                    case "INDEX_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.INDEX_SYNONYM;
                        break;

                    case "SEQUENCE_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.SEQUENCE_SYNONYM;
                        break;

                    case "ROW_TABLE_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.ROW_TABLE_SYNONYM;
                        break;
                        
                    case "COLUMN_TABLE_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.COLUMN_TABLE_SYNONYM;
                        break;

                    case "ROW_VIEW_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.ROW_VIEW_SYNONYM;
                        break;
                    
                     case "COLUMN_VIEW_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.COLUMN_VIEW_SYNONYM;
                        break;

                    case "TRIGGER_SYNONYM":
                        type = sap.hana.cst.CATALOG_TYPE.SYNONYM;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.TRIGGER_SYNONYM;
                        break;

                    case "REMOTESOURCE":
                        type = sap.hana.cst.CATALOG_TYPE.REMOTESOURCE;
                        sCategory = sap.hana.cst.CATALOG_CATEGORY.REMOTESOURCE;
                        break;

                    default:
                        throw new Error("Error: Category '" + category + "' is not supported.");
                }

                var oDocumentInfo = {
                    name: objectName,
                    type: type,
                    category: sCategory,
                    displayMode: sDisplayMode,
                    currentSchema: schemaName,
                    //@SN
                    serviceName: sServiceName,
                    supplement: supplement
                };

                return {
                    documentInfo: oDocumentInfo,
                    extraInfo: extraInfo
                };
            },

            _onResultHandler: function(oDocument, bOpenDocument, result) {
                var that = this;
                var oCatalogObject = null;
                var oMetadata = oDocument.getDocumentMetadata();
                var sType;
                switch (oMetadata.getType()) {
                    case sap.hana.cst.CATALOG_TYPE.SYNONYM:
                        if (result.synonyms && result.synonyms.length > 0) {
                            oCatalogObject = result.synonyms[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.FUNCTION:
                        if (result.functions && result.functions.length > 0) {
                            oCatalogObject = result.functions[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.INDEX:
                        if (result.indexes && result.indexes.length > 0) {
                            oCatalogObject = result.indexes[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.PROCEDURE:
                        if (result.procedures && result.procedures.length > 0) {
                            oCatalogObject = result.procedures[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.TABLE:
                    case sap.hana.cst.CATALOG_TYPE.TABLE_TYPE:
                        if (result.tables && result.tables.length > 0) {
                            oCatalogObject = result.tables[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.SEQUENCE:
                        if (result.sequences && result.sequences.length > 0) {
                            oCatalogObject = result.sequences[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.TRIGGER:
                        if (result.triggers && result.triggers.length > 0) {
                            oCatalogObject = result.triggers[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.VIEW:
                        if (result.views && result.views.length > 0) {
                            oCatalogObject = result.views[0];
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW:
                        if (result.columnViews && result.columnViews.length > 0) {
                            oCatalogObject = result.columnViews[0];
                        }
                        break;

                }

                // update and open document
                if (oCatalogObject) {
                    var oDocumentInfo = {
                        name: oDocument.getEntity().getName(),
                        type: oDocument.getEntity().getType(),
                        category: oMetadata.getCategory(),
                        displayMode: oDocument.getEntity().getDisplayMode(),
                        currentSchema: oDocument.getEntity().getCurrentSchema(),
                        content: oCatalogObject
                    };
                    oDocument.update(oDocumentInfo);
                    if (bOpenDocument) {
                        return that._openDocument(oDocument);
                    } else {
                        return Q(oDocument);
                    }
                } //else {
                // open without the content that will be retrieved in particular editor
                // if (bOpenDocument) {
                //     return that._openDocument(oDocument);
                // } else {
                //     return Q(oDocument);
                // }
                //}
            },

            _openDocument: function(oDocument, editorService) {
                var that = this;
                // use content to open document instead of document service
                // return that.context.service.document.open(oDocument);
                var oContentService = that.context.service.content;

                if (editorService === null || editorService === undefined) {
                    return that.context.service.editor.getDefaultEditor(oDocument).then(function(oEditor) {
                        return oContentService.open(oDocument, oEditor.service);
                    });
                } else {
                    return oContentService.open(oDocument, editorService);
                }
            }
        };
    });