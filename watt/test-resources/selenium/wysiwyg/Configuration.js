'use strict';

// KEYS
var KEYS = {
	"HOST": "host",
	"SELENIUM_HOST": "seleniumHost",
	"USER_NAME": "P1941777461",
	"PASSWORD": "w5g@SAPil"
};

// Some Defaults
var testConfiguration = {};
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941777461";
testConfiguration[KEYS.PASSWORD] = "w5g@SAPil";

module.exports = {
	KEYS: KEYS,
	url : testConfiguration[KEYS.HOST],
	startupTimeout : 400000,
	defaultTimeout : 40000,
	templateName : 'SAPUI5 Master-Detail Application',
	templateCategory : 'SAP Fiori Application',
	templateVersion : 'Master-Detail (Deprecated) (1.0.1)',
	projectName : 'RTCScenarioTEST',

	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};
