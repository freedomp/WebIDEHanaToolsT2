require.config({ paths: { "rndrt" : "sap/watt/hanaplugins/lib/rndrt" }});

define(["rndrt/rnd", "../../parser/OSDLParser"], function(rnd, OSDLParser) {

	"use strict";
		
	return {
				
		ANNOTATION_INFO_SEVERITY: "info",
		ANNOTATION_WARNING_SEVERITY: "warning",
		ANNOTATION_ERROR_SEVERITY: "error",
		ANNOTATION_OK_SEVERITY:"correct",
		
		_ERROR_STATE: {
            Correct: rnd.ErrorState.Correct.getValue(),
            Suspicious: rnd.ErrorState.Suspicious.getValue(),
            Reinterpretation: rnd.ErrorState.Reinterpretation.getValue(),
            Erroneous: rnd.ErrorState.Erroneous.getValue(),
            Unknown: rnd.ErrorState.Unknown.getValue()
        },
		
		_oParser: null,
        
        getIssues: function(sSource, oConfig, sFullPath, oCustomRules) {
        	        	
        	if (!this._oParser) {
        		this._oParser = new OSDLParser();
        	}
        	        	
        	var oSyntaxCheckResult;
        	var aSyntaxCheckResults = this._oParser.parse(sSource);
        	var oResult = {
         	   "root": {},
         	   "issues": []
        	};
              
            for (var i = 0; i < aSyntaxCheckResults.length; i++) {
            	 oSyntaxCheckResult = aSyntaxCheckResults[i];
            	 var iErrorState = oSyntaxCheckResult.m_err_state.m_value;
                 if (iErrorState == this._ERROR_STATE.Reinterpretation || iErrorState == this._ERROR_STATE.Erroneous) {
                	 var sSeverity = this._getSeverity(oSyntaxCheckResult.m_err_state);
                	 if (sSeverity === this.ANNOTATION_ERROR_SEVERITY) {
                	 	oResult.root.severity = sSeverity;
                 	 }
                 
                	 oResult.issues.push({
             		    checker:"XSODataValidator",
             	    	column: oSyntaxCheckResult.m_column,
             	    	line: oSyntaxCheckResult.m_line,	
             	    	message: this._getMessage(oSyntaxCheckResult),
             			path: sFullPath,
             	    	severity: sSeverity
             		 });
                 }
             }
             return oResult;      
        },
                        
        _getSeverity: function(tokenErrotState){ //message severity
            switch(tokenErrotState.m_value){
              case this._ERROR_STATE.Correct:
                  return this.ANNOTATION_OK_SEVERITY;
              case this._ERROR_STATE.Suspicious:
                  return this.ANNOTATION_WARNING_SEVERITY;
              case this._ERROR_STATE.Reinterpretation:
                  return this.ANNOTATION_INFO_SEVERITY;
              case this._ERROR_STATE.Erroneous:
                  return this.ANNOTATION_ERROR_SEVERITY;
              default:
                  return "unknown error state";
            }
        },
        
        _getMessage: function(oSyntaxCheckResult) {
            switch(oSyntaxCheckResult.m_err_state.m_value){
              case this._ERROR_STATE.Correct:
                  return "";
              case this._ERROR_STATE.Suspicious:
            	  return JSON.stringify({i18nKey: "syntaxCheckAnnotationWarningMessage"});
              case this._ERROR_STATE.Reinterpretation:
            	  return JSON.stringify({i18nKey: "syntaxCheckAnnotationInfoMessage"});
              case this._ERROR_STATE.Erroneous:         //3
                  if (oSyntaxCheckResult.m_num === rnd.Constants.NUM_EOF){
                	  return JSON.stringify({i18nKey: "syntaxCheckAnnotationEOFErrorMessage"});
                  }
                  return JSON.stringify({i18nKey: "syntaxCheckAnnotationErrorMessage", arg: oSyntaxCheckResult.m_lexem});
              default:
                  return JSON.stringify({i18nKey: "unknownErrorMessage"});
          }  
        }	

        
	};
});