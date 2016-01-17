define(["STF"], function(STF) {
	"use strict";

	var suiteName = "progressTest";
	var iFrameWindow = null;
	var oProgress;
	var oProgressServiceImpl;

	describe("Progress Service test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/progress/config.json"
			}).then(function(webIdeWindowObj) {
				var mConsumer = {
					"name": "testProgress",
					"requires": {
						"services": [
							"progress"
						]
					}
				};
				iFrameWindow = webIdeWindowObj;
				oProgress = getService("progress");
				return STF.getServicePrivateImpl(oProgress).then(function(oProgressServiceImplResult) {
					oProgressServiceImpl = oProgressServiceImplResult;
				}).then(function() {
					return STF.register(suiteName, mConsumer);
				});
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("progressService", function() {
			var PROGRESS_BAR_ID = "ideProgressBar";

			it("start & stop one task in progress", function() {
				return oProgress.startTask("processName1", "process1 description").then(function(iGeneratedId) {
					assert.ok(oProgressServiceImpl.runningTasks.length === 1);
					assert.ok(iFrameWindow.$("#" + PROGRESS_BAR_ID).hasClass("animate"));
					return oProgress.stopTask(iGeneratedId).then(function() {
						assert.ok(oProgressServiceImpl.runningTasks.length === 0);
						assert.ok(!iFrameWindow.$("#" + PROGRESS_BAR_ID).hasClass("animate"));
					});
				});
			});

			it("start & stop two tasks in progress", function() {
				var promises = [];
				promises.push(oProgress.startTask("processName1", "process1 description"));
				promises.push(oProgress.startTask("processName2", "process2 description"));
				return Q.allSettled(promises).spread(function(promise1Response, promise2Response) {
					var iGeneratedId1 = promise1Response.value;
					var iGeneratedId2 = promise2Response.value;
					assert.ok(oProgressServiceImpl.runningTasks.length === 2);
					assert.ok(iFrameWindow.$("#" + PROGRESS_BAR_ID).hasClass("animate"));
					return oProgress.stopTask(iGeneratedId1).then(function() {
						assert.ok(oProgressServiceImpl.runningTasks.length === 1);
						assert.ok(iFrameWindow.$("#" + PROGRESS_BAR_ID).hasClass("animate"));
						oProgress.stopTask(iGeneratedId2).then(function() {
							assert.ok(oProgressServiceImpl.runningTasks.length === 0);
							assert.ok(!iFrameWindow.$("#" + PROGRESS_BAR_ID).hasClass("animate"));
						});
					});
				});
			});
		});
	});
});