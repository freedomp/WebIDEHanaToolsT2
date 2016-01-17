/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
        
    $.sap.require("sap.ui.commons.ComboBox");
    var ComboBox = sap.ui.commons.ComboBox;
    $.sap.require("sap.ui.commons.ComboBoxRenderer");
    var ComboBoxRenderer = sap.ui.commons.ComboBoxRenderer;
    $.sap.require("sap.ui.commons.ButtonRenderer");
    var ButtonRenderer = sap.ui.commons.ButtonRenderer;
    
    var ConditionalComboBox = ComboBox.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ConditionalComboBox", {

        metadata: {
            properties: {
                "handleChange": {
                    type: "any"
                },
                "onButtonPress": {
                    type: "any"
                },
                "parentControl": {
                    type: "any"
                }, 
                "filterType": {
                    type: "any"
                }
            },
            aggregations: {
                "icon": {
                    type: "sap.ui.commons.Image",
                    multiple: false,
                    visibility: "public"
                }
            }
        },
        init: function(){
            this.attachChange(function(){
                this.getIcon().rerender();
            });
        },
        
        renderer: {
            
            render: function(oRm, oControl) {
                if (oControl.getValue()) {
                    oControl.addCustomData(new sap.ui.core.CustomData({ 
                        key: "parentControl",
                        value: oControl.getParent()
                    }));
                    oRm.write("<div style='float:left'>");
                    oRm.renderControl(oControl.getIcon());
                    oRm.write("</div>");
                    oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>"); 
                    ComboBoxRenderer.render(oRm, oControl);
                    oRm.write("</div>");
                    oRm.write("<div style='clear:left'></div>"); 
                } else if (oControl.getFilterType() === undefined || oControl.getFilterType() === null)  {
                    oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>");
                    ButtonRenderer.render(oRm, new sap.ui.commons.Button({
                        icon: "sap-icon://add",
                        text: "Restriction",
                        lite: true,
                        press: oControl.getOnButtonPress(),
                        parent: oControl.getParentControl()
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "parentControl",
                        value: oControl.getParent()
                    })));
                    oRm.write("</div>");
                }
                
                var handleChange = oControl.getHandleChange();
                if(typeof handleChange === "function" ){
                   oControl.attachChange(oControl.getHandleChange()); 
                }
                
                oControl.addEventDelegate({
                        onkeypress: function(oEvent) {
                            oEvent.preventDefault();
                        }
                    });
            }
        }

    });

    return ConditionalComboBox;
});
