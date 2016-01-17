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
	startupTimeout : 500000,
	defaultTimeout : 20000,
	templateName : 'SAPUI5 Master-Detail with Photos',
	projectName : 'MDWithPhotosTest',
	detailsPageTitle : 'My Details',
	catalogDestination : 'API-Management-System',
	catalogServiceUrl : 'claims.srv',
	//catalogDestination : '/sap/opu/odata/sap/ZCLAIMDEMO_SRV',
	//catalogServiceUrl : '/sap/opu/odata/sap/ZCLAIMDEMO_SRV',
	apiKey : null,
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};
