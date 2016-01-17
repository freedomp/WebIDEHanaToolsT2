define([], function() {
	var AnnotationsHelper = {

		_enableInlineLinting : true,
		// object which defines the sort criteria for the issues detected in one line
		SORT_CRITERIA : {
			"error": 1, // for severity error only the priorities fatal, high, and medium make sense
			"warning":  2, // for severity warning only the priorities high, medium, and low make sense
			"info": 3
		},

		setInlineLinting : function(enable) {
			this._enableInlineLinting = enable;
		},

		updateAnnotations: function(contentService, validatedContent, oResult, editorContent) {
			var that = this;
			if (!editorContent || !editorContent.editor || !editorContent.document || !oResult) {
				return Q();
			}
			if (oResult.issues){
				if (oResult.root){
					var tabIconType;
					if(!oResult.root.severity)
					{
						tabIconType = "";
					}
					if(oResult.root.severity === "error")
					{
						tabIconType = "error";
					}
					if(oResult.root.severity === "warning")
					{
						tabIconType = "warning";

					}
					contentService.setTabIcon(tabIconType, editorContent.document).done();
				}
			}
			return this.isValidationForContent(contentService, editorContent.document, validatedContent)
				.then(function(shouldSetAnnotations) {
					if (shouldSetAnnotations) {
						return editorContent.editor.clearAnnotations()
							.then(function() {
								if (oResult.issues){
									var aNewAnnotations = that._createAnnotations(oResult.issues);
									//will shown liveLinting always since until CodeCheck user preference is ready
									return editorContent.editor.setAnnotations(aNewAnnotations,that._enableInlineLinting);
								}
							});
					}
				});
		},

		isValidationForContent: function(contentService, validatedDocument, validatedContent) {
			return contentService.getCurrentDocument().then(function(oCurrentDocument) {
				if (validatedDocument === oCurrentDocument) {
					return oCurrentDocument.getContent()
						.then(function(currentContent) {
							return (currentContent === validatedContent);
						});
				} else {
					return false;
				}
			});
		},

		// create annotations for all issues
		_createAnnotations: function(aIssues) {
			var i;
			var oIssue;
			var oAnnotation;
			var aAnnotations = [];
			var iIssueCount = aIssues.length;

			aIssues = this._sortIssues(aIssues);
			for (i = 0; i < iIssueCount; i++) {
				oIssue = aIssues[i];
				//TODO - there shouldn't be mapping between issues and annotations fields here(message to raw/text, help to helpurl, severity to type)
				//Editor and concrete linter should apply to API fileds names
				//check which fields AceEditor can accept for annotation (which is probably a type of marker)
				var checker = oIssue.checker || "";
				var ruleIdText = oIssue.ruleId !== undefined ? "(" + oIssue.ruleId + ") " : "";
				var message = checker + ruleIdText + ": " + oIssue.message;
				oAnnotation = {
					row: oIssue.line - 1,
					column: oIssue.column - 1,
					text: oIssue.severity + ": " + oIssue.category + ": " + message,
					ruleId: oIssue.ruleId,
					type: oIssue.severity,
					help: oIssue.helpUrl,
					source: oIssue.source,
					checker: oIssue.checker,
					category: oIssue.category,
					path: oIssue.path
				};
				aAnnotations.push(oAnnotation);
			}
			return aAnnotations;
		},

		_sortIssues : function(aIssues){
			var that = this;
			try {
				aIssues = aIssues.sort(function(a, b) {
					var aSortCriteria = that.SORT_CRITERIA[a.severity];
					var bSortCriteria = that.SORT_CRITERIA[b.severity];
					if (aSortCriteria < bSortCriteria) {
						return -1;
					}
					if (aSortCriteria > bSortCriteria) {
						return 1;
					}
					return 0;
				});
			} catch(err){
				throw new Error("can not sort the annotations: " + err.message);
			}
			return aIssues;
		}

	};

	return AnnotationsHelper;
});
