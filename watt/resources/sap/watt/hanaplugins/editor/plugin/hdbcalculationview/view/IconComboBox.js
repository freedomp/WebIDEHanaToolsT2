/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/ComboBox", "sap/ui/commons/ComboBoxRenderer"], function(ComboBox, ComboBoxRenderer) {

    var IconComboBox = ComboBox.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox", {

        metadata: {
            properties: {
                canedit: {
                    type: "boolean",
                    defaultValue: true
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
        },
        onAfterRendering: function(event) {
            if (!event.srcControl.mProperties.canedit) {
                var element = document.getElementById(event.srcControl.sId + "-input");
                if (element) {
                    element.readOnly = true;
                } else {
                    element = document.getElementById(event.srcControl.sId);
                    if (element && element.lastChild) {
                        element.lastChild.readOnly = true;
                    }
                }
            }

        }
    });


    return IconComboBox;

}, true);
