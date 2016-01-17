define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	"use strict";

	var suiteName = "projectTypeNoIdTest";
	describe("Project Type Without ID Unit  test", function () {
		var getService = STF.getServicePartial(suiteName);
		var oProjectTypeService;


		before(function () {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/configNoId.json"
			}).then(function (webIdeWindowObj) {
				oProjectTypeService = getService("projectType");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});



		describe("configure projectType with no id (required field)",function () {
			it("getAllTypes returns an empty array", function () {
				return oProjectTypeService.getAllTypes().then(function (types) {
					assert.equal(types.length, 0);
				});
			});

		});
	});
});