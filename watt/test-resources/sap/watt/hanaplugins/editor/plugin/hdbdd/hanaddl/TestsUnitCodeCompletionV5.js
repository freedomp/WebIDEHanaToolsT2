RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
    [
        "./TestUtilEclipseSelectionHandling", "rndrt/rnd", "./AbstractV5HanaDdlParserTests", "./TestFriendlyHanaRepositoryAccess",
        "hanaddl/hanav5/CdsDdlParserResolver"

    ],
    function (TestUtilEclipseSelectionHandling, rnd, AbstractV5HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {

        var utils = rnd.Utils;

        function TestsUnitCodeCompletionV5() {
        }

        TestsUnitCodeCompletionV5.prototype = Object.create(AbstractV5HanaDdlParserTests.prototype);

        TestsUnitCodeCompletionV5.prototype.getCodeCompletions = function (source) {
            var sourceWithoutSelections = [""];
            var sourceWithSelections = source;

            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections, sourceWithoutSelections, selections);
            var selectionOne = selections["one"];

            return this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(null), sourceWithoutSelections[0], 1, selectionOne.getOffset() + 1);
        };

        //
        // Calculated elements in entities
        //

        TestsUnitCodeCompletionV5.prototype.attributesAreProposedInCalculations = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    attr1: Integer;"//
                + "    attr2: Integer = #selection.one#"//
                + "  }"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1"), true, "completion contains proposal for attribute \"attr1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structuresAreProposedInCalculations = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "    attr1: Integer = #selection.one#"//
                + "  }"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "str1"), true, "completion contains proposal for structure \"str1\"");
        };

        TestsUnitCodeCompletionV5.prototype.associationsAreNotProposedInCalculations = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    assoc1: association to myEntity;"//
                + "    attr1 : Integer = #selection.one#"//
                + "  };"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "assoc1"), false, "completion doesn't contain proposal for association \"assoc1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structureElementsAreProposedInCalculations = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "    attr1: Integer = str1.#selection.one#"//
                + "  }"//
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "sel1"), true, "completion contains proposal for structure element \"sel1\"");
        };

        //
        // Elements in an index definition of a technical configuration of an entity
        //

        TestsUnitCodeCompletionV5.prototype.attributesAreProposedInIndexDefinition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    attr1: Integer;"//
                + "  } technical configuration {"//
                + "    index IDX1 on (#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1"), true, "completion contains proposal for attribute \"attr1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structuresAreProposedInIndexDefinition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "  } technical configuration {"//
                + "    index IDX1 on (#selection.one#)"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "str1"), true, "completion contains proposal for structure \"str1\"");
        };

        TestsUnitCodeCompletionV5.prototype.associationsAreNotProposedInIndexDefinition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    assoc1: association to myEntity;"//
                + "  } technical configuration {"//
                + "    index IDX1 on (#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "assoc1"), false, "completion doesn't contain proposal for association \"assoc1\"");
        };

        //
        // Elements in a fulltext index definition of a technical configuration of an entity
        //

        TestsUnitCodeCompletionV5.prototype.structureElementsAreProposedInFullindexDefinition = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "  } technical configuration {"//
                + "    fulltext index IDX1 on (str1.#selection.one#)"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "sel1"), true, "completion contains proposal for structure element \"sel1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structureElementsAreProposedInFullindexDefinitionLanguageColumn = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "  } technical configuration {"//
                + "    fulltext index IDX1 on (str1.sel1) language column str1.#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "sel1"), true, "completion contains proposal for structure element \"sel1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structureElementsAreProposedInFullindexDefinitionMimeTypeColumn = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "  } technical configuration {"//
                + "    fulltext index IDX1 on (str1.sel1) mime type column str1.#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "sel1"), true, "completion contains proposal for structure element \"sel1\"");
        };

        //
        // Elements in a partition definition of a technical configuration of an entity
        //

        TestsUnitCodeCompletionV5.prototype.attributesAreProposedInPartitionDefinitions = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    attr1: Integer;"//
                + "  } technical configuration {"//
                + "    partition by hash(#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1"), true, "completion contains proposal for attribute \"attr1\"");
        };

        TestsUnitCodeCompletionV5.prototype.associationsAreProposedInPartitionDefinitions = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    assoc1: association to myEntity;"//
                + "  } technical configuration {"//
                + "    partition by hash(#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "assoc1"), true, "completion contains proposal for association \"assoc1\"");
        };

        TestsUnitCodeCompletionV5.prototype.structureElementsAreProposedInPartitionDefinitions = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  type myStructure {"//
                + "    sel1: Integer;"//
                + "  };"//
                + "  entity myEntity {"//
                + "    str1 : myStructure;"//
                + "  } technical configuration {"//
                + "    fulltext index IDX1 on (str1.#selection.one#)"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "sel1"), true, "completion contains proposal for structure element \"sel1\"");
        };

        //
        // Series definition of an entity
        //

        TestsUnitCodeCompletionV5.prototype.attributesAreProposedInSeriesKeyDefinitions = function () {

            var source = ""//
                + "namespace myNamespace; "//
                + "context myContext {"//
                + "  entity myEntity {"//
                + "    attr1: Integer;"//
                + ""//
                + "    series( series key(#selection.one#"//
                + "  };"
                + "}";//

            var completions = this.getCodeCompletions(source);
            equal(utils.arrayContains(completions, "attr1"), true, "completion contains proposal for attribute \"attr1\"");
        };

// TEST METHODS

        var cut = new TestsUnitCodeCompletionV5();

        cut.testSupportedVersions("attributesAreProposedInCalculations");
        cut.testSupportedVersions("structuresAreProposedInCalculations");
        cut.testSupportedVersions("associationsAreNotProposedInCalculations");
        cut.testSupportedVersions("structureElementsAreProposedInCalculations");

        cut.testSupportedVersions("attributesAreProposedInIndexDefinition");
        cut.testSupportedVersions("structuresAreProposedInIndexDefinition");
        cut.testSupportedVersions("associationsAreNotProposedInIndexDefinition");

        cut.testSupportedVersions("structureElementsAreProposedInFullindexDefinition");
        cut.testSupportedVersions("structureElementsAreProposedInFullindexDefinitionLanguageColumn");
        cut.testSupportedVersions("structureElementsAreProposedInFullindexDefinitionMimeTypeColumn");

        cut.testSupportedVersions("attributesAreProposedInPartitionDefinitions");
        cut.testSupportedVersions("associationsAreProposedInPartitionDefinitions");
        cut.testSupportedVersions("structureElementsAreProposedInPartitionDefinitions");

        cut.testSupportedVersions("attributesAreProposedInSeriesKeyDefinitions");

        QUnit.start();
    }
);
