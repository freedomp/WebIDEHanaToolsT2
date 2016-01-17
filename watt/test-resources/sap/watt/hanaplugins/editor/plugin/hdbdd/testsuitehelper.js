function getUrlVars() {

    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}

function RequirePaths() {
}

RequirePaths.calculatePathToHdbdd = function (goUpTimes) {

    // var result = "../../../../resources/editor/plugin/hdbdd";
    var result = "../../../../../../../resources/sap/watt/hanaplugins/editor/plugin/hdbdd";
    var goUp = goUpTimes;

    while (goUp > 0) {
        result = '../' + result;
        goUp--;
    }

    return result;
};

RequirePaths.calculatePathToLib = function (goUpTimes) {

    // var result = "../../../../resources/lib";
    var result = "../../../../../../../resources/sap/watt/hanaplugins/lib";

    var goUp = goUpTimes;

    while (goUp > 0) {
        result = '../' + result;
        goUp--;
    }

    return result;
};

RequirePaths.setRequireJsConfigForHanaDdl = function (depth) {

    var goUp = 1;

    //if (depth && depth > 0 && depth < 265) {
    //    goUp = depth;
    //}

    var hdbddRootPath = RequirePaths.calculatePathToHdbdd(goUp);
    var libRootPath = RequirePaths.calculatePathToLib(goUp);

    var commonddlPath;
    var hdbddPath;
    var hanaddlPath;
    var rndrtPath;

    if (getUrlVars()['build'] == 'opt') {
        var targetPath = hdbddRootPath + "_target";

        commonddlPath = targetPath + "/commonddl";
        hdbddPath = targetPath;
        hanaddlPath = targetPath + "/hanaddl";
        rndrtPath = targetPath + "/rndrt";
    } else {
        commonddlPath = hdbddRootPath + "/commonddl";
        hdbddPath = hdbddRootPath;
        hanaddlPath = hdbddRootPath + "/hanaddl";
        rndrtPath = libRootPath + "/rndrt";
    }

    require.config({
        waitSeconds: 0,
        paths: {
            // Using the OPT version of rnd
            "commonddl": commonddlPath,
            "hanaddl": hanaddlPath,
            "hdbdd": hdbddPath,
            "rndrt": rndrtPath,
            "sap.watt.hana.editor.hdbdd": hdbddRootPath
        }
    });
};

/**
 * 1) set requirejs path for TestUnistHdbddToHdbcds
 * 2) set path to pad
 */
RequirePaths.setRequireJsConfigForHdbddConverter = function (depth) {

    var goUp = 2;

    //if (depth && depth > 0 && depth < 265) {
    //    goUp = depth;
    //}

    var hdbddRootPath = RequirePaths.calculatePathToHdbdd(goUp);
    var libRootPath = RequirePaths.calculatePathToLib(goUp);

    var converttohdbcdsPath = '..';
    var commonddlPath;
    var hdbddPath;
    var hanaddlPath;
    var rndrtPath;

    if (getUrlVars()['build'] == 'opt') {
        var targetPath = hdbddRootPath + "_target";

        commonddlPath = targetPath + "/commonddl";
        hdbddPath = targetPath;
        hanaddlPath = targetPath + "/hanaddl";
        rndrtPath = targetPath + "/rndrt";
    } else {
        commonddlPath = hdbddRootPath + "/commonddl";
        hdbddPath = hdbddRootPath;
        hanaddlPath = hdbddRootPath + "/hanaddl";
        rndrtPath = libRootPath + "/rndrt";
    }

    //export path to pad
    RequirePaths._hanaddlPath = hanaddlPath + '/..';

    //configure requirejs
    require.config({
        waitSeconds: 0,
        paths: {
            "converttohdbcds": converttohdbcdsPath,
            "commonddl": commonddlPath,
            "hanaddl": hanaddlPath,
            "hdbdd": hdbddPath,
            "rndrt": rndrtPath,
            "sap.watt.hana.editor.hdbdd": hdbddRootPath
        }
    });
};


RequirePaths.setRequireJsConfigForCommonCds = function (depth) {

    var goUp = 1;

    //if (depth && depth > 0 && depth < 265) {
    //    goUp = depth;
    //}

    var hdbddRootPath = RequirePaths.calculatePathToHdbdd(goUp);
    var libRootPath = RequirePaths.calculatePathToLib(goUp);

    var commonddlPath;
    var rndrtPath;

    if (getUrlVars()['build'] == 'opt') {
        var targetPath = hdbddRootPath + "_target";

        commonddlPath = targetPath + "/commonddl";
        rndrtPath = targetPath + "/rndrt";
    } else {
        commonddlPath = hdbddRootPath + "/commonddl";
        rndrtPath = libRootPath + "/rndrt";
    }

    require.config({
        waitSeconds: 0,
        paths: {
            // Using the OPT version of rnd
            "commonddl": commonddlPath,
            "rndrt": rndrtPath,
            "sap.watt.hana.editor.hdbdd": hdbddRootPath
        }
    });
};

RequirePaths.setRequireJsConfigForNodeJs = function (thisDirName, goUp) {

    var goUp = 1;

    //if (depth && depth > 0 && depth < 265) {
    //    goUp = depth;
    //}

    var hdbddRootPath = thisDirName + "/" + RequirePaths.calculatePathToHdbdd(goUp);
    var libRootPath = thisDirName + "/" + RequirePaths.calculatePathToLib(goUp);

    var commonddlPath = hdbddRootPath + "/commonddl";
    var hanaddlPath = hdbddRootPath + "/hanaddl";
    var rndrtPath = libRootPath + "/rndrt";

    require.config({
        waitSeconds: 0,
        paths: {
            "commonddl": commonddlPath,
            "hanaddl": hanaddlPath,
            "rndrt": rndrtPath
        }
    });
};

function getRequestInTest(url, acceptHeader, onBeforeSend, onLoaded) {
    /* global document:false */
    if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Node.js jsDom") {
        return require('fs').readFileSync(url, {encoding: 'utf8'});
    }
    var http = null;
    if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
        var axo = "ActiveXObject";
        var xhttp = "Microsoft.XMLHTTP";
        http = new window[axo](xhttp);
    } else {
        var req = "XMLHttpRequest";
        if (typeof window !== "undefined") {
            http = new window[req]();
        } else if (typeof  self !== "undefined") {
            http = new self[req]();
        }
    }
    var openString = "open";
    var getString = "GET";
    var sendString = "send";
    http[openString](getString, url, false);
    /*eslint-disable no-eq-null*/
    if (acceptHeader != null) {
        http.setRequestHeader("Accept", acceptHeader);
    }
    if (onBeforeSend !== undefined) {
        onBeforeSend(http);
    }
    http[sendString](null);
    if (onLoaded !== undefined) {
        onLoaded(http);
    }
    return http.responseText;
}

if (typeof define !== "undefined") {
    // expose as module in a Node.js environment
    define(function () {
        return RequirePaths;
    });
}
