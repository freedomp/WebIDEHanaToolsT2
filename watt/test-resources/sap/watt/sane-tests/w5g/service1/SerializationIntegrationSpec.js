define(["STF"], function (STF) {
	"use strict";
	var suiteName = "Serialization Integration", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, sap, oSettings, oDocumentService, w5gTestUtils, oWysiwygEditorService, mDocuments;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service1/w5geditor.html"
			}).then(function (oWindow) {
				jQuery = oWindow.jQuery;
				sap = oWindow.sap;
				return STF.require(suiteName, ["sane-tests/w5g/w5gTestUtils"]).spread(function (util) {
					w5gTestUtils = util;
					var oProjectSettings = getService('setting.project');
					oSettings = w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oWysiwygEditorService = getService('ui5wysiwygeditor');
					oDocumentService = getService('document');
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService, true).then(function (mDocs) {
						mDocuments = mDocs;
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		function selectAndDeleteControl(sId) {
			var oFirstChange = Q.defer();
			oDocumentService.attachEventOnce("changed", function (oEvent) {
				assert.ok(oEvent.params.document.isDirty(), "document is dirty");
				oFirstChange.resolve();
			});
			var p = oWysiwygEditorService.selectUI5Control(sId).then(function () {
				return oWysiwygEditorService.deleteUI5Control();
			});
			return Q.all([p, oFirstChange.promise]);
		}

		describe("ui5w5geditor serializer integration with basic XML", function () {

			beforeEach(function () {
				return w5gTestUtils.openDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			afterEach(function () {
				return w5gTestUtils.closeAndResetDocument(oWysiwygEditorService, mDocuments.oViewDoc);
			});

			it("check view dirty state on control deletion", function () {
				return selectAndDeleteControl("__item1");
			});

			it("change view content and open it again in the editor", function () {
				return mDocuments.oViewDoc.getContent().then(function (sContent) {
					var sNewContent = sContent.substring(0, sContent.indexOf("<List")) + "" + sContent.substring(sContent.indexOf("</List") + 7);
					return mDocuments.oViewDoc.setContent(sNewContent).then(function () {
						return oWysiwygEditorService.open(mDocuments.oViewDoc).then(function () {
							return oWysiwygEditorService.getRoot().then(function (oView) {
								var oPage = oView.byId("page");
								var oList = oView.byId("list");
								var oButton = oView.byId("button");
								assert.ok(oPage, "page control is still available");
								assert.ok(!oList, "list control is no more available");
								assert.ok(oButton, "button control is still available");
							});
						});
					});
				});
			});

			it("Remove control via editor and check the xml code after flush", function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oButton = oView.byId("button");
					return Q.all([oWysiwygEditorService.deleteUI5Control(oButton), oWysiwygEditorService.flush()]).spread(function () {
						return mDocuments.oViewDoc.getContent().then(function (sContent) {
							assert.equal(sContent.indexOf("<Button>"), -1, "button should be removed in the xml code");
						});
					});
				});
			});

			it("Add attribute to objectHeader and remove it without save", function () {
				return oWysiwygEditorService.getRoot().then(function (oView) {
					var oObjectHeader = oView.byId("objectHeader");
					jQuery.sap.require('sap.m.ObjectAttribute');
					var oObjectAttribute = new sap.m.ObjectAttribute("myAttribute", {
						text: 'attribute text'
					});
					var attAgg = oObjectHeader.getAttributes();
					attAgg.push(oObjectAttribute);
					oObjectAttribute.setParent(oObjectHeader, "attributes");
					return Q.all([oWysiwygEditorService.deleteUI5Control(oObjectAttribute), oWysiwygEditorService.flush()]).spread(function () {
						return mDocuments.oViewDoc.getContent().then(function (sContent) {
							assert.equal(sContent.indexOf("myAttribute"), -1, "ObjectAttribute should be removed from the xml code");
						});
					});
				});
			});
		});

		describe("ui5w5geditor serializer integration with various XMLs", function () {

			it("Remove control that caused write escape of null", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewWithUnsupportedControl, function () {
					return oWysiwygEditorService.getRoot().then(function (oView) {
						var oTable = oView.byId("reviewTable");
						return Q.all([oWysiwygEditorService.deleteUI5Control(oTable), oWysiwygEditorService.flush()]).spread(function () {
							return mDocuments.oViewWithUnsupportedControl.getContent().then(function (sContent) {
								assert.equal(sContent.indexOf("<Table>"), -1, "Table should be removed in the xml code");
							});
						});
					});
				});
			});

			it("Should not make unchanged view dirty after flush", function () {
				return mDocuments.oViewWithNonStandardNamespaceContent.getContent().then(function (sOldViewContent) {
					return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewWithNonStandardNamespaceContent).then(function () {
						return oWysiwygEditorService.flush().then(function () {
							return mDocuments.oViewWithNonStandardNamespaceContent.getContent();
						}).then(function (sNewViewContent) {
							assert.strictEqual(sNewViewContent, sOldViewContent, "View content should not be change by flush/serialization only");
							assert.ok(!mDocuments.oViewWithNonStandardNamespaceContent.isDirty(), "View shouldn't get dirty");
						});
					});
				});
			});

			it("check xml view with nested view from local resource path (xmlView2)", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oLocalNestedXMLViewDoc, function () {
					return oWysiwygEditorService.selectUI5Control("__xmlview0").then(function () {
						return oWysiwygEditorService.getScope().then(function (oScope) {
							assert.equal(oScope.$("div[data-sap-ui-dt-for$='__xmlview0']").length, 1, "There should be a overlay for the root xmlView control");
							var badge = oScope.$("div.controlOverlayBadge[data-sap-ui-dt-for$='myXMLView2']");
							assert.ok(badge.length === 1, "Found overlay indicating that the local inner view was found.");
							assert.ok(badge.attr("badge-data") === "Subview: NestedXMLView", "Overlay badge text is 'Subview: NestedXMLView'.");
						});
					});
				});
			});

			it("remove main page container leads to dirty context and swept anything from the view", function () {
				return w5gTestUtils.openDocAndCleanAfter(oWysiwygEditorService, mDocuments.oViewDoc, function () {
					return oWysiwygEditorService.getRoot().then(function (oView) {
						var oPage = oView.byId("page");
						return Q.all([oWysiwygEditorService.deleteUI5Control(oPage), oWysiwygEditorService.flush()]).spread(function () {
							return mDocuments.oViewDoc.getContent().then(function (sContent) {
								assert.equal(sContent.indexOf("<Page>"), -1, "Page should be removed in the xml code");
							});
						});
					}).then(function () {
						assert.ok(mDocuments.oViewDoc.isDirty(), "View should get dirty");
					}).then(function () {
						return oWysiwygEditorService.getRoot().then(function (oView) {
							var oPage = oView.byId("page");
							assert.ok(!oPage, "Page control should be removed");
						});
					});
				});
			});

			it("check view with simulated control from parent application", function () {
				oSettings.namespace = 'xmlView.parent';
				oSettings.parentResourceRootUrl = 'extended/parent/control';
				return oWysiwygEditorService.open(mDocuments.oExtendedViewWithControlInParent);
			});
		});
	});
});
