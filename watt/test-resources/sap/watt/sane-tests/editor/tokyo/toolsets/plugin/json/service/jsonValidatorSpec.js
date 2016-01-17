define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {
	"use strict";

	var sandbox;
	var suiteName = "service_json_validator_client";
	var oJsonValidatorService;
	var _oJsonValidatorImpl;
	var oFakeFileDAOService;
	var oDocumentProviderService;
	var oDocumentService;
	var oJsonSchemaValidator1Serv;
	var oJsonSchemaValidator2Serv;
	var oFakeProjectTypeDAOService;
	var oSchema1;
	var oSchema2;
	var oProject = {
		"project1": {
			"fpile1": "a",
			".project.json": JSON.stringify({
				"projectType": ["hana", "fiori"]
			}),
			"bb": "This is my file"
		}
	};
	var oResult = {
		"root": {},
		"issues": []
	};

	describe("Json Validator Client Tests", function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "editor/tokyo/toolsets/plugin/json/service/config.json"
			}).then(function (webIdeWindowObj) {
				oJsonValidatorService = STF.getService(suiteName, "jsonValidator");
				oFakeFileDAOService = STF.getService(suiteName, "fakeFileDAO");
				oDocumentProviderService = STF.getService(suiteName, "filesystem.documentProvider");
				oDocumentService = STF.getService(suiteName, "document");
				oJsonSchemaValidator1Serv = STF.getService(suiteName, "jsonSchemaValidator1");
				oJsonSchemaValidator2Serv = STF.getService(suiteName, "jsonSchemaValidator2");
				oFakeProjectTypeDAOService = STF.getService(suiteName, "fakeProjectTypeDAO");
				var aPromises = [];
				aPromises.push(oFakeFileDAOService.setContent(oProject));
				aPromises.push(oJsonSchemaValidator1Serv.getSchema());
				aPromises.push(oJsonSchemaValidator2Serv.getSchema());
				return Q.all(aPromises).then(function (aResults) {
					oSchema1 = aResults[2];
					oSchema2 = aResults[3];
					return STF.getServicePrivateImpl(oJsonValidatorService).then(function (oImpl) {
						_oJsonValidatorImpl = oImpl;
					});
				});
			});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		it("jsonValidatorSchema config negative test- simple 1 configuration", function () {
			assert.ok(!_oJsonValidatorImpl._projectTypesConf.blabla, "no blabla project type defined");
			expect(_oJsonValidatorImpl._projectTypesConf.hana.xx).to.be.undefiend; //  "no xx file for project Type hana"
		});

		it("jsonValidatorSchema config possitive test - complex configuration", function () {
			assert.ok(_oJsonValidatorImpl._projectTypesConf.hana, "hana project type defined");
			assert.ok(_oJsonValidatorImpl._projectTypesConf.fiori, "fiori project type defined");
			expect(_oJsonValidatorImpl._projectTypesConf.hana.bb).to.equal(oJsonSchemaValidator1Serv);
			expect(_oJsonValidatorImpl._projectTypesConf.hana.aa).to.equal(oJsonSchemaValidator2Serv);
			expect(_oJsonValidatorImpl._projectTypesConf.fiori.aa).to.equal(oJsonSchemaValidator2Serv);
			expect(_.keys(_oJsonValidatorImpl._projectTypesConf.hana).length).to.equal(4);
		});

		it("jsonValidatorSchema config negative test - missing files", function () {
			expect(_.keys(_oJsonValidatorImpl._projectTypesConf.hana)).to.deep.equal(["aa", "bb", "dd", "cc"]);
			expect(_oJsonValidatorImpl._projectTypesConf.hana.bb).to.equal(oJsonSchemaValidator1Serv);
			expect(_oJsonValidatorImpl._projectTypesConf.hana.aa).to.equal(oJsonSchemaValidator2Serv);
		});

		it("jsonValidatorSchema config negative test - missing schema", function () {
			assert.ok(!_oJsonValidatorImpl._projectTypesConf.UI5, "projectType should not be added because of missing schema");
		});

		it("jsonValidatorSchema config negative test - missing project Type", function () {
			expect(_oJsonValidatorImpl._projectTypesConf.fiori.aa).to.deep.equal(oJsonSchemaValidator2Serv);
			assert.ok(!_oJsonValidatorImpl._projectTypesConf.fiori.tt, "no tt file configured");
			jQuery.each(_oJsonValidatorImpl._projectTypesConf, function (projectType, obj) {
				jQuery.each(obj, function (fileName, schema) {
					if (_.isMatch(schema, oJsonSchemaValidator1Serv)) {
						assert.ok(fileName === "bb", "mySchemaString-schema from service-jsonSchemaValidator1 defined only for bb file");
					}
				});
			});
		});


		it("Integration test - getIssuessyncroniasly - syntax error in JSON which have schema", function () {
			return oJsonValidatorService.getIssuesSynchronously("bad JSON source", null, "/project1/bb")
				.then(function (oIssues) {
					var oResult1 = {
						"root": {
							"severity": "error"
						},
						issues: [
							{
								category: "Syntax Error",
								"checker": "",
								"column": 1,
								"helpUrl": "",
								"line": 1,
								"message": "Unexpected 'b'",
								"path": "/project1/bb",
								"ruleId": "",
								"severity": "error",
								"source": ""
							}
						]
					};
					expect(oIssues).to.deep.equal(oResult1);
				});
		});

		it("Integration test -getIssuesSynchronously - JSON with schema", function () {
			var sJSONsource = '{\"prop1\" : \"abc\"}';
			return oJsonValidatorService.getIssuesSynchronously(sJSONsource, null, "/project1/bb")
				.then(function (oIssues) {
					assert.ok(_.isMatch(oIssues, oResult), "JSON without syntax errors and with schema that should return error");
				});
		});

		it("Integration test -getIssuesSynchronously - JSON without schema", function () {
			var sJSONsource = '{\"prop1\" : \"abc\"}';
			return oJsonValidatorService.getIssuesSynchronously(sJSONsource, null, "/project1/fpile1")
				.then(function (oIssues) {
					assert.ok(_.isMatch(oIssues, oResult), "JSON without syntax errors and with schema that should return error");
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
