'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P1940971947",
	"PASSWORD": "Zbcd1234"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1940971947";
testConfiguration[KEYS.PASSWORD] = "Zbcd1234";

module.exports = {
	KEYS: KEYS,
	url : KEYS.HOST,
	startupTimeout : 150000,
	longTimeout : 100000,
	defaultTimeout : 10000,
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}

};
