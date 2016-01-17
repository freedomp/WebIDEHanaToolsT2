// Tokenizer
ace.define( 'ace/mode/xsodata/Tokenizer',
        [   ], //dependencies
        function () {
        //this.context.service.log.debug("mode", "Tokenizer loadeding started");
        var XSODataConstants = require("sap.watt.hana.editor.xsodata/constants/XSODataConstants");

            function XSODataAceTokenizer(parserService) {
                this.parserControllerService = parserService;
            }
            
            XSODataAceTokenizer.prototype.addChangeListener = function (editor) {
                this.aceEditor = editor;
                // this.addMacContentAssistSupport();
               var me = this;
               editor.getSession().on('change', function () {
                // clear line caches when source is modified
                     me.tokensByLine = {};
                  });
            };

            // Ace callback method
            XSODataAceTokenizer.prototype.getLineTokens = function (line, state, row) {
                var lineTokens = [];
                var aceTokens;
                var currentState = state || "INITIAL";
                
                var onTokenizeLine = function (tokProxy) {
                    var tokens = tokProxy.executeTokenizeLine(XSODataConstants.CONFIG,line, currentState, row);
                    for (var t in tokens) {
                        lineTokens.push(t);
                    }
                };
                
                
                // TODO: Add the following method to Controller API 
//                aceTokens = this.parserControllerService.executeTokenizeLine(XSODataConstants.CONFIG,line, currentState, row).then( onTokenizeLine );
                aceTokens = this.parserControllerService.$().then( onTokenizeLine );
//                   lineTokens =  this.parserControllerService.executeTokenizeLine(XSODataConstants.CONFIG,line, currentState, row).then( 
//                               function(aceTokens) {
//                                   console.log("ExecuteTokenizer callback for line "+row+" tokens "+aceTokens);
//                                   if ( aceTokens !== undefined ) {
//                                        console.log("Line tokens len ="+aceTokens.length);
//                                   }  else {
//                                        console.log("Line tokens is undefined");
//                                   }
//                                   return aceTokens;  
//                               }
//                    ); // -> ret {tokens,state}
                return lineTokens;

            };

            XSODataAceTokenizer.prototype.setDocument = function (sourceDoc) {
                this.sourceDocument = sourceDoc;
            };
            
            //this.context.service.log.debug("mode", "Tokenizer loaded");
            return XSODataAceTokenizer;
        }
    );

