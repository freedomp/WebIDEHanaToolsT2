/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
var isLocalScenario = true;
try {
    importScripts('/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/lib/require.js');
    if (require===undefined) {
        throw new Error(); //firefox, I love you
    }
}catch(e) {
    //couldn't find require js -> seems to be non-local scenario == HANA WATT
    isLocalScenario = false;
    //TODO: adapt path to your application
    importScripts('/sap/watt/lib/requirejs/require.js');
}

var parser;
var thisRnd;
var thisCommonDdl;

if (isLocalScenario) {

    require.config({
        baseUrl: "/", 
        paths: {
            'rndrt' : '/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/lib',
            'commonddl' : '/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/lib'
        }
    });
    require(
        ["rndrt/rnd", "commonddl/commonddlNonUi", "sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/parser/ParserAPI"],
        function (rnd, commonddl, ParserAPI) {
            parser = new ParserAPI(null, null, null, "TREX");
            thisRnd = rnd;
            thisCommonDdl = commonddl;
        }
    );
}else{
    // HANA WebIDE scenario
    //TODO: adapt path to your application
    require.config({
        baseUrl: "/sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor",
        paths: {
            'rndrt' : 'sap/hana/ide/common/lib/rnd',
            'commonddl' : 'sap/hana/ide/editor/plugin/editors/hdbdd/parser'
        }
    });

    require(
        ["rndrt/rnd", "commonddl/commonddlNonUi", "sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/parser/ParserAPI"],
        function (rnd, commonddl, ParserAPI) {
            parser = new ParserAPI(null, null, null, "TREX");
            thisRnd = rnd;
            thisCommonDdl = commonddl;
        }
    );
}

self.addEventListener('message',function(e) {
    if (e.data && e.data.source!=null && e.data.source.length>=0 && parser!=null) {
        var source = e.data.source;
        var padFilePath = e.data.padFilePath;
        //var tokens = parser.parse(padFilePath,source);
        var tokens = parser.parse(source);
        var tokensByLine = new thisCommonDdl.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
        self.postMessage(tokensByLine);
    }else{
        self.postMessage("notyetloaded"); //indication for caller that request could not yet be triggered - try it at a later point in time
    }
}, false);
