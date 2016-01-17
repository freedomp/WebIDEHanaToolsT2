/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../../util/ResourceLoader",
    "./DiagramModelBuilder",
    "./Editor",
    "./Viewer",
    "./galilei",
    "../../control/DiagramContainer"
], function(ResourceLoader, DiagramModelBuilder, Editor, Viewer) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");

	var DiagramPane = function(model, context) {
		this._model = model;
		this._context = context;
		this._content = null;
		this._svgContainer = null;
		this._editor = null;
	};

	DiagramPane.prototype = {

		getContent: function() {
			if (!this._content) {
				this._content = this._createContent();
			}
			return this._content;
		},

		update: function(selectedNode) {
			this._editor.extension.updateDiagram(selectedNode);
		},

		_createContent: function() {

			var model = this._model;
			var that = this;
			var afterRendering = function(event) {

				if (this.getDomRef() && !that._editor) {
					var diagramBuilder = new DiagramModelBuilder(model, that._context, that.removeButton, that.repleaceNodeBtn, /*that.repleaceDataSource,*/
						that.repleaceNodewithSourceBtn);

					that._editor = new sap.galilei.ui.editor.DiagramEditor(diagramBuilder.getDiagram(), "#" + this.getId(), {
						viewerClass: Viewer,
						enablePreserveLinkAfterDelete: false,
						// Define diagram editor extension
						extension: {
							extensionClass: Editor,
							builder: diagramBuilder
						},
						// Define viewer parameters
						viewer: {
							viewBorderWidth: 1,
							//showGrid: true,
							showPageLimit: false,
							showZoomTools: true,
							zoomToolVerticalAlignment: sap.galilei.ui.common.HorizontalAlignment.top,
							zoomToolHorizontalAlignment: sap.galilei.ui.common.HorizontalAlignment.right
						}
					});

					// galilei viewer relies on size attributes rather than CSS size, thus needs to be notified when the container size changes
					that._resizeHandlerId = sap.ui.core.ResizeHandler.register(that._svgContainer, function() {
						return that._editor.viewer.onResize.apply(that._editor.viewer, arguments);
					});

					// perform autolayout while opening the editor    
					//that._editor.extension.autolayout(that._editor._diagram);

					that._editor.drawAllSymbols();
				}
			};

			var onExit = function() {
				if (this._editor) {
					if (this._editor.extension) {
						this._editor.extension.dispose();
					}
					this._editor.dispose();
				}
			};

			var layout = new sap.ui.layout.VerticalLayout({//new sap.ui.commons.layout.VerticalLayout({
				//height: "100%",
				width: "100%"
			}).addStyleClass("cdsEditor");

			this._svgContainer = new sap.watt.hanaplugins.editor.plugin.cds.control.DiagramContainer({
				content: '<div style="width: 100%; height: 100%; overflow: hidden;"/>',
				afterRendering: afterRendering,
				exit: onExit.bind(this)
			});

			this.removeButton = new sap.ui.commons.Button({
				icon: "sap-icon://delete",
				lite: true,
				tooltip: resourceLoader.getText("tol_remove"),
				press: function() {
					if (that._editor) {
						that._editor._extension.deleteAction();
					}
				},
				enabled: false
			});

			var autoLayout = new sap.ui.commons.Button({
				icon: "sap-icon://org-chart",
				lite: true,
				tooltip: resourceLoader.getText("tol_auto_layout"),
				press: function() {
					that._editor.extension.autolayout(that._editor._diagram);
				}
			});

			var contextNameHeader = new sap.ui.commons.TextView({
				text: {
					parts: [{
						path: "/contextName"
                    }],
					formatter: function(value) {
						return value + that._context.self._sName;
					}
				},
				design: sap.ui.commons.TextViewDesign.H2,
				width: "100%",
				textAlign: sap.ui.core.TextAlign.Center
			});

			var toolBar = new sap.ui.commons.Toolbar({
				design: sap.ui.commons.ToolbarDesign.Flat,
				items: [
				    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_add_entity"),
						icon: resourceLoader.getImagePath("Table.png"),
						lite: true,
						visible: "{/isRootContext}",
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.ENTITY_SYMBOL);
							}
						}
					}),
					new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_add_context"),
						icon: resourceLoader.getImagePath("Constant.png"),
						lite: true,
						visible: "{/isRootContext}",
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.CONTEXT_SYMBOL);
							}
						}
					}),
					new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_delete"),
						icon: "sap-icon://delete",
						lite: true,
						visible: "{/isRootContext}",
						press: function() {
							if (that._editor) {
								var selectedNodes = that._editor.selectedSymbols;
								that._editor._extension.deleteSelectedNodes(selectedNodes);
								that._editor.drawAllSymbols();
							}
						}
					}),
					new sap.ui.commons.ToolbarSeparator(),
                    autoLayout,
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_expand_all"),
						icon: resourceLoader.getImagePath("ExpandAll.png"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor._extension.expandCollapseAll(true);
							}
						}
					}),
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_collapse_all"),
						icon: resourceLoader.getImagePath("CollapseAll.png"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor._extension.expandCollapseAll(false);
							}
						}
					})
                ]
			});

			layout.addContent(toolBar);
			layout.addContent(this._svgContainer);

			var uiModel = new sap.ui.model.json.JSONModel({
				contextName: "Context - ",
				isRootContext: true
			});
			layout.setModel(uiModel);

			var root = model.root;
			if (root.artifactType === "Entity") {
				layout.getModel().setProperty("/isRootContext", false);
			} else if (root.artifactType === "Context") {
				layout.getModel().setProperty("/isRootContext", true);
				//TODO  
				//layout.insertContent(contextNameHeader, 0);
			}

			return layout;
		},

		destroy: function() {
			if (this._content) {
				sap.ui.core.ResizeHandler.register(this._resizeHandlerId);
				this._content.destroy();
			}
		}
	};

	return DiagramPane;

});