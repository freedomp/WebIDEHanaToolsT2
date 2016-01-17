jQuery.sap.declare("sap.app.template.masterdetail.Component");
jQuery.sap.require("sap.ui.core.UIComponent");

sap.ui.core.UIComponent.extend("sap.app.template.masterdetail.Component", {

	metadata: "component.json",

	init: function () {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	},

	onWindowError: function (sMessage, sFile, iLine) {

	},

	onWindowBeforeUnload: function () {

	},

	onWindowUnload: function () {

	}

});