define(["w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata"],
	function (w5gTestUtils, W5gUtils, ControlMetadata) {
		"use strict";
		describe("W5G Utils", function () {

			var oI18n = w5gTestUtils.getI18n();
			sap.ui.getCore().loadLibrary("sap.m");
			jQuery.sap.require('sap.m.StandardListItem');
			jQuery.sap.require('sap.m.List');
			jQuery.sap.require('sap.m.IconTabBar');
			jQuery.sap.require('sap.m.IconTabFilter');
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg");
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter");
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-widget");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-mouse");
			jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-resizable");

			before(function () {
				jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
			});

			it("get text from i18n", function () {
				W5gUtils.init({
					i18n: oI18n
				});
				var oToolbar = new sap.ui.commons.Toolbar();
				oI18n.applyTo(oToolbar);
				// triggers i18n to load the bundles
				oI18n.getText("i18n", "");
				var aArgs = ["DUMMY TEST1", "DUMMY TEST2", "DUMMY TEST3"];
				var aKeys = oI18n._aResourceBundles.i18n.aPropertyFiles[1].aKeys.concat(["DUMMY_KEY"]);
				aKeys.forEach(function (sKey) {
					assert.ok(W5gUtils.getText(sKey, aArgs) === oI18n.getText("i18n", sKey, aArgs), "string should match (" + sKey + ")");
				});
			});

			it("check supported controls", function () {
				var oButton = new sap.m.Button();
				var oMessagePage = new sap.m.MessagePage();
				w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [oButton, oMessagePage]
				});
				expect(ControlMetadata.isControlUnsupported(oButton)).to.be.false;
				expect(ControlMetadata.isControlUnsupported(oMessagePage)).to.be.true;
			});

			it("check badges", function () {
				var oMessagePage = new sap.m.MessagePage();
				w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [oMessagePage]
				});
				var oInfo = W5gUtils.getBadgeInfo(oMessagePage, window);
				assert.equal(oInfo.unsupported, ControlMetadata.isControlUnsupported(oMessagePage));
				assert.equal(oInfo.toBeSupported, ControlMetadata.isControlToBeSupported(oMessagePage));
				assert.equal(oInfo.text, W5gUtils.getText("w5g_badge_unsupported"));
			});

			it("XML document to start/end row/column with various examples", function () {
				/**
				 * @return {{start: {row: number, column: number}, end: {row: number, column: number}}}
				 */
				var xmlString =
					"<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\" controllerName=\"SalesOrder.view.Detail\">\r\n" +
					"    <Page id=\"detailPage\" navButtonPress=\"onNavBack\" showNavButton=\"{device&gt;/isPhone}\" headerContent=\"{test&gt;/SalesOrders2}\" title=\"{i18n&gt;detailTitle}\">\r\n" +
					"        <customData>\r\n" +
					"                                        <core:CustomData key=\"DIMA\" value=\"true\" writeToDom=\"true\" id=\"__data_3\"/>\r\n" +
					"                                    </customData>\r\n" +
					"        <content>\r\n" +
					"        \r\n" +
					"        \r\n" +
					"        <f:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"__form1\">\r\n" +
					"            <f:content>\r\n" +
					"                <core:Title text=\"Title\" id=\"__title1\"/>\r\n" +
					"                <Label text=\"Label 1\" id=\"__label2\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input4\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input5\"/>\r\n" +
					"                <Label text=\"Label 2\" id=\"__label3\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input6\"/></f:content>\r\n" +
					"        </f:SimpleForm>\r\n" +
					"        <f:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"__form0\">\r\n" +
					"            <f:content>\r\n" +
					"                <f:SimpleForm editable=\"false\" layout=\"ResponsiveGridLayout\" id=\"__form2\">\r\n" +
					"                    <f:content>\r\n" +
					"                        <core:Title text=\"Title\" id=\"__title2\"/>\r\n" +
					"                        <Label text=\"Label 1\" id=\"__label4\"/>\r\n" +
					"                        <Input width=\"100%\" id=\"__input7\"/>\r\n" +
					"                        <Input width=\"100%\" id=\"__input8\"/>\r\n" +
					"                        <Label text=\"Label 2\" id=\"__label5\"/>\r\n" +
					"                        <Input width=\"100%\" id=\"__input9\"/></f:content>\r\n" +
					"                </f:SimpleForm>\r\n" +
					"                <core:Title text=\"Title\" id=\"__title0\"/>\r\n" +
					"                <Label text=\"Label 1\" id=\"__label0\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input1\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input2\"/>\r\n" +
					"                <Label text=\"Label 2\" id=\"__label1\"/>\r\n" +
					"                <Input width=\"100%\" id=\"__input3\"/></f:content>\r\n" +
					"        </f:SimpleForm>\r\n" +
					"                                <List noDataText=\"Drop list items here\" id=\"__list0\">\r\n" +
					"                                    <customData>\r\n" +
					"                                        <core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data3\"/>\r\n" +
					"                                    </customData>\r\n" +
					"                                    <items>\r\n" +
					"                                        <InputListItem type=\"Navigation\" counter=\"0\" label=\"Input List Item\" id=\"__item3\">\r\n" +
					"                                            <content>\r\n" +
					"                                                <Input value=\"input\" width=\"100%\" id=\"__input0\"/>\r\n" +
					"                                            </content>\r\n" +
					"                                        </InputListItem>\r\n" +
					"                                    </items></List>\r\n" +
					"                                <core:ExtensionPoint name=\"extDetail\"/>\r\n" +
					"	<Table class=\"nwEpmRefappsShopControlLayout\" delete=\"onDeletePressed\" growing=\"true\" growingScrollToLoad=\"true\" id=\"shoppingCartTable\" items=\"{path: '/ShoppingCarts(-1)/ShoppingCartItems', sorter: { path: 'Id', descending: false}, parameters: {expand: 'Product', select: 'Quantity,SubTotal,CurrencyCode,ProductId,Product/IsFavoriteOfCurrentUser,Product/ImageUrl,Product/Name,Product/StockQuantity,Product/Price,Product/CurrencyCode'}}\"	mode=\"Delete\" noDataText=\"{i18n>xfld.noDataShoppingCart}\" updateFinished=\"onUpdateFinished\">\r\n" +
					"		<columns>\r\n" +
					"			<!-- Favorite -->\r\n" +
					"			<Column hAlign=\"Left\" minScreenWidth=\"Tablet\" width=\"7%\">\r\n" +
					"				<header></header>\r\n" +
					"			</Column>\r\n" +
					"			<!-- Picture -->\r\n" +
					"			<Column hAlign=\"Left\" minScreenWidth=\"Tablet\" width=\"13%\">\r\n" +
					"				<header><Label text=\"{i18n>xfld.items}\"/></header>\r\n" +
					"			</Column>\r\n" +
					"			<!-- Subtotal & Total footer-->\r\n" +
					"			<Column hAlign=\"Right\" width=\"{viewProperties>/subtotalFieldWidth}\">\r\n" +
					"				<header><Label text=\"{/#ShoppingCartItem/SubTotal/@sap:label}\"/></header>\r\n" +
					"				<footer>\r\n" +
					"                   <ObjectNumber id=\"totalFooter\" number=\"{parts: [{path: '/ShoppingCarts(-1)/Total'},{path: '/ShoppingCarts(-1)/CurrencyCode'}], formatter:'sap.ca.ui.model.format.AmountFormat.FormatAmountStandard'}\" unit=\"{/ShoppingCarts(-1)/CurrencyCode}\"/>\r\n" +
					"				</footer>\r\n" +
					"			</Column>\r\n" +
					"		</columns>\r\n" +
					"		<ColumnListItem press=\"onLineItemPressed\" type=\"Navigation\" vAlign=\"Middle\">\r\n" +
					"			<cells>\r\n" +
					"				<!-- Favorite -->\r\n" +
					"				<core:Icon class=\"sapThemeHighlight-asColor\" src=\"sap-icon://favorite\" visible=\"{Product/IsFavoriteOfCurrentUser}\"/>\r\n" +
					"				<!-- Picture -->\r\n" +
					"				<ObjectNumber number=\"{parts: [{path: 'SubTotal'},{path: 'CurrencyCode'}], formatter: 'sap.ca.ui.model.format.AmountFormat.FormatAmountStandard'}\" unit=\"{CurrencyCode}\"/>\r\n" +
					"			</cells>\r\n" +
					"		</ColumnListItem>\r\n" +
					"	</Table>\r\n" +
					"        </content>\r\n" +
					"        <headerContent>\r\n" +
					"              <Button text=\"{text}\" width=\"110px\" type=\"Default\"/>\r\n" +
					"        </headerContent>\r\n" +
					"    </Page>\r\n" +
					"</mvc:View>";

				function loc(/** number */a, /** number */b, /** number */c, /** number */d) {
					return {start: {row: a, column: b}, end: {row: c, column: d}};
				}
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
				var fnNodeToSourceRange = _.partialRight(W5gUtils.xmlNodeToSourceRange, xmlDoc, xmlString);
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("View")[0]), loc(0, 0, 79, 11));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Page")[0]), loc(1, 4, 78, 11));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("SimpleForm")[0]), loc(8, 8, 16, 23));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("SimpleForm")[1]), loc(17, 8, 34, 23));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("SimpleForm")[2]), loc(19, 16, 27, 31));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Title")[0]), loc(10, 16, 10, 56));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Title")[1]), loc(21, 24, 21, 64));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Title")[2]), loc(28, 16, 28, 56));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[0]), loc(11, 16, 11, 53));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[1]), loc(14, 16, 14, 53));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[2]), loc(22, 24, 22, 61));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[3]), loc(25, 24, 25, 61));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[4]), loc(29, 16, 29, 53));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Label")[5]), loc(32, 16, 32, 53));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[0]), loc(12, 16, 12, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[1]), loc(13, 16, 13, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[2]), loc(15, 16, 15, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[3]), loc(23, 24, 23, 59));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[4]), loc(24, 24, 24, 59));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[5]), loc(26, 24, 26, 59));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[6]), loc(30, 16, 30, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[7]), loc(31, 16, 31, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[8]), loc(33, 16, 33, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[9]), loc(42, 48, 42, 97));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("List")[0]), loc(35, 32, 45, 51));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("InputListItem")[0]), loc(40, 40, 44, 56));
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("ObjectNumber")[0]), loc(61, 19, 61, 259));
				var sMissingParamMessage = "when one of the docs is missing, return default";
				var oDefaultResult = loc(0, 0, 0, 0);
				assert.deepEqual(fnNodeToSourceRange(null), oDefaultResult, sMissingParamMessage);
				assert.deepEqual(fnNodeToSourceRange(xmlDoc.getElementsByTagName("Input")[2], null), oDefaultResult, sMissingParamMessage);
			});

			it("Check if the control or its parent was selected", function () {

				var oSelectedControl, oControl, oDesignTime;

				//oControl and oSelectedControl are null
				assert.equal(W5gUtils.isControlOrParentSelected(null, null), false);

				//oControl is null and oSelectedControl is a Button
				oSelectedControl = new sap.ui.commons.Button({text: "Button1", id: "button1"});
				assert.equal(W5gUtils.isControlOrParentSelected(null, oSelectedControl), false);

				//oControl is Button but nothing was selected (oSelectedControl is undefined)
				oControl = new sap.ui.commons.Button({text: "Button2", id: "button2"});
				assert.equal(W5gUtils.isControlOrParentSelected(oControl, null), false);

				//oControl is a button that equals selected control button
				oSelectedControl = oControl;
				assert.equal(W5gUtils.isControlOrParentSelected(oControl, oSelectedControl), true);

				//oControl is ListItem inside a List control that is selected
				oControl = new sap.m.StandardListItem({test: "Button3", id: "button3"});
				oSelectedControl = new sap.m.List({
					items: [oControl]
				});
				w5gTestUtils.placeAt("placeToRender", oSelectedControl);

				//Wrap UI5 control with overlays
				oDesignTime = w5gTestUtils.getCurrentWindowPatchedDesignTime();
				oDesignTime.createOverlayFor(oSelectedControl).placeAt("overlay-container");
				sap.ui.getCore().applyChanges();

				assert.equal(W5gUtils.isControlOrParentSelected(oControl, oSelectedControl), true);
			});

			it("Check retrieving full file path of a control that is a fragment or subview", function () {
				var sUrl = "/watt/proxy/http/localhost:9080/file/myusername-OrionContent/nw.epm.refapps.ext.prod.manage/./view/fragment/ProductImage.fragment.xml";
				assert.equal(W5gUtils.getFileFullPathFromModulePath(sUrl), "/nw.epm.refapps.ext.prod.manage/view/fragment/ProductImage.fragment.xml");
				sUrl = "/watt/proxy/http/localhost:9080/file/myusername-OrionContent/nw.epm.refapps.ext.prod.manage/./view/subview/ProductDisplay.view.xml";
				assert.equal(W5gUtils.getFileFullPathFromModulePath(sUrl), "/nw.epm.refapps.ext.prod.manage/view/subview/ProductDisplay.view.xml");
			});

			describe("Utils from W5G project", function () {
				var oControls, oActualAggregations, oActualAggregationsAndControlsInThem,
					oExpectedAggregations, oExpectedAggregationsAndControlsInThem,
					Utils = sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils;

				beforeEach(function () {
					oControls = {};
					oControls.oPage = new sap.m.Page();
					oControls.oButtonOne = new sap.m.Button();
					oControls.oButtonTwo = new sap.m.Button();
					oControls.oPage.addHeaderContent(oControls.oButtonOne);
					oControls.oPage.addContent(oControls.oButtonTwo);

					oExpectedAggregations = jQuery().extend({}, oControls.oPage.getMetadata().getAllAggregations());
					oActualAggregations = {};

					oExpectedAggregationsAndControlsInThem = {
						customData: [],
						customHeader: [],
						content: [oControls.oButtonTwo],
						footer: [],
						headerContent: [oControls.oButtonOne],
						layoutData: [],
						dependents: [],
						subHeader: [],
						tooltip: []
					};
					oActualAggregationsAndControlsInThem = {};

					this.fnCallback = function (oAggregation, aAllControls) {
						oActualAggregations[oAggregation.name] = oAggregation;
						oActualAggregationsAndControlsInThem[oAggregation.name] = aAllControls;
					};
				});

				afterEach(function () {
					for (var key in oControls) {
						oControls[key].destroy();
					}
					oControls = null;
				});
				it("basic iterate test", function () {

					Utils.iterateOverAllPublicAggregations(oControls.oPage, this.fnCallback);

					assert.deepEqual(oActualAggregations, oExpectedAggregations, " all public aggregations should be iterated over");
					assert.deepEqual(oActualAggregationsAndControlsInThem, oExpectedAggregationsAndControlsInThem, " the right controls should be returned as list in the aggregations");
				});

				it("iterateOverAllPublicAggregations returns test", function () {
					var oRes = Utils.iterateOverAllPublicAggregations(oControls.oPage, this.fnCallback);
					assert.ok(!Q.isPromise(oRes), "If callback is synchron, returns not a promise");

					oRes = Utils.iterateOverAllPublicAggregations(oControls.oPage,
						function () {
							return Q();
						}
					);
					assert.ok(Q.isPromise(oRes), "if callback is asynchron, returns a promise");
				});

				it("iterate test with filter", function () {

					delete oExpectedAggregations.tooltip;
					delete oExpectedAggregations.customData;
					delete oExpectedAggregations.layoutData;

					delete oExpectedAggregationsAndControlsInThem.tooltip;
					delete oExpectedAggregationsAndControlsInThem.customData;
					delete oExpectedAggregationsAndControlsInThem.layoutData;


					Utils.iterateOverAllPublicAggregations(oControls.oPage, this.fnCallback, null, ["tooltip", "customData", "layoutData"]);

					assert.deepEqual(oActualAggregations, oExpectedAggregations, "only filtered aggregations should be iterated over");
					assert.deepEqual(oActualAggregationsAndControlsInThem, oExpectedAggregationsAndControlsInThem, " the right controls should be returned as list in the aggregations");
				});

				it("iterate test with break", function () {

					var fnBreakOnFirst = function (oAggregation, aAllControls) {
						return true;
					};

					Utils.iterateOverAllPublicAggregations(oControls.oPage, this.fnCallback, fnBreakOnFirst, ["tooltip", "customData", "layoutData"]);

					assert.ok(oActualAggregations.dependents !== undefined, "only content aggregation should exist");
				});

				it("findPublicControls", function () {
					var aExpectedResult = [oControls.oPage, oControls.oButtonTwo, oControls.oButtonOne];
					var aActualResult = Utils.findAllPublicControls(oControls.oPage, sap.ui.core);

					assert.deepEqual(aActualResult, aExpectedResult, "only public controls are returned");
				});

				it("isControlPublicTest", function () {
					// Mark the page as public control
					Utils.findAllPublicControls(oControls.oPage, sap.ui.core);

					var oButtonThree = new sap.m.Button();
					oControls.oPage.addContent(oButtonThree);

					var oInternalHeader = oControls.oPage.getAggregation("_internalHeader");

					assert.ok(Utils.isControlPublic(oButtonThree, sap.ui.core), "button three should be a public control");
					assert.ok(!Utils.isControlPublic(oInternalHeader, sap.ui.core), "the internal header should not be a public control");
				});

				it("WYSIWYG parent aggregation info", function () {
					var aControls = [oControls.oPage, oControls.oButtonTwo, oControls.oButtonOne];
					var oDesignTime = w5gTestUtils.getCurrentWindowPatchedDesignTime();

					oDesignTime.createOverlayFor(oControls.oPage);

					var aAggregations = Utils.getAggregationByName(oControls.oPage, "content");
					assert.ok(aAggregations.length === 1, "'content' aggregation length is ok");
					assert.ok(aAggregations.indexOf(oControls.oButtonTwo) !== -1, "'content' aggregation content is ok");

					aAggregations = Utils.getAggregationByName(oControls.oPage, "headerContent");
					assert.ok(aAggregations.length === 1, "'headerContent' aggregation length is ok");
					assert.ok(aAggregations.indexOf(oControls.oButtonOne) !== -1, "'headerContent' aggregation content is ok");

					aAggregations = Utils.getAggregationByName(oControls.oPage, "footer");
					assert.ok(aAggregations.length === 0, "'footer' aggregation length is ok");

					for (var i = 0, iLen = aControls.length; i < iLen; i++) {
						var oControl = aControls[i];
						var oParent = oControl.getParent();
						var oWYSIWYGParent = W5gUtils.getWYSIWYGParent(oControl, window);
						var sWYSIWYGParentAggregationName = Utils.getWYSIWYGParentAggregationName(oControl, oWYSIWYGParent);
						var oWYSIWYGParentAggregationInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl, window);

						if (oParent === null) {
							assert.ok(oWYSIWYGParent === null, "WYSIWYGParent is null");
							assert.ok(sWYSIWYGParentAggregationName === null, "WYSIWYGParentAggregationName is null");
							assert.ok(oWYSIWYGParentAggregationInfo.parent === null, "oWYSIWYGParentAggregationInfo.parent is null");
							assert.ok(oWYSIWYGParentAggregationInfo.aggregationName === null, "oWYSIWYGParentAggregationInfo.aggregationName is null");
						} else {
							assert.ok(oWYSIWYGParent === oWYSIWYGParentAggregationInfo.parent, "WYSIWYGParent is ok");
							assert.ok(sWYSIWYGParentAggregationName === oWYSIWYGParentAggregationInfo.aggregationName, "WYSIWYGParentAggregationName is ok");
							if (oParent === oWYSIWYGParent) {
								assert.ok(sWYSIWYGParentAggregationName === oControl.sParentAggregationName, "WYSIWYGParentAggregationName is ok");
							} else {
								aAggregations = Utils.getAggregationByName(oWYSIWYGParent, sWYSIWYGParentAggregationName);
								assert.ok(aAggregations.indexOf(oControl) !== -1, "oWYSIWYGParentAggregationInfo is ok");
							}
						}
					}
				});
			});

			describe("Navigation on canvas from keyboard", function(){
				var oDesignTime;
				var oView;
				var oControlSelected;

				beforeEach(function(){
					oView = sap.ui.view({
						viewContent: "<mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\r\n" +
						"<Page id=\"detailPage\" title=\"Roomba\">\r\n" +
						"	<content>\r\n" +
						"		<Button text=\"Button\" width=\"100px\" id=\"__button0\"/>" +
						"		<Button text=\"Button\" width=\"100px\" id=\"__button1\"/>" +
						"		<Button text=\"Button\" width=\"100px\" id=\"__button2\"/>" +
						"		<Button text=\"Button\" width=\"100px\" id=\"__button3\"/>" +
						"	</content>\r\n" +
						"</Page>\r\n" +
						"</mvc:View>",
						type: sap.ui.core.mvc.ViewType.XML
					});

					w5gTestUtils.placeAt("content", oView);
					oDesignTime = w5gTestUtils.createDesignTime({
						designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
						rootElements: [oView],
						plugins: [new sap.ui.dt.plugin.MouseSelection()]
					});
					sap.ui.getCore().applyChanges();

					var oButton = oView.byId("__button0");
					var oSelectedOverlay = W5gUtils.getControlOverlay(oButton, window);
					oSelectedOverlay.setSelected(true);
				});

				it("Function should return selected control", function(){
					var oControl = W5gUtils.getSelectedControl(oDesignTime);
					expect(oControl).to.exist;
					expect(_cleanIdPrefix(oControl.sId)).to.equal("__button0");
				});

				it("Selected control should be changed to sibling on push arrow right or left", function(){
					expect(_cleanIdPrefix(W5gUtils.navigateUI5Control("next", oDesignTime).sId)).to.equal("__button1");
				});

				it("When last sibling is selected and user press 'Next' - First control in aggregation should be selected",function(){
					W5gUtils.getControlOverlay(oView.byId("__button3"), window).setSelected(true);
					oControlSelected = W5gUtils.getSelectedControl(oDesignTime);
					expect(_cleanIdPrefix(W5gUtils.navigateUI5Control("next", oDesignTime).sId)).to.equal("__button0");
				});

				it("If root is selected and user press 'Up' nothing should happen", function(){
					expect(_cleanIdPrefix(W5gUtils.navigateUI5Control("up", oDesignTime).sId)).to.equal("detailPage");
				});

				it("If without aggregation is selected and user press 'Down' nothing should happen", function(){
					expect(W5gUtils.navigateUI5Control("down", oDesignTime)).to.be.null;
				});
			});

			describe("Navigation on canvas - List inside Icon Tab Filter", function() {
				var oDesignTime;
				var oView;
				var oControlSelected;

				beforeEach(function () {
					oView = sap.ui.view({
						viewContent:
						" <mvc:View xmlns=\"sap.m\" xmlns:core=\"sap.ui.core\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:l=\"sap.ui.layout\" xmlns:f=\"sap.ui.layout.form\">\r\n" +
						"	<Page id=\"detailPage\" title=\"Roomba\">\r\n" +
						"		<content>\r\n" +
						"			<IconTabBar selectedKey=\"__filter0\" id=\"__bar0\"> " +
						" 				<items> " +
						"				<IconTabFilter text=\"Orders\" count=\"22\" showAll=\"true\" id=\"__filter0\"> " +
						"				<content> " +
						"					<List noDataText=\"No data\" id=\"__list0\"> " +
						"					<customData> " +
						"						<core:CustomData key=\"sap-ui-fastnavgroup\" value=\"true\" writeToDom=\"true\" id=\"__data4\"/> " +
						"					</customData> " +
						"					<items>" +
						"						<StandardListItem counter=\"0\" title=\"List Item 1\" id=\"__item0\"/> "+
						"						<StandardListItem counter=\"0\" title=\"List Item 2\" id=\"__item1\"/> "+
						"						<StandardListItem counter=\"0\" title=\"List Item 3\" id=\"__item2\"/></items></List> "+
						"				</content> "+
						"				</IconTabFilter> "+
						"			 <IconTabFilter text=\"Open\" count=\"10\" icon=\"sap-icon://task\" iconColor=\"Critical\" id=\"__filter1\"/>" +
						"			 <IconTabFilter text=\"Shipped\" count=\"5\" icon=\"sap-icon://shipping-status\" iconColor=\"Positive\" id=\"__filter2\"/></items>" +
						"			</IconTabBar> "+
						"        </content>\r\n" +
						"	</Page>\r\n" +
						"</mvc:View>",
						type: sap.ui.core.mvc.ViewType.XML
					});

					w5gTestUtils.placeAt("content", oView);
					oDesignTime = w5gTestUtils.createDesignTime({
						designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
						rootElements: [oView],
						plugins: [new sap.ui.dt.plugin.MouseSelection()]
					});
					sap.ui.getCore().applyChanges();

					var oPage = oView.byId("detailPage");
					var oSelectedOverlay = W5gUtils.getControlOverlay(oPage, window);
					oSelectedOverlay.setSelected(true);
				});

				it("After 4 pushes down list item should be selected", function () {
					__pressDownAndExpect("__bar0");
					__pressDownAndExpect("__filter0");
					__pressDownAndExpect("__list0");
					__pressDownAndExpect("__item0");
				});

				function __pressDownAndExpect(id){
					var oControl = W5gUtils.navigateUI5Control("down", oDesignTime);
					W5gUtils.getControlOverlay(oControl, window).setSelected(true);
					expect(_cleanIdPrefix(oControl.sId)).to.equal(id);
				}
			});

			describe("Create control utility is according design time metadata", function() {
				var oDesignTime;

				before(function () {
					oDesignTime = w5gTestUtils.createDesignTime({
						designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata
					});
				});

				after(function () {
					oDesignTime.destroy();
				});

				it("Create button settings is ok", function () {
					var oControl = W5gUtils.createControl("sap.m.Button", window, oDesignTime);
					expect(oControl.getText()).to.equal("Button");
					expect(oControl.getWidth()).to.equal("100px");
				});
				it("Create list constructor was called ok", function () {
					var oControl = W5gUtils.createControl("sap.m.List", window, oDesignTime);
					expect(oControl.getNoDataText()).to.equal("Drop list items here");
					expect(oControl.getItems()).to.have.length(3);
				});
			});

			describe("is base of - utility", function() {
				it("class is base of itself", function () {
					expect(W5gUtils.isBaseOf("sap.m.Button", "sap.m.Button", window)).to.be.true;
				});
				it("base is base of extender", function () {
					expect(W5gUtils.isBaseOf("sap.m.ToggleButton", "sap.m.Button", window)).to.be.true;
				});
				it("base is base of extender of extender", function () {
					expect(W5gUtils.isBaseOf("sap.m.StandardListItem", "sap.ui.core.Control", window)).to.be.true;
				});
				it("extender is not base of base", function () {
					expect(W5gUtils.isBaseOf("sap.ui.core.Control", "sap.m.StandardListItem", window)).to.be.false;
				});
				it("class is not base of unrelated other class", function () {
					expect(W5gUtils.isBaseOf("sap.m.Button", "sap.m.StandardListItem", window)).to.be.false;
				});
				it("interface is base of implementor", function () {
					expect(W5gUtils.isBaseOf("sap.m.IconTabFilter", "sap.m.IconTab", window)).to.be.true;
				});
				it("interface is not base of unrelated class", function () {
					expect(W5gUtils.isBaseOf("sap.m.Button", "sap.m.IconTab", window)).to.be.false;
				});

			});

			describe("test get Container Target Aggregation", function() {

				it("get Target Aggregation of container with default aggregation", function () {
					var oPage = new sap.m.Page();
					expect(W5gUtils.getContainerTargetAggregation(oPage)).to.equal("content");
				});
				it("get Target Aggregation of container without default aggregation", function () {
					var oBar = new sap.m.Bar();
					expect(W5gUtils.getContainerTargetAggregation(oBar)).to.equal("contentLeft");
				});
				it("get Target Aggregation of control that is not a container", function () {
					var oButton = new sap.m.Button();
					expect(W5gUtils.getContainerTargetAggregation(oButton)).to.equal(null);
				});
			});

			describe("test controller related utilities", function() {

				var oViewMock = {getControllerName : function(){
					return "xmlView.Events";
				}};

				before(function () {
					window.jQuery.sap.registerModulePath("xmlView" , "/watt/proxy/http/localhost:9080/file/myusername-OrionContent/my.awsome.app/./view/");
				});

				it("fetch controller path according to view", function () {
					assert.equal(W5gUtils.getControllerPathByView(oViewMock , window) , "/my.awsome.app/view/Events.controller.js");
				});
			});

			function _cleanIdPrefix(sId){
				return sId.split("--")[1];
			}
		});
	});


