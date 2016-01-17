RequirePaths.setRequireJsConfigForHanaDdl(2);
// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
    [ "commonddl/commonddlNonUi", "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "./AbstractV3HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"

    ], // dependencies
    function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV3HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {
        var AbstractAnnotationImpl = commonddlNonUi.AbstractAnnotationImpl;
        var CompilationUnitImpl = commonddlNonUi.CompilationUnitImpl;
        var ConstDeclarationImpl = commonddlNonUi.ConstDeclarationImpl;
        var ContextDeclarationImpl = commonddlNonUi.ContextDeclarationImpl;
        var DdlStatementImpl = commonddlNonUi.DdlStatementImpl;
        var ElementDeclarationImpl = commonddlNonUi.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddlNonUi.EntityDeclarationImpl;
        var EnumerationDeclarationImpl = commonddlNonUi.EnumerationDeclarationImpl;
        var EnumerationValueImpl = commonddlNonUi.EnumerationValueImpl;
        var LiteralExpressionImpl = commonddlNonUi.LiteralExpressionImpl;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var ErrorState = rnd.ErrorState;

        function TestsUnitHanaDdlParserV3SetOperators() {
        }
        TestsUnitHanaDdlParserV3SetOperators.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV3SetOperators.prototype.__assertOffsetAndFrom = function(firstSelect, expectedStartTokenIndex, expectedEndTokenIndex, expectedFrom) {
            this.assertStartEndTokenIndex(firstSelect,expectedStartTokenIndex,expectedEndTokenIndex);
            equal(expectedFrom,firstSelect.getFrom().getName());
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.__assertSelectSetLeftRefactored = function(set, firstFrom, secondFrom, thirdFrom) {
            var thirdSelect=set.getRight();
            var innerSelect=set.getLeft();
            var firstSelect=innerSelect.getLeft();
            var secondSelect=innerSelect.getRight();
            equal(firstFrom,firstSelect.getFrom().getName());
            equal(secondFrom,secondSelect.getFrom().getName());
            equal(thirdFrom,thirdSelect.getFrom().getName());
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.__assertSelectSetRighRefactored = function(set, firstFrom, secondFrom, thirdFrom) {
            var firstSelect=set.getLeft();
            var innerSelect=set.getRight();
            var secondSelect=innerSelect.getLeft();
            var thirdSelect=innerSelect.getRight();
            equal(firstFrom,firstSelect.getFrom().getName());
            equal(secondFrom,secondSelect.getFrom().getName());
            equal(thirdFrom,thirdSelect.getFrom().getName());
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.__assertSetOperator = function(set, expectedOperator, expectedAll, expectedDistinct) {
            equal(expectedOperator,set.getOperator().m_lexem);
            if (expectedAll == null) {
                equal(set.getAll()==null,true);
            }else{
                equal(expectedAll,set.getAll().m_lexem);
            }
            if (expectedDistinct == null) {
                equal(set.getDistinct()==null,true);
            }else{
                equal(expectedDistinct,set.getDistinct().m_lexem);
            }
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.selectInsideSingleParanthesisAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS ( SELECT FROM table { field }); ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.selectInsideSingleParanthesisStartEndIndexOnParanthesis = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS ( SELECT FROM table { field }); ");
            var view=compilationUnit.getStatements()[0];
            this.assertStartEndTokenIndex(view.getSelect(),3,10);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.selectInsideDoubledParanthesisAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS (( SELECT FROM table { field })); ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.selectInsideDoubledParanthesisStartEndIndexOnParantheisis = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS (( SELECT FROM table { field })); ");
            var view=compilationUnit.getStatements()[0];
            this.assertStartEndTokenIndex(view.getSelect(),3,12);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } UNION SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithoutParenthesisAndOrderByAtEndAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } UNION SELECT FROM table2 { fiel2} ORDER BY field2 ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithoutParenthesisAndOrderByAtFirstSelectNotAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } ORDER BY field2 UNION SELECT FROM table2 { fiel2}  ; ");
            equal(ErrorState.Erroneous,tokens[12].m_err_state);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWitParenthesisAroundFirstSelectAndOrderByAtFirstSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS ( SELECT FROM table { field } ORDER BY field ) UNION SELECT FROM table2 { fiel2}  ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithParenthesisAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS ( SELECT FROM table { field } UNION ( SELECT FROM table2 { fiel2} ORDER BY field2)) ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithOuterOrderByAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS ( SELECT FROM table { field } UNION SELECT FROM table2 { fiel2} ) ORDER BY field ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithOuterOrderByHasOrderByAtCorrectAstNode = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS ( SELECT FROM table { field } UNION SELECT FROM table2 { fiel2} ) ORDER BY field ; ");
            var view=compilationUnit.getStatements()[0];
            var set=view.getSelectSet();
            equal("field",set.getOrderBy().getEntries()[0].getExpression().getShortDescription());
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionAllSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } UNION ALL SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionDistinctSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } UNION DISTINCT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionAllSelectWithTwoSetsHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } " + "UNIoN ALL SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            var set=view.getSelectSet();
            var firstSelect=set.getLeft();
            var secondSelect=set.getRight();
            equal("table",firstSelect.getFrom().getName());
            equal("table2",secondSelect.getFrom().getName());
            equal("UNIoN",set.getOperator().m_lexem);
            equal(set.getAll()!=null,true);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionAllSelectWithThreeSetsHasLeftRefactoredAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } " + "UNION ALL SELECT FROM table2 { fiel2} " + "UNION ALL SELECT FROM table3 { fiel3}; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSelectSetLeftRefactored(view.getSelectSet(),"table","table2","table3");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionAllSelectWithThreeSetsInParanthesisesHasLeftRefactredAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS ( SELECT FROM table { field } " + "UNION ALL SELECT FROM table2 { fiel2} ) " + "UNION ALL SELECT FROM table3 { fiel3} ;");
            var view=compilationUnit.getStatements()[0];
            this.__assertSelectSetLeftRefactored(view.getSelectSet(),"table","table2","table3");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionAllSelectWithThreeSetsInParanthesisesHasRightRefactredAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } " + "UNION ALL ( SELECT FROM table2 { fiel2}  " + "UNION ALL SELECT FROM table3 { fiel3} );");
            var view=compilationUnit.getStatements()[0];
            var set=view.getSelectSet();
            this.__assertSelectSetRighRefactored(set,"table","table2","table3");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithParenthesisHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("" + "VIEW myView AS ( SELECT FROM table { field } UnION ( SELECT FROM table2 { fiel2} ORDER BY field2) ) ; ");
            var view=compilationUnit.getStatements()[0];
            var set=view.getSelectSet();
            this.assertStartEndTokenIndex(set,3,22);
            equal("UnION",set.getOperator().m_lexem);
            equal(set.getAll()==null,true);
            equal(set.getDistinct()==null,true);
            var firstSelect=set.getLeft();
            this.__assertOffsetAndFrom(firstSelect,4,9,"table");
            var secondSelect=set.getRight();
            this.__assertOffsetAndFrom(secondSelect,11,21,"table2");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.unionSelectWithoutParenthesisMixWithParenthesisHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("" + "VIEW myView AS (( ( SELECT FROM table{field}) UNION ( SELECT FROM table2{field}) UNION  SELECT FROM table3{field}));");
            var view=compilationUnit.getStatements()[0];
            var outerSet=view.getSelectSet();
            this.assertStartEndTokenIndex(outerSet,3,30);
            var innerSet=outerSet.getLeft();
            this.assertStartEndTokenIndex(innerSet,5,21);
            var firstSelect=innerSet.getLeft();
            this.__assertOffsetAndFrom(firstSelect,5,12,"table");
            var secondSelect=innerSet.getRight();
            this.__assertOffsetAndFrom(secondSelect,14,21,"table2");
            var thirdSelect=outerSet.getRight();
            this.__assertOffsetAndFrom(thirdSelect,23,28,"table3");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.intersectSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } INTERSECT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.intersectSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } INTERSECT SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"INTERSECT",null,null);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.intersectDistinctSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } INTERSECT DISTINCT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.intersectDistinctSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } INTERSECT DISTINCT SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"INTERSECT",null,"DISTINCT");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.exceptSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } EXCEPT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.exceptSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } EXCEPT SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"EXCEPT",null,null);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.exceptDistinctSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } EXCEPT DISTINCT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.exceptDistinctSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } EXCEPT DISTINCT SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"EXCEPT",null,"DISTINCT");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.minusSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } MINUS SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.minusSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } MINUS SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"MINUS",null,null);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.minusDistinctSelectAccepted = function() {
            var tokens=this.parseSource("VIEW myView AS SELECT FROM table { field } MINUS DISTINCT SELECT FROM table2 { fiel2} ; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.minusDistinctSelectHasCorrectAst = function() {
            var compilationUnit=this.parseSourceAndGetAst("VIEW myView AS SELECT FROM table { field } MINUS DISTINCT SELECT FROM table2 { fiel2} ; ");
            var view=compilationUnit.getStatements()[0];
            this.__assertSetOperator(view.getSelectSet(),"MINUS",null,"DISTINCT");
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.codeCompletionProposesSetOperators = function() {
            var source="VIEW mView AS SELECT FROM entity{field} ";
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source,1,source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "except"),true);
            equal(rnd.Utils.arrayContains(completions, "intersect"),true);
            equal(rnd.Utils.arrayContains(completions, "minus"),true);
            equal(rnd.Utils.arrayContains(completions, "union"),true);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.codeCompletionAfterUnionProposesDistinctAndAll = function() {
            var source="VIEW mView AS SELECT FROM entity{field} UNION ";
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source,1,source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "all"),true);
            equal(rnd.Utils.arrayContains(completions, "distinct"),true);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.codeCompletionAfterIntersectProposesDistinctButNotAll = function() {
            var source="VIEW mView AS SELECT FROM entity{field} INTERSECT ";
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source,1,source.length + 1);
            equal(rnd.Utils.arrayContains(completions, "all"),false);
            equal(rnd.Utils.arrayContains(completions, "distinct"),true);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.semanticCodeCompletionInFirstSelectProposesElementsFromCorrectDataSource = function() {
            var sourceWithSelections="" + "CONTEXT c{             " + " ENTITY e1{          "+ "     KEY k1 :Integer;   "+ "     };                 "+ "                        "+ "    ENTITY e2{          "+ "     KEY k2 :Integer;   "+ "     };                 "+ "                        "+ "     VIEW v1 AS         "+ "     SELECT FROM e1{    "+ "        k#selection.one#"+ "     }                  "+ "     UNION              "+ "     SELECT FROM e2{    "+ "     k2                 "+ "     }                  "+ "     ;                  "+ "};                      ";
            var source=[""];
            var selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel=selections["one"];
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "k1"),true);
            equal(rnd.Utils.arrayContains(completions, "k2"),false);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.semanticCodeCompletionInSecondtSelectProposesElementsFromCorrectDataSource = function() {
            var sourceWithSelections="" + "CONTEXT c{             " + " ENTITY e1{          "+ "     KEY k1 :Integer;   "+ "     };                 "+ "                        "+ "    ENTITY e2{          "+ "     KEY k2 :Integer;   "+ "     };                 "+ "                        "+ "     VIEW v1 AS         "+ "     SELECT FROM e1{    "+ "        k1              "+ "     }                  "+ "     UNION              "+ "     SELECT FROM e2{    "+ "     k#selection.one#   "+ "     }                  "+ "     ;                  "+ "};                      ";
            var source=[""];
            var selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel=selections["one"];
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "k2"),true);
            equal(rnd.Utils.arrayContains(completions, "k1"),false);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.semanticCodeCompletionInTypeOfProposesElementsFromCorrectDataSource = function() {
            var sourceWithSelections="                  " + "CONTEXT c{                             " + "    view v3 as                         "+ "     select from e1 as hugo             "+ "     {                                  "+ "        k1                              "+ "     }                                  "+ "     union                              "+ "     select from e2 as fritz            "+ "     {                                  "+ "        k2                              "+ "     }                                  "+ " ;                                      "+ "                                        "+ " type t1 : type of v3.#selection.one#  "+ "};                            ";
            var source=[""];
            var selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel=selections["one"];
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "k1"),true);
            equal(rnd.Utils.arrayContains(completions, "k2"),false);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.astForTwoUnionsIncompleteStmt = function() {
            var source="context ctx {                                       " + "define view v1 as select from e1 as ali            " + "mixin {                                            "+ "    target : association to e2 on id = target.id2;  "+ "    target2 : association to e3 on id = target2.id3;"+ "    target3 : association to nested.e4 on id = id;  "+ "} into {                                           "+ " id,                                             "+ "    value,                                          "+ "    target.value2,                                  "+ "    target2.id3,                                    "+ "    target3.id4                                     "+ "} union select from e2 {                           "+ " id,                                             "+ "};                                                 "+ "}";
            var cu=this.getParser().parseAndGetAst3(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source);
            var ctx=cu.getStatements()[0];
            var vd=ctx.getStatements()[0];
            var selects=vd.getSelects();
            equal(2,selects.length);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.astForThreeUnionsIncompleteStmt = function() {
            var source="context ctx {                                       " + "define view v1 as select from e1 as ali            " + " {                                           "+ "  id                                             "+ "} union select from e2 {                           "+ "  id2                                             "+ "} union select from e3 {                            "+ "   id3,"+ "};"+ "}";
            var cu=this.getParser().parseAndGetAst3(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source);
            var ctx=cu.getStatements()[0];
            var vd=ctx.getStatements()[0];
            var selects=vd.getSelects();
            equal(3,selects.length);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.astForThreeUnionsLeftSideIncompleteStmt = function() {
            var source="context ctx {                                       " + "VIEW myView AS SELECT FROM table { field } " + "UNION ALL ( SELECT FROM table2 { fiel2}  "+ "UNION ALL SELECT FROM table3 { fiel3, } ) ; "+ "}";
            var cu=this.getParser().parseAndGetAst3(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source);
            var ctx=cu.getStatements()[0];
            var vd=ctx.getStatements()[0];
            var selects=vd.getSelects();
            equal(3,selects.length);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.cocoForUnionsWithAssociation = function() {
            var sourceWithSelections="VIEW myView AS                                       " + "SELECT FROM en1                                      " + "mixin {                                              "+ "    asso1 : association to ds1 on en1.id = asso1.id; "+ "} into { #selection.one# }                           "+ "UNION                                                "+ "SELECT FROM en2                                      "+ "mixin {                                              "+ "    asso2 : association to ds2 on en2.id = asso2.id; "+ "} into { #selection.two# };                          ";
            var source=[""];
            var selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel=selections["one"];
            var completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "en1"),true);
            equal(rnd.Utils.arrayContains(completions, "asso1"),true);
            equal(!rnd.Utils.arrayContains(completions, "en2"),true);
            equal(!rnd.Utils.arrayContains(completions, "asso2"),true);
            sel=selections["two"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(),source[0],1,sel.getOffset() + 1);
            equal(!rnd.Utils.arrayContains(completions, "en1"),true);
            equal(!rnd.Utils.arrayContains(completions, "asso1"),true);
            equal(rnd.Utils.arrayContains(completions, "en2"),true);
            equal(rnd.Utils.arrayContains(completions, "asso2"),true);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.cocoForUnionsWithOrderBy = function() {
            var sourceWithSelections = "VIEW myView AS                                    "
                    + "SELECT FROM en1 { en1.id1, var1 as alias1}  "
                    + "UNION                                     "
                    + "SELECT FROM en2 { en2.id2, var2 as alias2}  "
                    + "ORDER BY #selection.one#                  ";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                    sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(
                    this.getPadFileResolver(),
                    TestFriendlyHanaRepositoryAccess
                            .TestFriendlyHanaRepositoryAccess1(),
                    source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id1"), true);
            equal(rnd.Utils.arrayContains(completions, "alias1"), true);
            equal(rnd.Utils.arrayContains(completions, "id2"), false);
            equal(rnd.Utils.arrayContains(completions, "alias2"), false);
            equal(rnd.Utils.arrayContains(completions, "var1"), false);
            equal(rnd.Utils.arrayContains(completions, "var2"), false);
            equal(rnd.Utils.arrayContains(completions, "en1"), false);
            equal(rnd.Utils.arrayContains(completions, "en2"), false);
            equal(rnd.Utils.arrayContains(completions, "en1.id1"), false);
            equal(rnd.Utils.arrayContains(completions, "en2.id2"), false);
        };
        TestsUnitHanaDdlParserV3SetOperators.prototype.cocoIncompleteSelectListInSecondSelect = function() {
            var sourceWithSelections = ""
                    + "context union_prob {                                                                   "
                    + "                                                                                       "
                    + "      define entity e1{                                                                "
                    + "                key k1: Integer;                                                       "
                    + "                f1 : String(20);                                                       "
                    + "                assocName1 : association to e2 on e1.k1 = assocName1.k2;               "
                    + "  };                                                                                   "
                    + "  define entity e2{                                                                    "
                    + "                key k2: Integer;                                                       "
                    + "                f2 : String(20);                                                       "
                    + "                assocName2 : association to e1 on e2.k2 = assocName2.k1;               "
                    + "  };                                                                                   "
                    + "  define view view_with_assoc as select from e1                                        "
                    + "  mixin { element assoc1 : association [1 ..* ] to e2 on k1 <= assoc1.k2 ;} into       "
                    + "  {                                                                                    "
                    + "                f1                                                                     "
                    + "                                                                                       "
                    + "  }                                                                                    "
                    + "  union select from e2 as datasource2                                                  "
                    + "  mixin { element assoc2 : association [1 ..* ] to e1 on k2 <= assoc2.k1 ;} into       "
                    + "  {                                                                                    "
                    + "                f1,    #selection.one#                                                                 "
                    + "               /*CoCo does not propose fields and associations here*/                  "
                    + "                                                                                       "
                    + "  };                                                                                   "
                    + "};                                                                                     ";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                    sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(
                    this.getPadFileResolver(),
                    TestFriendlyHanaRepositoryAccess
                            .TestFriendlyHanaRepositoryAccess1(),
                    source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "k2"), true);
            equal(rnd.Utils.arrayContains(completions, "f2"), true);
            equal(rnd.Utils.arrayContains(completions, "assocName2"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc2"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc1"), false);
        };

//      TEST METHODS

        TestsUnitHanaDdlParserV3SetOperators.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    }
);