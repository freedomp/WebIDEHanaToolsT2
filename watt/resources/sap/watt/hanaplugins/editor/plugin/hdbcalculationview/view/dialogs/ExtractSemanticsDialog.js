/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../actions/PropagateToSemantics"
    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, PropagateToSemantics) {

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var ExtractSemanticsDialog = function(parameters) {
			this._undoManager = parameters.undoManager;
			this.columnView = parameters.columnView;
			this.focusOnHierarchy = parameters.focusOnHierarchy;
			this.selectedElements = parameters.selectedElements;
			this.selectedInput = parameters.input;
			this.viewNode = parameters.viewNode;
			this.model = new sap.ui.model.json.JSONModel();
		};

		ExtractSemanticsDialog.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			open: function() {
				var that = this;

				//creating dialogtype
				this.dialog = new sap.ui.commons.Dialog({
					width: "610px",
					title: resourceLoader.getText("tit_extract_semantics"),
					//tooltip: that.dialogtype.dialogTitle, //this.title,
					modal: true,
					resizable: true
				});

				//creating layout

				var mainLayout = new sap.ui.commons.layout.VerticalLayout().addStyleClass("customProperties");

				var tabStrip = new sap.ui.commons.TabStrip();

				tabStrip.createTab(resourceLoader.getText("tit_columns"), this.getColumnsContainer());
				//tabStrip.createTab(resourceLoader.getText("tit_hierarchies"), this.getHierarchiesContainer());

				if (this.focusOnHierarchy) {
					tabStrip.setSelectedIndex(1);
				}

				mainLayout.addContent(tabStrip);

				mainLayout.setModel(this.model);
				this.model.setData(this.createModel());

				//adding main layout to dailog
				this.dialog.addContent(mainLayout);

				var loButtonCancel = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_cancel"),
					text: resourceLoader.getText("txt_cancel"),
					press: function() {
						that.close();
					}
				});
				var dailogOkEvent = function() {
					that.commandList = [];
					var data = that.model.getData();
					var i;
					var selectedElements = [];

					// prepare selected elements list
					for (i = 0; i < data.elements.length; i++) {
						var elementData = data.elements[i];
						if (elementData.isSelected) {
							selectedElements.push(elementData);
						}
					}
					// propagate if possible

					that._propagteToSemantics(selectedElements);

					// takeover semantics

					for (i = 0; i < selectedElements.length; i++) {
						that._takeOverSemantics(data, selectedElements[i]);
					}

					for (i = 0; i < data.hierarchies.length; i++) {
						var hierarchyData = data.hierarchies[i];
						if (hierarchyData.isSelected) {
							that.copyHierarchy(hierarchyData);
						}
					}
					if (that.commandList.length > 0) {
						that._execute(new modelbase.CompoundCommand(that.commandList));
					}
					that.close();
				};
				this.loButtonOK = new sap.ui.commons.Button({
					tooltip: resourceLoader.getText("txt_ok"),
					text: resourceLoader.getText("txt_ok"),
					enabled: false,
					press: dailogOkEvent
				});

				//adding ok and Cancel layour
				this.dialog.addButton(this.loButtonOK);
				this.dialog.addButton(loButtonCancel);

				this.update();

				//opeing the dailog 
				this.dialog.open();
			},

			close: function() {
				if (this.model) {
					this.model.destroy();
				}
				if (this.dialog) {
					this.dialog.destroy();
				}
			},

			update: function() {
				var i, j, elementData, hierarchyData;
				var enabled = false;
				var data = this.model.getData();
				for (i = 0; i < data.elements.length; i++) {
					elementData = data.elements[i];
					if (elementData.isSelected) {
						if (data.label || data.labelColumn || data.aggregationType || data.semanticType) {
							enabled = true;
							break;
						}
					}
				}
				for (i = 0; i < data.hierarchies.length; i++) {
					hierarchyData = data.hierarchies[i];
					if (hierarchyData.isSelected) {
						enabled = true;
						break;
					}
				}
				for (i = 0; i < data.elements.length; i++) {
					elementData = data.elements[i];
					for (var j = 0; j < elementData.dataSources.length; j++) {
						if (elementData.dataSources[j].inputName === elementData.dataSourceName) {
							elementData.dataSourceIcon = CalcViewEditorUtil.getInputImagePath(elementData.dataSources[j].input);
						}

					}
				}
				// validate hierarchy names

				for (i = 0; i < data.hierarchies.length; i++) {
					hierarchyData = data.hierarchies[i];
					hierarchyData.isError = undefined;
					if (hierarchyData.isSelected) {
						if (hierarchyData.newName.trim() === "") {
							hierarchyData.isError = "invalid";
							enabled = false;
						} else {
							// check duplicate element in listBox
							for (j = 0; j < data.hierarchies.length; j++) {
								if (data.hierarchies[j].isSelected && data.hierarchies[j] !== hierarchyData && data.hierarchies[j].newName === hierarchyData.newName) {
									hierarchyData.isError = "Duplicate";
									enabled = false;
								}
							}
							if (!hierarchyData.isError) {
								var result = CalcViewEditorUtil.checkRenameElement(hierarchyData.newName, hierarchyData.hierarchy, this.columnView.getDefaultNode(),
									this.columnView);
								if (result.message) {
									hierarchyData.isError = resourceLoader.getText(result.message, result.messageObjects);
									enabled = false;
								}
							}
						}
					}
				}

				this.model.updateBindings();
				this.loButtonOK.setEnabled(enabled);
			},

			getColumnsContainer: function() {
				var that = this;

				var verticalLayout = new sap.ui.commons.layout.VerticalLayout();

				var semanticsMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["15%", "25%", "30%", "30%"]
				});

				// create a simple CheckBox
				var labelCB = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("tit_label"),
					// tooltip: 'Newsletter checkbox',
					checked: "{/label}",
					change: function() {
						that.update();
					}
				});
				var labelColumnCB = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("tit_label_column"),
					// tooltip: 'Newsletter checkbox',
					checked: "{/labelColumn}",
					change: function() {
						that.update();
					}
				});
				var aggregationTypeCB = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("tit_aggregation_type"),
					// tooltip: 'Newsletter checkbox',
					checked: "{/aggregationType}",
					change: function() {
						that.update();
					}
				});
				if (this.columnView.dataCategory === "DIMENSION") {
					aggregationTypeCB.setEnabled(false);
				}
				var semanticTypeCB = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("tit_semantic_type"),
					// tooltip: 'Newsletter checkbox',
					checked: "{/semanticType}",
					change: function() {
						that.update();
					}
				}); 

				semanticsMatrixLayout.createRow(aggregationTypeCB, semanticTypeCB);

				verticalLayout.addContent(semanticsMatrixLayout);

				var table = new sap.ui.table.Table({
					visibleRowCount: 10,
					width: "100%",
					selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly
					//visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto

				});

				table.addStyleClass("calcViewTableInDialog");

				table.bindRows("/elements");

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.TriStateCheckBox({
						selectionState: "{/allSelected}",
						change: function() {
							var data = that.model.getData();
							var i;
							for (i = 0; i < data.elements.length; i++) {
								var elementData = data.elements[i];
								elementData.isSelected = this.getSelectionState() !== "Unchecked";
							}
							that.update();
						}
					}),
					template: new sap.ui.commons.CheckBox({
						checked: "{isSelected}",
						change: function(event) {
							var data = that.model.getData();
							var allSelected = true;
							var mixed = false;
							for (var i = 0; i < data.elements.length; i++) {
								var elementData = data.elements[i];
								if (elementData.isSelected) {
									mixed = true;
								} else {
									allSelected = false;
								}
							}
							if (allSelected) {
								data.allSelected = "Checked";
							} else if (mixed) {
								data.allSelected = "Mixed";
							} else {
								data.allSelected = "Unchecked";
							}
							that.update();
						}
					}),
					width: "50px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						//text: resourceLoader.getText("txt_source_model")
						text: resourceLoader.getText("tit_columns")
					}),
					template: new sap.ui.commons.Label({
						text: "{elementName}",
						icon: "{icon}"
					}),
					width: "250px"
				}));

				var oImage = new sap.ui.commons.Image({
					src: "{dataSourceIcon}"
				});

				var dataSourceItemTemplate = new sap.ui.core.ListItem({
					text: "{inputName}",
					icon: "{inputIcon}"
				});

				var dataSourceListBox = new sap.ui.commons.ListBox({
					displayIcons: true
				});

				var dataSourceTemplate = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.IconDropdownBox({
					icon: oImage,
					listBox: dataSourceListBox,
					editable: "{multipleSource}",
					value: "{dataSourceName}",
					valueState: {
						path: "multipleSource",
						formatter: function(multipleSource) {
							if (multipleSource) {
								return sap.ui.core.ValueState.Warning;
							}
							return sap.ui.core.ValueState.None;
						}
					},
					tooltip: {
						path: "multipleSource",
						formatter: function(multipleSource) {
							if (multipleSource) {
								return resourceLoader.getText("txt_multiple_data_sources");
							}
						}
					},
					change: function(event) {
						that.update();
					}
				}).addStyleClass("counterProperties");

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						// text: resourceLoader.getText("txt_source_column")
						text: resourceLoader.getText("txt_data_sources")
					}),
					template: dataSourceTemplate.bindItems("dataSources", dataSourceItemTemplate),
					width: "250px"
				}));

				verticalLayout.addContent(table);

				var overwriteCB = new sap.ui.commons.CheckBox({
					text: resourceLoader.getText("txt_overwrite_semantics_already_defined"),
					// tooltip: 'Newsletter checkbox',
					checked: "{/overwrite}",
					//change: function() {}
				});
				verticalLayout.addContent(overwriteCB);

				return verticalLayout;
			},

			getHierarchiesContainer: function() {

				var that = this;

				var table = new sap.ui.table.Table({
					visibleRowCount: 10,
					width: "100%",
					selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly
					//visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto

				});

				table.addStyleClass("calcViewTableInDialog");

				table.bindRows("/hierarchies");

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.TriStateCheckBox({
						selectionState: "{/allHierarchiesSelected}",
						change: function() {
							var data = that.model.getData();
							var i;
							for (i = 0; i < data.hierarchies.length; i++) {
								var hierarchyData = data.hierarchies[i];
								hierarchyData.isSelected = this.getSelectionState() !== "Unchecked";
							}
							that.update();
						}
					}),
					template: new sap.ui.commons.CheckBox({
						checked: "{isSelected}",
						change: function(event) {
							var data = that.model.getData();
							var allSelected = true;
							var mixed = false;
							for (var i = 0; i < data.hierarchies.length; i++) {
								var hierarchyData = data.hierarchies[i];
								if (hierarchyData.isSelected) {
									mixed = true;
								} else {
									allSelected = false;
								}
							}
							if (allSelected) {
								data.allHierarchiesSelected = "Checked";
							} else if (mixed) {
								data.allHierarchiesSelected = "Mixed";
							} else {
								data.allHierarchiesSelected = "Unchecked";
							}
							that.update();
						}
					}),
					width: "50px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_hierarchies")

					}),
					template: new sap.ui.commons.Label({
						text: "{hierarchyName}",
						tooltip: "{hierarchyName}",
						icon: "{icon}"
					}),
					width: "150px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_new_name")
					}),
					template: new sap.ui.commons.TextField({
						value: "{newName}",
						tooltip: "{isError}",
						valueState: {
							parts: ["isError"],
							formatter: function(isError) {
								if (isError) {
									return sap.ui.core.ValueState.Error;
								}
								return sap.ui.core.ValueState.None;
							}
						},
						change: function(event) {
							that.update();
						}
					}),
					width: "150px"
				}));

				table.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_data_sources")

					}),
					template: new sap.ui.commons.Label({
						text: {
							path: "dataSource",
							formatter: function(dataSource) {
								if (dataSource) {
									return CalcViewEditorUtil.getInputName(dataSource);
								}

							}
						},
						tooltip: {
							path: "dataSource",
							formatter: function(dataSource) {
								if (dataSource) {
									return CalcViewEditorUtil.getInputName(dataSource);
								}

							}
						},
						icon: {
							path: "dataSource",
							formatter: function(dataSource) {
								if (dataSource) {
									return CalcViewEditorUtil.getInputImagePath(dataSource);
								}

							}
						}
					}),
					//template: dataSourceTemplate.bindItems("dataSources", dataSourceItemTemplate),
					width: "150px"
				}));

				return table;
			},

			createModel: function() {
				var that = this;
				var viewNode = this.columnView.getDefaultNode();

				var data = {
					allSelected: "Unchecked",
					allHierarchiesSelected: "Unchecked",
					elements: [],
					hierarchies: [],
					label: true,
					labelColumn: true,
					aggregationType: this.columnView.dataCategory === "DIMENSION" ? false : true,
					semanticType: true,
					overwrite: false
				};
				if (this.selectedInput) {
					// call from mapping editor
					if (this.selectedInput.getSource()) {
						this.selectedInput.getSource().elements.foreach(function(element) {
							that.elementInSemantics = undefined;
							that._getElementInSemantics(element, that.selectedInput, that.viewNode);
							if (that.elementInSemantics) {
								data.elements.push(that._createElementModel(that.elementInSemantics, viewNode));
							}
						});

						if (this.selectedInput.getSource()) {
							if (this.selectedInput.getSource().inlineHierarchies) {
								this.selectedInput.getSource().inlineHierarchies.foreach(function(hierarchy) {
									if (that._canCreateHierarchyModel(hierarchy, that.selectedInput)) {
										data.hierarchies.push(that._createHierarchyModel(hierarchy, that.selectedInput));
									}
								});
							}
						}
					}

				} else {
					// call from semantics node
					viewNode.elements.foreach(function(element) {
						if (!element.measureType && !element.calculationDefinition) {
							data.elements.push(that._createElementModel(element, viewNode));
						}
					});

					this.columnView.viewNodes.foreach(function(node) {
						if (!node.isStarJoin()) {
							node.inputs.foreach(function(input) {
								if (input.getSource()) {
									if (input.getSource().inlineHierarchies) {
										input.getSource().inlineHierarchies.foreach(function(hierarchy) {
											if (that._canCreateHierarchyModel(hierarchy, input)) {
												data.hierarchies.push(that._createHierarchyModel(hierarchy, input));
											}
										});
									}
								}
							});
						}
					});
					var allSelected = true;
					var mixed = false;
					for (var i = 0; i < data.elements.length; i++) {
						var elementData = data.elements[i];
						if (elementData.isSelected) {
							mixed = true;
						} else {
							allSelected = false;
						}
					}
					if (allSelected) {
						data.allSelected = "Checked";
					} else if (mixed) {
						data.allSelected = "Mixed";
					} else {
						data.allSelected = "Unchecked";
					}
				}
				return data;
			},

			_createElementModel: function(element, viewNode) {
				var that = this;
				var isSelected = false;
				if (this.selectedElements && this.selectedElements.indexOf(element.name) !== -1) {
					isSelected = true;
				}
				var dataSources = [];
				if (this.selectedInput) {
					dataSources.push({
						input: this.selectedInput,
						inputIcon: CalcViewEditorUtil.getInputImagePath(this.selectedInput),
						inputName: CalcViewEditorUtil.getInputName(this.selectedInput)
					});
				} else {
					that._getDataSources(element, dataSources, viewNode);
				}
				return {
					element: element,
					elementName: element.name,
					icon: element.aggregationBehavior === "none" ? resourceLoader.getImagePath("Dimension.png") : resourceLoader.getImagePath(
						"Measure.png"),
					isSelected: isSelected,
					dataSources: dataSources,
					dataSource: dataSources.length > 0 ? dataSources[0].input : undefined,
					dataSourceName: dataSources.length > 0 ? dataSources[0].inputName : undefined,
					//dataSourceIcon: dataSources.length === 1 ? CalcViewEditorUtil.getInputImagePath(dataSources[0].input) : undefined,
					multipleSource: dataSources.length === 1 ? false : true
				};
			},

			_createHierarchyModel: function(hierarchy, dataSource) {
				return {
					hierarchy: hierarchy,
					hierarchyName: hierarchy.name,
					newName: hierarchy.name,
					icon: hierarchy.type === "LeveledHierarchy" ? resourceLoader.getImagePath("Hierarchy.png") : resourceLoader.getImagePath(
						"ParentChildHierarchy.png"),
					isSelected: false,
					dataSource: dataSource,
					isError: undefined
				};
			},
			_canCreateHierarchyModel: function(hierarchy, input) {
				var that = this;
				var canCreate = true;

				var viewNode = this._getViewNode(input);

				hierarchy.levels.foreach(function(level) {
					if (canCreate) {
						that.elementInSemantics = undefined;
						that._getElementInSemantics(level.element, input, viewNode);
						if (!that.elementInSemantics) {
							canCreate = false;
						}
						that.elementInSemantics = undefined;
						that._getElementInSemantics(level.orderElement, input, viewNode);
						if (!that.elementInSemantics) {
							canCreate = false;
						}
					}
				});

				if (canCreate) {

					hierarchy.parentDefinitions.foreach(function(parentDefinition) {
						if (canCreate) {
							that.elementInSemantics = undefined;
							that._getElementInSemantics(parentDefinition.element, input, viewNode);
							if (!that.elementInSemantics) {
								canCreate = false;
							}
						}
						if (canCreate) {
							that.elementInSemantics = undefined;
							that._getElementInSemantics(parentDefinition.parent, input, viewNode);
							if (!that.elementInSemantics) {
								canCreate = false;
							}
						}
					});
				}

				if (canCreate) {
					hierarchy.edgeAttributes.foreach(function(edgeAttribute) {
						if (canCreate) {
							that.elementInSemantics = undefined;
							that._getElementInSemantics(edgeAttribute.element, input, viewNode);
							if (!that.elementInSemantics) {
								canCreate = false;
							}
						}
					});
				}
				if (canCreate) {
					hierarchy.siblingOrders.foreach(function(siblingOrder) {
						if (canCreate) {
							that.elementInSemantics = undefined;
							that._getElementInSemantics(siblingOrder.byElement, input, viewNode);
							if (!that.elementInSemantics) {
								canCreate = false;
							}
						}
					});
				}

				return canCreate;
			},

			_getViewNode: function(input) {
				var viewNode;
				this.columnView.viewNodes.foreach(function(node) {
					node.inputs.foreach(function(obj) {
						if (obj === input) {
							viewNode = node;
						}
					});
				});
				return viewNode;
			},

			_getDataSources: function(targetElement, dataSources, viewNode) {
				var that = this;
				viewNode.inputs.foreach(function(input) {
					input.mappings.foreach(function(mapping) {
						if (mapping.type === "ElementMapping" && mapping.targetElement === targetElement) {
							if (input.getSource().$$className === "Entity") {
								//if (dataSources.indexOf(input) === -1) {
								dataSources.push({
									input: input,
									inputIcon: CalcViewEditorUtil.getInputImagePath(input),
									inputName: CalcViewEditorUtil.getInputName(input)
								});
								//}
							} else if (input.getSource().$$className === "ViewNode") {
								that._getDataSources(mapping.sourceElement, dataSources, input.getSource());
							}
						}

					});
				});
			},

			_getElementInSemantics: function(element, input, viewNode) {
				var that = this;
				this.elementInSemantics = undefined;
				if (element) {
					input.mappings.foreach(function(mapping) {
						if (mapping.sourceElement === element) {
							var targetElement = mapping.targetElement;
							if (viewNode.isDefaultNode()) {
								that.elementInSemantics = targetElement;
								return;
							}
							that.columnView.viewNodes.foreach(function(node) {
								node.inputs.foreach(function(input2) {
									if (input2.getSource() === viewNode) {
										return that._getElementInSemantics(targetElement, input2, node);
									}
								});
							});
						}
					});
				}

			},

			_getSourceElement: function(element, sourceInput, viewNode) {
				var that = this;
				this.sourceElement = undefined;
				if (element && viewNode && sourceInput) {
					viewNode.inputs.foreach(function(input) {
						input.mappings.foreach(function(mapping) {
							if (mapping.type === "ElementMapping" && mapping.targetElement === element) {
								if (input.getSource().$$className === "Entity" && sourceInput === input) {
									that.sourceElement = mapping.sourceElement;
									return;
								} else if (input.getSource().$$className === "ViewNode") {
									that._getSourceElement(mapping.sourceElement, sourceInput, input.getSource());
								}
							}
						});
					});
				}

			},

			_propagteToSemantics: function(aElementData) {
				var i;
				var that = this;
				var data = that.model.getData();
				var propagateCommands = [];
				for (i = 0; i < aElementData.length; i++) {
					var element = aElementData[i].element;
					var sourceInput = aElementData[i].dataSource;
					var viewNode = that._getViewNode(sourceInput);

					this._getSourceElement(element, sourceInput, this.columnView.getDefaultNode());
					if (this.sourceElement) {
						if (data.labelColumn && element.aggregationBehavior === "none") {
							if (this.sourceElement.labelElement) {
								if (data.overwrite || element.labelElement === undefined) {
									this._getElementInSemantics(this.sourceElement.labelElement, sourceInput, viewNode);
									if (!this.elementInSemantics) {
										var commands = PropagateToSemantics.createPropagateCommands({
											columnView: that.columnView,
											viewNode: viewNode,
											input: sourceInput,
											element: this.sourceElement.labelElement
										});
										for (var i = 0; i < commands.length; i++) {
											propagateCommands.push(commands[i]);
										}
									}
								}

							}
						}
					}

				}
				if (propagateCommands.length > 0) {
					that._execute(new modelbase.CompoundCommand(propagateCommands));
				}

			},

			_takeOverSemantics: function(data, elementData) {
				var element = elementData.element;
				var viewNode = this.columnView.getDefaultNode();
				var sourceInput;
				//this.propagateCommands = [];
				if (elementData.dataSources.length === 1) {
					sourceInput = elementData.dataSources[0].input;
				} else {
					for (var i = 0; i < elementData.dataSources.length; i++) {
						if (elementData.dataSources[i].inputName === elementData.dataSourceName) {
							sourceInput = elementData.dataSources[i].input;
							break;
						}
					}
				}
				this._getSourceElement(element, sourceInput, viewNode);
				if (this.sourceElement) {
					var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes();
					if (data.label) {
						if (this.sourceElement.label && this.sourceElement.label.trim() !== "") {
							if (data.overwrite) {
								elementAttributes.objectAttributes.label = this.sourceElement.label;
								//this.commandList.push(new commands.ChangeElementPropertiesCommand(viewNode.name, element.name, elementAttributes));
							} else if (element.label === undefined || element.label.trim() === "" || (element.name === element.label && element.label !== this.sourceElement
								.label)) {
								elementAttributes.objectAttributes.label = this.sourceElement.label;
							}
						}
					}
					if (data.labelColumn && element.aggregationBehavior === "none") {
						if (this.sourceElement.labelElement) {
							if (data.overwrite || element.labelElement === undefined) {
								this._getElementInSemantics(this.sourceElement.labelElement, sourceInput, viewNode);
								if (this.elementInSemantics && (this.elementInSemantics.aggregationBehavior === "none" || !this.elementInSemantics.aggregationBehavior)) {
									elementAttributes.labelElement = this.elementInSemantics;
								}
							}

						}
					}
					if (data.aggregationType) {
						if (data.overwrite) {
							var aggregation = "none";
							if (this.sourceElement.measureType) {
								if (this.sourceElement.aggregationBehavior !== "none") {
									aggregation = CalcViewEditorUtil.getAggregationBehavior(this.sourceElement.inlineType.primitiveType);
								}
								if (aggregation) {
									elementAttributes.objectAttributes.engineAggregation = aggregation;
									aggregation = aggregation === "count" ? "sum" : aggregation;
									elementAttributes.objectAttributes.aggregationBehavior = aggregation;
								}
							} else if (this.sourceElement.aggregationBehavior) {
								aggregation = this.sourceElement.aggregationBehavior;
								elementAttributes.objectAttributes.engineAggregation = aggregation;
								aggregation = aggregation === "count" ? "sum" : aggregation;
								elementAttributes.objectAttributes.aggregationBehavior = aggregation;
							} else {
								elementAttributes.objectAttributes.engineAggregation = aggregation;
								aggregation = aggregation === "count" ? "sum" : aggregation;
								elementAttributes.objectAttributes.aggregationBehavior = aggregation;
							}
							elementAttributes.objectAttributes.engineAggregation = this.sourceElement.engineAggregation;
						}
					}
					if (data.semanticType) {
						if (this.sourceElement.inlineType && this.sourceElement.inlineType.semanticType) {
							if (data.overwrite || !element.inlineType.semanticType) {
								/*if (this.sourceElement.inlineType.semanticType === "amount" || this.sourceElement.inlineType.semanticType === "quantity") {
                                    if (this.sourceElement.unitCurrencyElement) {
                                        // check if unit/currency element exists in semantics node
                                        this._getElementInSemantics(this.sourceElement.unitCurrencyElement, sourceInput, viewNode);
                                        if (this.elementInSemantics && this.elementInSemantics.aggregationBehavior === "none") {
                                            elementAttributes.typeAttributes.semanticType = this.sourceElement.inlineType.semanticType;
                                            elementAttributes.unitCurrencyElement = this.elementInSemantics;
                                        }
                                    }
                                } else {*/
								elementAttributes.typeAttributes.semanticType = this.sourceElement.inlineType.semanticType;
								//}

							}
						}
					}
					// create command
					this.commandList.push(new commands.ChangeElementPropertiesCommand(viewNode.name, element.name, elementAttributes));
				}
			},

			copyHierarchy: function(hierarchyData) {
				var levels, parentDefinitions, edgeAttributes, siblingOrders, timeProperties;

				var hierarchy = hierarchyData.hierarchy;

				if (hierarchy.levels.count() > 0) {
					levels = [];
					hierarchy.levels.foreach(function(level) {
						levels.push({
							elementName: level.element ? level.element.name : undefined,
							levelType: level.levelType,
							orderElementName: level.orderElement ? level.orderElement.name : undefined,
							sortDirection: level.sortDirection
						});
					});
				}

				if (hierarchy.parentDefinitions.count() > 0) {
					parentDefinitions = [];
					hierarchy.parentDefinitions.foreach(function(parentDefinition) {
						parentDefinitions.push({
							elementName: parentDefinition.element ? parentDefinition.element.name : undefined,
							parentName: parentDefinition.parent ? parentDefinition.parent.name : undefined,
							stepParentNodeID: parentDefinition.stepParentNodeID,
							rootNodeAttributes: {
								constantValue: parentDefinition.rootNodeAttributes ? parentDefinition.rootNodeAttributes.constantValue : undefined
							}
						});
					});
				}

				if (hierarchy.edgeAttributes.count() > 0) {
					edgeAttributes = [];
					hierarchy.edgeAttributes.foreach(function(edgeAttribute) {
						edgeAttributes.push({
							elementName: edgeAttribute.element ? edgeAttribute.element.name : undefined
						});
					});
				}

				if (hierarchy.siblingOrders.count() > 0) {
					siblingOrders = [];
					hierarchy.siblingOrders.foreach(function(siblingOrder) {
						siblingOrders.push({
							byElementName: siblingOrder.byElement ? siblingOrder.byElement.name : undefined,
							direction: siblingOrder.direction
						});
					});
				}

				if (hierarchy.timeProperties) {
					timeProperties = {
						validFromElementName: hierarchy.timeProperties.validFromElement ? hierarchy.timeProperties.validFromElement.name : undefined,
						validToElementName: hierarchy.timeProperties.validToElement ? hierarchy.timeProperties.validToElement.name : undefined,
						fromParameterName: hierarchy.timeProperties.fromParameter ? hierarchy.timeProperties.fromParameter.name : undefined,
						toParameterName: hierarchy.timeProperties.toParameter ? hierarchy.timeProperties.toParameter.name : undefined,
						pointInTimeParameterName: hierarchy.timeProperties.pointInTimeParameter ? hierarchy.timeProperties.pointInTimeParameter.name : undefined
					};
				}

				var createCommand = new commands.AddHierarchyCommand({
					objectAttributes: {
						name: hierarchyData.newName,
						label: hierarchy.label,
						type: hierarchy.type,
						rootNodeVisibility: hierarchy.rootNodeVisibility,
						orphanedNodesHandling: hierarchy.orphanedNodesHandling,
						aggregateAllNodes: hierarchy.aggregateAllNodes,
						defaultMember: hierarchy.defaultMember,
						multipleParents: hierarchy.multipleParents,
						timeDependent: hierarchy.timeDependent,
						nodeStyle: hierarchy.nodeStyle,
						stepParentNodeID: hierarchy.stepParentNodeID
					},
					levels: levels,
					parentDefinitions: parentDefinitions,
					edgeAttributes: edgeAttributes,
					siblingOrders: siblingOrders,
					timeProperties: timeProperties
				});
				this.commandList.push(createCommand);
			}

		};

		return ExtractSemanticsDialog;
	});
