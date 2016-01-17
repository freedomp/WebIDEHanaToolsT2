/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands", "./ColumnsPane", "./ParametersPane"], function(ResourceLoader,
	commands, ColumnsPane, ParametersPane) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	var ScriptEditor = function(parameters) {
		this.model = parameters.model;
		this.document = parameters.document;
		this.context = parameters.context;
		this.layout = null;
		this.isOpen = false;
	};

	ScriptEditor.prototype = {

		showHideQuickTool: function() {
			if (!this.quickPanel) {
				return;
			}

			if (this.quickPanel.hasStyleClass("calcviewScriptEditorQuickPanelHidden")) {
				this.quickPanel.removeStyleClass("calcviewScriptEditorQuickPanelHidden");
				// this.quickPanel.addStyleClass("calcviewScriptEditorQuickPanelShown");
				this.collapseButton.removeStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				this.expandButton.addStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
			} else {
				// this.quickPanel.removeStyleClass("calcviewScriptEditorQuickPanelShown");
				this.quickPanel.addStyleClass("calcviewScriptEditorQuickPanelHidden");
				this.collapseButton.addStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				this.expandButton.removeStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				if (this.editor) {
					this.editor.getFocusElement().then(function(element) {
						if (element) {
							element.focus();
						}
					}).done();
				}
			}
		},

		getContent: function() {
			var that = this;
			var jsonModel = new sap.ui.model.json.JSONModel();
			var quickPanel, editorLayout, collapseButton, expandButton;

			function changed() {
				var selectedNode = that.model.columnView.getDefaultNode();
				var jsonData = {
					name: selectedNode.name,
					columns: [],
					parameters: []
				};

				that.model.columnView.parameters.foreach(function(parameter) {
					if (!parameter.isVariable) {
						jsonData.parameters.push(ParametersPane.createModelForParameter(parameter));
					}
				});
				// empty row
				jsonData.parameters.push({});

				selectedNode.elements.foreach(function(element) {
					jsonData.columns.push(ColumnsPane.createModelForElement(element));
				});
				// empty row
				jsonData.columns.push({});

				jsonModel.setData(jsonData);
			}

			editorLayout = new sap.ui.commons.layout.AbsoluteLayout();
			editorLayout.addStyleClass("calcviewScriptEditorLayout");

			var columns = new ColumnsPane(that.model, that.context);
			var columnsTable = columns.getContent();
			columnsTable.setModel(jsonModel);
			columnsTable.bindElement("/");

			var columnsPanel = new sap.ui.commons.Panel({
				width: "100%",
				areaDesign: sap.ui.commons.enums.AreaDesign.Fill,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				text: resourceLoader.getText("tit_columns")
			});
			columnsPanel.addContent(columnsTable);

			var params = new ParametersPane(that.model.$getUndoManager(), that.context);
			var paramsTable = params.getContent();
			paramsTable.setModel(jsonModel);
			paramsTable.bindElement("/");

			var paramsPanel = new sap.ui.commons.Panel({
				width: "100%",
				showCollapseIcon: false,
				areaDesign: sap.ui.commons.enums.AreaDesign.Fill,
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				text: resourceLoader.getText("tit_parameters")
			});
			paramsPanel.addContent(paramsTable);

			var layout1 = new sap.ui.layout.VerticalLayout({
				width: "100%",
				content: [columnsPanel, paramsPanel]
			});

			var layout2 = new sap.ui.commons.layout.AbsoluteLayout({
				verticalScrolling: sap.ui.core.Scrolling.Auto
			});
			layout2.addContent(layout1);
			layout2.addStyleClass("calcviewScriptEditorQuickPanelScr");

			quickPanel = new sap.ui.commons.layout.VerticalLayout({
				content: [layout2]
			});
			quickPanel.addStyleClass("calcviewScriptEditorQuickPanel");
			quickPanel.addStyleClass("calcviewScriptEditorQuickPanelShown");

			quickPanel.attachBrowserEvent("keydown", function(e) {
				// disable Ctrl+SPACE (intellisence command in quick panel)
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 32) {
					e.preventDefault();
					e.stopPropagation();
				}
				// capture undo/redo and call undo manager directly
				// otherwise, on Chrome there would be still and input event sent to ace 
				// which overtakes the WATT Redo command and inserts the last typed character into ace
				// the redo stack was reset and the standard Redo did not take place
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 89) {
					e.preventDefault();
					e.stopPropagation();
					that.model.$getUndoManager().redo();
				}
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
					e.preventDefault();
					e.stopPropagation();
					that.model.$getUndoManager().undo();
				}
			});

			editorLayout.addContent(quickPanel, {
				top: "0px",
				right: "24px"
			});

			collapseButton = new sap.ui.commons.Button({
				light: true,
				icon: "sap-icon://navigation-right-arrow",
				press: this.showHideQuickTool.bind(this),
				tooltip: resourceLoader.getText("tol_hide_quick_tools")
			});
			collapseButton.addStyleClass("calcviewScriptEditorQuickPanelColl");
			editorLayout.addContent(collapseButton, {
				top: "0px",
				right: "24px"
			});

			expandButton = new sap.ui.commons.Button({
				light: true,
				icon: "sap-icon://navigation-left-arrow",
				press: this.showHideQuickTool.bind(this),
				tooltip: resourceLoader.getText("tol_show_quick_tools")
			});
			expandButton.addStyleClass("calcviewScriptEditorQuickPanelExp");
			expandButton.addStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
			editorLayout.addContent(expandButton, {
				top: "0px",
				right: "0px"
			});

			this.layout = editorLayout;
			this.quickPanel = quickPanel;
			this.collapseButton = collapseButton;
			this.expandButton = expandButton;

			that.model.$getEvents().subscribe("changed", changed);
			changed();
			return editorLayout;
		},

		selected: function() {
			var that = this;
			if (this.editor) {
				return Q();
			} else {
				return this.context.service.calcviewscripteditorFactory.create().then(function(editor) {
					that.editor = editor;
				}).then(function() {
					return that.editor.getContent();
				}).then(function(editorControl) {
					var cont = new sap.ui.commons.layout.PositionContainer();
					that.layout.addPosition(cont);
					cont.setControl(editorControl);
					// remember a reference to the script pane so that the ScriptEditor service can use it
					editorControl.calcViewscriptpane = that;
				}).then(function() {
					return that.editor.open(that.document, that.model).then(function() {
						that.context.event.fireScriptOpened({
							editor: that.editor
						}).done();
					});
				});
			}
		},

		reopen: function() {
			if (!this.editor) {
				return Q();
			}
			return this.editor.open(this.document, this.model);
		},

		close: function() {
			if (!this.editor) {
				return Q();
			}
			return this.editor.close(this.document, this.model);
		}

	};

	return ScriptEditor;
});
