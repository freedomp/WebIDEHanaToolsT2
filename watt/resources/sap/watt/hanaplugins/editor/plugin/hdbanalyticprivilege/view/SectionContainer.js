/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function() {
    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SectionContainer");

    var SectionContainer = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SectionContainer", {
    //"sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel"
        metadata: {
            
            properties: {
                index: {
                    type: "any"
                }
            },
            
            aggregations: {
                restriction: {
                    //type: "sap.ui.core.Control",
                    multiple: false
                },
                whereSql: {
                    //type: "sap.ui.core.Control",
                    multiple: false
                },
                conditionProcedureName: {
                    //type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        },
    
        renderer: {
            render: function(oRm, oControl) {
                oRm.addClass("apeSectionContainer");
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.writeClasses();
                oRm.writeStyles();
                oRm.write(">");
                switch(oControl.getIndex()){
                    case 0:
                    //case ApeModel.WhereType.RESTRICTION:
                        oRm.renderControl(oControl.getAggregation("restriction"));
                        break;
                    case 1:
                    //case ApeModel.WhereType.WHERE_SQL:
                        oRm.renderControl(oControl.getAggregation("whereSql"));
                        break;
                    case 2:
                    //case ApeModel.WhereType.CONDITION_PROCEDURE_NAME:
                        oRm.renderControl(oControl.getAggregation("conditionProcedureName"));
                        break;
                }
                
                oRm.write("</div>");
            }
    
        },
    
        init: function() {
            
            
        }
    });
    return SectionContainer;
});
