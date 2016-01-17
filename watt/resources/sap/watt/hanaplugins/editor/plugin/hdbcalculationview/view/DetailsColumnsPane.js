/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./TypedObjectParser",
        "./TypedObjectTable",
        "./CalcViewEditorUtil",
        "./actions/PropagateToSemantics",
        "../control/AutoComplete"
    ],
	function(ResourceLoader, modelbase, commands, TypedObjectParser, TypedObjectTable, CalcViewEditorUtil, PropagateToSemantics) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var columnParser = new TypedObjectParser("column");

		/**
		 * @class
		 */
		var DetailsColumnsPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._context = parameters.context;
			this._model = parameters.model;
			this._viewNode = parameters.viewNode;
			this._detailtable = null;
		};

		DetailsColumnsPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			getContent: function() {
				var that = this;
				var columnsTable = this._createTable("tit_no_columns", "/", "columns", 3);

				var move = function(indices, isMoveUp) {
					if (indices.length > 0) {
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var moveCommands = [];
						var index, element, i;
						for (i = 0; i < indices.length; i++) {
							index = indices[i];
							var newIndex = index + (isMoveUp ? -1 : 1);
							element = columnsTable.getBinding().oList[index];
							moveCommands.push(new commands.MoveElementCommand(viewNodeName, element.name, isMoveUp));
							indices[i] = newIndex; // change selection
						}
						that._execute(new modelbase.CompoundCommand(moveCommands));
						if(that._viewNode.type !== "Graph"){
							enableButtons();
						}
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

				var propagate = function(event) {
					var indices = columnsTable.getSelectedIndices();
					if (indices.length > 0) {
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
						var elements = [];
						var index, element, i;
						for (i = 0; i < indices.length; i++) {
							index = indices[i];
							var currentObject = columnsTable.getBinding().oList[index];
							element = viewNode.elements.get(currentObject.name);
							if (element) {
								elements.push(element);
							}
						}
						PropagateToSemantics.propagate({
							undoManager: that._undoManager,
							columnView: that._model.columnView,
							viewNode: that._viewNode,
							elements: elements
						});
					}
				};

				/*                var deleteColumns = function(event) {
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
                                deleteCommands.push(new commands.DeleteElementCommand(viewNodeName, element.name));
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
                };*/
				if(that._viewNode.type !== "Graph"){
				var columnsToolbar = columnsTable.getToolbar();
				//var moveUpButton = TypedObjectTable.createButton("sap-icon://up", "tol_move_up", moveUp);
				var moveUpButton = new sap.ui.commons.Button({
					icon: "sap-icon://up",
					tooltip: resourceLoader.getText("tol_move_up"),
					press: moveUp
				});
				if (that._viewNode.isDataSource !== true) {
					columnsToolbar.addRightItem(moveUpButton);
				}

				//var moveDownButton = TypedObjectTable.createButton("sap-icon://down", "tol_move_down", moveDown);
				var moveDownButton = new sap.ui.commons.Button({
					icon: "sap-icon://down",
					tooltip: resourceLoader.getText("tol_move_down"),
					press: moveDown
				});
				if (that._viewNode.isDataSource !== true) {
					columnsToolbar.addRightItem(moveDownButton);
				}

				/*var deleteButton = TypedObjectTable.createButton("sap-icon://delete", "tol_delete", deleteColumns);
                columnsToolbar.addItem(deleteButton);*/

				var propagateButton = new sap.ui.commons.Button({
					icon: "sap-icon://action",
					//text: resourceLoader.getText("txt_propagate_to_semantics"), 
					tooltip: resourceLoader.getText("txt_propagate_to_semantics"),
					press: propagate
				});
				if (that._viewNode.isDataSource !== true) {
					columnsToolbar.addItem(propagateButton);
				}
				}

				var enableButtons = function(numberOfAddedRows) {
					var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
					var isEmpty = indices.length <= 0;
					var containsFirst = true;
					var containsLast = true;
					if (!isEmpty) {
						var numberOfRows = (columnsTable.getBinding().getLength() ? columnsTable.getBinding().getLength() : 0) + (numberOfAddedRows ?
							numberOfAddedRows : 0);
						containsFirst = indices[0] === 0;
						var lastIndex = indices[indices.length - 1];
						containsLast = lastIndex >= numberOfRows - 1;
					}
					if(that._viewNode.type !== "Graph"){
					if (containsFirst) {
						moveUpButton.setEnabled(false);
					} else {
						moveUpButton.setEnabled(!isEmpty);
					}
					if (containsLast) {
						moveDownButton.setEnabled(false);
					} else {
						moveDownButton.setEnabled(!isEmpty);
					}
					propagateButton.setEnabled(!isEmpty && PropagateToSemantics.canPropagate(that._model.columnView, that._viewNode));
					}
					//deleteButton.setEnabled(!isEmpty);
				};

				columnsTable.attachRowSelectionChange(enableButtons.bind(null, 0));
				enableButtons(columnsTable);

				this._addColumns(columnsTable);

				return columnsTable;
			},

			_createTable: function(noDataText, tableBindingPath, tableRowsBindingPath, fixedColumn) {
				var toolbar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
				var table = new sap.ui.table.Table({
					selectionMode: sap.ui.table.SelectionMode.Multiple,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					noData: new sap.ui.commons.TextView({
						text: resourceLoader.getText(noDataText)
					}),
					/* visibleRowCount: {
                    path: tableRowsBindingPath,
                    formatter: function(rows) {
                        return rows ? rows.length : 0;
                    }
                },*/
					columnHeaderVisible: true,
					fixedColumnCount: fixedColumn,
					minAutoRowCount: 1,
					toolbar: toolbar,
					width: "100%",
					rowSelectionChange: function(event) {
						var params = event.getParameters();
						var source = event.getSource();
					}
				});
				//table.addStyleClass("calcviewTypedObjectTable"),
				table.bindRows(tableRowsBindingPath);
				if(this._viewNode.type === "Graph"){
					table.addStyleClass("dummyColumn");
				}
				table.attachBrowserEvent("keydown", function(event) {
					if (event.target.getAttribute("name") !== "TypedObjectDefinitionCell") {
						if (event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey && event.keyCode === 65) {
							selectAll(table);
							event.preventDefault();
						}
					}
				});
				this._detailtable = table;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("dc", table);
				}				
				return table;
			},

			_addColumns: function(columnsTable) {
				var that = this;
				var commentValue;
				//Comments
				var changeComments = function(event) {
					var textArea = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textArea.getBindingContext();
					var element = bindingContext.getObject();
					var value = event.getParameter("newValue");
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					if (commentValue) {
						value = commentValue;
					}
					attributes.endUserTexts = {
						comment: {
							text: value,
							mimetype: "text/plain"
						}
					};
					//attributes.objectAttributes.name = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					if (value) {
						that._execute(command);
					}
				};

				var commentField = new sap.ui.commons.TextArea({

					editable: true,
					enabled: true,
					rows: 10,
					change: changeComments,
					liveChange: changeComments
				}).addStyleClass("commentField");

				var commentImage = true;
				var oButton3 = new sap.ui.commons.Image({
					src: resourceLoader.getImagePath("DeleteIcon.png", "analytics"),
					tooltip: resourceLoader.getText("txt_clear"),
					width: "20px",
					height: "20px",
					press: function() {
						commentField.setValue("");
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var bindingContext = commentField.getBindingContext();
						var element = bindingContext.getObject();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.endUserTexts = {
							comment: {
								text: "",
								mimetype: "text/plain"
							}
						};
						//attributes.objectAttributes.name = value;

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
						that._execute(command);

					}
				}).addStyleClass("commentButton");
				var commentLayout = new sap.ui.layout.VerticalLayout({
					content: [oButton3, commentField]
				});

				var tpComments = new sap.ui.ux3.ToolPopup({
					content: [commentLayout],
					autoClose: true
				}).addStyleClass("commentPopup");
				tpComments.addStyleClass("commentLay");

				commentField.attachBrowserEvent("keydown", function(event) {
					if ((event.keyCode) && (event.keyCode === 27)) {
						commentValue = event.currentTarget.value;
						commentField.setValue(commentValue);
						tpComments.close();
						commentField.setValue(commentValue);
					}
				}, "");

				commentImage = new sap.ui.commons.Image({
					src: {
						parts: ["comment"],
						formatter: function(comment) {
							comment = comment ? (comment.trim()) : comment;
							if ((comment !== "") && (comment !== undefined)) {
								return resourceLoader.getImagePath("Note.png", "analytics");
							} else {
								return resourceLoader.getImagePath("Note_grayscale.png", "analytics");
							}

						}
					},
					tooltip: {
						parts: ["comment"],
						formatter: function(comment) {
							if (comment !== "") {
								return comment;
							} else {
								return resourceLoader.getText("msg_add_comment");
							}

						}
					},

					press: function() {
						tpComments.setOpener(this);
						commentValue = undefined;
						var element = this.getParent().getBindingContext().getObject();
						commentField.setBindingContext(this.getParent().getBindingContext());
						if (tpComments.isOpen()) {

							tpComments.close();
						} else {
							commentField.setValue(element.comment);
							tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);

						}
					}

				});

				//Comments for each Column
				if (that._viewNode.isDataSource !== true) {
					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							//text: "Notes"
						}),

						template: commentImage,
						width: "50px"
					}));

					columnsTable.addColumn(new sap.ui.table.Column({
						width: "60px",
						label: resourceLoader.getText("tit_type"),
						hAlign: "Center",
						template: new sap.ui.commons.Image({
							src: "{imagePath}",
							tooltip: "{iconTooltip}"
						})
					}));
				}
				var changeName = function(event) {
					var textField = event.getSource();
					TypedObjectTable.clearCellStatus(textField);
					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();
					var columnView = that._model.columnView;
					var viewNode = columnView.viewNodes.get(viewNodeName);
					var elementObject = viewNode.elements.get(element.oldName);

					var value = event.getParameter("newValue");
					if (value === element.oldName) {
						return;
					}

					var result = CalcViewEditorUtil.checkRenameElement(value, elementObject, viewNode, columnView);

					if (result.message) {
						TypedObjectTable.showMessageTooltip(textField, columnParser, result.message, result.messageObjects, undefined);
						element.name = element.oldName;
					} else {
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.objectAttributes.name = value;
						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, elementObject.name, attributes);
						that._execute(command);
					}
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_name"),
					template: new sap.ui.commons.TextField({
						change: changeName,
						tooltip: "{name}",
						value: "{name}",
						customData: [{
							Type: "sap.ui.core.CustomData",
							key: "lineage",
							writeToDom: true,
							value: {
								parts: [{
									path: "lineage"
							}],
								formatter: function(lineage) {
									if (lineage !== undefined) {
										return "lineage";
									} else {
										return "none";
									}

								}
							}
						}, {
							Type: "sap.ui.core.CustomData",
							key: "colortype",
							writeToDom: true,
							value: {
								parts: [{
									path: "name"
								}, {
									path: "seq"
								}],
								formatter: function(name, seq) {
									if ((seq !== "none") && (seq !== undefined) && (seq !== null)) {
										return "highlight";
									} else {
										return "none";
									}
								}
							}
                          }, {

							Type: "sap.ui.core.CustomData",
							key: "focus",
							writeToDom: true,
							value: {
								parts: [{
									path: "focus"
								}],
								formatter: function(focus) {
									if ((focus !== "none") && (focus !== undefined) && (focus !== null)) {
										this.getParent().getParent().getParent().setSelectedIndex(this.getParent().getParent().getIndex());
										return "focus";
									} else {
										return "none";
									}
								}
							}

                          }]
					}) /*.bindProperty("value", "name")*/ ,
					width: "150px"
				}));

				if (this._viewNode.type === "Aggregation") {
					var changeAggregation = function(event) {
						var textField = event.getSource();

						var viewNodeName = that._viewNode.name;
						var bindingContext = textField.getBindingContext();
						var element = bindingContext.getObject();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();

						var value = event.getParameter("newValue");
						if (value === "") {
							value = "NONE";
						}
						attributes.objectAttributes.aggregationBehavior = value.toLowerCase();

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
						that._execute(command);
					};

					var aggregationItemTemplate = new sap.ui.core.ListItem();
					aggregationItemTemplate.bindProperty("text", "aggregationType");

					var aggregationTemplate = new sap.ui.commons.DropdownBox({
						editable: {
							parts: ["descriptionColumn", "measureType"],
							formatter: function(descriptionColumn, measureType) {
								if (measureType === "counter" || measureType === "restriction") {
									return false;
								}
								return !descriptionColumn;
							}
						},
						value: {
							path: "aggregationBehavior",
							formatter: function(aggregationBehavior) {
								if (aggregationBehavior) {
									if (aggregationBehavior == "NONE") {
										return "";
									} else {
										return aggregationBehavior;
									}
								}
								return "";
							}
						},
						change: changeAggregation
					});
					if (that._viewNode.isDataSource !== true) {
						columnsTable.addColumn(new sap.ui.table.Column({
							label: new sap.ui.commons.Label({
								text: resourceLoader.getText("tit_aggregation")
							}),
							template: aggregationTemplate.bindItems("aggregationTypes", aggregationItemTemplate),
							width: "100px",
							filterProperty: "aggregationBehavior"
						}));
					}

				}
				if (that._viewNode.isDataSource !== true) {
					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: resourceLoader.getText("tit_mapping")
						}),
						template: new sap.ui.commons.TextView().bindProperty("text", "mapping"),
						width: "300px"
					}));
				}
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_data_type")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "dataTypeString"),
					width: "150px"
				}));

				/*                columnsTable.addColumn(new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_length")
                    }),
                    template: new sap.ui.commons.TextView().bindProperty("text", "length"),
                    width: "75px",
                }));

                columnsTable.addColumn(new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_scale")
                    }),
                    template: new sap.ui.commons.TextView().bindProperty("text", "scale"),
                    width: "75px",
                }));
*/
				if (that._viewNode.type === "Projection" || that._viewNode.type === "Aggregation") {
					var changeKeepFlag = function(event) {
						var textField = event.getSource();

						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
						var bindingContext = textField.getBindingContext();
						var element = bindingContext.getObject();

						var value = event.getParameter("checked");

						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.objectAttributes.keep = value;

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
						that._execute(command);
					};
					if (that._viewNode.isDataSource !== true) {
						columnsTable.addColumn(new sap.ui.table.Column({
							label: new sap.ui.commons.Label({
								text: resourceLoader.getText("tit_keep_flag")
							}),
							template: new sap.ui.commons.CheckBox({
								change: changeKeepFlag
							}).bindProperty("checked", "keepFlag"),
							width: "100px",
							hAlign: "Center"
						}));
					}

					/*columnsTable.addColumn(new sap.ui.table.Column({
                        label: new sap.ui.commons.Label({
                            text: resourceLoader.getText("tit_filter")
                        }),
                        template: new sap.ui.commons.TextView().bindProperty("text", "filter"),
                        width: "75px",
                    }));*/
				}
				
				if (that._viewNode.type === "Graph"){
                        columnsTable.removeColumn(0);
                        columnsTable.removeColumn(0);
                        columnsTable.removeColumn(1);
                        columnsTable.removeColumn(2);
                    }
			},
			updateTable: function() {
				var that = this;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("dc", that._detailtable);
				}
			}
		};
		return DetailsColumnsPane;

	});
