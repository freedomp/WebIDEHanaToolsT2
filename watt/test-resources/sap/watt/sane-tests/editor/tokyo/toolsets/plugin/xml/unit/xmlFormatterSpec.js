define(["sap/watt/lib/lodash/lodash", "sinon", 'STF', "sap/watt/toolsets/plugin/xml/utils/XmlFormatter"],
	function (_, sinon, STF, Formatter) {

		var formatXML = new Formatter();

		var source =
			"<mvc:View" +
			"xmlns:mvc=\"sap.ui.core.mvc\"	xmlns=\"sap.m\" controllerName=\"nw.epm.refapps.ext.shop.view.EmptyPage\">" +
			"				<Page enableScrolling=\"false\" class=\"sapUiFioriObjectPage\" showNavButton=\"true\" navButtonPress=\"onBackPressed\">" +
			"	<content>" +
			"					<VBox class=\"nwEpmRefappsShopTextcontainer\">" +
			"				<Text text=\"{i18n>ymsg.pageNotFoundTitle}\" class=\"nwEpmRefappsShopTextclass\" />" +
			"								<Text text=\"{i18n>ymsg.pageNotFoundIntro}\" class=\"nwEpmRefappsShopTextclass\" />" +
			"		</VBox>" +
			"	</content>" +
			"</Page>" +
			"					</mvc:View>";

		var expected =
			"<mvc:View\n" +
			"	xmlns:mvc=\"sap.ui.core.mvc\"\n" +
			"	xmlns=\"sap.m\" controllerName=\"nw.epm.refapps.ext.shop.view.EmptyPage\">\n" +
			"	<Page enableScrolling=\"false\" class=\"sapUiFioriObjectPage\" showNavButton=\"true\" navButtonPress=\"onBackPressed\">\n" +
			"		<content>\n" +
			"			<VBox class=\"nwEpmRefappsShopTextcontainer\">\n" +
			"				<Text text=\"{i18n>ymsg.pageNotFoundTitle}\" class=\"nwEpmRefappsShopTextclass\" />\n" +
			"				<Text text=\"{i18n>ymsg.pageNotFoundIntro}\" class=\"nwEpmRefappsShopTextclass\" />\n" +
			"			</VBox>\n" +
			"		</content>\n" +
			"	</Page>\n" +
			"</mvc:View>";

		describe("Ediotr's BaseValidator - XML Formatter utility Test", function () {
			before(function () {
			});

			beforeEach(function () {
			});

			it("run the formatter", function () {
				var result = formatXML.format(source);
				expect(result).to.equal(expected);
			});

			afterEach(function () {
			});

			after(function () {
			});
		});
	});
