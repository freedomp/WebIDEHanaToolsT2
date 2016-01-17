RequirePaths.setRequireJsConfigForHanaDdl(2);
//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
		[ "commonddl/commonddlNonUi", "TestUtilEclipseSelectionHandling",
		  "rndrt/rnd",
		  "./AbstractV3HanaDdlParserTests",
          "./TestFriendlyHanaRepositoryAccess"

		  ], // dependencies
		  function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV3HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {
			function TestsUnitHanaDdlParserV3ArrayOf() {
			}
			TestsUnitHanaDdlParserV3ArrayOf.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsUnitHanaDdlParserV3ArrayOf.prototype.arrayOfInsideTypeDeclaration = function() {
				var source = "context ctx { "
					+ "  type ty1 : array of Integer;" + "  type struc {"
					+ "     el : array of Integer;" + "     el2: Integer;"
					+ "  };" + "};";
				var ast = this.parseSourceAndGetAst(source);
				var ctx = ast.getStatements()[0];
				var stmts = ctx.getStatements();
				var td = stmts[0];
				var el = td.getElements()[0];
				equal("ty1", td.getName());
				equal("array", el.getArrayToken().m_lexem);
				equal("of", el.getArrayOfToken().m_lexem);
				td = stmts[1];
				var first = td.getElements()[0];
				equal("el", first.getName());
				equal("array", first.getArrayToken().m_lexem);
				equal("of", first.getArrayOfToken().m_lexem);
				var second = td.getElements()[1];
				equal("el2", second.getName());
				equal(second.getArrayToken() == null, true);
				equal(second.getArrayOfToken() == null, true);
			};
			TestsUnitHanaDdlParserV3ArrayOf.prototype.arrayOfInsideEntityDeclaration = function() {
				var source = "context ctx { " + "  entity en1 {"
				+ "     el : array of Integer;" + "     el2: Integer;"
				+ "  };" + "};";
				var ast = this.parseSourceAndGetAst(source);
				var ctx = ast.getStatements()[0];
				var stmts = ctx.getStatements();
				var ed = stmts[0];
				var first = ed.getElements()[0];
				equal("el", first.getName());
				equal("array", first.getArrayToken().m_lexem);
				equal("of", first.getArrayOfToken().m_lexem);
				var second = ed.getElements()[1];
				equal("el2", second.getName());
				equal(second.getArrayToken() == null, true);
				equal(second.getArrayOfToken() == null, true);
			};
			TestsUnitHanaDdlParserV3ArrayOf.prototype.noCoCoForArrayOf = function() {
				var sourceWithSelections = "context ctx { type ty1 : ar#selection.one#";
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
				equal(rnd.Utils.arrayContains(completions, "array"), false);
				equal(rnd.Utils.arrayContains(completions, "array of"), false);
			};


//			TEST METHODS

			  TestsUnitHanaDdlParserV3ArrayOf.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		});