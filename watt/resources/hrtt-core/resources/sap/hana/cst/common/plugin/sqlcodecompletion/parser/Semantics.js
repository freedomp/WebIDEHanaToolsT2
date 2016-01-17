/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {

        "use strict";

        /*
        declare lv_timestamp string;
        declare lv_count Int;
        
        array_int INTEGER ARRAY;
        array_int INTEGER ARRAY:=ARRAY(1, 2, 3);
        array_id INTEGER ARRAY[] := ARRAY(1, 2, 3);
        */
        var DECLARE_VARIABLE = /\bDECLARE\b\s+[\w\d]+\s+[\d\w]+/ig;

        var ARRAY_VARIABLE = /[\w\d]+\s+[\d\w]+\s+\bARRAY\b/ig;

        /*
        big_pub_ids = SELECT
        big_pub_books = SELECT
        */
        var SELECT_VARIABLE = /[\w\.\_\(\)\?\=\+\-\*\:\;\,\'\"\>\<\/\[\]\|]+\s*[/=]{1}\s*\b(?:SELECT|UNNEST)\b/ig;

        // PROCEDURE
        // CREATE PROCEDURE <proc_name> [(<parameter_clause>)] [LANGUAGE <lang>] [SQL SECURITY <mode>] [DEFAULT SCHEMA <default_schema_name>] [READS SQL DATA [WITH RESULT VIEW <view_name>]] AS
        // CREATE PROCEDURE orchestrationProc LANGUAGE SQLSCRIPT AS
        // CREATE PROCEDURE ProcWithResultView(IN id INT, OUT o1 CUSTOMER) LANGUAGE SQLSCRIPT READS SQL DATA WITH RESULT VIEW ProcView AS
        /*
        CREATE PROCEDURE getOutput( IN cnt INTEGER,
                                IN currency VARCHAR(3),
                                OUT output_pubs tt_publishers,
                                OUT output_year tt_years)
        */
        // FUNCTION
        // CREATE FUNCTION <func_name> [(<parameter_clause>)] RETURNS <return_type> [LANGUAGE <lang>] [SQL SECURITY <mode>] AS <local_scalar_variables> BEGIN <function_code> END
        // CREATE FUNCTION scale (val INT) RETURNS TABLE (a INT, b INT) LANGUAGE SQLSCRIPT AS 
        // CREATE FUNCTION func_add_mul(x Double, y Double) RETURNS result_add Double, result_mul Double LANGUAGE SQLSCRIPT READS SQL DATA AS
        var CREATE_STMT = /\b(CREATE\s+)?(\w*\s+)?(PROCEDURE|FUNCTION)\b\s+[\w\.\_\?\=\+\-\*\:\;\,\'\"\>\<\/\[\]\|\s\(\)]+\bBEGIN\b/ig;
        
        var CREATE_PROCEDURE = /\b(CREATE\s+)?(\w*\s+)?PROCEDURE\b/ig;
        
        var CREATE_FUNCTION = /\b(CREATE\s+)?(\w*\s+)?FUNCTION\b/ig;

        var PATTERNS = [CREATE_STMT.source,
            DECLARE_VARIABLE.source,
            ARRAY_VARIABLE.source,
            SELECT_VARIABLE.source
        ];

        var Semantics = function(sPreContent, oMainContext) {
            if (!(this instanceof Semantics)) {
                return new Semantics(sPreContent);
            }
            this.sPreContent = sPreContent;
            this.oMainContext = oMainContext;
            this._aDeclaredVars = {};
        };

        Semantics.prototype = {

            getVariables: function() {
                this._aDeclaredVars = {};
                var aVariables = [];
                var aVariablesFromCreate = null;
                var sContent = this.sPreContent;
                if (!sContent) {
                    return [];
                }
                var sPattern = "(" + PATTERNS.join(")|(") + ")";
                var oReg = new RegExp(sPattern, "ig");

                // Get the next word, starting at the position of lastindex.
                var arr;
                var aParts = null;
                while ((arr = oReg.exec(sContent)) !== null) {
                    var sVal = arr[0];
                    var sProposal = "";
                    if (sVal) {
                        sVal = sVal.trim();

                        if (jQuery.sap.startsWithIgnoreCase(sVal, "DECLARE") ||
                            jQuery.sap.endsWithIgnoreCase(sVal, "ARRAY")) {

                            sProposal = this._parseDeclare(sVal);

                        } else if (jQuery.sap.endsWithIgnoreCase(sVal, "SELECT") ||
                            jQuery.sap.endsWithIgnoreCase(sVal, "UNNEST")) {

                            sProposal = this._parseTable(sVal);

                        } else if (jQuery.sap.startsWithIgnoreCase(sVal, "CREATE") ||
                            jQuery.sap.startsWithIgnoreCase(sVal, "PROCEDURE") ||
                            jQuery.sap.startsWithIgnoreCase(sVal, "FUNCTION")) {
                                
                            aVariablesFromCreate = this._parseCreate(sVal);
                        }

                        if (sProposal) {
                            if (this._checkVarDeclared(sProposal) === false) {
                                var oVariable = this._createVariable(sProposal);
                                aVariables.push(oVariable);
                                this._populateVarDeclared(sProposal);
                            }
                        }
                        if (aVariablesFromCreate && aVariablesFromCreate.length > 0) {
                            aVariables = aVariables.concat(aVariablesFromCreate);
                            aVariablesFromCreate = null;
                        }
                    }
                }
                delete this._aDeclaredVars;
                return aVariables;
            },

            _checkVarDeclared: function(sProposal) {
                if (this._aDeclaredVars) {
                    return this._aDeclaredVars[sProposal] === "TRUE";
                }
                return true;
            },

            _populateVarDeclared: function(sProposal) {
                if (this._aDeclaredVars) {
                    this._aDeclaredVars[sProposal] = "TRUE";
                }
            },

            _createVariable: function(sProposal) {
                var oVariable = {};
                oVariable.text = sProposal;
                oVariable.proposal = sProposal;
                oVariable.description = sProposal;
                oVariable.overwrite = true;
                oVariable.category = "sql.variable";
                oVariable.helpDescription = "";
                oVariable.helpTarget = "";
                return oVariable;
            },

            _parseDeclare: function(sVal) {
                var sProposal = "";
                var aParts = sVal.split(/\s+/);
                if (aParts.length >= 3) {
                    if (jQuery.sap.startsWithIgnoreCase(aParts[2], "ARRAY")) {
                        sProposal = aParts[0];
                    } else {
                        sProposal = aParts[1];
                    }
                }
                return sProposal;
            },

            _parseTable: function(sVal) {
                var sProposal = "";
                var aParts = sVal.split("=");
                if (aParts.length >= 2) {
                    // if (jQuery.sap.endsWithIgnoreCase(aParts[1].trim(), "SELECT")) {
                    sProposal = aParts[0].trim();
                    // }
                }
                return sProposal;
            },

            _parseCreate: function(sVal) {
                var aVariables = [];
                if (sVal.match(CREATE_PROCEDURE)) {
                    aVariables = this.parseProcedureCreate(sVal);
                } else if (sVal.match(CREATE_FUNCTION)) {
                    aVariables = this.parseFunctionCreate(sVal);
                }
                return aVariables;
            },

            //=====================================
            // Parse variable in CREATE PROCEDURE
            //=====================================
            parseProcedureCreate: function(sVal) {
                var aStmts = sVal.split(/\s*(?:\bAS|BEGIN\b)\s*/ig);
                var aVariables = [];
                var aVariablesInPre = null;
                var aVariablesInAs = null;

                if (aStmts && aStmts.length >= 2) {
                    var sPreStmt = aStmts[0].trim();
                    var sAsStmt = aStmts[1].trim();
                    if (sPreStmt) {
                        aVariablesInPre = this.parseProcedureInPreStmt(sPreStmt);
                        if (aVariablesInPre && aVariablesInPre.length > 0) {
                            aVariables = aVariables.concat(aVariablesInPre);
                        }
                    }
                    if (sAsStmt) {
                        aVariablesInAs = this.parseInAsStmt(sAsStmt);
                        if (aVariablesInAs && aVariablesInAs.length > 0) {
                            aVariables = aVariables.concat(aVariablesInAs);
                        }
                    }
                }
                return aVariables;
            },

            parseProcedureInPreStmt: function(sVal) {
                var aVariables = [];
                var sProposal = "";
                var aParts = null;
                var iIdxOpenBracket = sVal.indexOf("(");
                var iIdxCloseBracket = sVal.lastIndexOf(")");
                if (iIdxOpenBracket > -1 && iIdxCloseBracket > -1) {
                    sVal = sVal.substring(iIdxOpenBracket + 1, iIdxCloseBracket);
                    if (sVal) {
                        aParts = sVal.split(/\s*[\,]\s*/);
                        for (var i = 0; i < aParts.length; i++) {
                            var sPart = aParts[i].trim();
                            if (sPart) {
                                var aWords = sPart.split(/\s+/);
                                if (aWords.length > 0) {
                                    var sWord = aWords[0].trim();
                                    sProposal = sWord;
                                    if (["IN", "OUT", "INOUT"].indexOf(sWord.toUpperCase()) >= 0) {
                                        if (aWords.length >= 2) {
                                            sProposal = aWords[1].trim();
                                        }
                                    }
                                    if (this._checkVarDeclared(sProposal) === false) {
                                        var oVariable = this._createVariable(sProposal);
                                        aVariables.push(oVariable);
                                        this._populateVarDeclared(sProposal);
                                    }
                                }
                            }
                        }
                    }
                }
                return aVariables;
            },

            //=====================================
            // Parse variable in CREATE FUNCTION
            //=====================================
            parseFunctionCreate: function(sVal) {
                var aStmts = sVal.split(/\s*(?:\bRETURNS(?:\s+TABLE\s+)?|AS|BEGIN\b)\s*/ig);
                var aVariables = [];
                var aVariablesInPre = null;
                var aVariablesInPost = null;
                var aVariablesInAs = null;

                if (aStmts && aStmts.length >= 3) {
                    var sPreStmt = aStmts[0].trim();
                    var sPostStmt = aStmts[1].trim();
                    var sAsStmt = aStmts[2].trim();
                    if (sPreStmt) {
                        aVariablesInPre = this.parseFunctionPreStmt(sPreStmt);
                        if (aVariablesInPre && aVariablesInPre.length > 0) {
                            aVariables = aVariables.concat(aVariablesInPre);
                        }
                    }
                    if (sPostStmt) {
                        aVariablesInPost = this.parseFunctionPostStmt(sPostStmt);
                        if (aVariablesInPost && aVariablesInPost.length > 0) {
                            aVariables = aVariables.concat(aVariablesInPost);
                        }
                    }
                    if (sAsStmt) {
                        aVariablesInAs = this.parseInAsStmt(sAsStmt);
                        if (aVariablesInAs && aVariablesInAs.length > 0) {
                            aVariables = aVariables.concat(aVariablesInAs);
                        }
                    }
                }
                return aVariables;
            },

            parseFunctionPreStmt: function(sStmt) {
                var aVariables = [];
                var sProposal = "";
                var aParts = null;
                var iIdxOpenBracket = sStmt.indexOf("(");
                var iIdxCloseBracket = sStmt.lastIndexOf(")");
                if (iIdxOpenBracket > -1 && iIdxCloseBracket > -1) {
                    sStmt = sStmt.substring(iIdxOpenBracket + 1, iIdxCloseBracket);
                    if (sStmt) {
                        aParts = sStmt.split(/\s*[\,]\s*/);
                        for (var i = 0; i < aParts.length; i++) {
                            var sPart = aParts[i].trim();
                            if (sPart) {
                                var aWords = sPart.split(/\s+/);
                                if (aWords.length > 0) {
                                    var sWord = aWords[0].trim();
                                    sProposal = sWord;
                                    if (this._checkVarDeclared(sProposal) === false) {
                                        var oVariable = this._createVariable(sProposal);
                                        aVariables.push(oVariable);
                                        this._populateVarDeclared(sProposal);
                                    }
                                }
                            }
                        }
                    }
                }
                return aVariables;
            },

            parseFunctionPostStmt: function(sStmt) {
                var iIdxOpenBracket = sStmt.indexOf("(");
                var iIdxCloseBracket = sStmt.lastIndexOf(")");
                if (iIdxOpenBracket > -1 && iIdxCloseBracket > -1) {
                    sStmt = sStmt.substring(iIdxOpenBracket + 1, iIdxCloseBracket);
                }
                return this.parseVariable(sStmt);
            },

            parseInAsStmt: function(sStmt) {
                var aVariables = [];
                var sProposal = "";
                var aParts = null;
                aParts = sStmt.split(/\s*[\;]\s*/);
                for (var i = 0; i < aParts.length; i++) {
                    var sPart = aParts[i].trim();
                    if (sPart) {
                        var aWords = sPart.split(/\s+/);
                        if (aWords.length > 0) {
                            var sWord = aWords[0].trim();
                            sProposal = sWord;
                            if (this._checkVarDeclared(sProposal) === false) {
                                var oVariable = this._createVariable(sProposal);
                                aVariables.push(oVariable);
                                this._populateVarDeclared(sProposal);
                            }
                        }
                    }
                }
                return aVariables;
            },

            parseVariable: function(sStmt) {
                var aVariables = [];
                var sProposal = "";
                var aParts = null;
                aParts = sStmt.split(/\s*[\,]\s*/);
                for (var i = 0; i < aParts.length; i++) {
                    var sPart = aParts[i].trim();
                    if (sPart) {
                        var aWords = sPart.split(/\s+/);
                        if (aWords.length > 0) {
                            var sWord = aWords[0].trim();
                            sProposal = sWord;
                            if (this._checkVarDeclared(sProposal) === false) {
                                var oVariable = this._createVariable(sProposal);
                                aVariables.push(oVariable);
                                this._populateVarDeclared(sProposal);
                            }
                        }
                    }
                }
                return aVariables;
            }
        };

        return Semantics;
    });