/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require"], function(require) {
    "use strict";

    return {

        execute: function() {
            return this.context.service.selection.assertNotEmpty().then(function(selection) {
                var document = selection[0].document;
                var pane = selection[0].pane;
                if (!document || !pane || document.getType() !== "file") {
                    return;
                }
                var extension = document.getEntity().getFileExtension();
                if (extension !== "calculationview") {
                    return;
                }
                require(["../view/ScriptEditor"], function(ScriptEditor) {
                    if (pane instanceof ScriptEditor) {
                        pane.showHideQuickTool();
                    }
                });
            }).done();
        },

        isAvailable: function() {
            var selectionService = this.context.service.selection;
            return selectionService.assertNotEmpty().then(function(selection) {
                var document = selection[0].document;
                if (!document || document.getType() !== "file") {
                    return false;
                }
                var extension = document.getEntity().getFileExtension();
                return extension === "calculationview";
            });
        },

        isEnabled: function() {
            return true;
        }
    };
});
