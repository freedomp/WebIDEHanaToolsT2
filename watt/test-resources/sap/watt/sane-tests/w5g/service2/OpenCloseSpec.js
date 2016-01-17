define(['STF'], function (STF) {
	"use strict";
	var suiteName = "Open & Close handling", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, w5gTestUtils, oWysiwygEditorService, mDocuments;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function (oWindow) {
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (util) {
					jQuery = oWindow.jQuery;
					w5gTestUtils = util;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
						mDocuments = mDocs;
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("check xml view without page control as root", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oRootXMLViewDoc, function () {
				return oWysiwygEditorService.selectUI5Control("__xmlview0").then(function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						assert.equal(oScope.$("div[data-sap-ui-dt-for$='__xmlview0']").length, 1, "There should be a overlay for the root xmlView control");
						var badge = oScope.$("div.controlOverlayBadge[data-sap-ui-dt-for$='myXMLView']");
						assert.ok(badge.length === 1, "Found overlay indicating that the local inner view was found.");
						assert.ok(badge.attr("badge-data") === "Subview: NestedXMLView", "Overlay badge text is 'Subview: NestedXMLView'.");
					});
				});
			});
		});

		it("open w5g editor with fragment contains image", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oFragmentWithImageDoc, function () {
				assert.ok(!mDocuments.oFragmentWithImageDoc.isDirty(), "fragment shouldn't get dirty");
			});
		});

		it("closing the editor should trigger an editor close event", function () {
			var oCloseFiredCalled = Q.defer();
			oWysiwygEditorService.attachEventOnce("closed", function () {
				assert.ok(true, "close fired");
				oCloseFiredCalled.resolve();
			});
			return Q.all(oWysiwygEditorService.open(mDocuments.oViewDoc).then(function () {
				return oWysiwygEditorService.close(mDocuments.oViewDoc);
			}), oCloseFiredCalled.promise);
		});

		it("reopening same document should work as well", function () {
			return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
				var $markerControl = jQuery("iframe").contents().find("div[data-sap-ui-dt-for$='thisIsTheRegularViewForTesting']");
				assert.strictEqual($markerControl.length, 1, "View.view.xml is opened and overlay for the marker control exists");
			});
		});

		it("open w5g editor with broken view content", function () {
			return expect(oWysiwygEditorService.open(mDocuments.oBrokenViewDoc)).to.eventually.be.rejected;
		});

		it("open w5g editor with fragment", function () {
			return expect(oWysiwygEditorService.open(mDocuments.oFragmentViewDoc)).to.eventually.be.fulfilled;
		});

		it("open w5g editor with view that contains fragment in its content", function () {
			return expect(oWysiwygEditorService.open(mDocuments.oContainsFragmentViewDoc)).to.eventually.be.fulfilled;
		});

		it("open w5g editor with view that contains a data depended expression", function () {
			return oWysiwygEditorService.open(mDocuments.oDataDependedExpression);
		});

		for (var i = 0; i < 5; ++i) {
			it("open xml view repeatedly", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewWithUnsupportedControl, function () {
					return oWysiwygEditorService.getScope().then(function (oScope) {
						var oCore = oScope.sap.ui.getCore();
						expect(oCore.byId("__xmlview0--tileContainer")).is.ok;
					});
				});
			});

		}
	});
});
