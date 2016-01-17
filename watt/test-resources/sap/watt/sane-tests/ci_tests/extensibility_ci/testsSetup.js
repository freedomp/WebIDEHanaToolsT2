window.TEST_REGEXP = /sane-tests\/ci_tests\/extensibility_ci\/.*Spec\.js$/i;
window.allTestFiles = [
	'ci_tests/extensibility_ci/example/exampleSpec',
	'ci_tests/extensibility_ci/CreateExtensionProjectSpec',
	'ci_tests/extensibility_ci/ABAPDeploymentSpec'
];

window.customPaths = {
	'ci_tests': window.webappPath() + 'test-resources/sap/watt/sane-tests/ci_tests',
	'util': window.webappPath() + 'test-resources/sap/watt/sane-tests/util',
	'sinon': window.webappPath() + 'test-resources/sap/watt/sane-tests/libs/sinon-1.15.0',
	'ci_tests': window.webappPath() + 'test-resources/sap/watt/sane-tests/ci_tests'
};


/**
 * pre-tests hook for the core CI job, needed to extract the list of service names
 * BEFORE Mocha starts as:
 *
 * 1. dynamic test is created for each service.
 * 2. starting the WebIDe and getting the serviceNames is an async process
 * 3. In Mocha tests are only created in a synchronized manner.
 *
 */
// TODO: this should be moved to CORE team's separate CI job when (and if) it will be created.
window.BEFORE_TESTS = function () {
	var requirePromise = Q.defer();

	var suiteName = "serviceNamesFinder";
	require(["STF", "util/orionUtils"], function (STF, OrionUtils) {

		OrionUtils.startWebIdeWithOrion(suiteName).then(function () {
			var serviceNames = Object.keys(STF.getServiceRegistry(suiteName)._mRegistry);

			// just because all the plugins started does not mean we can immediately shutdown the webide.
			// I'm not aware of any mechanism that can let us know when it safe to shutdown.
			setTimeout(function () {
				STF.shutdownWebIde(suiteName);
				window.CI_TESTS_ALL_SERVICE_NAMES = serviceNames;
				requirePromise.resolve();
			}, 2000);
		});
	});
	return requirePromise.promise;
};