/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.define(["sap/ui/commons/ValueHelpField", "sap/ui/commons/ValueHelpFieldRenderer"], function(ValueHelpField, ValueHelpFieldRenderer) {

    var CustomValueHelpField = ValueHelpField.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField", {

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
                ValueHelpFieldRenderer.render(oRm, oControl);
            }
        },
        onAfterRendering: function(event) {
            if (!event.srcControl.mProperties.canedit) {
                var fieldElement = document.getElementById(event.srcControl.sId);
                if(fieldElement){
                    // fieldElement.classList.add("valueHelpMargin");
                }
                var element = document.getElementById(event.srcControl.sId + "-input");
                if (element) {
                    element.readOnly = true;
                    element.classList.add("inputValueHelpMargin");
                } else {
                    element = document.getElementById(event.srcControl.sId);
                    if (element && element.lastChild) {
                        element.lastChild.readOnly = true;
                         element.classList.add("inputValueHelpMargin");
                    }
                }
            }
        }
    });
    CustomValueHelpField.prototype.getTooltip_AsString = function() {
        var t = ValueHelpField.prototype.getTooltip_AsString.apply(this, arguments);
        if(t && t.indexOf("-") > -1){
            t = t.substring(0,t.indexOf("-"));
        }
        return t;
    };
    return CustomValueHelpField;

}, true);
