RequirePaths.setRequireJsConfigForHanaDdl(2);
//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests

define(
		[ "commonddl/commonddlNonUi", "TestUtilEclipseSelectionHandling",
		  "rndrt/rnd",
		  "./AbstractV3HanaDdlParserTests"

		  ], // dependencies
		  function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV3HanaDdlParserTests) {

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

			function TestsUnitHanaDdlParserV3CaseExpressions() {
			}
			TestsUnitHanaDdlParserV3CaseExpressions.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseHasCorrectSourceRange = function() {
				var caseExpr=this.__parseAndGetCase("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr,7,15);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseHasCorrectSourceRangeForCase = function() {
				var caseExpr=this.__parseAndGetCase("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr.getCaseExpression(),8,8);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseHasCorrectSourceRangeForWhenThen = function() {
				var caseExpr=this.__parseAndGetCase("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr.getWhenExpressions()[0],9,12);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseHasCorrectSourceRangeForElse = function() {
				var caseExpr=this.__parseAndGetCase("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr.getElseExpression(),14,14);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseHasCorrectAst = function() {
				var caseExpr=this.__parseAndGetCase("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				equal("a",caseExpr.getCaseExpression().getShortDescription());
				this.__assertCaseWhenExpression(caseExpr.getWhenExpressions()[0],"'b'","'c'");
				equal("'d'",caseExpr.getElseExpression().getShortDescription());
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseWithoutElseParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE a WHEN 'b' THEN 'c' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseWithComplexExpressionAfterCaseParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE (a+b) WHEN 'b' THEN 'c' ELSE 'd' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.simpleCaseMultipleWhenParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE (a+b) WHEN 'b' THEN 'c' WHEN 'd' THEN 'e' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' ELSE 'd' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseHasCorrectSourceRange = function() {
				var caseExpr=this.__parseAndGetSearchedCase("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr,7,16);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseHasCorrectSourceRangeForWhenThen = function() {
				var caseExpr=this.__parseAndGetSearchedCase("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr.getWhenExpressions()[0],8,13);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseHasCorrectSourceRangeForElse = function() {
				var caseExpr=this.__parseAndGetSearchedCase("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' ELSE 'd' END}; ");
				this.assertStartEndTokenIndex(caseExpr.getElseExpression(),15,15);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseHasCorrectAst = function() {
				var caseExpr=this.__parseAndGetSearchedCase("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' ELSE 'd' END}; ");
				this.__assertCaseWhenExpression(caseExpr.getWhenExpressions()[0],"a > b","'c'");
				equal("'d'",caseExpr.getElseExpression().getShortDescription());
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseWithoutElseParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseMultipleWhenParsedCorrectly = function() {
				var tokens=this.parseSource("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' WHEN a < b THEN 'e' WHEN a = b THEN 'f' END}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.searchedCaseMultipleWhenHasCorrestAst = function() {
				var caseExpr=this.__parseAndGetSearchedCase("VIEW myView AS SELECT FROM table { CASE WHEN a > b THEN 'c' WHEN a < b THEN 'e' WHEN a = b THEN 'f' END}; ");
				equal(3,caseExpr.getWhenExpressions().length);
				this.__assertCaseWhenExpression(caseExpr.getWhenExpressions()[0],"a > b","'c'");
				this.__assertCaseWhenExpression(caseExpr.getWhenExpressions()[1],"a < b","'e'");
				this.__assertCaseWhenExpression(caseExpr.getWhenExpressions()[2],"a = b","'f'");
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.__parseAndGetCase = function(sourceCode) {
				var cu=this.parseSourceAndGetAst(sourceCode);
				var view=cu.getStatements()[0];
				var caseExpr=view.getSelect().getSelectList().getEntries()[0].getExpression();
				return caseExpr;
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.__parseAndGetSearchedCase = function(sourceCode) {
				var cu=this.parseSourceAndGetAst(sourceCode);
				var view=cu.getStatements()[0];
				var caseExpr=view.getSelect().getSelectList().getEntries()[0].getExpression();
				return caseExpr;
			};
			TestsUnitHanaDdlParserV3CaseExpressions.prototype.__assertCaseWhenExpression = function(caseWhenExpression, whenExpression, thenExpression) {
				equal(whenExpression,caseWhenExpression.getWhenExpression().getShortDescription());
				equal(thenExpression,caseWhenExpression.getThenExpression().getShortDescription());
			};


			// TEST METHODS

			TestsUnitHanaDdlParserV3CaseExpressions.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		}
);
