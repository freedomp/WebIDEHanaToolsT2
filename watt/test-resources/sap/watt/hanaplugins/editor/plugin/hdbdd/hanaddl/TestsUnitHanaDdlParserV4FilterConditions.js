/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//5af9117da94e3c9db8e54b0324a83ba181d6081d Catch up with backend grammar
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV4HanaDdlParserTests"
    ], //dependencies
    function (
        AbstractV4HanaDdlParserTests
        ) {
        function TestsUnitHanaDdlParserV4FilterConditions() {
        }
        TestsUnitHanaDdlParserV4FilterConditions.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4FilterConditions.prototype.filterConditionInPathAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { a[x=1].b.c };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4FilterConditions.prototype.filterConditionMultipleTimesInPathIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a[x=1].b[y=2].c };");
            var pExpr = this.__getFristSelectListEntryAsPathExpression(cu);
            equal("x=1",pExpr.getEntries()[0].getFilter().getShortDescription());
            equal("y=2",pExpr.getEntries()[1].getFilter().getShortDescription());
        };
        TestsUnitHanaDdlParserV4FilterConditions.prototype.filterConditionMultipleTimesInPathAccepted = function() {
            var tokens = this.parseSource("VIEW v1 AS SELECT FROM tabl { a[x=1].b[y=2].c };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV4FilterConditions.prototype.__getFristSelectListEntryAsPathExpression = function(cu) {
            var view = cu.getStatements()[0];
            var entry = view.getSelect().getSelectList().getEntries()[0];
            var pExpr = entry.getExpression();
            return pExpr;
        };


//TEST METHODS

        TestsUnitHanaDdlParserV4FilterConditions.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4FilterConditions;
    }
);