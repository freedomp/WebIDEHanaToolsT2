define(function() {
	"use strict";
	return {

		_sServerType : sap.watt.getEnv("server_type"),

		execute : function(vValue, oWindow) {
			var selectionService = this.context.service.selection;
			var previewService = this.context.service.ushellsandboxpreview;

			selectionService.assertNotEmpty().then(function(aSelection) {
				return previewService.showPreview(aSelection[0].document, oWindow);
			}).fail(function(oError) {
				// standard error handler just logs to console, but we want additionally a popup;
				throw oError;
			}).done();
		},

		isAvailable : function() {
			// so far, we only support local tomcat, local and hana cloud
			var sServerType = this._sServerType;
			return (sServerType === "java") || (sServerType === "hcproxy") || (sServerType === "local_hcproxy");
		},

		isEnabled : function() {
			var selectionService = this.context.service.selection;
			var previewService = this.context.service.ushellsandboxpreview;
			var that = this;

			return selectionService.assertNotEmpty().then(function(aSelection) {
				return that._isExecutable(aSelection[0]);
			});
		},

		_isExecutable : function(oSelection) {
			var oDocument = null;
			var sName = null;
			var sType = null;
			if (oSelection && oSelection.document) {
				oDocument = oSelection.document;
				sName = oDocument.getEntity().getName();
				sType = oDocument.getType();
			}

			return (sType === "file" && (sName === "Component.js" || new RegExp(".*fiorisandboxconfig.*\.json", "i").test(sName)));
		}
	};
});
