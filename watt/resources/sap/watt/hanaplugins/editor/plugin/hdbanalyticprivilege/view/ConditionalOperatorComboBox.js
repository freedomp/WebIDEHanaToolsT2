/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
        
    $.sap.require("sap.ui.commons.ComboBox");
    var ComboBox = sap.ui.commons.ComboBox;
    $.sap.require("sap.ui.commons.ComboBoxRenderer");
    var ComboBoxRenderer = sap.ui.commons.ComboBoxRenderer;
    
    var ConditionalComboBox = ComboBox.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ConditionalOperatorComboBox", {

        metadata: {
            properties: { 
                "handleChange": {
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
                    if (oControl.getFilterType() === "valueFilter") {
                        var inItem = oControl._getListBox().getItems()[9];
                        if(inItem !== undefined && inItem !== null){
                            oControl._getListBox().removeItem(inItem);
                        inItem.destroy();    
                        }
                    } else if (oControl.getFilterType() !== undefined) {
                        var isnlItem = oControl._getListBox().getItems()[7];
                        var nlItem = oControl._getListBox().getItems()[8];
                        if(isnlItem !== undefined && isnlItem !== null){
                           oControl._getListBox().removeItem(isnlItem);
                            isnlItem.destroy(); 
                        }
                        if(nlItem !== undefined && nlItem !== null){
                            oControl._getListBox().removeItem(nlItem);
                            nlItem.destroy();    
                        }
                    }
                     oControl.addCustomData(new sap.ui.core.CustomData({
                        key: "parentControl", 
                        value: oControl.getParent()
                    }));
                    oControl.setEnabled(true);
                    oRm.write("<div style='float:left'>");
                    oRm.renderControl(oControl.getIcon());
                    oRm.write("</div>");
                    oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>");
                    ComboBoxRenderer.render(oRm, oControl);
                    oRm.write("</div>");
                    oRm.write("<div style='clear:left'></div>");
                } else if (oControl.getFilterType() !== undefined)  {
                    if (oControl.getFilterType() === "valueFilter") {
                        var inItem = oControl._getListBox().getItems()[9];
                        if(inItem !== undefined && inItem !== null) {
                            oControl._getListBox().removeItem(inItem);
                        inItem.destroy();    
                        }
                    } else{
                        var isnlItem = oControl._getListBox().getItems()[7]; 
                        var nlItem = oControl._getListBox().getItems()[8];
                        if(nlItem !== undefined && nlItem !== null){
                            oControl._getListBox().removeItem(nlItem);
                            nlItem.destroy();
                        }
                        if(isnlItem !== undefined && isnlItem !== null){
                            oControl._getListBox().removeItem(isnlItem);
                            isnlItem.destroy();
                        }
                    }
                     oControl.addCustomData(new sap.ui.core.CustomData({
                        key: "parentControl",
                        value: oControl.getParent()
                    }));
                    oControl.setEnabled(true);
                    oRm.write("<div style='float:left'>");
                    oRm.renderControl(oControl.getIcon());
                    oRm.write("</div>");
                    oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>");
                    ComboBoxRenderer.render(oRm, oControl);
                    oRm.write("</div>");
                    oRm.write("<div style='clear:left'></div>");
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
