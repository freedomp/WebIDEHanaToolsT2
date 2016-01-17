define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "xml_formatter_integration";
	var oSelectionService;
	var oFakeFileDAO;
	var oFileSystem;
	var sProj1 = "proj1";
	var oSettingProjectStub;
	var oCommandService;

	var expected =
		"<mvc:Viewxmlns:mvc=\"sap.ui.core.mvc\" controllerName=\"nw.epm.refapps.ext.shop.view.EmptyPage\" xmlns=\"sap.m\">\n" +
		"	<Page class=\"sapUiFioriObjectPage\" enableScrolling=\"false\" navButtonPress=\"onBackPressed\" showNavButton=\"true\">\n" +
		"		<content>\n" +
		"			<VBox class=\"nwEpmRefappsShopTextcontainer\">\n" +
		"				<Text class=\"nwEpmRefappsShopTextclass\" text=\"{i18n>ymsg.pageNotFoundTitle}\"/>\n" +
		"				<Text class=\"nwEpmRefappsShopTextclass\" text=\"{i18n>ymsg.pageNotFoundIntro}\"/>\n" +
		"			</VBox>\n" +
		"		</content>\n" +
		"	</Page>\n" +
		"</mvc:View>";

	var Owner = function (sFilePath, sInstanceOf) {
		this.sInstanceOf = sInstanceOf;
		this.sFilePath = sFilePath;
		this.instanceOf = function (sInstanceOf) {
			return this.sInstanceOf === sInstanceOf;
		};
		this.getCurrentFilePath = function () {
			return Q(this.sFilePath);
		};
	};

	var fnCreateFileStructure = function (oContent) {
		return oFakeFileDAO.setContent(oContent);
	};

	function createOwner(projName) {
		return new Owner("/" + projName + "/file1.xml", "sap.watt.common.plugin.aceeditor.service.Editor");
	};

	function createContentForRepository() {
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

		var oContent =
		{
			"proj1": {
				"file1.xml": source
			}
		};
		return oContent;
	}

	function initSelection(oDocument) {
		sandbox.stub(oSelectionService, "assertNotEmpty").returns(Q([{document: oDocument}]));
		sandbox.stub(oSelectionService, "getOwner").returns(Q(
			{
				instanceOf: function () {
					return true;
				},
				getUI5Editor: function () {
					return Q({
						getCursorPosition: function () {
						},
						setDocValue: function (sFormattedContent) {
							return oDocument.setContent(sFormattedContent);
						}
					});
				}
			}
		));
	}

	describe("XML Formatter utility integration Test", function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "editor/tokyo/toolsets/plugin/xml/service/config.json"
			}).then(function (webIdeWindowObj) {
				oSelectionService = STF.getService(suiteName, "selection");
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileSystem = STF.getService(suiteName, "filesystem.documentProvider");
				oCommandService = STF.getService(suiteName, "command");
			});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
			return fnCreateFileStructure(createContentForRepository());
		});

		it("formatting intergation scenario", function () {
			return oFileSystem.getDocument("/" + sProj1 + "/file1.xml")
				.then(function (oDoc) {
					initSelection(oDoc);
					return oCommandService.getCommand("beautify.beautifier")
						.then(function (oCommand) {
							//oSettingProjectStub = sinon.stub(oCommand, "_isAvailable").returns(Q(true));
							//oSettingProjectStub = sinon.stub(oCommand, "_isEnabled").returns(Q(true));
							return oCommand.execute().then(function () {
								return oDoc.getContent().then(function (beautifyXML) {
									expect(beautifyXML).to.equal(expected);
								});
							});
						}
					);
				});

		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
