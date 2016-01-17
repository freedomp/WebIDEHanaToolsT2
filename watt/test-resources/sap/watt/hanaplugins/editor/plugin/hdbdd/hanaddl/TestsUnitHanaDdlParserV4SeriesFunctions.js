/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//2f860536ff6dbcba201ebb20b8f8a7a1e065f95d CDS: AST for nested select list
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests",
        "rndrt/rnd"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests,rnd
        ) {
        function TestsUnitHanaDdlParserV4SeriesFunctions() {
        }
        TestsUnitHanaDdlParserV4SeriesFunctions.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4SeriesFunctions.prototype.seriesFunctionSimpleAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { SERIES_ROUND(a+b, 'lit' ) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4SeriesFunctions.prototype.seriesFunctionWithRoundingModeAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { SERIES_ROUND(a+b, 'lit', ROUND_HALF_UP ) };");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4SeriesFunctions.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4SeriesFunctions;
    }
);