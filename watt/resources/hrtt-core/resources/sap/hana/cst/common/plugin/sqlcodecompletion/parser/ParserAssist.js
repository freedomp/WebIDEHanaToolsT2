/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../../../util/SqlUtil",
        "./Scenario",
        "../template/KeywordTemplates",
        "./PreContentParser",
        "./PostContentParser"
    ],
    
    function(SqlUtil, Scenario, KeywordTemplates, PreContentParser, PostContentParser) {

        "use strict";

        var DEBUG_ENABLED = sap.hana.cst.common.sqlcodecompletion.DEBUG_ENABLED;
        
        var DEFAULT_SCHEMA = "SYS";

        function LOG(sText) {
            if (DEBUG_ENABLED) {
                console.log(sText);
            }
        }

        function ERROR(sText) {
            if (DEBUG_ENABLED) {
                console.error(sText);
            }
        }

        var SqlParser = function(sCurrentSchema, sCurrentService, oContext) {
            this._sCurrentSchema = sCurrentSchema;
            this.oContentStatus = null;
            this.context = oContext;
            this._oDAOService = this.context.service.sqlcodecompletionDAO;
            this._sCurrentService = sCurrentService;
        };

        SqlParser.prototype = jQuery.extend(SqlParser.prototype, {

            parse: function(oContentStatus) {
                this.oContentStatus = oContentStatus;
                var oContext = {
                    contextInPre: null,
                    contextInPost: null,
                    prefix: "",
                    name: "none",
                    schemaName: "%",
                    selectableObjects: [], // table, or view name list
                    currentSchema: this._sCurrentSchema,
                    currentService: this._sCurrentService
                };

                this.oContentStatus.buffer = SqlUtil.emptyAllString(this.oContentStatus.buffer);
                this.oContentStatus.buffer = SqlUtil.removeAllComments(this.oContentStatus.buffer);
                
                // parse pre content
                var oPreParser = new PreContentParser(this.oContentStatus, oContext);
                oContext.contextInPre = oPreParser.parse();

                // get preText based on pre statement
                oContext.preText = this._getPreText(oContext.contextInPre.statement);

                // parse post content
                var oPostParser = new PostContentParser(this.oContentStatus, oContext);
                oContext.contextInPost = oPostParser.parse();
                var that = this;

                // check from statement, then finalize
                var oContStatus = null;
                if ( that._isInSelectableContext(oContext.contextInPre) ) {
                    LOG(">>>The system in 'Seletable Context': " + oContext.contextInPre.name);
                    LOG(">>>The 'from' statement in Prefix: " + oContext.contextInPre.fromStatement);
                    if (oContext.contextInPre.fromStatement !== "") {
    
                        // in case subquery 
                        // select bk.TITLE
                        // from "SQLSCRIPTDOCUMENTATION4SYSTEM"."BOOKS" as bk 
                        // where bk.ISBN in (select au.ISBN from "SQLSCRIPTDOCUMENTATION4SYSTEM"."AUDIOBOOKS" as au where bk.PUBLISHER...
                        if (oContext.contextInPost.name === "from") {
                            LOG(">>>The 'from' statement in Post: " + oContext.contextInPost.subStatement);
                            return Q.all([
                                this._lookupSelectableObjects(oContext.contextInPre.fromStatement, oContext),
                                this._lookupSelectableObjects(oContext.contextInPost.subStatement, oContext)
                            ]).spread(function(result1, result2) {
                                // selectableObjects
                                var aSelectableObjects = result1.selectableObjects.concat(result2.selectableObjects);
                                oContext.selectableObjects = aSelectableObjects;
                                oContStatus = that._finalize(oContext);
                                return oContStatus;
                            });
    
                        } else {
                            return this._lookupSelectableObjects(oContext.contextInPre.fromStatement, oContext).then(function(result) {
                                // selectableObjects
                                oContext.selectableObjects = result.selectableObjects;
                                oContStatus = that._finalize(oContext);
                                return oContStatus;
                            });
                        }
    
                    } else if (oContext.contextInPost.name === "from") {
                        LOG(">>>The 'from' statement in Post: " + oContext.contextInPost.subStatement);
                        return this._lookupSelectableObjects(oContext.contextInPost.subStatement, oContext).then(function(result) {
                            // selectableObjects
                            oContext.selectableObjects = result.selectableObjects;
                            oContStatus = that._finalize(oContext);
                            return oContStatus;
                        });
    
                    } else {
                        oContStatus = that._finalize(oContext);
                        return Q(oContStatus);
                    }
                } else {
                    oContStatus = that._finalize(oContext);
                    return Q(oContStatus);
                }
            },
            
            _isInSelectableContext: function(oContextInPre) {
                switch (oContextInPre.name) {
                    case "select":
                    case "select_from_where":
                    case "select_from_join":
                    case "define_columns_in_select":
                    case "define_columns_in_select_from_where":
                    case "define_columns_in_select_from_join":
                        return true;
                    default:
                        return false;
                }
                
            },

            _finalize: function(oContext) {
                var that = this;
                
                // get prefix, schemaName, and selectable object name based on preText
                var oPreObject = that._updateStuffInPre(oContext.preText, oContext);
                oContext.prefix = oPreObject.prefix;
                oContext.schemaName = oPreObject.schemaName;
                oContext.objectName = oPreObject.objectName;
                oContext.objectType = oPreObject.objectType;
                oContext.aliasName = oPreObject.aliasName;

                // redefine context name
                oContext.name = that._redefineContextName(oContext.contextInPre, oContext.contextInPost);

                // delete oContext.contextInPre.content;
                delete oContext.contextInPre.statement;
                delete oContext.contextInPre.words;
                // delete oContext.contextInPost.content;
                delete oContext.contextInPost.statement;
                delete oContext.contextInPost.words;

                jQuery.extend(that.oContentStatus, oContext);
                that._displayContextInfo(that.oContentStatus);

                return that.oContentStatus;
            },

            //===================================
            // Get text and pre-text before the cursor
            //===================================
            _getPreText: function(sPreStatment) {
                var l;
                // get text
                var sPreText = this._getTextBefore(sPreStatment);
                while ((l = sPreText.search(/[\,\)\(\;]/ig)) >= 0) {
                    sPreText = sPreText.substring(l + 1);
                }
                // if ((sPreText.search(/\"[^\"]*\"\.\"[^\"]*\"/ig)) >= 0 || (sPreText.search(/\'/ig)) >= 0) {
                //     jQuery.extend(this.oContentStatus, oContext);
                //     return this.oContentStatus;
                // }

                return sPreText;
            },

            _getTextBefore: function(sPreContent) {
                if (!sPreContent) {
                    return "";
                }
                var aWords = sPreContent.split("\n");
                if (aWords.length === 0) {
                    return "";
                }
                aWords = aWords[aWords.length - 1].split(" ");
                if (aWords.length === 0) {
                    return "";
                }
                var sText = aWords[aWords.length - 1].trim();
                return sText;
            },

            //===================================
            // Look up to consider if the statement contains the selectable object like table, view...
            //===================================
            _lookupSelectableObjects: function(sStatement, oMainContext) {
                var that = this;
                var INVALID_CHARS_IN_ALIAS_NAME = /[\(\)\{\}]/ig;
                var oReg = /(\s*(\bfrom\b|\,|\bright\b\s+\bjoin\b|\bleft\b\s+\bjoin\b|\bfull\b\s+\bjoin\b|\bjoin\b|\binner\b\s+\bjoin\b)\s+)[\w\.\_\(\)\?\=\+\-\*\:\;\'\"\>\<\/\[\]\|]+(\s*\bas\b)?(\s+[\w\.\_\(\)\?\=\+\-\*\:\;\'\"\>\<\/\[\]\|]+)?/ig;
                var arr;
                var sFullName = "";
                // var sTableName = "";
                // var sSchemaName = "";
                var sAliasName = "";
                var sWord = "";
                var oObject = null;
                var aSelectableObjects = [];
                var aKeywords = KeywordTemplates.getSingleKeywords();

                while ((arr = oReg.exec(sStatement)) !== null) {
                    sWord = arr[0];
                    sWord = sWord.replace(/(\s*(\bfrom\b|\,|\bright\b\s+\bjoin\b|\bleft\b\s+\bjoin\b|\bfull\b\s+\bjoin\b|\bjoin\b|\binner\b\s+\bjoin\b)\s+)/ig, "");
                    var aEntries = sWord.trim().split(/(?:\s*\bas\b)?\s+/ig);
                    if (aEntries.length === 1) {
                        sFullName = aEntries[0];
                        sAliasName = sFullName;
                        sAliasName = sAliasName.replace(INVALID_CHARS_IN_ALIAS_NAME,"");
                        oObject = this._getPrefixObject(sFullName, DEFAULT_SCHEMA);
                        aSelectableObjects.push({
                            schemaName: oObject.schemaName,
                            objectName: oObject.objectName,
                            aliasName: sAliasName
                        });
                    } else if (aEntries.length >= 2) {
                        sFullName = aEntries[0];
                        sAliasName = aEntries[1];
                        sAliasName = sAliasName.replace(INVALID_CHARS_IN_ALIAS_NAME,"");
                        if (jQuery.inArray(sAliasName.toUpperCase(), aKeywords) >= 0) {
                            sAliasName = sFullName;
                        }
                        oObject = this._getPrefixObject(sFullName, DEFAULT_SCHEMA);
                        aSelectableObjects.push({
                            schemaName: oObject.schemaName,
                            objectName: oObject.objectName,
                            aliasName: sAliasName
                        });
                    }
                }

                var oCtx = that._selectContext(oMainContext);
                return that._oDAOService.getSelectableObjects(this._sCurrentService, aSelectableObjects, oCtx);
            },

            //===================================
            // Get context based on scenario configuration
            //===================================
            _getContextFromScenario: function(oScenario, sSubStmt) {
                if (oScenario && oScenario.contexts) {
                    for (var i = 0; i < oScenario.contexts.length; i++) {
                        var oCtx = oScenario.contexts[i];

                        // var oNoneCtx = this._checkNoneContext(sSubStmt, oCtx);
                        // if (oNoneCtx) {
                        //     return oNoneCtx;
                        // }
                        oCtx.subStatement = sSubStmt;
                        var iIdx = -1;
                        iIdx = this._getIndexReg(oCtx.pattern, sSubStmt);
                        if (iIdx >= 0) {
                            // oCtx.index = iIdx;
                            if (oCtx.subcontexts && oCtx.subcontexts.length > 0) {
                                var oSubCtx = this._getSubContext(oCtx);
                                if (oSubCtx) {
                                    return oSubCtx;
                                } else {
                                    return oCtx;
                                }
                            } else {
                                return oCtx;
                            }
                        }
                    }
                }

                return null;
            },

            _getSubContext: function(oContext) {
                var regDelimeter = oContext.subcontextdelimeter || /[\,\(\)]/ig;
                var aSubStmts = oContext.subStatement.split(regDelimeter);
                // var sSubStmt = aSubStmts[aSubStmts.length - 1];
                var sSubStmt = aSubStmts.pop();

                if (oContext && oContext.subcontexts) {
                    for (var i = 0; i < oContext.subcontexts.length; i++) {
                        var oSubCtx = oContext.subcontexts[i];

                        // check if hasing none context, only apply for context does not have children subcontext
                        // var oNoneCtx = this._checkNoneContext(sSubStmt, oSubCtx);
                        // if (oNoneCtx) {
                        //     return oNoneCtx;
                        // }

                        var iIdx = -1;
                        iIdx = this._getIndexReg(oSubCtx.pattern, sSubStmt);
                        if (iIdx >= 0) {
                            oSubCtx.subStatement = sSubStmt.substring(iIdx);
                            if (oSubCtx && oSubCtx.subcontexts && oSubCtx.subcontexts.length > 0) {
                                return this._getSubContext(oSubCtx, oSubCtx.subStatement);
                            } else {
                                return oSubCtx;
                            }
                        }
                    }
                }
            },

            _checkNoneContext: function(str, oCtx) {
                // only apply for the context or subcontext do not have childrend context
                if (oCtx.subcontexts && oCtx.subcontexts.length > 0) {
                    return null;
                }

                var oNoneContext = {
                    "name": "",
                    "description": "",
                    "pattern": null
                };
                var oReg = oCtx.pattern;
                var sSourcePattern = oReg.source;

                var sNewReg = "";
                var oNewReg = null;
                var iIdx = -1;

                if (jQuery.sap.endsWith(sSourcePattern, "[\\w|\\W]*")) {
                    sNewReg = sSourcePattern.substring(0, sSourcePattern.length - 1);
                    sNewReg += "+\\s+[\\w|\\W]*";
                    oNewReg = new RegExp(sNewReg, "igm");
                    iIdx = this._getIndexReg(oNewReg, str);
                    if (iIdx >= 0) {
                        oNoneContext.name = "none context IN '" + oCtx.name + "'";
                        oNoneContext.description = "none context IN '" + oCtx.name + "'";
                        oNoneContext.pattern = oNewReg;
                        oNoneContext.subStatement = str.substring(iIdx);
                        return oNoneContext;
                    }

                } else if (jQuery.sap.endsWith(sSourcePattern, "[\\w|\\W]*$")) {
                    sNewReg = sSourcePattern.substring(0, sSourcePattern.length - 2);
                    sNewReg += "+\\s+[\\w|\\W]*$";
                    oNewReg = new RegExp(sNewReg, "igm");
                    iIdx = this._getIndexReg(oNewReg, str);
                    if (iIdx >= 0) {
                        var sName = "NONE IN '" + oCtx.name + "'";
                        oNoneContext.name = sName;
                        oNoneContext.description = sName;
                        oNoneContext.pattern = oNewReg;
                        oNoneContext.subStatement = str.substring(iIdx);
                        return oNoneContext;
                    }

                }
                return null;
            },

            _getIndexReg: function(reg, str) {
                var match = null;
                var iIdx = -1;
                var iLastIdx = -1;
                while (match = reg.exec(str)) {
                    // console.log(match.index + ' ' + reg.lastIndex);
                    iLastIdx = reg.lastIndex;
                    iIdx = match.index;
                    if (iLastIdx === iIdx) {
                        break;
                    }
                }
                return iIdx;
            },

            //=============================================
            // Get some artifact info like schema name, object name, object type, alias name from pre-text
            //=============================================
            _updateStuffInPre: function(sPreText, oMainContext) {
                var oPreObject = {
                    prefix: "",
                    schemaName: "%",
                    objectName: "",
                    objectType: "",
                    aliasName: ""
                };

                if (jQuery.sap.endsWith(sPreText, "\"")) {
                    return oPreObject;
                }

                var oPrefix = this._getPrefixObject(sPreText);

                // check if it's really schemaname
                oPreObject.schemaName = oPrefix.schemaName;
                oPreObject.objectName = oPrefix.objectName;
                oPreObject.prefix = oPrefix.prefix;
                var oSelectableObject = this._getSelectableObject(oPrefix, oMainContext);
                if (oSelectableObject) {
                    oPreObject.aliasName = oSelectableObject.aliasName;
                    oPreObject.schemaName = oSelectableObject.schemaName;
                    oPreObject.objectName = oSelectableObject.objectName;
                    oPreObject.objectType = oSelectableObject.type;
                }
                return oPreObject;
            },

            _getPrefixObject: function(sPreText, sDefaultSchema) {
                if (!sDefaultSchema) {
                    sDefaultSchema = "%";
                }
                var sObjectName = "%";
                var sSchemaName = sDefaultSchema;
                var sPrefix = "";
                var aUpperBounds = "=|(".split("|");

                for (var i = 0; i < aUpperBounds.length; i++) {
                    var sUpperBound = aUpperBounds[i];
                    sPreText = sPreText.substring(sPreText.lastIndexOf(sUpperBound) + 1);
                    // sPreText = sPreText.trimLeft();
                    sPreText = this.trimLeft(sPreText);
                }

                var list = sPreText.split(/\"\.|\.\"/ig);

                // "PUBLIC"
                // "sap.hana.ide"
                // PUBLIC.tableName
                if (list.length === 1) {
                    if (jQuery.sap.startsWith(list[0], '"') || jQuery.sap.endsWith(list[0], '"')) {
                        sObjectName = list[0].replace(/\"/g, "");
                        sSchemaName = sDefaultSchema;
                        sPrefix = sObjectName;
                    } else {
                        list = sPreText.split('.');

                        // PUBLIC
                        if (list.length === 1) {
                            sSchemaName = sDefaultSchema;
                            sObjectName = list[0].replace(/\"/g, "");
                            sPrefix = sObjectName;

                            // PUBLIC.ACCESSIBLE_VIEWS
                        } else if (list.length === 2) {
                            sSchemaName = list[0].replace(/\"/g, "");
                            sObjectName = list[1].replace(/\"/g, "");
                            sPrefix = sObjectName;

                            // SQLSCRIPTDOCUMENTATION.AUDIOBOOKS.ISBN
                        } else if (list.length > 2) {
                            sSchemaName = list[0].replace(/\"/g, "");
                            sObjectName = list[1].replace(/\"/g, "");
                            sPrefix = list[2].replace(/\"/g, "");
                        }
                    }

                    // "SYSTEM"."TABLE_NAME"
                    // "sap.hana.ide"."table.name"
                } else if (list.length === 2) {
                    sSchemaName = list[0].replace(/\"/g, "");
                    sObjectName = list[1].replace(/\"/g, "");
                    sPrefix = sObjectName;

                    // "SYSTEM"."TABLE_NAME".
                    // "dxxxx_weather"."d025616.weathe
                } else if (list.length > 2) {
                    sSchemaName = list[0].replace(/\"/g, "");
                    sObjectName = list[1].replace(/\"/g, "");
                    sPrefix = list[2].replace(/\"/g, "");
                }

                return {
                    objectName: sObjectName,
                    schemaName: sSchemaName,
                    prefix: sPrefix
                };
            },

            _getSelectableObject: function(oPrefixObject, oMainContext) {
                var sSchemaName = oPrefixObject.schemaName;
                var sObjectName = oPrefixObject.objectName;

                var aSelectableObjects = oMainContext.selectableObjects;
                for (var i = 0; i < aSelectableObjects.length; i++) {
                    var oSelectableObject = aSelectableObjects[i];
                    if (oSelectableObject.aliasName.toUpperCase() === sSchemaName.toUpperCase()) {
                        return oSelectableObject;

                    } else if (oSelectableObject.schemaName.toUpperCase() === sSchemaName.toUpperCase() &&
                        oSelectableObject.objectName.toUpperCase() === sObjectName.toUpperCase()) {
                        return oSelectableObject;
                    }
                }
                return null;
            },

            _redefineContextName: function(oContextInPre, oContextInPost) {
                // var sContextName = oContextInPre.name + "_" + oContextInPost.name;
                var sContextName = oContextInPre.name;
                return sContextName;
            },

            //=============================================
            // display context info for debug purpose
            //=============================================
            _displayContextInfo: function(oContext) {
                if (DEBUG_ENABLED) {
                    // for debug
                    console.log("==============================================");
                    console.log("sqlcodecompletion.context");
                    console.dir(oContext);
                    for (var pro in oContext) {
                        var oVal = oContext[pro];
                        if (pro !== "buffer") {
                            if (typeof oVal === "string") {
                                console.log(pro + ": " + oVal);
                            } else if (typeof oVal === "object") {
                                console.log(pro + ": " + JSON.stringify(oVal));
                            }

                        }
                    }
                    console.log("\n\n");
                }
            },

            _selectContext: function(oInputContext) {
                var oContext = {
                    prefix: oInputContext.prefix,
                    preText: oInputContext.preText,
                    name: oInputContext.name,
                    currentSchema: oInputContext.currentSchema
                };
                return oContext;
            },

            trim: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/^\s+|\s+$/g, "");
            },

            trimLeft: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/^\s+/, "");
            },

            trimRight: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/\s+$/, "");
            }

        });

        return SqlParser;
    });