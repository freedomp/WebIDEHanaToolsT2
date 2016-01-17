/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../util/ResourceLoader", 
    "../view/ClassicalPrivilegeEditor", 
    "../view/SqlPrivilegeEditor"
    ], function(ResourceLoader, ClassicalPrivilegeEditor, SqlPrivilegeEditor) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.AnalyticPrivilegeEditor");
    var AnalyticPrivilegeEditor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.AnalyticPrivilegeEditor", {

        _sqlPrivilegeEditor: null,
        _classicalPrivilegeEditor: null,
        _firstRow: null,

        metadata: {

            aggregations: {
                _sqlLayout: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }, 
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
                if(oControl.getModel().oData.privilegeType === "SQL_ANALYTIC_PRIVILEGE"){
                    oRm.renderControl(oControl.getAggregation("_sqlLayout"));
                }else{
                    oRm.renderControl(oControl.getAggregation("_classicalLayout"));
                }
                oRm.write("</div>");
            }
        },

        init: function() {
            this.addStyleClass("analyticprivilege");
            jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ClassicalRestrictionSection");
            jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.AnalyticPrivilegeModelInformation");

            this.createAnalyticPrivilegeEditor3();
        },
        onBeforeRendering: function() {
            this._sqlPrivilegeEditor.setContext(this.getContext());
            this._classicalPrivilegeEditor.setContext(this.getContext());
        }

    });
    
    AnalyticPrivilegeEditor.prototype.createAnalyticPrivilegeEditor3 = function() {
        var oSqlPrivilege = new SqlPrivilegeEditor();
        var oClassicalPrivilege = new ClassicalPrivilegeEditor();
        
        this.setAggregation("_sqlLayout", oSqlPrivilege);
        this.setAggregation("_classicalLayout", oClassicalPrivilege);
        
        this._sqlPrivilegeEditor = oSqlPrivilege;
        this._classicalPrivilegeEditor = oClassicalPrivilege;
    };

    return AnalyticPrivilegeEditor;

});
