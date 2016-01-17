define(["sap/watt/platform/plugin/tipsandtricks/command/OpenTipsAndTricks"], function(OpenTipsAndTricks) {
	describe("The OpenTipsAndTricks command", function() {

		it("is always enabled", function() {
			expect(OpenTipsAndTricks.isEnabled()).to.be.true;
		});

		it("is available if there are tips", function() {
			var thizz = {
				context: {
					service: {
						tipsandtricks: {
							getValidConfiguredTipsArray: function() {
								return Q([{},{},{}]);
							}
						}
					}
				}
			};

			return OpenTipsAndTricks.isAvailable.call(thizz).then(function(bAvailable) {
				expect(bAvailable).to.be.true;
			});
		});

		it("is not available if there are no tips", function() {
			var thizz = {
				context: {
					service: {
						tipsandtricks: {
							getValidConfiguredTipsArray: function() {
								return Q([]);
							}
						}
					}
				}
			};

			return OpenTipsAndTricks.isAvailable.call(thizz).then(function(bAvailable) {
				expect(bAvailable).to.be.false;
			});
		});

		it("calls openTipsAndTricksDialog when executed", function() {
			var openWasCalled = false;
			var thizz = {
				context: {
					service: {
						tipsandtricks: {
							openTipsAndTricksDialog: function() {
								openWasCalled = true;
							}
						}
					}
				}
			};

			OpenTipsAndTricks.execute.call(thizz);

			expect(openWasCalled).to.be.true;
		});
	});
});