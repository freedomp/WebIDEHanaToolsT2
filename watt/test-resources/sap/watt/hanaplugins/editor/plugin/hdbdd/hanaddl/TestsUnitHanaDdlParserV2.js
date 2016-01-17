/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "commonddl/commonddlNonUi",
        "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "hanaddl/hanaddlNonUi",
        "./AbstractV2HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"

    ], //dependencies
    function (commonddl, TestUtilEclipseSelectionHandling, rnd, hanaddl, AbstractV2HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {

        var AbstractAnnotationImpl = commonddl.AbstractAnnotationImpl;
        var CompilationUnitImpl = commonddl.CompilationUnitImpl;
        var ConstDeclarationImpl = commonddl.ConstDeclarationImpl;
        var ContextDeclarationImpl = commonddl.ContextDeclarationImpl;
        var DdlStatementImpl = commonddl.DdlStatementImpl;
        var ElementDeclarationImpl = commonddl.ElementDeclarationImpl;
        var EntityDeclarationImpl = commonddl.EntityDeclarationImpl;
        var EnumerationDeclarationImpl = commonddl.EnumerationDeclarationImpl;
        var EnumerationValueImpl = commonddl.EnumerationValueImpl;
        var LiteralExpressionImpl = commonddl.LiteralExpressionImpl;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        var PrimitiveTypeUtil = hanaddl.PrimitiveTypeUtil;
        function TestsUnitHanaDdlParserV2() {
        }
        TestsUnitHanaDdlParserV2.prototype = Object.create(AbstractV2HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV2.prototype.__getAnnotationDefinitions = function() {
            var str = FileUtils.toString(CdsDdlParserResolver.class.getResourceAsStream("annotations.txt"));
            return str;
        };
        TestsUnitHanaDdlParserV2.prototype.constDeclaration = function() {
            var ast = this.parseSourceAndGetAst("namespace ns1; const intConst = 223; const strConst : String(10) = 'aha'; @annotated:ID const annotConst = 3;");
            this.assertNoErrorTokens(ast.getTokenList());
            var stmts = ast.getStatements();
            var intConst = stmts[1];
            equal("intConst",intConst.getName());
            equal(3,intConst.getStartTokenIndex());
            equal(7,intConst.getEndTokenIndex());
            var lit = intConst.getValue();
            equal("223",lit.getToken());
            var strConst = stmts[2];
            equal("strConst",strConst.getName());
            equal(8,strConst.getStartTokenIndex());
            equal(17,strConst.getEndTokenIndex());
            var elem = strConst.getElements()[0];
            equal("",elem.getName());
            equal("String(10)",elem.getTypeId());
            var lit = strConst.getValue();
            equal("'aha'",lit.getToken());
            var annotConst = stmts[3];
            equal("annotConst",annotConst.getName());
            equal(22,annotConst.getStartTokenIndex());
            equal(26,annotConst.getEndTokenIndex());
            var annots = annotConst.getAnnotationList();
            equal(1,annots.length);
        };
        TestsUnitHanaDdlParserV2.prototype.constAsContextComponentDeclaration = function() {
            var ast = this.parseSourceAndGetAst("namespace ns1; context ctx { const const : Integer = 3; };");
            this.assertNoErrorTokens(ast.getTokenList());
            var stmts = ast.getStatements();
            var ctx = stmts[1];
            var cons = ctx.getStatements()[0];
            equal("const",cons.getName());
        };
        TestsUnitHanaDdlParserV2.prototype.attributeEnumValues = function() {
            var source = "namespace n1; context c1 { entity en1 { elem : Integer enum { a=1;b=2;c=3; }; }; };";
            var ast = this.parseSourceAndGetAst(source);
            var tokens = ast.getTokenList();
            this.assertNoErrorTokens(tokens);
            var context = ast.getStatements()[1];
            var entity = context.getStatements()[0];
            var elem = entity.getElements()[0];
            var enumerationDeclaration = elem.getEnumerationDeclaration();
            equal(12,enumerationDeclaration.getStartTokenIndex());
            equal(26,enumerationDeclaration.getEndTokenIndex());
            var enumValues = enumerationDeclaration.getValues();
            equal(3,enumValues.length);
            var first = enumValues[0];
            equal(14,first.getStartTokenIndex());
            equal(17,first.getEndTokenIndex());
            equal("a",first.getSymbol().m_lexem);
            equal("1",first.getLiteral().getToken());
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInConstValue = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2;" + //
                "		const stringConst : String = 'Hallo';" + //
                "		const binaryConst : Binary(3) = #selection.begin.one##selection.end.one# ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "stringConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInConstValue2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "const stringConst : String = 'Hallo'; " + //
                "const binaryConst : Binary(3) = to_binary( s#selection.begin.one##selection.end.one#tringConst ); ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "stringConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInConstValueProposeContext = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = to_binary( n#selection.begin.one##selection.end.one#tringConst ); " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "nested1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1.nested2"),true);
            equal(rnd.Utils.arrayContains(completions, "nullif("),true);
            equal(rnd.Utils.arrayContains(completions, "next_day("),true);
            equal(rnd.Utils.arrayContains(completions, "nchar("),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstLongerPath = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = to_binary( ctx.#selection.begin.one##selection.end.one# ); " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "binaryConst"),true);
            equal(rnd.Utils.arrayContains(completions, "nested1"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstErrorRecovery = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = #selection.begin.one##selection.end.one# " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstErrorRecovery2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = in#selection.begin.one##selection.end.one# " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
            equal(rnd.Utils.arrayContains(completions, "instr("),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstErrorRecovery3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = intConst + in#selection.begin.one##selection.end.one# " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
            equal(rnd.Utils.arrayContains(completions, "instr("),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstErrorRecovery4 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = in#selection.begin.one##selection.end.one#  bla ; ;; ;" + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
            equal(rnd.Utils.arrayContains(completions, "instr("),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInDefaultClauseOfElementDeclaration = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = 4; " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                "   entity en1 { element : Integer default #selection.begin.one##selection.end.one# }; " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "binaryConst"),true);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInDefaultClauseOfElementDeclaration2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = 4; " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                "   entity en1 { element : Integer default #selection.begin.one##selection.end.one#  ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "binaryConst"),true);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstInDefaultClauseOfElementDeclaratio3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                " context ctx { " + //
                "const binaryConst : Binary(3) = 4; " + //
                "const intConst : Integer = 3; " + //
                " context nested1 { " + //
                "   entity en1 { element : Integer default #selection.begin.one##selection.end.one#  " + //
                " context nested2 { " + //
                " }; " + //
                " }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "binaryConst"),true);
            equal(rnd.Utils.arrayContains(completions, "intConst"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstNoEndlessLoop = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context const2 { " + //
                " 	entity en1 { " + //
                " 		eleme : Integer default #selection.begin.one##selection.end.one# " + //
                " 		foo : String(3)         default SUBSTR_BEFORE('foobar', 'bar'); " + //
                " 		hexFoo : Binary(3)      default TO_BINARY('foo'); " + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(completions.length == 0,false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstViewDefinition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context aconst2 { "
                + //
                "   const myconst : Integer = 3; "
                + //
                " 	define view v as select from en1 { eleme + my#selection.begin.one##selection.end.one# } group by eleme + const.binaryConst order by eleme + binaryConst;  "
                + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myconst"),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstViewDefinition2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context aconst2 { "
                + //
                "   const myconst : Integer = 3; "
                + //
                " 	define view v as select from en1 { eleme } group by  eleme - aconst2.m#selection.begin.one##selection.end.one#  order by eleme + binaryConst;  "
                + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myconst"),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstViewDefinition3 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; "
                + //
                "context aconst2 { "
                + //
                "   const myconst : Integer = 3; "
                + //
                " 	define view v as select from en1 { eleme } group by  eleme   order by eleme * aconst2.#selection.begin.one##selection.end.one# ;  "
                + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myconst"),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoInsertAssociationTargetEnsureNoOverlapWithLocalElementName = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context ctx { " + //
                "   entity target {" + //
                "   };"+//
                " 	entity e1 { " + //
                "     target : Integer;" + //
                "     assoc: association to target#selection.begin.one##selection.end.one# " + //
                " };" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            var compl = this.__getCompletionEndsWith(completions, "target");
            equal(compl!=null,true);
            equal("ctx.target",compl);
        };
        TestsUnitHanaDdlParserV2.prototype.__getCompletionEndsWith = function(compls, name) {
            for (var complCount=0;complCount<compls.length;complCount++) {
                var compl=compls[complCount];
                if (rnd.Utils.stringEndsWith(compl, name)) {
                    return compl;
                }
            }
            return null;
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstAssociationOnCondition = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context aconst2 { " + //
                "   const myconst : Integer = 3; " + //
                " 	entity e1 { " + //
                "     assoc: association to e1 on #selection.begin.one##selection.end.one# " + //
                " };" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "assoc"),true);
            equal(rnd.Utils.arrayContains(completions, "myconst"),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoConstAssociationOnCondition2 = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context aconst2 { " + //
                "   const myconst : Integer = 3; " + //
                " 	entity e1 { " + //
                "     assoc: association to e1 on aconst2.#selection.begin.one##selection.end.one# " + //
                " };" + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "e1"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.errorRecoveryEnum = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test4 { " + //
                "	const te : Integer enum { a = 1; dx = 2 } = 3; " + //
                "    enti#selection.begin.one##selection.end.one#   ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal("[entity]",rnd.Utils.arrayToString(completions));
        };
        TestsUnitHanaDdlParserV2.prototype.noSemanticCoCoInEnum = function() {
            var parser = this.getParser();
            var sourceWithSelections = "namespace fu1__2; " + //
                "context test4 { " + //
                "   type ty : Integer; entity en { }; " + //
                "	const te : Integer enum { a = 1; dx = #selection.begin.one##selection.end.one# } = 3; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(completions.length == 0,false);
            equal(rnd.Utils.arrayContains(completions, "en"),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoAnnotationEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "#selection.begin.one##selection.end.one# " + //
                " entity e1 {" + //
                " };" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "@Catalog.index: "),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoAnnotationErrorRecoveryRecordValue = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1; " + //
                " " + //
                "@Annotation: 'SYSTEM' " + //
                "context tm { " + //
                "@Catalog.tableType: #ROW " + //
                "@Catalog.index: [ " + //
                "{name: 'MyIndex', unique: true, order: #DESC, elementNames: ['f1','k1']}, " + //
                "{ order:#ASC, name: 'other', unique:true, elementNames : [ #selection.begin.one##selection.end.one# " + //
                "] " + //
                "entity e1{ " + //
                "key k1 : Integer; " + //
                "f1 : String(20); " + //
                "}; " + //
                " " + //
                "entity e2{ " + //
                "key k1 : type of e1.k1; " + //
                "}; " + //
                " " + //
                "entity e3{ " + //
                "key k1 : type of e1.f1; " + //
                "f2 : t1; " + //
                "}; " + //
                " " + //
                "type t1{ " + //
                "f1 : Integer; " + //
                "f2 : String(3); " + //
                "}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "'f1'"),true);
            equal(rnd.Utils.arrayContains(completions, "'k1'"),true);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoNoBooleanTypeProposalInsideEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "context ctx { entity en1 { key id : Bo#selection.begin.one##selection.end.one# }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, PrimitiveTypeUtil.BOOLEAN),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoNoBooleanTypeProposalInsideType = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "context ctx { type ty1 : Bo#selection.begin.one##selection.end.one#  };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, PrimitiveTypeUtil.BOOLEAN),false);
        };
        TestsUnitHanaDdlParserV2.prototype.cocoNoBooleanTypeProposalInsideStructuralEntity = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "context ctx { type struc1 { id : Bo#selection.begin.one##selection.end.one# }; };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, PrimitiveTypeUtil.BOOLEAN),false);
        };


//TEST METHODS

        TestsUnitHanaDdlParserV2.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();

    }
);