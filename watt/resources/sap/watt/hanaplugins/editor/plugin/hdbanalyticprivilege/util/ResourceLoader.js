/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.require("jquery.sap.resources");

define(function() {

    var ResourceLoader = function(resourcePath) {
        this._resourcePath = resourcePath;
        var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
        this._oBundle = jQuery.sap.resources({
            url: this._resourcePath + "/i18n/messageBundle.hdbtextbundle",
            locale: sLocale
        });
        return this;
    };

    ResourceLoader.prototype = {

        getText: function(key, params) {
            try {
                            
                if (params !== undefined && params.length !== 0) {
                    return this._oBundle.getText(key, params);
                } else {
                    return this._oBundle.getText(key);
                }

            } catch (e) {
                throw new Error("Error in getting ResourceLoader '" + this._resourcePath + "': " + e);
            }
        },

        getImagePath: function(sImageName) {
            return this._resourcePath + "/images/" + sImageName;
        },

        loadCSS: function(path, aFilenames) {
            if (aFilenames instanceof Array) {
                var url, cssLink;
                if (path.length > 0 && path.substring(path.length - 1) !== "/") {
                    path = path + "/";
                }
                for (var i = 0; i < aFilenames.length; i++) {
                    url = path + aFilenames[i] + ".css";
                    cssLink = $("<link rel='stylesheet' type='text/css' href='" + url + "'>");
                    $("head").append(cssLink);
                }
            }
        }
    };
    return ResourceLoader;
});
