/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["./Parser", 
    "./Scenario"],

    function(Parser, Scenario) {

        "use strict";

        var PRE_LETTER_PATTER = /[\w\.\_\(\)\?\=\+\-\*\:\;\,\'\"\>\<\/\[\]\|]+\s*/gi;

        var PreContentParser = function(oContentStatus, oMainContext) {
            if (!(this instanceof PreContentParser)) {
                return new PreContentParser(oContentStatus, oMainContext);
            }
            this.oContentStatus = oContentStatus;
            this.oMainContext = oMainContext;
        };

        PreContentParser.prototype = Object.create(Parser.prototype);
        PreContentParser.prototype.constructor = Parser;

        PreContentParser.prototype = jQuery.extend(PreContentParser.prototype, {

            parse: function() {
                var oContext = this._parsePreContent();
                return oContext;
            },

            //===================================
            // Parse PREFIX content
            //===================================
            _parsePreContent: function() {
                var that = this;
                var oContextInPre = {};
                var sPreContent = "";
                sPreContent = this.oContentStatus.buffer.substring(0, this.oContentStatus.offset);
                sPreContent = sPreContent.replace(/[\n]+/g, " ");
                // .replace(/\(/ig, " ( ")
                // .replace(/\)/ig, " ) ")
                // .replace(/\,/ig, " , ")
                // .replace(/[\s]+/g, " ");
                
                var sPreStatment = "";
                // check if ignore semicomma
                if (that._inContextIgnoreSemiComma(sPreContent)) {
                    sPreStatment = sPreContent;
                } else {
                    var aFragments = sPreContent.split(/[\;]/ig);
                    sPreStatment = aFragments[aFragments.length - 1];
                }
                // var sPreStatment = aFragments[aFragments.length - 1];
                
                var aWords = [];
                var arr;

                var sSubStmt = "";
                oContextInPre.fromStatement = "";
                var bContainFromStmt = false;
                while ((arr = PRE_LETTER_PATTER.exec(sPreStatment)) !== null) {
                    var sWord = arr[0];
                    if (sWord.trim().toLowerCase() === "from") {
                        bContainFromStmt = true;
                    }
                    if (bContainFromStmt) {
                        sSubStmt = sSubStmt + sWord;
                        oContextInPre.fromStatement = sSubStmt;
                    }
                    aWords.push(sWord);
                }
                var sFromStatement = oContextInPre.fromStatement.trim();
                if (sFromStatement.toLowerCase() === "from") {
                    oContextInPre.fromStatement = "";
                }
                oContextInPre.content = sPreContent;
                oContextInPre.statement = sPreStatment;
                oContextInPre.words = aWords;
                jQuery.extend(oContextInPre, this._identifyContextInPre(oContextInPre.words, oContextInPre));

                return oContextInPre;
            },
            
            // skip semi comma
            _inContextIgnoreSemiComma: function(sFragment) {
                if (sFragment) {
                    /*
                    PROCEDURE "schema"."procedure"()
                       LANGUAGE SQLSCRIPT
                       SQL SECURITY INVOKER
                       READS SQL DATA AS
                        z NVARCHAR := 3;
                        y VARCHAR
                        ...
                    */
                    if (sFragment.match(/(\bcreate\s+)?(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*\bbegin\b\s+[\w|\W]*/ig)) {
                        return false;
                    } 
                    /*
                    PROCEDURE "schema"."procedure"()
                       LANGUAGE SQLSCRIPT
                       SQL SECURITY INVOKER
                       READS SQL DATA AS
                        z NVARCHAR := 3;
                        y VARCHAR
                    BEGIN
                        ...
                    */
                    if (sFragment.match(/(\bcreate\s+)?(\w*\s+)?procedure\b\s+[\w|\W]+\s*\(\s*[\w|\W]*\)[\w|\W]*\s+(\bdefault schema\b\s+)?[\w|\W]*\s+\bas\b\s+[\w|\W]*$/ig)) {
                        return true;
                    }
                }
                return false;
            },

            //===================================
            // Identify the PREFIX context
            //===================================
            _identifyContextInPre: function(aWords) {
                var sSubStmt = "";
                var oContextInPre = {
                    name: "none",
                    description: "none",
                    pattern: null,
                    subStatement: ""
                };
                var i = -1;
                var iStart = aWords.length - 1;
                // var sPreviousWord = "";
                for (i = iStart; i > -1; i--) {
                    var sWord = aWords[i];
                    var sKey = this._processWordInPre(sWord);
                    sSubStmt = sWord + sSubStmt;
                    // if (sKey === "from") {
                    //     oContextInPre.fromStatement = sSubStmt;
                    // }

                    if (Scenario.SCENARIO_IN_PRE[sKey]) {
                        var oScenario = Scenario.SCENARIO_IN_PRE[sKey];

                        // sSubStmt = sSubStmt.trimLeft();
                        sSubStmt = this.trimLeft(sSubStmt);
                        var oContext = this._getContextFromScenario(oScenario, sSubStmt);
                        if (oContext) {
                            jQuery.extend(oContextInPre, oContext);
                            break;
                        }
                    }
                }

                return oContextInPre;
            },

            _processWordInPre: function(sWord) {
                var regStartChar = /^[\(]/;
                sWord = sWord.trim().toLowerCase();
                if (sWord.match(regStartChar)) {
                    return sWord.substring(1);
                }
                return sWord;
            }

        });

        return PreContentParser;
    });