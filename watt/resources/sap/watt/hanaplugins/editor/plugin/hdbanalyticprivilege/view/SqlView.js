/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/sql/Editor",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlStackChange",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAttributesToWhereSql"

], function(Editor, SqlStackChange, SqlAttributesToWhereSql) {

    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SqlView");

    var SqlView = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SqlView", {

        _sqlEditor: null,

        metadata: {

            properties: {
                context: {
                    type: "any"
                },
                sql: {
                    type: "string",
                    "default": ""
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
            this.createSqlViewLayout();
        },
        
        onAfterRendering: function(){
            this._sqlEditor.setModel(this.getModel());
        },
        
        getEditor: function() {
            return this._sqlEditor;
        },

        createSqlViewLayout: function() {
            var that = this;
            this._sqlEditor = new Editor({
                width: "100%",
                height: "100%"
            });

            this._sqlEditor.addStyleClass("apeRestrictionsSection");
            this._sqlEditor.getAceEditor().setWrapBehavioursEnabled(true);
            this._sqlEditor.getAceEditor().setOption("showGutter", false);
            this._sqlEditor.getAceEditor().setOption("showPrintMargin", false);

            this._sqlEditor.attachEvent("undoStackChanged", function() {

                if (that.getModel() !== undefined ) {
                    var oData = that.getModel().getData();
                    if(oData._listenToUndoStackChangedEvents){
                        var oCmdSqlStackChange = new SqlStackChange(that._sqlEditor, oData);
                        oData._undoManager.execute(oCmdSqlStackChange);
                    }

                }

            });
            
            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 1
            });

            var oFixFlex = new sap.ui.layout.FixFlex({
                height: "100%"
            });

            var oEditButton = new sap.ui.commons.Button({
                text: "Edit",
                press: function() {
                    var oI18N = that.getModel("i18n");
                    sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_warning_enable_editing"), $.proxy(that.enableEditing, that), oI18N.getProperty("tit_confirm_editing"));
                }
            });

            oMatrixLayout.createRow(oEditButton);
            oMatrixLayout.createRow(new sap.ui.commons.HorizontalDivider({
                width: "100%"
            }));

            oFixFlex.setFixContentSize("auto");
            // oFixFlex.addFixContent(oMatrixLayout);
            oFixFlex.setFlexContent(this._sqlEditor);


            var oPanel = new sap.ui.commons.Panel({
                title: new sap.ui.core.Title({
                    text: "{i18n>txt_sql}"
                }),
                height: "100%",
                showCollapseIcon: false,
                content: oFixFlex
            });

            this.setAggregation("_layout", oPanel);
        },

        enableEditing: function(confirmed) {
            var that = this;
            if (confirmed) {
                this._sqlEditor.setReadOnly(false);
                if (that.getModel() !== undefined) {
                    var oData = that.getModel().getData();
                    var oCmdAttributesToWhereSql = new SqlAttributesToWhereSql(that.getModel());
                    oData._undoManager.execute(oCmdAttributesToWhereSql);
                }
            }
        }
    });

    return SqlView;
});
