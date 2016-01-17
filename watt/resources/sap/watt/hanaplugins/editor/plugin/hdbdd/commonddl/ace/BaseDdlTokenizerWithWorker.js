/*eslint-disable no-eq-null,no-multi-spaces,valid-jsdoc,quotes,no-unused-vars*/
define(
    ["commonddl/ace/TokenTooltip", "rndrt/rnd"],
    function (tokenTooltip, rnd) {
        var oUtils = rnd.Utils;

        function BaseDdlTokenizerWithWorker(Range, padFilePath, myName) {
            this.tokensByLine = {}; // map: key= line number; value = token list for given line
            this.Range = Range;
            this.padFilePath = padFilePath;
            this.myName = myName;
            this.createWorker();
            this.tokensByLineInvalid = false;
            this.navigationHandler = null;
        }

        BaseDdlTokenizerWithWorker.prototype.getTokenizerPath = function () {
            /*eslint-disable no-eq-null*/
            if (this.myName != null) {
                /*eslint-disable sap-browser-api-warning*/
                var scripts = document.getElementsByTagName("script");
                for (var q = 0; q < scripts.length; ++q) {
                    var s = scripts[q].src;
                    if (oUtils.stringEndsWith(s, this.myName)) { //find path to start worker
                        var lind = s.lastIndexOf("/");
                        var p = s.substring(0, lind);
                        return p;
                    }
                }
            }
            return "";
        };

        BaseDdlTokenizerWithWorker.prototype.createWorker = function () {
            function validateData(data) {
                if (typeof data === "object") {
                    for (var i in data) {
                        if (Array.isArray(data[i]) === false) {
                            return false;
                        }
                        if (data[i].length > 0) {
                            if (data[i][0].m_lexem == null || data[i][0].m_offset == null) { // each value in array should be a Token object with attributes m_lexem and m_offset
                                return false;
                            }
                            return true; // don't check each entry in map; is too slow
                        }
                    }
                    return true;
                }
                return false;
            }

            var that = this;
            var workerPath = this.getTokenizerPath() + "/parserWorker.js";
            this.worker = new Worker(workerPath);
            this.worker.addEventListener('message', function (someContent) {
                /*eslint-disable no-eq-null*/
                var dataStr = "data";
                if (someContent == null) {
                    return;
                }
                var content = someContent[dataStr];
                if (content != null) {
                    if (content === "notyetloaded") {
                        that.triggerParseRequestViaWorker();
                    } else {
                        if (validateData(content) === false) { // check result data for security reasons
                            return;
                        }
                        that.tokensByLine = content;
                        //re-trigger coloring for visible area
                        var rend = that.aceEditor.renderer;
                        var session = that.aceEditor.getSession();
                        // delete line cache so that - *DdlTokenizer.getLineTokens is called
                        var first = that.aceEditor.getFirstVisibleRow();
                        var last = that.aceEditor.getLastVisibleRow();
                        for (var i = 0; i <= session.bgTokenizer.lines.length; i++) { // delete all cached lines so that tokensByLine cache will be used when scrolling takes place
                            var l = session.bgTokenizer.lines[i];
                            if (l != null && l.length > 0) {
                                delete session.bgTokenizer.lines[i];
                            }
                        }
                        rend.updateLines(first, last);
                    }
                }
            });
        };

        BaseDdlTokenizerWithWorker.prototype.triggerParseRequestViaWorker = function () {
            var doc = this.sourceDocument;
            var src = doc.$lines.join("\n");
            this.onBeforePostMessage(src);
            this.worker.postMessage({
                padFilePath: this.padFilePath,
                source: src
            });
        };

        /**
         * method is called before source is send to worker to parse source for syntax coloring
         * @param src
         */
        BaseDdlTokenizerWithWorker.prototype.onBeforePostMessage = function (src) {
        };

        /**
         * intended to be sub classed
         */
        BaseDdlTokenizerWithWorker.prototype.isMyEditorSessionMode = function (editor) {
            return false;
        };

        /**
         * intended to be sub classed
         */
        BaseDdlTokenizerWithWorker.prototype.addNavigationHandler = function (editor) {
        };

        BaseDdlTokenizerWithWorker.prototype.setCurrentActiveEditor = function (editor) {
            //editor instance is always the same -> but editor.session changes per editor tab
            if (this.isMyEditorSessionMode(editor.getSession()) !== true) {
                // we have to disable the hdbdd specific ctrl-space registration, so that coco logic from other HANA editors will still work properly
                // see CSS 0120031469 0000823501 2014
                /*eslint-disable dot-notation, no-eq-null*/
                if (editor.$options["enableBasicAutocompletion"] != null) { //disable enableBasicAutocompletion only when it is loaded
                    editor.setOptions({
                        enableBasicAutocompletion: false
                    });
                }
                if (this.navigationHandler != null) {
                    this.navigationHandler.dispose();
                    this.navigationHandler = null;
                }
                return;
            }
            var doc = editor.getSession().doc;
            /*eslint-disable dot-notation, no-eq-null*/
            if (editor.$options["enableBasicAutocompletion"] != null) {
                editor.setOptions({
                    enableBasicAutocompletion: true
                });
            }
            if (this.navigationHandler == null) {
                //register listeners only once per editor
                this.navigationHandler = this.addNavigationHandler(editor);
            }
            if (doc === this.sourceDocument) {
                return; //nothing to do
            }
            this.setDocument(doc);
            if (!(doc.$lines.length === 1 && doc.$lines[0] === "")) {
                this.triggerParseRequestViaWorker();
            }
            this.addChangeListenerIfNecessary(editor);
            this.tokensByLine = {};
            this.aceEditor = editor;
            editor.rndTokenizer = this; // store reference from ace editor instance to BaseDdlTokenizerWithWorker
        };

        BaseDdlTokenizerWithWorker.prototype.onSessionChange = function (change, session) {
            if (BaseDdlTokenizerWithWorker.current.isMyEditorSessionMode(session) !== true) {
                return;
            }

            // This is a LateWorker! Pending tasks are stopped and new delay is 700ms.

            // invalidate line caches when source is modified
            BaseDdlTokenizerWithWorker.current.tokensByLineInvalid = true;
            //do this with delayed timeout // not too much often
            /*eslint-disable no-eq-null*/
            if (BaseDdlTokenizerWithWorker.current.lastTimeout != null) {
                clearTimeout(BaseDdlTokenizerWithWorker.current.lastTimeout);
            }
            /*eslint-disable sap-browser-api-warning*/
            BaseDdlTokenizerWithWorker.current.lastTimeout = setTimeout(function () {
                BaseDdlTokenizerWithWorker.current.triggerParseRequestViaWorker();
            }, 700);
        };

        BaseDdlTokenizerWithWorker.prototype.addChangeListenerIfNecessary = function (editor) {
            BaseDdlTokenizerWithWorker.current = this;
            var session = editor.getSession();
            if (oUtils.arrayContains(session._eventRegistry.change, this.onSessionChange) === false) {
                session.on('change', this.onSessionChange);
            }
        };

        BaseDdlTokenizerWithWorker.prototype.setDocument = function (sourceDoc) {
            this.sourceDocument = sourceDoc;
        };

        BaseDdlTokenizerWithWorker.prototype.createSpaces = function (line, fromColumn, toColumn) {
            var str = this.sourceDocument.$lines[line];
            var result = [];
            for (var i = fromColumn; i < toColumn; i++) {
                var ws = str[i];
                if (ws !== undefined) {
                    result.push(ws);
                }
            }
            var res = result.join("");
            return res;
        };

        BaseDdlTokenizerWithWorker.prototype.convertOffsetToRowColumn = function (str, offset) {
            var row = 0;
            var column = 0;
            for (var i = 0; i < str.length; i++) {
                if (i === offset) {
                    break;
                }
                if (str[i] === '\n') {
                    row++;
                    column = 0;
                    continue;
                }
                column++;
            }
            return {row: row, column: column};
        };

        BaseDdlTokenizerWithWorker.prototype.convertToOffset = function (/*Array*/lines, /*String*/lineDelimLength, /*Number*/row, /*Number*/column) {
            var offset = 0;
            for (var i = 0; i < lines.length; i++) {
                if (i === row) {
                    offset += column;
                    return offset;
                }
                offset += lines[i].length + lineDelimLength;
            }
            return offset;
        };

        BaseDdlTokenizerWithWorker.prototype.isInCommentOrLiteral = function (pos) {
            var editor = this.aceEditor;
            var session = editor.getSession();
            /*eslint-disable no-eq-null*/
            if (session != null && session.doc != null && this.parser != null && this.resolver != null) {
                var /*String*/ source = session.doc.$lines.join("\n");
                var offset = this.convertToOffset(session.doc.$lines, 1, pos.row, pos.column);
                var tokens = this.parser.tokenize(this.resolver, source);
                for (var i = 0; i < tokens.length; i++) {
                    var /*Token*/ t = tokens[i];
                    if (offset >= t.m_offset && offset <= t.m_offset + t.m_lexem.length) {
                        if (rnd.Category.CAT_LITERAL === t.m_category || rnd.Category.CAT_COMMENT === t.m_category ||
                            (rnd.Category.CAT_IDENTIFIER === t.m_category && oUtils.stringStartsWith(t.m_lexem, '"') === true && oUtils.stringEndsWith(t.m_lexem, '"'))
                        ) {
                            return true;
                        }
                    } else if (t.m_offset > offset) {
                        break;// out of range, stop for loop
                    }
                }
            }
            return false;
        };

        /**
         * intended to be sub classed
         */
        BaseDdlTokenizerWithWorker.prototype.convertRndTokensToAce = function (rndTokens) {
            return [];
        };

        BaseDdlTokenizerWithWorker.prototype.getLineTokens = function (line, state, row) {
            var currentState = "start";
            var aceTokens = [];
            var rndTokens;

            //check result from worker -> if exists, take it
            if (this.tokensByLineInvalid === true) {
                var cachedTokens = this.tokensByLine[row];
                this.tokensByLineInvalid = false;
                if (cachedTokens !== undefined && cachedTokens.length === 1 && cachedTokens[0].m_category.value === rnd.Category.CAT_COMMENT.value) {
                    var aceToken = {};
                    aceToken.value = line;
                    aceToken.type = "comment";
                    aceTokens.push(aceToken);
                    return {
                        tokens: aceTokens,
                        state: currentState
                    };
                }
                this.tokensByLine = {};
            }

            if (Object.keys(this.tokensByLine).length > 0) {
                rndTokens = this.tokensByLine[row];
            }
            if (rndTokens === undefined) { // Fallback in any case ;)
                rndTokens = this.parser.tokenize(this.resolver, line);
            }

            aceTokens = this.convertRndTokensToAce(rndTokens, row);

            return {
                tokens: aceTokens,
                state: currentState
            };
        };

        BaseDdlTokenizerWithWorker.prototype.createMarkerForErrorToken = function (row, column, length) {
            var that = this;

            var session = that.aceEditor.getSession();

            var markerDeco = "acmark_error errorType_error";
            var marker = session.addMarker(new this.Range(row, column, row, column + length), markerDeco, "text");

            var gutterDeco = "ace_error";
            session.addGutterDecoration(row, gutterDeco);

            // store the markers and decorators on EditSession level (think of multiple editors)
            session.__markersByRow = session.__markersByRow || {};
            session.__markerTooltipsByRow = session.__markerTooltipsByRow || {};
            session.__decoratorsByRow = session.__decoratorsByRow || {};

            session.__markersByRow[row] = session.__markersByRow[row] || [];
            session.__markerTooltipsByRow[row] = session.__markerTooltipsByRow[row] || [];
            session.__decoratorsByRow[row] = session.__decoratorsByRow[row] || [];

            session.__markersByRow[row].push(marker);
            session.__decoratorsByRow[row].push(gutterDeco);

            // TODO, enable this as soon as the error token has got an error text in it.
            // The error token text needs then to be passed to this method, it can be undefined for old parsers
            var errorText; // = "My CDS error text";
            if(errorText) {
                var tooltip = that.createTooltip(that.aceEditor, errorText, row, column, length);
                session.__markerTooltipsByRow[row].push(tooltip);
            }
        };

        BaseDdlTokenizerWithWorker.prototype.createTooltip = function (editor, text, row, column, length) {
            return new tokenTooltip(editor, text, row, column, column + length);
        };

        BaseDdlTokenizerWithWorker.prototype.deleteLastErrorTokenMarkers = function (row) {
            var i;
            var session = this.aceEditor.getSession();

            if (session.__markersByRow) {
                var markers = session.__markersByRow[row];
                if (markers) {
                    for (i = 0; i < markers.length; i++) {
                        session.removeMarker(markers[i]);
                    }
                    delete session.__markersByRow[row];
                }
            }

            if (session.__decoratorsByRow) {
                var decorators = session.__decoratorsByRow[row];
                if (decorators) {
                    for (i = 0; i < decorators.length; i++) {
                        session.removeGutterDecoration(row, decorators[i]);
                    }
                    delete session.__decoratorsByRow[row];
                }
            }

            if (session.__markerTooltipsByRow) {
                var tooltips = session.__markerTooltipsByRow[row];
                if (tooltips) {
                    for (i = 0; i < tooltips.length; i++) {
                        tooltips[i].destroy();
                    }
                    delete session.__markerTooltipsByRow[row];
                }
            }
      };

        return BaseDdlTokenizerWithWorker;
    }
);