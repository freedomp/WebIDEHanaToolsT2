/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["sap.watt.common.document/Document",
        "../../../util/MessageBox",
        "../../../util/SqlUtil",
        "../../../util/StringBuffer"
    ],
    function(Document, MessageBox, SqlUtil, StringBuffer) {

        "use strict";

        var DATA_TYPE_USE_SINGLE_QUOTES = ("CHAR|VARCHAR|NVARCHAR|CLOB|NCLOB|ALPHANUM|BLOB|VARBINARY|TEXT|SHORTTEXT|DATE|TIME|TIMESTAMP|SECONDDATE|" + //for sql data_type
            "STRING|FIXEDSTRING|DAYDATE|SECONDTIME|LONGDATE|RAW|LOB" // for cs_data_type
        ).split("|");

        var NUMERIC_DATA_TYPES = "TINYINT|SMALLINT|INTEGER|BIGINT|SMALLDECIMAL|DECIMAL|REAL|DOUBLE|INT".split("|");
        var DATETIME_DATA_TYPES = "DATE|TIME|SECONDDATE|TIMESTAMP|LONGDATE|SHORTDATE".split("|");
        var CHARACTER_STRINGS = "VARCHAR|NVARCHAR|ALPHANUM|SHORTTEXT".split("|");
        var BINARY_DATA_TYPES = "VARBINARY|BINARY".split("|");
        var LARGE_OBJECT_DATA_TYPES = "BLOB|CLOB|NCLOB|TEXT".split("|");

        var CatalogDocument = Document.extend("sap.hana.cst.catalog.plugin.catalogsystem.document.CatalogDocument", {
            constructor: function(oOwner, oDAO, mEntity, oEventEmitter, context) {
                Document.call(this, oOwner, oDAO, mEntity, oEventEmitter);
                this.context = context;
                this._mState.sETag = 1;
                this._bIsOpenContent = false;
            }
        });

        CatalogDocument.prototype = jQuery.extend(CatalogDocument.prototype, {

            exists: function() {
                // temporarily hard code
                return Q(true);
            },

            // TODO will be removed
            update: function(oDocumentInfo) {
                this._mEntity.update(oDocumentInfo);
            },

            getTitle: function() {
                if (this._mMetadata.isSql()) {
                    return this._mEntity.getName();

                } else if (this._mMetadata.isNewSequence()) {
                    return "New Sequence";

                } else if (this._mMetadata.isNewSynonym()) {
                    return "New Synonym";

                } else {
                    return this._mEntity.getOriginalName();
                }
            },

            getTooltip: function() {
                var sServiceName = this._mEntity.getServiceName();
                var sSchemaName = this._mEntity.getCurrentSchema();
                var sServiceDesc = sServiceName + " (" + sSchemaName + ")";

                if (this._mMetadata.isSql()) {
                    return sServiceDesc + "/" + this._mEntity.getName();

                } else if (this._mMetadata.isNewSequence()) {
                    return sServiceDesc + "/" + "New Sequence";

                } else if (this._mMetadata.isNewSynonym()) {
                    return sServiceDesc + "/" + "New Synonym";

                } else {
                    return sServiceDesc + "/" + this._mEntity.getOriginalName();
                }
            },

            //@HDI >>
            getDescription: function(settings) {
                settings = settings || {};
                settings.displayPrefix = settings.displayPrefix || false;
                var sText = "";
                var sPrefix = "Now viewing: ";
                var sName = this._mEntity.getName();
                var sServiceName = this._mEntity.getServiceName();
                var sSchemaName = this._mEntity.getCurrentSchema();

                var sServiceDesc = sServiceName + " (" + sSchemaName + ")";
                if (this._mMetadata.isSql()) {
                    switch (this._mMetadata.getCategory()) {
                        case sap.hana.cst.CATALOG_CATEGORY.SQL_CONSOLE:
                            sText = "SQL CONSOLE: " + sName + " - " + sServiceDesc;
                            break;
                        case sap.hana.cst.CATALOG_CATEGORY.SQL_PREPARE:
                            sText = "SQL PREPARE: " + sName + " - " + sServiceDesc;
                            break;
                            /*case sap.hana.cst.CATALOG_CATEGORY.SQL_FILE:
                            sText = "SQL FILE: " + this._mEntity.getFullPath() + " - " + sServiceDesc;
                            break;*/
                    }

                } else if (this._mMetadata.isSchema()) {
                    sText = "SCHEMA: " + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isProcedure()) {
                    sText = "PROCEDURE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isFunction()) {
                    sText = "FUNCTION: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isTrigger()) {
                    sText = "TRIGGER: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isIndex()) {
                    sText = "INDEX: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isSynonym()) {
                    if (this._mMetadata.isNewSynonym()) {
                        sText = "NEW SYNONYM";
                    } else {
                        sText = "SYNONYM: " + sServiceDesc + "/" + this._mEntity.getOriginalName();
                    }

                } else if (this._mMetadata.isSequence()) {
                    if (this._mMetadata.isNewSequence()) {
                        sText = "NEW SEQUENCE";
                    } else {
                        sText = "SEQUENCE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();
                    }

                } else if (this._mMetadata.isRowTable()) {
                    sText = "ROW TABLE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isColumnTable()) {
                    sText = "COLUMN TABLE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isVirtualTable()) {
                    sText = "VIRTUAL TABLE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isExtendedTable()) {
                    sText = "EXTENDED TABLE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isTable()) {
                    sText = "TABLE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isTableType()) {
                    sText = "TABLE TYPE: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isView() || this._mMetadata.isColumnView()) {
                    sText = "VIEW: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isJoinView()) {
                    sText = "JOIN VIEW: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isCalculatedView()) {
                    sText = "CALCULATED VIEW: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isHierarchyView()) {
                    sText = "HIERARCHY VIEW: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else if (this._mMetadata.isOlapView()) {
                    sText = "OLAP VIEW: " + sServiceDesc + "/" + this._mEntity.getOriginalName();

                } else {
                    sText = sServiceDesc + "/" + this._mEntity.getOriginalName();
                }

                switch (this.getEntity().getDisplayMode()) {
                    case sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAVIEW:
                    case sap.hana.cst.CATALOG_DISPLAY_MODE.CONTENTVIEW:
                        sPrefix = "Now viewing: ";
                        break;

                    case sap.hana.cst.CATALOG_DISPLAY_MODE.METADATAEDIT:
                    case sap.hana.cst.CATALOG_DISPLAY_MODE.CONTENTEDIT:
                        sPrefix = "Now editing: ";
                        break;
                    default:
                }


                if (settings.displayPrefix) {
                    sText = sPrefix + sText;
                }
                // return sap.hana.cst.escapeXSS(sText);
                sText = sap.hana.cst.escapeHTML(sText);
                return sText;
            },

            getIsOpenContent: function() {
                return this._bIsOpenContent;
            },

            setIsOpenContent: function(bVal) {
                this._bIsOpenContent = bVal;
            },

            generateInsertStatement: function() {
                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();
                var objectInfo = {};
                objectInfo.entity = oEntity;
                objectInfo.metadata = oMetadata;
                return this.context.service.sqlGenerator.generateInsertStatement(objectInfo);
            },

            generateSelectStatement: function(mSettings) {
                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();
                var objectInfo = {};
                objectInfo.settings = mSettings;
                objectInfo.entity = oEntity;
                objectInfo.metadata = oMetadata;
                objectInfo.document = this;
                return this.context.service.sqlGenerator.generateSelectStatement(objectInfo);
            },

            generateSelectStatementForColumnView: function(oDocument, mSettings, aParameters, aVariables) {
                return this.context.service.sqlGenerator.generateSelectStatementForColumnView(oDocument, mSettings, aParameters, aVariables);
            },

            generateObjectDefinition: function() {
                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();
                var sServiceName = oEntity.getServiceName();

                var inputObject = {};
                inputObject.entity = oEntity;
                inputObject.metadata = oMetadata;
                inputObject.serviceName = sServiceName;
                return this.context.service.sqlGenerator.generateObjectDefinition(inputObject);  
            },

            getObjectDependencies: function() {
                var schemaName = "",
                    sServiceName;
                // if (this.getDocumentMetadata().isPublicSynonym()) {
                //     schemaName = this.getEntity().getObject().objectSchema;
                // } else {
                //     schemaName = this.getEntity().getCurrentSchema();
                // }
                schemaName = this.getEntity().getCurrentSchema();
                sServiceName = this.getEntity().getServiceName();
                return this._oDAO.getObjectDependencies(sServiceName, schemaName, this.getEntity().getOriginalName());
            },

            dropObject: function(sOption) {
                var oEntity = this.getEntity(),
                    oMetadata = this.getDocumentMetadata(),
                    that = this,
                    sServiceName = this.getEntity().getServiceName(),
                    dropObject = {
                        originalName: oEntity.getOriginalName(),
                        schema: oEntity.getCurrentSchema(),
                        option: sOption
                    };

                if (oMetadata.isFunction()) {
                    dropObject.type = "FUNCTION";
                } else if (oMetadata.isIndex()) {
                    dropObject.type = "INDEX";
                } else if (oMetadata.isProcedure()) {
                    dropObject.type = "PROCEDURE";
                } else if (oMetadata.isSequence()) {
                    dropObject.type = "SEQUENCE";
                } else if (oMetadata.isTable()) {
                    dropObject.type = "TABLE";
                    dropObject.option = "CASCADE";
                } else if (oMetadata.isTableType()) {
                    dropObject.type = "TYPE";
                    dropObject.option = "CASCADE";
                } else if (oMetadata.isTrigger()) {
                    dropObject.type = "TRIGGER";
                } else if (oMetadata.isView()) {
                    dropObject.type = "VIEW";
                } else if (oMetadata.isSchema()) {
                    dropObject.type = "SCHEMA";
                } else if (oMetadata.isSynonym()) {
                    dropObject.type = "SYNONYM";
                    dropObject.schema = oEntity.getObject().schemaName;
                }

                return this._oDAO.dropObject(sServiceName, dropObject).then(function(rs) {
                    if (!rs.errorCode) {
                        that.notifyDeletion();
                    }
                    return rs;
                });

                //if (sOption && sOption.toUpperCase() === "DELETEALLROW") {
                //    if (oMetadata.isSynonym()) {
                //        statement = "DELETE FROM \"" + SqlUtil.escapeDoubleQuotes(oEntity.getObject().schemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //
                //    } else {
                //        statement = "DELETE FROM \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //
                //    }
                //    sOption = null;
                //
                //} else if (oMetadata.isFunction()) {
                //    statement = "DROP FUNCTION \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isIndex()) {
                //    statement = "DROP INDEX \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isProcedure()) {
                //    statement = "DROP PROCEDURE \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isSequence()) {
                //    statement = "DROP SEQUENCE \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isTable()) {
                //    statement = "DROP TABLE \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isTableType()) {
                //    statement = "DROP TYPE \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isTrigger()) {
                //    statement = "DROP TRIGGER \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isView()) {
                //    statement = "DROP VIEW \"" + SqlUtil.escapeDoubleQuotes(sSchemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isSchema()) {
                //    statement = "DROP SCHEMA \"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isSynonym()) {
                //    statement = "DROP SYNONYM \"" + SqlUtil.escapeDoubleQuotes(oEntity.getObject().schemaName) + "\".\"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //} else if (oMetadata.isRemoteSource()) {
                //    statement = "DROP REMOTE SOURCE \"" + SqlUtil.escapeDoubleQuotes(oEntity.getOriginalName()) + "\"";
                //}
                //
                //if (sOption && sOption.length > 0) {
                //    statement = statement + " " + sOption;
                //}
                //if (statement.length > 0) {
                //    return that._oDAO.sqlExecute({
                //        statement: statement,
                //        type: "UPDATE"
                //    }, { /*oSettings*/ }).then(function(rs) {
                //        if (!rs.errorCode) {
                //            that.notifyDeletion();
                //        }
                //        return rs;
                //    });
                //}
            },

            notifyDeletion: function() {
                var oParent = null;
                this._notifyAboutDeletion(oParent, this);
            },

            generateInvokeProcedure: function() {
                var oObject,
                    procedureName,
                    schemaName,
                    objectSchema,
                    objectName,
                    sServiceName;

                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();
                sServiceName = oEntity.getServiceName();

                oObject = oEntity.getObject();
                schemaName = oObject.schemaName;

                if (oMetadata.isSynonym()) {
                    procedureName = oEntity.getOriginalName();
                    objectSchema = oObject.objectSchema;
                    objectName = oObject.objectName;

                } else {
                    procedureName = oObject.procedureName;
                    objectSchema = oObject.schemaName;
                    objectName = procedureName;
                }

                return this.context.service.sqlGenerator.generateInvokeProcedure({
                    "serviceName": sServiceName,
                    "schemaName": schemaName,
                    "procedureName": procedureName,
                    "objectSchema": objectSchema,
                    "objectName": objectName
                });
            },

            generateInvokeProcedureWithPlaceholder: function() {
                var oObject,
                    procedureName,
                    schemaName,
                    objectSchema,
                    objectName,
                    sServiceName;

                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();
                sServiceName = oEntity.getServiceName();

                oObject = oEntity.getObject();
                schemaName = oObject.schemaName;

                if (oMetadata.isSynonym()) {
                    procedureName = oEntity.getOriginalName();
                    objectSchema = oObject.objectSchema;
                    objectName = oObject.objectName;

                } else {
                    procedureName = oObject.procedureName;
                    objectSchema = oObject.schemaName;
                    objectName = procedureName;
                }

                return this.context.service.sqlGenerator.generateInvokeProcedureWithPlaceholder({
                    "serviceName": sServiceName,
                    "schemaName": schemaName,
                    "procedureName": procedureName,
                    "objectSchema": objectSchema,
                    "objectName": objectName
                });
            },

            generateInvokeFunction: function() {
                var oObject = null,
                    functionName = "",
                    schemaName = "",
                    objectSchema = "",
                    objectName = "",
                    sServiceName;

                var oEntity = this.getEntity();
                var oMetadata = this.getDocumentMetadata();

                oObject = oEntity.getObject();
                schemaName = oObject.schemaName;
                sServiceName = oEntity.getServiceName();

                if (oMetadata.isSynonym()) {
                    functionName = oEntity.getOriginalName();
                    objectSchema = oObject.objectSchema;
                    objectName = oObject.objectName;

                } else {
                    functionName = oObject.functionName;
                    objectSchema = oObject.schemaName;
                    objectName = functionName;
                }

                return this.context.service.sqlGenerator.generateInvokeFunction({
                    "serviceName": sServiceName,
                    "schemaName": schemaName,
                    "functionName": functionName,
                    "objectSchema": objectSchema,
                    "objectName": objectName
                });
            },

            //===================================
            // Override original function to bypass checking changes from server
            //===================================
            needToReloadCheck: function() {
                return Q();
            },

            //===================================
            // add getProject function to bypass checking project in editor
            //===================================
            getProject: function() {
                return Q();
            }
        });
        return CatalogDocument;
    });