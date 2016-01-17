/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require"],
    function(require) {
        "use strict";
/*
plugin.json:
{
                "parent": "editor.dynamic",
                "command": "analyticprivilegeeditor.undo",
                "prio": 70
            },{
                "parent": "editor.dynamic",
                "command": "analyticprivilegeeditor.redo",
                "prio": 71
            },
*/
        return {
            _undoManager: null,

            execute: function() {
                var that = this;
                this.context.service.selection.getSelection().then(function(selections) {
                    var selection = selections[0];
                    if (selection && selection.document) {

                        var oData = selection.document.editor.getModel().getData();
                        var oUndoManager = oData._undoManager;
                        oUndoManager.undo();
                        that._undoManager = oUndoManager;
                        selection.document.editor.getModel().setData(oData);
                    }
                });


            },

            isAvailable: function() {
                var selectionService = this.context.service.selection;
                return selectionService.assertNotEmpty().then(function(selection) {
                    var document = selection[0].document;
                    if (document === null || document.getType() !== "file") {
                        return false;
                    }
                    var extension = document.getEntity().getFileExtension();
                    return extension === "analyticprivilege";
                });
            },

            isEnabled: function() {
                return true;
                /*
                var that = this;
                if (!this._undoManager) {
                    this.context.service.selection.getSelection().then(function(selections) {
                        var selection = selections[0];
                        if (selection && selection.document) {
                            var oData = selection.document.editor.getModel().getData();
                            var oUndoManager = oData._undoManager;
                            that._undoManager = oUndoManager;
                        }
                    });

                }

                if (this._undoManager) {
                    return this._undoManager.hasUndo();
                } else {
                    return false     ;
                }
                */
            }
        };
    });