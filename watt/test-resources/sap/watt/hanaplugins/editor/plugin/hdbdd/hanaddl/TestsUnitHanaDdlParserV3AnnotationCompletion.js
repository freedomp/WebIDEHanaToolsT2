RequirePaths.setRequireJsConfigForHanaDdl(2);
//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
define(
		[
"./TestUtilEclipseSelectionHandling",
//"../hanaddl/TestFriendlyHanaRepositoryAccess",
"./AbstractV3HanaDdlParserTests",
"./TestFriendlyHanaRepositoryAccess",
"rndrt/rnd"
], //dependencies
function (
		TestUtilEclipseSelectionHandling,
		AbstractV3HanaDdlParserTests,
        TestFriendlyHanaRepositoryAccess,
		rnd
) {
			var Utils = rnd.Utils;
			function TestsUnitHanaDdlParserV3AnnotationCompletion() {
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype = Object.create(AbstractV3HanaDdlParserTests.prototype);
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInFronOfErrorneousAspectWhenAtAlreadyThere = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 { " + //
				"	@#selection.begin.one##selection.end.one# " + //
				"	ASPECT asp1 AS SELECT FROM Customer {Customer.id} WHERE $user IN Customer.name; " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInFronOfErrorneousAspect = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 { " + //
				"	#selection.begin.one##selection.end.one# " + //
				"	ASPECT asp1 AS SELECT FROM Customer {Customer.id} WHERE $user IN Customer.name; " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoAnnotationCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInFrontOfErrorneousRoleWhenAtAlreadyThere = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 { " + //
				"@#selection.begin.one##selection.end.one# " + //
				"ROLE r1 {} " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInFrontOfErrorneousRole = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 { " + //
				"#selection.begin.one##selection.end.one# " + //
				"ROLE r1 {} " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoAnnotationCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInsideRoleWhenAtAlreadyThere = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 " + //
				"{ " + //
				"	ROLE r1 { " + //
				"		@#selection.begin.one##selection.end.one# " + //
				"	} " + //
				"};";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInsideRole = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 " + //
				"{ " + //
				"	ROLE r1 { " + //
				"		#selection.begin.one##selection.end.one# " + //
				"	} " + //
				"};";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoAnnotationCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInsideAspectWhenAtAlreadyThere = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 " + //
				"{ " + //
				"	ASPECT asp1 AS SELECT FROM Customer {" + //
				"	  @#selection.begin.one##selection.end.one# " + //
				"	  Customer.id " + //
				"	} WHERE $user IN Customer.name; " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.noAnnotationsProposedInsideAspect = function() {
				var parser = this.getParser();
				parser.setSupportedAnnotations(this.getSupportedAnnotations());
				var sourceWithSelections = "ACCESSPOLICY dcl1 " + //
				"{ " + //
				"	ASPECT asp1 AS SELECT FROM Customer {" + //
				"	  #selection.begin.one##selection.end.one# " + //
				"	  Customer.id " + //
				"	} WHERE $user IN Customer.name; " + //
				"}; ";
				var completions = this.__getCompletions(parser, sourceWithSelections);
				this.assertNoAnnotationCompletions(completions);
			};
			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.__getCompletions = function(parser,sourceWithSelections) {
				var source = [""];
				var selections = {};
				TestUtilEclipseSelectionHandling.extractSelectionsFromContent(sourceWithSelections,source,selections);
				var sel = selections["one"];
				var completions = parser.getCompletions5(this.getPadFileResolver(), TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1(), source[0], 1,
						sel.getOffset() + 1);
				return completions;
			};


//			TEST METHODS

			TestsUnitHanaDdlParserV3AnnotationCompletion.prototype.testAllMethodsInSupportedVersions();

			QUnit.start();
		}
);