define(["STF", "sap/watt/lib/q/q", "sap/watt/lib/lodash/lodash"], function (STF, Q, _) {
	"use strict";

	var host = window.location.host;
	var protocol = window.location.protocol;
	var BASE_ORION_URL = protocol + "//" + host + "/orion";

	var IGNORE_ERRORS = true;

	var DEFAULT_ORION_HEADERS = {
		"Orion-Version": "1.0"
	};

	/**
	 * Promise wrapper for xmlHttpRequest
	 *
	 * @param {string} verb
	 * @param {string} subUrl
	 * @param {number} expectedResCode
	 * @param {boolean} ignoreFailures - should the promise also resolve successfully even if the request failed?
	 * @param {Object<string,string>} [headers]
	 * @param {object} [requestData]
	 *
	 * @returns {promise}
	 */
	function performOrionHttpRequest(verb, subUrl, expectedResCode, ignoreFailures, headers, requestData) {
		var deferred = Q.defer();
		var http = new XMLHttpRequest();

		http.open(verb, BASE_ORION_URL + subUrl, true);
		_.forEach(headers, function (headerVal, headerKey) {
			http.setRequestHeader(headerKey, headerVal);
		});

		http.onreadystatechange = function () {
			if (http.readyState === 4) {
				if (ignoreFailures === true) {
					console.error(http.responseText);
					deferred.resolve();
				}
				else if (http.status === expectedResCode) {
					deferred.resolve();
				} else {
					console.error(http.responseText);
					deferred.reject(http.responseText);
				}
			}
		};

		if (verb === "POST" && !_.isUndefined(requestData)) {
			http.send(JSON.stringify(requestData));
		}
		else {
			http.send();
		}

		return deferred.promise;
	}

	var usedOrionUserNames = [];
	var validUserNamePattern = /^[0-9a-zA-Z]+$/;

	return {
		/**
		 * convenience method to start WebIDE with Orion configuration (username/password in the url)
		 * and create the user in orion via its REST api.
		 */
		startWebIdeWithOrion: function (suiteName, options, user, password, isAllowSameUser) {

			if (_.isUndefined(user)) {
				user = _.trunc(suiteName, {
					// max length for orion username is 20 characters
					length: 20,
					omission: ''
				});
			}

			if (!validUserNamePattern.test(user)) {
				throw Error("The username <" + user + "> for orion is not valid, a username must comply with the" +
					" following pattern: " + validUserNamePattern.toString());
			}

			if (!isAllowSameUser) {
				if (_.contains(usedOrionUserNames, user)) {
					throw Error("Same user name used in (different) multiple WebIde Tests with orion: <" + user + ">" +
						" note that if no user name was explicitly specified the first 20 characters of the suiteName will be used");
				}
			}

			if (!_.contains(usedOrionUserNames, user)) {
				usedOrionUserNames.push(user);
			}

			if (_.isUndefined(password)) {
				password = "password123";
			}

			var orionDefaultOptions = {
				config: "config-test-orion.json"
			};

			// user/pass in the url are only used locally by JavaLoader.js to login into orion
			// on HCP (watt on watt) it is not needed
			if (window.isRunningInLocalStaticWebServer()) {
				orionDefaultOptions.url_params = {
					username: user,
					password: password
				};
			}

			var optionsWithOrionDefaults = _.assign(orionDefaultOptions, options);


			if (window.isRunningInLocalStaticWebServer()) {
				// normally one would want to perform proper deletion of the user before each test
				// however as SAP's orion has modified user handling (no admin user / delete user rest api does not seem
				// to work) we are using a very 'naive' approach of trying to create to user anew each time.
				// if the user already exists it will silently fail and proceed to the next step (wont halt).
				// this means that rerunning the tests on the same orion server may have unexpected results
				// if the tests don't do proper cleanup...
				// in the grunt voters this is irrelevant as a new orion is unzipped each time...
				return this.createUser(user, password).then(function () {
					return STF.startWebIde(suiteName, optionsWithOrionDefaults);
				});
			}
			// no user creation needed when running on HCP
			else {
				return STF.startWebIde(suiteName, optionsWithOrionDefaults);
			}
		},

		createUser: function (user, password) {
			var requestData = {
				"UserName": user,
				"Password": password,
				"FullName": "New User"
			};

			var headers = _.merge(DEFAULT_ORION_HEADERS, {
				"Content-type": "application/json"
			});

			return performOrionHttpRequest("POST", "/users", 201, IGNORE_ERRORS, headers, requestData);
		}
	};
});