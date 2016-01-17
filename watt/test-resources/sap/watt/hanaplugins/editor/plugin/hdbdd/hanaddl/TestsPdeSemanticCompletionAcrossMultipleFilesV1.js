RequirePaths.setRequireJsConfigForHanaDdl(2);

// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
    [
        "hanaddl/hanaddlNonUi",
        "./TestUtilEclipseSelectionHandling",
        "./GrammarVersionDependentTests",
        "rndrt/rnd",
        "EclipseUtil",
        "./TestFriendlyHanaRepositoryAccess",
        "hanaddl/hanav1/CdsDdlParserResolver",
        "hanaddl/hanav2/CdsDdlParserResolver",
        "hanaddl/hanav3/CdsDdlParserResolver",
        "hanaddl/hanav4/CdsDdlParserResolver",
        "hanaddl/hanav5/CdsDdlParserResolver"
    ], //dependencies
    function (
        hanaddlNonUi,
        TestUtilEclipseSelectionHandling,
        GrammarVersionDependentTests,
        rnd,
        EclipseUtil,
        TestFriendlyHanaRepositoryAccess
        ) {
        var Utils = rnd.Utils;
        var VersionsFactory = hanaddlNonUi.VersionsFactory;
        var Messages = hanaddlNonUi.Messages;

        function TestsPdeSemanticCompletionAcrossMultipleFilesV1() {
        }
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype = Object.create(GrammarVersionDependentTests.prototype);
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.project=null;
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions = function() {
            return GrammarVersionDependentTests.oneParserVersionAsParameters(VersionsFactory.version1);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup = function() {


        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.createProject = function() {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.project=new EclipseUtil().createSimpleProject("" + new Date().getTime());
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.setup = function() {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.createProject();
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.teardown = function() {


        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown = function() {
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.multipleUsingDirectivesWithSameName = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                " entity entity1 { f1_using0 : Integer; }; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var file2 = "using1.hdbdd";
            var file2Content = "namespace fu1.tm1; " + //
                "context using1 { " + //
                " entity entity1 { f1_using1 : Integer; }; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file2,file2Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.entity1 as ali; " + //
                "using fu1.tm1::using1.entity1; " + //
                "context assoc_using0 { " + //
                " entity en { f1: type of entity1.#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[f1_using1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.entity1 as ali; " + "using fu1.tm1::using1.entity1; "+ "context assoc_using0 { "+ " entity en { f1: type of ali.#selection.begin.one##selection.end.one# }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[f1_using0]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.structureAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "type using0 { " + //
                "f1 : Integer; " + //
                "f2 : Integer; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.simpleTypeAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "type using0 : Integer;  ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.entityAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "entity using0 { f1: Integer; f2:Integer; };  ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: association to us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.viewAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "define view using0 as select from entity_unkwon { f1 };  ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: association to us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
            equal(rnd.Utils.arrayContains(completions, "{"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.typeAssociation = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1:Integer; am: assoc; tc : type of am.#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[f1]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.usingFirstNamespacePart = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::#selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.usingNoElements = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                " entity entity1 { id : Integer; name : Integer; };" + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.#selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.entity1.#selection.begin.one##selection.end.one# " + "context assoc_using0 { };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.using = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using #selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.#selection.begin.one##selection.end.one# " + "context assoc_using0 { };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.dontUseCompilationUnitCacheForCurrentFile = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "};" + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "type mytype :    type of my#selection.begin.one##selection.end.one# " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.resolveOverMultipleFiles = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "    entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to assoc_using0.entity5; " + //
                " };" + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var file2 = "using1.hdbdd";
            var file2Content = "namespace fu1.tm1; " + //
                "context assoc_using1 { " + //
                " 	entity en1 { " + //
                " 		key id : Integer; " + //
                " 		assoc_to_en1_1 : association to nested_en1; " + //
                " 	}; " + //
                " 	context nested { " + //
                " 		entity nested_en1 { " + //
                " 			key id : Integer; " + //
                " 			assoc_to_entity5 : association to entity5; " + //
                " 		}; " + //
                " 	}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file2,file2Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using2 { " + //
                "   define view av1 as select from en1.assoc_to_en1_1  { assoc_to_entity5.#selection.begin.one##selection.end.one# <> }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[asso4, key5]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.resolveExternalInDefineView = function() {
            var util = new EclipseUtil();
            var file1 = "using1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using1 { " + //
                " 	entity en1 { " + //
                " 		key id : Integer; " + //
                " 		assoc_to_en1_1 : association to nested_en1; " + //
                " 	}; view v1 as select from en1 { id }; " + //
                " 	context nested { " + //
                " 		entity nested_en1 { " + //
                " 			key id : Integer; " + //
                " 		};  view nested_v1 as select from nested_en1 { id };" + //
                " 	}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using2 { " + //
                "   define view av1 as select from  <>  {  }; " + //
                " 	define view av1 as select from en1. <>  {  }; " + //
                " 	define view av2 as select from nested_en1  {   <>  }; " + //
                " 	define view av3 as select from assoc_using1.nested.nested_en1  { #selection.begin.one##selection.end.one#  <>  }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from  <>  {  }; "+ " 	define view av1 as select from en1. <>  {  }; "+ " 	define view av2 as select from nested_en1  { #selection.begin.one##selection.end.one#  <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("id",completions[0]);
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from  <>  {  }; "+ " 	define view av1 as select from en1.#selection.begin.one##selection.end.one# <>  {  }; "+ " 	define view av2 as select from nested_en1  {   <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[assoc_to_en1_1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from #selection.begin.one##selection.end.one# <>  {  }; "+ " 	define view av1 as select from en1. <>  {  }; "+ " 	define view av2 as select from nested_en1  {   <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[av1, av2, av3, assoc_using2]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.resolveExternalEntitiesInAssociationTo = function() {
            var util = new EclipseUtil();
            var file1 = "using1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using1 { " + //
                " 	entity en1 { " + //
                " 		key id : Integer; " + //
                " 		assoc_to_en1_1 : association to nested_en1; " + //
                " 	}; view v1 as select from en1 { id }; " + //
                " 	context nested { " + //
                " 		entity nested_en1 { " + //
                " 			key id : Integer; " + //
                " 		};  view nested_v1 as select from nested_en1 { id };" + //
                " 	}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using2 { " + //
                " 	entity en2 { " + //
                " 		ass1 : association to  <> ; " + //
                " 		ass1 : association to en1. <> ; " + //
                " 		ass2 : association to assoc_using1. <>; " + //
                " 		ass3 : association to assoc_using1.nested.#selection.begin.one##selection.end.one# <>; " + //
                " 	}; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[nested_en1, nested_v1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to  <> ; "+ " 		ass1 : association to en1. <> ; "+ " 		ass2 : association to assoc_using1.#selection.begin.one##selection.end.one# <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[en1, v1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to  <> ; "+ " 		ass1 : association to en1.#selection.begin.one##selection.end.one# <> ; "+ " 		ass2 : association to assoc_using1. <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[assoc_to_en1_1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to #selection.begin.one##selection.end.one# <> ; "+ " 		ass1 : association to en1. <> ; "+ " 		ass2 : association to assoc_using1. <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[en2, assoc_using2]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.resolveExternalTypeOf = function() {
            var util = new EclipseUtil();
            var file1 = "using1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "" + //
                "context using1 { " + //
                "  " + //
                " 	type myType { " + //
                " 		struc1 : Integer; " + //
                " 		struc2 : Integer; " + //
                " 		struc3 : myType2;  " + //
                " 	}; " + //view v1 as select from en1 { id };
                " 	 " + //
                " 	type myType2 { " + //
                " 		aa : Integer; " + //
                " 		bb : myType3; " + //
                " 	}; " + //
                " 	 " + //
                " 	type myType3 { " + //
                " 		qq : using1.myType; " + //
                "	 	}; " + //
                "	 type hugo: using1.myType.struc3.bb.qq. " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using1.myType; " + //
                " " + //
                "context using2 { " + //
                " 	type mmm { " + //
                " 		mm : type of #selection.begin.one##selection.end.one#" + //
                " 	}; " + //
                " 	type mmm2 { " + //
                " 		a : melch2.struc.el5.str " + //
                " 	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[using2]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of using1.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[myType, myType2, myType3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of using1.myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.resolveExternalType = function() {
            var util = new EclipseUtil();
            var file1 = "using1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "" + //
                "context using1 { " + //
                "  " + //
                " 	type myType { " + //
                " 		struc1 : Integer; " + //
                " 		struc2 : Integer; " + //
                " 		struc3 : myType2;  " + //
                " 	}; " + //
                " 	 " + //
                " 	type myType2 { " + //
                " 		aa : Integer; " + //
                " 		bb : myType3; " + //
                " 	}; " + //
                " 	 " + //
                " 	type myType3 { " + //
                " 		qq : using1.myType; " + //
                "	 	}; " + //
                "	 type hugo: using1.myType.struc3.bb.qq. " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using1.myType; " + //
                " " + //
                "context using2 { " + //
                " 	type mmm { " + //
                " 		mm : type of using1.myType.struc3.bb.qq.#selection.begin.one##selection.end.one#" + //
                " 	}; " + //
                " 	type mmm2 { " + //
                " 		a : melch2.struc.el5.str " + //
                " 	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : myT#selection.begin.one##selection.end.one#ype.struc3.bb.qq."+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
            equal(rnd.Utils.arrayContains(completions, "::"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.duplicateEntitiesInMultipleFilesProposeAll = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " 	type simple : Integer; " + //
                " 	type structure { " + //
                " 		duplicates1_el : Integer; " + //
                " 	}; " + //
                " 	entity entity { " + //
                " 		duplicates1_el : Integer; " + //
                " 	}; " + //
                " 	context nested { " + //
                " 		entity nested_entity { " + //
                " 			duplicates1_el_entity : Integer; " + //
                " 		}; " + //
                " 		type nested_type { " + //
                " 			duplicates1_el_type : Integer; " + //
                " 		}; " + //
                " 	}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var file2 = "duplicates2.hdbdd";
            var file2Content = "namespace fu1.tm1; " + //
                "context duplicates2 { " + //
                " 	type simple : Integer; " + //
                " 	type structure { " + //
                " 		duplicates2_el : Integer; " + //
                " 	};" + //
                " 	entity entity { " + //
                " 		duplicates2_element : Integer; " + //
                " 	}; " + //
                " 	context nested { " + //
                " 		entity nested_entity { " + //
                " 			duplicates2_element : Integer; " + //
                " 		}; " + //
                " 		type nested_type { " + //
                " 			duplicates2_element : Integer; " + //
                " 		}; " + //
                " 	}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file2,file2Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  entity en { " + //
                "  	mmm : association to en#selection.begin.one##selection.end.one# " + //
                "  }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "en"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.duplicateEntitiesInMultipleFilesUsingDirective = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " 	type simple : Integer; " + //
                " 	type structure { " + //
                " 		duplicates1_el : Integer; " + //
                " 	}; " + //
                " 	entity entity { " + //
                " 		duplicates1_el : Integer; " + //
                " 	}; " + //
                " 	context nested { " + //
                " 		entity nested_entity { " + //
                " 			duplicates1_el_entity : Integer; " + //
                " 		}; " + //
                " 		type nested_type { " + //
                " 			duplicates1_el_type : Integer; " + //
                " 		}; " + //
                " 	}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var file2 = "duplicates2.hdbdd";
            var file2Content = "namespace fu1.tm1; " + //
                "context duplicates2 { " + //
                " 	type simple : Integer; " + //
                " 	type structure { " + //
                " 		duplicates2_el : Integer; " + //
                " 	};" + //
                " 	entity entity { " + //
                " 		duplicates2_element : Integer; " + //
                " 	}; " + //
                " 	context nested { " + //
                " 		entity nested_entity { " + //
                " 			duplicates2_element : Integer; " + //
                " 		}; " + //
                " 		type nested_type { " + //
                " 			duplicates2_element : Integer; " + //
                " 		}; " + //
                " 	}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file2,file2Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  entity en { " + //
                "  	mmm : type of entity.#selection.begin.one##selection.end.one# " + //
                "  }; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[duplicates2_element]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::duplicates2.entity as hugo;  " + "context duplicates_test { "+ "  entity en { "+ "  	mmm : type of hugo.#selection.begin.one##selection.end.one# "+ "  }; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates2_element]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "		using fu1.tm1::duplicates1.nested.nested_entity as hugo;  " + "		using fu1.tm1::duplicates1.nested.nested_type ; "+ "		context duplicates_test { "+ "		  entity en { "+ "		  	mmm : type of hugo.#selection.begin.one##selection.end.one# "+ "		  }; "+ "		};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates1_el_entity]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "		using fu1.tm1::duplicates1.nested.nested_entity as hugo;  " + "		using fu1.tm1::duplicates1.nested.nested_type ; "+ "		context duplicates_test { "+ "		  entity en { "+ "		  	mmm : type of nested_type.#selection.begin.one##selection.end.one# "+ "		  }; "+ "		};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates1_el_type]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.constFromExternalFile = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " const myConst : Integer = 3; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = my#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[" + Messages.BaseCdsDdlParser_list_incomplete_remove_syntax_errors_xmsg + "]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.constFromExternalFile2 = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " const myConst : Integer = 3; " + //
                " entity myEntity { a : Integer; };" + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = duplicates1.my#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[List incomplete. Remove syntax errors for optimal code completion.]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.constFromExternalFileAsTopLevelElement = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                " const duplicates1 : Integer = 3; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = du#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[List incomplete. Remove syntax errors for optimal code completion.]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.allContextsFromExternalFile = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1__2; " + //
                "context duplicates1 { " + //
                "entity entity1 { " + //
                "key k : Integer; " + //
                "}; " + //
                "context test2_nested { " + //
                "type simple:Integer; " + //
                "type struc { " + //
                "a : simple; " + //
                "b : simple; " + //
                "}; " + //
                " " + //
                "entity en1 { " + //
                "a : struc; " + //
                "b : simple; " + //
                "}; " + //
                " " + //
                "context test2_nested2 { " + //
                "entity en2 { " + //
                "a : Integer; " + //
                "b : struc; " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "};";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "						namespace fu1__2; " + //
                "context testWithSteffen { " + //
                "type ty : t#selection.begin.one##selection.end.one#";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "type of"),true);
            equal(rnd.Utils.arrayContains(completions, "testWithSteffen"),true);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.viewSelectListEntry = function() {
            var util = new EclipseUtil();
            var file1 = "using1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using1 { " + //
                " 	entity en1 { " + //
                " 		key id : Integer; " + //
                " 		assoc_to_en1_1 : association to nested_en1; " + //
                " 	}; view v1 as select from en1 { id }; " + //
                " 	context nested { " + //
                " 		entity nested_en1 { " + //
                " 			key id : Integer; " + //
                " 		};  view nested_v1 as select from nested_en1 { id };" + //
                " 	}; " + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using1.en1 as ali;" + //
                "context assoc_using2 { " + //
                " 	define view av3 as select from ali { #selection.begin.one##selection.end.one#    }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("assoc_to_en1_1",completions[1]);
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.en1 as ali;" + "context assoc_using2 { "+ " 	define view av3 as select from ali as al { al.i#selection.begin.one##selection.end.one#    }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),source[0],1,sel.getOffset() + 1);
            equal("id",completions[0]);
        };
        TestsPdeSemanticCompletionAcrossMultipleFilesV1.prototype.proposeNoAliasForTypeOf = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace myTest; " + //
                "context using0 { " + //
                " entity myEntity { f1_using0 : Integer; }; " + //
                " type mySimpleType : Integer; " + //
                " type myStrucType { f1: Integer; f2: Integer; } ;" + //
                " define view myView as select from entity { f1 };" + //
                "}; ";
            util.createFile(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project,file1,file1Content);
            var sourceWithSelections = "namespace myTest; " + //
                "using myTest::using0.myStrucType as aliasMyStrucType; " + //
                "type mySimpleType : type of #selection.begin.one##selection.end.one# " + //
                " ; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeSemanticCompletionAcrossMultipleFilesV1.project),
                source[0], 1,
                    sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };


//      TEST METHODS

        test("multipleUsingDirectivesWithSameName",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.multipleUsingDirectivesWithSameName();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("structureAsRootStatement",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.structureAsRootStatement();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("simpleTypeAsRootStatement",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.simpleTypeAsRootStatement();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("entityAsRootStatement",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.entityAsRootStatement();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("viewAsRootStatement",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.viewAsRootStatement();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("typeAssociation",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.typeAssociation();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("usingFirstNamespacePart",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.usingFirstNamespacePart();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("usingNoElements",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.usingNoElements();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("using",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.using();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("dontUseCompilationUnitCacheForCurrentFile",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.dontUseCompilationUnitCacheForCurrentFile();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("resolveOverMultipleFiles",function(assert) {
            var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.resolveOverMultipleFiles();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("resolveExternalInDefineView",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.resolveExternalInDefineView();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("resolveExternalEntitiesInAssociationTo",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.resolveExternalEntitiesInAssociationTo();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("resolveExternalTypeOf",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.resolveExternalTypeOf();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("resolveExternalType",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.resolveExternalType();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("duplicateEntitiesInMultipleFilesProposeAll",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.duplicateEntitiesInMultipleFilesProposeAll();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("duplicateEntitiesInMultipleFilesUsingDirective",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.duplicateEntitiesInMultipleFilesUsingDirective();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("constFromExternalFile",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.constFromExternalFile();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("constFromExternalFile2",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.constFromExternalFile2();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("constFromExternalFileAsTopLevelElement",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.constFromExternalFileAsTopLevelElement();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("allContextsFromExternalFile",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.allContextsFromExternalFile();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("viewSelectListEntry",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.viewSelectListEntry();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        test("proposeNoAliasForTypeOf",function(assert) {
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classSetup();
            var versions = TestsPdeSemanticCompletionAcrossMultipleFilesV1.parserVersions();
            for (var i=0;i<versions.length;i++) {
                var cut=new TestsPdeSemanticCompletionAcrossMultipleFilesV1();
                cut.version = versions[i][0].toString();
                cut.setup();
                cut.proposeNoAliasForTypeOf();
                cut.teardown();
            }
            TestsPdeSemanticCompletionAcrossMultipleFilesV1.classTearDown();
        });

        QUnit.start();
    }
);