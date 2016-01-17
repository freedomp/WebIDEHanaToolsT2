define([ "sap/watt/common/plugin/platform/service/ui/AbstractEditor" ], function(AbstractEditor) {
	"use strict";
	var FakeEditor = AbstractEditor.extend("sap.watt.common.plugin.ui5wysiwyg.service.ui5wysiwygeditor", {
		oLayout : null,

		getContent : function() {
			this.oLayout = new sap.ui.commons.layout.VerticalLayout({
       				width : '100%'
       			});
			this.oLayout.__widget = {
				isSelectable : function() {
					return true;
				}
			};
			this.oLayout.addContent(
					new sap.ui.commons.Button({
					text : "fake outline button",
					id: "fakeButton"
				})
			);
			this.oLayout.addContent(
					new sap.ui.commons.Button({
					text : "test outline button",
					id: "testButton"
				})
			);

			return this.oLayout;
		},

		getTitle : function() {
			return Q().then(function() {
				return "title";
			});
		},

		iterateOverAllPublicAggregationsOfRootControl : function(callback) {
			return callback(null, [this.oLayout]);
		},

		selectUI5Control : function(oControl) {
			ok(true, "UI5 control selection triggers!");
		},

		highlightUI5Control : function(oControl) {
			ok(true, "UI5 control highlight triggers!");
		},

		downplayUI5Control : function(oControl) {
			ok(true, "UI5 control downplay triggers!");
		}
	});
	return FakeEditor;
});