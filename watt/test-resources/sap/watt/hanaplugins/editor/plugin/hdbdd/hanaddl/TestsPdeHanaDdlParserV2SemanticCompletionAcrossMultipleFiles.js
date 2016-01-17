/*eslint-disable no-eq-null,eqeqeq,camelcase,max-statements,complexity,quotes,curly,max-params,max-len,no-redeclare,no-empty,no-octal-escape,no-fallthrough,radix,no-proto,no-new-wrappers*/
RequirePaths.setRequireJsConfigForHanaDdl(2);

// based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
    [
        "./TestUtilEclipseSelectionHandling",
        "EclipseUtil",
        "rndrt/rnd",
        "./AbstractV2HanaDdlParserTests",
        "./TestFriendlyHanaRepositoryAccess"
    ], //dependencies
    function (
        TestUtilEclipseSelectionHandling,
        EclipseUtil,
        rnd,
        AbstractV2HanaDdlParserTests,
        TestFriendlyHanaRepositoryAccess
        ) {
        var Utils = rnd.Utils;
        function TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles() {
        }
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype = Object.create(AbstractV2HanaDdlParserTests.prototype);
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project=null;
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.createProject = function() {
            TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project=new EclipseUtil().createSimpleProject("" + new Date().getTime());
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.setup = function() {
            TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.createProject();
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.teardown = function() {


        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.multipleUsingDirectivesWithSameName = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                " entity entity1 { f1_using0 : Integer; }; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var file2 = "using1.hdbdd";
            var file2Content = "namespace fu1.tm1; " + //
                "context using1 { " + //
                " entity entity1 { f1_using1 : Integer; }; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file2,file2Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[f1_using1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.entity1 as ali; " + "using fu1.tm1::using1.entity1; "+ "context assoc_using0 { "+ " entity en { f1: type of ali.#selection.begin.one##selection.end.one# }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[f1_using0]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.structureAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "type using0 { " + //
                "f1 : Integer; " + //
                "f2 : Integer; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "using0"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.simpleTypeAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "type using0 : Integer;  ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "using0"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.entityAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "entity using0 { f1: Integer; f2:Integer; };  ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: association to us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "using0"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.viewAsRootStatement = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "define view using0 as select from entity_unkwon { f1 };  ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1: association to us#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "using0"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.typeAssociation = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.assoc; " + //
                "context assoc_using0 { " + //
                " entity en { f1:Integer; am: assoc; tc : type of am.#selection.begin.one##selection.end.one# }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[f1]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.usingFirstNamespacePart = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::#selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[using0]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.usingNoElements = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                " entity entity1 { id : Integer; name : Integer; };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using0.#selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[entity1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.entity1.#selection.begin.one##selection.end.one# " + "context assoc_using0 { };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.using = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context using0 { " + //
                "type assoc: association to entity1; " + //
                " entity entity1 { f1:Integer;}; " + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using #selection.begin.one##selection.end.one# " + //
                "context assoc_using0 { };";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[fu1.tm1::using0.assoc, fu1.tm1::using0.entity1, fu1.tm1::using0]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using0.#selection.begin.one##selection.end.one# " + "context assoc_using0 { };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[assoc, entity1]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.dontUseCompilationUnitCacheForCurrentFile = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "type myStruc2 { " + //
                "struc2_1 : Integer; " + //
                "field2 : String(10); " + //
                "};" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "type mytype :    type of my#selection.begin.one##selection.end.one# " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "."),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.resolveOverMultipleFiles = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context assoc_using0 { " + //
                "    entity entity5 { " + //
                " 	key key5 : Integer; " + //
                " 	asso4 : association to assoc_using0.entity5; " + //
                " };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file2,file2Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context assoc_using2 { " + //
                "   define view av1 as select from en1.assoc_to_en1_1  { assoc_to_entity5.#selection.begin.one##selection.end.one# <> }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "asso4"),true);
            equal(rnd.Utils.arrayContains(completions, "key5"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.resolveExternalInDefineView = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "id"),true);
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from  <>  {  }; "+ " 	define view av1 as select from en1. <>  {  }; "+ " 	define view av2 as select from nested_en1  { #selection.begin.one##selection.end.one#  <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("id",completions[0]);
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from  <>  {  }; "+ " 	define view av1 as select from en1.#selection.begin.one##selection.end.one# <>  {  }; "+ " 	define view av2 as select from nested_en1  {   <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[assoc_to_en1_1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ "   define view av1 as select from #selection.begin.one##selection.end.one# <>  {  }; "+ " 	define view av1 as select from en1. <>  {  }; "+ " 	define view av2 as select from nested_en1  {   <>  }; "+ " 	define view av3 as select from assoc_using1.nested.nested_en1  {   <>  }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "av1"),true);
            equal(rnd.Utils.arrayContains(completions, "av2"),true);
            equal(rnd.Utils.arrayContains(completions, "av3"),true);
            equal(rnd.Utils.arrayContains(completions, "en1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested_en1"),true);
            equal(rnd.Utils.arrayContains(completions, "nested_v1"),true);
            equal(rnd.Utils.arrayContains(completions, "v1"),true);
            equal(rnd.Utils.arrayContains(completions, "assoc_using1"),true);
            equal(rnd.Utils.arrayContains(completions, "assoc_using2"),true);
            equal(rnd.Utils.arrayContains(completions, "nested"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.resolveExternalEntitiesInAssociationTo = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[nested_en1, nested_v1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to  <> ; "+ " 		ass1 : association to en1. <> ; "+ " 		ass2 : association to assoc_using1.#selection.begin.one##selection.end.one# <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[en1, v1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to  <> ; "+ " 		ass1 : association to en1.#selection.begin.one##selection.end.one# <> ; "+ " 		ass2 : association to assoc_using1. <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[assoc_to_en1_1]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "context assoc_using2 { "+ " 	entity en2 { "+ " 		ass1 : association to #selection.begin.one##selection.end.one# <> ; "+ " 		ass1 : association to en1. <> ; "+ " 		ass2 : association to assoc_using1. <>; "+ " 		ass3 : association to assoc_using1.nested. <>; "+ " 	}; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[en1, en2, nested_en1, nested_v1, v1, assoc_using1, assoc_using2, nested]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.resolveExternalTypeOf = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using1.myType; " + //
                " " + //
                "context using2 { " + //
                " 	type mmm { " + //
                " 		mm : type of #selection.begin.one##selection.end.one#" + //
                " 	}; " + //
                " 	type mmm2 { " + //
                " 		a : melch2.struc.el5.str; " + //
                " 	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[mmm2, myType, myType2, myType3, using1, using2]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of using1.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[myType, myType2, myType3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of using1.myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.resolveExternalType = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : type of myType.struc3.bb.qq.#selection.begin.one##selection.end.one#"+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[struc1, struc2, struc3]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.myType; " + " "+ "context using2 { "+ " 	type mmm { "+ " 		mm : myT#selection.begin.one##selection.end.one#ype.struc3.bb.qq."+ " 	}; "+ " 	type mmm2 { "+ " 		a : melch2.struc.el5.str "+ " 	}; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myType"),true);
            equal(rnd.Utils.arrayContains(completions, "myType2"),true);
            equal(rnd.Utils.arrayContains(completions, "myType3"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.duplicateEntitiesInMultipleFilesProposeAll = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file2,file2Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "en"),true);
            equal(rnd.Utils.arrayContains(completions, "entity"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.duplicateEntitiesInMultipleFilesUsingDirective = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file2,file2Content);
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
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[duplicates2_element]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::duplicates2.entity as hugo;  " + "context duplicates_test { "+ "  entity en { "+ "  	mmm : type of hugo.#selection.begin.one##selection.end.one# "+ "  }; "+ "};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates2_element]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "		using fu1.tm1::duplicates1.nested.nested_entity as hugo;  " + "		using fu1.tm1::duplicates1.nested.nested_type ; "+ "		context duplicates_test { "+ "		  entity en { "+ "		  	mmm : type of hugo.#selection.begin.one##selection.end.one# "+ "		  }; "+ "		};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates1_el_entity]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace fu1.tm1; " + "		using fu1.tm1::duplicates1.nested.nested_entity as hugo;  " + "		using fu1.tm1::duplicates1.nested.nested_type ; "+ "		context duplicates_test { "+ "		  entity en { "+ "		  	mmm : type of nested_type.#selection.begin.one##selection.end.one# "+ "		  }; "+ "		};";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[duplicates1_el_type]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.constFromExternalFile = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " const myConst : Integer = 3; " + //
                "};";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = my#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myConst"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.constFromExternalFile2 = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                "context duplicates1 { " + //
                " const myConst : Integer = 3; " + //
                " entity myEntity { a : Integer; };" + //
                "};";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = duplicates1.my#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "myConst"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.constFromExternalFileAsTopLevelElement = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1.tm1; " + //
                " const duplicates1 : Integer = 3; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::duplicates2.entity;  " + //
                "context duplicates_test { " + //
                "  	const mmm : Integer = du#selection.begin.one##selection.end.one# " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "duplicates1"),true);
            equal(rnd.Utils.arrayContains(completions, "duplicates_test"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.allContextsFromExternalFile = function() {
            var util = new EclipseUtil();
            var file1 = "duplicates1.hdbdd";
            var file1Content = "namespace fu1__2; " + //
                "context duplicates1 { " + //
                "entity entity1 { " + //
                "key k : Integer; " + //
                "}; " + //
                "context xtest2_nested { " + //
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
                "context xtest2_nested2 { " + //
                "entity en2 { " + //
                "a : Integer; " + //
                "b : struc; " + //
                "}; " + //
                "}; " + //
                "}; " + //
                "};";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "						namespace fu1__2; " + //
                "context xtestWithSteffen { " + //
                "type ty : x#selection.begin.one##selection.end.one#";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "xtest2_nested"),true);
            equal(rnd.Utils.arrayContains(completions, "xtest2_nested2"),true);
            equal(rnd.Utils.arrayContains(completions, "xtestWithSteffen"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.viewSelectListEntry = function() {
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
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "using fu1.tm1::using1.en1 as ali;" + //
                "context assoc_using2 { " + //
                " 	define view av3 as select from ali { #selection.begin.one##selection.end.one#    }; " + //
                "}; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("assoc_to_en1_1",completions[1]);
            sourceWithSelections="namespace fu1.tm1; " + "using fu1.tm1::using1.en1 as ali;" + "context assoc_using2 { "+ " 	define view av3 as select from ali as al { al.i#selection.begin.one##selection.end.one#    }; "+ "}; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("id",completions[0]);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.proposeAliasForTypeOf = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace myTest; " + //
                "context using0 { " + //
                " entity myEntity { f1_using0 : Integer; }; " + //
                " type mySimpleType : Integer; " + //
                " type myStrucType { f1: Integer; f2: Integer; } ;" + //
                " define view myView as select from entity { f1 };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace myTest; " + //
                "using myTest::using0.myStrucType as aliasMyStrucType; " + //
                "type mySimpleType : type of #selection.begin.one##selection.end.one# " + //
                " ; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[aliasMyStrucType, myEntity, myStrucType, myView, using0]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myView as aliasMyView; " + "type mySimpleType : type of #selection.begin.one##selection.end.one# "+ " ; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[aliasMyView, myEntity, myStrucType, myView, using0]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myEntity as aliasMyEntity; " + "type mySimpleType : type of #selection.begin.one##selection.end.one# "+ " ; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[aliasMyEntity, myEntity, myStrucType, myView, using0]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myEntity as aliasMyEntity; " + "using myTest::using0.myView as aliasMyView; "+ "using myTest::using0.myStrucType as aliasMyStrucType; "+ "type myStruc { element : type of #selection.begin.one##selection.end.one# };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[aliasMyEntity, aliasMyStrucType, aliasMyView, myEntity, myStrucType, myView, using0]",rnd.Utils.arrayToString(completions));
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myEntity as aliasMyEntity; " + "using myTest::using0.myView as aliasMyView; "+ "using myTest::using0.myStrucType as aliasMyStrucType; "+ "entity ent1 { key f1 : Integer; element : type of #selection.begin.one##selection.end.one# }; ";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal("[aliasMyEntity, aliasMyStrucType, aliasMyView, f1, myEntity, myStrucType, myView, using0]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.proposeAliasForType = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace myTest; " + //
                "context using0 { " + //
                " entity myEntity { f1_using0 : Integer; }; " + //
                " type mySimpleType : Integer; " + //
                " type myStrucType { f1: Integer; f2: Integer; } ;" + //
                " define view myView as select from entity { f1 };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace myTest; " + //
                "using myTest::using0.myView as aliasMyView; " + //
                "using myTest::using0.mySimpleType as aliasMySimpleType; " + //
                "using myTest::using0.myStrucType as aliasMyStrucType; " + //
                "type mySimpleType : #selection.begin.one##selection.end.one# " + //
                " ; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aliasMySimpleType"),true);
            equal(rnd.Utils.arrayContains(completions, "aliasMyStrucType"),true);
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myView as aliasMyView; " + "using myTest::using0.mySimpleType as aliasMySimpleType; "+ "using myTest::using0.myStrucType as aliasMyStrucType; "+ "type myStruc4 { element : #selection.begin.one##selection.end.one# };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aliasMySimpleType"),true);
            equal(rnd.Utils.arrayContains(completions, "aliasMyStrucType"),true);
            sourceWithSelections="namespace myTest; " + "using myTest::using0.myView as aliasMyView; " + "using myTest::using0.mySimpleType as aliasMySimpleType; "+ "using myTest::using0.myStrucType as aliasMyStrucType; "+ "entity ent4 { key f1 : Integer; element : #selection.begin.one##selection.end.one# };";
            source=[""];
            selections={};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            sel=selections["one"];
            completions=this.getParser().getCompletions5(this.getPadFileResolver(),TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project),source[0],1,sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aliasMySimpleType"),true);
            equal(rnd.Utils.arrayContains(completions, "aliasMyStrucType"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.proposeAliasInDefineView = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace myTest; " + //
                "context using0 { " + //
                " entity myEntity { f1_using0 : Integer; }; " + //
                " type mySimpleType : Integer; " + //
                " type myStrucType { f1: Integer; f2: Integer; } ;" + //
                " define view myView as select from entity { f1 };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace myTest; " + //
                "using myTest::using0.myView as aliasMyView; " + //
                "using myTest::using0.mySimpleType as aliasMySimpleType; " + //
                "using myTest::using0.myStrucType as aliasMyStrucType; " + //
                "using myTest::using0.myEntity as aliasMyEntity; " + //
                "define view testView as select from #selection.begin.one##selection.end.one# { f1 }; ";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "aliasMyEntity"),true);
            equal(rnd.Utils.arrayContains(completions, "aliasMyView"),true);
            equal(rnd.Utils.arrayContains(completions, "myEntity"),true);
            equal(rnd.Utils.arrayContains(completions, "myView"),true);
            equal(rnd.Utils.arrayContains(completions, "using0"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.proposeAliasForAssoc = function() {
            var util = new EclipseUtil();
            var file1 = "using0.hdbdd";
            var file1Content = "namespace myTest; " + //
                "context using0 { " + //
                " entity myEntity { f1_using0 : Integer; }; " + //
                " type mySimpleType : Integer; " + //
                " type myStrucType { f1: Integer; f2: Integer; } ;" + //
                " define view myView as select from entity { f1 };" + //
                "}; ";
            util.createFile(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project,file1,file1Content);
            var sourceWithSelections = "namespace myTest; " + //
                "using myTest::using0.myView as aliasMyView; " + //
                "using myTest::using0.mySimpleType as aliasMySimpleType; " + //
                "using myTest::using0.myStrucType as aliasMyStrucType; " + //
                "using myTest::using0.myEntity as aliasMyEntity; " + //
                "context cont1 {" + //
                "context nested1 {" + //
                "context nested11{ " + //
                "entity entity1 {" + //
                "key id : Integer;" + //
                "assoc1: association to #selection.begin.one##selection.end.one# ;" + //
                "};" + //
                "};" + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal("[aliasMyEntity, aliasMyView, entity1, myEntity, myView, cont1, nested1, nested11, using0]",rnd.Utils.arrayToString(completions));
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.cocoEnum = function() {
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::test3.const123; " + //
                "context enums { " + //
                " " + //
                "	type myType : Integer enum { S1 = 1; S2 = 2;}; " + //
                "  " + //
                "  	entity a { " + //
                "  		key k : Integer; " + //
                "  		el2 : myType default #selection.begin.one##selection.end.one# " + //
                "  	}; " + //
                "  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "#S1"),true);
            equal(rnd.Utils.arrayContains(completions, "#S2"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.cocoEnum2 = function() {
            var sourceWithSelections = "namespace fu1__2; " + //
                "using fu1__2::test3.const123; " + //
                "context enums { " + //
                " " + //
                "	type myType : Integer enum { S1 = 1; S2 = 2;}; " + //
                "  " + //
                "  	entity a { " + //
                "  		key k : Integer; " + //
                "  		el2 : myType default ##selection.begin.one##selection.end.one# " + //
                "  	}; " + //
                "  " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(rnd.Utils.arrayContains(completions, "#S1"),true);
            equal(rnd.Utils.arrayContains(completions, "#S2"),true);
        };
        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.cocoTypeAndElementHaveSameNameNoStackoverflow = function() {
            this.getParser().setSupportedAnnotations(this.getSupportedAnnotations());
            var sourceWithSelections = "namespace fu1.tm1; " + //
                "context rec1 { " + //
                "   type distanceMeasure : String(5); " + //
                "	entity en1 { " + //
                "        person : person_id default '1' ; " + //
                "        distanceMeasure : distanceMeasure default #selection.begin.one##selection.end.one#'km'; " + //
                "		 " + //
                "	}; " + //
                "};";
            var source = [""];
            var selections = {};
            TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
            var sel = selections["one"];
            var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.project), source[0], 1,
                    sel.getOffset() + 1);
            equal(Utils.arrayIsEmpty(completions),false);
        };

//      TEST METHODS

        TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles.prototype.testAllMethodsInSupportedVersions();

        QUnit.start();
        return TestsPdeHanaDdlParserV2SemanticCompletionAcrossMultipleFiles;
    }
);