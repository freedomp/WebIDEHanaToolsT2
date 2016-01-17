define(["sap/watt/lib/prettydiff/prettydiff"], function (prettydiff) {
    "use strict";

    var Beautifier = function Beautifier(){};

    Beautifier.prototype._oDefaultSettings = {
            mode: "beautify",
            lang: "markup",
            inchar : "\t",
            insize: 1,
            wrap: 140,
            style: "indent",
            html: false,
            force_indent: false
    };

    Beautifier.prototype.beautify = function (sContent, oSettings) {
        //var that = this;
        var mergedSettings = this.getSettings(oSettings);
        mergedSettings.source = sContent;
        var aBeautifiedContent = prettydiff(mergedSettings);
        if (Array.isArray(aBeautifiedContent)) {
            return aBeautifiedContent[0]; //the node that contain the beautified string. aBeautifiedContent[1] contains the full detailed html
        } else {
            this.context.service.log.error("xmlforamtter-prettydiff", "failed to get proper response from beautify utility").done();
            return sContent;    
        }
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
                if (pname == "insize") {
                    options.insize = oSettings[pname];
                } else if (pname == "wrap") {
                    options.wrap = oSettings[pname];
                } else {
                    options[pname] = oSettings[pname];
                }
            }
        }
        return options;
    };

    return new Beautifier();
});