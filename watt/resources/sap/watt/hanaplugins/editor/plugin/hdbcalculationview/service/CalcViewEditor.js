/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../view/CalcViewEditor",
        "../control/EditorContainer",
        "../dialogs/NewCalculationViewDialog",
        "sap/watt/common/plugin/platform/service/ui/AbstractEditor"
    ],
	function(CalcViewEditor, EditorContainer, NewCalculationViewDialog, AbstractEditor) {
		"use strict";
		return AbstractEditor.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.service.CalcViewEditor", {
		

			constructor: function() {
				AbstractEditor.prototype.constructor.apply(this, arguments);
				this._view = null;
				this._editors = {};
				this._editor = null;
				this._document = null;
				this._editorContainer = null;
			},

			init: function() {
				this._view = sap.ui.view({
					viewName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.ViewContainer",
					type: sap.ui.core.mvc.ViewType.JS
				});
				this._view.addStyleClass("calcviewEditorView");
			},

			_getEditorContainer: function() {
				if (!this._editorContainer) {
					this._editorContainer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.EditorContainer();
					this._view.byId("viewcontainer").addContent(this._editorContainer);
				}
				return this._editorContainer;
			},

			getCurrentSqlSchema: function() {
				if (this._editor) {
					var model = this._editor.getModel();
					if (model && model.columnView && model.columnView.defaultSchema) {
						return model.columnView.defaultSchema;
					}
				}
				return "";
			},

			getContent: function() {
				var that = this;
				return AbstractEditor.prototype.getContent.apply(this, arguments).then(function() {
					return that._view;
				});
			},

			getSelection: function() {
				return this._editor.getSelection();
			},

			getFocusElement: function() {
				return this._view;
			},

			getTitle: function() {
				return this._document.getEntity().getName();
			},

			getTooltip: function() {
				return this._document.getEntity().getFullPath();
			},

			getModel: function() {
				var model;
				if (this._editor && this._editor.getModel()) {
					model = this._editor.getModel();
				}
				return model;
			},

			open: function(oDocument, forceReload) {
				var that = this;
				AbstractEditor.prototype.open.apply(this, arguments);

				var key = oDocument.getKeyString();
				this._document = oDocument;
				var editorAlreadyOpened = true;
				var editor = this._editors[key];
				if (!editor) {
					editor = new CalcViewEditor(this.context, oDocument);
					editorAlreadyOpened = false;
					this._editors[key] = editor;
					this._getEditorContainer().addContent(editor.getContent());
					forceReload = true;
				}
				this._editor = editor;
				this._editor.setCurEditor(editor);
				/*this.context.service.preferences.get("sap.hana.ide.editor.analytics").then(function(ioSettings) {
					that._editor.getModel().preferenceStore = ioSettings || {};
				}).done();
				*/

				for (var editorKey in this._editors) {
					if (!this._editors.hasOwnProperty(editorKey)) {
						continue;
					}
					this._editors[editorKey].setHidden(editorKey !== key);
				}
				return this._document.getContent().then(function(value) {
					if (value === "" && !editorAlreadyOpened) {
						var newCalculationView = new NewCalculationViewDialog({
							fileDocument: that._document,
							context: that.context
						});
						newCalculationView.openDialog();
					} else {
						// terminate promise chain in order to get exceptions logged properly
						editor.open(forceReload).done();
					}
				});
			},

			flush: function() {
				if (!this._document || !this._editors) {
					return Q();
				}
				var key = this._document.getKeyString();
				if (!this._editors.hasOwnProperty(key)) {
					return Q();
				}
				var editor = this._editors[key];
				return editor.flush();
			},

			close: function(oDocument) {
				var that = this;
				var originalArguments = arguments;
				var key = oDocument.getEntity().getKeyString();
				var editor = this._editors[key];
				if (editor) {
					delete this._editors[key];
					editor.close().then(function() {
						that._getEditorContainer().removeContent(editor.getContent().getId());
						editor.destroy();
					}).done();
				}
				// do not reset since open may have been overtake by close(all)
				// this._document = null;
				// this._editor = null;
				return AbstractEditor.prototype.close.apply(this, originalArguments);
			},

			hasUndo: function() {
				return this._editor && this._editor.hasUndo();
			},

			hasRedo: function() {
				return this._editor && this._editor.hasRedo();
			},

			undo: function() {
				return this._editor && this._editor.undo();
			},

			redo: function() {
				return this._editor && this._editor.redo();
			},

			markClean: function() {
				return this._editor && this._editor.markClean();
			},

			isClean: function() {
				return this._editor && this._editor.isClean();
			},

			getContext: function() {
				var model = this.getModel();
				if (model && model.selectionProvider) {
					if (model.selectionProvider.selectedKey) {
						/*if (model.selectionProvider.selectedKey === "columns" && model.selectionProvider.node === "Script") {
							return ["calcviewsemanticnode"];
						}*/
						if (model.selectionProvider.selectedKey === "hierarchies") {
							return ["calcviewhierarchies"];
						}
						if (model.selectionProvider.selectedKey === "parameters") {
							return ["calcviewinparam"];
						}
						if (model.selectionProvider.selectedKey === "parameters_variables") {
							return ["calcviewinparam", "calcviewvar"];
						}
						if (model.selectionProvider.selectedKey === "properties") {
							return ["calcviewprops"];
						}
						if (model.selectionProvider.selectedKey === "calculated_columns") {
							return ["calcviewcalccol"];
						}
						if (model.selectionProvider.selectedKey === "calculated_columns_counters") {
							return ["calcviewcalccol", "calcviewcounter"];
						}
						if (model.selectionProvider.selectedKey === "restricted_columns") {
							return ["calcviewrestrictedcol"];
						}
						if (model.selectionProvider.selectedKey === "expression") {
							return ["calcviewfilter"];
						}
					}
					if (model.selectionProvider.node === "Semantics") {
						return ["calcviewsemanticnode"];
					}
					if (model.selectionProvider.node === "JoinNode") {
						return ["calcviewjoin"];
					}
					if (model.selectionProvider.node === "StarJoin") {
						//TODO - retun key for star join
						return [];
					}
					if (model.selectionProvider.node === "Union") {
						return ["calcviewunion"];
					}
					if (model.selectionProvider.node === "Rank") {
						return ["calcviewranknode"];
					}
					if (model.selectionProvider.node === "Script") {
						return ["calcviewscript"];
					}
				}

			}
		});
	});
