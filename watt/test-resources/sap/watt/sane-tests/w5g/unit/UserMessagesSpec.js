define([
	"STF",
	"sap/watt/lib/lodash/lodash",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/layout/MessageBar",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/control/layout/NotificationBar",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/dtplugins/listener/NotificationListener",
	"w5g/w5gTestUtils",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
	"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/ControlMetadata"
], function (STF, _, MessageBar, NotificationBar, NotificationListener, w5gTestUtils, W5gUtils, ControlMetadata) {
	"use strict";

	describe('User Messages', function () {

		var oDesignTime, oMessageBar, oNotificationBar, oView, i18n;

		before(function () {
			jQuery.sap.require("sap.ui.dt.DesignTime");
			jQuery.sap.require("sap.ui.dt.plugin.MouseSelection");
			jQuery.sap.registerModulePath("xmlView", w5gTestUtils.toFullURL("xmlView"));
			oMessageBar = new MessageBar();
			oNotificationBar = new NotificationBar();
			i18n = w5gTestUtils.getI18n();
			i18n.applyTo(oNotificationBar);
			W5gUtils.init({i18n: i18n});

			oView = sap.ui.xmlview("UserMessagesView", "xmlView.UserMessagesView");
			w5gTestUtils.placeAt("content", oView);
			sap.ui.getCore().applyChanges();
			oDesignTime = w5gTestUtils.createDesignTime({
				designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
				rootElements: [oView],
				plugins: [new sap.ui.dt.plugin.MouseSelection()]
			});

		});

		after(function () {
			oDesignTime.destroy();
			oView.destroy();
		});


		describe("Test Selection", function () {

			it("Test Button selection inside a Page", function () {
				var oButton = oView.byId("button");
				oMessageBar.setSelection(oButton);
				assert.deepEqual(oMessageBar.__QUnit_getPath(), ["View", "Page", "Button"], "Incorrect status of selected control");
			});

			it("Test control selection of path hierarchy bigger than 3", function () {
				var oList = oView.byId("list");
				var oListItem = oList.getItems()[0];
				oMessageBar.setSelection(oListItem);
				assert.deepEqual(oMessageBar.__QUnit_getPath(), ["View", "Page", "Icon Tab Bar", "Icon Tab Filter", "List", "Standard List Item"], "Incorrect status of selected control that has hierarchy deep level bigger then 3");
			});

			it("Test root selection", function () {
				oMessageBar.setSelection(oView);
				assert.deepEqual(oMessageBar.__QUnit_getPath(), ["View"], "string should match");
			});

			it("Test Object Header selection (properties shown in canvas have to be change in properties pane)", function () {
				var oObjectHeader = oView.byId("objectHeader");
				var sLine1 = i18n.getText("i18n", "message_area_cannot_change_inner_properties_from_canvas", ["Object Header"]);
				oNotificationBar.updateMessageArea(sLine1, "", true);
				oMessageBar.setSelection(oObjectHeader);
				assert.deepEqual(oMessageBar.__QUnit_getPath(), ["View", "Page", "Object Header"], "string should match");
				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_cannot_change_inner_properties_from_canvas"],
					[["Object Header"]]
				), "string should match");
			});

			it("Test selection of an unsupported control", function () {
				var oUploadCollection = oView.byId("carousel");
				var sLine1 = i18n.getText("i18n", "unsupported_message");
				oNotificationBar.updateMessageArea(sLine1, "", false);
				oMessageBar.setSelection(oUploadCollection);
				assert.deepEqual(oMessageBar.__QUnit_getPath(), ["View", "Page", "Carousel"], "string should match");
				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["unsupported_message"]
				), "string should match");
			});
		});

		describe("Notification Bar event handlers tests", function () {

			var oW5gDragDropPlugin, oEvent = {
				currentTarget: {},
				originalEvent : {
					clientX: 0,
					clientY: 0,
					dataTransfer: {
						dropEffect: "move"
					}
				}
			};

			before(function(){
				jQuery.sap.require("sap.ui.dt.DesignTime");
				jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop");
				oW5gDragDropPlugin = new sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gDragDrop({
					w5gUtils: W5gUtils,
					controlMetadata: ControlMetadata
				});
				oW5gDragDropPlugin.setListeners(
					[
						new NotificationListener(oNotificationBar, oW5gDragDropPlugin)
					]
				);
				oDesignTime.addPlugin(oW5gDragDropPlugin);
			});

			beforeEach(function () {
				oW5gDragDropPlugin._iClientX = Infinity;
				oW5gDragDropPlugin._iClientY = Infinity;
				oW5gDragDropPlugin._iLastResponseTimestamp = 0;
			});

			after(function () {
				oW5gDragDropPlugin.destroy();
			});

			it("Test dragging controls into invalid areas - dragging a ListItem inside a Page when there is no Select Control", function () {
				var oListItem = new sap.ui.core.ListItem({});
				oEvent.currentTarget.id = oListItem.sId;
				var oListItemOverlay = oDesignTime.createOverlayFor(oListItem);
				oW5gDragDropPlugin.getListeners()[0].onDragStart(oListItemOverlay, oEvent);

				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_invalid_drop_area"],
					[["List Item", "Select"]]
				), "string should match");
			});


			it("Drag sap.m.PullToRefresh and verify there is a warning message", function () {

				var oPullToRefresh = new sap.m.PullToRefresh({});
				oEvent.currentTarget.id = oPullToRefresh.sId;
				var oPullToRefreshOverlay = oDesignTime.createOverlayFor(oPullToRefresh);
				oW5gDragDropPlugin.getListeners()[0].onDragStart(oPullToRefreshOverlay, oEvent);

				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_warning","message_area_pull_to_refresh_warning"], []), "string should match");
			});

			it("Message indicates dragging palette control over outline control is not possible", function () {

				var oTokenizerOverlay = W5gUtils.getControlOverlay(oView.byId("__tokenizer0"));
				oEvent.currentTarget.id = oTokenizerOverlay.sId;
				oW5gDragDropPlugin.getListeners()[0].onDragOver(oTokenizerOverlay, oEvent);

				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_invalid_drop_to_outline_controls"],
					[["Tokenizer"]]
				), "strings should match");
			});


			it("Dragging sap.m.Label onto sap.ui.layout.form.SimpleForm and verify right message appears", function () {

				//Start dragging Label
				var oLabelOverlay = W5gUtils.getControlOverlay(oView.byId("__label4"));
				oLabelOverlay.$().trigger("dragstart");

				//On simple form
				var oSimpleFormOverlay = W5gUtils.getControlOverlay(oView.byId("__form0"));
				oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oSimpleFormOverlay, "content"),
					{originalEvent: {clientX: 0, clientY: 0}});

				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_drop_target_info", "message_area_drop_label_on_form"],
					[["Simple Form", "content"]]
				), "strings should match");
			});

			it("Dragging sap.m.Button onto sap.n.HBox and verify right message appears", function () {

				//Start dragging Label
				var oButtonOverlay = W5gUtils.getControlOverlay(oView.byId("button"));
				oButtonOverlay.$().trigger("dragstart");

				//On simple form
				var oHBoxOverlay = W5gUtils.getControlOverlay(oView.byId("__hbox0"));
				oW5gDragDropPlugin.onAggregationDragOver(w5gTestUtils.getChildAggregationOverlay(oHBoxOverlay, "items"),
					{originalEvent: {clientX: 0, clientY: 0}});

				assert.ok(w5gTestUtils.compareMessages(i18n,
					oNotificationBar.getMessages(),
					["message_area_drop_target_info"],
					[["HBox", "items"]]
				), "strings should match");
			});
		});
	});
});
