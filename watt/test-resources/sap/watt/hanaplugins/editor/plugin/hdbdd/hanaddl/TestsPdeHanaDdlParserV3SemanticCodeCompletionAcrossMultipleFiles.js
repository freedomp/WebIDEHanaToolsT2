RequirePaths.setRequireJsConfigForHanaDdl(2);

//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
		[
		 "./TestUtilEclipseSelectionHandling",
		 "EclipseUtil",
		 "rndrt/rnd",
		 "./AbstractV3HanaDdlParserTests",
         "./TestFriendlyHanaRepositoryAccess",
		 "./System"
		 ], //dependencies
		 function (
				 TestUtilEclipseSelectionHandling,
				 EclipseUtil,
				 rnd,
				 AbstractV3HanaDdlParserTests,
                 TestFriendlyHanaRepositoryAccess,
				 System
		 ) {
			var Utils = rnd.Utils;
			function TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles() {
			}
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project=null;
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.createProject = function() {
				TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project=new EclipseUtil().createSimpleProject("" + System.currentTimeMillis());
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.setup = function() {
				TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.createProject();
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.teardown = function() {
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.coCoWithDataSourceNameAsFirstPathEntryInViewSelectList = function() {
                var util = new EclipseUtil();
                var file1 = "a1.hdbdd";
                var file1Content = "namespace fu1.tm1; " + //
                 "context a1 { " + //
                 " entity en1 { f1:Integer;f2:Integer; };" + //
                 "}; ";
                util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project,file1,file1Content);
                var sourceWithSelections = "context ctx {								" + //
                 "    define view v as select from a1.en1 {                         " +//
                 "      en1.#selection.one#                                         " +//
                 "    };                                                            " + //
                 " };";
                var source = [""];
                var selections = {};
                TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
                var sel = selections["one"];
                var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project),
                 source[0], 1, sel.getOffset() + 1);
                equal(rnd.Utils.arrayContains(completions, "f1"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.cocoEnumIdOverloadingPrimitiveType = function() {
				var util = new EclipseUtil();
				var file1 = "a1.hdbdd";
				var file1Content = "namespace fu1.tm1; " + //
				"context a1 { " + //
				" const INTEGER = 3; " + //
				"}; ";
				util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project,file1,file1Content);
				var sourceWithSelections = "context ctx {								" + //
				"context hana {														" + //
				"	const REAL = 2;                                                 " + //
				"};                                                                 " + //
				"type my7a : Integer enum { yyy = 1; xxxx=2; zzz=3; } ;             " + //
				"type my7b : hana.REAL enum { RE = 1; xxxx=2; zzz=3; } ;            " + //
				"type ttt {                                                         " + //
				"    a7a : my7a default #xxxx;                                      " + //
				"    b7a : type of a7a default    ##selection.one#   ;				" + //
				"    b7b : type of struc.en default #aaaaa;                         " + //
				"    c : Integer enum { aaaaa = 1;oo=2; } default #aaaaa;           " + //
				"    d : type of c default #aaaaa;                                  " + //
				"};							                                        " + //
				" };";
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project),
						source[0], 1, sel.getOffset() + 1);
				equal(rnd.Utils.arrayContains(completions, "#yyy"),true);
				equal(rnd.Utils.arrayContains(completions, "#xxxx"),true);
				equal(rnd.Utils.arrayContains(completions, "#zzz"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.cocoEnumIdOverloadingPrimitiveNewHanaType = function() {
				var sourceWithSelections = "context ctx {								" + //
				"context hana {														" + //
				"	const REAL = 2;                                                 " + //
				"};                                                                 " + //
				"type my7a : Integer enum { yyy = 1; xxxx=2; zzz=3; } ;             " + //
				"type my7b : hana.REAL enum { RE = 1; xxxx=2; zzz=3; } ;            " + //
				"type ttt {                                                         " + //
				"    a7a : my7a default #xxxx;                                      " + //
				"    b7a : type of a7a default    #xxxx   ;                         " + //
				"    a8a : my7b default #RE ;                                       " + //
				"    bbb : type of a8a default ##selection.one# ;					" + //
				"    b7b : type of struc.en default #aaaaa;                         " + //
				"    c : Integer enum { aaaaa = 1;oo=2; } default #aaaaa;           " + //
				"    d : type of c default #aaaaa;                                  " + //
				"};							                                        " + //
				" };";
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project),
						source[0], 1,
						sel.getOffset() + 1);
				equal(rnd.Utils.arrayContains(completions, "#RE"),true);
				equal(rnd.Utils.arrayContains(completions, "#xxxx"),true);
				equal(rnd.Utils.arrayContains(completions, "#zzz"),true);
			};
			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.cocoAspectNameShownOnce = function() {
				var util = new EclipseUtil();
				var file1 = "a1.hdbdd";
				var file1Content = "namespace fu1.tm1; " + //
				"context a1 { " + //
				" const INTEGER = 3; " + //
				"}; ";
				util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project,file1,file1Content);
				var sourceWithSelections = "namespace playground.melcher; " + //
				"using playground.melcher::dcl_base.salesOrderView; " + //
				"using playground.melcher::dcl_base.address; " + //
				"define AccessPolicy dcl_test { " + //
				"define aspect aspCountry as " + //
				"select from address {   address.country } " + //
				"where id in ( toemployee.login_name ); " + //
				"define role myRole { " + //
				"grant select on salesOrderView where addressId = aspect #selection.one#";
				var file2 = "dcl_test.hdbdd";
				util.createFile(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project,file2,sourceWithSelections);
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = this.getParser().getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2(TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.project),
						source[0], 1, sel.getOffset() + 1);
				equal(true,rnd.Utils.arrayContains(completions, "aspCountry"));
				rnd.Utils.arrayRemove(completions, "aspCountry");
				equal(false,rnd.Utils.arrayContains(completions, "aspCountry"));
			};


//			TEST METHODS

			TestsPdeHanaDdlParserV3SemanticCodeCompletionAcrossMultipleFiles.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		}
);