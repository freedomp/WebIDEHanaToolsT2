/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([],function(){
   
    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.sql.Editor");
    
    jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
    //jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ext-searchbox");
    
    var Editor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.sql.Editor", {
       
        _valuehelpArray: null,
    
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
                    type: "string",
                    defaultValue: "ace/mode/sql"
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
                "undoMgrStateChange": {},
                "undoStackChanged": {}
            }
        },
    
        init: function() {
    
            ace.config.set("basePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            ace.config.set("modePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
            //ace.config.set("modePath", jQuery.sap.getModulePath("sap.hana.ide.common.plugin.expressioneditor.editor"));
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
    
        refresh: function() {
            if (this._editor) {
                this._editor.resize(true);
            }
        },
    
        getAceSession: function() {
            if (!this._session) {
                this._session = ace.createEditSession(this.getProperty("value"), this.getProperty("mode"));
            }
            return this._session;
        },
    
        getAceEditor: function() {
            if (!this._editor) {
                this._editor = this._createEditor();
            }
            return this._editor;
        },
    
        open: function(value) {
    
            this._prevUndoState = this._prevRedoState = false;
    
            var editor = this.getAceEditor();
    
            this.setValue(value);
    
            var that = this;
            editor.on("change", function(oEvent) {
                that.fireLiveChange();
            });
            editor.on("focus", function(oEvent) {
                that.fireEditorGotFocus(oEvent);
            });
    
            editor.setOptions({
                enableBasicAutocompletion: false
            });
    
    
        },
    
        undo: function() {
            var oUndoManager = this.getAceSession().getUndoManager();
            oUndoManager.undo();
        },
    
        redo: function() {
            var oUndoManager = this.getAceSession().getUndoManager();
            oUndoManager.redo();
        },
    
        _createEditor: function() {
            var that = this;
            
            var VirtualRenderer = ace.require("ace/virtual_renderer").VirtualRenderer;
            var Editor = ace.require("ace/editor").Editor;
    
            var renderer = new VirtualRenderer(null, this.getProperty("theme"));
            var editor = new Editor(renderer, this.getAceSession());
            editor.setReadOnly(this.getProperty("readOnly"));
            editor.setFontSize(this.getProperty("fontSize"));
            editor.setTheme(this.getProperty("theme"));
    
            editor.container.style.height = "100%";
            editor.container.style.width = this.getProperty("width");
            editor.container.style.margin = "0px";
            
            editor.on("change", function(oEvent) {
                that.fireLiveChange();
            });
            
            editor.commands.removeCommand("undo");
            editor.commands.removeCommand("redo");
            
            editor.commands.addCommand({
                name: "fku1",
                bindKey: {win: "Ctrl-Z", mac: "Command-Z"},
                exec: function(editor) {
                    var oData = that.getModel().getData();
                    var oUndoManager = oData._undoManager;
                    oUndoManager.undo();
                }

            });
            
            editor.commands.addCommand({
                name: "fku2",
                bindKey: {win: "Ctrl-Shift-Z|Ctrl-Y", mac: "Command-Shift-Z|Command-Y"},
                exec: function(editor) {
                    var oData = that.getModel().getData();
                    var oUndoManager = oData._undoManager;
                    oUndoManager.redo();
                }

            });    
            
            this.getAceSession().setUndoManager(this.createUndoManager());
            editor.on("input", function(oEvent) { // triggered by both user input or undo/redo command after Undo Mgr is updated
                var oUndoManager = that.getAceSession().getUndoManager();
                if (oUndoManager.hasUndo() !== that._prevUndoState ||
                    oUndoManager.hasRedo() !== that._prevRedoState) { // avoid excessively updating menu and toolbar
                    that.fireUndoMgrStateChange();
                    that._prevUndoState = oUndoManager.hasUndo();
                    that._prevRedoState = oUndoManager.hasRedo();
                }});

            return editor;
        },
        
        _updateModel: function(){
            var oData = this.getModel().getData();
            var value = this.getAceEditor().getValue();
            oData._apeModel.analyticPrivilege.whereSql = value;
            oData.whereSql = value;
        },
        
        createUndoManager: function(){
            var that = this;
            var customUndoManager = {};
            var oUndoManager = new ace.UndoManager();
           
            customUndoManager.execute = function(options){
                if(!options.merge){
                    that.fireUndoStackChanged();
                }
                oUndoManager.execute(options);
                that._updateModel();
            };
            
            customUndoManager.undo = function(){
                oUndoManager.undo();
                that._updateModel();
            };
            
            customUndoManager.redo = function(){
                oUndoManager.redo();
                that._updateModel();
            };
            
            customUndoManager.hasUndo = function(){
                oUndoManager.hasUndo();
            };
            
            customUndoManager.hasRedo = function(){
                return oUndoManager.hasRedo();
            };
            
            customUndoManager.reset = function(){
                oUndoManager.reset();
                that._updateModel();
            };
            
            customUndoManager.isClean = function(){
                return oUndoManager.isClean();
            };
            
            customUndoManager.markClean = function(){
                oUndoManager.markClean();
            };
            
            
            return customUndoManager;
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
            var domId = this.getId();
            var editorElement = jQuery.sap.domById(domId);
    
            if (editorElement) {
                editorElement.innerHTML = "";
                editorElement.appendChild(this.getAceEditor().container);
    
                if (!this.getHidden()) {
                    editorElement.addEventListener('contextmenu', function(evt) {
                        evt.preventDefault();
                    });
                    this.fireRenderDone();
                }
            }
            var whereSql = this.getModel().getData().whereSql;
            this.getAceEditor().setValue(whereSql);
            
            var that = this;
            //ace editor calls set value event after timeout. workaround to cope with this issue
            setTimeout(function(){
                that.getModel().getData()._listenToUndoStackChangedEvents = true; 
            }, 300); 
            
    
        },
    
        renderer: function(rm, oControl) {
            rm.write("<pre");
            rm.writeControlData(oControl);
            rm.writeClasses();
            rm.addStyle("position", "relative");
            rm.addStyle("font-size", oControl.getFontSize());
            rm.addStyle("width", oControl.getWidth());
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
    
        replaceAll: function(replacement, options) {
            if (this._editor) {
                return this._editor.replaceAll(replacement, options);
            }
            return null;
        },
    
        moveCursorToPosition: function(pos) {
            if (this.selection) {
                this.selection.moveCursorToPosition(pos);
            }
        },
    
        deleteCurrentSelection: function() {
            if (this._editor) {
                this._editor.remove(this._editor.getSelectionRange());
            }
        },
    
        setValueHelpArray: function(array) {
            this._valuehelpArray = array;
        }
    
    });
    
    return Editor;
    
});
