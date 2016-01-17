// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests

RequirePaths.setRequireJsConfigForHanaDdl(2);

define(
        [ "commonddl/commonddlNonUi", "TestUtilEclipseSelectionHandling",
                "rndrt/rnd",
                "hanaddl/hanaddlNonUi",
                "./AbstractV3HanaDdlParserTests",
                "./TestFriendlyHanaRepositoryAccess"

        ], // dependencies
        function(commonddlNonUi, TestUtilEclipseSelectionHandling, rnd, hanaddlNonUi, AbstractV3HanaDdlParserTests, TestFriendlyHanaRepositoryAccess) {
            var PrimitiveTypeUtil = hanaddlNonUi.PrimitiveTypeUtil;

            function TestsUnitHanaDdlParserV3() {
            }
            TestsUnitHanaDdlParserV3.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
            TestsUnitHanaDdlParserV3.prototype.defineContextParsedCorrectly = function() {
                var tokens = this.parseSource("DEFINE CONTEXT cont{};");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.enumIdInDefaultParsedCorrectly = function() {
                var tokens = this
                        .parseSource("ENTITY e { e : myEnumType DEFAULT #myEnumValue; };");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesEnumIdInAnnotationDefintions = function() {
                var sourceWithSelections = "annotation Catalog { tableType: String(20) enum { ROW = 'ROW'; Column = 'COLUMN'; } default #selection.one#";
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
                equal(rnd.Utils.arrayContains(completions, "#ROW"), true);
                equal(rnd.Utils.arrayContains(completions, "#Column"), true);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesEnumIdInComplexAnnotationDefintions = function() {
                var sourceWithSelections = "annotation Catalog { tableType: String(20) enum { ROW = 'ROW'; Column = 'COLUMN'; } default #ROW ; size: Integer enum { SMALL = 1000; Large = 1000000; } default #selection.two# ; };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["two"];
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "#SMALL"), true);
                equal(rnd.Utils.arrayContains(completions, "#Large"), true);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoShouldNotProposeNullValueForAnnotation = function() {
                var sourceWithSelections = "@Annotation: #selection.one#";
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
                equal(rnd.Utils.arrayContains(completions, "null"), false);
                sourceWithSelections = "@Annotation: 'MyTest' context test1 {  @Catalog.index: [{name: #selection.one#, unique: true, order: #ASC, elementNames: ['']}] entity entityName { key elementName : Integer; }; };";
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "null"), false);
                sourceWithSelections = "@Annotation: 'MyTest' context test1 {  @Catalog.index: [{name: 'myName', unique: #selection.one#, order: #ASC, elementNames: ['']}] entity entityName { key elementName : Integer; }; };";
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "null"), false);
                sourceWithSelections = "@Annotation: 'MyTest' context test1 {  @Catalog.index: [{name: 'myName', unique: true, order: #selection.one#, elementNames: ['']}] entity entityName { key elementName : Integer; }; };";
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "null"), false);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesEnumIdInAnnotationDefintionsInsideStatement = function() {
                var sourceWithSelections = "annotation Catalog { tableType: String(20) enum { ROW = 'ROW'; Column = 'COLUMN'; } default #R#selection.one# ; };";
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
                equal(rnd.Utils.arrayContains(completions, "#ROW"), true);
                equal(rnd.Utils.arrayContains(completions, "#Column"), false);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoDoesNotProposeDefaultKeywordInsideAnnoationDefinitions = function() {
                var source = "ANNOTATION annot : boolean ";
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "default"), false);
            };
            TestsUnitHanaDdlParserV3.prototype.allTypesOfLitersAreAcceptedInAnnotations = function() {
                var tokens = this
                        .parseSource("@AnnotationName: [1, -2, 'a', #COLUMN, date'2014-07-08', time'12:00:00', timestamp'2014-07-0812:00:00', null ,xFFFF, 3.5, 2.1E-3] entity e{};");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationDeclarationWithNamespaceAccepted = function() {
                var tokens = this
                        .parseSource("ANNOTATION name.space::a : String(1);");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationDeclarationWithTypeOfAccepted = function() {
                var tokens = this
                        .parseSource("ANNOTATION name : TYPE OF type.element.subelement;");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationDeclarationWithAnnotationAccepted = function() {
                var tokens = this
                        .parseSource("@Scope: [#CONTEXT] ANNOTATION name : String(1);");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesPrimitiveTypesInAnnotationDefintions = function() {
                var source = "ANNOTATION a1 { elem : ";
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "Binary(len)"), true);
                equal(rnd.Utils.arrayContains(completions, "BinaryFloat"), true);
                equal(rnd.Utils.arrayContains(completions,
                        "Decimal(precision, scale)"), true);
                equal(rnd.Utils.arrayContains(completions, "DecimalFloat"),
                        true);
                equal(rnd.Utils.arrayContains(completions, "Integer"), true);
                equal(rnd.Utils.arrayContains(completions, "Integer64"), true);
                equal(rnd.Utils.arrayContains(completions, "LargeBinary"), true);
                equal(rnd.Utils.arrayContains(completions, "LargeString"), true);
                equal(rnd.Utils.arrayContains(completions, "LocalDate"), true);
                equal(rnd.Utils.arrayContains(completions, "LocalTime"), true);
                equal(rnd.Utils.arrayContains(completions, "String(len)"), true);
                equal(rnd.Utils.arrayContains(completions, "UTCDateTime"), true);
                equal(rnd.Utils.arrayContains(completions, "UTCTimestamp"),
                        true);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesPrimitiveTypesWithNamespace = function() {
                var source = "entity ent { elem :";
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "hana.CHAR(len)"),
                        true);
                equal(rnd.Utils.arrayContains(completions, "hana.CLOB"), true);
                equal(rnd.Utils.arrayContains(completions, "hana.ST_GEOMETRY"),
                        true);
                source = "entity ent { elem : c";
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "hana.CHAR(len)"),
                        true);
                equal(rnd.Utils.arrayContains(completions, "hana.CLOB"), true);
                equal(rnd.Utils.arrayContains(completions, "hana.ST_GEOMETRY"),
                        false);
                source = "entity ent { elem : hana.";
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "CHAR(len)"), true);
                equal(rnd.Utils.arrayContains(completions, "CLOB"), true);
                equal(rnd.Utils.arrayContains(completions, "ST_GEOMETRY"), true);
                source = "entity ent { elem : hana.c";
                completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "CHAR(len)"), true);
                equal(rnd.Utils.arrayContains(completions, "CLOB"), true);
                equal(rnd.Utils.arrayContains(completions, "ST_GEOMETRY"),
                        false);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesPrimitiveTypesReplacement1 = function() {
                var sourceWithSelections = "entity ent { elem : ha#selection.one#na.CHAR( 10 ) };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = this.getParser().getTypedCodeCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                for (var completionCount = 0; completionCount < completions.length; completionCount++) {
                    var completion = completions[completionCount];
                    if (completion.getName() === "hana.CLOB") {
                        var casted = completion;
                        equal(casted.getReplacementOffset() == 20, true);
                        equal(casted.getReplacementLength() == 15, true);
                        return;
                    }
                }
                Assert.fail1("Completion hana.CLOB not found");
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesPrimitiveTypesReplacement2 = function() {
                var sourceWithSelections = "entity ent { elem : hana.#selection.one#CHAR( 10 ) };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = this.getParser().getTypedCodeCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                for (var completionCount = 0; completionCount < completions.length; completionCount++) {
                    var completion = completions[completionCount];
                    if (completion.getName() === "CLOB") {
                        var casted = completion;
                        equal(casted.getReplacementOffset() == 25, true);
                        equal(casted.getReplacementLength() == 10, true);
                        return;
                    }
                }
                Assert.fail1("Completion CLOB not found");
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesPrimitiveTypesReplacement3 = function() {
                var sourceWithSelections = "entity ent { elem : hana.C#selection.one#HAR( 10 ) };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = this.getParser().getTypedCodeCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                for (var completionCount = 0; completionCount < completions.length; completionCount++) {
                    var completion = completions[completionCount];
                    if (completion.getName() === "CLOB") {
                        var casted = completion;
                        equal(casted.getReplacementOffset() == 25, true);
                        equal(casted.getReplacementLength() == 10, true);
                        return;
                    }
                }
                Assert.fail1("Completion CLOB not found");
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesElementReplacementWithDatasource = function() {
                var sourceWithSelections = "context context111 {                                      "
                        + "entity e1 { f1: Integer } ;                       "
                        + "define view v1 as select from e1 {               "
                        + "   f#selection.one#                               "
                        + "};                                                "
                        + "};                                                        ";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = this.getParser().getTypedCodeCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                for (var completionCount = 0; completionCount < completions.length; completionCount++) {
                    var completion = completions[completionCount];
                    if (completion.getName() === "f1") {
                        var casted = completion;
                        equal(casted.getReplacementString(), "e1.f1");
                        return;
                    }
                }
                Assert.fail1("Completion f1 not found");
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesElementReplacementWithoutDatasource = function() {
                var sourceWithSelections = 
                    "context context111 {                                      "
                        + "entity e1 { f1: Integer } ;                       "
                        + "define view v1 as select from e1 {               "
                        + "   e1.f#selection.one#                               "
                        + "};                                                "
                        + "};                                                        ";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = this.getParser().getTypedCodeCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(),
                        source[0], 1, sel.getOffset() + 1);
                for (var completionCount = 0; completionCount < completions.length; completionCount++) {
                    var completion = completions[completionCount];
                    if (completion.getName() === "f1") {
                        var casted = completion;
                        var isCorrect = casted.getReplacementString() === ""
                                || casted.getReplacementString() === "f1";
                        equal(isCorrect, true);
                        return;
                    }
                }
                Assert.fail1("Completion f1 not found");
            };
            TestsUnitHanaDdlParserV3.prototype.cocoDoesNotProposePrimitiveTypesInEnumValuesInAnnotationDefintions = function() {
                var source = "ANNOTATION a1 { elem : Integer ENUM { a= ";
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "Binary(len)"),
                        false);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoProposesBooleanTypesStartingWithV3Grammar = function() {
                var source = "annotation ent { elem : ";
                var completions = this.getParser().getCompletions5(
                        this.getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess1(), source,
                        1, source.length + 1);
                equal(rnd.Utils.arrayContains(completions, "Boolean"), true);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoBooleanTypeProposalInsideAnnotationDeclaration = function() {
                var parser = this.getParser();
                parser.setSupportedAnnotations(this.getSupportedAnnotations());
                var sourceWithSelections = "context ctx { annotation annot1 { id : Bo#selection.begin.one##selection.end.one# }; };";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var completions = parser.getCompletions5(this
                        .getPadFileResolver(), TestFriendlyHanaRepositoryAccess
                        .TestFriendlyHanaRepositoryAccess1(), source[0], 1, sel
                        .getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions,
                        PrimitiveTypeUtil.BOOLEAN), true);
            };
            TestsUnitHanaDdlParserV3.prototype.typeSpecWithoutWhitespaceAccepted = function() {
                var tokens = this.parseSource("type name :String(1);");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationRecordComponentWithoutWhitespaceTypeAccepted = function() {
                var tokens = this
                        .parseSource("@Annot : { a:'b',c:'d'} type e:Integer;");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationWithNegativeRealLiteralAccepted = function() {
                var tokens = this.parseSource("@Annot : -3.14 TYPE e:Integer;");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationWithReferenceToConstantDefintionAccepted = function() {
                var tokens = this
                        .parseSource("@Annot : path.to.consta TYPE e:Integer;");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.annotationWithReferenceToConstantDefintionHasCorrectAst = function() {
                var cu = this
                        .parseSourceAndGetAst("@Annot : path.to.constant TYPE e:Integer;");
                var path = cu.getAnnotations()[0].getValue();
                equal("path.to.constant", path.getNamePath().getPathString(
                        false));
            };
            TestsUnitHanaDdlParserV3.prototype.qlPathWithScopedIdAccepted = function() {
                var tokens = this
                        .parseSource("VIEW v AS SELECT FROM :scoped.to.table { :scoped.b.c};");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.qlPathWithScopedIdAtWrongPlaceNotAccepted = function() {
                var tokens = this
                        .parseSource("VIEW v AS SELECT FROM table { a.:scoped.c};");
                this.assertErrorTokenAtTokenIndex(tokens, 11);
            };
            TestsUnitHanaDdlParserV3.prototype.qlPathWithPseudoIdAccepted = function() {
                var tokens = this
                        .parseSource("VIEW v AS SELECT FROM $pseudo.to.table { $pseudo.b.c};");
                this.assertNoErrorTokens(tokens);
            };
            TestsUnitHanaDdlParserV3.prototype.cocoDefaultResolvedFromUsedType = function() {
                var sourceWithSelections = "context cctest1030 {                                                        "
                        + "type mytype : Integer enum { yyy = 1;xxxx=2;zzz=3;} ;                       "
                        + "type mytype2 : String(10) enum { yyy = 'asas';xxxx='bdbd';zzz='csscs';} ;   "
                        + "annotation value {                                                          "
                        + "   test : Integer enum { a=1;b=2;cccc=3; } default #cccc;      "
                        + "   test2 : mytype default #selection.one# ;    };                           "
                        + "};                                                                          ";
                var source = [ "" ];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(
                        sourceWithSelections, source, selections);
                var sel = selections["one"];
                var parser = this.getParser();
                parser.setSupportedAnnotations(this.getSupportedAnnotations());
                var completions = parser.getCompletions5(this
                        .getPadFileResolver(),
                        TestFriendlyHanaRepositoryAccess
                                .TestFriendlyHanaRepositoryAccess2(this
                                        .__createProject()), source[0], 1, sel
                                .getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "#xxxx"), true);
            };
            TestsUnitHanaDdlParserV3.prototype.__createProject = function() {
                return {};
            };

//          TEST METHODS

            TestsUnitHanaDdlParserV3.prototype.testAllMethodsInSupportedVersions();

            QUnit.start();
        });