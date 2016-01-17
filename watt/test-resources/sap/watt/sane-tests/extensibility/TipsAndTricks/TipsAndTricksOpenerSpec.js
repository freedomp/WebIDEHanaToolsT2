/**
 * Created by i300494 on 1/5/16.
 */
define(["sap/watt/saptoolsets/fiori/common/plugin/tipsandtricksopener/service/TipsAndTricksOpener"], function(TipsAndTricksOpener) {
	describe("The tips and tricks opener", function() {
		describe("defines the onWelcomePerspectiveNotVisibleOnStartup event handler", function() {
			it("opens the tips and tricks dialog if getShowOnStartup returns true", function() {
				var openDialogWasCalled = false;
				var thizz = {
					context: {
						service: {
							tipsandtricks: {
								openTipsAndTricksDialog: function() {
									openDialogWasCalled = true;
								},
								getShowOnStartup: function() {
									return Q(true);
								}
							}
						}
					}
				};

				return TipsAndTricksOpener.onWelcomePerspectiveNotVisibleOnStartup.call(thizz).then(function() {
					expect(openDialogWasCalled).to.be.true;
				});
			});

			it("does not open the tips and tricks dialog if getShowOnStartup returns false", function() {
				var openDialogWasCalled = false;
				var thizz = {
					context: {
						service: {
							tipsandtricks: {
								openTipsAndTricksDialog: function() {
									openDialogWasCalled = true;
								},
								getShowOnStartup: function() {
									return Q(false);
								}
							}
						}
					}
				};

				return TipsAndTricksOpener.onWelcomePerspectiveNotVisibleOnStartup.call(thizz).then(function() {
					expect(openDialogWasCalled).to.be.false;
				});
			});

		});
	});
});