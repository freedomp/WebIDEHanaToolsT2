define([], function()  {

	"use strict";
   
   	return {
        getIssues: function(sSource, oConfig, sFullPath) {
            var issues = [];
            
            for(var i = 0; i < 10000; i++) {
                issues.push(
                    {
                        category: "fdsf",
        			    checker:"ESLint",
        		    	column: i,
        		    	helpUrl: "google.com",
        		    	line: i,	
        	    		message: "issue",
        				path: sFullPath,
        		    	ruleId: "no-alert",   
        		    	severity: "High"
                    }
                );
            }
            return {
                issues: issues,
                root: {}
            };
        }
	};
});