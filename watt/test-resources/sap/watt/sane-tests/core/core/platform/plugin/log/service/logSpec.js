define(["STF"], function(STF) {
	"use strict";

	var suiteName = "logTest";
	var oLogService;
	describe("Log test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/log/config.json"
			}).then(function() {
				oLogService = getService("log");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("Log", function() {
			it("Test Add log messages", function() {
				var oPromise = oLogService.setLogSize("log", 6).then(function() {
					return oLogService.info("myInfoTag", "1 info message").then(function() {
						return oLogService.info("myInfoTag", "2 info message").then(function() {
							return oLogService.info("myInfoTag", "3 info message").then(function() {
								return oLogService.warn("myWarnTag", "1 warn message").then(function() {
									return oLogService.error("myErrorTag", "1 error message").then(function() {
										return oLogService.debug("myDebugTag", "1 debug message");
									});
								});
							});
						});
					});
				});

				oPromise.then(function() {
					oLogService.getLog("log").then(function(aLog) {

						// Remove timestamps to be able to compare
						for (var i = 0; i < aLog.length; i++) {
							delete(aLog[i].timestamp)
						}

						var aExpectedLog = [{
							"tag": "myInfoTag",
							"message": "1 info message",
							"level": "info"
						}, {
							"tag": "myInfoTag",
							"message": "2 info message",
							"level": "info"
						}, {
							"tag": "myInfoTag",
							"message": "3 info message",
							"level": "info"
						}, {
							"tag": "myWarnTag",
							"message": "1 warn message",
							"level": "warn"
						}, {
							"tag": "myErrorTag",
							"message": "1 error message",
							"level": "error"
						}, {
							"tag": "myDebugTag",
							"message": "1 debug message",
							"level": "debug"
						}];
						assert.equals(JSON.stringify(aLog), JSON.stringify(aExpectedLog));
					}).catch(function(error) {
						ok(false, error.stack);
					}).done();
				});

			});
		});
	});
});