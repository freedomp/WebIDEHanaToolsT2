define(['STF'], function (STF) {
	"use strict";

	var oBaseValidatorService;
	var oSettingProjectService;
	var MockFileDocument;
	var sandbox;
	var suiteName = "service_basevalidator_locate";


	describe("test locating validator service", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {

					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oSettingProjectService = serviceGetter("setting.project");
					return STF.require(suiteName, [
						"sane-tests/util/mockDocument"
					]);
				}).spread(function (oMockDocument) {
					MockFileDocument = oMockDocument.MockFileDocument;
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});


		it("returns null for unknown service id", function () {
			var serviceID = "null";
			return oBaseValidatorService.getCurrentValidatorServiceProxyById(serviceID).then(function (validatorProxy) {
				expect(validatorProxy).to.be.null;
			});
		});

		it("it returns null on null service id", function () {
			var serviceID = "htmlValidator";
			return oBaseValidatorService.getCurrentValidatorServiceProxyById(serviceID).then(function (validatorProxy) {
				expect(validatorProxy).to.be.null;
			});
		});

		it("it returns a valid proxy for javascript files", function () {
			var oDoc = new MockFileDocument("/dev/null", "js", "content", "proj");
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			sandbox.stub(oSettingProjectService, "getProjectSettings").returns(Q({}));
			var fileExtension = "js"; // assuming html does not have a validator configured
			return oBaseValidatorService.getCurrentValidatorServiceProxyByExtension(fileExtension, oDoc).then(function (validatorProxy) {
				expect(validatorProxy).to.be.not.null;
			});
		});


		after(function() {
			STF.shutdownWebIde(suiteName);
		});

	});
});
