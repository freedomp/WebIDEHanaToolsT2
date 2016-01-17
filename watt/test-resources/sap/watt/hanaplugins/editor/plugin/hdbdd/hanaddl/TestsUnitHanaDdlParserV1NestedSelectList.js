/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//2f860536ff6dbcba201ebb20b8f8a7a1e065f95d CDS: AST for nested select list
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "./AbstractV1HanaDdlParserTests"
    ], //dependencies
    function ( AbstractV1HanaDdlParserTests ) {

        function TestsUnitHanaDdlParserV1NestedSelectList() {
        }

        TestsUnitHanaDdlParserV1NestedSelectList.prototype = Object.create(AbstractV1HanaDdlParserTests.prototype);

        TestsUnitHanaDdlParserV1NestedSelectList.prototype.nestedSelectListWithoutPathAtBeginningIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { {a,b} AS nesteD };");
            var view = cu.getStatements()[0];
            var selectListEntries = view.getSelects()[0].getSelectList().getEntries();
            equal(1,selectListEntries.length);
            var outerSelectListEntry = selectListEntries[0];
            this.assertStartEndTokenIndex(outerSelectListEntry,7,13);
            equal("nesteD",outerSelectListEntry.getAlias());
            var exp = outerSelectListEntry.getExpression();
            var pathEntry = exp.getPathEntries()[0];
            equal(2,pathEntry.getSelectList().getEntries().length);
        };
        TestsUnitHanaDdlParserV1NestedSelectList.prototype.nestedSelectListWithPathAtBeginningIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a{b,c} };");
            var view = cu.getStatements()[0];
            var selectListEntries = view.getSelects()[0].getSelectList().getEntries();
            equal(1,selectListEntries.length);
            var exp = selectListEntries[0].getExpression();
            var pathEntry = exp.getPathEntries()[1];
            equal(2,pathEntry.getSelectList().getEntries().length);
        };
        TestsUnitHanaDdlParserV1NestedSelectList.prototype.nestedSelectListWithLongerPathAtBeginningIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a.b.c{d,e} };");
            var view = cu.getStatements()[0];
            var selectListEntries = view.getSelects()[0].getSelectList().getEntries();
            equal(1,selectListEntries.length);
            var exp = selectListEntries[0].getExpression();
            var pathEntry = exp.getPathEntries()[3];
            equal(2,pathEntry.getSelectList().getEntries().length);
        };
        TestsUnitHanaDdlParserV1NestedSelectList.prototype.nestedSelectListInNestedSelectListIsInAst = function() {
            var cu = this.parseSourceAndGetAst(""//
                + "VIEW v1 AS SELECT FROM tabl { "//
                + "  a.b.c{  "//    <------outer--------|
                + "           d{  "//    <-inner----|   |
                + "               e,f"//            |   |
                + "            },"//     <----------|   |
                + "           g,"//                     |
                + "           h"//                      |
                + "       }"//      <-------------------|
                + "};");
            var view = cu.getStatements()[0];
            var selectListEntries = view.getSelects()[0].getSelectList().getEntries();
            var outerExp = selectListEntries[0].getExpression();
            var outer = outerExp.getPathEntries()[3];
            var nestedExp = outer.getSelectList().getEntries()[0].getExpression();
            var inner = nestedExp.getPathEntries()[1];
            equal(2,inner.getSelectList().getEntries().length);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV1NestedSelectList.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV1NestedSelectList;
    }
);