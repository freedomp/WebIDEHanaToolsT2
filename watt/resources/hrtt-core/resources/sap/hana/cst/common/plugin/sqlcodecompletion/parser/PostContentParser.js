/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["./Parser", 
        "./Scenario"],

    function(Parser, Scenario) {

        "use strict";
        
        var POST_LETTER_PATTER = /\s*[\w\.\_\(\)\?\=\+\-\*\:\;\,\'\"\>\<\/\[\]\|]+/gi;
        
        var SPECIAL_CHAR_DELIMETER = /\b:=\b|[\.\_\(\)\?\=\+\-\*\:\;\,\'\"\>\<\/\[\]\|]/ig;

        var PostContentParser = function(oContentStatus, oMainContext) {
            if (!(this instanceof PostContentParser)) {
                return new PostContentParser(oContentStatus, oMainContext);
            }
            this.oContentStatus = oContentStatus;
            this.oMainContext = oMainContext;
        };

        PostContentParser.prototype = Object.create(Parser.prototype);
        PostContentParser.prototype.constructor = Parser;

        PostContentParser.prototype = jQuery.extend(PostContentParser.prototype, {

            parse: function() {
                var oContext = this._parsePostContent();
                return oContext;
            },

            //===================================
            // Parse POSTFIX content and identify the POSTFIX context
            //===================================
            _parsePostContent: function() {
                var oContextInPost = {};
                var sPostContent = "";
                sPostContent = this.oContentStatus.buffer.substring(this.oContentStatus.offset, this.oContentStatus.length);
                sPostContent = sPostContent.replace(/[\n]+/g, " ");
                // .replace(/\(/ig, " ( ")
                // .replace(/\)/ig, " ) ")
                // .replace(/\,/ig, " , ");
                // .replace(/[\s]+/g, " ");

                var sSubStmt = "";
                oContextInPost.name = "none";
                oContextInPost.description = "none";
                oContextInPost.pattern = "none";
                oContextInPost.subStatement = "";

                var aStmts = sPostContent.split(/[\;]/ig);
                var sPostStatment = aStmts[0];

                var aWords = [];
                var sWord = "";
                var arr;
                // var aDatas = [];
                var bMatchScenario = false;

                while ((arr = POST_LETTER_PATTER.exec(sPostStatment)) !== null) {
                    sWord = arr[0];

                    if (!bMatchScenario) {
                        var sKey = sWord.trim().toLowerCase();
                        // seperate the := assignment operator
                        sKey = sKey.split(SPECIAL_CHAR_DELIMETER)[0].trim();
                        if (Scenario.SCENARIO_IN_POST[sKey]) {
                            var oScenario = Scenario.SCENARIO_IN_POST[sKey];
                            // sWord = sWord.trimRight();
                            sWord = this.trimRight(sWord);
                            var oContext = this._getContextFromScenario(oScenario, sWord);
                            if (oContext) {
                                jQuery.extend(oContextInPost, oContext);
                                bMatchScenario = true;
                            }
                        }
                    }

                    if (bMatchScenario) {
                        aWords.push(sWord);
                        sSubStmt = sSubStmt + sWord;
                    }
                }

                oContextInPost.subStatement = sSubStmt;
                oContextInPost.content = sPostContent;
                oContextInPost.statement = sPostStatment;
                oContextInPost.words = aWords;

                return oContextInPost;
            }
        });

        return PostContentParser;
    });