/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "commonddl/commonddlNonUi",
        "TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "./AbstractV3HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"
    ], //dependencies
    function (
        commonddlNonUi,
        TestUtilEclipseSelectionHandling,
        rnd,
        AbstractV3HanaDdlParserTests,
        TestFriendlyHanaRepositoryAccess
        ) {
        var AccessPolicyDeclarationImpl = commonddlNonUi.AccessPolicyDeclarationImpl;
        var AspectDeclarationImpl = commonddlNonUi.AspectDeclarationImpl;
        var CompilationUnitImpl = commonddlNonUi.CompilationUnitImpl;
        var RoleDeclarationImpl = commonddlNonUi.RoleDeclarationImpl;
        var RuleDeclarationImpl = commonddlNonUi.RuleDeclarationImpl;
        var ErrorState = rnd.ErrorState;
        var Token = rnd.Token;
        var Utils = rnd.Utils;
        function TestsUnitHanaDdlParserV3Dcl() {
        }
        TestsUnitHanaDdlParserV3Dcl.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
        TestsUnitHanaDdlParserV3Dcl.prototype.policyWithRoleWithRuleSubqueryAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "	DEFINE ROLE roleName{"//
                + "		GRANT name.SELECT;"//
                + "		};"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.policyHasCorrectSourceRange = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName { };");
            this.assertStartEndTokenIndex(this.getFirstAccessPolicy(cu),0,4);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.policyHasCorrectNameInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName { };");
            var acp = this.getFirstAccessPolicy(cu);
            equal("policyName",acp.getName());
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.policyHasAnnotationsInAst = function() {
            var cu = this.parseSourceAndGetAst("@Annot:'value' ACCESSPOLICY policyName { };");
            var acp = this.getFirstAccessPolicy(cu);
            equal(1,acp.getAnnotationList().length);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleHasCorrectSourceRange = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	DEFINE ROLE roleName{ };"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            this.assertStartEndTokenIndex(acp.getStatements()[0],4,8);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleHasAnnotationsInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + " @Annot:'value'"//
                + "	DEFINE ROLE roleName{ };"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            equal(1,role.getAnnotationList().length);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithRuleGrantSelectAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity;"//
                + "		};"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.ruleWithGrantSelectHasCorrectSourceRange = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity;"//
                + "		};"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            var rule = this.__getFirstRule(role);
            this.assertStartEndTokenIndex(rule,6,10);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithGrantSelectHasFromInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity;"//
                + "		};"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            var rule = this.__getFirstRule(role);
            equal("entity",rule.getFrom().getDataSource().getName());
            equal("SELECT",rule.getFrom().getCommandToken().m_lexem);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithGrantSelectInPostFixNotationHasFromInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT entity.SELECT;"//
                + "		};"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            var rule = this.__getFirstRule(role);
            equal("entity",rule.getFrom().getDataSource().getName());
            equal("SELECT",rule.getFrom().getCommandToken().m_lexem);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithGrantSelectRuleWithWhereAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity WHERE a=b;"//
                + "		};"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithGrantSelectRuleHasWhereInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity WHERE a=b;"//
                + "		};"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            var rule = this.__getFirstRule(role);
            equal(rule.getWhere()!=null,true);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithAspectAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field };"//
                + "		};"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithAspectHasAspectInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "	ROLE roleName{"//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field };"//
                + "		};"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var role = this.getFirstRole(acp);
            var aspect = this.__getFirstAspect(role);
            equal("aspectName",aspect.getName());
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.policyWithAspectAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a IN (a,b);"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectWithExpressionWithoutBraketsAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a IN a;"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectInPolicyHasCorrectSourceRange = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a IN a;"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            this.assertStartEndTokenIndex(acp.getStatements()[0],4,19);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectHasSelectInAst = function() {
            var cu = this.parseSourceAndGetAst("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a IN a;"//
                + "};");
            var acp = this.getFirstAccessPolicy(cu);
            var aspect = acp.getStatements()[0];
            equal("entity",aspect.getSelect().getFrom().getName());
            equal("WHERE a IN a",aspect.getSelect().getWhere().getShortDescription());
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectWithExpressionListWithoutBraketsNotAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a IN a,b;"//
                + "};");
            equal(ErrorState.Erroneous,tokens[19].m_err_state);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectWithRangePredicateAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "		DEFINE ASPECT aspectName AS SELECT FROM entity{ field, field } WHERE a BETWEEN 1 AND 2;"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectWithUniontNotAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ "//
                + "		ASPECT aspX AS SELECT FROM Model.employee { gender } WHERE $user IN loginName "//
                + "              UNION SELECT FROM Model.employee { gender } WHERE $user IN loginName;"//
                + "};");
            equal(ErrorState.Erroneous,tokens[18].m_err_state);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.ruleWithAspectWithInExpressionAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ " //
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity WHERE a = ASPECT aspectName;"//
                + " };"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.ruleWithAspectPathInExpressionAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ " //
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity WHERE a = ASPECT aspect.Name;"//
                + " };"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.roleWithAspectPathWithScopedIdInExpressionAccepted = function() {
            var tokens = this.parseSource("ACCESSPOLICY policyName "//
                + "{ " //
                + "	ROLE roleName{"//
                + "		GRANT SELECT ON entity WHERE a = ASPECT :scoped.Name;"//
                + " };"//
                + "};");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.aspectAsInputParamForFunctionIsNotAccepted = function() {
            var tokens = this.parseSource("" //
                + "ACCESSPOLICY policyName {                                "//
                + "                                                         "//
                + "  DEFINE ROLE myRole {                                   "//
                + "	  GRANT SELECT ON ddl.salesOrderView                    "//
                + "	    WHERE addressCountry = sqrt( aspect :aspCountry );  "//
                + "	};"//
                + "};");
            equal(ErrorState.Erroneous,tokens[19].m_err_state);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.__getFirstRule = function(role) {
            return role.getEntries()[0];
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.__getFirstAspect = function(role) {
            var aspect = role.getEntries()[0];
            return aspect;
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.cocoDontProposeKeywordAspectInViewSelectList = function() {
            var sourceWithSelections = //
                "namespace \"system-local\".\"private\".\"melcher\"; " + //
                "context etest1a {									 " + //
                "   VIEW myView AS SELECT FROM entityInTest1a { a#selection.begin.one##selection.end.one# };" + //
                "	entity entityInTest1a {                          " + //
                "		key id : Integer;							 " + //
                "		avalue : String(100);					     " + //
                "	};												 " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "avalue"),true);
            equal(rnd.Utils.arrayContains(completions, "aspect"),false);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.cocoProposeKeywordAspectInAccessPolicy = function() {
            var sourceWithSelections = //
                    "namespace \"system-local\".\"private\".\"melcher\"; " + //
                    "		   accesspolicy accesspolicy											" + //
                    "			{                                                                   " + //
                    "				ROLE roleName{                                                  " + //
                    "					GRANT SELECT ON entity WHERE a =  A#selection.begin.one##selection.end.one# :scoped.Name;      " + //
                    "			 };                                                                 " + //
                    "			};                                                                  "

                ;
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aspect"),true);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.cocoSemanticCompletionInRoleWhereClauseAfterColon = function() {
            var sourceWithSelections = //
                "NAMESPACE d021678;                                                                                   " + //
                "ACCESSPOLICY test_dcl {                                                                              " + //
                " ASPECT aspect1 AS SELECT FROM addressAdHoc                                                          " + //
                "	{                                                                                                 " + //
                "	  addressAdHoc.country                                                                            " + //
                "	}                                                                                                 " + //
                "	WHERE $user IN  myAssoc.loginName;                                                                " + //
                " ROLE role1{                                                                                         " + //
                " 	GRANT SELECT ON salesOrderView                                                                    " + //
                " 	WHERE ASPECT :#selection.begin.one##selection.end.one# aspect1 = salesOrderView.customerCountry;  " + //
                " };                                                                                                  " + //
                "};                                                                                                   ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aspect1"),true);
        };
        TestsUnitHanaDdlParserV3Dcl.prototype.codeCompletionInFrontOfViewProposesDclSpecificAnnotations = function() {
            var parser = this.getParser();
            parser.setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "@#selection.one#  VIEW v AS SELECT FROM table{ field };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "WithStructuredPrivilegeCheck: false"),true);
        };


//			TEST METHODS

        TestsUnitHanaDdlParserV3Dcl.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    }
);