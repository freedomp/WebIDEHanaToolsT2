define(["STF"], function(STF) {
	"use strict";

	var oLayoutService;
	var oSystemService;
	var suiteName = "layout_test";
	var oMockServer = null;
	var iFrameWindow = null;

	describe("Layout test", function() {
		var getService = STF.getServicePartial(suiteName);
		before(function() {
			return STF.startWebIde(suiteName, {
				config: "core/core/platform/plugin/layout/config.json"
			}).
			then(function(webIdeWindowObj) {
				var mConsumer = {
					"name": "layout",

					"requires": {
						"services": ["layout", "system"]
					},

					"configures": {
						"services": {
							"layout:failure": "failure",
							"layout:content": "content",
							"layout:loading": "loading"
						}
					}

				};

				iFrameWindow = webIdeWindowObj;

				// prepare mock server
				iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
				oMockServer = new iFrameWindow.sap.ui.app.MockServer({
					rootUri: "",
					requests: [{
						method: "POST",
						path: new iFrameWindow.RegExp(".*/login.*"),
						response: function(oXhr) {
							oXhr.respond(500, {
								"Content-Type": "text/html;charset=utf-8"
							}, "true");
						}
					}]
				});
				oMockServer.start();
				return STF.register(suiteName, mConsumer);
			});
		});

		it('Should load failure page after login connection failure', function() {
			oLayoutService = getService("layout");
			oSystemService = getService("system");

			oSystemService.context.i18n = {
				getText: function(sI18, sText) {
					return sText;
				}
			};

			function attachFailureEventHandler() {
				var eventHandler = function(event) {
					++eventHandler.numberOfTimesCalled;

					expect(event.name).to.equal("failure");
				};
				eventHandler.numberOfTimesCalled = 0;
				oSystemService.attachEvent("failure", eventHandler);

				return eventHandler;
			}

			var that = this;
			this.eventHandler = attachFailureEventHandler();
			expect(iFrameWindow.$("#failure").css("display")).to.equal("none");

			// The mock server will respond with internal error 500 to the logon request
			return oSystemService.login("nouser", "nopassword").then(function() {
				return oLayoutService.getLayoutTypes().then(function(oLayoutTypes) {
					expect(that.eventHandler.numberOfTimesCalled).to.equal(1);
					return oLayoutService.show(oLayoutTypes.FAILURE, iFrameWindow).then(function() {
						iFrameWindow.sap.ui.getCore().applyChanges();
						// Check that the failure page is displayed
						expect(iFrameWindow.$("#failure").css("display")).to.equal("block");
					});

				});
			});
		});

		after(function() {
			oMockServer.stop();
			oMockServer.destroy();
			STF.shutdownWebIde(suiteName);
		});
	});

});