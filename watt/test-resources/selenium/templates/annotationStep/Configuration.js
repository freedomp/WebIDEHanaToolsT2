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
	url : 'https://devint-x80be6fbb.dispatcher.neo.ondemand.com',
	startupTimeout : 100000,
	defaultTimeout : 10000,
	templateName : 'Smart Template Application',
	projectName : 'smartTemplate',
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};

