//  The SaneTestFramework should be imported via 'STF' path.
define(['STF', "sap/watt/toolsets/plugin/json/utils/getSchema"], function (STF, getSchema) {
	"use strict";

	var sandbox;

	var suiteName = "service_neoAppValidator";

	var _oImpl;
	var oNeoAppValidatorService;

	describe("test for neoAppValidator service", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {

					var serviceGetter = STF.getServicePartial(suiteName);
					oNeoAppValidatorService = serviceGetter("neoAppSchemaProvider");
					return STF.getServicePrivateImpl(oNeoAppValidatorService).then(function (oImpl) {
						_oImpl = oImpl;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});

		it("checking regular case for getSchema function ", function () {
			var baseSchemaUrl = "sap.watt.toolsets.json/neoApp/schema/neoAppSchema.json";
			return oNeoAppValidatorService.getSchema().then(function (oReturnedSchema) {
				expect(oReturnedSchema).to.be.an('object');
			})
				.fail(function(error){
					ok(false);
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

	});
});
