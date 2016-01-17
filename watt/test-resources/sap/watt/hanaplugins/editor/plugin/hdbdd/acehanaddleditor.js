require.config({
    waitSeconds:0,
    paths: {
        //Using the DEV version of rnd
        "rndrt" : "../rndrt",
        "commonddl" : "../commonddl",
        "hanaddl" : "../hanaddl"

        //Using the REL version of rnd
        //"rndrt" : "_target", //"target/rndrt-0.3.0-SNAPSHOT"
        //"commonddl" : "_target",
        //"hanaddl" : "_target"
    }
});


require(
    [],
    function () {
        /*global ace*/
        ace.require("ace/ext/language_tools");
        var editor = ace.edit("editor");

        editor.setTheme("ace/theme/sap-cumulus");
        ace.require("ace/config").set("modePath", require.toUrl("../mode"))
        editor.session.setMode("ace/mode/hdbdd"); // AceRndTokenizer required by ace rnd mode and has to be loaded first
        /*eslint-disable sap-browser-api-warning*/
        document.getElementById("editor").style.fontSize = "14px";


        // test cross site request - works fine when chrome argument --disable-web-security is used
        //var res = get("https://ldciuia.wdf.sap.corp:44300/sap/bc/adt/programs/programs/ztmmist2");
        //console.log(res);
    }
);