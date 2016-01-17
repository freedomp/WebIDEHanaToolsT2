/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    
    jQuery.sap.require("sap.ui.model.SimpleType");
    var UIBoolean = sap.ui.model.SimpleType.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.Boolean", {
    	formatValue : function(sIncluding) {
    	    return sIncluding === "true" ? true : false;
    	},
    	parseValue : function(bIncluding) {
    	    return bIncluding ? "true" : "false";
    	},
    	validateValue : function(oValue) {

    	}
    });

    return UIBoolean;
});
