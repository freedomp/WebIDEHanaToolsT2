/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([],

    function() {

        $.sap.require("sap.ui.commons.ValueHelpField");
        var ValueHelpField = sap.ui.commons.ValueHelpField;
        $.sap.require("sap.ui.commons.ValueHelpFieldRenderer");
        var ValueHelpFieldRenderer = sap.ui.commons.ValueHelpFieldRenderer;
        
        var ConditionalValueHelpField = ValueHelpField.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ConditionalValueHelpField", {
            metadata: {
                properties: {
                    "fieldContent": "string",
                    "enableValueHelp": {
                        type: "boolean"
                    },
                    "onValueHelpRequest": {
                        type: "any"
                    },
                    "onChange": {
                        type: "any"
                    },
                    "parentControl": {
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
            renderer: {
                render: function(oRm, oControl) {
                    if ((oControl.getValue() !== undefined && oControl.getValue() !== "") || oControl.getEnableValueHelp() === true) {
                        oRm.write("<div style='float:left'>");
                        oRm.renderControl(oControl.getIcon());
                        oRm.write("</div>");
                        oRm.write("<div class='sapUiTableCell' style='padding:0;margin:0'>");
                        ValueHelpFieldRenderer.render(oRm, oControl);
                        oRm.write("</div>");
                        oRm.write("<div style='clear:left'></div>");
                        oControl.attachEvent("valueHelpRequest", oControl.getOnValueHelpRequest());
                        oControl.attachEvent("change", oControl.getOnChange());
                        
                    }
                }
            }

        });

        return ConditionalValueHelpField;
});
