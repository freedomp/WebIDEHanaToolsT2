define([], function() {

	"use strict";
	
	return {
		      
        getPathToImplementationModule: function() {
        	return "sap/watt/hanaplugins/editor/plugin/xsodata/service/validator/XSODataValidatorHelper";
        },
        
        postValidate: function(oResult) {
        	var aIssues = oResult.issues;
        	for (var i = 0; i < aIssues.length; i++) {
        		var oMessage = JSON.parse(aIssues[i].message);
        		if (oMessage.hasOwnProperty("arg")) {
        			aIssues[i].message = this.context.i18n.getText("i18n", oMessage.i18nKey, [ oMessage.arg ]);
        		} else {
        			aIssues[i].message = this.context.i18n.getText("i18n", oMessage.i18nKey);
        		}
        	}
        	return oResult;
        }
                
	};
});