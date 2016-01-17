define(["sap/watt/common/plugin/platform/service/ui/AbstractEditor"], function(AbstractEditor) {
	"use strict";

	var Editor = AbstractEditor.extend("qunit.multieditor.service.TestEditor1", {

		init: function() {
			this._oLayout = new sap.ui.layout.VerticalLayout();
			this._oLayout.setWidth("100%");
			this._oButton = new sap.ui.commons.Button();
			this._oLayout.addContent(this._oButton);
		},

		open: function(oDocument) {
			var that = this;
			this._oDocument = oDocument;
			return this._oDocument.getContent().then(function(sContent) {
				that._oButton.setText(sContent);
			});
		},

		getContent: function() {
			return this._oLayout;
		},

		flush: function() {

		}

	});

	return Editor;

});