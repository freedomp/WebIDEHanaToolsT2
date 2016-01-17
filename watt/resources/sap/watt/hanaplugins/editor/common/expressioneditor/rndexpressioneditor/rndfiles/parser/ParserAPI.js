/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
    ["commonddl/commonddlNonUi",
        "rndrt/rnd",
        "./sqlgrammar/ExprParserResolver",
        "./hanagrammar/HanaExpressionParserResolver",
        "../lib/DdlScanner"
    ], //dependencies
    function(commonddl, rnd, ExprParserResolver, HanaExprParserResolver, DDLScanner) {
        var DdlScanner = DDLScanner;
        var ByteCodeFactory = rnd.ByteCodeFactory;
        var SapDdlConstants = commonddl.SapDdlConstants;

        function DdlParseSourceHaltedCallback() {}
        DdlParseSourceHaltedCallback.prototype.run = function() {};

        function ParserAPI(identifiers, functions, operators, language) {
            this.scannerDoesStrictSeparationOfTokensAtPlusMinus = true;
            this.scannerDoesStrictSeparationOfTokensAtSlash = true;
            this.scannerCreatesDotDotTokens = true;
            this.scannerCreatesEnumIdTokens = true;
            this.scannerCreatesColonFollowedByIdTokens = true;
            this.scannerCreatesPipePipeTokens = true;
            if (identifiers === undefined || identifiers === null) {
                this.identifiers = [];
            } else {
                this.identifiers = identifiers;
            }
            if (functions === undefined || functions === null) {
                this.functions = [];
            } else {
                this.functions = functions;
            }

            if (operators === undefined || operators === null) {
                this.operators = [];
            } else {
                this.operators = operators;
            }

            if (language === undefined || language === null || language === "COLUMN_ENGINE") {
                this.language = "TREX";
            } else {
                this.language = language;
            }
        }

        ParserAPI.prototype.tokenize = function(resolver, source) {
            var localByteCode = this.byteCode;
            if (localByteCode == null) {
                localByteCode = this.getByteCode();
            }
            var scanner = DdlScanner.DdlScanner6(localByteCode, this.scannerDoesStrictSeparationOfTokensAtPlusMinus, this.scannerDoesStrictSeparationOfTokensAtSlash, this.scannerCreatesDotDotTokens, this.scannerCreatesEnumIdTokens, this.scannerCreatesColonFollowedByIdTokens, this.scannerCreatesPipePipeTokens);
            scanner.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null));
            this.byteCode = localByteCode;
            return scanner.getInput();
        };

        ParserAPI.prototype.parse = function(source) {
            var localByteCode = this.byteCode;
            if (localByteCode == null) {
                localByteCode = this.getByteCode();
            }
            var scanner = DdlScanner.DdlScanner6(localByteCode, this.scannerDoesStrictSeparationOfTokensAtPlusMinus, this.scannerDoesStrictSeparationOfTokensAtSlash, this.scannerCreatesDotDotTokens, this.scannerCreatesEnumIdTokens, this.scannerCreatesColonFollowedByIdTokens, this.scannerCreatesPipePipeTokens);

            var parser = null;
            if (this.language === "TREX") {
                parser = new HanaExprParserResolver(localByteCode, scanner, this.identifiers, this.functions, this.operators);
            } else if (this.language === "SQL") {
                parser = new ExprParserResolver(localByteCode, scanner, this.identifiers, this.functions, this.operators);
            }
            
            parser.TRACING_ENABLED = true;
            parser.m_resync = true;
            parser.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null), null);
            parser.run(rnd.CompletionModes.COMPL_MODE_NONE.getValue(), new DdlParseSourceHaltedCallback(), 100 * 1000);
            this.byteCode = localByteCode;
            return parser.m_scanner.getInput();
        };

        ParserAPI.prototype.getCompletions = function(source, line, column) {
            var localByteCode = this.byteCode;
            try {
                if (localByteCode == null) {
                    localByteCode = this.getByteCode();
                    this.byteCode = localByteCode;
                }
                var scanner = DdlScanner.DdlScanner6(localByteCode, this.scannerDoesStrictSeparationOfTokensAtPlusMinus, this.scannerDoesStrictSeparationOfTokensAtSlash, this.scannerCreatesDotDotTokens, this.scannerCreatesEnumIdTokens, this.scannerCreatesColonFollowedByIdTokens, this.scannerCreatesPipePipeTokens);
                
                var m_resolver = null;
                if (this.language === "TREX") {
                    m_resolver = new HanaExprParserResolver(localByteCode, scanner, this.identifiers, this.functions, this.operators);
                } else if (this.language === "SQL") {
                    m_resolver = new ExprParserResolver(localByteCode, scanner, this.identifiers, this.functions, this.operators);
                }
                
                var cocoTriggerPos = new rnd.CursorPos(line, column, null);
                m_resolver.setInput(source, new rnd.CursorPos(1, 1, null), cocoTriggerPos, "");
                m_resolver.run(rnd.CompletionModes.COMPL_MODE_UNIQUE.getValue(), new DdlParseSourceHaltedCallback(), 100 * 1000);

                var completionNames = this.getKeywordCompletions(m_resolver);

                if (m_resolver.mySemanticCompletions !== undefined) {
                    for (var i = 0; i < m_resolver.mySemanticCompletions.length; i++) {
                        completionNames.push(m_resolver.mySemanticCompletions[i]);
                    }
                }
                return completionNames;
            } catch (e) {
                console.log(e.stack);
            } finally {
                this.byteCode = localByteCode;
            }
        };

        ParserAPI.prototype.getKeywordCompletions = function(resolver) {
            var result = [];
            var completionPaths = resolver.getCompletionPaths();
            for (var completionCount = 0; completionCount < completionPaths.length; completionCount++) {
                var completion = completionPaths[completionCount];
                var np = "";
                var tokens = [];
                if (completion.getCompletion() != null) {
                    tokens = (completion.getCompletion()).m_next_tokens;
                }
                for (var tCount = 0; tCount < tokens.length; tCount++) {
                    var t = tokens[tCount];
                    var info = resolver.getByteCodeTokenInfo();
                    var name = info.getTokenNameUS(t);
                    if (name != null && (SapDdlConstants.ID === name || SapDdlConstants.ENUM_ID === name || SapDdlConstants.COLON_FOLLOWED_BY_ID === name || SapDdlConstants.INT_CONST === name || SapDdlConstants.LONG_INT_CONST === name || SapDdlConstants.DEC_CONST === name || SapDdlConstants.REAL_CONST === name || SapDdlConstants.DATE_CONST === name || SapDdlConstants.TIME_CONST === name || SapDdlConstants.TIMESTAMP_CONST === name || SapDdlConstants.STRING_CONST === name || SapDdlConstants.BINARY_CONST === name)) {
                        break;
                    } else if ("#" === name) {
                        continue;
                    } else if ("(" === name) {
                        np += name;
                    } else {
                        np += " " + name;
                    }
                }
                np = rnd.Utils.stringTrim(np);
                if (SapDdlConstants.PIPE_PIPE === np) {
                    np = "||";
                }
                if ("$extension . *" === np) {
                    np = "$extension.*";
                }
                if ("$parameters ." === np || "$parameters" === np) {
                    np = "$parameters.";
                }
                if (np.length == 0) {
                    continue;
                }
                if (rnd.Utils.arrayContains(result, np) == false) {
                    result.push(np);
                }
            }
            return result;
        };

        ParserAPI.prototype.getByteCode = function() {
            var stream = this.getPadFileContent();
            var byteCode = null;
            try {
                byteCode = ByteCodeFactory.readByteCode(stream, "expr_v0", true);
            } catch (e) {
                console.log(e);
            }
            return byteCode;
        };
		ParserAPI.prototype.getPadFileContent=function (path) {
            if (rnd.Utils.stringEndsWith(path,".pad") === false || path.indexOf("?") >= 0 || path.indexOf("#") >= 0 ||
                path.indexOf("\n") > 0 || path.indexOf("&") >= 0){
                return null; // not a valid .pad file path
            }
            // limit XHR call to pad files
            var http = null;
            if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                http = new XMLHttpRequest();
            }
            http.open("GET", path, false);
            http.send(null);
            return http.responseText;
        };


        ParserAPI.prototype.getPadFileContent = function() {
            var path = null;
            if(this.language === "TREX"){
                path = "/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/parser/hanagrammar/HanaExprParser.pad";
            }else if(this.language === "SQL"){
                path = "/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/parser/sqlgrammar/SQLExprParser.pad";
            }
            
            var result = getPadFileContent(path);
            return result;
        };

        return ParserAPI;
    }
);
