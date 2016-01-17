define(["../ui/NewHdbFileDialog"], function(NewHdbFileDialog) {
    "use strict";

    return {
        execute: function() {
            var that = this;
            return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                return aSelection[0].document.getFolderContent().then(function(aEntries) {
                    return NewHdbFileDialog.openCreateUI(that, 'function', aSelection[0].document, aEntries).then(function() {
                        return that.context.service.focus.attachEvent("$dialogClosed", that._dialogClosed, that);
                    });
                });
            });
        },

        isAvailable: function() {
            var that = this;
            return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                if (aSelection && aSelection[0]) {
                    var oFolderDocument = aSelection[0].document;
                    if (oFolderDocument) {
                        return that.context.service.projectType.getProjectTypes(oFolderDocument).then(function(aProjectTypes) {
                            if (aProjectTypes && aProjectTypes[0]) {
                                return aProjectTypes[0].id && aProjectTypes[0].id === "sap.hdb";
                            }
                            return false;
                        });
                    }
                }
                return false;
            });
        },

        isEnabled: function() {
            return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection(this.context.service);
        },

        _dialogClosed: function() {
            var that = this;
            return Q.delay(100).then(function() {
                return that.context.service.focus.setFocus(that.context.service.content).then(function() {
                    return that.context.service.focus.detachEvent("$dialogClosed", that._dialogClosed, that);
                });
            });
        }
    };
});
