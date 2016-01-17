define([], function () {
    "use strict";
    return {

        execute: function () {
            var that = this;
            return this.context.service.selection.assertNotEmpty().then(function (aSelection) {
                return that.context.service.console.setVisible(true).then(function(){
                    return that.context.service.builder.build(aSelection[0].document);
                });
            });
        },

        isEnabled: function () {
            var that = this;
            return this.context.service.selection.assertNotEmpty().then(function (aSelection) {
                if (!aSelection[0].document.isProject()) {
                    return false;
                }
                return that.context.service.builder.isBuildRequired(aSelection[0].document);
            });
        }

    };

});