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
            TestsUnitHanaDdlParserV3Union.prototype = Object
                    .create(AbstractV3HanaDdlParserTests.prototype);
            function TestsUnitHanaDdlParserV3Union() {
            }
            TestsUnitHanaDdlParserV3Union.prototype.simpleUnionParsedCorrectly = function() {
                var source = "namespace my_sample_namespace;                              "
                        + "                                                   "
                        + "context testUnion {                             "
                        + "    entity entity1 {                                "
                        + "        key id1: Integer;                           "
                        + "        value1: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    entity entity2 {                                "
                        + "        key id2: Integer;                           "
                        + "        value2: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    view viewName as select from entity1            "
                        + "    mixin {                                     "
                        + "        assoc1: association[1] to entity1           "
                        + "            on entity1.id1 = assoc1.id1;            "
                        + "    }                                               "
                        + "    into {                                          "
                        + "        id,                                         "
                        + "        assoc1.id as id3                            "
                        + "    } where id = 23 and assoc1.id = 67              "
                        + "                                                    "
                        + "    union                                           "
                        + "                                                    "
                        + "    select from entity2 {                           "
                        + "        id2                                         "
                        + "    };                                              "
                        + "};                                                  ";
                var tokens = this.parseSource(source);
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3Union.prototype.cocoProposeIn1stSelectList = function() {
                var sourceWithSelections = "namespace my_sample_namespace;                                "
                        + "                                                   "
                        + "context testUnion {                             "
                        + "    entity entity1 {                                "
                        + "        key id1: Integer;                           "
                        + "        value1: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    entity entity2 {                                "
                        + "        key id2: Integer;                           "
                        + "        value2: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    view viewName as select from entity1            "
                        + "    mixin {                                     "
                        + "        #selection.begin.one##selection.end.one#    "
                        + "        assoc1: association[1] to entity1           "
                        + "            on entity1.id1 = assoc1.id1;            "
                        + "    }                                               "
                        + "    into {                                          "
                        + "        id,                                         "
                        + "        assoc1.id as id3                            "
                        + "    } where id = 23 and assoc1.id = 67              "
                        + "                                                    "
                        + "    union                                           "
                        + "                                                    "
                        + "    select from entity2 {                           "
                        + "        id2                                         "
                        + "    };                                              "
                        + "};                                                  ";
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
                equal(rnd.Utils.arrayContains(completions, "entity1"), true);
                equal(rnd.Utils.arrayContains(completions, "assoc1"), true);
                equal(rnd.Utils.arrayContains(completions, "id1"), true);
                equal(rnd.Utils.arrayContains(completions, "value1"), true);
            };
            TestsUnitHanaDdlParserV3Union.prototype.cocoProposeIn2ndSelectList = function() {
                var sourceWithSelections = "namespace my_sample_namespace;                                "
                        + "                                                   "
                        + "context testUnion {                             "
                        + "    entity entity1 {                                "
                        + "        key id1: Integer;                           "
                        + "        value1: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    entity entity2 {                                "
                        + "        key id2: Integer;                           "
                        + "        value2: Integer;                            "
                        + "    };                                              "
                        + "                                                    "
                        + "    view viewName as select from entity1            "
                        + "    mixin {                                     "
                        + "        assoc1: association[1] to entity1           "
                        + "            on entity1.id1 = assoc1.id1;            "
                        + "    }                                               "
                        + "    into {                                          "
                        + "        id,                                         "
                        + "        assoc1.id as id3                            "
                        + "    } where id = 23 and assoc1.id = 67              "
                        + "                                                    "
                        + "    union                                           "
                        + "                                                    "
                        + "    select from entity2 {                           "
                        + "        #selection.begin.one##selection.end.one#    "
                        + "    };                                              "
                        + "};                                                  ";
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
                equal(rnd.Utils.arrayContains(completions, "entity1"), false);
                equal(rnd.Utils.arrayContains(completions, "assoc1"), false);
                equal(rnd.Utils.arrayContains(completions, "id1"), false);
                equal(rnd.Utils.arrayContains(completions, "value1"), false);
            };

            // TEST METHODS

            TestsUnitHanaDdlParserV3Union.prototype.testAllMethodsInSupportedVersions();

            QUnit.start();
        });