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

        function TestsUnitHanaDdlParserV3FuncWithNamedParameters() {
        }
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithOneNamedParamBoundWithLiteralAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { convert_currency(param=>'42') };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithOneNamedParamBoundWithWhitespaceAndCommentAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { convert_currency(/*comment*/param =>/*comment*/'42' ) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithOneNamedParamBoundWithLiteralHasCorrectAst = function() {
            var cu=this.parseSourceAndGetAst("VIEW v AS SELECT FROM entity { convert_currency(param=>'42') };");
            var view=cu.getStatements()[0];
            var func=view.getSelect().getSelectList().getEntries()[0].getExpression();
            equal(7,func.getStartTokenIndex());
            equal(12,func.getEndTokenIndex());
            equal("convert_currency",func.getName().m_lexem);
            equal(1,func.getParameters().length);
            var param=func.getParameters()[0];
            this.__assertFuncParam(param,9,11,"param","'42'");
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithOneNamedParamBoundWithIdAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { convert_unit(param=>field) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithOneNamedParamBoundWithIdHasCorrectAst = function() {
            var cu=this.parseSourceAndGetAst("VIEW v AS SELECT FROM entity { convert_unit(param=>field) };");
            var view=cu.getStatements()[0];
            var func=view.getSelect().getSelectList().getEntries()[0].getExpression();
            var param=func.getParameters()[0];
            equal("field",param.getExpression().getShortDescription());
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithMultipleNamedParamsAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { convert_unit(param=>field, param2=>'Lit', param3=>1) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithMultipleNamedParamsHasCorrectAst = function() {
            var cu=this.parseSourceAndGetAst("VIEW v AS SELECT FROM entity { convert_unit(param=>field, param2=>'Lit', param3=>1) };");
            var view=cu.getStatements()[0];
            var func=view.getSelect().getSelectList().getEntries()[0].getExpression();
            equal(3,func.getParameters().length);
            var param1=func.getParameters()[0];
            this.__assertFuncParam(param1,9,11,"param","field");
            var param2=func.getParameters()[1];
            this.__assertFuncParam(param2,13,15,"param2","'Lit'");
            var param3=func.getParameters()[2];
            this.__assertFuncParam(param3,17,19,"param3","1");
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithNamedParamsWithExpressionAsValueAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { convert_unit(param=>3+5) };");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.functionWithNamedParamsWithExpressionAsValueHasCorrectAst = function() {
            var cu=this.parseSourceAndGetAst("VIEW v AS SELECT FROM entity { convert_unit(param=>3+5) };");
            var view=cu.getStatements()[0];
            var func=view.getSelect().getSelectList().getEntries()[0].getExpression();
            equal(1,func.getParameters().length);
            var param1=func.getParameters()[0];
            this.__assertFuncParam(param1,9,13,"param","3+5");
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.unknownFunctionNotAccepted = function() {
            var tokens=this.parseSource("VIEW v AS SELECT FROM entity { func(param=>'42') };");
            equal(ErrorState.Erroneous,tokens[8].m_err_state);
        };
        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.__assertFuncParam = function(param2, startTokenIndex, endTokenIndex, paramName, paramValue) {
            this.assertStartEndTokenIndex(param2,startTokenIndex,endTokenIndex);
            equal(paramName,param2.getName().m_lexem);
            equal(paramValue,param2.getExpression().getShortDescription());
        };


//      TEST METHODS

        TestsUnitHanaDdlParserV3FuncWithNamedParameters.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    }
);