// Tokenizer
ace.define( 'ace/mode/xsodata/RndTokenizer',
        [   ], //dependencies
        function () {
        //this.context.service.log.debug("mode", "Rnd Tokenizer loading started");
        var XSODataConstants = require("sap.watt.hana.editor.xsodata/constants/XSODataConstants");

            function XSODataRndTokenizer(parserService) {
                this.parserControllerService = parserService;
            }
            
            XSODataRndTokenizer.prototype.addChangeListener = function (editor) {
                this.aceEditor = editor;
                // this.addMacContentAssistSupport();
               var me = this;
               editor.getSession().on('change', function () {
                // clear line caches when source is modified
                     me.tokensByLine = {};
                  });
            };

            var TOKEN_COMMENT = "comment";
            var TOKEN_STRING = "string";
            var TOKEN_TEXT = "text";

            // Ace callback method
            XSODataRndTokenizer.prototype.getLineTokens = function (line, state, row) {
                //var lineTokens = [];
                var rowNum = row + 1;
                var aceTokens = [];
                var currentState = state || "INITIAL";
                
                var bgTokenizer = this.aceEditor.getSession().bgTokenizer;
                var lastEndTokenOffset = 0;
                
                if ( bgTokenizer.hasOwnProperty('parseResult') && bgTokenizer.parseResult !== null ) {
                    for ( var t = 0; t < bgTokenizer.parseResult.length; t++) {
                        var rndTok = bgTokenizer.parseResult[t];
                        
                        if ( rndTok.m_num === 2 && currentState !== 'COMMENT') {
                            break;
                        }

                        if ( rndTok.m_line < rowNum ) {
                            continue;
                        }
                        if ( rndTok.m_line > rowNum && currentState !== 'COMMENT') {
                            break;
                        }
                        
                        // Multiline comment
                        if ( currentState === 'COMMENT' ) {
                            var comment =  bgTokenizer.parseResult[t-1];
                            var commentLines = comment.m_lexem.split(/\n/g); //('\n');
                            var aceLexem = commentLines[rowNum - comment.m_line].trimRight('\r');
                            var commentToken = { value : aceLexem, type : TOKEN_COMMENT };
                            aceTokens.push(commentToken);
                            
                            if ( rowNum >= comment.m_line + commentLines.length - 1) {
                                currentState = 'INITIAL';
                            }
                            break;
                        }
                        
                        // Build aceTokens
                        var aceToken = {};
                        var lexemLines = rndTok.m_lexem.split(/\n/g); //('\n');
                        aceToken.value = line.substring(lastEndTokenOffset, rndTok.m_column-1) + lexemLines[0].trimRight('\r');
                        if (rndTok.m_err_state.m_value !== 0 ) {
                            aceToken.type = TOKEN_COMMENT;
                        } else if (rndTok.m_category.value === 8 || rndTok.m_category.value === 7) {
                            aceToken.type = TOKEN_STRING;
                        } else if (rndTok.m_category.value === 6) {
                            aceToken.type = TOKEN_STRING;
                        } else if (rndTok.m_category.value === 5) {
                            aceToken.type = TOKEN_COMMENT;
                        } else {
                            aceToken.type = TOKEN_TEXT;
                        }
                        aceTokens.push(aceToken);
                        lastEndTokenOffset = rndTok.m_column - 1 + lexemLines[0].length; //.length;
                        
                        if (rndTok.m_num === 4 && lexemLines.length > 1 ) {
                            currentState = 'COMMENT' ;
                            break;
                        } else {
                            currentState ='INITIAL';
                        }
                        
                    }
                    
                }
                
                if ( aceTokens.length === 0) {
                // Return whole line a ace Token    
                    var lineToken = { value : line, type : TOKEN_TEXT };
                    aceTokens.push(lineToken);
                }
                
                // TODO: Add the following method to Controller API 
//                aceTokens = this.parserControllerService.executeTokenizeLine(XSODataConstants.CONFIG,line, currentState, row).then( onTokenizeLine );
//                aceTokens = this.parserControllerService.$().then( onTokenizeLine );
//                   lineTokens =  this.parserControllerService.executeTokenizeLine(XSODataConstants.CONFIG,line, currentState, row).then( 
//                               function(aceTokens) {
//                                   console.log("ExecuteTokenizer callback for line "+row+" tokens "+aceTokens);
//                                   if ( aceTokens !== undefined ) {
//                                        console.log("Line tokens len ="+aceTokens.length);
//                                   }  else {
//                                        console.log("Line tokens is undefined");
//                                   }
//                                   return aceTokens;  
//                               }
//                    ); // -> ret {tokens,state}
                return { tokens : aceTokens, state : currentState };


            };

            XSODataRndTokenizer.prototype.setDocument = function (sourceDoc) {
                this.sourceDocument = sourceDoc;
            };
            
            //this.context.service.log.debug("mode", "Rnd Tokenizer loaded");
            "Rnd Tokenizer loading started";
            return XSODataRndTokenizer;
        }
    );

