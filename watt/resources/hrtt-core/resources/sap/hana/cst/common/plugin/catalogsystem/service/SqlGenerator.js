/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../../../util/SqlUtil",
	"../../../util/StringBuffer"],

    function(SqlUtil, StringBuffer) {

        "use strict";

        var DATA_TYPE_USE_SINGLE_QUOTES = ("CHAR|VARCHAR|NVARCHAR|CLOB|NCLOB|ALPHANUM|BLOB|VARBINARY|TEXT|SHORTTEXT|DATE|TIME|TIMESTAMP|SECONDDATE|" + //for sql data_type
            "STRING|FIXEDSTRING|DAYDATE|SECONDTIME|LONGDATE|RAW|LOB" // for cs_data_type
        ).split("|");

        var NUMERIC_DATA_TYPES = "TINYINT|SMALLINT|INTEGER|BIGINT|SMALLDECIMAL|DECIMAL|REAL|DOUBLE|INT".split("|");
        var DATETIME_DATA_TYPES = "DATE|TIME|SECONDDATE|TIMESTAMP|LONGDATE|SHORTDATE".split("|");
        var CHARACTER_STRINGS = "VARCHAR|NVARCHAR|ALPHANUM|SHORTTEXT".split("|");
        var BINARY_DATA_TYPES = "VARBINARY|BINARY".split("|");
        var LARGE_OBJECT_DATA_TYPES = "BLOB|CLOB|NCLOB|TEXT".split("|");

        return {

            configure: function(mConfig) {},

            generateInvokeProcedure: function(oObjectInfo) {
                var i,
                    that = this,
                    sql,
                    aInputs = [],
                    aOutput = [];

                oObjectInfo = oObjectInfo || {};
                var schemaName = oObjectInfo.schemaName;
                var procedureName = oObjectInfo.procedureName;
                var objectSchema = oObjectInfo.objectSchema;
                var objectName = oObjectInfo.objectName;
                var sServiceName = oObjectInfo.serviceName;
                if (!objectSchema) {
                    objectSchema = schemaName;
                }
                if (!objectName) {
                    objectName = procedureName;
                }

                var oCatalogDAOService = that.context.service.catalogDAO;

                sql = "CALL \"" + schemaName + "\".\"" + procedureName + "\"(";
                return oCatalogDAOService.getProcedureParameters(sServiceName, objectSchema, objectName).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }

                    var aProcedureParameters = result.procedureParameters;
                    if (aProcedureParameters.length === 0) {
                        sql += ")";
                        return {
                            statement: sql
                        };
                    }

                    for (i = 0; i < aProcedureParameters.length; i++) {
                        if (aProcedureParameters[i].type.toUpperCase() === "IN") {
                            aInputs.push(aProcedureParameters[i]);

                        } else if (aProcedureParameters[i].type.toUpperCase() === "OUT") {
                            aOutput.push(aProcedureParameters[i].name);

                        } else if (aProcedureParameters[i].type.toUpperCase() === "INOUT") {
                            aOutput.push(aProcedureParameters[i].name);
                        }
                    }

                    if (aInputs && aInputs.length > 0) {
                        for (i = 0; i < aInputs.length; i++) {
                            if (DATA_TYPE_USE_SINGLE_QUOTES.indexOf(aInputs[i].sqlType) >= 0) {
                                switch (aInputs[i].sqlType) {
                                    case "CHAR":
                                    case "VARCHAR":
                                    case "NVARCHAR":
                                    case "STRING":
                                    case "FIXEDSTRING":
                                    case "ALPHANUM":
                                        sql += "\n\t" + aInputs[i].name + " => ''/*<" + aInputs[i].sqlType + "(" + aInputs[i].length + ")>*/,";
                                        break;
                                    default:
                                        sql += "\n\t" + aInputs[i].name + " => ''/*<" + aInputs[i].sqlType + ">*/,";
                                        break;
                                }
                            } else {
                                sql += "\n\t" + aInputs[i].name + " => /*<" + aInputs[i].sqlType + ">*/,";

                            }
                        }
                    }
                    if (aOutput && aOutput.length > 0) {
                        for (i = 0; i < aOutput.length; i++) {
                            sql += "\n\t" + aOutput[i] + " => ?,";
                        }
                    }
                    sql = sql.slice(0, -1);

                    if (sql.split(",").length <= 2) {
                        sql = sql.replace(/\n\t/g, "");
                    } else {
                        sql += "\n";
                    }

                    sql += ");";

                    return {
                        statement: sql
                    };
                });

            },

            generateInvokeProcedureWithPlaceholder: function(oObjectInfo) {
                var i,
                    sql;

                oObjectInfo = oObjectInfo || {};
                var schemaName = oObjectInfo.schemaName;
                var procedureName = oObjectInfo.procedureName;
                var objectSchema = oObjectInfo.objectSchema;
                var objectName = oObjectInfo.objectName;
                var sServiceName = oObjectInfo.serviceName;
                if (!objectSchema) {
                    objectSchema = schemaName;
                }
                if (!objectName) {
                    objectName = procedureName;
                }

                var oCatalogDAOService = this.context.service.catalogDAO;

                sql = "CALL \"" + schemaName + "\".\"" + procedureName + "\"(";
                return oCatalogDAOService.getProcedureParameters(sServiceName, objectSchema, objectName).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }
                    var aProcedureParameters = result.procedureParameters;
                    if (aProcedureParameters.length === 0) {
                        sql += ")";
                        return {
                            statement: sql
                        };
                    }

                    for (i = 0; i < aProcedureParameters.length; i++) {
                        sql += "\n\t" + aProcedureParameters[i].name + " => ?,";
                    }

                    sql = sql.slice(0, -1);

                    if (sql.split(",").length <= 2) {
                        sql = sql.replace(/\n\t/g, "");
                    } else {
                        sql += "\n";
                    }

                    sql += ");";

                    return {
                        statement: sql
                    };
                });
            },

            generateInvokeFunction: function(oObjectInfo) {
                var i,
                    that = this,
                    sql = "",
                    aInputs = [],
                    aReturnTables = [],
                    aReturnScalars = [];

                oObjectInfo = oObjectInfo || {};
                var schemaName = oObjectInfo.schemaName;
                var functionName = oObjectInfo.functionName;
                var objectSchema = oObjectInfo.objectSchema;
                var objectName = oObjectInfo.objectName;
                var sServiceName = oObjectInfo.serviceName;
                if (!objectSchema) {
                    objectSchema = schemaName;
                }
                if (!objectName) {
                    objectName = functionName;
                }

                var oCatalogDAOService = that.context.service.catalogDAO;

                return oCatalogDAOService.getFunctionParameters(sServiceName, objectSchema, objectName).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }
                    var aFunctionParameters = result.functionParameters;
                    var oReturn = null;

                    for (i = 0; i < aFunctionParameters.length; i++) {
                        if (aFunctionParameters[i].type.toUpperCase() === "IN") {
                            var oInput = aFunctionParameters[i];
                            aInputs.push(oInput);

                        } else if (aFunctionParameters[i].type.toUpperCase() === "RETURN" && aFunctionParameters[i].sqlType.toUpperCase() === "TABLE_TYPE") {
                            oReturn = aFunctionParameters[i];
                            aReturnTables.push(oReturn);

                        } else if (aFunctionParameters[i].type.toUpperCase() === "RETURN" && aFunctionParameters[i].sqlType.toUpperCase() !== "TABLE_TYPE") {
                            oReturn = aFunctionParameters[i];
                            aReturnScalars.push(oReturn);
                        }
                    } //end for

                    var sFullName = "";
                    var sPrefix = "";
                    if (aReturnTables.length > 0) {
                        sFullName = "\"" + schemaName + "\".\"" + functionName + "\"";
                        sPrefix = "SELECT * FROM " + sFullName;
                        for (i = 0; i < aReturnTables.length; i++) {
                            sql += sPrefix + _buildInput(aInputs, sPrefix) + ";\n";
                        }
                    }

                    if (aReturnScalars.length > 0) {
                        sPrefix = "";
                        var sScalarText = "";
                        var sGap = sPrefix = "SELECT ".replace(/./gi, " ");
                        for (i = 0; i < aReturnScalars.length; i++) {
                            var oReturnScalar = aReturnScalars[i];
                            if (i >= 1) {
                                // sScalarText += "\t";
                                sScalarText += sGap;
                            }
                            sPrefix = "SELECT \"" + schemaName + "\".\"" + functionName + "\"";
                            sScalarText += "\"" + schemaName + "\".\"" + functionName + "\"" + _buildInput(aInputs, sPrefix) + "." + oReturnScalar.name + " AS " + oReturnScalar.name + ",\n";
                        }
                        if (aReturnScalars.length > 0) {
                            sScalarText = sScalarText.slice(0, -2);
                        }
                        sql = "SELECT " + sScalarText + "\nFROM DUMMY;";
                    }
                    return {
                        statement: sql
                    };

                    function _buildInput(aInputs, sPrefix) {
                        var sTxt = "";
                        var i = 0;
                        var hasPrefix = false;
                        if (sPrefix) {
                            sPrefix = sPrefix.replace(/./gi, " ") + " "; // gap include '('
                            hasPrefix = true;
                        }
                        for (i = 0; i < aInputs.length; i++) {
                            var sGap = "";
                            if (i >= 1) {
                                sGap = sPrefix;
                            }
                            var oInput = aInputs[i];
                            if (DATA_TYPE_USE_SINGLE_QUOTES.indexOf(oInput.sqlType) >= 0) {
                                sTxt += '';
                                switch (oInput.sqlType) {
                                    case "CHAR":
                                    case "VARCHAR":
                                    case "NVARCHAR":
                                    case "STRING":
                                    case "FIXEDSTRING":
                                    case "ALPHANUM":
                                        sTxt += sGap + "''/*" + oInput.name + " <" + oInput.sqlType + "(" + oInput.length + ")>*/,";
                                        break;
                                    default:
                                        sTxt += sGap + "''/*" + oInput.name + " <" + oInput.sqlType + ">*/,";
                                        break;
                                }
                            } else {
                                sTxt += sGap + "/*" + oInput.name + " <" + oInput.sqlType + ">*/,";
                            }

                            if (hasPrefix) {
                                sTxt += "\n";
                            }
                        } // end for

                        if (aInputs.length > 0) {
                            if (hasPrefix) {
                                sTxt = sTxt.slice(0, -2);
                            } else {
                                sTxt = sTxt.slice(0, -1);
                            }
                        }
                        sTxt = "(" + sTxt + ")";
                        return sTxt;
                    }
                });
            },

            generateInsertStatement: function(oObjectInfo) {
                var that = this;
                var oCatalogDAOService = that.context.service.catalogDAO;
                var statement;
                var oObject, schemaName, tableName, name, sServiceName;

                var oEntity = oObjectInfo.entity;
                var oMetadata = oObjectInfo.metadata;

                oObject = oEntity.getObject();
                schemaName = oObject.schemaName;
                sServiceName = oEntity.getServiceName();
                if (oMetadata.isTable() || oMetadata.isTableType()) {
                    name = "TABLE";
                    tableName = oObject.tableName;

                } else if (oMetadata.isView()) {
                    name = "VIEW";
                    tableName = oObject.viewName;
                }

                var oThat = this;
                return oCatalogDAOService.getColumnsOfTable(sServiceName, schemaName, tableName, "%", name).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }
                    var sql = "INSERT INTO \"" + SqlUtil.escapeQuotes(schemaName) + "\".\"" + SqlUtil.escapeQuotes(tableName) + "\" VALUES",
                        i,
                        sMsg;

                    if (!result.columns) {
                        sMsg = 'Getting metadata not available when generating insert Statement on "' + schemaName + '"."' + tableName + '".\nYou may have insufficient privilege on this artifact';
                        return {
                            message: sMsg,
                            errorCode: "404"
                        };
                    } else {

                        if (result.columns.length === 0) {
                            sql += "()";
                        } else {
                            sql += "(";
                            for (i = 0; i < result.columns.length; i++) {
                                var oColumn = result.columns[i];
                                if (DATA_TYPE_USE_SINGLE_QUOTES.indexOf(oColumn.dataTypeName) >= 0) {
                                    switch (oColumn.dataTypeName) {
                                        case "CHAR":
                                        case "VARCHAR":
                                        case "NVARCHAR":
                                        case "STRING":
                                        case "FIXEDSTRING":
                                        case "ALPHANUM":
                                            sql += "\n\t''/*" + oColumn.columnName + " <" + oColumn.dataTypeName + "(" + oColumn.dataLength + ")>*/,";
                                            break;
                                        default:
                                            sql += "\n\t''/*" + oColumn.columnName + " <" + oColumn.dataTypeName + ">*/,";
                                            break;
                                    }
                                } else {
                                    if (oColumn.dataTypeName) {
                                        sql += "\n\t/*" + oColumn.columnName + " <" + oColumn.dataTypeName + ">*/,";
                                    } else {
                                        sql += "\n\t/*" + oColumn.columnName + "*/,";
                                    }
                                }
                            }
                            sql = sql.slice(0, -1) + "\n);";
                        }
                    }
                    return {
                        statement: sql
                    };
                });
            },

            generateSelectStatement: function(oObjectInfo) {
                var that = this;
                var mSettings = oObjectInfo.settings || {};
                mSettings.excludeEndStmt = mSettings.excludeEndStmt || false;

                var statement;
                var oObject, schemaName, tableName, type, sServiceName;

                var synonymSchemaName, synonymName;

                var oEntity = oObjectInfo.entity;
                var oMetadata = oObjectInfo.metadata;

                sServiceName = oEntity.getServiceName();
                oObject = oEntity.getObject();
                var oCatalogDAOService = that.context.service.catalogDAO;
                var currentDocument = oObjectInfo.document;

                switch (oMetadata.getType()) {
                    case sap.hana.cst.CATALOG_TYPE.TABLE:
                    case sap.hana.cst.CATALOG_TYPE.TABLE_TYPE:
                        type = "TABLE";
                        tableName = oObject.tableName;
                        schemaName = oObject.schemaName;
                        break;

                    case sap.hana.cst.CATALOG_TYPE.VIEW:
                        type = "VIEW";
                        tableName = oObject.viewName;
                        schemaName = oObject.schemaName;
                        break;

                    case sap.hana.cst.CATALOG_TYPE.COLUMN_VIEW:
                        type = "VIEW";
                        tableName = oObject.viewName;
                        schemaName = oObject.schemaName;
                        if (oMetadata.getCategory() !== sap.hana.cst.CATALOG_CATEGORY.HIERARCHY_VIEW) {
                            return this.generateSelectStatementForColumnView(currentDocument, mSettings, null, null);
                        }
                        break;

                    case sap.hana.cst.CATALOG_TYPE.SYNONYM:
                        tableName = oObject.objectName;
                        schemaName = oObject.objectSchema;
                        synonymName = oObject.synonymName;
                        synonymSchemaName = oObject.schemaName;
                        if (oMetadata.isTableSynonym()) {
                            type = "TABLE";

                        } else if (oMetadata.isColumnViewSynonym()) {
                            type = "VIEW";
                            return this.generateSelectStatementForColumnView(currentDocument, mSettings, null, null);

                        } else if (oMetadata.isRowViewSynonym()) {
                            type = "VIEW";

                        } else {
                            return {
                                errorCode: "404",
                                message: 'Not support to generate select Statement on ' + type + ' "' + schemaName + '"."' + tableName + '"'
                            };
                        }
                        break;

                    default:
                        return {
                            errorCode: "404",
                            message: 'Not support to generate select Statement on ' + type + ' "' + schemaName + '"."' + tableName + '"'
                        };
                }

                var oThat = this;
                return oCatalogDAOService.getColumnsOfTable(sServiceName, schemaName, tableName, "%", type).then(function(result) {
                    if (result.errorCode) {
                        return result;
                    }
                    var sql = "SELECT TOP ${MAX_RESULT_SIZE}$",
                        i,
                        sMsg;
                    if (!result.columns || result.columns.length === 0) {
                        sMsg = 'Columns not available when generating select Statement on ' + type + ' "' + schemaName + '"."' + tableName + '".\nYou may have insufficient privilege on this artifact';
                        return {
                            message: sMsg,
                            errorCode: "404"
                        };
                    } else if (result.columns.length > 0) {
                        for (i = 0; i < result.columns.length - 1; i++) {
                            sql += '\n\t"' + SqlUtil.escapeQuotes(result.columns[i].columnName) + '",';
                        }
                        sql += '\n\t"' + SqlUtil.escapeQuotes(result.columns[result.columns.length - 1].columnName) + '"';

                        if (oMetadata.isSynonym()) {
                            sql += '\nFROM "' + SqlUtil.escapeQuotes(synonymSchemaName) + '"."' + SqlUtil.escapeQuotes(synonymName) + '"';
                        } else {
                            sql += '\nFROM "' + SqlUtil.escapeQuotes(schemaName) + '"."' + SqlUtil.escapeQuotes(tableName) + '"';
                        }

                        if (!mSettings.excludeEndStm) {
                            sql += ";";
                        }
                    }

                    return {
                        statement: sql
                    };
                });
            },
            generateSelectStatementForColumnView: function(oDocument, mSettings, aParameters, aVariables) {
                mSettings = mSettings || {};
                mSettings.excludeEndStmt = mSettings.excludeEndStmt || false;
                mSettings.includePlaceHolder = mSettings.includePlaceHolder || false;
                var oEntity = oDocument.getEntity();
                var schemaName = oEntity.getCurrentSchema();
                var viewName = oEntity.getOriginalName();
                var oMetadata = oDocument.getDocumentMetadata();
                var sServiceName = oEntity.getServiceName();
                var synonymSchemaName = "";
                var synonymName = "";
                if (oMetadata.isSynonym()) {
                    var oContent = oEntity.getContent();
                    synonymName = oContent.synonymName;
                    synonymSchemaName = oContent.schemaName;
                    schemaName = oContent.objectSchema;
                    viewName = oContent.objectName;
                }

                var that = this;
                that._aInputParameters = [];
                that._iParamPos = 0;
                var sql = "",
                    i,
                    sMsg,
                    aAggColumns = [];
                var oCatalogDAOService = that.context.service.catalogDAO;

                return Q.all([oCatalogDAOService.getColumnsOfColumnView(sServiceName, schemaName, viewName),
                    oCatalogDAOService.getMandatoryParameters(sServiceName, viewName)
                ]).spread(function(result, result2) {

                    if (result.errorCode) {
                        return result;
                    }
                    var oSB = new StringBuffer();
                    var oCol = null;
                    var sCondition = "";
                    oSB.append("SELECT TOP ${MAX_RESULT_SIZE}$");

                    if (!result.columns || result.columns.length === 0) {
                        sMsg = 'Columns not available when generating select Statement on "' + schemaName + '"."' + viewName + '".\nYou may have insufficient privilege on this artifact';
                        return {
                            message: sMsg,
                            errorCode: "404"
                        };
                    } else if (result.columns.length > 0) {
                        // select
                        for (i = 0; i < result.columns.length; i++) {
                            oCol = result.columns[i];
                            oSB.append('\n\t');
                            var sColumnName = '"' + SqlUtil.escapeQuotes(oCol.name) + '"';
                            if (oCol.defaultAggregation) {

                                /*
                                 *  Rest API returns defaultAggregation in specific format like SUM,COUNT
                                 */
                                sColumnName = oCol.defaultAggregation+'(' + sColumnName + ')';
                               /* switch (oCol.defaultAggregation.toString()) {
                                    case "1":
                                        sColumnName = 'SUM(' + sColumnName + ')';
                                        break;
                                    case "2":
                                        sColumnName = 'COUNT(' + sColumnName + ')';
                                        break;
                                    case "3":
                                        sColumnName = 'MIN(' + sColumnName + ')';
                                        break;
                                    case "4":
                                        sColumnName = 'MAX(' + sColumnName + ')';
                                        break;
                                    default:
                                }*/
                                sColumnName += ' AS "' + SqlUtil.escapeQuotes(oCol.name) + '"';
                            } else {
                                var sGroupColumn = '"' + SqlUtil.escapeQuotes(oCol.name) + '"';
                                aAggColumns.push(sGroupColumn);
                            }
                            oSB.append(sColumnName + ",");
                        }
                        oSB.remove(1);

                        if (oMetadata.isSynonym()) {
                            oSB.append('\nFROM "' + SqlUtil.escapeQuotes(synonymSchemaName) + '"."' + SqlUtil.escapeQuotes(synonymName) + '"');
                        } else {
                            oSB.append('\nFROM "' + SqlUtil.escapeQuotes(schemaName) + '"."' + SqlUtil.escapeQuotes(viewName) + '"');
                        }

                        // generate params
                        if (aParameters && aParameters.length > 0) {
                            sCondition = that._generateParams(aParameters, mSettings);
                            oSB.append(sCondition);
                        } else {
                            if (result2 && result2.params && result2.params.length > 0) {
                                sCondition = that._generateNullParams(result2.params);
                                oSB.append(sCondition);
                            }
                        }

                        if (aVariables && aVariables.length > 0) {
                            // generate variables in condition
                            sCondition = that._generateVariables(aVariables, mSettings);
                            oSB.append(sCondition);
                        }

                        // group by
                        if (aAggColumns.length > 0) {
                            oSB.append('\nGROUP BY ');
                            oSB.append(aAggColumns.join(", "));
                        }

                        sql = oSB.toString();
                        if (!mSettings.excludeEndStmt) {
                            sql += ";";
                        }
                    }

                    return {
                        statement: sql,
                        parameters: that._aInputParameters
                    };
                });
            },
            _generateParams: function(aParams, mSettings) {
                var that = this;
                var oInputParam = null;
                var sDelimeter = ', \n\t';
                var i = 0;
                var aSingleValues = [];
                var oMultiValues = {};
                var sValue = "";
                var oParam = null;
                var sParamName = "";
                var oSB = new StringBuffer();
                if (aParams && aParams.length > 0) {
                    oSB.append('\n\t(');
                    for (i = 0; i < aParams.length; i++) {
                        oParam = aParams[i];
                        sParamName = oParam.name;
                        var sDataType = oParam.dataTypeName;
                        var sParamVal = "";

                        if (oParam.operator === "IS NULL") {
                            sParamVal = null;
                        } else {
                            sParamVal = oParam.fromVal;
                        }
                        // single entry
                        if (oParam.isMultiline.toString() !== "1") {
                            sValue = that._toValueForParam(sParamVal, sDataType, false);
                            aSingleValues.push({
                                "paramName": sParamName,
                                "value": sValue
                            });

                            // multi entries
                        } else if (oParam.isMultiline.toString() === "1") {
                            if (!oMultiValues[sParamName]) {
                                oMultiValues[sParamName] = [];
                            }
                            sValue = that._toValueForParam(sParamVal, sDataType, true);
                            oMultiValues[sParamName].push(sValue);
                        }
                    }

                    // single param
                    if (aSingleValues.length > 0) {
                        for (i = 0; i < aSingleValues.length; i++) {
                            var oSingleVal = aSingleValues[i];
                            sParamName = oSingleVal.paramName;
                            sValue = oSingleVal.value;
                            oSB.append('placeholder."$$' + sParamName + '$$"=>' + sValue + sDelimeter);
                        }
                    }

                    // multiple param
                    var iNumOfMultiCond = Object.keys(oMultiValues).length;
                    if (iNumOfMultiCond > 0) {
                        for (sParamName in oMultiValues) {
                            var aMultiVals = oMultiValues[sParamName];
                            sValue = aMultiVals.join(",");
                            oSB.append('placeholder."$$' + sParamName + '$$"=>\'' + sValue + '\'' + sDelimeter);
                        } // end for
                    }
                    oSB.remove(sDelimeter.length);
                    oSB.append(')');
                }
                return oSB.toString();
            },
            _generateNullParams: function(aParams) {
                var that = this;
                var sFromClause = "";
                var sDelimiter = ", \n\t";
                var oSB = new StringBuffer();
                var i;
                if (aParams && aParams.length > 0) {
                    sFromClause = "\n\t(";
                    for (i = 0; i < aParams.length; i++) {
                        var oParameter = aParams[i];
                        var sDataType = oParameter.dataTypeName;
                        var sName = oParameter.name;

                        sFromClause += "placeholder.\"$$" + sName + "$$\"=>" + that._toValue(null, sDataType) + sDelimiter;
                    }
                    sFromClause = sFromClause.slice(0, -parseInt(sDelimiter.length, 10));
                    sFromClause += ")";
                    oSB.append(sFromClause);
                }
                return oSB.toString();
            },
            _generateVariables: function(aVariables, mSettings) {
                var that = this;
                var i = 0;
                var oMultiCond = {};
                var aSingleCond = [];
                var sAttrName = "";
                var oVar = null;
                var oCondition = null;
                var oSB = new StringBuffer();
                if (aVariables && aVariables.length > 0) {
                    for (i = 0; i < aVariables.length; i++) {
                        oVar = aVariables[i];

                        // single entry
                        if (oVar.isMultiline.toString() !== "1") {
                            oCondition = that._generateConditionForVariable(oVar, mSettings);
                            if (oCondition) {
                                aSingleCond.push(oCondition);
                            }

                            // multi entries
                        } else if (oVar.isMultiline.toString() === "1") {
                            sAttrName = oVar.valueAttribute;
                            if (!oMultiCond[sAttrName]) {
                                oMultiCond[sAttrName] = [];
                            }
                            oCondition = that._generateConditionForVariable(oVar, mSettings);
                            if (oCondition) {
                                oMultiCond[sAttrName].push(oCondition);
                            }
                        }
                    } // end for

                    oSB.append("\nWHERE (");
                    var sNewLineANDDelimeter = "\n AND ";

                    // single condition
                    if (aSingleCond.length > 0) {
                        for (i = 0; i < aSingleCond.length; i++) {
                            oCondition = aSingleCond[i];
                            oSB.append(oCondition.condition + sNewLineANDDelimeter);
                            that._aInputParameters = that._updateInputParameters(oCondition.parameters, mSettings);
                        }
                        oSB.remove(sNewLineANDDelimeter.length);
                    }

                    // multiple condition
                    var iNumOfMultiCond = Object.keys(oMultiCond).length;
                    if (iNumOfMultiCond > 0) {
                        if (aSingleCond.length > 0) {
                            oSB.append(sNewLineANDDelimeter);
                        }
                        for (sAttrName in oMultiCond) {
                            var aMultiVars = oMultiCond[sAttrName];
                            if (aMultiVars && aMultiVars.length > 0) {
                                oSB.append("(");
                                var sOrCondtion = that._buildOrCondition(aMultiVars, mSettings);
                                oSB.append(sOrCondtion);
                                oSB.append(")" + sNewLineANDDelimeter);
                            }
                        } // end for
                        oSB.remove(sNewLineANDDelimeter.length);
                    }

                    oSB.append(")");
                }

                return oSB.toString();
            },
             _toValue: function(sValue, sDataType) {
                // VARCHAR(), DECIMAL(5,2);
                if (sDataType) {
                    sDataType = sDataType.split(/[\(\)]/)[0].trim();
                }

                if (CHARACTER_STRINGS.indexOf(sDataType) >= 0 || // STRING
                    DATETIME_DATA_TYPES.indexOf(sDataType) >= 0 || // DATETIME
                    BINARY_DATA_TYPES.indexOf(sDataType) >= 0 || // BINARY 
                    LARGE_OBJECT_DATA_TYPES.indexOf(sDataType) >= 0 // BLOB
                ) {
                    if (!sValue) {
                        sValue = "'null'";
                    } else {
                        sValue = "'" + SqlUtil.escapeSingleQuotes(sValue) + "'";
                    }

                } else if (NUMERIC_DATA_TYPES.indexOf(sDataType) >= 0) { // NUMERIC
                    if (!sValue) {
                        sValue = "'null'";
                    }
                }
                return sValue;
            },            
            _toValueForParam: function(sValue, sDataType, bMultiline) {
                // VARCHAR(), DECIMAL(5,2);
                if (sDataType) {
                    sDataType = sDataType.split(/[\(\)]/)[0].trim();
                }

                if (CHARACTER_STRINGS.indexOf(sDataType) >= 0 || // STRING
                    DATETIME_DATA_TYPES.indexOf(sDataType) >= 0 || // DATETIME
                    BINARY_DATA_TYPES.indexOf(sDataType) >= 0 || // BINARY 
                    LARGE_OBJECT_DATA_TYPES.indexOf(sDataType) >= 0 // BLOB
                ) {
                    /*
                    in case the parameter is single valued
                    ('PLACEHOLDER' = ('$$PARAMETER_1$$', 'Test'), 'PLACEHOLDER' = ('$$PARAMETER_2$$', '1'))
                    (placeholder."$$PARAMETER_1$$">='Test', placeholder."$$PARAMETER_2$$"=>'1')
                    (placeholder."$$PARAMETER_1$$"=>'Test', placeholder."$$PARAMETER_2$$"=>'John\''s')
                    */
                    if (!sValue) {
                        sValue = "'null'";
                    } else {
                        sValue = "'" + this._escapeParam(sValue) + "'";
                    }

                    /*
                    in case the parameter is multi valued a single value has to be escaped with a triple apostrophe
                    ...select ... from "schema"."view" ('PLACEHOLDER' = ('$$MULTI_VALUE_PARAM_STRING$$', ' ''Value1'',''Value2'' '))
                    ...select ... from "schema"."view" (placeholder."$$MULTI_VALUE_PARAM_STRING$$"=>' ''Value1'',''Value2'' ')
                    */
                    if (bMultiline) {
                        sValue = "'" + sValue + "'";
                    }

                } else if (NUMERIC_DATA_TYPES.indexOf(sDataType) >= 0) { // NUMERIC
                    /*
                    ...select ... from "schema"."view" ('PLACEHOLDER' = ('$$MULTI_VALUE_PARAM_NUMERICAL$$', 'Value1, Value2'))
                    ...select ... from "schema"."view" (placeholder."$$MULTI_VALUE_PARAM_NUMERICAL$$"=>'Value1, Value2')
                    */
                    if (!sValue) {
                        sValue = "'null'";
                        if (bMultiline) {
                            sValue = "'" + sValue + "'";
                        }
                    }
                }
                return sValue;
            },
            _updateInputParameters: function(aInputParameters, mSettings) {
                var that = this;
                if (mSettings.includePlaceHolder) {
                    for (var i = 0; i < aInputParameters.length; i++) {
                        var oInputParam = aInputParameters[i];
                        oInputParam.position = ++that._iParamPos;
                    }
                    that._aInputParameters = that._aInputParameters.concat(aInputParameters);
                }
                return that._aInputParameters;
            },
            _generateConditionForVariable: function(oVar, mSettings) {
                var that = this;
                var oInputParam = null;
                var sCondition = "";
                var aParameters = [];
                var oCondition = {
                    condition: "",
                    parameters: null
                };
                if (oVar.operator) {
                    var sValueAttr = "\"" + oVar.valueAttribute + "\"";
                    var sFromValue = oVar.fromVal;
                    var sToValue = oVar.toVal;
                    var sDataType = oVar.dataTypeName;
                    var sOp = oVar.operator;
                    switch (sOp) {
                        case 'IN':
                            if (mSettings.includePlaceHolder) {
                                sCondition = '(' + sValueAttr + ' IN (?))';
                                oInputParam = {
                                    "name": oVar.name,
                                    "typeName": oVar.dataTypeName,
                                    // "type": oVar.columnType,
                                    "position": 0,
                                    "value": sFromValue
                                };
                                aParameters.push(oInputParam);
                            } else {
                                sCondition = '(' + sValueAttr + ' IN (' + that._toValue(sFromValue, sDataType) + '))';
                            }
                            break;

                        case 'BETWEEN':
                            if (sFromValue && sToValue) {
                                if (mSettings.includePlaceHolder) {
                                    sCondition = '(' + sValueAttr + ' BETWEEN ? AND ?)';
                                    oInputParam = {
                                        "name": oVar.name,
                                        "typeName": oVar.dataTypeName,
                                        // "type": oVar.columnType,
                                        "position": 0,
                                        "value": sFromValue
                                    };
                                    aParameters.push(oInputParam);

                                    oInputParam = {
                                        "name": oVar.name,
                                        "typeName": oVar.dataTypeName,
                                        // "type": oVar.columnType,
                                        "position": 0,
                                        "value": sToValue
                                    };
                                    aParameters.push(oInputParam);
                                } else {
                                    sCondition = '(' + sValueAttr + ' BETWEEN ' + that._toValue(sFromValue, sDataType) + ' AND ' + that._toValue(sToValue, sDataType) + ')';
                                }

                            } else if (sFromValue) {
                                if (mSettings.includePlaceHolder) {
                                    sCondition = '(' + sValueAttr + ' >= ?)';
                                    oInputParam = {
                                        "name": oVar.name,
                                        "typeName": oVar.dataTypeName,
                                        // "type": oVar.columnType,
                                        "position": 0,
                                        "value": sFromValue
                                    };
                                    aParameters.push(oInputParam);
                                } else {
                                    sCondition = '(' + sValueAttr + ' >= ' + that._toValue(sFromValue, sDataType) + ')';
                                }
                            }
                            break;

                        case 'IS NULL':
                            sCondition = sValueAttr + ' IS NULL';
                            break;

                        case 'IS NOT NULL':
                            sCondition = sValueAttr + ' IS NOT NULL';
                            break;

                        default:
                            // <variable> = ?, <variable> >= ?, <variable> <= ?, <varible> IS NOT NULL, <varible> IS NULL, 
                            if (mSettings.includePlaceHolder) {
                                sCondition = '(' + sValueAttr + ' ' + sOp + ' ?)';
                                oInputParam = {
                                    "name": oVar.name,
                                    "typeName": oVar.dataTypeName,
                                    // "type": oVar.columnType,
                                    "position": 0,
                                    "value": sFromValue
                                };
                                if (sFromValue === null || sFromValue === undefined) {
                                    oInputParam.emptyValue = true;
                                }
                                aParameters.push(oInputParam);
                            } else {
                                sCondition = '(' + sValueAttr + ' ' + sOp + ' ' + that._toValue(sFromValue, sDataType) + ')';
                            }
                    }
                } // end if
                oCondition.condition = sCondition;
                oCondition.parameters = aParameters;
                return oCondition;
            },
            _buildOrCondition: function(aVars, mSettings) {
                var that = this;
                var oSB = new StringBuffer();
                var sOrDelimeter = " OR ";
                for (var i = 0; i < aVars.length; i++) {
                    var oCondition = aVars[i];
                    oSB.append(oCondition.condition + sOrDelimeter);
                    that._aInputParameters = that._updateInputParameters(oCondition.parameters, mSettings);
                } // end for
                oSB.remove(sOrDelimeter.length);
                return oSB.toString();
            },
            //===================================
            // Escaping: A backslash \ has to be escaped as a double backslash \\.
            // A single quote ' has to be escaped as \'' (backslash and two single quotes).
            //===================================
            _escapeParam: function(value) {
                if (typeof value === "string") {
                    return value.replace(/\\/g, "\x5C\x5C").replace(/'/g, "\x5C\x27\x27");
                }
                return value;
            },
            generateObjectDefinition: function(oObjectInfo) {
                var that = this;
                var schemaName, objectName, oObject;
                var oEntity = oObjectInfo.entity;
                var oMetadata = oObjectInfo.metadata;
                var sServiceName = oObjectInfo.serviceName;
                var oCatalogDAOService = that.context.service.catalogDAO;

                if (oMetadata.isTable() || oMetadata.isTableType()) {
                    oObject = oEntity.getObject(); 
                    schemaName = oObject.schemaName;
                    objectName = oObject.tableName;
                }

                if (schemaName !== undefined && objectName !== undefined) {
                    return oCatalogDAOService.getObjectDefinition(sServiceName, schemaName, objectName).then(function(result) {
                        
                        var sql, errMsg;

                        if (result.errorCode) {
                            return result;
                        }
                        sql = result.content;

                        if (!sql) {
                            errMsg = 'Object definition on "' + schemaName + '"."' + objectName + '" not available.\nYou may have insufficient privilege on this artifact.';
                            return {
                                errorCode: "404",
                                message: errMsg
                            };
                        }

                        return {
                            statement: sql
                        }; 
                    });
                }
            }

        };
    });
