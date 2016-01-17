'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P678267",
	"PASSWORD": "Monaco123"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
//testConfiguration[KEYS.HOST] = "http://localhost:8080/index.html?username=myusername&password=mypassword123&settings=delete";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P678267";
testConfiguration[KEYS.PASSWORD] = "Monaco123";

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