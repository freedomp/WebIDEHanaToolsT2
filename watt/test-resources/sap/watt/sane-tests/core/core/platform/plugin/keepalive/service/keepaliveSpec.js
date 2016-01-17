define(["STF"], function(STF) {
	"use strict";

	var suiteName = "keepaliveTest";
	var oSystem, oKeepAlive;
	describe("keepalive test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/keepalive/config.json"
			}).then(function() {
				oSystem = getService("system");
				oKeepAlive = getService("keepAlive");
				return oSystem.setAlive(true).then(function() {
					return oKeepAlive.callKeepAlive();
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("KeepAlive", function() {
			it("KeepAlive test: started", function() {
				return oKeepAlive.isAlive().then(function(bRet) {
					assert.ok(bRet === true, "Expected the keepalive service to run.");
					return oKeepAlive.callKeepAlive().then(function() {
						return oKeepAlive.isAlive().then(function(bRet) {
							assert.ok(bRet === true, "Expected the keepalive service to run.");
						});
					});
				});
			});
			it("KeepAlive test: started 2nd time but connection breaks", (function() {
				return oKeepAlive.isAlive().then(function(bRet) {
					assert.ok(bRet === true, "Expected the keepalive service to run.");
					return oSystem.setAlive(false).then(function() {
						return oKeepAlive.callKeepAlive().then(function() {
							return oKeepAlive.isAlive().then(function(bRet) {
								assert.ok(bRet === false, "Expected the keepalive service to be not running.");
							});
						});
					});
				});
			}));
		});
	});
});