//  The SaneTestFramework should be imported via 'STF' path.
define(['STF'], function (STF) {
	"use strict";

	var oBaseValidatorService;
	var oSettingProjectService;
	var sandbox;

	var suiteName = "service_basevalidator_get_list";

	var _oImpl;
	var _langConfiguredServicesBackup = {};

	var aFakeRegisteredValidators = {
		js: [
			{
				displayName: "JavaScript1",
				serviceID: "jsValidator1Id"
			},
			{
				displayName: "JavaScript2",
				serviceID: "jsValidator2Id"
			}
		],
		xml: [
			{
				displayName: "xml1",
				serviceID: "xml1Id"
			},
			{
				displayName: "xml2",
				serviceID: "xml2Id"
			}
		]

	};


	describe("test getting validators list ", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {

					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oSettingProjectService = serviceGetter("setting.project");
					return STF.getServicePrivateImpl(oBaseValidatorService).then(function (oImpl) {
						_oImpl = oImpl;
						_langConfiguredServicesBackup = _oImpl._getLangConfiguredServices();
					});
				});
		});

		beforeEach(function () {
			_oImpl._setLangConfiguredServices(aFakeRegisteredValidators);
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			_oImpl._setLangConfiguredServices(_langConfiguredServicesBackup);
			sandbox.restore();
		});

		it("returns an array of registered validators for extension where defaults fom .project setting are first in the list", function () {
			var oFakeProjectSettings = {
				services: {
					"xml": "xml2Id",
					"js": "jsValidator2Id"
				}
			};
			sandbox.stub(oSettingProjectService, "get").returns(Q(oFakeProjectSettings));
			var fileExtension = "xml";
			return oBaseValidatorService.getValidatorsList(fileExtension, {}).then(function (validators) {
				// making sure xml2Id is first in the list
				expect(validators).to.deep.equal([
					{
						"displayName": "xml2",
						"serviceID": "xml2Id"
					},
					{
						"displayName": "xml1",
						"serviceID": "xml1Id"
					}
				]);
			});
		});

		it("returns an array with registered validators where no defaults are configured for the extension at .project settings", function () {
			var oFakeProjectSettings = {
				services: {
					"js": "jsValidator2Id"
				}
			};
			sandbox.stub(oSettingProjectService, "get").returns(Q(oFakeProjectSettings));
			var fileExtension = "xml";
			return oBaseValidatorService.getValidatorsList(fileExtension, {}).then(function (validators) {
				// making sure xml1Id is first in the list
				expect(validators).to.deep.equal([
					{
						"displayName": "xml1",
						"serviceID": "xml1Id"
					},
					{
						"displayName": "xml2",
						"serviceID": "xml2Id"
					}
				]);
			});
		});

		it("returns an array of registered validators where no .project file exist", function () {
			sandbox.stub(oSettingProjectService, "get").returns(Q(null));
			var fileExtension = "xml";
			return oBaseValidatorService.getValidatorsList(fileExtension, {}).then(function (validators) {
				// making sure we get a result even though nothing is written in project.json
				expect(validators).to.deep.equal([
					{
						"displayName": "xml1",
						"serviceID": "xml1Id"
					},
					{
						"displayName": "xml2",
						"serviceID": "xml2Id"
					}
				]);
			});
		});

		 after(function() {
		 	STF.shutdownWebIde(suiteName);
		 });

	});
});
