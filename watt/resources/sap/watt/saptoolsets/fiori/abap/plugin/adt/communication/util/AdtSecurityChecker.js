/**
 * RequireJS module with API:
 * <ul>
 * <li>AdtSecurityChecker<br>
 * The library provides input validation methods for the
 * <code>AdtRestResource</code>. These methods cannot ensure security, but they
 * can help the consumers of the <code>AdtRestResource</code> to recognize
 * security-relevant issues in their parameters (e.g. in the settings object).
 * Security can only be ensured on the server side, because it is always
 * possible that the client is modified (e.g. DOM modifications including
 * modifications of javascript modules ...).</li>
 * <li>Check methods:
 * <ul>
 * <li><code>check(method, securitySettings)</code></li>
 * <li><code>checkAndRefuseCSRFTokenHeader(method, ajaxSettings)</code></li>
 * <li>
 * <code>checkAndCorrectCsrfTokenHeader(originalCsrfTokenHeader, ajaxSettings)</code></li>
 * </ul></li>
 * <li>Configuration of the checks performed by method <code>check</code><br>
 * There are mandatory checks and optional checks. The consumers can configure
 * the optional checks. The mandatory checks run in check mode “strict”, i.e. in
 * case of an security issue they throw an error. The optional checks can be
 * configured by the <code>securitySettings</code> object: it contains the
 * checks to be executed and the execution mode “strict” or “info”. In execution
 * mode “info” a warning is written to the console and the flow continues.</li>
 * </ul>
 * Mandatory security checks:
 * <ul>
 * <li>"checkInvalidCharacters"<br>
 * Not printable characters must not be contained in the request headers in the
 * settings object.</li>
 * <li>"checkUsernamePassword"<br>
 * Username and password must be neither contained in the URL nor in the
 * settings object. This also includes the query parameters “sap-user” and
 * “sap-password”.</li>
 * </ul>
 * Optional security checks:
 * <ul>
 * <li>"checkAsyncFalse"<br>
 * The settings object must not contain the setting for a synchronous request.</li>
 * <li>"checkProtocolHTTPS"<br>
 * The protocol must be HTTPS.</li>
 * </ul>
 * Example for security settings:
 * {checkAsyncFalse: "strict", checkProtocolHTTPS: "info"}}
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
	["../util/AdtCheckUtil", "../util/AdtFreezerUtil" ],
	function (AdtCheckUtil, AdtFreezerFactory) {

		return (function () { // this immediate function is not accessible by the environment, e.g. by require.js, only the returned object is accessible and needs to be froozen

			"use strict";

			// The freezers make the objects, functions and prototypes immutable, which are accessible by the callers:
			// - defaultFreezer: for objects (especially cache contents) and functions
			// - prototypeFreezer: for prototypes, freezes the prototype and its properties and functions
			var defaultFreezer = AdtFreezerFactory.createFreezer({freezeDeeply: true, freezeInheritedProperties: true, freezeFunctions: true});
			var prototypeFreezer = AdtFreezerFactory.createPrototypeFreezer({freezeDeeply: true, freezeInheritedProperties: true, freezeFunctions: true});

			var logger = (function () {

				// typeof missing reference === typeof existing reference with value undefined === "undefined"
				if (typeof window !== "undefined" && typeof window.console !== "undefined" && typeof window.console.warn !== "undefined") {
					return window.console;
				} else {
					// Use cases:
					// - window is not defined e.g. in Web Workers (Threading for JavaScript) (it is only available when a Web Worker defines its own window object, e.g. var window = self;  ...)
					// - the console methods are not standard, but browser-dependent (e.g. see https://developer.mozilla.org/en-US/docs/Web/API/Console)
					return new function () {
						this.warn = function () {
							// no op
						};
						this.error = function () {
							// no op
						};
					};
				}
			})();

			var SECURITY_MODE_STRICT = "strict"; //$NON-NLS-1$
			var SECURITY_MODE_INFO = "info"; //$NON-NLS-1$

			var MANDATORY_SECURITY_CHECKS = {
				checkInvalidCharacters: SECURITY_MODE_STRICT,
				checkUsernamePassword: SECURITY_MODE_STRICT
			};
			var OPTIONAL_SECURITY_CHECKS = {
				checkAsyncFalse: SECURITY_MODE_STRICT, // The WebIDE partially uses synchronous requests
				checkProtocolHTTPS: SECURITY_MODE_STRICT // The consumers (customer side) of the WebIDE partially use http
			};
			defaultFreezer.makeImmutable(MANDATORY_SECURITY_CHECKS);
			defaultFreezer.makeImmutable(OPTIONAL_SECURITY_CHECKS);

			// Patterns: pre-compile the patterns one time (performance)

			// Pattern for user name and password in the query parameters:
			// - '?sap-user=' or '?sap-password=' at the beginning of the search-string
			// - or '&sap-user=' or '&sap-password=' anywhere in the search-string
			var PATTERN_FOR_SAP_USER_AND_PASSWORD = /[(^\?)|&](sap-user=|sap-password=)/;
			// Pattern for https protocol:
			// - 'https:' or 'https' is the protocol-string
			var PATTERN_FOR_HTTPS = /^https:?$/;
			// Pattern for scheme (protocol) in URL:
			// - start with a letter
			// - followed by any sequence of letters, numbers, '+', '-', '.'
			// - followed by ':'
			var PATTERN_FOR_PROTOCOL = /^[a-zA-Z][a-zA-Z0-9\+\-\.]*:/;
			var PATTERN_FOR_NON_PRINTABLE_CHARACTERS = /[\000-\037]/;
			defaultFreezer.makeImmutable(PATTERN_FOR_SAP_USER_AND_PASSWORD);
			defaultFreezer.makeImmutable(PATTERN_FOR_HTTPS);
			defaultFreezer.makeImmutable(PATTERN_FOR_PROTOCOL);
			defaultFreezer.makeImmutable(PATTERN_FOR_NON_PRINTABLE_CHARACTERS);

			function AdtSecurityCheckerFactory() {

				this.createInstance = function (securitySettings) { // singleton

					var fullSecuritySettings = {};
					for (var key in MANDATORY_SECURITY_CHECKS) {
						fullSecuritySettings[key] = MANDATORY_SECURITY_CHECKS[key];
					}
					if (typeof securitySettings === "object") {
						for (key in securitySettings) {
							if (key in OPTIONAL_SECURITY_CHECKS) {
								fullSecuritySettings[key] = (securitySettings[key] === SECURITY_MODE_STRICT || securitySettings[key] === SECURITY_MODE_INFO) //
									? securitySettings[key] : SECURITY_MODE_STRICT;
							}
						}
					}
					var securityChecker = new AdtSecurityChecker(fullSecuritySettings);
					defaultFreezer.makeImmutable(securityChecker);
					return securityChecker;
				};
			}
			prototypeFreezer.makeImmutable(AdtSecurityCheckerFactory.prototype);

			function AdtSecurityChecker(securitySettings) {

				var parsedUrl; // parsed one time and usable for all checks

				var SECURITY_PROBLEM_HANDLERS = { //
					strict: new function () {
						this.handle = function (message) {
							throw new AdtCheckUtil.CheckError(message);
						};
					},
					info: new function () {
						this.handle = function (message) {
							logger.warn(message);
						};
					}
				};
				defaultFreezer.makeImmutable(SECURITY_PROBLEM_HANDLERS);

				var SECURITY_CHECKS = { //
					checkUsernamePassword: new function () {
						this.check = function (method, ajaxSettings, problemHandler) {
							if (ajaxSettings.username || ajaxSettings.password) {
								problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" contains user name and/or password in the JQuery ajax settings.");
							}
							parsedUrl = parsedUrl || parseUrl(ajaxSettings.url);
							if (parsedUrl) {
								if ((typeof parsedUrl.username === "string" && parsedUrl.username.length > 0 ) //
									|| (typeof parsedUrl.password > "string" && parsedUrl.password.length > 0)) {
									problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" contains user name and/or password in the URL.");
								}
								if (parsedUrl.search) {
									if (PATTERN_FOR_SAP_USER_AND_PASSWORD.test(parsedUrl.search)) {
										problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" contains user name and/or password in the query parameters.");
									}
								}
							}
						};
					},
					checkInvalidCharacters: new function () {
						this.check = function (method, ajaxSettings, problemHandler) {
							for (var header in ajaxSettings.headers) {
								var value = ajaxSettings.headers[header];
								if (PATTERN_FOR_NON_PRINTABLE_CHARACTERS.test(header) || PATTERN_FOR_NON_PRINTABLE_CHARACTERS.test(value)) {
									problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" contains not printable characters in header field \"" + header + "\"");
								}
							}
						};
					},
					checkAsyncFalse: new function () {
						this.check = function (method, ajaxSettings, problemHandler) {
							if (ajaxSettings.async === false) {
								problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" is executed as synchronous request");
							} // else and default: async === true
						};
					},
					checkProtocolHTTPS: new function () {
						this.check = function (method, ajaxSettings, problemHandler) {
							// In the Web IDE this check only covers the protocol used between the browser and the proxy server.
							// The configuration of the proxy destination in the proxy server defines which protocol is used for the communication to the ABAP server.
							// This cannot be checked here and the proxy server allows that protocol HTTP is used ... .
							parsedUrl = parsedUrl || parseUrl(ajaxSettings.url);
							if (parsedUrl && parsedUrl.protocol && parsedUrl.protocol !== null) { // not available in all browsers / browser versions
								if (!PATTERN_FOR_HTTPS.test(parsedUrl.protocol)) {
									problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" does not use HTTPS");
								}
							} else {
								var protocol = PATTERN_FOR_PROTOCOL.exec(ajaxSettings.url);
								if (protocol === null) {
									if (typeof document !== "undefined" || typeof document.URL !== "undefined") {
										// The URL is relative -> use the base URL of the page
										protocol = PATTERN_FOR_PROTOCOL.exec(document.URL);
									} // else: The base URL cannot be accessed (e.g. it is not available in WebWorkers -> WebWorkers must use absolute URLs)
								} // The URL is absolute
								if ((protocol === null || !PATTERN_FOR_HTTPS.test(protocol))) {
									// The URL does not use HTTPS
									problemHandler.handle("Request \"" + method + " " + ajaxSettings.url + "\" does not use HTTPS");
								}
							}
						};
					}
				};
				defaultFreezer.makeImmutable(SECURITY_CHECKS);

				function parseUrl(urlString) {
					if ( // Function URL has to be provided by the browser,
					// URL is not supported by all browser versions, see https://developer.mozilla.org/en-US/docs/Web/API/URL, https://url.spec.whatwg.org/#constructors ,
					// https://developer.mozilla.org/de/docs/Web/API/URL/URL, https://developer.mozilla.org/en-US/docs/Web/API/URL
						typeof URL === "function"
						// document.baseURI is not accessible in WebWorkers, see http://www.html5rocks.com/de/tutorials/workers/basics/,
						// see also http://www.quora.com/What-are-the-differences-between-document-baseURI-document-documentURI-and-document-URL
						&& typeof document === "object" && typeof document.baseURI === "string"
						) {
						return new URL(urlString, document.baseURI); // e.g. document.baseURI = "http://localhost:8080/index.html"
					}
					return undefined;
				}

				this.__test__injectConsole = function (testConsole) { // actually private, but it is needed public for automatic tests
					logger = testConsole;
					AdtCheckUtil.__test__injectConsole(testConsole);
				};

				this.checkAndRefuseCSRFTokenHeader = function (method, ajaxSettings) {
					// The caller of the AdtRestResource API must not provide a proprietary CSRF token handling, but this handling is done internally in the AdtRestResource.
					try {
						if (ajaxSettings && ajaxSettings.headers && ajaxSettings.headers["x-csrf-token"]) {
							SECURITY_PROBLEM_HANDLERS[SECURITY_MODE_STRICT].handle("Request \"" + method + " " + ajaxSettings.url // 
								+ "\" uses proprietary CSRF token handling: it uses a header field 'x-csrf-token'.");
						}
					} finally {
						parsedUrl = undefined;
					}
				};

				this.checkAndCorrectCsrfTokenHeader = function (originalCsrfTokenHeader, ajaxSettings) {
					// If the CSRF token header was removed or overwritten in the ajax-settings in the meanwhile (e.g. by an ajax beforeSend callback of the caller of the AdtRestResource),
					// then its original value (which was internally set by the AdtRestResource) has to be restored.
					if (originalCsrfTokenHeader) {
						ajaxSettings.headers = ajaxSettings.headers || {};
					}
					if (ajaxSettings.headers["x-csrf-token"] !== originalCsrfTokenHeader) {
						if (originalCsrfTokenHeader) {
							ajaxSettings.headers["x-csrf-token"] = originalCsrfTokenHeader;
						} else {
							delete ajaxSettings.headers["x-csrf-token"];
						}
						SECURITY_PROBLEM_HANDLERS[SECURITY_MODE_INFO].handle("Request \"" + ajaxSettings.type + " " + ajaxSettings.url // 
							+ "\": the header field 'x-csrf-token' was reset to its original value.");
					}
				};

				this.check = function (method, ajaxSettings) {
					for (var key in securitySettings) {
						if (key in SECURITY_CHECKS && securitySettings[key] in SECURITY_PROBLEM_HANDLERS) {
							SECURITY_CHECKS[key].check(method, ajaxSettings, SECURITY_PROBLEM_HANDLERS[securitySettings[key]]);
						}
					}
				};
			}

			prototypeFreezer.makeImmutable(AdtSecurityChecker.prototype);

			var factory = new AdtSecurityCheckerFactory(); // requireJS module
			defaultFreezer.makeImmutable(factory);

			return factory;
		})();
	});
