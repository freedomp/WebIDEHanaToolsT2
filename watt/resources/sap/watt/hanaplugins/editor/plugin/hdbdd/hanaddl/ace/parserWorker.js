/*eslint-disable no-eq-null,eqeqeq,sap-no-global-variable*/
// what you should know about workers:
// firefox 26 doesn't know global "console" variable. Don't access it in the worker code.

/*global importScripts*/
// ../../../../../../ = sap/watt/
importScripts("../../../../../../lib/requirejs/require.js");

var parser;
var thisHanaDdlNonUi;
var thisRnd;
var thisCommonDdlNonUi;

var hdbddRootPath = "sap/watt/hanaplugins/editor/plugin/hdbdd";
var libRootPath = "sap/watt/hanaplugins/lib";

require.config({
    waitSeconds: 0,
    baseUrl: "../../../../../../../../",
    paths: {
        "commonddl": hdbddRootPath + "/commonddl",
        "hanaddl": hdbddRootPath + "/hanaddl",
        "mode": hdbddRootPath + "/mode",
        "rndrt": libRootPath + "/rndrt",
        "sap.watt.hana.editor.hdbdd": hdbddRootPath
    }
});

require(
    ["rndrt/rnd", "commonddl/commonddlNonUi", "hanaddl/hanaddlNonUi", "hanaddl/hanav5/CdsDdlParserResolver"],
    function (rnd, commonddlNonUi, hanaddlNonUi) {
        var version = hanaddlNonUi.VersionsFactory.versionLast;
        parser = hanaddlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createParser(version);
        thisRnd = rnd;
        thisCommonDdlNonUi = commonddlNonUi;
        thisHanaDdlNonUi = hanaddlNonUi;
    }
);

self.addEventListener("message", function (e) {
    if (e.data && e.data.source != null && e.data.source.length >= 0 && parser != null) {
        var source = e.data.source;
        var padFilePath = e.data.padFilePath;
        var version = thisHanaDdlNonUi.VersionsFactory.versionLast;
        var resolver = thisHanaDdlNonUi.DdlParserFactoryRespectingBackendVersion.eInstance.createResolver(version, padFilePath);
        var tokens = parser.parseSource(resolver, source);
        var tokensByLine = new thisCommonDdlNonUi.DdlSourceColoringCacheHelper().convertTokensToLineCache(tokens);
        self.postMessage(tokensByLine);
    } else {
        self.postMessage("notyetloaded"); //indication for caller that request could not yet be triggered - try it at a later point in time
    }
}, false);
