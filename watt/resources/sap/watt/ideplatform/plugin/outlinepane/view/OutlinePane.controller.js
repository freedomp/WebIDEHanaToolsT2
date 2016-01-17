(function() {

	"use strict";

	sap.ui.controller("sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane", {

		init : function(oContext) {
			this._oContent = this.byId("outlinePaneContent");
		},

		onAfterRendering : function() {
		},

		placeOutlineView : function(oView) {
			this._oContent.addContent(oView);
			this._oContent.rerender();
		},

		removeOutlineView : function() {
			this._oContent.removeAllContent();
			this._oContent.rerender();
		}
	});
}());
