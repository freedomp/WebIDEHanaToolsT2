RequirePaths.setRequireJsConfigForHanaDdl(2);

//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
		[
		 "commonddl/commonddlNonUi",
		 "./TestUtilEclipseSelectionHandling",
		 "EclipseUtil",
		 "./System",
		 "rndrt/rnd",
		 "hanaddl/hanaddlNonUi",
		 "./AbstractV3HanaDdlParserTests",
         "./TestFriendlyHanaRepositoryAccess"

		 ], //dependencies
		 function (
				 commonddlNonUi,
				 TestUtilEclipseSelectionHandling,
				 EclipseUtil,
				 System,
				 rnd,
				 hanaddlNonUi,
				 AbstractV3HanaDdlParserTests,
                 TestFriendlyHanaRepositoryAccess
		 ) {
			var AbstractDdlCodeCompletionProposal = commonddlNonUi.AbstractDdlCodeCompletionProposal;
			var NamedDeclarationImpl = commonddlNonUi.NamedDeclarationImpl;
			var Utils = rnd.Utils;
			var ContextUtil = hanaddlNonUi.ContextUtil;
			var Messages = hanaddlNonUi.Messages;

			function TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements() {
			}
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project=null;
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.setup = function() {
				TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.createProject();
				TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.addUsedFilesToProject();
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.teardown = function() {


			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.createProject = function() {
				TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project=new EclipseUtil().createSimpleProject("" + System.currentTimeMillis());
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.addUsedFilesToProject = function() {
				var util = new EclipseUtil();
				var file1 = "c1.hdbdd";
				var file1Content = ""//
					+ "NAMESPACE dont.care; "//
					+ "CONTEXT c1 { "//
					+ "  CONST MyC : Integer = 27;"//
					+ "  ENTITY e1 { "//
					+ "    KEY     k1     : Integer;"//
					+ "    ELEMENT field1 : Integer; "//
					+ "  }; "//
					+ "  ENTITY e2 { "//
					+ "    KEY     k2     : Integer;"//
					+ "    ELEMENT field2 : Integer;"//
					+ "            to_e1  : ASSOCIATION TO e1 ON to_e1.k1 = e2.k1;"//
					+ "  }; "//
					+ "  VIEW v1 AS SELECT FROM e1 "//
					+ "  MIXIN {"//
					+ "    assocE2 : ASSOCIATION TO e2 ON k1 = e2.k1;"//
					+ "  } INTO { "//
					+ "    e1.f1,"//
					+ "    assocE2"//
					+ "  }; "//
					+ "  VIEW otherV1 AS SELECT FROM e1 "//
					+ "  MIXIN {"//
					+ "    assocE2 : ASSOCIATION TO e2 ON k1 = e2.k1;"//
					+ "  } INTO { "//
					+ "    e1.f1,"//
					+ "    assocE2"//
					+ "  }; "//
					+ "}; ";
				util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project,file1,file1Content);
				var file2 = "extAcp.hdbdd";
				var file2Content = ""//
					+ "NAMESPACE dont.care; "//
					+ "ACCESSPOLICY extAcp { "//
					+ "  DEFINE ASPECT externalAspect AS SELECT FROM someView {"//
					+ "    someView.someField"//
					+ "  } WHERE $user IN someOtherField;"//
					+ ""//
					+ "  DEFINE ROLE extRole1{"//
					+ "    ASPECT extAcp1 AS SELECT FROM someView{ id } WHERE $user IN someField;"//
					+ "  };"//
					+ ""//
					+ "  DEFINE ROLE extRole2{"//
					+ "    ASPECT extAcp1 AS SELECT FROM someView{ id } WHERE $user IN someField;"//
					+ "  };"//
					+ "}; ";
				util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project,file2,file2Content);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.__getCodeCompletions = function(sourceWithSelections) {
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project),
						source[0], 1, sel.getOffset() + 1);
				return completions;
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.__getTypedCodeCompletions = function(sourceWithSelections) {
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = this.getParser().getTypedCodeCompletions5(this.getPadFileResolver(),
						TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.project), source[0], 1, sel.getOffset() + 1);
				return completions;
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.__assertAspectCompletion = function(completions, string, addScopingOperator) {
				var comp = this.get(completions, string);
				equal(comp!=null,true);
				equal(addScopingOperator,comp.getAddScopingOperator());
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.__getFullQualifiedName = function(str,hdc) {
				var ext = hdc.getExternalNameDecl();
				if (ext != null) {
					var fqn = ContextUtil.getFqnWithNamespace(ext);
					return fqn;
				}
				return str;
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.__addFullyQualifiedNames = function(completions) {
				for (var completionCount=0;completionCount<completions.length;completionCount++) {
					var completion=completions[completionCount];
					if (completion instanceof hanaddlNonUi.HanaDdlCodeCompletion) {
						var hanaCompletion = completion;
						var fqn = this.__getFullQualifiedName(completion.getName(), hanaCompletion);
						completion.setName(fqn);
					}
				}
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.entitiesAndViewsAreProposedInAspectFrom = function() {
				var sourceWithSelections = ""//
				+ "NAMESPACE name.space; "//
				+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),true);
				equal(rnd.Utils.arrayContains(completions, "e2"),true);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.EntitiesAndViewsAreProposedInAspectFromWhenContextIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM c1.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),true);
				equal(rnd.Utils.arrayContains(completions, "e2"),true);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1"),false);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.entitiesAndViewsAreProposedInAspectFromWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),false);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.associationsAreProposedInAspectFromWhenEntityNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "to_e1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.syntaxErrorWarningIsNotShownInAspectFromWhenEntityNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2.#selection.one# {"//
					+ "  };"//
					+ "};";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.entitiesAreProposedAsAssociationTargetInAspect = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2"//
					+ "  MIXIN { assoc : ASSOCIATION TO #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),true);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.sourceTargetAndElementsOfThemAreProposedInAssociationOnConditionInAspect = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2"//
					+ "  MIXIN { assoc : ASSOCIATION TO e1 ON #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e2"),true);
				equal(rnd.Utils.arrayContains(completions, "assoc"),true);
				equal(rnd.Utils.arrayContains(completions, "k1"),true);
				equal(rnd.Utils.arrayContains(completions, "k2"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfSourceAreProposedInAssociationOnConditionInAspectWhenSourceNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2"//
					+ "  MIXIN { assoc : ASSOCIATION TO e1 ON e2.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "k2"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementOfTargetAreProposedInAssociationOnConditionInAspectWhenAssociatoinNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM e2"//
					+ "  MIXIN { assoc : ASSOCIATION TO e1 ON assoc.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "k1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedInAspectSelectList = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 "//
					+ "  {"//
					+ "    #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),true);
				equal(rnd.Utils.arrayContains(completions, "MyC"),false);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.constantsAreNotProposedInAspectSelectList = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 "//
					+ "  {"//
					+ "    #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "MyC"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.aspectLocalAssociationsAreProposedInAspectSelectList = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 "//
					+ "  MIXIN { assoc : ASSOCIATION TO e2 ON a=b;} INTO"//
					+ "  {"//
					+ "    #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "assoc"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementOfTargetOfAspectLocalAssociationsAreProposedInAspectSelectList = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 "//
					+ "  MIXIN { assoc : ASSOCIATION TO e2 ON a=b;} INTO"//
					+ "  {"//
					+ "    assoc.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "k2"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedInAspectSelectListWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    f#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedInAspectSelectListWhenEntityNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "v1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.whereDollarUserInProposedAfterAspectSelectList = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "where $user in"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.dollarUserInProposedAfterAspectWhere = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "$user in"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.InProposedAfterAspectWhereDollarUser = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "in"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.whereDollarUserInNotProposedInRole = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "where $user in"),false);
				equal(rnd.Utils.arrayContains(completions, "where"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedAtRightSideOfAspectWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedAtRightSideOfAspectWhereClauseWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "USING dont.care::c1.v1;"//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT aspectName AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN a#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),true);
				equal(rnd.Utils.arrayContains(completions, "f1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.onlyViewsAreProposedAfterSelectOnInRule = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),false);
				equal(rnd.Utils.arrayContains(completions, "e2"),false);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.anlyViewsAreProposedAfterGrantKeywordInRule = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "e1"),false);
				equal(rnd.Utils.arrayContains(completions, "e2"),false);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.anlyViewsAreProposedAfterSelectOnInRuleWhenContextIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "otherV1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.onlyViewsAreProposedAfterSelectOnInRuleWhenContextAndStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "otherV1"),false);
				equal(rnd.Utils.arrayContains(completions, "c1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedAtLeftSideOfRuleWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "v1"),true);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),true);
				equal(rnd.Utils.arrayContains(completions, "aspect"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedAtLeftSideOfRuleWhereClauseWhenEntityNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE v1.#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "c1.v1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.elementsOfEntityAreProposedAtLeftSideOfRuleWhereClauseWhenEntityNameAndStartOfFieldNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE v1.f#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.localAndExternalAspectsAreProposedAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "asp1"),true);
				equal(rnd.Utils.arrayContains(completions, "externalAspect"),true);
				equal(rnd.Utils.arrayContains(completions, "f1"),false);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.nestedAspectsAreProposedAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "  	DEFINE ASPECT nestedAsp1 AS SELECT FROM v1 {"//
					+ "    		v1.f1"//
					+ "  	} WHERE $user IN v1.f1;"//
					+ "                            "//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "nestedAsp1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.nestedAspectsWithSameNameAreProposedWithPrefixAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"// (1)
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "  	DEFINE ASPECT asp1 AS SELECT FROM v1 {"// (2)
					+ "    		v1.f1"//
					+ "  	} WHERE $user IN v1.f1;"//
					+ "                            "//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "asp1"),true);
				equal(rnd.Utils.arrayContains(completions, "acName.asp1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.nestedAspectsWithSameNameInSiblingRoleAreProposedWithPrefixAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//  (1)
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName1{"//
					+ "  	DEFINE ASPECT asp1 AS SELECT FROM v1 {"//  (2)
					+ "    		v1.f1"//
					+ "  	} WHERE $user IN v1.f1;"//
					+ "  };"//
					+ "                         "//
					+ "  DEFINE ROLE roleName2{"//
					+ "  	DEFINE ASPECT asp1 AS SELECT FROM v1 {"//  (3)
					+ "    		v1.f1"//
					+ "  	} WHERE $user IN v1.f1;"//
					+ "                            "//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "asp1"),true);
				equal(rnd.Utils.arrayContains(completions, "acName.roleName1.asp1"),true);
				equal(rnd.Utils.arrayContains(completions, "acName.asp1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.nestedAspectsWithSameNameInSiblingRoleInOtherFIleAreProposedWithPrefixAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "                         "//
					+ "  DEFINE ROLE roleName2{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getTypedCodeCompletions(sourceWithSelections);
				this.__addFullyQualifiedNames(completions);
				this.__assertAspectCompletion(completions,"dont.care::extAcp.extRole1.extAcp1",true);
				this.__assertAspectCompletion(completions,"dont.care::extAcp.extRole2.extAcp1",true);
				this.__assertAspectCompletion(completions,"dont.care::extAcp.externalAspect",true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.localAndExternalAspectsAreProposedIncudingColonAfterKeywordAspectInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT #selection.one#";
				var completions = this.__getTypedCodeCompletions(sourceWithSelections);
				this.__assertAspectCompletion(completions,"asp1",true);
				this.__assertAspectCompletion(completions,"externalAspect",true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.localAndExternalAspectsAreProposedAfterKeywordAspectInWhereClauseWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "  DEFINE ASPECT otherAsp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT a#selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "asp1"),true);
				equal(rnd.Utils.arrayContains(completions, "externalAspect"),false);
				equal(rnd.Utils.arrayContains(completions, "otherAsp1"),false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.localAndExternalAspectsAreProposedWithColonAfterKeywordAspectInWhereClauseWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "  DEFINE ASPECT otherAsp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT a#selection.one#";
				var completions = this.__getTypedCodeCompletions(sourceWithSelections);
				this.__assertAspectCompletion(completions,"asp1",true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.localAndExternalAspectsAreProposedWithoutColonAfterKeywordAspectInWhereClauseWhenStartOfNameIsAlreadyGiven = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "  DEFINE ASPECT otherAsp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT :a#selection.one#";
				var completions = this.__getTypedCodeCompletions(sourceWithSelections);
				this.__assertAspectCompletion(completions,"asp1",false);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.fieldsOfViewAreProposedOnRightSideInWhereClause = function() {
				var sourceWithSelections = ""//
					+ "NAMESPACE name.space; "//
					+ "ACCESSPOLICY acName {"//
					+ "  DEFINE ASPECT asp1 AS SELECT FROM v1 {"//
					+ "    v1.f1"//
					+ "  } WHERE $user IN v1.f1;"//
					+ "                         "//
					+ "  DEFINE ROLE roleName{"//
					+ "    GRANT SELECT ON c1.v1"//
					+ "    WHERE ASPECT asp1 = #selection.one#";
				var completions = this.__getCodeCompletions(sourceWithSelections);
				equal(rnd.Utils.arrayContains(completions, "f1"),true);
				equal(rnd.Utils.arrayContains(completions, "assocE2"),true);
				equal(rnd.Utils.arrayContains(completions, Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg),false);
			};


//			TEST METHODS

			 TestsPdeHanaDdlParserV3SemanticCodeCompletionForDclStatements.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		}
);