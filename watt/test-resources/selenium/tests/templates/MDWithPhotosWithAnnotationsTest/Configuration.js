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
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?settings=delete&test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941777532";
testConfiguration[KEYS.PASSWORD] = "templates1S";

module.exports = {
	KEYS: KEYS,
	startupTimeout : 100000,
	defaultTimeout : 20000,
	templateName : 'Master-Detail with Photos',
	templateCategory : 'SAPUI5 Mobile Application',
	projectName : 'MDWithPhotosTest',
	detailsPageTitle : 'My Details',
	appHeaderTitle : 'DamageReportSet',
	apiKey : null,
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};
