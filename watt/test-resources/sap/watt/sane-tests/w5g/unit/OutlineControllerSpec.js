define(["sap/watt/lib/lodash/lodash",
		"w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/view/OutlineTree.controller"],
	function (_, w5gTestUtils) {
		"use strict";
		var oEditor1View, oEditor2View, oView, oController;
		describe("Outline view and controller", function () {
			before(function () {
				var mSettings = {
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
				};
				// Two editors with the same ids to validate that the cache is separate
				oEditor1View = sap.ui.view(mSettings);
				oEditor2View = sap.ui.view(mSettings);

				oView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTree",
					type: sap.ui.core.mvc.ViewType.XML
				});
				oController = oView.getController();
				// mock for unit testing
				_.set(oController, "_oContext.service.focus.attachFocus", _.wrap(Q()));
				w5gTestUtils.placeAt("content", oView);
				w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [oEditor1View, oEditor2View]
				});
				sap.ui.getCore().applyChanges();
				return oController.initOutline("fold1/fold2/Doc1.view.xml", "Title", oEditor1View, window);
			});

			after(function () {
				oView.destroy();
			});

			/**
			 * @param {sap.ui.core.mvc.View} oRootView
			 * @param {string} sId
			 */
			function getNodeForControl(oRootView, sId) {
				return oController._getNodeByTag(oController._getControlTag(oRootView.byId(sId)));
			}
			/**
			 * @param {string} sId
			 * @param {string} sAggregation
			 */
			function getNodeForAggregation(sId, sAggregation) {
				return oController._getNodeByTag(oController._createTagForAggregation(sAggregation, oEditor1View.byId(sId)));
			}

			describe("Node expansion behavior", function () {
				it("consider node expanded for depth < 3", function () {
					expect(oController._getNodeByTag(oEditor1View.getId()).getExpanded()).to.be.true;
					expect(getNodeForControl(oEditor1View, "detailPage").getExpanded()).to.be.true;
				});
				it("consider node not expanded for depth >= 3", function () {
					expect(getNodeForAggregation("detailPage", "content").getExpanded()).to.be.false;
					expect(getNodeForControl(oEditor1View, "__vbox2").getExpanded()).to.be.false;
					expect(getNodeForControl(oEditor1View, "button1").getExpanded()).to.be.false;
				});
				it("consider node expanded if it is expanded automatically by selection or by user", function () {
					var oButton1 = oEditor1View.byId("button1");
					var sTagButton1 = oController._getControlTag(oButton1);
					oController.selectNodeByTag(sTagButton1);
					return oController.initOutline("fold1/fold2/Doc1.view.xml", "Title", oEditor1View, window).then(function () {
						expect(getNodeForControl(oEditor1View, "button1").getExpanded()).to.be.true;
						expect(getNodeForAggregation("__vbox3", "items").getExpanded()).to.be.true;
						expect(getNodeForControl(oEditor1View, "__vbox3").getExpanded()).to.be.true;
						expect(getNodeForAggregation("__vbox2", "items").getExpanded()).to.be.true;
						expect(getNodeForControl(oEditor1View, "__vbox2").getExpanded()).to.be.true;
						// by default button 2 is not expanded
						expect(getNodeForControl(oEditor1View, "button2").getExpanded()).to.be.false;
						// after expanding it - isExpanded returns true
						getNodeForControl(oEditor1View, "button2").expand();
						return oController.initOutline("fold1/fold2/Doc1.view.xml", "Title", oEditor1View, window);
					}).then(function () {
						expect(getNodeForControl(oEditor1View, "button2").getExpanded()).to.be.true;
						// after document changed the state is back to false
						return oController.initOutline("fold1/fold2/Doc2.view.xml", "Title2", oEditor2View, window);
					}).then(function () {
						expect(getNodeForControl(oEditor2View, "button2").getExpanded()).to.be.false;
						expect(getNodeForControl(oEditor2View, "button1").getExpanded()).to.be.false;
						getNodeForControl(oEditor2View, "button1").expand();
						getNodeForControl(oEditor2View, "button1").collapse();
						return oController.initOutline("fold1/fold2/Doc2.view.xml", "Title", oEditor2View, window);
					}).then(function () {
						expect(getNodeForControl(oEditor2View, "button2").getExpanded()).to.be.false;
						// and back to the original document - original values remain
						return oController.initOutline("fold1/fold2/Doc1.view.xml", "Title", oEditor1View, window);
					}).then(function () {
						expect(getNodeForControl(oEditor1View, "button2").getExpanded()).to.be.true;
						expect(getNodeForControl(oEditor1View, "button1").getExpanded()).to.be.true;
					});
				});

			});
		});
	});
