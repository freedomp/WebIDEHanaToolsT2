'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "p1941373767",
	"PASSWORD": "WebIde1!"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "p1941373767";
testConfiguration[KEYS.PASSWORD] = "WebIde1!";

module.exports = {
	KEYS: KEYS,
	url : KEYS.HOST,
	startupTimeout : 100000,
	defaultTimeout : 40000,
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};
