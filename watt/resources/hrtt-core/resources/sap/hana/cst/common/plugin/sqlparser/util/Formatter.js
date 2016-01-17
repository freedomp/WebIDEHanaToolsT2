/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*eslint-disable no-constant-condition, quotes*/
/*global define formatCreateStm */
/*jshint white: false */
define([], function() {
    "use strict";

    var defaultConfig;

    defaultConfig = {
        indent: "\t",
        delimiter: ";",
        carriage: "\n",
        itemDelimiter: ',',
        space: " ",
        mathOps: ["+", "-", "*", "/", "%", "="],
        compararisonOps: ["=", "!=", "<>", ">", "<", ">=", "<=", "!<", "!>", "LIKE"],
        logicalOps: ["ALL", "AND", "ANY", "BETWEEN", "EXISTS", "IN", "NOT", "OR", "IS NULL", "UNIQUE"],
        getLeveledIndent: function(iLevel) {
            var sIndents = "";

            for (var i = 0; i < iLevel; i++) {
                sIndents += this.indent;
            }
            return sIndents;
        }
    };

    Array.prototype.contains = function(oObject) {
        return this.indexOf(oObject) > -1;
    };

    function Formatter(oConfig) {
        if (oConfig) {
            this.config = oConfig;
        } else {
            this.config = defaultConfig;
        }

        this.sOriginalQuery = "";
        this.oData = null;
        this.sFormattedQuery = "";
        this.aStatementPosition = [];
        this.oCurrentQuery = undefined;
        this.oNextQuery = undefined;
        this.modules = {};
        this.modules.CREATE = this._formatCreateStm.bind(this);
        this.modules.SELECT = this._formatSelectStm.bind(this);
        this.modules.WITH = this._formatSelectStm.bind(this);
        this.modules.INSERT = this._formatInsertStm.bind(this);
        this.modules.UPSERT = this._formatInsertStm.bind(this);
        this.modules.REPLACE = this._formatInsertStm.bind(this);
        this.modules.DELETE = this._formatDeleteStm.bind(this);
        this.modules.UPDATE = this._formatUpdateStm.bind(this);
        this.modules.BEGIN = this._formatBeginStm.bind(this);
        this.modules.DECLARE = this._formatDeclareStm.bind(this);
        this.modules.CALL = this._formatCallStm.bind(this);
        this.modules.IF = this._formatIfStm.bind(this);
        this.modules.LOOP = this._formatLoopStm.bind(this);
        this.modules.WHILE = this._formatWhileStm.bind(this);
        this.modules.FOR = this._formatForStm.bind(this);
        this.modules.LOAD = this._formatLoadStm.bind(this);
        this.modules.DO = this._formatDoStm.bind(this);

        this.modules.CONTINUE = this._formatSimpleStm.bind(this);
        this.modules.BREAK = this._formatSimpleStm.bind(this);
    }

    Formatter.prototype.formatQueries = function(sOriginal, data) {
        this.oData = data;
        if (sOriginal) {
            this.sOriginalQuery = sOriginal;
        }
        this.sFormattedQuery = this._formatQueries(data.statements, -1);
        return this.sFormattedQuery;
    };

    Formatter.prototype._formatQueries = function(aQueries, iLevel) {
        iLevel += 1;
        var sFormattedQueries = '';
        if (aQueries && typeof aQueries.length === "undefined") {
            this.oCurrentQuery = aQueries;
            sFormattedQueries = this.config.getLeveledIndent(iLevel) + this.formatQuery(this.oCurrentQuery, iLevel);
        } else {
            for (var i = 0; i < aQueries.length; i++) {
                this.oCurrentQuery = aQueries[i];
                this.oNextQuery = aQueries[i + 1];
                var sQuery = '';
                if (this.oCurrentQuery.arity === "statement") {
                    sQuery = this.formatQuery(this.oCurrentQuery, iLevel);
                } else {
                    sQuery = this._formatObject(this.oCurrentQuery, iLevel);
                }

                var trimmed = sQuery.trim();
                if (trimmed[trimmed.length - 1] !== this.config.delimiter) {
                    sQuery += this.config.delimiter + this.config.carriage;
                }

                sFormattedQueries += this.config.getLeveledIndent(iLevel) + sQuery;
            }
        }
        return sFormattedQueries;
    };

    Formatter.prototype.formatQuery = function(oQuery, iLevel) {
        if (this.oCurrentQuery.messages && oQuery.messages.firstError >= 0) {
            return this._handleErrorQuery(oQuery);
        }
        return this.modules[oQuery.id] ? this.modules[oQuery.id](oQuery, iLevel) : this._handleErrorQuery(oQuery);
    };

    Formatter.prototype._handleErrorQuery = function(oQuery) {
        var sQuery = "";

        if (this.oNextQuery) {
            sQuery = this.sOriginalQuery.substring(oQuery.fromPos, this.oNextQuery.fromPos - 1).trim();
        } else {
            sQuery = this.sOriginalQuery.substring(oQuery.fromPos).trim();
        }

        sQuery += this.config.carriage;

        return sQuery;
    };

    Formatter.prototype._formatCreateStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id,
            formatParams, formatIdentifier,
            formatTable, formatType, formatView, formatProcedure, formatSchema;

        if (!iLevel) {
            iLevel = 0;
        }

        formatIdentifier = function() {
            if (oQuery.identifier) {
                sFormattedQuery += this.config.space + this._formatObject(oQuery.identifier);
            }
        }.bind(this);

        formatParams = function() {
            var formatParam = function(oParam) {
                var sEl = oParam.parameterType + this.config.space + oParam.value;

                if (oParam.dataType) {
                    if (oParam.dataType.kind === "tableType") {
                        if (oParam.dataType.columns) {
                            sEl += this.config.space + "TABLE" + this.config.space + this._formatColumnDefinition(oParam.dataType, iLevel + 2);
                        } else {
                            sEl += this.config.space + this._formatObject(oParam.dataType, iLevel);
                        }
                    } else {
                        sEl += this.config.space + this._formatObject(oParam.dataType);
                        if (typeof oParam.length !== "undefined") {
                            sEl += "(" + oParam.length;
                            if (typeof oParam.scale !== "undefined") {
                                sEl += this.config.itemDelimiter + this.config.space + oParam.scale;
                            }
                            sEl += ")";
                        }
                    }
                }

                if (typeof oParam.defaultValue !== "undefined") {
                    sEl += this.config.space + "DEFAULT" +
                        this.config.space + this._formatObject(oParam.defaultValue);
                }

                return sEl;
            }.bind(this);

            if (oQuery.parameters) {
                sFormattedQuery += "(" + this.config.carriage;
                sFormattedQuery += this._formatCustomArray(oQuery.parameters, {
                    cDelimiter: ',',
                    fnCustomFunction: formatParam
                }, iLevel + 1) + this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + ")";
            }
        }.bind(this);

        formatTable = function() {
            if (oQuery.tableType) {
                sFormattedQuery += this.config.space + oQuery.tableType.toUpperCase();
            }
            sFormattedQuery += this.config.space + oQuery.kind.toUpperCase();

            formatIdentifier();

            if (oQuery.as) {
                sFormattedQuery += this.config.space + "AS" + this.config.space + "(" + this.config.carriage +
                    this._formatQueries(oQuery.as.subquery, iLevel) +
                    this.config.carriage + this.config.getLeveledIndent(iLevel) + ")";

                if (typeof oQuery.as.withData !== "undefined") {
                    sFormattedQuery += this.config.space + "WITH" + (!oQuery.as.withData ? this.config.space + "NO" : "") + this.config.space + "DATA";
                }
            } else if (oQuery.like) {
                sFormattedQuery += this.config.space + "LIKE" + this.config.space + this._formatObject(oQuery.like.table);

                if (typeof oQuery.like.withData !== "undefined") {
                    sFormattedQuery += this.config.space + "WITH" + (!oQuery.like.withData ? this.config.space + "NO" : "") + this.config.space + "DATA";
                }

                if (oQuery.like.options && oQuery.like.options.length) {
                    for (var i = 0; i < oQuery.like.options.length; i++) {
                        sFormattedQuery += this.config.space + "WITHOUT" + this.config.space + oQuery.like.options[i].join(' ');
                    }
                }
            } else {
                sFormattedQuery += this._formatColumnDefinition(oQuery, iLevel);

                if (typeof oQuery.unload !== "undefined") {
                    sFormattedQuery += this.config.space + "UNLOAD PRIORITY" + this.config.space + oQuery.unload;
                }

                if (typeof oQuery.merge !== "undefined") {
                    switch (oQuery.merge) {
                        case "auto":
                            sFormattedQuery += this.config.space + "AUTO MERGE";
                            break;
                        case "not auto":
                            sFormattedQuery += this.config.space + "NOT AUTO MERGE";
                            break;
                        default:
                            break;
                    }
                }

                if (oQuery.schemaFlex) {
                    sFormattedQuery += this.config.space + "WITH SCHEMA FLEXIBILITY";
                }
            }
        }.bind(this);

        formatType = function() {
            sFormattedQuery += this.config.space + "TYPE";
            formatIdentifier();

            sFormattedQuery += this.config.space + "AS TABLE";
            sFormattedQuery += this._formatColumnDefinition(oQuery, iLevel);
        }.bind(this);

        formatView = function() {
            sFormattedQuery += this.config.space + oQuery.kind.toUpperCase();
            formatIdentifier();

            if (oQuery.columnNames && oQuery.columnNames.length > 0) {
                sFormattedQuery += "(" + this._formatObject(oQuery.columnNames, iLevel) + ")";
            }

            sFormattedQuery += this.config.carriage + "AS";
            if (oQuery.as && oQuery.as.subquery) {
                sFormattedQuery += this.config.carriage + this._formatObject(oQuery.as.subquery, iLevel);
            }
        }.bind(this);

        formatProcedure = function() {
            sFormattedQuery += this.config.space + oQuery.kind.toUpperCase();
            formatIdentifier();
            formatParams();

            if (oQuery.language) {
                sFormattedQuery += this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + "LANGUAGE" + this.config.space + this._formatObject(
                    oQuery.language);
            }
            if (oQuery.security) {
                sFormattedQuery += this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + "SQL SECURITY" + this.config.space + this._formatObject(
                    oQuery.security);
            }
            if (oQuery.defaultSchema) {
                sFormattedQuery += this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + "DEFAULT SCHEMA" + this.config.space + this._formatObject(
                    oQuery.defaultSchema);
            }
            if (oQuery.readonly) {
                sFormattedQuery += this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + "READS SQL DATA";
                if (oQuery.resultView) {
                    sFormattedQuery += this.config.space + "WITH RESULT VIEW" + this.config.space + this._formatObject(oQuery.resultView);
                }
            }

            sFormattedQuery += this.config.carriage + "AS";

            if (oQuery.declarations) {
                var formatDeclaration = function(oDec) {
                    var sEl = this._formatObject(oDec.variables);

                    if (oDec.dataType) {
                        if (oDec.dataType.kind === "tableType") {
                            sEl += this.config.space + "TABLE" + this.config.space + this._formatColumnDefinition(oDec.dataType, iLevel + 1);
                        } else {
                            sEl += this.config.space + this._formatObject(oDec.dataType);
                            if (typeof oDec.length !== "undefined") {
                                sEl += "(" + oDec.length;
                                if (typeof oDec.scale !== "undefined") {
                                    sEl += this.config.itemDelimiter + this.config.space + oDec.scale;
                                }
                                sEl += ")";
                            }
                        }
                    }

                    if (typeof oDec.defaultValue !== "undefined") {
                        sEl += this.config.space + ":=" +
                            this.config.space + this._formatObject(oDec.defaultValue);
                    }

                    return sEl;
                }.bind(this);

                sFormattedQuery += this.config.carriage + this._formatCustomArray(oQuery.declarations, {
                    cDelimiter: ';',
                    fnCustomFunction: formatDeclaration,
                    bLastDelimiter: true
                }, iLevel);
            }

            sFormattedQuery += this.config.carriage + this._formatQueries(oQuery.block, iLevel - 1);
        }.bind(this);

        formatSchema = function() {
            sFormattedQuery += this.config.space + oQuery.kind.toUpperCase();
            formatIdentifier();

            if (oQuery.owner) {
                sFormattedQuery += this.config.space + "OWNED BY" + this.config.space + this._formatObject(oQuery.owner);
            }
        }.bind(this);

        if (oQuery.kind) {
            switch (oQuery.kind) {
                case "table":
                    formatTable();
                    break;
                case "table type":
                    formatType();
                    break;
                case "view":
                    formatView();
                    break;
                case "procedure":
                    formatProcedure();
                    break;
                case "schema":
                    formatSchema();
                    break;
                default:
                    sFormattedQuery = this._handleErrorQuery(oQuery);
                    break;
            }
        }
        return sFormattedQuery;
    };

    Formatter.prototype._formatColumnDefinition = function(oQuery, iLevel) {
        var sResult = '';
        if (oQuery.columns) {
            sResult += "(" + this.config.carriage;
            var sEls = "";
            for (var i = 0; i < oQuery.columns.length; i++) {
                var el = oQuery.columns[i],
                    sEl = el.value;

                if (el.dataType) {
                    sEl += this.config.space + el.dataType;
                    if (typeof el.length !== "undefined") {
                        sEl += "(" + el.length;
                        if (typeof el.scale !== "undefined") {
                            sEl += this.config.itemDelimiter + this.config.space + el.scale;
                        }
                        sEl += ")";
                    }
                }

                if (el.columnStoreDataType) {
                    sEl += this.config.space + el.columnStoreDataType;
                }

                if (typeof el.defaultValue !== "undefined") {
                    sEl += this.config.space + "DEFAULT" +
                        this.config.space + (typeof el.defaultValue === "string" ? "'" + el.defaultValue + "'" : el.defaultValue);
                }

                if (typeof el.isNull !== "undefined") {
                    sEl += this.config.space + (el.isNull ? "" : "NOT" + this.config.space) + "NULL";
                }

                if (typeof el.threshold !== "undefined") {
                    sEl += this.config.space + "MEMORY THRESHOLD" + this.config.space + el.threshold;
                }

                if (el.generated) {
                    sEl += this.config.space + "GENERATED ";
                    if (el.generated === "byDefault") {
                        sEl += "BY DEFAULT";
                    } else {
                        sEl += "ALWAYS";
                    }

                    if (el.asIdentity) {
                        sEl += this.config.space + "AS IDENTITY";
                    }

                    var formatOption = function(oObject) {
                        var sOption = '';

                        switch (oObject.name) {
                            case "startWith":
                                sOption += "START WITH ";
                                break;
                            case "incrementBy":
                                sOption += "INCREMENT BY ";
                                break;
                            case "maxValue":
                                sOption += "MAX VALUE ";
                                break;
                            case "minValue":
                                sOption += "MIN VALUE ";
                                break;
                            case "cycle":
                                sOption += "CYCLE";
                                break;
                            case "cache":
                                sOption += "CACHE ";
                                break;
                            case "noMaxValue":
                                sOption += "NO MAX VALUE";
                                break;
                            case "noMinValue":
                                sOption += "NO MIN VALUE";
                                break;
                            case "noCycle":
                                sOption += "NO CYCLE";
                                break;
                            case "noCache":
                                sOption += "NO CACHE";
                                break;
                        }

                        if (["startWith", "incrementBy", "maxValue", "minValue", "cache"].indexOf(oObject.name) !== -1) {
                            sOption += this._formatObject(oObject.value);
                        }

                        return sOption;
                    }.bind(this);

                    if (el.generatedSeqOps && el.generatedSeqOps.length > 0) {
                        sEl += this.config.space + "(" + this._formatCustomArray(el.generatedSeqOps, {
                            cDelimiter: ',',
                            fnCustomFunction: formatOption
                        }) + ")";
                    }
                }

                if (el.isPrimaryKey) {
                    sEl += this.config.space + "PRIMARY KEY";
                }

                if (el.fuzzyIndex) {
                    sEl += this.config.space + "FUZZY SEARCH INDEX" + this.config.space + el.fuzzyIndex.toUpperCase();
                }

                if (el.fuzzyMode) {
                    sEl += this.config.space + "FUZZY SEARCH MODE" + this.config.space + this._formatObject(el.fuzzyMode);
                }

                if (oQuery.columns[i + 1] || (oQuery.constraints && oQuery.constraints.length > 0)) {
                    sEl += this.config.itemDelimiter;
                }
                sEl += this.config.carriage;
                sEls += this.config.getLeveledIndent(iLevel + 1) + sEl;
            }
            if (oQuery.constraints && oQuery.constraints.length > 0) {
                var j = 0;
                for (i = 0; i < oQuery.constraints.length; i++) {
                    var oObject = oQuery.constraints[i];
                    sEl = "";
                    switch (oObject.constraintType) {
                        //case "unique":
                        case "primary key":
                            sEl += "PRIMARY KEY" + this.config.space;
                            if (oObject.indexType) {
                                switch (oObject.indexType) {
                                    case "btree":
                                        sEl += "BTREE";
                                        break;
                                    case "cpbtree":
                                        sEl += "CPBTREE";
                                        break;
                                    case "inverted hash":
                                        sEl += "INVERTED HASH";
                                        break;
                                    case "inverted value":
                                        sEl += "INVERTED VALUE";
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (oObject.columns) {
                                sEl += "(" + this.config.carriage;
                                for (j = 0; j < oObject.columns.length; j++) {
                                    sEl += this.config.getLeveledIndent(iLevel + 2) + "{0}".replace('{0}', oObject.columns[j].value) + (oObject.columns[j + 1] ? "," :
                                        "") + this.config.carriage;
                                }
                                sEl += this.config.getLeveledIndent(iLevel + 1) + ")";
                            }
                            break;
                        case "foreign key":
                            sEl += "FOREIGN KEY(" + this._formatObject(oObject.columns) + ")" + this.config.space + "REFERENCES" + this.config.space + this._formatObject(
                                oObject.references.identifier);
                            if (oObject.references.actions && oObject.references.actions.length) {
                                for (j = 0; j < oObject.references.actions.length; j++) {
                                    sEl += this.config.space + "ON" + this.config.space + this._formatObject(oObject.references.actions[j].name).toUpperCase() +
                                        this.config.space +
                                        (oObject.references.actions[j].value.toUpperCase() === "CASCADE" ? "CASCADE" : "SET" + this.config.space + oObject.references.actions[
                                        j].value.toUpperCase());
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    if (oQuery.constraints[i + 1]) {
                        sEl += this.config.itemDelimiter;
                    }
                    sEls += this.config.getLeveledIndent(iLevel + 1) + sEl + this.config.carriage;
                }
            }

            sResult += sEls + this.config.getLeveledIndent(iLevel) + ")";
        }
        return sResult;
    };

    Formatter.prototype._formatSelectStm = function(oQuery, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }

        var bSubQuery = iLevel > 0;
        if (bSubQuery || oQuery.alias) {
            iLevel += 1;
        }
        var sStatementIndent = this.config.getLeveledIndent(iLevel),
            sFormattedStatement = /*sStatementIndent +*/ oQuery.id;

        // process WITH statement here 
        if (oQuery.id === "WITH") {
            var formatWithList = function(oWithItem) {
                var sResult = '';

                sResult += this._formatObject(oWithItem);
                if (oWithItem.columnNames && oWithItem.columnNames.length > 0) {
                    sResult += "(" + this._formatObject(oWithItem.columnNames) + ")";
                }

                sResult += this.config.space + "AS (" + this.config.carriage +
                    this.config.getLeveledIndent(iLevel + 1) + this._formatQueries(oWithItem.definition, iLevel) + this.config.carriage +
                    this.config.getLeveledIndent(iLevel) + ")";
                return sResult;
            }.bind(this);

            sFormattedStatement += this.config.space + this._formatCustomArray(oQuery.items, {
                cDelimiter: ',',
                fnCustomFunction: formatWithList,
                bLastDelimiter: false,
                bUsedIn: true
            }, iLevel).replace(/^\t+/g, "");

            sFormattedStatement += this.config.carriage + sStatementIndent + "SELECT";
        }

        if (typeof oQuery.top !== "undefined") {
            sFormattedStatement += this.config.space + "TOP" + this.config.space + this._formatObject(oQuery.top) +
                this.config.carriage + this.config.getLeveledIndent(iLevel + 1);
        }
        if (oQuery.columns) {
            sFormattedStatement += this.config.space + this._formatObject(oQuery.columns, iLevel);
        }
        if (oQuery.into) {
            sFormattedStatement += this.config.carriage + sStatementIndent + "INTO" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.into, iLevel);
        }
        if (oQuery.from) {
            sFormattedStatement += this.config.carriage + sStatementIndent + "FROM" + this.config.space;
            sFormattedStatement += this._formatFromClause(oQuery.from, iLevel);
        }
        if (oQuery.where) {
            sFormattedStatement += this.config.carriage + sStatementIndent + "WHERE" + this.config.space;
            sFormattedStatement += this._formatWhereClause(oQuery.where, iLevel);
        }
        if (oQuery.groupBy) {
            sFormattedStatement += this.config.carriage + sStatementIndent + "GROUP BY" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.groupBy, iLevel);
        }
        if (oQuery.having) {
            sFormattedStatement += this.config.carriage + sStatementIndent + "HAVING" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.having, iLevel);
        }
        if (oQuery.orderBy) {
            var formatOrderBy = function(oOrderBy) {
                return this._formatObject(oOrderBy) + this.config.space + (oOrderBy.descending ? "DESC" : "ASC");
            }.bind(this);

            sFormattedStatement += this.config.carriage + sStatementIndent + "ORDER BY" + this.config.space;
            sFormattedStatement += this._formatCustomArray(oQuery.orderBy, {
                cDelimiter: ',',
                fnCustomFunction: formatOrderBy,
                bLastDelimiter: false
            }, iLevel).replace(/^\t+/g, "");
        }
        if (typeof oQuery.limit !== "undefined") {
            sFormattedStatement += this.config.carriage + sStatementIndent + "LIMIT" + this.config.space + oQuery.limit.toString();
            if (typeof oQuery.offset !== "undefined") {
                sFormattedStatement += this.config.carriage + sStatementIndent + "OFFSET" + this.config.space + oQuery.offset.toString();
            }
        }
        if (oQuery.setOperator) {
            var sOperator = oQuery.setOperator.id;
            if (sOperator === "UNION" && !oQuery.setOperator.distinct) {
                sOperator += this.config.space + "ALL";
            }
            sFormattedStatement += this.config.carriage + this.config.carriage + sStatementIndent + sOperator + this.config.carriage +
                this.config.carriage;
            sFormattedStatement += this.config.getLeveledIndent(iLevel - 1) + this._formatQueries(oQuery.setOperator.second, iLevel - 2);
        }
        return sFormattedStatement;
    };

    Formatter.prototype.insertWhereClsIntoStm = function(oQuery, sWhereCls, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        if (oQuery.alias) {
            iLevel += 1;
        }
        var sStatementIndent = this.config.getLeveledIndent(iLevel),
            sFormattedStatement = sStatementIndent + oQuery.id + this.config.space,
            bSubQuery = iLevel > 0;
        if (typeof oQuery.top !== "undefined") {
            sFormattedStatement += "TOP" + this.config.space + oQuery.top.toString() + this.config.space;
        }
        if (oQuery.columns) {
            sFormattedStatement += this._formatObject(oQuery.columns, iLevel) + this.config.carriage;
        }
        if (oQuery.from) {
            sFormattedStatement += sStatementIndent + "FROM" + this.config.space;
            sFormattedStatement += this._formatFromClause(oQuery.from, iLevel) + this.config.carriage;
        }
        if (oQuery.where) {
            sFormattedStatement += sStatementIndent + "WHERE" + this.config.space;
            sFormattedStatement += this._formatWhereClause(oQuery.where, iLevel) + this.config.carriage;
            sFormattedStatement += "AND" + sWhereCls + this.config.space;
        } else {
            sFormattedStatement += sStatementIndent + "WHERE" + this.config.space;
            sFormattedStatement += sWhereCls + this.config.space;
        }
        if (oQuery.groupBy) {
            sFormattedStatement += sStatementIndent + "GROUP BY" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.groupBy, iLevel) + this.config.carriage;
        }
        if (oQuery.having) {
            sFormattedStatement += sStatementIndent + "HAVING" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.having, iLevel) + this.config.carriage;
        }
        if (oQuery.orderBy) {
            sFormattedStatement += sStatementIndent + "ORDER BY" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.orderBy, iLevel) + this.config.carriage;
        }
        if (typeof oQuery.limit !== "undefined") {
            sFormattedStatement += sStatementIndent + "LIMIT" + this.config.space + oQuery.limit.toString() + this.config.carriage;
            if (typeof oQuery.offset !== "undefined") {
                sFormattedStatement += sStatementIndent + "OFFSET" + this.config.space + oQuery.offset.toString() + this.config.carriage;
            }
        }
        if (oQuery.setOperator) {
            sFormattedStatement += this.config.carriage + sStatementIndent + oQuery.setOperator.value + this.config.carriage + this.config.carriage;
            sFormattedStatement += this._formatSelectStm(oQuery.setOperator.second, iLevel) + this.config.carriage;
        }
        return sFormattedStatement;
    };

    Formatter.prototype._formatInsertStm = function(oQuery, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        var sFormattedStatement;
        switch (oQuery.id) {
            case "INSERT":
                sFormattedStatement = "INSERT INTO";
                break;
            case "UPSERT":
                sFormattedStatement = "UPSERT";
                break;
            case "REPLACE":
                sFormattedStatement = "REPLACE";
                break;
        }
        sFormattedStatement += this.config.space;

        if (oQuery.table) {
            sFormattedStatement += this._formatObject(oQuery.table, iLevel);
        }
        if (oQuery.columns) {
            sFormattedStatement += "(" + this._formatObject(oQuery.columns, undefined, {
                bNameOnly: true
            }) + ")";
        }

        if (Array.isArray(oQuery.values)) {
            sFormattedStatement += this.config.space + "VALUES";
            sFormattedStatement += "(" + this._formatObject(oQuery.values) + ")";
        } else if (typeof oQuery.values !== "undefined") {
            sFormattedStatement += this.config.carriage + this._formatObject(oQuery.values, iLevel);
        }

        if (oQuery.where) {
            sFormattedStatement += this.config.carriage + this.config.getLeveledIndent(iLevel) + "WHERE" + this.config.space;
            sFormattedStatement += this._formatWhereClause(oQuery.where, iLevel);
        }

        if (oQuery.withPrimaryKey) {
            sFormattedStatement += this.config.carriage + this.config.getLeveledIndent(iLevel) + "WITH PRIMARY KEY";
        }

        return sFormattedStatement;
    };

    Formatter.prototype._formatDeleteStm = function(oQuery, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        var sFormattedStatement = oQuery.id;

        if (oQuery.history) {
            sFormattedStatement += this.config.space + "HISTORY";
        }

        //sFormattedStatement += this.config.carriage;

        if (oQuery.from) {
            sFormattedStatement += /*this.config.carriage + this.config.getLeveledIndent(iLevel)*/ this.config.space + "FROM" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.from, iLevel);
        }

        if (oQuery.where) {
            sFormattedStatement += this.config.carriage + this.config.getLeveledIndent(iLevel) + "WHERE" + this.config.space;
            sFormattedStatement += this._formatWhereClause(oQuery.where, iLevel);
        }

        return sFormattedStatement;
    };

    Formatter.prototype._formatUpdateStm = function(oQuery, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        var sFormattedStatement = "UPDATE" + this.config.space;

        if (oQuery.table) {
            sFormattedStatement += this._formatObject(oQuery.table, iLevel);
        }

        if (oQuery.set) {
            sFormattedStatement += this.config.carriage + "SET" + this.config.space;
            sFormattedStatement += this._formatObject(oQuery.set, iLevel);
        }

        if (oQuery.from) {
            sFormattedStatement += this.config.carriage + "FROM" + this.config.space;
            sFormattedStatement += this._formatFromClause(oQuery.from, iLevel);
        }

        if (oQuery.where) {
            sFormattedStatement += this.config.carriage + "WHERE" + this.config.space;
            sFormattedStatement += this._formatWhereClause(oQuery.where, iLevel);
        }

        return sFormattedStatement;
    };

    Formatter.prototype._formatBlock = function(oQuery, iLevel) {
        var sFormattedQuery = '';

        if (oQuery.sequentialExecution) {
            sFormattedQuery += this.config.space + "SEQUENTIAL EXECUTION";
        }

        if (oQuery.declarations && oQuery.declarations.length > 0) {
            sFormattedQuery += this.config.carriage + this._formatQueries(oQuery.declarations, iLevel);
        }
        if (oQuery.statements && oQuery.statements.length > 0) {
            sFormattedQuery += this.config.carriage + this._formatQueries(oQuery.statements, iLevel);
        }

        return sFormattedQuery;
    };

    Formatter.prototype._formatBeginStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this._formatBlock(oQuery, iLevel);

        sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END';
        return sFormattedQuery;
    };

    Formatter.prototype._formatDoStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this.config.space + this._formatQueries(oQuery.block, iLevel - 1);

        //sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END';
        return sFormattedQuery;
    };

    Formatter.prototype._formatDeclareStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this.config.space + this._formatObject(oQuery.variables);
        if (oQuery.dataType) {
            if (oQuery.dataType.kind === "tableType") {
                sFormattedQuery += this.config.space + "TABLE" + this.config.space + this._formatColumnDefinition(oQuery.dataType, iLevel + 1);
            } else {
                sFormattedQuery += this.config.space + this._formatObject(oQuery.dataType);
                if (typeof oQuery.length !== "undefined") {
                    sFormattedQuery += "(" + oQuery.length;
                    if (typeof oQuery.scale !== "undefined") {
                        sFormattedQuery += this.config.itemDelimiter + this.config.space + oQuery.scale;
                    }
                    sFormattedQuery += ")";
                }
            }
        }

        if (oQuery.isArray) {
            sFormattedQuery += this.config.space + "ARRAY";
        }

        if (typeof oQuery.defaultValue !== "undefined") {
            sFormattedQuery += this.config.space + ":=" +
                this.config.space + this._formatObject(oQuery.defaultValue, undefined, {
                    bFunctionInline: true
                });
        }
        // TODO: cursor & error handler
        return sFormattedQuery;
    };

    Formatter.prototype._formatIfStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        if (oQuery.condition) {
            sFormattedQuery += this.config.space + "(" + this._formatObject(oQuery.condition) + ")";
        }

        sFormattedQuery += this.config.space + "THEN" + this._formatBlock(oQuery.then, iLevel);

        for (var i = 0; i < oQuery.elseif.length; i++) {
            sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'ELSEIF';
            if (oQuery.elseif[i].condition) {
                sFormattedQuery += this.config.space + "(" + this._formatObject(oQuery.elseif[i].condition) + ")";
            }
            sFormattedQuery += this.config.space + "THEN" + this._formatBlock(oQuery.elseif[i], iLevel);
        }

        if (oQuery.else) {
            sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'ELSE' + this._formatBlock(oQuery.else, iLevel);
        }

        sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END IF';
        return sFormattedQuery;
    };

    Formatter.prototype._formatLoopStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this._formatBlock(oQuery, iLevel);

        sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END LOOP';
        return sFormattedQuery;
    };

    Formatter.prototype._formatWhileStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        if (oQuery.condition) {
            sFormattedQuery += this.config.space + "(" + this._formatObject(oQuery.condition) + ")";
        }

        sFormattedQuery += this.config.space + "DO" + this._formatBlock(oQuery.do, iLevel);

        sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END WHILE';
        return sFormattedQuery;
    };

    Formatter.prototype._formatForStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this.config.space + this._formatObject(oQuery.variable);

        if (oQuery.cursor) {
            sFormattedQuery += this.config.space + "AS" + this.config.space + this._formatObject(oQuery.cursor, undefined, {
                bFunctionInline: true
            });
        } else {
            sFormattedQuery += this.config.space + "IN" + this.config.space + this._formatObject(oQuery.from) + ".." + this._formatObject(oQuery.to);
        }

        sFormattedQuery += this.config.space + "DO" + this._formatBlock(oQuery.do, iLevel);

        sFormattedQuery += this.config.getLeveledIndent(iLevel) + 'END FOR';
        return sFormattedQuery;
    };

    Formatter.prototype._formatSimpleStm = function(oQuery, iLevel) {
        return oQuery.id;
    };

    Formatter.prototype._formatCallStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this.config.space + this._formatObject(oQuery.target, iLevel, {
            bFunctionInline: false
        });

        return sFormattedQuery;
    };

    Formatter.prototype._formatLoadStm = function(oQuery, iLevel) {
        var sFormattedQuery = oQuery.id;

        sFormattedQuery += this.config.space + this._formatObject(oQuery.table, iLevel, {
            bFunctionInline: true
        });

        if (oQuery.historyTable) {
            sFormattedQuery += this.config.space + "HISTORY";
        }
        if (oQuery.loadType) {
            sFormattedQuery += this.config.space + oQuery.loadType.toUpperCase();
        }

        return sFormattedQuery;
    };

    Formatter.prototype._formatCustomArray = function(aObject, oConfig, iLevel) { // {cDelimiter, fnCustomFunction}
        var sResult = "",
            i;

        if (aObject.length) {
            sResult = this.config.getLeveledIndent(iLevel + 1);
        }
        if (!oConfig.bUsedIn) {
            for (i = 0; i < aObject.length; i++) {
                sResult += oConfig.fnCustomFunction(aObject[i]) +
                    (aObject[i + 1] ? oConfig.cDelimiter + ' ' + (!oConfig.bFunctionInline && typeof iLevel !== 'undefined' ? this.config.carriage + this
                    .config
                    .getLeveledIndent(iLevel + 1) :
                    '') : (oConfig.bLastDelimiter ? oConfig.cDelimiter : ''));
            }
        } else {
            for (i in aObject) {
                if (!aObject.hasOwnProperty(i)) {
                    continue;
                }
                sResult += oConfig.fnCustomFunction(aObject[i]) +
                    oConfig.cDelimiter + ' ' + this.config.carriage + this.config
                    .getLeveledIndent(iLevel + 1);
            }

            sResult = sResult.trimRight();
            sResult = sResult.substring(0, sResult.length - 1);
        }

        return sResult;
    };

    Formatter.prototype._formatArray = function(oObject, delimiter, iLevel, oConfig) { // {bInFrom}
        var sResult = "";

        for (var i = 0; i < oObject.length; i++) {
            sResult += this._formatObject(oObject[i], iLevel, oConfig) +
                (oObject[i + 1] ? delimiter + ' ' + (!oConfig.bFunctionInline && typeof iLevel !== 'undefined' ? this.config.carriage + this.config.getLeveledIndent(
                    iLevel + 1) :
                '') : '');
        }

        return sResult;
    };

    Formatter.prototype._formatObject = function(oObject, iLevel, oConfig) { // {bInFrom}
        var sResult;

        if (!oConfig) {
            oConfig = {};
        }

        if (Array.isArray(oObject)) {
            sResult = this._formatArray(oObject, ',', iLevel, oConfig);
            if (oConfig.isWarpAround) {
                sResult = "(" + sResult + ")";
            }
        } else if (oObject.id === '(' && oObject.arity === 'infix') {
            sResult = this._formatFunction(oObject, iLevel, oConfig);
        } else if (oObject.pattern) {
            sResult = this._formatObject(oObject.pattern, iLevel, oConfig) + (oObject.escape ? this.config.space + "ESCAPE" + this.config.space +
                this._formatObject(
                    oObject.escape, iLevel, oConfig) : '');
        } else if (oObject.type === "operator") {
            sResult = this._formatExpression(oObject, iLevel, oConfig);
        } else if (oObject.arity === "statement") {
            sResult = this._formatQueries(oObject, iLevel, oConfig);

            if (oObject.alias && typeof oObject.alias !== "string") {
                sResult = "(" + this.config.carriage + this.config.getLeveledIndent(iLevel + 1) +
                    sResult +
                    this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + ")" + this.config.space + "AS" + this.config.space + oObject.alias.value;
            } else if (oConfig.bInFrom) {
                sResult = "(" + this.config.carriage +
                    this.config.getLeveledIndent(iLevel + 1) + sResult +
                    this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + ")";
            }
        } else if (oObject.kind === "functionresult") {
            sResult = this._formatFunction(oObject.function, iLevel, oConfig) + "." + this._formatObjectName(oObject, oConfig);
        } else {
            sResult = this._formatObjectName(oObject, oConfig);
        }

        if (oObject.alias && oObject.arity !== "statement" && typeof oObject.alias === "object") {
            sResult += this.config.space + "AS" + this.config.space + this._formatObject(oObject.alias, iLevel, oConfig);
        }

        return sResult;
    };

    Formatter.prototype._formatObjectName = function(oObject, oConfig) {
        var sResult;

        if (oObject.type === "name" || oObject.type === "qname") {
            var tmpl = "{0}.{1}";
            sResult = oObject.value;
            if (!oConfig || !oConfig.bNameOnly) {
                if (oObject.table) {
                    sResult = tmpl.replace("{0}", this._formatObject(oObject.table)).replace("{1}", sResult);
                } else if (oObject.schema) {
                    sResult = tmpl.replace("{0}", this._formatObject(oObject.schema)).replace("{1}", sResult);
                }
            }
            if (oObject.arrayIndex) {
                sResult += "[" + this._formatObject(oObject.arrayIndex) + "]";
            }
        } else if (oObject.type === "literal") {
            if (typeof oObject.number === "undefined") {
                sResult = '\'' + oObject.value + '\'';
            } else {
                sResult = oObject.value;
            }
        } else if (typeof oObject === "string" || typeof oObject === "number") {
            sResult = oObject;
        } else if (oObject.type === "varref") {
            sResult = oObject.value;
        }

        return sResult;
    };

    Formatter.prototype._formatExpression = function(oObject, iLevel, oConfig) {
        var sResult;
        var oINConfig;

        if (oObject.id === "JOIN") {
            sResult = this._formatJoinExpression(oObject, iLevel, oConfig);
        } else if (oObject.value === "*" || oObject.value === "?") {
            sResult = oObject.value;
        } else if (oObject.arity === "infix") {
            if (this.config.logicalOps.contains(oObject.id)) {
                if (oObject.id === "IN") {
                    if (Array.isArray(oObject.first)) {
                        oINConfig = jQuery.extend(true, {
                            isWarpAround: true,
                            bFunctionInline: true
                        }, oConfig);
                    }
                    sResult = "(" + this._formatObject(oObject.first, iLevel + 1, oINConfig) + (oObject.inverse ? this.config.space + 'NOT' : '') + this.config
                        .space + oObject.id + this.config.space +
                        "(" + this._formatObject(oObject.second, iLevel, {
                            bFunctionInline: true
                        }).replace(/^\t+/g, "") + ")" + ")";
                } else if (oObject.id === "BETWEEN") {
                    sResult = this._formatObject(oObject.first, iLevel, oConfig) + (oObject.inverse ? this.config.space + 'NOT' : '') +
                        this.config.space + oObject.id + this.config.space + this._formatObject(oObject.second.low, iLevel, oConfig) + this.config.space +
                        "AND" + this.config.space + this._formatObject(oObject.second.high, iLevel, oConfig);
                } else {
                    var iLevel_01 = iLevel,
                        iLevel_02 = iLevel;

                    if (["AND", "OR"].indexOf(oObject.id) !== -1 && (["AND", "OR"].indexOf(oObject.first.id) !== -1 || ["AND", "OR"].indexOf(oObject.second.id) !== -1)) {
                        if (oObject.id === "AND" && oObject.first.id === "OR") {
                            oObject.first.needBracket = true;
                        }
                        if (oObject.id === "AND" && oObject.second.id === "OR") {
                            oObject.second.needBracket = true;
                        }
                        if ((["AND", "OR"].indexOf(oObject.id) !== -1 && oObject.first.id === "AND") || (oObject.id === "OR" && oObject.first.id === "OR")) {
                            iLevel_01--;
                        }
                        if ((["AND", "OR"].indexOf(oObject.id) !== -1 && oObject.second.id === "AND") || (oObject.id === "OR" && oObject.second.id === "OR")) {
                            iLevel_02--;
                        }
                    }
                    sResult = this._formatObject(oObject.first, iLevel_01 + 1, oConfig) + this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + (oObject.inverse ? 'NOT' + this.config.space : '') + oObject.id + this.config.space +
                        this._formatObject(oObject.second, iLevel_02 + 1, oConfig).replace(/^\t+/g, "");
                    if (oObject.needBracket) {
                        sResult = "(" + sResult + ")";
                    }
                }
            } else if (this.config.mathOps.contains(oObject.id) || this.config.compararisonOps.contains(oObject.id) || [":=", "||"].indexOf(oObject
                .id) !== -1) {
                sResult = this._formatObject(oObject.first, iLevel, oConfig) + (oObject.inverse ? this.config.space + 'NOT' : '') +
                    this.config.space + oObject.id + this.config.space + this._formatObject(oObject.second, iLevel, oConfig).replace(/^\t+/g, "");
            } else if (!(this.config.mathOps.contains(oObject.id) || this.config.compararisonOps.contains(oObject.id)) && [".", ":=", "OVER"].indexOf(
                oObject.id) < 0) {
                sResult = this.config.getLeveledIndent(iLevel) + this._formatObject(oObject.first, iLevel + 1, oConfig) + this.config.carriage +
                    this.config.getLeveledIndent(iLevel + 1) + oObject.id + this.config.space + this._formatObject(oObject.second, iLevel + 1, oConfig).replace(
                        /^\t+/g, "");
            } else if (oObject.id === "OVER") {
                sResult = this._formatObject(oObject.first, iLevel, oConfig) +
                    this.config.space + oObject.id + this.config.space + "(ORDER BY" + this.config.space + this._formatObject(oObject.second.orderBy,
                        iLevel, oConfig) + ")";
            } else {
                sResult = this._formatObject(oObject.first, iLevel, oConfig) + oObject.id + this._formatObject(oObject.second, iLevel, oConfig).replace(
                    /^\t+/g, "");
            }
        } else if (oObject.arity === "prefix") {
            if (oObject.first && oObject.first.type === "literal") {
                sResult = oObject.id + this._formatObject(oObject.first, iLevel, oConfig).replace(/^\t+/g, "");
            } else {
                sResult = oObject.id + this.config.space + "(" + this._formatObject(oObject.first, iLevel, oConfig).replace(/^\t+/g, "") + ")";
            }
        } else if (oObject.arity === "suffix") {
            if (oObject.id === "IS") {
                sResult = this._formatObject(oObject.first, iLevel, oConfig) +
                    this.config.space + oObject.id + (oObject.inverse ? this.config.space + 'NOT' : '') + this.config.space + "NULL";
            } else if (oObject.second) {
                sResult = this._formatObject(oObject.first, iLevel, oConfig) +
                    this.config.space + oObject.id + (oObject.inverse ? this.config.space + 'NOT' : '') + this.config.space + this._formatObject(oObject.second,
                        iLevel, oConfig).replace(/^\t+/g, "");
            }
        } else {
            sResult = this._formatObjectName(oObject, oConfig);
        }

        return sResult;
    };

    Formatter.prototype._formatFunction = function(oObject, iLevel, oConfig) {
        var sResult = "",
            sParam;
        if (Array.isArray(oObject)) {
            var formatParam = function(oParam) {
                var sEl = '';

                if (oParam.name) {
                    sEl += (oParam.prefix ? this._formatObject(oParam.prefix, undefined, oConfig) + "." : "") + this._formatObject(oParam
                        .name, iLevel, oConfig) +
                        this.config.space + (oConfig.sFunctionSymbol ? oConfig.sFunctionSymbol : "=>") + this.config.space;
                }

                sEl += this._formatObject(oParam.value, iLevel + 1, oConfig);

                return sEl;
            }.bind(this);

            var sFunctionSymbol = "=>";

            if (oObject[0] && oObject[0].name && oObject[0].name === "PLACEHOLDER") {
                sFunctionSymbol = "=";
            }

            sResult += this._formatCustomArray(oObject, {
                cDelimiter: ',',
                fnCustomFunction: formatParam,
                sFunctionSymbol: sFunctionSymbol,
                bFunctionInline: oConfig.bFunctionInline
            }, iLevel + 1);
        } else if (oObject.id === "(") {
            sResult = this._formatFunction(oObject.first, iLevel, oConfig);
            sParam = this._formatFunction(oObject.second, iLevel, oConfig);

            if (oConfig.bFunctionInline || !oObject.second.length || oObject.second.length === 1) {
                sResult += '(' + sParam.replace(/^\t+/g, "") + ')';
            } else {
                sResult += '(' + this.config.carriage + sParam + this.config.carriage + this.config.getLeveledIndent(iLevel + 1) + ')';
            }

            if (oObject.withOrdinality) {
                sResult += this.config.space + "WITH ORDINALITY";
            }

            if (oObject.columns && oObject.columns.length > 0) {
                sResult += this.config.space + "AS" + this.config.space + "(" + this._formatObject(oObject.columns, undefined, {
                    bFunctionInline: true
                }) + ")";
            }
        } else {
            sResult = this._formatObjectName(oObject, oConfig);
        }
        return sResult;
    };

    Formatter.prototype._formatFromClause = function(aFromClauses, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        var sFormattedFrom = "";

        for (var i = 0; i < aFromClauses.length; i++) {
            var oObject = aFromClauses[i];

            sFormattedFrom += this.config.getLeveledIndent((iLevel + 1) * (i > 0)) + this._formatObject(oObject, iLevel, {
                bInFrom: true
            });

            if (aFromClauses[i + 1]) {
                sFormattedFrom += this.config.itemDelimiter + this.config.carriage;
            }
        }
        return sFormattedFrom.replace(/^\t+/g, "");
    };

    Formatter.prototype._formatWhereClause = function(oWhereClause, iLevel) {
        if (!iLevel) {
            iLevel = 0;
        }
        return this._formatObject(oWhereClause, iLevel);
    };

    Formatter.prototype._formatJoinExpression = function(oObject, iLevel, oConfig) {
        if (!iLevel) {
            iLevel = 0;
        }
        if (oObject.alias) {
            iLevel += 1;
        }
        var sResult,
            bAliasEnable = typeof oObject.alias !== "undefined",
            sIndentLevel = this.config.carriage + this.config.getLeveledIndent(iLevel + 1);

        if (oObject.type === "operator") {
            if (oObject.id === "JOIN") {
                var sJoinType = oObject.joinType.toUpperCase() + this.config.space + "JOIN";

                sResult = this._formatObject(oObject.first, iLevel, oConfig) +
                    sIndentLevel + sJoinType + this.config.space + this._formatObject(oObject.second, iLevel, oConfig) +
                    sIndentLevel + "ON" + this.config.space + this._formatObject(oObject.on, iLevel + 1, oConfig);

                if (bAliasEnable) {
                    sResult = "(" + sIndentLevel + sResult +
                        this.config.carriage + this.config.getLeveledIndent(iLevel) + ")" +
                        this.config.space + "AS" + this.config.space + this._formatObject(oObject.alias, oConfig);
                }

                sResult = this.config.getLeveledIndent(iLevel) + sResult;
            } else {
                sResult = this.config.getLeveledIndent(iLevel) + this._formatObject(oObject.first, iLevel, oConfig) + oObject.value + this._formatObject(
                    oObject.second, iLevel, oConfig);
                if (bAliasEnable) {
                    sResult += this.config.space + "AS" + this.config.space + this._formatObject(oObject.alias, iLevel, oConfig);
                }
            }
        } else {
            sResult = this._formatObject(oObject, iLevel, oConfig);
        }

        return sResult;
    };

    return Formatter;

});
/*eslint-enable*/