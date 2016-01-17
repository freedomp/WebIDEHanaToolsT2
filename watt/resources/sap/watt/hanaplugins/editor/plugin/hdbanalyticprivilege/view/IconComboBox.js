/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([ ], function() {

    $.sap.require("sap.ui.commons.ComboBox");
    var ComboBox = sap.ui.commons.ComboBox;
    $.sap.require("sap.ui.commons.ComboBoxRenderer");
    var ComboBoxRenderer = sap.ui.commons.ComboBoxRenderer;
    
    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.IconComboBox");
    var IconComboBox = ComboBox.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.IconComboBox", {
    
        metadata : {
        	aggregations : {
        	    "icon" : {
            		type : "sap.ui.commons.Image",
            		multiple : false,
            		visibility : "public"
        	    }
        	}
        },
        init: function(){
            this.attachChange(function(){
                this.getIcon().rerender();
            });
        },
        renderer : {
        	render : function(oRm, oControl) {
        	    oRm.addClass("apeIconComboBox");
        	    oRm.addClass("borderIconCombo");
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.writeClasses();
                oRm.writeStyles();
        	    oRm.write(">");
        	    
        	    oRm.write("<div style='float:left'>");
        	    oRm.renderControl(oControl.getIcon());
        	    oRm.write("</div>");
        	    oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>");
        	    ComboBoxRenderer.render(oRm, oControl);
        	    oRm.write("</div>");
        	    oRm.write("<div style='clear:left'></div>");
        	    
        	    oRm.write("</div>");
        	}
        }
    });
    
    return IconComboBox;

});
