/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../../viewmodel/model",
        "../CalcViewEditorUtil",
        "./HierarchiesDetails",
        "../dialogs/ReferenceDialog",
        "../dialogs/ExtractSemanticsDialog",
        "../CustomPanel"
    ],
	function(ResourceLoader, modelbase, commands, model, CalcViewEditorUtil, HierarchiesDetails, ReferenceDialog, ExtractSemanticsDialog,
		CustomPanel) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		/**
		 * @class
		 */
		var HierarchiesPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._model = parameters.model;
			this.viewNode = parameters.viewNode;
			this.columnnView = this._model.columnView;
			this.levelDetailsEditor;
			this.parentDetailsEditor;
			this.sharedLevelDetailsEditor;
			this.sharedParentDetailsEditor;
			var deleteButton;
			this.JSONModel = new sap.ui.model.json.JSONModel();
			this.hierTable = null;
			this.starHierTable = null;
		};

		HierarchiesPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},
			close: function() {
				if (this.detailsEditor) {
					this.detailsEditor.close();
				}
				if (this.JSONModel) {
					this.JSONModel.destroy();
				}
				this.unsubscribe();

				if (this.parentDetailsEditor) {
					this.parentDetailsEditor.close();
				}
				if (this.levelDetailsEditor) {
					this.levelDetailsEditor.close();
				}
				if (this.sharedParentDetailsEditor) {
					this.sharedParentDetailsEditor.close();
				}
				if (this.sharedLevelDetailsEditor) {
					this.sharedLevelDetailsEditor.close();
				}
			},
			unsubscribe: function() {
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CREATED, this.modelChanged, this);
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_DELETED, this.modelChanged, this);
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, this);
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, this);
			},
			getContent: function() {
				var that = this;

				this.mainLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%",
					width: "100%"
				}).addStyleClass("masterDetailsMainDiv");

				// toolbar creation
				var toolBar = that.getToolBar();

				this.mainLayout.addContent(toolBar);

				var splitter = new sap.ui.commons.Splitter({
					//showScrollBars: true,
					splitterBarVisible: true,
					splitterOrientation: sap.ui.core.Orientation.Vertical,
					minSizeFirstPane: "20%",
					splitterPosition: "30%",
					height: "100%"
				}).addStyleClass("masterDetailsSplitter");

				this.splitter = splitter;
				this.splitter.addFirstPaneContent(this.getMasterListContent());

				//return this.splitter;
				// this.mainLayout.createRow(splitter);
				this.mainLayout.addContent(this.splitter);
				return this.mainLayout;
			},
			getToolBar: function() {
				var that = this;
				var toolBar = new sap.ui.commons.Toolbar({
					width: "100%",
					items: []
				}).addStyleClass("parameterToolbarStyle");

				var addMenuButton = new sap.ui.commons.MenuButton({
					icon: "sap-icon://add", //resourceLoader.getImagePath("Add.png"),
					// text: resourceLoader.getText("tol_add"),
					tooltip: resourceLoader.getText("tol_add"),
					itemSelected: function(oevent) {
						var name = oevent.getParameter("item").getText();
						if (name === "Level Hierarchy") {
							var hierarchyName = that.getNextParameterName("LEVEL");
							var createCommand = new commands.AddHierarchyCommand({
								objectAttributes: {
									name: hierarchyName,
									label: "",
									type: model.HierarchyType.LEVELED,
									nodeStyle: model.NodeStyle.LEVELNAMEENFORCED,
									rootNodeVisibility: model.RootNodeVisibility.ADD_ROOT_NODE,
									orphanedNodesHandling: model.OrphanedNodesHandling.ROOT_NODES,
									aggregateAllNodes: true
								}
							});
							that._execute(createCommand);
							//  that.updateData();
						} else if (name === "Parent Child Hierarchy") {
							var hierarchyName = that.getNextParameterName("PARENT");
							var createCommand = new commands.AddHierarchyCommand({
								objectAttributes: {
									name: hierarchyName,
									label: "",
									type: model.HierarchyType.PARENT_CHILD,
									rootNodeVisibility: model.RootNodeVisibility.ADD_ROOT_NODE_IF_DEFINED,
									orphanedNodesHandling: model.OrphanedNodesHandling.ROOT_NODES,
									aggregateAllNodes: true
								}
							});
							that._execute(createCommand);
							// that.updateData();
						}
					},
					menu: new sap.ui.commons.Menu({
						items: [new sap.ui.commons.MenuItem({
								text: "Level Hierarchy",
								icon: resourceLoader.getImagePath("Hierarchy.png"),
								attachSelect: function(oevent) {}
							}),
                            new sap.ui.commons.MenuItem({
								text: "Parent Child Hierarchy",
								icon: resourceLoader.getImagePath("ParentChildHierarchy.png"),
								attachSelect: function(oevent) {}
							})
                        ]
					})

				});

				this.deleteButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //"sap-icon://decline", //resourceLoader.getImagePath("Delete.png"),
					// text: resourceLoader.getText("tol_remove"),
					tooltip: resourceLoader.getText("tol_remove"),
					enabled: {
						path: " ",
						formatter: function() {
							if (that.JSONModel.getData() && that.JSONModel.getData().length > 0) {
								if (that.table.getSelectedIndices().length > 0) {
									return true;
								}
							} else {
								return false;
							}
						}
					},
					press: function() {

						var selectedIndex = that.table.getSelectedIndex();
						var hierarchy = that.columnnView.inlineHierarchies.getAt(selectedIndex);
						if (hierarchy) {
							var callBack = function(result) {
								if (result) {
									that._execute(new modelbase.DeleteCommand(hierarchy, false));
								}
							};
							var referenceDialog = new ReferenceDialog({
								element: [hierarchy],
								isRemoveCall: true,
								fnCallbackMessageBox: callBack
							});
							referenceDialog.openMessageDialog();

						}

					}
				});

				toolBar.addItem(addMenuButton);
				toolBar.addItem(this.deleteButton);

				if (!this.viewNode.isScriptNode()) {

					var extractSemantics = function() {
						var extractSemanticsDialog = new ExtractSemanticsDialog({
							undoManager: that._undoManager,
							columnView: that._model.columnView,
							focusOnHierarchy: true
							// this.selectedObjects = parameters.selection,
						});
						extractSemanticsDialog.open();
					};
					var extractButton = new sap.ui.commons.Button({
						icon: resourceLoader.getImagePath("extractSemantics2.png"),
						tooltip: resourceLoader.getText("tit_extract_semantics"),
						press: extractSemantics
					});
					toolBar.addItem(extractButton);
				}

				return toolBar;
			},
			getMasterListContent: function() {
				var that = this;
				if (this.viewNode.name === "Star Join" || this.viewNode.type === "JoinNode") {
					this.splitterHierarchies = new sap.ui.commons.Splitter({
						showScrollBars: false,
						splitterBarVisible: true,
						splitterOrientation: sap.ui.core.Orientation.Horizontal,
						// minSizeFirstPane: "50%",
						splitterPosition: "50%",
						height: "100%"
					}).addStyleClass("masterDetailsSplitter");

					this.localPanel = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomPanel({
						height: "100%",
						applyContentPadding: false,
						onCollapseClick: function(event) {
							if (event.source) {
								alert(event.source);
							}
							alert("clicked");
						}
					});
					this.localPanel.setText("Local Hierarchies");
					this.localPanel.addContent(this.getLocalHierarchiesContent());
					this.localPanel.setCollapsed(false);
					var sharedPanel = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.CustomPanel({
						height: "100%",
						applyContentPadding: false
					});
					sharedPanel.setText("Shared Hierarchies");
					sharedPanel.addContent(this.getSharedHierarchiesContent());
					sharedPanel.setCollapsed(false);
					this.splitterHierarchies.addFirstPaneContent(this.localPanel);
					this.splitterHierarchies.addSecondPaneContent(sharedPanel);
					that.doFirstSelection();
					return this.splitterHierarchies;
				} else {
					var content = this.getLocalHierarchiesContent();
					that.doFirstSelection();
					return content;
				}
				//   return this.getLocalHierarchiesContent();

			},
			getLocalHierarchiesContent: function() {

				var that = this;
				var commentValue;
				// Name template     
				var icon = new sap.ui.commons.Image({
					src: "{icon}"
				});
				icon.bindProperty("tooltip", "tooltip");
				var nameText = new sap.ui.commons.TextField({
					wrapping: true,
					editable: false,
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
								    this.getParent().getParent().getParent().setSelectedIndex(this.getParent().getParent().getIndex());
									return "focus";
								} else {
									return "none";
								}
							}
						}

                          }]
				});
				nameText.bindProperty("value", "name");

				// Label template    
				var labelText = new sap.ui.commons.TextField({
					editable: false
				});
				labelText.bindProperty("value", "label");

				//Comments
				var changeComments = function(event) {

					var textArea = event.getSource();

					var bindingContext = textArea.getBindingContext();
					var inlineHierarchy = bindingContext.getObject();
					var value = event.getParameter("newValue");
					var attributes = {};
					if (commentValue || commentValue === "") {
						value = commentValue;
					}
					attributes.endUserTexts = {
						comment: {
							text: value,
							mimetype: "text/plain"
						}
					};

					var command = new commands.ChangeHierarchyCommand(inlineHierarchy.inlineHierarchy.name, attributes);
					if (value || value === "") {
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
						var bindingContext = commentField.getBindingContext();
						var inlineHierarchy = bindingContext.getObject();
						var attributes = {};
						attributes.endUserTexts = {
							comment: {
								text: "",
								mimetype: "text/plain"
							}
						};
						var command = new commands.ChangeHierarchyCommand(inlineHierarchy.inlineHierarchy.name, attributes);
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
						parts: ["inlineHierarchy"],
						formatter: function(inlineHierarchy) {
							var comment = "";
							if (inlineHierarchy) {
								comment = inlineHierarchy.endUserTexts !== undefined ? inlineHierarchy.endUserTexts.comment.text : "";
							}
							comment = comment ? (comment.trim()) : comment;
							if ((comment !== "") && (comment !== undefined)) {
								return resourceLoader.getImagePath("Note.png", "analytics");
							} else {
								return resourceLoader.getImagePath("Note_grayscale.png", "analytics");
							}

						}
					},
					tooltip: {
						parts: ["inlineHierarchy"],
						formatter: function(inlineHierarchy) {
							var comment = "";
							if (inlineHierarchy) {
								comment = inlineHierarchy.endUserTexts !== undefined ? inlineHierarchy.endUserTexts.comment.text : "";
							}

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
						var inlineHierarchy = this.getParent().getBindingContext().getObject();
						commentField.setBindingContext(this.getParent().getBindingContext());
						if (tpComments.isOpen()) {

							tpComments.close();
						} else {
							var comment = inlineHierarchy.inlineHierarchy.endUserTexts !== undefined ? inlineHierarchy.inlineHierarchy.endUserTexts.comment.text :
								"";
							commentField.setValue(comment);
							tpComments.open(sap.ui.core.Popup.Dock.BeginCenter, sap.ui.core.Popup.Dock.EndCenter);

						}
					}

				});
				commentImage.addStyleClass("commentImage");
				var columns = [new sap.ui.table.Column({
					autoResizable: false,
					resizable: false,
					template: commentImage,
					width: "50px",
					label: new sap.ui.commons.Label({
						//text: "Notes"
					})
				}), new sap.ui.table.Column({
					autoResizable: false,
					resizable: false,
					template: icon,
					width: "30px"
				}), new sap.ui.table.Column({
					autoResizable: false,
					resizable: true,
					template: nameText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_name"),
						requiredAtBegin: true,
						textAlign: sap.ui.core.TextAlign.Begin
					})
				})];

				columns.push(new sap.ui.table.Column({
					autoResizable: true,
					resizable: true,
					template: labelText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_label"),
						textAlign: sap.ui.core.TextAlign.Begin
					})
				}));

				var updateTable = function(hierarchy) {
					if (hierarchy) {
						that.JSONModel.getData()[that.table.getSelectedIndex()].name = hierarchy.name;
						that.JSONModel.getData()[that.table.getSelectedIndex()].label = hierarchy.label;
						that.JSONModel.updateBindings(true);
					} else {
						that.updateData();
					}
				};

				// Table creation     
				this.table = new sap.ui.table.Table({
					editable: false,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					noData: "no hierarchies",
					height: "100%",
					minAutoRowCount: 7,
					//  fixedRowCount:7,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					selectionMode: sap.ui.table.SelectionMode.Single,
					columns: columns,
					rowSelectionChange: function(oevent) {
						that.deleteButton.setEnabled(true);
						var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
						if (bindContext) {
							if (that.sharedTable) {
								that.sharedTable.clearSelection();
							}
							var element = bindContext.getProperty("inlineHierarchy");
							if (element.type === "LeveledHierarchy") {
								if (!that.levelDetailsEditor) {
									that.levelDetailsEditor = new HierarchiesDetails({
										undoManager: that._undoManager,
										viewNode: that.viewNode,
										columnView: that._model.columnView,
										updateMasterTable: updateTable,
										type: "level"
									});
								}
								that.levelDetailsEditor.updateDetails(element);
								var length = that.splitter.getSecondPaneContent().length;
								if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent() !== that.levelDetailsEditor.getContent())) {
									that.splitter.removeAllSecondPaneContent();
									that.splitter.addSecondPaneContent(that.levelDetailsEditor.getContent());
								}
							} else {
								if (!that.parentDetailsEditor) {
									that.parentDetailsEditor = new HierarchiesDetails({
										undoManager: that._undoManager,
										viewNode: that.viewNode,
										columnView: that._model.columnView,
										updateMasterTable: updateTable,
										type: "parent"
									});
								}
								that.parentDetailsEditor.updateDetails(element);
								var length = that.splitter.getSecondPaneContent().length;
								if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent()[0] !== that.parentDetailsEditor.getContent())) {
									that.splitter.removeAllSecondPaneContent();
									that.splitter.addSecondPaneContent(that.parentDetailsEditor.getContent());
								}
							}
						}
					}
				});

				this.table.bindRows("/");
				this.table.setModel(this.JSONModel);

				this.updateData();

				that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CREATED, that.modelChanged, that);
				that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_DELETED, that.modelChanged, that);
				that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, that);
				that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, that);

				that.hierTable = this.table;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("hi1", this.table);
					this._findandhighlight.unRegisterTable("hi2");
				}
				return this.table;
			},
			getSharedHierarchiesContent: function() {
				var that = this;

				// Name template     
				var icon = new sap.ui.commons.Image({
					src: "{icon}"
				});
				icon.bindProperty("tooltip", "tooltip");
				var nameText = new sap.ui.commons.TextField({
					wrapping: true,
					editable: false,
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
				});
				nameText.bindProperty("value", "name");

				// Label template    
				var labelText = new sap.ui.commons.TextField({
					editable: false
				});
				labelText.bindProperty("value", "label");

				var columns = [new sap.ui.table.Column({
					autoResizable: false,
					resizable: false,
					template: icon,
					width: "30px"
				}), new sap.ui.table.Column({
					autoResizable: false,
					resizable: true,
					template: nameText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_name"),
						requiredAtBegin: true,
						textAlign: sap.ui.core.TextAlign.Begin
					})
				})];

				columns.push(new sap.ui.table.Column({
					autoResizable: true,
					resizable: true,
					template: labelText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_label"),
						textAlign: sap.ui.core.TextAlign.Begin
					})
				}));

				var updateTable = function(hierarchy) {
					if (hierarchy) {
						that.JSONModel.getData()[that.table.getSelectedIndex()].name = hierarchy.name;
						that.JSONModel.getData()[that.table.getSelectedIndex()].label = hierarchy.label;
						that.JSONModel.updateBindings(true);
					} else {
						that.updateData();
					}
				};

				// Table creation     
				this.sharedTable = new sap.ui.table.Table({
					editable: false,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					noData: "no hierarchies",
					height: "100%",
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					minAutoRowCount: 7,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					selectionMode: sap.ui.table.SelectionMode.Single,
					columns: columns,
					rowSelectionChange: function(oevent) {
						if (that.table) {
							that.table.clearSelection();
							if (that.deleteButton) {
								that.deleteButton.setEnabled(false);
							}
						}
						var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
						if (bindContext) {
							var element = bindContext.getProperty("inlineHierarchy");
							if (element.type === "LeveledHierarchy") {
								if (!that.sharedLevelDetailsEditor) {
									that.sharedLevelDetailsEditor = new HierarchiesDetails({
										undoManager: that._undoManager,
										viewNode: that.viewNode,
										columnView: that._model.columnView,
										updateMasterTable: updateTable,
										isSharedElement: true,
										type: "level"
									});
								}
								that.sharedLevelDetailsEditor.updateDetails(element);
								var length = that.splitter.getSecondPaneContent().length;
								if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent() !== that.sharedLevelDetailsEditor.getContent())) {
									that.splitter.removeAllSecondPaneContent();
									that.splitter.addSecondPaneContent(that.sharedLevelDetailsEditor.getContent());
								}
							} else {
								if (!that.sharedParentDetailsEditor) {
									that.sharedParentDetailsEditor = new HierarchiesDetails({
										undoManager: that._undoManager,
										viewNode: that.viewNode,
										columnView: that._model.columnView,
										updateMasterTable: updateTable,
										isSharedElement: true,
										type: "parent"
									});
								}
								that.sharedParentDetailsEditor.updateDetails(element);
								var length = that.splitter.getSecondPaneContent().length;
								if (length === 0 || (length > 0 && that.splitter.getSecondPaneContent()[0] !== that.sharedParentDetailsEditor.getContent())) {
									that.splitter.removeAllSecondPaneContent();
									that.splitter.addSecondPaneContent(that.sharedParentDetailsEditor.getContent());
								}
							}
						}
					}
				});

				this.sharedTable.bindRows("/");

				var data = this.getSharedData();
				var sharedJSONModel = new sap.ui.model.json.JSONModel(data);

				this.sharedTable.setModel(sharedJSONModel);

				this.updateData();

				/* if (this.sharedTable.getModel() && this.sharedTable.getModel().oData && this.sharedTable.getModel().oData.length > 0) {
                    this.sharedTable.setSelectedIndex(0);
                    this.sharedTable.fireRowSelectionChange();
                }*/

				// that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CREATED, that.modelChanged, that);
				// that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_DELETED, that.modelChanged, that);
				// that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.HIERARCHY_CHANGED, this.modelChanged, that);
				// that._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETER_CHANGED, this.modelChanged, that);

				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("hi2", this.sharedTable);
				}
				this.starHierTable = this.sharedTable;
				return this.sharedTable;
			},

			modelChanged: function(events) {
				var that = this;
				var hierarchiesData = that.JSONModel.getData();
				if (events.type === commands.ViewModelEvents.HIERARCHY_CREATED) {
					var index = that.getHierarchyIndex(events.name);
					that.updateData();
					that.table.setSelectedIndex(index);
					that.table.fireRowSelectionChange();
				} else if (events.type === commands.ViewModelEvents.HIERARCHY_DELETED) {
					var index = that.getOldHierarchyIndex(events.name, hierarchiesData);
					that.updateData();
					if (index === 0) {
						if (that.columnnView.inlineHierarchies.count() > 0) {
							that.table.setSelectedIndex(index);
							that.table.fireRowSelectionChange();
						} else {
							if (that.sharedTable && that.sharedTable.getModel() && that.sharedTable.getModel().oData && that.sharedTable.getModel().oData.length >
								0) {
								that.sharedTable.setSelectedIndex(0);
								that.sharedTable.fireRowSelectionChange();
								that.deleteButton.setEnabled(false);
							} else {
								that.splitter.removeAllSecondPaneContent();
								that.deleteButton.setEnabled(false);
							}
						}
					} else {
						that.table.setSelectedIndex(index - 1);
						that.table.fireRowSelectionChange();
					}
				} else if (events.type === commands.ViewModelEvents.HIERARCHY_CHANGED) {
					var index = that.table.getSelectedIndex();
					that.updateData();
					that.table.setSelectedIndex(index);
				}
			},
			doFirstSelection: function() {
				if (this.table && this.table.getModel() && this.table.getModel().oData && this.table.getModel().oData.length > 0) {
					this.table.setSelectedIndex(0);
					this.table.fireRowSelectionChange();
				} else if (this.sharedTable && this.sharedTable.getModel() && this.sharedTable.getModel().oData && this.sharedTable.getModel().oData.length >
					0) {
					this.sharedTable.setSelectedIndex(0);
					this.sharedTable.fireRowSelectionChange();
				}
			},
			getHierarchyIndex: function(name) {
				var that = this;
				var requiredIndex = -1;
				for (var i = 0; i <= that.columnnView.inlineHierarchies.count(); i++) {
					var inlineHierarchy = that.columnnView.inlineHierarchies.getAt(i);
					if (inlineHierarchy && inlineHierarchy.name === name) {
						requiredIndex = i;
					}
				}
				return requiredIndex;
			},
			getOldHierarchyIndex: function(name, hierarchiesData) {
				var that = this;
				var requiredIndex = -1;
				for (var i = 0; i <= hierarchiesData.length; i++) {
					var inlineHierarchy = hierarchiesData[i];
					if (inlineHierarchy && inlineHierarchy.name === name) {
						requiredIndex = i;
					}
				}
				return requiredIndex;
			},
			getData: function() {
				var that = this;
				var columnsData = [];
				that.columnnView.inlineHierarchies.foreach(function(inlineHierarchy) {
					var proxy = "";
					var proxyResults = that.isBasedOnElementProxy(inlineHierarchy);
					if (proxyResults) {
						proxy = "proxy/";
					}
					columnsData.push({
						name: inlineHierarchy.name,
						label: inlineHierarchy.label,
						icon: inlineHierarchy.type === "LeveledHierarchy" ? resourceLoader.getImagePath(proxy + "Hierarchy.png") : resourceLoader.getImagePath(
							proxy + "ParentChildHierarchy.png"),
						tooltip: proxyResults ? proxyResults : undefined,
						inlineHierarchy: inlineHierarchy,
						seq: "none",
						focus: "none"
					});
				});
				return columnsData;
			},
			getSharedData: function() {
				var that = this;
				var columnsData = [];
				this.viewNode.inputs.foreach(function(input) {
					if (input.getSource().inlineHierarchies) {
						input.getSource().inlineHierarchies.foreach(function(inlineHierarchy) {
							var proxy = "";
							var proxyResults = that.isBasedOnElementProxy(inlineHierarchy);
							if (proxyResults) {
								proxy = "proxy/";
							}
							columnsData.push({
								name: inlineHierarchy.name,
								label: inlineHierarchy.label,
								icon: inlineHierarchy.type === "LeveledHierarchy" ? resourceLoader.getImagePath(proxy + "Hierarchy.png") : resourceLoader.getImagePath(
									proxy + "ParentChildHierarchy.png"),
								tooltip: proxyResults ? proxyResults : undefined,
								inlineHierarchy: inlineHierarchy,
								seq: "none",
								focus: "none"
							});
						});
					}

				});

				return columnsData;
			},
			isBasedOnElementProxy: function(element) {
				if (element) {
					var results = CalcViewEditorUtil.isBasedOnElementProxy({
						object: element,
						columnView: this.columnnView,
						viewNode: this.viewNode
					});
					if (results) {
						return CalcViewEditorUtil.consolidateResults(results, {
							elementType: "hierarchy"
						});
					}
				}
				return false;
			},
			getNextParameterName: function(name) {
				var hierarchyName = name + "_" + 1;
				var gotName = true;
				var count = 2;
				while (gotName) {
					if (this.columnnView.inlineHierarchies.get(hierarchyName)) {
						hierarchyName = name + "_" + count;
						count++;
					} else {
						gotName = false;
					}
				}
				return hierarchyName;
			},
			updateData: function() {
				var data = this.getData();
				this.JSONModel.setData(data);
				this.JSONModel.updateBindings(true);
			},
			updateTable:function(){
				var that = this;
				if (this._findandhighlight !== undefined) {
					this._findandhighlight.registerTable("hi1", that.hierTable);
				}
				if (that.starHierTable !== null) {
					if (this._findandhighlight !== undefined) {
						this._findandhighlight.registerTable("hi2", that.starHierTable);
					}

				}

			}

		};

		return HierarchiesPane;

	});
