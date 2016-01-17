define([], function () {
	"use strict";

	/**
	 * number of additional arguments the WEBIDE proxy adds to method invocations.
	 * @return {number}
	 */
	var WATT_PREFIXED_ARGS_NUM = function () {
		return 2;
	};

	var constants = {
		// immutable function for the win
		WATT_PREFIXED_ARGS_NUM: WATT_PREFIXED_ARGS_NUM
	};

	// even more immutability for the constants
	Object.freeze(constants);
	return constants;
});
