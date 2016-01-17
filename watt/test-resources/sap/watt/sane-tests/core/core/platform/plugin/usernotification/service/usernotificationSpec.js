define(["STF"], function(STF) {
	"use strict";

	var suiteName = "usernotificationTest";
	var oUserNotification, sap, jQuery;
	describe("usernotification test", function() {
		var getService = STF.getServicePartial(suiteName);

		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/usernotification/config.json"
			}).then(function(webIdeWindowObj) {
				var mConsumer = {
					"name": "userNotificationConsumer",

					"requires": {
						"services": [
							"usernotification"
						]
					}
				};
				oUserNotification = getService("usernotification");
				sap = webIdeWindowObj.sap;
				jQuery = webIdeWindowObj.jQuery;
				return STF.register(suiteName, mConsumer);
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		describe("usernotification", function() {
			var runTest = function(done, sMethod, aArgs, fnOpened, mResult, fnClosed) {
				mResult = mResult || {
					sResult: "OK",
					bResult: true
				};
				fnClosed = fnClosed || function(test) {
					assert.deepEqual(test, mResult, "Closed with right result");
				};

				oUserNotification[sMethod].apply(null, aArgs).then(fnClosed).done();

				sap.ui.getCore().applyChanges();
				setTimeout(function() {
					fnOpened();
					done();
				}, 1000);
			};

			var testDialog = function(sType, sTitle, sMessage, sButton, bClick) {
				sMessage = sMessage || sTitle;
				sButton = sButton || "OK";
				assert.equal(jQuery("#MSG_" + sType).length, 1, sTitle + " is shown");
				assert.equal(jQuery("#MSG_" + sType + "-lbl").html(), sTitle, "Right title set");
				assert.equal(jQuery("#MSG_" + sType + "--msg").html(), sMessage, "Right content set");
				if (bClick || bClick === undefined) {
					jQuery("#MSG_" + sType + "--btn-" + sButton).click();
				}
			};

			it("alert", function(done) {
				runTest(done, "alert", ["Error"], function() {
					testDialog("ERROR", "Error");
				});
			});

			it("two queued alerts appearing after another", function(done) {
				var firstDefer = Q.defer();
				oUserNotification.alert("ERROR1").then(function() {
					setTimeout(function() {
						assert.equal(jQuery("#MSG_ERROR").length, 1, "ERROR2 is shown");
						jQuery("#MSG_ERROR--btn-OK").click();
						firstDefer.resolve();
					}, 1000);
				}).done();

				oUserNotification.alert("ERROR2").done();
				var secondDefer = Q.defer();
				setTimeout(function() {
					assert.equal(jQuery("#MSG_ERROR").length, 1, "ERROR1 is shown");
					jQuery("#MSG_ERROR--btn-OK").click();
					secondDefer.resolve();
				}, 1000);
				
				Q.all([firstDefer.promise, secondDefer.promise ]).then(function(){
					done();
				});
			});

			it("warning", function(done) {
				runTest(done, "warning", ["Warning"], function() {
					testDialog("WARNING", "Warning");
				});
			});

			it("info", function(done) {
				runTest(done, "info", ["Information"], function() {
					testDialog("INFO", "Information");
				});
			});

			it("confirm - cancelable - confirmed", function(done) {
				runTest(done, "confirm", ["Confirmation", true], function() {
					assert.equal(jQuery("#MSG_YESNOCANCEL--btn-CANCEL").length, 1, "Cancel Button available");
					testDialog("YESNOCANCEL", "Confirmation Needed", "Confirmation", "YES");
				}, {
					sResult: "YES",
					bResult: true
				});
			});

			it("confirm - cancelable - declined", function(done) {
				runTest(done, "confirm", ["Confirmation", true], function() {
					testDialog("YESNOCANCEL", "Confirmation Needed", "Confirmation", "NO");
				}, {
					sResult: "NO",
					bResult: false
				});
			});

			it("confirm - cancelable - canceled", function(done) {
				runTest(done, "confirm", ["Confirmation", true], function() {
					testDialog("YESNOCANCEL", "Confirmation Needed", "Confirmation", "CANCEL");
				}, {
					sResult: "CANCEL",
					bResult: false
				});
			});

			it("confirm - not cancelable - confirmed", function(done) {
				runTest(done, "confirm", ["Confirmation", false], function() {
					assert.equal(jQuery("*[id*=MSG_CONFIRM--btn]").length, 2, "Cancel Button not available");
					testDialog("CONFIRM", "Confirmation Needed", "Confirmation", "OK");
				}, {
					sResult: "YES",
					bResult: true
				});
			});

			it("info databinding characters", function(done) {
				runTest(done, "info", ["normal text {binding} or /binding"], function() {
					testDialog("INFO", "Information", "normal text {binding} or /binding");
				});
			});
		});
	});
});