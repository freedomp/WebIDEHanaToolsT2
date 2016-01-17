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
        var Category = rnd.Category;
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5Distinct() {
        }
        TestsUnitHanaDdlParserV5Distinct.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5Distinct.prototype.selectDistinct = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM ds DISTINCT { element };");
            this.assertNoErrorTokens(tokens);
            var distinct = this.__getToken(tokens, "DISTINCT");
            equal("DISTINCT",distinct.m_lexem);
            equal(Category.CAT_KEYWORD,distinct.m_category);
        };
        TestsUnitHanaDdlParserV5Distinct.prototype.selectAll = function() {
            var tokens = this.parseSource("VIEW v AS SELECT FROM ds ALL { element };");
            this.assertNoErrorTokens(tokens);
            var distinct = this.__getToken(tokens, "ALL");
            equal("ALL",distinct.m_lexem);
            equal(Category.CAT_KEYWORD,distinct.m_category);
        };
        TestsUnitHanaDdlParserV5Distinct.prototype.__getToken = function(tokens,lexem) {
            for (var tokenCount = 0;tokenCount < tokens.length;tokenCount++) {
                var token = tokens[tokenCount];
                if (lexem === token.m_lexem) {
                    return token;
                }
            }
            return null;
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5Distinct.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5Distinct;
    }
);