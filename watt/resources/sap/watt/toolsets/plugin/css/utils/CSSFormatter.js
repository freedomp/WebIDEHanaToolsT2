define(["sap/watt/lib/beautifiers/css/beautify-css"], function(cssbeautify) {

    var INDENT_CHARS = "\t";

    var oFormatCSS = function FormatCSS(){
    };

    oFormatCSS.prototype.format = function(sContent, oSettings){
        return cssbeautify.css_beautify(sContent, oSettings);
    };

    return oFormatCSS;
});
