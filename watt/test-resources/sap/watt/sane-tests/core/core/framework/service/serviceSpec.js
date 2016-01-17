define(["sap/watt/core/Service", "sap/watt/core/ServiceRegistry"], function (Service, ServiceRegistry) {
	"use strict";

	describe("Service Unit Test", function () {
		describe("Service", function () {

			it("Registry", function () {
				var oRegistry = new ServiceRegistry();
				return oRegistry.register("myTestService", {}).then(function () {
					assert.ok(oRegistry.get("myTestService"));
				});
			});

			it("Register two services with same name throws error", function () {
				var oRegistry = new ServiceRegistry();
				return oRegistry.register("myTestService", {}).then(function () {
					assert.throw(function () {
						oRegistry.register("myTestService", {});
					}, /is already implemented/);
				});
			});

			it("Not Registered Service throws an error", function () {
				var oRegistry = new ServiceRegistry();
				assert.throw(function () {
					oRegistry.get("myTestService");
				}, /Service not registered/);
			});

			it("Deprecated Service Module", function () {
				var oRegistry = new ServiceRegistry();
				Service.$setServiceRegistry(oRegistry);
				return oRegistry.register("myTestService", {}).then(function () {
					assert.ok(Service.get("myTestService"));
				});
			});
		});

	});
});