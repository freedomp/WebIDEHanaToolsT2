/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ValiditiesPane",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/AnalyticPrivilegeModelInformation",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ReferenceModelsSection",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ClassicalRestrictionSection"
], function(ValiditiesPane, AnalyticPrivilegeModelInformation, ReferenceModelsSection, ClassicalRestrictionSection) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ClassicalPrivilegeEditor");
    var ClassicalPrivilegeEditor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ClassicalPrivilegeEditor", {

        _classicalRestrictionSection: null,
        _firstRow: null,

        metadata: {

            aggregations: {
                _classicalLayout: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
                _validities: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            properties: {
                context: {
                    type: "any"
                },
                document: {
                    type: "any"
                }
            }
        },

        renderer: {
            render: function(oRm, oControl) {
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.writeClasses();
                oRm.writeStyles();
                oRm.write(">");
                oRm.renderControl(oControl.getAggregation("_classicalLayout"));
                oRm.write("</div>");
            }

        },

        init: function() {
            this.addStyleClass("classicalEditor");
            this.createAnalyticPrivilegeEditor2();
        },
        onBeforeRendering: function() {
            this._classicalRestrictionSection.setContext(this.getContext());
        }
    });

    ClassicalPrivilegeEditor.prototype.createAnalyticPrivilegeEditor2 = function() {
        //first row
        var oFirstRowLayout = new sap.ui.commons.layout.MatrixLayout({
            height: "100%",
            width: "100%",
            columns: 2,
            layoutFixed: false,
            widths: ["20%", "80%"]
        });

        var oInfoPane = new AnalyticPrivilegeModelInformation({
            height: "100%"
        });
        var oValiditiesPane = new ValiditiesPane({
            height: "100%"
        });

        oFirstRowLayout.createRow(oInfoPane, oValiditiesPane);
        var oRow0 = oFirstRowLayout.getRows()[0];
        oRow0.setHeight("100%");

        //second row
       
        var oClassicalRestrictionsSection = null;
        oClassicalRestrictionsSection = new ClassicalRestrictionSection({
            height: "100%",
            width: "100%"

        });

        oClassicalRestrictionsSection.addStyleClass("apeRestrictionsSection");
        
        this._classicalRestrictionSection = oClassicalRestrictionsSection;
        //create a horizontal Splitter
        var oSplitterClassical = new sap.ui.commons.Splitter({
            width: "100%"
        });
        oSplitterClassical.setSplitterOrientation(sap.ui.commons.Orientation.horizontal);
        oSplitterClassical.setSplitterPosition("30%");
        oSplitterClassical.setMinSizeFirstPane("20%");
        oSplitterClassical.setMinSizeSecondPane("30%");
        oSplitterClassical.setWidth("100%");
        oSplitterClassical.setHeight("100%");
        oSplitterClassical.addFirstPaneContent(oFirstRowLayout);
        oSplitterClassical.addSecondPaneContent(oClassicalRestrictionsSection);
        
        this.setAggregation("_classicalLayout", oSplitterClassical);
    };
    
    return ClassicalPrivilegeEditor;
});
