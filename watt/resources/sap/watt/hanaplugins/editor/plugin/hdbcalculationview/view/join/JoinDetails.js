/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../viewmodel/commands",
        "../../base/modelbase",
        "../CalcViewEditorUtil",
        "../dialogs/ReferenceDialog",
        "./joinviewer/05/EntityShapes"
    ],
    function(ResourceLoader, commands, modelbase, CalcViewEditorUtil, ReferenceDialog, EntityShapes) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var JoinDetails = function(parameters) {
            this._undoManager = parameters.undoManager;
            this.viewNode = parameters.viewNode;
            this._columnView = parameters.columnView;
            this._svgContainer = null;
            this._canvas = null;
            this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.CHANGED, this.refresh, this);
            this.selection;
        };

        JoinDetails.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            close: function() {
                if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.CHANGED, this.refresh, this);
                }
            },

            getContent: function() {
                var that = this;

                var oLayout = new sap.ui.commons.layout.VerticalLayout();

                var toolbar = new sap.ui.commons.Toolbar();

                var removeOperation = function(oevent) {
                    var join = that.viewNode.joins.get(0);
                    if (join) {
                        if (join.leftElements.count() === 1) { // last join -> remove join object
                            that._execute(new modelbase.DeleteCommand('columnView.viewNodes["' + that.viewNode.name + '"].joins["' + '0' + '"]'));
                        } else if (that.viewNode.inputs._keys.length === 2) { // remove columns
                            var leftInput = that.viewNode.inputs.get(that.viewNode.inputs._keys[0]);
                            var rightInput = that.viewNode.inputs.get(that.viewNode.inputs._keys[1]);
                            if (leftInput && rightInput) {
                                var leftColumn = leftInput.getSource().elements.get(that.selection.leftColumnName);
                                var rightColumn = rightInput.getSource().elements.get(that.selection.rightColumnName);
                                that._execute(new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", {
                                    leftColumn: leftColumn,
                                    rightColumn: rightColumn,
                                    removeColumn: true
                                }));
                            }
                        }
                    }
                };

                this.removeButton = new sap.ui.commons.Button({
                    icon: "sap-icon://delete",
                    tooltip: resourceLoader.getText("tol_remove_join"),
                    text: resourceLoader.getText("tol_remove_join"),
                    enabled: false,
                    press: function(event) {
                        if (that.selection) {
                            var callback = function(okPressed) {
                                if (okPressed) {
                                    removeOperation(event);
                                }
                            };
                            var dialog = new ReferenceDialog({
                                //element: [],
                                fnCallbackMessageBox: callback,
                                isRemoveCall: true
                            });
                            dialog.openMessageDialog();
                        }
                    }
                });

                toolbar.addItem(this.removeButton);
                toolbar.addStyleClass("parameterToolbarStyle");

                var afterRendering = function(event) {

                    if (this.getDomRef() && !that._canvas) {
                        var model = that.createModel();
                        that._canvas = new Canvas(that._svgContainer.getId(), model, imagePathProvider, contextMenuProvider);
                        that._canvas.addListener(that._canvas.events.CAN_JOIN, canCreateJoin);
                        that._canvas.addListener(that._canvas.events.JOIN_CREATED, joinCreatedHandler);
                        that._canvas.addListener(that._canvas.events.SELECTION, selectionListener);
                        CanvasGlobals.SCREEN_OFFSET_Y = 100;
                        CanvasGlobals.TEXT_CHAR_LENGTH = 24;
                        that._canvas.draw();
                    }
                };

                var onExit = function() {
                    if (that._canvas) {
                        that._canvas.dispose();
                    }
                };

                function canCreateJoin(leftElement, rightElement) {
                    return that._canCreateJoin(leftElement, rightElement);
                }

                function joinCreatedHandler(leftElement, rightElement) {
                    return that._joinCreatedHandler(leftElement, rightElement);
                }

                function selectionListener(event) {
                    return that._selectionListener(event);
                }

                function imagePathProvider(type, model) {
                    switch (type) {
                        case that._canvas.typeOfShape.ELEMENT_SHAPE:
                            var dataType = model.dataType.type;
                            return CalcViewEditorUtil.getDataTypeImage(dataType);

                        case that._canvas.typeOfShape.ENTITY_SHAPE:
                            if (model.iconPath) {
                                return model.iconPath;
                            }
                            return resourceLoader.getImagePath("Table.png");
                    }
                }

                function contextMenuProvider(typeOfShape, data) {
                    if (typeOfShape === that._canvas.typeOfShape.JOIN_SHAPE) {
                        that.selection = data;
                        that.removeButton.setEnabled(true);
                        //viewDesigner.setTypeOfShapeSelected(typeOfShape);
                        return [{
                            id: "contextMenu_join_delete",
                            imagePath: resourceLoader.getImagePath("Trash.gif"),
                            text: resourceLoader.getText("tol_remove"),
                            enable: true,
                            actionHandler: function(event) {
                                if (that.selection) {
                                    var callback = function(okPressed) {
                                        if (okPressed) {
                                            removeOperation(event);
                                        }
                                    };
                                    var dialog = new ReferenceDialog({
                                        //element: [],
                                        fnCallbackMessageBox: callback,
                                        isRemoveCall: true
                                    });
                                    dialog.openMessageDialog();
                                }
                            },
                            data: { //will be passed to actionHandler parameter
                                model: data,
                                typeOfShape: typeOfShape
                            }
                        }];
                    } else {
                        that.removeButton.setEnabled(false);
                    }
                }


                this._svgContainer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.DiagramContainer({
                    content: '<div style="width: 100%; height: 100%; overflow: hidden;"/>',
                    afterRendering: afterRendering,
                    exit: onExit.bind(this)
                });

                oLayout.addContent(toolbar);
                oLayout.addContent(this._svgContainer);
                oLayout.addStyleClass("joinViewer");

                return oLayout;

            },

            _canCreateJoin: function(leftElement, rightElement) {
                if (leftElement.dataType.type === rightElement.dataType.type) {
                    var join = this.viewNode.joins.get(0);
                    if (join && join.spatialJoinProperties.count() === 1) {
                        // Multi-join is not supported for Spatial join
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            },

            _joinCreatedHandler: function(sourceElement, targetElement) {
                var that = this;
                var leftInput;
                var rightInput;
                var leftColumn;
                var rightColumn;
                var join;

                that.viewNode.joins.foreach(function(joinObject) {
                    join = joinObject;
                });

                if (that.viewNode.inputs._keys.length === 2) {
                    leftInput = that.viewNode.inputs.get(that.viewNode.inputs._keys[0]);
                    rightInput = that.viewNode.inputs.get(that.viewNode.inputs._keys[1]);
                }
                if (leftInput.$$defaultKeyValue === sourceElement.inputKey) { // Dragging started from left table
                    leftColumn = leftInput.getSource().elements.get(sourceElement.text);
                    rightColumn = rightInput.getSource().elements.get(targetElement.text);
                } else {
                    leftColumn = rightInput.getSource().elements.get(targetElement.text);
                    rightColumn = leftInput.getSource().elements.get(sourceElement.text);
                }
                if (leftInput && rightInput) {
                    var joinCommands = [];
                    //var canAddElementToOutput = true;
                    if (!join) { // Create Join
                        var joinAttributes = {
                            objectAttributes: {
                                joinType: "inner"
                            },
                            leftInput: leftInput,
                            rightInput: rightInput,
                            leftColumn: leftColumn,
                            rightColumn: rightColumn,
                        };
                        joinCommands.push(new commands.CreateJoinCommand(that.viewNode.name, joinAttributes));
                    } else { // add columns
                        joinCommands.push(new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", {
                            leftColumn: leftColumn,
                            rightColumn: rightColumn,
                        }));
                    }
                    /*if (canAddElementToOutput) {
                        joinCommands.push(this._createAddElementCommand(leftColumn, leftInput));
                    }*/
                    this._execute(new modelbase.CompoundCommand(joinCommands));
                }
            },

            /*            _createAddElementCommand: function(element, input) {
                var that = this;
                var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(element);
                elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(element.name, that.viewNode);
                elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;
                elementAttributes.mappingAttributes = {
                    sourceName: element.name,
                    targetName: elementAttributes.objectAttributes.name,
                    type: "ElementMapping",
                    input: input
                };
                var command = new commands.AddElementCommand(that.viewNode.name, elementAttributes);
                return command;
            },*/

            _selectionListener: function(event) {
                if (event.typeOfShapeSelected === this._canvas.typeOfShape.JOIN_SHAPE) {
                    this.removeButton.setEnabled(true);
                    this.selection = event.data;
                } else {
                    this.removeButton.setEnabled(false);
                }
            },

            createModel: function() {
                var that = this;
                var join;
                var model = {
                    entities: [],
                    joins: []
                };

                var x = 50;
                if (this.viewNode) {
                    if (this.viewNode.joins) {
                        this.viewNode.joins.foreach(function(joinObject) {
                            join = joinObject;
                        });
                    }

                    this.viewNode.inputs.foreach(function(input) {
                        var inputKey = input.$$defaultKeyValue;
                        var entityId = that._svgContainer.getId() + inputKey + input.getSource().name;

                        var entity = {
                            id: entityId,
                            title: CalcViewEditorUtil.getInputName(input),
                            htmlToolTip: '<span><b>' + resourceLoader.getText("tit_name") + ':</b>&nbsp' + CalcViewEditorUtil.getInputName(input) + '</span>',
                            iconPath: CalcViewEditorUtil.getInputImagePath(input),
                            elements: [],
                            layout: {
                                x: x,
                                y: 50,
                                height: 100,
                                width: 200
                            }
                        };
                        input.getSource().elements.foreach(function(element) {
                            var tooltip = '<span><b>' + resourceLoader.getText("tit_name") + ':</b>&nbsp' + element.name + '</span>';
                            if (element.inlineType && element.inlineType.primitiveType) {
                                tooltip += "<br><strong>" + resourceLoader.getText("tit_data_type") + ": </strong>" + element.inlineType.primitiveType;
                                if (element.inlineType.length) {
                                    tooltip += "(" + element.inlineType.length;
                                    if (element.inlineType.scale) {
                                        tooltip += "," + element.inlineType.scale;
                                    }
                                    tooltip += ")";
                                }
                            }
                            var column = {
                                id: entityId + element.name,
                                text: element.name,
                                htmlToolTip: tooltip,
                                isKey: false,
                                dataType: {
                                    type: element.inlineType ? element.inlineType.primitiveType : undefined,
                                    length: 100
                                },
                                inputKey: inputKey
                            };
                            entity.elements.push(column);
                        });
                        model.entities.push(entity);
                        x = x + 300;
                    });
                    if (join && join.leftInput && join.rightInput) {
                        var leftElements = join.leftElements.toArray();
                        var rightElements = join.rightElements.toArray();
                        var joinModel = {
                            leftEntity: model.entities[0].id,
                            rightEntity: model.entities[1].id,
                            columns: [],
                            type: "Inner",
                            cardinality: "1:1",
                            extension: {

                            }
                        };
                        if (leftElements.length === rightElements.length) {
                            for (var i = 0; i < leftElements.length; i++) {
                                joinModel.columns.push({
                                    leftColumn: joinModel.leftEntity + leftElements[i].name,
                                    rightColumn: joinModel.rightEntity + rightElements[i].name,
                                    leftColumnName: leftElements[i].name,
                                    rightColumnName: rightElements[i].name
                                });
                            }
                        }
                        model.joins.push(joinModel);
                    }
                }

                return model;

            },

            refresh: function() {
                var that = this;

                function canCreateJoin(leftElement, rightElement) {
                    return that._canCreateJoin(leftElement, rightElement);
                }

                function joinCreatedHandler(leftElement, rightElement) {
                    return that._joinCreatedHandler(leftElement, rightElement);
                }

                function selectionListener(event) {
                    return that._selectionListener(event);
                }

                if (that._canvas) {
                    that._canvas.removeListener(that._canvas.events.CAN_JOIN, canCreateJoin);
                    that._canvas.removeListener(that._canvas.events.JOIN_CREATED, joinCreatedHandler);
                    that._canvas.removeListener(that._canvas.events.SELECTION, selectionListener);
                    that._canvas.model = that.createModel();
                    that._canvas.redraw();
                    that._canvas.addListener(that._canvas.events.CAN_JOIN, canCreateJoin);
                    that._canvas.addListener(that._canvas.events.JOIN_CREATED, joinCreatedHandler);
                    that._canvas.addListener(that._canvas.events.SELECTION, selectionListener);
                }

                this.removeButton.setEnabled(false);
            },


        };

        return JoinDetails;

    });
