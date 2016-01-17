/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../viewmodel/commands",
        "../../base/modelbase",
        "../../viewmodel/model",
        "../CalcViewEditorUtil",
        "../OutputToolPopup"
    ],
    function(ResourceLoader, commands, modelbase, model, CalcViewEditorUtil, OutputToolPopup) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var CounterDetails = function(attributes) {
            this.undoManager = attributes.undoManager;
            this.elementModel = new sap.ui.model.json.JSONModel();
            this.viewNode = attributes.viewNode;
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
            this.dummyReferenceAttribute = "";
        };

        CounterDetails.prototype = {

            _execute: function(commands) {
                var that = this;
                if (that.undoManager) {
                    if (commands instanceof Array) {
                        return that.undoManager.execute(new modelbase.CompoundCommand(commands));
                    } else {
                        return that.undoManager.execute(commands);
                    }

                }
            },

            close: function() {
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                }
            },

            getContent: function() {
                return this.topVerticalLayout;
            },

            updateDetails: function(element) {
                if (element) {
                    this.element = element;
                }

                if (this.element && this.headerLabel) {
                    this.headerLabel.setText(resourceLoader.getText("tit_calculated_column_properties", [this.element.name]));
                }
                var modelData = CalcViewEditorUtil.createModelForCalculatedColumn(this.element);
                modelData.referenceAttributes = this.getReferenceAttributes();
                modelData.attributes = this.getAttributes();
                this.elementModel.setData(modelData);
                if (!this.topVerticalLayout || !this.topVerticalLayout.getContent()) {
                    this.getDetailsContent();
                }
                this.elementModel.updateBindings();
            },
            getReferenceAttributes: function() {
                var referenceAttributes = [];
                if (this.element.exceptionAggregationStep) {
                    for (var i = 0; i < this.element.exceptionAggregationStep.referenceElements.size(); i++) {
                        var key = this.element.exceptionAggregationStep.referenceElements._keys[i];
                        var referenceElement = this.element.exceptionAggregationStep.referenceElements.get(key);
                        var inputPath;
                        if (key.indexOf(".") !== -1) {
                            // shared column
                            inputPath = key.substring(0, key.lastIndexOf("."));
                        } else {
                            inputPath = undefined;
                        }
                        referenceAttributes.push({
                            referenceAttribute: referenceElement,
                            inputPath: inputPath
                        });
                    }
                }
                return referenceAttributes;
            },
            getAttributes: function() {
                var that = this;
                var attributes = [];
                that.viewNode.elements.foreach(function(element) {
                    var isProxy = false;
                    isProxy = CalcViewEditorUtil.isBasedOnElementProxy({
                        object: element,
                        viewNode: that.viewNode
                    });
                    if (element.aggregationBehavior === model.AggregationBehavior.NONE && !isProxy) {
                        var attributeAlreadyAdded = false;
                        if (that.element.exceptionAggregationStep) {
                            that.element.exceptionAggregationStep.referenceElements.foreach(function(referenceElement) {
                                if (referenceElement.name === element.name) {
                                    attributeAlreadyAdded = true;
                                }
                            });
                        }
                        if (!attributeAlreadyAdded) {
                            attributes.push({
                                attribute: element
                            });
                        }
                    }
                });
                return attributes;
            },
            modelChanged: function(object) {
                if (this.element.name === object.name) {
                    this.updateDetails();
                }
            },

            destroyContent: function() {
                if (this.topVerticalLayout) {
                    this.topVerticalLayout.destroyContent();
                }
            },

            getDetailsContent: function() {
                var that = this;
                if (!that.topVerticalLayout) {
                    that.topVerticalLayout = new sap.ui.commons.layout.VerticalLayout({
                        height: "100%"
                    });
                }
                var headerLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%"
                });

                this.headerLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_calculated_column_properties", [this.element ? this.element.name : ""]),
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.headerLabel],
                    hAlign: sap.ui.commons.layout.HAlign.Center,
                    vAlign: sap.ui.commons.layout.VAlign.Center
                }).addStyleClass("detailsHeaderStyle"));

                this.topVerticalLayout.addContent(headerLayout);

                var detailsLayout = new sap.ui.commons.layout.VerticalLayout();

                detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_general_prop")));
                detailsLayout.addContent(this.getGeneralContainer());

                detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_counter")));
                detailsLayout.addContent(that.getCounterContainer());

                detailsLayout.setModel(that.elementModel);
                detailsLayout.addStyleClass("customProperties");

                this.topVerticalLayout.addStyleClass("detailsMainDiv");

                this.topVerticalLayout.addContent(detailsLayout);

                return that.topVerticalLayout;
            },

            getHeaderLayout: function(name) {
                var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
                headMatrixLayout.addStyleClass("headerHeight");
                var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    vAlign: sap.ui.commons.layout.VAlign.Begin,
                    hAlign: sap.ui.commons.layout.HAlign.Begin
                }).addStyleClass("parameterHeaderStyle");

                var headerName = new sap.ui.commons.Label({
                    text: name,
                    design: sap.ui.commons.LabelDesign.Bold
                });

                headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
                    width: "10px"
                }));
                headerMatrixLayoutCell.addContent(headerName);

                headMatrixLayout.createRow(headerMatrixLayoutCell);

                return headMatrixLayout;
            },

            getGeneralContainer: function() {
                var that = this;
                var generalMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["40%", "60%"]
                });

                generalMatrixLayout.createRow(null);

                var nameLabel = new sap.ui.commons.Label({
                    text: "Name",
                    required: true
                }).addStyleClass("labelFloat");
                this.nameField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "{/name}",
                    change: function(event) {
                        var value = event.getParameter("newValue");
                        var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
                        this.setValueState(sap.ui.core.ValueState.None);
                        this.setTooltip(null);
                        if (result.message && value !== that.element.name) {
                            var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
                            var messageObjects = ["'" + resourceLoader.getText("tit_name") + "'", "'" + that.element.name + "'"];
                            message = resourceLoader.getText("msg_message_toast_counter_error", messageObjects) + " (" + message + ")";
                            this.setValue(that.element.name);
                            this.setTooltip(null);
                            jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
                            sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
                                of: that.topVerticalLayout,
                                offset: "-10px -100px"
                            });
                        } else if (value !== that.element.name) {
                            var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                            attributes.objectAttributes.name = value;
                            if (that.element.label === undefined && that.viewNode.isDefaultNode()) {
                                attributes.objectAttributes.label = value;
                            }
                            var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
                            that._execute(command);
                        }
                    },
                    liveChange: function(event) {
                        var value = event.getParameter("liveValue");
                        var result = CalcViewEditorUtil.checkRenameElement(value, that.element, that.viewNode, that.columnView);
                        if (result.message && value !== that.element.name) {
                            var message = result.messageObjects ? resourceLoader.getText(result.message, result.messageObjects) : result.message;
                            this.setTooltip(message);
                            this.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            this.setTooltip(null);
                            this.setValueState(sap.ui.core.ValueState.None);
                        }
                    }
                }).addStyleClass("dummyTest1");
                generalMatrixLayout.createRow(nameLabel, this.nameField);
                if (that.viewNode.isDefaultNode()) {
                    var desLabel = new sap.ui.commons.Label({
                        text: "Label"
                    }).addStyleClass("labelFloat");
                    var desField = new sap.ui.commons.TextField({
                        width: "90%",
                        value: "{/label}",
                        change: function(event) {
                            var value = event.getParameter("newValue");
                            var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                            attributes.objectAttributes.label = value;
                            var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
                            that._execute(command);
                        }
                    }).addStyleClass("dummyTest2");

                    generalMatrixLayout.createRow(desLabel, desField);
                }
                var dataTypeLabel = new sap.ui.commons.Label({
                    text: "Column Type",
                    required: false
                }).addStyleClass("labelFloat");

                var dataTypeCombo = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "Measure",
                    editable: false,
                    enabled: false,
                }).addStyleClass("dummyTest3"); 

                generalMatrixLayout.createRow(dataTypeLabel, dataTypeCombo);

                var exceptionAggrTypeLabel = new sap.ui.commons.Label({
                    text: "Exception Aggregation Type",
                    required: false
                }).addStyleClass("labelFloat");

                var exceptionAggrTypeField = new sap.ui.commons.TextField({
                    width: "90%",
                    value: "COUNT_DISTINCT",
                    editable: false,
                    enabled: false
                }).addStyleClass("dummyTest4"); 

                generalMatrixLayout.createRow(exceptionAggrTypeLabel, exceptionAggrTypeField);

                var hiddenCB = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("tit_hidden"),
                    tooltip: resourceLoader.getText("tit_hidden"),
                    checked: "{/hidden}",
                    change: function() {
                        var attributes = CalcViewEditorUtil.createModelForElementAttributes();
                        attributes.objectAttributes.hidden = hiddenCB.getChecked();
                        var command = new commands.ChangeElementPropertiesCommand(that.viewNode.name, that.element.name, attributes);
                        that._execute(command);
                    }
                }).addStyleClass("dummyTest5");
                generalMatrixLayout.createRow(null, hiddenCB);
                generalMatrixLayout.addStyleClass("customProperties");

                //generalMatrixLayout.createRow(null);
                return generalMatrixLayout;

            },

            getCounterContainer: function() {

                var that = this;

                var counterMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    width: "100%",
                    widths: ["30%", "70%"]
                });


                var tableMatrixCell = new sap.ui.commons.layout.MatrixLayoutCell({
                    rowSpan: 5,
                    colSpan: 2

                });


                var counterTable = new sap.ui.table.Table({
                    visibleRowCount: 6,
                    width: "90%"
                }).addStyleClass("dummyTest6");

                var toolBar = new sap.ui.commons.Toolbar();
                toolBar.addStyleClass("parameterToolbarStyle");

                var createButton = new sap.ui.commons.Button({
                    icon: "sap-icon://add",
                    //text: resourceLoader.getText("tol_add"),
                    tooltip: resourceLoader.getText("tol_add"),
                    press: function(oevent) {
                        var attrLength = that.elementModel.getData().referenceAttributes.length;
                        if (attrLength > 0) {
                            if (that.elementModel.getData().referenceAttributes[attrLength - 1].referenceAttribute !== that.dummyReferenceAttribute) {
                                if (that.elementModel.getData().referenceAttributes[attrLength - 1].referenceAttribute.name !== that.dummyReferenceAttribute) {
                                    that.elementModel.getData().referenceAttributes.push({
                                        referenceAttribute: that.dummyReferenceAttribute
                                    });
                                    that.elementModel.updateBindings();
                                    counterTable.setSelectionInterval(that.elementModel.getData().referenceAttributes.length - 1,
                                        that.elementModel.getData().referenceAttributes.length - 1);
                                } else {
                                    counterTable.setSelectionInterval(that.elementModel.getData().referenceAttributes.length - 1,
                                        that.elementModel.getData().referenceAttributes.length - 1);
                                }
                            } else {
                                counterTable.setSelectionInterval(that.elementModel.getData().referenceAttributes.length - 1,
                                    that.elementModel.getData().referenceAttributes.length - 1);
                            }

                        } else {
                            // There is no reference attributes yet in the model.. add one blank
                            that.elementModel.getData().referenceAttributes.push({
                                referenceAttribute: that.dummyReferenceAttribute
                            });
                            that.elementModel.updateBindings();
                            counterTable.setSelectionInterval(that.elementModel.getData().referenceAttributes.length - 1,
                                that.elementModel.getData().referenceAttributes.length - 1);
                        }

                    }
                });
                var deleteButton = new sap.ui.commons.Button({
                    icon: "sap-icon://delete", //resourceLoader.getImagePath("Delete.png"),
                    //text: resourceLoader.getText("tol_remove"),
                    tooltip: resourceLoader.getText("tol_remove"),
                    press: function(oevent) {
                        var deleteCommands = [];
                        var selectedIndices = counterTable.getSelectedIndices();
                        var deletionIndices = [];
                        for (var index in selectedIndices) {
                            var selectedIndex = counterTable.getSelectedIndices()[index];
                            //counterTable.removeSelectionInterval(selectedIndex);
                            var bindingContext = counterTable.getContextByIndex(selectedIndex);
                            if (bindingContext) {
                                var referenceAttr = bindingContext.getProperty("referenceAttribute");
                                var referenceInputName = bindingContext.getProperty("inputPath");
                                if (referenceAttr) {
                                    var deleteCommand = new commands.RemoveCounterReferenceElemCommand(that.element.name, {
                                        elementName: referenceAttr.name,
                                        entityFQN: referenceInputName
                                    });
                                    //counterTable.removeSelectionInterval(selectedIndex, selectedIndex);
                                    deleteCommands.push(deleteCommand);
                                    deletionIndices.push(selectedIndex);

                                } else if (referenceAttr === that.dummyReferenceAttribute) {
                                    that.elementModel.getData().referenceAttributes = that.getReferenceAttributes();
                                    that.elementModel.updateBindings();
                                }
                            }

                        }
                        for (var delIndex in deletionIndices) {
                            counterTable.removeSelectionInterval(delIndex, delIndex);
                        }

                        if (deleteCommands.length > 0) {
                            that.undoManager.execute(new modelbase.CompoundCommand(deleteCommands));
                            that.elementModel.getData().attributes = that.getAttributes();
                            that.elementModel.getData().referenceAttributes = that.getReferenceAttributes();
                            that.elementModel.updateBindings();
                        }
                    }

                });
                toolBar.addItem(createButton);
                toolBar.addItem(deleteButton);
                counterTable.setToolbar(toolBar);


                var valueHelpTemplate = new sap.ui.commons.ValueHelpField({
					iconURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_regular.png",
					iconHoverURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_hover.png",
                    value: {
                        parts: ["referenceAttribute", "inputPath"],
                        formatter: function(referenceAttribute, inputPath) {
                            if (referenceAttribute) {
                                if (that.dummyReferenceAttribute === referenceAttribute) {
                                    return that.dummyReferenceAttribute;
                                } else {
                                    if (inputPath) {
                                        return inputPath + "." + referenceAttribute.name;
                                    }
                                    return referenceAttribute.name;
                                }
                            }
                            return "";
                        }

                    },
                    liveChange: function() {
                        that.updateReferenceElements();
                    },
                    valueHelpRequest: function(event) {
                        var bindingContext = event.getSource().getBindingContext();
                        var applyValue = function(object) {
                            if (object && bindingContext) {
                                var referenceAttr = bindingContext.getProperty("referenceAttribute");
                                var referenceInputName = bindingContext.getProperty("inputPath");
                                if (referenceAttr === that.dummyReferenceAttribute) {
                                    var createCounterCommand = new commands.AddCounterReferenceElemCommand(that.element.name, {
                                        elementName: object.elementName,
                                        entityFQN: object.inputKey ? CalcViewEditorUtil.getInputName(that.viewNode.inputs.get(object.inputKey)) : undefined
                                    });
                                    that.undoManager.execute(createCounterCommand);
                                    that.updateReferenceElements();
                                } else {
                                    var deleteCommand = new commands.RemoveCounterReferenceElemCommand(that.element.name, {
                                        elementName: referenceAttr.name,
                                        entityFQN: referenceInputName
                                    });
                                    var addCommand = new commands.AddCounterReferenceElemCommand(that.element.name, {
                                        elementName: object.elementName,
                                        entityFQN: object.inputKey ? CalcViewEditorUtil.getInputName(that.viewNode.inputs.get(object.inputKey)) : undefined,
                                        nextElementName: that.element.exceptionAggregationStep.referenceElements.getNextKey(referenceInputName ? referenceInputName + "." + referenceAttr.name : referenceAttr.name),
                                        //nextElementEntityFQN: referenceInputName
                                    });

                                    //counterTable.removeSelectionInterval(selectedIndex, selectedIndex);
                                    that.undoManager.execute(new modelbase.CompoundCommand([deleteCommand, addCommand]));
                                    that.updateReferenceElements();

                                }
                            }

                        };
                        var excludedElements = [];
                        var refAttributes = that.getReferenceAttributes();
                        for (var i = 0; i < refAttributes.length; i++) {
                            excludedElements.push(refAttributes[i].referenceAttribute);
                        }
                        var popup = new OutputToolPopup({
                            viewNode: that.viewNode,
                            opener: this,
                            callback: applyValue,
                            excludedElements: excludedElements
                        });
                        popup.open();
                    }
                });

                var nameColumn = new sap.ui.table.Column({
                    width: "100%",
                    label: new sap.ui.commons.Label({
                        text: "Column"
                    }),
                    template: valueHelpTemplate
                });

                nameColumn.setName("Column");
                counterTable.addColumn(nameColumn);
                counterTable.bindRows("/referenceAttributes");

                tableMatrixCell.addContent(counterTable);
                counterMatrixLayout.createRow(null, tableMatrixCell);
                return counterMatrixLayout;
            },

            updateReferenceElements: function() {
                this.elementModel.getData().attributes = this.getAttributes();
                this.elementModel.getData().referenceAttributes = this.getReferenceAttributes();
                this.elementModel.updateBindings(true);
                this.elementModel.updateBindings(true);
            }

        };

        return CounterDetails;
    });
