"use strict";

(function () {

	// hack for cleaning up memory leak in mocha.
	// these properties hold references to the callbacks of IT/Describe mocha
	// these callbacks have references via closures to enclosing scopes.
	// as long as those references exist those variables can not be GCed.
	var orgMochaRun = mocha.run;

	mocha.run = function(fn) {
		var runner = orgMochaRun(fn);

		// ------------ BEGIN code from karma PULL REQUEST https://github.com/mochajs/mocha/pull/2037
		// TODO: remove this Mocha hack once we can upgrade to a new version that includes the pull request.
		var isArray = typeof Array.isArray === 'function' ? Array.isArray : function(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		};

		/**
		 * Cleans up the reference to the test's deferred function.
		 * @see cleanSuiteReferences for details.
		 * @param {Test} test
		 */
		function cleanTestReferences(test) {
			delete test.fn;
		}

		/**
		 * Cleans up the references to all the deferred functions
		 * (before/after/beforeEach/afterEach) of a Suite.
		 * These must be deleted otherwise a memory leak can happen,
		 * as those functions may reference variables from closures,
		 * thus those variables can never be garbage collected as long
		 * as the deferred functions exist.
		 *
		 * @param {Suite} suite
		 */
		function cleanSuiteReferences(suite) {
			function cleanArrReferences(arr) {
				for (var i = 0; i < arr.length; i++) {
					delete arr[i].fn;
				}
			}

			if (isArray(suite._beforeAll)) {
				cleanArrReferences(suite._beforeAll);
			}

			if (isArray(suite._beforeEach)) {
				cleanArrReferences(suite._beforeEach);
			}

			if (isArray(suite._afterAll)) {
				cleanArrReferences(suite._afterAll);
			}

			if (isArray(suite._afterEach)) {
				cleanArrReferences(suite._afterEach);
			}
		}

		// references cleanup to avoid memory leaks
		runner.on('test end', cleanTestReferences);
		runner.on('suite end', cleanSuiteReferences);
	};

	// ----------- END code from mocha pull request

	// common setup for both karma/mocha html runner
	window.WEB_IDE_DEFERRED = {};
	window.WEB_IDE_PLUGIN_REG = {};

	var allTestFiles = [];
	var isInKarmaWebServer = window.isRunningInKarmaWebServer();
	var isInKarmaHtmlRunner = window.__karma__ && window.__karma__.files;
	var callBack;
	var timeout;
	var isKarmaTesting = isInKarmaWebServer && isInKarmaHtmlRunner;


	if (isKarmaTesting) {
		Object.keys(window.__karma__.files).forEach(function (file) {
			if (window.TEST_REGEXP.test(file)) {
				allTestFiles.push(file);
			}
		});

		callBack = window.__karma__.start;
		timeout = 30000;
	}
	else {
		mocha.setup('bdd');
		allTestFiles = window.allTestFiles;
		callBack = mocha.run;

		// crazy long timeout when not running in karma, it may not always be needed
		// for example another localhost web server which is not karma
		// but at least will provide this long timeout ALWAYS on HCP (WATT on WATT)
		timeout = 60000;
	}
	mocha.setup({
		timeout: timeout
	});
	window.expect = chai.expect;
	window.assert = chai.assert;

	//f you include Chai as Promised directly with a <script> tag, after the one for Chai itself,
	// then it will automatically plug in to Chai and be ready for use:

	var webappPath = window.webappPath();

	window.testPaths = merge_objects({
		'STF': webappPath + 'test-resources/sap/watt/sane-tests/saneTestFramework',
		'sane-tests': webappPath + 'test-resources/sap/watt/sane-tests'
	}, window.customPaths);

	if (isKarmaTesting) {
		var htmlRunnerExplicitTestFiles = window.allTestFiles.map(function (testFileRelativePath) {
			return webappPath + "test-resources/sap/watt/sane-tests/" + testFileRelativePath + ".js";
		});

        describe("Validate testsSetup.js", function () {

            it("Checks that all tests appear in testsSetup.js", function () {
                var originalTruncateThreshold = chai.config.truncateThreshold;
                chai.config.truncateThreshold = 0; // This is to make sure that the assertion below prints out the actual differences
                assert.sameMembers(htmlRunnerExplicitTestFiles, allTestFiles, 'not all Spec files have been explicitly included in the testsSetup.js');
                chai.config.truncateThreshold = originalTruncateThreshold;
                assert.equal(htmlRunnerExplicitTestFiles.length, allTestFiles.length, 'expected same number of explicitly and implicitly(regExp) Spec files in testSetup.js');
            });
        });
	}

	// this configuration is loaded first as it may also be required for the BEFORE_TESTS hook.
	require.config({
		// Karma serves files under /base, which is the basePath from your config file
		baseUrl: webappPath + 'resources',

		paths: window.testPaths,

		waitSeconds: 15
	});

	function start() {
		require.config({
			// dynamically load all test files
			deps: allTestFiles,

			// we have to kickoff mocha, as it is asynchronous
			callback: callBack
		});
	}

	if (window.BEFORE_TESTS) {
		// wait for before-tests-hook to finish
		window.BEFORE_TESTS().then(function () {
			start();
		});
	} else {
		start();
	}

})();

