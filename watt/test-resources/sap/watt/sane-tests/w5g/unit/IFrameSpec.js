define(["w5g/w5gTestUtils"], function (w5gTestUtils) {
	"use strict";
	describe("IFrame LC", function () {
		var oIFrame, oSplitter;
		before(function () {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.IFrame");
			jQuery.sap.require("sap.ui.commons.Splitter");
		});

		beforeEach(function (done) {
			delete sessionStorage.iFrameLoadCount;
			oIFrame = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.IFrame("iframe", {
				"source": window.W5G_LIBS_PREFIX + "/src/main/webapp/test-resources/sap/watt/sane-tests/w5g/unit/IFrameReload.html"
			});
			oIFrame.attachLoaded(function () {
				// Mark the Iframe window as the origin
				oIFrame.getWindow().isOriginal = "origin";
				done();
			});
			oSplitter = new sap.ui.commons.Splitter({
				width: "100%",
				height: "400px",
				splitterPosition: "50%"
			});
			oSplitter.addFirstPaneContent(oIFrame);
			w5gTestUtils.placeAt("content", oSplitter);
			sap.ui.getCore().applyChanges();
		});

		it("Create IFrame", function () {
			assert.ok(oIFrame, "IFrame control is created");
			assert.ok(jQuery("#iframe")[0], "IFrame rendered");
		});

		it("Rerender IFrame without reload", function (done) {
			oIFrame.addEventDelegate({
				onAfterRendering: function () {
					// If the iframe has the marker 'origin' then it has not been reloaded
					assert.equal(oIFrame.getWindow().isOriginal == "origin", 1, "IFrame is loaded again");
					done();
				}
			}, this);
			oSplitter.addSecondPaneContent(new sap.ui.commons.Button({"text": "Button"}));
		});

		afterEach(function () {
			oSplitter.destroy();
			oIFrame.destroy();
		});
	});
});
