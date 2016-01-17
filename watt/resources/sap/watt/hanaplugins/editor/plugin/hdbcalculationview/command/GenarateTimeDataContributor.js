/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require"], function(require) {
    "use strict";

    return {

        execute: function() {
            var that = this;
            require(["../dialogs/GenerateTimeDataDialog"], function(GenerateTimeDataDialog) {
                new GenerateTimeDataDialog({
                    context: that.context
                }).openDialog();
                return true;
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
            return true;
        }
    };
});
