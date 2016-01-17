define([], function() {
	"use strict";
	return {
		execute: function() {
			var oService = this.context.service;
			oService.usagemonitoring.startPerf("editor", "format_content").done();
			var that = this;
			return oService.selection.assertNotEmpty().then(function(aSelection) {
				var selection = aSelection && aSelection[0];
				if (selection) {
					var fileExtension = selection.document && selection.document.getEntity().getFileExtension();
					return selection.document.getContent().then(function(aContent) {
						return oService.beautifierProcessor.beautify(aContent, fileExtension, null).then(function(sFormattedContent){
							return that._setContentInEditor(sFormattedContent).then(function() {
								that.context.service.usagemonitoring.report("editor", "format_content",fileExtension).done();
							});
						});
					});
				}
				return Q();
		});
		},

		_getCodeEditor: function() {
			return this.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {
				if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
					return oCurrentEditorInstance;
				} else {
					return null;
				}
			});
		},

		_setContentInEditor : function(sFormattedContent){
			return this._getCodeEditor().then(function(oEditor) {
				if (oEditor) {
					return oEditor.getUI5Editor().then(function(oUI5Editor) {
						if (oUI5Editor) {
							var position = oUI5Editor.getCursorPosition();
							oUI5Editor.setDocValue(sFormattedContent);
							if (position) {
								return Q(oUI5Editor.moveCursorTo(position.row, position.column));
							} else {
								return Q();
							}
						}
					});
				} else {
					return Q();
				}
			});
		},

		isAvailable: function() {
			return true;
		},

		_isAceEditorInstance : function(){
			return this._getVisibleAceEditor().then(function(oEditor) {
				return !!oEditor;
			});
		},

		_getVisibleAceEditor : function(){
			return this.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {
				if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
					return oCurrentEditorInstance;
				} else {
					return null;
				}
			});
		},

		isEnabled: function() {
			var that = this;
			return this._isAceEditorInstance().then(function(bEnabled){
				if(bEnabled){
					var selectionService = that.context.service.selection;
					var beautifierProcessor = that.context.service.beautifierProcessor;
					return selectionService.assertNotEmpty().then(function(aSelection) {
						var selection = aSelection && aSelection[0];
						if (selection) {
							var fileExtension = selection.document && selection.document.getEntity().getFileExtension();
							return beautifierProcessor.hasBeautifierForFileExtension(fileExtension);
						}
						return false;
					});
				}else{
					return false;
				}
			});

		}
	};
});
