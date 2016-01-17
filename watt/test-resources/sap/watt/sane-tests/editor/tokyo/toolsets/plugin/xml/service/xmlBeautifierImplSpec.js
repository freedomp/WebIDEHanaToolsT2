define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "xml_beautifier_impl_service";
	var oXmlBeautifierService;
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

	function beautifyAndAssertEqual(beforeFile, expectedAfterFile) {
		var promise1 = _getRemoteResource(beforeFile);
		var promise2 = _getRemoteResource(expectedAfterFile);
		return Q.spread([promise1, promise2], function (before, expectedAfter) {
			return oXmlBeautifierService.beautify(before + "", null)
				.then(function (sbeautifyXML) {
					expect(sbeautifyXML).to.equal(expectedAfter);
				}
			);
		});
	}

	function _getRemoteResource(sUrl) {
		var baseUrl = "editor/tokyo/toolsets/plugin/xml/service/testData/";
		sUrl = require.toUrl((baseUrl + sUrl));
		return Q(
			$.ajax({
				dataType: "text",
				url: sUrl
			})
		);
	}

	describe("XML Beautifier Service Tests", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oXmlBeautifierService = serviceGetter("xmlbeautifier");
				});
		});

		it('Test beautify without Settings', function () {
			return oXmlBeautifierService.beautify(sTested, null).then(function (sbeautifyXML) {
					expect(sbeautifyXML).to.equal(sExpected);
				}
			);
		});

		it("space between attribute key and equal sign should not invalidate the xml after beautify", function () {
			return beautifyAndAssertEqual("spaceBetweenAttrAndEqualSign/Before.txt", "spaceBetweenAttrAndEqualSign/After.txt");
		});

		it("space between attribute value and equal sign should not invalidate the xml after beautify", function () {
			return beautifyAndAssertEqual("spaceBetweenAttrValueAndEqualSign/Before.txt", "spaceBetweenAttrValueAndEqualSign/After.txt");
		});

		it("i18n use case- '>' special tag should not be replaced after beautify", function () {
			return beautifyAndAssertEqual("i18nUseCase/Before.txt", "i18nUseCase/After.txt");
		});

		it("ui5 View", function () {
			return beautifyAndAssertEqual("ui5View/Before.txt", "ui5View/After.txt");
		});

		it("different cases with closing tags", function () {
			return beautifyAndAssertEqual("differentClosingTags/Before.txt", "differentClosingTags/After.txt");
		});

		it("xml with syntax error", function () {
			return beautifyAndAssertEqual("xmlWithSyntaxError/Before.txt", "xmlWithSyntaxError/After.txt");
		});

		it("xml with syntax error and attributes", function () {
			return beautifyAndAssertEqual("xmlWithSyntaxErrorAndAttributes/Before.txt", "xmlWithSyntaxErrorAndAttributes/After.txt");
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