// Mode xsodata
ace.define(
    'ace/mode/xsodata',
    [
        'require', 'exports', 'module',
        'ace/rndImport', 'ace/lib/net','ace/lib/oop','ace/mode/text','ace/tokenizer', 'ace/mode/javascript_highlight_rules', 'ace/mode/matching_brace_outdent', 'ace/range',
        'ace/worker/worker_client', 'ace/mode/behaviour/cstyle', 'ace/mode/folding/cstyle'
    ],
    function (aceRequire, exports, module) {
        //this.context.service.log.debug("mode", "XSOdata mode loading started");
        var oop = aceRequire("../lib/oop");
        var TextMode = aceRequire("./text").Mode;
//        var TokenizerBase = aceRequire("../tokenizer").Tokenizer;
        var MatchingBraceOutdent = aceRequire("./matching_brace_outdent").MatchingBraceOutdent;
        var Range                = aceRequire("../range").Range;
        var WorkerClient         = aceRequire("../worker/worker_client").WorkerClient;
        var CstyleBehaviour      = aceRequire("./behaviour/cstyle").CstyleBehaviour;
        var CStyleFoldMode       = aceRequire("./folding/cstyle").FoldMode;
        
        var XSODataConstants = require("sap.watt.hana.editor.xsodata/constants/XSODataConstants");
        
     // following lines work also in the WATT web IDE
        var aceContent = document.getElementsByClassName('ace_content');
        var par = aceContent[0].parentElement.parentElement;
        var editor = ace.edit(par);
        // ace.config.loadModule('ace/ext/language_tools', function () {
        //     editor.setOptions({
        //         enableBasicAutocompletion: true
        //     });
        // });
        var sourceDoc = editor.session.doc;        
        function DdlRules() {
        }
        DdlRules.prototype.getRules = function () {
            return {};
        };
        var aceTokenizer     = aceRequire("ace/mode/xsodata/Tokenizer");
        var rndTokenizer     = aceRequire("ace/mode/xsodata/RndTokenizer");
//        var SqlScriptParserApi  = require('sap.hana.ide.editor.hdbprocedure/service/SqlScriptRndParserApi');
        
//???        var parserControllerService = this.context.service.parsercontroller;
        
//        var parserApi       = new SqlScriptParserApi();
        var rndTok          = null;
        
        function createRndTok(AceTokenizer) {
            rndTok = new AceTokenizer(document.xsodataEditorContext.service.parsercontroller);
            rndTok.addChangeListener(editor);
            rndTok.setDocument(sourceDoc);
            //rndTok.addNavigationHandler(Range);
            //re-render all lines
            var rend = editor.renderer;
            var sess = editor.getSession();
            var lines = sess.bgTokenizer.lines.length;
            //console.log("re-render " + lines);
            for (var i = 0; i < lines; i++) {
                delete sess.bgTokenizer.lines[i];
            }
            rend.updateLines(1, lines);
        }
        
        createRndTok(rndTokenizer);
        
        var Mode = function () {
            this.$highlightRules = DdlRules;
            this.$outdent     = new MatchingBraceOutdent();
            this.$behaviour   = new CstyleBehaviour();
            this.foldingRules = new CStyleFoldMode();
        };
        oop.inherits(Mode, TextMode);
        (function () {
            this.lineCommentStart = "//";
            this.blockComment = {
                start: "/*",
                end: "*/"
            };
            //this.context.service.log.debug("mode", "Rnd Tokenizer defined" + rndToken);
            this.getTokenizer = function () {
                return {
                    getLineTokens: function (line, state, row) {
                        var res=null;
                        if (rndTok!==null) {
                            res = rndTok.getLineTokens(line, state, row);
                        }
                        return res;
                    }
                };
            };
            this.getNextLineIndent = function (state, line, tab) {
                var indent = this.$getIndent(line);
                return indent;
            };
            this.checkOutdent = function (state, line, input) {
                return this.$outdent.checkOutdent(line, input);
            };
            this.autoOutdent = function (state, doc, row) {
                this.$outdent.autoOutdent(doc, row);
            };
            this.createWorker = function (session) {
            };
        }).call(Mode.prototype);
        
        //this.context.service.log.debug("mode", "XSOData mode loaded");
        exports.Mode = Mode;
    });
