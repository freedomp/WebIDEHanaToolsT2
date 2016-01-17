"use strict";
define(['STF'], function (STF) {

	var suiteName = "missingRequiredPlugins";

	describe('STF error handling', function () {

		it("should fail with a useful error message when using an invalid config", function (done) {
			STF.startWebIde(suiteName,
				{config: "examples/fails_with_message/config.json"}).fail(function (error) {
				try {
					expect(error.message).to.contain("missing required services");
					expect(error.message).to.contain("document");
					expect(error.message).to.contain("commandGroup");
				}
				catch (e) {
					// need to pass error message to done as otherwise the promise lib will swallow
					// the exceptions thrown from failed chai 'expect(...'
					done('one of the assertions above failed');
				}
				done();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
