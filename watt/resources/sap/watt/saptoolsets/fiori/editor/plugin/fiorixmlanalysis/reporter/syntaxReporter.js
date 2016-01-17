define([], function() {
	return {
        SEVIRITY_WARNING : "warning",
        SEVIRITY_ERROR : "error",
        SEVIRITY_FATAL_ERROR : "fatalError",

        id: "syntaxReporter",
        report: function(parser, path, report,context){
            this.reportParseErrors(parser, path, report, context);
            //console.log(this.id + ": " + (report.root.severity ? "error" : "ok"));
            return !report.issues.length;
        },

        reportParseErrors: function(parser, path, report, context){
            if (parser && parser.options && parser.options.errors && parser.options.errors.length) {
                //report.root.severity = "error";
                this.reportError(parser.options.errors, path, report, context);
            }
        },

        reportError: function(aErrors, sFullPath, report, context) {
            var warn = this.SEVIRITY_WARNING, error = this.SEVIRITY_ERROR, fatal = this.SEVIRITY_FATAL_ERROR;
                var oIssueBuilder = {};
                oIssueBuilder[warn] = function(oIssue) {
                    if (report.root.severity !== error || report.root.severity !== fatal){
                        report.root.severity = warn;
                    }
                    oIssue.severity = warn;
                    return oIssue;
                };
                oIssueBuilder[error] = function(oIssue) {
                    report.root.severity = error;
                    oIssue.severity = error;
                    return oIssue;

                };
                oIssueBuilder[fatal] = function(oIssue) {
                    oIssueBuilder[error](oIssue);
                };

                aErrors.forEach(function(error){
                    var oIssue = {
                        category: "Syntax Error",
                        checker:"",
                        helpUrl: "",
                        line: error.row,
                        column: error.column,
                        message: error.text,
                        source: "",
                        path: sFullPath
                    };
                    if (typeof oIssueBuilder[error.type.toLowerCase()] === 'function') {
                        report.issues.push(oIssueBuilder[error.type](oIssue));
                    } else {
                        context.service.log.error(that.context.service.fioriXmlAnalysis.getProxyMetadata().getName(), "wrong severity value sent by dom parser: " + error.type, ["system"]).done();
                        report.issues.push(oIssueBuilder[SEVIRITY_ERROR](oIssue));
                    }
                });
        }

	};
});
