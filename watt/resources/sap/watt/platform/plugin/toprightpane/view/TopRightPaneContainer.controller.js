(function() {
	"use strict";
	sap.ui.controller("sap.watt.platform.plugin.toprightpane.view.TopRightPaneContainer", {

		onInit : function() {
		},

		addItem : function(oContent, index) {
			if (index) {
				this.byId("topRightPaneContainerLayout").insertContent(oContent, index);
			} else {
				this.byId("topRightPaneContainerLayout").addContent(oContent);
			}
		}
	});
}());