/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(function() {
    return {
        getContent: function(width, height) {
            var that = this;
            return this.context.service.modelingsetting.getSettings().then(function(modelingSetting) {
                return that.context.service.modelingsetting.getContent(that.context, modelingSetting, width);
            });
        },

        setSettings: function() {
            return this.context.service.modelingsetting.setSettings();
        },

        resetSettings: function() {

        }
    };
});
