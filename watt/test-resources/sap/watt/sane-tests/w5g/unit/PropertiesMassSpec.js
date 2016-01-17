define([
	"w5g/w5gTestUtils",
	"sap/watt/lib/lodash/lodash",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/models/W5gPropertiesModel"
], function (oW5gTestUtils, _, W5gPropertiesModel) {
	"use strict";

	describe("Mass tests: test all supported controls that can be added to content Aggregation of view", function () {

		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");

		// create a test for each control
		_.keys(sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata).forEach(function (sControlName) {
			if (sControlName !== "sap.ui.core.mvc.XMLView") {
				var fnConstructor = jQuery.sap.getObject(sControlName);
				createTestForControl(new fnConstructor());
			}
		});

		function createTestForControl(oControlToTest) {
			var _sControlName = oControlToTest.getMetadata().getName();
			var _oControlToTest = oControlToTest;

			it('Checks for "' + _sControlName + '" ', function () {
				var oModel = new W5gPropertiesModel();
				oModel.setControl(_oControlToTest);
				var sControlName_expected;
				var sName = _sControlName.substring(_sControlName.lastIndexOf(".") + 1);
				if (sName === 'HBox' || sName === 'VBox') {
					sControlName_expected = sName;
				} else {
					sControlName_expected = _.startCase(sName);
				}
				assert.ok(sControlName_expected === oModel.getProperty("/controlName"), "Expected control Name: " + sControlName_expected);
			});
		}
	});
});
