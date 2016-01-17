'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "userName",
	"PASSWORD": "password"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "http://mo-21267c610.mo.sap.corp:53075/";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "DEVX_TECH_USER";
testConfiguration[KEYS.PASSWORD] = "Abcd1234";


module.exports = {

	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	},

	KEYS: KEYS
};


