/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/model",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../../sharedmodel/sharedmodel",
        "sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/CalcEngineExpressionEditor",
        "../dialogs/SqlColumnValueHelpDialog",
        "../IconComboBox",
        "../CustomValueHelpField",
        "../OutputToolPopup"
    ],
    function(ResourceLoader, modelbase, modelClass, commands, CalcViewEditorUtil, sharedmodel, CalcEngineExpressionEditor,
        SqlColumnValueHelpDialog, IconComboBox, CustomValueHelpField, OutputToolPopup) {
        "use strict";
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var RestrictedColumnDetails = function(attributes) {
            this._undoManager = attributes.undoManager;
            this.viewNode = attributes.viewNode;
            this.context = attributes.context;
            this.model = attributes.model;
            this.restrictedModel = new sap.ui.model.json.JSONModel();
            this.isNew;
            this.restrictedColumn;
            this.topLayout;
            this.expressionEditor;
            this.addRestrictionButton;
            this.deleteRestrictionButton;
            this.radioButtonGroup;
        };
        RestrictedColumnDetails.prototype = {

            execute: function(command) {
                if (command instanceof Array)
                    return this._undoManager.execute(new modelbase.CompoundCommand(command));
                else {
                    return this._undoManager.execute(command);

                }
            },
            modelJSONData: function(restrictedColumn) {
                if (restrictedColumn) {
                    var restrictedData = {
                        name: restrictedColumn.name,
                        label: restrictedColumn.label,
                        hidden: restrictedColumn.hidden,
                        restrictedMeasureName: restrictedColumn.calculationDefinition ? restrictedColumn.calculationDefinition.formula : "",
                        restrictions: this.getRestrictions(),
                        attributes: this.getAttributes(),
                        measures: this.getMeasures(),
                        operators: this.getOperators(),
                        restrictionExpression: restrictedColumn.restrictionExpression
                    };
                }
                return restrictedData;
            },
            updateModel: function(restrictedColumn,isNew) {
                this.isNew = isNew;
                if (restrictedColumn) {
                    this.restrictedColumn = restrictedColumn;
                    this.restrictedModel.setData(this.modelJSONData(restrictedColumn));
                    if (this.restrictedColumn.restrictionExpression && this.restrictedColumn.restrictionExpression.formula !== "") {
                        this.expressionEditor.setExpression(this.restrictedColumn.restrictionExpression.formula);
                        this.expressionEditor.setReadOnly(false);
                        this.updateRestrictionButtons({
                            add: false,
                            remove: false
                        });
                        this.radioButtonGroup.setSelectedIndex(1);
                        this.radioButtonGroup.fireSelect({
                            selectedIndex: 1
                        });
                        if (this.addRestrictionButton) {
                            this.addRestrictionButton.setEnabled(false);
                            this.addRestrictionButton.setTooltip(resourceLoader.getText("tol_add_restriction"));
                        }
                    } else {
                        this.expressionEditor.setExpression("");
                        this.expressionEditor.setReadOnly(true);
                        this.updateRestrictionButtons({
                            add: true,
                            remove: true
                        });
                        this.radioButtonGroup.setSelectedIndex(0);
                        this.radioButtonGroup.fireSelect({
                            selectedIndex: 0
                        });

                    }
                    this.unsubscribe();
                    this.subscribe();
                    this.restrictedModel.updateBindings(true);
                }
            },
            subscribe: function() {
                // this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, that.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
                this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.OuterModelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
                this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
                if (this.restrictedColumn) {
                    this.restrictedColumn.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
                    this.restrictedColumn.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
                    this.restrictedColumn.$getEvents().subscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
                }
            },
            unsubscribe: function() {
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
                this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
                this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CREATED, this.OuterModelChanged, this);
                this.model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_DELETED, this.OuterModelChanged, this);
                this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CREATED, this.OuterModelChanged, this);
                this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_DELETED, this.OuterModelChanged, this);
                if (this.restrictedColumn) {
                    this.restrictedColumn.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CREATED, this.modelChanged, this);
                    this.restrictedColumn.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_DELETED, this.modelChanged, this);
                    this.restrictedColumn.$getEvents().unsubscribe(commands.ViewModelEvents.RESTRICTION_CHANGED, this.modelChanged, this);
                }
            },
            OuterModelChanged: function(object) {
                var that = this;
                if (object.type === commands.ViewModelEvents.PARAMETER_CREATED ||
                    object.type === commands.ViewModelEvents.PARAMETER_DELETED ||
                    object.type === commands.ViewModelEvents.ELEMENT_CREATED ||
                    object.type === commands.ViewModelEvents.ELEMENT_DELETED) {
                    var model = that.createElementModel();
                    var elementModel = new sap.ui.model.json.JSONModel();
                    elementModel.setData(model);
                    that.expressionEditor.setElementModel(elementModel);
                }
                if (object.type === commands.ViewModelEvents.ELEMENT_CREATED ||
                    object.type === commands.ViewModelEvents.ELEMENT_DELETED) {
                    that.restrictedModel.getData().measures = that.getMeasures();
                    that.restrictedModel.updateBindings(true);
                }
            },
            modelChanged: function() {
                if (this.restrictedColumn) {
                    this.restrictedModel.setData(this.modelJSONData(this.restrictedColumn));
                    this.restrictedModel.updateBindings(true);
                }
            },
            getElement: function(attributes) {
                if (attributes.inputKey || attributes.inputKey === 0) {
                    var input = attributes.selectedView.inputs.getAt(attributes.inputKey);
                    if (input && input.getSource()) {
                        return input.getSource().elements.get(attributes.elementName);
                    }} else {
                    return attributes.selectedView.elements.get(attributes.elementName);
                }
            },
            getAttributes: function() {
                var that = this;
                var attributes = [];
                this.viewNode.elements.foreach(function(element) {
                    if (element.aggregationBehavior === modelClass.AggregationBehavior.NONE) {
                        if (!element.calculationDefinition) {
                            if (!that.isBasedOnElementProxy(element, that.model.columnView, that.viewNode)) {
                                attributes.push({
                                    attributeElement: element
                                });
                            }
                        }
                    }
                });
                return attributes;
            },
            getMeasures: function() {
                var that = this;
                var measures = [];
                this.viewNode.elements.foreach(function(element) {
                    if (element.measureType !== modelClass.MeasureType.RESTRICTION && element.measureType !== modelClass.MeasureType.COUNTER &&
                        element.measureType !== modelClass.MeasureType.CALCULATED_MEASURE && element.aggregationBehavior !== modelClass.AggregationBehavior.NONE && !element.calculationDefinition) {
                        if (!that.isBasedOnElementProxy(element, that.model.columnView, that.viewNode)) {
                            measures.push({
                                measure: element
                            });
                        }
                    }
                });
                return measures;
            },
            getOperators: function() {
                var operatorData = [{
                    operator: "Between",
                    key: sharedmodel.ValueFilterOperator.BETWEEN
                }, {
                    operator: "Equal",
                    key: sharedmodel.ValueFilterOperator.EQUAL
                }, {
                    operator: "GreaterEqual",
                    key: sharedmodel.ValueFilterOperator.GREATER_EQUAL
                }, {
                    operator: "GreaterThan",
                    key: sharedmodel.ValueFilterOperator.GREATER_THAN
                }, {
                    operator: "Is Not Null",
                    key: "IS_NOT_NULL"
                }, {
                    operator: "IsNull",
                    key: sharedmodel.ValueFilterOperator.IS_NULL
                }, {
                    operator: "LessEqual",
                    key: sharedmodel.ValueFilterOperator.LESS_EQUAL
                }, {
                    operator: "LessThan",
                    key: sharedmodel.ValueFilterOperator.LESS_THAN
                }];

                return operatorData;
            },
            getRestrictions: function() {
                var restrictions = [];
                this.restrictedColumn.restrictions.foreach(function(restriction) {
                    restrictions.push({
                        restrictedElement: restriction
                    });
                });
                return restrictions;
            },
            getContent: function() {
                if (!this.topLayout)
                    this.topLayout = new sap.ui.commons.layout.VerticalLayout({
                        height: "100%"
                    });
                this.topLayout.addStyleClass("detailsMainDiv");
                this.topLayout.addStyleClass("customProperties");
                this.buildContent();
                return this.topLayout;
            },
            buildContent: function() {
                var that = this;
                var headerLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%"
                });

                this.headerLabel = new sap.ui.commons.Label({
                    text: {
                        path: "name",
                        formatter: function(name) {
                            return resourceLoader.getText("txt_details") + " " + (that.restrictedColumn ? that.restrictedColumn.name : "");
                        }
                    },
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.headerLabel],
                    hAlign: sap.ui.commons.layout.HAlign.Center,
                    vAlign: sap.ui.commons.layout.VAlign.Center
                }).addStyleClass("detailsHeaderStyle"));

                this.topLayout.addContent(headerLayout);

                var detailsLayout = new sap.ui.commons.layout.VerticalLayout();

                //General section
                var generalTitleLayout = this.getTitleBar(resourceLoader.getText("tit_general"), null, false);
                detailsLayout.addContent(generalTitleLayout);
                detailsLayout.addContent(null);
                var generalLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    width: "100%"
                    //   widths: ["10%", "80%", "10%"]
                });
                var generalContent = this.getGeneralSectionContent();
                generalLayout.createRow(generalContent);
                detailsLayout.addContent(generalLayout);

                var restrictionslTitleLayout = this.getTitleBar(resourceLoader.getText("tit_restrictions"), null, false);
                detailsLayout.addContent(restrictionslTitleLayout);
                var restrictionContent = this.getRestrictionContent();

                detailsLayout.addContent(restrictionContent);

                this.topLayout.addContent(detailsLayout);

                this.topLayout.setModel(this.restrictedModel);

            },

            getTitleBar: function(headerName, iconPath, alignCenter, toolBar) {
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
                if (!toolBar)
                    headMatrixLayout.addStyleClass("headerHeight");
                var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign: alignCenter ? sap.ui.commons.layout.HAlign.Center : sap.ui.commons.layout.HAlign.Begin,
                    vAlign: alignCenter ? sap.ui.commons.layout.VAlign.Center : sap.ui.commons.layout.VAlign.Middle,
                });

                if (toolBar)
                    headerMatrixLayoutCell.addStyleClass("parameterToolbarStyle");
                else
                    headerMatrixLayoutCell.addStyleClass("parameterHeaderStyle");

                if (iconPath) {
                    var icon = new sap.ui.commons.Image({
                        src: iconPath,
                    });
                }
                var headerNameLabel = new sap.ui.commons.Label({
                    text: headerName,
                    design: sap.ui.commons.LabelDesign.Bold
                });
                //   headerName.bindProperty("text", "IP1");

                //headerMatrixLayoutCell.addContent(icon);
                headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
                    width: "10px",
                    vAlign: sap.ui.commons.layout.VAlign.Middle,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }));
                headerMatrixLayoutCell.addContent(headerNameLabel);

                headMatrixLayout.createRow(headerMatrixLayoutCell);

                return headMatrixLayout;
            },

            getGeneralSectionContent: function() {
                var that = this;
                var generalSectionLayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 2,
                    width: "100%",
                    widths: ["30%", "70%"]
                });

                generalSectionLayout.createRow(null);
                var nameLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_name"),
                    required: true
                }).addStyleClass("labelFloat");

                var nameText = new sap.ui.commons.TextField({
                    width: "80%",
                    value: "{/name}",
                    change: function(oevent) {
                        this.setValueState(sap.ui.core.ValueState.None);
                        this.setTooltip(null);
                        var errorValue = that.isNameValid(oevent.getSource().getValue());
                        if (!errorValue) {
                            if (that.restrictedModel.getData().label === "") {
                                descriptionText.setValue(oevent.getSource().getValue());
                                that.execute(
                                    new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                        objectAttributes: {
                                            name: oevent.getSource().getValue(),
                                            label: oevent.getSource().getValue()
                                        }
                                    })

                                );

                            } else {
                                that.execute(new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                    objectAttributes: {
                                        name: oevent.getSource().getValue()
                                    }
                                }));
                            }

                        } else {
                            var message = errorValue;
                            var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + that.restrictedColumn.name + "'"];
                            message = resourceLoader.getText("msg_message_toast_restricted_column_error", messageObjects) + " (" + message + ")";
                            this.setValue(that.restrictedColumn.name);
                            jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
                            sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
                                of: that.topLayout,
                                offset: "-10px -100px"
                            });
                        }
                    },
                    liveChange: function(event) {
                        var value = event.getParameter("liveValue");
                        var errorValue = that.isNameValid(value);
                        if (errorValue) {
                            this.setTooltip(errorValue);
                            this.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            this.setTooltip(null);
                            this.setValueState(sap.ui.core.ValueState.None);
                        }
                    }
                }).addStyleClass("dummyTest1");

                generalSectionLayout.createRow(nameLabel, nameText);

                var descriptionLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_label"),
                    required: false
                }).addStyleClass("labelFloat");
                var descriptionText = new sap.ui.commons.TextField({
                    width: "80%"
                }).bindProperty("value", "/label").addStyleClass("dummyTest2");
                descriptionText.attachChange(function(oevent) {
                    that.execute(new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                        objectAttributes: {
                            label: oevent.getParameter("newValue")
                        }
                    }));

                });


                generalSectionLayout.createRow(descriptionLabel, descriptionText);

                var measureLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("txt_base_measure"),
                    required: true
                }).addStyleClass("labelFloat");
                var oImage = new sap.ui.commons.Image({
                    src: {
                        path: "restrictedMeasureName",
                        formatter: function(restrictedMeasureName) {
                            if (restrictedMeasureName && restrictedMeasureName.aggregationBehavior)
                                return that.getIconPath(restrictedMeasureName);
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });
                var measureCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    width: "80%",
                    canedit: false
                    // icon: oImage,
                }).addStyleClass("borderIconCombo");
                measureCombo.attachChange(function(event) {

                    var newValue = event.getParameter("newValue");
                    var selectedItem = event.getParameter("selectedItem");
                    if (selectedItem) {
                        var bindingContext = selectedItem.getBindingContext();
                        if (bindingContext) {
                            var measure = bindingContext.getProperty("measure");
                            if (measure) {
                                that.execute(new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                    calculationAttributes: {
                                        formula: newValue
                                    },
                                 /*   objectAttributes: {
                                        aggregationBehavior: measure.aggregationBehavior,
                                        engineAggregation:measure.aggregationBehavior
                                    },*/
                                    typeAttributes: {
                                        name: that.restrictedColumn.name,
                                        primitiveType: measure.inlineType.primitiveType,
                                        length: measure.inlineType.length,
                                        scale: measure.inlineType.scale
                                    }
                                }));
                            }
                            that.restrictedModel.getData().restrictedMeasureName = newValue;
                            that.restrictedModel.updateBindings(true);
                        }
                    }

                });
                var measureListItem = new sap.ui.core.ListItem({
                    text: {
                        path: "measure",
                        formatter: function(measure) {
                            if (measure) {
                                return measure.name;
                            } else {
                                return "";
                            }
                        }
                    },
                    key: {
                        path: "measure",
                        formatter: function(measure) {
                            if (measure) {
                                return measure.name;
                            } else {
                                return "";
                            }
                        }
                    },
                    icon: {
                        path: "measure",
                        formatter: function(measure) {
                            if (measure) {
                                return that.getIconPath(measure);
                            }
                        }
                    }
                });


                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/measures",
                        template: measureListItem
                    }
                });
                measureCombo.setListBox(listBox);
                /*measureCombo.bindItems({
                    path: "/measures",
                    template: measureListItem
                });*/

                // var parameterTypeModel = new sap.ui.model.json.JSONModel(parameterTypes);
                //   typeCombo.setModel(parameterTypeModel);

                measureCombo.bindProperty("selectedKey", {
                    path: "/restrictedMeasureName",
                    formatter: function(restrictedMeasureName) {
                        if (restrictedMeasureName) {
                            CalcViewEditorUtil.clearErrorMessageTooltip(measureCombo);
                            return restrictedMeasureName;
                        } else {
                            if(!that.isNew){
                            if (measureCombo.getValueState() !== sap.ui.core.ValueState.Error) {
                                CalcViewEditorUtil.addErrorMessageTooltip(measureCombo, resourceLoader.getText("msg_field_not_empty"));
                            }
                            }else{
                              CalcViewEditorUtil.clearErrorMessageTooltip(measureCombo);   
                            }
                            return "";
                        }
                    }
                });
                measureCombo.bindProperty("value", {
                    path: "/restrictedMeasureName",
                    formatter: function(restrictedMeasureName) {
                        if (restrictedMeasureName) {
                            return restrictedMeasureName;
                        } else {
                            return "";
                        }
                    }
                });

                generalSectionLayout.createRow(measureLabel, measureCombo);

                var hiddenCheckBox = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("tit_hidden"),
                    width: "30%",
                    change: function(oevent) {
                        var hiddenCommand = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                            objectAttributes: {
                                hidden: oevent.getSource().getChecked()
                            }
                        });
                        that.restrictedModel.getData().hidden = oevent.getSource().getChecked();
                        that.execute(hiddenCommand);
                    }
                }).bindProperty("checked", "/hidden").addStyleClass("marginFields");

                generalSectionLayout.createRow(null, hiddenCheckBox);

                return generalSectionLayout;
            },
            isNameValid: function(value) {
                var that = this;
                var exist = false;
                if (value === "") {
                    return resourceLoader.getText("msg_column_invalid_empty");
                }
                if (!CalcViewEditorUtil.checkValidUnicodeChar(value)) {
                    return resourceLoader.getText("msg_column_invalid_unicode", CalcViewEditorUtil.getInvalidUnicodeCharacters());
                }
                this.viewNode.elements.foreach(function(element) {
                    if (element.name !== that.restrictedColumn.name && element.name === value) {
                        exist = true;
                    }
                });

                if (exist) {
                    return resourceLoader.getText("msg_column_already_exists", value);
                }

            },
            getRestrictionContent: function() {
                var that = this;
                var restrictionSectionlayout = new sap.ui.commons.layout.MatrixLayout({
                    columns: 1,
                    width: "100%",
                    height: "100%"
                });

                restrictionSectionlayout.createRow(null);
                this.radioButtonGroup = new sap.ui.commons.RadioButtonGroup({
                    columns: 2,
                    selectedIndex: 0,
                    select: function() {
                        if (that.radioButtonGroup.getSelectedItem().getText() === "Columns") {
                            restrictionContentCell.removeContent(expressionEditor);
                            restrictionContentCell.addContent(testrictiontable);
                            if (!that.restrictedColumn.restrictionExpression || that.restrictedColumn.restrictionExpression.formula === "") {
                                that.updateRestrictionButtons({
                                    add: true,
                                    remove: true
                                });
                                if (that.addRestrictionButton) {
                                    that.addRestrictionButton.setEnabled(true);
                                    that.addRestrictionButton.setTooltip(resourceLoader.getText("tol_add"));
                                }
                            } else {
                                that.updateRestrictionButtons({
                                    add: false,
                                    remove: false
                                });
                                if (that.addRestrictionButton) {
                                    that.addRestrictionButton.setEnabled(false);
                                    that.addRestrictionButton.setTooltip(resourceLoader.getText("tol_add_restriction"));
                                }
                            }

                        } else {
                            var callBack = function(result) {
                                if (result) {
                                    var expression = "";
                                    restrictionContentCell.removeContent(testrictiontable);
                                    restrictionContentCell.addContent(expressionEditor);
                                    that.updateRestrictionButtons({
                                        add: false,
                                        remove: false
                                    });
                                    if (that.addRestrictionButton) {
                                        that.addRestrictionButton.setEnabled(false);
                                    }
                                    if (!that.restrictedColumn.restrictionExpression || that.restrictedColumn.restrictionExpression.formula === "") {
                                        that.restrictedColumn.restrictions.foreach(function(restriction) {
                                            var restrictionText = "";
                                            if (restriction.element) {
                                                var elementName = "\"" + restriction.element.name + "\"";
                                                restrictionText = restrictionText + "(";
                                                var appendingColumn = "";
                                                restriction.valueFilters.foreach(function(valueFilter) {
                                                    if (appendingColumn !== "") {
                                                        appendingColumn = appendingColumn + " OR ";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.BETWEEN) {
                                                        if (valueFilter.including === "true") {
                                                            appendingColumn = elementName + " >= " + "'" + valueFilter.lowValue + "'" + " AND " + elementName + " <= " + "'" + valueFilter.highValue + "'";
                                                        } else {
                                                            appendingColumn = elementName + " > " + "'" + valueFilter.lowValue + "'" + " OR " + elementName + " < " + "'" + valueFilter.highValue + "'";
                                                        }
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.EQUAL) {
                                                        appendingColumn = elementName + " = " + "'" + valueFilter.value + "'";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.GREATER_EQUAL) {
                                                        appendingColumn = elementName + " >= " + "'" + valueFilter.value + "'";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.GREATER_THAN) {
                                                        appendingColumn = elementName + " > " + "'" + valueFilter.value + "'";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.IS_NOT_NULL) {
                                                        appendingColumn = "not isNull(" + elementName + ")";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.IS_NULL) {
                                                        appendingColumn = "isNull(" + elementName + ")";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.LESS_EQUAL) {
                                                        appendingColumn = elementName + " <= " + "'" + valueFilter.value + "'";
                                                    }
                                                    if (valueFilter.operator === sharedmodel.ValueFilterOperator.LESS_THAN) {
                                                        appendingColumn = elementName + " < " + "'" + valueFilter.value + "'";
                                                    }

                                                });
                                                if (appendingColumn !== "") {
                                                    restrictionText = restrictionText + appendingColumn + ")";
                                                }
                                            }
                                            if (expression === "") {
                                                expression = expression + restrictionText;
                                            } else {
                                                expression = expression + " AND " + restrictionText;
                                            }

                                        });
                                        that.expressionEditor.setExpression(expression);
                                     /*   var changeCommand = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                            restrictionAttributes: {
                                                formula: expression
                                            }
                                        });
                                        var deleteCommands = [];
                                        that.restrictedColumn.restrictions.foreach(function(restrictedElement) {
                                            deleteCommands.push(new modelbase.DeleteCommand(restrictedElement, false));
                                        });
                                        if (deleteCommands.length > 0) {
                                            deleteCommands.push(changeCommand);
                                            that.execute(deleteCommands);
                                            that.restrictedModel.getData().restrictions = that.getRestrictions();
                                            that.restrictedModel.updateBindings(true);
                                        }*/
                                    }
                                } else {
                                    that.radioButtonGroup.setSelectedItem(columnItem);
                                }
                            }
                            if (that.restrictedColumn.restrictions && that.restrictedColumn.restrictions.count() > 0) {
                                that.expressionEditor.setReadOnly(true);
                                callBack(true);
                              //  sap.ui.commons.MessageBox.confirm(resourceLoader.getText("msg_expression_only_maintain_want_continue_question"), callBack, " Restrictions Using Expression");
                            } else {
                                that.expressionEditor.setReadOnly(false);
                                restrictionContentCell.removeContent(testrictiontable);
                                restrictionContentCell.addContent(expressionEditor);
                            }


                        }

                    }
                }).addStyleClass("radioButtonStyle");
                var columnItem = new sap.ui.core.Item({
                    text: resourceLoader.getText("Columns"),
                    tooltip: resourceLoader.getText("Columns"),
                    key: "Columns"
                });
                this.radioButtonGroup.addItem(columnItem);
                var expressionItem = new sap.ui.core.Item({
                    text: resourceLoader.getText("txt_expression"),
                    tooltip: resourceLoader.getText("txt_expression"),
                    key: "Expression"
                });
                this.radioButtonGroup.addItem(expressionItem);

                var radioButtonCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    hAlign: sap.ui.commons.layout.HAlign.Center,
                    vAlign: sap.ui.commons.layout.VAlign.Center,
                    height: "100%"
                });
                radioButtonCell.addContent(this.radioButtonGroup);

                restrictionSectionlayout.createRow(radioButtonCell);

                var restrictionContentCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    height: "100%",
                    hAlign: sap.ui.commons.layout.HAlign.Center,
                    vAlign: sap.ui.commons.layout.VAlign.Top
                });
                var testrictiontable = this.getRestrictionTable();
        
                var expressionEditor = this.getExpressionEditor().addStyleClass("dummyTest5");
                restrictionContentCell.addContent(testrictiontable);

                restrictionSectionlayout.createRow(restrictionContentCell);

                return restrictionSectionlayout;

            },
            getRestrictionTable: function() {
                var that = this;
                var restrictionTable = new sap.ui.table.Table({
                    visibleRowCount: 10,
                    width: "100%",
                    noDataText:{
                        path: " ",
                        formatter:function(event){
                            if(that.restrictedColumn && that.restrictedColumn.restrictionExpression && that.restrictedColumn.restrictionExpression.formula !== ""){
                            return resourceLoader.getText("tol_add_restriction");
                            }
                            return "No Data";
                        }
                    }
                }).addStyleClass("dummyTest4");

                var toolBar = new sap.ui.commons.Toolbar();
                // toolBar.addStyleClass("toolbarBackGround");
                toolBar.addStyleClass("parameterToolbarStyle");
                restrictionTable.attachRowSelectionChange(function(event){
                    if(restrictionTable.getSelectedIndices().length > 0){
                    that.deleteRestrictionButton.setEnabled(true);
                    }else{
                    that.deleteRestrictionButton.setEnabled(false);    
                    }
                });

                this.addRestrictionButton = new sap.ui.commons.Button({
                    icon: "sap-icon://add", // resourceLoader.getImagePath("Add.png"),
                    // text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    press: function(oevent) {
                        var changeCommand;
                        if (that.restrictedColumn.restrictionExpression && that.restrictedColumn.restrictionExpression.formula !== "") {
                            changeCommand = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                restrictionAttributes: {
                                    formula: "",
                                },
                            });
                        }
                        var addCommand = new commands.AddRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, {});
                        if (changeCommand)
                            var restriction = that.execute([changeCommand, addCommand]);
                        else
                            that.execute(addCommand);
                        that.restrictedModel.getData().restrictions = that.getRestrictions();
                        /*that.restrictedModel.getData().restrictions.push({
                            restrictedElement: restriction
                        });*/
                        that.restrictedModel.updateBindings(true);
                        restrictionTable.setSelectionInterval(that.restrictedModel.getData().restrictions.length - 1, that.restrictedModel.getData().restrictions.length - 1);
                    }
                });
                this.deleteRestrictionButton = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    // text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    enabled: {
                        path: "name",
                        formatter: function() {
                            if (that.restrictedModel.getData().restrictions && that.restrictedModel.getData().restrictions.length > 0) {
                                if(restrictionTable.getSelectedIndices().length > 0){
                                    return true;
                                }
                            } else {
                                return false;
                            }
                        }
                    },
                    press: function(oevent) {
                        var deleteCommands = [];
                        for (var i = 0; i < restrictionTable.getSelectedIndices().length; i++) {
                            var bindContext = restrictionTable.getContextByIndex(restrictionTable.getSelectedIndices()[i]);
                            if (bindContext) {
                                var restrictedElement = bindContext.getProperty("restrictedElement");
                                if (restrictedElement) {
                                    deleteCommands.push(new modelbase.DeleteCommand(restrictedElement, false));
                                    restrictionTable.removeSelectionInterval(restrictionTable.getSelectedIndices()[i], restrictionTable.getSelectedIndices()[i]);
                                }
                            }
                        }
                        that.execute(deleteCommands);
                        that.restrictedModel.getData().restrictions = that.getRestrictions();
                        that.restrictedModel.updateBindings(true);
                    }

                });
                toolBar.addRightItem(this.addRestrictionButton);
                toolBar.addRightItem(this.deleteRestrictionButton);
                /*toolBar.addItem(new sap.ui.commons.Label({
                    text: "Restrictions"
                }));*/
                restrictionTable.setToolbar(toolBar);
                toolBar.setModel(that.restrictedModel);
                var oImage = new sap.ui.commons.Image({
                    src: {
                        path: "restrictedElement",
                        formatter: function(restrictedElement) {
                            if (restrictedElement && restrictedElement.element)
                                return that.getIconPath(restrictedElement.element);
                        }
                    }
                    //src: resourceLoader.getImagePath("Attribute.png")
                });

                var referenceColumnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
                    width: "100%",
                    canedit: false,
                    valueHelpRequest: function(event) {
                        var selectedView = that.model.columnView.getDefaultNode();
                        var restrictedElement = event.getSource().getBindingContext().getProperty("restrictedElement");
                        var selectedElement = function(attributes) {
                            attributes.selectedView = selectedView;
                            var element = that.getElement(attributes);
                            var entityFQN;
                            if (attributes.inputKey || attributes.inputKey === 0) {
                                var input = selectedView.inputs.getAt(attributes.inputKey);
                                if (input && input.getSource()) {
                                    entityFQN = input.getSource().fqName;
                                }
                            }
                            if (element && restrictedElement) {
                                var valueFilter = {};
                                if (!(restrictedElement.valueFilters && restrictedElement.valueFilters.count() > 0)) {
                                    valueFilter.type = sharedmodel.ValueFilterType.SINGLE_VALUE_FILTER;
                                    valueFilter.value = "";
                                    valueFilter.operator = sharedmodel.ValueFilterOperator.EQUAL;
                                    valueFilter.including = 'true';
                                }

                                that.execute(new commands.ChangeRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, restrictedElement.$getKeyAttributeValue(), {
                                    elementName: element.name,
                                    entityFQN: entityFQN,
                                    valueFilter: valueFilter
                                }));
                                that.restrictedModel.updateBindings(true);
                            }
                        };
                        var toopPopup = new OutputToolPopup({
                            viewNode: selectedView,
                            opener: event.getSource(),
                            callback: selectedElement,
                            showCalculatedColumns : false,
                            excludedElements: that.getExcludedElements(selectedView)
                        });
                        toopPopup.open();
                    }
                });
                referenceColumnField.bindProperty("value", {
                    path: "restrictedElement",
                    formatter: function(restrictedElement) {
                        if (restrictedElement && restrictedElement.element) {
                            if (restrictedElement.element.$getContainer() instanceof modelClass.Entity) {
                                return restrictedElement.element.$getContainer().name + "." + restrictedElement.element.name;
                            }
                            return restrictedElement.element.name;
                        } else
                            return "";
                    }
                });
                referenceColumnField.bindProperty("tooltip", {
                    path: "restrictedElement",
                    formatter: function(restrictedElement) {
                        if (restrictedElement && restrictedElement.element) {
                            if (restrictedElement.element.$getContainer() instanceof modelClass.Entity) {
                                return restrictedElement.element.$getContainer().name + "." + restrictedElement.element.name;
                            }
                            return restrictedElement.element.name;
                        } else
                            return "";
                    }
                });

                var restrictedColumn = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconComboBox({
                    icon: oImage,
                    canedit: false
                }).addStyleClass("marginLeft");
                restrictedColumn.bindProperty("selectedKey", {
                    path: "restrictedElement",
                    formatter: function(restrictedElement) {
                        if (restrictedElement && restrictedElement.element)
                            return restrictedElement.element.name;
                        else {
                            if (restrictedColumn) {
                                restrictedColumn.setValue("");
                            }
                        }
                    }
                });
                restrictedColumn.bindProperty("value", {
                    path: "restrictedElement",
                    formatter: function(restrictedElement) {
                        if (restrictedElement && restrictedElement.element)
                            return restrictedElement.element.name;
                        else
                            return "";
                    }
                })
                restrictedColumn.attachChange(function(oevent) {
                    var selectedItem = oevent.getParameter("selectedItem");
                    var restrictedElement = oevent.getSource().getBindingContext().getProperty("restrictedElement")
                    if (selectedItem && restrictedElement) {
                        var bindContext = selectedItem.getBindingContext();
                        var attribute = bindContext.getProperty("attributeElement");
                    }
                    var valueFilter = {};
                    if (!(restrictedElement.valueFilters && restrictedElement.valueFilters.count() > 0)) {
                        valueFilter.type = sharedmodel.ValueFilterType.SINGLE_VALUE_FILTER;
                        valueFilter.value = "";
                        valueFilter.operator = sharedmodel.ValueFilterOperator.EQUAL;
                        valueFilter.including = 'true';
                    }

                    if (attribute) {
                        that.execute(new commands.ChangeRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, restrictedElement.$getKeyAttributeValue(), {
                            elementName: attribute.name,
                            valueFilter: valueFilter
                        }));
                        that.restrictedModel.updateBindings(true);
                    }


                });
                var restrictedListItem = new sap.ui.core.ListItem({})

                restrictedListItem.bindProperty("text", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }
                });
                restrictedListItem.bindProperty("key", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        return attributeElement ? attributeElement.name : "";
                    }
                });
                restrictedListItem.bindProperty("icon", {
                    path: "attributeElement",
                    formatter: function(attributeElement) {
                        if (attributeElement && attributeElement.aggregationBehavior)
                            return that.getIconPath(attributeElement);
                    }
                });
                var listBox = new sap.ui.commons.ListBox({
                    displayIcons: true,
                    items: {
                        path: "/attributes",
                        template: restrictedListItem
                    }
                });
                restrictedColumn.setListBox(listBox);
                /*restrictedColumn.bindItems({
                    path: "/attributes",
                    template: restrictedListItem
                });*/

                var column = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_column")
                    }),
                    template: referenceColumnField
                });
                column.setName(resourceLoader.getText("txt_column"));

                var operatorCombo = new sap.ui.commons.ComboBox({
                    canedit: false,
                    items: {
                        path: "/operators",
                        template: new sap.ui.core.ListItem({
                            text: "{operator}",
                            key: "{key}"
                        })

                    },
                    enabled: {
                        path: "restrictedElement",
                        formatter: function(restrictedElement) {
                            if (restrictedElement && restrictedElement.element) {
                                return true;
                            } else return false;
                        }
                    },
                    selectedKey: {
                        path: "restrictedElement",
                        formatter: function(restrictedElement) {
                            if (restrictedElement && restrictedElement.valueFilters && restrictedElement.valueFilters.get(0)) {
                                var valueFilter = restrictedElement.valueFilters.get(0);
                                if(valueFilter && valueFilter.operator === sharedmodel.ValueFilterOperator.IS_NULL){
                                    if(valueFilter.including === "false"){
                                        return "IS_NOT_NULL";
                                    }
                                }
                                return restrictedElement.valueFilters.get(0).operator;
                            } else {
                                operatorCombo.setValue("");
                            }
                        }

                    },
                    change: function(event) {
                        var selectedItem = event.getParameter("selectedItem");
                        var restrictedElement = event.getSource().getBindingContext().getProperty("restrictedElement");
                        var including = restrictedElement.valueFilters.toArray()[0].including;
                        if (selectedItem && restrictedElement) {
                            var bindContext = selectedItem.getBindingContext();
                            var selectedKey = bindContext.getProperty("key");
                            if (selectedKey === "IS_NOT_NULL") {
                                including = 'false';
                                selectedKey = sharedmodel.ValueFilterOperator.IS_NULL;
                            } else if (selectedKey === sharedmodel.ValueFilterOperator.IS_NULL) {
                                including = 'true';
                            }
                        }
                        var valueFilter = {
                            operator: selectedKey,
                            including: including,
                            type: selectedKey === sharedmodel.ValueFilterOperator.BETWEEN ? sharedmodel.ValueFilterType.RANGE_VALUE_FILTER : sharedmodel.ValueFilterType.SINGLE_VALUE_FILTER
                        };
                        if (selectedKey === sharedmodel.ValueFilterOperator.BETWEEN) {
                            valueFilter.lowValue = restrictedElement.valueFilters.toArray()[0].lowValue ? restrictedElement.valueFilters.toArray()[0].lowValue : "";
                            valueFilter.highValue = restrictedElement.valueFilters.toArray()[0].highValue ? restrictedElement.valueFilters.toArray()[0].highValue : "";
                        }
                        that.execute(new commands.ChangeRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, restrictedElement.$getKeyAttributeValue(), {
                            valueFilter: valueFilter
                        }));
                        that.restrictedModel.updateBindings(true);
                    }
                });
                var operator = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_operator")
                    }),
                    template: operatorCombo
                });
                operator.setName(resourceLoader.getText("txt_operator"));


                var value = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_value")
                    }),
                    template: new sap.ui.commons.ValueHelpField({
                        value: {
                            path: "restrictedElement",
                            formatter: function(restrictedElement) {
                                if (restrictedElement && restrictedElement.valueFilters && restrictedElement.valueFilters.get(0)) {
                                    if (restrictedElement.valueFilters.get(0).operator === sharedmodel.ValueFilterOperator.BETWEEN) {
                                        var lowValue = restrictedElement.valueFilters.get(0).lowValue;
                                        var highValue = restrictedElement.valueFilters.get(0).highValue;
                                        return (lowValue ? lowValue : "") + (highValue ? "-" + highValue : "");
                                    } else {
                                        return restrictedElement.valueFilters.get(0).value;
                                    }
                                } else {
                                    return "";
                                }
                            }
                        },
                        enabled: {
                            path: "restrictedElement",
                            formatter: function(restrictedElement) {
                                if (restrictedElement && restrictedElement.element) {
                                    if (restrictedElement.valueFilters && restrictedElement.valueFilters.get(0)) {
                                        var op = restrictedElement.valueFilters.get(0).operator;
                                        if (op === sharedmodel.ValueFilterOperator.IS_NULL) {
                                            return false;
                                        } else {
                                            return true;
                                        }
                                    }
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        },
                        change: function(event) {
                            var restrictedElement = event.getSource().getBindingContext().getProperty("restrictedElement");
                            var valueFilter = {};
                            valueFilter.type = sharedmodel.ValueFilterType.SINGLE_VALUE_FILTER;
                            var newValue = event.getParameter("newValue");
                            if (restrictedElement.valueFilters.get(0).operator === sharedmodel.ValueFilterOperator.BETWEEN) {
                                valueFilter.type = sharedmodel.ValueFilterType.RANGE_VALUE_FILTER;
                                if (newValue.indexOf("-") > -1) {
                                    valueFilter.lowValue = newValue.substring(0, newValue.indexOf("-"));
                                    valueFilter.highValue = newValue.substring(newValue.indexOf("-") + 1);
                                } else {
                                    valueFilter.lowValue = newValue;
                                    valueFilter.highValue = "";
                                }
                            } else {
                                valueFilter.value = newValue;
                            }
                            if (restrictedElement) {
                                that.execute(new commands.ChangeRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, restrictedElement.$getKeyAttributeValue(), {
                                    valueFilter: valueFilter
                                }));
                            }
                            that.restrictedModel.updateBindings(true);
                        },
                        valueHelpRequest: function(event) {
                            var textField = event.getSource();
                            var context = event.getSource().getBindingContext();
                            if (context.getProperty("restrictedElement")) {
                                var restrictedElement = context.getProperty("restrictedElement");
                                if (restrictedElement && restrictedElement.element && restrictedElement.valueFilters) {
                                    var valueHelpCallback = function(data) {
                                        if (restrictedElement.valueFilters.get(0).operator !== sharedmodel.ValueFilterOperator.BETWEEN) {
                                            textField.setValue(data);
                                            textField.fireChange({
                                                newValue: data
                                            });
                                        } else {
                                            textField.setValue(data[0] + "-" + data[1]);
                                            textField.fireChange({
                                                newValue: data[0] + "-" + data[1]
                                            });

                                        }

                                    };
                                    var oldValue = [];
                                    if (restrictedElement.valueFilters.get(0).operator === sharedmodel.ValueFilterOperator.BETWEEN) {
                                        var presentValue = event.getSource().getValue();
                                        if (presentValue && presentValue.length > 0) {
                                            if (presentValue.indexOf("-") > -1) {
                                                oldValue.push(presentValue.substring(0, presentValue.indexOf("-")));
                                                oldValue.push(presentValue.substring(presentValue.indexOf("-") + 1));
                                            } else {
                                                oldValue.push(presentValue);
                                            }

                                        }
                                    }
                                    var packageName = that.context.packageName;
                                    var dataSourceName = that.model.columnView.name;
                                    if(restrictedElement.element.$getContainer() instanceof modelClass.Entity){
                                        var sharedEntity = restrictedElement.element.$getContainer();
                                        dataSourceName = sharedEntity.name;
                                        packageName = sharedEntity.packageName;
                                    }
                                    
                                    var valueHelpDialog = new SqlColumnValueHelpDialog({
                                        context: that.context,
                                        tableData: {
                                            //  table: that.variableData.entity,

                                            dataSourceName: dataSourceName, //that.parameterData.lookupEntity.name,
                                            columnName: restrictedElement.element.name,
                                            labelColumnName: restrictedElement.element.labelElement ? restrictedElement.element.labelElement.name : undefined,
                                            packageName: packageName, //"_SYS_BIC", //that.parameterData.lookupEntity.packageName,
                                            isTable: false, //that.parameterData.lookupEntity.type == "DATA_BASE_TABLE" ? true : false,

                                        },
                                        callback: valueHelpCallback,
                                        dialogtype: {
                                            Operator: restrictedElement.valueFilters.get(0).operator,
                                            oldValue: oldValue,
                                            dialogTitle: "Value Help for filters"
                                        }
                                    });

                                    valueHelpDialog.onValueHelpRequest();
                                }
                            }
                        }
                    })
                });
                value.setName(resourceLoader.getText("txt_value"));

                var include = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("txt_include"),
                    }),
                    template: new sap.ui.commons.CheckBox({
                        enabled: {
                            path: "restrictedElement",
                            formatter: function(restrictedElement) {
                                if (restrictedElement && restrictedElement.element) {
                                    if (restrictedElement.valueFilters && restrictedElement.valueFilters.get(0)) {
                                        var op = restrictedElement.valueFilters.get(0).operator;
                                        if (op == sharedmodel.ValueFilterOperator.IS_NOT_NULL || op == sharedmodel.ValueFilterOperator.IS_NULL)
                                            return false;
                                        else
                                            return true
                                    }
                                    return true;
                                } else return false;
                            }
                        },
                        change: function(oevent) {
                            var restrictedElement = oevent.getSource().getBindingContext().getProperty("restrictedElement")
                            if (restrictedElement) {
                                that.execute(new commands.ChangeRestrictionCommand(that.viewNode.name, that.restrictedColumn.name, restrictedElement.$getKeyAttributeValue(), {
                                    valueFilter: {
                                        including: oevent.getSource().getChecked() ? 'true' : 'false'
                                    }
                                }));
                            }
                            that.restrictedModel.updateBindings(true);

                        }
                    }).bindProperty("checked", {
                        path: "restrictedElement",
                        formatter: function(restrictedElement) {
                            if (restrictedElement && restrictedElement.valueFilters.count() > 0) {
                                if (restrictedElement.valueFilters.toArray()[0].including == 'true')
                                    return true;
                                else
                                    return false;
                            } else {
                                return false;
                            }
                        }
                    }).addStyleClass("marginFields")
                });
                include.setName(resourceLoader.getText("txt_include"));


                restrictionTable.addColumn(column);
                restrictionTable.addColumn(operator);
                restrictionTable.addColumn(value);
                restrictionTable.addColumn(include);
                restrictionTable.bindRows("/restrictions");
                return restrictionTable;
            },
            getExpressionEditor: function() {
                var that = this;
                var topMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%",
                    height: "100%"
                });

                var expressionToolBar = new sap.ui.commons.Toolbar({
                    width: "100%",
                    items: []
                }).addStyleClass("parameterToolbarStyle");

                var clearExpression = new sap.ui.commons.Button({
                    text: "Clear Expression",
					width:"140px",
                    tooltip: "",
                    enabled: {
                        path: " ",
                        formatter: function() {
                            if(that.expressionEditor.getReadOnly() || that.expressionEditor.getExpression() === ""){
                                return false;
                            }
                            return true;
                        }
                    },
                    press: function() {
                        if (that.expressionEditor.getExpression() !== "") {
                            that.expressionEditor.setExpression("");
                        }
                    }
                });
                clearExpression.addStyleClass("RestrictedColumnButtonBorder");

                var editExpression = new sap.ui.commons.Button({
                    text: "Edit Expression...",
                    width: "140px",
                    tooltip: "",
                   enabled: {
                        path: " ",
                        formatter: function() {
                            if(that.expressionEditor.getReadOnly()){
                                return true;
                            }
                            return false;
                        }
                    },
                    press: function() {
                        var callBack = function(result) {
                            if (result) {
                                that.expressionEditor.setReadOnly(false);
                                var changeCommand = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                                    restrictionAttributes: {
                                        formula: that.expressionEditor.getExpression()
                                    }
                                });
                                var deleteCommands = [];
                                that.restrictedColumn.restrictions.foreach(function(restrictedElement) {
                                    deleteCommands.push(new modelbase.DeleteCommand(restrictedElement, false));
                                });
                                if (deleteCommands.length > 0) {
                                    deleteCommands.push(changeCommand);
                                    that.execute(deleteCommands);
                                    that.restrictedModel.getData().restrictions = that.getRestrictions();
                                    that.restrictedModel.updateBindings(true);
                                } else {
                                    that.execute(changeCommand);
                                }
                            }
                        };

                        sap.ui.commons.MessageBox.confirm(resourceLoader.getText("msg_expression_only_maintain_want_continue_question"), callBack, " Restrictions Using Expression");
                    }
                }).addStyleClass("dummyTest6");
                editExpression.addStyleClass("RestrictedColumnButtonBorder");

                expressionToolBar.addItem(clearExpression);
                expressionToolBar.addItem(editExpression);

                var model = this.createElementModel();
                var operatordata = this.createOperatorData();

                var elementModel = new sap.ui.model.json.JSONModel();
                elementModel.setData(model);

                var operatorModel = new sap.ui.model.json.JSONModel();
                operatorModel.setData(operatordata);

                this.expressionEditor = CalcEngineExpressionEditor.createExpressionEditor(false, true, true);
                this.expressionEditor.setHideValidateButton(true);
                // this.expressionEditor.addStyleClass("layoutHeight");

                this.expressionEditor.setElementModel(elementModel);
                this.expressionEditor.setHeight("300px");
                this.expressionEditor.setOperatorModel(operatorModel);

                this.expressionEditor.attachEvent("change", function(event) {
                    var filterExpression = that.expressionEditor.getExpression();
                    var executeChange = true;
                    if ((that.restrictedColumn.restrictionExpression && that.restrictedColumn.restrictionExpression.formula === filterExpression) ||
                        (!that.restrictedColumn.restrictionExpression && filterExpression === "")) {
                        executeChange = false;
                    }
                   executeChange = !that.expressionEditor.getReadOnly();
                    if (executeChange) {
                        that.execute(new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.restrictedColumn.name, {
                            restrictionAttributes: {
                                formula: filterExpression
                            }
                        }));
                    }
                    that.restrictedModel.updateBindings(true);
                });
                // topMatrixLayout.createRow(this.expressionEditor);

                var topMatrixRow = new sap.ui.commons.layout.MatrixLayoutRow({
                    height: "100%"
                });
                topMatrixRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.expressionEditor],
                    height: "100%"
                    // rowSpan:10
                }));
                topMatrixLayout.createRow(expressionToolBar);
                topMatrixLayout.addRow(topMatrixRow);
                topMatrixLayout.addStyleClass("detailsExpressionEditor");

                // topMatrixLayout.onAfterRendering = function() {
                //     var container = this.$();
                //     // container.parent().addClass("layoutHeight");
                // };

                return topMatrixLayout;
            },
            getExcludedElements: function(selectedView) {
                var excludedElements = [];
                if (selectedView) {
                    if (selectedView.isStarJoin && selectedView.isStarJoin()) {
                        this.viewNode.inputs.foreach(function(input) {
                            if (input.selectAll) {
                                input.getSource().elements.foreach(function(element) {
                                    if (element.aggregationBehavior === "none" && element.calculationDefinition) {
                                        excludedElements.push(element);
                                    }
                                });

                            }
                        });
                    }
                    selectedView.elements.foreach(function(element) {
                        if (element.aggregationBehavior === "none" && element.calculationDefinition) {
                            excludedElements.push(element);
                        }
                    });
                }
                return excludedElements;
            },
            createElementModel: function() {
                var that = this;
                var model = {
                    "elements": {
                        "label": "Elements",
                        "data": [{
                            "id": "Columns",
                            "label": "Columns",
                            "children": []
                        }, {
                            "id": "Input Parameters",
                            "label": "Input Parameters",
                            "children": []
                        }]
                    }
                };
                if (this.viewNode) {
                    if (this.viewNode.isStarJoin && this.viewNode.isStarJoin()) {
                        var calcuLatiuonViewData = {
                            "id": "Calculation Views",
                            "label": "Calculation Views",
                            "children": []                
                            };
                        model.elements.data.unshift(calcuLatiuonViewData);
                        this.viewNode.inputs.foreach(function(input) {
                            if (input.selectAll) {
                                var text = CalcViewEditorUtil.getInputName(input);
                                var icon = CalcViewEditorUtil.getInputImagePath(input);
                                var inputNode = {
                                    "id": text,
                                    "label": text,
                                    iconpath: icon,
                                    children: []
                                };
                                calcuLatiuonViewData.children.push(inputNode);
                                input.getSource().elements.foreach(function(element) {
                                    if (!that.isBasedOnElementProxy(element, that.model.columnView, that.viewNode)) {
                                        var datatype;
                                        if (element.inlineType) {
                                            datatype = element.inlineType.primitiveType;
                                        }
                                        var elementModel = {
                                            "id": element.name,
                                            "label": element.name,
                                            "nodetype": "element",
                                            "datatype": datatype ? datatype : "VARCHAR",
                                            "elementType": "COLUMN"

                                        };
                                        if (element.aggregationBehavior === modelClass.AggregationBehavior.NONE && !element.calculationDefinition) {
                                            if (that.viewNode.isDefaultNode()) {
                                                elementModel.iconpath = that.getIconPath(element);
                                            } else {
                                                elementModel.iconpath = resourceLoader.getImagePath("Column.png");
                                            }
                                            inputNode.children.push(elementModel);
                                        }
                                    }
                                });
                            }
                        });
                    }

                    this.viewNode.elements.foreach(function(element) {
                        if (!that.isBasedOnElementProxy(element, that.model.columnView, that.viewNode)) {
                            var datatype;
                            if (element.inlineType) {
                                datatype = element.inlineType.primitiveType;
                            }
                            var elementModel = {
                                "id": element.name,
                                "label": element.name,
                                "nodetype": "element",
                                "datatype": datatype ? datatype : "VARCHAR",
                                "elementType": "COLUMN"

                            };
                            if (element.aggregationBehavior === modelClass.AggregationBehavior.NONE && !element.calculationDefinition) {
                                if (that.viewNode.isDefaultNode()) {
                                    elementModel.iconpath = that.getIconPath(element);
                                } else {
                                    elementModel.iconpath = resourceLoader.getImagePath("Column.png");
                                }
                                model.elements.data[0].children.push(elementModel);

                            }
                        }
                    });
                }
                if (this.model.columnView) {
                    this.model.columnView.parameters.foreach(function(parameter) {
                        if (!parameter.isVariable && !parameter.multipleSelections) {
                            if (!that.isBasedOnElementProxy(parameter, that.model.columnView, that.viewNode)) {
                                var datatype;
                                if (parameter.inlineType) {
                                    datatype = parameter.inlineType.primitiveType;
                                }
                                var parameterModel = {
                                    "id": parameter.name,
                                    "label": parameter.name,
                                    "valuehelp": "$$" + parameter.name + "$$",
                                    "nodetype": "element",
                                    "datatype": datatype ? datatype : "VARCHAR",
                                    "elementType": "Parameter",
                                    "iconpath": resourceLoader.getImagePath("Parameter.png")
                                };
                                model.elements.data[1].children.push(parameterModel);
                            }
                        }
                    });
                }
                return model;
            },
            createOperatorData: function() {

                var model = {
                    "operators": {
                        "label": "operators",
                        "data": [{
                            "id": "braceopen",
                            "label": "(",
                            "nodetype": "operator"
                        }, {
                            "id": "braceclose",
                            "label": ")",
                            "nodetype": "operator"
                        }, {
                            "id": "equals",
                            "label": "=",
                            "nodetype": "operator"
                        }, {
                            "id": "notequal",
                            "label": "!=",
                            "nodetype": "operator"
                        }, {
                            "id": "greater",
                            "label": ">",
                            "nodetype": "operator"
                        }, {
                            "id": "smaller",
                            "label": "<",
                            "nodetype": "operator"
                        }, {
                            "id": "greaterorequal",
                            "label": ">=",
                            "nodetype": "operator"
                        }, {
                            "id": "smallerorequal",
                            "label": "<=",
                            "nodetype": "operator"
                        }, {
                            "id": "isnull",
                            "label": "isNull",
                            "nodetype": "operator"
                        }, {
                            "id": "not",
                            "label": "not",
                            "nodetype": "operator"
                        }, {
                            "id": "and",
                            "label": "and",
                            "nodetype": "operator"
                        }, {
                            "id": "or",
                            "label": "or",
                            "nodetype": "operator"
                        }, {
                            "id": "in",
                            "label": "in",
                            "nodetype": "operator"
                        }, {
                            "id": "match",
                            "label": "match",
                            "nodetype": "operator"
                        }]
                    }
                };

                return model;
            },
            updateRestrictionButtons: function(attributes) {
                if (this.addRestrictionButton) {
                    if (attributes.add === true) {
                        this.addRestrictionButton.setEnabled(true);
                        this.addRestrictionButton.setTooltip(resourceLoader.getText("tol_add"));
                    } else if (attributes.add === false) {
                        this.addRestrictionButton.setEnabled(false);
                        this.addRestrictionButton.setTooltip(resourceLoader.getText("tol_add_restriction"));
                    }
                }
                if (this.deleteRestrictionButton) {
                    if (attributes.remove === true) {
                        this.deleteRestrictionButton.setEnabled(true);
                    } else if (attributes.remove === false) {
                        this.deleteRestrictionButton.setEnabled(false);
                    }
                }

            },
            getIconPath: function(element) {
                if (element) {
                    var aggregationBehavior = element.aggregationBehavior;
                    if (aggregationBehavior) {
                        if (aggregationBehavior === modelClass.AggregationBehavior.NONE) {
                            if (element.calculationDefinition)
                                return resourceLoader.getImagePath("Calculated_Attribute.png");
                            return resourceLoader.getImagePath("Dimension.png");
                        } else if (aggregationBehavior === modelClass.AggregationBehavior.SUM || aggregationBehavior === modelClass.AggregationBehavior.MIN || aggregationBehavior === modelClass.AggregationBehavior.MAX || aggregationBehavior === modelClass.AggregationBehavior.COUNT || aggregationBehavior === modelClass.AggregationBehavior.FORMULA) {
                            if (element.measureType === modelClass.MeasureType.CALCULATED_MEASURE)
                                return resourceLoader.getImagePath("CalculatedMeasure.png");
                            if (element.measureType === modelClass.MeasureType.RESTRICTION)
                                return resourceLoader.getImagePath("RestrictedMeasure.png");
                            if (element.measureType === modelClass.MeasureType.COUNTER)
                                return resourceLoader.getImagePath("counter_scale.png");
                            return resourceLoader.getImagePath("Measure.png");
                        } else {
                            return resourceLoader.getImagePath("Table.png");
                        }
                    }
                }
                return resourceLoader.getImagePath("Table.png");
            },
            isBasedOnElementProxy: function(element, columnView, viewNode) {
                if (element) {
                    var results = CalcViewEditorUtil.isBasedOnElementProxy({
                        object: element,
                        columnView: columnView,
                        viewNode: viewNode
                    });
                    if (results) {
                        return true;
                    }
                }
                return false;
            },
            close: function() {

            },
            destroyContent: function() {

            }

        }
        return RestrictedColumnDetails;
    });
