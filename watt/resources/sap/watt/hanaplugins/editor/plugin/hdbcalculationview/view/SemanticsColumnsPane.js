/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "./TypedObjectParser",
        "./TypedObjectTable",
        "./IconDropdownBox",
        "./calculatedcolumn/SemanticTypeDetails",
        "./dialogs/ExtractSemanticsDialog",
        "./SharedColumnsPane",
        "../viewmodel/model",
        "./ValueHelpForAttribute",
        "./CustomValueHelpField",
        "./OutputToolPopup",
        "../viewmodel/ModelProxyResolver",
        "./dialogs/FindDialog"

    ], 
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, TypedObjectParser, TypedObjectTable, IconDropdownBox,
		SemanticTypeDetails, ExtractSemanticsDialog,
		SharedColumnsPane, model, ValueHelpForAttribute, CustomValueHelpField, OutputToolPopup, ModelProxyResolver, FindDialog
	) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var columnParser = new TypedObjectParser("column");

		/**
		 * @class
		 */
		var SemanticsColumnsPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._context = parameters.context;
			this._model = parameters.model;
			this.isScriptNode = parameters.isScriptNode;
			this._viewNode = parameters.viewNode;
			this._columnsTable = null;
			this._columnsStarTable = null;
		};

		SemanticsColumnsPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			getContent: function() {
				this._context.currentCVname = this._model.columnView.id;
				var that = this;
				if (this._viewNode && this._viewNode.isStarJoin()) {

					if (!this.mainLayout) {
						var imageButton, isCollapse = true;

						var toggleFunction = function() {
							if (isCollapse) {
								imageButton.setIcon("sap-icon://collapse-group");
								var splitterHeight = $("#" + that.mainLayout.splitterDIV.id).height();
								var splitterPosition = ((splitterHeight - 34) / splitterHeight) * 100;
								splitterPosition = "" + splitterPosition + "%";
								that.mainLayout.setSplitterPosition(splitterPosition);
								isCollapse = false;
							} else {
								imageButton.setIcon("sap-icon://expand-group");
								that.mainLayout.setSplitterPosition("50%");
								isCollapse = true;
							}
						};

						imageButton = new sap.ui.commons.Button({
							icon: "sap-icon://expand-group",
							press: toggleFunction
						});

						var privateLabel = new sap.ui.commons.Label();
						privateLabel.setText("Private");
						privateLabel.addStyleClass("propertiesLinkLabel");

						var privateToolbar = new sap.ui.commons.Toolbar();
						privateToolbar.setStandalone(false);

						privateToolbar.addItem(privateLabel);

						var privateLayout = new sap.ui.layout.VerticalLayout({
							content: [privateToolbar, this.getPrivateColumnsContent()]
						});

						privateLayout.addStyleClass("columnsPaneTab");

						var sharedLabel = new sap.ui.commons.Label();
						sharedLabel.setText("Shared");
						sharedLabel.addStyleClass("propertiesLinkLabel");

						var sharedToolbar = new sap.ui.commons.Toolbar();
						sharedToolbar.setStandalone(false);

						sharedToolbar.addItem(sharedLabel);
						sharedToolbar.addRightItem(imageButton);

						this.sharedColumnsPane = new SharedColumnsPane({
							undoManager: this._undoManager,
							context: this._context,
							model: this._model,
							viewNode: this._viewNode
						});
						this.sharedColumnsPane._findandhighlight = this._findandhighlight;
						var sharedLayout = new sap.ui.layout.VerticalLayout({
							content: [sharedToolbar, this.sharedColumnsPane.getContent()]
						});

						sharedLayout.addStyleClass("columnsPaneTab");

						this.mainLayout = new sap.ui.commons.Splitter({
							splitterOrientation: sap.ui.commons.Orientation.horizontal,
							splitterPosition: "50%",
							firstPaneContent: privateLayout,
							secondPaneContent: sharedLayout
						});
						this.mainLayout.addStyleClass("columnsPane");

					}

					return this.mainLayout;

				} else {
					return this.getPrivateColumnsContent();
				}
			},

			getPrivateColumnsContent: function() {
				var that = this;
				var columnsTable = this._createTable("tit_no_columns", "/", "columns", 4);

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

				var markAsAttribute = function(event) {
					var indices = columnsTable.getSelectedIndices();
					if (indices.length > 0) {
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var viewNode = that._model.columnView.viewNodes.get(viewNodeName);

						var markAsCommands = [];
						var index, element, i;
						for (i = 0; i < indices.length; i++) {
							index = indices[i];
							var currentObject = columnsTable.getBinding().oList[index];
							element = viewNode.elements.get(currentObject.name);
							if (element.measureType !== "restriction" && element.measureType !== "counter") {
								var attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
								markAsCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes));
							}
						}
						that._execute(new modelbase.CompoundCommand(markAsCommands));
						markAsmeasureButton.setEnabled(true);
						markAsAttributeButton.setEnabled(false);
					}
				};

				var markAsmeasure = function(event) {
					var indices = columnsTable.getSelectedIndices();
					if (indices.length > 0) {
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var viewNode = that._model.columnView.viewNodes.get(viewNodeName);

						var markAsCommands = [];
						var index, element, i;
						for (i = 0; i < indices.length; i++) {
							index = indices[i];
							var currentObject = columnsTable.getBinding().oList[index];
							element = viewNode.elements.get(currentObject.name);
							if (element.measureType !== "restriction" && element.measureType !== "counter") {
								var attributes = CalcViewEditorUtil.getMeasurePropertiesModel(element);
								element.parameterMappings.foreach(function(parameterMapping) {
									markAsCommands.push(new commands.RemoveParameterMappingCommand({
										source: {
											type: "element",
											typeName: element.name
										},
										mapping: {
											parameterNameOtherView: parameterMapping.parameterNameOtherView,
											parameterName: parameterMapping.parameter ? parameterMapping.parameter.name : "",
											value: parameterMapping.value
										}
									}));
								});
								that._model.columnView.parameters.foreach(function(parameter) {
									if (parameter.isVariable) {
										if (parameter.assignedElements) {
											parameter.assignedElements.foreach(function(assignedElement) {
												if (assignedElement === element) {
													markAsCommands.push(new commands.RemoveParamAssignedElemCommand(parameter.name, {
														elementName: element.name
													}));
												}
											});
										}
									}
								});
								viewNode.elements.foreach(function(object) {
									if (object !== element) {
										if (object.labelElement === element) {
											var labelColumnAttributes = CalcViewEditorUtil.createModelForElementAttributes();
											labelColumnAttributes.objectAttributes.labelElement = null;
											markAsCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, object.name, labelColumnAttributes));

										}
									}
								});
								markAsCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes));
							}
						}
						that._execute(new modelbase.CompoundCommand(markAsCommands));
						markAsmeasureButton.setEnabled(false);
						markAsAttributeButton.setEnabled(true);
					}
				};

				var columnsToolbar = columnsTable.getToolbar();
				columnsToolbar.setDesign(sap.ui.commons.ToolbarDesign.Transparent);
				var moveUpButton = new sap.ui.commons.Button({
					icon: "sap-icon://up",
					tooltip: resourceLoader.getText("tol_move_up"),
					press: moveUp
				});
				columnsToolbar.addRightItem(moveUpButton);
				var moveDownButton = new sap.ui.commons.Button({
					icon: "sap-icon://down",
					tooltip: resourceLoader.getText("tol_move_down"),
					press: moveDown
				});
				columnsToolbar.addRightItem(moveDownButton);
				var markAsAttributeButton = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("Dimension.png"),
					tooltip: resourceLoader.getText("tol_mark_as_attribute"),
					press: markAsAttribute
				});
				columnsToolbar.addItem(markAsAttributeButton);
				var markAsmeasureButton = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("Measure.png"),
					tooltip: resourceLoader.getText("tol_mark_as_measure"),
					press: markAsmeasure
				});
				columnsToolbar.addItem(markAsmeasureButton);
				var assignSemanticMenuItem = new sap.ui.commons.MenuItem({
					text: "Assign Semantics"
					// icon: resourceLoader.getImagePath("Properties.png")
				});
				var assignValueHelpMenuItem = new sap.ui.commons.MenuItem({
					text: "Assign Value Help"
				});

				var menu = new sap.ui.commons.Menu({
					items: [assignSemanticMenuItem, assignValueHelpMenuItem]
				});
				var addMenuButton = new sap.ui.commons.MenuButton({
					icon: resourceLoader.getImagePath("Properties.png"),
					tooltip: resourceLoader.getText("Assign Semantics"),
					itemSelected: function(oevent) {
						var name = oevent.getParameter("item").getText();
						if (name === "Assign Semantics") {
							that._assignSemanticDialog(columnsTable);
						} else {
							that._assignValueHelpDialog(columnsTable);
						}
					},
					menu: menu
				});

				var currencyConverter = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("Properties.png"),
					tooltip: resourceLoader.getText("Assign Semantics"),
					press: function() {
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var cviewNode = that._model.columnView.viewNodes.get(viewNodeName);
						var selectedIndex = columnsTable.getSelectedIndex();
						var element;
						var columnName;
						if (selectedIndex > -1) {
							element = columnsTable.getModel().oData.columns[selectedIndex];
							columnName = element.name;
						}

						var semanticTypeDetails = new SemanticTypeDetails({
							undoManager: that._undoManager,
							viewNode: cviewNode,
							element: cviewNode.elements.get(element.name),
							context: that._context,
							isDialog: true

						});

						if (sap.ui.getCore().byId("currencyConverterDialog")) {
							sap.ui.getCore().byId("currencyConverterDialog").destroy();
						}
						var ccDialog = new sap.ui.commons.Dialog("currencyConverterDialog", {
							title: "Assign Semantics for " + columnName,
							modal: true,
							width: "700px",
							resizable: true
						});
						ccDialog.addButton(new sap.ui.commons.Button({
							text: "OK",
							press: function() {
								semanticTypeDetails.executeCommands();
								ccDialog.close();
							}
						}));
						ccDialog.addButton(new sap.ui.commons.Button({
							text: "Cancel",
							press: function() {
								ccDialog.close();
							}
						}));

						ccDialog.addContent(semanticTypeDetails.getContent());
						ccDialog.open();

					}
				});
				// columnsToolbar.addItem(currencyConverter);
				columnsToolbar.addItem(addMenuButton);

				if (!this.isScriptNode) {

					var extractSemantics = function() {
						var selectedElements = [];
						var selectedIndices = columnsTable.getSelectedIndices();
						for (var i = 0; i < selectedIndices.length; i++) {
							var element = columnsTable.getModel().oData.columns[selectedIndices[i]];
							selectedElements.push(element.oldName);
						}
						var extractSemanticsDialog = new ExtractSemanticsDialog({
							undoManager: that._undoManager,
							columnView: that._model.columnView,
							selectedElements: selectedElements
						});
						extractSemanticsDialog.open();
					};
					var extractButton = new sap.ui.commons.Button({
						icon: resourceLoader.getImagePath("extractSemantics2.png"),
						tooltip: resourceLoader.getText("tit_extract_semantics"),
						press: extractSemantics
					});

					var showLineage = function() {
						//	var events = that._model.columnView.$getEvents();
						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var cviewNode = that._model.columnView.viewNodes.get(viewNodeName);
						that.updateTable();
						var selectedIndex = columnsTable.getSelectedIndex();
						var element;
						if (selectedIndex > -1) {
							element = cviewNode.elements.get(columnsTable.getModel().oData.columns[selectedIndex].name);
						}
						//	columnDataLineage.registerEditor(that.editor);
						if (element.measureType !== "restriction") {
							that._model.lineage = that._columnLineage.traceColumnLineage(cviewNode, element, "Sc");
							CalcViewEditorUtil.getCurEditor()._detailsPane.scenarioEditor._editor._extension.showLineage();
						}
						
						//	events.publish(commands.ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
					};
					var lineageButton = new sap.ui.commons.Button({
						icon: resourceLoader.getImagePath("dataLineage.png"),
						tooltip: resourceLoader.getText("tit_data_lineage"),
						press: function() {
							showLineage();
							lineageButton.setEnabled(false);
							that._columnLineage.lineageButton = lineageButton;
						}

					});
					columnsToolbar.addItem(extractButton);
					columnsToolbar.addItem(lineageButton);

				}

				var enableButtons = function(numberOfAddedRows) {
					if (that._model.$isDisposed()) {
						return;
					}
					var indices = TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
					var isEmpty = indices.length <= 0;
					var isMoreThanOne = indices.length > 1;
					var containsFirst = true;
					var containsLast = true;

					if (!isEmpty && indices.length > 0) { // Bugfix for select All
						var element = columnsTable.getModel().oData.columns[indices[0]];
						if (!element) {
							isEmpty = true;
						}
					}

					if (!isEmpty) {
						var numberOfRows = (columnsTable.getBinding().getLength() ? columnsTable.getBinding().getLength() : 0) + (numberOfAddedRows ?
							numberOfAddedRows : 0);
						containsFirst = indices[0] === 0;
						var lastIndex = indices[indices.length - 1];
						containsLast = lastIndex >= numberOfRows - 1;
					}
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
					markAsmeasureButton.setEnabled(!isEmpty);
					markAsAttributeButton.setEnabled(!isEmpty);
					lineageButton.setEnabled(!isEmpty);
					if (that._model.columnView.dataCategory === "DIMENSION") {
						markAsmeasureButton.setEnabled(false);
					}
					var selectedIndex = columnsTable.getSelectedIndex();

					if (selectedIndex > -1 && !isMoreThanOne) {
						var element = columnsTable.getModel().oData.columns[selectedIndex];
						if (element) {
							if (element.measureType !== "restriction" && element.measureType !== "counter") {
								currencyConverter.setEnabled(!isEmpty);
								addMenuButton.setEnabled(!isEmpty);
								if (element.aggregationBehavior === "NONE" && element.calculationDefinition === undefined) {
									assignValueHelpMenuItem.setEnabled(true);
								} else {
									assignValueHelpMenuItem.setEnabled(false);
								}
							} else {
								currencyConverter.setEnabled(false);
								addMenuButton.setEnabled(false);
							}
						} else {
							assignValueHelpMenuItem.setEnabled(false);
							currencyConverter.setEnabled(false);
							addMenuButton.setEnabled(false);
						}

					} else {
						currencyConverter.setEnabled(false);
						addMenuButton.setEnabled(false);
					}

					var enableMeasureButton = markAsmeasureButton.getEnabled();
					var enableAttrinuteButton = markAsAttributeButton.getEnabled();

					for (var i = 0; i < indices.length; i++) {
						var element = columnsTable.getModel().oData.columns[indices[i]];
						if (element) {
							if (element.measureType === "restriction" || element.measureType === "counter") {
								enableMeasureButton = false;
								enableAttrinuteButton = false;
							} else {
								if (element.aggregationBehavior === "NONE") {
									enableAttrinuteButton = false;
								} else {
									enableMeasureButton = false;
								}
							}
						} else {
							enableAttrinuteButton = false;
							enableMeasureButton = false;
						}
					}
					markAsmeasureButton.setEnabled(enableMeasureButton);
					markAsAttributeButton.setEnabled(enableAttrinuteButton);

					if (extractButton) {
						if (columnsTable.getBinding() && columnsTable.getBinding().getLength() > 0) {
							extractButton.setEnabled(true);
						} else {
							extractButton.setEnabled(false);
						}
					}

				};
				columnsTable.attachRowSelectionChange(enableButtons.bind(null, 0));
				setTimeout(function() {
					if (!that._model.$isDisposed()) {
						enableButtons(columnsTable);
					}
				}, 1000);

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
					columnHeaderVisible: true,
					fixedColumnCount: fixedColumn,
					minAutoRowCount: 1,
					toolbar: toolbar
				});
				table.addStyleClass("calcTableProperties");
				//table.addStyleClass("calcviewTypedObjectTable"),
				table.bindRows(tableRowsBindingPath);
				this._semantictable = table;
				table.attachBrowserEvent("keydown", function(event) {
					if (event.target.getAttribute("name") !== "TypedObjectDefinitionCell") {
						if (event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey && event.keyCode === 65) {
							//selectAll(table);
							event.preventDefault();
						}
					}
				});

				this._columnsTable = table;				
				if (this._columnLineage !== undefined) {
					this._columnLineage.registerTable("sc1", table);
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("sc1", table);
				}
				//CalcViewEditorUtil.unRegisterTable("sc2");
				return table;
			},

			_addColumns: function(columnsTable) {
				var that = this;
				var commentValue;
				var oIconListBox = new sap.ui.commons.ListBox({
					displayIcons: true
					//items: aItems
				});
				var oImage = new sap.ui.commons.Image({
					src: "{imagePath}",
					tooltip: "{iconTooltip}"
				});

				var typeItemTemplate = new sap.ui.core.ListItem({
					text: "{type}",
					icon: "{icon}"
				});

				//Comments
				var changeComments = function(event) {
					var textArea = event.getSource();
					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textArea.getBindingContext();
					var element = bindingContext.getObject();
					var value = event.getParameter("newValue");
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					if (commentValue || commentValue === "") {
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
					that._execute(command);
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
						var element = commentField.getBindingContext().getObject();
						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.endUserTexts = {
							comment: {
								text: "",
								mimetype: "text/plain"
							}
						};

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
						commentValue = undefined;
						tpComments.setOpener(this);
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
				commentImage.addStyleClass("commentImage");
				//Comments for each Column
				columnsTable.addColumn(new sap.ui.table.Column({
					template: commentImage,
					width: "50px"
				}));

				var changeType = function(event) {
					var executeCommands = [];
					var field = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
					var bindingContext = field.getBindingContext();
					var element = viewNode.elements.get(bindingContext.getObject().name);
					var attributes;

					var value = event.getParameter("newValue");
					if (value === resourceLoader.getText("txt_attribute")) {
						attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
					} else {
						element.parameterMappings.foreach(function(parameterMapping) {
							executeCommands.push(new commands.RemoveParameterMappingCommand({
								source: {
									type: "element",
									typeName: element.name
								},
								mapping: {
									parameterNameOtherView: parameterMapping.parameterNameOtherView,
									parameterName: parameterMapping.parameter ? parameterMapping.parameter.name : "",
									value: parameterMapping.value
								}
							}));
						});
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.isVariable) {
								if (parameter.assignedElements) {
									parameter.assignedElements.foreach(function(assignedElement) {
										if (assignedElement === element) {
											executeCommands.push(new commands.RemoveParamAssignedElemCommand(parameter.name, {
												elementName: element.name
											}));
										}
									});
								}
							}
						});
						viewNode.elements.foreach(function(object) {
							if (object !== element) {
								if (object.labelElement === element) {
									var labelColumnAttributes = CalcViewEditorUtil.createModelForElementAttributes();
									labelColumnAttributes.objectAttributes.labelElement = null;
									executeCommands.push(new commands.ChangeElementPropertiesCommand(viewNodeName, object.name, labelColumnAttributes));

								}
							}
						});

						attributes = CalcViewEditorUtil.getMeasurePropertiesModel(element);
						attributes.objectAttributes.engineAggregation = attributes.objectAttributes.aggregationBehavior;
						if(attributes.objectAttributes.engineAggregation === "count")
							attributes.objectAttributes.aggregationBehavior = "sum";
					}
					attributes.typeAttributes.semanticType = model.SemanticType.EMPTY;
					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					executeCommands.push(command);
					that._execute(new modelbase.CompoundCommand(executeCommands));
				};

				var oCombo = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
					icon: oImage,
					editable: {
						parts: ["measureType", "isDimension"],
						formatter: function(measureType, isDimension) {
							if (measureType === "counter" || measureType === "restriction" || isDimension) {
								return false;
							}
							return true;
						}
					},
					value: {
						parts: ["aggregationBehavior", "measureType"],
						formatter: function(aggregationBehavior, measureType) {
							if (aggregationBehavior !== null && aggregationBehavior) {
								if (measureType !== "counter" && measureType !== "restriction") {
									if (aggregationBehavior === "NONE") {
										return resourceLoader.getText("txt_attribute");
									} else {
										return resourceLoader.getText("txt_measure");
									}
								}
							}
						}
					},
					listBox: oIconListBox,
					change: changeType
				}).addStyleClass("iconComboBox");

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_type")
					}),
					template: oCombo.bindItems("types", typeItemTemplate),
					width: "60px"
				}));

				var changeKey = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("checked");

					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.keyElement = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "Key"
					}),
					template: new sap.ui.commons.CheckBox({
						change: changeKey,
						editable: true
						/*editable: {
                            parts: ["descriptionColumn", "aggregationBehavior", "measureType"],
                            formatter: function(descriptionColumn, aggregationBehavior, measureType) {
                                if (!descriptionColumn && aggregationBehavior === "none" && !measureType) {
                                    return true;
                                }
                                return false;
                            }
                        },*/
					}).bindProperty("checked", "keyElement"),
					width: "50px",
					hAlign: "Center"
				}));

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
						if (value.lastIndexOf(".description") !== -1) {
							attributes.objectAttributes.hidden = true;
							attributes.objectAttributes.label = "";
						} else if (element.oldName.lastIndexOf(".description") !== -1) {
							attributes.objectAttributes.hidden = false;
							attributes.objectAttributes.label = value;
						}
						attributes.objectAttributes.name = value;
						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, elementObject.name, attributes);
						that._execute(command);
					}
				};
	
				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_name"),
					//template: columnField,
					template: new sap.ui.commons.TextField({
						change: changeName,
						value: "{name}",
						tooltip: "{name}",
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
					}),
					width: "150px"
				}));

				var changeLabel = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("newValue");
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.objectAttributes.label = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: resourceLoader.getText("tit_label"),
					template: new sap.ui.commons.TextField({
						change: changeLabel,
						value: "{label}",
						tooltip: "{label}",
						customData: [{
							Type: "sap.ui.core.CustomData",
							key: "colortype",
							writeToDom: true,
							value: {
								parts: [{
									path: "label"
								}, {
									path: "seq1"
								}],
								formatter: function(label, seq) {
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
									path: "focus1"
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

                          }],
						editable: {
							path: "descriptionColumn",
							formatter: function(descriptionColumn) {
								return !descriptionColumn;
							}
						}
					}),
					width: "150px"
				}));

				var changeClientAggregation = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
					var bindingContext = textField.getBindingContext();
					var element = viewNode.elements.get(bindingContext.getObject().name);
					var attributes;

					var value = event.getParameter("newValue");
					if (value === "") {
						attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
					} else {
						attributes = CalcViewEditorUtil.getMeasurePropertiesModel(element);
						attributes.objectAttributes.aggregationBehavior = value.toLowerCase();
					}

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				var changeEngineAggregation = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
					var bindingContext = textField.getBindingContext();
					var element = viewNode.elements.get(bindingContext.getObject().name);
					var attributes;

					var value = event.getParameter("newValue");
					if (value === "") {
						attributes = CalcViewEditorUtil.getAttributePropertiesModel(element);
					}
					 else {
						attributes = CalcViewEditorUtil.getMeasurePropertiesModel(element);

						attributes.objectAttributes.engineAggregation = value.toLowerCase();

						//value = value.toLowerCase() === "count" ? "sum" : value;
						
						if(value.toLowerCase() === "count")
							value = "sum";

						attributes.objectAttributes.aggregationBehavior = value.toLowerCase();

					}

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				var aggregationItemTemplate = new sap.ui.core.ListItem();
				aggregationItemTemplate.bindProperty("text", "aggregationType");

				var warningImg = new sap.ui.commons.Image({
					visible: {
						parts: ["engineAggregation", "aggregationBehavior"],
						formatter: function(engineAggregation, aggregationBehavior) {
							if (that._model.columnView.hasEngineAggregation && engineAggregation === "COUNT" && aggregationBehavior !== "SUM") {
								return true;
							} else {
								return false;
							}
						}
					},
					src: resourceLoader.getImagePath("Warning.png")
				});

				var warningTooltip = new sap.ui.commons.RichTooltip({
					text: resourceLoader.getText("tol_not_recommenended_count"),
					title: "Quick Help",
					imageSrc: resourceLoader.getImagePath("Warning.png")
				});
				warningImg.setTooltip(warningTooltip);
				var cleientAggregationCombo = new sap.ui.commons.ComboBox({

					editable: {
						parts: ["descriptionColumn", "measureType", "isDimension", "engineAggregation", "aggregationBehavior"],
						formatter: function(descriptionColumn, measureType, isDimension, engineAggregation, aggregationBehavior) {
							if (isDimension) {
								return false;
							}
							if (measureType === "counter" || measureType === "restriction") {
								return false;
							}
							if (engineAggregation && engineAggregation.toUpperCase() === "COUNT") {
								return true;
							}
							if (engineAggregation && engineAggregation.toUpperCase() === "FORMULA" && aggregationBehavior && aggregationBehavior.toUpperCase() !==
								"FORMULA" && aggregationBehavior.toUpperCase() !== "NONE") {
								return true;
							}
							return false;
						}
					},
					value: {
						path: "aggregationBehavior",
						formatter: function(aggregationBehavior) {
							if (aggregationBehavior === "NONE") {
								return "";
							} else {
								return aggregationBehavior;
							}
						}
					},
					change: changeClientAggregation
				});

				var engineAggregationTemplate = new sap.ui.commons.ComboBox({
					editable: {
						parts: ["descriptionColumn", "measureType", "isDimension", "engineAggregation", "calculation", "aggregationBehavior"],
						formatter: function(descriptionColumn, measureType, isDimension, engineAggregation, calculation, aggregationBehavior) {

							if (isDimension) {
								return false;
							}
							if (calculation) {
								return false;
							}
							if (measureType === "counter" || measureType === "restriction") {
								return false;
							}
							if (engineAggregation && engineAggregation.toUpperCase() === "NONE" || aggregationBehavior === "NONE") {
								return false;

							}
							if (engineAggregation && engineAggregation.toUpperCase() === "FORMULA") {
								return false;
							}

							return !descriptionColumn;
						}
					},
					value: {
						parts: ["engineAggregation", "aggregationBehavior", "calculation", "measureType"],
						formatter: function(engineAggregation, aggregationBehavior, calculation, measureType) {

							if (measureType === "counter") {
								return "Count Distinct";
							}
							if (measureType === "restriction") {
								return engineAggregation ? engineAggregation.toUpperCase() : engineAggregation;
							}
							if (engineAggregation === "NONE" || aggregationBehavior === "NONE") {
								return "";
							} else if (calculation) {
								return "FORMULA";
							} else {
								return engineAggregation ? engineAggregation.toUpperCase() : engineAggregation;

							}
						}
					},
					change: changeEngineAggregation
				});

				if (that._model.columnView.dataCategory !== model.DataCategory.DIMENSION) {
					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: {
								parts: ["engineAggregation"],
								formatter: function() {
									if (that._model.columnView.hasEngineAggregation) {
										return resourceLoader.getText("tit_engine_aggre");
									} else {
										return resourceLoader.getText("tit_aggregation");
									}
								}
							}
						}),
						template: engineAggregationTemplate.bindItems("aggregationTypes", aggregationItemTemplate),
						width: "100px",
						filterProperty: "engineAggregation"
					}));

				}

				if (that._model.columnView.dataCategory === model.DataCategory.DIMENSION) {
					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: {
								parts: ["engineAggregation"],
								formatter: function() {
									return resourceLoader.getText("tit_aggregation");
								}
							}
						}),
						template: cleientAggregationCombo.bindItems("aggregationTypes", aggregationItemTemplate),
						width: "100px",
						filterProperty: "aggregationBehavior"
					}));
				} else if (that._model.columnView.hasEngineAggregation) {
					cleientAggregationCombo.setWidth("80%");
					cleientAggregationCombo.addStyleClass("engineAggre");
					var cleientAggregationTemplate = new sap.ui.layout.HorizontalLayout({
						content: [warningImg, cleientAggregationCombo.bindItems("clientAggregation", aggregationItemTemplate)]
					});

					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: {
								parts: ["engineAggregation"],
								formatter: function() {
									if (that._model.columnView.hasEngineAggregation) {
										return resourceLoader.getText("tit_client_aggre");
									} else {
										return resourceLoader.getText("tit_aggregation");
									}
								}
							}
						}),
						template: cleientAggregationTemplate,
						width: "100px",
						filterProperty: "aggregationBehavior"
					}));

				}

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

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
					var bindingContext = field.getBindingContext();
					var element = viewNode.elements.get(bindingContext.getObject().name);
					var value = event.getParameter("newValue");
					if (value === "") {
						var removeAssignmentCommands = [];
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.isVariable) {
								if (parameter.assignedElements) {
									parameter.assignedElements.foreach(function(assignedElement) {
										if (assignedElement === element) {
											removeAssignmentCommands.push(new commands.RemoveParamAssignedElemCommand(parameter.name, {
												elementName: element.name
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
							elementName: element.name
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

				var changeLabelColumn = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var viewNode = that._model.columnView.viewNodes.get(viewNodeName);
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("newValue");
					if (value === "") {
						value = null;
					} else {
						value = viewNode.elements.get(value);
					}
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.labelElement = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				var labelColumnItemTemplate = new sap.ui.core.ListItem();
				labelColumnItemTemplate.bindProperty("text", "elementName");

				var labelColumnTemplate = new sap.ui.commons.DropdownBox({
					editable: {
						parts: ["aggregationBehavior", "descriptionColumn", "measureType"],
						formatter: function(aggregationBehavior, descriptionColumn, measureType) {
							return aggregationBehavior === "NONE" && !descriptionColumn && !measureType;
						}
					},
					value: {
						path: "labelElement",
						formatter: function(labelElement) {
							if (labelElement) {
								return labelElement.name;
							} else {
								return "";
							}
						}
					},
					change: changeLabelColumn
				});

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_label_column")
					}),
					template: labelColumnTemplate.bindItems("labelElementList", labelColumnItemTemplate),
					width: "130px"
				}));

				var changeHiddenProperty = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("checked");

					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.objectAttributes.hidden = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
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

				//Advanced Column Properties

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
				/*                columnsTable.addColumn(new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_length")
                    }),
                    template: new sap.ui.commons.TextView().bindProperty("text", "length"),
                    width: "70px",
                }));
                columnsTable.addColumn(new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({
                        text: resourceLoader.getText("tit_scale")
                    }),
                    template: new sap.ui.commons.TextView().bindProperty("text", "scale"),
                    width: "70px",
                }));*/

				var changeDisplayFolder = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("newValue");
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.objectAttributes.displayFolder = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_display_folder"),
					}),
					template: new sap.ui.commons.TextField({
						change: changeDisplayFolder,
						editable: {
							parts: ["aggregationBehavior", "measureType"],
							formatter: function(aggregationBehavior, measureType) {
								if (measureType) {
									return true;
								}
								return aggregationBehavior !== "NONE";
							}
						}
					}).bindProperty("value", "displayFolder"),
					width: "150px",
					visible: false
				}));

				var changeDrillDown = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();
					var attributes = CalcViewEditorUtil.createModelForElementAttributes();

					var value = event.getParameter("newValue");
					if (value === "") {
						value = "NONE";
					} else if (value === resourceLoader.getText("txt_drill_down")) {
						value = "DRILL_DOWN";
						attributes.objectAttributes.attributeHierarchyDefaultMember = "";
					} else if (value === resourceLoader.getText("txt_drill_down_hierarchy")) {
						value = "DRILL_DOWN_WITH_HIERARCHY";
						attributes.objectAttributes.attributeHierarchyDefaultMember = "";
					}
					attributes.objectAttributes.drillDownEnablement = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				//for drillDown 
				var drillDownItemTemplate = new sap.ui.core.ListItem({
					text: "{type}"
				});

				var drillDownTemplate = new sap.ui.commons.ComboBox({

					editable: {
						parts: ["aggregationBehavior", "descriptionColumn"],
						formatter: function(aggregationBehavior, descriptionColumn) {
							return aggregationBehavior === "NONE" && !descriptionColumn;
						}
					},
					value: {
						parts: ["drillDown", "aggregationBehavior"],
						formatter: function(drillDown, aggregationBehavior) {
							if (aggregationBehavior === "NONE") {
								if (drillDown === "DRILL_DOWN") {
									return resourceLoader.getText("txt_drill_down");
								} else if (drillDown === "DRILL_DOWN_WITH_HIERARCHY") {
									return resourceLoader.getText("txt_drill_down_hierarchy");
								}
							} else {
								return "";
							}
						}
					},
					change: changeDrillDown
				});
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_drill_down_enablement")
					}),
					template: drillDownTemplate.bindItems("drillDownList", drillDownItemTemplate),
					width: "200px"
				}));
				var changeHierarchyDefaultMember = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("newValue");

					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.objectAttributes.attributeHierarchyDefaultMember = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_hierarchies_default_member")
					}),
					template: new sap.ui.commons.TextField({
						editable: {
							path: "drillDown",
							formatter: function(drillDown) {
								if (drillDown && drillDown === "DRILL_DOWN_WITH_HIERARCHY") {
									return true;
								} else {
									return false;
								}
							}
						},
						value: "{hierarchyDefaultMember}",
						change: changeHierarchyDefaultMember
					}),
					width: "200px"
				}));

				var changeInfoObject = function(event) {
					var textField = event.getSource();

					var viewNodeName = columnsTable.getBindingContext().getObject().name;
					var bindingContext = textField.getBindingContext();
					var element = bindingContext.getObject();

					var value = event.getParameter("newValue");

					var attributes = CalcViewEditorUtil.createModelForElementAttributes();
					attributes.objectAttributes.infoObjectName = value;

					var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
					that._execute(command);
				};

				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_info_object")
					}),
					template: new sap.ui.commons.TextField({
						change: changeInfoObject,
						editable: {
							parts: ["descriptionColumn", "calculation", "measureType"],
							formatter: function(descriptionColumn, calculation, measureType) {
								if (!descriptionColumn && !calculation && !measureType) {
									return true;
								}
								return false;
							}
						}
					}).bindProperty("value", "infoObject"),
					width: "120px"
				}));
				if (!this.isScriptNode) {
					var changeKeepFlag = function(event) {
						var textField = event.getSource();

						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var bindingContext = textField.getBindingContext();
						var element = bindingContext.getObject();

						var value = event.getParameter("checked");

						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.objectAttributes.keep = value;

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
						that._execute(command);
					};

					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: resourceLoader.getText("tit_keep_flag")
						}),
						template: new sap.ui.commons.CheckBox({
							change: changeKeepFlag,
							editable: {
								parts: ["descriptionColumn", "calculation", "measureType", "aggregationBehavior"],
								formatter: function(descriptionColumn, calculation, measureType, aggregationBehavior) {
									if (!descriptionColumn && !calculation && !measureType && aggregationBehavior === "NONE") {
										return true;
									}
									return false;
								}
							}
						}).bindProperty("checked", "keepFlag"),
						width: "120px",
						hAlign: "Center"
					}));
					var changeTransparentFilter = function(event) {
						var textField = event.getSource();

						var viewNodeName = columnsTable.getBindingContext().getObject().name;
						var bindingContext = textField.getBindingContext();
						var element = bindingContext.getObject();

						var value = event.getParameter("checked");

						var attributes = CalcViewEditorUtil.createModelForElementAttributes();
						attributes.objectAttributes.transparentFilter = value;

						var command = new commands.ChangeElementPropertiesCommand(viewNodeName, element.name, attributes);
						that._execute(command);
					};

					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: resourceLoader.getText("tit_transparent_filter")
						}),
						template: new sap.ui.commons.CheckBox({
							change: changeTransparentFilter,
							editable: {
								parts: ["descriptionColumn", "calculation", "measureType", "aggregationBehavior"],
								formatter: function(descriptionColumn, calculation, measureType, aggregationBehavior) {
									if (!descriptionColumn && !calculation && !measureType && aggregationBehavior === "NONE") {
										return true;
									}
									return false;
								}
							}
						}).bindProperty("checked", "transparentFilter"),
						width: "150px",
						hAlign: "Center",
						visible: false
					}));
					columnsTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: resourceLoader.getText("tit_mapping")
						}),
						template: new sap.ui.commons.TextView().bindProperty("text", "mapping"),
						width: "250px"
					}));
				}
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText(resourceLoader.getText("tit_value_help_view_table"))
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "valueHelpEntity"),
					width: "200px"
				}));
				columnsTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText(resourceLoader.getText("tit_semantics_table_col_semantic"))
					}),
					template: new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomValueHelpField({
						canedit: false,
						iconURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_regular.png",
		                iconHoverURL: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/F4-Help_icon_hover.png",						
						enabled: {
							parts: ["measureType","aggregationBehavior"],
							formatter: function(measureType,aggregationBehavior) {
								if (measureType === model.MeasureType.COUNTER || measureType === model.MeasureType.RESTRICTION) {
									return false;
								}
								if(aggregationBehavior !== "NONE"){
									return false;
								}
								return true;
							}

						},
						valueHelpRequest: function() {
							var viewNodeName = columnsTable.getBindingContext().getObject().name;
							var cviewNode = that._model.columnView.viewNodes.get(viewNodeName);
							var selectedIndex = this.oParent.getIndex();

							var element;
							var columnName;
							if (selectedIndex > -1) {
								element = columnsTable.getModel().oData.columns[selectedIndex];
								columnName = element.name;
							}

							var semanticTypeDetails = new SemanticTypeDetails({
								undoManager: that._undoManager,
								viewNode: cviewNode,
								element: cviewNode.elements.get(element.name),
								context: that._context,
								isDialog: true

							});
							if (sap.ui.getCore().byId("currencyConverterDialog")) {
								sap.ui.getCore().byId("currencyConverterDialog").destroy();
							}
							var ccDialog = new sap.ui.commons.Dialog("currencyConverterDialog", {
								title: "Assign Semantics for " + columnName,
								modal: true,
								width: "700px",
								resizable: true
							});
							ccDialog.addButton(new sap.ui.commons.Button({
								text: "OK",
								press: function() {
									semanticTypeDetails.executeCommands();
									ccDialog.close();
								}
							}));
							ccDialog.addButton(new sap.ui.commons.Button({
								text: "Cancel",
								press: function() {
									ccDialog.close();
								}
							}));

							ccDialog.addContent(semanticTypeDetails.getContent());
							ccDialog.open();

						},
						value: {
							parts: ["semanticType"],
							formatter: function(semanticType) {
								if (semanticType) {
									return CalcViewEditorUtil.getSemanticTypeText(semanticType);
								}
							}
						}
					}),
					width: "200px"
				}));

				/*columnsTable.addColumn(new sap.ui.table.Column({
                    label: new sap.ui.commons.Label({
                        text: "Semantic Type"
                    }),
                    template: new sap.ui.commons.TextView({
                        // change: changeLabel
                    }).bindProperty("text", "semanticType"),
                    width: "100px",
                }));*/

			},
			_assignSemanticDialog: function(columnsTable) {
				var that = this;
				var viewNodeName = columnsTable.getBindingContext().getObject().name;
				var cviewNode = that._model.columnView.viewNodes.get(viewNodeName);
				var selectedIndex = columnsTable.getSelectedIndex();
				var element;
				var columnName;
				if (selectedIndex > -1) {
					element = columnsTable.getModel().oData.columns[selectedIndex];
					columnName = element.name;
				}

				var semanticTypeDetails = new SemanticTypeDetails({
					undoManager: that._undoManager,
					viewNode: cviewNode,
					element: cviewNode.elements.get(element.name),
					context: that._context,
					isDialog: true

				});
				if (sap.ui.getCore().byId("currencyConverterDialog")) {
					sap.ui.getCore().byId("currencyConverterDialog").destroy();
				}
				var ccDialog = new sap.ui.commons.Dialog("currencyConverterDialog", {
					title: "Assign Semantics for " + columnName,
					modal: true,
					width: "700px",
					resizable: true
				});
				ccDialog.addButton(new sap.ui.commons.Button({
					text: "OK",
					press: function() {
						semanticTypeDetails.executeCommands();
						ccDialog.close();
					}
				}));
				ccDialog.addButton(new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						ccDialog.close();
					}
				}));

				ccDialog.addContent(semanticTypeDetails.getContent());
				ccDialog.open();
			},
			_assignValueHelpDialog: function(columnsTable) {
				var that = this;
				var viewNodeName = columnsTable.getBindingContext().getObject().name;
				var cviewNode = that._model.columnView.viewNodes.get(viewNodeName);
				var selectedIndex = columnsTable.getSelectedIndex();
				var element;
				var columnName;
				if (selectedIndex > -1) {
					element = columnsTable.getModel().oData.columns[selectedIndex];
					columnName = element.name;
				}

				var valueHelForAttribute = new ValueHelpForAttribute({
					undoManager: that._undoManager,
					viewNode: cviewNode,
					element: cviewNode.elements.get(element.name),
					context: that._context,
					model: that._model,
					isDialog: true
				});

				var ccDialog = new sap.ui.commons.Dialog({
					title: "Assign Value Help for " + columnName,
					modal: true,
					width: "700px",
					resizable: true
				});
				var okButton = new sap.ui.commons.Button({
					text: "OK",
					press: function() {
						valueHelForAttribute.executeCommands();
						ccDialog.close();
					}
				});
				ccDialog.addButton(okButton);
				ccDialog.addButton(new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						ccDialog.close();
					}
				}));
				valueHelForAttribute.setOkButton(okButton);
				ccDialog.addContent(valueHelForAttribute.getContent());
				ccDialog.open();
			},
			updateTable: function() {
				var that = this;
				if (that._columnLineage !== undefined) {
					this._columnLineage.registerTable("sc1", that._columnsTable);
				}
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("sc1", that._columnsTable);
				}
				if (this.sharedColumnsPane === undefined) {
					if (this._findandhighlight !== undefined) {
						this._findandhighlight.unRegisterTable("sc2");
					}
				} else {
					this.sharedColumnsPane.updateTable();
				}
			}

		};

		return SemanticsColumnsPane;


	});
