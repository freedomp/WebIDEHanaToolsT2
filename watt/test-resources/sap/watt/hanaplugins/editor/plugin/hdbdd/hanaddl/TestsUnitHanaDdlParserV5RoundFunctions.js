/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//2f860536ff6dbcba201ebb20b8f8a7a1e065f95d CDS: AST for nested select list
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV5HanaDdlParserTests",
        "rndrt/rnd"
    ], //dependencies
    function (AbstractV5HanaDdlParserTests, rnd) {
        function TestsUnitHanaDdlParserV5RoundFunction() {
        }

        TestsUnitHanaDdlParserV5RoundFunction.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundFunctionSimpleAccepted = function () {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ROUND (a+b) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundFunctionWithArgumentAccepted = function () {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ROUND (a+b, c+d) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundFunctionWithRoundingModeAccepted = function () {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ROUND (a+b, c+d, ROUND_HALF_UP) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundFunctionWithStringAccepted = function () {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ROUND (a+b, b, 'string') };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5RoundFunction.prototype.roundFunctionWithStringNotAccepted = function () {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { ROUND (a+b, b 'string') };");
            var stringLiteral = tokens[14];
            equal(stringLiteral.m_lexem,"'string'");
            equal(stringLiteral.m_err_state,rnd.ErrorState.Erroneous);
        };

//TEST METHODS

        TestsUnitHanaDdlParserV5RoundFunction.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5RoundFunction;
    }
);