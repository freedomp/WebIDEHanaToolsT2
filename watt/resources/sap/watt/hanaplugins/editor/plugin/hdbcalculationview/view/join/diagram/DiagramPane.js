/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "../../../util/ResourceLoader",
    "./DiagramModelBuilder",
    "./Editor",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/Viewer",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/services/PerformanceAnalysisService",
    "../../../viewmodel/commands",
    //"sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/Library",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/diagram/galilei",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/control/DiagramContainer"
], function(ResourceLoader, DiagramModelBuilder, Editor, Viewer, PerformanceAnalysisService, commands) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
	var ViewModelEvents = commands.ViewModelEvents;

	var DiagramPane = function(model, viewNode, viewModel, context, propertiesPane) {
		this.viewNode = viewNode;
		this.viewModel = viewModel;
		this.context = context;
		this.propertiesPane = propertiesPane;

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

		_execute: function(command) {
			return this._model.getUndoManager().execute(command);
		},

		_createContent: function() {

			var model = this.viewModel;
			var that = this;
			var afterRendering = function(event) {

				if (this.getDomRef() && !that._editor) {
					var diagramBuilder = new DiagramModelBuilder(model, that.viewNode, that.context, that.propertiesPane, that.removeButton);

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
							zoomToolVerticalAlignment: sap.galilei.ui.common.HorizontalAlignment.bottom,
							zoomToolHorizontalAlignment: sap.galilei.ui.common.HorizontalAlignment.right
						}
					});

					// perform autolayout while opening the editor    
					that._editor.extension.autolayout(that._editor._diagram, true);

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

			var layout = new sap.ui.commons.layout.MatrixLayout({
				width: "100%",
				height: "100%"
			});
			layout.addStyleClass("calcViewEditor");

			this._svgContainer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.DiagramContainer({
				content: '<div style="width: 100%; height: 100%; overflow: hidden;"/>',
				afterRendering: afterRendering,
				exit: onExit.bind(this)
			});
			var toolbarItems = [];
			if (!that.viewNode.isStarJoin()) {
				this.validateButton = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("StatusValid.png"),
					lite: true,
					tooltip: resourceLoader.getText("tol_validate_join"),
					visible: false,
					press: function() {
						jQuery.sap.require("sap.ui.commons.MessageBox");
						var service = new PerformanceAnalysisService(that.viewModel, that.context);
						if (that.viewNode.joins.size() === 1) {
							service.validateJoin(that.viewNode, that.viewNode.joins.get(0), false)
								.then(function(joinDef) {
									var icon;
									var updateMsg = true;
									var msg = resourceLoader.getText("msg_join_validate_message").concat("\n");
									switch (joinDef.validationStatus) {
										case "Error":
											icon = sap.ui.commons.MessageBox.Icon.ERROR;
											updateMsg = false;
											msg = msg.concat(resourceLoader.getText("msg_error_reason", [joinDef.validationStatusMessage]));
											break;
										case "Warning":
											icon = sap.ui.commons.MessageBox.Icon.WARNING;
											break;
										case "Valid":
											icon = sap.ui.commons.MessageBox.Icon.SUCCESS;
											break;
										case "Information":
											icon = sap.ui.commons.MessageBox.Icon.INFORMATION;
											updateMsg = false;
											msg = joinDef.validationStatusMessage;
											break;
									}
									var count = 1;
									if (updateMsg) {
										if (joinDef.proposedCardinality) {
											msg = msg.concat(count++).concat(". ").concat(resourceLoader.getText("msg_proposed_cardinality", [joinDef.proposedCardinality]));
										}
										if (count === 2) {
											msg = msg.concat("\n");
										}
										if (joinDef.isReferential) {
											msg = msg.concat(count++).concat(". ").concat(resourceLoader.getText("msg_referential_integrity"));
										} else {
											msg = msg.concat(count++).concat(". ").concat(resourceLoader.getText("msg_not_referential_integrity"));
										}
									}
									sap.ui.commons.MessageBox.show(msg,
										icon,
										resourceLoader.getText("msg_join_validation_status"), [sap.ui.commons.MessageBox.Action.OK]
									);
								}, function(error) {
									sap.ui.commons.MessageBox.show(
										error,
										sap.ui.commons.MessageBox.Icon.INFORMATION,
										resourceLoader.getText("msg_join_validation_status"), [sap.ui.commons.MessageBox.Action.OK]
									);
								});
						} else if (that.viewNode.joins.size() > 1) {
							//star join
							sap.ui.commons.MessageBox.show(
								resourceLoader.getText("msg_validate_join_no_catalog_tables"),
								sap.ui.commons.MessageBox.Icon.INFORMATION,
								resourceLoader.getText("msg_join_validation_status"), [sap.ui.commons.MessageBox.Action.OK]
							);
						} else {
							//join not defined
							sap.ui.commons.MessageBox.show(
								resourceLoader.getText("msg_validate_join_join_not_defined"),
								sap.ui.commons.MessageBox.Icon.WARNING,
								resourceLoader.getText("msg_join_validation_status"), [sap.ui.commons.MessageBox.Action.OK]
							);
						}
					}
					//enabled: false
				});
				if (that.viewNode.joins.size() === 0) {
					this.validateButton.setEnabled(false);
				}
				this.viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_CREATED, this.joinCreated, this);
				this.viewNode.$getEvents().subscribe(ViewModelEvents.JOIN_DELETED, this.joinDeleted, this);
				//toolbarItems.push(this.validateButton);
			}

			this.removeButton = new sap.ui.commons.Button({
				icon: "sap-icon://delete",
				lite: true,
				tooltip: resourceLoader.getText("tol_remove"),
				press: function() {
					if (that._editor) {
						that._editor.deleteSelectedSymbols();
					}
				},
				enabled: false
			});
			toolbarItems.push(this.removeButton);
			toolbarItems.push(new sap.ui.commons.ToolbarSeparator());

			var autoLayoutButton = new sap.ui.commons.Button({
				icon: "sap-icon://org-chart",
				lite: true,
				tooltip: resourceLoader.getText("Auto Layout"),
				press: function() {
					that._editor.extension.autolayout(that._editor._diagram);
				}
			});
			toolbarItems.push(autoLayoutButton);

			var toolBar = new sap.ui.commons.Toolbar({
				design: sap.ui.commons.ToolbarDesign.Flat,
				items: toolbarItems
			});
			var cell1 = new sap.ui.commons.layout.MatrixLayoutCell({
				content: toolBar,
				padding: sap.ui.commons.layout.Padding.None
			});
			var row1 = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: cell1
			});
			row1.addStyleClass("calcViewDiagramTools");
			layout.addRow(row1);

			var cell2 = new sap.ui.commons.layout.MatrixLayoutCell({
				content: this._svgContainer,
				padding: sap.ui.commons.layout.Padding.None
			});
			var row2 = new sap.ui.commons.layout.MatrixLayoutRow({
				cells: cell2
			});
			row2.addStyleClass("calcViewDiagram");
			layout.addRow(row2);

			return layout;
		},

		joinCreated: function(e) {
			this.validateButton.setEnabled(true);
		},
		joinDeleted: function(e) {
			this.validateButton.setEnabled(false);
		},
		setHidden: function(value) {

		},

		refresh: function() {

		},

		destroy: function() {
			if (this._content) {
				this._content.destroy();
			}
			this.viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_CREATED, this.joinCreated, this);
			this.viewNode.$getEvents().unsubscribe(ViewModelEvents.JOIN_DELETED, this.joinDeleted, this);
		},
		joinHighlight:function(value,seq){
               if (this._editor) {
				if (this._editor.extension) {
				return	this._editor.extension.joinHighlight(value,seq);
				}

			}
            }
	
	};

	return DiagramPane;

});
