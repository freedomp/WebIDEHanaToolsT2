define("STF", ["sane-tests/ui5Version", "sap/watt/lib/q/q", "sap/watt/lib/lodash/lodash"], function (ui5Version, Q, _) {
	"use strict";

	var mergeCoverageOccurrences = _.partialRight(_.merge, function (objBVal, srcBVal) {
		// times entered
		if (_.isNumber(objBVal)) {
			return objBVal + srcBVal; // aggregate
		}
		else {
			throw new Error("expecting number in coverage occurrences");
		}
	});

	function mergeSingleFileCoverageInfo(obj, src) {

		_.merge(obj.b, src.b, function (objBVal, srcBVal) {
			// branches arrs
			if (_.isArray(objBVal)) {
				return _.map(objBVal, function (objBranchesInt, key) {
					return objBranchesInt + srcBVal[key];
				});
			}
			else {
				throw new Error("expecting array");
			}
		});

		mergeCoverageOccurrences(obj.f, src.f);
		mergeCoverageOccurrences(obj.s, src.s);

		return obj;
	}

	function mergeIstanbulCoverageData(obj, src) {
		_.assign(obj, src, function (objectValue, sourceValue) {

			// data only exists on source
			if (_.isUndefined(objectValue)) {
				return sourceValue;
			}
			// no new data from source
			else if (_.isUndefined(sourceValue)) {
				return objectValue;
			}
			// need to merge
			else {
				return mergeSingleFileCoverageInfo(objectValue, sourceValue);
			}
		});
	}

	var usedSuiteNames = {};
	var runTimeChecksFilters = {};
	var CUSTOM_RUNTIME_CHECKS_ISSUES = [];
	var isRunning = false;
	var lastSuiteName;
	return {
		/**
		 * @param suiteName {string} - name of the testSuite, must be unique
		 *
		 * @param [options] {{config: number,
		 *                  html: string,
		 *                  ui5_root : string,
		 *                  ui5_debug : boolean }} -
		 *
		 * The optional options (pun intended) object may have the following fields:
		 *
		 * [config='sane-tests/config-test.json'] {string} -
		 *                     relative path of the webide config to run in the iframe.
		 *                     this is relative to the "sane-tests" folder for example:
		 *                     examples/welcomescreen/config.json"
		 *                     This is an OPTIONAL param,
		 *                     by default 'sane-tests/config-test.json' will be used.
		 *
		 * WebIDE embedded plugin [env='../../../../env.json'] {string}
		 * WebIDE external plugin [env='../../../../../local_dev/env.json'] {string} -
		 *                     relative path to the env.json file for the WebIDE.
		 *                     note that this path is relative to "resources/sap/watt/uitools/"
		 *                     and not to the location of the html due to the voodoo used in the webIDE's core :)
		 *
		 * [html='web_ide_runner.html'] {string} -
		 *                     relative path of the html to run in the iframe.
		 *                     this is relative to the "sane-tests" folder:
		 *                     examples/welcomescreen/welcomescreen.qunit.html"
		 *                     this html will act as a "constructor" for the webide
		 *                     This is an OPTIONAL param,
		 *                     by default 'sane-tests/web_ide_runner.html' will be used.
		 *
		 * [ui5_root='default as defined in ui5Version.js'] {string} -
		 *                     path to load ui5 from in this 'instance' of the webIDE.
		 *
		 * [ui5_debug=false] {boolean} -
		 *                     Flag to enable/disable the use of 'sap-ui-debug=true' flag in the WebIde's url.
		 *                     by default this is false.
		 *
		 * [runtime_checks=false] {boolean} -
		 *                     Flag to enable/disable the use of Runtime Type Checks, If these checks detect
		 *                     a problem, the Test suite will fail!
		 *
		 * [runtime_checks_filter=/(?:)/] {RegExp} -
		 *                     A file name pattern to filter runtime checks issues which will cause the tests to fail.
		 *                     For example: /resources\/sap\/watt\/ideplatform\/plugin\/welcomescreen\.+/
		 *                     Will only take into account runtime errors originating in files under
		 *                     ...\plugin\welcomescreen\*
		 *
		 * [url_params={}] {Object.<string, number>} -
		 *                     An Object for additional url params, for example:
		 *                     {
		 *                     	 user:"myusername",
		 *                       password:"mypassword123"
		 *                     }
		 *
		 *
		 *
		 * @return {Promise<Window>} For the window in which the WebIde is running.
		 *                           This will be resolved when the WebIde core has finished loading (all_plugins_started)
		 */
		startWebIde: function (suiteName, options) {
			if (isRunning) {
				throw Error("WebIde already running, may not not in parallel, did you forget to call shutdownWebIde?");
			}
			isRunning = true;
			lastSuiteName = suiteName;

			if (_.has(usedSuiteNames, suiteName)) {
				throw new Error("Duplicate suite name: -->" + suiteName + "<--");
			}
			usedSuiteNames[suiteName] = true;


			// default options
			if (_.isUndefined(options)) {
				options = {};
			}

			if (_.isUndefined(options.config)) {
				options.config = "config-test.json";
			}

			if (_.isUndefined(options.env)) {
				if (window.isExternalPlugin) {
					options.env = "../../../../../local_dev/env.json";
				} else {
					options.env = "../../../../env.json";
				}
			}

			if (_.isUndefined(options.ui5_root)) {
				options.ui5_root = ui5Version.baseURL + ui5Version.version + '/resources/';
			}

			if (_.isUndefined(options.html)) {
				options.html = "web_ide_runner.html";
			}

			if (_.isUndefined(options.ui5_debug)) {
				options.ui5_debug = false;
			}

			if (_.isUndefined(options.runtime_checks)) {
				if (window.STF_RUNTIME_CHECKS) {
					options.runtime_checks = window.STF_RUNTIME_CHECKS;
				}
				else {
					options.runtime_checks = false;
				}
			}

			if (_.isUndefined(options.runtime_checks_filter)) {
				if (window.STF_RUNTIME_CHECKS_FILTER) {
					runTimeChecksFilters[suiteName] = window.STF_RUNTIME_CHECKS_FILTER;
				}
				else {
					runTimeChecksFilters[suiteName] = /(?:)/;
				}
			}
			else {
				runTimeChecksFilters[suiteName] = options.runtime_checks_filter;
			}

			if (_.isUndefined(options.url_params)) {
				options.url_params = {};
			}

			// url building for the web-ide iframe
			var url = this.getSaneTestsRoot() + options.html;

			if (_.endsWith(url, ".html")) {
				url += "?sap-ide-iframe";
			} else {
				url += "&sap-ide-iframe";
			}

			url += "&sap-ide-debug";

			if (options.ui5_debug) {
				url += "&sap-ui-debug=true";
			}

			if (options.runtime_checks) {
				url += "&enable-runtime-checks";
			}

			if (window.isRunningInLocalStaticWebServer()) {
				url += "&sap-ide-static-ws";
			}

			url += "&config_path=" + encodeURIComponent(this.getSaneTestsRoot() + options.config);
			url += "&env-json-path=" + encodeURIComponent(options.env);
			url += "&static-ws-ui5-root=" + encodeURIComponent(options.ui5_root);

			// TODO: should the key also be encoded?
			url = _.reduce(options.url_params, function (currUrl, value, key) {
				return currUrl + "&" + key + "=" + encodeURIComponent(value);
			}, url);

			// can't use ->window.location.origin<- because it is not supported on all browsers
			var host = window.location.host;
			var protocol = window.location.protocol;
			url = protocol + "//" + host + url;

			var serviceRegistryDeferred = Q.defer();
			window.WEB_IDE_DEFERRED[suiteName] = serviceRegistryDeferred;
			var iframe = document.createElement("iframe");
			iframe.src = url;
			iframe.name = "frame";
			iframe.id = suiteName;
			iframe.height = "900px";
			iframe.width = "100%";
			document.body.appendChild(iframe);
			// inject custom array to save the runtime type issues to.
			// TODO: potential for race condition? has RunTimeCheck.js been loaded before in the iframe
			//       before the following line has executed ?
			CUSTOM_RUNTIME_CHECKS_ISSUES = [];
			// collect both type of issues into the same array.
			iframe.contentWindow.CUSTOM_RUNTIME_CHECKS_CALLER_ISSUES = CUSTOM_RUNTIME_CHECKS_ISSUES;
			iframe.contentWindow.CUSTOM_RUNTIME_CHECKS_RETURN_TYPE_ISSUES = CUSTOM_RUNTIME_CHECKS_ISSUES;

			return serviceRegistryDeferred.promise.then(function (PluginRegistry) {
				window.WEB_IDE_PLUGIN_REG[suiteName] = PluginRegistry;
				iframe.contentWindow.require.config({
					paths: window.testPaths
				});

				return iframe.contentWindow;
			});
		},

		shutdownWebIde: function (suiteName) {
			if (suiteName !== lastSuiteName) {
				throw Error("trying to shutdown suite: <" + suiteName + "> but previous suite: <"
					+ lastSuiteName + "> is still running");
			}

			window.WEB_IDE_DEFERRED[suiteName] = "done";
			window.WEB_IDE_PLUGIN_REG[suiteName] = "done";
			var testIFrame = document.getElementById(suiteName);

			var hasRootWindowCoverage = !_.isUndefined(window.__coverage__);
			var hasIframeCoverage = !_.isUndefined(testIFrame.contentWindow.__coverage__);

			if (hasRootWindowCoverage && hasIframeCoverage) {
				var coverageDataFromIFrame = testIFrame.contentWindow.__coverage__;
				mergeIstanbulCoverageData(window.__coverage__, coverageDataFromIFrame);
			}
			else if (!hasRootWindowCoverage && hasIframeCoverage) {
				window.__coverage__ = testIFrame.contentWindow.__coverage__;
			}

			try {
				var fileNameFilter = runTimeChecksFilters[suiteName];
				var runtimeChecksToFailOn = _.filter(CUSTOM_RUNTIME_CHECKS_ISSUES, function (currErr) {
					return fileNameFilter.test(_.first(currErr.stack));
				});
				// Filter excluded methods
				var aSTFRuntimeChecksExMethods = window.STF_RUNTIME_CHECKS_EXCULDE_METHOD;
				if (!_.isUndefined(aSTFRuntimeChecksExMethods)) {
					runtimeChecksToFailOn = _.reject(runtimeChecksToFailOn, function (oCheck) {
						return _.includes(aSTFRuntimeChecksExMethods, oCheck.method);
					});
				}
				if (!_.isEmpty(runtimeChecksToFailOn)) {
					throw Error("Runtime Type Errors found! " + JSON.stringify(runtimeChecksToFailOn, null, "\t"));
				}
			}
			finally {
				testIFrame.parentNode.removeChild(testIFrame);
				delete usedSuiteNames[suiteName];
				isRunning = false;
				// avoids duplicate errors in different service tests.
				CUSTOM_RUNTIME_CHECKS_ISSUES.length = 0;
			}
		},

		/**
		 * Register a single plugin. Usually a consumer plugin that is meant for mock or configuration of a service.
		 * This function can be called only after WebIDE is started.
		 *
		 * @param {string} suiteName
		 * @param {object} plugin the plugin. Note that paths of service, interface are read using requirejs
		 *            so one can use paths configured in test setup.
		 * @return {*|{status, appUrl}|{status, message}|Array.<Plugin>}
		 */
		register: function (suiteName, plugin) {
			return window.WEB_IDE_PLUGIN_REG[suiteName].register([plugin]);
		},

		getServiceRegistry: function (suiteName) {
			return window.WEB_IDE_PLUGIN_REG[suiteName].$getServiceRegistry();

		},

		getService: function (suiteName, serviceName) {
			return window.WEB_IDE_PLUGIN_REG[suiteName].$getServiceRegistry().get(serviceName);
		},

		/**
		 * Utility to get a partial <getService> function with a bound suiteName argument.
		 * This can be used to reduce verbosity and mistakes due to copy paste.
		 *
		 * @param {string} suiteName
		 * @return {function(this:STF)}
		 */
		getServicePartial: function (suiteName) {
			return this.getService.bind(this, suiteName);
		},

		/**
		 *
		 * @param {string} suiteName - unique suiteName.
		 * @param {Array<string>} depPaths - a list of dependency paths to load.
		 *
		 * @return {Q.Promise<Module>} - a Promise for the require.js module defined in depPaths.
		 */
		require: function (suiteName, depPaths) {
			var iframe = document.getElementById(suiteName);
			var iframeWindow = iframe.contentWindow;
			var deferred = Q.defer();

			iframeWindow.require(depPaths, function () {
				deferred.resolve(Array.prototype.slice.call(arguments));
			});
			return deferred.promise;
		},

		getServicePrivateImpl: function (oService) {
			return oService._getImpl()
				.then(function (oNonLazyProxy) {
					return oNonLazyProxy._getImpl().then(function (_impl) {
						return _impl;
					});
				});
		},

		/**
		 * Returns the absolute path of sane test framework root
		 *
		 * @return {string}
		 */
		getSaneTestsRoot: function () {
			return window.webappPath() + "test-resources/sap/watt/sane-tests/";
		}


	};

});