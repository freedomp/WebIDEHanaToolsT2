define(["../lib/eslint/eslint"], function(eslint)  {

	"use strict";

	return {

        getIssues: function(sSource, oConfig, sFullPath, oCustomRules) {
			var ignoredRules = [];
        	var oRulesExt = oConfig.additionalRuleMetadata;
        	if (oCustomRules) {
        	    Object.getOwnPropertyNames(oCustomRules).forEach(function(ruleId){
        	        /* usage of new Function instead of eval, as code may contain more than one command in case 
        	        'use strict' is defined before the function.
        	        new Function can handle a code block*/
					try {
						var fn = new Function(oCustomRules[ruleId]);
						oCustomRules[ruleId] = fn();
					} catch(e) {
						ignoredRules.push(ruleId);
						//TODO: no context here, as it is called from worker - how to log? maybe add as an issue?
					}
        	    });    
        	    this._defineCustomRulesToLinter(oCustomRules);
        	}
        	
        	var aEslintIssues = eslint.verify(sSource, oConfig, sFullPath, false);
	        eslint.reset(); // clean eslint buffers
        
        	var oResult = {
        	    "root": {},
        	    "issues": []
        	};
            for (var i = 0; i < aEslintIssues.length; i++) {
    		    var oIssue = aEslintIssues[i];
    			if (oIssue.fatal) {
    				oIssue.ruleId = "syntax-parse";
    			}
    
    			oIssue.severity = oIssue.fatal ? "error" : oRulesExt[oIssue.ruleId].severity;
    			oIssue.category = oIssue.fatal ? "Syntax Error" : oRulesExt[oIssue.ruleId].category;
    			oIssue.helpUrl = oIssue.fatal ? "http://www.ecma-international.org/ecma-262/5.1/" : (oRulesExt[oIssue.ruleId].helpUrl || oRulesExt[oIssue.ruleId].help);

    			// error handling if configuration contains a wrong severity
    			oIssue.severity = oIssue.severity.toLowerCase();
				switch (oIssue.severity) {
					case 'e':
					case 'error':
						oIssue.severity = "error";
						break;
					case 'w':
					case 'warning':
						oIssue.severity = "warning";
						break;
					case 'i':
					case 'info':
						oIssue.severity = "info";
						break;
					default :
						oIssue.severity = "warning";
				}

				if (oResult.root.severity === undefined && oIssue.fatal) {
					oResult.root.severity = oIssue.severity;
				}

				oResult.issues.push({
				    category: oIssue.category,
				    checker:"ESLint",
			    	column: oIssue.column,
			    	helpUrl: oIssue.helpUrl,
			    	line: oIssue.line,	
		    		message: oIssue.message,
					path: sFullPath,
			    	ruleId: oIssue.ruleId,   
			    	severity: oIssue.severity,
			    	source: oIssue.source
				});
            }
        	return oResult;
        },
        
        _defineCustomRulesToLinter : function(aRules) {
            eslint.defineRules(aRules);
        }
        
	};
});
