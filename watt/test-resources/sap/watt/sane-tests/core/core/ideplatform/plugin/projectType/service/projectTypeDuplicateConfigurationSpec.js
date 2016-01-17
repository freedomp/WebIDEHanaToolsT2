define(["STF", "util/orionUtils"], function (STF, OrionUtils) {
	"use strict";

	var suiteName = "projectTypeDuplicateConfigTest";
	describe("Project Type Duplicate Configuration Unit  test", function () {
		var getService = STF.getServicePartial(suiteName);
		var oProjectTypeService;


		before(function () {
			return OrionUtils.startWebIdeWithOrion(suiteName, {
				config: "core/core/ideplatform/plugin/projectType/configDuplicateConfig.json"
			}).then(function (webIdeWindowObj) {
				oProjectTypeService = getService("projectType");
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});



		describe("configure projectType with duplicate project types",function () {
			it("getAllTypes returns the type once", function () {
				return oProjectTypeService.getAllTypes().then(function (types) {
					assert.equal(types.length, 1);
					var type = types[0];
					assert.equal(type.id, "projtype1");
					assert.equal(type.displayName, "first");
					assert.equal(type.description, "first!");
				});
			});

			it("getType returns the first type", function () {
				return oProjectTypeService.getType("projtype1").then(function (type) {
					assert.equal(type.id, "projtype1");
					assert.equal(type.displayName, "first");
					assert.equal(type.description, "first!");
				});
			});

			it("getIncludedTypes returns the type", function () {
				return oProjectTypeService.getIncludedTypes("projtype1").then(function (types) {
					assert.deepEqual(types, ["projtype1"]);
				});
			});
		});
	});
});