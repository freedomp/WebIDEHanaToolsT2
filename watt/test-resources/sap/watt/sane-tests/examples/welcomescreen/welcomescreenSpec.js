//  The SaneTestFramework should be imported via 'STF' path.
define(['STF'], function (STF) {
	"use strict";

	//  every suite must have a uniqueName. using a none unique name will cause an error.
	var suiteName = "Integration_UI_example";
	var getService = STF.getServicePartial(suiteName);
	var suiteWindowObj;
	var Validations;


	// disabled as this seem to randomly fail once in a great while. could be related
	// to STF.require used in the before. (the failure is in timeout for the before)
	describe.skip('Integration Test with UI Example and default html+config', function () {

		before(function () {
			return STF.startWebIde(suiteName).then(function (webIdeWindowObj) {
				suiteWindowObj = webIdeWindowObj;
				//sometimes you need to load require.js modules from the context running the webIde.
				//this little wrapper may be of assistance...
				return STF.require(suiteName, ["sap/watt/core/Validations"]).spread(function (validationsModule) {
					Validations = validationsModule;
				});
			});
		});

		it('some async test with Chai-As-Promised', function (done) { // must have 'done' param to wait for the test to finish
			//  STF.getService will return the Service's Proxy
			var welcomeScreenProxy = getService("WelcomeScreen");
			var contentPromise = welcomeScreenProxy.getContent();

			expect(contentPromise).to.eventually.have.property("bAllowTextSelection");

			expect(contentPromise).to.eventually.
				have.property("sViewName", "sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent").
				and.notify(done); // must notify on the last promise checked to let mocha know we have finished
		});

		it('some async test with mocha basic promise support', function () { // no done param!
			//  STF.getService will return the Service's Proxy
			var welcomeScreenProxy = getService("WelcomeScreen");

			// note the return, mocha will wait for the returned promise chain to resolve
			return welcomeScreenProxy.getContent().then(function (content) {
				expect(content).to.have.property("bAllowTextSelection");
				expect(content).to.have.property("sViewName", "sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent");
			});
		});

		it('can access the SAP object in the window running WEBIDE', function () {
			//noinspection BadExpressionStatementJS
			expect(suiteWindowObj.sap).to.exist;
			//noinspection BadExpressionStatementJS
			expect(suiteWindowObj.sap.watt).to.exist;
		});

		it('can invoke methods on require.js modules loaded in the window running the WEBIDE', function () {
			it('works for app', function () {
				var oInput = {
					"requires": {
						"services": [
							"command",
							"shnitzel"
						]
					},

					"configures": {
						"services": {
							"command:commands": []
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				expect(aIssues.length).to.equal(0);
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
