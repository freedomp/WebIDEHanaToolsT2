'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P1941777532",
	"PASSWORD": "templates1S"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941499853";
testConfiguration[KEYS.PASSWORD] = "ABcd1234";

module.exports = {
	KEYS: KEYS,
	url : KEYS.HOST,
	startupTimeout : 150000,
	defaultTimeout : 30000,
	longTimeout : 50000,
	templateName : 'Smart Template Application',
	projectName : 'smartTemplate',
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};