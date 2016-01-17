define([], function() {
	var oCompare;
	return {

		COMPARE_PREFIX: "version-compare-",
		CMD_COMPARE_PREFIX: "version-compare-cmd-",
		_oDocument: null,
		_DocumentEditorMap: {},
		_undeRedoDetail: {},
		_aStyles: null,

		init: function() {
			this.context.service.perspective.attachEvent("splitterPositionChanged", this.onSplitterPositionChanged, this);
			this.context.service.content.attachEvent("tabDoubleClicked", this.onSplitterPositionChanged, this);
			return Q.sap.require("sap.watt.ideplatform.compare/lib/built-compare").then(function(_oCompare) {
				oCompare = _oCompare;
			});
		},

		configure: function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		getContent: function() {
			var that = this;
			var oWrapperDiv;

			if (that._DocumentEditorMap[this._oDocument.getKeyString()] && that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv) {
				oWrapperDiv = that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv;
			} else {
				oWrapperDiv = new sap.ui.core.HTML({
					content: "<div" + " style='width: 100%;height: calc(100% - 32px);background-color: white;'" + ' class="rdeCompare"' + ">" +
						"<span id='" + that._getSpanId(this._oDocument) + "' style='z-index: -1;width: 100%;height: 100%;opacity:0.9;'" +
						' class="compareCmdDiv"' + "'></span>" + "<div id='" + that._getDivId(this._oDocument) +
						"' style='width: 100%;height: 100%;overflow: auto;clear: both'" +
						"'></div>" + "</div>"
				});
				that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv = oWrapperDiv;
			}
			return this.context.service.resource.includeStyles(this._aStyles).thenResolve(oWrapperDiv);
		},
		
		open: function(oDocument) {
			this._oDocument = oDocument;
			return this._doCompare(this._oDocument);
		},

		close: function(oDocument) {
			var oEditor = this._DocumentEditorMap[oDocument.getKeyString()].editor.getCompareView().getEditors()[1];
			jQuery(oEditor._domNode).off("compareEditorModify", this._DocumentEditorMap[
				oDocument.getKeyString()].handler);
			this._DocumentEditorMap[oDocument.getKeyString()].editor = null;

			var $compareDiv = jQuery("div[id='" + this._getDivId(oDocument) + "']");
			var $compareSpan = jQuery("span[id='" + this._getSpanId(this._oDocument) + "']");
			if ($compareDiv) {
				$compareDiv.remove();
			}
			if ($compareSpan) {
				$compareSpan.remove();
			}
			this._DocumentEditorMap[oDocument.getKeyString()] = null;
		},

		/**
		 * Writes the content in the editor into current document
		 */
		flush: function() {
			var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
			if (!this._DocumentEditorMap[this._oDocument.getKeyString()].options.newFile.readonly && oCurrentEditor) {
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				this._updateCompareColoring(oEditor);
				return this._oDocument.setContent(oEditor.getText(), this.context.self);
			}
		},

		undo: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				return oEditor._undoStack.undo();
			}
			return false;
		},

		redo: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				return oEditor._undoStack.redo();
			}
			return false;
		},

		hasUndo: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				if (this._undeRedoDetail.undo) {
					return this._undeRedoDetail.undo;
				}
				return oEditor._undoStack.canUndo();
			}
			return false;
		},

		hasRedo: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				if (this._undeRedoDetail.redo) {
					return this._undeRedoDetail.redo;
				}
				return oEditor._undoStack.canRedo();
			}
			return false;
		},

		markClean: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				return oEditor._undoStack.markClean();
			}
			return false;
		},

		isClean: function() {
			if (this._oDocument && this._DocumentEditorMap[this._oDocument.getKeyString()] && this._DocumentEditorMap[this._oDocument.getKeyString()]
				.editor) {
				var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
				return oEditor._undoStack.isClean();
			}
			return false;
		},

		getState: function() {
			return null;
		},

		getTitle: function() { 
		    var that = this;
			return this._oDocument.getEntity().getName() + " ["+ that.context.i18n.getText("i18n", "compare_title") + "]";
		},
		getTooltip: function() {
		    var that = this;
			return this._oDocument.getEntity().getFullPath() + " ["+ that.context.i18n.getText("i18n", "compare_title") + "]";
		},

		isRestorable: function() {
			// Restoring is not possible as some global vars (_DocumentEditorMap) have to be set
			return false;
		},

		isAvailable: function() {
			return true;
		},

		compare: function(oDocument, vRightSide, sLeftSide, bReadOnly) {
			var that = this;
			this._oDocument = oDocument;
			var sDivId = this._getDivId(oDocument);
			var sName = oDocument.getEntity().getName();
			if (/.*\.(xml)$/.test(sName)) { //In order to highlight xml files 
				sName = sName.substring(0, sName.lastIndexOf(".xml")) + ".html";
			}

			return Q((typeof vRightSide === 'string') ? vRightSide : vRightSide.getContent()).then(function(sRightSide) {
				var oOptions = {
					parentDivId: sDivId,
					newFile: { /*new file's content is added in _doCompare method is order to support up to date content when opening the tab*/
						InitialContent: sLeftSide,
						readonly: !!bReadOnly,
						Name: 'new' + sName
					},
					oldFile: {
						readonly: true,
						Content: sRightSide,
						Name: 'old' + sName

					}
				};
				if (!that._DocumentEditorMap[oDocument.getKeyString()]) {
					that._DocumentEditorMap[oDocument.getKeyString()] = {};
				}
				that._DocumentEditorMap[oDocument.getKeyString()].options = oOptions;
				return that.context.service.content.open(oDocument, that.context.service.compare);
			});

		},

		getFocusElement: function() {
			return document.getElementById(this._getDivId(this._oDocument));
		},

		getSelection: function() {
			return {
				document: this._oDocument
			};
		},

		onSplitterPositionChanged: function() {
			if (this._oDocument && this._DocumentEditorMap && this._DocumentEditorMap[this._oDocument.getKeyString()]) {
				var oEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				if (oEditor && oEditor.getCompareView() && oEditor.getCompareView().getWidget()) {
					var compareWidget = oEditor.getCompareView().getWidget();
					if (compareWidget.type === "twoWay") {
						compareWidget._uiFactory.getSplitter()._resize();
					}
				}
			}
		},

		_doCompare: function(oDocument) {
			var that = this;
			var oOptions = this._DocumentEditorMap[oDocument.getKeyString()].options;
			return Q(oOptions.newFile.InitialContent ? oOptions.newFile.InitialContent : oDocument.getContent()).then(function(sContent) {
				var oCurrentEditor = that._DocumentEditorMap[oDocument.getKeyString()].editor;
				//in case the compare was already opened for this document
				if (oCurrentEditor) {
					//re-open of read only mode: do nothing
					if (oOptions.newFile.readonly) {
						return;
					}
					var oWidget = oCurrentEditor.getCompareView().getWidget();
					oWidget.getEditors()[1].getTextView().setText(sContent);
					oWidget.options.newFile.Content = sContent;
					oWidget.options.mapper = null;
					oWidget.refresh(false);
				} else {
					sap.ui.getCore().applyChanges();
					//first time the compare is opened with this document
					oOptions.newFile.Content = sContent;
					var $compareDiv = jQuery("div[id='" + that._getDivId(oDocument) + "']");
					if ($compareDiv.length > 0) {
						$compareDiv.empty();
					}
					oCurrentEditor = that._DocumentEditorMap[oDocument.getKeyString()].editor = new oCompare(oOptions, that._getSpanId(that._oDocument));
					//event handler added for keyPress (os:12553 setText()) 
					var oEditor = oCurrentEditor.getCompareView().getEditors()[1];
					that._DocumentEditorMap[oDocument.getKeyString()].handler = function(oEvent) {
						that._onKeyPress(oEditor);
					};
					jQuery(oEditor._domNode).on("compareEditorModify", that._DocumentEditorMap[oDocument.getKeyString()].handler);

				}
			});
		},

		_onKeyPress: function(oEditor) {
			this._oDocument.setContent(oEditor.getText(), this.context.self).done();
		},

		//Update Compare Colors
		_updateCompareColoring: function(oEditor) {
			var oCurrentEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
			if (oCurrentEditor) {
				//update the compare colors 
				var widget = oCurrentEditor.getCompareView().getWidget();
				widget.options.newFile.Content = oEditor.getText();
				widget.options.mapper = null;
				widget.refresh(false);
			}
		},

		_getDivId: function(oDocument) {
			return this.COMPARE_PREFIX + oDocument.getKeyString();
		},

		_getSpanId: function(oDocument) {
			return this.CMD_COMPARE_PREFIX + oDocument.getKeyString();
		}

	};
});