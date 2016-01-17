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
        function TestsUnitHanaDdlParserV5BooleanPartitionSupport() {
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

        TestsUnitHanaDdlParserV5BooleanPartitionSupport.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5BooleanPartitionSupport.prototype.booleanSupport = function() {
            this.assertNoErrorTokens(this.parseSource(getFileContent("Generation.hdbdd")));
            this.assertNoErrorTokens(this.parseSource(getFileContent("Generation_Series.hdbdd")));
            this.assertNoErrorTokens(this.parseSource(getFileContent("SyntaxErr.hdbdd")));
            this.assertNoErrorTokens(this.parseSource(getFileContent("SyntaxErr_overlap.hdbdd")));
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5BooleanPartitionSupport.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5BooleanPartitionSupport;
    }
);