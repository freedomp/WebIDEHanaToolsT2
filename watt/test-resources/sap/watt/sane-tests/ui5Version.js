(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.WEBIDE_LOCAL_DEV_UI5 = factory();
	}
}(this, function () {
	"use strict";
	return {
		// when running tests this version number will be compared to the property in the pom.xml.
		version: "1.32.7",
		baseURL: "https://sapui5.hana.ondemand.com/"
	};
}));
