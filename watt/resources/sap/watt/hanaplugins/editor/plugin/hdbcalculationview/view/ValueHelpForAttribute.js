/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "../viewmodel/model",
        "./CustomValueHelpField",
        "./OutputToolPopup",
        "../viewmodel/ModelProxyResolver",
        "../dialogs/NewFindDialog"
    ],
    function(ResourceLoader, modelbase, commands, CalcViewEditorUtil,
        model, CustomValueHelpField, OutputToolPopup, ModelProxyResolver,
        NewFindDialog) {
        "use strict";
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        /**
         * class
         */
        var ValueHelpForAttribute = function(attributes) {
            this.undoManager = attributes.undoManager;
            this.viewNode = attributes.viewNode;
            this.element = attributes.element;
            this.context = attributes.context;
            this._model = attributes.model;
            this.newElement;
            this.newEntity;
            this.viewDetails;
            this.oldEntity = this.element.externalTypeOfEntity ? this.element.externalTypeOfEntity : this._model.columnView;
            if (this.element.externalTypeOfElement) {
                this.oldElement = this.element.externalTypeOfElement;
            } else if (this.element.typeOfElement) {
                this.oldElement = this.element.typeOfElement;
            } else {
                this.oldElement = this.element;
            }
        };
        ValueHelpForAttribute.prototype = {

            getContent: function() {
                var that = this;
                this.newElement = this.oldElement;
                this.newEntity = this.oldEntity;
                var nameMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    widths: ["30px", "70px"]
                });
                var viewLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_view_table_value_help"),
                    required: true
                }).addStyleClass("labelFloat");

                this.viewText = new sap.ui.commons.TextField({
                    width: "73%",
                    editable: false
                }).addStyleClass("inputBorder");
                var viewButton = new sap.ui.commons.Button({
                    text: "...",
                    width: "7%",
                    press: function(oevent) {
                        var findDialog = new NewFindDialog("", {
                            multiSelect: false,
                            noOfSelection: 1,
                            context: that.context,
                            types: ["TABLE", "CALCULATIONVIEW", "ATTRIBUTEVIEW", "ANALYTICVIEW"],
                            onOK: function(selectedResource) {
                                if (selectedResource) {
                                    that.referenceColumnField.setBusy(true);
                                    that.viewDetails = selectedResource[0];
                                    that.viewDetails.viewNodeName = that._model.columnView.viewNodes.toArray()[0].name;
                                    //viewDetails.context = self.editor.extensionParam.builder._context;
                                    var externalEntity = that._model.createOrMergeEntity(that.viewDetails);
                                    externalEntity.isProxy = true;
                                    that.newEntity = externalEntity;
                                    that.newElement = undefined;
                                    that.updateValues();
                                    var updateCombo = function() {
                                      that.updateValues();
                                      that.referenceColumnField.setBusy(false);
                                    };
                                    ModelProxyResolver.ProxyResolver.resolve(that._model, that.context, updateCombo);
                                }
                            }
                        });

                    }
                }).addStyleClass("sematicsValueHelpButton");

                nameMatrixLayout.createRow(viewLabel, new sap.ui.commons.layout.MatrixLayoutCell({
                    content: [this.viewText, viewButton]
                }));
                // nameMatrixLayout.createRow(null,viewLabel,new sap.ui.commons.layout.MatrixLayoutCell({content:[viewText,viewButton]}));

                var referenceLabel = new sap.ui.commons.Label({
                    text: resourceLoader.getText("tit_reference_column"),
                    required: true
                }).addStyleClass("labelFloat");


                this.referenceColumnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
                    width: "80%",
                    canedit: false,
                    valueHelpRequest: function(event) {
                        var selectedView = that.newEntity;
                        if (that.newEntity === that._model.columnView) {
                            selectedView = that.viewNode;
                        }
                        var selectedElement = function(attributes) {
                            attributes.selectedView = selectedView;
                            that.newElement = that.getElement(attributes);
                            that.updateValues();
                        };
                        var toopPopup = new OutputToolPopup({
                            viewNode: selectedView,
                            opener: that.referenceColumnField,
                            callback: selectedElement,
                            doNotshowSharedElements: true
                        });
                        toopPopup.open();
                    }
                });
                nameMatrixLayout.createRow(referenceLabel, this.referenceColumnField);

                this.referenceColumnField.attachBrowserEvent("keypress", function(e) {
                    e.preventDefault();
                });

                var restoreDefaults = new sap.ui.commons.Button({
                    text: "Restore Defaults",
                    press: function() {
                        that.referenceColumnField.setBusy(false);
                        that.resetDefaults();
                    }
                });
                nameMatrixLayout.createRow(restoreDefaults);

                this.updateValues();
                return nameMatrixLayout;
            },
            setOkButton: function(okButton) {
                this.okButton = okButton;
            },
            resetDefaults: function() {
                this.newEntity = this._model.columnView;
                this.newElement = this.element;
                this.updateValues();
            },
            executeCommands: function() {
                var that = this;
                var executeCommands = [];
                if (this.oldElement !== this.newElement) {
                    if (this.viewDetails) {
                        executeCommands.push(new commands.ChangeElementPropertiesCommand(this.viewNode.name, this.element.name, {
                            extTypeEntity: this.viewDetails
                        }));
                    }
                    var attributes = {};
                    if (this.newElement) {
                        if (this.newElement === this.element) {
                            attributes.elementName = null;
                            if(this.element.externalTypeOfEntity){
                              attributes.extTypeEntity = null;
                            }
                        } else {
                            attributes.elementName = this.newElement.name;
                            if (this.newElement.$getContainer() instanceof model.Entity) {
                                attributes.entityFQN = this.newElement.$getContainer().fqName;
                            } else {
                                if (this.newEntity === this._model.columnView) {
                                    if(this.element.externalTypeOfEntity){
                                      attributes.extTypeEntity = null;
                                    }
                                }
                            }
                        }
                    }
                    if (this.oldEntity !== this.newEntity) {
                        that.element.parameterMappings.foreach(function(mapping) {
                            executeCommands.push(new commands.RemoveParameterMappingCommand({
                                source: {
                                    type: "element",
                                    typeName: that.element.name
                                },
                                mapping: {
                                    parameterNameOtherView: mapping.parameterNameOtherView,
                                    parameterName: mapping.parameter ? mapping.parameter.name : "",
                                    value: mapping.value
                                }
                            }));
                        });
                    }
                    executeCommands.push(new commands.ChangeElementPropertiesCommand(this.viewNode.name, this.element.name, attributes));
                    if (executeCommands.length > 0) {
                        this.undoManager.execute(new modelbase.CompoundCommand(executeCommands));
                        ModelProxyResolver.ProxyResolver.resolve(that._model, that.context, function() {});
                    }
                }
            },
            getElement: function(attributes) {
                if (attributes.inputKey) {
                    var entity = this._model._entities.getAt(attributes.inputKey);
                    if (entity) {
                        return entity.elements.get(attributes.elementName);
                    }
                } else {
                    return attributes.selectedView.elements.get(attributes.elementName);
                }
            },
            updateValues: function() {
                if (this.newEntity) {
                    if (this.newEntity === this._model.columnView) {
                        this.viewText.setValue(this.newEntity.name + "(CurrentView)");
                    } else {
                        this.viewText.setValue(this.newEntity.fqName);
                    }
                }
                if (this.newElement) {
                    this.referenceColumnField.setValue(this.newElement.name);
                } else {
                    this.referenceColumnField.setValue("");
                }
                if (this.okButton) {
                    if (!this.viewText.getValue() || !this.referenceColumnField.getValue()) {
                        this.okButton.setEnabled(false);
                    } else {
                        this.okButton.setEnabled(true);
                    }
                    if (this.oldElement === this.newElement) {
                        this.okButton.setEnabled(false);
                    }
                }
            }
        };
        return ValueHelpForAttribute;
    });
