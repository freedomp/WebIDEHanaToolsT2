/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "../base/modelbase",
        "../viewmodel/model"
    ],

    function(ResourceLoader, commands, CalcViewEditorUtil, modelbase, model) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
      //  var schemaMapping = SchemaMappingService.schemaMapping;
        var that;
        /**
         * @class
         */
        var InputSourceProvider = function(parameters) {
            this._input = parameters.data;
            this._mLayout = parameters.layout;
            this._undoManager = parameters.undoManager;
            this._viewNode = parameters.viewNode;
            this._model = parameters.model;
            this._isSource = parameters.isSource;
            this._context = parameters.context;
        };

        InputSourceProvider.prototype = {
            _execute: function(command) {
                return that._undoManager.execute(command);
            },
            createContent: function() {
                that = this;
                var data;
                if (this._viewNode.type === "Union") {
                    if (this._input.getSource().type === "DATA_BASE_TABLE") {
                        data = InputSourceProvider.createModelForUnionEntity(this._input, this._viewNode, this._model.columnView);
                    } else if (this._input.getSource().type === "CALCULATIONVIEW") {
                        data = InputSourceProvider.createModelForUnion(this._input, this._viewNode, this._model.columnView);
                    } else {
                        data = InputSourceProvider.createModelForUnionAggregation(this._input, this._viewNode, this._model.columnView);
                    }

                } else if (this._input.getSource() instanceof model.Entity && this._input.getSource().type === "DATA_BASE_TABLE") {
                    data = InputSourceProvider.createModelForInput(this._input, this._viewNode, this._model.columnView);
                }
                else if (this._input.getSource() instanceof model.Entity && (this._input.getSource().type === model.EntityType.ATTRIBUTE_VIEW  || this._input.getSource().type === model.EntityType.ANALYTIC_VIEW ||this._input.getSource().type === model.EntityType.CALCULATION_VIEW )) {
                    data = InputSourceProvider.createModelForModel(this._input, this._viewNode, this._model.columnView);
                } 
                else if (this._input.getSource() instanceof model.Entity && this._viewNode.type === "Rank") {
                    data = InputSourceProvider.createModelForModel(this._input, this._viewNode, this._model.columnView);
                } else if (this._input.getSource() instanceof model.ViewNode) {
                    data = InputSourceProvider.createModelForViewNode(this._input, this._viewNode, this._model.columnView);
                }
                if (!data) {
                    return;
                }

                var getSchemas = function() {
                    if (that._context.service) {
                        //return that._context.service.catalogDAO.getSchemas();
                    } else {
                        return Q();
                    }
                };
                var newresult;
               /* schemaMapping.getSchemaMapping(that._context, function(results) {
                    newresult = results;
                    Q.all([
                        getSchemas()
                    ])
                        .spread(function(schemas) {
                            // here you combine the results and calculate the parameter for schema mapping
                            var schemaList = {
                                items: []


                            };
                            // that.results;
                            if (schemas && schemas.schemas) {
                                for (var i = 0; i < schemas.schemas.length; i++) {
                                    for (var j = 0; j < newresult.length; j++) {
                                        if (schemas.schemas[i].schemaName === newresult[j][1]) {
                                            var schemaItem = {
                                                key: newresult[j][0],
                                                value: newresult[j][0] + "(" + newresult[j][1] + ")"
                                            };
                                            schemaList.items.push(schemaItem);
                                        }
                                    }
                                }
                            }
                            var schemaName;
                            if (that._input.getSource().physicalSchema) {
                                schemaName = that._input.getSource().physicalSchema;
                            } else {
                                schemaName = that._input.getSource().schemaName;
                            }
                            var schemaItem = {
                                key: schemaName,
                                value: schemaName
                            };
                            schemaList.items.push(schemaItem);
                            InputSourceProvider.setProperties(data, schemaList);

                        })
                    // does default error handling, i.e. shows a message in case of exceptions
                    .done();
                }); */

			   InputSourceProvider.setProperties(data,{});

            }

        };

        InputSourceProvider.setProperties = function(data, schemaList) {

            if (that._mLayout) {
                that._mLayout.destroyRows(); //destroying the rows
            }

            var oModel = new sap.ui.model.json.JSONModel(); // create JSON model instance
            oModel.setData(data, "valueModel"); // set the data for the model
            if (data.hasOwnProperty("name")) {
                var textProperty = InputSourceProvider.createTextPropertyDescriptor("Name", "name");
                textProperty.setEditable(false);

            }

            if (data.hasOwnProperty("alias")) {
                var textfield = InputSourceProvider.createTextPropertyDescriptor("Alias", "alias");
                textfield.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    var attributes = {

                    };
                    attributes.alias = value;
                    var command = new commands.ChangeInputPropertiesCommand(that._viewNode.name, that._input.getSource().name, attributes);
                    that._execute(command);
                });
            }

            if (data.hasOwnProperty("schemaName")) {

                var schemaModel = new sap.ui.model.json.JSONModel();
                schemaModel.setData(schemaList);
                var combo = InputSourceProvider.createComboPropertyDescriptor("Schema", "schemaName", schemaModel, oModel);

                combo.attachChange(function(event) {
                    var value = event.getParameter("newValue");
                    var attributes = {};
                    for (var i = 0; i < schemaList.items.length; i++) {
                        var schemaValue = schemaList.items[i];
                        if (schemaValue.value === value) {
                            attributes.schemaName = schemaValue.key;

                        }
                    }
                    if (that._input.getSource().physicalSchema) {
                        attributes.physicalSchema = that._input.getSource().physicalSchema;
                    } else {
                        attributes.physicalSchema = that._input.getSource().schemaName;
                    }

                    var command = new commands.changeEntityCommand(that._viewNode.name, that._input.getSource().name, attributes);
                    that._execute(command);
                });
            }
            if (data.hasOwnProperty("label")) {
                var textProperty = InputSourceProvider.createTextPropertyDescriptor("Label", "label");
                textProperty.setEnabled(false);
            }
            if (data.hasOwnProperty("packageName")) {
                var label;
                var value;
                if (that._input.getSource().packageName) {
                    label = "Package";
                } else {
                    label = "Schema";
                }

                var textfield = InputSourceProvider.createTextPropertyDescriptor(label, "packageName");
                textfield.setEnabled(false);
            }
            /*if (data.hasOwnProperty("isTable")) {
                var label=data.isTable?"Schema":"Package";
                var value=data.isTable?"schemaName":"packageName";
                var textfield = InputSourceProvider.createTextPropertyDescriptor(label, "packageOrschemaName");
                textfield.setEnabled(false);
            }*/
            if (data.hasOwnProperty("length")) {
                var textfield = InputSourceProvider.createTextPropertyDescriptor("No of Columns", "length");
                textfield.setEnabled(false);
            }
                if (data.hasOwnProperty("repositoryInputNodeId")) {
                         var textfield = InputSourceProvider.createTextPropertyDescriptor(resourceLoader.getText("txt_repositoryInputNodeId") , "repositoryInputNodeId");
                textfield.setEditable(false);
                }
            if (data.hasOwnProperty("emptyUnionBehavior")) {
                var schemaModel = new sap.ui.model.json.JSONModel();
                var list = {
                    items: [{
                        key: "",
                        value: ""
                    }, {
                        key: "No Row",
                        value: "No Row"
                    }, {
                        key: "Row with Constants",
                        value: "Row with Constants"
                    }]
                };
                schemaModel.setData(list);
                var comboInput = InputSourceProvider.createComboPropertyDescriptor("Empty Union Behavior", "emptyUnionBehavior", schemaModel, oModel);
                comboInput.setEnabled(true);
                comboInput.attachChange(function() {
                    var attributes = {};
                    var newValue = comboInput.getValue();
                    attributes.emptyUnionBehavior = newValue;
                    var command = new commands.ChangeInputCommand(that._viewNode.name, that._input.$getKeyAttributeValue(), attributes);
                    that._execute(command);
                });
            }

            //  that._mLayout.createRow(oButton1, null);
            that._mLayout.setModel(oModel);
        };

        InputSourceProvider.createTextPropertyDescriptor = function(keyName, data) {
            var key = InputSourceProvider.createLabel(keyName);
            
             if(data === "repositoryInputNodeId"){
            key.setIcon(resourceLoader.getImagePath("Information.png"));
            var oRichTooltip = new sap.ui.commons.RichTooltip({
				text: resourceLoader.getText("txt_rInputId"),
				title:keyName
			});
            key.setTooltip(oRichTooltip);
            }

            var value = new sap.ui.commons.TextField({
                width:"90%",
                value: "{/" + data + "}" // binding syntax using curly braces

            });
           
            that._mLayout.createRow(key, value);
            return value;
        };

        InputSourceProvider.createPropertyDescriptor = function(keyName, data) {
            var key = InputSourceProvider.createLabel(keyName);

            var value = new sap.ui.commons.Label({
                value: "{/" + data + "}" // binding syntax using curly braces

            });
            that._mLayout.createRow(key, value);
        };
        InputSourceProvider.createComboPropertyDescriptor = function(keyName, data, comboModel, oModel) {
            var key = InputSourceProvider.createLabel(keyName);

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
                if (data === "hidden" || data === "keepFlag") {
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
        InputSourceProvider.getLabelColumnList = function(elements) {
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
        InputSourceProvider.createLabel = function(keyName) {
            var labelColumnList;
            var key = new sap.ui.commons.Label({
                text: keyName
            });

            return key;
        };
        InputSourceProvider.getAggregationBehaviorList = function() {
            var aggregationBehaviorList = {
                items: [{
                    key: "none",
                    value: "NONE"
                }, {
                    key: "sum",
                    value: "SUM"
                }, {
                    key: "min",
                    value: "MIN"
                }, {
                    key: "max",
                    value: "MAX"
                }]
            };
            var aggregationModel = new sap.ui.model.json.JSONModel();
            aggregationModel.setData(aggregationBehaviorList);
            return aggregationModel;
        };
        InputSourceProvider.changeLabel = function(event) {
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

        InputSourceProvider.getHiddenPropertyList = function() {
            var hiddenList = {
                items: [{
                    key: true,
                    value: "true"
                }, {
                    key: false,
                    value: "false"
                }]
            };
            var hiddenModel = new sap.ui.model.json.JSONModel();
            hiddenModel.setData(hiddenList);
            return hiddenModel;
        };

        InputSourceProvider.createModelForInput = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }

            return {
                name: input.getSource().name,
                alias: input.alias ? input.alias : undefined,
                schemaName: input.getSource().schemaName,
                type: "Column",
                length: input.getSource().elements._keys.length
            };

        };
        InputSourceProvider.createModelForModel = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }

            return {
                name: input.getSource().name,
                label: input.getSource().name,
                packageName: input.getSource().packageName
            };

        };
        InputSourceProvider.createModelForUnion = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }
            return {
                name: input.getSource().name,
                label: input.getSource().name,
                /* isTable:(input.getSource().packageName==null)?true:false,*/
                packageName: input.getSource().packageName == null ? input.getSource().schemaName : input.getSource().packageName,
                emptyUnionBehavior: input.emptyUnionBehavior,
                 repositoryInputNodeId :input.repositoryInputNodeId

            };

        };
        InputSourceProvider.createModelForUnionEntity = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }
            return {
                name: input.getSource().name,
                alias: input.alias ? input.alias : undefined,
                schemaName: input.getSource().schemaName,
                type: "Column",
                length: input.getSource().elements._keys.length,
                emptyUnionBehavior: input.emptyUnionBehavior,
                 repositoryInputNodeId :input.repositoryInputNodeId
            };

        };
        InputSourceProvider.createModelForUnionAggregation = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }
            return {
                name: input.getSource().name,
                emptyUnionBehavior: input.emptyUnionBehavior,
                 repositoryInputNodeId :input.repositoryInputNodeId!==undefined?input.repositoryInputNodeId.replace (/#/g, ""):input.repositoryInputNodeId

            };

        };
        InputSourceProvider.createModelForViewNode = function(input, viewNode, columnView) {

            if (!input) {
                return;
            }

            return {
                name: input.getSource().name

            };

        };
        return InputSourceProvider;

    });
