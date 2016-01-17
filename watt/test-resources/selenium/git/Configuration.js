'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P1941823369",
	"PASSWORD": "ABcd1234"
	//"USER_NAME": "<your i-user>",
	//"PASSWORD": "<your password>"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941823369";
testConfiguration[KEYS.PASSWORD] = "ABcd1234";
//testConfiguration[KEYS.USER_NAME] = "<your i-user>";
//testConfiguration[KEYS.PASSWORD] = "<your password>";

module.exports = {
	KEYS: KEYS,
	url : testConfiguration[KEYS.HOST],
	startupTimeout : 100000,
	defaultTimeout : 40000,
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};