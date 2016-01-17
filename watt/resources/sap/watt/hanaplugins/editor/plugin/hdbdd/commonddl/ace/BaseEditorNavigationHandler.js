/*eslint-disable max-len,valid-jsdoc*/
define(
    ["rndrt/rnd", "hanaddl/hanaddlCache"],
    function (rnd, Cache) {
        var Utils = rnd.Utils;
        var preferences = Cache.preferences;

        function BaseEditorNavigationHandler(editor, parse, resolve, Rang) {
            this.aceEditor = editor;
            this.Range = Rang;
            this.ctrlClicked = false;
            this.parser = parse;
            this.resolver = resolve;
            /*eslint-disable sap-browser-api-error*/
            if (navigator.appVersion.indexOf("Mac") > -1) {
                this.isMacOS = true;
            } else {
                this.isMacOS = false;
            }
        }

        /**
         * intended to be sub classed
         * @param {AceEditor} aceEditor
         * @param {int} row
         * @param {int} startColumn
         * @param {int} endColumn
         */
        BaseEditorNavigationHandler.prototype.doNavigate = function (aceEditor, row, startColumn, endColumn) {
        };

        /**
         * helper function to navigate within the same editor to a given range
         * @param {AceEditor} aceEditor instance of ACE editor
         * @param startRow
         * @param startColumn
         * @param endRow
         * @param endColumn
         */
        BaseEditorNavigationHandler.prototype.navigateToSameFile = function (aceEditor, startRow, startColumn, endRow, endColumn) {
            /*eslint-disable sap-browser-api-warning*/
            setTimeout(function () {
                aceEditor.exitMultiSelectMode();
                var currentSession = aceEditor.getSession();
                currentSession.selection.moveTo(startRow, startColumn);
                currentSession.selection.selectTo(endRow, endColumn);
            }, 500);
        };

        /**
         * helper function to open a new editor and navigate to a given range
         * @param url
         * @param context
         * @param startRow
         * @param startColumn
         * @param endRow
         * @param endColumn
         */
        BaseEditorNavigationHandler.prototype.openAndNavigateToDifferentFile = function (url, context, startRow, startColumn, endRow, endColumn) {
            var loFileService = context.service.filesystem.documentProvider;
            var loEditorService = context.service.editor;
            var loContentService = context.service.content;
            loFileService.getDocument(url).then(function (ioDocument) {
                loEditorService.getDefaultEditor(ioDocument).then(function (oEditor) {
                    loContentService.open(ioDocument, oEditor.service).then(function () {
                        loContentService.getCurrentEditor().then(function (ioCurrentEditor) {
                            ioCurrentEditor.gotoLine(startRow, startColumn, true);
                            //select name token
                            ioCurrentEditor.getUI5Editor().then(function (ed) {
                                var currentSession = ed.getSession();
                                currentSession.selection.moveTo(startRow, startColumn);
                                currentSession.selection.selectTo(endRow, endColumn);
                            });
                        });
                    });
                });
            });
        };

        BaseEditorNavigationHandler.prototype.dispose = function() {
            // remove all listeners
            this.aceEditor.commands.removeCommand(BaseEditorNavigationHandler.navigateCommand);
            this.aceEditor.removeListener("click", this.onClick);
            this.aceEditor.removeListener("mousemove", this.onMouseMove);
            this.aceEditor.container.removeEventListener("keyup", this.onKeyUp);
            this.aceEditor.container.removeEventListener("mousedown", this.onMouseDown);
        };


        BaseEditorNavigationHandler.navigateCommand = "navigateCommand";
        BaseEditorNavigationHandler.prototype.registerKeyboardShortcut = function () {
            var me = this;
            this.aceEditor.commands.addCommand({
                name: BaseEditorNavigationHandler.navigateCommand,
                bindKey: {win: "F3", mac: "F3"},
                exec: function (editor) {
                    var sel = editor.selection.getCursor();
                    /*eslint-disable no-eq-null*/
                    if (sel != null) {
                        me.doNavigate(editor, sel.row, sel.column, sel.column);
                    }
                }
            });
        };

        BaseEditorNavigationHandler.prototype.onClick = function(event,locationData) {
            if (event.editor.$isFocused === false) {
                return;
            }
            //console.log("Click CTRL:" + event.domEvent.ctrlKey  + " CMD:" + event.domEvent.metaKey);
            if ((event.domEvent.ctrlKey === true && BaseEditorNavigationHandler.currentInstance.isMacOS === false) ||
                (event.domEvent.metaKey === true && BaseEditorNavigationHandler.currentInstance.isMacOS === true)) {
                //navigate
                var sess = BaseEditorNavigationHandler.currentInstance.aceEditor.getSession();
                var markers = sess.getMarkers();
                var m = markers[BaseEditorNavigationHandler.currentInstance.lastMarker];
                /*eslint-disable no-eq-null*/
                if (m != null && m.id === BaseEditorNavigationHandler.currentInstance.lastMarker) {
                    BaseEditorNavigationHandler.currentInstance.doNavigate(BaseEditorNavigationHandler.currentInstance.aceEditor, m.range.start.row, m.range.start.column, m.range.end.column);
                    BaseEditorNavigationHandler.currentInstance.removeLastMarker();
                    return;
                }
            }
        };

        BaseEditorNavigationHandler.prototype.onMouseMove = function(event) {
            if (event.editor.$isFocused === false) {
                return;
            }
            //console.log("Mousemove CTRL:" + event.domEvent.ctrlKey  + " CMD:" + event.domEvent.metaKey);
            if ((event.domEvent.ctrlKey === true && BaseEditorNavigationHandler.currentInstance.isMacOS === false) ||
                (event.domEvent.metaKey === true && BaseEditorNavigationHandler.currentInstance.isMacOS === true)) {
                var position = event.getDocumentPosition();
                //access syntax coloring result to identify the word to be underlined
                var sess = BaseEditorNavigationHandler.currentInstance.aceEditor.getSession();
                var lineTokens = sess.bgTokenizer.lines[position.row];
                /*eslint-disable no-eq-null*/
                if (lineTokens != null) {
                    var cols = BaseEditorNavigationHandler.currentInstance.getWordStartEndColumns(lineTokens, position.column);
                    //if (me.lastMarker)
                    //    return;
                    if (cols != null) {
                        var markerDeco = "ace_active-line";
                        BaseEditorNavigationHandler.currentInstance.removeLastMarker();
                        /*eslint-disable sap-browser-api-warning*/
                        if (document.getElementById("editor") == null) { // aha, HANA WebIDE scenario
                            markerDeco = "sapHWISelectionPointer sapHWISelectionUnderline";
                            if (preferences && preferences.sapHWIEditorBackground === "dark" ) {
                                markerDeco = "sapHWISelectionPointer sapHWISelectionUnderlineWhite";
                            }
                            BaseEditorNavigationHandler.currentInstance.lastMarker = sess.addMarker(new BaseEditorNavigationHandler.currentInstance.Range(position.row, cols.startColumn, position.row, cols.endColumn), markerDeco, "text");
                        } else {
                            BaseEditorNavigationHandler.currentInstance.lastMarker = sess.addMarker(new BaseEditorNavigationHandler.currentInstance.Range(position.row, cols.startColumn, position.row, cols.endColumn), markerDeco, "text");
                        }
                    }
                }
            }
        };

        BaseEditorNavigationHandler.prototype.onKeyUp = function(event,locationData) {
            //console.log("Keyup: " + event.keyCode);
            if (event.ctrlKey === false && event.metaKey === false &&
                (event.keyCode === 17 || event.keyCode === 91 || event.keyCode === 93 || event.keyCode === 224)) {
                BaseEditorNavigationHandler.currentInstance.removeLastMarker();
            }
        };

        BaseEditorNavigationHandler.prototype.onMouseDown = function(event) {
            //console.log("MouseDown: " + event.keyCode + " Button " + event.button);
            // Windows
            if (event.button === 2 && event.ctrlKey === true) {
                BaseEditorNavigationHandler.currentInstance.removeLastMarker();
                return;
            }
            // On Mac os occurs in case of context menu with mouse click + CTRL on mac keyboard or
            // button2 without CTRL with mouse
            if (BaseEditorNavigationHandler.currentInstance.isMacOS === true &&
                (event.ctrlKey === true || event.button === 2)) {
                BaseEditorNavigationHandler.currentInstance.removeLastMarker();
            }
        };

        BaseEditorNavigationHandler.prototype.registerEventListeners = function () {
            BaseEditorNavigationHandler.currentInstance = this;
            this.aceEditor.on("click", this.onClick);
            this.aceEditor.on("mousemove", this.onMouseMove);
            this.aceEditor.container.addEventListener("keyup", this.onKeyUp, false);
            this.aceEditor.container.addEventListener("mousedown", this.onMouseDown, false);
        };

        BaseEditorNavigationHandler.prototype.getWordStartEndColumns = function (aceTokens, column) {
            var col = 0;
            for (var i = 0; i < aceTokens.length; i++) {
                var tok = aceTokens[i];
                var end = col + tok.value.length;
                if (this.isAceTokenNavigable(tok) && column >= col && column <= end) { //no navigation support for keywords
                    var deltaSpaces = tok.value.length - Utils.stringTrim(tok.value).length;
                    return {startColumn: col + deltaSpaces, endColumn: end};
                }
                col = end;
            }
        };

        BaseEditorNavigationHandler.prototype.isAceTokenNavigable = function (aceToken) {
            if (aceToken.type === "keyword" || aceToken.type === "comment") {
                return false;
            }
            var v = Utils.stringTrim(aceToken.value);
            if (this.isNumber(v)) {
                return false;
            }
            return true;
        };

        BaseEditorNavigationHandler.prototype.isNumber = function(value) {
            if (parseInt(value, 10) >= 0) {
                return true;
            }
            return false;
        };

        BaseEditorNavigationHandler.prototype.removeLastMarker = function () {
            //remove last marker
            var sess = this.aceEditor.getSession();
            if (this.lastMarker) {
                sess.removeMarker(this.lastMarker);
                this.lastMarker = null;
            }
        };

        return BaseEditorNavigationHandler;
    }
);
