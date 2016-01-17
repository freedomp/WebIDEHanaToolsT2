define([], function () {
    "use strict";
    
    return {
        _getCodeEditor: function(oSelection){
    		return oSelection.getOwner().then(function(oCurrentEditorInstance) {					
    			if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
    				return oCurrentEditorInstance;
    			} else {
    				return null;
    			}			
    		});
    	}	
    };
});
