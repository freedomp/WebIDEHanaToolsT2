/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ReferenceModelsSection",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/RestrictedAttributesSection"
], function(ReferenceModelsSection, RestrictedAttributesSection) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ClassicalRestrictionSection");

    var ClassicalRestrictionSection = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ClassicalRestrictionSection", {

        _restrictionSection: null,
        _referencedModelsSection: null,
        _preventModelTableSelectionEvent: false,
        _preventTreeTableSelectionEvent: false,
        _countSelectionEventsFromTreeToModelTable: 0,
        _countSelectionEventsFromModelToTreeTable: 0,

        metadata: {

            properties: {
                context: {
                    type: "any"
                }
            },

            aggregations: {
                _layout: {
                    type: "sap.ui.core.Control",
                    multiple: false
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
                oRm.renderControl(oControl.getAggregation("_layout"));
                oRm.write("</div>");
            }

        },

        init: function() {
            this.createOuterLayout();
        },

        onBeforeRendering: function() {
            var that = this;
            var oTreeTable = this._restrictionSection.getTreeTable();
            var oModelTable = this._referencedModelsSection.getModelTable();
            oTreeTable.attachRowSelectionChange(function(oEvent) {
                if (that._preventTreeTableSelectionEvent === false) {
                    that._preventModelTableSelectionEvent = true;
                    oModelTable.clearSelection();
                    var aIndicies = oEvent.getSource().getSelectedIndices();

                    var selectedDimensionUris = [];
                    var selectedModelUris = [];
                    for (var i = 0; i < aIndicies.length; i++) {
                        var oContext = oTreeTable.getContextByIndex(aIndicies[i]);
                        var oRestriction = oContext.getObject();
                        if (oRestriction.dimensionUri !== undefined && selectedDimensionUris.indexOf(oRestriction.dimensionUri) < 0) {
                            selectedDimensionUris.push(oRestriction.dimensionUri);
                        }
                        if (oRestriction.originInformationModelUri !== undefined && selectedModelUris.indexOf(oRestriction.originInformationModelUri) < 0) {
                            selectedModelUris.push(oRestriction.originInformationModelUri);
                        }
                    }

                    that._preventModelTableSelectionEvent = true;

                    var oSecuredModels = that.getModel().oData.securedModels;
                    for (var i = 0; i < oSecuredModels.length; i++) {
                        var dimensions = oSecuredModels[i].dimensions;
                        for (var j = 0; j < selectedDimensionUris.length; j++) {
                            if (dimensions.indexOf(selectedDimensionUris[j]) >= 0 || selectedDimensionUris[j] === oSecuredModels[i].modelUri) {
                                oModelTable.addSelectionInterval(i, i);
                            }
                        }
                        for (var j = 0; j < selectedModelUris.length; j++) {
                            if (selectedModelUris[j] === oSecuredModels[i].modelUri || dimensions.indexOf(selectedModelUris[j]) >= 0) {
                                oModelTable.addSelectionInterval(i, i);
                            }
                        }
                    }

                    that._preventModelTableSelectionEvent = false;

                } else {
                    that._countSelectionEventsFromModelToTreeTable--;
                }

            });

            oModelTable.attachRowSelectionChange(function(oEvent) {
                if (that._preventModelTableSelectionEvent === false) {
                    that._preventTreeTableSelectionEvent = true;
                    oTreeTable.clearSelection();
                    var aSelectedIndicies = oEvent.getSource().getSelectedIndices();
                    var aSelectedDimensions = [];
                    var aSelectedModelUris = [];

                    for (var i = 0; i < aSelectedIndicies.length; i++) {
                        var oContext = oModelTable.getContextByIndex(aSelectedIndicies[i]);
                        var oSecuredModel = oContext.getObject();
                        for (var j = 0; j < oSecuredModel.dimensions.length; j++) {
                            if (aSelectedDimensions.indexOf(oSecuredModel.dimensions[j]) < 0) {
                                aSelectedDimensions.push(oSecuredModel.dimensions[j]);
                            }
                        }
                        aSelectedModelUris.push(oSecuredModel.modelUri);
                    }

                    var oRestrictions = that.getModel().oData.restrictions;

                    for (var r = 0; r < oRestrictions.length; r++) {
                        var aTableRows = oTreeTable.getRows();
                        for (var j = 0; j < aTableRows.length; j++) {
                            var context = oTreeTable.getContextByIndex(j);
                            if (context !== undefined) {
                                var oObject = context.getObject();

                                if (aSelectedDimensions.indexOf(oObject.dimensionUri) >= 0 || aSelectedModelUris.indexOf(oObject.originInformationModelUri) >= 0 || aSelectedModelUris.indexOf(oObject.dimensionUri) >= 0) {
                                    oTreeTable.addSelectionInterval(j, j);
                                }
                            } 
                        }
                    }

                    that._preventTreeTableSelectionEvent = false;
                }
            });
        },

        createOuterLayout: function() {
            var oFixFlex = new sap.ui.layout.FixFlex({});
            oFixFlex.setFixContentSize("auto");

            var oRestrictionSection = this.createRestrictionSection();
            this._restrictionSection.addStyleClass("apeRestrictionsSection");

            oFixFlex.addFixContent(this.createInfoSection());
            oFixFlex.setFlexContent(oRestrictionSection);
            this.setAggregation("_layout", oFixFlex);
        },

        createInfoSection: function() {
            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 2,
                widths: ['20%', '80%']
            });

            var oInfoLabel = new sap.ui.commons.Label({
                text: "{i18n>txt_restrictions_apply_to_list}"
            });
            oInfoLabel.addStyleClass("apeRestrictionsApplyLabel");
            var oInfoCell = new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 2,
                vAlign: sap.ui.commons.layout.VAlign.Top
            });
            oInfoCell.addContent(oInfoLabel);
            oMatrixLayout.createRow(oInfoCell);

            var oCheckBox = new sap.ui.commons.CheckBox({
                text: "{i18n>txt_apply_to_all}",
                //checked: false,
                change: function() {
                    if (oCheckBox.getChecked()) {

                        oInfoLabel.setText(this.getModel("i18n").getProperty("txt_restrictions_apply_to_all"));
                    } else {
                        oInfoLabel.setText(this.getModel("i18n").getProperty("txt_restrictions_apply_to_list"));
                    }
                }
            });
            oCheckBox.addStyleClass("apeRestrictionsApplyCheckBox");
            oCheckBox.bindChecked("allInformationModels");
            var oCheckCell = new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 2,
                vAlign: sap.ui.commons.layout.VAlign.Top
            });
            oCheckCell.addContent(oCheckBox);
            oMatrixLayout.createRow(oCheckCell);
            //------
            return oMatrixLayout;
        },

        createRestrictionSection: function() {


            var oAttributeSection = new RestrictedAttributesSection({
                height: "100%"
            });

            var oModelSection = new ReferenceModelsSection({
                height: "100%"
            });

            oModelSection.addStyleClass("apeRestrictionsSection");

            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 2,
                widths: ["20%", "80%"]
            });

            oMatrixLayout.createRow(oModelSection, oAttributeSection);
            this._restrictionSection = oAttributeSection;
            this._referencedModelsSection = oModelSection;
            return oMatrixLayout;
        },

        setContext: function(context) {
            this._restrictionSection.setContext(context);
            this._referencedModelsSection.setContext(context);
        }
    });

    return ClassicalRestrictionSection;

});
