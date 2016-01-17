/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests",
        "rndrt/rnd"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests,rnd
        ) {
        function TestsUnitHanaDdlParserV4UsingForNativeTables() {
        }
        TestsUnitHanaDdlParserV4UsingForNativeTables.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4UsingForNativeTables.prototype.usingWithoutColonColonAccepted = function() {
            var tokens = this.parseSource("USING x AS y; TYPE t : String;");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4UsingForNativeTables.prototype.usingWithoutColonColonIsInAst = function() {
            var cu = this.parseSourceAndGetAst("USING x AS y; TYPE t : String;");
            var using = cu.getStatements()[0];
            equal("x",using.getName());
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4UsingForNativeTables.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4UsingForNativeTables;
    }
);