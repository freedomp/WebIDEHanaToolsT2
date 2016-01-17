define(["./JSValidatorHelper"], function(jsValidatorHelper) {

	"use strict";
	
	return {
	    
        getIssuesSynchronously: function(sSource, oConfig, sFullPath) {
            return jsValidatorHelper.getIssues(sSource, oConfig, sFullPath);
        },
        
        getPathToImplementationModule: function() {
           return "/com.sap.watt.ide.core/src/main/webapp/test-resources/sap/watt/ideplatform/plugin/basevalidator/FakeConcreteValidator/JSValidatorHelper.js";
        }
        
	};
});