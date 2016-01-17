/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/sql/SQLRenderer",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/ApeModel",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/SectionContainer",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/SqlDynamicView",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/AnalyticPrivilegeModelInformation",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ReferenceModelsSection",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/RestrictedAttributesSection",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ValiditiesPane",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/SqlView",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAnyToAttributes",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAttributesToWhereSql",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlDynamicToWhereSql",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAnyToDynamic"
], function(
    SQLRenderer, 
    ApeModel,
    SectionContainer,
    SqlDynamicView,
    AnalyticPrivilegeModelInformation,
    ReferenceModelsSection,
    RestrictedAttributesSection,
    ValiditiesPane,
    SqlView,
    SqlAnyToAttributes,
    SqlAttributesToWhereSql,
    SqlDynamicToWhereSql,
    SqlAnyToDynamic
    ) {
        
    jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SqlPrivilegeEditor");

    var SqlPrivilegeEditor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.SqlPrivilegeEditor", {

        _referenceModelsSection: null,
        _attributeRestrictionsSection: null,
        _radioButtonGroup: null,
        _sqlSection: null,

        metadata: {

            properties: {
                context: {
                    type: "any"
                },
                isDynamic: {
                    type: "boolean",
                    "default": false
                },
                document: {
                    type: "any"
                },
                renderInfo: {
                    type: "any"
                }
            },

            aggregations: {
                _section: {
                    type: "sap.ui.core.Control",
                    multiple: false
                },
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
            this.addStyleClass("sqlEditor");
            this._createSQLPrivilegeLayout();
        },

        _createSQLPrivilegeLayout: function() {

            var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                height: "100%",
                columns: 2,
                widths: ["20%", "80%"]
            });

            var oLeftSection = this._createLeftSection();
            
            this._attributeRestrictionsSection = new RestrictedAttributesSection({ height: "100%" });
            this._attributeRestrictionsSection.addStyleClass("apeRestrictionsSection");
            
            var restrictionSection = this._createRestrictionsSection(this._attributeRestrictionsSection);

            var oCellForLeftSection = new sap.ui.commons.layout.MatrixLayoutCell({
                heiht: "100%"
            });
            oCellForLeftSection.addContent(oLeftSection);

            var oCellForTabControl = new sap.ui.commons.layout.MatrixLayoutCell({
                heiht: "100%"
            });
            oCellForTabControl.addContent(restrictionSection);

            var oRow = new sap.ui.commons.layout.MatrixLayoutRow({
                heiht: "100%"
            });

            oRow.addCell(oCellForLeftSection);
            oRow.addCell(oCellForTabControl);
            oMatrixLayout.addRow(oRow);

            // oMatrixLayout.addStyleClass("apeRestrictionsSection");
            var uAgent = navigator.userAgent.toLowerCase();
            if(uAgent.indexOf("chrome") !== -1 || uAgent.indexOf("safari") !== -1 ){
                 oMatrixLayout.addStyleClass("apeRestrictionsSectionForChrome");
            }else{
                oMatrixLayout.addStyleClass("apeRestrictionsSection");
            }

            this.setAggregation("_layout", oMatrixLayout);
        },

        _createLeftSection: function() {
            
            var oInfoSection = new AnalyticPrivilegeModelInformation();
            oInfoSection.addStyleClass("apeRestrictionsSection");
            
     
            this._referenceModelsSection = new ReferenceModelsSection({ height: "100%" });
            // this._referenceModelsSection.addStyleClass("apeRestrictionsSection");
            var uAgent = navigator.userAgent.toLowerCase();
             if(uAgent.indexOf("chrome") !== -1 || uAgent.indexOf("safari") !== -1 ){
                 this._referenceModelsSection.addStyleClass("apeRestrictionsSectionForChrome");
            }else{
                this._referenceModelsSection.addStyleClass("apeRestrictionsSection");
            }
            

            var oFixFlex = new sap.ui.layout.FixFlex({  height: "100%" });

            oFixFlex.setFixContentSize("230px"); 
            oFixFlex.addFixContent(oInfoSection);
            oFixFlex.setFlexContent(this._referenceModelsSection);

            var oFixFlexOuter = new sap.ui.layout.FixFlex({
                height: "100%"
            });

            oFixFlexOuter.setFixContentSize("34px");
            oFixFlexOuter.setFlexContent(oFixFlex);

            return oFixFlexOuter;
        },

        _createRestrictionsSection: function(attributeRestrictionsSection) {
            var restrictionSection = new sap.ui.layout.FixFlex({
                height: "100%"
            });

            var validitiesSection = new ValiditiesPane();
            validitiesSection.addStyleClass("apeRestrictionsSection");

            var attributeSection = new sap.ui.layout.FixFlex({ height: "100%" });
			
			attributeSection.setFixContentSize("230px");
            attributeSection.addFixContent(validitiesSection);
            attributeSection.setFlexContent(attributeRestrictionsSection);
            
            this._sqlSection = new SqlView();
            this._sqlSection.addStyleClass("apeRestrictionsSection");
            
            var sqlDynamicViewSection = new SqlDynamicView();
            sqlDynamicViewSection.addStyleClass("apeRestrictionsSection");

            var oSectionContainer = new SectionContainer({
          //      index : "{/whereType}",
				index : 1,
				whereSql : this._sqlSection,
                restriction : attributeSection,                        
                conditionProcedureName : sqlDynamicViewSection
            });
            
            restrictionSection.setFlexContent(oSectionContainer);

            this._radioButtonGroup = this._createRadioButtonBar();
            restrictionSection.setFixContentSize("0px");
            restrictionSection.addFixContent(this._radioButtonGroup);
            
            return restrictionSection;
        },
        
        _confirmTypeChange : function(oCommand){
            var that = this;
            return function(confirmed){
                var oData = that.getModel().getData();
                if(confirmed){
                    oData._undoManager.execute(oCommand);
                }else{
                    that._radioButtonGroup.setSelectedIndex(oData.whereType);
                }
            };
        },
        
        //required to couple global undo manager corretly with ace undo manager
        _getSqlEditor: function(){
            if(this._sqlSection){
                return this._sqlSection.getEditor();
            }
        }, 

        _createRadioButtonBar: function() {
            var that = this;

            var oRadioButtonGroup = new sap.ui.commons.RadioButtonGroup({
                columns: 3,
                editable: true,
                width: "100%",
                select: function(oEvent) {
                    var oData = that.getModel().getData();
                    var selectedIndex = oEvent.getParameter("selectedIndex");
                    var oI18N = that.getModel("i18n");
                    var confirm = null;
                    
                    if (oData.whereType !== selectedIndex) {
                        
                        switch(selectedIndex){
                            case ApeModel.WhereType.RESTRICTION:
                                confirm = that._confirmTypeChange(new SqlAnyToAttributes(that.getModel(),null, that._getSqlEditor()));
                                sap.ui.commons.MessageBox.confirm( oI18N.getProperty("txt_any_to_attributes"), confirm , oI18N.getProperty("tit_confirm_switch_view")); 
                                break;
                            case ApeModel.WhereType.WHERE_SQL:
                                if (oData.whereType === ApeModel.WhereType.RESTRICTION) {
                                    confirm = that._confirmTypeChange(new SqlAttributesToWhereSql(that.getModel(),that._getSqlEditor()));
                                    sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_warning_attributes_to_sql"), confirm, oI18N.getProperty("tit_confirm_switch_view"));
                                }else{
                                    confirm = that._confirmTypeChange(new SqlDynamicToWhereSql(that.getModel(),that._getSqlEditor()));
                                    sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_warning_dynamic_to_sql"), confirm, oI18N.getProperty("tit_confirm_switch_view"));
                                }
                                break;
                            case ApeModel.WhereType.CONDITION_PROCEDURE_NAME:
                                confirm = that._confirmTypeChange(new SqlAnyToDynamic(that.getModel(),that._getSqlEditor()));
                                sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_warning_any_to_dynamic"), confirm, oI18N.getProperty("tit_confirm_switch_view"));
                                break;
                        }
                    }
                }
            });
            
            oRadioButtonGroup.bindProperty("selectedIndex", {
            	path: "/whereType",
            	mode: sap.ui.model.BindingMode.OneWay
            });

            var oItemAttributes = new sap.ui.core.Item({
                text: "{i18n>txt_attributes}",
                tooltip: "{i18n>txt_attributes}",
                key: "static"
            });
            oRadioButtonGroup.addItem(oItemAttributes);

            var oItemSql = new sap.ui.core.Item({
                text: "{i18n>txt_sql}",
                tooltip: "{i18n>txt_sql}",
                key: "static"
            });
            oRadioButtonGroup.addItem(oItemSql);

            var oItemDynamic = new sap.ui.core.Item({
                text: "{i18n>txt_dynamic}",
                tooltip: "{i18n>txt_dynamic}",
                key: "{i18n>txt_dynamic}"
            });
            oRadioButtonGroup.addItem(oItemDynamic);

            return oRadioButtonGroup;
        },

        setContext: function(context) {
            this._attributeRestrictionsSection.setContext(context);
            this._referenceModelsSection.setContext(context);
        },

        generateSql: function() {

            var whereStatement = SQLRenderer.renderWhereClause(this.getModel());
            return whereStatement;
        }

    });
    return SqlPrivilegeEditor;
});
