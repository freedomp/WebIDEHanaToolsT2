/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define*/
define(function() {
	"use strict";

	var Utils = {};

	Utils.hasErrors = function(tok) {
		if (typeof tok !== "object") {
			return false;
		}
		if (tok.messages) {
			return tok.messages.firstError >= 0;
		} else {
			return false;
		}

	};

	Utils.nextStatement = function(tokens, tok, includeErrors) {
		var nextIndex = 0;

		if (typeof tok === "number") {
			tok = tokens[tok];
		}
		if (typeof tok === "object") {
			nextIndex = typeof tok.lastIndex === "number" ? tok.lastIndex + 1 : tok.index + 1;
		}
		while ((tok = tokens[nextIndex])) {
			if (tok.arity !== "statement") {
				nextIndex++;
				continue;
			}
			if (!includeErrors && Utils.hasErrors(tok)) {
				nextIndex = tok.lastIndex + 1;
				continue;
			}
			return tok;
		}

		return undefined;
	};

	return Utils;
});