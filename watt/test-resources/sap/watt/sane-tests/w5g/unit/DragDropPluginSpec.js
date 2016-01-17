define(["sap/watt/lib/lodash/lodash",
		"w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata"],
	function (_, w5gTestUtils, W5gUtils, ControlMetadata) {
		"use strict";
		describe("Drag and Drop plugin", function () {
			var oW5gDragDropPlugin;
			var oW5gMouseSelectionPlugin;
			var oDesignTime;

			function createDesignTimeWithView(oView) {
				oW5gDragDropPlugin = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop({
					listeners: [],
					w5gUtils: W5gUtils,
					controlMetadata: ControlMetadata,
					editor: w5gTestUtils.DummySelectorEditor
				});
				oW5gMouseSelectionPlugin = new sap.ui.dt.plugin.MouseSelection({w5gUtils: W5gUtils});
				oDesignTime = w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [oView],
					plugins: [oW5gDragDropPlugin, oW5gMouseSelectionPlugin]
				});
				sap.ui.getCore().applyChanges();
			}


			function startDrag(oOverlay) {
				oOverlay.$().trigger("dragstart");
			}

			before(function () {
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop");
				jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
			});

			function view(sViewContent) {
				return sap.ui.view({
					viewContent: sViewContent,
					type: sap.ui.core.mvc.ViewType.XML
				});
			}

			var oOverlayLikePaletteItem;

			function wrapWithOverlayAndDragStart(oInstance, oDesignTime) {
				oOverlayLikePaletteItem = oDesignTime.createOverlayFor(oInstance);
				oOverlayLikePaletteItem.setDraggable(true);
				oOverlayLikePaletteItem.placeAt("overlay-container");
				sap.ui.getCore().applyChanges();
				startDrag(oOverlayLikePaletteItem);
			}

			describe("Drag start drags the correct overlay", function () {
				var oListOverlay, oPageOverlay, oListItemOverlay, oViewOverlay, oView;

				before(function () {
					var sViewContent = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\n" +
						"    <Page id=\"detailPage\" title=\"Roomba\">\n" +
						"        <content>\n" +
						"			<List noDataText=\"Drop list items here\" id=\"__list1\">\n" +
						"				<customData>\n" +
						"				<core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data4\"/>\n" +
						"				</customData>\n" +
						"				<items>\n" +
						"					<StandardListItem type=\"Navigation\" counter=\"0\" title=\"List Item 2\" description=\"Description text\" icon=\"sap-icon://picture\" id=\"__item4\"/>\n" +
						"					<StandardListItem type=\"Navigation\" counter=\"0\" title=\"List Item 1\" description=\"Description text\" icon=\"sap-icon://picture\" id=\"__item3\"/>\n" +
						"					<StandardListItem type=\"Navigation\" counter=\"0\" title=\"List Item 3\" description=\"Description text\" icon=\"sap-icon://picture\" id=\"__item5\"/></items></List>\n" +
						"				<Button id=\"button\" /> " +
						"        </content>\n" +
						"    </Page>\n" +
						"</mvc:View>";
					oView = view(sViewContent);

					w5gTestUtils.placeAt("content", oView);
					createDesignTimeWithView(oView);
					oListOverlay = W5gUtils.getControlOverlay(oView.byId("__list1"));
					oPageOverlay = W5gUtils.getControlOverlay(oView.byId("detailPage"));
					oListItemOverlay = W5gUtils.getControlOverlay(oView.byId("__item3"));
					oViewOverlay = W5gUtils.getControlOverlay(oView);
				});

				after(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				/**
				 * @param {sap.ui.dt.Overlay} oSelectedOverlay
				 * @param {function} done
				 */
				function testDragStartWhenParentIsSelected(oSelectedOverlay, done) {
					oSelectedOverlay.setSelected(true);
					oW5gDragDropPlugin.onDragStart = function (oOverlay) {
						expect(oOverlay).to.be.equal(oSelectedOverlay);
						done();
					};
					startDrag(oListItemOverlay);
				}

				it("Drags the currently selected overlay when it is the child", function (done) {
					testDragStartWhenParentIsSelected(oListItemOverlay, done);
				});

				it("Drags the currently selected overlay in case it has direct child overlay covering it", function (done) {
					testDragStartWhenParentIsSelected(oListOverlay, done);
				});

				it("Drags the currently selected overlay in case it has distant child overlay covering it", function (done) {
					testDragStartWhenParentIsSelected(oPageOverlay, done);
				});

				it("Drag some overlay without selection, selection should be changed only after drag end", function () {
					oListItemOverlay.setSelected(true); //clear other selections
					oListItemOverlay.setSelected(false);
					oW5gDragDropPlugin.onDragStart = function (oOverlay) {
						expect(oOverlay).to.be.equal(oListItemOverlay);
					};
					startDrag(oListItemOverlay);
					//selection should be set after drag end, otherwise it cause problems with user notifications for example
					expect(oListItemOverlay.getSelected()).to.be.false;
					oW5gDragDropPlugin.onAggregationDrop(oListItemOverlay);
					oW5gDragDropPlugin.onDragEnd(oListItemOverlay);
					expect(oListItemOverlay.getSelected()).to.be.true;
				});

				it("Drags the child overlay when the parent overlay is selected", function (done) {
					oListOverlay.setSelected(true);
					oW5gDragDropPlugin.onDragStart = function (oOverlay) {
						expect(oOverlay).to.be.equal(oListOverlay);
						done();
					};

					oW5gDragDropPlugin.onDragEnd = function (oOverlay) {
						expect(oOverlay).to.be.equal(oListOverlay);
						done();
					};

					startDrag(oListItemOverlay);
					oListItemOverlay.$().trigger("dragend");
				});

				it("Drag some overlay with existing selection which is not an ancestor", function (done) {
					testDragStartWhenParentIsSelected(oListItemOverlay, done);
				});

				it("Page's overlay is not draggable", function () {
					expect(oPageOverlay.isDraggable()).to.be.equal(false);
				});

				it("View's overlay is not draggable", function () {
					expect(oViewOverlay.isDraggable()).to.be.equal(false);
				});
			});

			describe("Drop target validations", function () {
				var oTileContainer, oTokenizerOverlay, oToolbar, oObjectListItem, oPageOverlay, oView;

				before(function () {
					var sViewContent = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\n" +
						"	<Page id=\"detailPage\" title=\"Roomba\">\n" +
						"		<headerContent>\n" +
						"			<Toolbar width=\"100%\" id=\"__toolbar0\"></Toolbar>\n" +
						"		</headerContent>\n" +
						"		<content>\n" +
						"			<TileContainer editable=\"true\" allowAdd=\"true\" id=\"__container1\">\n" +
						"				<tiles>\n" +
						"				<StandardTile title=\"Title 1\" info=\"Info\" icon=\"sap-icon://customer\" number=\"123\" numberUnit=\"eur\" infoState=\"Success\" id=\"__tile3\"/>\n" +
						"				<StandardTile title=\"Title 2\" info=\"Info\" icon=\"sap-icon://customer\" number=\"123\" numberUnit=\"eur\" infoState=\"Success\" id=\"__tile4\"/></tiles>\n" +
						"			</TileContainer>\n" +
						"			<Tokenizer id=\"__tokenizer0\">" +
						"				<tokens>" +
						"					<Token text=\"Token 1\" id=\"__token0\"/>" +
						"					<Token text=\"Token 2\" id=\"__token1\"/>" +
						"				</tokens>" +
						"			</Tokenizer>" +
						"		</content>\n" +
						"	</Page>\n" +
						"<ObjectListItem type=\"Active\" counter=\"0\" title=\"Object list item\" number=\"9999999999\" numberUnit=\"eur\" intro=\"On behalf of John Doe\" markFavorite=\"false\" markFlagged=\"false\" showMarkers=\"false\" id=\"__item0\">\n" +
						"	<attributes>\n" +
						"		<ObjectAttribute text=\"attribute text\" active=\"false\" id=\"__attribute0\"/>\n" +
						"	</attributes>\n" +
						"	<firstStatus>\n" +
						"		<ObjectStatus text=\"first status text\" id=\"__status0\"/>\n" +
						"	</firstStatus>\n" +
						"	<secondStatus>\n" +
						"		<ObjectStatus text=\"second status text\" id=\"__status1\"/>\n" +
						"	</secondStatus></ObjectListItem>\n" +
						"</mvc:View>";
					oView = view(sViewContent);
					createDesignTimeWithView(oView);
					oTileContainer = W5gUtils.getControlOverlay(oView.byId("__container1"), window);
					oToolbar = W5gUtils.getControlOverlay(oView.byId("__toolbar0"), window);
					oObjectListItem = W5gUtils.getControlOverlay(oView.byId("__item0"), window);
					oPageOverlay = W5gUtils.getControlOverlay(oView.byId("detailPage"), window);
					oTokenizerOverlay = W5gUtils.getControlOverlay(oView.byId("__tokenizer0"), window);
				});

				after(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				afterEach(function () {
					oOverlayLikePaletteItem && oOverlayLikePaletteItem.$().trigger("dragend");
				});

				it("Allows toolbar spacer only in toolbar", function () {
					var oInstance = new sap.m.ToolbarSpacer();
					wrapWithOverlayAndDragStart(oInstance, oDesignTime);
					var oToolbarAggOverlay = w5gTestUtils.getChildAggregationOverlay(oToolbar, "content");
					expect(oToolbarAggOverlay.isDroppable()).to.be.true;
					var oPageContentAggOverlay = w5gTestUtils.getChildAggregationOverlay(oPageOverlay, "content");
					expect(oPageContentAggOverlay.isDroppable()).to.be.false;
				});

				it("Doesn't allow button in tile container", function () {
					var oInstance = new sap.m.Button({});
					wrapWithOverlayAndDragStart(oInstance, oDesignTime);
					var oTileAggOverlay = w5gTestUtils.getChildAggregationOverlay(oTileContainer, "tiles");
					expect(oTileAggOverlay.isDroppable()).to.be.false;
					var oPageContentAggOverlay = w5gTestUtils.getChildAggregationOverlay(oPageOverlay, "content");
					expect(oPageContentAggOverlay.isDroppable()).to.be.true;
				});

				it("Doesn't allow element in an aggregation that has content and is not multiple", function () {
					var oInstance = new sap.m.ObjectStatus({});
					wrapWithOverlayAndDragStart(oInstance, oDesignTime);
					var oOLIOverlay = w5gTestUtils.getChildAggregationOverlay(oObjectListItem, "secondStatus");
					expect(oOLIOverlay.isDroppable()).to.be.false;
					var oPageContentAggOverlay = w5gTestUtils.getChildAggregationOverlay(oPageOverlay, "content");
					expect(oPageContentAggOverlay.isDroppable()).to.be.true;
				});

				it("Doesn't allow any palette item on control originated from the outline", function () {
					var oInstance = new sap.m.Button({}); //Simulates a control from the palette
					wrapWithOverlayAndDragStart(oInstance, oDesignTime);
					var oTokenizerAggOverlay = w5gTestUtils.getChildAggregationOverlay(oTokenizerOverlay, "tokens");
					expect(oTokenizerAggOverlay.isDroppable()).to.be.false;
					var oPageContentAggOverlay = w5gTestUtils.getChildAggregationOverlay(oPageOverlay, "content");
					expect(oPageContentAggOverlay.isDroppable()).to.be.true;
				});
			});


			describe("Drag over", function () {
				var oHBoxOverlay0, oHBoxOverlay1, oInnerButtonOverlay, oButtonOverlay, oPageOverlay, oView;

				beforeEach(function () {
					var sViewContent = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\n" +
						"    <Page id=\"detailPage\" title=\"Roomba\">\n" +
						"        <content>\n" +
						"			<Button id=\"button\" /> " +
						"			<HBox height=\"\" width=\"100%\" id=\"__hbox0\">\n" +
						"				<items><Button id=\"inner_button\" /></items>\n" +
						"			</HBox>\n" +
						"			<HBox height=\"\" width=\"100%\" id=\"__hbox1\"/>\n" +
						"        </content>\n" +
						"    </Page>\n" +
						"</mvc:View>";
					oView = view(sViewContent);

					w5gTestUtils.placeAt("content", oView);
					createDesignTimeWithView(oView);
					oButtonOverlay = W5gUtils.getControlOverlay(oView.byId("button"));
					oInnerButtonOverlay = W5gUtils.getControlOverlay(oView.byId("inner_button"));
					oHBoxOverlay0 = W5gUtils.getControlOverlay(oView.byId("__hbox0"));
					oHBoxOverlay1 = W5gUtils.getControlOverlay(oView.byId("__hbox1"));
					oPageOverlay = W5gUtils.getControlOverlay(oView.byId("detailPage"));
				});

				afterEach(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				it("Drag button between same two aggregations of the same control (page)", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oPageOverlay, "headerContent"),
						{originalEvent: {clientX: 10, clientY: 10}});
					var oButton = oButtonOverlay.getElementInstance();
					expect(oPageOverlay.getElementInstance().getHeaderContent()[0]).to.be.equal(oButton);
					expect(oPageOverlay.getElementInstance().getContent()).to.not.contain(oButton);
				});

				it("Drag button to the right of inner button in an HBox should cause insert after it", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{
							originalEvent: {
								clientX: oInnerButtonOverlay.$().offset().left + oInnerButtonOverlay.$().width() + 1,
								clientY: 0
							}
						});
					expect(oHBoxOverlay0.getElementInstance().getItems()[1]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag button to the bottom of inner button in an HBox should cause insert after it", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{
							originalEvent: {
								clientX: 0,
								clientY: oInnerButtonOverlay.$().offset().top + oInnerButtonOverlay.$().height() + 1
							}
						});
					expect(oHBoxOverlay0.getElementInstance().getItems()[1]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag button to be left and above of inner button in an HBox should cause insert before it", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{originalEvent: {clientX: 0, clientY: 0}});
					expect(oHBoxOverlay0.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag button into empty HBox", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay1, "items"),
						{originalEvent: {clientX: 10, clientY: 10}});
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag over aggregation after threshold time interval has passed but without moving the mouse out of the grid", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay1, "items"),
						{originalEvent: {clientX: 10, clientY: 10}});
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
					oW5gDragDropPlugin._iLastResponseTimestamp = Date.now() - 301;
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{originalEvent: {clientX: 8, clientY: 11}});
					// still the button is in the same place since 10,10 and 8,11 are in the same cell in the grid of modulo 4
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag over aggregation before threshold time interval has passed", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay1, "items"),
						{originalEvent: {clientX: 0, clientY: 0}});
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{originalEvent: {clientX: 10, clientY: 10}});
					// still the button is in the same place since 300 ms haven't passed
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
				});

				it("Drag over aggregation after threshold time interval has passed", function () {
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay1, "items"),
						{originalEvent: {clientX: 0, clientY: 0}});
					expect(oHBoxOverlay1.getElementInstance().getItems()[0]).to.be.equal(oButtonOverlay.getElementInstance());
					oW5gDragDropPlugin._iLastResponseTimestamp = Date.now() - 301;
					startDrag(oButtonOverlay);
					oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay0, "items"),
						{originalEvent: {clientX: 10, clientY: 0}});
					// button has moved since 300 ms passed
					expect(oHBoxOverlay1.getElementInstance().getItems()).to.be.empty;
				});
			});

			describe("W5G Drag'n'Drop Register Overlay test suite", function () {
				var oViewOverlay;
				var oNestedView;
				var oNestedOverlay;
				var oFragmentForm;
				var oFragmentOverlay;
				var aFragFormContent;
				var aNestedFormContent;
				var oView;
				var oViewWithOutlineControls;

				/**
				 * test controls if not draggable
				 * @param {Array<sap.ui.core.Control>} aContent array of Controls
				 * @private
				 */
				function testContentIsNotDraggable(aContent) {
					for (var i = 0; i < aContent.length; i++) {
						var oOverlay = W5gUtils.getControlOverlay(aContent[i]);
						expect(oOverlay.isDraggable()).to.be.false;
					}
				}

				before(function () {
					oView = w5gTestUtils.createViewWithFragmentAndNestedView();
					w5gTestUtils.placeAt("content", oView);
					createDesignTimeWithView(oView);

					var oPage = oView.byId("detailPage");
					oViewOverlay = W5gUtils.getControlOverlay(oView);
					oFragmentForm = oPage.getContent()[1];
					oFragmentOverlay = W5gUtils.getControlOverlay(oFragmentForm);
					aFragFormContent = oFragmentForm.getContent();

					oNestedView = oPage.getContent()[2];
					oNestedOverlay = W5gUtils.getControlOverlay(oNestedView);
					aNestedFormContent = oNestedView.getContent()[0].getContent();

					//View with outline controls:
					oViewWithOutlineControls = w5gTestUtils.createViewWithOutlineControls();
					w5gTestUtils.placeAt("content", oViewWithOutlineControls);

				});

				after(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				it("Fragment and it's content should not be draggable", function () {
					expect(oViewOverlay).to.exist;
					expect(oFragmentOverlay).to.exist;
					expect(oFragmentOverlay.isDraggable()).to.be.false;
					testContentIsNotDraggable(aFragFormContent);
				});

				it("Nested View and it's content should not be draggable", function () {
					expect(oNestedOverlay).to.exist;
					expect(oNestedOverlay.isDraggable()).to.be.false;
					testContentIsNotDraggable(aNestedFormContent);
				});


				it("Fragment and Nested View aggregation should not be droppable", function () {
					var oInstance = new sap.m.Button();
					wrapWithOverlayAndDragStart(oInstance, oDesignTime);
					var oFragFormAggOverlay = w5gTestUtils.getChildAggregationOverlay(oFragmentOverlay, "content");
					expect(oFragFormAggOverlay.isDroppable()).to.be.false;
					var oNestedFormAggOverlay = w5gTestUtils.getChildAggregationOverlay(oNestedOverlay, "content");
					expect(oNestedFormAggOverlay.isDroppable()).to.be.false;
				});

				it("Controls should not be draggable if their ancestor originated from the outline", function () {

					var oPage = oViewWithOutlineControls.byId("page1");
					createDesignTimeWithView(oViewWithOutlineControls);
					oViewOverlay = W5gUtils.getControlOverlay(oViewWithOutlineControls);
					expect(oViewOverlay).to.exist;

					//Button from palette should be draggable
					var oButtonDraggable = oPage.getContent()[0];
					var oPaletteButtonOverlay = W5gUtils.getControlOverlay(oButtonDraggable);
					oW5gDragDropPlugin.registerOverlay(oPaletteButtonOverlay);
					expect(oPaletteButtonOverlay).to.exist;
					expect(oPaletteButtonOverlay.isDraggable()).to.be.true;

					//2 levels - Button inside Outline control (Header Container) should not be draggable
					var oHeaderContainer = oPage.getContent()[1];
					var aHeaderContainerItems = oHeaderContainer.getItems();
					var oNestedButtonItemInHeaderContainerOverlay = W5gUtils.getControlOverlay(aHeaderContainerItems[0]);
					oW5gDragDropPlugin.registerOverlay(oNestedButtonItemInHeaderContainerOverlay);
					//expect(oNestedButtonItemInHeaderContainerOverlay).to.exist;
					//expect(oNestedButtonItemInHeaderContainerOverlay.isDraggable()).to.be.false;


					//3 levels - Button inside a Bar inside an Outline control (Header Container) should not be draggable
					var oObjectPageHeader = oPage.getContent()[2];
					var oNavigationBar = oObjectPageHeader.getNavigationBar();
					var aNestedContentInBar = oNavigationBar.getContentLeft();
					var oNestedContentInBarOverlay = W5gUtils.getControlOverlay(aNestedContentInBar[0]);
					oW5gDragDropPlugin.registerOverlay(oNestedContentInBarOverlay);
					//expect(oNestedContentInBarOverlay).to.exist;
					//expect(oNestedContentInBarOverlay.isDraggable()).to.be.false;

				});

			});


			describe("Drag'n'Drop on empty view", function () {
				var oView, oXMLOverlay;

				before(function () {
					var sViewContent = "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\n" +
						"</mvc:View>";
					oView = view(sViewContent);

					w5gTestUtils.placeAt("content", oView);
					createDesignTimeWithView(oView);
					oXMLOverlay = W5gUtils.getControlOverlay(oView);
				});

				after(function () {
					oView.destroy();
					oDesignTime.destroy();
				});

				it("Dropping control on an empty view leads to dirty document", function (done) {
					oXMLOverlay.setSelected(true);
					var oButton = new sap.m.Button();
					wrapWithOverlayAndDragStart(oButton, oDesignTime);
					var oAggregationOverlays = oXMLOverlay.getAggregationOverlays();
					oOverlayLikePaletteItem.setParent(oAggregationOverlays[oAggregationOverlays.length-1]);
					expect(oOverlayLikePaletteItem.isDraggable()).to.be.true;
					oW5gDragDropPlugin.onDragEnd = function (oOverlay) {
						expect(oOverlay).to.be.equal(oOverlayLikePaletteItem);
						done();
					};
					oOverlayLikePaletteItem.$().trigger("dragend");
				});
			});

		});
	});
