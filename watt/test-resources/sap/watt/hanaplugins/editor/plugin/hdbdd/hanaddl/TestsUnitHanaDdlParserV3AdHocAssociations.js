// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [ "commonddl/commonddlNonUi", "./TestUtilEclipseSelectionHandling",
        "rndrt/rnd",
        "hanaddl/hanaddlNonUi",
        "./AbstractV3HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"

    ], // dependencies
    function (commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, hanaddlNonUi, AbstractV3HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {
        var HanaDdlCodeCompletion = hanaddlNonUi.HanaDdlCodeCompletion;
        function TestsUnitHanaDdlParserV3AdHocAssociations() {
        }
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);

        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.simpleAdHocAssocParsedCorrectly = function () {
            var tokens = this
                .parseSource("VIEW myView AS SELECT FROM table MIXIN { target : ASSOCIATION TO target ON a=b; } INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.simpleAdHocAssocHasCorrectAst = function () {
            var ast = this
                .parseSourceAndGetAst("VIEW myView AS SELECT FROM table MIXIN { target : ASSOCIATION TO target ON a=b; } INTO { field }; ");
            var view = ast.getStatements()[0];
            var associationDeclaration = view.getSelect().getAssociations()[0];
            equal("target", associationDeclaration.getName());
            equal("target", associationDeclaration.getTargetEntityName());
            equal("a=b", associationDeclaration.getOnExpression()
                .getShortDescription());
            equal(10, associationDeclaration.getStartTokenIndex());
            equal(17, associationDeclaration.getEndTokenIndex());
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.simpleAdHocAssocWithPathAsNameParsedCorrectly = function () {
            var tokens = this
                .parseSource("VIEW myView AS SELECT FROM table MIXIN { target : ASSOCIATION TO contex.otherContext.target ON a=b;} INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.simpleAdHocAssocWithPathAsNameHasCorrectAst = function () {
            var ast = this
                .parseSourceAndGetAst("VIEW myView AS SELECT FROM table MIXIN { target : ASSOCIATION TO contex.otherContext.target ON a=b;} INTO { field }; ");
            var view = ast.getStatements()[0];
            var associationDeclaration = view.getSelect().getAssociations()[0];
            equal("target", associationDeclaration.getName());
            equal("contex.otherContext.target", associationDeclaration
                .getTargetEntityName());
            equal(10, associationDeclaration.getStartTokenIndex());
            equal(21, associationDeclaration.getEndTokenIndex());
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.adHocAssocWithAsParsedCorrectly = function () {
            var tokens = this
                .parseSource("VIEW myView AS SELECT FROM table MIXIN { assocName : ASSOCIATION TO target ON a=b;} INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.adHocAssocWithAsHasCorrectAst = function () {
            var ast = this
                .parseSourceAndGetAst("VIEW myView AS SELECT FROM table MIXIN { assocName : ASSOCIATION TO target ON a=b;} INTO { field }; ");
            var view = ast.getStatements()[0];
            var associationDeclaration = view.getSelect().getAssociations()[0];
            equal("target", associationDeclaration.getTargetEntityName());
            equal("assocName", associationDeclaration.getName());
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.multipleAdHocAssocsParsedCorrectly = function () {
            var tokens = this
                .parseSource("VIEW myView AS SELECT FROM table MIXIN { assocName : ASSOCIATION TO target ON a=b;  assocName2 : ASSOCIATION TO target2 ON a=b;} INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.multipleAdHocAssocsHasCorrectAst = function () {
            var ast = this
                .parseSourceAndGetAst("VIEW myView AS SELECT FROM table MIXIN { assocName : ASSOCIATION TO target ON a=b;  assocName2 : ASSOCIATION TO target2 ON a=b;} INTO { field }; ");
            var view = ast.getStatements()[0];
            var assocs = view.getSelect().getAssociations();
            equal(2, assocs.length);
            equal("assocName2", assocs[1].getName());
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.adHocAssocWithCardinalityParsedCorrectly = function () {
            var tokens = this
                .parseSource("VIEW myView AS SELECT FROM table MIXIN { assoc:ASSOCIATION[0..1] TO target ON a=b; } INTO { field }; ");
            this.assertNoErrorTokens(tokens);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.adHocAssocWithCardinalityHasCorrectAst = function () {
            var ast = this
                .parseSourceAndGetAst("VIEW myView AS SELECT FROM table MIXIN { assoc:ASSOCIATION[0..1] TO target ON a=b; } INTO { field }; ");
            var view = ast.getStatements()[0];
            var associationDeclaration = view.getSelect().getAssociations()[0];
            equal("0..1", associationDeclaration.getCardinalities());
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocTarget = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context etest1a {                                    "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO e#selection.begin.one##selection.end.one# ON a=b; } INTO { value };"
                + "   entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "entityInTest1a"),
                true);
            equal(rnd.Utils.arrayContains(completions, "etest1a"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocTargetErrorRecovery = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO #selection.begin.one##selection.end.one# "
                + " entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "entityInTest1a"),
                true);
            equal(rnd.Utils.arrayContains(completions, "test1a"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnClauseErrorRecovery = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON #selection.begin.one##selection.end.one# "
                + "  entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnRightSideClauseErrorRecovery = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON id = #selection.begin.one##selection.end.one# "
                + " entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocAsLastStmtOnRightSideClauseErrorRecovery = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON id = #selection.begin.one##selection.end.one# "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnAssocElementClauseErrorRecovery = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON id = target.#selection.begin.one##selection.end.one# "
                + "  entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id2"), true);
            equal(rnd.Utils.arrayContains(completions, "v2"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnIncompleteStmt = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON #selection.begin.one##selection.end.one# } into { id as i1 }; "
                + " entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
            equal(rnd.Utils.arrayContains(completions, "entityInTest1a"),
                true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnIncompleteStmt2 = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON target.id2 = #selection.begin.one##selection.end.one# ; } into { id as i1 }; "
                + "  entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "entityInTest1a"),
                true);
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "id2"), true);
            equal(rnd.Utils.arrayContains(completions, "v2"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnIncompleteStmtWithAlias = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a as ali MIXIN { target : ASSOCIATION TO entity2 ON target.id2 = #selection.begin.one##selection.end.one# ; } into { id as i1 }; "
                + "   entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "ali"), true);
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "id2"), true);
            equal(rnd.Utils.arrayContains(completions, "v2"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocOnLongerPath = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\"; "
                + "context test1a {                                     "
                + "   VIEW myView AS SELECT FROM entityInTest1a MIXIN { target : ASSOCIATION TO entity2 ON target.id2 = target.asso.#selection.begin.one##selection.end.one# ; } into { id as i1 }; "
                + "  entity entityInTest1a {                          "
                + "       key id : Integer;                            "
                + "       value : String(100);                         "
                + "   };                                               "
                + "   entity entity2 { key id2:Integer;v2:Integer;asso:association to entityInTest1a;};   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssociationDefinitionInOnIncomplete = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\";   "
                + "context test1a {                                       "
                + "entity entityInTest1a {                             "
                + "    key id : Integer;                                   "
                + "    value : String(100);                                "
                + "};                                                      "
                + "entity entityNumber2 {                                  "
                + "  key elem1 : Integer;                                  "
                + "    myAssoc: association[1] to entityInTest1a           "
                + "      on  entityNumber2.elem1 = myAssoc.id;             "
                + "};                                                      "
                + "entity enti2InTest1 {                                   "
                + "    key id : Integer;                                   "
                + "};                                                      "
                + "VIEW myView AS SELECT FROM entityInTest1a               "
                + "    MIXIN { target : ASSOCIATION TO  entityInTest1a ON  #selection.begin.one##selection.end.one#"
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
            equal(rnd.Utils.arrayContains(completions, "target"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoUseAdHocAssociationInsideSelectList = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\";   "
                + "context test1a {                                       "
                + "entity entityInTest1a {                             "
                + "    key id : Integer;                                   "
                + "    value : String(100);                                "
                + "};                                                      "
                + "entity entityNumber2 {                                  "
                + "  key elem1 : Integer;                                  "
                + "    myAssoc: association[1] to entityInTest1a           "
                + "      on  entityNumber2.elem1 = myAssoc.id;             "
                + "};                                                      "
                + "entity enti2InTest1 {                                   "
                + "    key id : Integer;                                   "
                + "};                                                      "
                + "VIEW myView AS SELECT FROM entityInTest1a               "
                + "    MIXIN { target : ASSOCIATION TO  entityInTest1a ON  "
                + "id = id; } into { target.#selection.begin.one##selection.end.one#"
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoUseAdHocProposeAssociationInsideSelectList = function () {
            var sourceWithSelections = "namespace \"system-local\".\"private\".\"melcher\";   "
                + "context test1a {                                       "
                + "entity entityInTest1a {                             "
                + "    key id : Integer;                                   "
                + "    value : String(100);                                "
                + "};                                                      "
                + "entity entityNumber2 {                                  "
                + "  key elem1 : Integer;                                  "
                + "    myAssoc: association[1] to entityInTest1a           "
                + "      on  entityNumber2.elem1 = myAssoc.id;             "
                + "};                                                      "
                + "entity enti2InTest1 {                                   "
                + "    key id : Integer;                                   "
                + "};                                                      "
                + "VIEW myView AS SELECT FROM entityInTest1a               "
                + "    MIXIN { target : ASSOCIATION TO  entityInTest1a ON  "
                + "id = id; } into { #selection.begin.one##selection.end.one#"
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
            equal(rnd.Utils.arrayContains(completions, "target"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoFollowLongerAdHocAssociationPathInSelectList = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN { target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = target.value; }                 "
                + "     into { elem1 as fritz , target.assoToN2.myAssoc.#selection.begin.one##selection.end.one#       "
                + "      };                                                                                            ";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "value"), true);
            equal(rnd.Utils.arrayContains(completions, "assoToN2"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdhocAssociationInSelectListNotProposedForLongerPath = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN { target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = target.value; }                 "
                + "     into { elem1 as fritz , ali.#selection.begin.one##selection.end.one#       "
                + "      };                                                                                            ";
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
            equal(rnd.Utils.arrayContains(completions, "target"), false);
            equal(rnd.Utils.arrayContains(completions, "elem1"), true);
            equal(rnd.Utils.arrayContains(completions, "myAssoc"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.multipleAssocsProposeOnlyCurrentAssocInOnCondition = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN {                                                                                        "
                + "        target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = target.value;                        "
                + "        target2: ASSOCIATION TO  entityInTest1a ON #selection.begin.one##selection.end.one#ali.elem1 = target2.value;                       "
                + "}                                                                                                   "
                + "     into { elem1 as fritz , ali.                           "
                + "      };                                                                                            ";
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
            equal(rnd.Utils.arrayContains(completions, "target"), false);
            equal(rnd.Utils.arrayContains(completions, "target2"), true);
            equal(rnd.Utils.arrayContains(completions, "elem1"), true);
            equal(rnd.Utils.arrayContains(completions, "myAssoc"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.multipleAssocsProposeAllAssocsInSelectList = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN {                                                                                        "
                + "        target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = target.value;                        "
                + "        target2: ASSOCIATION TO  entityInTest1a ON ali.elem1 = target2.value;                       "
                + "}                                                                                                   "
                + "     into { elem1 as fritz , #selection.begin.one##selection.end.one#                           "
                + "      };                                                                                            ";
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
            equal(rnd.Utils.arrayContains(completions, "target"), true);
            equal(rnd.Utils.arrayContains(completions, "target2"), true);
            equal(rnd.Utils.arrayContains(completions, "elem1"), true);
            equal(rnd.Utils.arrayContains(completions, "myAssoc"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocProposeElementsOfTargetInSelectList = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN {                                                                                        "
                + "        target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = target.value;                        "
                + "}                                                                                                   "
                + "     into { elem1 as fritz , #selection.begin.one##selection.end.one#                           "
                + "      };                                                                                            ";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var typedCompletions = this.getParser()
                .getTypedCodeCompletions5(
                this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess
                    .TestFriendlyHanaRepositoryAccess1(),
                source[0], 1, sel.getOffset() + 1);
            var numberOfFoundElements = 0;
            for (var typedCompletionCount = 0; typedCompletionCount < typedCompletions.length; typedCompletionCount++) {
                var typedCompletion = typedCompletions[typedCompletionCount];
                if (typedCompletion.getName() === "value") {
                    numberOfFoundElements++;
                    if (typedCompletion instanceof HanaDdlCodeCompletion) {
                        var additionalDisplayString = (typedCompletion)
                            .getAdditionalDisplayString();
                        equal("entityInTest1a as target",
                            additionalDisplayString);
                        var replacementString = (typedCompletion)
                            .getReplacementString();
                        equal("target.value", replacementString);
                    }
                }
                if (typedCompletion.getName() === "assoToN2") {
                    numberOfFoundElements++;
                    if (typedCompletion instanceof HanaDdlCodeCompletion) {
                        var additionalDisplayString = (typedCompletion)
                            .getAdditionalDisplayString();
                        equal("entityInTest1a as target",
                            additionalDisplayString);
                        var replacementString = (typedCompletion)
                            .getReplacementString();
                        equal("target.assoToN2", replacementString);
                    }
                }
            }
            equal(2, numberOfFoundElements);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocProposeElementsOfTargetInOnCondition = function () {
            var sourceWithSelections = "context test1 { "
                + " entity entityInTest1a {                                                                         "
                + "       key id : Integer;                                                                           "
                + "        value : String(100);                                                                        "
                + "        assoToN2 : association to entityNumber2;                                                    "
                + "    };                                                                                              "
                + "    entity entityNumber2 {                                                                          "
                + "        key elem1 : Integer;                                                                        "
                + "        myAssoc: association[1] to entityInTest1a                                                   "
                + "            on  entityNumber2.elem1 = entityNumber2.elem1 ;                                         "
                + "};                                                                                              "
                + "    entity enti2InTest1 {                                                                           "
                + "        key id : Integer;                                                                           "
                + "    };                                                                                              "
                + "     VIEW myView AS SELECT FROM entityNumber2 as ali                                                "
                + "     MIXIN {                                                                                        "
                + "        target : ASSOCIATION TO  entityInTest1a ON ali.elem1 = #selection.begin.one##selection.end.one#;    "
                + "}                                                                                                   "
                + "     into { elem1 as fritz                                                                          "
                + "      };                                                                                            ";
            var source = [ "" ];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                sourceWithSelections, source, selections);
            var sel = selections["one"];
            var typedCompletions = this.getParser()
                .getTypedCodeCompletions5(
                this.getPadFileResolver(),
                TestFriendlyHanaRepositoryAccess
                    .TestFriendlyHanaRepositoryAccess1(),
                source[0], 1, sel.getOffset() + 1);
            var numberOfFoundElements = 0;
            for (var typedCompletionCount = 0; typedCompletionCount < typedCompletions.length; typedCompletionCount++) {
                var typedCompletion = typedCompletions[typedCompletionCount];
                if (typedCompletion.getName() === "value") {
                    numberOfFoundElements++;
                    if (typedCompletion instanceof HanaDdlCodeCompletion) {
                        var additionalDisplayString = (typedCompletion)
                            .getAdditionalDisplayString();
                        equal("entityInTest1a as target",
                            additionalDisplayString);
                        var replacementString = (typedCompletion)
                            .getReplacementString();
                        equal("target.value", replacementString);
                    }
                }
                if (typedCompletion.getName() === "assoToN2") {
                    numberOfFoundElements++;
                    if (typedCompletion instanceof HanaDdlCodeCompletion) {
                        var additionalDisplayString = (typedCompletion)
                            .getAdditionalDisplayString();
                        equal("entityInTest1a as target",
                            additionalDisplayString);
                        var replacementString = (typedCompletion)
                            .getReplacementString();
                        equal("target.assoToN2", replacementString);
                    }
                }
            }
            equal(1, numberOfFoundElements);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAdHocAssocProposeElementsOfTargetInOnConditionOfUnion = function () {
            var sourceWithSelections = "context test1 { " + " entity entityInTest1 {                                                                          " + "       key id1 : Integer;                                                                          " + "        value1 : String(100);                                                                       " + "        assoc1 : association to entityInTest2 on entityInTest1.id1 = assoc1.id2;                    " + "    };                                                                                              " + "    entity entityInTest2 {                                                                          " + "        key id2 : Integer;                                                                          " + "        value2: String(100);                                                                        " + "        assoc2: association to entityInTest1 on entityInTest2.id2 = assoc2.id1;                     " + "    };                                                                                              " + "     VIEW myView AS SELECT FROM entityInTest1                                                       " + "     MIXIN {                                                                                        " + "        target1 : ASSOCIATION TO entityInTest2 ON id1 = target1.id2;                                " + "     }                                                                                              " + "     into { value1                                                                                  " + "     }                                                                                              " + "    UNION select from entityInTest2 as ds2                                                          " + "     MIXIN {                                                                                        " + "        target2 : ASSOCIATION TO entityInTest1 ON id2 = target2.#selection.begin.one##selection.end.one#;   " + "     }                                                                                              " + "     into { value2                                                                                  " + "      };                                                                                        ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id1"), true);
            equal(rnd.Utils.arrayContains(completions, "value1"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoAccessAssociationViaSelectionEntry = function () {
            var sourceWithSelections = "context testa {                               "
                + "  entity entity_name {                         "
                + "  key id : Integer;                            "
                + "    assoc1: association[1] to entity_name       "
                + "      on id = assoc1.id;                        "
                + "    assoc2: association[1] to entity_name       "
                + "      on id = assoc2.id;                        "
                + "};                                              "
                + "  view view_name as select from entity_name     "
                + "mixin {                                     "
                + "  assoc3: association[1] to entity_name     "
                + "    on entity_name.id = assoc3.#selection.begin.one##selection.end.one#  ;              "
                + "}                                               "
                + "into {                                          "
                + "  assoc3                                        "
                + "};                                              "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "id"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc1"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc2"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc3"), false);
            equal(rnd.Utils.arrayContains(completions, "entity_name"),
                false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoNoAssociationsFromForeignView = function () {
            var sourceWithSelections = "namespace d037066.playground;                          "
                + "context testb {                                        "
                + "  entity e1 {                                          "
                + "    key e1id : Integer;                                 "
                + "    e1v : Integer;                                      "
                + "  };                                                   "
                + "  entity e2 {                                          "
                + "      key e2id : Integer;                                 "
                + "    e2v : Integer;                                      "
                + "  };                                                   "
                + "  view v1 as select from e1 mixin {                    "
                + "      ass : association to e2 on e1id = ass.e2id;         "
                + "  }into {                                              "
                + "     e1,                                                 "
                + "    ass.e2id                                            "
                + "  };                                                   "
                + "  view v2 as select from v1  mixin{                    "
                + "   app : association to v1 on v1.#selection.begin.one##selection.end.one# = id;                "
                + "   app2 : association to v1 on id = id;                "
                + "  }into{                                                "
                + "  };                                                    "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "e1"), true);
            equal(rnd.Utils.arrayContains(completions, "e2id"), true);
            equal(rnd.Utils.arrayContains(completions, "ass"), false);
            equal(rnd.Utils.arrayContains(completions, "app"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoSelectListEntryPointingToViewDefSelectListEntryWithLongerPathNoAlias = function () {
            var sourceWithSelections = "namespace d037066.playground;                      "
                + "context testc {                                    "
                + "    entity e1 {                                    "
                + "    key e1id : Integer;                             "
                + "    e1v : Integer;                                  "
                + "  };                                               "
                + "  entity e2 {                                      "
                + "      key e2id : Integer;                             "
                + "    e2v : Integer;                                  "
                + "  };                                               "
                + "  view v1 as select from e1 mixin {                "
                + "      ass : association to e2 on e1id = ass.e2id;     "
                + "  }into {                                          "
                + "     e1,                                             "
                + "    ass.e2id                                        "
                + "  };                                               "
                + "  view v2 as select from v1  mixin{                "
                + "   app : association to v1 on v1.e1 = id;          "
                + "   app2 : association to v1 on id = id;            "
                + "  }into{                                            "
                + "    #selection.begin.one##selection.end.one#        "
                + "  };                                                "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "e1"), true);
            equal(rnd.Utils.arrayContains(completions, "e2id"), true);
            equal(rnd.Utils.arrayContains(completions, "ass"), false);
            equal(rnd.Utils.arrayContains(completions, "app"), true);
            equal(rnd.Utils.arrayContains(completions, "app2"), true);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoSelectListEntryPointingToAssocViewTarget = function () {
            var sourceWithSelections = "namespace d037066.playground;                      "
                + "context testc {                                    "
                + "    entity e1 {                                    "
                + "    key e1id : Integer;                             "
                + "    e1v : Integer;                                  "
                + "  };                                               "
                + "  entity e2 {                                      "
                + "      key e2id : Integer;                             "
                + "    e2v : Integer;                                  "
                + "  };                                               "
                + "  view v1 as select from e1 mixin {                "
                + "      ass : association to e2 on e1id = ass.e2id;     "
                + "  }into {                                          "
                + "     e1,                                             "
                + "    ass.e2id                                        "
                + "  };                                               "
                + "  view v2 as select from v1  mixin{                "
                + "   app : association to v1 on v1.e1 = id;          "
                + "   app2 : association to v1 on id = id;            "
                + "  }into{                                            "
                + "    app.#selection.begin.one##selection.end.one#        "
                + "  };                                                "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "e1"), true);
            equal(rnd.Utils.arrayContains(completions, "e2id"), true);
            equal(rnd.Utils.arrayContains(completions, "ass"), false);
            equal(rnd.Utils.arrayContains(completions, "app"), false);
            equal(rnd.Utils.arrayContains(completions, "app2"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoSelectListEntryProposeLastSegment = function () {
            var sourceWithSelections = "namespace d037066.playground;                      "
                + "context testc {                                    "
                + "    entity e1 {                                    "
                + "    key e1id : Integer;                             "
                + "    e1v : Integer;                                  "
                + "    assoc1 : association to e2 on e1.e1id = assoc1.e2id;  "
                + "  };                                               "
                + "  entity e2 {                                      "
                + "    key e2id : Integer;                             "
                + "    e2v : Integer;                                  "
                + "  };                                               "
                + "  view v1 as select from e1 mixin {                "
                + "      ass : association to e2 on e1id = ass.e2id;     "
                + "  }into {                                          "
                + " e1.assoc1.e2v,                                  "
                + "    e1,                                             "
                + "    ass.e2id                                        "
                + "  };                                               "
                + "  view v2 as select from v1  mixin{                "
                + "   app : association to v1 on v1.e1 = id;          "
                + "   app2 : association to v1 on id = id;            "
                + "  }into{                                            "
                + "    #selection.begin.one##selection.end.one#        "
                + "  };                                                "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "e1"), true);
            equal(rnd.Utils.arrayContains(completions, "e2id"), true);
            equal(rnd.Utils.arrayContains(completions, "ass"), false);
            equal(rnd.Utils.arrayContains(completions, "app"), true);
            equal(rnd.Utils.arrayContains(completions, "app2"), true);
            equal(rnd.Utils.arrayContains(completions, "e2v"), true);
            equal(rnd.Utils.arrayContains(completions, "assoc1.e2v"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoProposeAdHocAssociationsInWhereClause = function () {
            var sourceWithSelections = "namespace d031119;                                                        "
                + "context test9 {                                                        "
                + "    entity e1 {                                                         "
                + "        key a : Integer;                                                "
                + "        b : Integer;                                                    "
                + "    };                                                                  "
                + "    view v1 as select from e1                                           "
                + "    mixin{                                                              "
                + "        asso1 : association to e1 on a = asso1.a;                       "
                + "    }into                                                               "
                + "    {                                                                   "
                + "        asso1.a as a1,                                                  "
                + "        a as am,                                                        "
                + "        2 +4 as hugo                                                    "
                + "    };                                                                  "
                + "    view v2 as select from v1                                           "
                + "    mixin{                                                              "
                + "        asso2 : association to e1 on v1.am = asso2.a;                   "
                + "        asso3 : association to v1 on v1.am = asso3.am;                  "
                + "    }into{                                                              "
                + "        asso2.a as a2,                                                  "
                + "        asso3.a1 as b3,                                                 "
                + "        a1,                                                             "
                + "        am as am2                                                            "
                + "   }                                                                   "
                + "    where v1.a1 = 3 and a#selection.begin.one##selection.end.one#       "
                + "    ;                                                                   "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "asso2"), true);
            equal(rnd.Utils.arrayContains(completions, "asso3"), true);
            equal(rnd.Utils.arrayContains(completions, "a2"), false);
            equal(rnd.Utils.arrayContains(completions, "a1"), true);
            equal(rnd.Utils.arrayContains(completions, "am"), true);
            equal(rnd.Utils.arrayContains(completions, "asso1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoProposeAdHocAssociationsInGroubByClause = function () {
            var sourceWithSelections = "namespace d031119;                                                 "
                + "context test9 {                                                    "
                + "   entity e1 {                                                     "
                + "        key a : Integer;                                            "
                + "        b : Integer;                                                "
                + "    };                                                              "
                + "    view v1 as select from e1                                       "
                + "    mixin{                                                          "
                + "        asso1 : association to e1 on a = asso1.a;                   "
                + "    }into                                                           "
                + "    {                                                               "
                + "        asso1.a as a1,                                              "
                + "        a as am,                                                    "
                + "        2 +4 as hugo                                                "
                + "    };                                                              "
                + "    view v2 as select from v1                                       "
                + "    mixin{                                                          "
                + "        asso2 : association to e1 on v1.am = asso2.a;               "
                + "        asso3 : association to v1 on v1.am = asso3.am;              "
                + "    }into{                                                          "
                + "        asso2.a as a2,                                              "
                + "        asso3.a1 as b3,                                             "
                + "        a1,                                                         "
                + "        am as am2                                                   "
                + "    }                                                               "
                + "    where v1.a1 = 3 and asso2.a = asso3.hugo                        "
                + "    group by asso2.a,ass#selection.begin.one##selection.end.one#    "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "asso2"), true);
            equal(rnd.Utils.arrayContains(completions, "asso3"), true);
            equal(rnd.Utils.arrayContains(completions, "asso1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoProposeAdHocAssociationsInHavingClause = function () {
            var sourceWithSelections = "namespace d031119;                             "
                + "context test9 {                                                     "
                + "   entity e1 {                                                      "
                + "        key a : Integer;                                            "
                + "        b : Integer;                                                "
                + "    };                                                              "
                + "    view v1 as select from e1                                       "
                + "    mixin{                                                          "
                + "        asso1 : association to e1 on a = asso1.a;                   "
                + "    }into                                                           "
                + "    {                                                               "
                + "        asso1.a as a1,                                              "
                + "        a as am,                                                    "
                + "        2 +4 as hugo                                                "
                + "    };                                                              "
                + "    view v2 as select from v1                                       "
                + "    mixin{                                                          "
                + "        asso2 : association to e1 on v1.am = asso2.a;               "
                + "        asso3 : association to v1 on v1.am = asso3.am;              "
                + "    }into{                                                          "
                + "        asso2.a as a2,                                              "
                + "        asso3.a1 as b3,                                             "
                + "        a1,                                                         "
                + "        am as am2                                                   "
                + "    }                                                               "
                + "    where v1.a1 = 3 and asso2.a = asso3.hugo                        "
                + "    group by asso2.a having ass#selection.begin.one##selection.end.one#"
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "asso2"), true);
            equal(rnd.Utils.arrayContains(completions, "asso3"), true);
            equal(rnd.Utils.arrayContains(completions, "asso1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoProposeAdHocAssociationsInOrderByClause = function () {
            var sourceWithSelections = "namespace d031119;                                                 "
                + "context test9 {                                                    "
                + "   entity e1 {                                                     "
                + "        key a : Integer;                                            "
                + "        b : Integer;                                                "
                + "    };                                                              "
                + "    view v1 as select from e1                                       "
                + "    mixin{                                                          "
                + "        asso1 : association to e1 on a = asso1.a;                   "
                + "    }into                                                           "
                + "    {                                                               "
                + "        asso1.a as a1,                                              "
                + "        a as am,                                                    "
                + "        2 +4 as hugo                                                "
                + "    };                                                              "
                + "    view v2 as select from v1                                       "
                + "    mixin{                                                          "
                + "        asso2 : association to e1 on v1.am = asso2.a;               "
                + "        asso3 : association to v1 on v1.am = asso3.am;              "
                + "    }into{                                                          "
                + "        asso2.a as a2,                                              "
                + "        asso3.a1 as b3,                                             "
                + "        a1,                                                         "
                + "        am as am2                                                   "
                + "    }                                                               "
                + "    where v1.a1 = 3 and asso2.a = asso3.hugo                        "
                + "    order by asso2.a,ass#selection.begin.one##selection.end.one#    "
                + "};";
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
            equal(rnd.Utils.arrayContains(completions, "asso2"), true);
            equal(rnd.Utils.arrayContains(completions, "asso3"), true);
            equal(rnd.Utils.arrayContains(completions, "asso1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.noForeignAssociationsProposedInAssocOnCondition = function () {
            var sourceWithSelections = "namespace d031119;                                                                                                    " + "context peter4 {                                                                                                      " + "   define entity e1{                                                                                                  " + "                key k1: Integer;                                                                                      " + "                f1 : String(20);                                                                                      " + "                assocName1 : association to e2 on e1.k1 = assocName1.k2;                                              " + "  };                                                                                                                  " + "                                                                                                                      " + "  define entity e2{                                                                                                   " + "                key k2: Integer;                                                                                      " + "                f2 : String(20);                                                                                      " + "                g2 : String(20);                                                                                      " + "                assocName2 : association to e1 on e2.k2 = assocName2.k1;                                              " + "                assocName2_b : association to e1 on e2.#selection.begin.one##selection.end.one#  = assocName2.k1;     " + "  };                                                                                                                  " + "};                                                                                                                    ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "assocName2_b"), true);
            equal(rnd.Utils.arrayContains(completions, "assocName2"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.noForeignAssociationsProposedInAssocOnCondition2 = function () {
            var sourceWithSelections = "namespace d031119;                                                                                                    " + "context peter4 {                                                                                                      " + "   define entity e1{                                                                                                  " + "                key k1: Integer;                                                                                      " + "                f1 : String(20);                                                                                      " + "                assocName1 : association to e2 on e1.k1 = assocName1.k2;                                              " + "  };                                                                                                                  " + "                                                                                                                      " + "  define entity e2{                                                                                                   " + "                key k2: Integer;                                                                                      " + "                f2 : String(20);                                                                                      " + "                g2 : String(20);                                                                                      " + "                assocName2 : association to e1 on e2.k2 = assocName2.k1;                                              " + "       assocName2_b : association to e1 on e2.assocName2_b.#selection.begin.one##selection.end.one#  = assocName2.k1;" + "  };                                                                                                                  " + "};                                                                                                                    ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "f1"), true);
            equal(rnd.Utils.arrayContains(completions, "assocName1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.noForeignAssociationsProposedInAdHocAssocOnCondition = function () {
            var sourceWithSelections = "namespace d031119;                                                                                                    " + "context peter4 {                                                                                                      " + "   define entity e1{                                                                                                  " + "                key k1: Integer;                                                                                      " + "                f1 : String(20);                                                                                      " + "                assocName1 : association to e2 on e1.k1 = assocName1.k2;                                              " + "  };                                                                                                                  " + "  define entity e2{                                                                                                   " + "                key k2: Integer;                                                                                      " + "                f2 : String(20);                                                                                      " + "                g2 : String(20);                                                                                      " + "                assocName2 : association to e1 on e2.k2 = assocName2.k1;                                              " + "                assocName2_b : association to e1 on e2.assocName2_b.k1 = assocName2.k1;                               " + "  };                                                                                                                  " + "  define view view_with_assoc as select from e1                                                                       " + "  mixin                                                                                                               " + "  {                                                                                                                   " + "                assoc1: association [* ] to e2 on e1.assocName1.f2 = assoc1.#selection.begin.one##selection.end.one# ;" + "  }                                                                                                                   " + "  into                                                                                                                " + "  {                                                                                                                   " + "    f1,                                                                                                               " + "    assoc1.f2                                                                                                         " + "  };                                                                                                                  " + "};                                                                                                                    ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "f2"), true);
            equal(rnd.Utils.arrayContains(completions, "assocName2"), false);
            equal(rnd.Utils.arrayContains(completions, "assocName2_b"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.noForeignAssociationsProposedInAdHocAssocOnCondition2 = function () {
            var sourceWithSelections = "namespace d031119;                                                                                                    " + "context peter4 {                                                                                                      " + "   define entity e1{                                                                                                  " + "                key k1: Integer;                                                                                      " + "                f1 : String(20);                                                                                      " + "                assocName1 : association to e2 on e1.k1 = assocName1.k2;                                              " + "  };                                                                                                                  " + "  define entity e2{                                                                                                   " + "                key k2: Integer;                                                                                      " + "                f2 : String(20);                                                                                      " + "                g2 : String(20);                                                                                      " + "                assocName2 : association to e1 on e2.k2 = assocName2.k1;                                              " + "                assocName2_b : association to e1 on e2.assocName2_b.k1 = assocName2.k1;                               " + "  };                                                                                                                  " + "  define view view_with_assoc as select from e1                                                                       " + "  mixin                                                                                                               " + "  {                                                                                                                   " + "                assoc1: association [* ] to e2 on e1.#selection.begin.one##selection.end.one# = assoc1 ;" + "  }                                                                                                                   " + "  into                                                                                                                " + "  {                                                                                                                   " + "    f1,                                                                                                               " + "    assoc1.f2                                                                                                         " + "  };                                                                                                                  " + "};                                                                                                                    ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "f1"), true);
            equal(rnd.Utils.arrayContains(completions, "assocName1"), false);
            equal(rnd.Utils.arrayContains(completions, "assoc1"), false);
        };
        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.cocoErrorRecoveryAdHocAssociation = function () {
            var sourceWithSelections = "namespace playground.melcher;  																" + "using playground.melcher::tm1active;                                                           " + "context cctest0003 {                                                                           " + "  define entity e2{                                                                            " + "	key k2: Integer;                                                                            " + "	f2 : String(20);                                                                            " + "  };                                                                                           " + "  define entity e1{                                                                            " + "	key k1: Integer;                                                                            " + "	f1 : String(20);                                                                            " + "  };                                                                                           " + "  define view view_with_assoc as select from e1                                                " + "  mixin { assoc1: association [* ] to tm1active.firstRow on e1.k1 = tm1active.firstRow.value2 ;" + "          assoc2: association to e2 on e1.#selection.begin.one##selection.end.one#             " + "  }                                                                                            " + "    into {                                                                                     " + "    e1.k1 as E1_K1,                                                                            " + "    assoc1.id2 as ID2 }                                                                        " + "  ;                                                                                            " + "}                                                                                              ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, source, selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, hanaddlNonUi.Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg), false);
        };

        //TEST METHODS

        TestsUnitHanaDdlParserV3AdHocAssociations.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
    }
);