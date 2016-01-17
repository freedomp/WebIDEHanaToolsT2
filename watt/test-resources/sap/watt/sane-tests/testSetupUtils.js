"use strict";


window.isRunningInLocalStaticWebServer = function () {
	return window.location.host.indexOf("localhost") !== -1 ||
		window.location.host.indexOf("127.0.0.1") !== -1;
};

window.isRunningInKarmaWebServer = function () {
	var pathName = window.location.pathname;
	// running in karma runner for example (http://localhost:9878/?id=11283974)
	return window.hasOwnProperty("__karma__") ||
			// running in an html runner inside the webserver started by karma
			// http://localhost:9877/base/src/main/webapp/test-resources/sap/watt/sane-tests/examples/index.html
		/^\/base\/src\/main\/webapp/.test(pathName);
};

window.webappPath = function () {
	if (window.isExternalPlugin) {
		// Compute path for external plugins as in external plugin scenario the webide is under the node_modules
		return "/base/node_modules/webide/src/main/webapp/";
	} else if (window.isRunningInKarmaWebServer()) {
		// karma flag is needed to load special resources (UI5) from different paths in the fileSystem
		return "/base/src/main/webapp/";
	}
	else {
		// TODO: this may not work on tomcat
		var targetPath = "/src/main/webapp/";
		var pathName = window.location.pathname;
		// build the url dynamically, this means it should work on any web server (hcp/tomcat/karma's webserver/...)
		return pathName.substring(0, pathName.indexOf(targetPath) + targetPath.length);
	}
};


/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
window.merge_objects = function (obj1, obj2) {
	// not using lodash to avoid depending on it and including it in every karma.conf/HCP html runner
	// (TODO: consider loading lodash globally? in karma.conf)
	var obj3 = {};
	for (var attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}
	for (var attrname in obj2) {
		obj3[attrname] = obj2[attrname];
	}
	return obj3;
};
