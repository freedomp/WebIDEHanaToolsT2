define(["sap/watt/ideplatform/plugin/basevalidator/util/AnnotationsHelper"], function (annotationHelper) {
	var oIssueInfo = {
		category: "Format Issue", checker: "ESLint", column: 1, helpUrl: "http://google.com", line: 11,
		message: "INFO:TO FORMAT MOCK BLABLA", path: "/test/test.js", ruleId: "space - infix - ops ", severity: "info",
		source: "this.x = 4 "
	};
	var oIssueWarning = {
		category: "Stylistic Issue", checker: "ESLint", column: 0, helpUrl: "http://sap.com", line: 30,
		message: "WARNING: DODO", path: "/test/test.js", ruleId: "space - infix - ops ", severity: "warning",
		source: "this.x = 4 "
	};
	var oIssueError = {
		category: "Stylistic Issue", checker: "ESLint", column: 0, helpUrl: "http://www.facebook.com", line: 30,
		message: "ERROR: DODO", path: "/test/test.js", ruleId: "space - infix - ops ", severity: "error",
		source: "this.x = 4 "
	};
	var aIssuesAll = [oIssueWarning, oIssueInfo, oIssueError];

	describe("Annotation helper test", function () {


		it("test order annotation in correct order", function () {
			var aSort = annotationHelper._sortIssues(aIssuesAll);
			expect(aSort[0].severity).to.equal("error");
			expect(aSort[1].severity).to.equal("warning");
			expect(aSort[2].severity).to.equal("info");
			aSort = annotationHelper._sortIssues([oIssueInfo]);
			expect(aSort.length).to.equal(1);
		});

		it("tests handling wrong input", function () {
			var aa = annotationHelper._sortIssues([]);
			expect(aa.length).to.equal(0);
			var fn = function () {
				annotationHelper._sortIssues(null);
			};
			expect(fn).to.throw(Error);
		});


		it("test annotation structure and convergence", function () {
			var aIssues = [oIssueInfo, oIssueError];
			var aAnnotations = annotationHelper._createAnnotations(aIssues);
			var annotation = aAnnotations[1];
			var checker = oIssueInfo.checker || "";
			var ruleIdText = oIssueInfo.ruleId !== undefined ? "(" + oIssueInfo.ruleId + ") " : "";
			var message = checker + ruleIdText + ": " + oIssueInfo.message;

			expect(annotation.row).to.equal(oIssueInfo.line - 1);
			expect(annotation.column).to.equal(oIssueInfo.column - 1);
			expect(annotation.text).to.equal(oIssueInfo.severity + ": " + oIssueInfo.category + ": " + message);
			expect(annotation.ruleId).to.equal(oIssueInfo.ruleId);
			expect(annotation.type).to.equal(oIssueInfo.severity);
			expect(annotation.help).to.equal(oIssueInfo.helpUrl);
			expect(annotation.source).to.equal(oIssueInfo.source);
			expect(annotation.checker).to.equal(oIssueInfo.checker);
			expect(annotation.category).to.equal(oIssueInfo.category);
			expect(annotation.path).to.equal(oIssueInfo.path);
			expect(aAnnotations.length).to.equal(aIssues.length);
		});
	});

});
