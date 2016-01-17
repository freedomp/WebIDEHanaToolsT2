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
testConfiguration[KEYS.HOST] = "https://cimaster-sapwebidetest.dispatcher.neo.ondemand.com?test=selenium";
testConfiguration[KEYS.SELENIUM_HOST] = "http://localhost:4444/wd/hub";
testConfiguration[KEYS.USER_NAME] = "P1941777532";
testConfiguration[KEYS.PASSWORD] = "templates1S";

module.exports = {
	KEYS: KEYS,
	url : KEYS.HOST,
	startupTimeout : 150000,
	defaultTimeout : 30000,
	longTimeout : 50000,
	templateName : 'Empty Plugin',
	templateCategory : 'Plugin Development',
	projectName : 'pluginProject',
	pluginName : 'plugin_for_test',
	newTemplateName : 'newTemplate',
	projectNameFromNewTemplate : 'project_from_new_template',
	setParam: function setParam(key, value) {
		testConfiguration[key] = value;
	},

	getParam: function getParam(key) {
		return testConfiguration[key];
	}
};