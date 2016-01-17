/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    jQuery.sap.require("sap.ui.model.SimpleType");
    var UIDate = sap.ui.model.SimpleType.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.Date", {
	    formatValue : function(sDate) {
    		if (typeof sDate === "string" && sDate.length === 10) {
    		    return sDate.split("-").join("");
    		}
	    },

	    parseValue : function(sDate) {
    		if (typeof sDate === "string" && sDate.length === 8) {
    		    return [ sDate.slice(0, 4), sDate.slice(4, 6), sDate.slice(6, 8) ].join("-");
    		}
	    },
	    validateValue : function(oValue) {

	    }
    });

    return UIDate;
} );
