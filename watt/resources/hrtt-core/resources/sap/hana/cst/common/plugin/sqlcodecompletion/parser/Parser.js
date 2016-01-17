/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {

        "use strict";

        var Parser = function() {
            if (!(this instanceof Parser)) {
                return new Parser();
            }
        };

        Parser.prototype = {
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

            trim: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/^\s+|\s+$/g, "");
            },
            
            // IE does not have trimLeft and trimRight
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
        };

        return Parser;
    });