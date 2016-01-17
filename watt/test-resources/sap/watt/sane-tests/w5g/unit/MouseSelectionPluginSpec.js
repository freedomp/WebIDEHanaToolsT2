define(["w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils"],
	function (w5gTestUtils, W5gUtils) {
		"use strict";
		describe("Mouse Selection plugin", function () {

			/**
			 * click and assert selected overlay
			 * @param {object} oOverlayToClick overlay item to be clicked
			 * @param {object=} oOverlayExpectedToBeSelected overlay item to be selected after click, if null the clicked overlay is expected to be selected
			 */
			function clickAndAssertSelection(oOverlayToClick, oOverlayExpectedToBeSelected) {
				oOverlayToClick.$().click();
				if (oOverlayExpectedToBeSelected) {
					expect(oOverlayToClick.getSelected()).to.not.be.ok;
					expect(oOverlayExpectedToBeSelected.getSelected()).to.be.ok;
				} else {
					expect(oOverlayToClick.getSelected()).to.be.ok;
				}
			}

			/**
			 * test controls if not selecatble
			 * @param {Array<sap.ui.core.Control>} aContent array of Controls
			 * @private
			 */
			function testContentIsNotSelectable(aContent) {
				for (var i = 0; i < aContent.length; i++) {
					var oOverlay = W5gUtils.getControlOverlay(aContent[i]);
					expect(oOverlay.isSelectable()).to.be.false;
				}
			}

			describe("Click selections", function () {
				var oW5gMouseSelectionPlugin, oButton1Overlay, oButton2Overlay, oVBox3Overlay, oVBox2Overlay, oPageOverlay, oViewOverlay;

				before(function () {
					jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection");
					var oView = sap.ui.view({
						viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\r\n" +
						"    <Page id=\"detailPage\" title=\"Roomba\">\r\n" +
						"        <content>\r\n" +
						"			<VBox width=\"100%\" direction=\"Column\" id=\"__vbox2\">" +
						"				<items>\r\n" +
						"					<VBox width=\"100%\" direction=\"Column\" id=\"__vbox3\">\r\n" +
						"						<items>\r\n" +
						"							<Button id=\"button1\" text=\"Button\" width=\"310px\"/>\r\n" +
						"							<Button id=\"button2\" text=\"Button\" width=\"310px\"/>\r\n" +
						"						</items>\r\n" +
						"					</VBox>\r\n" +
						"				</items>\r\n" +
						"			</VBox>\r\n" +
						"        </content>\r\n" +
						"    </Page>\r\n" +
						"</mvc:View>",
						type: sap.ui.core.mvc.ViewType.XML
					});

					w5gTestUtils.placeAt("content", oView);
					oW5gMouseSelectionPlugin = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection({
						w5gUtils: W5gUtils,
						editor: w5gTestUtils.DummySelectorEditor
					});
					w5gTestUtils.createDesignTime({
						designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
						rootElements: [oView],
						plugins: [oW5gMouseSelectionPlugin]
					});
					sap.ui.getCore().applyChanges();
					oButton1Overlay = W5gUtils.getControlOverlay(oView.byId("button1"));
					oButton2Overlay = W5gUtils.getControlOverlay(oView.byId("button2"));
					oVBox3Overlay = W5gUtils.getControlOverlay(oView.byId("__vbox3"));
					oVBox2Overlay = W5gUtils.getControlOverlay(oView.byId("__vbox2"));
					oPageOverlay = W5gUtils.getControlOverlay(oView.byId("detailPage"));
					oViewOverlay = W5gUtils.getControlOverlay(oView);
				});


				it("Expect button to be selected when clicking it on the first time and its parent is currently selected", function () {
					oVBox3Overlay.setSelected(true);
					clickAndAssertSelection(oButton1Overlay);
				});

				it("Expect button to be selected when clicking it while its sibling button is selected", function () {
					oButton1Overlay.setSelected(true);
					clickAndAssertSelection(oButton2Overlay);
				});

				it("Expect selection to go all the way to the view and back to the button while keep clicking it", function () {
					clickAndAssertSelection(oButton1Overlay);
					clickAndAssertSelection(oButton1Overlay, oVBox3Overlay);
					clickAndAssertSelection(oButton1Overlay, oVBox2Overlay);
					clickAndAssertSelection(oButton1Overlay, oPageOverlay);
					clickAndAssertSelection(oButton1Overlay, oViewOverlay);
					//back to the clicked control
					clickAndAssertSelection(oButton1Overlay);
				});

			});

			describe("W5G Mouse Selection Register Overlay test suite", function () {
				var oW5gMouseSelectionPlugin,
					oViewOverlay,
					oFragmentForm,
					oFragmentOverlay,
					aFragFormContent,
					aNestedFormContent,
					oNestedView,
					oNestedOverlay,
					oDesignTime,
					oView;

				before(function () {
					jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection");

					oView = w5gTestUtils.createViewWithFragmentAndNestedView();
					w5gTestUtils.placeAt("content", oView);

					oW5gMouseSelectionPlugin = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection({
						w5gUtils: W5gUtils,
						editor: w5gTestUtils.DummySelectorEditor
					});
					oDesignTime = w5gTestUtils.createDesignTime({
						designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
						rootElements: [oView],
						plugins: [oW5gMouseSelectionPlugin]
					});
					sap.ui.getCore().applyChanges();

					var oPage = oView.byId("detailPage");
					oViewOverlay = W5gUtils.getControlOverlay(oView);
					oFragmentForm = oPage.getContent()[1];
					aFragFormContent = oFragmentForm.getContent();
					oFragmentOverlay = W5gUtils.getControlOverlay(oFragmentForm);

					oNestedView = oPage.getContent()[2];
					aNestedFormContent = oNestedView.getContent()[0].getContent();
					oNestedOverlay = W5gUtils.getControlOverlay(oNestedView);
				});

				after(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				it("Fragment should be selectable", function () {
					expect(oViewOverlay).to.exist;
					expect(oFragmentOverlay).to.exist;
					expect(oFragmentOverlay.isSelectable()).to.be.true;
				});

				it("Controls inside Fragment should not be selectable", function () {
					testContentIsNotSelectable(aFragFormContent);
				});

				it("Click on control inside fragment should focus on fragment", function () {
					clickAndAssertSelection(W5gUtils.getControlOverlay(aFragFormContent[1]), oFragmentOverlay);
				});

				it("Netsed view should be selectable", function () {
					expect(oNestedOverlay).to.exist;
					expect(oNestedOverlay.isSelectable()).to.be.true;
				});

				it("Contorls inside nested view should not be selectable", function () {
					testContentIsNotSelectable(aNestedFormContent);
				});

				it("Click on control inside nested view should focus on nested view", function () {
					clickAndAssertSelection(W5gUtils.getControlOverlay(aNestedFormContent[1]), oNestedOverlay);
				});
			});
		});
	});

