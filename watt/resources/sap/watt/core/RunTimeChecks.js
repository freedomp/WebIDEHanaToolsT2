define(["sap/watt/lib/lodash/lodash", "./Constants", "./DebugHooks"], function (_, Constants, DebugHooks) {
	"use strict";

	// naive dependency injection which allows storing the issues in 'custom' arrays and access it from 'outside' without
	// depending on RunTimeChecks.js with require.js.
	var WEB_IDE_RUNTIME_CHECKS_CALLER_ISSUES = window.CUSTOM_RUNTIME_CHECKS_CALLER_ISSUES || [];
	var WEB_IDE_RUNTIME_CHECKS_RETURN_TYPE_ISSUES = window.CUSTOM_RUNTIME_CHECKS_RETURN_TYPE_ISSUES || [];

	var WATT_PREFIXED_ARGS_NUM = Constants.WATT_PREFIXED_ARGS_NUM();

	var fIsStringArrayItems = _.partialRight(_.every, _.isString);
	var fIsNumberArrayItems = _.partialRight(_.every, _.isNumber);
	var fIsBooleanArrayItems = _.partialRight(_.every, _.isBoolean);


	/**
	 * @param {?} vArg
	 * @returns {string}
	 */
	function argValueToString(vArg) {
		if (_.isString(vArg) || _.isNumber(vArg) || _.isBoolean(vArg) || _.isNull(vArg) || _.isUndefined(vArg)) {
			return vArg; // these types are normally sexy printed
		}
		// avoid printing deeply nested Arrays/Objects...
		if (_.isArray(vArg)) {
			return "an array";
		}
		/* istanbul ignore else */
		if (_.isObject(vArg)) {
			return "an object";
		}

		/* istanbul ignore next */
		// This is just in case, I can't see a situation we can reach this code because Function/RegExp
		// are also true for _.isObject. but just in case... this is why the istanbul ignore are used.
		return "unknown";
	}


	/**
	 * @param {Function[]}aPredicates
	 * @param {?} vArg
	 *
	 * @return {boolean} - false if a type mismatch is detected
	 */
	function isArgType(aPredicates, vArg) {
		// 'my one billion dollar mistake'
		// https://en.wikipedia.org/wiki/Tony_Hoare#Apologies_and_retractions
		if (_.isNull(vArg) || _.isUndefined(vArg)) {
			return true;
		}

		return _.every(aPredicates, function (currPredicate) {
			return currPredicate(vArg);
		});
	}


	function isStringType(vCurrArg) {
		return isArgType([_.isString], vCurrArg);
	}


	function isNumberType(vCurrArg) {
		return isArgType([_.isNumber], vCurrArg);
	}


	function isBooleanType(vCurrArg) {
		return isArgType([_.isBoolean], vCurrArg);
	}


	function isStringArrayType(vCurrArg) {
		return isArgType([_.isArray, fIsStringArrayItems], vCurrArg);
	}


	function isNumberArrayType(vCurrArg) {
		return isArgType([_.isArray, fIsNumberArrayItems], vCurrArg);
	}


	function isBooleanArrayType(vCurrArg) {
		return isArgType([_.isArray, fIsBooleanArrayItems], vCurrArg);
	}


	function isObjectArrayType(vCurrArg) {
		return isArgType([_.isArray], vCurrArg);
	}


	function errMessageForArgument(sExpectedTypeName, vArg, idx) {
		return "argument number " + idx + ", expected: " + sExpectedTypeName + " but actual: " + typeof vArg + " with value: " + argValueToString(vArg);
	}

	function errMessageForReturnType(sExpectedTypeName, vArg) {
		return "unexpected return type expected: " + sExpectedTypeName + " but actual: " + typeof vArg + " with value: " + argValueToString(vArg);
	}


	//noinspection Eslint
	var NO_ISSUES_FOUND = false;

	/**
	 *
	 * @param {string} sExpectedParamType
	 * @param {any} vCurrActualArg
	 * @param {Function} fnErrMsg - a function that builds the error message if needed. in a more sane syntax:
	 *                                (expectedType:string, actualArg:any, idx?:number) => String
	 * @param nIdx
	 *
	 * @return {string|boolean} - a string with an error message if type mismatch has been detected or false otherwise.
	 */
	function _checkType(sExpectedParamType, vCurrActualArg, fnErrMsg, nIdx) {
		switch (sExpectedParamType) {
			case "string" :
				return isStringType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "number" :
				return isNumberType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "boolean" :
				return isBooleanType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "[string]" :
				return isStringArrayType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "[number]" :
				return isNumberArrayType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "[boolean]" :
				return isBooleanArrayType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			case "[object]" :
				return isObjectArrayType(vCurrActualArg) ?
					NO_ISSUES_FOUND : fnErrMsg(sExpectedParamType, vCurrActualArg, nIdx);
			// Object can be everything and anything
			case "object" :
			default :
				// we can't recognize the type (or no type info) and therefor no checks are performed.
				return NO_ISSUES_FOUND;
		}
	}


	function saveIssues(doneCache, storage, sCheckKey, sProxyName, sMethod, aIssues, aStackTrace) {
		// Once a single error for a location/method/proxy has been found no farther checks are performed.
		// This could 'hide' some errors, however it also reduces huge amount of duplicate spam.
		// The hidden errors will still become visible once the currently reported ones are fixed.
		doneCache[sCheckKey] = true;

		storage.push({
			service: sProxyName,
			method: sMethod,
			stack: aStackTrace,
			issues: aIssues
		});
	}

	var mCallerChecksKeysDetected = {};
	var mReturnTypeChecksKeysDetected = {};

	/**
	 * @param {Function} fnTarget -  The function to decorate(wrap)
	 * @param {string} sMethod -  The name of the interface method implemented by fnTarget
	 * @param {string} sProxyName -  The name of the Proxy/Service in which fnTarget implementation resides.
	 * @param {Object[]} [params=[]] - The parameters definitions of The interface method which fnTarget implements.
	 * @param {string} [sExpectedReturnType] - Name of expected return type, for example: 'string'/'[boolean]'/'object'
	 *
	 * @return {Function} The fnTarget function wrapped in another function that performs type checks before calling fnTarget.
	 */
	function decorateFnWithTypeChecking(fnTarget, sMethod, sProxyName, params, sExpectedReturnType) {

		// note that this computation only happens once during the creation of the wrapper.
		var aParams = params ? params : [];
		var nMaxNumOfArgs = aParams.length;
		var aOptionalArgs = _.filter(aParams, function (currParam) {
			return currParam.optional === true;
		});
		var nMinNumOfArgs = nMaxNumOfArgs - aOptionalArgs.length;
		var aValidArgNumbers = _.range(nMinNumOfArgs, nMaxNumOfArgs + 1);

		// the wrapped function which will be returned
		var fnNewFnWithTypeChecks = function () {

			var aStackTrace = DebugHooks.createStack(2).split('\n');
			var sCheckKey = sProxyName + "_^_" + sMethod + "_ ^ _" + _.first(aStackTrace);

			// service + method + where is has been called from act as a unique key to avoid duplicate error messages.
			// not that this key is not completely unique as the same service method can be called from the same line
			// of code using different argument types. however it's better to avoid duplicate errors which
			// will make the report unmanageable and will also speed up runtime performance.
			if (mCallerChecksKeysDetected[sCheckKey]) {
				return fnTarget.apply(this, arguments);
			}

			var aActualArgs = Array.prototype.slice.call(arguments, WATT_PREFIXED_ARGS_NUM);
			var aActualArgsWithParams = _.take(aActualArgs, aParams.length);
			var aExpectedParamsWithArgs = _.take(aParams, aActualArgsWithParams.length);

			// argument type Checks
			var callerIssues = _.compact(_.map(aActualArgsWithParams, function (vCurrActualArg, idx) {
				var oExpectedParam = aExpectedParamsWithArgs[idx];
				var sExpectedParamType = oExpectedParam.type;
				return _checkType(sExpectedParamType, vCurrActualArg, errMessageForArgument, idx);
			}));

			// number of argument check.
			if (!_.contains(aValidArgNumbers, arguments.length - WATT_PREFIXED_ARGS_NUM)) {
				var sErrorArgDetails = "invoked with invalid number of arguments \n" +
					"expected: " + nMinNumOfArgs + ".." + nMaxNumOfArgs + " actual: " + (arguments.length - WATT_PREFIXED_ARGS_NUM);
				callerIssues.push(sErrorArgDetails);
			}

			// save checks that have (always) been done in a sync manner (type and number of arguments)
			if (!_.isEmpty(callerIssues)) {
				saveIssues(mCallerChecksKeysDetected, WEB_IDE_RUNTIME_CHECKS_CALLER_ISSUES,
					sCheckKey, sProxyName, sMethod, callerIssues, aStackTrace);
			}

			// actual service method invocation
			var vReturnedValue = fnTarget.apply(this, arguments);

			var returnTypeIssues = [];
			// using an inner function as we need the closure for the many vars it uses.
			function checkReturnType(actualReturnedValue) {

				var sReturnTypeIssue = _checkType(sExpectedReturnType, actualReturnedValue, errMessageForReturnType);
				if (sReturnTypeIssue) {
					returnTypeIssues.push(sReturnTypeIssue);
				}

				if (!_.isEmpty(returnTypeIssues)) {
					saveIssues(mReturnTypeChecksKeysDetected, WEB_IDE_RUNTIME_CHECKS_RETURN_TYPE_ISSUES,
						sCheckKey, sProxyName, sMethod, returnTypeIssues, aStackTrace);
				}

				// in === out
				return actualReturnedValue;
			}

			if (sExpectedReturnType && !mReturnTypeChecksKeysDetected[sCheckKey]) {
				// need to perform the return type check in an async manner
				// note that this may means we don't know when a detected issue will be saved (async...).
				// however the assumption is that if (in a test) someone calls a proxy method that returns a promised value
				// they will also do a ".then" on it (or its chain) to perform some assertions. in that case
				// the 'then' here is guaranteed to run BEFORE anything that relies upon the detected issues.
				if (Q.isPromise(vReturnedValue)) {
					return vReturnedValue.then(checkReturnType);
				}
				// a normal value (not a promise) the returned type checks can be checked in a sync manner.
				else {
					return checkReturnType(vReturnedValue);
				}
			}
			else {
				return vReturnedValue;
			}
		};

		return fnNewFnWithTypeChecks;
	}


	return {
		decorateFnWithTypeChecking: decorateFnWithTypeChecking,

		getCallerIssues: function () {
			return WEB_IDE_RUNTIME_CHECKS_CALLER_ISSUES;
		},

		getReturnTypeIssues: function () {
			return WEB_IDE_RUNTIME_CHECKS_RETURN_TYPE_ISSUES;
		},

		clearIssues: function () {
			// clears an array while keeping references to it valid.
			// see http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
			WEB_IDE_RUNTIME_CHECKS_CALLER_ISSUES.length = 0;
			WEB_IDE_RUNTIME_CHECKS_RETURN_TYPE_ISSUES.length = 0;
		},

		// exposed for testing purposes
		// no harm no foul as these are stateless
		_isStringType: isStringType,
		_isNumberType: isNumberType,
		_isBooleanType: isBooleanType,
		_isStringArrayType: isStringArrayType,
		_isNumberArrayType: isNumberArrayType,
		_isBooleanArrayType: isBooleanArrayType,
		_isObjectArrayType: isObjectArrayType
	};

});