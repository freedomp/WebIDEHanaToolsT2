/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Images",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/dialogs/NewFindDialog",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/IconComboBox",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlChangeProcedureName"
], function(Images, FindDialog, IconComboBox, ApeModel, SqlChangeProcedureName) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SqlDynamicView");
    var SqlDynamicView = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.DynamicView", {
        
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
            this.createDynamicViewLayout();
        },
    
        createDynamicViewLayout: function() {
    
            var that = this;
            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 2,
                widths: ["15%", "85%"]
            });
    
            var oLabel = new sap.ui.commons.Label({
                text: "{i18n>txt_procedure}",
                width: "100%"
            });
    
            var oDropDown = this._createDropDown();
    
            var oValuehelpField = new sap.ui.commons.ValueHelpField({
                width: "50%",
                enabled: true,
                value :"{conditionProcedureName}",
                //value :"{label}",
                valueHelpRequest: function() {
                    var oData = that.getModel().getData();
                    switch(oData.procedureType){
                        case ApeModel.ProcedureType.CATALOG_PROCEDURE:
                            that._displayProcedureValueHelp("CatalogProcedureFilter");
                            break;
                        case ApeModel.ProcedureType.REPOSITORY_PROCEDURE:
                            that._displayProcedureValueHelp("RepositoryProcedureFilter");
                            break;
                    }
                }
            });
    
            oMatrixLayout.createRow(oLabel, oDropDown).addStyleClass("dynamicsqlcombo");
            
            var oEmptyLabel = new sap.ui.commons.Label({
                text: "",
                width: "100%"
            });
            
            oMatrixLayout.createRow(oEmptyLabel, oValuehelpField);
            var oFixFlex = new sap.ui.layout.FixFlex({
                height: "100%"
            });
            oFixFlex.setFixContentSize("auto");
            oFixFlex.addFixContent(oMatrixLayout);
            
            var oPanel = new sap.ui.commons.Panel({
                title: new sap.ui.core.Title({
                    text: "{i18n>txt_dynamic}"
                }),
                height: "100%",
                showCollapseIcon: false,
                content: oFixFlex
            });
    
            this.setAggregation("_layout", oPanel);
        },
        
        getApeContextObject: function(sKey) {
            try {
                return this.getModel().getData()._apeContext[sKey];
            } catch (e) {
                return null;
            }
        },
        
        _procedureIcon: function(sType) {
            var sResult;
            switch (sType) {
                case ApeModel.ProcedureType.CATALOG_PROCEDURE :
                    sResult = Images.PROCEDURE;
                    break;
                case ApeModel.ProcedureType.REPOSITORY_PROCEDURE :
                    sResult = Images.PROCEDURE;
                    break;
                default :
                    break;
                    
            }
            return sResult;
        },
        
        _createDropDown: function() {
    
            var that = this;
            
            var oTypeImage = new sap.ui.commons.Image({
                src: {
                    parts: [
                        {path: "/_apeContext/modulePath"},
                        {path: "procedureType"}
                        ],
                    formatter: function(modulePath, procedureType) {
                        return modulePath + that._procedureIcon(procedureType);
                    }
                }
            });
            
            oTypeImage.addStyleClass("procedureImage");
            
            var oDropDown = new IconComboBox({
                width: "100%",
                icon: oTypeImage,
                selectedKey : "{procedureType}" 
            });
            
            oDropDown.attachChange(function() {
                oTypeImage.rerender();
            });
            
            var catalogItem = new sap.ui.core.ListItem({
                text: "{i18n>txt_catalog_procedure}", 
                key: ApeModel.ProcedureType.CATALOG_PROCEDURE,
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + that._procedureIcon(ApeModel.ProcedureType.CATALOG_PROCEDURE);
                    }
                }
            });

            var repositoryItem = new sap.ui.core.ListItem({
                text: "{i18n>txt_repository_procedure}",
                key: ApeModel.ProcedureType.REPOSITORY_PROCEDURE,
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + that._procedureIcon(ApeModel.ProcedureType.REPOSITORY_PROCEDURE);
                    }
                }
            });
                    
            var oTypeListBox = new sap.ui.commons.ListBox({
                displayIcons: true,
                items: [
                    repositoryItem,
                    catalogItem
                ]
            });

            oDropDown.setListBox(oTypeListBox);
            return oDropDown;
        },
    
        _displayProcedureValueHelp: function(procedureType) {
            var that = this;
            var objectTypes = null;
            if (procedureType === "CatalogProcedureFilter") {
                objectTypes = ["CATALOG_PROCEDURE"];
            } else {
                objectTypes = ["REPO_PROCEDURE"];
            }

            var findDialog = new FindDialog("find", {
                types: objectTypes,
                noOfSelection: 1, // multiselect if not specified? 
                onOK: function(results) {
                    var oData = that.getModel().getData();
                    var oCmdChangeProcedureName = new SqlChangeProcedureName(that.getModel(), results);
                    oData._undoManager.execute(oCmdChangeProcedureName);
                    //that.rerender();
                }
            });
        }
 
    });
    return SqlDynamicView;
});    
    
