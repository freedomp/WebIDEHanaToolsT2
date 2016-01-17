define([ "sap/watt/common/plugin/platform/service/ui/AbstractEditor" ], function(AbstractEditor) {
	"use strict";
	var NotAvailableEditor = AbstractEditor.extend("sap.watt.common.plugin.editor.service.FakeEditor", {
		_bAvailable : false,

		isAvailable : function() {
			return this._bAvailable;
		},
		setAvailable : function(bAvailable) {
			this._bAvailable = bAvailable;
		}
	});
	return NotAvailableEditor;
});