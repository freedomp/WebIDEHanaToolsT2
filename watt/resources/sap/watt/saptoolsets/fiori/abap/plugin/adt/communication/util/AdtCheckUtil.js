/*
 * RequireJS module with API:
 * <ul>
 * <li>AdtCheckUtil
 * <li>public methods of AdtCheckUtil
 * </ul>
 */
define( //Define this module as requireJS module and its dependencies to other requireJS modules
	[ ],
	function () {

		"use strict";

		var AdtCheckUtil = new function () { // singleton

			this.CheckError = function CheckError(message) {

				this.message = message;

				var constructedError = new Error(this.message);
				if (typeof constructedError.stack === "string") {
					this.stack = constructedError.stack;
				} else { // Problem on IE (e.g. IE 10, version 10.0.9200.17267):
					// IE does not produce a stack for an Error, when the constructor is called, but only when the error is thrown
					try {
						throw constructedError;
					} catch (thrownError) {
						this.stack = thrownError.stack;
						// Problem: see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
						// - IE provides the stack only starting with version 10.
						// - Safari provides the stack only starting with version 6.
					}
				}

				if (typeof this.constructor.name !== "string" || this.constructor.name !== "CheckError") {
					// Problem on IE (e.g. IE 10, version 10.0.9200.17267): IE does not provide the constructors name although it is a named function
					this.constructor.name = "CheckError";
				}
			};

			this.CheckError.prototype = new Error(); // not supported by all Browser versions: Object.create(Error.prototype);
			this.CheckError.prototype.constructor = this.CheckError;
			this.CheckError.prototype.name = "CheckError";

			var checkConsole = (function () {

				// typeof missing reference === typeof existing reference with value undefined === "undefined"
				if (typeof window !== "undefined" && typeof window.console !== "undefined" && typeof window.console.assert !== "undefined") {
					return window.console;
				} else {
					// Use cases:
					// - window is not defined e.g. in Web Workers (see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/basic_usage), 
					//   it is only available when a Web Worker defines its own window object, e.g. var window = self  ...
					// - the console methods are not standard, but browser-dependent (e.g. see https://developer.mozilla.org/en-US/docs/Web/API/Console)
					return new function () {
						this.warn = function () {
							// no op
						};
						this.assert = function () {
							// no op
						};
					};
				}
			})();


			this.__test__injectConsole = function (testConsole) { // actually private, but it is needed public for automatic tests
				checkConsole = testConsole;
			};

			this.check = function (condition, message) {

				// Remark:
				// This functionality is similar to jQuery.sap.assert(condition, message) from \sap\ui5\1\resources\jquery.sap.global.js.
				// But the ADT plugins shall be fully self-contained.
				if (!condition) {
					checkConsole.assert(condition, message);
					throw new this.CheckError(message);
				}
			};

			this.checkArgumentIsDefinedAndNotNull = function (functionName, paramName, argValue) {
				this.check(argValue !== undefined && argValue !== null, //
						"Function " + functionName + ", argument " + paramName + ": the argument has an illegal value: " + argValue); //$NON-NLS-1$
			};

			// JavaScript type checking is too complex, not needed for our rather primitive use case
//            this.checkArgumentType = function (functionName, paramName, argValue, type) {
//                this.checkArgumentIsDefinedAndNotNull(functionName, paramName, argValue);
//                this.check(typeof argValue === type || argValue instanceof type, // wrong, does not work for all types ...
//                        "Function " + functionName + ", argument " + paramName + ": the argument has an illegal type: " + typeof argValue); //$NON-NLS-1$
//            };

			this.checkStringArgumentIsNotEmpty = function (functionName, paramName, argValue) {
				this.checkArgumentIsDefinedAndNotNull(functionName, paramName, argValue);
				this.check(typeof argValue === "string",
						"Function " + functionName + ", argument " + paramName + ": the argument has an illegal type: " + typeof argValue); //$NON-NLS-1$
				this.check(argValue.length > 0, //
						"Function " + functionName + ", argument " + paramName + ": the argument is an empty string: " + argValue); //$NON-NLS-1$
			};

		};

		return AdtCheckUtil; // requireJS module
	});