ace.define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module', 'ace/range'], function (require, exports, module) {
    var Range = require("../range").Range;
    var MatchingBraceOutdent = function () {
    };
    (function () {
        this.checkOutdent = function (line, input) {
            if (!/^\s+$/.test(line)) {
                return false;
            }
            return /^\s*\}/.test(input);
        };
        this.autoOutdent = function (doc, row) {
            var line = doc.getLine(row);
            var match = line.match(/^(\s*\})/);
            if (!match) {
                return 0;
            }
            var column = match[1].length;
            var openBracePos = doc.findMatchingBracket({
                row: row,
                column: column
            });
            if (!openBracePos || openBracePos.row == row) {
                return 0;
            }
            var indent = this.$getIndent(doc.getLine(openBracePos.row));
            doc.replace(new Range(row, 0, row, column - 1), indent);
        };
        this.$getIndent = function (line) {
            return line.match(/^\s*/)[0];
        };
    }).call(MatchingBraceOutdent.prototype);
    exports.MatchingBraceOutdent = MatchingBraceOutdent;
});
ace.define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function (require, exports, module) {
    var oop = require("../../lib/oop");
    var Behaviour = require("../behaviour").Behaviour;
    var TokenIterator = require("../../token_iterator").TokenIterator;
    var lang = require("../../lib/lang");
    var SAFE_INSERT_IN_TOKENS = ["text", "paren.rparen", "punctuation.operator"];
    var SAFE_INSERT_BEFORE_TOKENS = ["text", "paren.rparen", "punctuation.operator", "comment"];
    var autoInsertedBrackets = 0;
    var autoInsertedRow = -1;
    var autoInsertedLineEnd = "";
    var maybeInsertedBrackets = 0;
    var maybeInsertedRow = -1;
    var maybeInsertedLineStart = "";
    var maybeInsertedLineEnd = "";
    var CstyleBehaviour = function () {
        CstyleBehaviour.isSaneInsertion = function (editor, session) {
            var cursor = editor.getCursorPosition();
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
                var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
                if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
                    return false;
                }
            }
            iterator.stepForward();
            return iterator.getCurrentTokenRow() !== cursor.row || this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
        };
        CstyleBehaviour.$matchTokenType = function (token, types) {
            return types.indexOf(token.type || token) > -1;
        };
        CstyleBehaviour.recordAutoInsert = function (editor, session, bracket) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (!this.isAutoInsertedClosing(cursor, line, autoInsertedLineEnd[0])) {
                autoInsertedBrackets = 0;
            }
            autoInsertedRow = cursor.row;
            autoInsertedLineEnd = bracket + line.substr(cursor.column);
            autoInsertedBrackets++;
        };
        CstyleBehaviour.recordMaybeInsert = function (editor, session, bracket) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (!this.isMaybeInsertedClosing(cursor, line)) {
                maybeInsertedBrackets = 0;
            }
            maybeInsertedRow = cursor.row;
            maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
            maybeInsertedLineEnd = line.substr(cursor.column);
            maybeInsertedBrackets++;
        };
        CstyleBehaviour.isAutoInsertedClosing = function (cursor, line, bracket) {
            return autoInsertedBrackets > 0 && cursor.row === autoInsertedRow && bracket === autoInsertedLineEnd[0] && line.substr(cursor.column) === autoInsertedLineEnd;
        };
        CstyleBehaviour.isMaybeInsertedClosing = function (cursor, line) {
            return maybeInsertedBrackets > 0 && cursor.row === maybeInsertedRow && line.substr(cursor.column) === maybeInsertedLineEnd && line.substr(0, cursor.column) == maybeInsertedLineStart;
        };
        CstyleBehaviour.popAutoInsertedClosing = function () {
            autoInsertedLineEnd = autoInsertedLineEnd.substr(1);
            autoInsertedBrackets--;
        };
        CstyleBehaviour.clearMaybeInsertedClosing = function () {
            maybeInsertedBrackets = 0;
            maybeInsertedRow = -1;
        };
        this.add("braces", "insertion", function (state, action, editor, session, text) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (text == '{') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "{" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '{' + selected + '}',
                        selection: false
                    };
                }
                else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    if (/[\]\}\)]/.test(line[cursor.column])) {
                        CstyleBehaviour.recordAutoInsert(editor, session, "}");
                        return {
                            text: '{}',
                            selection: [1, 1]
                        };
                    }
                    else {
                        CstyleBehaviour.recordMaybeInsert(editor, session, "{");
                        return {
                            text: '{',
                            selection: [1, 1]
                        };
                    }
                }
            }
            else if (text == '}') {
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == '}') {
                    var matching = session.$findOpeningBracket('}', {
                        column: cursor.column + 1,
                        row: cursor.row
                    });
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
            else if (text == "\n" || text == "\r\n") {
                var closing = "";
                if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) {
                    closing = lang.stringRepeat("}", maybeInsertedBrackets);
                    CstyleBehaviour.clearMaybeInsertedClosing();
                }
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar === '}' || closing !== "") {
                    var openBracePos = session.findMatchingBracket({
                        row: cursor.row,
                        column: cursor.column
                    }, '}');
                    if (!openBracePos) {
                        return null;
                    }
                    var indent = this.getNextLineIndent(state, line.substring(0, cursor.column), session.getTabString());
                    var next_indent = this.$getIndent(line);
                    return {
                        text: '\n' + indent + '\n' + next_indent + closing,
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            }
        });
        this.add("braces", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '{') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.end.column, range.end.column + 1);
                if (rightChar == '}') {
                    range.end.column++;
                    return range;
                }
                else {
                    maybeInsertedBrackets--;
                }
            }
        });
        this.add("parens", "insertion", function (state, action, editor, session, text) {
            if (text == '(') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '(' + selected + ')',
                        selection: false
                    };
                }
                else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, ")");
                    return {
                        text: '()',
                        selection: [1, 1]
                    };
                }
            }
            else if (text == ')') {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ')') {
                    var matching = session.$findOpeningBracket(')', {
                        column: cursor.column + 1,
                        row: cursor.row
                    });
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });
        this.add("parens", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '(') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ')') {
                    range.end.column++;
                    return range;
                }
            }
        });
        this.add("brackets", "insertion", function (state, action, editor, session, text) {
            if (text == '[') {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: '[' + selected + ']',
                        selection: false
                    };
                }
                else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                    CstyleBehaviour.recordAutoInsert(editor, session, "]");
                    return {
                        text: '[]',
                        selection: [1, 1]
                    };
                }
            }
            else if (text == ']') {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar == ']') {
                    var matching = session.$findOpeningBracket(']', {
                        column: cursor.column + 1,
                        row: cursor.row
                    });
                    if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                        CstyleBehaviour.popAutoInsertedClosing();
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        });
        this.add("brackets", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && selected == '[') {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == ']') {
                    range.end.column++;
                    return range;
                }
            }
        });
        this.add("string_dquotes", "insertion", function (state, action, editor, session, text) {
            if (text == '"' || text == "'") {
                var quote = text;
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                    return {
                        text: quote + selected + quote,
                        selection: false
                    };
                }
                else {
                    var cursor = editor.getCursorPosition();
                    var line = session.doc.getLine(cursor.row);
                    var leftChar = line.substring(cursor.column - 1, cursor.column);
                    if (leftChar == '\\') {
                        return null;
                    }
                    var tokens = session.getTokens(selection.start.row);
                    var col = 0,
                        token;
                    var quotepos = -1; // Track whether we're inside an open quote.
                    for (var x = 0; x < tokens.length; x++) {
                        token = tokens[x];
                        if (token.type == "string") {
                            quotepos = -1;
                        }
                        else if (quotepos < 0) {
                            quotepos = token.value.indexOf(quote);
                        }
                        if ((token.value.length + col) > selection.start.column) {
                            break;
                        }
                        col += tokens[x].value.length;
                    }
                    if (!token || (quotepos < 0 && token.type !== "comment" && (token.type !== "string" || ((selection.start.column !== token.value.length + col - 1) && token.value.lastIndexOf(quote) === token.value.length - 1)))) {
                        if (!CstyleBehaviour.isSaneInsertion(editor, session)) {
                            return;
                        }
                        return {
                            text: quote + quote,
                            selection: [1, 1]
                        };
                    }
                    else if (token && token.type === "string") {
                        var rightChar = line.substring(cursor.column, cursor.column + 1);
                        if (rightChar == quote) {
                            return {
                                text: '',
                                selection: [1, 1]
                            };
                        }
                    }
                }
            }
        });
        this.add("string_dquotes", "deletion", function (state, action, editor, session, range) {
            var selected = session.doc.getTextRange(range);
            if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
                var line = session.doc.getLine(range.start.row);
                var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
                if (rightChar == selected) {
                    range.end.column++;
                    return range;
                }
            }
        });
    };
    oop.inherits(CstyleBehaviour, Behaviour);
    exports.CstyleBehaviour = CstyleBehaviour;
});
ace.define('ace/mode/folding/cstyle', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function (require, exports, module) {
    var oop = require("../../lib/oop");
    var Range = require("../../range").Range;
    var BaseFoldMode = require("./fold_mode").FoldMode;
    var FoldMode = exports.FoldMode = function (commentRegex) {
        if (commentRegex) {
            this.foldingStartMarker = new RegExp(
                this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start));
            this.foldingStopMarker = new RegExp(
                this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end));
        }
    };
    oop.inherits(FoldMode, BaseFoldMode);
    (function () {
        this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
        this.getFoldWidgetRange = function (session, foldStyle, row) {
            var line = session.getLine(row);
            var match = line.match(this.foldingStartMarker);
            if (match) {
                var i = match.index;
                if (match[1]) {
                    return this.openingBracketBlock(session, match[1], row, i);
                }
                return session.getCommentFoldRange(row, i + match[0].length, 1);
            }
            if (foldStyle !== "markbeginend") {
                return;
            }
            var match1 = line.match(this.foldingStopMarker);
            if (match1) {
                var x = match1.index + match1[0].length;
                if (match1[1]) {
                    return this.closingBracketBlock(session, match1[1], row, x);
                }
                return session.getCommentFoldRange(row, x, -1);
            }
        };
    }).call(FoldMode.prototype);
});
