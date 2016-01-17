/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "./dialogs/ReferenceDialog",
        "../base/modelbase"

    ],
    function(ResourceLoader, commands, CalcViewEditorUtil, ReferenceDialog, modelbase) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var that;
        /**
         * @class
         */
        var ElementSourceProvider = function(parameters) {
            this._element = parameters.data;
            this._mLayout = parameters.layout;
            this._undoManager = parameters.undoManager;
            this._viewNode = parameters.viewNode;
            this._model = parameters.model;
            this._isSource = parameters.isSource;
               this._viewNode.$getEvents().subscribe(commands.ViewModelEvents.CHANGED, this.createContent, this);
        };

        ElementSourceProvider.prototype = {
            _execute: function(command) {
                return that._undoManager.execute(command);
            },
            createContent: function() {
                that = this;
                 that._mLayout.destroyRows();
                var data;
                if (this._viewNode === this._model.columnView.getDefaultNode() && !this._isSource) {
                    if (that._element.aggregationBehavior === "none") {
                        data = CalcViewEditorUtil.createModelForElement(this._element, this._viewNode, this._model.columnView);
                    } else {
                        data = CalcViewEditorUtil.createModelForMeasure(this._element, this._viewNode, this._model.columnView);
                        if (data && data.semanticType) {
                            data.semanticType = CalcViewEditorUtil.getSemanticTypeText(data.semanticType);
                        }
                    }
                } else {
                    data = CalcViewEditorUtil.createModelForColumn(this._element, this._viewNode, this._model.columnView);
                }
                var oModel = new sap.ui.model.json.JSONModel(); // create JSON model instance
                oModel.setData(data, "valueModel"); // set the data for the model
                if (!data) {
                    return;
                }

                if (data.hasOwnProperty("name")) {
                    var textProperty = ElementSourceProvider.createTextPropertyDescriptor("Name", "name");
                    if (that._isSource) {
                        textProperty.setEnabled(false);
                    }
                    textProperty.attachChange(function(event) {

                        var elementObject = that._viewNode.elements.get(that._element.name);

                        var value = event.getParameter("newValue");
                        if (value === data.oldName) {
                            return;
                        }
                        var result = CalcViewEditorUtil.checkRenameElement(value, elementObject, that._viewNode, that._model.columnView);
                        if (!result.message) {
                            var attributes = {
                                objectAttributes: {},
                                typeAttributes: {}
                            };
                            attributes.objectAttributes.name = value;
                            var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, elementObject.name, attributes);
                            that._execute(command);
                        }
                    });
                }

                if (data.hasOwnProperty("label")) {
                    var textProperty = ElementSourceProvider.createTextPropertyDescriptor("Label", "label");
                    textProperty.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.label = value;
                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }

                if (data.hasOwnProperty("aggregationBehavior")) {

                    if (data.aggregationBehavior !== "NONE") {
                        var aggregationModel = ElementSourceProvider.getAggregationBehaviorByType(data.aggregationTypes);
                        var combo = ElementSourceProvider.createComboPropertyDescriptor("Aggregation Behavior", "aggregationBehavior", aggregationModel, oModel);

                        combo.attachChange(function(event) {
                            var value = event.getParameter("newValue");
                            if (value === "") {
                                value = "NONE";
                            }
                            var attributes = {
                                objectAttributes: {},
                                typeAttributes: {}
                            };
                            attributes.objectAttributes.aggregationBehavior = value.toLowerCase();
                            var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                            that._execute(command);
                        });
                    }

                }

                if (data.hasOwnProperty("hidden")) {
                    var hiddenModel = ElementSourceProvider.getHiddenPropertyList();
                    var combo = ElementSourceProvider.createComboPropertyDescriptor("Hidden", "hidden", hiddenModel, oModel);
                    combo.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        if (value == "true") {
                            value = true;
                        } else {
                            value = false;
                        }

                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.hidden = value;

                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }
                if (data.hasOwnProperty("primitiveType")) {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Data Type", "primitiveType");
                    textfield.setEnabled(false);
                }

                if (data.hasOwnProperty("length")) {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Length", "length");
                    textfield.setEnabled(false);
                }

                if (data.hasOwnProperty("scale")) {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Scale", "scale");
                    textfield.setEnabled(false);
                }

                if (data.hasOwnProperty("semanticType")) {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Semantic Type", "semanticType");
                    textfield.setEnabled(false);
                }

                if (data.hasOwnProperty("mapping")) {



                    //var isHasSource = that._element.getMapping().sourceElement;
                    var parameters = {
                        object: that._element,
                        viewNode: that._viewNode
                    };
                    var isProxyElement = CalcViewEditorUtil.isBasedOnElementProxy(parameters);
                    if (!that._isSource /*&& !that._element.getMapping().sourceElement */ && isProxyElement) {

                        var labelModel = ElementSourceProvider.getLabelColumnList(ElementSourceProvider.getValidInputElement(that._viewNode, that._element));
                        var combo = ElementSourceProvider.createComboPropertyDescriptor("Mapping", "mapping", labelModel, oModel);

                        combo.attachChange(function(event) {
                            var comboValue = event.getParameter("newValue");
                            var updateMappingCommands = [];
                            var comboSource = comboValue.split(".");
                            var sourceElement = comboSource[comboSource.length - 1];
                            var targetElement = that._element;
                            var input;
                            var updateMapping = [];
                            for (var i = 0; i < that._viewNode.inputs._keys.length; i++) {
                                var proxyInput;
                                var obj = that._viewNode.inputs.get(that._viewNode.inputs._keys[i]);
                                if (obj.getSource().elements.get(that._element.name)) {
                                    proxyInput = obj;
                                    updateMapping.push(new modelbase.DeleteCommand('columnView.viewNodes["' + that._viewNode.name +
                                        '"].inputs["' + proxyInput.$getKeyAttributeValue() + '"].mappings["' + that._element.getMapping().$getKeyAttributeValue() + '"]"'));

                                }
                                if (CalcViewEditorUtil.getInputName(obj) + "." + sourceElement === comboValue) {
                                    input = obj;
                                }
                                if (input) {
                                    sourceElement = input.getSource().elements.get(sourceElement);
                                    if (sourceElement) {
                                        //    input.mappings.foreach(function(mapping) {
                                        for (var j = 0; j < input.mappings._keys.length; j++) {
                                            var mapping = input.mappings.get(input.mappings._keys[j]);
                                            if (mapping.targetElement === targetElement) {
                                                var attributes = {};
                                                attributes.mappingAttributes = {
                                                    sourceName: sourceElement.name,
                                                    targetName: targetElement.name ? targetElement.name : targetElement,
                                                    type: "ElementMapping"
                                                };
                                                attributes.input = input;


                                                // var command = new commands.ChangeMappingPropertiesCommand(that._viewNode.name, );
                                                var create = new commands.CreateMappingCommand(that._viewNode.name, attributes);



                                            }
                                        }
                                    }
                                }

                            }

                            // updateMapping.push(command);

                            updateMapping.push(create);
                            that._execute(new modelbase.CompoundCommand(updateMapping));
                        });


                    } else {
                        var textfield = ElementSourceProvider.createTextPropertyDescriptor("Mapping", "mapping");
                        textfield.setEnabled(false);
                    }
                }

                if (data.hasOwnProperty("labelElement")) {
                    var labelModel = ElementSourceProvider.getLabelColumnList(data.labelElementList);
                    var combo = ElementSourceProvider.createComboPropertyDescriptor("Label Column", "labelElement", labelModel, oModel);
                    if(data["labelElement"]){
                    combo.setValue(data["labelElement"].name);
                    }
                    combo.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        if (value === "") {
                            value = undefined;
                        } else {
                            value = that._viewNode.elements.get(value);
                        }
                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.labelElement = value;

                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);

                    });

                }

                if (data.hasOwnProperty("dataType")) {
                    ElementSourceProvider.createTextPropertyDescriptor("Data Type", "dataType");
                }

                if (data.hasOwnProperty("hierarchyDefaultMember")) {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Hierarchy Default Member", "hierarchyDefaultMember");
                    textfield.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.hierarchyDefaultMember = value;
                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }

                if (data.hasOwnProperty("infoObject")) {
                    ElementSourceProvider.createTextPropertyDescriptor("Info Object", "infoObject");
                }
                if (data.hasOwnProperty("keepFlag") && !that._viewNode.isJoinNode() && that._viewNode.type !== "Union") {
                    var hiddenModel = ElementSourceProvider.getHiddenPropertyList();
                    var combo = ElementSourceProvider.createComboPropertyDescriptor("Keep Flag", "keepFlag", hiddenModel, oModel);
                    if (that._isSource) {
                        combo.setEnabled(false);
                    }
                    combo.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        if (value == "true") {
                            value = true;
                        } else {
                            value = false;
                        }

                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.keep = value;

                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }

                if (data.hasOwnProperty("transparentFilter")) {
                    var transparentFilterModel = ElementSourceProvider.getHiddenPropertyList();
                    var combo = ElementSourceProvider.createComboPropertyDescriptor("Transparent", "transparentFilter", transparentFilterModel, oModel);
                    if (that._isSource) {
                        combo.setEnabled(false);
                    }
                    combo.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        if (value == "true") {
                            value = true;
                        } else {
                            value = false;
                        }

                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.transparentFilter = value;

                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }

                var aggr;
                if (data.aggregationBehavior) {
                    aggr = data.aggregationBehavior.toLowerCase();
                }
                if (data.hasOwnProperty("displayFolder") && aggr !== "none") {
                    var textfield = ElementSourceProvider.createTextPropertyDescriptor("Display Folder", "displayFolder");
                    textfield.attachChange(function(event) {
                        var value = event.getParameter("newValue");
                        var attributes = {
                            objectAttributes: {},
                            typeAttributes: {}
                        };
                        attributes.objectAttributes.displayFolder = value;
                        var command = new commands.ChangeElementPropertiesCommand(that._viewNode.name, that._element.name, attributes);
                        that._execute(command);
                    });
                }

                var oButton1 = new sap.ui.commons.Button({
                    text: "Show Message",
                    press: function() {

                        var fnCallbackMessageBox = function(result) {
                            // alert("result : " + result);
                        };
                        var referenceDialog = new ReferenceDialog({
                            element: that._element,
                            fnCallbackMessageBox: fnCallbackMessageBox,
                            isRemoveCall: true,
                        });
                        referenceDialog.openMessageDialog();
                    }
                });


                //  that._mLayout.createRow(oButton1, null);
                that._mLayout.setModel(oModel);

            }

        };

        ElementSourceProvider.createTextPropertyDescriptor = function(keyName, data) {
            var key = ElementSourceProvider.createLabel(keyName);
            var value;
            if (keyName === "Mapping") {
                value = new sap.ui.commons.TextField({
                    width:"90%",
                    value: "{/" + data + "}", // binding syntax using curly braces
                    tooltip: "{/" + data + "}"
                });
            } else {
                value = new sap.ui.commons.TextField({
                     width:"90%",
                    value: "{/" + data + "}" // binding syntax using curly braces
                });
            }
            that._mLayout.createRow(key, value);
            return value;
        };

        ElementSourceProvider.createPropertyDescriptor = function(keyName, data) {
            var key = ElementSourceProvider.createLabel(keyName);

            var value = new sap.ui.commons.Label({
                value: "{/" + data + "}" // binding syntax using curly braces

            });
            that._mLayout.createRow(key, value);
        };
        ElementSourceProvider.createComboPropertyDescriptor = function(keyName, data, comboModel, oModel) {
            var key = ElementSourceProvider.createLabel(keyName);

            var value = new sap.ui.commons.DropdownBox({
 width:"90%"
            });
            value.setModel(comboModel);
            var oItemTemplate = new sap.ui.core.ListItem();
            oItemTemplate.bindProperty("key", "key");
            oItemTemplate.bindProperty("text", "value");
            value.bindItems("/items", oItemTemplate);
            value.setModel(comboModel);
            value.setModel(oModel, "valueModel");
            value.bindProperty("selectedKey", "valueModel>/" + data, function(fValue) {
                if (data === "hidden" || data === "keepFlag" || data === "transparentFilter") {
                    if (this.getSelectedKey() && this.getSelectedKey() !== "") {
                        return this.getSelectedKey();
                    }
                    if (fValue) {
                        return "true";
                    }
                    return "false";
                }
                return fValue;
            });
            that._mLayout.createRow(key, value);
            return value;
        };

        ElementSourceProvider.getValidInputElement = function(viewNode, _element) {
            var validLabelElementList = [];

            for (var i = 0; i < viewNode.inputs._keys.length; i++) {
                var input = viewNode.inputs.get(i).getSource();

                if (input.elements.get(_element.name)) {
                    validLabelElementList.unshift({
                        elementName: CalcViewEditorUtil.getInputName(viewNode.inputs.get(i)) + "." + _element.name
                    });

                }
             //   if (!input.isProxy) {
                    var keys = input.elements._keys;
                    for (var j = 0; j < keys.length; j++) {
                        var element = input.elements.get(keys[j]);
                        var parameters = {
                            object: element,
                            viewNode: viewNode
                        };
                        if (!CalcViewEditorUtil.isBasedOnElementProxy(parameters)) {
                            validLabelElementList.push({
                                elementName: CalcViewEditorUtil.getInputName(viewNode.inputs.get(i)) + "." + element.name
                            });
                        }
                    }
              //  }
            }
            return validLabelElementList;
        };

        ElementSourceProvider.getLabelColumnList = function(elements) {
            var labelColumnsList = {};
            var items = [];
            elements.forEach(function(element) {
                items.push({
                    key: element.elementName,
                    value: element.elementName
                });

            });
            labelColumnsList["items"] = items;
            var labelColumnnModel = new sap.ui.model.json.JSONModel();
            labelColumnnModel.setData(labelColumnsList);
            return labelColumnnModel;

        }
        ElementSourceProvider.createLabel = function(keyName) {
            var labelColumnList;
            var key = new sap.ui.commons.Label({
                text: keyName
            });

            return key;
        };

        ElementSourceProvider.getAggregationBehaviorByType = function(aggregationTypes) {
            var aggregationBehaviorList = {
                items: []
            };
            aggregationTypes.forEach(function(type) {
                var item = {};
                item.key = type.aggregationType;
                item.value = type.aggregationType;
                aggregationBehaviorList.items.push(item);
            });
            var aggregationModel = new sap.ui.model.json.JSONModel();
            aggregationModel.setData(aggregationBehaviorList);
            return aggregationModel;
        };
        ElementSourceProvider.getAggregationBehaviorList = function() {
            var aggregationBehaviorList = {
                items: [{
                    key: "NONE",
                    value: "NONE"
                }, {
                    key: "SUM",
                    value: "SUM"
                }, {
                    key: "MIN",
                    value: "MIN"
                }, {
                    key: "MAX",
                    value: "MAX"
                }, {
                    key: "COUNT",
                    value: "COUNT"
                }]
            };
            var aggregationModel = new sap.ui.model.json.JSONModel();
            aggregationModel.setData(aggregationBehaviorList);
            return aggregationModel;
        };
        ElementSourceProvider.changeLabel = function(event) {
            var textField = event.getSource();

            var viewNodeName = columnsTable.getBindingContext().getObject().name;
            var bindingContext = textField.getBindingContext();
            var element = bindingContext.getObject();

            var value = event.getParameter("newValue");
            var attributes = {
                objectAttributes: {},
                typeAttributes: {}
            };
            attributes.objectAttributes.label = value;

            var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
            that._execute(command);
        };

        ElementSourceProvider.getHiddenPropertyList = function() {
            var hiddenList = {
                items: [{
                        key: true,
                        value: "true"
                    }, {
                        key: false,
                        value: "false"
                    }

                ]


            };
            var hiddenModel = new sap.ui.model.json.JSONModel();
            hiddenModel.setData(hiddenList);
            return hiddenModel;
        };
        return ElementSourceProvider;

    });
