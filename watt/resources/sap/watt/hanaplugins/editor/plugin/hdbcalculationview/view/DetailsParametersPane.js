/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./TypedObjectParser",
        "./TypedObjectTable",
        "./ParameterDetails",
        "../control/AutoComplete"
    ],
    function(ResourceLoader, modelbase, commands, TypedObjectParser, TypedObjectTable, ParameterDetails) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        var parameterParser = new TypedObjectParser("parameter");

        /**
         * @class
         */
        var DetailsParametersPane = function(parameters) {
            this._model = parameters.model;
            this._undoManager = parameters.undoManager;
            this._viewNode = parameters.viewNode
            this._context = parameters.context;
            this.isSemanticsNode=parameters.isSemanticsNode;
            this.layout = new sap.ui.commons.layout.MatrixLayout({
                widths: ["100%"]
            });
		this.parameterdetail = null;
        };

        DetailsParametersPane.createModelForParameter = function(parameter) {
            return {
                name: parameter.name,
                label: parameter.label,
                primitiveType: parameter.inlineType.primitiveType,
                length: parameter.inlineType.length,
                scale: parameter.inlineType.scale,
                semanticType: parameter.inlineType.semanticType
            };
        };


        DetailsParametersPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },
            getContent: function() {
                var that = this;
                //   this.layout.destroyContent();
                var parameterMasterList = new ParameterDetails({
                    model: this._model,
                    undomanager: this._undoManager,
                    context: this._context,
                    viewNode:this._viewNode,
                    isSemanticsNode:this.isSemanticsNode
                }); 
		that.parameterdetail = parameterMasterList; 
               var content = parameterMasterList.getContent();
                //  this.layout.createRow(content);
                //  parameterMasterList.update(getData());
                return content; //this.layout;

                /*
                   var parametersTable = TypedObjectTable.createTable("tit_no_parameters", "columnView", "parameters");

                var move = function(indices, isMoveUp) {
                    var rows = parametersTable.getRows();
                    if (indices.length > 0) {
                        var moveCommands = [];
                        var index, parameter, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var newIndex = index + (isMoveUp ? -1 : 1);
                            var currentRow = rows[index];
                            parameter = currentRow.getBindingContext().getObject();
                            moveCommands.push(new commands.MoveParameterCommand(parameter.name, isMoveUp));
                            indices[i] = newIndex; // change selection
                            TypedObjectTable.clearTypedObjectDefinitionCell(currentRow);
                        }
                        that._execute(new modelbase.CompoundCommand(moveCommands));
                        enableButtons();
                    }
                };

                var moveUp = function(event) {
                    var indices = TypedObjectTable.sortAscending(parametersTable.getSelectedIndices());
                    move(indices, true);
                };

                var moveDown = function(event) {
                    var indices = TypedObjectTable.sortDescending(parametersTable.getSelectedIndices());
                    move(indices, false);
                };

                var duplicateParameter = function(event) {
                    var indices = TypedObjectTable.sortDescending(parametersTable.getSelectedIndices());
                    var rows = parametersTable.getRows();
                    if (indices.length > 0) {
                        var copyCommands = [];
                        var index, parameter, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var currentRow = rows[index];
                            parameter = currentRow.getBindingContext().getObject();
                            if (parameter.name) {
                                copyCommands.push(new commands.CopyParameterCommand(parameter.name));
                                indices[i] = index + indices.length - i; // change selection
                                TypedObjectTable.clearTypedObjectDefinitionCell(currentRow);
                            }
                        }
                        if (copyCommands.length > 0) {
                            that._execute(new modelbase.CompoundCommand(copyCommands));
                            enableButtons(copyCommands.length);
                        }
                    }
                };

                var changeParameterDefinition = function(event) {
                    var textField = event.getSource();

                    var bindingContext = textField.getBindingContext();
                    var parameter = bindingContext.getObject();
                    var isAdd = typeof parameter.name === "undefined";

                    var value = event.getParameter("newValue");
                    var attributes = parameterParser.parse(value, parameter);
                    var message = attributes.errorId;
                    var messageObjects = attributes.errorParams;
                    var headerMessageObjects = [attributes.errorMatch];

                    if (!message) {
                        // no parser error try to create/change the parameter
                        var command;
                        if (isAdd) {
                            // empty row
                            command = new commands.AddParameterCommand(attributes);
                        } else {
                            command = new commands.ChangeParameterPropertiesCommand(parameter.name, attributes);
                        }

                        try {
                            var newParameter = DetailsParametersPane.createModelForParameter(that._execute(command));

                            bindingContext.getModel().setProperty(bindingContext.getPath(), newParameter);
                            var currentRowIndex = textField.getParent().getIndex();
                            if (isAdd) {
                                // add a new empty row to the table
                                var newRowPath = bindingContext.getPath().replace(currentRowIndex, currentRowIndex + 1);
                                bindingContext.getModel().setProperty(newRowPath, {});
                            }

                            TypedObjectTable.clearCellStatus(textField);
                            parametersTable.setSelectedIndex(currentRowIndex + 1);
                            window.setTimeout(function() {
                                var rows = parametersTable.getRows();
                                if (rows.length > currentRowIndex + 1) {
                                    TypedObjectTable.getTypedObjectDefinitionCell(rows[currentRowIndex + 1]).focus();
                                }
                            }, 200);

                        } catch (e) {
                            if (e instanceof modelbase.ObjectAlreadyExistsException) {
                                message = parameterParser.MSG_OBJECT_ALREADY_EXISTS;
                                messageObjects = [attributes.objectAttributes.name];
                            } else {
                                throw e;
                            }
                        }
                    }

                    if (message) {
                        TypedObjectTable.showMessageTooltip(textField, parameterParser, message, messageObjects, headerMessageObjects);
                    }
                };

                var deleteParameters = function(event) {
                    var indices = TypedObjectTable.sortAscending(parametersTable.getSelectedIndices());
                    var rows = parametersTable.getRows();
                    var numberOfRows = rows.length;
                    if (indices.length > 0) {
                        var deleteCommands = [];
                        var index, parameter, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var currentRow = rows[index];
                            parameter = currentRow.getBindingContext().getObject();
                            TypedObjectTable.clearTypedObjectDefinitionCell(currentRow);
                            // do not delete empty row
                            if (parameter.name) {
                                deleteCommands.push(new commands.DeleteParameterCommand(parameter.name));
                            }
                        }
                        if (deleteCommands.length > 0) {
                            that._execute(new modelbase.CompoundCommand(deleteCommands));
                            var numberOfDeletedRows = deleteCommands.length;
                            var nextIndex = index - numberOfDeletedRows + 1;
                            var lastIndex = numberOfRows - indices.length - 1;
                            parametersTable.setSelectedIndex(Math.min(nextIndex, lastIndex));
                            enableButtons(-1 * numberOfDeletedRows);
                        }
                    }
                };

                var parametersToolbar = parametersTable.getToolbar();
                var moveUpButton = TypedObjectTable.createButton("sap-icon://up", "tol_move_up", moveUp);
                parametersToolbar.addItem(moveUpButton);
                var moveDownButton = TypedObjectTable.createButton("sap-icon://down", "tol_move_down", moveDown);
                parametersToolbar.addItem(moveDownButton);
                var duplicateButton = TypedObjectTable.createButton("sap-icon://duplicate", "tol_duplicate", duplicateParameter);
                parametersToolbar.addItem(duplicateButton);
                var deleteButton = TypedObjectTable.createButton("sap-icon://delete", "tol_delete", deleteParameters);
                parametersToolbar.addItem(deleteButton);

                var enableButtons = function(numberOfAddedRows) {
                    var indices = TypedObjectTable.sortAscending(parametersTable.getSelectedIndices());
                    var isEmpty = indices.length <= 0;
                    var containsFirst = true;
                    var containsLast = true;
                    var containsEmptyRow = true;
                    if (!isEmpty) {
                        var numberOfRows = parametersTable.getRows().length + (numberOfAddedRows ? numberOfAddedRows : 0);
                        containsFirst = indices[0] === 0;
                        var lastIndex = indices[indices.length - 1];
                        containsLast = lastIndex >= numberOfRows - 2;
                        containsEmptyRow = lastIndex >= numberOfRows - 1;
                    }
                    moveUpButton.setEnabled(!containsFirst && !containsEmptyRow);
                    moveDownButton.setEnabled(!(containsLast || containsEmptyRow));
                    deleteButton.setEnabled(!isEmpty);
                    duplicateButton.setEnabled(!isEmpty);
                };
                parametersTable.attachRowSelectionChange(enableButtons.bind(null, 0));
                enableButtons(parametersTable);

                var parameterField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.AutoComplete({
                    maxPopupItems: 5,
                    name: "TypedObjectDefinitionCell", // used to identify the cell in event handlers
                    value: {
                        parts: ["name", "primitiveType", "length", "scale"],
                        formatter: function(name, primitiveType, length, scale) {
                            if (!name && !primitiveType) return "";
                            var displayName = name + ": " + primitiveType;
                            if (typeof length !== "undefined") {
                                if (typeof scale !== "undefined") {
                                    displayName += "(" + length + "," + scale + ")";
                                } else {
                                    displayName += "(" + length + ")";
                                }
                            }
                            return displayName;
                        }
                    },
                    change: changeParameterDefinition,
                    blur: TypedObjectTable.leaveTypedObjectCell,
                    suggest: TypedObjectTable.suggestTypedObject.bind(null, parameterParser)
                });

                parametersTable.addColumn(new sap.ui.table.Column({
                    width: "24px", // 48px
                    template: new sap.ui.commons.Image({
                        src: resourceLoader.getImagePath("Parameter.png"),
                        tooltip: resourceLoader.getText("tol_parameter"),
                        visible: {
                            path: "name",
                            formatter: function(name) {
                                return typeof name !== "undefined";
                            }
                        }

                    })
                }));
                parametersTable.addColumn(new sap.ui.table.Column({
                    template: parameterField
                }));

                return parametersTable; */
            },
             updateTable: function() {
				var that = this;
				if (that.parameterdetail !== null) {
					that.parameterdetail._findandhighlight = this._findandhighlight;
					that.parameterdetail.updateTable();

				}
			}
        };

        return DetailsParametersPane;

    });