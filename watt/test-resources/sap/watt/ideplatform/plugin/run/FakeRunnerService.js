define([],function(){
    "use strict";
    var FakeRunner = {
        createDefaultConfiguration : function(oDocument){
            return {
                filePath : oDocument.fullPath
            };
        }
    };
    return FakeRunner;
});
