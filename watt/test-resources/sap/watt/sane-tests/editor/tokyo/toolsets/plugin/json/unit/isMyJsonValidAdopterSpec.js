define(["STF", "sap/watt/toolsets/plugin/json/adopters/isMyJsonValidAdopter"], function (STF, isMyJsonValidAdopter) {

	describe("isMyJsonValidAdopter testing", function () {
		var suiteName = "service_for_isMyJsonValidAdopterSpec";
		var sandbox;
		var _webIdeWindowObj;
		var oJsonValidatorService;
		var oFioriSchemaProviderService;

		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					_webIdeWindowObj = webIdeWindowObj;
					var serviceGetter = STF.getServicePartial(suiteName);
					oJsonValidatorService = serviceGetter("jsonValidator");
					oFioriSchemaProviderService = serviceGetter("fioriSchemaProvider");
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		it("_getSrcText - brackets scenario", function () {
				var oldText = "\"sap.app\"";
				var expectedText = {fullPath: "\"sap.app\"", lastField: "\"sap.app\""};
				expect(isMyJsonValidAdopter._getSrcText(oldText)).to.deep.equal(expectedText);
			}
		);

		it("_getSrcText - dot scenario", function () {
				var oldText = "data._value";
				var expectedText = {fullPath: "_value", lastField: "_value"};
				expect(isMyJsonValidAdopter._getSrcText(oldText)).to.deep.equal(expectedText);
			}
		);

		it("_getSrcText - brackets scenario long field", function () {
				var oldText = "\"sap.app\".aa.\"dd.c\"";
				var expectedObject = {fullPath: "\"sap.app\".aa.\"dd.c\"", lastField: "\"dd.c\""};
				expect(isMyJsonValidAdopter._getSrcText(oldText)).to.deep.equal(expectedObject);
			}
		);

		it("getSchema supplies internal errors when internal mode", function () {
			sandbox.stub(_webIdeWindowObj.sap.watt, "getEnv").returns(true);//make sure when getSchema asks if this is "internal" true will be returned
			var aPromises = [];
			var versions = ["1.1.0", "1.2.0"];
			for (var ii = 0; ii < versions.length; ii++) {
				aPromises.push(oFioriSchemaProviderService.getSchema().then($.proxy(function (index, oSchema) {
					var basicJson = {
						"_version": versions[index],
						"sap.app": {}
					};
					var objectLocations = {
						"\"sap.app\"": {"line": 2, "column": 1, "at": 1}
					};
					return isMyJsonValidAdopter.getIssues(basicJson, oFioriSchemaProviderService, objectLocations, "").then(function (oIssues) {
						expect(oIssues.issues.length === 8).to.be.true; // includes .resources and .ach https://wiki.wdf.sap.corp/wiki/display/fioritech/AppDescriptor+Schema+-+Second+Version+for+Wave+9
					});
				}, this, ii)));
			}
			return Q.all(aPromises);
		});

		it("getSchema shouldn't supply internal errors when not in internal mode", function () {
			sandbox.stub(_webIdeWindowObj.sap.watt, "getEnv").returns(false); //make sure when getSchema asks if this is "internal" false will be returned
			return oFioriSchemaProviderService.getSchema().then(function (oSchema) {
				var basicJson = {
					"_version": "1.2.0",
					"sap.app": {}
				};
				var objectLocations = {
					"\"sap.app\"": {"line": 2, "column": 1, "at": 1}
				};
				return isMyJsonValidAdopter.getIssues(basicJson, oFioriSchemaProviderService, objectLocations, "").then(function (oIssues) {
					expect(oIssues.issues.length === 6).to.be.true;  // does not includes .resources and .ach https://wiki.wdf.sap.corp/wiki/display/fioritech/AppDescriptor+Schema+-+Second+Version+for+Wave+9
				});
			});
		});

		it("non supported version should not present the open source non-informative error", function () {
			sandbox.stub(_webIdeWindowObj.sap.watt, "getEnv").returns(false); //make sure when getSchema asks if this is "internal" false will be returned
			return oFioriSchemaProviderService.getSchema().then(function (oSchema) {
				var basicJson = {
					"_version": "bad-error",
					"sap.app": {}
				};
				var objectLocations = {
					"\"sap.app\"": {"line": 2, "column": 1, "at": 1}
				};
				return isMyJsonValidAdopter.getIssues(basicJson, oFioriSchemaProviderService, objectLocations, "").then(function (oIssues) {
					for (var ii = 0; ii < oIssues.issues.length; ii++) {
						var issue = oIssues.issues[ii];
						expect(issue.message !== "\"sap.app\"- no (or more than one) schemas match").to.be.true;
					}
				});
			});
		});

		it("Schema error is on a field which is not present in the json", function () {
			sandbox.stub(_webIdeWindowObj.sap.watt, "getEnv").returns(true); //make sure when getSchema asks if this is "internal" true will be returned
			return oFioriSchemaProviderService.getSchema().then(function (oSchema) {
				var basicJson = {
					"kokoriko.app": {}
				};
				var objectLocations = {
					"\"kokoriko.app\"": {"line": 5, "column": 4, "at": 20}
				};
				return isMyJsonValidAdopter.getIssues(basicJson, oFioriSchemaProviderService, objectLocations, "").then(function (aOIssues) {
					jQuery.each(aOIssues.issues, function (index, oIssue) {
						expect(oIssue.line === 1, "when field not in json, the line # should be 1").to.be.true;
						expect(oIssue.column === 0, "when field not in json, the column # should be 1").to.be.true;
						expect(oIssue.source === undefined, "when field not in json, the source is undefined").to.be.true;
					});
				});
			});
		});

		it("Schema error is on a field which is present in the json", function () {
			sandbox.stub(_webIdeWindowObj.sap.watt, "getEnv").returns(true); //make sure when getSchema asks if this is "internal" true will be returned
			return oFioriSchemaProviderService.getSchema().then(function (oSchema) {
				var basicJson = {
					"_version": "abc",
					"sap.fiori": "abc"
				};
				var objectLocations = {
					"_version": {"line": 3, "column": 4, "at": 20},
					"\"sap.fiori\"": {"line": 3, "column": 20, "at": 40}
				};
				return isMyJsonValidAdopter.getIssues(basicJson, oFioriSchemaProviderService, objectLocations, "").then(function (aOIssues) {
					//assuming schema returned issue #2 is that "_version" key has a wrong value (enum)
					expect(aOIssues.issues[2].line === 3, "when field is in json, the line # should be taken from objectLocations").to.be.true;
					expect(aOIssues.issues[2].column === 4, "when field is in json, the column # should be taken from objecLocations").to.be.true;
					expect(aOIssues.issues[2].source === "_version", "when field is in json, the source should be taken from objecLocations").to.be.true;
					//assuming schema returned issue #1 is that for "sap.ui" key, its column should be objectLocations.column - 1
					expect(aOIssues.issues[3].column === 19, "column for keys with brakets should be deducted by 1").to.be.true;
				});
			});
		});


		it("get flat schema", function () {
			var manifestJson1 = {_version: "1.1.0", "sap.app": {_version: "1.2.0"}, "sap.ui": {_version: "1.2.0"}};
			var manifestJson2 = {"sap.app": {_version: "bad_version"}, "sap.ui": {_version: "1.1.0"}};
			var promise1 = oFioriSchemaProviderService.getFlatSchema(manifestJson1);
			var promise2 = oFioriSchemaProviderService.getFlatSchema(manifestJson2);
			return Q.spread([promise1, promise2], function (flatSchema1, flatSchema2) {
				expect(flatSchema1.properties["sap.ui"].properties.technology.enum.indexOf("GUI") !== -1).to.be.true;
				expect(flatSchema2.properties["sap.ui"].properties.technology.enum.indexOf("GUI") === -1).to.be.true;
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
