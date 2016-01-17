/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([], function( ) {
    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.AnalyticPrivilegeModelInformation");
    var AnalyticPrivilegeModelInformation = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.AnalyticPrivilegeModelInformation", {
    
        metadata: {
    
            properties: {
                apType: {
                    "type": "any",
                    "default": "classical"
                }
            },
    
            aggregations: {
                _infoPanel: {
                    type: "sap.ui.commons.Panel",
                    multiple: false
                }
            }
        },
    
        renderer: {
            render: function(oRm, oControl) {
                oRm.addClass("apeModelInfo");
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.writeClasses();
                oRm.writeStyles();
                oRm.write(">");
                oRm.renderControl(oControl.getAggregation("_infoPanel"));
                oRm.write("</div>");
            }
        },
    
        init: function() {
            var that = this;
            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 2,
                // widths: ["15%", "85%"]
                widths: ["50px"]
            });
            oMatrixLayout.addStyleClass("apeInfo");
    
            var nameLabel = new sap.ui.commons.Label({
                text: "{i18n>txt_name}" //,
                //requiredAtBegin: true,
                ///required : true
            });
    
            this.nameTextField = new sap.ui.commons.TextField({
                width: "100%",
                height: "100%",
                editable: false,
                //enabled : false,
                liveChange: function(event) {
                    var value = that.nameTextField.getLiveValue();
                    if (value === "") {
                        that._openToolTip("{i18n>tol_name_empty}", event.getSource());
                        event.getSource().setValueState(sap.ui.core.ValueState.Error);
                    } else {
                        event.getSource().setTooltip(null);
                        event.getSource().setValueState(sap.ui.core.ValueState.None);
                    }
                }
            });
            this.nameTextField.bindProperty("value", "name");
    
            var labelLabel = new sap.ui.commons.Label({
                text: "{i18n>txt_label}"
            });
            var labelTextArea = new sap.ui.commons.TextArea({
                width: "100%",
                height: "80px"
                //rows: 10
            });
    
            labelTextArea.bindProperty("value", "label");
    
            var typeLabel = new sap.ui.commons.Label({
                text: "{i18n>txt_privilege_type}" 
            });
            var typeTextField = new sap.ui.commons.TextField({
                width: "100%",
                height: "100%",
                editable: false
            }).bindProperty("value", {
                    parts: ["privilegeType"],
                    formatter: function(type) {
                        var oResult = "";
                        if (type === "SQL_ANALYTIC_PRIVILEGE") {
                            oResult = that.getModel("i18n").getProperty("txt_type_sql");
                        } else {
                            oResult = that.getModel("i18n").getProperty("txt_type_classical");
                        }
    
                        return oResult;
                    }});
            
            oMatrixLayout.createRow(nameLabel, this.nameTextField);
            oMatrixLayout.getRows()[0].setHeight("30px");
            oMatrixLayout.createRow(labelLabel, labelTextArea);
            oMatrixLayout.createRow(typeLabel, typeTextField);
            //left align labels
            oMatrixLayout.getRows()[0].getCells()[0].setHAlign(sap.ui.commons.layout.HAlign.Right);
            oMatrixLayout.getRows()[1].getCells()[0].setHAlign(sap.ui.commons.layout.HAlign.Right);
            oMatrixLayout.getRows()[2].getCells()[0].setHAlign(sap.ui.commons.layout.HAlign.Right);
    
            var infoPanel = new sap.ui.commons.Panel({
                title: new sap.ui.core.Title({
                    text: "{i18n>tit_model_info}"
                }),
                showCollapseIcon: false,
                content: [oMatrixLayout],
                height: "100%"
            });
            infoPanel.addStyleClass("apeInfoPanel");
            this.setAggregation("_infoPanel", infoPanel);
        },
    
        _openToolTip: function(message, control) {
    
            var tooltip = new sap.ui.commons.Callout({
                // open: onOpen
            });
            tooltip.addContent(new sap.ui.commons.TextView({
                semanticColor: sap.ui.commons.TextViewColor.Negative,
                design: sap.ui.commons.TextViewDesign.Bold,
                text: message,
                editable: false
            }));
            control.setTooltip(tooltip);
            // open the popup
            window.setTimeout(function() {
                var tip = control.getTooltip();
                if (tip instanceof sap.ui.commons.Callout) { // check whether the tip is still registered to prevent hanging tips that never close
                    tip.openPopup(control);
                }
            }, 200);
        }
    });
    
    return AnalyticPrivilegeModelInformation;
});
