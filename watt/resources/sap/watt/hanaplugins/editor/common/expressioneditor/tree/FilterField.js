/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/TextField", "sap/ui/commons/TextFieldRenderer"],
    function(TextField, TextFieldRenderer) {

        var FilterField = TextField.extend("sap.watt.hanaplugins.editor.common.expressioneditor.tree.FilterField", {

            metadata: {
                properties: {
                    
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
                        oRm.renderControl(new sap.ui.commons.Image({
                            src: "/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/images/Filter.png"
                        }));
                        oRm.write("</div>");
                        oRm.write("<div>");
                        TextFieldRenderer.render(oRm, oControl);
                        oRm.write("</div>");
                        oRm.write("<div style='clear:left'></div>");
                    
                }
            }

        });

        return FilterField;
    }, true);
