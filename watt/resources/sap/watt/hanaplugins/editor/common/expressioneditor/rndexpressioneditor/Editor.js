/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./rndfiles/parser/ParserAPI"], function(ParserAPI) {

    var Editor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.Editor", {
        autocompletion: null,
        _valuehelpArray: null,
        _langtools: null,
        _elements: null,
        _functions: null,
        _operators: null,

        metadata: {
            properties: {
                "width": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "100%"
                },
                "height": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "100%"
                },
                "value": {
                    type: "string",
                    defaultValue: ""
                },
                "readOnly": {
                    type: "boolean",
                    defaultValue: false
                },
                "hidden": {
                    type: "boolean",
                    defaultValue: false
                },
                "fontSize": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "12px"
                },
                "theme": {
                    type: "string",
                    defaultValue: "ace/theme/sap-cumulus"
                },
                "mode": {
                    type: "string"
                    //defaultValue: "ace/mode/hana"
                },
                "language": {
                    type: "string",
                    defaultValue: "HANA"
                },
                "model": {
                    type: "any"
                },
                "liveInputSupportEnabled": {
                    type: "boolean",
                    defaultValue: true
                }
            },
            events: {
                "liveChange": {},
                "editorGotFocus": {},
                "renderDone": {},
                "undoMgrStateChange": {}
            }
        },

        init: function() {
            jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
            jQuery.sap.require("sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.rndfiles.parser.mode-expr");
            ace.config.set("basePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            //ace.config.set("modePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            // ace.config.set("modePath", jQuery.sap.getModulePath("sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.rndfiles.parser"));
            ace.config.set("themePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            ace.config.set("workerPath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            // expose this.getAceEditor() as propery as required by intellisence
            var that = this;
            Object.defineProperty(this, "oEditor", {
                get: function() {
                    return that.getAceEditor();
                },
                enumerable: true 
            });
        },

        onBeforeRendering: function() {
            var that = this;
            var editor = this.getAceEditor();
            this.setMode("ace/mode/expr", "sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.rndfiles.parser");
            var mode = this.getAceEditor().getSession().$modes["ace/mode/expr"];
            if (mode !== undefined) {
                mode.setEditor(this.getAceEditor(), this.getLanguage());
                this.getAceEditor().setValue(this.getAceEditor().getValue(), 1);
            }

            editor.completers.splice(0, 2);

            var completer = {
                getCompletions: function(editor, session, pos, prefix, callback) {

                    var cursorPositionColumn = editor.getCursorPosition().column;
                    var cursorPositionRow = editor.getCursorPosition().row;
                    var compls = new ParserAPI(that._elements, that._functions, that._operators, that.getLanguage()).getCompletions(editor.getValue(), 1 + cursorPositionRow, 1 + cursorPositionColumn);

                    callback(null, compls.map(function(ea) {
                        return {
                            name: ea,
                            value: ea
                        };
                    }));
                }
            };
            that._langtools.addCompleter(completer);
        },

        refresh: function() {
            if (this._editor) {
                this._editor.resize(true);
            }
        },

        getAceSession: function() {
            if (!this._session) {
                this._session = ace.createEditSession(this.getProperty("value"), this.getProperty("mode"));
                // this._session = ace.createEditSession(this.getProperty("value"),"ace/mode/expr");
            }
            return this._session;
        },

        getAceEditor: function() {
            if (!this._editor) {
                this._editor = this._createEditor();
            }
            //  this.setMode("ace/mode/expr", "sap.watt.hanaplugins.editor.common.expressioneditor.rndexpressioneditor.rndfiles.parser");
            return this._editor;
        },

        open: function(value) {

            this._prevUndoState = this._prevRedoState = false;

            var editor = this.getAceEditor();
            var oUndoManager = this.getAceSession().getUndoManager();

            editor.commands.addCommand({
                name: "redo",
                bindKey: {
                    win: "Ctrl-Shift-Z|Ctrl-Y",
                    mac: "Command-Shift-Z|Command-Y"
                },
                exec: function(param) {
                    oUndoManager.redo();
                }
            });

            editor.commands.addCommand({
                name: "undo",
                bindKey: {
                    win: "Ctrl-Z",
                    mac: "Command-Z"
                },
                exec: function(param) {
                    oUndoManager.undo();
                }
            });

            this.setValue(value);

            var that = this;
            editor.on("change", function(oEvent) {
                that.fireLiveChange();
            });

            editor.on("input", function(oEvent) { // triggered by both user input or undo/redo command after Undo Mgr is updated
                if (oUndoManager.hasUndo() !== that._prevUndoState ||
                    oUndoManager.hasRedo() !== that._prevRedoState) { // avoid excessively updating menu and toolbar
                    that.fireUndoMgrStateChange();
                    that._prevUndoState = oUndoManager.hasUndo();
                    that._prevRedoState = oUndoManager.hasRedo();
                }
            });

            editor.on("focus", function(oEvent) {
                that.fireEditorGotFocus(oEvent);
            });

            $('#ace_editor').resizable({
                resize: function(event, ui) {
                    editor.resize();
                }
            });
        },

        undo: function() {
            var editor = this.getAceEditor();
            var oUndoManager = this.getAceSession().getUndoManager();

            oUndoManager.undo();
        },

        redo: function() {
            var editor = this.getAceEditor();
            var oUndoManager = this.getAceSession().getUndoManager();

            oUndoManager.redo();
        },

        _createEditor: function() {

            jQuery.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');

            var that = this;

            $('#' + this.getId()).droppable({
                drop: $.proxy(this.handleDropEvent, this)
            });

            var VirtualRenderer = ace.require("ace/virtual_renderer").VirtualRenderer;
            var Editor = ace.require("ace/editor").Editor;

            var renderer = new VirtualRenderer(null, this.getProperty("theme"));
            var editor = new Editor(renderer, this.getAceSession());
            editor.setReadOnly(this.getProperty("readOnly"));
            editor.setFontSize(this.getProperty("fontSize"));
            editor.setTheme(this.getProperty("theme"));

            //editor.container.style.height = this.getProperty("height");
            editor.container.style.height = "100%";
            editor.container.style.width = this.getProperty("width");
            editor.container.style.margin = "0px";

            // require(["sap/hana/ide/common/plugin/expressioneditor/rndexpressioneditor/rndfiles/parser/ParserAPI"], function(ParserAPI) {

            jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ext-language_tools");
            that._langtools = ace.require("ace/ext/language_tools");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showGutter: false
            });
            editor.completers.splice(0, 2);

            var completer = {
                getCompletions: function(editor, session, pos, prefix, callback) {

                    var cursorPositionColumn = editor.getCursorPosition().column;
                    var cursorPositionRow = editor.getCursorPosition().row;
                    var compls = new ParserAPI(that._elements, that._functions, that._operators, that.getLanguage()).getCompletions(editor.getValue(), 1 + cursorPositionRow, 1 + cursorPositionColumn);

                    callback(null, compls.map(function(ea) {
                        return {
                            name: ea,
                            value: ea
                        };
                    }));
                }
            };
            that._langtools.addCompleter(completer);
            //    });

            $('#' + this.getId()).attr('env', {
                document: null,
                editor: editor,
                onResize: editor.resize()
            });

            return editor;
        },

        handleDropEvent: function(event, ui) {
            if (!this.getReadOnly()) {
                var draggable = ui.draggable[0];

                var node = draggable;
                var text = this.getTextFromTreeNode(node);
                this.getAceEditor().insert(text);

                this.getAceEditor().focus();
            }
        },

        getTextFromTreeNode: function(treenode) {
            var nodeText = "";
            if(!treenode.innerText){
                treenode.innerText = treenode.textContent;
            }  
            if (treenode.getAttribute('data-nodetype') === "function") {
                nodeText = treenode.getAttribute('data-valuehelp');
            } else if (treenode.getAttribute('data-nodetype') === "operator") {
                nodeText = treenode.innerText;
            } else if (treenode.getAttribute('data-nodetype') === "element") {
                if (treenode.getAttribute('data-separator') !== undefined && treenode.getAttribute('data-separator') !== "") {
                    nodeText = treenode.getAttribute('data-separator') + treenode.innerText + treenode.getAttribute('data-separator');
                } else {
                    nodeText = treenode.getAttribute('data-separatorstart') + treenode.innerText + treenode.getAttribute('data-separatorend');
                }

                if (treenode.getAttribute('data-elementtype') === "Column") {
                    nodeText = "\"" + treenode.innerText + "\"";
                } else if (treenode.getAttribute('data-elementtype') === "Parameter" && this.isNumDatatype(treenode.getAttribute('data-datatype')) || treenode.getAttribute('data-elementtype') === "MultiValueParameter") {
                    nodeText = "$$" + treenode.innerText + "$$";
                } else if (treenode.getAttribute('data-elementtype') === "Parameter") {
                    nodeText = "\'$$" + treenode.innerText + "$$\'";
                } else {
                    nodeText = "\"" + treenode.innerText + "\"";
                }
            }

            return nodeText;
        },

        isNumDatatype: function(datatypeName) {
            if (datatypeName === "INTEGER" || datatypeName === "TINYINT" || datatypeName === "SMALLINT" || datatypeName === "BIGINT" || datatypeName === "DECIMAL" || datatypeName === "REAL" || datatypeName === "DOUBLE" || datatypeName === "FLOAT" || datatypeName === "SMALLDECIMAL") {
                return true;
            } else {
                return false;
            }
        },

        setValue: function(sValue) {
            if (this._session) {
                this._session.setValue(sValue);
            } else {
                this.setProperty("value", sValue, true);
            }
        },

        getValue: function() {
            if (this._session) {
                return this._session.getValue();
            } else {
                return this.getProperty("value");
            }
        },

        setMode: function(sMode, modepath) {
            ace.config.set("modePath", jQuery.sap.getModulePath(modepath));
            this.getAceSession().setMode(sMode);
        },

        getMode: function() {
            if (this._session) {
                return this._session.getMode();
            } else {
                return this.getProperty("mode");
            }
        },

        setReadOnly: function(bReadOnly) {
            if (this._editor) {
                this._editor.setReadOnly(bReadOnly);
            } else {
                this.setProperty("readOnly", bReadOnly, true);
            }
        },

        getReadOnly: function() {
            if (this._editor) {
                return this._editor.getReadOnly();
            } else {
                return this.getProperty("readOnly");
            }
        },

        setFontSize: function(sFontSize) {
            if (this._editor) {
                this._editor.setFontSize(sFontSize);
            } else {
                this.setProperty("fontSize", sFontSize, true);
            }
        },

        getFontSize: function() {
            if (this._editor) {
                return this._editor.getFontSize();
            } else {
                return this.getProperty("fontSize");
            }
        },

        setTheme: function(sTheme) {
            if (this._editor) {
                this._editor.setTheme(sTheme);
            } else {
                this.setProperty("theme", sTheme, true);
            }
        },

        getTheme: function() {
            if (this._editor) {
                return this._editor.getTheme();
            } else {
                return this.getProperty("theme");
            }
        },

        setHidden: function(bHidden) {
            this.setProperty("hidden", bHidden, true);
        },

        onAfterRendering: function() {
            var that = this;
            var domId = this.getId();
            var editorElement = jQuery.sap.domById(domId);

            if (editorElement) {
                editorElement.innerHTML = "";
                editorElement.appendChild(this.getAceEditor().container);
                editorElement.env = {
                    document: null,
                    editor: this.getAceEditor(),
                    onResize: this.getAceEditor().resize()
                };
                if (!this.getHidden()) {
                    editorElement.addEventListener('contextmenu', function(evt) {
                        evt.preventDefault();
                    });
                    this.fireRenderDone();
                }
            }

            this.getAceEditor().setValue(this.getAceEditor().getValue(), 1);
            $('#' + this.getId()).droppable({
                drop: $.proxy(this.handleDropEvent, this)
            });
        },

        renderer: function(rm, oControl) {
            rm.write("<pre");
            rm.writeControlData(oControl);
            rm.writeClasses();
            rm.addStyle("position", "relative");
            rm.addStyle("font-size", oControl.getFontSize());
            rm.addStyle("width", "100%");
            rm.addStyle("height", "100%");
            rm.addStyle("margin", "0px");
            rm.writeStyles();
            rm.write(">");
            rm.write("</pre>");
        },

        addEventListener: function(name, handler) {
            var target = this.getAceSession();
            if (name == 'changeCursor') {
                target = target.selection;
            }
            target.addEventListener(name, handler);
        },

        removeEventListener: function(name, handler) {
            var target = this.getAceSession();
            if (name == 'changeCursor') {
                target = target.selection;
            }
            target.removeEventListener(name, handler);
        },

        getMarkers: function(inFront) {
            return this.getAceSession().getMarkers(inFront);
        },

        removeMarker: function(markerId) {
            this.getAceSession().removeMarker(markerId);
        },

        indexToPosition: function(index, startRow) {
            var session = getAceSession();
            if (session.doc) {
                return session.doc.indexToPosition(index, startRow);
            } else {
                return null;
            }
        },

        positionToIndex: function(pos, startRow) {
            var session = getAceSession();
            if (session.doc) {
                if ((pos === null) || (pos === undefined)) {
                    if (this._editor) {
                        pos = this._editor.selection.getCursor();
                    } else {
                        return null;
                    }
                }
                return session.doc.positionToIndex(pos, startRow);
            } else {
                return null;
            }
        },

        getLine: function(row) {
            var session = getAceSession();
            var document = session.getDocument();
            if (document) {
                return document.getLine(row);
            }
            return null;
        },

        getAllLines: function() {
            var session = getAceSession();
            var document = session.getDocument();
            if (document) {
                return document.getAllLines();
            }
            return null;
        },

        addMarker: function(range, clazz, type, inFront) {
            return this.getAceSession().addMarker(range, clazz, type, inFront);
        },

        setModuleUrl: function(name, subst) {
            ace.config.setModuleUrl(name, subst);
        },
        gotoLine: function(lineNumber, column, animate) {
            if (this._editor) {
                this._editor.gotoLine(lineNumber, column, animate);
            }
        },

        replace: function(range, text) {
            this.getAceSession().replace(range, text);
        },

        getSelectionRange: function() {
            if (this._editor) {
                return this._editor.getSelectionRange();
            }
            return null;
        },

        getSelection: function() {
            if (this._editor) {
                return this._editor.getSelection();
            }
            return null;
        },

        clearSelection: function() {
            if (this._editor) {
                this._editor.clearSelection();
            }
        },

        getCursorPosition: function() {
            if (this._editor) {
                return this._editor.getCursorPosition();
            }
            return null;
        },

        moveCursorTo: function(row, column) {
            if (this._editor) {
                this._editor.moveCursorTo(row, column);
            }
        },

        setFocus: function() {
            if (this._editor) {
                this._editor.focus();
            }
        },

        navigateTo: function(row, column) {
            if (this._editor) {
                this._editor.navigateTo(row, column);
            }
        },

        getContainer: function() {
            if (this._editor) {
                return this._editor.container;
            }
            return null;
        },

        getFileURI: function() {
            return this.getId();
        },

        getAnnotations: function() {
            return this.getAceSession().getAnnotations();
        },

        setBreakpoint: function(row, className) {
            var session = this.getAceSession();
            if (session) {
                session.setBreakpoint(row, className);
                if (!session.breakpoints) {
                    session.breakpoints = {};
                }
                session.breakpoints[row] = className;
            }
        },

        setBreakpoints: function(breakpoints) {
            var session = this.getAceSession();
            if (session) {
                session.setBreakpoints(breakpoints);
                if (!session.breakpoints) {
                    session.breakpoints = {};
                }
                for (var i = 0; i < breakpoints.length; i++) {
                    session.breakpoints[breakpoints[i]] = ""; // which className?
                }
            }
        },

        getBreakpointsWithClass: function() {
            var session = this.getAceSession();
            var breakpoints = null;
            if (session && session.breakpoints) {
                breakpoints = session.breakpoints;
            }
            return breakpoints;
        },

        getBreakpoints: function() {
            var session = this.getAceSession();
            var breakpoints = null;
            if (session) {
                breakpoints = session.getBreakpoints();
            }
            return breakpoints;
        },

        clearBreakpoint: function(row) {
            var session = this.getAceSession();
            if (session) {
                session.clearBreakpoint(row);
                if (session.breakpoints[row]) {
                    delete session.breakpoints[row];
                }
            }
        },

        clearBreakpoints: function() {
            var session = this.getAceSession();
            if (session) {
                session.clearBreakpoints();
                if (session.breakpoints) {
                    delete session.breakpoints;
                }
            }
        },

        removeGutterDecoration: function(row, className) {
            this.getAceSession().removeGutterDecoration(row, className);
        },

        addGutterDecoration: function(row, className) {
            this.getAceSession().addGutterDecoration(row, className);
        },

        replaceAll: function(replacement, options) {
            if (this._editor) {
                return this._editor.replaceAll(replacement, options);
            }
            return null;
        },

        find: function(needle, options, animate) {
            if (this._editor) {
                this._editor.find(needle, options, animate);
            }
        },

        getTabSize: function() {
            if (this.getSession()) {
                return this.getSession().getTabSize();
            }
            return null;
        },

        moveCursorToPosition: function(pos) {
            if (this.selection) {
                this.selection.moveCursorToPosition(pos);
            }
        },

        setCurrentFilePath: function(sPath) {
            this._sTargetFile = sPath;
        },

        getCurrentFilePath: function() {
            return this._sTargetFile;
        },

        getNativeEditor: function() {
            return this._editor;
        },

        deleteCurrentSelection: function() {
            if (this._editor) {
                this._editor.remove(this._editor.getSelectionRange());
            }
        },

        setUndoManager: function(undoManager) {
            // remove standard commands to avoid conflict with WATT undo/redo 
            this._editor.commands.removeCommand("undo");
            this._editor.commands.removeCommand("redo");
            this.getAceEditor().getAceSession().setUndoManager(undoManager);
        },

        setValueHelpArray: function(array) {
            this._valuehelpArray = array;
        },

        setElements: function(elementArray) {
            this._elements = elementArray;
        },

        setFunctions: function(functionArray) {
            this._functions = functionArray;
        },

        setOperators: function(operatorArray) {
            this._operators = operatorArray;
        }
    });
    return Editor;
});
