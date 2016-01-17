define(["w5g/w5gTestUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils",
		"sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/models/W5gPropertiesModel"
	],
	function (w5gTestUtils, W5gUtils, W5gPropertiesModel) {
		"use strict";
		describe("Select descendant", function () {
			var oView, oDesignTime;

			function view(sViewContent) {
				return sap.ui.view({
					viewContent: sViewContent,
					type: sap.ui.core.mvc.ViewType.XML
				});
			}

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
			});

			after(function () {
				oView.destroy();
			});

			beforeEach(function () {
				w5gTestUtils.placeAt("content", oView);
				oDesignTime = w5gTestUtils.createDesignTime({
					designTimeMetadata: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter.designTimeMetadata,
					rootElements: [oView]
				});
				sap.ui.getCore().applyChanges();
			});

			afterEach(function () {
				oDesignTime.destroy();
			});

			it("verify customData typeName is string and not any", function () {
				var oControl = oView.byId("__data4");
				var aControlProperties = W5gPropertiesModel.__QUnit_getUi5CtrlProperties(oControl).filter(function(oProperty) {
					return oProperty.name === "value";
				});
				expect(aControlProperties[0].typeName).to.be.equal("string");
			});
		});
	});
