/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../../../util/ResourceLoader",
    "../../../viewmodel/commands",
    "../../CalcViewEditorUtil",
    "../../dialogs/ReferenceDialog",
    "../../actions/AutoLayout",
    "../../../base/modelbase",
    "../../ReplaceDS_N/ReplaceDataSourceAndNode",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/galilei"
], function(ResourceLoader, commands, CalcViewEditorUtil, ReferenceDialog, AutoLayout, modelbase, ReplaceDataSourceAndNode) {
	"use strict";

	var ViewModelEvents = commands.ViewModelEvents;
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	function isStarJoin(model) {
		if (model && model.viewNode && model.viewNode.isDefaultNode()) {
			return true;
		} else {
			return false;
		}
	}

	function isTableSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.galilei.ui.diagram.TableSymbol");
	}

	function isRowSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.galilei.ui.diagram.RowSymbol");
	}

	function isJoinSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.JoinSymbol");
	}

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	/**
	 * @class
	 * Defines the diagram editor extension for Analytics
	 * @name Editor
	 */
	var Editor = sap.galilei.ui.editor.defineDiagramEditorExtension({
		// Define class name
		fullClassName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.Editor",

		// Define properties
		properties: {
			TABLE_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.TableSymbol",
			COLUMN_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.ColumnSymbol",
			ROW_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.RowSymbol",
			JOIN_SYMBOL: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.join.diagram.ui.JoinSymbol",

			// Images folder
			imagesFolder: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images"
		},

		// Define methods
		methods: {

			dispose: function() {
				// remove property listeners
				for (var i = 0; i < this.diagram.symbols.length; i++) {
					var oSymbol = this.diagram.symbols.get(i);
					if (oSymbol.object) {
						var listeners = oSymbol.object.getPropertyListeners("displayName");
						for (var j = 0; j < listeners.length; j++) {
							if (listeners[j].editor === this.editor) {
								oSymbol.object.removePropertyListener(listeners[j], "displayName");
							}
						}
					}
				}
				this.editor.extensionParam.builder.dispose();
				sap.galilei.core.Event.unSubscribeAllTarget(this.editor);
			},

			onKeyDown: function(event) {
				if (event.ctrlKey && (event.which === 90 || event.which === 89)) { // cancel default undo redo
					return true;
				}
				return this._editor.defaultOnKeyDown(event);
			},

			/*
			 * Performs initialization of the extension.
			 * @function
			 * @name onInitialize
			 * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
			 */
			onInitialize: function() {
				var that = this;
				this._isExecutingCommand = false;

				// suppress registration for key events
				/*                if (!this.editor._onKeyDownCallback) {
                    this.editor._onKeyDownCallback = function() {};
                }*/

				// Add a drop shadow filter
				var addGlowFilter = function(oViewer, idFilter, sColor, nSize) {
					if (oViewer && idFilter) {
						var glowFilter = new sap.galilei.ui.common.style.Glow({
							id: idFilter,
							color: sColor,
							size: nSize
						});
						glowFilter.create(oViewer);
					}
				};

				// Adds a glow filter for highlight
				addGlowFilter(this.viewer, "filterSelectionGlow", "#7CAAC6", 3);

				this.addLinearGradient("entityFill", "#98c2f4", "#ffffff");
				this.addLinearGradient("dataFoundationFill", "#fbddc0", "#ffffff");

				//Subscribe symbol selection event
				var symbolSelectedHandler = function(event) {
					if (this.editor.extensionParam.builder.removeButton) {
						this.editor.extensionParam.builder.removeButton.setEnabled(false);
					}
					var selectedSymbol = event.selectedSymbols.length > 0 ? event.selectedSymbols[0] : null;
					// Handle Remove Button
					if (selectedSymbol) {
						if (isJoinSymbol(selectedSymbol)) {
							console.log("join selected");
						}
						if ((isTableSymbol(selectedSymbol) || isJoinSymbol(selectedSymbol)) && this.editor.extensionParam.builder.removeButton) {
							this.editor.extensionParam.builder.removeButton.setEnabled(true);
						}
					}
					// Update Prperties View
					if (this.editor.extensionParam.builder.propertiesPane) {
						if (selectedSymbol) {
							if (isJoinSymbol(selectedSymbol)) {
								this.editor.extensionParam.builder.propertiesPane.setProperty(that.model.viewNode.joins.get(selectedSymbol.joinKey));
							} else if (isTableSymbol(selectedSymbol)) {
								this.editor.extensionParam.builder.propertiesPane.setProperty(that.model.viewNode.inputs.get(selectedSymbol.inputKey));
							} else if (isRowSymbol(selectedSymbol)) {
								var input = that.model.viewNode.inputs.get(selectedSymbol.parentSymbol.inputKey);
								this.editor.extensionParam.builder.propertiesPane.setProperty(input.getSource().elements.get(selectedSymbol.object.name), input);
							} else {
								this.editor.extensionParam.builder.propertiesPane.setProperty(null);
							}

						} else {
							this.editor.extensionParam.builder.propertiesPane.setProperty(null);
						}

					}

				};
				sap.galilei.core.Event.subscribe("symbols.selection.changed", symbolSelectedHandler, this, this.editor);

				var symbolUnselectedHandler = function(event) {
					if (this._editor.selectedSymbols && this._editor.selectedSymbols.length === 0) {
						this.hideContextMenu();
					}

				};
				sap.galilei.core.Event.subscribe("symbol.unselected", symbolUnselectedHandler, this, this.editor);

				var contextMenuHandler = function(event) {
					this.showContextMenu(event);
				};
				sap.galilei.core.Event.subscribe("symbol.contextmenu", contextMenuHandler, this, this.editor);

				//Subscibe can delete event
				var canDeleteHandler = function(event) {
					var symbol = event.sourceSymbol;
					if (this._isExecutingCommand) {
						return;
					}
					if (isRowSymbol(symbol)) {
						event.cancel = true;
					} else if (symbol.isSelected) {
						var objects = [];
						if (isTableSymbol(symbol)) {
							var input = this.model.viewNode.inputs.get(symbol.inputKey);
							if (input) {
								objects.push(input);
							}
						}

						var callback = function(okPressed) {
							if (okPressed) {
								that._editor.deleteSymbol(symbol, true, false, false, true, false);
							}
						};
						var dialog = new ReferenceDialog({
							undoManager: that.model.viewModel.$getUndoManager(),
							element: objects,
							fnCallbackMessageBox: callback,
							isRemoveCall: true
						});
						dialog.openMessageDialog();
						event.cancel = true;

					}
				};
				sap.galilei.core.Event.subscribe("can.delete.symbol", canDeleteHandler, this, this.editor);

				if (this.model) {
					var inputCreatedHandler = this._createViewModelEventHandler(function(event) {
						if (that.model) {
							var input = that.model.viewNode.inputs.get(event.name);
							if (input) {
								var tableSymbol = that.editor.extensionParam.builder.createTable(input);
								if (tableSymbol) {
									that.registerSymbolEvents(tableSymbol);
									that._editor.drawSymbol(tableSymbol);
									this._registerTableEvents(tableSymbol);
								}
							}
						}
					});
					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_CREATED, inputCreatedHandler, this);

					var refreshTableHandler = this._createViewModelEventHandler(function(event) {
						if (that.editor._diagram && that.model) {
							var tableSymbol = that.editor._diagram.symbols.selectObject({
								"inputKey": event.name
							});
							var input = that.model.viewNode.inputs.get(event.name);

							that.editor.extensionParam.builder.updateTable(tableSymbol, input);
							that.toggleExpanded(tableSymbol, true);
							that.toggleExpanded(tableSymbol, true);
							//that.unregisterSymbolEvents(tableSymbol);
							//that.editor.deleteSymbol(tableSymbol);
						}
					});
					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_LOADED, refreshTableHandler, this);

					var inputDeletedHandler = this._createViewModelEventHandler(function(event) {
						if (that.editor._diagram) {
							var tableSymbol = that.editor._diagram.symbols.selectObject({
								"inputKey": event.name
							});
							if (tableSymbol) {
								that.unregisterSymbolEvents(tableSymbol);
								that.editor.deleteSymbol(tableSymbol);
							}
						}
					});

					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.INPUT_DELETED, inputDeletedHandler, this);

					var joinCreatedHandler = this._createViewModelEventHandler(function(event) {
						if (that.model) {
							var join = that.model.viewNode.joins.get(event.name);
							if (join) {
								var aJoinSymbols = that.editor.extensionParam.builder.createJoin(join);
								if (aJoinSymbols && aJoinSymbols.length) {
									for (var count = 0; count < aJoinSymbols.length; count++) {
										that.registerSymbolEvents(aJoinSymbols[count]);
										that._editor.drawSymbol(aJoinSymbols[count]);
										this._registerJoinEvents(aJoinSymbols[count]);
									}
								}
							}
						}
					});
					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CREATED, joinCreatedHandler, this);

					var joinDeletedHandler = this._createViewModelEventHandler(function(event) {
						if (that.editor._diagram) {
							var joinSymbol = that.editor._diagram.symbols.selectObject({
								"joinKey": event.name
							});
							if (joinSymbol) {
								that.unregisterSymbolEvents(joinSymbol);
								that.editor.deleteSymbol(joinSymbol);
							}
						}
					});
					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_DELETED, joinDeletedHandler, this);

					var joinChangedHandler = this._createViewModelEventHandler(function(event) {
						if (that.editor._diagram) {

							if (event.source._typeEvent == "Swap") {
								that._isExecutingCommand = true;
								that.editor.deleteSymbols(that.editor.diagram.getAllSymbols());
								that._editor.extensionParam.builder._initialBuild();
								for (var i = 0; i < that.diagram.symbols.length; i++) {
									var oSymbol = that.diagram.symbols.get(i);
									that.registerSymbolEvents(oSymbol);
									if (isTableSymbol(oSymbol)) {
										that._registerTableEvents(oSymbol);
									} else if (isJoinSymbol(oSymbol)) {
										that._registerJoinEvents(oSymbol);
									}
								}
								that.autolayout(that.diagram, true);
								that._editor.drawAllSymbols();
								var joinSymbol = that.editor._diagram.symbols.selectObject({
									"joinKey": event.name
								});
								setTimeout(function() { // asychronous refresh
									that.editor.selectSymbol(joinSymbol);
								}, 10);
								that._isExecutingCommand = false;

							} else {

								var aJoinSymbols = that.editor._diagram.symbols.selectAllObjects({
									"joinKey": event.name
								});
								var oJoin = that.model.viewNode.joins.get(event.name);

								if (oJoin && aJoinSymbols && aJoinSymbols.length !== undefined) {

									var leftElements = oJoin.leftElements.toArray();
									var rightElements = oJoin.rightElements.toArray();
									if (leftElements.length !== aJoinSymbols.length) { // Columns modified 
										// delete join symbols
										that.editor.deleteSymbols(aJoinSymbols);
										var aJoinSymbols = that.editor.extensionParam.builder.createJoin(oJoin);
										if (aJoinSymbols && aJoinSymbols.length) {
											for (var count = 0; count < aJoinSymbols.length; count++) {
												that.registerSymbolEvents(aJoinSymbols[count]);
												that._editor.drawSymbol(aJoinSymbols[count]);
												this._registerJoinEvents(aJoinSymbols[count]);
											}
										}

									} else { // update join symbols
										for (var j = 0; j < aJoinSymbols.length; j++) {
											var oSymbol = aJoinSymbols.get(j);
											oSymbol.object.joinCardinality = oJoin.cardinality;
											oSymbol.object.joinType = oJoin.joinType;
										}
									}

								}
							}
							/* if (joinSymbol) {
                                that.unregisterSymbolEvents(joinSymbol);
                                that.editor.deleteSymbol(joinSymbol);
                            }*/
						}
					});
					this.model.viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CHANGED, joinChangedHandler, this);

					var _reloadContent = function(event) {

						if (that.editor._diagram) {

							that.model.viewNode.inputs.foreach(function(input) {
								//for the data sources that once had partition specs, the boolean will be defined 
								//and by the time this is called, the partition specs are cleared and so the boolean is false
								if (typeof input.getSource().hasPartitionSpecifications === 'boolean' && !input.getSource().hasPartitionSpecifications) {
									var inputSymbol = that.diagram.symbols.selectObject({
										"inputKey": input.$getKeyAttributeValue()
									});
									if (inputSymbol && !that.model.viewModel.isPerformanceAnalysis) {
										inputSymbol.imagePath = CalcViewEditorUtil.getInputImagePath(input, that.model.viewModel.isPerformanceAnalysis);
										for (var i = 0; i < inputSymbol.object.columns.length; i++) {
											var column = inputSymbol.object.columns.get(i);
											if (column.firstPartitionIcon !== TRANSPARENT_IMG) {
												column.firstPartitionIcon = TRANSPARENT_IMG;
											}
											if (column.secondPartitionIcon !== TRANSPARENT_IMG) {
												column.secondPartitionIcon = TRANSPARENT_IMG;
											}
										}

									}
								}
							});

						}
					};

					this._reloadHandler = this._createViewModelEventHandler(_reloadContent);
					this.model.viewModel.columnView.$getEvents().subscribe(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED, this._reloadHandler, this);
				}

				// Register events to existing symbols
				if (this.diagram) {
					for (var i = 0; i < this.diagram.symbols.length; i++) {
						var oSymbol = this.diagram.symbols.get(i);
						if (isTableSymbol(oSymbol)) {
							this._registerTableEvents(oSymbol);
						} else if (isJoinSymbol(oSymbol)) {
							this._registerJoinEvents(oSymbol);
						}
					}
				}
			},

			_createViewModelEventHandler: function(func, thisArg) {
				var that = this;
				return function(event) {
					if (!that._isExecutingCommand) {
						that._isExecutingCommand = true;
						try {
							return func.call(thisArg ? thisArg : that, event, that);
						} finally {
							that._isExecutingCommand = false;
						}
					}
				};
			},

			_execute: function(command) {
				var wasExecutingCommand = this._isExecutingCommand;
				this._isExecutingCommand = true;
				try {
					return this.model.viewModel.$getUndoManager().execute(command);
				} finally {
					this._isExecutingCommand = wasExecutingCommand;
				}
			},

			_registerTableEvents: function(oSymbol) {
				var that = this;
				var viewNode = this.model.viewNode;
				var inputKey = oSymbol.inputKey;

				var deleteSymbolHandler = function(event) {
					if (event.sourceSymbol === oSymbol) {
						var input = viewNode.inputs.get(inputKey);
						if (input) {
							if (!that._isExecutingCommand) {
								var command = new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode.name + '"].inputs["' + inputKey + '"]');
								that._execute(command);
							}
							sap.galilei.core.Event.unSubscribeScope("delete.symbol", oSymbol);
						}
					}
				};

				sap.galilei.core.Event.subscribe("delete.symbol", deleteSymbolHandler, oSymbol, this.editor);

				oSymbol.object.addPropertyListener({
						onPropertyChanged: function(event) {
							var input = that.model.viewNode.inputs.get(oSymbol.inputKey);
							that.editor.extensionParam.builder.updateTable(oSymbol, input);
							that.toggleExpanded(oSymbol, true);
							that.toggleExpanded(oSymbol, true);
						},
						editor: this.editor // marker to identify own listeners on dispose
					},
					"search"
				);

				// Update Table layout : should find a better solution
				oSymbol.resize(250, this.height);
				that.toggleExpanded(oSymbol, true);
				that.toggleExpanded(oSymbol, true);
			},

			_registerJoinEvents: function(oSymbol) {
				var that = this;
				var viewNode = this.model.viewNode;
				var joinKey = oSymbol.joinKey;
				var sourceColumnName = oSymbol.object.sourceColumn.name;
				var targetColumnName = oSymbol.object.targetColumn.name;

				var deleteSymbolHandler = function(event) {
					if (event.sourceSymbol === oSymbol) {
						var oJoin = viewNode.joins.get(joinKey);
						if (oJoin) {
							if (!that._isExecutingCommand) {
								var commandsList = [];
								var oLeftColumn = oJoin.leftInput.getSource().elements.get(sourceColumnName);
								var oRightColumn = oJoin.rightInput.getSource().elements.get(targetColumnName);
								var oLeftInput = oJoin.leftInput;

								if (oJoin.leftElements.count() === 1) { // last join -> remove join object
									commandsList.push(new modelbase.DeleteCommand('columnView.viewNodes["' + viewNode.name + '"].joins["' + joinKey + '"]'));
									//that._execute(command);
								} else {
									commandsList.push(new commands.ChangeJoinPropertiesCommand(viewNode.name, oJoin.$getKeyAttributeValue(), {
										leftColumn: oLeftColumn,
										rightColumn: oRightColumn,
										removeColumn: true
									}));
								}
								if (viewNode.isStarJoin()) {
									// restore private element if required
									var restoreElement = true;
									oLeftInput.mappings.foreach(function(mapping) {
										if (mapping.sourceElement === oLeftColumn) {
											restoreElement = false;
										}
									});
									if (restoreElement) {
										// add element to output
										var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(oLeftColumn);
										elementAttributes.objectAttributes.name = CalcViewEditorUtil.getUniqueNameForElement(oLeftColumn.name, viewNode, []);
										elementAttributes.objectAttributes.label = elementAttributes.objectAttributes.name;
										elementAttributes.mappingAttributes = {
											sourceName: oLeftColumn.name,
											targetName: elementAttributes.objectAttributes.name,
											type: "ElementMapping"
										};
										elementAttributes.input = oLeftInput;
										commandsList.push(new commands.AddElementCommand(viewNode.name, elementAttributes));
									}
								}
								that._execute(new modelbase.CompoundCommand(commandsList));
								that.model.viewModel.columnView.$getEvents().publish(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
							}

							sap.galilei.core.Event.unSubscribeScope("delete.symbol", oSymbol);
						}
					}
				};
				that.model.viewModel.columnView.$getEvents().publish(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
				sap.galilei.core.Event.subscribe("delete.symbol", deleteSymbolHandler, oSymbol, this.editor);
			},

			postCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkSymbol) {
				var that = this;
				if (this.editor.defaultPostCreateLinkSymbol) {
					this.editor.defaultPostCreateLinkSymbol(oSourceSymbol, oTargetSymbol, oLinkSymbol);
				}

				if (isJoinSymbol(oLinkSymbol)) {
                    var oTableSymbol = true;
					if (isStarJoin(this.model)) {
						if (!oSourceSymbol.parentSymbol.isDataFoundtion) { // Swap left and right columns
							this.swapJoinColumns(oSourceSymbol, oTargetSymbol, oLinkSymbol);
						} else {
							// To Refresh edge
						oTableSymbol = oSourceSymbol.parentSymbol;
                        this.toggleExpanded(oTableSymbol, true);
                        this.toggleExpanded(oTableSymbol, true);
						}
					} else if (oLinkSymbol.sourceSymbol.parentSymbol.inputKey > oLinkSymbol.targetSymbol.parentSymbol.inputKey) {
						this.swapJoinColumns(oSourceSymbol, oTargetSymbol, oLinkSymbol);
					} else {
						// To Refresh edge
					oTableSymbol = oSourceSymbol.parentSymbol;
                    this.toggleExpanded(oTableSymbol, true);
                    this.toggleExpanded(oTableSymbol, true);
					}

					var viewNode = that.model.viewNode;
					if (viewNode) {
						var oLeftInput = viewNode.inputs.get(oLinkSymbol.sourceSymbol.parentSymbol.inputKey);
						var oRightInput = viewNode.inputs.get(oLinkSymbol.targetSymbol.parentSymbol.inputKey);
						if (oLeftInput && oRightInput) {
							var oJoin = CalcViewEditorUtil.getJoin(viewNode, oLeftInput, oRightInput);
							var oLeftColumn = oLeftInput.getSource().elements.get(oLinkSymbol.sourceSymbol.object.name);

							var oRightColumn = oRightInput.getSource().elements.get(oLinkSymbol.targetSymbol.object.name);
							if (oLeftColumn && oRightColumn) {
								var updateJoinSymbol, executeUpdate, getCommand;

								getCommand = function() {
									if (oJoin) {
										// update join - add columns
										return new commands.ChangeJoinPropertiesCommand(viewNode.name, oJoin.$getKeyAttributeValue(), {
											leftColumn: oLeftColumn,
											rightColumn: oRightColumn
										});
									} else {
										//create new join
										var joinAttributes = {
											objectAttributes: {
												joinType: viewNode.isStarJoin() ? "referential" : "inner"
											},
											leftInput: oLeftInput,
											rightInput: oRightInput,
											leftColumn: oLeftColumn,
											rightColumn: oRightColumn
										};
										return new commands.CreateJoinCommand(viewNode.name, joinAttributes);
									}
								};

								executeUpdate = function() {
									var result = that._execute(getCommand());
									if (result && result.length) {
										oJoin = result[result.length - 1];
									}
									oJoin = result
									updateJoinSymbol();
								};

								updateJoinSymbol = function() {
									if (oLinkSymbol.object.showWarning === undefined) {
										oLinkSymbol.object.showWarning = false;
									}
									oLinkSymbol.joinKey = oJoin.$getKeyAttributeValue();
									// update cardinality and join type
									oLinkSymbol.object.joinCardinality = oJoin.cardinality;
									oLinkSymbol.object.joinType = oJoin.joinType;
									setTimeout(function() { // asychronous refresh
										that.editor.selectSymbol(oLinkSymbol);
									}, 10);
								};

								if (viewNode.isStarJoin()) {

									var privateElements = [];
									var removeElementCommands = [];

									oLeftInput.mappings.foreach(function(mapping) {
										if (mapping.sourceElement === oLeftColumn) {
											privateElements.push(mapping.targetElement);
										}
									});
									if (privateElements.length > 0) {
										// Show confirmation dialog
										var callback = function(okPressed, removeCommands) {
											if (okPressed) {
												// delete private columns
												removeElementCommands = removeCommands;
												removeElementCommands.push(getCommand());

												var result = that._execute(new modelbase.CompoundCommand(removeElementCommands));
												if (result && result.length) {
													oJoin = result[result.length - 1];
												}
												updateJoinSymbol();
											} else {
												that._editor.deleteSymbol(oLinkSymbol, true, false, false, true, false);
											}
										};
										var dialog = new ReferenceDialog({
											element: privateElements,
											fnCallbackMessageBox: callback,
											isRemoveCall: true
										});
										dialog.openMessageDialog();

									} else {
										executeUpdate();
									}

								} else {
									executeUpdate();
								}
							}
						}
					}

					//oLinkSymbol.drawSymbol(this.viewer, this.transitionDefinition);
					this._registerJoinEvents(oLinkSymbol);
				}
			},

			swapJoinColumns: function(oSourceSymbol, oTargetSymbol, oLinkSymbol) {

				var sourceColumn = oLinkSymbol.object.sourceColumn;
				var sourceTable = oLinkSymbol.object.sourceTable;
				var targetColumn = oLinkSymbol.object.targetColumn;
				var targetTable = oLinkSymbol.object.targetTable;

				oLinkSymbol.object.sourceColumn = targetColumn;
				oLinkSymbol.object.targetColumn = sourceColumn;
				oLinkSymbol.object.sourceTable = targetTable;
				oLinkSymbol.object.targetTable = sourceTable;

				oLinkSymbol.object.source = targetColumn;
				oLinkSymbol.object.target = sourceColumn;

				oLinkSymbol.sourceSymbol = oTargetSymbol;
				oLinkSymbol.targetSymbol = oSourceSymbol;


                var oTableSymbol = oSourceSymbol.parentSymbol;
                this.toggleExpanded(oTableSymbol, true);
                this.toggleExpanded(oTableSymbol, true);
			},

			postCreateSymbol: function(oSymbol) {
				var editor = this.editor;
				editor.defaultPostCreateSymbol(oSymbol);

				if (isTableSymbol(oSymbol)) {
					this._registerTableEvents(oSymbol);
				}
			},

			/**
			 * Checks whether a link symbol can be created between the source symbol and the target symbol using the link symbol tool definition.
			 * @function
			 * @name canCreateLinkSymbol
			 * @memberOf sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Editor
			 * @param {Symbol} oSourceSymbol The source symbol.
			 * @param {Symbol} oTargetSymbol The target symbol.
			 * @param {Object} oLinkTool The link symbol tool definition.
			 * @returns {boolean} true if the link symbol can be created.
			 */
			canCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkTool) {

				if (oSourceSymbol === oTargetSymbol) { //disable join to same column
					return false;
				}
				if (oSourceSymbol && oTargetSymbol) {
					if (oSourceSymbol.parentSymbol === oTargetSymbol.parentSymbol) { //disable self join
						return false;
					}
					if (isStarJoin(this.model)) {
						if (oSourceSymbol.parentSymbol.isDataFoundtion || oTargetSymbol.parentSymbol.isDataFoundtion) {
							return true;
						} else {
							return false;
						}
					} else {
						// checck spatial join
						var join = this.model.viewNode.joins.get(0);
						if (join && join.spatialJoinProperties.count() === 1) {
							// Multi-join is not supported for Spatial join 
							return false;
						}
					}
					// Check if Join already exists
					var bJoinExist = false;
					this.model.viewNode.joins.foreach(function(oJoin) {
						if ((oJoin.leftInput.$getKeyAttributeValue() === oSourceSymbol.parentSymbol.inputKey && oJoin.rightInput.$getKeyAttributeValue() ===
								oTargetSymbol.parentSymbol.inputKey) ||
							(oJoin.leftInput.$getKeyAttributeValue() === oTargetSymbol.parentSymbol.inputKey && oJoin.rightInput.$getKeyAttributeValue() ===
								oSourceSymbol.parentSymbol.inputKey)) {
							if (oJoin.leftElements.get(oSourceSymbol.object.name + "$$" + oTargetSymbol.object.name)) {
								bJoinExist = true;
							} else if (oJoin.leftElements.get(oTargetSymbol.object.name + "$$" + oSourceSymbol.object.name)) {
								bJoinExist = true;
							}
						}

					});
					if (bJoinExist) {
						return false;
					}
				}

				return true;
			},

			canAttachSymbol: function(oParent, oSymbol, oAttachParam) {
				if (isTableSymbol(oParent) || isTableSymbol(oSymbol)) {
					return false;
				}
				return this.editor.defaultCanAttachSymbol(oParent, oSymbol, oAttachParam);
			},

			registerSymbolEvents: function(oSymbol) {
				this.editor.defaultRegisterSymbolEvents(oSymbol);
			},

			unregisterSymbolEvents: function(oSymbol) {
				this.editor.defaultUnregisterSymbolEvents(oSymbol);
			},

			/**
			 * Defines a gradient.
			 * @function
			 * @name addLinearGradient
			 * @memberOf sap.modeling.dbSchema.ui.DiagramEditorExtension#
			 */
			addLinearGradient: function(sGradientId, sStartColor, sStopColor) {
				var oGradient = new sap.galilei.ui.common.style.LinearGradient({
					id: sGradientId,
					stops: [{
						offset: "5%",
						color: sStartColor
                    }, {
						offset: "85%",
						color: sStopColor
                    }]
				});

				oGradient.createGradient(this.viewer);
			},

			/**
			 * Gets the tools definition. The definition is an array of tool definition.
			 * Create node symbol tool definition the parameters:
			 * name: <(optional) The tool name>,
			 * type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool
			 * symbolClass: <The symbol class qualified name>
			 * symbolParam: <(optional) The symbol property values>
			 * objectClass: < (optional) The object class qualified name>
			 * objectParam:  <(optional) The object property values>
			 * objectReference: <(optional) The name of the reference where the object should be added>
			 * smallIcon: <The small icon URL, usually 16x16>
			 * largeIcon: <(optional) The large icon URL, usually 32x32>
			 * cursor: <(optional) The cursor URL, usually 32x32>
			 *
			 * Create link symbol tool definition the parameters:
			 * name: <The tool name>
			 * type: sap.galilei.ui.editor.tool.Types.createLinkSymbolTool
			 * linksDefinition: <Array of supported link symbols>
			 * {
			 * sourceSymbol: <The source symbol class qualified name>
			 * targetSymbol: <The target symbol class qualified name>
			 * linkSymbolClass: <The link symbol class qualified name>
			 * linkSymbolParam: <(optional) The link symbol property values>
			 * linkObjectClass: < (optional) The link object class qualified name>
			 * linkObjectParam:  <(optional) The link object property values>
			 * linkObjectReference: <(optional) The name of the reference where the link object should be added>
			 * }
			 * smallIcon: <The small icon URL, usually 16x16>
			 * largeIcon: <(optional) The large icon URL, usually 32x32>
			 * cursor: <The cursor URL>
			 *
			 * Normal tool definition the parameters:
			 * name: <The tool name>
			 * type: sap.galilei.ui.editor.tool.Types.tool
			 * canExecute: function (oParam), where oParam contains editor, diagram, symbol
			 * execute: function (oParam)
			 * smallIcon: <The small icon URL, usually 16x16>
			 * largeIcon: <(optional) The large icon URL, usually 32x32>
			 * cursor: <The cursor URL>
			 * @function
			 * @name getToolsDefinition
			 * @memberOf sap.modeling.dbSchema.ui.DiagramEditorExtension#
			 * @param {Array} The tools definition.
			 */
			getToolsDefinition: function() {
				var oToolsDef;

				oToolsDef = [
                    // Join tool
					{
						name: this.JOIN_SYMBOL,
						type: sap.galilei.ui.editor.tool.Types.createLinkSymbolTool,
						smallIcon: "Connection.gif",
						cursor: "JoinCursor.png",
						linksDefinition: [{
							sourceSymbol: this.ROW_SYMBOL,
							targetSymbol: this.ROW_SYMBOL,
							linkSymbolClass: this.JOIN_SYMBOL
							//linkObjectParam: this.JOIN_OBJECT_PARAM
                        }]
                    }
                ];

				this.addImagesFolder(oToolsDef);
				return oToolsDef;
			},

			/**
			 * Gets the context button pad definition for symbol.
			 * @function
			 * @name getContextButtonPad
			 * @memberOf sap.modeling.dbSchema.ui.DiagramEditorExtension#
			 * @param {Object} oSymbol The symbol.
			 * @return {Array} context pad buttons.
			 */
			getContextButtonPad: function(oSymbol) {
				var aButtons = [];

				if (oSymbol) {
					switch (oSymbol.classDefinition.qualifiedName) {
						case this.ROW_SYMBOL:
							aButtons.push({
								toolName: this.JOIN_SYMBOL
							});
							break;
					}
				}

				this.addImagesFolder(aButtons);
				return aButtons;
			},

			canSupportInPlaceEditing: function(oSymbol, aClientPoint) {
				if (isTableSymbol(oSymbol)) {
					if (oSymbol.y + 20 > aClientPoint[1]) { // table name should not be editable.
						return false;
					}
					return true;
				}
				return false;
			},

			/**
			 * Checks whether a symbol can be insert on a link symbol at the position aPoint.
			 * @function
			 * @name canInsertSymbolOnLinkSymbol
			 * @memberOf sap.galilei.ui.editor.DiagramEditorExtension#
			 * @param {String} sSymbolClass The node symbol class qualified name.
			 * @param {Object} oCreateParam The input and output parameters. The parameters contain:
			 * {
			 *     point: (in/out) The view point where the symbol should be created.
			 *     linkSymbol: (in/out) The link symbol.
			 * }
			 * @returns {Boolean} true if the symbol can be inserted.
			 */
			canInsertSymbolOnLinkSymbol: function(sSymbolClass, oCreateParam) {
				return false;
			},

			toggleExpanded: function(oSymbol, disableTransition) {
				var that = this,
					index,
					oSubSymbol;

				this.resource.applyUndoableAction(function() {
					if (disableTransition) {
						oSymbol.toggleExpanded(that.viewer);
					} else {
						oSymbol.toggleExpanded(that.viewer, that.transitionDefinition);

					}
				}, "toggle", true);

				// Registers the newly created row symbols event handlers
				setTimeout(function() { // asychronous 
					if (oSymbol && oSymbol.isExpanded) {
						for (index = 0; index < oSymbol.symbols.length; index++) {
							oSubSymbol = oSymbol.symbols.get(index);
							if (sap.galilei.model.isInstanceOf(oSubSymbol, "sap.galilei.ui.diagram.RowSymbol")) {
								that.registerSymbolEvents(oSubSymbol);
							}
						}
					}
				}, 100)
			},

			showTooltip: function(shapeId, oEvent, oSymbol) {
				if (oSymbol.object.hover) {
					return;
				}
				oSymbol.object.Fill = "#005b8d";

				var div = document.createElement("div");

				var availableSpaceY = Math.abs(window.screen.availHeight - oEvent.pageY);

				if (availableSpaceY > 200) {
					div.style.top = oEvent.pageY + 10 + "px";
					div.style.left = oEvent.pageX + 10 + "px";

				} else {
					div.style.top = oEvent.pageY - 150 + "px";
					div.style.left = oEvent.pageX + 10 + "px";
				}

				div.setAttribute("class", "propertyTooltip");
				var header, keyValuePairs = [];
				//check if rowsymbol and shape is partition icon image
				if (oSymbol && shapeId && oSymbol.object) {
					var obj = oSymbol.object;
					switch (shapeId) {
						case "table":
							{
								header = obj.name;
								if (this.model.viewModel.isPerformanceAnalysis) {
									if (obj.firstPartitionString) {
										keyValuePairs.push({
											key: "1st Level Partition: ",
											value: obj.firstPartitionString
										});
									}
									if (obj.secondPartitionString) {
										keyValuePairs.push({
											key: "2nd Level Partition: ",
											value: obj.secondPartitionString
										});
									}
								}
							}
							break;
						case "column":
							{
								header = obj.name;
								if (this.model.viewModel.isPerformanceAnalysis) {
									if (obj.firstPartitionString) {
										keyValuePairs.push({
											key: "1st Level Partition: ",
											value: obj.firstPartitionString
										});
									}
									if (obj.secondPartitionString) {
										keyValuePairs.push({
											key: "2nd Level Partition: ",
											value: obj.secondPartitionString
										});
									}
								}
							}
							break;
						case "join":
							{
								if (this.model.viewModel.isPerformanceAnalysis && (obj.proposedCardinality || obj.referentialIntegrity)) {
									header = "Join Validation Status";
									if (obj.proposedCardinality) {
										keyValuePairs.push({
											key: "Proposed Cardinality: ",
											value: obj.proposedCardinality
										});
									}
									if (obj.referentialIntegrity) {
										keyValuePairs.push({
											key: "Referential Integrity: ",
											value: obj.referentialIntegrity
										});
									}
								}
							}
							break;
					}
				}
				if (header) {
					//first section to show header 
					var c1Div = document.createElement("div");

					var c1DSpan = document.createElement("span");
					c1DSpan.setAttribute("class", "tHeader");
					if (keyValuePairs.length > 0) {
						c1DSpan.setAttribute("class", "tHeader tUnderline");
					}
					var c1DSpanText = document.createTextNode(header);
					c1DSpan.appendChild(c1DSpanText);

					c1Div.appendChild(c1DSpan);
					div.appendChild(c1Div)

					//attributes
					for (var ii = 0; ii < keyValuePairs.length; ii++) {
						var keyValuePair = keyValuePairs[ii];
						var c1Div = document.createElement("div");
						var c1DSpan = document.createElement("span");
						c1DSpan.setAttribute("class", "tPropName");
						var c1DSpanText = document.createTextNode(keyValuePair.key);
						c1DSpan.appendChild(c1DSpanText);
						var c2DSpan = document.createElement("span");
						c2DSpan.setAttribute("class", "text");
						var c2DSpanText = document.createTextNode(keyValuePair.value);
						c2DSpan.appendChild(c2DSpanText);

						c1Div.appendChild(c1DSpan);
						c1Div.appendChild(c2DSpan);
						div.appendChild(c1Div);
					}

					var body = document.getElementsByTagName("body")[0];
					oSymbol.object.hover = true;
					setTimeout(function() {
						if (oSymbol && oSymbol.object && oSymbol.object.hover) {
							var hover = document.getElementsByClassName("propertyTooltip");
							if (typeof hover != 'undefined') {
								for (var ii = 0; hover.length; ++ii) {
									hover[ii].parentElement.removeChild(hover[ii]);
								}
							}
							body.appendChild(div);
						}
					}, 150);
				}
			},

			hideTooltip: function(oEvent, oSymbol) {
				if (oSymbol.object.hover)
					oSymbol.object.hover = false;
				if (oSymbol.object.Fill)
					oSymbol.object.Fill = "Transparent";
				var hover = document.getElementsByClassName("propertyTooltip");
				if (typeof hover !== 'undefined') {
					for (var ii = 0; hover.length; ++ii) {
						hover[ii].parentElement.removeChild(hover[ii]);
					}
				}
			},

			/*            autolayout: function(oDiagram) {
                //var that = this;
                var oAutoLayout = new sap.galilei.ui.editor.layout.DiagramAutoLayout();
                // Layouts the diagram (all top-level symbols) using the "Layered" algorithm that is based on klay.js. The klay.js needs to be included manually.
                // The layouter is sap.galilei.ui.common.layout.KlayLayouter.
                // For the options, see http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
                // The other layouters are "Directed" and "Organic". They are based on dagre.js. The dagre.js needs to be included manually.
                // You could also develop your own layouter.
                oAutoLayout.layoutDiagram(oDiagram, {
                        isSupportMultiEdges: true,
                        isIncludeSubLinkSymbols: true,
                        isDirected: true,
                        // Specify the layouter name and its options (klay.js options)
                        layout: {
                            name: "Layered", // klay.js only supports the "Layered" algorithm
                            direction: "RIGHT", // Layout direction
                            nodePlace: "LINEAR_SEGMENTS",
                            edgeRouting: "ORTHOGONAL",
                            spacing: 50, // Distance between nodes
                            edgeSpacingFactor: 0.1
                        },
                        animationDuration: 100
                    },
                    this,
                    function(oAutoLayout) {
                        // If success, set x axix offset
                        //var aSymbols = that.editor.getAllSymbols();
                        //for (var i = 0; i < aSymbols.length; i++) {
                           // var oSymbol = aSymbols[i];
                          //  if (isViewNodeSymbol(oSymbol) || isSemanticsSymbol(oSymbol)) {
                         //       oSymbol.moveBy(70, 20);
                                //that._editor.drawSymbol(oSymbol);
                        //    }
                       // }
                     //   setTimeout(function() { // asychronous refresh
                     //       that._editor.drawAllSymbols();
                    //    }, 10); 

                    },
                    function(error) {
                        throw error;
                    }
                );
            }*/

			autolayout: function(oDiagram, isLoading) {
				var that = this;
				var autoLayout = new AutoLayout({
					diagram: oDiagram
				});
				autoLayout.execute();
				setTimeout(function() { // asychronous refresh
					that._editor.drawAllSymbols();
					if (!isLoading) {
						for (var i = 0; i < oDiagram.symbols.length; i++) {
							var oSymbol = oDiagram.symbols.get(i);
							if (isTableSymbol(oSymbol)) {
								that.toggleExpanded(oSymbol, true);
								that.toggleExpanded(oSymbol, true);
							}
						}
					}
				}, 10);
			},

			showContextMenu: function(oEvent) {
				if (oEvent.editor === this._editor) {
					var that = this;

					var oSymbol = oEvent.sourceSymbol;

					var contextMenu = CalcViewEditorUtil.getOrCreateContextMenu();

					//replace data souce with dat source
					if (isTableSymbol(oSymbol) && (!oSymbol.isDataFoundtion)) {
						CalcViewEditorUtil.createContextMenuItem(contextMenu, {
							imagePath: undefined,
							name: resourceLoader.getText("txt_replace_with_data_source"),
							action: that.replaceDataSourceAction,
							actionContext: that
						});
					}
					// Remove menu
					if (isTableSymbol(oSymbol) || isJoinSymbol(oSymbol)) {
						CalcViewEditorUtil.createContextMenuItem(contextMenu, {
							imagePath: undefined,
							name: resourceLoader.getText("tol_remove"),
							action: that.deleteAction,
							actionContext: that
						});
					}

					// swap menu
					if (that.model.viewNode.isStarJoin() === false && that.model.viewNode.joins._keys.length > 0) {
						if (isTableSymbol(oSymbol) || isJoinSymbol(oSymbol)) {
							CalcViewEditorUtil.createContextMenuItem(contextMenu, {
								imagePath: undefined,
								name: resourceLoader.getText("txt_swap"),
								action: that.swapAction,
								actionContext: that
							});
						}
					}

					CalcViewEditorUtil.openContextMenu(oEvent);

					return true;
				}

			},

			hideContextMenu: function() {
				CalcViewEditorUtil.hideContextMenu();
			},

			deleteAction: function(that) {
				if (that._editor) {
					that._editor.deleteSelectedSymbols();
				}

			},
			swapAction: function(that) {
				if (that.model) {

					if (that.model.viewNode && that.model.viewNode.joins.get(0) && that.model.viewNode.joins.get(0).joinType === "textTable" && that.model
						.viewNode.joins.get(0).languageColumn) {
						jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
						sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(resourceLoader.getText("txt_language_col_del"), {
							offset: "-10px -100px"
						});
					}
					var parameter = {
						viewNodeName: that.model.viewNode.name,
						joinName: 0
					};
					var command = new commands.swapInputInJoinCommand(parameter);
					that._execute(command);
					that._isExecutingCommand = true;
					that.editor.deleteSymbols(that.editor.diagram.getAllSymbols());
					that._editor.extensionParam.builder._initialBuild();
					for (var i = 0; i < that.diagram.symbols.length; i++) {
						var oSymbol = that.diagram.symbols.get(i);
						that.registerSymbolEvents(oSymbol);
						if (isTableSymbol(oSymbol)) {
							that._registerTableEvents(oSymbol);
						} else if (isJoinSymbol(oSymbol)) {
							that._registerJoinEvents(oSymbol);
						}
					}
					that.autolayout(that.diagram, true);
					that._editor.drawAllSymbols();

					var joinSymbol = that.editor._diagram.symbols.selectObject({
						"joinKey": 0 // join number
					});
					setTimeout(function() { // asychronous refresh
						that.editor.selectSymbol(joinSymbol);
					}, 10);

					that._isExecutingCommand = false;

				}

			},
			replaceDataSourceAction: function(that) {
				if (that._editor) {
					var input, viewNode;

					if (that._editor.selectedSymbols) {
						var selectedSymbol = that._editor.selectedSymbols[0];
						if (isTableSymbol(selectedSymbol)) {

							viewNode = that.model.viewNode;
							if (viewNode) {
								input = viewNode.inputs.get(selectedSymbol.inputKey);
							}
						}

					}
					if (input) {
						var callback = function() {
							that.editor.deleteSymbols(that.editor.diagram.getAllSymbols());
							that._editor.extensionParam.builder._initialBuild();
							for (var i = 0; i < that.diagram.symbols.length; i++) {
								var oSymbol = that.diagram.symbols.get(i);
								that.registerSymbolEvents(oSymbol);
								if (isTableSymbol(oSymbol)) {
									that._registerTableEvents(oSymbol);
								} else if (isJoinSymbol(oSymbol)) {
									that._registerJoinEvents(oSymbol);
								}
							}
							that.autolayout(that.diagram, true);
							that._editor.drawAllSymbols();

							that._isExecutingCommand = false;
						};

						var parameter = {
							context: that._editor.extensionParam.builder._context,
							viewNode: viewNode,
							inputSource: input,
							typeOfReplace: CalcViewEditorUtil.typeOfReplace.DATASOURCE_WITH_DATASOURCE,
							undoManager: that.model.viewModel.$getUndoManager(),
							callBack: callback

						};
						var dialog = new ReplaceDataSourceAndNode(parameter);
						that._isExecutingCommand = true;
						dialog.openRDSNDialog();
					}
				}
			},
			joinHighlight: function(value, seq) {
				var curSeq = 1;
				var that = this;
			
				that._isExecutingCommand = true;
				
				var oStyleSheet = new sap.galilei.ui.common.style.StyleSheet({
					fill: "yellow",
					opacity: 1
				});
				var oStyleSheet1 = new sap.galilei.ui.common.style.StyleSheet({
					fill: "orange",
					opacity: 1
				});

				for (var i = 0; i < that.diagram.symbols.length; i++) {
					var tableSymbol = that.diagram.symbols.get(i);
					if (tableSymbol.__fullClassName__ === "TableSymbol") {
						for (var j = 0; j < tableSymbol.symbols.length; j++) {
							if ((((tableSymbol.symbols.get(j).object.name).toUpperCase()).includes(value.toUpperCase())) && (value.length > 0)) {

								tableSymbol.symbols.get(j).highlight(oStyleSheet);
								if (curSeq === seq) {
								    tableSymbol.symbols.get(j).unhighlight(oStyleSheet);
									tableSymbol.symbols.get(j).highlight(oStyleSheet1);
								}
								curSeq++;
							} else {
								tableSymbol.symbols.get(j).unhighlight(oStyleSheet);
                                tableSymbol.symbols.get(j).unhighlight(oStyleSheet1);
							}
						}
					}


				}
				that.autolayout(that.diagram, true);
				that._editor.drawAllSymbols();

				that._isExecutingCommand = false;
				return curSeq - 1;

			}
		}
	});
	return Editor;
});
