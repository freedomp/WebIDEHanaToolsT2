/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

/*global define, console, self, System*/
/*eslint-disable no-constant-condition, quotes*/
define(function(require, exports, module) {
	"use strict";

	var cons = typeof console !== "undefined" ? console : undefined,
		Util = {},
		levels = ["error", "warn", "info", "log"],
		debugMode,
		maxLevel,
		parentPath,
		index,
		pathSegment;

	debugMode = /[&?](sap-ide-debug[&=]|sap-ide-debug$)+/i.test(self.location.search);
	maxLevel = debugMode ? "log" : "error";

	// use CommonJS syntax to get the own module URI
	parentPath = module.uri;
	index = parentPath.lastIndexOf("/");
	pathSegment = parentPath.substr(index + 1);
	parentPath = parentPath.substr(0, index);
	while (pathSegment !== "tool-support") {
		index = parentPath.lastIndexOf("/");
		pathSegment = parentPath.substr(index + 1);
		parentPath = parentPath.substr(0, index);
	}
	parentPath += "/";

	Util.makeLog = function(prefix) {
		var log = function(msg, severity) {
			var e;

			if (cons) {
				severity = severity || "log";
				if (msg instanceof Error) {
					e = msg;
					msg = e.message;
					severity = "error";
				}
				if (levels.indexOf(severity) <= levels.indexOf(maxLevel)) {
					if (typeof msg === "function") {
						msg = msg();
					}
					msg = prefix ? prefix + ": " + msg : msg;
					cons[severity](msg);
					if (e) {
						cons.error(e);
					}
				}
			}
		};
		return log;
	};

	Util.isDebugMode = function() {
		return debugMode;
	};

	Util.getLocation = function(name) {
		return parentPath + name;
	};

	return Util;
});