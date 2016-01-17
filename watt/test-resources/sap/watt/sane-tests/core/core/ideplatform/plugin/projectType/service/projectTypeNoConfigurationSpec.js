define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	"use strict";

	var suiteName = "projectTypeNoConfigTest";
	describe("Project Type No Configuration Unit  test", function () {
		var getService = STF.getServicePartial(suiteName);
		var oProjectTypeService;


		before(function () {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/config.json"
			}).then(function (webIdeWindowObj) {
				oProjectTypeService = getService("projectType");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		describe("configure projectType with no project types", function () {

			it("getType returns null", function () {
				return oProjectTypeService.getType("projtype1").then(function (projType) {
					assert.strictEqual(projType, null);
				});
			});

			it("getIncludedTypes returns empty list", function () {
				return oProjectTypeService.getIncludedTypes("projtype1").then(function (types) {
					assert.strictEqual(types.length, 0);
				});
			});
		});
	});
});