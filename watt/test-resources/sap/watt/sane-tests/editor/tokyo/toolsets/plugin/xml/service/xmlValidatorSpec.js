define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {

	var sandbox;
	var suiteName = "service_xml_validator";
	var oXmlValidatorService;
	var oBaseValidatorService;

	describe("XML Validator Service Tests", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oXmlValidatorService = serviceGetter("xmlValidator");
					oBaseValidatorService = serviceGetter("basevalidator");
				});
		});

		it("Test 'getIssuesSynchronously' with no errors", function () {

			var sSource = '<?xml version="1.0"?><dummy><assembly><id>configs</id><formats><format>zip</format></formats></assembly></dummy>';
			var oConfig = {};
			var sFullPath = "uuu/file.xml";

			return oXmlValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				assert.ok(oResult);
				assert.ok(oResult.root);
				assert.ok(oResult.root.severity === undefined);
				assert.ok(oResult.issues);
				expect(oResult.issues.length).to.equal(0);
			});
		});

		it("Test 'getIssuesSynchronously' xml with error in line 1", function () {

			var sSource = '<?xml version="1.0"?><dummy><assembly><id text=a">configs</id><formats><format>zip</format></formats></assembly></dummy>';
			var oConfig = {};
			var sFullPath = "uuu/file.xml";

			return oXmlValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				assert.ok(oResult);
				assert.ok(oResult.root);
				assert.ok(oResult.root.severity, "error");
				assert.ok(oResult.issues);
				expect(oResult.issues.length).to.equal(1);
				expect(oResult.issues[0].line).to.equal(1);
				expect(oResult.issues[0].column).to.equal(39);
			});
		});


		it("Test 'getIssuesSynchronously' xml with error in line 3", function () {

			var sSource = "<?xml version=\"1.0\"?><dummy><assembly><id>configs</id><formats>\r\n" +
				"<format>zip</format></formats></ass\r\n" +
				"embly></dummy>";
			var oConfig = {};
			var sFullPath = "uuu/file.xml";

			return oXmlValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				assert.ok(oResult);
				assert.ok(oResult.root);
				expect(oResult.root.severity).to.equal("error");
				assert.ok(oResult.issues);
				expect(oResult.issues.length).to.equal(3);
				expect(oResult.issues[0].line).to.equal(1);
				expect(oResult.issues[0].column).to.equal(29);
			});
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
