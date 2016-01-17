define(["sap/watt/lib/lodash/lodash", "sap.watt.ideplatform.orion.validationsDistributor/adopters/problemsView/data/validationStoreManager"], function (_, validationStoreManager) {

	return {
		_DOMAIN: "codeValidation",
		_WORKSPACE_FOLDER: "LOCAL",

		_convertIssuesToProblems: function (_issues, issuesKey) {
			var that = this;
			var problems = [];
			var issues = _issues || [];
			var pathAdjustedToClient = issuesKey ? (issuesKey.indexOf('\\') !== -1 ? issuesKey.replace(/\\/g, '/') : issuesKey) : null;
			for (var i = 0; i < issues.length; i++) {
				var issue = issues[i];
				if(issue.column === undefined ){
					issue.column=0;
				}
				var location = issue.line + ", " + issue.column;
				var fileParts = pathAdjustedToClient.split('/');
				var fileName = fileParts.pop();
				problems.push({
					checker: issue.checker,
					ruleId: issue.ruleId,
					category: issue.category,
					helpUrl: issue.helpUrl,
					id: pathAdjustedToClient,
					severity: issue.severity,
					description: issue.message,
					path: pathAdjustedToClient,
					line: issue.line,
					column: issue.column,
					location: fileParts.join('/'),
					file: fileName + "(" + location + ")",
					navigate: {
						arguments: [this.context.service.editor, this.context.service.document, issue.line, issue.column, pathAdjustedToClient],
						handler: function (aArgs) {
							var editorService = aArgs[0];
							var documentService = aArgs[1];
							var line = aArgs[2];
							var column = aArgs[3];
							var path = aArgs[4];
							documentService.getDocumentByPath(path).then(function (document) {
								if (document) {
									return editorService.getSpecificEditor(document, "aceeditor").then(function (oAceEditor) {
										return documentService.open(document).then(function () {
											oAceEditor.service.gotoLine(line, column); // for this to work, editor need to fix ticket 1570751141
										});
									});
								}
							}).done();
							that.context.service.usagemonitoring.report("ProblemsView", "NavigateToIssue").done();
						}
					}
				});
			}
			return problems;
		},

		onProblemsUpdate: function (oEvent) {
			var that = this;
			var problemsService = this.context.service.problems;
			var info = this._getIssuesUpdateInfo(oEvent);
			var results = info.validationsResults;
			var sDisplayed = info.displayed;
			var aSenders = info.senders;
			var aProblemsWithIssues = [];
			var aProblemsWithOUTIssues = [];
			_.forEach(results, function (obj) {
				var key = obj.document;
				if (key) {
					var issues = obj.result.issues;
					var aProblems = that._convertIssuesToProblems(issues, key);
					if (aProblems.length) {
						aProblemsWithIssues = aProblemsWithIssues.concat(aProblems);
					} else {
						aProblemsWithOUTIssues = aProblemsWithOUTIssues.concat(key);
					}
				}
			});
			// Clean the PV
			if (results.length === 0 && aSenders.length === 0) {
				problemsService.clearProblems(this._DOMAIN).done();
				problemsService.clearTitle().done();
			}
			// Workspace flow
			else if (sDisplayed === this._WORKSPACE_FOLDER) {
				if (aProblemsWithIssues.length) {
					problemsService.setProblems(this._DOMAIN, aProblemsWithIssues).done();
					problemsService.setTitle("workspace").done();
				}
				if (aProblemsWithOUTIssues.length) {
					problemsService.clearProblems(this._DOMAIN, aProblemsWithOUTIssues).done();
					problemsService.setTitle("workspace").done();
				}
				if (aProblemsWithOUTIssues.length === 0 && aProblemsWithIssues.length === 0) {
					problemsService.clearProblems(this._DOMAIN).done();
					problemsService.clearTitle().done();
				}
			}
			// Project flow
			else {
				if (_.indexOf(aSenders, sDisplayed) !== -1) {
					if (aProblemsWithIssues.length) {
						problemsService.setProblems(this._DOMAIN, aProblemsWithIssues).done();
						problemsService.setTitle(sDisplayed).done();
					}
					else {
						problemsService.clearProblems(this._DOMAIN).done();
						problemsService.clearTitle().done();
					}
				}
			}
		},

		problemsProcessingIntegrityStatus: function () {
			return validationStoreManager.getIntegrityDictionary(this.context);
		},

		_getIssuesUpdateInfo: function (oEvent) {
			return {
				displayed: oEvent.params.displayed,
				senders: oEvent.params.senders,
				validationsResults: oEvent.params.validationsResults || []
			};
		}
	};
});
