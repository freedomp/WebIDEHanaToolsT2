/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,
no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc,no-constant-condition,no-wrap-func*/
/*global ace*/
ace.define(
    'ace/mode/hdbcds',
    [
        'require', 'exports', 'module', 'ace/lib/net',
        'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/javascript_highlight_rules', 'ace/mode/matching_brace_outdent', 'ace/range',
        'ace/worker/worker_client', 'ace/mode/behaviour/cstyle', 'ace/mode/folding/cstyle'
    ],

    function (aceRequire, exports, module) {

        var oop = aceRequire("../lib/oop");
        var TextMode = aceRequire("./text").Mode;
        var TokenizerBase = aceRequire("../tokenizer").Tokenizer;

        var MatchingBraceOutdent = aceRequire("./matching_brace_outdent").MatchingBraceOutdent;
        var Range = aceRequire("../range").Range;
        var WorkerClient = aceRequire("../worker/worker_client").WorkerClient;
        var CstyleBehaviour = aceRequire("./behaviour/cstyle").CstyleBehaviour;
        var CStyleFoldMode = aceRequire("./folding/cstyle").FoldMode;

        function DdlRules() {
        }

        DdlRules.prototype.getRules = function () {
            return {};
        };

        var editor = null;
        var rndTok = null;

        function createRndTok(AceRndTokenizer) {            
            rndTok = new AceRndTokenizer(Range);
            rndTok.setCurrentActiveEditor(editor);

            editor.on("changeSession",function(pData,pEditor) {
                rndTok.setCurrentActiveEditor(pEditor);
            });

            //re-render all lines
            var rend = editor.renderer;
            var sess = editor.getSession();
            var lines = sess.bgTokenizer.lines.length;
            //console.log("re-render " + lines);
            for (var i = 0; i < lines; i++) {
                delete sess.bgTokenizer.lines[i];
            }
            rend.updateLines(1, lines);
            //remove local completers (which just proposes all tokens)
            if (editor.completers) {
                editor.completers.splice(1,1);
                editor.completers.splice(0,1);
            }
        }

        var BaseCdsDdlParser = null;
        var DdlCodeCompletionType = null;
        var IBaseCdsDdlParserConstants = null;

        require(["rndrt/rnd", "commonddl/commonddlNonUi", "hanaddl/hanaddlNonUi", "hanaddl/hanaddlUi", "hanaddl/hanav5/CdsDdlParserResolver"], function (rnd, commonddlNonUi, hanaddlNonUi, hanaddlUi) {
            //pre-load "CdsDdlParserResolver" that is the sole resolver that we use in this scenario

            function loadAceCoCoModule() {
                ace.config.loadModule('ace/ext/language_tools', function () {
                    editor.setOptions({
                        enableBasicAutocompletion: true
                    });
                });
            }

            function initRndTok() {
                try {
                    if (jQuery === undefined) {
                        throw new Error();
                    }
                    if (jQuery.sap.require === undefined) { // not WATT - local scenario
                        loadAceCoCoModule();
                    }
                }catch(e) {
                    loadAceCoCoModule();
                }
                createRndTok(hanaddlUi.HanaDdlTokenizerWithWorker);
                BaseCdsDdlParser = hanaddlNonUi.BaseCdsDdlParser;
                DdlCodeCompletionType = commonddlNonUi.DdlCodeCompletionType;
                IBaseCdsDdlParserConstants = hanaddlNonUi.IBaseCdsDdlParserConstants;
            }

            var retryCount = 0; // we don't have to reset retryCount because this coding snippet is executed only one time

            function initEditor() {
                editor = rnd.AceEditorUtils.getAceEditor();
                if (editor == null) {
                    // not yet loaded - editor restore scenario - wait for some time and retry loading the editor mode again
                    retryCount++;
                    if (retryCount > 3)
                        return; // no endless loop - stop after 3 re-try attempts
                    setTimeout(function() {
                        initEditor();
                    },4 * 1000);// magic number
                    return;
                }
                initRndTok();
            }

            initEditor();
        });

        var Mode = function () {
            this.$highlightRules = DdlRules;

            this.$outdent = new MatchingBraceOutdent();
            this.$behaviour = new CstyleBehaviour();
            this.foldingRules = new CStyleFoldMode();

            this.getCompletions = function (state, session, pos, prefix) {                
                editor.completer.autoInsert = false;//disable autoInsert logic
                var keywords = this.compl(pos, prefix);
                var beforeCursor = editor.selection.getCursor();
                var listIndex = 0;
                return keywords.map(function (obj) {
                    listIndex++;
                    var word = obj.name;
                    if (obj.additionalDisplayString !== undefined) {
                        if (obj.additionalDisplayString.length > 0) {
                            word = word + " - " + obj.additionalDisplayString;
                        }
                    }
                    var theObj = obj;
                    var inserter = {

                        insertMatch: function (editor1) {
                            rndTok.insertCompletion(editor1,theObj,beforeCursor);
                        }
                    };

                    function toMetaType(complType) {
                        if (IBaseCdsDdlParserConstants.LOADING_TYPE == complType) {
                            return "";
                        }else  if (IBaseCdsDdlParserConstants.TABLE_TYPE == complType) {
                            return "table";
                        }else if (IBaseCdsDdlParserConstants.SYNONYM_TYPE == complType) {
                            return "synonym";
                        }else if (DdlCodeCompletionType.ANNOTATION == complType) {
                            return "annotation";
                        }else if (IBaseCdsDdlParserConstants.ALIAS_TYPE == complType) {
                            return "alias";
                        }else if (IBaseCdsDdlParserConstants.TYPE_TYPE == complType) {
                            return "type";
                        }else if (IBaseCdsDdlParserConstants.ENTITY_TYPE == complType) {
                            return "entity";
                        }else if (IBaseCdsDdlParserConstants.CONST_TYPE == complType) {
                            return "const";
                        }else if (IBaseCdsDdlParserConstants.CONTEXT_TYPE == complType) {
                            return "context";
                        }else if (IBaseCdsDdlParserConstants.VIEW_TYPE == complType) {
                            return "view";
                        }else if (IBaseCdsDdlParserConstants.ASSOC_TYPE == complType) {
                            return "association";
                        }else if (IBaseCdsDdlParserConstants.ELEMENT_TYPE == complType) {
                            return "element";
                        }else if (IBaseCdsDdlParserConstants.ASPECT_TYPE == complType) {
                            return "aspect";
                        }else{
                            return "keyword";
                        }
                    }

                    var meta = toMetaType(obj.type);
                    var score = 100000 - DdlCodeCompletionType.toInt(obj.type) - listIndex * 100; // keep result list sort order via listIndex // ACE is sorting via the score attribute
                    return {
                        name: word,
                        value: word,
                        score: score, //higher priority than the basic name completion results from the base
                        meta: meta,
                        completer: inserter
                    };
                });
            };
            this.compl = function (pos, prefix) {
                var res = rndTok.getCompls(pos, prefix);
                return res;
            };
        };
        oop.inherits(Mode, TextMode);


        (function () {

            this.lineCommentStart = "//";
            this.blockComment = {
                start: "/*",
                end: "*/"
            };

            this.getTokenizer = function () {
                return {
                    getLineTokens: function (line, state, row) {
                        var res = null;
                        if (rndTok != null) {
                            res = rndTok.getLineTokens(line, state, row);
                        } else {
                            res = { state: state, tokens: [
                                {value: line, type: "text"}
                            ] };
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

        exports.Mode = Mode;

    });


ace.define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module', 'ace/range'], function (require, exports, module) {


    var Range = require("../range").Range;

    var MatchingBraceOutdent = function () {
    };

    (function () {

        this.checkOutdent = function (line, input) {
            if (!/^\s+$/.test(line)) return false;

            return /^\s*\}/.test(input);
        };

        this.autoOutdent = function (doc, row) {
            var line = doc.getLine(row);
            var match = line.match(/^(\s*\})/);

            if (!match) return 0;

            var column = match[1].length;
            var openBracePos = doc.findMatchingBracket({
                row: row,
                column: column
            });

            if (!openBracePos || openBracePos.row == row) return 0;

            var indent = this.$getIndent(doc.getLine(openBracePos.row));
            doc.replace(new Range(row, 0, row, column - 1), indent);
        };

        this.$getIndent = function (line) {
            return line.match(/^\s*/)[0];
        };

    }).call(MatchingBraceOutdent.prototype);

    exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function (aceRequire, exports, module) {


    var oop = aceRequire("../../lib/oop");
    var Behaviour = aceRequire("../behaviour").Behaviour;
    var TokenIterator = aceRequire("../../token_iterator").TokenIterator;
    var lang = aceRequire("../../lib/lang");

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
                if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) return false;
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
            if (!this.isAutoInsertedClosing(cursor, line, autoInsertedLineEnd[0])) autoInsertedBrackets = 0;
            autoInsertedRow = cursor.row;
            autoInsertedLineEnd = bracket + line.substr(cursor.column);
            autoInsertedBrackets++;
        };

        CstyleBehaviour.recordMaybeInsert = function (editor, session, bracket) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            if (!this.isMaybeInsertedClosing(cursor, line)) maybeInsertedBrackets = 0;
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
            if (text == '{' || text == "'") {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);
                if (selected !== "{" && editor.getWrapBehavioursEnabled()) {
                    if (editor.rndTokenizer != null && editor.rndTokenizer.isInCommentOrLiteral(selection.start) == false) {
                        if (text == '{') {
                            return { text: '{' + selected + '}',selection: [1, 1] };
                        }else if (text == "'") {
                            return { text: "'" + selected + "'",selection: [1, 1] };
                        }else throw new Error();
                    }
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
                if (rightChar == '}' || closing !== "") {
                    var openBracePos = session.findMatchingBracket({
                        row: cursor.row,
                        column: cursor.column
                    }, '}');
                    if (!openBracePos) return null;

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
                        if (!CstyleBehaviour.isSaneInsertion(editor, session)) return null;
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

                if (match[1]) return this.openingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i + match[0].length, 1);
            }

            if (foldStyle !== "markbeginend") {
                return null;
            }

            var match = line.match(this.foldingStopMarker);
            if (match) {
                var i = match.index + match[0].length;

                if (match[1]) return this.closingBracketBlock(session, match[1], row, i);

                return session.getCommentFoldRange(row, i, -1);
            }
        };

    }).call(FoldMode.prototype);

});
