define(["STF", "w5g/w5gTestUtils"], function (STF, w5gTestUtils) {
	"use strict";

	describe("WYSIWYG", function () {
		var sMockPageUrl = w5gTestUtils.toFullURL("MockPage.html");
		var sSimpleMDAppIndexUrl = w5gTestUtils.toFullURL("simpleMDApp/index.html");

		function getWysiwygDeviceStyle() {
			return w5gTestUtils.oW5G._getDeviceClass();
		}

		describe("SimpleControl", function () {
			beforeEach(function () {
				w5gTestUtils.placeWysiwygAt("content");
			});

			it("WYSIWYG change src property", function (done) {
				var $iframe = jQuery("iframe");
				w5gTestUtils.oW5G.attachLoaded(function (oEvent) {
					var oWindow = oEvent.getParameter("window");
					$iframe = jQuery("iframe");
					var oPage = new oWindow.sap.m.Page().placeAt("content");
					oPage.addContent(new oWindow.sap.m.Button({
						text: "Button"
					}));
					assert.ok($iframe[0], "iframe should now be created");
					assert.ok(w5gTestUtils.oW5G.$().hasClass("sapWysiwygWrapper") && w5gTestUtils.oW5G.$().hasClass(getWysiwygDeviceStyle()), "the WYSIWYG control has the right classes");
					assert.ok($iframe.hasClass("sapWysiwygIframe") && $iframe.hasClass(getWysiwygDeviceStyle()), "the Iframe element has the right classes");
					assert.ok($iframe.attr("src") === sMockPageUrl + "?sap-ui-xx-designMode=true&responderOn=true&sap-ui-xx-noless=true", "the iframe has the right src after change");
					done();
				});
				// The following line triggers the reload and the tests above
				w5gTestUtils.oW5G.setSrc(sMockPageUrl);
			});

			afterEach(function () {
				w5gTestUtils.cleanupWysiwyg();
			});
		});

		describe("Testing Operations 1", function () {
			beforeEach(function () {
				return w5gTestUtils.placeReadyWysiwygWithDefaultApp();
			});

			var assertButtonVisibility = function (sButtonId, bVisible) {
				var assertFunction;
				if (bVisible) {
					assertFunction = assert.notStrictEqual;
				} else {
					assertFunction = assert.strictEqual;
				}

				assertFunction(
					w5gTestUtils.oScope.jQuery("[data-sap-ui-dt-for=" + sButtonId + "]").css("display"),
					"none",
					sButtonId + " must " + bVisible ? "" : "not" + " be visible"
				);
			};

			it("iconTabBar with tabFilter switching and overlays", function () {
				var oScope = w5gTestUtils.oScope;
				var OIconTabBar = oScope.getWindow().sap.m.IconTabBar;
				var OIconTabFilter = oScope.getWindow().sap.m.IconTabFilter;
				var OButton = oScope.getWindow().sap.m.Button;

				var oTestIconTabBar = new OIconTabBar("testIconTabBar", {
					selectedKey: "filter1"
				});
				var oTestIconTabFilter1 = new OIconTabFilter("testIconTabFilter1", {
					key: "filter1",
					icon: "sap-icon://hint"
				});
				var oTestIconTabFilter2 = new OIconTabFilter("testIconTabFilter2", {
					key: "filter2",
					icon: "sap-icon://display"
				});
				var oTestButton1 = new OButton("testIconTabButton1", {
					text: "testButton1"
				});
				var oTestButton2 = new OButton("testIconTabButton2", {
					text: "testButton2"
				});

				oTestIconTabFilter1.addContent(oTestButton1);
				oTestIconTabFilter2.addContent(oTestButton2);
				oTestIconTabBar.addItem(oTestIconTabFilter1);
				oTestIconTabBar.addItem(oTestIconTabFilter2);

				oScope.getControl("Detail--page").addContent(oTestIconTabBar);
				oScope.getCore().applyChanges();
				var fnShowIconTabFilter = oScope.getWindow().sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata["sap.m.IconTabBar"]
					.aggregations["items"].show;

				assertButtonVisibility("testIconTabButton1", true);
				assertButtonVisibility("testIconTabButton2", false);

				fnShowIconTabFilter.call(oTestIconTabBar, oTestIconTabFilter2);
				oScope.getCore().applyChanges();

				assertButtonVisibility("testIconTabButton1", false);
				assertButtonVisibility("testIconTabButton2", true);

				fnShowIconTabFilter.call(oTestIconTabBar, oTestIconTabFilter1);
				oScope.getCore().applyChanges();

				assertButtonVisibility("testIconTabButton1", true);
				assertButtonVisibility("testIconTabButton2", false);
			});

			afterEach(function () {
				w5gTestUtils.cleanupWysiwyg();
			});
		});

		describe("Testing Operations 2", function () {
			beforeEach(function () {
				w5gTestUtils.oW5G = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg({
					device: "tablet"
				});
				w5gTestUtils.placeAt("content");
				sap.ui.getCore().applyChanges();
			});

			it("Not default parameters", function () {
				w5gTestUtils.oW5G.attachLoaded(function (done) {
					assert.ok(w5gTestUtils.oW5G.$().hasClass("sapWysiwygWrapper") && w5gTestUtils.oW5G.$().hasClass(getWysiwygDeviceStyle()), "The Wysiwyg control has the right classes after rendering");
					//ok(jQuery("iframe").hasClass("sapWysiwygIframe sapWysiwygTablet"), "The iframe element has the right classes after rendering");
					done();
				});
				w5gTestUtils.oW5G.setSrc(sSimpleMDAppIndexUrl);
			});

			afterEach(function () {
				w5gTestUtils.cleanupWysiwyg();
			});
		});
	});
});
