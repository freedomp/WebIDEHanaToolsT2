/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./TypedObjectParser",
        "./TypedObjectTable",
        "./dialogs/AddColumnsFromDialog",
        "../control/AutoComplete"
    ],
    function(ResourceLoader, modelbase, commands, TypedObjectParser, TypedObjectTable, AddColumnsFromDialog) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        var columnParser = new TypedObjectParser("column");

        /**
         * @class
         */
        var ColumnsPane = function(model, context) {
            this._model = model;
            this._undoManager = model.$getUndoManager();
            this._context = context;
        };

        ColumnsPane.createModelForElement = function(element) {
            return {
                aggregationBehavior: element.aggregationBehavior ? element.aggregationBehavior.toUpperCase() : element.aggregationBehavior,
                name: element.name,
                label: element.label,
                primitiveType: element.inlineType ? element.inlineType.primitiveType : undefined,
                length: element.inlineType ? element.inlineType.length : undefined,
                scale: element.inlineType ? element.inlineType.scale : undefined,
                semanticType: element.inlineType ? element.inlineType.semanticType : undefined,
                hidden: false
            };
        };

        ColumnsPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            getContent: function() {
                var that = this;
                var columnsTable = TypedObjectTable.createTable("tit_no_columns", "/", "columns");

                var move = function(indices, isMoveUp) {
                    var rows = columnsTable.getRows();
                    if (indices.length > 0) {
                        var viewNodeName = columnsTable.getBindingContext().getObject().name;
                        var moveCommands = [];
                        var index, element, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var newIndex = index + (isMoveUp ? -1 : 1);
                            var currentRow = rows[index];
                            element = currentRow.getBindingContext().getObject();
                            moveCommands.push(new commands.MoveElementCommand(viewNodeName, element.name, isMoveUp));
                            indices[i] = newIndex; // change selection
                            TypedObjectTable.clearTypedObjectDefinitionCell(currentRow);
                        }
                        that._execute(new modelbase.CompoundCommand(moveCommands));
                        enableButtons();
                    }
                };

                var moveUp = function(event) {
                    var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
                    move(indices, true);
                };

                var moveDown = function(event) {
                    var indices = TypedObjectTable.sortDescending(columnsTable.getSelectedIndices());
                    move(indices, false);
                };

                var duplicateColumn = function(event) {
                    var indices = TypedObjectTable.sortDescending(columnsTable.getSelectedIndices());
                    var rows = columnsTable.getRows();
                    if (indices.length > 0) {
                        var viewNode = columnsTable.getBindingContext().getObject();
                        var copyCommands = [];
                        var index, element, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var currentRow = rows[index];
                            element = currentRow.getBindingContext().getObject();
                            if (element.name) {
                                copyCommands.push(new commands.CopyElementCommand(viewNode.name, element.name));
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

                var changeColumnDefinition = function(event) {
                    var textField = event.getSource();

                    var viewNodeName = columnsTable.getBindingContext().getObject().name;
                    var bindingContext = textField.getBindingContext();
                    var element = bindingContext.getObject();
                    var isAdd = typeof element.name === "undefined";

                    var value = event.getParameter("newValue");
                    var attributes = columnParser.parse(value, element);
                    var message = attributes.errorId;
                    var messageObjects = attributes.errorParams;
                    var headerMessageObjects = [attributes.errorMatch];

                    if (!message) {
                        // no parser error try to create/change the element
                        var command;
                        if (isAdd) {
                            // empty row
                            command = new commands.AddElementCommand(viewNodeName, attributes);
                        } else {
                            command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
                        }

                        try {
                            var newElement = ColumnsPane.createModelForElement(that._execute(command));

                            bindingContext.getModel().setProperty(bindingContext.getPath(), newElement);
                            var currentRowIndex = textField.getParent().getIndex();
                            if (isAdd) {
                                // add a new empty row to the table
                                var newRowPath = bindingContext.getPath().replace(currentRowIndex, currentRowIndex + 1);
                                bindingContext.getModel().setProperty(newRowPath, {});
                            }

                            TypedObjectTable.clearCellStatus(textField);
                            columnsTable.setSelectedIndex(currentRowIndex + 1);
                            window.setTimeout(function() {
                                var rows = columnsTable.getRows();
                                if (rows.length > currentRowIndex + 1) {
                                    TypedObjectTable.focusTypedObjectDefinitionCell(rows[currentRowIndex + 1]);
                                }
                            }, 200);

                        } catch (e) {
                            if (e instanceof modelbase.ObjectAlreadyExistsException) {
                                message = columnParser.MSG_OBJECT_ALREADY_EXISTS;
                                messageObjects = [attributes.objectAttributes.name];
                            } else {
                                throw e;
                            }
                        }
                    }

                    if (message) {
                        TypedObjectTable.showMessageTooltip(textField, columnParser, message, messageObjects, headerMessageObjects);
                    }
                };

                var deleteColumns = function(event) {
                    var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
                    var rows = columnsTable.getRows();
                    var numberOfRows = rows.length;
                    if (indices.length > 0) {
                        var viewNodeName = columnsTable.getBindingContext().getObject().name;
                        var deleteCommands = [];
                        var index, element, i;
                        for (i = 0; i < indices.length; i++) {
                            index = indices[i];
                            var currentRow = rows[index];
                            element = currentRow.getBindingContext().getObject();
                            TypedObjectTable.clearTypedObjectDefinitionCell(currentRow);
                            // do not delete empty row
                            if (element.name) {
                                deleteCommands.push(new modelbase.DeleteCommand('columnView.viewNodes["' + viewNodeName + '"].elements["' + element.name + '"]'));
                            }
                        }
                        if (deleteCommands.length > 0) {
                            that._execute(new modelbase.CompoundCommand(deleteCommands));
                            var numberOfDeletedRows = deleteCommands.length;
                            var nextIndex = index - numberOfDeletedRows + 1;
                            var lastIndex = numberOfRows - indices.length - 1;
                            columnsTable.setSelectedIndex(Math.min(nextIndex, lastIndex));
                            enableButtons(-1 * numberOfDeletedRows);
                        }
                    }
                };

                var addColumnsFrom = function() {
                    new AddColumnsFromDialog(that._context, that._model).openDialog();
                };
                
                var columnsToolbar = columnsTable.getToolbar();
                var moveUpButton = TypedObjectTable.createButton("sap-icon://up", "tol_move_up", moveUp);
                columnsToolbar.addItem(moveUpButton);
                var moveDownButton = TypedObjectTable.createButton("sap-icon://down", "tol_move_down", moveDown);
                columnsToolbar.addItem(moveDownButton);
                var duplicateButton = TypedObjectTable.createButton("sap-icon://duplicate", "tol_duplicate", duplicateColumn);
                columnsToolbar.addItem(duplicateButton);
                var deleteButton = TypedObjectTable.createButton("sap-icon://delete", "tol_delete", deleteColumns);
                columnsToolbar.addItem(deleteButton);
                var importButton = TypedObjectTable.createButton("sap-icon://inbox", "tol_add_columns_from", addColumnsFrom);
                columnsToolbar.addItem(importButton);

                var enableButtons = function(numberOfAddedRows) {
                    var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
                    var isEmpty = indices.length <= 0;
                    var isSingle = indices.length === 1;
                    var containsFirst = true;
                    var containsLast = true;
                    var containsEmptyRow = true;
                    if (!isEmpty) {
                        var numberOfRows = columnsTable.getRows().length + (numberOfAddedRows ? numberOfAddedRows : 0);
                        containsFirst = indices[0] === 0;
                        var lastIndex = indices[indices.length - 1];
                        containsLast = lastIndex >= numberOfRows - 2;
                        containsEmptyRow = lastIndex >= numberOfRows - 1;
                    }
                    moveUpButton.setEnabled(!containsFirst && !containsEmptyRow);
                    moveDownButton.setEnabled(!(containsLast || containsEmptyRow));
                    deleteButton.setEnabled(!isEmpty && !(isSingle && containsEmptyRow));
                    duplicateButton.setEnabled(!isEmpty && !(isSingle && containsEmptyRow));
                };
                columnsTable.attachRowSelectionChange(enableButtons.bind(null, 0));
                enableButtons(columnsTable);

                var ttip = {
                    parts: ["aggregationBehavior", "name", "primitiveType", "length", "scale"],
                    formatter: function(aggregationBehavior, name, primitiveType, length, scale) {
                        if (!name && !primitiveType) {
                            return resourceLoader.getText("tol_add_quick_column");
                        }
                        var isAttribute = aggregationBehavior === "NONE";
                        var displayName = isAttribute ? resourceLoader.getText("tol_attribute", [name]) : resourceLoader.getText("tol_measure", [name]);
                        displayName += "\ntype:\t" + primitiveType;
                        if (typeof length !== "undefined") {
                            displayName += "\nlenght:\t" + length;
                            if (typeof scale !== "undefined") {
                                displayName += "\nscale:\t" + scale;
                            }
                        }
                        if (isAttribute) {
                            displayName += "\naggregation: " + aggregationBehavior;
                        }
                        return displayName;
                    }
                };

                var columnField = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.AutoComplete({
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
                    change: changeColumnDefinition,
                    blur: TypedObjectTable.leaveTypedObjectCell,
                    suggest: TypedObjectTable.suggestTypedObject.bind(null, columnParser),
                    tooltip: ttip,
                    placeholder: resourceLoader.getText("txt_add_quick_column_placeholder")
                });

                columnsTable.addColumn(new sap.ui.table.Column({
                    width: "24px", // 48px
                    template: new sap.ui.commons.Image({
                        tooltip: ttip,
                        src: {
                            path: "aggregationBehavior",
                            formatter: function(aggregationBehavior) {
                                return resourceLoader.getImagePath(aggregationBehavior === "NONE" ? "Dimension.png" : "Measure.png");
                            }
                        },
                        visible: {
                            path: "aggregationBehavior",
                            formatter: function(aggregationBehavior) {
                                return typeof aggregationBehavior !== "undefined";
                            }
                        }
                    })
                }));
                columnsTable.addColumn(new sap.ui.table.Column({
                    template: columnField
                }));

                return columnsTable;
            }

        };

        return ColumnsPane;

    });
