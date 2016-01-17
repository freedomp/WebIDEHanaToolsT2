/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    
    var ConditionalDatePicker = sap.ui.commons.DatePicker.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ConditionalDatePicker", {
    	metadata : {
    	    properties : {
    		"actual" : "string",
    		"target" : "string"
    	    }
    	},
    	renderer : {
    	    render : function(oRm, oControl){
    
            oRm.addClass("ConditionalDatePicker");
            oRm.addClass("sapUiTableCell");
            oRm.write("<div ");
            oRm.writeClasses();
            oRm.writeControlData(oControl);
            oRm.write(">");
    		if(oControl.getActual() === oControl.getTarget()){
        	    $.sap.require("sap.ui.commons.DatePickerRenderer");
        	    sap.ui.commons.DatePickerRenderer.render(oRm, oControl);
    		}
            oRm.write("</div>");
    	    }
    	}
    });
    return ConditionalDatePicker;
});
