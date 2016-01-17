/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function(){
    
    
    var ButtonTextView = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ButtonTextView", {
    	
    	 _button: null,
    	 
    	 metadata: {
    	        aggregations: {
    	            layout: {
    	                singularName: "layout",
    	                type: "sap.ui.commons.layout.MatrixLayout",
    	                multiple: false,
    	                visibility: "public"
    	            }
    	        },
    	        properties: {
    	            text: {
    	                type: "any"
    	            },
    	            functionOnButtonPress: {
    	                type: "any"
    	            },
    	            buttonText: {
    	            	type : "any"
    	            }
    	        },
    	        events:{
    	            press : {}
    	        }
    	   },
    	    
    	   init: function() {
    		   
    	    },
    	    
    	    onBeforeRendering: function(){
    	    	this.createButtonTextView();
    	    },
    
    	    renderer: {
    	        render: function(oRm, oControl) {
    	        	if(oControl.getText() !== undefined && oControl.getText() !== null && oControl.getText() !== ""){
    	        		oRm.renderControl(oControl.getAggregation("layout"));
    	        	}   
    	        }
    	    },
    	    
    	    createButtonTextView: function(){
    	    	var that = this;
    	    	var layout = new sap.ui.commons.layout.MatrixLayout({
    	    		width: "100%",
    	    		columns: 2,
    	    		widths: ["auto", "30px"],
    	    		height: "24px"
    	    	});
    	    	var row = new sap.ui.commons.layout.MatrixLayoutRow();
    	    	var textCell = new sap.ui.commons.layout.MatrixLayoutCell({
    	    	    height: "24px"    
    	    	});
    	    	
    	    	var buttonCell = new sap.ui.commons.layout.MatrixLayoutCell({
    	    		hAlign: sap.ui.commons.layout.HAlign.End,
    	    		width: "30px",
    	    		height: "24px"
    	    	});
    	    	
    	    	var button = new sap.ui.commons.Button({
    	    		icon: "sap-icon://add",
    	    		width: "30px",
    	    		height: "24px"
    	    	});
    	    	
    	    	var text = new sap.ui.commons.TextView({
    	    		text : that.getText(),
    	    		height: "24px"
    	    	});
    	    	
    	    	textCell.addContent(text);
    	    	buttonCell.addContent(button);
    	    	
    	    	row.addCell(textCell);
    	    	row.addCell(buttonCell);
    	    	
    	    	layout.addRow(row);
    	    	this.setAggregation("layout", layout);
    	    },
    	    
    	    onAfterRendering: function(){
    	    	
    	    }
    	
    });
    return ButtonTextView;
});
