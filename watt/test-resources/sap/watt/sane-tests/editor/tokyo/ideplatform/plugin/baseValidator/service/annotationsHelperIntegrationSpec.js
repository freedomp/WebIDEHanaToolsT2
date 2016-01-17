define(["STF", "sap/watt/ideplatform/plugin/basevalidator/util/AnnotationsHelper", "sinon"], function(STF, annotationHelper, sinon){

	describe('AnnotationsHelper integration test ', function () {
		var oAceEditorService;
		var oContentService;
		var oAceEditorControl;
		var suiteName = "AnnotationsHelper_Integration";
		var oIssueInfo;
		var oIssueError;
		var MockFileDocument;
		var sandbox;
		var sap;
		var oDoc;


		before(function () {
			return STF.startWebIde(suiteName)
				.then(function (webIdeWindowObj) {
					sap = webIdeWindowObj.sap;
					createFixturesDiv(webIdeWindowObj);
					sandbox = sinon.sandbox.create();
					oAceEditorService = STF.getService(suiteName, "aceeditor");
					oContentService = STF.getService(suiteName, "content");
					oIssueInfo = { category: "Format Issue", checker: "ESLint", column: 1, helpUrl: "http://google.com", line: 11, message: "INFO:TO FORMAT MOCK BLABLA", path: "/test/test.js", ruleId: "space - infix - ops ", severity: "info", source: "this.x = 4 "};
					oIssueError = { category: "Stylistic Issue", checker: "ESLint", column: 0, helpUrl: "http://www.facebook.com", line: 30, message: "ERROR: DODO", path: "/test/test.js", ruleId: "space - infix - ops ", severity: "error", source: "this.x = 4 "};
					return oAceEditorService.getContent()
						.then(function(_oAceEditorControl){
							oAceEditorControl = _oAceEditorControl;
							return STF.require(suiteName, ["sane-tests/util/mockDocument"])
								.spread(function(mockDocument){
									MockFileDocument = mockDocument.MockFileDocument;
								});
						});

				});



		});

		beforeEach(function() {
			oDoc  = new MockFileDocument("dev/null", "js", "content", "proj");//dev/null
			sandbox.stub(oContentService, "getCurrentDocument").returns(Q(oDoc));
			oAceEditorControl.placeAt("fixtures");
			sap.ui.getCore().applyChanges();
			return oAceEditorService.open(oDoc);
		});

		afterEach(function() {
			return oAceEditorService.close(oDoc).then(function() {
				jQuery("#fixtures").empty();
				sandbox.restore();
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});


		function createFixturesDiv(webIdeWindowObj) {
			var fixturesDiv = webIdeWindowObj.document.createElement("div");
			fixturesDiv.id = "fixtures";
			fixturesDiv.style.display = "none";
			fixturesDiv.style.visibility = "hidden";
			webIdeWindowObj.document.body.appendChild(fixturesDiv);
		}


		it("Editor Base Validator Annotation Integration- set and get Possitive Annotations", function() {
			var expectedAnnotations = 2;
			var aIssues = {root : {},issues: [oIssueInfo, oIssueError]}; // mock array of issues, which should be create on the editor
				return oDoc.getContent()
						.then(function(docContent){
							return annotationHelper.updateAnnotations(oContentService, docContent, aIssues, {document: oDoc, editor: oAceEditorService})
								.then(function() {
									return oAceEditorService.getAnnotations()
										.then(function(result){
											expect(result.length,"editor should have 2 annotations").to.equal(expectedAnnotations);
										});
								});
				});

		});

		it("Editor Base Validator Annotation Integration- set 0 annotations to editor", function() {
			var aIssues = {root : {},issues: []}; // mock array of issues, which should be create on the editor
			return oDoc.getContent()
				.then(function(docContent){
					return annotationHelper.updateAnnotations(oContentService, docContent, aIssues, {document: oDoc, editor: oAceEditorService})
						.then(function() {
							return oAceEditorService.getAnnotations()
								.then(function(result){
									expect(result,"editor should have no annotations").to.be.empty;
								});
						});
				});
		});


	});

});
