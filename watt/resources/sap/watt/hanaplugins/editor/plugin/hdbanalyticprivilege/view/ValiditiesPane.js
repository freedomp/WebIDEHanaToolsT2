/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/IconComboBox",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ConditionalDatePicker",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityAdd",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityRemove",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAnyToAttributes",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/Boolean",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/uimodel/Date",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Images"
    ], function(
        IconComboBox, 
        ConditionalDatePicker, 
        ValidityAdd, 
        ValidityRemove, 
        SqlAnyToAttributes, 
        ApeBoolean, 
        ApeDate, 
        Images
    ) {
 
    $.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ValiditiesPane");
    
    var ValiditiesPane = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ValiditiesPane", {
   
        metadata: {
            aggregations: {
                _panel: {
                    type: "sap.ui.commons.Panel",
                    multiple: false
                },
                _deleteDialog: {
                    type: "sap.ui.commons.Dialog",
                    multiple: false
                }
            }
        },
    
        renderer: {
            render: function(oRm, oControl) {
                oRm.addClass("apeValidities");
                oRm.write("<div ");
                oRm.writeControlData(oControl);
                oRm.writeClasses();
                oRm.writeStyles();
                oRm.write(">");
                oRm.renderControl(oControl.getAggregation("_panel"));
                oRm.write("</div>");
            }
    
        },
    
        init: function() {
            jQuery.sap.require("sap.ui.table.Table");
            var oTable = new sap.ui.table.Table({
                minAutoRowCount: 2,
                visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                firstVisibleRow: 1,
                selectionMode: sap.ui.table.SelectionMode.Single
            });
            oTable.setSelectionMode(sap.ui.table.SelectionMode.Multi);
            var that = this;
    
            var aItems = [new sap.ui.core.ListItem({
                text: "{i18n>txt_between}",
                key: "BT",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.BETWEEN;
                    }
                }
            }), new sap.ui.core.ListItem({
                text: "{i18n>txt_equal}",
                key: "EQ",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.EQUAL;
                    }
                }
            }), new sap.ui.core.ListItem({
                text: "{i18n>txt_greater_equal}",
                key: "GE",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.GREATER_EQUAL;
                    }
                }
            }), new sap.ui.core.ListItem({
                text: "{i18n>txt_greater_than}",
                key: "GT",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.GREATER_THAN;
                    }
                }
            }), new sap.ui.core.ListItem({
                text: "{i18n>txt_less_equal}",
                key: "LE",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.LESSER_EQUAL;
                    }
                }
            }), new sap.ui.core.ListItem({
                text: "{i18n>txt_less_than}",
                key: "LT",
                icon: {
                    path: "/_apeContext/modulePath",
                    formatter: function(modulePath) {
                        return modulePath + Images.LESSER_THAN;
                    }
                }
            })];
    
            var oIconListBox = new sap.ui.commons.ListBox({
                displayIcons: true,
                items: aItems
            });
            var oImage = new sap.ui.commons.Image({
                src : {
                    path : "operator",
                    formatter : $.proxy(that._operatorIcon, that),
                    mode: sap.ui.model.BindingMode.OneWay
                }
            });
            //oImage.bindProperty("src", "operator", $.proxy(that._operatorIcon, that));

            
            var oCombo = new IconComboBox({
                icon: oImage,
                listBox: oIconListBox,
                selectedKey: "{operator}"
            });
    
            oCombo.attachChange($.proxy(that._operatorChanged, that));
    
            //oCombo.setListBox(oIconListBox);
            //oCombo.bindProperty("selectedKey", "operator");
    
            oTable.bindRows("/validities");
    
            var oColOperators = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "{i18n>tit_operator}"
                }),
                template: oCombo,
                width: "80px"
            });
    
            oTable.addColumn(oColOperators);
    
            var oCheckBox = new sap.ui.commons.CheckBox({
                checked: {
                    path: "including",
                    mode: sap.ui.model.BindingMode.TwoWay,
                    type: new ApeBoolean()
                }
    
            });
    
            var oColIncluding = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "{i18n>tit_including}"
                }),
                template: oCheckBox,
                hAlign: "Center",
                width: "40px"
            });
            oTable.addColumn(oColIncluding);
    
            this.oLowDatePicker = new sap.ui.commons.DatePicker({
                yyyymmdd: {
                    path: "lowValue",
                    mode: sap.ui.model.BindingMode.TwoWay,
                    type: new ApeDate()
                },
                change: $.proxy(that._lowDateChanged, that)
            });
    
            var oColLow = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "{i18n>tit_from}"
                }),
                template: this.oLowDatePicker,
                width: "70px"
            });
            oTable.addColumn(oColLow);
    
            this.oHighDatePicker = new ConditionalDatePicker({
                target: "RangeValueFilter",
                actual: {
                    path: "type",
                    mode: sap.ui.model.BindingMode.OneWay
                },
                yyyymmdd: {
                    path: "highValue",
                    mode: sap.ui.model.BindingMode.TwoWay,
                    type: new ApeDate()
                }
            });
    
            this.oHighDatePicker.attachChange($.proxy(that._highDateChanged, that));
   
            var oColHigh = new sap.ui.table.Column({
                label: new sap.ui.commons.Label({
                    text: "{i18n>tit_to}"
                }),
                template: this.oHighDatePicker,
                width: "70px"
            });
            
            oTable.addColumn(oColHigh);
    
            //Delete Button
            var oDeleteBtn = new sap.ui.commons.Button({
                icon: "sap-icon://delete",
                text: "{i18n>txt_remove}",
                enabled: false,
                press: function() {
                    var oI18N = that.getModel("i18n");
                    sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_delete_row"), $.proxy(that._onDeleteButton, that), oI18N.getProperty("tit_confirm_row"));
                    //oDeleteDialog.open();
                }
            });
    
            // selection listener
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

                            if (that.getModel().getData()._apeModel.analyticPrivilege.validities === undefined) {
                                var oI18N = that.getModel("i18n");
                                sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_any_to_attributes_validity"), $.proxy(that.addFirstValidity, that), oI18N.getProperty("tit_confirm_validity"));
                            } else {
                                var oData = that.getModel().getData();
                                var oCmdValidityAdd = new ValidityAdd(that.getModel());
                                oData._undoManager.execute(oCmdValidityAdd);
                                oTable._scrollPageDown();
                            }

                        }
                    }), oDeleteBtn
                ]
            });
    
            oTable.setToolbar(oToolbar);
    
            var oPanel = new sap.ui.commons.Panel({
                title: new sap.ui.core.Title({
                    text: "{i18n>tit_privilege_validity}"
                }),
                height: "100%",
                showCollapseIcon: false,
                content: oTable
            });
            //this.setAggregation("_deleteDialog", oDeleteDialog);
            this.setAggregation("_panel", oPanel);
            this._table = oTable;
    
        }, //end of init
    
        _openToolTip: function(message, control) {
    
            var tooltip = new sap.ui.commons.Callout();
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
        },
        _onDeleteButton: function(confirm) {
            if (confirm) {
    
                var oTable = this._table;
                var aIndicies = oTable.getSelectedIndices();
                var oIdxObjMap = {};
                for (var i in aIndicies) {
                    oIdxObjMap[aIndicies[i]] = oTable.getContextByIndex(aIndicies[i]).getObject();
                }
                var that = this;

                var oCmdValidityRem = new ValidityRemove(that.getModel(), oIdxObjMap);
                var oData = that.getModel().getData();
                oData._undoManager.execute(oCmdValidityRem);
                oTable.clearSelection();

            }
    
        },
    
        _operatorChanged: function(oEvent) {
            var aCells = oEvent.getSource().getParent().getCells();
            if (oEvent.getParameters().selectedItem) {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
                aCells[0].setTooltip(null);
            } else {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
                this._openToolTip("{i18n>txt_invalid_value}", aCells[0]);
            }
        },
    
        _lowDateChanged: function(oEvent) {
            var oSource = oEvent.getSource();
            var oParam = oEvent.getParameters();
            var oContext = oSource.getBindingContext();
            var oObject = oContext.getObject();
            var aCells = oEvent.getSource().getParent().getCells();
            if (oEvent.getParameter("invalidValue")) {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
                this._openToolTip("{i18n>txt_invalid_value}", aCells[2]);
            } else {
    
                if (oObject.type === "RangeValueFilter") {
    
                    if (this._compareDates(oParam.newYyyymmdd, oObject.highValue) <= 0) {
                        aCells[2].setValueState(sap.ui.core.ValueState.Warning);
                        aCells[3].setValueState(sap.ui.core.ValueState.Warning);
                        this._openToolTip("{i18n>txt_from_higher_than_to}", aCells[2]);
                    } else {
                        aCells[2].setValueState(sap.ui.core.ValueState.None);
                        aCells[3].setValueState(sap.ui.core.ValueState.None);
                        aCells[2].setTooltip(null);
                        aCells[3].setTooltip(null);
                    }
                }
            }
        },
    
        _highDateChanged: function(oEvent) {
            var oSource = oEvent.getSource();
            var oParam = oEvent.getParameters();
            var oContext = oSource.getBindingContext();
            var oObject = oContext.getObject();
    
            var aCells = oEvent.getSource().getParent().getCells();
            if (oEvent.getParameter("invalidValue")) {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
                this._openToolTip("{i18n>txt_invalid_value}", aCells[3]);
            } else {
    
                if (oObject.type === "RangeValueFilter") {
                    if (this._compareDates(oObject.lowValue, oParam.newYyyymmdd) <= 0) {
                        aCells[2].setValueState(sap.ui.core.ValueState.Warning);
                        aCells[3].setValueState(sap.ui.core.ValueState.Warning);
                        this._openToolTip("{i18n>txt_from_higher_than_to}", aCells[3]);
                    } else {
                        aCells[2].setValueState(sap.ui.core.ValueState.None);
                        aCells[3].setValueState(sap.ui.core.ValueState.None);
                        aCells[2].setTooltip(null);
                        aCells[3].setTooltip(null);
                    }
                }
            }
        },
    
        /**
         * returns <0 if sDate1 is higher than sDate2
         * returns 0 if sDate1 is equals sDate2
         * returns >0 if sDate1 is lower than sDate2
         **/
        _compareDates: function(sDate1, sDate2) {
            var iDate1 = sDate1 ? Number(sDate1.replace(/-/g, "")) : 0;
            var iDate2 = sDate2 ? Number(sDate2.replace(/-/g, "")) : 1;
            return iDate2 - iDate1;
        },
    
        getApeContextObject: function(sKey) {
            try {
                return this.getModel().getData()._apeContext[sKey];
            } catch (e) {
                return null;
            }
        },
    
        _operatorIcon: function(sOperator) {
    
            var sResult;
            switch (sOperator) {
                case "BT":
                    sResult = Images.BETWEEN;
                    break;
                case "EQ":
                    sResult = Images.EQUAL;
                    break;
                case "GE":
                    sResult = Images.GREATER_EQUAL;
                    break;
                case "GT":
                    sResult = Images.GREATER_THAN;
                    break;
                case "LE":
                    sResult = Images.LESSER_EQUAL;
                    break;
                case "LT":
                    sResult = Images.LESSER_THAN;
                    break;
                default:
                    sResult = null;
    
            }
    
            return sResult ? this.getApeContextObject("modulePath") + sResult : null;
    
        },
    
        addFirstValidity: function(confirmed) {
            var that = this;
            if (confirmed) {

                if (that.getModel() !== undefined) {
                    var oData = that.getModel().getData();
                    var oCmdAddValidity = new ValidityAdd(that.getModel());
                    var oCmdAnyToAttribute = new SqlAnyToAttributes(that.getModel(), oCmdAddValidity);
                    oData._undoManager.execute(oCmdAnyToAttribute);
                }
               
            }
        }
    
    });
    
    return ValiditiesPane;
});
