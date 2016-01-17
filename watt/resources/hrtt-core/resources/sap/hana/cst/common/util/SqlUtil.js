/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(['./StringBuffer'],
    function(StringBuffer) {

        "use strict";

        var _repeatChar = function(char, times) {
            var str = "";
            for (var i = 0; i < times; i++) {
                str += char;
            }
            return str;
        };

        var _getBeginStmt = function(oBlock, source) {
            var sStmt = source.substring(oBlock.startBlk);
            var reg = /\S/g;
            if (reg.test(sStmt) === true) {
                oBlock.startBlk += reg.lastIndex - 1;
            } else {
                oBlock.startBlk = source.length;
            }
            return oBlock;
        };

        var _getPosStmt = function(oBlock, source) {
            var iStart = oBlock.startBlk + 1;
            var sPreText = source.substring(0, iStart);
            // var aLines = sPreText.split("\n");
            var reg = /(\r\n|\n|\r)/g;
            oBlock.row = 0;
            oBlock.col = 0;
            while ((reg.test(sPreText) === true) && (reg.lastIndex < (iStart))) {
                oBlock.row++;
                oBlock.col = iStart - reg.lastIndex;
            }
            if (oBlock.col > 0) {
                oBlock.col -= 1;
            }
            return oBlock;
        };

        var removeAllComments = function(source, type) {
            var specialBlkReg,
                lineCmtReg,
                blkCmtReg = /\/\*[\S|\s]*\*\//i,
                idx, sub = "",
                k;
            // TODO:
            type = "sql";

            if (type === "sql") {
                specialBlkReg = /\-\-.*\/\*[\S|\s]*\*\//i;
                lineCmtReg = /\-\-.*[^.]/i;
            } else if (type === "javascript") {
                specialBlkReg = /\/\/.*\/\*[\S|\s]*\*\//i;
                lineCmtReg = /\/\/.*[^.]/i;
            }

            while ((idx = source.search(specialBlkReg)) >= 0) {
                k = source.indexOf("/*", idx);
                source = source.substring(0, k) + "  " + source.substring(k + 2);
            }
            sub = source.replace(/./ig, " ");

            while ((idx = source.search(blkCmtReg)) >= 0) {
                k = source.indexOf("*/", idx);
                source = source.substring(0, idx) + sub.substring(idx, k + 2) + source.substring(k + 2);
            }
            while ((idx = source.search(lineCmtReg)) >= 0) {
                k = source.indexOf("\n", idx);
                if (k < 0) {
                    k = source.length;
                }
                source = source.substring(0, idx) + sub.substring(idx, k) + source.substring(k);
            }
            return source;
        };

        var emptyAllString = function(sContent) {
            var oTempSB = new StringBuffer();
            var oReg = /\'[^\']*\'/ig;
            var oMatch;
            var startIdx = 0;
            var endIdx = 0;
            while ((oMatch = oReg.exec(sContent)) !== null) {
                endIdx = oMatch.index;
                var sVal = oMatch[0];
                var sTemp = sContent.substring(startIdx, endIdx);
                oTempSB.append(sTemp);
                sTemp = _repeatChar(" ", sVal.length - 2);
                oTempSB.append("'" + sTemp + "'");
                startIdx = endIdx + sVal.length;
            }

            if (startIdx < sContent.length) {
                oTempSB.append(sContent.substring(startIdx, sContent.length));
            }
            var sTempSB = oTempSB.toString();
            if (sTempSB && sTempSB.length > 0) {
                return sTempSB;
            } else {
                return sContent;
            }
        };

        var detectSQLStatements = function(source) {
            var aStmts = [];
            var beginIdx;
            var endIdx = -1;
            var nxtSemiIdx = -1;
            var count = 0;
            var block;
            var markIdx = 0;
            var endOfStmt;
            var patternBegin = /\bbegin\b\s/ig;
            var patternEnd = /\bend\b/ig;
            var patternCreateStmt = /\bcreate\b\s+(\w*\s+)?(\bprocedure\b|\bfunction\b|\btrigger\b|\blibrary\b)/ig;
            var patternSpecialAlterStmt = /\balter\b\s+(\w*\s+)?(\bprocedure\b|\bfunction\b|\btrigger\b|\blibrary\b)/ig;
            var patternSpecialDoStmt = /\bdo\b\s+\bbegin\b/ig;
            var createStmtIdx = -1;
            var bInStmtBody = false;

            source = emptyAllString(removeAllComments(source, "sql"));

            while (markIdx >= 0 && markIdx < source.length) {
                if (count === 0) {
                    block = {};
                    block.startBlk = markIdx;
                    block = _getBeginStmt(block, source);
                }
                endOfStmt = source.indexOf(";", markIdx);

                if (!bInStmtBody) {
                    createStmtIdx = source.search(patternCreateStmt);
                    if (createStmtIdx >= 0 && createStmtIdx < endOfStmt) {
                        bInStmtBody = true;
                        markIdx = createStmtIdx + 6;
                        source = source.substring(0, markIdx).replace(/create/ig, _repeatChar(" ", 6)) + source.substring(markIdx);
                    } else {
                        createStmtIdx = source.search(patternSpecialAlterStmt);
                        if (createStmtIdx >= 0 && createStmtIdx < endOfStmt) {
                            bInStmtBody = true;
                            markIdx = createStmtIdx + 6;
                            source = source.substring(0, markIdx).replace(/alter/ig, _repeatChar(" ", 5)) + source.substring(markIdx);
                        } else {
                            createStmtIdx = source.search(patternSpecialDoStmt);
                            if (createStmtIdx >= 0 && createStmtIdx < endOfStmt) {
                                bInStmtBody = true;
                                markIdx = createStmtIdx + 2;
                                source = source.substring(0, markIdx).replace(/do/ig, _repeatChar(" ", 2)) + source.substring(markIdx);
                            }
                        }
                    }
                }

                if (bInStmtBody) {
                    beginIdx = source.search(patternBegin);
                    endIdx = source.search(patternEnd);
                    if (endIdx >= 0) {
                        nxtSemiIdx = source.substring(endIdx + 3).trim().indexOf(";");
                        while (nxtSemiIdx !== 0 && endIdx >= 0) {
                            var s = source.substring(endIdx + 3);
                            if (s.trim().length === 0) {
                                break;
                            }
                            source = source.substring(0, endIdx + 3).replace(/end/ig, _repeatChar(" ", 3)) + s;
                            endIdx = source.search(patternEnd);
                            nxtSemiIdx = source.substring(endIdx + 3).trim().indexOf(";");
                        }
                    }
                } else {
                    beginIdx = -1;
                    endIdx = -1;
                }

                if (beginIdx >= 0 || (endIdx >= 0 && count > 0)) {
                    if (beginIdx >= 0 && beginIdx < endIdx) {
                        count++;
                        markIdx = beginIdx + 5;
                        source = source.substring(0, markIdx).replace(/begin/ig, _repeatChar(" ", 5)) + source.substring(markIdx);
                    } else if (endIdx >= 0 && count > 0) {
                        count--;
                        markIdx = endIdx + 4;
                        if (source.substring(markIdx).trim().indexOf(";") === 0) { // case "END;"
                            markIdx = source.indexOf(";", markIdx) + 1;
                        }
                        source = source.substring(0, markIdx).replace(/end/ig, _repeatChar(" ", 3)) + source.substring(markIdx);
                    } else {
                        markIdx = source.indexOf(";", endOfStmt + 1);
                    }
                } else {
                    if (endOfStmt > 0) {
                        markIdx = endOfStmt + 1;
                    } else {
                        markIdx = source.length;
                    }
                }
                if (count === 0 || markIdx >= source.length) {
                    block.count = count;
                    if (markIdx > source.length) {
                        markIdx = source.length;
                    }
                    block.endBlk = markIdx;
                    if (block.startBlk < block.endBlk) {
                        aStmts.push(_getPosStmt(block, source));
                    }
                    bInStmtBody = false;
                }
            }
            return aStmts;
        };

        var prepareStatements = function(content) {
            var k, stmt, count;
            var aStatements = [];
            var oStatement;
            var idx = -1;
            var tempStmt;
            var contentTable = detectSQLStatements(content);

            for (k = 0; k < contentTable.length; k++) {
                stmt = content.substring(contentTable[k].startBlk, contentTable[k].endBlk);
                tempStmt = stmt.replace(/(\r\n|\n|\r)/, " ").trim();

                count = contentTable[k].count;
                if (count === 0 && tempStmt.length > 0) {
                    idx = stmt.lastIndexOf(";");
                    if (idx > 0 && stmt.substring(idx + 1).trim().length === 0) {
                        stmt = stmt.substring(0, idx);
                    }
                    // console.log("start: " + contentTable[k].startBlk + "/end: " + contentTable[k].endBlk + "/count: " + count + "\n" + stmt);
                    if (tempStmt.substring(0, 5).toUpperCase() === "CREATE") {
                        aStatements.push({
                            statement: encodeURI(stmt),
                            type: "UPDATE",
                            pos: {
                                row: contentTable[k].row,
                                col: contentTable[k].col
                            },
                            isStatementEncode: true
                        });
                    } else {
                        stmt = stmt.replace(/\/\*[^\*\/]*\*\//ig, "").replace(/\-\-.*$/g, "").trim();
                        if (stmt.length > 0) {
                            // SELECT
                            if (stmt.substring(0, 6).toUpperCase() === "SELECT") {
                                oStatement = {
                                    statement: encodeURI(stmt),
                                    type: "SELECT",
                                    isStatementEncode: true
                                };
                                // CALL
                            } else if (stmt.substring(0, 4).toUpperCase() === "CALL") {
                                oStatement = {
                                    statement: encodeURI(stmt),
                                    type: "CALL",
                                    isStatementEncode: true
                                };
                                // MDX and WITH d AS 
                            } else if (stmt.match(/^MDX\s+/ig) ||
                                stmt.match(/^WITH\s+.+\s+\bas\b/ig)) {
                                oStatement = {
                                    statement: encodeURI(stmt),
                                    type: "SELECT",
                                    isStatementEncode: true
                                };
                            } else {
                                oStatement = {
                                    statement: encodeURI(stmt),
                                    type: "UPDATE",
                                    isStatementEncode: true
                                };
                            }

                            oStatement.pos = {
                                row: contentTable[k].row,
                                col: contentTable[k].col
                            };
                            aStatements.push(oStatement);
                        }
                    }
                }
            }

            return aStatements;
        };

        var defineSelectStmType = function(sStm) {
            if (sStm.substring(0, 6).toUpperCase() === "SELECT") {
                return ({
                    statement: encodeURI(sStm),
                    type: "SELECT",
                    isStatementEncode: true
                });
                // CALL
            } else if (sStm.match(/^MDX\s+/ig)) {
                return ({
                    statement: encodeURI(sStm),
                    type: "SELECT",
                    option: "MDX",
                    isStatementEncode: true
                });

            } else if (sStm.match(/^WITH\s+.+\s+\bas\b/ig)) {
                return ({
                    statement: encodeURI(sStm),
                    type: "SELECT",
                    option: "WITH",
                    isStatementEncode: true
                });
            }
        };

        var parseSetStmt = function(sStmt) {
            var oParam = null;
            if (sStmt) {
                sStmt = sStmt.trim();
                if (sStmt.match(/\bset\b\s+\'{1}.+\'{1}\={1}\'{1}.+\'{1}/ig)) {
                    var aParts = sStmt.split(/(?:\'{1}\s*\=\s*\'{1})|(?:\s+\'{1})/ig);
                    if (aParts.length > 2) {
                        var sParamName = aParts[1];
                        var sParamValue = aParts[2].replace("'", "");
                        oParam = {
                            "name": sParamName,
                            "value": sParamValue
                        };
                    }
                }
            }
            return oParam;
        };

        //====================================
        // usually use for DDL statement
        //====================================
        var escapeSingleQuotes = function(value) {
            if (typeof value === "string") {
                return value.replace(/\'/g, "''");
            }
            return value;
        };

        var escapeDoubleQuotes = function(value) {
            if (typeof value === "string") {
                return value.replace(/\"/g, "\"\"");
            }
            return value;
        };

        var escapeQuotes = function(param) {
            return param.replace(/"/g, "\x22\x22");
        };

        var sanitize = function(param) {
            if (!param) {
                return param;
            }
            return param.replace(/</g, "\x3C").replace(/>/g, "\x3E")
                .replace(/'/g, "\x27").replace(/&/g, "\x26")
                .replace(/-{2,}/g, "").replace(/[*/]+/g, "");
        };

        return {
            removeAllComments: removeAllComments,
            emptyAllString: emptyAllString,
            detectSQLStatements: detectSQLStatements,
            prepareStatements: prepareStatements,
            escapeQuotes: escapeQuotes,
            escapeDoubleQuotes: escapeDoubleQuotes,
            escapeSingleQuotes: escapeSingleQuotes,
            sanitize: sanitize,
            defineSelectStmType: defineSelectStmType,
            parseSetStmt: parseSetStmt
        };
    });