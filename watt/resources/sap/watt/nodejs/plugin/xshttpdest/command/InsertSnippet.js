define([], function() {
	"use strict";

    return {

        execute: function() {
            var loSelectionService = this.context.service.selection;
            var loContentService = this.context.service.content;
            
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return Q(false);
                }
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'xshttpdest') {
                    
                        var modulePath = jQuery.sap.getModulePath("sap.hana.ide.editor.editors.xshttpdest");
                        var snippet = jQuery.sap.syncGetText(modulePath + "/snippet/xshttpdest.basic.txt").data;
                        
                        loContentService.getCurrentEditor().then(function getCurrentEditor(currentEditor) {
                            currentEditor.addString(snippet);
                        });
                } else {
                    return false;
                }
            });
        },

        isAvailable: function() {
            var loSelectionService = this.context.service.selection;
            return loSelectionService.assertNotEmpty().then(function(iaSelection) {
                var loDocument = iaSelection[0].document;
                if (loDocument === null || loDocument.getType() !== "file") {
                    return Q(false);
                }
                var lsFileExtension = loDocument.getEntity().getFileExtension();
                if (lsFileExtension.toLowerCase() === 'xshttpdest') {
                    return true;
                } else {
                    return false;
                }
            });
        },

        isEnabled: function() {
            return true;
        }
    };
});
