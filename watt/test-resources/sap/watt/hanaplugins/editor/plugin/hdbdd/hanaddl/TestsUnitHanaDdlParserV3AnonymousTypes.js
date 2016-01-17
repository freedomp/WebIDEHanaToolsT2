RequirePaths.setRequireJsConfigForHanaDdl(2);
//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
		[ "commonddl/commonddlNonUi", "TestUtilEclipseSelectionHandling",
		  "rndrt/rnd",
		  "./AbstractV3HanaDdlParserTests"

		  ], // dependencies
		  function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, AbstractV3HanaDdlParserTests) {
			var ErrorState = rnd.ErrorState;
			function TestsUnitHanaDdlParserV3AnonymousTypes() {
			}
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.anonymousTypeInsideEntitySupported = function() {
				var tokens = this.parseSource("" + "entity e1 {" + "  f {"
						+ "     a:Integer;" + "    }; " + "}; ");
				var t = this.__getSecondCurlyBracketToken(tokens);
				equal("{", t.m_lexem);
				equal(ErrorState.Correct, t.m_err_state);
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.__getSecondCurlyBracketToken = function(
					tokens) {
				var i = 0;
				var count = 0;
				while (true) {
					var token = tokens[i];
					if ("{" === token.m_lexem) {
						count++;
						if (count == 2) {
							return token;
						}
					}
					i++;
					if (i >= tokens.length) {
						return null;
					}
				}
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.elementDeclarationWithAnoynmousTypeAccepted = function() {
				var tokens = this.parseSource("" + "entity e1 {" + "  f {"
						+ "     a:Integer;" + "    }; " + "}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.elementDeclarationWithAnoynmousTypeHasCorrectAst = function() {
				var cu = this.parseSourceAndGetAst("" + "entity e1 {" + " f {"
						+ "     a:Integer;" + "    }; " + "}; ");
				var entity = cu.getStatements()[0];
				var attributeDeclaration = entity.getElements()[0];
				var type = attributeDeclaration.getAnonymousType();
				equal("f", attributeDeclaration.getNameToken().m_lexem);
				equal("a", type.getElements()[0].getNameToken().m_lexem);
				equal("Integer", type.getElements()[0].getTypeId());
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.elementDeclarationWithNestedAnoynmousTypeAccepted = function() {
				var tokens = this.parseSource("" + "entity e1 {" + "  f {"
						+ "     a {" + "         aa : Integer;" + "         };"
						+ "      }; " + "}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.elementDeclarationWithNestedAnoynmousTypeHasCorrectAst = function() {
				var cu = this.parseSourceAndGetAst("" + "entity e1 {" + " f {"
						+ "     a {" + "         aa : Integer;" + "         };"
						+ "      }; " + "}; ");
				var entity = cu.getStatements()[0];
				var attributeDeclaration = entity.getElements()[0];
				var type = attributeDeclaration.getAnonymousType();
				var innerType = type.getElements()[0].getAnonymousType();
				equal("aa", innerType.getElements()[0].getNameToken().m_lexem);
				equal("Integer", innerType.getElements()[0].getTypeId());
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.typeDeclarationWithNestedAnoynmousTypeAccepted = function() {
				var tokens = this.parseSource("" + "type t1 {" + "    f {"
						+ "     a {" + "         aa : Integer;" + "         };"
						+ "      }; " + "}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.typeDeclarationWithNestedAnoynmousTypeHasCorrectAst = function() {
				var cu = this.parseSourceAndGetAst("" + "type t1 {" + "   f {"
						+ "     a {" + "         aa : Integer;" + "         };"
						+ "      }; " + "}; ");
				var type = cu.getStatements()[0];
				var f = type.getElements()[0];
				var typeOfF = f.getAnonymousType();
				var a = typeOfF.getElements()[0];
				var typeOfA = a.getAnonymousType();
				var aa = typeOfA.getElements()[0];
				equal("f", f.getNameToken().m_lexem);
				equal("a", a.getNameToken().m_lexem);
				equal("aa", aa.getNameToken().m_lexem);
				equal("Integer", aa.getTypeId());
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.anoynmousTypeWithDefaultValueAccepted = function() {
				var tokens = this.parseSource("" + "entity e1 {" + "  f {"
						+ "     a:Integer DEFAULT 1;" + "      }; " + "}; ");
				this.assertNoErrorTokens(tokens);
			};
			TestsUnitHanaDdlParserV3AnonymousTypes.prototype.anoynmousTypeWithDefaultValueHasDefaultValueInAst = function() {
				var cu = this.parseSourceAndGetAst("" + "entity e1 {" + " f {"
						+ "     a:Integer DEFAULT 1;" + "      }; " + "}; ");
				var entity = cu.getStatements()[0];
				var attributeDeclaration = entity.getElements()[0];
				var type = attributeDeclaration.getAnonymousType();
				equal("1", type.getElements()[0].getDefault()
						.getShortDescription());
			};


//			TEST METHODS

		  	TestsUnitHanaDdlParserV3AnonymousTypes.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		});