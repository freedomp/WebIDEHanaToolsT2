define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "xml_beautifier_service_integration";
	var xmlBeautifierService;
	var oContentService;
	var oBaseValidatorService;
	var oSelectionService;
	var oFakeFileDAO;
	var oFilesystem;
	var oCommandService;

	var sTested = "<abc at=\"33\">\n";
	sTested += "\t\t\t<bbb at=\"3\"     bt=\"444\" ct=\"555\">\n";
	sTested += "\tyyy\n";
	sTested += "</bbb>\n";
	sTested += "\t\t</abc>";

	var sExpected = "<abc at=\"33\">\n";
	sExpected += "\t<bbb at=\"3\" bt=\"444\" ct=\"555\">\n";
	sExpected += "\t\tyyy\n";
	sExpected += "\t</bbb>\n";
	sExpected += "</abc>";

	function prepareworkspace() {
		var oWorkspace =
		{
			"proj1": {
				"file1.xml": sTested
			}
		};
		return oFakeFileDAO.setContent(oWorkspace);
	}

	function getFile(sUrl) {
		return oFilesystem.getDocument(sUrl);
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

	describe("XML Beautifier Service Integration Test", function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "editor/tokyo/toolsets/plugin/xml/service/config.json"
			}).then(function (webIdeWindowObj) {
				oSelectionService = STF.getService(suiteName, "selection");
				xmlBeautifierService = STF.getService(suiteName, "xmlbeautifier");
				oContentService = STF.getService(suiteName, "setting.project");
				oBaseValidatorService = STF.getService(suiteName, "basevalidator");
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFilesystem = STF.getService(suiteName, "filesystem.documentProvider");
				oCommandService = STF.getService(suiteName, "command");
			});
		});

		beforeEach(function () {
			debugger;
			sandbox = sinon.sandbox.create();
			return prepareworkspace();
		});

		it('Beautifier integration scenario', function () {
			return getFile("/proj1/file1.xml").then(function (oDocument) {
				initSelection(oDocument);
				return oCommandService.getCommand("beautify.beautifier").then(function (oCommand) {
					return oCommand.execute().then(function () {
						return oDocument.getContent().then(function (sbeautifyXML) {
							expect(sbeautifyXML).to.equal(sExpected);
						});
					});
				});
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
