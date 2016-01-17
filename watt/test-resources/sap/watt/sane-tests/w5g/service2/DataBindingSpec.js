define(["STF", "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/databinding/DataBinding"], function (STF, DataBinding) {
	"use strict";
	var oWindow, sap, jQuery, oFilesystem, oFakeFileDAO, suiteName = 'Data Binding', getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var oViewWithEnumerationDoc, oFormatterDoc, oBooleanDoc;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function (_oWindow) {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (w5gTestUtils) {
					oWindow = _oWindow;
					jQuery = oWindow.jQuery;
					sap = oWindow.sap;
					oFilesystem = getService('filesystem.documentProvider');
					oFakeFileDAO = getService('fakeFileDAO');
					w5gTestUtils.initializeBeforeServiceTest(getService('setting.project'));
					jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
					jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
					jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.PatchCore");
					jQuery.sap.require("sap.m.Input");
					sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.PatchCore.patch(oWindow);
					return createFileStructure();
				});
			});
		});

		after(function () {
			oViewWithEnumerationDoc.destroy();
			oFormatterDoc.destroy();
			oBooleanDoc.destroy();
			STF.shutdownWebIde(suiteName);
		});

		function fullPath(sFileName) {
			return window.W5G_LIBS_PREFIX + "/src/main/webapp/test-resources/sap/watt/sane-tests/w5g/service2/DataBinding/" + sFileName;
		}

		function createFileStructure() {
			return Q(jQuery.get(fullPath("metadata.xml"))).then(function (mdata) {
				return Q.all([
					Q(jQuery.get(fullPath("EnumWithBinding.view.xml"))),
					Q(jQuery.get(fullPath("Formatter.view.xml"))),
					Q(jQuery.get(fullPath("Boolean.view.xml")))
				]).then(function (aXmlContent) {
					return oFakeFileDAO.setContent({
						"project": {
							"model": {
								"metadata.xml": new XMLSerializer().serializeToString(mdata)
							},
							"EnumWithBinding.view.xml": new XMLSerializer().serializeToString(aXmlContent[0]),
							"Formatter.view.xml": new XMLSerializer().serializeToString(aXmlContent[1]),
							"Boolean.view.xml": new XMLSerializer().serializeToString(aXmlContent[2])
						}
					}).then(function () {
						var enumWithBindingViewPromise = oFilesystem.getDocument("/project/EnumWithBinding.view.xml").then(function (oDoc2) {
							return oDoc2.getContent().then(function (content) {
								oViewWithEnumerationDoc = sap.ui.xmlview("EnumWithBinding", {viewContent: content});
								oViewWithEnumerationDoc.placeAt("content");
							});
						});
						var formatterViewPromise = oFilesystem.getDocument("/project/Formatter.view.xml").then(function (oDoc3) {
							return oDoc3.getContent().then(function (content) {
								oFormatterDoc = sap.ui.xmlview("Formatter", {viewContent: content});
								oFormatterDoc.placeAt("content");
							});
						});
						var booleanViewPromise = oFilesystem.getDocument("/project/Boolean.view.xml").then(function (oDoc4) {
							return oDoc4.getContent().then(function (content) {
								oBooleanDoc = sap.ui.xmlview("Boolean", {viewContent: content});
								oBooleanDoc.placeAt("content");
							});
						});
						return Q.all([enumWithBindingViewPromise, formatterViewPromise, booleanViewPromise]);
					});
				});
			});
		}

		it("test basic binding", function () {
			var oDataBinding = new DataBinding(oWindow);
			var oInput = new sap.m.Input({value: "{kookoo}"});
			oDataBinding.displayDataBinding([oInput]);
			var oData = oInput.getModel().getData();
			var bRes = false;
			var oRegExp = /^value\W*kookoo$/; //the data has modified path: propertyName + separator + originalPath
			jQuery.each(oData, function (sKey, sValue) {
				if (oRegExp.test(sKey)) {
					bRes = sValue === "{kookoo}";
					return false;
				}
			});
			assert.ok(bRes, "string should match");
		});

		it("display data binding of enumeration", function () {
			var oDataBinding = new DataBinding(oWindow);
			var oPage = oViewWithEnumerationDoc.byId("pd_header_status");
			oDataBinding.displayDataBinding([oPage]);
			sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.iterateOverAllPublicAggregations(oViewWithEnumerationDoc, function (oContent, oValue) {
				oDataBinding.displayDataBinding(oValue);
			});
			assert.ok(true, "databinding of view with enumeration successfully passed without exception");
		});

		it("display data binding with formatter", function () {
			var oDataBinding = new DataBinding(oWindow);
			oDataBinding.displayDataBinding([oFormatterDoc]);
			assert.ok(true, "databinding of view with formatter successfully passed without exception");
		});

		it("display data binding with both boolean and text", function () {
			var oDataBinding = new DataBinding(oWindow);
			oDataBinding.displayDataBinding([oBooleanDoc]);
			assert.ok(true, "databinding of view with data binding of both boolean and text successfully passed without exception");
		});
	});
});
