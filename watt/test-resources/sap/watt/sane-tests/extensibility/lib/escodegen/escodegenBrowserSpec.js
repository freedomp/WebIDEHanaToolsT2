//  The SaneTestFramework should be imported via 'STF' path.
define(['STF',
		"sap/watt/lib/orion/ui/escodegen/escodegen.browser", "sap/watt/lib/orion/ui/esprima/esprima"],
	function (STF) {
		"use strict";

		describe('ESCodeGen', function () {
			describe('empty object', function () {
			    var inlineComments = [{type: "Line", value: "comment"}];
			    var stmt = {inlineComments: inlineComments, type: esprima.Syntax.ObjectExpression};

				it("has comment in empty object {//comment}", function () {
	
		            var origResult = "{}";
				    var actual = escodegen._addInlineComment(stmt, origResult);
				    var expected = ["{", "\n", "//comment\n", "}"];
		            expect(actual).to.deep.equal(expected);
				});
				
				it("empty object to which hook was injected with addHook() (bug 1570630069)", function () {
		            var origResult = ["{", "\n", " ", "extHookOnInit: function(i) {\n// Place your hook implementation code here\n}", "\n", "", "}"];
		            var actual = escodegen._addInlineComment(stmt, origResult.slice(0));// Send a clone of origResult
		            var expected = origResult.slice(0); // Clone
		            expected.splice(2, 0, "//comment\n"); // Insert the comment in index 2
		            expect(actual).to.deep.equal(expected);
				});
			});
			
			it("object with multiple comments: {\n // 1\n // 2 \n // 3\n // 4 \n}", function () {			
	            var origResult = "{}";
			    var inlineComments = [{type: "Line", value: "1"},
			                      {type: "Line", value: "2"},
			                      {type: "Line", value: "3"},
			                      {type: "Line", value: "4"}];
			    var stmt = {inlineComments: inlineComments,
			                type: esprima.Syntax.ObjectExpression};            
	            var actual = escodegen._addInlineComment(stmt, origResult);
	            var expected = ["{", "\n", "//1\n", "//2\n","//3\n","//4\n", "}"];
	            expect(actual).to.deep.equal(expected);
			});
		});
	});