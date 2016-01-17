/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require"], function(require) {
    "use strict";

    return {

        execute: function() {
            var that = this;
            return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                var folderDocument = aSelection[0].document;
                return folderDocument.getFolderContent().then(function(aEntries) {
                    require(["../dialogs/NewCalculationViewDialog"], function(NewCalculationViewDialog) {
                        new NewCalculationViewDialog({
                            folderDocument: aSelection[0].document,
                            entries: aEntries,
                            contextMenu: true,
                            context: that.context
                        }).openDialog();
                        return that.context.service.focus.attachEvent("$dialogClosed", that._dialogClosed, that);
                    });
                });
            });
        },

        _dialogClosed: function() {
            var that = this;
            return that.context.service.focus.setFocus(that.context.service.content).then(function() {
                that.context.service.focus.detachEvent("$dialogClosed", that._dialogClosed, that);
            });
        },

        isAvailable: function() {
            return true;
        },

        isEnabled: function() {
            return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection(this.context.service);
        }
    };
});
