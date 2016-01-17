/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/Panel", "sap/ui/commons/PanelRenderer"], function(Panel, PanelRenderer) {

    var customPanel = Panel.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomPanel", {

        metadata: {
            
        },
        renderer: {
            render: function(oRm, oControl) {
                PanelRenderer.render(oRm, oControl);
            }
        },
        onAfterRendering: function(event) {
            if (!event.srcControl.mProperties.canedit) {
                var element = document.getElementById(event.srcControl.sId + "-hdr");
                if(element){
                    element.classList.add("panelHeaderStyle");
                }
                // element.addClass("parameterHeaderStyle"); 
            }
        }
    });
    return customPanel;

}, true);
