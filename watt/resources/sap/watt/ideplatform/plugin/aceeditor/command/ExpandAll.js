define(["./Utils"], function(mUtils) {
	"use strict";
	return {
		execute: function() {
			var that = this;
			return this._getCodeEditor().then(function(oEditor) {
				if (oEditor) {
					return oEditor.expandAll().then(function(){
					that.context.service.focus.setFocus(oEditor);
				});
				} else {
					return Q();
				}
			});
		},

		isAvailable: function() {
			return true;
		},

		isEnabled: function() {
			return this._getCodeEditor().then(function(oEditor) {
				if (oEditor) {
					return oEditor.getVisible().then(function(visible) {
						if (visible) {
							return oEditor.getSelectionRange().then(function(range) {
								if (range) {
									return true;
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

		_getCodeEditor: function() {
			return mUtils._getCodeEditor(this.context.service.selection);
		}
	};
});