/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/DropdownBox", "sap/ui/commons/ComboBoxRenderer"], function(DropdownBox, ComboBoxRenderer) {

    var IconDropdownBox = DropdownBox.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox", {

        metadata: {
            aggregations: {
                "icon": {
                    type: "sap.ui.commons.Image",
                    multiple: false,
                    visibility: "public"
                }
            }
        },
        renderer: {
            render: function(oRm, oControl) {
                oRm.write("<div style='float:left'>");
                oRm.renderControl(oControl.getIcon());
                oRm.write("</div>");
                oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0;'>");
                ComboBoxRenderer.render(oRm, oControl);
                oRm.write("</div>");
                oRm.write("<div style='clear:left'></div>");
            }
        }
    });

    return IconDropdownBox;

}, true);
