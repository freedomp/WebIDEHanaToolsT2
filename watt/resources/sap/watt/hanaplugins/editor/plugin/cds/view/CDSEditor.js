/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "require",
        "../util/ResourceLoader",
        "./DetailsPane",
        "./CDSEditorUtil",
        "../model/Parser",
        "../model/Renderer",
        "../model/model",
        "../model/commands",
        "../../hdbcalculationview/base/modelbase",
        "../control/EditorContainer",
        "../control/EditorLayout"
        ], 
        function(
        		require,
        		ResourceLoader,
        		DetailsPane,
        		CDSEditorUtil,
        		Parser,
        		Renderer,
        		viewmodel,
        		commands,
        		modelbase
        ) {
	"use strict";
	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
	var ViewModelEvents = commands.ViewModelEvents;

	function requireWithPromise(moduleName) {
		var q = Q.defer();
		require([moduleName], function(module) {
			if (!module) {
				q.reject(moduleName + " could not be loaded. The file exists," +
				" but is defining a module with a different name. Please remove the module name or adjust it.");
			} else {
				q.resolve(module);
			}
		}, function(e) {
			q.reject(new Error("Error loading module from path '" + moduleName + "'" + "\nOriginal error message: " + e.message +
					"\nError stack: " + e.stack + "\n -----------"));
		});
		return q.promise;
	}

	var CDSEditor = function(context, oDocument) {
		this._context = context;
		this._document = oDocument;
		this._context.packageName = this.getPackageName();
		this._model = new viewmodel.CDSModel(true);
		this._undoManager = this._model.$getUndoManager();
		this._display = null;
		this._detailsPane = null;
		this._rendered = false;
		this._hidden = false;
		this._editorLayout = null;
		this._flushedContent = null;
		this._changed = false;
		this._documentProperties = {
				spacesAfterDocumentElement: ""
		};
		this.init();
	};

	CDSEditor.prototype = {

			getModel: function() {
				return this._model;
			},

			getContent: function() {
				return this._display;
			},
			getPackageName: function() {
				if (this._document) {
					var fullName = this._document.getKeyString();
					var names = fullName.split("/");
					var packageName;
					if (names.length > 2) {
						for (var i = 1; i < (names.length - 1); i++) {
							if (packageName) {
								packageName = packageName + "." + names[i];
							} else {
								packageName = names[i];
							}
						}
					}
					return packageName;
				}
			},

			init: function() {
				var that = this;

				if (this._rendered) {
					return;
				}
				this._rendered = true;

				//this._editorLayout = new sap.hana.ide.editor.plugin.cds.control.EditorLayout();

				this._editorLayout = new sap.ui.layout.VerticalLayout({ //new sap.ui.commons.layout.VerticalLayout({
					//height: "100%",
					width: "100%"
				});

				var breadcrumb = new sap.ui.commons.Link({
					//text: "blah",
					enabled: false
				});

				this.breadcrumbLayout = new sap.ui.layout.HorizontalLayout ({ //new sap.ui.commons.layout.HorizontalLayout({
					//height: "100%",
					content: [breadcrumb]
				}).addStyleClass("cdsEditorBreadcrumb");

				var topVerticalLayout = new sap.ui.layout.VerticalLayout({ //new sap.ui.commons.layout.VerticalLayout({
					//height: "100%"
				}).addStyleClass("cdsEditorMainVLayout");
				topVerticalLayout.addContent(this.breadcrumbLayout);
				topVerticalLayout.addContent(this._editorLayout);

				this._display = new sap.watt.hanaplugins.editor.plugin.cds.control.Editor({
					hidden: this._hidden,
					content: topVerticalLayout
				});

				//this._editorLayout.addStyleClass("cdsEditorMain");
				this._editorLayout.addStyleClass("editorMain");

				this._detailsPane = new DetailsPane();

				var modelEvents = this._model.$getEvents();
				modelEvents.subscribe(ViewModelEvents.CHANGED, this.onUndoManagerStateChanged, this);
			},

			_getTrailingSpaces: function() {
				if (!this._trailingSpaces) {
					this._trailingSpaceIndex = 1;
					if (this._documentProperties.spacesAfterDocumentElement.length > 1) {
						this._trailingSpaces = ["", " "];
					} else {
						this._trailingSpaces = ["  ", "   "];
					}
				}
				this._trailingSpaceIndex = 1 - this._trailingSpaceIndex;
				return this._trailingSpaces[this._trailingSpaceIndex];
			},

			onUndoManagerStateChanged: function() {
				// make a dummy change to invalidate the document
				var that = this;
				this._document.getContent().then(function(currValue) {
					if (!currValue || !that._flushedContent) {
						return Q();
					}
					that._changed = true;
					return that._document.setContent(that._flushedContent + that._getTrailingSpaces(), that._context.self);
				}).done();
			},

			setHidden: function(hidden) {
				this._hidden = hidden;
				if (this._display) {
					this._display.setHidden(hidden);
				}
			},

			getHidden: function() {
				return this._hidden;
			},

			_updateEditorContent: function(content) {
				if (this._editorLayout.getContent() && this._editorLayout.getContent()[0] === content) {
					return;
				}
				// change content
				this._editorLayout.removeAllContent();
				this._editorLayout.addContent(content);
			},

			_nodeSelected: function(object) {
				var selectedTabKey;
				var that = this;
				var selectedNode;
				if (object instanceof modelbase.AbstractModelClass) {
					selectedNode = object;
				} else if (object && object.name instanceof modelbase.AbstractModelClass) {
					selectedNode = object.name;
					if (object.name instanceof viewmodel.Association) {
						selectedNode = object.name.sourceEntity;
						selectedTabKey = "details_associations";

					} else if (object.name instanceof viewmodel.Element) {
						selectedNode = object.name.sourceEntity;
						selectedTabKey = "details_columns";
					}
				} else {
					return;
				}

				if (!(this._model.root instanceof viewmodel.Entity) && that._currentNode === selectedNode) {
					return;
				}

				that._previousNode = that._currentNode;
				that._currentNode = selectedNode;

				//update breadcrumbs for the selected node
				this.updateBreadCrumbs();

				if (this._currentNode instanceof viewmodel.Context) {
					// Update Diagram
					this._updateEditorContent(this.diagramPane.getContent());
					this.diagramPane.update(this._currentNode);
				} else if (this._currentNode instanceof viewmodel.Entity) {
					this._updateEditorContent(this._detailsPane.getContent(true));
				}
				this._reloadSecondPane(selectedTabKey).done();

			},

			updateBreadCrumbs: function() {
				this.breadcrumbLayout.destroyContent();
				var fileName = this._model.root.name;
				if (this._model.root instanceof viewmodel.Entity) {
					//root is Entity . swap diagram/details
					/*if (this.diagramPane && this._editorLayout.getContent() && this._editorLayout.getContent()[0] === this.diagramPane.getContent()) {
						this._createBreadCrumbItem(fileName, true, this._model.root);
					} else {
						// show diagram
						if (this.diagramPane) {
							this._updateEditorContent(this.diagramPane.getContent());
						}
						this._createBreadCrumbItem(fileName, false, this._model.root);
					}*/
					this._createBreadCrumbItem("Diagram /", true, this._model.root, true);
					this._createBreadCrumbItem(fileName, true, this._model.root);
				} else {
					//var selectedSymbolFullPath = CDSEditorUtil.getCDSArtifactFullPath(selectedSymbol, fileName, undefined);
					var selectedObjectFullPath = CDSEditorUtil.getFullPathFromCDSObject(this._currentNode);
					var pathNodesArray = selectedObjectFullPath.split("/");
					var currentPathArray = [];
					var nodeEnabled = true;
					var text;
					for (var i = 0; i < pathNodesArray.length; i++) {
						if (i === pathNodesArray.length - 1) {
							text = pathNodesArray[i]; //if last node, do not add "/" and set the link as disabled 
							nodeEnabled = false;
						} else {
							text = pathNodesArray[i] + "  /";
							nodeEnabled = true;
						}
						var parentObject = CDSEditorUtil.getCDSModelFromFullPath(this._model.root, currentPathArray.join("/"), pathNodesArray[i], undefined);
						currentPathArray.push(pathNodesArray[i]);
						var currentObject = CDSEditorUtil.getCDSModelFromFullPath(this._model.root, currentPathArray.join("/"), pathNodesArray[i], undefined);

						//create a breadcrumb and add to horizontal layout
						this._createBreadCrumbCombo(text, nodeEnabled, currentObject, parentObject);

					}
				}
			},

			_createBreadCrumbCombo: function(text, nodeEnabled, object, parentObject) {
				var that = this;
				//create a breadcrumb and add to horizontal layout
				var breadcrumb = new sap.ui.commons.Link({
					text: text,
					enabled: nodeEnabled,
					press: function(event) {
						// Load Diagram
						that._nodeSelected(this.getModel().getData().object);
					}
				});
				var model = new sap.ui.model.json.JSONModel();
				var data = {
						object: object
				};

				model.setData(data);
				breadcrumb.setModel(model);

				var image = new sap.ui.commons.Image({
					src: object instanceof viewmodel.Context ? resourceLoader.getImagePath("Constant.png") : resourceLoader.getImagePath("Table.png")
				});
				this.breadcrumbLayout.addContent(image);

				if (parentObject && parentObject.children && parentObject.children.count() > 1 && nodeEnabled) {
					//Create a MenuButton Control
					var oMenuButton = new sap.ui.commons.MenuButton({
						text: object.name
					});

					//Create the menu
					var oMenu = new sap.ui.commons.Menu();
					//Create the items and add them to the menu

					parentObject.children.foreach(function(child) {
						var oMenuItem = new sap.ui.commons.MenuItem({
							text: child.name,
							icon: child instanceof viewmodel.Context ? resourceLoader.getImagePath("Constant.png") : resourceLoader.getImagePath("Table.png")
						});
						model = new sap.ui.model.json.JSONModel();
						data = {
								object: child
						};

						model.setData(data);
						oMenuItem.setModel(model);
						oMenu.addItem(oMenuItem);
					});

					//Attach the Menu to the MenuButton
					oMenuButton.setMenu(oMenu);

					//Attach an event to raise an alert when an item is selected.
					oMenuButton.attachItemSelected(function(oEvent) {

						var obj = oEvent.getParameter("item").getModel().getData().object;
						that._nodeSelected(obj);
						//alert("Items \"" + oEvent.getParameter("itemId") + "\" was selected.");
					});
					this.breadcrumbLayout.addContent(oMenuButton);
					this.breadcrumbLayout.addContent(new sap.ui.commons.Label({
						text: " /"
					}));
				} else {
					this.breadcrumbLayout.addContent(breadcrumb);
				}
			},

			_createBreadCrumbItem: function(text, nodeEnabled, object, isDiagram) {
				var that = this;
				//create a breadcrumb and add to horizontal layout
				var breadcrumb = new sap.ui.commons.Link({
					text: text,
					enabled: nodeEnabled,
					press: function(event) {
						// Load Diagram
						if (isDiagram) {
							that._updateEditorContent(that.diagramPane.getContent());
						} else {
							that._nodeSelected(this.getModel().getData().object);
						}
					}
				});
				var model = new sap.ui.model.json.JSONModel();
				var data = {
						object: object
				};

				model.setData(data);
				breadcrumb.setModel(model);
				if (!isDiagram) {
					var image = new sap.ui.commons.Image({
						src: object instanceof viewmodel.Context ? resourceLoader.getImagePath("Constant.png") : resourceLoader.getImagePath("Table.png")
					});
					this.breadcrumbLayout.addContent(image);
				}
				this.breadcrumbLayout.addContent(breadcrumb);
			},

			_reloadContent: function(isOpen) {
				var that = this;
				var previousNode = this._currentNode;
				var resolverResult = Q.defer();
				if (isOpen) {
					this._model.$getEvents().subscribe(ViewModelEvents.CHANGED, this._modelChanged, this);
					this._model.root.$getEvents().subscribe(ViewModelEvents.NODE_SELECTED, this._nodeSelected, this);
					this.updateBreadCrumbs();
					that._reloadEditor(true, previousNode).done(resolverResult.resolve);
				} else {
					that._reloadEditor(false, previousNode).done(resolverResult.resolve);
				}
				return resolverResult.promise;
			},

			_modelChanged: function(event) {
				this._refreshSecondPane();
			},

			_reloadEditor: function(isOpen, previousNode) {
				var that = this;
				/*if (!that._model || that._model.$isDisposed()) {
					return Q();
				}*/
				if (isOpen) {

					return Q.all([
					              that._reloadSecondPane(),
					              requireWithPromise("./diagram/DiagramPane").then(function(DiagramPane) {
					            	  /*if (!that._model || that._model.$isDisposed()) {
								return Q();
							}*/
					            	  that.diagramPane = new DiagramPane(that._model, that._context);
					            	  that._editorLayout.addContent(that.diagramPane.getContent());
					              })
					              ]);

				} else {
					return this._reloadSecondPane();
				}
			},

			_reloadSecondPane: function(defaultPane) {
				var that = this;
				// allow to wait for details pane to be initialized
				var promise = Q();
				/*if (!that._model || that._model.$isDisposed()) {
					return promise;
				}*/

				var selectedNode = this._currentNode;
				var items = [];

				if(!defaultPane){
					defaultPane = "details_columns";
				}

				//if (selectedNode instanceof viewmodel.Entity) {

				items.push({
					key: "details_columns",
					text: resourceLoader.getText("tit_columns"),
					count: "columns/length",
					modelKey: "entity",
					content: {
						creator: "./columns/ColumnsPane",
						parameters: {
							undoManager: this._undoManager,
							model: this._model,
							entity: selectedNode,
							context: this._context
						}
					}
				});

				items.push({
					key: "details_associations",
					text: resourceLoader.getText("tit_associations"),
					count: "associations/length",
					modelKey: "entity",
					content: {
						creator: "./columns/AssociationsPane",
						parameters: {
							undoManager: this._undoManager,
							model: this._model,
							entity: selectedNode,
							context: this._context
						}
					}
				});

				/*items.push({
						key: "details_index",
						text: resourceLoader.getText("tit_indices"),
						//count: "columns/length",
						modelKey: "entity",
						content: {
							creator: "./index/IndexPane",
							parameters: {
								undoManager: this._undoManager,
								model: this._model
							}
						}
					});*/
				//}

				var callback = function() {
					if (that._model.root instanceof viewmodel.Entity) {
						that._updateEditorContent(that.diagramPane.getContent());
					} else {
						if (that._previousNode) {
							that._nodeSelected(that._previousNode);
						}
					}
				};

				promise = this._detailsPane.setItems(items, defaultPane, selectedNode ? selectedNode.name : "Details Pane", callback);

				this._refreshSecondPane();
				return promise;
			},

			_refreshSecondPane: function() {
				var that = this;
				var cdsArtifact = this._model.root;

				if (this._currentNode) {
					cdsArtifact = this._currentNode;
				}

				/*this._model._entities.foreach(function(entityObj) {
					entity = entityObj;
				})*/

				var entityProperties = {
						columns: [],
						associations: []
				};

				if (cdsArtifact instanceof viewmodel.Entity) {
					cdsArtifact.elements.foreach(function(element) {
						if (element instanceof viewmodel.Element) {
							entityProperties.columns.push(CDSEditorUtil.createModelForElement(element, that._model.root, cdsArtifact));
						} else if (element instanceof viewmodel.Association) {
							entityProperties.associations.push(CDSEditorUtil.createModelForAssociation(element, that._model.root, cdsArtifact));
						}
					});
				}

				this._detailsPane.setModelData("entity", entityProperties);

			},

			open: function() {
				var that = this;

				return that._document.getContent().then(function(value) {
					if (!value) {
						// should not happen
						throw new Error("unable to open emtpy document");
					}
					if (!that._model || that._model.$isDisposed()) {
						return;
					}

					if (value === that._flushedContent) {
						return that._detailsPane.reopen().then(function() {
							return that._context.event.fireOpened({
								document: that._document
							});
						});
					}

					that._flushedContent = value;
					that._changed = false;

					try {
						Parser.parseValue(value, that._model, that._context);
					} catch (e) {
						console.log("parser error" + e);
					}

					//validate that the ast model is NOT corrupted
					var errorObject = CDSEditorUtil.getErrorsInAstModel(that._model.astModel);
					if(errorObject){
						//show a pop up asking to correct the error displaying line no and column no in ast model and RETURN
						var lineNo = errorObject.lineNo;
						var columnNo = errorObject.colNo;
						jQuery.sap.require("sap.ui.commons.MessageBox");
						sap.ui.commons.MessageBox.show(
								"This CDS model contains error at line " + lineNo + ", column " + columnNo + "! \nCorrect the errors using the CDS text editor and open the CDS Graphical Editor again",
								sap.ui.commons.MessageBox.Icon.ERROR,
								"Open Error",
								[sap.ui.commons.MessageBox.Action.OK],
								function() { //callback function
									that._context.service.content.close(that._document, that._context.self)
									.then(function() {
										return that._context.service.focus.setFocus(that._context.service.content);
									}).done();
								}
						);
						
					} else{
						that._model.$finishLoading();
						that._currentNode = that._model.root;

						that._reloadContent(true).then(function() {
							return that._context.event.fireOpened({
								document: that._document
							});
						}).done();
					}
				});
			},

			close: function() {
				var that = this;
				return this._detailsPane.close().then(function() {
					//	that._model.$dispose();
					that._model = null;
					that._undoManager = null;
					that._currentNode = null;
					that._document = null;
					that._flushedContent = null;

				});
			},

			flush: function() {
				var that = this;
				if ((this._model && this._model.$isLoading()) || !this._changed) {
					return Q();
				}
				var text = Renderer.renderModel(this._model);
				this._flushedContent = text;
				var q = Q.defer();
				this._document.setContent(this._flushedContent, this._context.self)
				.then(function() {
					if (!that._document.isDirty()) {
						// the model has been changed (this._changed === true), however, the flushed content does not have changed since the last save
						// this might happen if users manually undo  a change, e.g. check and uncheck the same checkbox
						that._flushedContent += " ";
						return that._document.setContent(that._flushedContent, that._context.self);
					}
				})
				.then(function() {
					that._changed = false;
					q.resolve();
				}).done();
				return q.promise;
			},

			destroy: function() {
				if (this._display !== null) {
					this._display.destroy(true);
				}
				this._display = null;
				this._detailsPane = null;
				this._editorLayout = null;
			},

			hasUndo: function() {
				return this._undoManager.hasUndo();
			},

			hasRedo: function() {
				return this._undoManager.hasRedo();
			},

			undo: function() {
				return this._undoManager.undo();
			},

			redo: function() {
				return this._undoManager.redo();
			},

			markClean: function() {
				return this._undoManager.markClean();
			},

			isClean: function() {
				return this._undoManager.isClean();
			},

			getSelection: function() {
				if (this._document && this._detailsPane) {
					return [{
						document: this._document,
						pane: this._detailsPane.getSelectedContent()
					}];
				} else {
					return [];
				}
			}

	};
	return CDSEditor;
});