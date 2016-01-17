/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../util/ResourceLoader",
    "./DiagramModelBuilder",
    "./Editor",
    "./Viewer",
    "../view/CalcViewEditorUtil",
    "./Library",
    "./galilei",
    "../control/DiagramContainer"
], function(ResourceLoader, DiagramModelBuilder, Editor, Viewer, CalcViewEditorUtil) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	var DiagramPane = function(model, context, onExpand) {
		this._model = model;
		this._context = context;
		this._content = null;
		this._svgContainer = null;
		this._editor = null;
		this._onExpand = onExpand;
	};

	DiagramPane.prototype = {

		getContent: function() {
			if (!this._content) {

				this._content = this._createContent();
			}
			return this._content;
		},

		_execute: function(command) {
			return this._model.getUndoManager().execute(command);
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
							zoomToolHorizontalAlignment: sap.galilei.ui.common.HorizontalAlignment.left
						}
					});

					// galilei viewer relies on size attributes rather than CSS size, thus needs to be notified when the container size changes
					that._resizeHandlerId = sap.ui.core.ResizeHandler.register(that._svgContainer, function() {
						return that._editor.viewer.onResize.apply(that._editor.viewer, arguments);
					});

					// perform autolayout while opening the editor    
					that._editor.extension.autolayout(that._editor._diagram);

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

			var layout = new sap.ui.commons.layout.VerticalLayout({
				height: "100%",
				width: "100%"
			}).addStyleClass("calcViewEditor");

			this._svgContainer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.DiagramContainer({
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
				tooltip: resourceLoader.getText("Auto Layout"),
				press: function() {
					that._editor.extension.autolayout(that._editor._diagram);
				}
			});

			var toolBarTop = new sap.ui.commons.Toolbar({
				design: sap.ui.commons.ToolbarDesign.Flat,
				rightItems: [new sap.ui.commons.Button({
					icon: "sap-icon://close-command-field",
					lite: true,
					press: that._onExpand
				})],
				items: [


                    
                    that.removeButton,

                    autoLayout,

                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_expand_all", "analytics"),
						icon: resourceLoader.getImagePath("ExpandAll.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor._extension.expandCollapseAll(true);
							}
						}
					}),
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_collapse_all", "analytics"),
						icon: resourceLoader.getImagePath("CollapseAll.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor._extension.expandCollapseAll(false);
							}
						}
					})

                ]
			});
			var toolBar = new sap.ui.commons.Toolbar({
				design: sap.ui.commons.ToolbarDesign.Flat,
				/*rightItems: [new sap.ui.commons.Button({
					icon: "sap-icon://close-command-field",
					lite: true,
					press: that._onExpand
				})],*/
				items: [

                    /*   new sap.ui.commons.Button({
                        icon: resourceLoader.getImagePath("selector.png", "analytics"),
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.selectTool(sap.galilei.ui.editor.tool.PointerTool.NAME);
                            }
                        }
                    }),
                    new sap.ui.commons.Button({
                        icon: resourceLoader.getImagePath("lasso.png", "analytics"),
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.selectTool(sap.galilei.ui.editor.tool.LassoTool.NAME);
                            }
                        }
                    }),*/

                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_create_join", "analytics"),
						icon: resourceLoader.getImagePath("Join.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.JOIN_SYMBOL);
							}
						}
					}),
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_create_union", "analytics"),
						icon: resourceLoader.getImagePath("Union.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.UNION_SYMBOL);
							}
						}
					}),
					new sap.ui.commons.Button({
						tooltip: "Graph Node",
						icon: resourceLoader.getImagePath("GraphNode.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.GRAPH_SYMBOL);
							}
						}
					}),
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_create_projection", "analytics"),
						icon: resourceLoader.getImagePath("Projection.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.PROJECTION_SYMBOL);
							}
						}
					}),
                    new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_create_aggregation", "analytics"),
						icon: resourceLoader.getImagePath("Aggregation.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.AGGREGATION_SYMBOL);
							}
						}
					}),
                   /* new sap.ui.commons.Button({
						tooltip: resourceLoader.getText("tol_create_rank", "analytics"),
						icon: resourceLoader.getImagePath("Rank.png", "analytics"),
						lite: true,
						press: function() {
							if (that._editor) {
								that._editor.selectTool(that._editor.extension.RANK_SYMBOL);
							}
						}
					}),*/
                    /* new sap.ui.commons.Button({
                        tooltip: resourceLoader.getText("tol_create_input", "analytics"),
                        icon: resourceLoader.getImagePath("Connection.gif", "analytics"),
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.selectTool(that._editor.extension.LINK_SYMBOL_TOOL);
                            }
                        }
                    }),*/
                   
                    /*     new sap.ui.commons.Button({
                        tooltip: resourceLoader.getText("tol_zoom_in", "analytics"),
                        icon: "sap-icon://zoom-in",
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.viewer.zoomIn();
                            }
                        }
                    }),
                    new sap.ui.commons.Button({
                        tooltip: resourceLoader.getText("tol_zoom_out", "analytics"),
                        icon: "sap-icon://zoom-out",
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.viewer.zoomOut();
                            }
                        }
                    }),
                    new sap.ui.commons.Button({
                        icon: "sap-icon://resize",
                        lite: true,
                        press: function() {
                            if (that._editor) {
                                that._editor.viewer.showGlobalView();
                            }
                        }
                    })*/
                ]
			});
			/*var cell1 = new sap.ui.commons.layout.MatrixLayoutCell({
                content: toolBar,
                padding: sap.ui.commons.layout.Padding.None
            });
            var row1 = new sap.ui.commons.layout.MatrixLayoutRow({
                cells: cell1
            });
            row1.addStyleClass("calcViewDiagramTools");*/
            layout.addContent(toolBarTop);
			layout.addContent(toolBar);

			/*var cell2 = new sap.ui.commons.layout.MatrixLayoutCell({
                content: this._svgContainer,
                padding: sap.ui.commons.layout.Padding.None
            });
            var row2 = new sap.ui.commons.layout.MatrixLayoutRow({
                cells: cell2
            });
            row2.addStyleClass("calcViewDiagram");*/
			layout.addContent(this._svgContainer);

			return layout;
		},

		setHidden: function(value) {

		},

		refresh: function() {

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
