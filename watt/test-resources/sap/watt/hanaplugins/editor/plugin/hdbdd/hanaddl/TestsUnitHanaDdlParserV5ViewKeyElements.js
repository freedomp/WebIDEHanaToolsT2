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
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        function TestsUnitHanaDdlParserV5ViewKeyElements() {
        }
        TestsUnitHanaDdlParserV5ViewKeyElements.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5ViewKeyElements.prototype.keyInViewSelectList = function() {
            var source = "VIEW v AS SELECT FROM sflight { KEY el AS e2 };";
            var tokens = this.parseSource(source);
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV5ViewKeyElements.prototype.noAsInKeyInViewSelectList = function() {
            var source = "VIEW v AS SELECT FROM sflight { KEY el e2 };";
            var tokens = this.parseSource(source);
            var t = getToken(tokens, "e2");
            equal("e2",t.m_lexem);
            equal(ErrorState.Erroneous,t.m_err_state);
        };
        TestsUnitHanaDdlParserV5ViewKeyElements.prototype.missingAliasInKeyViewSelectList = function() {
            var source = "VIEW v AS SELECT FROM sflight { KEY el };";
            var tokens = this.parseSource(source);
            var t = getToken(tokens, "KEY");
            equal("KEY",t.m_lexem);
            equal(ErrorState.Suspicious,t.m_err_state);
        };

        function getToken (tokens,lexem) {
            for (var tCount = 0;tCount < tokens.length;tCount++) {
                var t = tokens[tCount];
                if (lexem === t.m_lexem) {
                    return t;
                }
            }
            return null;
        }


//TEST METHODS

        TestsUnitHanaDdlParserV5ViewKeyElements.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5ViewKeyElements;
    }
);