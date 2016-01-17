/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./TypedObjectTable",
        "./TypedObjectParser",
        "./CalcViewEditorUtil",
        "./calculatedcolumn/SemanticTypeDetails"
    ],
	function(ResourceLoader, modelbase, commands, TypedObjectTable, TypedObjectParser, CalcViewEditorUtil, SemanticTypeDetails) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var columnParser = new TypedObjectParser("column");

		/**
		 * @class
		 */
		var SharedColumnsPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._context = parameters.context;
			this._model = parameters.model;
			this._viewNode = parameters.viewNode;
			this.shTable = undefined;
		};

		SharedColumnsPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			getContent: function() {
				//var that = this;

				var columnsTable = this._createTable("tit_no_columns", "/", "sharedColumns", 3);

				//var toolbar = columnsTable.getToolbar();

				var enableButtons = function() {
					// var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
					//var isEmpty = indices.length <= 0;
				};

				columnsTable.attachRowSelectionChange(enableButtons.bind(null, 0));
				enableButtons(columnsTable);

				this._addColumns(columnsTable);

				return columnsTable;
			},

			_createTable: function(noDataText, tableBindingPath, tableRowsBindingPath, fixedColumn) {
				var toolbar = new sap.ui.commons.Toolbar().addStyleClass("parameterToolbarStyle");
				var table = new sap.ui.table.Table({
					selectionMode: sap.ui.table.SelectionMode.Single,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					noData: new sap.ui.commons.TextView({
						text: resourceLoader.getText(noDataText)
					}),
					columnHeaderVisible: true,
					fixedColumnCount: fixedColumn,
					minAutoRowCount: 1,
					toolbar: toolbar

				});
				table.addStyleClass("calcTableProperties");
				table.bindRows(tableRowsBindingPath);
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("sc2", table);
				}
				this.shTable = table;
				return table;
			},

			_addColumns: function(columnsTable) {
				var that = this;

				var oImage = new sap.ui.commons.Image({
					src: "{imagePath}",
					tooltip: "{iconTooltip}"
				});

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_type")
					}),
					template: oImage,
					width: "60px"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "Key"
					}),
					template: new sap.ui.commons.CheckBox({
						editable: false,
						checked: "{keyElement}"
					}),
					width: "50px",
					hAlign: "Center"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_name"),
					template: new sap.ui.commons.Label({
						text: "{name}",
						tooltip: "{name}",
						customData: [{
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
										return "focus";
									} else {
										return "none";
									}
								}
							}

                          }]
					}),
					width: "150px"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_label"),
					template: new sap.ui.commons.Label({
						text: "{label}",
						tooltip: "{label}",
						customData: [{
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
										return "focus";
									} else {
										return "none";
									}
								}
							}

                          }]
					}),
					width: "150px"
				}));

				var changeAliasName = function(event) {
					var textField = event.getSource();
					TypedObjectTable.clearCellStatus(textField);
					var bindingContext = textField.getBindingContext();
					var object = bindingContext.getObject();
					var input = that._viewNode.inputs.get(object.inputKey);
					var newAliasName = event.getParameter("newValue");

					if (newAliasName) {
						newAliasName = newAliasName.trim();
					}

					var result = CalcViewEditorUtil.checkRenameElement(newAliasName, input.getSource().elements.get(object.name), that._viewNode, that._model
						.columnView, true);

					if (result.message) {
						TypedObjectTable.showMessageTooltip(textField, columnParser, result.message, result.messageObjects, undefined);
					} else {
						var attributes = {
							aliasName: newAliasName === "" ? undefined : newAliasName
						};
						that._execute(new commands.SetSharedElementPropertiesCommand(that._viewNode.name, object.inputKey, object.name, attributes));

					}
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_alias_name"),
					template: new sap.ui.commons.TextField({
						// editable: false,
						value: "{aliasName}",
						change: changeAliasName
					}),
					width: "150px"
				}));

				var changeAliasLabel = function(event) {
					var textField = event.getSource();
					var bindingContext = textField.getBindingContext();
					var object = bindingContext.getObject();
					var newAliasLabel = event.getParameter("newValue");

					/*                    var attributes = {
                        targetEndUserTexts: {
                            objectAttributes: {
                                label: newAliasLabel
                            }
                        }
                    };*/

					var attributes = {
						aliasLabel: newAliasLabel
					};

					that._execute(new commands.SetSharedElementPropertiesCommand(that._viewNode.name, object.inputKey, object.name, attributes));

				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_alias_label"),
					template: new sap.ui.commons.TextField({
						editable: {
							path: "aliasName",
							formatter: function(aliasName) {
								if (aliasName) {
									return true;
								}
								return false;
							}
						},
						value: "{aliasLabel}",
						change: changeAliasLabel
					}),
					width: "150px"
				}));

				var changeHiddenProperty = function(event) {
					var field = event.getSource();
					var bindingContext = field.getBindingContext();
					var object = bindingContext.getObject();
					var value = event.getParameter("checked");

					var attributes = {
						hidden: value
					};
					that._execute(new commands.SetSharedElementPropertiesCommand(that._viewNode.name, object.inputKey, object.name, attributes));
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_hidden")
					}),
					template: new sap.ui.commons.CheckBox({
						change: changeHiddenProperty,
						editable: {
							path: "descriptionColumn",
							formatter: function(descriptionColumn) {
								return !descriptionColumn;
							}
						}
					}).bindProperty("checked", "hidden"),
					width: "70px",
					hAlign: "Center"
				}));

				var variableItemTemplate = new sap.ui.core.ListItem();
				variableItemTemplate.bindProperty("text", "variableName");

				var filterImage = new sap.ui.commons.Image({
					src: {
						parts: ["variable", "aggregationBehavior"],
						formatter: function(variable, aggregationBehavior) {
							if (aggregationBehavior === "NONE") {
								if (variable) {
									return resourceLoader.getImagePath("Filter.png");
								} else {
									return resourceLoader.getImagePath("Filter_Grayscale.png");
								}
							}
						}
					}
				});

				var changeVariable = function(event) {
					var field = event.getSource();
					var bindingContext = field.getBindingContext();
					var object = bindingContext.getObject();
					var input = that._viewNode.inputs.get(object.inputKey);
					var element = input.getSource().elements.get(object.name);

					var value = event.getParameter("newValue");
					if (value === "") {
						var removeAssignmentCommands = [];
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.isVariable) {
								if (parameter.assignedElements) {
									parameter.assignedElements.foreach(function(assignedElement) {
										if (assignedElement === element) {
											removeAssignmentCommands.push(new commands.RemoveParamAssignedElemCommand(parameter.name, {
												elementName: element.name,
												entityFQN: CalcViewEditorUtil.getInputName(input)
											}));
										}
									});
								}
							}
						});
						if (removeAssignmentCommands.length > 0) {
							that._execute(new modelbase.CompoundCommand(removeAssignmentCommands));
						}
					} else {
						var command = new commands.AddParamAssignedElemCommand(value, {
							elementName: element.name,
							entityFQN: CalcViewEditorUtil.getInputName(input)
						});
						that._execute(command);
					}
				};

				var variableTemplate = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
					icon: filterImage,

					editable: {
						parts: ["aggregationBehavior", "descriptionColumn", "measureType"],
						formatter: function(aggregationBehavior, descriptionColumn, measureType) {
							return aggregationBehavior === "NONE" && !descriptionColumn && !measureType;
						}
					},
					value: {
						path: "variable",
						formatter: function(variable) {
							if (variable) {
								return variable;
							} else {
								return "";
							}
						}
					},
					change: changeVariable
				});

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_variable")
					}),
					//template: new sap.ui.commons.TextField().bindProperty("value", "variable"),
					template: variableTemplate.bindItems("variableList", variableItemTemplate),
					width: "150px"
				}));

				var changeTransparentFilter = function(event) {
					var field = event.getSource();
					var bindingContext = field.getBindingContext();
					var object = bindingContext.getObject();
					var value = event.getParameter("checked");

					var attributes = {
						transparentFilter: value
					};
					that._execute(new commands.SetSharedElementPropertiesCommand(that._viewNode.name, object.inputKey, object.name, attributes));
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_transparent_filter")
					}),
					template: new sap.ui.commons.CheckBox({
						change: changeTransparentFilter,
						editable: {
							parts: ["descriptionColumn", "calculation"],
							formatter: function(descriptionColumn, calculation) {
								if (!descriptionColumn && !calculation) {
									return true;
								}
								return false;
							}
						}
					}).bindProperty("checked", "transparentFilter"),
					width: "150px",
					hAlign: "Center"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_label_column")
					}),
					template: new sap.ui.commons.Label({
						text: "{labelColumnName}",
						tooltip: "{labelColumnName}"
					}),

					width: "130px"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_data_type")
					}),
					template: new sap.ui.commons.Label({
						text: "{dataTypeString}",
						tooltip: "{dataTypeString}"
					}),
					width: "150px"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_drill_down_enablement")
					}),
					template: new sap.ui.commons.Label({
						text: "{drillDown}",
						tooltip: "{drillDown}"
					}),
					width: "220px"
				}));

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_source")
					}),
					template: new sap.ui.commons.Label({
						text: "{source}",
						tooltip: "{source}"
					}),
					width: "250px"
				}));

			},
			updateTable: function() {
				var that = this;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("sc2", that.shTable);
				}
			}

		};

		return SharedColumnsPane;

	});
