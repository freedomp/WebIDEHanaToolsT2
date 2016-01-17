'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P1941499853",
	"PASSWORD": "ABcd1234"
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
	startupTimeout : 200000,
	defaultTimeout : 40000,
	templateName : 'SAPUI5 Master-Detail Application',
	templateCategory : 'SAP Fiori Application',
	projectName : 'sanityTest1',
	appHeaderTitle : 'Smoke Test 1',
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};
