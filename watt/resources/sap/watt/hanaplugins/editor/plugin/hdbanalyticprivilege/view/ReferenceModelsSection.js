/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/dialogs/NewFindDialog",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/AddSecuredModel",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RemoveSecuredModel",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Images"
    ], function(FindDialog, AddSecuredModel, RemoveSecuredModel, Images) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ReferenceModelsSection");
    
    var ReferenceModelsSection = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ReferenceModelsSection", {
    
        _modelTable: null,
        _panelTitleSecuredModels: null,
        _panelTitleReferencedModels: null,
        _modelPanel: null,
    
        metadata: {
    
            properties: {
                context: {
                    type: "any"
                },
                privilegeType: {
                    type: "string" 
                }
            },
    
            aggregations: {
                _modelPanel: {
                    type: "sap.ui.commons.layout.MatrixLayout",
                    multiple: false
                },
    
                _modelValueHelpDialog: {
                    type: "Object",
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
                oRm.renderControl(oControl.getAggregation("_modelPanel"));
                oRm.write("</div>");
            }
        },
    
        init: function() {
            var that = this;
    
            this.createModelTable();
    
            var modelTablePanel = new sap.ui.commons.Panel({
                title: new sap.ui.core.Title({
                    text: "{i18n>tit_secured_models}"
                }).bindProperty("text", {
                    parts: ["allInformationModels", "privilegeType"],
                    formatter: function(allInformationModels, privilegeType) {
                        if (privilegeType !== "SQL_ANALYTIC_PRIVILEGE" && allInformationModels === true) {
                            return that._panelTitleReferencedModels;
                        } else {
                            return that._panelTitleSecuredModels;
                        }
                    }
                }),
                height: "100%",
    
                showCollapseIcon: false,
                content: that._modelTable
            });
    
            this._modelPanel = modelTablePanel;
    
            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 1
            });
    
            var oRowForTables = new sap.ui.commons.layout.MatrixLayoutRow({
                height: "100%",
                width: "100%"
            });
    
            var oCellForModelTable = new sap.ui.commons.layout.MatrixLayoutCell({
                height: "100%",
                width: "20%",
                vAlign: sap.ui.commons.layout.VAlign.Top
            });
    
            oCellForModelTable.addContent(modelTablePanel);
    
            oRowForTables.addCell(oCellForModelTable);
    
            oMatrixLayout.addRow(oRowForTables);
            this.setAggregation("_modelPanel", oMatrixLayout);
        },
    
        onBeforeRendering: function() {
            this._panelTitleSecuredModels = this.getModel("i18n").getProperty("tit_secured_models");
            this._panelTitleReferencedModels = this.getModel("i18n").getProperty("tit_referenced_models");
            if (this.getModel().getData().privilegeType === "SQL_ANALYTIC_PRIVILEGE") { 
                this._modelPanel.setTitle(
                    new sap.ui.core.Title({
                        text: "{i18n>tit_secured_models}"
                    })
                );
            }
        },
    
        createModelTable: function() {
            jQuery.sap.require("sap.ui.table.Table");
    
            var that = this;
            var oTable = new sap.ui.table.Table({
                selectionMode: sap.ui.table.SelectionMode.Multi,
                height: "100%",
                width: "100%",
                rowHeight: 32,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                minAutoRowCount: 2
            });
    
            oTable.bindRows("/securedModels");
    
            var oColModels = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "{i18n>tit_secured_model_name}"
                }),
                template: new sap.ui.commons.Label().bindProperty("text", {
                    parts: ["modelUri"],
                    formatter: function(modelUri) {
                        var oResult = "";
                        if (modelUri !== undefined) {
                          //  var aUriParts = modelUri.split("/");
                          //  oResult = aUriParts[3] + " (" + aUriParts[1] + ")";
							//  oResult = aUriParts[3];
                        	oResult = modelUri;
                        	
                        }
                        return oResult;
                    }
                }).bindProperty("icon", {
                    parts: ["modelUri"],
                    formatter: function(modelUri) {
                        if (modelUri !== undefined) {
                            var aUriParts = modelUri.split("/");
                            return that.typeIcon(aUriParts[2]);
                        }
                    }
                }).bindProperty("tooltip", "modelUri").addStyleClass("secureModelLabel"),
                width: "100%"
            });
    
    
            oTable.addColumn(oColModels);
    
            //Delete Button
            var oDeleteBtn = new sap.ui.commons.Button({
                icon: "sap-icon://delete",
                text: "{i18n>txt_remove}",
                enabled: false,
                press: function() {
                    var oI18N = that.getModel("i18n");
                    sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_delete_row"), $.proxy(that.removeSecuredModel, that), oI18N.getProperty("tit_confirm_row"));
                }
            });
            oTable.attachRowSelectionChange(function(oEvent) {
                var aIndicies = oEvent.getSource().getSelectedIndices();
                if (aIndicies.length > 0) {
                    oDeleteBtn.setEnabled(true);
                } else {
                    oDeleteBtn.setEnabled(false);
                }
    
            });
    
            // Toolbar
            var oToolbar = new sap.ui.commons.Toolbar({
                items: [
                    new sap.ui.commons.Button({
                        icon: "sap-icon://add",
                        text: "{i18n>txt_add}",
                        press: function() {
                            that.addSecuredModel();
                        }
                    }), oDeleteBtn
                ]
            });
    
            oTable.setToolbar(oToolbar);
    
            this._modelTable = oTable;
        },
    
        addSecuredModel: function() {
            var that = this;
            var oContext = that.getContext();

            var objectTypes = ["CALCULATIONVIEW", "ANALYTICVIEW", "ATTRIBUTEVIEW","VIEW"];

            var findDialog = new FindDialog("find", {
                types: objectTypes,
                context: oContext,
                //noOfSelection: 1, // multiselect if not specified? 
                onOK: function(results) {
                    var aModelUrisToAdd = [];
                    var aAlreadyAddedUris = [];
                    if (results && results !== null) {
                        for (var i = 0; i < results.length; i++) {
                            var prop = results[i];
//                            var sModelUri = "/" + prop.packageName + "/" + prop.type.toLowerCase() + "s/" + prop.name;
                            var sModelUri =  prop.name;

                            if (that.getModel() !== undefined) {
                                var alreadyAdded = false;
                                var oData = that.getModel().getData();
                                var securedModels = oData.securedModels;
                                for (var j = 0; j < securedModels.length; j++) {
                                    if (securedModels[j].modelUri === sModelUri) {
                                        alreadyAdded = true;
                                    }
                                }
                                if (alreadyAdded) {
                                    aAlreadyAddedUris.push(sModelUri);
                                } else {
                                    aModelUrisToAdd.push(sModelUri);
                                }
                            }
                        }
                        if (aModelUrisToAdd.length > 0) {
                            var oCmdAddModel = new AddSecuredModel(that.getModel(), aModelUrisToAdd, that.getContext());
                            oData._undoManager.execute(oCmdAddModel);
                        }
                        if (aAlreadyAddedUris.length > 0) {
                            var messageText = "The following models have already been added: \n";
                            for (var i = 0; i < aAlreadyAddedUris.length; i++) {
                                messageText += aAlreadyAddedUris[i] + "\n";
                            }
                            sap.ui.commons.MessageBox.show(messageText,
                                sap.ui.commons.MessageBox.Icon.WARNING,
                                "This could be dangerous", [sap.ui.commons.MessageBox.Action.OK]);
                        }
                    }
                }
            });
     
        },
    
        removeSecuredModel: function(confirmed) {
            var that = this;
            if (confirmed) {

                if (that.getModel() !== undefined) {
                    var oData = that.getModel().getData();
                    var iSelectedIndices = that._modelTable.getSelectedIndices();
                    var contextArray = [];
                    for (var i = 0; i < iSelectedIndices.length; i++) {
                        var iSelectedIndex = iSelectedIndices[i];
                        var context = that._modelTable.getContextByIndex(iSelectedIndex);
                        contextArray.push(context);
                    }
                    var oCmdRemoveSecuredModel = new RemoveSecuredModel(contextArray);
                    oData._undoManager.execute(oCmdRemoveSecuredModel);
                    that._modelTable.clearSelection();
                }

            }
        },
    
        typeIcon: function(sType) {
    
            var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";
    
            var sResult;
            switch (sType) {
                case "CatalogProcedureFilter":
                    sResult = Images.PROCEDURE;
                    break;
                case "RepositoryProcedureFilter":
                    sResult = Images.PROCEDURE;
                    break;
                case "analyticviews":
                    sResult = Images.ANALYTIC_VIEW;
                    break;
                case "attributeviews":
                    sResult = Images.ATTRIBUTE_VIEW; 
                    break;
                case "calculationviews":
                    sResult = Images.CALCULATION_VIEW;
                    break;
                default:
                    sResult = Images.CALCULATION_VIEW;
            }
    
            return sResult ? modulePath + sResult : null;
        },
        
        getModelTable: function(){
            return this._modelTable;
        }
    });
    return ReferenceModelsSection;
});
