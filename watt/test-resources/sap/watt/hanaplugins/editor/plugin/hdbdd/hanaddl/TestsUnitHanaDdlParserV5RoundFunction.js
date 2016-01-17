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
        function TestsUnitHanaDdlParserV5RoundFunction() {
        }
        TestsUnitHanaDdlParserV5RoundFunction.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundSimpleExpressionFunction = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight { round( carrid ) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundWithTwoParameters = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight { round( carrid, b ) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundWithThreeParametersRoundingMode = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight { round( carrid, b, round_half_up ) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundWithThreeParametersStringLiteralWrapper = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM sflight { round( carrid, b, 'string' ) };");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5RoundFunction.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5RoundFunction;
    }
);