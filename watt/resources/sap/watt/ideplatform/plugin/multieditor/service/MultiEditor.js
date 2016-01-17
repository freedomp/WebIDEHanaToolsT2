define(["sap/watt/common/plugin/platform/service/ui/AbstractEditor", "../control/TabStrip"], function(AbstractEditor) {

	"use strict";

	var MultiEditor = AbstractEditor.extend("sap.watt.common.plugin.multieditor.service.MultiEditor", {});

	jQuery.extend(MultiEditor.prototype, {

		_aStyles: null,
		_aEditors: null,
		_aEditorsContent: null,
		_oTabStrip: null,
		_mSelectedIndexByDocument: null, // Map <documnetKeyString, selectedIndex>

		/**
		 * =============================
		 * Lifecycle methods
		 * =============================
		 */

		init: function() {
			this._mSelectedIndexByDocument = {};
			this._aEditorsContent = [];
			this._aStyles = [];

			//Leanwebide does not need any css so do not load an
			var aScripts = document.querySelectorAll("script[data-sap-ide-basedir][data-sap-ide-main]");
			var oScript = aScripts[0];
			var bLeanWebIde = oScript.getAttribute("data-sap-ide-leanwebide") === 'true';
			if (!bLeanWebIde) {
				// Base style for all instances
				this._aStyles.push({
					"uri": "sap.watt.ideplatform.multieditor/css/multieditor.css"
				});
			}

			this._oTabStrip = new sap.watt.common.plugin.multieditor.control.TabStrip();
			this._oTabStrip.setWidth("100%");
			this._oTabStrip.setHeight("100%");
			this._oTabStrip.attachTabClick(this._onTabClick, this);
			this._oTabStrip.addStyleClass("multiEditor");
		},

		configure: function(mConfig) {
			this._aEditors = mConfig.editors;
			this._createTabs();
		},

	
		/**
		 * =======================================================
		 * sap.watt.common.service.editor.Editor interface methods
		 * =======================================================
		 */

		getContent: function() {
			var that = this;
			return that.context.service.resource.includeStyles(that._aStyles).then(function() {
				return that._oTabStrip;
			});
		},

		open: function(oDocument) {
			AbstractEditor.prototype.open.apply(this, arguments);
			// if it's a new document - create selectedIndex record with 0
			if (!this._mSelectedIndexByDocument[oDocument.getKeyString()]) {
				this._mSelectedIndexByDocument[oDocument.getKeyString()] = 0;
			}

			// get stored selected index of this document and update tabstrip
			var iSelectedIndex = this._mSelectedIndexByDocument[oDocument.getKeyString()];
			this._oTabStrip.setSelectedIndex(iSelectedIndex);

			var that = this;
			return this._initEditorContent(this._oTabStrip.getSelectedIndex()).then(function() {
				return that.getActiveEditor().open(oDocument);
			}).then(function() {
				// Call setFocus() if editor is rendered, otherwise it will be called in onAfterRendering listener
				if (that._aEditorsContent[iSelectedIndex].getDomRef()) {
					return that.context.service.focus.setFocus(that.getActiveEditor());
				}
			});
		},

		close: function(oDocument) {
			// check if document is opened
			if (!this.hasDocument(oDocument)) {
				return Q();
			}
			var aPromises = [];
			var that = this;
			for (var i = 0; i < this._aEditors.length; i++) {
				aPromises.push(this._aEditors[i].service.close(oDocument));
			}
			// Check if current document is closed
			if (this._oDocument === oDocument) {
				this._oDocument = null;
				aPromises.push(this.context.service.focus.detachFocus(this.getActiveEditor()));
			}

			return Q.all(aPromises).then(function() {
				// remove stored selected index of closed document
				delete that._mSelectedIndexByDocument[oDocument.getKeyString()];
			});
		},

		flush: function() {
			return this.getActiveEditor().flush();
		},

		getTitle: function() {
			return this._oDocument && this._oDocument.getEntity().getName();
		},

		getTooltip: function() {
			return this._oDocument && this._oDocument.getEntity().getFullPath();
		},

		/**
		 * =========================================================
		 * sap.watt.common.service.editor.UndoRedo interface methods
		 * =========================================================
		 */

		undo: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().undo();
			}
			return Q();
		},

		redo: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().redo();
			}
			return Q();
		},

		hasUndo: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().hasUndo();
			}
			return Q(false);
		},

		hasRedo: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().hasRedo();
			}
			return Q(false);
		},

		markClean: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().markClean();
			}
		},

		isClean: function() {
			if (this.hasDocuments() && this.getActiveEditor().instanceOf("sap.watt.common.service.editor.UndoRedo")) {
				return this.getActiveEditor().isClean();
			}
			return Q(true);
		},

		/**
		 * =========================================================
		 * Public methods
		 * =========================================================
		 */

		containsEditor: function(oEditor) {
			for (var i = 0; i < this._aEditors.length; i++) {
				if (this._aEditors[i].service._sName === oEditor._sName) {
					return true;
				}
			}
			return false;
		},

		getActiveEditor: function() {
			return this._aEditors[this._oTabStrip.getSelectedIndex()].service;
		},

		getAllEditors: function() {
			var aEditors = [];
			for (var i = 0; i < this._aEditors.length; i++) {
				aEditors.push(this._aEditors[i].service);
			}
			return aEditors;
		},

		hasDocument: function(oDocument) {
			return this._mSelectedIndexByDocument[oDocument.getKeyString()] !== undefined;
		},

		hasDocuments: function() {
			return Object.keys(this._mSelectedIndexByDocument).length > 0;
		},

		/**
		 * =========================================================
		 * Private methods
		 * =========================================================
		 */

		_createTabs: function() {
			var oTab;
			for (var i = 0; i < this._aEditors.length; i++) {
				oTab = new sap.ui.commons.Tab({
					text: this._aEditors[i].name
				});
				this._oTabStrip.addTab(oTab);
			}

		},

		/**
		 * Load editor content by tab index.
		 *
		 * @param {number} iIndex The tab index.
		 * @return {Promise} promise.
		 */
		_initEditorContent: function(iIndex) {
			var that = this;
			if (this._aEditorsContent[iIndex]) {
				return Q(this._aEditorsContent[iIndex]);
			} else {
				return this._getEditorAt(iIndex).getContent().then(function(oContent) {
					that._oTabStrip.getTabs()[iIndex].addContent(oContent);
					that._aEditorsContent[iIndex] = oContent;
					oContent.addEventDelegate({
						onAfterRendering : function() {
							that.context.service.focus.setFocus(that.getActiveEditor()).done();
						}	
					});
				});
			}
		},

		_onTabClick: function(oEvent) {
			var iSelectedTabIndex = oEvent.getParameter("selectedTabIndex");
			var that = this;
			this.context.service.focus.detachFocus(that.getActiveEditor()).then(function() {
				that._oTabStrip.setSelectedIndex(iSelectedTabIndex);
				return that._initEditorContent(iSelectedTabIndex);
			}).then(function() {
				return that._getEditorAt(iSelectedTabIndex).open(that._oDocument);
			}).then(function() {
				that._mSelectedIndexByDocument[that._oDocument.getKeyString()] = that._oTabStrip.getSelectedIndex();
			}).done();
		},

		/**
		 * Get editor service by tab index.
		 *
		 * @param {number} iIndex The tab index.
		 * @return {sap.watt.common.service.editor.Editor} editor service.
		 */
		_getEditorAt: function(iIndex) {
			return this._aEditors[iIndex].service;
		}

	});

	return MultiEditor;

});