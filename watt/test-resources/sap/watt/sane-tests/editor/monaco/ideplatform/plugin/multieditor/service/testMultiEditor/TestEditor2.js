define(["sap/watt/common/plugin/platform/service/ui/AbstractEditor"], function(AbstractEditor) {
	"use strict";

	var Editor = AbstractEditor.extend("qunit.multieditor.service.TestEditor2", {

		init: function() {
			this._oLayout = new sap.ui.layout.VerticalLayout();
			this._oLayout.setWidth("100%");
			this._oTextArea = new sap.ui.commons.TextArea();
			this._oLayout.addContent(this._oTextArea);
		},

		open: function(oDocument) {
			var that = this;
			this._oDocument = oDocument;
			return this._oDocument.getContent().then(function(sContent) {
				that._oTextArea.setValue(sContent);
			});
		},

		getContent: function() {
			return this._oLayout;
		},

		flush: function() {
		},
	
		undo: function() {
		},
	
		redo: function() {
		},

		hasUndo: function() {
			return true;
		},

		hasRedo: function() {
			return false;
		},

		markClean: function() {
		},

		isClean: function() {
			return true;
		}

	});

	return Editor;

});