/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "rndrt/rnd",
        "./AbstractV5HanaDdlParserTests"
    ], //dependencies
    function (
        rnd,
        AbstractV5HanaDdlParserTests
        ) {
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5FullTextIndex() {
        }

        function getFileContent(path) {
            var http = null;
            if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } else {
                http = new XMLHttpRequest();
            }
            http.open("GET", path, false);
            http.send(null);
            return http.responseText;
        }

        TestsUnitHanaDdlParserV5FullTextIndex.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5FullTextIndex.prototype.fullTextIndex = function() {
            this.assertNoErrorTokens(this.parseSource(getFileContent("FTI.txt")));
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5FullTextIndex.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5FullTextIndex;
    }
);