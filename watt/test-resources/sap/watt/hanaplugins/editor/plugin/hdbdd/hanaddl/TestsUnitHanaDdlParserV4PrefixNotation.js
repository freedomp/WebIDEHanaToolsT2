/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//2f860536ff6dbcba201ebb20b8f8a7a1e065f95d CDS: AST for nested select list
RequirePaths.setRequireJsConfigForHanaDdl(2);
define(
    [
        "TestUtilEclipseSelectionHandling",
        "./AbstractV4HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess",
        "rndrt/rnd"
    ], //dependencies
    function (
        TestUtilEclipseSelectionHandling,
        AbstractV4HanaDdlParserTests,
        TestFriendlyHanaRepositoryAccess,
        rnd
        ) {

        function TestsUnitHanaDdlParserV4PrefixNotation() {
        }
        TestsUnitHanaDdlParserV4PrefixNotation.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV4PrefixNotation.prototype.nestedFlattendSelectListWithLongerPathAtBeginningIsInAst = function() {
            var cu = this.parseSourceAndGetAst("VIEW v1 AS SELECT FROM tabl { a.b.c.{d,e} };");
            var view = cu.getStatements()[0];
            var selectListEntries = view.getSelects()[0].getSelectList().getEntries();
            equal(1,selectListEntries.length);
            var exp = selectListEntries[0].getExpression();
            var pathEntry = exp.getPathEntries()[3];
            equal(2,pathEntry.getSelectList().getEntries().length);
            equal(".",pathEntry.getFlattenKeyword().m_lexem);
        };

        // TODO: fails, check if @ignore in Java code
        //TestsUnitHanaDdlParserV4PrefixNotation.prototype.cocoProposesCurlyBraketsAfterDot = function() {
        //    var sourceWithSelections = //
        //        "CONTEXT c {									 " + //
        //        "   VIEW myView AS SELECT FROM entityInTest1a { a.#selection.begin.one##selection.end.one# };" + //
        //        "};";
        //    var source = [""];
        //    var selections = {};
        //    TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
        //    var sel = selections["one"];
        //    var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
        //            sel.getOffset() + 1);
        //    equal(rnd.Utils.arrayContains(completions, "{"),true);
        //};
        TestsUnitHanaDdlParserV4PrefixNotation.prototype.nestedFlattendSelectListInNestedSelectListIsInAst = function() {
            var cu = this.parseSourceAndGetAst(""//
                + "VIEW v1 AS SELECT FROM tabl { "//
                + "  a.b.c.{  "//    <------outer--------|
                + "           d.{  "//    <-inner----|   |
                + "               e,f"//             |   |
                + "             },"//     <----------|   |
                + "           g,"//                      |
                + "           h"//                       |
                + "        }"//      <-------------------|
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

        TestsUnitHanaDdlParserV4PrefixNotation.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsUnitHanaDdlParserV4PrefixNotation;
    }
);