define(["w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils"],
	function (w5gTestUtils, W5gUtils) {
		"use strict";
		describe("Select descendant", function () {
			var oView, oDesignTime, oButton2Overlay, oButton3Overlay, oVBox3Overlay, oPageOverlay, /** Array*/ oShowedItems;

			before(function () {
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions");
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection");
				oView = sap.ui.view({
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
					"			<HBox id=\"_hbox1\"><items>" +
					"				<Button id=\"button3\" text=\"Button\" width=\"310px\"/>\r\n" +
					"			</items><HBox>" +
					"			<VBox id=\"_vbox4\"><items>" +
					"			</items><VBox>" +
					"        </content>\r\n" +
					"    </Page>\r\n" +
					"</mvc:View>",
					type: sap.ui.core.mvc.ViewType.XML
				});
			});

			after(function () {
				oView.destroy();
			});

			function removeViewPrefix(sId) {
				return sId.split("--")[1];
			}

			beforeEach(function () {
				oShowedItems = [];
				w5gTestUtils.placeAt("content", oView);
				oDesignTime = w5gTestUtils.createDesignTime({
					designTimeMetadata: {
						"sap.m.VBox": {
							aggregations: {
								items: {
									show: function (oItem) {
										oShowedItems.push([removeViewPrefix(this.sId), removeViewPrefix(oItem.sId)]);
									}
								}
							}
						}
					},
					rootElements: [oView],
					plugins: [new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.Actions({}),
						new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gMouseSelection({w5gUtils:W5gUtils})]
				});
				sap.ui.getCore().applyChanges();
				oButton2Overlay = W5gUtils.getControlOverlay(oView.byId("button2"));
				oButton3Overlay = W5gUtils.getControlOverlay(oView.byId("button3"));
				oVBox3Overlay = W5gUtils.getControlOverlay(oView.byId("__vbox3"));
				oPageOverlay = W5gUtils.getControlOverlay(oView.byId("detailPage"));
			});

			afterEach(function () {
				oDesignTime.destroy();
			});

			it("Select Page and nothing happens", function () {
				oPageOverlay.setSelected(true);
				expect(oShowedItems).to.be.empty;
			});

			it("Select inner VBox and its parent VBox show function is called", function () {
				oVBox3Overlay.setSelected(true);
				expect(oShowedItems).to.deep.equal([["__vbox2", "__vbox3"]]);
			});

			it("Select button under HBox and the HBox show function is called", function () {
				oButton3Overlay.setSelected(true);
				expect(oShowedItems).to.be.empty;
			});

			it("Select button inside inner VBox cause two show functions to be called", function () {
				oButton2Overlay.setSelected(true);
				expect(oShowedItems).to.deep.equal([["__vbox3", "button2"], ["__vbox2", "__vbox3"]]);
			});


		});
	});
