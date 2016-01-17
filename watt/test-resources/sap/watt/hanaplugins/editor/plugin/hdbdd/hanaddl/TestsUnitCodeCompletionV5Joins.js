RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "./TestUtilEclipseSelectionHandling", "rndrt/rnd", "./AbstractV5HanaDdlParserTests", "./TestFriendlyHanaRepositoryAccess",
        "hanaddl/hanav5/CdsDdlParserResolver"
    ],
    function (TestUtilEclipseSelectionHandling, rnd, AbstractV5HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {

        var utils = rnd.Utils;

        function TestsUnitCodeCompletionV5Joins() {
        }

        TestsUnitCodeCompletionV5Joins.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);

        TestsUnitCodeCompletionV5Joins.prototype.getCodeCompletions = function (source) {
            var sourceWithoutSelections = [""];
            var sourceWithSelections = source;

            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, sourceWithoutSelections, selections);
            var selectionOne = selections["one"];

            return this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(null), sourceWithoutSelections[0], 1, selectionOne.getOffset() + 1);
        };

        //
        // "on"-condition in joins
        //

        TestsUnitCodeCompletionV5Joins.prototype.bothEntitiesAreProposedInOnCondition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "  };"//
                + "  entity entity2 {"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "entity1"), true, "completion contains proposal for entity \"entity1\"");
            equal(utils.arrayContains(completions, "entity2"), true, "completion contains proposal for entity \"entity2\"");
        };

        TestsUnitCodeCompletionV5Joins.prototype.onlyLeftAndRightSidesAreProposedInOnCondition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entityNotProposed {"//
                + "  };"//
                + "  entity entity1 {"//
                + "  };"//
                + "  entity entity2 {"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "entity1"), true, "completion contains proposal for entity \"entity1\"");
            equal(utils.arrayContains(completions, "entity2"), true, "completion contains proposal for entity \"entity2\"");
            equal(!utils.arrayContains(completions, "entityNotProposed"), true, "completion doesn't contains proposal for entity \"entityNotProposed\"");
        };

        TestsUnitCodeCompletionV5Joins.prototype.attributesOfBothEntitiesAreProposedInOnCondition = function () {

            // attributes of left entity are proposed
            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "    attr1: Integer;"//
                + "  };"//
                + "  entity entity2 {"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity1.#selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1"), true, "completion contains proposal for attribute \"attr1\"");

            // attributes of right entity are proposed
            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "  };"//
                + "  entity entity2 {"//
                + "    attr2: Integer;"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity2.#selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr2"), true, "completion contains proposal for attribute \"attr2\"");
        };

        //
        // select list in joins
        //

        TestsUnitCodeCompletionV5Joins.prototype.bothEntitiesAreProposedInSelectList = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "  };"//
                + "  entity entity2 {"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity1.attr1 = entity2.attr2 {"//
                + "    #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "entity1"), true, "completion contains proposal for entity \"entity1\"");
            equal(utils.arrayContains(completions, "entity2"), true, "completion contains proposal for entity \"entity2\"");
        };

        TestsUnitCodeCompletionV5Joins.prototype.attributesOfBothEntitiesAreProposedFullyQualifiedInSelectList = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "    attr1: Integer;"//
                + "  };"//
                + "  entity entity2 {"//
                + "    attr2: Integer;"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity1.attr1 = entity2.attr2 {"//
                + "    #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "entity1.attr1"), true, "completion contains proposal for attribute \"entity1.attr1\"");
            equal(utils.arrayContains(completions, "entity2.attr2"), true, "completion contains proposal for attribute \"entity2.attr2\"");
        };

        TestsUnitCodeCompletionV5Joins.prototype.sameAttributesOfBothEntitiesAreProposedFullyQualifiedInSelectList = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "    sameAttr: Integer;"//
                + "  };"//
                + "  entity entity2 {"//
                + "    sameAttr: Integer;"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity1.attr1 = entity2.attr2 {"//
                + "    #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "entity1.sameAttr"), true, "completion contains proposal for attribute \"entity1.sameAttr\"");
            equal(utils.arrayContains(completions, "entity2.sameAttr"), true, "completion contains proposal for attribute \"entity2.sameAttr\"");
        };

        TestsUnitCodeCompletionV5Joins.prototype.attributesOfOneEntityAreProposedInSelectList = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity entity1 {"//
                + "    attr1_1: Integer;"//
                + "    attr1_2: Integer;"//
                + "  };"//
                + "  entity entity2 {"//
                + "    attr2_1: Integer;"//
                + "    attr2_2: Integer;"//
                + "  };"//
                + "  view view1 as select from entity1 inner join entity2 on entity1.attr1 = entity2.attr2 {"//
                + "    entity1.#selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1_1"), true, "completion contains proposal for attribute \"attr1_1\" of entity1");
            equal(utils.arrayContains(completions, "attr1_2"), true, "completion contains proposal for attribute \"attr1_2\" of entity1");

            equal(!utils.arrayContains(completions, "attr2_1"), true, "completion doesn't contain proposal for attribute \"attr2_1\" of entity2");
            equal(!utils.arrayContains(completions, "attr2_2"), true, "completion doesn't contain proposal for attribute \"attr2_2\" of entity2");
        };

        //
        // TEST METHODS
        //

        var cut = new TestsUnitCodeCompletionV5Joins();

        cut.testSupportedVersions("bothEntitiesAreProposedInOnCondition");
        cut.testSupportedVersions("onlyLeftAndRightSidesAreProposedInOnCondition");
        cut.testSupportedVersions("attributesOfBothEntitiesAreProposedInOnCondition");

        cut.testSupportedVersions("bothEntitiesAreProposedInSelectList");
        cut.testSupportedVersions("attributesOfBothEntitiesAreProposedFullyQualifiedInSelectList");
        cut.testSupportedVersions("sameAttributesOfBothEntitiesAreProposedFullyQualifiedInSelectList");
        cut.testSupportedVersions("attributesOfOneEntityAreProposedInSelectList");

        QUnit.start();
    });
