define(["STF", "w5g/mass/MassUtil"], function (STF, MassUtil) {
	"use strict";
	var suiteName = "Mass tests", getService = STF.getServicePartial(suiteName);

	// Mass test suite purpose is testing W5G capability, sanity and integration with UI5 controls
	// Test will randomly generate number of XML views and will open and interact them in Layout editor
	describe("Mass test suite", function () {
		// timeout is required in order to load all dependencies and set test functional
		this.timeout(59000);
		jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
		var w5gTestUtils, oWysiwygEditorService, mDocuments,
			aAllDesignTimeMetadata = Object.keys(sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata);
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json", html: "w5g/mass/w5geditor.html"
			}).then(function () {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (_w5gTestUtils) {
					w5gTestUtils = _w5gTestUtils;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					return w5gTestUtils.configureEditor(getService, "ace").then(function () {
						return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
							mDocuments = mDocs;
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		for (var j = 0; j < 200; j++) {
			it("Should open XML in W5G", function () {
				var sRandomXML = MassUtil.generateXMLView(aAllDesignTimeMetadata, 3);
				console.log(sRandomXML);
				return mDocuments.oEmptyView.setContent(sRandomXML).then(function () {
					return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oEmptyView);
					// TODO add callback with generic asserts per opened view
				});
			});
		}
	});
});