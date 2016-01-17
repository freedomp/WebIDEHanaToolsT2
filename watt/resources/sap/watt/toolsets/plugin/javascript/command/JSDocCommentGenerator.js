/**
 * The generate comment command
 *
 */
define(["./../util/editorUtil"], function(mEditorUtil) {
	"use strict";
	return {
		nodeInfo: null,
		editor: null,
		contentStatus: null,
		execute: function() {
			var services = this.context.service;
			var that = this;
			return Q.all([this._getCurrentDocumentInContent(),
			that._setCursorInEditor(that.editor, that.nodeInfo.commentLoc.start.line,
					that.nodeInfo.commentLoc.start.column)]).spread(
				function(document) {
					return services.jsdocgen.generateComment(that.nodeInfo, document, that.contentStatus.delimiter).then(function(comment) {
						return that.editor.addString(comment, null, true);
					});
				});
		},

		_getCurrentDocumentInContent: function() {
			return this.context.service.content.getCurrentDocument();
		},

		_setCursorInEditor: function(oEditor, line, column) {
			if (oEditor) {
				return oEditor.gotoLine(line, column);
			} else {
				return Q();
			}
		},

		_getContentStatus: function(oEditor) {
			if (oEditor) {
				return oEditor.getContentStatus(true);
			}
		},

		_isSupportedFileType: function(filePath) { //TODO: find out supported accroding to content type?
			return (filePath && (filePath.match(/\.js$/) !== null));
		},

		_isSupported: function() {
			var services = this.context.service;
			var that = this;
			return mEditorUtil.getCurrentEditor(services.selection).then(function(oEditor) {
				if (oEditor) {
					return oEditor.getVisible().then(function(visible) {
						if (visible) {
							return oEditor.getCurrentFilePath().then(function(sFile) {
								if (that._isSupportedFileType(sFile)) {
									return that._getContentStatus(oEditor).then(function(oContentStatus) {
										if (!oContentStatus) {
											return false;
										}
										return services.jsdocgen.findDefinition(oContentStatus).then(function(nodeInfo) {
											that.nodeInfo = nodeInfo;
											that.editor = oEditor;
											that.contentStatus = oContentStatus;
											return that.nodeInfo && !(that.nodeInfo.node == null);
										});
									});
								} else {
									return false;
								}
							});
						} else {
							return false;
						}
					});
				} else {
					return false;
				}
			});
		},

		isAvailable: function() {
			return this._isSupported();
		},

		isEnabled: function() {
			return this._isSupported();
		}
	};
});