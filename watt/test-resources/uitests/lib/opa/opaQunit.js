/*!
 * @copyright@#
 */
/*global opaTest:true, start, ok, asyncTest, QUnit */
/**
 * Qunit test adapter for opa.js has the same signature as an asyncTest of qunit
 * @public
 * @returns {asncTest} the async qunit test wrapped by opa
 * @experimental
 */
/////////////////////
//// OPA - One Page Acceptance testing the qUnit adapter
//// Currently this is distributed with UI5 but it does not have dependencies to it.
//// The only dependency is jQuery. As i plan to get this into a separate repository, i did not use the UI5 naming conventions
/////////////////////
opaTest = function (testName, expected, callback, async) {
	var config = sap.ui.test.Opa.config;
	//Increase qunits timeout to 90 seconds to match default OPA timeouts
	if (!QUnit.config.testTimeout) {
		QUnit.config.testTimeout  = 90000;
	}

	if (arguments.length === 2) {
		callback = expected;
		expected = null;
	}

	var testBody = function() {
		config.testName = testName;
		callback.call(this, config.arrangements, config.actions, config.assertions);

		var promise = sap.ui.test.Opa.emptyQueue();
		promise.done(function() {
			start();
		});

		promise.fail(function (oOptions) {
			var sMessage = (oOptions.errorMessage || " failed to wait for the check in the test: " + testName);
			if (oOptions._stack) {
				sMessage += "\n" + oOptions._stack;
				jQuery.sap.log.error(sMessage);
			}
			ok(false, sMessage);
			start();
		});
	};

	return asyncTest(testName, expected, testBody, async);
};
window.opaTest = opaTest;
