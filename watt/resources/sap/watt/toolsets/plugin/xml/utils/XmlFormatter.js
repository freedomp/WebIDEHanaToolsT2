define(["../../../../lib/beautifiers/xml/vkbeautify"], function(vkbeautify) {

    var INDENT_CHARS = "\t";

    var oFormatXML = function FormatXML(){
    };

    oFormatXML.prototype.format = function(sContent, oSettings){
        return vkbeautify.xml(sContent,INDENT_CHARS);
    };

    return oFormatXML;
});

