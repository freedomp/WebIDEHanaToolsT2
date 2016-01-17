define(["../utils/CSSFormatter"], function (FormatCSS) {
    "use strict";

    var Beautifier = function Beautifier() {
        this.formatCSS = new FormatCSS();
    };

    Beautifier.prototype._oDefaultSettings = {
        "indent_size": 4,
        "indent_char": ' '
    };

    Beautifier.prototype.beautify = function (sContent, oSettings) {
        var that = this;
        var mergedSettings = this.getSettings(oSettings);
        var sFormattedContent = this.formatCSS.format(sContent, mergedSettings);
        return sFormattedContent;
    };

    Beautifier.prototype.getSettings = function (oSettings) {
        if (oSettings) {
            return this._updateSetting(oSettings);
        } else {
            return this._oDefaultSettings;
        }
    };

    Beautifier.prototype._updateSetting = function (oSettings) {
        var options = {};
        for (var pname in oSettings) {
            if (oSettings.hasOwnProperty(pname)) {
                if (pname == "indent_size") {
                    options.indent_size = oSettings[pname];
                } else if (pname == "indent_char") {
                    options.indent_char = oSettings[pname];
                } else {
                    options[pname] = oSettings[pname];
                }
            }
        }
        return options;
    };

    Beautifier._instance = undefined;

    Beautifier.getInstance = function () {
        if (!Beautifier._instance) {
            Beautifier._instance = new Beautifier();
        }
        return Beautifier._instance;
    };

    return Beautifier.getInstance();
});