define([], function() {
	"use strict";

	var FakeAceEditor = function(oDocument) {
		this._oDocument = oDocument;
	};

	FakeAceEditor.prototype = {
		_oDocument: null,

		instanceOf: function(sInterface) {
			return sInterface === "sap.watt.common.plugin.aceeditor.service.Editor";
		},

		getSelection: function() {
			return Q({
				document: this._oDocument
			});
		},

		setDocument: function(oDoc) {
			this._oDocument = oDoc;
		},

		addString: function(sContent) {
			return Q();
		}
	};

	return FakeAceEditor;
});