define(["sap/watt/common/plugin/platform/service/ui/AbstractEditor"], function (AbstractEditor) {
	"use strict";
	var FakeEditor = AbstractEditor.extend("sap.watt.common.plugin.ui5wysiwyg.service.ui5wysiwygeditor", {
		oLayout: null,

		getContent: function () {
			this.oLayout = new sap.ui.commons.layout.VerticalLayout({
				width: '100%'
			});
			this.oLayout.__widget = {
				isSelectable: function () {
					return true;
				},
				isFiltered: function () {
					return true;
				}
			};
			this.oLayout.addContent(
				new sap.ui.commons.Button({
					text: "fake outline button",
					id: "fakeButton"
				})
			);
			this.oLayout.addContent(
				new sap.ui.commons.Button({
					text: "test outline button",
					id: "testButton"
				})
			);

			return this.oLayout;
		},

		getSelection: function () {
			return [{
				document: this._oCurrentDocument,
				control: null
			}];
		},

		open: function (oDocument) {
			this._oCurrentDocument = oDocument;
		},

		getTitle: function () {
			return Q().then(function () {
				return "title";
			});
		},

		getRoot: function () {
			var oLayout = this.oLayout;
			return Q().then(function () {
				return oLayout;
			});
		},

		iterateOverAllPublicAggregationsOfRootControl: function (callback) {
			return callback(null, [this.oLayout]);
		},

		getCurrentSelectedControl: function () {
			return undefined;
		},

		selectUI5Control: function (oControl) {
			ok(true, "UI5 control selection triggered!");
		},

		deleteUI5Control: function (oControl) {
			ok(true, "UI5 control deletion triggered!");
		},

		highlightUI5Control: function (oControl) {
			ok(true, "UI5 control highlight triggered!");
		},

		downplayUI5Control: function (oControl) {
			ok(true, "UI5 control downplay triggered!");
		}
	});
	return FakeEditor;
});