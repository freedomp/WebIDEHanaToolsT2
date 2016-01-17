define(function() {
	"use strict";
	var AssertError = function(sMessage) {
		var tmp = Error.apply(this, arguments);
		this.stack = tmp.stack;
		this.name = "AssertError";
		this.message = (sMessage || "");
	};
	AssertError.prototype = new Error();
	AssertError.prototype.constructor = AssertError;
	return AssertError;
});