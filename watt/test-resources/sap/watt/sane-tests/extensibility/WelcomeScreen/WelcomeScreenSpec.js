define(['STF', "sap/watt/ideplatform/plugin/welcomescreen/service/WelcomeScreen"],
	function (STF, WelcomeScreen) {
		"use strict";

		var suiteName = "WelcomeScreen_Service";
		var iFrameWindow = null;

		describe('Welcome Screen - service tests', function () {
			before(function (done) {
				STF.startWebIde(suiteName).then(function (_iFrameWindow) {
					iFrameWindow = _iFrameWindow;
					done();
				});
			});

			it('Tests getContent method', function() {

				var oWelcomeScreenService = STF.getService(suiteName, "WelcomeScreen");

				return oWelcomeScreenService.getContent().then(function(oView) {
					expect(oView.sId).to.equal("welcomeView");
					expect(oView.sViewName).to.equal("sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent");
				});
			});

			it("Tests getBasicContainer method", function() {
				var oWelcomeScreenService = STF.getService(suiteName, "WelcomeScreen");

				return oWelcomeScreenService.getBasicContainer("someID").then(function(oContainer) {
					expect(oContainer.getId()).to.equal("someID");
				});
			});

			//TODO what does this test check?!!!
			it("Test when perspective is changed to welcome screen", function() {
				var oPerspectiveService = STF.getService(suiteName, "perspective");
				return oPerspectiveService.context.event.firePerspectiveChanged({from: "development", to: "welcome"});
			});

			//TODO what does this test check?!!!
			it("Tests when perspective is changed from welcome screen", function() {
				var oPerspectiveService = STF.getService(suiteName, "perspective");
				return oPerspectiveService.context.event.firePerspectiveChanged({from: "welcome", to: "development"});
			});

			after(function () {
				STF.shutdownWebIde(suiteName);
			});
		});

		describe('Welcome Screen - unit tests', function () {
			it("Compare major and minor version", function () {
				var ws = new WelcomeScreen();
				var res = ws._compareMajorMinorVersions("1.2.3", "3.2.1"); // Diff in major
				expect(res).to.be.true;
				res = ws._compareMajorMinorVersions("1.3.3", "1.2.5"); // Diff in minor
				expect(res).to.be.true;
				res = ws._compareMajorMinorVersions("1.2.3", "1.2.3"); // Equal
				expect(res).to.be.false;
				res = ws._compareMajorMinorVersions("1.2.3", "1.2.5"); // Diff in build
				expect(res).to.be.false;
			});
		});
	});
