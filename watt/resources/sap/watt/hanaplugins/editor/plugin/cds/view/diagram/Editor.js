/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../CDSEditorUtil",
        "../../model/commands",
        "../../../hdbcalculationview/base/modelbase",
        "./galilei",
       // "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/services/ViewModelService"
        "../../../hdbcalculationview/viewmodel/services/ViewModelService"
        ], function(ResourceLoader, CDSEditorUtil, commands, modelbase, galilei, ViewModelService) {
	"use strict";

	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	function isEntitySymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.EntitySymbol");
	}

	function isContextSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.ContextSymbol");
	}

	function isViewSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.ViewSymbol");
	}

	function isRowSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol");
	}

	function isAssociationSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.AssociationSymbol");
	}

	function isStructureSymbol(oSymbol) {
		return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.StructureSymbol");
	}
	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
	var ViewModelEvents = commands.ViewModelEvents;

	/**
	 * @class
	 * Defines the diagram editor extension for Analytics
	 */
	var Editor = sap.galilei.ui.editor.defineDiagramEditorExtension({
		// Define class name
		fullClassName: "sap.watt.hanaplugins.editor.plugin.cds.diagram.Editor",

		// Define properties
		properties: {
			ROW_SYMBOL: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol",
			ENTITY_SYMBOL: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.EntitySymbol",
			CONTEXT_SYMBOL: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.ContextSymbol",
			VIEW_SYMBOL: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.ViewSymbol",

			ASSOCIATION_SYMBOL: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.AssociationSymbol",
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
				this._viewNodeCreatedHandler = null;
				this._reloadHandler = null;
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
			 * @memberOf sap.hana.ide.editor.plugin.analytics.diagram.Editor
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
				this.addLinearGradient("readOnlyEntityFill", "#BBBABA", "#ffffff");
				this.addLinearGradient("contextFill", "#dce3c4", "#aebf76");
				this.addLinearGradient("viewFill", "#AEAFB2", "#B5B6B9");
				this.addLinearGradient("structureFill", "#FFE0D1", "#FFF7F2");

				//Subscribe symbol selection event
				var symbolSelectedHandler = function(event) {
					var selectedSymbol = event.selectedSymbols.length > 0 ? event.selectedSymbols[0] : null;
					var oStyleSheet = new sap.galilei.ui.common.style.StyleSheet({
						fill: "#F9F982", //"yellow",
						opacity: 1
					});

					if (selectedSymbol) {

						//first remove all existing highlighting
						var allSymbols = that._editor.getAllSymbols();
						for (var i = 0; i < allSymbols.length; i++) {
							var currentSYmbol = allSymbols[i];
							currentSYmbol.unhighlight(oStyleSheet);
						}

						that._editor.drawAllSymbols();

						//hide all existing tooltips (like cardinality values or onCondition or readonly entity's namespace)
						that.hideAdditionalInfo(selectedSymbol);

						//highlighting logic when association symbol gets selected
						if (isAssociationSymbol(selectedSymbol)) {
							//show additional infor based on symbol selected
							that.showAdditionalInfo(selectedSymbol, event);

							var sourceSymbol = selectedSymbol.sourceSymbol;

							//highlighting will be done only when association symbol selected represents the association at same level
							if (isRowSymbol(sourceSymbol)) {

								var targetSymbol = selectedSymbol.targetSymbol;
								var sourceAssociationObject = selectedSymbol.object.cdsObject;

								var indexToHighlight_targetSymbol = [];
								var indexToHighlight_sourceSymbol = [];
								if (sourceAssociationObject.type === "Managed") {
									var associatedKeys = sourceAssociationObject.associationKeys;
									//find indexes of row symbols in target entity whioch need to be highlighted
									for (var i = 0; i < associatedKeys._keys.length; i++) {
										var associatedKeyName = associatedKeys.getAt(i).name;
										for (var j = 0; j < targetSymbol.symbols.length; j++) {
											var childSymbol = targetSymbol.symbols.get(j);
											if (isRowSymbol(childSymbol) && childSymbol.object.name === associatedKeyName) {
												indexToHighlight_targetSymbol.push(j);
											}
										}
									}

									//if keys are not selected explicitly, then highlight the key columns of target entity
									if (associatedKeys._keys.length === 0) {
										if (isEntitySymbol(targetSymbol)) {
											var targetAssociationColumns = targetSymbol.object.cdsObject.elements;
											for (var i = 0; i < targetAssociationColumns._keys.length; i++) {
												var element = targetAssociationColumns.getAt(i);
												if (element.key) {
													indexToHighlight_targetSymbol.push(i);
												}
											}
										}
									}

								} else if (sourceAssociationObject.type === "Unmanaged") {
									var onCondition = sourceAssociationObject.onCondition;
									var operator = sourceAssociationObject.operator;
									var left = onCondition.substring(onCondition.lastIndexOf(".") + 1, onCondition.indexOf(operator)).trim();
									var right = onCondition.substring(onCondition.indexOf("=") + 1).trim();

									//find index to highlight inside target symbol from the left part of on condition
									for (var i = 0; i < targetSymbol.symbols.length; i++) {
										var childSymbol = targetSymbol.symbols.get(i);
										if (childSymbol.object.name === left) {
											indexToHighlight_targetSymbol.push(i);
											break;
										}
									}

									//find index to highlight inside source symbol from the right part of on condition
									var sourceEntitySymbol = sourceSymbol.parentSymbol;
									for (var i = 0; i < sourceEntitySymbol.symbols.length; i++) {
										var childSymbol = sourceEntitySymbol.symbols.get(i);
										if (childSymbol.object.name === right) {
											indexToHighlight_sourceSymbol.push(i);
											break;
										}
									}
								}

								//now highlight the indexes stored in array 'indexToHighlight_targetSymbol'
								for (var j = 0; j < targetSymbol.symbols.length; j++) {
									var childSymbol = targetSymbol.symbols.get(j);
									if (indexToHighlight_targetSymbol.indexOf(j) !== -1) {
										childSymbol.highlight(oStyleSheet);
									} else {
										childSymbol.unhighlight(oStyleSheet);
									}
									that._editor.drawSymbol(childSymbol);
								}

								//highlight right part on onCondition in the source symbol for Unmanaged association
								if (sourceAssociationObject.type === "Unmanaged") {
									var sourceEntitySymbol = sourceSymbol.parentSymbol;
									for (var i = 0; i < sourceEntitySymbol.symbols.length; i++) {
										var childSymbol = sourceEntitySymbol.symbols.get(i);
										if (indexToHighlight_sourceSymbol.indexOf(i) !== -1) {
											childSymbol.highlight(oStyleSheet);
										} else {
											childSymbol.unhighlight(oStyleSheet);
										}
										that._editor.drawSymbol(childSymbol);
									}
								}

								//finally, highlight the source symbol as well
								sourceSymbol.highlight(oStyleSheet);
								that._editor.drawSymbol(sourceSymbol);

							} else {
								//when a symbol other than association sybol is selected by user
								var allSymbols = that._editor.getAllSymbols();
								for (var i = 0; i < allSymbols.length; i++) {
									var currentSYmbol = allSymbols[i];
									currentSYmbol.unhighlight(oStyleSheet);
								}

								that._editor.drawAllSymbols();

								that.hideAdditionalInfo(selectedSymbol);
							}

						} else {
							//when a symbol other than association sybol is selected by user
							var allSymbols = that._editor.getAllSymbols();
							for (var i = 0; i < allSymbols.length; i++) {
								var currentSYmbol = allSymbols[i];
								currentSYmbol.unhighlight(oStyleSheet);
							}

							that._editor.drawAllSymbols();

							that.hideAdditionalInfo(selectedSymbol);
						}

						//events.publish(ViewModelEvents.NODE_SELECTED, nodeName);
					} else {
						//when deselection occurs
						var allSymbols = that._editor.getAllSymbols();
						for (var i = 0; i < allSymbols.length; i++) {
							var currentSYmbol = allSymbols[i];
							currentSYmbol.unhighlight(oStyleSheet);
						}

						that._editor.drawAllSymbols();

						that.hideAdditionalInfo(selectedSymbol);
					}
				};
				sap.galilei.core.Event.subscribe("symbols.selection.changed", symbolSelectedHandler, this, this.editor);

				if (this.model) {
					var refreshEntityHandler = this._createViewModelEventHandler(function(event) {
						if (that.editor._diagram && that.model) {
							for (var i = 0; i < this.diagram.symbols.length; i++) {
								var oSymbol = this.diagram.symbols.get(i);
								if (isEntitySymbol(oSymbol)) {
									var entity = CDSEditorUtil.getEntity(that.model.viewModel.root, oSymbol.object.name);
									//if (oSymbol.object.columns.length === entity.elements.count()) { // Update columns
									//	that.editor.extensionParam.builder.updateColumns(oSymbol, entity);
									//} else { // update table
									that.editor.extensionParam.builder.updateTable(oSymbol, entity);
									that.toggleExpanded(oSymbol, true);
									that.toggleExpanded(oSymbol, true);
									//	}
								} else if (isContextSymbol(oSymbol)) {
									var children = oSymbol.symbols;
									for (var j = 0; j < children.length; j++) {
										var childSymbol = children.get(j);
										if (isEntitySymbol(childSymbol)) {
											var entity = CDSEditorUtil.getEntity(that.model.viewModel.root, childSymbol.object.name);
											//if (oSymbol.object.columns.length === entity.elements.count()) { // Update columns
											//	that.editor.extensionParam.builder.updateColumns(oSymbol, entity);
											//} else { // update table
											that.editor.extensionParam.builder.updateTable(childSymbol, entity);
											that.toggleExpanded(childSymbol, true);
											that.toggleExpanded(childSymbol, true);
										}
									}
								}
							}
							//TODO : uncomment this and test : now create association symbols
							//that.editor.extensionParam.builder.buildAssociationSymbols(that.model.viewModel.root);
						}
					});
					this.model.viewModel.$getEvents().subscribe(ViewModelEvents.CHANGED, refreshEntityHandler, this);
				}

				// Register events to existing symbols
				if (this.diagram) {
					setTimeout(function() {
						that._registerSymbolEvents(that.diagram.symbols);
						that.editor.extension.autolayout(that._editor._diagram);
					}, 10);

				}
			},

			updateDiagram: function(selectedNode) {
				var that = this;

				this._isExecutingCommand = true; // disable all symbol events
				// delete exsiting symbols
				this.editor.deleteSymbols(this.editor.diagram.getAllSymbols());
				//set selectedNode
				this.editor.extensionParam.builder.selectedNode = selectedNode;
				//Generate new symbols
				this.editor.extensionParam.builder.buildDiagram();
				this.editor.drawAllSymbols();
				// Adjusts symbols size to content
				this.editor.adjustAllSymbols();
				// Clears the undo/redo stack so the adjust symbols cannot be undone.
				this.editor.clearUndoRedo();
				this._isExecutingCommand = false; // enable symbol events

				setTimeout(function() {
					that._registerSymbolEvents(that.diagram.symbols);
					//perform auto layout
					that.editor.extension.autolayout(that._editor._diagram);

				}, 10);
			},

			_registerSymbolEvents: function(aSymbols) {
				var that = this;
				var cdsRoot = this.editor.model.viewModel.root;

				var cdsArtifactDeletedHandler = this._createViewModelEventHandler(function(event) {
					var deletedArtifactName = event.name;
					for (var i = 0; i < that.diagram.symbols.length; i++) {
						var oSymbol = that.diagram.symbols.get(i);
						if (deletedArtifactName === oSymbol.object.displayName) {
							that._editor.deleteSymbol(oSymbol);
							break;
						}
					}
				});

				var entityCreatedHandler = this._createViewModelEventHandler(function(event) {
					var entity;
					var entityName = event.name;
					entityName = entityName.substr(entityName.lastIndexOf(".") + 1);

					var parentContext = event.source;
					for (var i = 0; i < parentContext.children._keys.length; i++) {
						var child = parentContext.children.getAt(i);
						if (child.name === entityName) {
							entity = child;
							break;
						}
					}

					if (entity) {
						var oSymbol = that.editor.extensionParam.builder.createEntity(entity);
						that.toggleExpanded(oSymbol, true);
						that.toggleExpanded(oSymbol, true);
					}
				});

				var contextCreatedHandler = this._createViewModelEventHandler(function(event) {
					var context;
					var contextName = event.name;
					var correctedContextName = contextName.substr(contextName.lastIndexOf(".") + 1);

					var parentContext = event.source;
					for (var i = 0; i < parentContext.children._keys.length; i++) {
						var child = parentContext.children.getAt(i);
						if (child.name === correctedContextName) {
							context = child;
							break;
						}
					}

					if (context) {
						var oSymbol = that.editor.extensionParam.builder._processContext(context);
						that._editor.drawSymbol(oSymbol);
						that.toggleExpanded(oSymbol, true);
						that.toggleExpanded(oSymbol, true);
					}
				});

				if (aSymbols.length === 0) {
					//subscribe events on root when a new file is created
					cdsRoot.$getEvents().subscribe(ViewModelEvents.ENTITY_DELETED, cdsArtifactDeletedHandler, this);
					cdsRoot.$getEvents().subscribe(ViewModelEvents.CONTEXT_DELETED, cdsArtifactDeletedHandler, this);

					cdsRoot.$getEvents().subscribe(ViewModelEvents.ENTITY_CREATED, entityCreatedHandler, this);
					cdsRoot.$getEvents().subscribe(ViewModelEvents.CONTEXT_CREATED, contextCreatedHandler, this);
				} else {
					if (aSymbols) {
						for (var i = 0; i < aSymbols.length; i++) {
							var oSymbol = aSymbols.get(i);
							this.registerSymbolEvents(oSymbol);
							if (isEntitySymbol(oSymbol)) {
								this._registerEntityEvents(oSymbol);
							} else if (isContextSymbol(oSymbol)) {
								cdsRoot = this.editor.model.viewModel.root;
								var fileName = cdsRoot.name;
								var symbolFullPath = CDSEditorUtil.getCDSArtifactFullPath(oSymbol, fileName, undefined);
								var addedContext = CDSEditorUtil.getCDSModelFromFullPath(cdsRoot, symbolFullPath, oSymbol.object.name);
								this._registerContextEvents(oSymbol, addedContext); //regitsre events on the created context
								//this._registerSymbolEvents(oSymbol.symbols);
							}else if(isStructureSymbol(oSymbol)){
								oSymbol.resize(130,oSymbol.height);
								that._editor.drawSymbol(oSymbol);
							} else if (isAssociationSymbol(oSymbol)) {
								this._registerAssociationEvents(oSymbol);
							}
						}

						//subscribe events on root when a saved file that contains symbols is opened
						cdsRoot.$getEvents().subscribe(ViewModelEvents.ENTITY_DELETED, cdsArtifactDeletedHandler, this);
						cdsRoot.$getEvents().subscribe(ViewModelEvents.CONTEXT_DELETED, cdsArtifactDeletedHandler, this);

						cdsRoot.$getEvents().subscribe(ViewModelEvents.ENTITY_CREATED, entityCreatedHandler, this);
						cdsRoot.$getEvents().subscribe(ViewModelEvents.CONTEXT_CREATED, contextCreatedHandler, this);
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

			_registerEntityEvents: function(oSymbol) {
				var that = this;

				oSymbol.object.addPropertyListener({
					onPropertyChanged: function(event) {
						this.editor.extension.renameNode(oSymbol);
					},
					editor: this.editor // marker to identify own listeners on dispose
				},
				"displayName"
				);



				// Update Table layout : should find a better solution
				if (oSymbol.width < 100) {
					oSymbol.resize(100, this.height);
				}
				that.toggleExpanded(oSymbol, true);
				that.toggleExpanded(oSymbol, true);
			},
			_registerStructureEvents: function(oSymbol) {
				var that = this;

				oSymbol.object.addPropertyListener({
					onPropertyChanged: function(event) {
						this.editor.extension.renameNode(oSymbol);
					},
					editor: this.editor // marker to identify own listeners on dispose
				},
				"displayName"
				);

				// Update Table layout : should find a better solution
				if (oSymbol.width < 100) {
					oSymbol.resize(100, this.height);
				}
				that.toggleExpanded(oSymbol, true);
				that.toggleExpanded(oSymbol, true);
			},

			_registerContextEvents: function(oSymbol, addedContext) {
				var that = this;
				oSymbol.object.addPropertyListener({
					onPropertyChanged: function(event) {
						this.editor.extension.renameNode(oSymbol);
					},
					editor: this.editor // marker to identify own listeners on dispose
				},
				"displayName"
				);

				// Update Table layout : should find a better solution
				if (oSymbol.width < 100) {
					oSymbol.resize(100, this.height);
				}
				that.toggleExpanded(oSymbol, true);
				that.toggleExpanded(oSymbol, true);

				//delete event handler for children of 'addedContext'
				var cdsArtifactDeletedHandler = this._createViewModelEventHandler(function(event) {
					var deletedArtifactName = event.name;
					var childSymbols = that._editor.diagram.symbols;
					for (var i = 0; i < childSymbols.length; i++) {
						var childSymbol = childSymbols.get(i);
						if (childSymbol.object.name === deletedArtifactName) {
							childSymbol.deleteSymbol();
							break;
						}
					}
				});

				var entityCreatedHandler = this._createViewModelEventHandler(function(event) {
					var entity;
					var entityName = event.name;
					var parentContext = event.source;

					//find entity being created
					for (var i = 0; i < parentContext.children._keys.length; i++) {
						var child = parentContext.children.getAt(i);
						if (child.name === entityName) {
							entity = child;
							break;
						}
					}

					if (entity) {
						var parentContextFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentContext);
						var parentSymbol = getParentSymbol(parentContextFullPath);

						var oSymbol = that.editor.extensionParam.builder.createEntity(entity, parentSymbol);
						that.toggleExpanded(oSymbol, true);
						that.toggleExpanded(oSymbol, true);
					}
				});

				function getParentSymbol(parentContextFullPath, symbolsArray) {
					var parentSymbol;
					var fileName = that.editor.model.viewModel.root.name;

					if (!symbolsArray) {
						symbolsArray = that.diagram.symbols;
					}

					//find the parent symbol from all diagram symbols based on full path
					for (var i = 0; i < symbolsArray.length; i++) {
						var currentSymbol = symbolsArray.get(i);
						var currentSymbolFullPath = CDSEditorUtil.getCDSArtifactFullPath(currentSymbol, fileName, undefined);
						if (currentSymbolFullPath === parentContextFullPath) {
							parentSymbol = currentSymbol;
							break;
						} else {
							if (isContextSymbol(currentSymbol)) {
								parentSymbol = getParentSymbol(parentContextFullPath, currentSymbol.symbols);
							}

							if (parentSymbol) {
								break;
							}
						}
					}

					return parentSymbol;
				}

				var contextCreatedHandler = this._createViewModelEventHandler(function(event) {
					var context;
					var contextName = event.name;
					var correctedContextName = contextName.substr(contextName.lastIndexOf(".") + 1);

					var parentContext = event.source;
					for (var i = 0; i < parentContext.children._keys.length; i++) {
						var child = parentContext.children.getAt(i);
						if (child.name === correctedContextName) {
							context = child;
							break;
						}
					}

					if (context) {
						var oSymbol = that.editor.extensionParam.builder._processContext(context);
						that.toggleExpanded(oSymbol, true);
						that.toggleExpanded(oSymbol, true);
					}
				});

				//register events on the new context created
				if (addedContext) {
					addedContext.$getEvents().subscribe(ViewModelEvents.ENTITY_DELETED, cdsArtifactDeletedHandler, this);
					addedContext.$getEvents().subscribe(ViewModelEvents.CONTEXT_DELETED, cdsArtifactDeletedHandler, this);

					addedContext.$getEvents().subscribe(ViewModelEvents.ENTITY_CREATED, entityCreatedHandler, this);
					addedContext.$getEvents().subscribe(ViewModelEvents.CONTEXT_CREATED, contextCreatedHandler, this);
				}

			},

			_registerAssociationEvents: function(oSymbol) {
				var that = this;

				var symbolDoubleTapHandler = function(event) {
					if (event.sourceSymbol === oSymbol) {
						//TODO naviagte to association pane
						console.log("double tap on association symbol : " + oSymbol.name);

						that.symbolDblClicked(oSymbol);
						that.hideAdditionalInfo(oSymbol);
					}
				};

				sap.galilei.core.Event.subscribe("symbol.doubletap", symbolDoubleTapHandler, oSymbol, this.editor);

			},

			postCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkSymbol) {

			},

			postCreateSymbol: function(oSymbol) {
				var that = this;
				var editor = this.editor;
				editor.defaultPostCreateSymbol(oSymbol);

				var parentSymbolFullPath;
				var parentSymbolName;

				/*if (oSymbol.parentSymbol) {
					parentSymbolName = oSymbol.parentSymbol.object.displayName;
					parentSymbolName = parentSymbolName.replace(/ /g, ''); //remove space in the parent name
					oSymbol.parentSymbol.object.displayName = parentSymbolName;
					oSymbol.parentSymbol.object.name = parentSymbolName;

					parentSymbolFullPath = CDSEditorUtil.getCDSArtifactFullPath(oSymbol.parentSymbol, fileName, undefined);
				} else {
					parentSymbolName = fileName;
					parentSymbolFullPath = fileName;
				}*/
				var parentNode = editor.extensionParam.builder.selectedNode;
				if (parentNode) {
					parentSymbolName = parentNode.name;
					parentSymbolFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentNode);
				}

				var currentSymbolName = oSymbol.object.displayName.trim();
				currentSymbolName = currentSymbolName.replace(/ /g, ''); //remove space in the name
				oSymbol.object.displayName = currentSymbolName;
				oSymbol.object.name = currentSymbolName;

				var cdsObject;

				if (isEntitySymbol(oSymbol)) {
					this._registerEntityEvents(oSymbol);

					var addEntityCommand = new commands.AddEntityCommand(currentSymbolName, parentSymbolName, parentSymbolFullPath);
					cdsObject = that._execute(addEntityCommand);

				} else if (isContextSymbol(oSymbol)) {
					var addContextCommand = new commands.AddContextCommand(currentSymbolName, parentSymbolName, parentSymbolFullPath);
					cdsObject = that._execute(addContextCommand);

					this._registerContextEvents(oSymbol /*, addedContext*/ );
				}else if (isStructureSymbol(oSymbol)) {
					var addContextCommand = new commands.AddContextCommand(currentSymbolName, parentSymbolName, parentSymbolFullPath);
					cdsObject = that._execute(addContextCommand);
					this._registerContextEvents(oSymbol /*, addedContext*/ );
				} else if (isAssociationSymbol(oSymbol)) {
					this._registerAssociationEvents(oSymbol);

				}

				oSymbol.object.cdsObject = cdsObject;
			},

			/**
			 * Checks whether a link symbol can be created between the source symbol and the target symbol using the link symbol tool definition.
			 * @function
			 * @name canCreateLinkSymbol
			 * @memberOf sap.hana.ide.editor.plugin.analytics.diagram.Editor
			 * @param {Symbol} oSourceSymbol The source symbol.
			 * @param {Symbol} oTargetSymbol The target symbol.
			 * @param {Object} oLinkTool The link symbol tool definition.
			 * @returns {boolean} true if the link symbol can be created.
			 */
			canCreateLinkSymbol: function(oSourceSymbol, oTargetSymbol, oLinkTool) {
				return false;
			},

			canCreateSymbol: function(sSymbolClass, oCreateParam) {
				if (isEntitySymbol(oCreateParam.parentSymbol) || isContextSymbol(oCreateParam.parentSymbol)) {
					return false;
				}
				return this.editor.defaultCanCreateSymbol(sSymbolClass, oCreateParam);
			},

			canAttachSymbol: function(oParent, oSymbol, oAttachParam) {
				if (isEntitySymbol(oParent) || isContextSymbol(oParent)) {
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

				oToolsDef = [{
					name: this.ENTITY_SYMBOL,
					type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
					symbolClass: this.ENTITY_SYMBOL,
					smallIcon: "Table.png",
					tooltip: resourceLoader.getText("tol_add_entity")
				},
				{
					name: this.CONTEXT_SYMBOL,
					type: sap.galilei.ui.editor.tool.Types.createNodeSymbolTool,
					symbolClass: this.CONTEXT_SYMBOL,
					smallIcon: "Table.png",
					tooltip: resourceLoader.getText("tol_add_context")
				},
				{
					name: this.ASSOCIATION_SYMBOL,
					type: sap.galilei.ui.editor.tool.Types.createLinkSymbolTool,
					smallIcon: "Connection.gif",
					cursor: "JoinCursor.png",
					linksDefinition: [{
						sourceSymbol: this.ROW_SYMBOL,
						targetSymbol: this.ENTITY_SYMBOL,
						linkSymbolClass: this.ASSOCIATION_SYMBOL
					}]
				}
				];

				/*				oToolsDef = [
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
                ];*/

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


				this.addImagesFolder(aButtons);
				return aButtons;
			},

			canSupportInPlaceEditing: function(oSymbol, aClientPoint) {
				/*if (isTableSymbol(oSymbol)) {
					if (oSymbol.y + 20 > aClientPoint[1]) { // table name should not be editable.
						return false;
					}
					return true;
				}*/
				if (isEntitySymbol(oSymbol) || isContextSymbol(oSymbol) || isStructureSymbol(oSymbol)) {
					return true;
				}
				return false;
			},

			/*setDefaultObjectName: function(oObject) {
				if (oObject) {
					if (oObject.classDefinition.qualifiedName === "sap.watt.hanaplugins.editor.plugin.cds.diagram.Entity" || oObject.classDefinition.qualifiedName ===
						"sap.watt.hanaplugins.editor.plugin.cds.diagram.Context") {
						oObject.name = this.model.viewModel.root.getNextName(oObject.classDefinition.name);
						oObject.displayName = oObject.name;
					}
				}
			},*/

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
				}, 10);
			},

			expandCollapseAll: function(expand) {
				var that = this;
				that.resource.applyUndoableAction(function() {
					for (var i = 0; i < that.diagram.symbols.length; i++) {
						var oSymbol = that.diagram.symbols.get(i);
						if (isEntitySymbol(oSymbol) || isStructureSymbol(oSymbol) || isContextSymbol(oSymbol)) {
							if ((expand && !oSymbol.isExpanded) || (!expand && oSymbol.isExpanded)) {
								that.toggleExpanded(oSymbol, true);
							}
						}
					}
				}, "expandCollapseAll", true);
			},

			autolayout: function(oDiagram) {
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
				function() {
					// If success, show the global view.
					oAutoLayout.editor.editor.showGlobalView();
					oAutoLayout.editor.editor.viewer.zoomTo(1);
				},
				function(error) {
					throw error;
				}
				);
			},

			symbolDblClicked: function(oSymbol) {
				var events = this.model.viewModel.root.$getEvents();
				if (oSymbol && oSymbol.object) {
					events.publish(ViewModelEvents.NODE_SELECTED, oSymbol.object.cdsObject);
				}
			},

			showContextMenu: function(oEvent) {
				/*	if (oEvent.editor === this._editor) {
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

					CalcViewEditorUtil.openContextMenu(oEvent);

					return true;
				}*/

			},

			hideContextMenu: function() {
				//	CalcViewEditorUtil.hideContextMenu();
			},

			deleteAction: function(that) {
				if (that._editor) {
					that._editor.deleteSelectedSymbols();
				}

			},

			deleteSelectedNodes: function(selectedCDSSymbolsArray) {
				var that = this;
				var selectedSymbolName;
				var selectedSymbolFullPath;
				var root = this.editor.model.viewModel.root;
				var fileName = root.name;

				for (var i = 0; i < selectedCDSSymbolsArray.length; i++) {
					var deleteCommand;
					var deleteCommandsArray = [];

					var currentSymbol = selectedCDSSymbolsArray[i];
					selectedSymbolName = currentSymbol.object.name;

					var parentSymbolFullPath;
					var parentSymbolName;
					var parentContext;

					if (isRowSymbol(currentSymbol)) {
						var entityName = currentSymbol.parentSymbol.object.name;
						var parentEntity = currentSymbol.parentSymbol.object.cdsObject;
						var isAssociation = currentSymbol.object.cdsObject.associationKeys ? true : false;
						if (isAssociation) {
							deleteCommand = new commands.RemoveAssociationCommand(entityName, undefined, selectedSymbolName, parentEntity);

						} else {
							var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentEntity);
							deleteCommand = new commands.RemoveElementCommand(entityName, entityFullPath, selectedSymbolName, parentEntity);
						}

						deleteCommandsArray.push(deleteCommand);

					} else if (isEntitySymbol(currentSymbol)) {
						var entity = currentSymbol.object.cdsObject;
						parentContext = entity.$getContainer();
						deleteCommandsArray = this.createDeleteCommandsArrayForEntity(entity, parentContext, deleteCommandsArray);

						deleteCommand = new commands.DeleteEntityCommand(entity, parentContext);
						deleteCommandsArray.push(deleteCommand);

					} else if (isContextSymbol(currentSymbol)) {
						var context = currentSymbol.object.cdsObject;
						parentContext = context.$getContainer();
						deleteCommandsArray = this.createDeleteCommandsArrayForContext(context, parentContext, deleteCommandsArray);

						deleteCommand = new commands.DeleteContextCommand(context, parentContext);
						deleteCommandsArray.push(deleteCommand);

					} 

					if (deleteCommandsArray.length > 0) {
						that._execute(new modelbase.CompoundCommand(deleteCommandsArray));
					}
				}

				this._editor.deleteSelectedSymbols();
			},

			createDeleteCommandsArrayForEntity: function(entity, parentContext, deleteCommandsArray) {
				var deleteCommand;

				//create delete command for elements
				var elementArray = entity.elements;
				for (var i = 0; i < elementArray._keys.length; i++) {
					var element = elementArray.getAt(i);
					var entityFullPath = CDSEditorUtil.getFullPathFromCDSObject(entity);
					deleteCommand = new commands.RemoveElementCommand(entity.name, entityFullPath, element.name, entity);
					deleteCommandsArray.push(deleteCommand);
				}

				return deleteCommandsArray;
			},

			createDeleteCommandsArrayForContext: function(context, parentContext, deleteCommandsArray) {
				var deleteCommand;
				//create delete command for children
				var childArray = context.children;
				for (var i = 0; i < childArray._keys.length; i++) {
					var child = childArray.getAt(i);
					if (child.$$className === "Entity") {
						deleteCommandsArray = this.createDeleteCommandsArrayForEntity(child, context, deleteCommandsArray);

						//create delete command to delete this entity
						deleteCommand = new commands.DeleteEntityCommand(child, context);
						deleteCommandsArray.push(deleteCommand);

					} else if (child.$$className === "Context") {
						deleteCommandsArray = this.createDeleteCommandsArrayForContext(child, context, deleteCommandsArray);

						//create delete command to delete this context
						deleteCommand = new commands.DeleteContextCommand(child, context);
						deleteCommandsArray.push(deleteCommand);
					}
				}

				return deleteCommandsArray;
			},

			renameNode: function(oSymbol) {
				var that = this;
				var oldName = oSymbol.object.name;
				var newName = oSymbol.object.displayName;
				//validate new name
				var fileName = this.editor.model.viewModel.root.name;
				var isNewNameValid = CDSEditorUtil.validateCDSArtifactName(this.editor.model.viewModel.root, oSymbol, fileName);
				if (isNewNameValid) {
					// if success, execute command.
					var cdsObject = oSymbol.object.cdsObject;
					var symbolFullPath = CDSEditorUtil.getFullPathFromCDSObject(cdsObject);

					this.handleRename(oSymbol, cdsObject, newName, oldName);
				} else {
					//handle invlaid name condition on UI
					oSymbol.object.displayName = oldName;
				}

				/*jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
				sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show("Test Message", {
					of: that.topLayout,
					offset: "-10px -100px"
				});*/
			},

			handleRename : function(oSymbol, cdsObject, newName, oldName){
				//get all references of renamed element
				var references = [];
				references = ViewModelService.RenameService.getImpactAnalysis(cdsObject);
				var renameObjectAndReferences = true; 

				for(var i = 0; i < references.length; i++){
					var currentRef = references[i];
					if(currentRef.object.$$usingFeatures && currentRef.object.$$usingFeatures.length > 0){
						renameObjectAndReferences = false; //initialise with false here, set to true when user clicks 'Yes' on warning dialog
						//show warning dialog
						this.createWarningDialog(oSymbol, cdsObject, newName, oldName, currentRef.object.$$usingFeatures, references);
					} 
				}

				if(renameObjectAndReferences === true){
					this.callRenameCommand(oSymbol, cdsObject, newName, oldName, references);
				}
			},

			callRenameCommand : function(oSymbol, cdsObject, newName, oldName, references){
				var renameCDSArtifactCommand = new commands.RenameCDSNodeCommand(cdsObject, newName, oldName, references);
				this._execute(renameCDSArtifactCommand);

				//in the end, upodate the name on the symbol and the cds object inside the symbol
				oSymbol.object.name = newName;
				oSymbol.object.cdsObject.name = newName;

				//update the breadcrumb
				this.symbolDblClicked(oSymbol);
			},

			hideAdditionalInfo: function(oSymbol) {
				if (oSymbol) {
					if (oSymbol.object.hover){
						oSymbol.object.hover = false;
					}
					if (oSymbol.object.Fill){
						oSymbol.object.Fill = "Transparent";
					}
				}

				var hover = document.getElementsByClassName("cardinalityDetails");
				if (typeof hover !== 'undefined') {
					for (var ii = hover.length - 1; ii >= 0; ii--) {
						hover[ii].parentElement.removeChild(hover[ii]);
					}
				}
			},

			showAdditionalInfo: function(oSymbol, oEvent) {
				if (oSymbol.object.hover) {
					return;
				}
				oSymbol.object.Fill = "#005b8d";

				var sourceSymbol_Left = oSymbol.sourceSymbol.x;
				var sourceSymbol_Top = oSymbol.sourceSymbol.y;
				var targetSymbol_Left = oSymbol.targetSymbol.x;
				var targetSymbol_Top = oSymbol.targetSymbol.y;

				var targetOnLeft = true;
				var targetOnTop = true;

				if(targetSymbol_Left < sourceSymbol_Left){
					targetOnLeft = true;
				} else{
					targetOnLeft = false;
				}

				if(targetSymbol_Top < sourceSymbol_Top){
					targetOnTop = true;
				} else{
					targetOnTop = false;
				}

				var header = ""; 
				var cdsObject = oSymbol.object.cdsObject;
				header = cdsObject.cardinality;
				if (header) {
					var target_div = document.createElement("div");
					target_div.setAttribute("id", "myTooltipDiv_target");
					target_div.setAttribute("class", "cardinalityDetails");
					/*target_div.style.top = oEvent.symbolPageBBox.y + "px";
					target_div.style.left = oEvent.symbolPageBBox.x + oEvent.symbolPageBBox.width - 15 + "px";*/

					if(targetOnLeft){
						target_div.style.left = oEvent.symbolPageBBox.x + 15 + "px";
					} else{
						target_div.style.left = oEvent.symbolPageBBox.x + oEvent.symbolPageBBox.width - 15 + "px";
					}

					if(targetOnTop){
						target_div.style.top = oEvent.symbolPageBBox.y + "px";
					} else{
						target_div.style.top = oEvent.symbolPageBBox.y + oEvent.symbolPageBBox.height + "px";
					}

					//first section to show header 
					var c1Div = document.createElement("div");

					var c1DSpan = document.createElement("span");
					c1DSpan.setAttribute("class", "tHeader");

					var c1DSpanText = document.createTextNode(header);
					c1DSpan.appendChild(c1DSpanText);

					c1Div.appendChild(c1DSpan);
					target_div.appendChild(c1Div);

					//add source cardinality info if present
					if (cdsObject.srcCardinality !== "") {
						header = cdsObject.srcCardinality;
						var src_div = document.createElement("div");
						src_div.setAttribute("id", "myTooltipDiv_src");
						src_div.setAttribute("class", "cardinalityDetails");
						/*src_div.style.top = oEvent.symbolPageBBox.y + oEvent.symbolPageBBox.height + "px";
						src_div.style.left = oEvent.symbolPageBBox.x + 15 + "px";*/

						if(targetOnLeft){
							src_div.style.left = oEvent.symbolPageBBox.x + oEvent.symbolPageBBox.width - 15 + "px";
						} else{
							src_div.style.left = oEvent.symbolPageBBox.x + 15 + "px";
						}

						if(targetOnTop){
							src_div.style.top = oEvent.symbolPageBBox.y + oEvent.symbolPageBBox.height + "px";
						} else{
							src_div.style.top = oEvent.symbolPageBBox.y + "px";
						}

						var c1Div = document.createElement("div");

						var c1DSpan = document.createElement("span");
						c1DSpan.setAttribute("class", "tHeader");

						var c1DSpanText = document.createTextNode(header);
						c1DSpan.appendChild(c1DSpanText);

						c1Div.appendChild(c1DSpan);
						src_div.appendChild(c1Div);
					}

					//add oncondition info if present
					if (cdsObject.onCondition !== undefined && cdsObject.onCondition !== "") {
						header = cdsObject.onCondition;
						var onCondition_div = document.createElement("div");
						onCondition_div.setAttribute("id", "myTooltipDiv_onCond");
						onCondition_div.setAttribute("class", "cardinalityDetails");
						onCondition_div.style.top = oEvent.symbolPageBBox.y + oEvent.symbolPageBBox.height / 2 + "px";
						onCondition_div.style.left = oEvent.symbolPageBBox.x + (oEvent.symbolPageBBox.width / 2) - 15 + "px";

						var c1Div = document.createElement("div");

						var c1DSpan = document.createElement("span");
						c1DSpan.setAttribute("class", "tHeader");

						var c1DSpanText = document.createTextNode(header);
						c1DSpan.appendChild(c1DSpanText);

						c1Div.appendChild(c1DSpan);
						onCondition_div.appendChild(c1Div);
					}

					var body = document.getElementsByTagName("body")[0];
					oSymbol.object.hover = true;
					setTimeout(function() {
						if (oSymbol && oSymbol.object && oSymbol.object.hover) {
							var hover = document.getElementsByClassName("cardinalityDetails");
							/*	if (typeof hover != 'undefined') {
								for (var ii = 0; hover.length; ++ii) {
									hover[ii].parentElement.removeChild(hover[ii]);
								}
							}*/
							if (cdsObject.srcCardinality !== "") {
								body.appendChild(src_div);
							}
							if (cdsObject.onCondition !== undefined && cdsObject.onCondition !== "") {
								body.appendChild(onCondition_div);
							}
							body.appendChild(target_div);
						}
					}, 150);
				}
			},

			hideFullName: function(oEvent, oSymbol) {
				if (oSymbol) {
					if (oSymbol.object.hover){
						oSymbol.object.hover = false;
					}
					if (oSymbol.object.Fill){
						oSymbol.object.Fill = "Transparent";
					}
				}

				var hover = document.getElementsByClassName("FullPathDetails");
				if (typeof hover !== 'undefined') {
					for (var ii = hover.length - 1; ii >= 0; ii--) {
						hover[ii].parentElement.removeChild(hover[ii]);
					}
				}
			},

			showFullName: function(oEvent, oSymbol) {
				var cdsObject = oSymbol.object.cdsObject;
				if (oSymbol.object.hover) {
					return;
				}
				if (!oSymbol.isReadOnly) {
					return;
				}
				oSymbol.object.Fill = "#005b8d";

				var div = document.createElement("div");
				div.setAttribute("id", "entityFullPathDiv");
				div.setAttribute("class", "FullPathDetails");
				div.style.top = oEvent.y + "px";
				div.style.left = oEvent.x + "px";

				var header = "";
				header = CDSEditorUtil.getFullPathFromCDSObject(cdsObject);
				header = header.replace(/\//g, ".");

				if (header) {
					//first section to show header 
					var c1Div = document.createElement("div");

					var c1DSpan = document.createElement("span");
					c1DSpan.setAttribute("class", "tHeader");

					var c1DSpanText = document.createTextNode(header);
					c1DSpan.appendChild(c1DSpanText);

					c1Div.appendChild(c1DSpan);
					div.appendChild(c1Div);

					var body = document.getElementsByTagName("body")[0];
					oSymbol.object.hover = true;
					setTimeout(function() {
						if (oSymbol && oSymbol.object && oSymbol.object.hover) {
							var hover = document.getElementsByClassName("FullPathDetails");
							if (typeof hover != 'undefined') {
								for (var ii = hover.length - 1; ii >= 0; ii--) {
									hover[ii].parentElement.removeChild(hover[ii]);
								}
							}
							body.appendChild(div);
						}
					}, 150);
				}
			},

			showDataType : function(oEvent, oSymbol){
				var cdsObject = oSymbol.object.cdsObject;
				if (oSymbol.object.hover) {
					return;
				}

				oSymbol.object.Fill = "#005b8d";

				var div = document.createElement("div");
				div.setAttribute("id", "DataTypeDiv");
				div.setAttribute("class", "FullPathDetails");
				div.style.top = oEvent.y + "px";
				div.style.left = oEvent.x + "px";

				var header = "";

				if(cdsObject && cdsObject.inlineType && cdsObject.inlineType.structureType){
					header = cdsObject.inlineType.structureType;
				} else if(cdsObject && cdsObject.inlineType && cdsObject.inlineType.externalStructureType){
					header = cdsObject.inlineType.externalStructureType;
				} else{
					return ;
				}

				if (header) {
					//first section to show header 
					var c1Div = document.createElement("div");

					var c1DSpan = document.createElement("span");
					c1DSpan.setAttribute("class", "tHeader");

					var c1DSpanText = document.createTextNode(header);
					c1DSpan.appendChild(c1DSpanText);

					c1Div.appendChild(c1DSpan);
					div.appendChild(c1Div);

					var body = document.getElementsByTagName("body")[0]; 
					oSymbol.object.hover = true;
					setTimeout(function() {
						if (oSymbol && oSymbol.object && oSymbol.object.hover) {
							var hover = document.getElementsByClassName("FullPathDetails");
							if (typeof hover != 'undefined') {
								for (var ii = hover.length - 1; ii >= 0; ii--) {
									hover[ii].parentElement.removeChild(hover[ii]);
								}
							}
							body.appendChild(div);
						}
					}, 150);
				}
			},

			hideDataType : function(oEvent, oSymbol){
				if (oSymbol) {
					if (oSymbol.object.hover){
						oSymbol.object.hover = false;
					}
					if (oSymbol.object.Fill){
						oSymbol.object.Fill = "Transparent";
					}
				}

				var hover = document.getElementsByClassName("FullPathDetails");
				if (typeof hover !== 'undefined') {
					for (var ii = hover.length - 1; ii >= 0; ii--) {
						hover[ii].parentElement.removeChild(hover[ii]);
					}
				}
			},

			createWarningDialog : function(oSymbol, cdsObject, newName, oldName, usingObjects, references){
				var that = this;

				//generate string of objects using the renamed object
				var usingObjectNames = "";
				for(var k = 0; k < usingObjects.length; k++){
					if(k !== 0){
						usingObjectNames = usingObjectNames + ", ";
					}

					var currUsingObj = usingObjects[k];
					usingObjectNames = usingObjectNames + "'" + currUsingObj.getOwner().name + "'";
				}

				var yesButton = new sap.ui.commons.Button(
						{
							text : resourceLoader.getText("txt_yes"),
							style : sap.ui.commons.ButtonStyle.Emph,
							enabled : true,
							press : function(event) {
								that.callRenameCommand(oSymbol, cdsObject, newName, oldName, references);
								dialog.close();
							}
						});

				var cancelButton = new sap.ui.commons.Button({
					text : resourceLoader.getText("txt_cancel"),
					style : sap.ui.commons.ButtonStyle.Emph,
					enabled : true,
					press : function(event) {
						dialog.close();
					}
				});

				var dialog = new sap.ui.commons.Dialog(
						{
							title : resourceLoader.getText("tit_rename_confirm"),
							applyContentPadding : true,
							showCloseButton : false,
							resizable : false,
							contentBorderDesign : sap.ui.commons.enums.BorderDesign.Thik,
							modal : true,
							accessibleRole : sap.ui.core.AccessibleRole.Dialog,
							content : new sap.ui.commons.TextView({
								text :  resourceLoader
								.getText("msg_rename_warning", ["'" + cdsObject.name + "'", usingObjectNames])
							}),
							buttons : [ yesButton, cancelButton ],
							defaultButton : yesButton,
							keepInWindow : true,
							width : "80%",
							closed : function(event) {
								dialog.destroy();
							}
						});
				dialog
				.open();
			}
		}
	});
	return Editor;
});