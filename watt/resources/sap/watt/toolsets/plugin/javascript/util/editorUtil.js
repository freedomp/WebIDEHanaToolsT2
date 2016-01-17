define([], function() {
	"use strict";
	
	var _markerObj = {
		markerId: -1,
		markerRange: null
	};
	return {
		/**
		 * get current activated code editor
		 */
		getCurrentEditor: function(selection) {
			return selection.getOwner().then(function(oCurrentEditorInstance) {
				if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
					return oCurrentEditorInstance;
				} else {
					return null;
				}
			});
		},
		getCurrentUI5Editor: function(selection) {
			return this.getCurrentEditor(selection).then(function(editor) {
				if (editor) {
					return editor.getUI5Editor();
				} else {
					return Q();
				}
			});
		},
		
		/**
		 * set specific code editor highlight selection, based on start/end offset
		 */
		setEditorSelection: function(editor, startOffset, endOffset, isnew) {
			if (!editor || !startOffset || !endOffset) {
				return;
			}
			this.selectionContext = {
				editor: editor,
				start: startOffset,
				end: endOffset
			};
			if (isnew) {
				editor.detachEvent("rendered", this.onEditorRendered, this);
				editor.attachEvent("rendered", this.onEditorRendered, this);
			} else {
				this.onEditorRendered();
			}
		},
		
		/**
		 * workaround, have to set selection after rendered
		 */
		onEditorRendered: function() {
			if (this.selectionContext) {
				var self = this;
				var start = this.selectionContext.start;
				var end = this.selectionContext.end;
				if (this.selectionContext.editor) {
					this.selectionContext.editor.getUI5Editor().then(function(ui5Editor) {
						if (ui5Editor) {
							var startPosition = self.getPositionFromOffset(ui5Editor, start);
							var endPosition = self.getPositionFromOffset(ui5Editor, end);
							if (startPosition && endPosition) {
								var range = ui5Editor.getRange(startPosition.row, startPosition.column, endPosition.row, endPosition.column);
							}
							var selection = ui5Editor.getSelection();
							if (selection && range) {
								var iLine = ui5Editor.indexToPosition(start).row + 1;
								ui5Editor.gotoLine(iLine);
								selection.setSelectionRange(range);
							}
						}
					}).done();
				}
				this.selectionContext = null;
			}
		},
		
		/**
		 * get code editor range position from offset
		 */
		getPositionFromOffset: function(ui5Editor, offset) {
			if (ui5Editor && offset >= 0) {
				var row = 0, column = 0;
				var lines = ui5Editor.getSession().getDocument().getAllLines();
				var lineStartPos = 0;
				var lineEndPos = 0;
				for (var i = 0; i < lines.length; i++) {
					if (i > 0) {
						lineStartPos += lines[i - 1].length + 1;
						lineEndPos += 1;
					}
					lineEndPos += lines[i].length;
					if (lineEndPos >= offset) {
						return {row: i, column: offset - lineStartPos};
					}
				}
			}
		},
		
		/**
		 * attach editor hover events: mousemove, click
		 */
		attachEditorEvent: function(ui5Editor, eventName, eventCallback) {
			if (ui5Editor) {
				var editorContainer = ui5Editor.getContainer();
				if (editorContainer) {
					editorContainer.removeEventListener(eventName, eventCallback);
					editorContainer.addEventListener(eventName, eventCallback);
				}
			}
		},
		/**
		 * detach editor hover events: mousemove, click
		 */
		detachEditorEvent: function(ui5Editor, eventName, eventCallback) {
			if (ui5Editor) {
				var editorContainer = ui5Editor.getContainer();
				if (editorContainer) {
					editorContainer.removeEventListener(eventName, eventCallback);
				}
			}
		},
		
		addDefinitionMarker: function(ui5Editor, range) {
			if (ui5Editor && range && range.length === 2) {
				var startPos = this.getPositionFromOffset(ui5Editor, range[0]);
				var endPos = this.getPositionFromOffset(ui5Editor, range[1]);
				var markerRange = ui5Editor.getRange(startPos.row, startPos.column, endPos.row, endPos.column);
				if (!_markerObj.markerRange || 
					(_markerObj.markerRange && markerRange && 
					_markerObj.markerRange.compareRange(markerRange) != 0)) {
					if (_markerObj.markerId >= 0) {
						ui5Editor.removeMarker(_markerObj.markerId);
					}
					_markerObj.markerId = ui5Editor.addMarker(markerRange, "jsdefinition", "line", true);
					_markerObj.markerRange = markerRange;
				}
			}
		},
		
		clearDefinitionMarker: function(ui5Editor) {
			if (ui5Editor && _markerObj.markerId >= 0) {
				ui5Editor.removeMarker(_markerObj.markerId);
				_markerObj.markerId = -1;
				_markerObj.markerRange = null;
			}
		},
		
		getDocumentPosition: function(ui5Editor, x, y) {
			if (ui5Editor) {
				var aceEditor = ui5Editor.oEditor;
				if (aceEditor && aceEditor.renderer) {
					return aceEditor.renderer.screenToTextCoordinates(x, y);
				}
			}
			return {
				"row": 0,
				"column": 0
			};
		}
	};
});