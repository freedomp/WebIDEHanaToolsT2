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
        function TestsUnitHanaDdlParserV5Series() {
        }
        TestsUnitHanaDdlParserV5Series.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5Series.prototype.periodForSeriesOptional = function() {
            var tokens = this.parseSource(""//
                + "ENTITY e1 { "//
                + "  SERIES ( "//
                + "  ); "//
                + "}");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5Series.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Series;
    }
);