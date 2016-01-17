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
        function TestsUnitHanaDdlParserV5MultipleTopLevelDeclarations() {
        }
        TestsUnitHanaDdlParserV5MultipleTopLevelDeclarations.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV5MultipleTopLevelDeclarations.prototype.multipleContexts = function() {
            var tokens = this.parseSource("CONTEXT ctx1 { }; CONTEXT ctx2 { };");
            this.assertNoErrorTokens(tokens);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV5MultipleTopLevelDeclarations.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV5MultipleTopLevelDeclarations;
    }
);