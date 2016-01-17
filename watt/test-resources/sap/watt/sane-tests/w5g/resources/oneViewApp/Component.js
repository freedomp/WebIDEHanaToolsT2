jQuery.sap.declare("Fiori.Component");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

sap.ui.core.UIComponent.extend("Fiori.Component", {
	metadata: {
		"name": "Master Detail Sample",
		"version": "1.0",
		"includes": [],
		"dependencies": {
			"libs": ["sap.m", "sap.me"],
			"components": []
		}

	},

	init: function () {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},

	/**
	 * Initialize the application
	 *
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent: function () {

		var oViewData = {
			component: this
		};
		return sap.ui.view({
			id: "Detail",
			viewName: "Fiori.Detail",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: oViewData
		});
	}
});