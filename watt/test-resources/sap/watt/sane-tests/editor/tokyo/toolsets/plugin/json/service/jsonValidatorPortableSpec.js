define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {
	"use strict";

	var sandbox;
	var suiteName = "service_json_validator_portable";
	var oJsonValidatorService;
	var _oJsonValidatorImpl;
	var oResult = {
		"root": {},
		"issues": []
	};

	describe("Retrive metadata information from Json Validator", function () {
		before(function () {
			return STF.startWebIde(suiteName, {
				config: "editor/tokyo/toolsets/plugin/json/service/jsonValidatorPortableConfig.json"
			}).then(function (webIdeWindowObj) {
				oJsonValidatorService = STF.getService(suiteName, "jsonValidator");
				return STF.getServicePrivateImpl(oJsonValidatorService).then(function (oImpl) {
					_oJsonValidatorImpl = oImpl;
				});
			});
		});

		it("jsonValidator metadata", function () {
			var metadata = _oJsonValidatorImpl.getMetadata();
			expect(metadata).to.exist;
			expect(metadata.jsonValidatorSchema).to.be.array;
			expect(metadata.jsonValidatorSchema[0].projectType).to.exist;
			expect(metadata.jsonValidatorSchema[0].fileNames).to.be.array;
			expect(metadata.jsonValidatorSchema[0].schema).to.be.string;
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
